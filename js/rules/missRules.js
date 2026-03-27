import { MATCH_MODE } from "../constants.js";

export function applyMissRule({ mode, score, player, team, settings }) {
  const safePlayer = { ...player };
  const safeTeam = { ...team };

  let playerEliminated = false;
  let teamEliminated = false;

  if (!settings.eliminateOnThreeMisses) {
    if (score === 0) {
      safePlayer.totalMisses += 1;
    }
    return {
      player: safePlayer,
      team: safeTeam,
      playerEliminated,
      teamEliminated
    };
  }

  if (mode === MATCH_MODE.INDIVIDUAL) {
    if (score === 0) {
      safePlayer.totalMisses += 1;
      safePlayer.consecutiveMisses += 1;
    } else {
      safePlayer.consecutiveMisses = 0;
    }

    if (safePlayer.consecutiveMisses >= 3) {
      safePlayer.isEliminated = true;
      safePlayer.isActive = false;
      playerEliminated = true;
    }
  }

  if (mode === MATCH_MODE.TEAM) {
    if (score === 0) {
      safePlayer.totalMisses += 1;
      safeTeam.consecutiveMisses += 1;
    } else {
      safeTeam.consecutiveMisses = 0;
    }

    if (safeTeam.consecutiveMisses >= 3) {
      safeTeam.isEliminated = true;
      teamEliminated = true;
    }
  }

  return {
    player: safePlayer,
    team: safeTeam,
    playerEliminated,
    teamEliminated
  };
}
