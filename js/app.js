import { BUILD_INFO } from './build-info.js';
import { avatars as baseAvatars, ranks as baseRanks, units as baseUnits, incidents as baseIncidents, protocolQuestions as baseProtocolQuestions } from './data/content.js';
import { validateGameContent } from './core/content-validator.js';
import { SafeSaveManager, SAVE_KEYS, normalizePlayer } from './core/save-manager.js';
import { escapeHtml } from './core/utils.js';
import { installRuntimeGuard } from './core/runtime-guard.js';
import { downloadDiagnosticReport, runDiagnostics } from './core/diagnostics.js';
import { I18nManager } from './core/i18n.js';
import { SUPPORTED_LOCALES, TRANSLATIONS } from './i18n/translations.js';
import { localizeGameContent, validateContentTranslations } from './i18n/content-translations.js';

const VALID_SCREENS = new Set(['home', 'profile', 'lobby', 'shift', 'dispatch', 'manual', 'config', 'result']);
const REQUIRED_DOM_IDS = [
  'appShell', 'btnNewGame', 'btnContinue', 'avatarGrid', 'playerName', 'btnCreateProfile',
  'btnStartShift', 'chatLog', 'questionActions', 'incidentFacts', 'dispatchMap', 'unitGrid',
  'btnConfirmDispatch', 'feedbackList', 'footerVersion', 'footerDateTime', 'footerModule'
];

const baseContent = Object.freeze({ avatars: baseAvatars, ranks: baseRanks, units: baseUnits, incidents: baseIncidents, protocolQuestions: baseProtocolQuestions });
const i18n = new I18nManager({ translations: TRANSLATIONS, supportedLocales: SUPPORTED_LOCALES, defaultLocale: 'pt-BR' });
const t = (key, values = {}, fallback = '') => i18n.t(key, values, fallback);
let { avatars, ranks, units, incidents, protocolQuestions } = localizeGameContent(baseContent, i18n.locale);
const contentReport = validateGameContent(baseContent);
const localeReport = validateContentTranslations(baseContent, SUPPORTED_LOCALES);
const saveContext = {
  avatarIds: new Set(baseAvatars.map((item) => item.id)),
  incidentIds: new Set(baseIncidents.map((item) => item.id)),
  unitIds: new Set(baseUnits.map((item) => item.id)),
  questionIds: new Set(baseProtocolQuestions.map((item) => item.id))
};
const saveManager = new SafeSaveManager({
  appVersion: BUILD_INFO.version,
  schemaVersion: BUILD_INFO.saveSchema,
  context: saveContext,
  translate: t
});

const dom = {
  appShell: document.getElementById('appShell'),
  screens: [...document.querySelectorAll('.screen')],
  btnNewGame: document.getElementById('btnNewGame'),
  btnContinue: document.getElementById('btnContinue'),
  btnFullscreen: document.getElementById('btnFullscreen'),
  languageSelector: document.getElementById('languageSelector'),
  configLanguageSelector: document.getElementById('configLanguageSelector'),
  systemHealthChip: document.getElementById('systemHealthChip'),
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
  statAverage: document.getElementById('statAverage'),
  statStreak: document.getElementById('statStreak'),
  historyList: document.getElementById('historyList'),
  rankProgressFill: document.getElementById('rankProgressFill'),
  rankProgressText: document.getElementById('rankProgressText'),
  btnStartShift: document.getElementById('btnStartShift'),
  btnConfig: document.getElementById('btnConfig'),
  btnManualStart: document.getElementById('btnManualStart'),
  btnResetCareer: document.getElementById('btnResetCareer'),
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
  btnLargeText: document.getElementById('btnLargeText'),
  btnHighContrast: document.getElementById('btnHighContrast'),
  btnReduceMotion: document.getElementById('btnReduceMotion'),
  btnInstallApp: document.getElementById('btnInstallApp'),
  cityChip: document.getElementById('cityChip'),
  shiftSelector: document.getElementById('shiftSelector'),
  radioFeed: document.getElementById('radioFeed'),
  configBuildTitle: document.getElementById('configBuildTitle'),
  configBuildMeta: document.getElementById('configBuildMeta'),
  diagnosticSummary: document.getElementById('diagnosticSummary'),
  diagnosticList: document.getElementById('diagnosticList'),
  btnRunDiagnostics: document.getElementById('btnRunDiagnostics'),
  btnExportDiagnostics: document.getElementById('btnExportDiagnostics'),
  btnRestoreBackup: document.getElementById('btnRestoreBackup'),
  toast: document.getElementById('systemToast')
};

const shiftRiskBias = Object.freeze({ manha: -2, tarde: 0, noite: 7, madrugada: 11 });

function shiftProfile(id = appState?.selectedShift || 'manha') {
  const key = Object.prototype.hasOwnProperty.call(shiftRiskBias, id) ? id : 'manha';
  const keys = {
    manha: ['shifts.morning','shifts.morningRadio'],
    tarde: ['shifts.afternoon','shifts.afternoonRadio'],
    noite: ['shifts.night','shifts.nightRadio'],
    madrugada: ['shifts.dawn','shifts.dawnRadio']
  }[key];
  return { id: key, label: t(keys[0]), radio: t(keys[1]), riskBias: shiftRiskBias[key] };
}

const appState = {
  player: null,
  selectedAvatarId: avatars[0]?.id,
  selectedMode: 'carreira',
  selectedShift: 'manha',
  callQueue: [],
  activeIncident: null,
  selectedUnits: new Set(),
  askedQuestions: new Set(),
  timerSeconds: 0,
  timerHandle: null,
  risk: 0,
  triggeredEvents: new Set(),
  dispatchResult: null,
  activeScreen: 'home',
  lastDiagnostic: null,
  bootWarnings: []
};

let toastHandle = null;
let runtimeGuard;
let deferredInstallPrompt = null;
const ACCESSIBILITY_KEY = 'central190_accessibility_v090';
const accessibilityPrefs = loadAccessibilityPrefs();


function loadAccessibilityPrefs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCESSIBILITY_KEY) || '{}');
    return {
      largeText: Boolean(parsed.largeText),
      highContrast: Boolean(parsed.highContrast),
      reduceMotion: Boolean(parsed.reduceMotion)
    };
  } catch {
    return { largeText: false, highContrast: false, reduceMotion: false };
  }
}

function saveAccessibilityPrefs() {
  try { localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(accessibilityPrefs)); } catch {}
}

function applyAccessibilityPrefs({ announce = false } = {}) {
  document.documentElement.classList.toggle('pref-large-text', accessibilityPrefs.largeText);
  document.documentElement.classList.toggle('pref-high-contrast', accessibilityPrefs.highContrast);
  document.documentElement.classList.toggle('pref-reduce-motion', accessibilityPrefs.reduceMotion);
  dom.btnLargeText?.classList.toggle('is-selected', accessibilityPrefs.largeText);
  dom.btnHighContrast?.classList.toggle('is-selected', accessibilityPrefs.highContrast);
  dom.btnReduceMotion?.classList.toggle('is-selected', accessibilityPrefs.reduceMotion);
  dom.btnLargeText?.setAttribute('aria-pressed', String(accessibilityPrefs.largeText));
  dom.btnHighContrast?.setAttribute('aria-pressed', String(accessibilityPrefs.highContrast));
  dom.btnReduceMotion?.setAttribute('aria-pressed', String(accessibilityPrefs.reduceMotion));
  saveAccessibilityPrefs();
  updateViewportHeight();
  if (announce) notify(t('accessibility.changed'), 'success');
}

function toggleAccessibilityPref(key) {
  accessibilityPrefs[key] = !accessibilityPrefs[key];
  applyAccessibilityPrefs({ announce: true });
}

function updateInstallButton() {
  if (!dom.btnInstallApp) return;
  const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone;
  dom.btnInstallApp.disabled = Boolean(standalone) || (!deferredInstallPrompt && !('serviceWorker' in navigator));
  dom.btnInstallApp.classList.toggle('is-selected', Boolean(standalone));
  dom.btnInstallApp.textContent = standalone ? t('accessibility.installed') : t('accessibility.install');
}

async function promptInstallApp() {
  if (!deferredInstallPrompt) {
    notify(t('accessibility.installHint'), 'warning');
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice.catch(() => null);
  deferredInstallPrompt = null;
  updateInstallButton();
}

function countryLabel(code) { return t(`countries.${code}`, {}, code); }
function modeLabel(mode) { return t(`modes.${mode}`, {}, mode); }
function getIncidentById(id) { return incidents.find((item) => item.id === id); }

function syncLanguageControls() {
  [dom.languageSelector, dom.configLanguageSelector].forEach((select) => { if (select) select.value = i18n.locale; });
}

function relocalizeContent() {
  const activeId = appState.activeIncident?.id;
  const queueIds = appState.callQueue.map((item) => item.id);
  ({ avatars, ranks, units, incidents, protocolQuestions } = localizeGameContent(baseContent, i18n.locale));
  if (activeId) appState.activeIncident = getIncidentById(activeId) || null;
  appState.callQueue = queueIds.map(getIncidentById).filter(Boolean);
}

function applyLocale(locale, { persist = true, announce = false } = {}) {
  i18n.setLocale(locale, { persist });
  relocalizeContent();
  i18n.applyDocument(document);
  syncLanguageControls();
  updateFooter();
  refreshContinueState();
  renderAvatars();
  updateSelectedAvatar();
  if (appState.player) {
    appState.player.language = i18n.locale;
    renderLobby();
    if (appState.activeIncident) prepareIncidentView({ restored: true });
    if (appState.dispatchResult) {
      appState.dispatchResult = buildDispatchResult();
      renderResult();
    }
    if (persist) persistGame({ includeSession: Boolean(appState.activeIncident) });
  }
  setShift(appState.selectedShift, { persist: false });
  refreshDiagnostics();
  updateInstallButton();
  applyAccessibilityPrefs({ announce: false });
  if (announce) notify(t('language.changed'), 'success');
}


function notify(message, tone = 'info') {
  if (!dom.toast) return;
  dom.toast.textContent = message;
  dom.toast.dataset.tone = tone;
  dom.toast.hidden = false;
  clearTimeout(toastHandle);
  toastHandle = window.setTimeout(() => { dom.toast.hidden = true; }, 4200);
}

function updateViewportHeight() {
  const height = Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight);
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}

function resetScreenScroll(id) {
  const inner = document.getElementById(`screen-${id}`)?.querySelector('.screen-inner');
  if (inner) inner.scrollTop = 0;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  try {
    const registration = await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(BUILD_INFO.buildId)}`);
    registration.update().catch(() => {});
  } catch (error) {
    runtimeGuard?.record('service-worker', error.message);
  }
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.trunc(Number(totalSeconds) || 0));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function getAvatarById(id) {
  return avatars.find((avatar) => avatar.id === id) ?? avatars[0];
}

function getRankByXp(xp = 0) {
  return [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0];
}

function getNextRank(xp = 0) {
  return ranks.find((rank) => xp < rank.minXp) ?? ranks[ranks.length - 1];
}

function buildSessionCheckpoint(screen = appState.activeScreen) {
  if (!appState.player || !appState.activeIncident || !['shift', 'dispatch'].includes(screen)) return null;
  return {
    screen,
    incidentId: appState.activeIncident.id,
    callQueueIds: appState.callQueue.map((item) => item.id),
    selectedUnitIds: [...appState.selectedUnits],
    askedQuestionIds: [...appState.askedQuestions],
    timerSeconds: appState.timerSeconds,
    risk: appState.risk,
    triggeredEvents: [...appState.triggeredEvents],
    selectedShift: appState.selectedShift,
    savedAt: new Date().toISOString()
  };
}

function persistGame({ includeSession = true, createRecovery = false } = {}) {
  if (!appState.player) return false;
  try {
    appState.player.language = i18n.locale;
    saveManager.save({ player: appState.player, session: includeSession ? buildSessionCheckpoint() : null }, { createRecovery });
    return true;
  } catch (error) {
    runtimeGuard?.record('save-failure', error.message);
    notify(t('notifications.saveFailure'), 'danger');
    return false;
  }
}

function loadGame() {
  try {
    const loaded = saveManager.load();
    appState.bootWarnings = loaded.warnings || [];
    return loaded;
  } catch (error) {
    runtimeGuard?.record('load-failure', error.message);
    return { player: null, session: null, source: 'none', warnings: [error.message] };
  }
}

function clearActiveSession({ persist = true } = {}) {
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
  appState.activeIncident = null;
  appState.callQueue = [];
  appState.selectedUnits = new Set();
  appState.askedQuestions = new Set();
  appState.triggeredEvents = new Set();
  appState.timerSeconds = 0;
  appState.risk = 0;
  appState.dispatchResult = null;
  if (persist && appState.player) persistGame({ includeSession: false });
}

function setActiveScreen(id, { checkpoint = true } = {}) {
  const safeId = VALID_SCREENS.has(id) ? id : (appState.player ? 'lobby' : 'home');
  if (safeId !== id) runtimeGuard?.record('invalid-screen', id);
  appState.activeScreen = safeId;
  dom.screens.forEach((screen) => screen.classList.toggle('is-active', screen.id === `screen-${safeId}`));
  dom.appShell.classList.toggle('home-active', safeId === 'home');
  dom.appShell.dataset.screen = safeId;
  resetScreenScroll(safeId);
  if (safeId === 'shift') scrollChatToBottom(false);
  if (checkpoint && ['shift', 'dispatch'].includes(safeId)) persistGame({ includeSession: true });
}

function updateFooter() {
  const phase = t('build.phase', {}, BUILD_INFO.phase);
  const module = t('build.module', {}, BUILD_INFO.module);
  dom.footerVersion.textContent = BUILD_INFO.version;
  dom.footerDateTime.textContent = `${BUILD_INFO.buildDate} • ${BUILD_INFO.buildTime}`;
  dom.footerModule.textContent = t('meta.phaseModule', { phase, module });
  dom.cityChip.textContent = t('common.city');
  document.title = `Central 190 • Build ${BUILD_INFO.version}`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description', { version: BUILD_INFO.version, module }));
  if (dom.configBuildTitle) dom.configBuildTitle.textContent = `Central 190 ${BUILD_INFO.version}`;
  if (dom.configBuildMeta) dom.configBuildMeta.textContent = `${phase} • ${module} • ${BUILD_INFO.buildDate} • ${BUILD_INFO.buildTime} • ${BUILD_INFO.buildId}`;
}

function refreshContinueState() {
  const loaded = loadGame();
  dom.btnContinue.disabled = !loaded.player;
  dom.btnContinue.textContent = loaded.session ? t('home.continueShift') : t('common.continue');
}

function renderAvatars() {
  dom.avatarGrid.innerHTML = avatars.map((avatar) => `<button class="avatar-card ${avatar.id === appState.selectedAvatarId ? 'is-selected' : ''}" data-avatar-id="${escapeHtml(avatar.id)}" aria-label="${escapeHtml(t('profile.selectAvatar', { name: avatar.name }))}"><img src="${escapeHtml(avatar.src)}" alt="${escapeHtml(avatar.name)}"></button>`).join('');
}

function updateSelectedAvatar() {
  const avatar = getAvatarById(appState.selectedAvatarId);
  dom.selectedAvatarPreview.src = avatar.src;
  dom.selectedAvatarPreview.alt = avatar.name;
  [...dom.avatarGrid.querySelectorAll('.avatar-card')].forEach((card) => card.classList.toggle('is-selected', card.dataset.avatarId === appState.selectedAvatarId));
}

function renderLobby() {
  if (!appState.player) return;
  appState.player = normalizePlayer(appState.player, saveContext);
  const avatar = getAvatarById(appState.player.avatarId);
  const rank = getRankByXp(appState.player.xp);
  const nextRank = getNextRank(appState.player.xp);
  dom.lobbyAvatar.src = avatar.src;
  dom.lobbyAvatar.alt = avatar.name;
  dom.lobbyName.textContent = appState.player.name;
  dom.lobbyCountry.textContent = countryLabel(appState.player.country);
  dom.lobbyMode.textContent = modeLabel(appState.player.mode);
  dom.lobbyXp.textContent = appState.player.xp;
  dom.lobbyInsignia.src = rank.insignia;
  dom.lobbyInsignia.alt = rank.title;
  dom.lobbyRank.textContent = rank.title;
  dom.statResolved.textContent = appState.player.resolved;
  dom.statBestTime.textContent = appState.player.bestTime ? formatTime(appState.player.bestTime) : '--';
  const history = appState.player.history || [];
  const average = history.length ? Math.round(history.reduce((acc, item) => acc + Number(item.score || 0), 0) / history.length) : null;
  dom.statAverage.textContent = average === null ? '--' : String(average);
  dom.statStreak.textContent = String(appState.player.safeStreak || 0);
  dom.historyList.innerHTML = history.length
    ? history.slice(0, 4).map((item) => { const title = getIncidentById(item.incidentId)?.title || item.title; return `<div class="history-row"><strong>${escapeHtml(title)}</strong><span>${item.score} XP • ${item.grade} • ${escapeHtml(item.time)}</span></div>`; }).join('')
    : `<div class="history-row muted-row">${escapeHtml(t('lobby.noReports'))}</div>`;
  const previousMin = rank.minXp;
  const nextMin = Math.max(nextRank.minXp, previousMin + 1);
  const progress = rank === nextRank ? 100 : Math.round(((appState.player.xp - previousMin) / (nextMin - previousMin)) * 100);
  dom.rankProgressFill.style.width = `${Math.max(4, Math.min(100, progress))}%`;
  dom.rankProgressText.textContent = rank === nextRank ? t('lobby.maxRank') : t('lobby.xpToRank', { xp: Math.max(0, nextRank.minXp - appState.player.xp), rank: nextRank.title });
}

function pickIncidentsForShift(shiftId) {
  const filtered = incidents.filter((incident) => !incident.shiftTags || incident.shiftTags.includes(shiftId));
  const pool = filtered.length ? filtered : incidents;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

function updateRadioFeed(text) {
  if (dom.radioFeed) dom.radioFeed.textContent = text;
}

function setShift(shiftId, { persist = true } = {}) {
  appState.selectedShift = Object.prototype.hasOwnProperty.call(shiftRiskBias, shiftId) ? shiftId : 'manha';
  if (appState.player) {
    appState.player.preferredShift = appState.selectedShift;
    if (persist) persistGame({ includeSession: Boolean(appState.activeIncident) });
  }
  [...dom.shiftSelector.querySelectorAll('[data-shift]')].forEach((button) => button.classList.toggle('is-active', button.dataset.shift === appState.selectedShift));
  updateRadioFeed(shiftProfile(appState.selectedShift).radio);
}

function resetIncidentState() {
  appState.activeIncident = null;
  appState.selectedUnits = new Set();
  appState.askedQuestions = new Set();
  appState.timerSeconds = 0;
  appState.risk = 0;
  appState.triggeredEvents = new Set();
  appState.dispatchResult = null;
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
}

function appendMessage(type, text, { scroll = true } = {}) {
  const node = document.createElement('div');
  node.className = `message ${type}`;
  node.textContent = text;
  dom.chatLog.appendChild(node);
  if (scroll) scrollChatToBottom();
}

function rebuildIncidentChat() {
  dom.chatLog.innerHTML = '';
  const incident = appState.activeIncident;
  const shift = shiftProfile(appState.selectedShift);
  appendMessage('operator', `${t('common.operator')}: ${incident.opening}`, { scroll: false });
  appendMessage('caller', `${incident.callerName.toUpperCase()}: ${incident.callerOpening}`, { scroll: false });
  appendMessage('system', `${t('common.protocol')}: ${t('shift.protocolGuidance')}`, { scroll: false });
  appendMessage('system', `${t('common.shift')}: ${t('shift.queueStatus', { shift: shift.label, count: appState.callQueue.length })}`, { scroll: false });
  for (const question of protocolQuestions) {
    if (!appState.askedQuestions.has(question.id)) continue;
    appendMessage('operator', `${t('common.operator')}: ${question.prompt}`, { scroll: false });
    appendMessage('caller', `${incident.callerName.toUpperCase()}: ${incident.questionReplies[question.id]}`, { scroll: false });
    appendMessage('system', `${t('common.protocol')} ${t('shift.registered', { protocol: question.protocol })}`, { scroll: false });
  }
  [...appState.triggeredEvents].sort((a, b) => a - b).forEach((index) => {
    const event = incident.events[index];
    if (event) appendMessage(/^(SISTEMA|SYSTEM):/.test(event.text) ? 'system' : 'caller', event.text, { scroll: false });
  });
}

function prepareIncidentView({ restored = false } = {}) {
  const incident = appState.activeIncident;
  const shift = shiftProfile(appState.selectedShift);
  dom.shiftAvatar.src = getAvatarById(appState.player.avatarId).src;
  dom.shiftOperatorName.textContent = appState.player.name;
  dom.incidentTitle.textContent = incident.title;
  dom.severityBadge.textContent = incident.severity;
  dom.dispatchDistrict.textContent = incident.district;
  rebuildIncidentChat();
  dom.incidentFacts.innerHTML = [...incident.facts, ...incident.contradictions].map((fact) => `<li>${escapeHtml(fact)}</li>`).join('');
  dom.timerValue.textContent = formatTime(appState.timerSeconds);
  updateRiskMeter();
  renderQuestionButtons();
  renderMiniMap();
  renderDispatchMap();
  renderUnits();
  updateRadioFeed(t('shift.currentQueue', { radio: shift.radio, count: 1 + appState.callQueue.length, recovered: restored ? t('shift.recoveredSuffix') : '' }, `${shift.radio} ${1 + appState.callQueue.length}`));
}

function startTimer() {
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = window.setInterval(tickTimer, 1000);
}

function startShift() {
  if (!appState.player) return setActiveScreen('profile');
  if (!contentReport.ok || !localeReport.ok) {
    notify(t('notifications.shiftBlocked'), 'danger');
    setActiveScreen('config');
    refreshDiagnostics();
    return;
  }
  resetIncidentState();
  if (!appState.callQueue.length) appState.callQueue = pickIncidentsForShift(appState.selectedShift);
  appState.activeIncident = appState.callQueue.shift() || incidents[Math.floor(Math.random() * incidents.length)];
  const shift = shiftProfile(appState.selectedShift);
  appState.risk = Math.max(0, Math.min(100, appState.activeIncident.baseRisk + shift.riskBias));
  prepareIncidentView();
  startTimer();
  setActiveScreen('shift');
  window.requestAnimationFrame(() => scrollChatToBottom(false));
}

function restoreSession(session) {
  const incident = getIncidentById(session.incidentId);
  if (!incident || !appState.player) return false;
  resetIncidentState();
  appState.selectedShift = session.selectedShift;
  appState.activeIncident = incident;
  appState.callQueue = session.callQueueIds.map(getIncidentById).filter(Boolean);
  appState.selectedUnits = new Set(session.selectedUnitIds);
  appState.askedQuestions = new Set(session.askedQuestionIds);
  appState.timerSeconds = session.timerSeconds;
  appState.risk = session.risk;
  appState.triggeredEvents = new Set(session.triggeredEvents);
  setShift(session.selectedShift, { persist: false });
  prepareIncidentView({ restored: true });
  startTimer();
  setActiveScreen(session.screen, { checkpoint: false });
  persistGame({ includeSession: true });
  notify(t('notifications.shiftRecovered'), 'success');
  return true;
}

function tickTimer() {
  if (!appState.activeIncident) return;
  appState.timerSeconds += 1;
  dom.timerValue.textContent = formatTime(appState.timerSeconds);
  if (appState.timerSeconds === 20) updateRadioFeed(t('shift.radioNewCall'));
  if (appState.timerSeconds === 45) updateRadioFeed(t('shift.radioSupervisor'));
  appState.activeIncident.events.forEach((event, index) => {
    if (appState.timerSeconds >= event.at && !appState.triggeredEvents.has(index)) {
      appState.triggeredEvents.add(index);
      appState.risk = Math.min(100, appState.risk + event.risk);
      appendMessage(/^(SISTEMA|SYSTEM):/.test(event.text) ? 'system' : 'caller', event.text);
      updateRiskMeter();
    }
  });
  if (appState.timerSeconds % 12 === 0) { appState.risk = Math.min(100, appState.risk + 1); updateRiskMeter(); }
  if (appState.timerSeconds % 5 === 0) persistGame({ includeSession: true });
}

function updateRiskMeter() {
  const fill = document.getElementById('riskFill');
  const readout = document.getElementById('riskReadout');
  if (!fill || !readout) return;
  fill.style.width = `${Math.max(6, Math.min(100, appState.risk))}%`;
  readout.textContent = appState.risk >= 85 ? t('risk.criticalAction') : appState.risk >= 70 ? t('risk.highAction') : t('risk.moderateTriage');
}

function scrollChatToBottom(smooth = true) {
  window.requestAnimationFrame(() => {
    dom.chatLog?.scrollTo({ top: dom.chatLog.scrollHeight + 200, behavior: smooth ? 'smooth' : 'auto' });
  });
}

function getQuestionOptions() {
  const ideal = appState.activeIncident?.idealQuestions ?? [];
  const ordered = [...protocolQuestions].sort((a, b) => (ideal.includes(b.id) - ideal.includes(a.id)) || a.label.localeCompare(b.label));
  return ordered.filter((button) => !appState.askedQuestions.has(button.id)).slice(0, 2);
}

function renderQuestionButtons() {
  const buttons = getQuestionOptions();
  dom.questionActions.innerHTML = buttons.length
    ? buttons.map((button) => `<button class="quick-pill" data-question="${escapeHtml(button.id)}">${escapeHtml(button.label)}</button>`).join('')
    : `<div class="quick-pill is-used">${escapeHtml(t('shift.questionsDone'))}</div>`;
}

function tacticalMapLayers(compact = false) {
  const labelSize = compact ? '9px' : '10px';
  return `<span class="map-road r1"></span><span class="map-road r2"></span><span class="map-road r3"></span>
    <span class="map-zone-label" style="left:7%;top:13%;font-size:${labelSize}">${escapeHtml(t('dispatch.center'))}</span>
    <span class="map-zone-label" style="right:8%;top:18%;font-size:${labelSize}">${escapeHtml(t('dispatch.east'))}</span>
    <span class="map-zone-label" style="left:10%;bottom:13%;font-size:${labelSize}">${escapeHtml(t('dispatch.marginal'))}</span>`;
}

function renderMiniMap() {
  dom.miniMap.classList.add('tactical-grid');
  dom.miniMap.innerHTML = `${tacticalMapLayers(true)}
    <div class="map-chip" style="left:8px;top:8px"><img src="assets/icons/icon-radar.png" alt="Radar"><span>${escapeHtml(t('common.live'))}</span></div>
    <span class="map-pulse" style="left:51%;top:55%"></span>
    <img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="${escapeHtml(t('dispatch.incidentAlt'))}" style="left:51%;top:55%;transform:translate(-50%,-50%)">
    <img class="map-unit small" src="assets/units/unit-police-cruiser.png" alt="${escapeHtml(t('dispatch.patrolAlt'))}" style="left:20%;top:66%">
    <span class="unit-eta" style="left:13%;top:84%">3 min</span>
    <img class="map-unit small" src="assets/units/unit-ambulance-samu.png" alt="${escapeHtml(t('dispatch.ambulanceAlt'))}" style="left:66%;top:25%">
    <span class="unit-eta" style="left:61%;top:9%">6 min</span>`;
}

function renderDispatchMap() {
  const chips = appState.activeIncident.mapChips.map((chip, index) => `<div class="map-chip" style="left:${12 + index * 10}px;top:${12 + index * 32}px">${escapeHtml(chip)}</div>`).join('');
  dom.dispatchMap.classList.add('tactical-grid');
  dom.dispatchMap.innerHTML = `${tacticalMapLayers(false)}${chips}
    <span class="map-pulse" style="left:52%;top:52%"></span>
    <img class="map-marker" src="assets/icons/icon-incident-marker.png" alt="${escapeHtml(t('dispatch.incidentAlt'))}" style="left:52%;top:52%;transform:translate(-50%,-50%)">
    <img class="map-unit" src="assets/units/unit-police-cruiser.png" alt="${escapeHtml(t('dispatch.patrolAlt'))}" style="left:12%;top:64%">
    <span class="unit-eta" style="left:10%;top:82%">${escapeHtml(t('dispatch.patrolEta'))}</span>
    <img class="map-unit" src="assets/units/unit-ambulance-samu.png" alt="${escapeHtml(t('dispatch.ambulanceAlt'))}" style="left:66%;top:16%;width:64px;height:64px">
    <span class="unit-eta" style="left:60%;top:5%">${escapeHtml(t('dispatch.samuEta'))}</span>
    <img class="map-unit" src="assets/units/unit-helicopter-police.png" alt="${escapeHtml(t('dispatch.helicopterAlt'))}" style="left:62%;top:62%;width:76px;height:76px">
    <span class="unit-eta" style="left:58%;top:79%">${escapeHtml(t('dispatch.eagleEta'))}</span>`;
}

function renderUnits() {
  dom.unitGrid.innerHTML = units.map((unit) => `<button class="unit-card ${appState.selectedUnits.has(unit.id) ? 'is-selected' : ''}" data-unit-id="${escapeHtml(unit.id)}"><img src="${escapeHtml(unit.src)}" alt="${escapeHtml(unit.name)}"><div><strong>${escapeHtml(unit.name)}</strong><span>${escapeHtml(unit.description)}</span></div><span class="unit-toggle" aria-hidden="true"></span></button>`).join('');
}

function buildDispatchResult() {
  const incident = appState.activeIncident;
  const correct = new Set(incident.correctUnits);
  const selected = appState.selectedUnits;
  const correctSelected = [...selected].filter((id) => correct.has(id));
  const missing = [...correct].filter((id) => !selected.has(id));
  const extra = [...selected].filter((id) => !correct.has(id));
  const idealAsked = incident.idealQuestions.filter((id) => appState.askedQuestions.has(id));
  const protocolScore = Math.round((idealAsked.length / incident.idealQuestions.length) * 40);
  const timeScore = Math.max(0, 35 - Math.max(0, appState.timerSeconds - incident.urgencyLimit));
  const dispatchScore = correctSelected.length * 28 - missing.length * 32 - extra.reduce((acc, id) => acc + (units.find((unit) => unit.id === id)?.weight ?? 1) * 10, 0);
  const riskPenalty = appState.risk >= 90 && appState.timerSeconds > incident.urgencyLimit ? 18 : 0;
  const queuePressure = appState.callQueue.length * 2;
  const total = Math.max(0, 35 + protocolScore + timeScore + dispatchScore - riskPenalty - queuePressure);
  const grade = total >= 130 ? 'A' : total >= 100 ? 'B' : total >= 70 ? 'C' : 'D';
  const headline = total >= 130 ? t('result.exemplary') : total >= 100 ? t('result.safe') : total >= 70 ? t('result.caveats') : t('result.criticalFailures');
  const names = (ids) => ids.map((id) => units.find((unit) => unit.id === id)?.name || id).join(', ');
  const feedback = [
    { ok: missing.length === 0 && correctSelected.length === correct.size, title: missing.length === 0 ? t('result.dispatchOk') : t('result.dispatchLow'), text: t('result.requiredSelected', { required: names(incident.correctUnits), selected: names([...selected]) || t('common.none') }) },
    { ok: idealAsked.length >= Math.min(3, incident.idealQuestions.length), title: t('result.criticalData'), text: t('result.criticalDataText', { asked: idealAsked.length, total: incident.idealQuestions.length }) },
    { ok: appState.timerSeconds <= incident.urgencyLimit, title: t('result.responseTime'), text: t('result.responseTimeText', { time: formatTime(appState.timerSeconds), limit: formatTime(incident.urgencyLimit) }) },
    { ok: extra.length === 0, title: t('result.proportional'), text: extra.length ? t('result.excessive', { extra: names(extra) }) : t('result.noOverload') },
    { ok: appState.risk < 90 || appState.timerSeconds <= incident.urgencyLimit, title: t('result.escalation'), text: t('result.escalationText', { risk: appState.risk }) },
    { ok: appState.callQueue.length <= 2, title: t('result.queue'), text: t('result.queueText', { shift: shiftProfile(appState.selectedShift).label, count: appState.callQueue.length }) }
  ];
  return { total, feedback, headline, grade, incidentId: incident.id, incidentTitle: incident.title, time: formatTime(appState.timerSeconds) };
}

function renderResult() {
  if (!appState.dispatchResult) return;
  dom.resultHeadline.textContent = `${appState.dispatchResult.headline} • ${t('common.grade')} ${appState.dispatchResult.grade}`;
  dom.resultScore.textContent = appState.dispatchResult.total;
  dom.feedbackList.innerHTML = appState.dispatchResult.feedback.map((item) => `<div class="feedback-item"><img src="${item.ok ? 'assets/icons/icon-check.png' : 'assets/icons/icon-error.png'}" alt="${escapeHtml(item.ok ? t('result.hit') : t('result.error'))}"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.text)}</span></div></div>`).join('');
  dom.btnReturnLobby.textContent = appState.callQueue.length ? t('result.next') : t('result.returnLobby');
}

function finalizeDispatch() {
  if (!appState.selectedUnits.size) {
    appendMessage('system', `${t('common.protocol')}: ${t('shift.noUnit')}`);
    setActiveScreen('dispatch');
    return;
  }
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
  appState.dispatchResult = buildDispatchResult();
  appState.player = normalizePlayer(appState.player, saveContext);
  appState.player.xp += appState.dispatchResult.total;
  appState.player.resolved += 1;
  if (!appState.player.bestTime || appState.timerSeconds < appState.player.bestTime) appState.player.bestTime = appState.timerSeconds;
  const safe = ['A','B'].includes(appState.dispatchResult.grade);
  appState.player.safeStreak = safe ? appState.player.safeStreak + 1 : 0;
  appState.player.history = [{ incidentId: appState.dispatchResult.incidentId, title: appState.dispatchResult.incidentTitle, score: appState.dispatchResult.total, grade: appState.dispatchResult.grade, time: appState.dispatchResult.time, at: new Date().toISOString() }, ...appState.player.history].slice(0,8);
  persistGame({ includeSession: false, createRecovery: true });
  renderLobby();
  renderResult();
  setActiveScreen('result', { checkpoint: false });
}

function handleQuestion(id) {
  if (!appState.activeIncident || appState.askedQuestions.has(id)) return;
  const question = protocolQuestions.find((item) => item.id === id);
  if (!question) return;
  appState.askedQuestions.add(id);
  appendMessage('operator', `${t('common.operator')}: ${question.prompt}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${appState.activeIncident.questionReplies[id]}`);
  appState.risk = Math.max(0, appState.risk - (appState.activeIncident.idealQuestions.includes(id) ? 7 : 3));
  updateRiskMeter();
  appendMessage('system', `${t('common.protocol')} ${t('shift.registered', { protocol: question.protocol })}`);
  renderQuestionButtons();
  scrollChatToBottom();
  persistGame({ includeSession: true });
}

function createProfile() {
  const name = dom.playerName.value.trim();
  if (!name) { dom.playerName.focus(); notify(t('notifications.missingName'), 'warning'); return; }
  appState.player = normalizePlayer({ name, country: dom.playerCountry.value, mode: appState.selectedMode, avatarId: appState.selectedAvatarId, language: i18n.locale, xp:0, resolved:0, bestTime:null, history:[], safeStreak:0, createdAt:new Date().toISOString(), preferredShift:'manha' }, saveContext);
  persistGame({ includeSession:false, createRecovery:true });
  refreshContinueState();
  renderLobby();
  setActiveScreen('lobby');
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await dom.appShell.requestFullscreen({ navigationUI: 'hide' });
  } catch { notify(t('notifications.fullscreenDenied'), 'warning'); }
}

function refreshDiagnostics() {
  appState.lastDiagnostic = runDiagnostics({ buildInfo: BUILD_INFO, contentReport, localeReport, saveManager, requiredDomIds: REQUIRED_DOM_IDS, t });
  const failures = appState.lastDiagnostic.items.filter((item) => !item.ok).length;
  dom.systemHealthChip.textContent = failures ? t('diagnostics.alerts', { count: failures }) : t('diagnostics.systemOk');
  dom.systemHealthChip.classList.toggle('is-warning', failures > 0);
  if (dom.diagnosticSummary) dom.diagnosticSummary.textContent = failures ? t('diagnostics.failures', { count: failures }) : t('diagnostics.success');
  if (dom.diagnosticList) dom.diagnosticList.innerHTML = appState.lastDiagnostic.items.map((item) => `<div class="diagnostic-row ${item.ok ? 'is-ok' : 'is-fail'}"><strong>${escapeHtml(item.ok ? t('common.ok') : t('common.warning'))} • ${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join('');
  if (dom.btnRestoreBackup) dom.btnRestoreBackup.disabled = !saveManager.hasBackup();
  return appState.lastDiagnostic;
}

function restoreBackupFromUi() {
  const result = saveManager.restoreBackup();
  notify(result.message, result.ok ? 'success' : 'danger');
  if (!result.ok) return;
  appState.player = result.payload.player;
  clearActiveSession({ persist: false });
  renderLobby();
  refreshContinueState();
  refreshDiagnostics();
  setActiveScreen('lobby');
}

function attachEvents() {
  dom.btnNewGame.addEventListener('click', () => {
    clearActiveSession({ persist:false });
    appState.player = null;
    dom.playerName.value = '';
    dom.playerCountry.value = 'BR';
    appState.selectedAvatarId = avatars[0].id;
    appState.selectedMode = 'carreira';
    renderAvatars(); updateSelectedAvatar();
    [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill) => pill.classList.toggle('is-active', pill.dataset.mode === 'carreira'));
    setActiveScreen('profile');
  });
  dom.btnContinue.addEventListener('click', () => {
    const loaded = loadGame(); if (!loaded.player) return;
    appState.player = loaded.player;
    if (loaded.player.language && loaded.player.language !== i18n.locale) applyLocale(loaded.player.language, { persist:true, announce:false });
    appState.selectedShift = loaded.player.preferredShift || 'manha';
    renderLobby();
    if (!loaded.session || !restoreSession(loaded.session)) { setShift(appState.selectedShift, { persist:false }); setActiveScreen('lobby'); }
    if (loaded.warnings?.length) notify(loaded.warnings[0], 'warning');
  });
  dom.avatarGrid.addEventListener('click', (event) => { const card=event.target.closest('[data-avatar-id]'); if(!card)return; appState.selectedAvatarId=card.dataset.avatarId; updateSelectedAvatar(); });
  dom.modeSwitch.addEventListener('click', (event) => { const button=event.target.closest('[data-mode]'); if(!button)return; appState.selectedMode=button.dataset.mode; [...dom.modeSwitch.querySelectorAll('.mode-pill')].forEach((pill)=>pill.classList.toggle('is-active',pill===button)); });
  dom.btnCreateProfile.addEventListener('click', createProfile);
  dom.btnStartShift.addEventListener('click', startShift);
  dom.btnConfig.addEventListener('click', () => { refreshDiagnostics(); setActiveScreen('config'); });
  dom.btnManualStart?.addEventListener('click', startShift);
  dom.btnFullscreen?.addEventListener('click', toggleFullscreen);
  dom.btnLargeText?.addEventListener('click', () => toggleAccessibilityPref('largeText'));
  dom.btnHighContrast?.addEventListener('click', () => toggleAccessibilityPref('highContrast'));
  dom.btnReduceMotion?.addEventListener('click', () => toggleAccessibilityPref('reduceMotion'));
  dom.btnInstallApp?.addEventListener('click', promptInstallApp);
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstallPrompt = event; updateInstallButton(); });
  window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; updateInstallButton(); notify(t('accessibility.installed'), 'success'); });
  [dom.languageSelector, dom.configLanguageSelector].forEach((select) => select?.addEventListener('change', (event) => applyLocale(event.target.value, { persist:true, announce:true })));
  dom.shiftSelector.addEventListener('click', (event) => { const button=event.target.closest('[data-shift]'); if(button)setShift(button.dataset.shift); });
  dom.btnResetCareer.addEventListener('click', () => {
    if (!window.confirm(t('notifications.resetConfirm'))) return;
    clearActiveSession({ persist:false }); saveManager.clearAll(); appState.player=null; refreshContinueState(); refreshDiagnostics(); setActiveScreen('home'); notify(t('notifications.careerRemoved'),'success');
  });
  dom.btnBackLobby.addEventListener('click', () => { clearActiveSession({ persist:true }); renderLobby(); setActiveScreen('lobby'); });
  dom.btnOpenDispatch.addEventListener('click', () => setActiveScreen('dispatch'));
  dom.btnConfirmDispatch.addEventListener('click', finalizeDispatch);
  dom.btnReturnLobby.addEventListener('click', () => { if(appState.callQueue.length) startShift(); else { clearActiveSession({persist:true}); renderLobby(); setActiveScreen('lobby'); } });
  dom.btnEndShift.addEventListener('click', () => { clearActiveSession({persist:true}); renderLobby(); setActiveScreen('lobby'); });
  dom.btnRunDiagnostics?.addEventListener('click', () => { const report=refreshDiagnostics(); notify(report.ok?t('diagnostics.auditOk'):t('diagnostics.auditWarning'), report.ok?'success':'warning'); });
  dom.btnExportDiagnostics?.addEventListener('click', () => downloadDiagnosticReport(refreshDiagnostics(), runtimeGuard.getReport(), `central190-${i18n.locale}-diagnostics-${Date.now()}.json`));
  dom.btnRestoreBackup?.addEventListener('click', restoreBackupFromUi);
  document.body.addEventListener('click', (event) => {
    const nav=event.target.closest('[data-nav]'); if(nav){setActiveScreen(nav.dataset.nav);return;}
    const question=event.target.closest('[data-question]'); if(question){handleQuestion(question.dataset.question);return;}
    const unitCard=event.target.closest('[data-unit-id]'); if(unitCard){const {unitId}=unitCard.dataset; if(appState.selectedUnits.has(unitId))appState.selectedUnits.delete(unitId);else appState.selectedUnits.add(unitId);renderUnits();persistGame({includeSession:true});}
  });
  window.addEventListener('beforeunload', () => { if(appState.player)persistGame({includeSession:Boolean(appState.activeIncident)}); });
  document.addEventListener('visibilitychange', () => { if(document.visibilityState==='hidden'&&appState.player)persistGame({includeSession:Boolean(appState.activeIncident)}); });
}

function recoverToSafeScreen() {
  clearActiveSession({ persist:false });
  if (appState.player) { persistGame({ includeSession:false }); renderLobby(); setActiveScreen('lobby', { checkpoint:false }); }
  else setActiveScreen('home', { checkpoint:false });
  notify(t('notifications.sessionSafe'), 'success');
}

function init() {
  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);
  window.visualViewport?.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', () => window.setTimeout(updateViewportHeight, 250));
  applyAccessibilityPrefs({ announce: false });
  updateInstallButton();
  runtimeGuard = installRuntimeGuard({ buildInfo: BUILD_INFO, onRecover: recoverToSafeScreen });
  const loaded = loadGame();
  if (loaded.player?.language) i18n.setLocale(loaded.player.language, { persist:true });
  relocalizeContent();
  i18n.applyDocument(document);
  syncLanguageControls();
  updateFooter();
  dom.appShell.classList.add('home-active');
  renderAvatars(); updateSelectedAvatar(); attachEvents();
  if (loaded.player) { appState.player=loaded.player; appState.player.language=i18n.locale; appState.selectedShift=loaded.player.preferredShift||'manha'; renderLobby(); }
  setShift(appState.selectedShift, { persist:false });
  refreshContinueState(); refreshDiagnostics(); updateInstallButton(); registerServiceWorker();
  if (!contentReport.ok || !localeReport.ok) { dom.btnStartShift.disabled=true; dom.btnManualStart.disabled=true; notify(t('notifications.contentBlocked'),'danger'); }
  else if (appState.bootWarnings.length) notify(appState.bootWarnings[0],'warning');
}

init();

export { contentReport, saveManager, SAVE_KEYS };
