class SessionStore {
  constructor() {}
  async findSession() {}
  async saveSession() {}
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
