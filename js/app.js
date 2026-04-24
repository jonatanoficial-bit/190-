import { BUILD_INFO } from './build-info.js';
import { avatars, ranks, units, incidents, protocolQuestions } from './data/content.js';

const SAVE_KEY = 'central190-save-v030';
const dom = {
  screens: [...document.querySelectorAll('.screen')], btnNewGame: document.getElementById('btnNewGame'), btnContinue: document.getElementById('btnContinue'),
  avatarGrid: document.getElementById('avatarGrid'), selectedAvatarPreview: document.getElementById('selectedAvatarPreview'), playerName: document.getElementById('playerName'), playerCountry: document.getElementById('playerCountry'), modeSwitch: document.getElementById('modeSwitch'), btnCreateProfile: document.getElementById('btnCreateProfile'),
  lobbyAvatar: document.getElementById('lobbyAvatar'), lobbyName: document.getElementById('lobbyName'), lobbyCountry: document.getElementById('lobbyCountry'), lobbyMode: document.getElementById('lobbyMode'), lobbyXp: document.getElementById('lobbyXp'), lobbyInsignia: document.getElementById('lobbyInsignia'), lobbyRank: document.getElementById('lobbyRank'), statResolved: document.getElementById('statResolved'), statBestTime: document.getElementById('statBestTime'), btnStartShift: document.getElementById('btnStartShift'), btnConfig: document.getElementById('btnConfig'),
  shiftAvatar: document.getElementById('shiftAvatar'), shiftOperatorName: document.getElementById('shiftOperatorName'), timerValue: document.getElementById('timerValue'), incidentTitle: document.getElementById('incidentTitle'), severityBadge: document.getElementById('severityBadge'), chatLog: document.getElementById('chatLog'), questionActions: document.getElementById('questionActions'), incidentFacts: document.getElementById('incidentFacts'), miniMap: document.getElementById('miniMap'), btnBackLobby: document.getElementById('btnBackLobby'), btnOpenDispatch: document.getElementById('btnOpenDispatch'),
  dispatchDistrict: document.getElementById('dispatchDistrict'), dispatchMap: document.getElementById('dispatchMap'), unitGrid: document.getElementById('unitGrid'), btnConfirmDispatch: document.getElementById('btnConfirmDispatch'),
  resultHeadline: document.getElementById('resultHeadline'), resultScore: document.getElementById('resultScore'), feedbackList: document.getElementById('feedbackList'), btnReturnLobby: document.getElementById('btnReturnLobby'), btnEndShift: document.getElementById('btnEndShift'),
  footerVersion: document.getElementById('footerVersion'), footerDateTime: document.getElementById('footerDateTime'), footerModule: document.getElementById('footerModule'), cityChip: document.getElementById('cityChip')
};

const appState = { player: null, selectedAvatarId: avatars[0].id, selectedMode: 'carreira', activeIncident: null, selectedUnits: new Set(), askedQuestions: new Set(), timerSeconds: 0, timerHandle: null, risk: 0, triggeredEvents: new Set(), dispatchResult: null };

function formatTime(totalSeconds) { return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`; }
function getAvatarById(id) { return avatars.find((avatar) => avatar.id === id) ?? avatars[0]; }
function getRankByXp(xp = 0) { return [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0]; }
function savePlayer() { if (appState.player) localStorage.setItem(SAVE_KEY, JSON.stringify(appState.player)); }
function loadPlayer() { try { const raw = localStorage.getItem(SAVE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function setActiveScreen(id) { dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === `screen-${id}`)); document.getElementById('appShell').classList.toggle('home-active', id === 'home'); }
function updateFooter() { dom.footerVersion.textContent = BUILD_INFO.version; dom.footerDateTime.textContent = `${BUILD_INFO.buildDate} • ${BUILD_INFO.buildTime}`; dom.footerModule.textContent = `Módulo base: ${BUILD_INFO.module}`; dom.cityChip.textContent = BUILD_INFO.module; }
function refreshContinueState() { dom.btnContinue.disabled = !loadPlayer(); }

function renderAvatars() { dom.avatarGrid.innerHTML = avatars.map((avatar) => `<button class="avatar-card ${avatar.id === appState.selectedAvatarId ? 'is-selected' : ''}" data-avatar-id="${avatar.id}"><img src="${avatar.src}" alt="${avatar.name}"></button>`).join(''); }
function updateSelectedAvatar() { const avatar = getAvatarById(appState.selectedAvatarId); dom.selectedAvatarPreview.src = avatar.src; [...dom.avatarGrid.querySelectorAll('.avatar-card')].forEach((card) => card.classList.toggle('is-selected', card.dataset.avatarId === appState.selectedAvatarId)); }
function renderLobby() { if (!appState.player) return; const avatar = getAvatarById(appState.player.avatarId); const rank = getRankByXp(appState.player.xp); dom.lobbyAvatar.src = avatar.src; dom.lobbyName.textContent = appState.player.name; dom.lobbyCountry.textContent = appState.player.country; dom.lobbyMode.textContent = appState.player.mode === 'carreira' ? 'Carreira' : 'Sandbox'; dom.lobbyXp.textContent = appState.player.xp; dom.lobbyInsignia.src = rank.insignia; dom.lobbyRank.textContent = rank.title; dom.statResolved.textContent = appState.player.resolved; dom.statBestTime.textContent = appState.player.bestTime ? formatTime(appState.player.bestTime) : '--'; }
function resetShiftState() { appState.activeIncident = null; appState.selectedUnits = new Set(); appState.askedQuestions = new Set(); appState.timerSeconds = 0; appState.risk = 0; appState.triggeredEvents = new Set(); if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; appState.dispatchResult = null; }

function startShift() {
  resetShiftState();
  appState.activeIncident = incidents[Math.floor(Math.random() * incidents.length)];
  appState.risk = appState.activeIncident.baseRisk;
  dom.shiftAvatar.src = getAvatarById(appState.player.avatarId).src;
  dom.shiftOperatorName.textContent = appState.player.name;
  dom.incidentTitle.textContent = appState.activeIncident.title;
  dom.severityBadge.textContent = appState.activeIncident.severity;
  dom.dispatchDistrict.textContent = appState.activeIncident.district;
  dom.chatLog.innerHTML = '';
  appendMessage('operator', `OPERADOR: ${appState.activeIncident.opening}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.callerOpening}`);
  appendMessage('system', 'PROTOCOLO: confirmar localização, risco imediato, vítimas e segurança do solicitante antes de despachar, quando possível.');
  dom.incidentFacts.innerHTML = [...appState.activeIncident.facts, ...appState.activeIncident.contradictions].map((fact) => `<li>${fact}</li>`).join('');
  updateRiskMeter(); renderQuestionButtons(); renderMiniMap(); renderDispatchMap(); renderUnits();
  dom.timerValue.textContent = formatTime(0);
  appState.timerHandle = window.setInterval(tickTimer, 1000);
  setActiveScreen('shift');
}

function tickTimer() {
  appState.timerSeconds += 1; dom.timerValue.textContent = formatTime(appState.timerSeconds);
  const incident = appState.activeIncident;
  if (!incident) return;
  incident.events.forEach((event, idx) => {
    if (appState.timerSeconds >= event.at && !appState.triggeredEvents.has(idx)) {
      appState.triggeredEvents.add(idx); appState.risk = Math.min(100, appState.risk + event.risk); appendMessage(event.text.startsWith('SISTEMA') ? 'system' : 'caller', event.text); updateRiskMeter();
    }
  });
  if (appState.timerSeconds % 12 === 0) { appState.risk = Math.min(100, appState.risk + 1); updateRiskMeter(); }
}

function updateRiskMeter() {
  let fill = document.getElementById('riskFill'); let readout = document.getElementById('riskReadout');
  if (!fill || !readout) return;
  fill.style.width = `${Math.max(6, Math.min(100, appState.risk))}%`;
  readout.textContent = appState.risk >= 85 ? 'Risco crítico: decisão imediata recomendada' : appState.risk >= 70 ? 'Risco alto: coletar dados essenciais e despachar' : 'Risco moderado: triagem em andamento';
}
function scrollChatToBottom(smooth = true) { window.requestAnimationFrame(() => { dom.chatLog.scrollTo({ top: dom.chatLog.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); }); }
function appendMessage(type, text) { const node = document.createElement('div'); node.className = `message ${type}`; node.textContent = text; dom.chatLog.appendChild(node); scrollChatToBottom(); }

function getQuestionOptions() {
  const ideal = appState.activeIncident?.idealQuestions ?? [];
  const ordered = [...protocolQuestions].sort((a,b) => (ideal.includes(b.id) - ideal.includes(a.id)) || a.label.localeCompare(b.label));
  return ordered.filter((button) => !appState.askedQuestions.has(button.id)).slice(0, 2);
}
function renderQuestionButtons() { const buttons = getQuestionOptions(); dom.questionActions.innerHTML = buttons.length ? buttons.map((button) => `<button class="quick-pill" data-question="${button.id}">${button.label}</button>`).join('') : '<div class="quick-pill is-used">Perguntas essenciais esgotadas. Avalie o despacho.</div>'; }
function renderMiniMap() { dom.miniMap.innerHTML = `<div class="map-chip" style="left: 12px; top: 12px;"><img src="assets/icons/icon-radar.png" alt="Radar"><span>Monitoramento</span></div><img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="Ocorrência" style="left: 50%; top: 54%; transform: translate(-50%, -50%);"><img class="map-unit small" src="assets/units/unit-police-cruiser.png" alt="Viatura" style="left: 22%; top: 68%;"><img class="map-unit small" src="assets/units/unit-ambulance-samu.png" alt="Ambulância" style="left: 62%; top: 28%;">`; }
function renderDispatchMap() { const chips = appState.activeIncident.mapChips.map((chip, index) => `<div class="map-chip" style="left:${12 + index * 18}px; top:${14 + index * 34}px">${chip}</div>`).join(''); dom.dispatchMap.innerHTML = `${chips}<img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="Ocorrência" style="left: 52%; top: 52%; transform: translate(-50%, -50%);"><img class="map-unit" src="assets/units/unit-police-cruiser.png" alt="Viatura" style="left: 12%; top: 64%;"><img class="map-unit" src="assets/units/unit-ambulance-samu.png" alt="Ambulância" style="left: 65%; top: 15%; width:64px; height:64px;"><img class="map-unit" src="assets/units/unit-helicopter-police.png" alt="Helicóptero" style="left: 62%; top: 60%; width:76px; height:76px;">`; }
function renderUnits() { dom.unitGrid.innerHTML = units.map((unit) => `<button class="unit-card ${appState.selectedUnits.has(unit.id) ? 'is-selected' : ''}" data-unit-id="${unit.id}"><img src="${unit.src}" alt="${unit.name}"><div><strong>${unit.name}</strong><span>${unit.description}</span></div><span class="unit-toggle" aria-hidden="true"></span></button>`).join(''); }

function buildDispatchResult() {
  const incident = appState.activeIncident; const correct = new Set(incident.correctUnits); const selected = appState.selectedUnits;
  const correctSelected = [...selected].filter((id) => correct.has(id)); const missing = [...correct].filter((id) => !selected.has(id)); const extra = [...selected].filter((id) => !correct.has(id));
  const idealAsked = incident.idealQuestions.filter((id) => appState.askedQuestions.has(id)); const protocolScore = Math.round((idealAsked.length / incident.idealQuestions.length) * 40);
  const timeScore = Math.max(0, 35 - Math.max(0, appState.timerSeconds - incident.urgencyLimit)); const dispatchScore = correctSelected.length * 28 - missing.length * 32 - extra.reduce((acc,id)=> acc + (units.find(u=>u.id===id)?.weight ?? 1) * 10, 0);
  const riskPenalty = appState.risk >= 90 && appState.timerSeconds > incident.urgencyLimit ? 18 : 0;
  let total = Math.max(0, 35 + protocolScore + timeScore + dispatchScore - riskPenalty);
  const headline = total >= 130 ? 'Atuação profissional exemplar' : total >= 100 ? 'Ocorrência conduzida com segurança' : total >= 70 ? 'Resolvida com ressalvas operacionais' : 'Falhas críticas no protocolo';
  const feedback = [
    { ok: missing.length === 0 && correctSelected.length === correct.size, title: missing.length === 0 ? 'Despacho compatível com risco' : 'Despacho subdimensionado', text: `Exigido: ${incident.correctUnits.join(', ')}. Selecionado: ${[...selected].join(', ') || 'nenhum'}.` },
    { ok: idealAsked.length >= Math.min(3, incident.idealQuestions.length), title: 'Coleta de dados críticos', text: `${idealAsked.length}/${incident.idealQuestions.length} protocolos relevantes confirmados antes do despacho.` },
    { ok: appState.timerSeconds <= incident.urgencyLimit, title: 'Tempo de resposta operacional', text: `Despacho em ${formatTime(appState.timerSeconds)}. Janela ideal: até ${formatTime(incident.urgencyLimit)}.` },
    { ok: extra.length === 0, title: 'Uso proporcional de recursos', text: extra.length ? `Recurso possivelmente excessivo: ${extra.join(', ')}.` : 'Não houve sobrecarga desnecessária de recursos.' },
    { ok: appState.risk < 90 || appState.timerSeconds <= incident.urgencyLimit, title: 'Controle de agravamento', text: `Índice final de risco: ${appState.risk}/100.` }
  ];
  return { total, feedback, headline };
}
function renderResult() { if (!appState.dispatchResult) return; dom.resultHeadline.textContent = appState.dispatchResult.headline; dom.resultScore.textContent = appState.dispatchResult.total; dom.feedbackList.innerHTML = appState.dispatchResult.feedback.map((item) => `<div class="feedback-item"><img src="${item.ok ? 'assets/icons/icon-check.png' : 'assets/icons/icon-error.png'}" alt="${item.ok ? 'Acerto' : 'Erro'}"><div><strong>${item.title}</strong><span>${item.text}</span></div></div>`).join(''); }
function finalizeDispatch() { if (!appState.selectedUnits.size) { appendMessage('system', 'PROTOCOLO: não é permitido finalizar sem pelo menos uma unidade ou recurso selecionado.'); setActiveScreen('dispatch'); return; } if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; appState.dispatchResult = buildDispatchResult(); appState.player.xp += appState.dispatchResult.total; appState.player.resolved += 1; if (!appState.player.bestTime || appState.timerSeconds < appState.player.bestTime) appState.player.bestTime = appState.timerSeconds; savePlayer(); renderLobby(); renderResult(); setActiveScreen('result'); }

function handleQuestion(id) { if (appState.askedQuestions.has(id)) return; const q = protocolQuestions.find(item => item.id === id); if (!q) return; appState.askedQuestions.add(id); appendMessage('operator', `OPERADOR: ${q.prompt}`); appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.questionReplies[id]}`); appState.risk = Math.max(0, appState.risk - (appState.activeIncident.idealQuestions.includes(id) ? 7 : 3)); updateRiskMeter(); appendMessage('system', `PROTOCOLO REGISTRADO: ${q.protocol}.`); renderQuestionButtons(); scrollChatToBottom(); }
function showConfigNotice() { window.alert('Configurações entram nas próximas builds. v0.3.0 prioriza simulação ultra realista, risco dinâmico e despacho profissional.'); }
function createProfile() { const name = dom.playerName.value.trim(); if (!name) { dom.playerName.focus(); return; } appState.player = { name, country: dom.playerCountry.value, mode: appState.selectedMode, avatarId: appState.selectedAvatarId, xp: 0, resolved: 0, bestTime: null }; savePlayer(); refreshContinueState(); renderLobby(); setActiveScreen('lobby'); }

function attachEvents() {
  dom.btnNewGame.addEventListener('click', () => { appState.player = null; dom.playerName.value = ''; dom.playerCountry.value = 'Brasil'; appState.selectedAvatarId = avatars[0].id; appState.selectedMode = 'carreira'; renderAvatars(); updateSelectedAvatar(); [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill.dataset.mode === 'carreira')); setActiveScreen('profile'); });
  dom.btnContinue.addEventListener('click', () => { const saved = loadPlayer(); if (!saved) return; appState.player = saved; renderLobby(); setActiveScreen('lobby'); });
  dom.avatarGrid.addEventListener('click', (event) => { const card = event.target.closest('[data-avatar-id]'); if (!card) return; appState.selectedAvatarId = card.dataset.avatarId; updateSelectedAvatar(); });
  dom.modeSwitch.addEventListener('click', (event) => { const button = event.target.closest('[data-mode]'); if (!button) return; appState.selectedMode = button.dataset.mode; [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill === button)); });
  dom.btnCreateProfile.addEventListener('click', createProfile); dom.btnStartShift.addEventListener('click', startShift); dom.btnConfig.addEventListener('click', showConfigNotice);
  dom.btnBackLobby.addEventListener('click', () => { if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; renderLobby(); setActiveScreen('lobby'); });
  dom.btnOpenDispatch.addEventListener('click', () => setActiveScreen('dispatch')); dom.btnConfirmDispatch.addEventListener('click', finalizeDispatch);
  dom.btnReturnLobby.addEventListener('click', () => { renderLobby(); setActiveScreen('lobby'); }); dom.btnEndShift.addEventListener('click', () => setActiveScreen('home'));
  document.body.addEventListener('click', (event) => { const nav = event.target.closest('[data-nav]'); if (nav) { setActiveScreen(nav.dataset.nav); return; } const question = event.target.closest('[data-question]'); if (question) { handleQuestion(question.dataset.question); return; } const unitCard = event.target.closest('[data-unit-id]'); if (unitCard) { const { unitId } = unitCard.dataset; if (appState.selectedUnits.has(unitId)) appState.selectedUnits.delete(unitId); else appState.selectedUnits.add(unitId); renderUnits(); } });
}
function init() { updateFooter(); document.getElementById('appShell').classList.add('home-active'); renderAvatars(); updateSelectedAvatar(); refreshContinueState(); const saved = loadPlayer(); if (saved) { appState.player = saved; renderLobby(); } attachEvents(); }
init();
