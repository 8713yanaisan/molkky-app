export function renderHistoryView(container, matches, handlers) {
  const items = matches ?? [];

  container.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <h2>履歴</h2>
        <button id="backToMenuButton">メニューへ</button>
      </div>

      ${
        items.length === 0
          ? `<p class="empty-text">まだ試合履歴がありません。</p>`
          : `
            <div class="history-list">
              ${items
                .map((match) => {
                  const winnerName =
                    match.teams.find((team) => team.id === match.result.winnerTeamId)?.name ??
                    match.players.find((player) => player.id === match.result.winnerPlayerId)?.name ??
                    "未設定";

                  const scoreRows = match.teams
                    .map((team) => {
                      const score = match.scores?.teamScores?.[team.id] ?? 0;
                      return `<span class="history-score-chip">${team.name}: ${score}</span>`;
                    })
                    .join("");

                  return `
                    <button class="history-card" data-match-id="${match.id}">
                      <div class="history-card-top">
                        <strong>${match.mode === "team" ? "チーム戦" : "個人戦"}</strong>
                        <span>${match.finishedAt ?? match.createdAt ?? "-"}</span>
                      </div>
                      <div class="history-card-winner">勝者: ${winnerName}</div>
                      <div class="history-card-scores">${scoreRows}</div>
                      <div class="history-card-meta">
                        ターン数: ${match.turns?.length ?? 0}
                      </div>
                    </button>
                  `;
                })
                .join("")}
            </div>
          `
      }
    </section>
  `;

  container.querySelector("#backToMenuButton")?.addEventListener("click", handlers.onBackToMenu);

  container.querySelectorAll(".history-card").forEach((button) => {
    button.addEventListener("click", () => {
      handlers.onSelectMatch(button.dataset.matchId);
    });
  });
}
