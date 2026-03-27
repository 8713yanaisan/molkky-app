import { MATCH_MODE, MATCH_STATUS } from "../../constants.js";
import { nowIso } from "../../utils.js";
import { calculateNextScore } from "../../rules/scoreRules.js";
import { applyMissRule } from "../../rules/missRules.js";
import { advanceTurn, getCurrentTurnInfo } from "./turnOrder.js";

function clonePlayers(players) {
  return players.map((player) => ({ ...player }));
}

function cloneTeams(teams) {
  return teams.map((team) => ({ ...team }));
}

function getWinnerIds(matchState, winningTeamId) {
  if (matchState.mode === MATCH_MODE.INDIVIDUAL) {
    const winnerPlayer = matchState.players.find((player) => player.teamId === winningTeamId) ?? null;
    return {
      winnerTeamId: winningTeamId,
      winnerPlayerId: winnerPlayer?.id ?? null
    };
  }

  return {
    winnerTeamId: winningTeamId,
    winnerPlayerId: null
  };
}

function hasPlayableOpponent(matchState, currentTeamId) {
  if (matchState.mode === MATCH_MODE.INDIVIDUAL) {
    return matchState.players.some((player) => {
      return player.teamId !== currentTeamId && !player.isEliminated && player.isActive !== false;
    });
  }

  return matchState.teams.some((team) => {
    return team.id !== currentTeamId && !team.isEliminated;
  });
}

export function applyScoreInput(matchState, addedScore) {
  if (!matchState.exists || matchState.status !== MATCH_STATUS.PLAYING) {
    throw new Error("試合が開始されていません。");
  }

  const currentTurn = getCurrentTurnInfo(matchState);
  const playerIndex = matchState.players.findIndex((player) => player.id === currentTurn.playerId);
  if (playerIndex === -1) {
    throw new Error("現在のプレイヤーが見つかりません。");
  }

  const teamIndex = matchState.teams.findIndex((team) => team.id === currentTurn.teamId);
  if (teamIndex == -1) {
    throw new Error("現在のチームが見つかりません。");
  }

  const currentPlayer = matchState.players[playerIndex];
  const currentTeam = matchState.teams[teamIndex];

  if (currentPlayer.isEliminated || currentPlayer.isActive === false) {
    throw new Error("このプレイヤーはすでに失格です。");
  }

  if (currentTeam.isEliminated) {
    throw new Error("このチームはすでに失格です。");
  }

  const nextPlayers = clonePlayers(matchState.players);
  const nextTeams = cloneTeams(matchState.teams);
  const nextTeamScores = { ...matchState.scores.teamScores };
  const nextPlayerStats = { ...matchState.scores.playerStats };

  const teamScoreBefore = nextTeamScores[currentTeam.id] ?? 0;
  const scoreResult = calculateNextScore(teamScoreBefore, addedScore, matchState.settings);

  const missResult = applyMissRule({
    mode: matchState.mode,
    score: addedScore,
    player: nextPlayers[playerIndex],
    team: nextTeams[teamIndex],
    settings: matchState.settings
  });

  nextPlayers[playerIndex] = missResult.player;
  nextTeams[teamIndex] = missResult.team;
  nextTeamScores[currentTeam.id] = scoreResult.scoreAfter;

  const playerStats = nextPlayerStats[currentPlayer.id] ?? {
    throws: 0,
    scoredPoints: 0,
    lastScore: null
  };

  nextPlayerStats[currentPlayer.id] = {
    throws: playerStats.throws + 1,
    scoredPoints: playerStats.scoredPoints + addedScore,
    lastScore: addedScore
  };

  const turnRecord = {
    turnNumber: currentTurn.turnNumber,
    round: currentTurn.round,
    playerId: currentPlayer.id,
    teamId: currentTeam.id,
    score: addedScore,
    teamScoreBefore,
    teamScoreAfter: scoreResult.scoreAfter,

    playerConsecutiveMissesBefore: currentPlayer.consecutiveMisses,
    playerConsecutiveMissesAfter: nextPlayers[playerIndex].consecutiveMisses,

    teamConsecutiveMissesBefore: currentTeam.consecutiveMisses,
    teamConsecutiveMissesAfter: nextTeams[teamIndex].consecutiveMisses,

    playerEliminatedAfterTurn: nextPlayers[playerIndex].isEliminated,
    teamEliminatedAfterTurn: nextTeams[teamIndex].isEliminated,

    busted: scoreResult.busted,
    won: scoreResult.won,
    displayScore: scoreResult.displayScore,
    timestamp: nowIso()
  };

  let nextMatchState = {
    ...matchState,
    players: nextPlayers,
    teams: nextTeams,
    scores: {
      teamScores: nextTeamScores,
      playerStats: nextPlayerStats
    },
    turns: [...matchState.turns, turnRecord]
  };

  const currentTeamId = currentTeam.id;
  const noOpponentLeft = !hasPlayableOpponent(nextMatchState, currentTeamId);

  if (scoreResult.won || noOpponentLeft) {
    const winnerIds = getWinnerIds(nextMatchState, currentTeamId);

    nextMatchState = {
      ...nextMatchState,
      status: MATCH_STATUS.FINISHED,
      finishedAt: nowIso(),
      result: {
        winnerTeamId: winnerIds.winnerTeamId,
        winnerPlayerId: winnerIds.winnerPlayerId,
        finalDisplayScore: scoreResult.won
          ? scoreResult.displayScore
          : nextTeamScores[currentTeamId]
      },
      currentTurn: {
        ...nextMatchState.currentTurn
      }
    };

    return nextMatchState;
  }

  nextMatchState = advanceTurn(nextMatchState);
  nextMatchState.currentTurn = getCurrentTurnInfo(nextMatchState);

  return nextMatchState;
}
