import { MATCH_MODE } from "../../constants.js";
import { chunkTurnsToRounds } from "../../utils.js";

export function buildTurnQueue({ mode, teams, players, teamOrder, playerOrder }) {
  if (mode === MATCH_MODE.INDIVIDUAL) {
    return [...playerOrder];
  }

  const playersByTeam = teamOrder.reduce((acc, teamId) => {
    acc[teamId] = playerOrder
      .map((playerId) => players.find((player) => player.id === playerId))
      .filter((player) => player && player.teamId === teamId)
      .sort((a, b) => a.orderInTeam - b.orderInTeam);
    return acc;
  }, {});

  const maxMembers = Math.max(
    ...teamOrder.map((teamId) => (playersByTeam[teamId] || []).length),
    0
  );

  const queue = [];

  for (let memberIndex = 0; memberIndex < maxMembers; memberIndex += 1) {
    for (const teamId of teamOrder) {
      const player = playersByTeam[teamId]?.[memberIndex];
      if (player) {
        queue.push(player.id);
      }
    }
  }

  return queue;
}

export function getCurrentTurnInfo(matchState) {
  const { turnQueue, currentTurnIndex } = matchState.order;
  const playerId = turnQueue[currentTurnIndex] ?? null;
  const player = matchState.players.find((item) => item.id === playerId) ?? null;

  return {
    turnNumber: matchState.turns.length + 1,
    round: turnQueue.length > 0
      ? chunkTurnsToRounds(turnQueue.length, currentTurnIndex)
      : 1,
    playerId,
    teamId: player?.teamId ?? null
  };
}

export function getNextTurnIndex(matchState) {
  const queue = matchState.order.turnQueue;
  if (queue.length === 0) return 0;

  let nextIndex = matchState.order.currentTurnIndex;
  let checked = 0;

  while (checked < queue.length) {
    nextIndex = (nextIndex + 1) % queue.length;
    const nextPlayerId = queue[nextIndex];
    const nextPlayer = matchState.players.find((p) => p.id === nextPlayerId);
    const nextTeam = matchState.teams.find((t) => t.id === nextPlayer?.teamId);

    const playerBlocked = !!nextPlayer?.isEliminated || nextPlayer?.isActive === false;
    const teamBlocked = !!nextTeam?.isEliminated;

    if (!playerBlocked && !teamBlocked) {
      return nextIndex;
    }

    checked += 1;
  }

  return matchState.order.currentTurnIndex;
}

export function advanceTurn(matchState) {
  const nextTurnIndex = getNextTurnIndex(matchState);
  const nextRound = matchState.order.turnQueue.length > 0
    ? chunkTurnsToRounds(matchState.order.turnQueue.length, nextTurnIndex)
    : 1;

  return {
    ...matchState,
    order: {
      ...matchState.order,
      currentTurnIndex: nextTurnIndex,
      round: nextRound
    }
  };
}
