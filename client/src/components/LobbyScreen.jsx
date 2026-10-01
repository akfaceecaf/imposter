import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
import { PlayersList } from "./PlayersList";

export const LobbyScreen = () => {
  const { game, emit, leaveGame } = useContext(MultiplayerCtx);
  const { gameCode } = game;
  const onStart = () => {
    emit("startGame");
  };

  const onLeave = () => {
    leaveGame();
  };

  return (
    <div>
      <div>
        <button onClick={onLeave}>Leave</button>
        <h2>Room Code</h2>
        <span>{gameCode}</span>
      </div>
      <PlayersList />
      <button onClick={onStart}>Start</button>
    </div>
  );
};
