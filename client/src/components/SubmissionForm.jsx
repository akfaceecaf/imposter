import { useContext, useState } from "react";
import { MultiplayerCtx } from "./MultiplayerCtx";

export const SubmissionForm = () => {
  const { emit } = useContext(MultiplayerCtx);
  const [submission, setSubmission] = useState("");
  const [, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (submission.length === 0) {
      setSubmissionError("Must be a string");
      return;
    }
    emit("submission", submission);
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
