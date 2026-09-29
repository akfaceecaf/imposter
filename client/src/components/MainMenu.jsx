import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
import { useState } from "react";
import ConnectionManager from "./ConnectionManager";
import notify from "../notify";

const JoinMenu = () => {
  const { joinGame } = useContext(MultiplayerCtx);
  const [gameCode, setGameCode] = useState("");

  const onJoin = (e) => {
    e.preventDefault();
    if (!gameCode) {
      notify("Enter a valid code", "error");
      return;
    }
    joinGame(gameCode);
  };

  return (
    <>
      <form onSubmit={onJoin}>
        <input
          placeholder="Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
        />
        <button type="submit">Join</button>
      </form>
    </>
  );
};

export const MainMenu = () => {
  const { createGame } = useContext(MultiplayerCtx);

  return (
    <div>
      <ConnectionManager />
      <JoinMenu />
      <button onClick={createGame}>Create New</button>
    </div>
  );
};
