import { useState, useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
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

export default JoinMenu;
