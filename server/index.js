import { Server } from "socket.io";
import express from "express";
import { createServer } from "node:http";
import { Game } from "./classes/game.js";
import { randomID } from "./random.js";
import { Player } from "./classes/player.js";
import { InMemoryGameStore } from "./gameStore.js";
import { InMemorySessionStore } from "./sessionStore.js";

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

// middleware, check if from valid user and session
io.use((socket, next) => {
  const { sessionID } = socket.handshake.auth;

  // find existing session
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      const gameID = session.gameID;
      if (gameID) {
        socket.gameID = gameID;
        socket.join(gameID);
      } else {
        socket.gameID = null;
      }
      return next();
    }
  }

  // create new session
  socket.sessionID = randomID();
  socket.userID = randomID();
  socket.gameID = null;
  next();
});

io.on("connection", async (socket) => {
  console.log("connected");

  // update current user session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    gameID: socket.gameID,
    connected: true,
  });
  // if was in a game, then mark connection status again
  const game = await gameStore.findGame(socket.gameID);
  if (game) {
    const { players } = game;
    const player = players.find((p) => p.userID === socket.userID);
    if (player) {
      socket.join(game.gameID);
      player.connected = true;
      socket.to(socket.gameID).emit("player online", player);
    }
  }
  socket.emit("session", {
    userID: socket.userID,
    sessionID: socket.sessionID,
    game,
  });

  socket.on("createGame", (callback) => {
    try {
      // create a new unique game instance
      let game = new Game();
      let attempts = 0;
      const existingGames = gameStore.findAllGames();
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
      gameStore.saveGame(game);
      socket.join(game.gameID);

      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        gameID: game.gameID,
        connected: true,
      });
      socket.gameID = game.gameID;
      return callback({ status: "success", data: game });
    } catch (error) {
      return callback({ status: "error", message: error.message });
    }
  });

  socket.on("joinGame", (gameCode, callback) => {
    try {
      const existingGames = gameStore.findAllGames();
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
      socket.join(gameID);

      socket.gameID = gameID;
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        gameID: gameID,
        connected: true,
      });
      socket.to(gameID).emit("player joined", player);
      return callback({ status: "success", data: game });
    } catch (error) {
      return callback({ status: "error", message: error.message });
    }
  });

  socket.on("leaveGame", (callback) => {
    try {
      const gameID = socket.gameID;
      const game = gameStore.findGame(gameID);
      if (!game) {
        throw new Error("game does not exist");
      }
      const player = game.players.find((p) => p.userID === socket.userID);

      game.removePlayer(socket.userID);
      socket.leave(gameID);
      socket.gameID = null;
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        gameID: null,
        connected: true,
      });
      socket.to(gameID).emit("player left", player);
      return callback({ status: "success", data: null });
    } catch (error) {
      return callback({ status: "error", message: error.message });
    }
  });

  const gameAction = (actionFn) => {
    try {
      const game = gameStore.findGame(socket.gameID);
      if (!game) {
        throw new Error("game not found");
      }
      if (!game.players.some((p) => p.userID === socket.userID)) {
        throw new Error("user not in game");
      }
      actionFn(game);
      io.to(socket.gameID).emit("gameState", game);
    } catch (error) {
      socket.emit("gameError", { message: error.message });
    }
  };

  socket.on("startGame", () => {
    gameAction((g) => g.startGame());
  });

  socket.on("setPhase", (phase) => {
    gameAction((g) => g.setPhase(phase));
  });

  socket.on("nextTurn", (phase) => {
    gameAction((g) => g.nextTurn(phase));
  });

  socket.on("submission", (data) => {
    gameAction((g) => {
      g.makeSubmission(data.userID, data.submission);
    });
  });

  socket.on("castVote", (data) => {
    gameAction((g) => g.castVote(data.fromUserID, data.toUserID));
  });

  socket.on("resetGame", () => {
    gameAction((g) => {
      g.resetGame();
    });
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    // if user is a player set status to offline and notify other users
    const game = gameStore.findGame(socket.gameID);
    if (game) {
      const { players } = game;
      const player = players.find((p) => p.userID === socket.userID);
      if (player) {
        player.connected = false;
        socket.to(socket.gameID).emit("player offline", player);
      }
    }
    sessionStore.saveSession(socket.sessionID, {
      userID: socket.userID,
      gameID: socket.gameID,
      connected: false,
    });
  });
});

server.listen(PORT, () => {
  console.log(`server running at: http://localhost:${PORT}`);
});
