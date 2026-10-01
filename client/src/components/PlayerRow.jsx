import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const PlayerRow = ({ player }) => {
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
