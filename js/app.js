import { BUILD_INFO } from './build-info.js';
import { avatars, ranks, units, incidents, protocolQuestions } from './data/content.js';

const SAVE_KEY = 'central190-save-v050';
const LEGACY_SAVE_KEYS = ['central190-save-v040', 'central190-save-v030', 'central190-save-v020', 'central190-save-v010'];

const dom = {
  screens: [...document.querySelectorAll('.screen')], btnNewGame: document.getElementById('btnNewGame'), btnContinue: document.getElementById('btnContinue'),
  avatarGrid: document.getElementById('avatarGrid'), selectedAvatarPreview: document.getElementById('selectedAvatarPreview'), playerName: document.getElementById('playerName'), playerCountry: document.getElementById('playerCountry'), modeSwitch: document.getElementById('modeSwitch'), btnCreateProfile: document.getElementById('btnCreateProfile'),
  lobbyAvatar: document.getElementById('lobbyAvatar'), lobbyName: document.getElementById('lobbyName'), lobbyCountry: document.getElementById('lobbyCountry'), lobbyMode: document.getElementById('lobbyMode'), lobbyXp: document.getElementById('lobbyXp'), lobbyInsignia: document.getElementById('lobbyInsignia'), lobbyRank: document.getElementById('lobbyRank'), statResolved: document.getElementById('statResolved'), statBestTime: document.getElementById('statBestTime'), statAverage: document.getElementById('statAverage'), statStreak: document.getElementById('statStreak'), historyList: document.getElementById('historyList'), rankProgressFill: document.getElementById('rankProgressFill'), rankProgressText: document.getElementById('rankProgressText'), btnStartShift: document.getElementById('btnStartShift'), btnConfig: document.getElementById('btnConfig'), btnManualStart: document.getElementById('btnManualStart'), btnResetCareer: document.getElementById('btnResetCareer'),
  shiftAvatar: document.getElementById('shiftAvatar'), shiftOperatorName: document.getElementById('shiftOperatorName'), timerValue: document.getElementById('timerValue'), incidentTitle: document.getElementById('incidentTitle'), severityBadge: document.getElementById('severityBadge'), chatLog: document.getElementById('chatLog'), questionActions: document.getElementById('questionActions'), incidentFacts: document.getElementById('incidentFacts'), miniMap: document.getElementById('miniMap'), btnBackLobby: document.getElementById('btnBackLobby'), btnOpenDispatch: document.getElementById('btnOpenDispatch'),
  dispatchDistrict: document.getElementById('dispatchDistrict'), dispatchMap: document.getElementById('dispatchMap'), unitGrid: document.getElementById('unitGrid'), btnConfirmDispatch: document.getElementById('btnConfirmDispatch'),
  resultHeadline: document.getElementById('resultHeadline'), resultScore: document.getElementById('resultScore'), feedbackList: document.getElementById('feedbackList'), btnReturnLobby: document.getElementById('btnReturnLobby'), btnEndShift: document.getElementById('btnEndShift'),
  footerVersion: document.getElementById('footerVersion'), footerDateTime: document.getElementById('footerDateTime'), footerModule: document.getElementById('footerModule'), cityChip: document.getElementById('cityChip'), shiftSelector: document.getElementById('shiftSelector'), radioFeed: document.getElementById('radioFeed')
};

const shiftProfiles = { manha: { label: 'Manhã', riskBias: -2, radio: 'Rádio: entrada escolar, fluxo intenso e travessias monitoradas.' }, tarde: { label: 'Tarde', riskBias: 0, radio: 'Rádio: comércio ativo, trânsito carregado e apoio distribuído por zona.' }, noite: { label: 'Noite', riskBias: 7, radio: 'Rádio: prioridade para roubo, bares, violência doméstica e contenção.' }, madrugada: { label: 'Madrugada', riskBias: 11, radio: 'Rádio: efetivo reduzido, baixa visibilidade e ocorrências com isolamento.' } };
const appState = { player: null, selectedAvatarId: avatars[0].id, selectedMode: 'carreira', selectedShift: 'manha', callQueue: [], activeIncident: null, selectedUnits: new Set(), askedQuestions: new Set(), timerSeconds: 0, timerHandle: null, risk: 0, triggeredEvents: new Set(), dispatchResult: null };

function formatTime(totalSeconds) { return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`; }
function getAvatarById(id) { return avatars.find((avatar) => avatar.id === id) ?? avatars[0]; }
function getRankByXp(xp = 0) { return [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0]; }
function getNextRank(xp = 0) { return ranks.find((rank) => xp < rank.minXp) ?? ranks[ranks.length - 1]; }
function normalizePlayer(player) {
  if (!player) return null;
  return {
    name: player.name || 'Operador', country: player.country || 'Brasil', mode: player.mode || 'carreira', avatarId: player.avatarId || avatars[0].id,
    xp: Number(player.xp || 0), resolved: Number(player.resolved || 0), bestTime: player.bestTime ?? null,
    history: Array.isArray(player.history) ? player.history.slice(0, 8) : [], safeStreak: Number(player.safeStreak || 0), createdAt: player.createdAt || new Date().toISOString(), preferredShift: player.preferredShift || 'manha'
  };
}
function savePlayer() { if (appState.player) localStorage.setItem(SAVE_KEY, JSON.stringify(appState.player)); }
function loadPlayer() {
  try {
    for (const key of [SAVE_KEY, ...LEGACY_SAVE_KEYS]) {
      const raw = localStorage.getItem(key);
      if (raw) return normalizePlayer(JSON.parse(raw));
    }
  } catch {}
  return null;
}
function setActiveScreen(id) { dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === `screen-${id}`)); document.getElementById('appShell').classList.toggle('home-active', id === 'home'); window.scrollTo({ top: 0, behavior: 'auto' }); }
function updateFooter() { dom.footerVersion.textContent = BUILD_INFO.version; dom.footerDateTime.textContent = `${BUILD_INFO.buildDate} • ${BUILD_INFO.buildTime}`; dom.footerModule.textContent = `Módulo base: ${BUILD_INFO.module}`; dom.cityChip.textContent = BUILD_INFO.module; }
function refreshContinueState() { dom.btnContinue.disabled = !loadPlayer(); }

function renderAvatars() { dom.avatarGrid.innerHTML = avatars.map((avatar) => `<button class="avatar-card ${avatar.id === appState.selectedAvatarId ? 'is-selected' : ''}" data-avatar-id="${avatar.id}"><img src="${avatar.src}" alt="${avatar.name}"></button>`).join(''); }
function updateSelectedAvatar() { const avatar = getAvatarById(appState.selectedAvatarId); dom.selectedAvatarPreview.src = avatar.src; [...dom.avatarGrid.querySelectorAll('.avatar-card')].forEach((card) => card.classList.toggle('is-selected', card.dataset.avatarId === appState.selectedAvatarId)); }
function renderLobby() {
  if (!appState.player) return;
  appState.player = normalizePlayer(appState.player);
  const avatar = getAvatarById(appState.player.avatarId); const rank = getRankByXp(appState.player.xp); const nextRank = getNextRank(appState.player.xp);
  dom.lobbyAvatar.src = avatar.src; dom.lobbyName.textContent = appState.player.name; dom.lobbyCountry.textContent = appState.player.country; dom.lobbyMode.textContent = appState.player.mode === 'carreira' ? 'Carreira' : 'Sandbox'; dom.lobbyXp.textContent = appState.player.xp; dom.lobbyInsignia.src = rank.insignia; dom.lobbyRank.textContent = rank.title; dom.statResolved.textContent = appState.player.resolved; dom.statBestTime.textContent = appState.player.bestTime ? formatTime(appState.player.bestTime) : '--';
  const history = appState.player.history || []; const avg = history.length ? Math.round(history.reduce((acc, item) => acc + Number(item.score || 0), 0) / history.length) : null;
  if (dom.statAverage) dom.statAverage.textContent = avg === null ? '--' : String(avg);
  if (dom.statStreak) dom.statStreak.textContent = String(appState.player.safeStreak || 0);
  if (dom.historyList) {
    dom.historyList.innerHTML = history.length ? history.slice(0, 4).map((item) => `<div class="history-row"><strong>${item.title}</strong><span>${item.score} XP • ${item.grade} • ${item.time}</span></div>`).join('') : '<div class="history-row muted-row">Nenhum relatório registrado ainda.</div>';
  }
  if (dom.rankProgressFill && dom.rankProgressText) {
    const prevMin = rank.minXp; const nextMin = Math.max(nextRank.minXp, prevMin + 1); const progress = rank === nextRank ? 100 : Math.round(((appState.player.xp - prevMin) / (nextMin - prevMin)) * 100);
    dom.rankProgressFill.style.width = `${Math.max(4, Math.min(100, progress))}%`;
    dom.rankProgressText.textContent = rank === nextRank ? 'Patente máxima da versão atual atingida.' : `${Math.max(0, nextRank.minXp - appState.player.xp)} XP para ${nextRank.title}.`;
  }
}

function pickIncidentsForShift(shiftId) {
  const filtered = incidents.filter((incident) => !incident.shiftTags || incident.shiftTags.includes(shiftId));
  const pool = filtered.length ? filtered : incidents;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}
function updateRadioFeed(text) {
  if (!dom.radioFeed) return;
  dom.radioFeed.textContent = text;
}
function setShift(shiftId) {
  appState.selectedShift = shiftProfiles[shiftId] ? shiftId : 'manha';
  if (appState.player) { appState.player.preferredShift = appState.selectedShift; savePlayer(); }
  if (dom.shiftSelector) {
    [...dom.shiftSelector.querySelectorAll('[data-shift]')].forEach((btn) => btn.classList.toggle('is-active', btn.dataset.shift === appState.selectedShift));
  }
  updateRadioFeed(shiftProfiles[appState.selectedShift].radio);
}

function resetShiftState() { appState.activeIncident = null; appState.selectedUnits = new Set(); appState.askedQuestions = new Set(); appState.timerSeconds = 0; appState.risk = 0; appState.triggeredEvents = new Set(); if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; appState.dispatchResult = null; }

function startShift() {
  resetShiftState();
  if (!appState.callQueue.length) appState.callQueue = pickIncidentsForShift(appState.selectedShift);
  appState.activeIncident = appState.callQueue.shift() || incidents[Math.floor(Math.random() * incidents.length)];
  const shift = shiftProfiles[appState.selectedShift] || shiftProfiles.manha;
  appState.risk = Math.max(0, Math.min(100, appState.activeIncident.baseRisk + shift.riskBias));
  updateRadioFeed(`${shift.radio} Fila atual: ${1 + appState.callQueue.length} ocorrência(s) em triagem.`);
  dom.shiftAvatar.src = getAvatarById(appState.player.avatarId).src;
  dom.shiftOperatorName.textContent = appState.player.name;
  dom.incidentTitle.textContent = appState.activeIncident.title;
  dom.severityBadge.textContent = appState.activeIncident.severity;
  dom.dispatchDistrict.textContent = appState.activeIncident.district;
  dom.chatLog.innerHTML = '';
  appendMessage('operator', `OPERADOR: ${appState.activeIncident.opening}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.callerOpening}`);
  appendMessage('system', 'PROTOCOLO: localização, risco imediato, vítimas e segurança do solicitante devem ser confirmados sempre que a janela operacional permitir.');
  appendMessage('system', `TURNO: ${shiftProfiles[appState.selectedShift].label}. Fila de chamadas simultâneas: ${appState.callQueue.length}. Efetivo deve ser usado com proporcionalidade.`);
  dom.incidentFacts.innerHTML = [...appState.activeIncident.facts, ...appState.activeIncident.contradictions].map((fact) => `<li>${fact}</li>`).join('');
  updateRiskMeter(); renderQuestionButtons(); renderMiniMap(); renderDispatchMap(); renderUnits();
  dom.timerValue.textContent = formatTime(0);
  appState.timerHandle = window.setInterval(tickTimer, 1000);
  setActiveScreen('shift');
}

function tickTimer() {
  appState.timerSeconds += 1; dom.timerValue.textContent = formatTime(appState.timerSeconds);
  if (appState.timerSeconds === 20) updateRadioFeed('Rádio: outra chamada entrou na fila. Priorize coleta mínima e despacho proporcional.');
  if (appState.timerSeconds === 45) updateRadioFeed('Rádio: supervisão solicita status. Evite manter unidade crítica ociosa sem necessidade.');
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
  const fill = document.getElementById('riskFill'); const readout = document.getElementById('riskReadout');
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
  const queuePressure = (appState.callQueue?.length || 0) * 2;
  let total = Math.max(0, 35 + protocolScore + timeScore + dispatchScore - riskPenalty - queuePressure);
  const grade = total >= 130 ? 'A' : total >= 100 ? 'B' : total >= 70 ? 'C' : 'D';
  const headline = total >= 130 ? 'Atuação profissional exemplar' : total >= 100 ? 'Ocorrência conduzida com segurança' : total >= 70 ? 'Resolvida com ressalvas operacionais' : 'Falhas críticas no protocolo';
  const feedback = [
    { ok: missing.length === 0 && correctSelected.length === correct.size, title: missing.length === 0 ? 'Despacho compatível com risco' : 'Despacho subdimensionado', text: `Exigido: ${incident.correctUnits.join(', ')}. Selecionado: ${[...selected].join(', ') || 'nenhum'}.` },
    { ok: idealAsked.length >= Math.min(3, incident.idealQuestions.length), title: 'Coleta de dados críticos', text: `${idealAsked.length}/${incident.idealQuestions.length} protocolos relevantes confirmados antes do despacho.` },
    { ok: appState.timerSeconds <= incident.urgencyLimit, title: 'Tempo de resposta operacional', text: `Despacho em ${formatTime(appState.timerSeconds)}. Janela ideal: até ${formatTime(incident.urgencyLimit)}.` },
    { ok: extra.length === 0, title: 'Uso proporcional de recursos', text: extra.length ? `Recurso possivelmente excessivo: ${extra.join(', ')}.` : 'Não houve sobrecarga desnecessária de recursos.' },
    { ok: appState.risk < 90 || appState.timerSeconds <= incident.urgencyLimit, title: 'Controle de agravamento', text: `Índice final de risco: ${appState.risk}/100.` },
    { ok: (appState.callQueue?.length || 0) <= 2, title: 'Gestão de fila do plantão', text: `Turno ${shiftProfiles[appState.selectedShift].label}; ${appState.callQueue?.length || 0} chamada(s) ainda aguardando triagem.` }
  ];
  return { total, feedback, headline, grade, incidentTitle: incident.title, time: formatTime(appState.timerSeconds) };
}
function renderResult() { if (!appState.dispatchResult) return; dom.resultHeadline.textContent = `${appState.dispatchResult.headline} • Nota ${appState.dispatchResult.grade}`; dom.resultScore.textContent = appState.dispatchResult.total; dom.feedbackList.innerHTML = appState.dispatchResult.feedback.map((item) => `<div class="feedback-item"><img src="${item.ok ? 'assets/icons/icon-check.png' : 'assets/icons/icon-error.png'}" alt="${item.ok ? 'Acerto' : 'Erro'}"><div><strong>${item.title}</strong><span>${item.text}</span></div></div>`).join(''); }
function finalizeDispatch() {
  if (!appState.selectedUnits.size) { appendMessage('system', 'PROTOCOLO: não é permitido finalizar sem pelo menos uma unidade ou recurso selecionado.'); setActiveScreen('dispatch'); return; }
  if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; appState.dispatchResult = buildDispatchResult();
  appState.player = normalizePlayer(appState.player); appState.player.xp += appState.dispatchResult.total; appState.player.resolved += 1;
  if (!appState.player.bestTime || appState.timerSeconds < appState.player.bestTime) appState.player.bestTime = appState.timerSeconds;
  const safe = appState.dispatchResult.grade === 'A' || appState.dispatchResult.grade === 'B'; appState.player.safeStreak = safe ? (appState.player.safeStreak || 0) + 1 : 0;
  appState.player.history = [{ title: appState.dispatchResult.incidentTitle, score: appState.dispatchResult.total, grade: appState.dispatchResult.grade, time: appState.dispatchResult.time, at: new Date().toISOString() }, ...(appState.player.history || [])].slice(0, 8);
  savePlayer(); renderLobby(); renderResult(); setActiveScreen('result');
}

function handleQuestion(id) { if (appState.askedQuestions.has(id)) return; const q = protocolQuestions.find(item => item.id === id); if (!q) return; appState.askedQuestions.add(id); appendMessage('operator', `OPERADOR: ${q.prompt}`); appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.questionReplies[id]}`); appState.risk = Math.max(0, appState.risk - (appState.activeIncident.idealQuestions.includes(id) ? 7 : 3)); updateRiskMeter(); appendMessage('system', `PROTOCOLO REGISTRADO: ${q.protocol}.`); renderQuestionButtons(); scrollChatToBottom(); }
function showConfigNotice() { setActiveScreen('config'); }
function createProfile() { const name = dom.playerName.value.trim(); if (!name) { dom.playerName.focus(); return; } appState.player = normalizePlayer({ name, country: dom.playerCountry.value, mode: appState.selectedMode, avatarId: appState.selectedAvatarId, xp: 0, resolved: 0, bestTime: null, history: [], safeStreak: 0 }); savePlayer(); refreshContinueState(); renderLobby(); setActiveScreen('lobby'); }

function attachEvents() {
  dom.btnNewGame.addEventListener('click', () => { appState.player = null; dom.playerName.value = ''; dom.playerCountry.value = 'Brasil'; appState.selectedAvatarId = avatars[0].id; appState.selectedMode = 'carreira'; renderAvatars(); updateSelectedAvatar(); [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill.dataset.mode === 'carreira')); setActiveScreen('profile'); });
  dom.btnContinue.addEventListener('click', () => { const saved = loadPlayer(); if (!saved) return; appState.player = saved; renderLobby(); setActiveScreen('lobby'); });
  dom.avatarGrid.addEventListener('click', (event) => { const card = event.target.closest('[data-avatar-id]'); if (!card) return; appState.selectedAvatarId = card.dataset.avatarId; updateSelectedAvatar(); });
  dom.modeSwitch.addEventListener('click', (event) => { const button = event.target.closest('[data-mode]'); if (!button) return; appState.selectedMode = button.dataset.mode; [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill === button)); });
  dom.btnCreateProfile.addEventListener('click', createProfile); dom.btnStartShift.addEventListener('click', startShift); dom.btnConfig.addEventListener('click', showConfigNotice); if (dom.btnManualStart) dom.btnManualStart.addEventListener('click', startShift);
  if (dom.shiftSelector) dom.shiftSelector.addEventListener('click', (event) => { const btn = event.target.closest('[data-shift]'); if (btn) setShift(btn.dataset.shift); });
  if (dom.btnResetCareer) dom.btnResetCareer.addEventListener('click', () => { if (!confirm('Resetar carreira local deste navegador?')) return; localStorage.removeItem(SAVE_KEY); LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key)); appState.player = null; refreshContinueState(); setActiveScreen('home'); });
  dom.btnBackLobby.addEventListener('click', () => { if (appState.timerHandle) clearInterval(appState.timerHandle); appState.timerHandle = null; renderLobby(); setActiveScreen('lobby'); });
  dom.btnOpenDispatch.addEventListener('click', () => setActiveScreen('dispatch')); dom.btnConfirmDispatch.addEventListener('click', finalizeDispatch);
  dom.btnReturnLobby.addEventListener('click', () => { renderLobby(); setActiveScreen('lobby'); }); dom.btnEndShift.addEventListener('click', () => setActiveScreen('home'));
  document.body.addEventListener('click', (event) => { const nav = event.target.closest('[data-nav]'); if (nav) { setActiveScreen(nav.dataset.nav); return; } const question = event.target.closest('[data-question]'); if (question) { handleQuestion(question.dataset.question); return; } const unitCard = event.target.closest('[data-unit-id]'); if (unitCard) { const { unitId } = unitCard.dataset; if (appState.selectedUnits.has(unitId)) appState.selectedUnits.delete(unitId); else appState.selectedUnits.add(unitId); renderUnits(); } });
}
function init() { updateFooter(); document.getElementById('appShell').classList.add('home-active'); renderAvatars(); updateSelectedAvatar(); refreshContinueState(); const saved = loadPlayer(); if (saved) { appState.player = saved; appState.selectedShift = saved.preferredShift || 'manha'; renderLobby(); } setShift(appState.selectedShift); attachEvents(); }
init();
