import { MATCH_MODE, MATCH_STATUS } from "../../constants.js";
import { generateId, getPlayerStatsMap, getTeamScoreMap, nowIso } from "../../utils.js";
import { buildTurnQueue, getCurrentTurnInfo } from "./turnOrder.js";

function createIndividualTeams(playerNames) {
  const teams = [];
  const players = [];

  playerNames.forEach((name) => {
    const teamId = generateId("team");
    const playerId = generateId("player");

    teams.push({
      id: teamId,
      name: name,
      memberIds: [playerId],
      consecutiveMisses: 0,
      isEliminated: false
    });

    players.push({
      id: playerId,
      name,
      teamId,
      orderInTeam: 1,
      totalMisses: 0,
      consecutiveMisses: 0,
      isEliminated: false,
      isActive: true
    });
  });

  return { teams, players };
}

function createTeamMatchEntities(teamInputs) {
  const teams = [];
  const players = [];

  teamInputs.forEach((teamInput) => {
    const teamId = generateId("team");
    const memberIds = [];

    teamInput.playerNames.forEach((playerName, index) => {
      const playerId = generateId("player");
      memberIds.push(playerId);

      players.push({
        id: playerId,
        name: playerName,
        teamId,
        orderInTeam: index + 1,
        totalMisses: 0,
        consecutiveMisses: 0,
        isEliminated: false,
        isActive: true
      });
    });

    teams.push({
      id: teamId,
      name: teamInput.teamName,
      memberIds,
      consecutiveMisses: 0,
      isEliminated: false
    });
  });

  return { teams, players };
}

export function createMatch({
  mode = MATCH_MODE.INDIVIDUAL,
  playerNames = [],
  teamInputs = [],
  settings,
  teamOrderNames = [],
  playerOrderNames = []
}) {
  const matchId = generateId("match");
  const createdAt = nowIso();

  const entities = mode === MATCH_MODE.INDIVIDUAL
    ? createIndividualTeams(playerNames)
    : createTeamMatchEntities(teamInputs);

  const { teams, players } = entities;

  const resolvedTeamOrder = teamOrderNames.length > 0
    ? teamOrderNames
        .map((teamName) => teams.find((team) => team.name === teamName)?.id)
        .filter(Boolean)
    : teams.map((team) => team.id);

  const fallbackPlayerOrder = players
    .slice()
    .sort((a, b) => a.orderInTeam - b.orderInTeam)
    .map((player) => player.id);

  const resolvedPlayerOrder = playerOrderNames.length > 0
    ? playerOrderNames
        .map((playerName) => players.find((player) => player.name === playerName)?.id)
        .filter(Boolean)
    : fallbackPlayerOrder;

  const finalPlayerOrder = resolvedPlayerOrder.length > 0 ? resolvedPlayerOrder : fallbackPlayerOrder;

  const turnQueue = buildTurnQueue({
    mode,
    teams,
    players,
    teamOrder: resolvedTeamOrder,
    playerOrder: finalPlayerOrder
  });

  const matchState = {
    exists: true,
    status: MATCH_STATUS.PLAYING,
    matchId,
    createdAt,
    finishedAt: null,
    mode,
    settings: { ...settings },
    teams,
    players,
    scores: {
      teamScores: getTeamScoreMap(teams),
      playerStats: getPlayerStatsMap(players)
    },
    order: {
      teamOrder: resolvedTeamOrder,
      playerOrder: finalPlayerOrder,
      turnQueue,
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

  matchState.currentTurn = getCurrentTurnInfo(matchState);

  return matchState;
}
