import { HomeScreen } from "./components/HomeScreen";
import { useContext } from "react";
import { MultiplayerCtx } from "./components/MultiplayerCtx";
import { GameScreen } from "./components/GameScreen";
import "./App.css";

function App() {
  const { screenState } = useContext(MultiplayerCtx);

  switch (screenState) {
    case "home":
      return <HomeScreen />;
    case "game":
      return <GameScreen />;
  }
}

export default App;
