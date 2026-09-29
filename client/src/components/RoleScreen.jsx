import { useContext } from "react";
import { RoleCard } from "./RoleCard";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const RoleScreen = () => {
  const { emit } = useContext(MultiplayerCtx);

  const onNext = () => {
    emit("setPhase", "submissions");
  };

  return (
    <div>
      <RoleCard />
      <button onClick={onNext}>Next</button>
    </div>
  );
};
