import { db } from "../db/pg.js";
import { Game } from "./game.js";

class GameStore {
  constructor() {}
  async findGameByID() {}
  async findGameByCode() {}
  async findAllGames() {}
  async removeGame() {}
  async saveGame() {}
}

export class InMemoryGameStore extends GameStore {
  constructor() {
    super();
    this.games = new Map();
  }

  async saveGame(game) {
    await this.games.set(game.gameID, game);
  }
  async removeGame() {}

  async findGamebyID(gameID) {
    return await this.games.get(gameID);
  }

  async findGamebyCode(gameCode) {
    return await Object.values(this.games).find((g) => g.gameCode === gameCode);
  }

  async findAllGames() {
    return await [...this.games.values()];
  }
}

export class DBGameStore extends GameStore {
  constructor() {
    super();
  }

  async findGameByID(gameID) {
    const results = await db.any("SELECT * FROM games WHERE game_id = $1", [
      gameID,
    ]);
    if (results.length === 0) {
      return null;
    }
    return Game.fromJSON(results[0]);
  }

  async findGameByCode(gameCode) {
    const results = await db.any("SELECT * FROM games WHERE game_code = $1", [
      gameCode,
    ]);
    if (results.length === 0) {
      return null;
    }
    return Game.fromJSON(results[0]);
  }

  async saveGame(game) {
    if (await this.findGameByID(game.gameID)) {
      // if game id exists, update
      await db.none(
        `
        UPDATE games
        SET
        game_id = $1,
        game_code = $2,
        players = $3:json,
        createdAt = $4,
        startedAt = $5,
        endedAt = $6,
        phase = $7,
        prompt = $8,
        submissions = $9:json,
        results = $10:json,
        turn = $11
        WHERE game_id = $1
        `,
        [
          game.gameID,
          game.gameCode,
          game.players,
          game.createdAt,
          game.startedAt,
          game.endedAt,
          game.phase,
          game.prompt,
          game.submissions,
          game.results,
          game.turn,
        ],
      );
    } else {
      await db.none(
        `
        INSERT INTO games
        (game_id,game_code,players,createdAt,startedAt,endedAt,phase,prompt,submissions,results,turn)
        VALUES ($1, $2, $3:json, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          game.gameID,
          game.gameCode,
          game.players,
          game.createdAt,
          game.startedAt,
          game.endedAt,
          game.phase,
          game.prompt,
          game.submissions,
          game.results,
          game.turn,
        ],
      );
    }
  }

  async removeGame(gameID) {
    if (!game) {
      throw new Error("game not found");
    }
    await db.none("DELETE FROM games WHERE game_id = $1", [gameID]);
  }

  async findAllGames() {
    const results = await db.any("SELECT * FROM games");
    if (results.length === 0) {
      return null;
    }
    return results;
  }
}
