import { DEFAULT_SETTINGS, MATCH_MODE, MATCH_STATUS, VIEW_NAME } from "./constants.js";

function createInitialUiState() {
  return {
    currentView: VIEW_NAME.MENU,
    selectedMatchId: null,
    editingOrder: false,
    notifications: []
  };
}

function createInitialMatchState() {
  return {
    exists: false,
    status: MATCH_STATUS.IDLE,
    matchId: null,
    createdAt: null,
    finishedAt: null,
    mode: MATCH_MODE.INDIVIDUAL,

    settings: { ...DEFAULT_SETTINGS },

    teams: [],
    players: [],

    scores: {
      teamScores: {},
      playerStats: {}
    },

    order: {
      teamOrder: [],
      playerOrder: [],
      turnQueue: [],
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

function createInitialAppData() {
  return {
    matches: [],
    league: {
      enabled: false,
      currentSeriesId: null,
      standings: []
    },
    settings: {
      theme: "light"
    }
  };
}

export function createInitialState() {
  return {
    uiState: createInitialUiState(),
    matchState: createInitialMatchState(),
    appData: createInitialAppData()
  };
}

let state = createInitialState();

export function getState() {
  return state;
}

export function setState(nextState) {
  state = nextState;
}

export function resetAllState() {
  state = createInitialState();
}

export function resetMatchState() {
  state.matchState = createInitialMatchState();
}

export function setCurrentView(viewName) {
  state.uiState.currentView = viewName;
}

export function setSelectedMatchId(matchId) {
  state.uiState.selectedMatchId = matchId;
}

export function addNotification(message, type = "info") {
  state.uiState.notifications.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    message,
    type
  });
}

export function clearNotifications() {
  state.uiState.notifications = [];
}

export function setMatchState(nextMatchState) {
  state.matchState = nextMatchState;
}

export function updateMatchState(partial) {
  state.matchState = {
    ...state.matchState,
    ...partial
  };
}

export function pushSavedMatch(matchSnapshot) {
  state.appData.matches.unshift(matchSnapshot);
}

export function setLeagueData(leagueData) {
  state.appData.league = leagueData;
}
