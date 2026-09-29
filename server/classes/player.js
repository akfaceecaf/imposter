export class User {
  constructor({ userID, username, connected }) {
    this.connected = connected;
    this.userID = userID;
    this.username = username;
  }
}

export class Player extends User {
  constructor({ userID, username, connected }) {
    super({ userID, username, connected });
    this.role = null;
  }
}
