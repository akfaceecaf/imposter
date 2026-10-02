import PROMPTS from "../constants/prompts.js";
import { randomID, getRandomIdx } from "../utils/random.js";

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
    this.prompt = null;
    this.submissions = {};
    this.results = { votes: {}, winner: null };
    this.turn = null;
  }

  advance() {
    switch (this.phase) {
      case "rolesReveal":
        this.setPhase("submissions");
        this.turn = 1;
        return;
      case "submissions":
        if (!(this.players[this.turn - 1].userID in this.submissions)) {
          throw new GameError("player has not made submission yet");
        } else if (this.turn < this.players.length) {
          this.nextTurn();
        } else {
          this.setPhase("voting");
          this.turn = null;
        }
        return;
      case "results":
        throw new GameError("reached end of game");
      default:
        throw new GameError("invalid phase");
    }
  }

  nextTurn() {
    if (!this.turn) {
      throw new GameError("there are no turns");
    } else {
      this.turn += 1;
    }
  }

  setPhase(phase) {
    this.phase = phase;
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
    if (!["lobby", "results"].includes(this.phase)) {
      throw new GameError("can't remove player in game");
    }
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
    this.prompt = PROMPTS[getRandomIdx(PROMPTS)];
    this.startedAt = Date.now();
    this.setPhase("rolesReveal");
  }

  endGame() {
    this.checkPhase("voting");
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
    this.endedAt = Date.now();
    this.turn = null;
    this.setPhase("results");
  }

  resetGame() {
    this.checkPhase("results");
    this.prompt = null;
    this.submissions = {};
    this.results = { votes: {}, winner: null };
    this.turn = null;
    this.startedAt = null;
    this.endedAt = null;
    for (const player of this.players) {
      player.role = null;
    }
    this.setPhase("lobby");
  }

  static fromJSON(json) {
    const game = new Game();
    game.phase = json.phase;
    game.gameID = json.game_id;
    game.gameCode = json.game_code;
    game.players = json.players;
    game.createdAt = json.createdat;
    game.startedAt = json.startedat;
    game.endedAt = json.endedat;
    game.phase = json.phase;
    game.prompt = json.prompt;
    game.submissions = json.submissions;
    game.results = json.results;
    game.turn = json.turn;
    return game;
  }
}
