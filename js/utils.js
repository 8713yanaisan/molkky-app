export function generateId(prefix = "id") {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function indexById(list) {
  return list.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export function getTeamScoreMap(teams) {
  return teams.reduce((acc, team) => {
    acc[team.id] = 0;
    return acc;
  }, {});
}

export function getPlayerStatsMap(players) {
  return players.reduce((acc, player) => {
    acc[player.id] = {
      throws: 0,
      scoredPoints: 0,
      lastScore: null
    };
    return acc;
  }, {});
}

export function chunkTurnsToRounds(turnQueueLength, turnIndex) {
  return Math.floor(turnIndex / turnQueueLength) + 1;
}

export function reorderArrayByIds(sourceList, orderedIds) {
  const map = indexById(sourceList);
  return orderedIds.map((id) => map[id]).filter(Boolean);
}
