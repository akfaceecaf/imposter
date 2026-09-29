import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const RoleCard = () => {
  const { userID: selfUserID, game } = useContext(MultiplayerCtx);
  const { players, prompt } = game;
  const player = players.find((p) => p.userID === selfUserID);
  const isImposter = player.role === "imposter";
  return (
    <div>
      <p>
        You are: <span>{player.role}</span>
      </p>
      {!isImposter ? <p>Prompt: {prompt}</p> : "Try not to be sus!"}
    </div>
  );
};
