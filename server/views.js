// show public info about a player
export function toPublicPlayer(player) {
  return {
    userID: player.userID,
    username: player.username,
    connected: player.connected,
  };
}

export function toGameView(game, userID) {
  const me = game.players.find((p) => p.userID === userID);
  if (!me) {
    return null;
  }
  const revealAll = game.phase === "results";

  return {
    gameID: game.gameID,
    gameCode: game.gameCode,
    players: game.players.map((p) => ({
      ...toPublicPlayer(p),
      role: p.userID === userID || game.phase === "results" ? p.role : null,
      //   derived fields
      hasSubmitted: p.userID in game.submissions,
      hasVoted: p.userID in game.results.votes,
    })),
    createdAt: game.createdAt,
    startedAt: game.startedAt,
    endedAt: game.endedAt,
    phase: game.phase,
    turn: game.turn,
    prompt:
      me.role !== "imposter" || game.phase === "results" ? game.prompt : null,
    submissions: game.submissions,
    results: revealAll
      ? game.results
      : {
          votes: game.results.votes[userID]
            ? { [userID]: game.results.votes[userID] }
            : {},
          winner: null,
        },
  };
}
