import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
import ConnectionManager from "./ConnectionManager";
import JoinMenu from "./JoinMenu";

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
