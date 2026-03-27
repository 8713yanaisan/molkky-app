export const MATCH_MODE = {
  INDIVIDUAL: "individual",
  TEAM: "team"
};

export const MATCH_STATUS = {
  IDLE: "idle",
  PLAYING: "playing",
  FINISHED: "finished"
};

export const VIEW_NAME = {
  MENU: "menu",
  NEW_MATCH: "newMatch",
  MATCH: "match",
  RESULT: "result",
  HISTORY: "history",
  MATCH_DETAIL: "matchDetail",
  LEAGUE: "league"
};

export const STORAGE_KEY = {
  MATCHES: "molkky_matches",
  LEAGUE: "molkky_league",
  SETTINGS: "molkky_settings"
};

export const DEFAULT_SETTINGS = {
  winPoint: 50,
  resetScoreOnBust: 25,
  eliminateOnThreeMisses: true,
  bonusTenOnFifty: false,
  continuousMatch: false
};

export const MAX_TEAMS = 4;
export const MAX_PLAYERS_PER_TEAM = 4;
export const MIN_TEAMS = 2;
export const MIN_PLAYERS_PER_TEAM = 1;

export const SCORE_BUTTONS = Array.from({ length: 13 }, (_, i) => i);
