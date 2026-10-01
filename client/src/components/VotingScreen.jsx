import { useContext, useState } from "react";
import { VotingGrid } from "./VotingGrid";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const VotingScreen = () => {
  const { game, emit, userID: selfUserID } = useContext(MultiplayerCtx);
  const { players } = game;
  const [selection, setSelection] = useState(null);
  const selected = selection !== null;
  const [submitted, setSubmitted] = useState(false);

  const onSelect = (player) => {
    setSelection((prev) =>
      prev && prev.userID === player.userID ? null : player,
    );
  };

  const onSubmit = () => {
    emit("castVote", selection.userID);
    setSelection(null);
    setSubmitted(true);
  };

  return (
    <div>
      <h2>Voting</h2>
      <VotingGrid
        players={players.filter((p) => p.userID !== selfUserID)}
        onSelect={onSelect}
      />
      <button disabled={!selected || submitted} onClick={onSubmit}>
        Submit
      </button>
    </div>
  );
};
