import { useContext } from "react";
import { PlayerRow } from "./PlayerRow";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const PlayersList = () => {
  const { game } = useContext(MultiplayerCtx);
  const { players } = game;
  return (
    <div>
      <h2>Players</h2>
      <ul>
        {players.map((player) => {
          return <PlayerRow key={player.userID} player={player} />;
        })}
      </ul>
    </div>
  );
};
