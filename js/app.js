import { BUILD_INFO } from './build-info.js';
import { avatars, ranks, units, incidents } from './data/content.js';

const SAVE_KEY = 'central190-save-v010';
const dom = {
  screens: [...document.querySelectorAll('.screen')],
  btnNewGame: document.getElementById('btnNewGame'),
  btnContinue: document.getElementById('btnContinue'),
  avatarGrid: document.getElementById('avatarGrid'),
  selectedAvatarPreview: document.getElementById('selectedAvatarPreview'),
  playerName: document.getElementById('playerName'),
  playerCountry: document.getElementById('playerCountry'),
  modeSwitch: document.getElementById('modeSwitch'),
  btnCreateProfile: document.getElementById('btnCreateProfile'),
  lobbyAvatar: document.getElementById('lobbyAvatar'),
  lobbyName: document.getElementById('lobbyName'),
  lobbyCountry: document.getElementById('lobbyCountry'),
  lobbyMode: document.getElementById('lobbyMode'),
  lobbyXp: document.getElementById('lobbyXp'),
  lobbyInsignia: document.getElementById('lobbyInsignia'),
  lobbyRank: document.getElementById('lobbyRank'),
  statResolved: document.getElementById('statResolved'),
  statBestTime: document.getElementById('statBestTime'),
  btnStartShift: document.getElementById('btnStartShift'),
  btnConfig: document.getElementById('btnConfig'),
  shiftAvatar: document.getElementById('shiftAvatar'),
  shiftOperatorName: document.getElementById('shiftOperatorName'),
  timerValue: document.getElementById('timerValue'),
  incidentTitle: document.getElementById('incidentTitle'),
  severityBadge: document.getElementById('severityBadge'),
  chatLog: document.getElementById('chatLog'),
  questionActions: document.getElementById('questionActions'),
  incidentFacts: document.getElementById('incidentFacts'),
  miniMap: document.getElementById('miniMap'),
  btnBackLobby: document.getElementById('btnBackLobby'),
  btnOpenDispatch: document.getElementById('btnOpenDispatch'),
  dispatchDistrict: document.getElementById('dispatchDistrict'),
  dispatchMap: document.getElementById('dispatchMap'),
  unitGrid: document.getElementById('unitGrid'),
  btnConfirmDispatch: document.getElementById('btnConfirmDispatch'),
  resultHeadline: document.getElementById('resultHeadline'),
  resultScore: document.getElementById('resultScore'),
  feedbackList: document.getElementById('feedbackList'),
  btnReturnLobby: document.getElementById('btnReturnLobby'),
  btnEndShift: document.getElementById('btnEndShift'),
  footerVersion: document.getElementById('footerVersion'),
  footerDateTime: document.getElementById('footerDateTime'),
  footerModule: document.getElementById('footerModule'),
  cityChip: document.getElementById('cityChip')
};

const appState = {
  player: null,
  selectedAvatarId: avatars[0].id,
  selectedMode: 'carreira',
  activeIncident: null,
  selectedUnits: new Set(),
  askedQuestions: new Set(),
  timerSeconds: 0,
  timerHandle: null,
  dispatchResult: null
};

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function getAvatarById(id) {
  return avatars.find((avatar) => avatar.id === id) ?? avatars[0];
}

function getRankByXp(xp = 0) {
  return [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0];
}

function savePlayer() {
  if (!appState.player) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(appState.player));
}

function loadPlayer() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveScreen(id) {
  dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === `screen-${id}`));
}

function updateFooter() {
  dom.footerVersion.textContent = BUILD_INFO.version;
  dom.footerDateTime.textContent = `${BUILD_INFO.buildDate} • ${BUILD_INFO.buildTime}`;
  dom.footerModule.textContent = `Módulo base: ${BUILD_INFO.module}`;
  dom.cityChip.textContent = BUILD_INFO.module;
}

function refreshContinueState() {
  dom.btnContinue.disabled = !loadPlayer();
}

function renderAvatars() {
  dom.avatarGrid.innerHTML = avatars.map((avatar) => `
    <button class="avatar-card ${avatar.id === appState.selectedAvatarId ? 'is-selected' : ''}" data-avatar-id="${avatar.id}">
      <img src="${avatar.src}" alt="${avatar.name}">
    </button>
  `).join('');
}

function updateSelectedAvatar() {
  const avatar = getAvatarById(appState.selectedAvatarId);
  dom.selectedAvatarPreview.src = avatar.src;
  [...dom.avatarGrid.querySelectorAll('.avatar-card')].forEach((card) => {
    card.classList.toggle('is-selected', card.dataset.avatarId === appState.selectedAvatarId);
  });
}

function renderLobby() {
  if (!appState.player) return;
  const avatar = getAvatarById(appState.player.avatarId);
  const rank = getRankByXp(appState.player.xp);
  dom.lobbyAvatar.src = avatar.src;
  dom.lobbyName.textContent = appState.player.name;
  dom.lobbyCountry.textContent = appState.player.country;
  dom.lobbyMode.textContent = appState.player.mode === 'carreira' ? 'Carreira' : 'Sandbox';
  dom.lobbyXp.textContent = appState.player.xp;
  dom.lobbyInsignia.src = rank.insignia;
  dom.lobbyRank.textContent = rank.title;
  dom.statResolved.textContent = appState.player.resolved;
  dom.statBestTime.textContent = appState.player.bestTime ? formatTime(appState.player.bestTime) : '--';
}

function resetShiftState() {
  appState.activeIncident = null;
  appState.selectedUnits = new Set();
  appState.askedQuestions = new Set();
  appState.timerSeconds = 0;
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
  appState.dispatchResult = null;
}

function startShift() {
  resetShiftState();
  appState.activeIncident = incidents[Math.floor(Math.random() * incidents.length)];
  dom.shiftAvatar.src = getAvatarById(appState.player.avatarId).src;
  dom.shiftOperatorName.textContent = appState.player.name;
  dom.incidentTitle.textContent = appState.activeIncident.title;
  dom.severityBadge.textContent = appState.activeIncident.severity;
  dom.dispatchDistrict.textContent = appState.activeIncident.district;

  dom.chatLog.innerHTML = '';
  appendMessage('operator', `OPERADOR: ${appState.activeIncident.opening}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.callerOpening}`);

  dom.incidentFacts.innerHTML = appState.activeIncident.facts.map((fact) => `<li>${fact}</li>`).join('');
  renderQuestionButtons();
  renderMiniMap();
  renderDispatchMap();
  renderUnits();

  dom.timerValue.textContent = formatTime(0);
  appState.timerHandle = window.setInterval(() => {
    appState.timerSeconds += 1;
    dom.timerValue.textContent = formatTime(appState.timerSeconds);
  }, 1000);

  setActiveScreen('shift');
}

function appendMessage(type, text) {
  const node = document.createElement('div');
  node.className = `message ${type}`;
  node.textContent = text;
  dom.chatLog.appendChild(node);
  window.requestAnimationFrame(() => {
    dom.chatLog.scrollTop = dom.chatLog.scrollHeight;
    node.scrollIntoView({ block: 'end', behavior: 'smooth' });
  });
}


function renderQuestionButtons() {
  const buttons = [
    { id: 'location', label: 'Perguntar localização exata' },
    { id: 'victims', label: 'Perguntar sobre vítimas' },
    { id: 'weapon', label: 'Perguntar sobre arma / ameaça' }
  ];
  dom.questionActions.innerHTML = buttons.map((button) => `
    <button class="quick-pill ${appState.askedQuestions.has(button.id) ? 'is-used' : ''}" data-question="${button.id}">${button.label}</button>
  `).join('');
}

function renderMiniMap() {
  dom.miniMap.innerHTML = `
    <div class="map-chip" style="left: 12px; top: 12px;"><img src="assets/icons/icon-radar.png" alt="Radar"><span>Zona monitorada</span></div>
    <img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="Ocorrência" style="left: 50%; top: 54%; transform: translate(-50%, -50%);">
    <img class="map-unit small" src="assets/units/unit-police-cruiser.png" alt="Viatura" style="left: 22%; top: 68%;">
    <img class="map-unit small" src="assets/units/unit-ambulance-samu.png" alt="Ambulância" style="left: 62%; top: 28%;">
  `;
}

function renderDispatchMap() {
  const chips = appState.activeIncident.mapChips
    .map((chip, index) => `<div class="map-chip" style="left:${12 + index * 18}px; top:${14 + index * 34}px">${chip}</div>`)
    .join('');
  dom.dispatchMap.innerHTML = `
    ${chips}
    <img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="Ocorrência" style="left: 52%; top: 52%; transform: translate(-50%, -50%);">
    <img class="map-unit" src="assets/units/unit-police-cruiser.png" alt="Viatura" style="left: 12%; top: 64%;">
    <img class="map-unit" src="assets/units/unit-ambulance-samu.png" alt="Ambulância" style="left: 65%; top: 15%; width:64px; height:64px;">
    <img class="map-unit" src="assets/units/unit-helicopter-police.png" alt="Helicóptero" style="left: 62%; top: 60%; width:76px; height:76px;">
  `;
}

function renderUnits() {
  dom.unitGrid.innerHTML = units.map((unit) => `
    <button class="unit-card ${appState.selectedUnits.has(unit.id) ? 'is-selected' : ''}" data-unit-id="${unit.id}">
      <img src="${unit.src}" alt="${unit.name}">
      <div>
        <strong>${unit.name}</strong>
        <span>${unit.description}</span>
      </div>
      <span class="unit-toggle" aria-hidden="true"></span>
    </button>
  `).join('');
}

function buildDispatchResult() {
  const correct = new Set(appState.activeIncident.correctUnits);
  const selected = appState.selectedUnits;
  const correctSelected = [...selected].filter((id) => correct.has(id));
  const missing = [...correct].filter((id) => !selected.has(id));
  const extra = [...selected].filter((id) => !correct.has(id));
  const questionScore = Math.min(appState.askedQuestions.size, 3) * 10;
  const timeBonus = Math.max(0, 40 - appState.timerSeconds);
  let total = 70 + questionScore + timeBonus + correctSelected.length * 25 - missing.length * 25 - extra.length * 10;
  total = Math.max(total, 0);

  const feedback = [
    {
      ok: correctSelected.length === correct.size,
      title: correctSelected.length === correct.size ? 'Despacho principal correto' : 'Despacho incompleto ou incorreto',
      text: `Unidades corretas exigidas: ${appState.activeIncident.correctUnits.join(', ')}.`
    },
    {
      ok: appState.askedQuestions.size >= 2,
      title: appState.askedQuestions.size >= 2 ? 'Coleta de informações eficiente' : 'Coleta de dados abaixo do ideal',
      text: `${appState.askedQuestions.size} pergunta(s) estratégica(s) realizada(s).`
    },
    {
      ok: appState.timerSeconds <= 25,
      title: appState.timerSeconds <= 25 ? 'Resposta rápida do operador' : 'Tempo de resposta acima do ideal',
      text: `Despacho finalizado em ${formatTime(appState.timerSeconds)}.`
    }
  ];

  return {
    total,
    feedback,
    headline: total >= 120 ? 'Atuação de alto nível' : total >= 90 ? 'Missão bem conduzida' : 'Ocorrência resolvida com ressalvas'
  };
}

function renderResult() {
  if (!appState.dispatchResult) return;
  dom.resultHeadline.textContent = appState.dispatchResult.headline;
  dom.resultScore.textContent = appState.dispatchResult.total;
  dom.feedbackList.innerHTML = appState.dispatchResult.feedback.map((item) => `
    <div class="feedback-item">
      <img src="${item.ok ? 'assets/icons/icon-check.png' : 'assets/icons/icon-error.png'}" alt="${item.ok ? 'Acerto' : 'Erro'}">
      <div>
        <strong>${item.title}</strong>
        <span>${item.text}</span>
      </div>
    </div>
  `).join('');
}

function finalizeDispatch() {
  if (!appState.selectedUnits.size) {
    appendMessage('system', 'Selecione pelo menos uma unidade antes de finalizar o despacho.');
    setActiveScreen('dispatch');
    return;
  }
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
  appState.dispatchResult = buildDispatchResult();
  appState.player.xp += appState.dispatchResult.total;
  appState.player.resolved += 1;
  if (!appState.player.bestTime || appState.timerSeconds < appState.player.bestTime) {
    appState.player.bestTime = appState.timerSeconds;
  }
  savePlayer();
  renderLobby();
  renderResult();
  setActiveScreen('result');
}

function handleQuestion(id) {
  if (appState.askedQuestions.has(id)) return;
  appState.askedQuestions.add(id);
  appendMessage('operator', `OPERADOR: ${questionPrompts[id]}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.questionReplies[id]}`);
  renderQuestionButtons();
}

const questionPrompts = {
  location: 'Confirme sua localização exata e algum ponto de referência.',
  victims: 'Há vítimas, feridos ou alguém preso no local?',
  weapon: 'O suspeito tem arma ou há algum risco adicional imediato?'
};

function showConfigNotice() {
  window.alert('Configurações entram na próxima build. Nesta versão já estão prontas a estrutura, a navegação e os assets principais.');
}

function createProfile() {
  const name = dom.playerName.value.trim();
  if (!name) {
    dom.playerName.focus();
    return;
  }
  appState.player = {
    name,
    country: dom.playerCountry.value,
    mode: appState.selectedMode,
    avatarId: appState.selectedAvatarId,
    xp: 0,
    resolved: 0,
    bestTime: null
  };
  savePlayer();
  refreshContinueState();
  renderLobby();
  setActiveScreen('lobby');
}

function attachEvents() {
  dom.btnNewGame.addEventListener('click', () => {
    appState.player = null;
    dom.playerName.value = '';
    dom.playerCountry.value = 'Brasil';
    appState.selectedAvatarId = avatars[0].id;
    appState.selectedMode = 'carreira';
    renderAvatars();
    updateSelectedAvatar();
    [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill.dataset.mode === 'carreira'));
    setActiveScreen('profile');
  });

  dom.btnContinue.addEventListener('click', () => {
    const saved = loadPlayer();
    if (!saved) return;
    appState.player = saved;
    renderLobby();
    setActiveScreen('lobby');
  });

  dom.avatarGrid.addEventListener('click', (event) => {
    const card = event.target.closest('[data-avatar-id]');
    if (!card) return;
    appState.selectedAvatarId = card.dataset.avatarId;
    updateSelectedAvatar();
  });

  dom.modeSwitch.addEventListener('click', (event) => {
    const button = event.target.closest('[data-mode]');
    if (!button) return;
    appState.selectedMode = button.dataset.mode;
    [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill === button));
  });

  dom.btnCreateProfile.addEventListener('click', createProfile);
  dom.btnStartShift.addEventListener('click', startShift);
  dom.btnConfig.addEventListener('click', showConfigNotice);
  dom.btnBackLobby.addEventListener('click', () => {
    if (appState.timerHandle) clearInterval(appState.timerHandle);
    appState.timerHandle = null;
    renderLobby();
    setActiveScreen('lobby');
  });
  dom.btnOpenDispatch.addEventListener('click', () => setActiveScreen('dispatch'));
  dom.btnConfirmDispatch.addEventListener('click', finalizeDispatch);
  dom.btnReturnLobby.addEventListener('click', () => {
    renderLobby();
    setActiveScreen('lobby');
  });
  dom.btnEndShift.addEventListener('click', () => setActiveScreen('home'));

  document.body.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-nav]');
    if (nav) {
      setActiveScreen(nav.dataset.nav);
      return;
    }

    const question = event.target.closest('[data-question]');
    if (question) {
      handleQuestion(question.dataset.question);
      return;
    }

    const unitCard = event.target.closest('[data-unit-id]');
    if (unitCard) {
      const { unitId } = unitCard.dataset;
      if (appState.selectedUnits.has(unitId)) appState.selectedUnits.delete(unitId);
      else appState.selectedUnits.add(unitId);
      renderUnits();
    }
  });
}

function init() {
  updateFooter();
  renderAvatars();
  updateSelectedAvatar();
  refreshContinueState();
  const saved = loadPlayer();
  if (saved) {
    appState.player = saved;
    renderLobby();
  }
  attachEvents();
}

init();
