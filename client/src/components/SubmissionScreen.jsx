import { useContext, useState } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";
// import { useArrayNavigation } from "./useArrayNavigation";

const SubmissionForm = () => {
  const { emit, userID } = useContext(MultiplayerCtx);
  const [submission, setSubmission] = useState("");
  const [, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (submission.length === 0) {
      setSubmissionError("Must be a string");
      return;
    }
    emit("submission", { userID, submission });
    setSubmissionError("");
    setSubmitted(true);
  };
  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
        />

        <button type="submit">Submit</button>
      </form>
      {submissionError && <p>{submissionError}</p>}
    </>
  );
};

const SubmissionResult = ({ submission }) => {
  return (
    <div>
      <span>{submission}</span>
    </div>
  );
};

export const SubmissionScreen = () => {
  const { game, emit, userID } = useContext(MultiplayerCtx);
  const { players, turn } = game;
  const turnPlayer = players[turn - 1];
  const isTurn = turnPlayer.userID === userID;
  const submission = game.submissions[turnPlayer.userID];

  const onNext = () => {
    if (turn === players.length) {
      emit("setPhase", "voting");
    } else {
      emit("nextTurn", "submissions");
    }
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
