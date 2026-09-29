import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const ResultsScreen = () => {
  const { game, emit, leaveGame } = useContext(MultiplayerCtx);
  const { results } = game;
  const { winner } = results;

  const onHome = () => {
    leaveGame();
  };

  const onPlayAgain = () => {
    emit("resetGame");
  };

  return (
    <div>
      <button onClick={onHome}>Home</button>
      <button onClick={onPlayAgain}>Play Again</button>
      <p>
        <span>{winner}</span> wins
      </p>
    </div>
  );
};
