function renderTeamSummary(match) {
  return match.teams
    .map((team) => {
      const score = match.scores?.teamScores?.[team.id] ?? 0;
      const status = team.isEliminated ? "失格" : "終了";
      return `
        <div class="score-card">
          <div class="score-card-name">${team.name}</div>
          <div class="score-card-score">${score}</div>
          <div class="score-card-meta">状態: ${status}</div>
        </div>
      `;
    })
    .join("");
}

function renderTurnRows(match) {
  if (!match.turns || match.turns.length === 0) {
    return `<p class="empty-text">ターン履歴がありません。</p>`;
  }

  return `
    <div class="turn-log">
      ${match.turns
        .map((turn) => {
          const player = match.players.find((item) => item.id === turn.playerId);
          const team = match.teams.find((item) => item.id === turn.teamId);
          return `
            <div class="turn-row detail">
              <span>#${turn.turnNumber}</span>
              <span>R${turn.round}</span>
              <span>${team?.name ?? "-"}</span>
              <span>${player?.name ?? "-"}</span>
              <strong>${turn.score}点</strong>
              <span>合計 ${turn.teamScoreAfter}点</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

export function renderMatchDetailView(container, match, handlers) {
  const winnerName =
    match.teams.find((team) => team.id === match.result.winnerTeamId)?.name ??
    match.players.find((player) => player.id === match.result.winnerPlayerId)?.name ??
    "未設定";

  container.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <h2>試合詳細</h2>
        <div class="actions">
          <button id="backToHistoryButton">履歴へ</button>
          <button id="backToMenuButton">メニューへ</button>
        </div>
      </div>

      <div class="detail-meta-grid">
        <div class="team-card">
          <div><strong>形式</strong></div>
          <div>${match.mode === "team" ? "チーム戦" : "個人戦"}</div>
        </div>
        <div class="team-card">
          <div><strong>開始</strong></div>
          <div>${match.createdAt ?? "-"}</div>
        </div>
        <div class="team-card">
          <div><strong>終了</strong></div>
          <div>${match.finishedAt ?? "-"}</div>
        </div>
        <div class="team-card">
          <div><strong>勝者</strong></div>
          <div>${winnerName}</div>
        </div>
      </div>

      <h3>最終スコア</h3>
      <div class="score-grid">
        ${renderTeamSummary(match)}
      </div>

      <h3>参加者</h3>
      <div class="participant-list">
        ${match.teams
          .map((team) => {
            const members = match.players
              .filter((player) => player.teamId === team.id)
              .map((player) => player.name)
              .join(" / ");

            return `
              <div class="team-card">
                <div><strong>${team.name}</strong></div>
                <div>${members}</div>
              </div>
            `;
          })
          .join("")}
      </div>

      <h3>ターン履歴</h3>
      ${renderTurnRows(match)}
    </section>
  `;

  container.querySelector("#backToHistoryButton")?.addEventListener("click", handlers.onBackToHistory);
  container.querySelector("#backToMenuButton")?.addEventListener("click", handlers.onBackToMenu);
}
