import { PROMPTS } from "../../client/src/constants.js";
import { Player } from "./player.js";
import { randomID, getRandomIdx } from "../random.js";

const MIN_PLAYERS = 2;

class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = "GameError";
  }
}

export class Game {
  constructor() {
    this.gameID = randomID();
    this.gameCode = randomID().slice(2, 6).toUpperCase();
    this.players = [];
    this.createdAt = Date.now();
    this.startedAt = null;
    this.endedAt = null;
    this.phase = "lobby";
    this.prompt = PROMPTS[getRandomIdx(PROMPTS)];
    this.submissions = {};
    this.results = { votes: {}, winner: null };
    this.turn = null;
  }

  nextTurn(phase) {
    this.checkPhase(phase);
    if (!this.turn) {
      throw new GameError("there are no turns");
    } else {
      this.turn += 1;
    }
  }

  setPhase(phase) {
    this.phase = phase;
    if (phase === "submissions") {
      this.turn = 1;
    } else {
      this.turn = null;
    }
  }

  checkPhase(phase) {
    if (phase !== this.phase) {
      throw new GameError(`not in ${phase} phase`);
    }
  }

  addPlayer(player) {
    this.checkPhase("lobby");
    if (this.players.find((p) => p.userID === player.userID)) {
      throw new GameError("player already exists");
    }
    this.players.push(player);
  }

  removePlayer(userID) {
    const newPlayers = this.players.filter(
      (player) => player.userID !== userID,
    );
    this.players = newPlayers;
  }

  makeSubmission(userID, submission) {
    this.checkPhase("submissions");
    if (!submission || submission.trim() === "") {
      throw new GameError("submission can't be empty");
    } else if (Object.keys(this.submissions).find((uid) => uid === userID)) {
      throw new GameError("player already submitted");
    }

    const player = this.players.find((player) => player.userID === userID);
    if (!player) {
      throw new GameError("invalid user id");
    }
    this.submissions[player.userID] = submission;
  }

  castVote(fromUserID, toUserID) {
    this.checkPhase("voting");
    if (!this.players.find((player) => player.userID === fromUserID)) {
      throw new GameError("voting player not found");
    }
    if (!this.players.find((player) => player.userID === toUserID)) {
      throw new GameError("voted player not found");
    }
    if (
      Object.keys(this.results.votes).find((userID) => userID === fromUserID)
    ) {
      throw new GameError("player already voted");
    }
    if (fromUserID === toUserID) {
      throw new GameError("player can't vote for themself");
    }

    this.results.votes[fromUserID] = toUserID;

    if (Object.values(this.results.votes).length === this.players.length) {
      this.endGame();
    }
  }

  startGame() {
    this.checkPhase("lobby");
    if (this.players.length < MIN_PLAYERS) {
      throw new GameError(`Need at least ${MIN_PLAYERS} players`);
    }

    // of the users set a random as an imposter
    const randomPlayerIdx = getRandomIdx(this.players);
    this.players.forEach((player, idx) => {
      if (randomPlayerIdx === idx) {
        player.role = "imposter";
      } else {
        player.role = "normal";
      }
    });
    this.setPhase("rolesReveal");
    this.startedAt = Date.now();
  }

  endGame() {
    const counts = Object.values(this.results.votes).reduce((acc, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    const maxVotes = Math.max(...Object.values(counts));
    const votedOut = this.players.filter(
      ({ userID }) => counts[userID] === maxVotes,
    );
    this.results.winner = votedOut.every(({ role }) => role === "imposter")
      ? "normal"
      : "imposter";
    this.setPhase("results");
    this.endedAt = Date.now();
    this.turn = null;
  }

  resetGame() {
    this.prompt = PROMPTS[getRandomIdx(PROMPTS)];
    this.submissions = {};
    this.results = { votes: {}, winner: null };
    this.turn = null;
    this.startedAt = null;
    this.endedAt = null;
    this.setPhase("lobby");
  }
}
