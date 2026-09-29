export class InMemoryGameStore {
  constructor() {
    this.games = new Map();
  }

  saveGame(game) {
    this.games.set(game.gameID, game);
  }
  removeGame() {}

  findGame(gameID) {
    return this.games.get(gameID);
  }

  findAllGames() {
    return [...this.games.values()];
  }
}
