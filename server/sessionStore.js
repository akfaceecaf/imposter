class SessionStore {
  constructor() {}
  findSession() {}
  saveSession() {}
}

export class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(sessionID) {
    return this.sessions.get(sessionID);
  }

  saveSession(sessionID, session) {
    this.sessions.set(sessionID, session);
  }
}
