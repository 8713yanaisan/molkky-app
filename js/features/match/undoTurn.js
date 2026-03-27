import { MATCH_STATUS } from "../../constants.js";
import { getCurrentTurnInfo } from "./turnOrder.js";
import { applyScoreInput } from "./scoreInput.js";

function createBaseMatchStateForReplay(matchState) {
  return {
    ...matchState,
    status: MATCH_STATUS.PLAYING,
    finishedAt: null,
    players: matchState.players.map((player) => ({
      ...player,
      totalMisses: 0,
      consecutiveMisses: 0,
      isEliminated: false,
      isActive: true
    })),
    teams: matchState.teams.map((team) => ({
      ...team,
      consecutiveMisses: 0,
      isEliminated: false
    })),
    scores: {
      teamScores: Object.fromEntries(
        matchState.teams.map((team) => [team.id, 0])
      ),
      playerStats: Object.fromEntries(
        matchState.players.map((player) => [
          player.id,
          { throws: 0, scoredPoints: 0, lastScore: null }
        ])
      )
    },
    order: {
      ...matchState.order,
      currentTurnIndex: 0,
      round: 1
    },
    currentTurn: {
      turnNumber: 1,
      round: 1,
      playerId: null,
      teamId: null
    },
    turns: [],
    result: {
      winnerTeamId: null,
      winnerPlayerId: null,
      finalDisplayScore: null
    }
  };
}

export function undoLastTurn(matchState) {
  if (!matchState.turns || matchState.turns.length === 0) {
    return matchState;
  }

  const replayTurns = matchState.turns.slice(0, -1);
  let replayState = createBaseMatchStateForReplay(matchState);
  replayState.currentTurn = getCurrentTurnInfo(replayState);

  for (const turn of replayTurns) {
    replayState = applyScoreInput(replayState, turn.score);
  }

  replayState.currentTurn = getCurrentTurnInfo(replayState);
  return replayState;
}
