import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import { Game } from "./classes/game.js";
import { randomID } from "./random.js";
import { Player } from "./classes/player.js";
import { InMemoryGameStore } from "./gameStore.js";
import { InMemorySessionStore } from "./sessionStore.js";
import { toGameView, toPublicPlayer } from "./views.js";

const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const MAX_CREATE_ATTEMPTS = 100;

const gameStore = new InMemoryGameStore();
const sessionStore = new InMemorySessionStore();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: CLIENT_URL } });

app.get("/", (req, res) => {
  res.json({ status: "success" });
});

// broadcast individual gameState to each user
const broadcastGame = (game) => {
  for (const player of game.players) {
    const gameView = toGameView(game, player.userID);
    io.to(player.userID).emit("gameState", gameView);
  }
};

// middleware, check if from valid user and session
io.use(async (socket, next) => {
  const { sessionID } = socket.handshake.auth;

  // find existing session
  if (sessionID) {
    const session = await sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.gameID = session.gameID ?? null;
      socket.join(socket.userID);
      return next();
    }
  }

  // create new session
  socket.sessionID = randomID();
  socket.userID = randomID();
  socket.gameID = null;
  socket.join(socket.userID);
  next();
});

io.on("connection", async (socket) => {
  console.log("connected");

  const assignSessionGame = async (gameID) => {
    // leave previous game if exists
    if (socket.gameID) {
      socket.leave(socket.gameID);
    }
    if (gameID) {
      socket.join(gameID);
    }
    socket.gameID = gameID;
    // update user session
    await sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      gameID: socket.gameID,
      connected: true,
    });
  };

  // if was in a game, then mark connection status again
  const game = await gameStore.findGame(socket.gameID);
  const player = game?.players.find((p) => p.userID === socket.userID);
  if (game && player) {
    player.connected = true;
    await gameStore.saveGame(game);
    await assignSessionGame(game.gameID);
    broadcastGame(game);
    socket.to(socket.gameID).emit("player online", toPublicPlayer(player));
  } else {
    await assignSessionGame(null);
  }
  socket.emit("session", {
    userID: socket.userID,
    sessionID: socket.sessionID,
    game: player ? toGameView(game, socket.userID) : null,
  });

  const withCallback = async (fn, callback) => {
    try {
      const data = await fn();
      return callback({
        status: "success",
        data,
      });
    } catch (error) {
      return callback({ status: "error", message: error.message });
    }
  };

  socket.on("createGame", (callback) => {
    withCallback(async () => {
      // create a new unique game instance
      const existingGames = await gameStore.findAllGames();

      let game = new Game();
      let attempts = 0;
      while (existingGames.some((g) => g.gameCode === game.gameCode)) {
        attempts++;
        if (attempts === MAX_CREATE_ATTEMPTS) {
          throw new Error("could not create game");
        }
        game = new Game();
      }
      game.addPlayer(
        new Player({
          userID: socket.userID,
          username: game.players.length + 1,
          connected: true,
        }),
      );

      await gameStore.saveGame(game);
      await assignSessionGame(game.gameID);
      return toGameView(game, socket.userID);
    }, callback);
  });

  socket.on("joinGame", (gameCode, callback) => {
    withCallback(async () => {
      const existingGames = await gameStore.findAllGames();
      const game = existingGames.find((g) => g.gameCode === gameCode);
      if (!game) {
        throw new Error("game does not exist");
      }
      const gameID = game.gameID;

      // add user to game
      const player = new Player({
        userID: socket.userID,
        username: game.players.length + 1,
        connected: true,
      });
      game.addPlayer(player);

      await gameStore.saveGame(game);
      await assignSessionGame(gameID);
      broadcastGame(game);
      socket.to(gameID).emit("player joined", toPublicPlayer(player));
      return toGameView(game, socket.userID);
    }, callback);
  });

  socket.on("leaveGame", (callback) => {
    withCallback(async () => {
      const gameID = socket.gameID;
      const game = await gameStore.findGame(gameID);
      if (!game) {
        throw new Error("game does not exist");
      }
      const player = game.players.find((p) => p.userID === socket.userID);
      game.removePlayer(socket.userID);

      await assignSessionGame(null);
      await gameStore.saveGame(game);
      broadcastGame(game);
      socket.to(gameID).emit("player left", toPublicPlayer(player));
      return null;
    }, callback);
  });

  const gameAction = async (actionFn) => {
    try {
      const game = await gameStore.findGame(socket.gameID);
      if (!game) {
        throw new Error("game not found");
      }
      if (!game.players.some((p) => p.userID === socket.userID)) {
        throw new Error("user not in game");
      }
      actionFn(game);
      await gameStore.saveGame(game);
      broadcastGame(game);
    } catch (error) {
      socket.emit("gameError", { message: error.message });
    }
  };

  socket.on("startGame", () => {
    gameAction((g) => g.startGame());
  });

  socket.on("advance", () => {
    gameAction((g) => g.advance());
  });

  socket.on("submission", (submission) => {
    gameAction((g) => {
      g.makeSubmission(socket.userID, submission);
    });
  });

  socket.on("castVote", (toUserID) => {
    gameAction((g) => g.castVote(socket.userID, toUserID));
  });

  socket.on("resetGame", () => {
    gameAction((g) => {
      g.resetGame();
    });
  });

  socket.on("disconnect", async () => {
    console.log("disconnected");
    // if user is a player set status to offline and notify other users
    const game = await gameStore.findGame(socket.gameID);
    if (game) {
      const { players } = game;
      const player = players.find((p) => p.userID === socket.userID);
      if (player) {
        player.connected = false;
        await gameStore.saveGame(game);
        broadcastGame(game);
        socket.to(socket.gameID).emit("player offline", toPublicPlayer(player));
      }
    }
    await sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      gameID: socket.gameID,
      connected: false,
    });
  });
});

server.listen(PORT, () => {
  console.log(`server running at: http://localhost:${PORT}`);
});
