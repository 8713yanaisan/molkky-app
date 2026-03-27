function getCurrentPlayer(matchState) {
  return matchState.players.find((player) => player.id === matchState.currentTurn.playerId) ?? null;
}

function getCurrentTeam(matchState) {
  return matchState.teams.find((team) => team.id === matchState.currentTurn.teamId) ?? null;
}

function getMissText(matchState, team) {
  if (matchState.mode === "team") {
    return `チーム連続ミス: ${team.consecutiveMisses ?? 0}`;
  }

  const player = matchState.players.find((item) => item.teamId === team.id) ?? null;
  return `連続ミス: ${player?.consecutiveMisses ?? 0}`;
}

function renderScoreboard(matchState) {
  return matchState.teams
    .map((team) => {
      const score = matchState.scores.teamScores[team.id] ?? 0;
      const missText = getMissText(matchState, team);
      const status = team.isEliminated ? "失格" : "継続";
      return `
        <div class="score-card">
          <div class="score-card-name">${team.name}</div>
          <div class="score-card-score">${score}</div>
          <div class="score-card-meta">${missText}</div>
          <div class="score-card-meta">状態: ${status}</div>
        </div>
      `;
    })
    .join("");
}

function buildRoundTeamMap(matchState) {
  const teamIds = matchState.teams.map((team) => team.id);
  const teamCount = Math.max(teamIds.length, 1);
  const roundMap = new Map();

  matchState.turns.forEach((turn, index) => {
    const round = Math.floor(index / teamCount) + 1;
    if (!roundMap.has(round)) {
      roundMap.set(round, {});
    }

    const player = matchState.players.find((p) => p.id === turn.playerId);
    roundMap.get(round)[turn.teamId] = {
      ...turn,
      playerName: player?.name ?? "-"
    };
  });

  return roundMap;
}

function renderRoundGrid(matchState) {
  if (matchState.turns.length === 0) {
    return `<p class="empty-text">まだ記録がありません。</p>`;
  }

  const roundMap = buildRoundTeamMap(matchState);
  const rounds = Array.from(roundMap.keys()).sort((a, b) => a - b);

  return `
    <div class="round-history-table-wrap">
      <table class="round-history-table">
        <thead>
          <tr>
            <th>周</th>
            ${matchState.teams.map((team) => `<th>${team.name}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rounds.map((round) => {
            const row = roundMap.get(round) ?? {};
            return `
              <tr>
                <td class="round-label">${round}周目</td>
                ${matchState.teams.map((team) => {
                  const item = row[team.id];
                  if (!item) {
                    return `<td><div class="round-cell empty">-</div></td>`;
                  }

                  return `
                    <td>
                      <div class="round-cell">
                        <div class="round-player">${item.playerName}</div>
                        <div class="round-points">${item.score}点</div>
                        <div class="round-total">合計 ${item.teamScoreAfter}点</div>
                      </div>
                    </td>
                  `;
                }).join("")}
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderMatchView(container, matchState, handlers) {
  const currentPlayer = getCurrentPlayer(matchState);
  const currentTeam = getCurrentTeam(matchState);
  const isFinished = matchState.status === "finished";

  const winnerName = isFinished
    ? (
        matchState.teams.find((team) => team.id === matchState.result.winnerTeamId)?.name ??
        matchState.players.find((player) => player.id === matchState.result.winnerPlayerId)?.name ??
        "勝者未設定"
      )
    : "";

  const currentMissText = matchState.mode === "team"
    ? `現在チームの連続ミス: ${currentTeam?.consecutiveMisses ?? 0}`
    : `現在プレイヤーの連続ミス: ${currentPlayer?.consecutiveMisses ?? 0}`;

  container.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <h2>試合画面</h2>
        <button id="backToMenuButton">メニューへ</button>
      </div>

      <div class="current-turn-box">
        <div>ラウンド: ${matchState.currentTurn.round}</div>
        <div>投順: ${matchState.currentTurn.turnNumber}</div>
        <div>現在チーム: ${currentTeam?.name ?? "-"}</div>
        <div>現在プレイヤー: ${currentPlayer?.name ?? "-"}</div>
        <div>${currentMissText}</div>
      </div>

      ${
        isFinished
          ? `
            <div class="result-box">
              <div class="result-title">試合終了</div>
              <div>勝者: ${winnerName}</div>
              <div>最終表示点: ${matchState.result.finalDisplayScore ?? "-"}</div>
            </div>
          `
          : ""
      }

      <div class="score-grid">
        ${renderScoreboard(matchState)}
      </div>

      <h3>得点入力</h3>
      <div class="score-buttons">
        ${Array.from({ length: 13 }, (_, i) => `
          <button class="score-button" data-score="${i}" ${isFinished ? "disabled" : ""}>${i}</button>
        `).join("")}
      </div>

      <div class="actions">
        <button id="undoButton" ${matchState.turns.length === 0 ? "disabled" : ""}>1手戻す</button>
        <button id="finishButton" ${isFinished ? "disabled" : ""}>試合終了</button>
      </div>

      <h3>履歴（横: チーム / 縦: 周）</h3>
      ${renderRoundGrid(matchState)}
    </section>
  `;

  container.querySelectorAll(".score-button").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onScore(Number(button.dataset.score));
    });
  });

  container.querySelector("#undoButton")?.addEventListener("click", handlers.onUndo);
  container.querySelector("#finishButton")?.addEventListener("click", handlers.onFinish);
  container.querySelector("#backToMenuButton")?.addEventListener("click", handlers.onBackToMenu);
}
