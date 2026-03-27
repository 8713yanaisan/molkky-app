import { MATCH_STATUS } from "../../constants.js";
import { nowIso } from "../../utils.js";

export function finishMatch(matchState) {
  return {
    ...matchState,
    status: MATCH_STATUS.FINISHED,
    finishedAt: nowIso()
  };
}

export function createMatchSnapshot(matchState) {
  return {
    id: matchState.matchId,
    createdAt: matchState.createdAt,
    finishedAt: matchState.finishedAt,
    status: matchState.status,
    mode: matchState.mode,
    settings: { ...matchState.settings },
    teams: matchState.teams.map((team) => ({ ...team })),
    players: matchState.players.map((player) => ({ ...player })),
    scores: {
      teamScores: { ...matchState.scores.teamScores },
      playerStats: Object.fromEntries(
        Object.entries(matchState.scores.playerStats).map(([playerId, stats]) => [
          playerId,
          { ...stats }
        ])
      )
    },
    order: {
      ...matchState.order,
      teamOrder: [...matchState.order.teamOrder],
      playerOrder: [...matchState.order.playerOrder],
      turnQueue: [...matchState.order.turnQueue]
    },
    currentTurn: { ...matchState.currentTurn },
    turns: matchState.turns.map((turn) => ({ ...turn })),
    result: { ...matchState.result }
  };
}
