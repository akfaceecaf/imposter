import { NavBar } from "./NavBar";
import { LobbyScreen } from "./LobbyScreen";
import { RoleScreen } from "./RoleScreen";
import { SubmissionScreen } from "./SubmissionScreen";
import { VotingScreen } from "./VotingScreen";
import { ResultsScreen } from "./ResultsScreen";
import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
import ConnectionManager from "./ConnectionManager";

const SCREENS = {
  lobby: LobbyScreen,
  rolesReveal: RoleScreen,
  submissions: SubmissionScreen,
  voting: VotingScreen,
  results: ResultsScreen,
};

export const GameScreen = () => {
  const { game } = useContext(MultiplayerCtx);
  const Screen = SCREENS[game.phase];
  return (
    <div>
      <NavBar />
      <ConnectionManager />
      {Screen && <Screen />}
    </div>
  );
};
