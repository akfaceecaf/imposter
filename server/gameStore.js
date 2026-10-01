export class InMemoryGameStore {
  constructor() {
    this.games = new Map();
  }

  async saveGame(game) {
    await this.games.set(game.gameID, game);
  }
  async removeGame() {}

  async findGame(gameID) {
    return await this.games.get(gameID);
  }

  async findAllGames() {
    return await [...this.games.values()];
  }
}
