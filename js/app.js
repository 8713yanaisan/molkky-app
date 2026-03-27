import { VIEW_NAME } from "./constants.js";
import {
  getState,
  resetMatchState,
  setCurrentView,
  setMatchState,
  setSelectedMatchId
} from "./state.js";
import { createMatch } from "./features/match/createMatch.js";
import { applyScoreInput } from "./features/match/scoreInput.js";
import { undoLastTurn } from "./features/match/undoTurn.js";
import { finishMatch, createMatchSnapshot } from "./features/match/finishMatch.js";
import { appendMatch, loadMatches } from "./storage.js";
import { renderNewMatchView } from "./ui/newMatchView.js";
import { renderMatchView } from "./ui/matchView.js";
import { renderHistoryView } from "./ui/historyView.js";
import { renderMatchDetailView } from "./ui/matchDetailView.js";

const appRoot = document.getElementById("app");

function renderMenu() {
  appRoot.innerHTML = `
    <section class="panel">
      <h1>モルック試合記録アプリ</h1>
      <div class="actions vertical">
        <button id="startNewMatchButton">新規試合</button>
        <button id="openHistoryButton">履歴</button>
      </div>
      <p class="note">履歴画面と試合詳細画面を追加した版です。</p>
    </section>
  `;

  document.getElementById("startNewMatchButton").addEventListener("click", () => {
    setCurrentView(VIEW_NAME.NEW_MATCH);
    renderApp();
  });

  document.getElementById("openHistoryButton").addEventListener("click", () => {
    setCurrentView(VIEW_NAME.HISTORY);
    renderApp();
  });
}

function saveFinishedMatch(matchState) {
  const snapshot = createMatchSnapshot(matchState);
  appendMatch(snapshot);
}

function renderApp() {
  const state = getState();

  if (state.uiState.currentView === VIEW_NAME.MENU) {
    renderMenu();
    return;
  }

  if (state.uiState.currentView === VIEW_NAME.NEW_MATCH) {
    renderNewMatchView(appRoot, (payload) => {
      const matchState = createMatch(payload);
      setMatchState(matchState);
      setCurrentView(VIEW_NAME.MATCH);
      renderApp();
    });
    return;
  }

  if (state.uiState.currentView === VIEW_NAME.MATCH) {
    renderMatchView(appRoot, state.matchState, {
      onScore(score) {
        const before = getState().matchState;
        if (before.status === "finished") return;

        const nextMatchState = applyScoreInput(before, score);
        setMatchState(nextMatchState);

        if (before.status !== "finished" && nextMatchState.status === "finished") {
          saveFinishedMatch(nextMatchState);
        }

        renderApp();
      },

      onUndo() {
        const nextMatchState = undoLastTurn(getState().matchState);
        setMatchState(nextMatchState);
        renderApp();
      },

      onFinish() {
        const before = getState().matchState;
        if (before.status === "finished") {
          renderApp();
          return;
        }

        const finished = finishMatch(before);
        setMatchState(finished);
        saveFinishedMatch(finished);
        renderApp();
      },

      onBackToMenu() {
        resetMatchState();
        setCurrentView(VIEW_NAME.MENU);
        renderApp();
      }
    });
    return;
  }

  if (state.uiState.currentView === VIEW_NAME.HISTORY) {
    const matches = loadMatches();
    renderHistoryView(appRoot, matches, {
      onBackToMenu() {
        setCurrentView(VIEW_NAME.MENU);
        renderApp();
      },
      onSelectMatch(matchId) {
        setSelectedMatchId(matchId);
        setCurrentView(VIEW_NAME.MATCH_DETAIL);
        renderApp();
      }
    });
    return;
  }

  if (state.uiState.currentView === VIEW_NAME.MATCH_DETAIL) {
    const matches = loadMatches();
    const match = matches.find((item) => item.id === state.uiState.selectedMatchId);

    if (!match) {
      setCurrentView(VIEW_NAME.HISTORY);
      renderApp();
      return;
    }

    renderMatchDetailView(appRoot, match, {
      onBackToHistory() {
        setCurrentView(VIEW_NAME.HISTORY);
        renderApp();
      },
      onBackToMenu() {
        setCurrentView(VIEW_NAME.MENU);
        renderApp();
      }
    });
  }
}

renderApp();
