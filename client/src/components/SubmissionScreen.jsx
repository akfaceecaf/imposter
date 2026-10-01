import { useContext } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
import { SubmissionForm } from "./SubmissionForm";
import { SubmissionResult } from "./SubmissionResult";

export const SubmissionScreen = () => {
  const { game, emit, userID } = useContext(MultiplayerCtx);
  const { players, turn } = game;
  const turnPlayer = players[turn - 1];
  const isTurn = turnPlayer.userID === userID;
  const submission = game.submissions[turnPlayer.userID];

  const onNext = () => {
    emit("advance");
  };

  return (
    <div>
      <p>{isTurn ? "Your" : `Player ${turnPlayer.username}'s`} Turn</p>
      {!submission ? (
        isTurn ? (
          <SubmissionForm />
        ) : (
          <div>Waiting on submission...</div>
        )
      ) : (
        <div>
          <SubmissionResult submission={submission} />
          <button onClick={onNext}>Next</button>
        </div>
      )}
    </div>
  );
};
