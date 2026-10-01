import { MultiplayerCtx } from "./MultiplayerCtx";
import { useEffect, useState } from "react";
import socket from "../socket";
import notify from "../notify";

const emit = (event, data) => {
  socket.emit(event, data);
};

const subscribe = (event, callback) => {
  socket.on(event, callback);

  return () => {
    socket.off(event, callback);
  };
};

export const MultiplayerProvider = ({ children }) => {
  const [game, setGame] = useState(null);
  const [userID, setUserID] = useState(null);
  const screenState = game ? "game" : "home";

  const createGame = () => {
    socket.emit("createGame", (response) => {
      if (response.status === "error") {
        notify(`Failed to create game: ${response.message}`, "error");
        return;
      }
      notify("Game successfully created", "success");
      setGame(response.data);
    });
  };

  const joinGame = (gameCode) => {
    socket.emit("joinGame", gameCode, (response) => {
      if (response.status === "error") {
        notify(`Failed to join game: ${response.message}`, "error");
        return;
      }
      notify("Joined game");
      setGame(response.data);
    });
  };

  const leaveGame = () => {
    socket.emit("leaveGame", (response) => {
      if (response.status === "error") {
        notify(`Failed to leave game: ${response.message}`, "error");
        return;
      }
      notify("Left game");
      setGame(response.data);
    });
  };

  useEffect(() => {
    const unsubConnect = subscribe("connect", () => {
      notify("Connected!", "success");
    });

    const unsubDisconnect = subscribe("disconnect", () => {
      notify("Disconnected");
    });

    const unsubSession = subscribe("session", ({ sessionID, userID, game }) => {
      socket.auth = { sessionID };
      sessionStorage.setItem("sessionID", sessionID);
      socket.userID = userID;
      setUserID(userID);

      if (game) {
        notify("Rejoined game", "success");
      }
      setGame(game);
    });

    const unsubPlayerJoined = subscribe("player joined", (player) => {
      notify(`Player ${player.username} has joined`);
    });

    const unsubPlayerLeft = subscribe("player left", (player) => {
      notify(`Player ${player.username} left`);
    });

    const unsubPlayerOnline = subscribe("player online", (player) => {});

    const unsubPlayerOffline = subscribe("player offline", (player) => {});

    const unsubGameState = subscribe("gameState", (game) => {
      setGame(game);
    });
    const unsubGameError = subscribe("gameError", (error) => {
      notify(error.message, "error");
      console.log(`error: ${error.message}`);
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubPlayerJoined();
      unsubPlayerLeft();
      unsubPlayerOnline();
      unsubPlayerOffline();
      unsubGameState();
      unsubGameError();
      unsubSession();
    };
  }, []);

  const value = {
    socket,
    setGame,
    game,
    screenState,
    emit,
    createGame,
    joinGame,
    leaveGame,
    userID,
  };
  return <MultiplayerCtx value={value}>{children}</MultiplayerCtx>;
};
