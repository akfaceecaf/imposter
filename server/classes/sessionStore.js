import { db } from "../db/pg.js";

class SessionStore {
  constructor() {}
  async findSession() {}
  async saveSession() {}
  async findAllSessions() {}
}

export class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  async findSession(sessionID) {
    return await this.sessions.get(sessionID);
  }

  async saveSession(sessionID, session) {
    await this.sessions.set(sessionID, session);
  }
}

export class DBSessionStore extends SessionStore {
  constructor() {
    super();
  }

  async findSession(sessionID) {
    const results = await db.any(
      "SELECT * FROM sessions WHERE session_id = $1",
      [sessionID],
    );
    if (results.length === 0) {
      return null;
    }
    return this.convToExpressFormat(results[0]);
  }

  async saveSession(sessionID, session) {
    // sessionID exists, then update
    if (await this.findSession(sessionID)) {
      await db.none(
        `UPDATE sessions
          SET session_id = $1,
          user_id = $2,
          game_id = $3,
          connected = $4
          WHERE session_id = $1`,
        [sessionID, session?.userID, session?.gameID, session?.connected],
      );
    } else {
      await db.none(
        `
          INSERT INTO sessions
          (session_id, user_id, game_id, connected) VALUES ($1, $2, $3, $4)
          `,
        [sessionID, session?.userID, session?.gameID, session?.connected],
      );
    }
  }

  async findAllSessions() {
    const results = db.any("SELECT * FROM sessions");
    if (results.length === 0) {
      return null;
    }
    return results.map((s) => this.convToExpressFormat(s));
  }

  convToExpressFormat(session) {
    return {
      userID: session.user_id,
      gameID: session.game_id,
      connected: session.connected,
    };
  }
}
