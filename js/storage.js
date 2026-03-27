import { STORAGE_KEY } from "./constants.js";

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback;
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}

export function loadMatches() {
  return safeParse(localStorage.getItem(STORAGE_KEY.MATCHES), []);
}

export function saveMatches(matches) {
  localStorage.setItem(STORAGE_KEY.MATCHES, JSON.stringify(matches));
}

export function appendMatch(matchSnapshot) {
  const matches = loadMatches();
  matches.unshift(matchSnapshot);
  saveMatches(matches);
  return matches;
}

export function loadLeague() {
  return safeParse(localStorage.getItem(STORAGE_KEY.LEAGUE), {
    enabled: false,
    currentSeriesId: null,
    standings: []
  });
}

export function saveLeague(leagueData) {
  localStorage.setItem(STORAGE_KEY.LEAGUE, JSON.stringify(leagueData));
}

export function loadSettings() {
  return safeParse(localStorage.getItem(STORAGE_KEY.SETTINGS), null);
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY.SETTINGS, JSON.stringify(settings));
}

export function clearAllStorage() {
  localStorage.removeItem(STORAGE_KEY.MATCHES);
  localStorage.removeItem(STORAGE_KEY.LEAGUE);
  localStorage.removeItem(STORAGE_KEY.SETTINGS);
}
