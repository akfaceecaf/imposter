import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

const PlayerRow = ({ player }) => {
  const { userID: selfUserID } = useContext(MultiplayerCtx);
  const { userID, username, connected } = player;
  return (
    <li>
      {selfUserID === userID ? "* " : ""}
      {username}
      {!connected ? " (offline)" : ""}
    </li>
  );
};
const PlayersList = () => {
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
