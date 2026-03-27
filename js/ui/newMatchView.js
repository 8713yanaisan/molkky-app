import {
  MATCH_MODE,
  DEFAULT_SETTINGS,
  MIN_TEAMS,
  MAX_TEAMS,
  MIN_PLAYERS_PER_TEAM,
  MAX_PLAYERS_PER_TEAM
} from "../constants.js";

function createNumberOptions(min, max, selectedValue) {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .map((value) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${value}</option>`)
    .join("");
}

function renderOrderEditor(items, hiddenInputName, title) {
  return `
    <div class="order-editor">
      <div class="order-editor-title">${title}</div>
      <div class="order-list" data-order-list="${hiddenInputName}">
        ${items.map((item, index) => `
          <div class="order-item" data-order-value="${item}">
            <span class="order-index">${index + 1}</span>
            <span class="order-label">${item}</span>
            <div class="order-actions">
              <button type="button" class="order-up">↑</button>
              <button type="button" class="order-down">↓</button>
            </div>
          </div>
        `).join("")}
      </div>
      <input type="hidden" name="${hiddenInputName}" value="${items.join("|")}" />
    </div>
  `;
}

function bindOrderEditors(container) {
  container.querySelectorAll("[data-order-list]").forEach((orderList) => {
    const hiddenInputName = orderList.dataset.orderList;
    const hiddenInput = container.querySelector(`input[name="${hiddenInputName}"]`);

    function syncOrder() {
      const items = Array.from(orderList.querySelectorAll(".order-item"));
      items.forEach((item, index) => {
        const indexEl = item.querySelector(".order-index");
        if (indexEl) {
          indexEl.textContent = String(index + 1);
        }
      });
      if (hiddenInput) {
        hiddenInput.value = items.map((item) => item.dataset.orderValue).join("|");
      }
    }

    orderList.querySelectorAll(".order-up").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".order-item");
        if (!item || !item.previousElementSibling) return;
        orderList.insertBefore(item, item.previousElementSibling);
        syncOrder();
      });
    });

    orderList.querySelectorAll(".order-down").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".order-item");
        if (!item || !item.nextElementSibling) return;
        orderList.insertBefore(item.nextElementSibling, item);
        syncOrder();
      });
    });

    syncOrder();
  });
}

function buildPlayerOrderNames(teamCount, playersPerTeam) {
  const names = [];
  for (let playerIndex = 0; playerIndex < playersPerTeam; playerIndex += 1) {
    for (let teamIndex = 0; teamIndex < teamCount; teamIndex += 1) {
      names.push(`${String.fromCharCode(65 + teamIndex)}${playerIndex + 1}`);
    }
  }
  return names;
}

function renderIndividualInputs(container, playerCount = 2) {
  const playerNames = Array.from({ length: playerCount }, (_, index) => `プレイヤー${index + 1}`);

  container.innerHTML = `
    <div class="field-group">
      <label for="playerCountSelect">人数</label>
      <select id="playerCountSelect">
        ${createNumberOptions(2, 4, playerCount)}
      </select>
    </div>

    <div id="individualNameFields" class="dynamic-stack">
      ${playerNames.map((name, index) => `
        <div class="field-group">
          <label>プレイヤー${index + 1}</label>
          <input type="text" name="playerName" value="${name}" />
        </div>
      `).join("")}
    </div>

    ${renderOrderEditor(playerNames, "playerOrderNames", "先攻 / 後攻（投げ順）")}
  `;

  bindOrderEditors(container);
}

function renderTeamInputs(container, teamCount = 2, playersPerTeam = 2) {
  const teamNames = Array.from({ length: teamCount }, (_, teamIndex) => `チーム${teamIndex + 1}`);
  const defaultPlayerOrderNames = buildPlayerOrderNames(teamCount, playersPerTeam);

  container.innerHTML = `
    <div class="config-row">
      <div class="field-group">
        <label for="teamCountSelect">チーム数</label>
        <select id="teamCountSelect">
          ${createNumberOptions(MIN_TEAMS, MAX_TEAMS, teamCount)}
        </select>
      </div>

      <div class="field-group">
        <label for="playersPerTeamSelect">1チームの人数</label>
        <select id="playersPerTeamSelect">
          ${createNumberOptions(MIN_PLAYERS_PER_TEAM, MAX_PLAYERS_PER_TEAM, playersPerTeam)}
        </select>
      </div>
    </div>

    <div id="teamFields" class="dynamic-stack">
      ${Array.from({ length: teamCount }, (_, teamIndex) => `
        <div class="team-card">
          <div class="field-group">
            <label>チーム${teamIndex + 1}名</label>
            <input type="text" name="teamName" value="${teamNames[teamIndex]}" />
          </div>

          <div class="team-player-grid">
            ${Array.from({ length: playersPerTeam }, (_, playerIndex) => `
              <div class="field-group">
                <label>プレイヤー${playerIndex + 1}</label>
                <input
                  type="text"
                  name="teamPlayerName_${teamIndex}"
                  value="${String.fromCharCode(65 + teamIndex)}${playerIndex + 1}"
                />
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>

    ${renderOrderEditor(teamNames, "teamOrderNames", "先攻 / 後攻（チーム順）")}
    ${renderOrderEditor(defaultPlayerOrderNames, "playerOrderNames", "チーム内プレイヤー順を含む投げ順")}
  `;

  bindOrderEditors(container);
}

export function renderNewMatchView(container, onCreateMatch) {
  container.innerHTML = `
    <section class="panel">
      <div class="header-row">
        <h2>新規試合</h2>
      </div>

      <div class="field-group">
        <label for="modeSelect">試合形式</label>
        <select id="modeSelect">
          <option value="${MATCH_MODE.INDIVIDUAL}">個人戦</option>
          <option value="${MATCH_MODE.TEAM}">チーム戦</option>
        </select>
      </div>

      <div id="participantFields"></div>

      <div class="field-group checkbox-row">
        <label><input type="checkbox" id="bonusTenOnFifty" /> 50点到達時 +10表示</label>
      </div>

      <div class="field-group checkbox-row">
        <label><input type="checkbox" id="continuousMatch" /> 連続試合モード</label>
      </div>

      <div class="actions">
        <button id="createMatchButton">試合開始</button>
      </div>
    </section>
  `;

  const modeSelect = container.querySelector("#modeSelect");
  const participantFields = container.querySelector("#participantFields");

  let individualCount = 2;
  let teamCount = 2;
  let playersPerTeam = 2;

  function syncFields() {
    if (modeSelect.value === MATCH_MODE.TEAM) {
      renderTeamInputs(participantFields, teamCount, playersPerTeam);

      participantFields.querySelector("#teamCountSelect")?.addEventListener("change", (event) => {
        teamCount = Number(event.target.value);
        syncFields();
      });

      participantFields.querySelector("#playersPerTeamSelect")?.addEventListener("change", (event) => {
        playersPerTeam = Number(event.target.value);
        syncFields();
      });

      return;
    }

    renderIndividualInputs(participantFields, individualCount);

    participantFields.querySelector("#playerCountSelect")?.addEventListener("change", (event) => {
      individualCount = Number(event.target.value);
      syncFields();
    });
  }

  syncFields();

  container.querySelector("#createMatchButton").addEventListener("click", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      bonusTenOnFifty: container.querySelector("#bonusTenOnFifty").checked,
      continuousMatch: container.querySelector("#continuousMatch").checked
    };

    if (modeSelect.value === MATCH_MODE.INDIVIDUAL) {
      const playerNames = Array.from(
        participantFields.querySelectorAll('input[name="playerName"]')
      )
        .map((input) => input.value.trim())
        .filter(Boolean);

      const playerOrderNames = (participantFields.querySelector('input[name="playerOrderNames"]')?.value ?? "")
        .split("|")
        .map((name) => name.trim())
        .filter(Boolean);

      onCreateMatch({
        mode: MATCH_MODE.INDIVIDUAL,
        playerNames,
        playerOrderNames,
        settings
      });
      return;
    }

    const teamNames = Array.from(
      participantFields.querySelectorAll('input[name="teamName"]')
    ).map((input) => input.value.trim());

    const teamOrderNames = (participantFields.querySelector('input[name="teamOrderNames"]')?.value ?? "")
      .split("|")
      .map((name) => name.trim())
      .filter(Boolean);

    const playerOrderNames = (participantFields.querySelector('input[name="playerOrderNames"]')?.value ?? "")
      .split("|")
      .map((name) => name.trim())
      .filter(Boolean);

    const teamInputs = teamNames.map((teamName, teamIndex) => {
      const playerNames = Array.from(
        participantFields.querySelectorAll(`input[name="teamPlayerName_${teamIndex}"]`)
      )
        .map((input) => input.value.trim())
        .filter(Boolean);

      return {
        teamName: teamName || `チーム${teamIndex + 1}`,
        playerNames
      };
    });

    onCreateMatch({
      mode: MATCH_MODE.TEAM,
      teamInputs,
      teamOrderNames,
      playerOrderNames,
      settings
    });
  });
}
