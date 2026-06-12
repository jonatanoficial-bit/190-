import { BUILD_INFO } from './build-info.js';
import { avatars as baseAvatars, ranks as baseRanks, units as baseUnits, incidents as baseIncidents, protocolQuestions as baseProtocolQuestions } from './data/content.js';
import { TRAINING_REWARD_XP, getTrainingCourse, getTrainingStepIds, validateTrainingCourse } from './data/training.js';
import { validateGameContent } from './core/content-validator.js';
import { SafeSaveManager, SAVE_KEYS, normalizePlayer } from './core/save-manager.js';
import { escapeHtml } from './core/utils.js';
import { installRuntimeGuard } from './core/runtime-guard.js';
import { downloadDiagnosticReport, runDiagnostics } from './core/diagnostics.js';
import { I18nManager } from './core/i18n.js';
import { SUPPORTED_LOCALES, TRANSLATIONS } from './i18n/translations.js';
import { localizeGameContent, validateContentTranslations } from './i18n/content-translations.js';
import { CALL_APPROACH_IDS, createInitialCallerState, emotionFromState, getCallBranchProfile, resolveCallBranch, validateCallBranchProfiles } from './core/call-branching.js';
import { TRIAGE_NATURE_IDS, TRIAGE_PRIORITIES, TRIAGE_PROTOCOL_IDS, assessTriage, calculateTriageConfidence, createInitialTriageState, getTriageProfile, normalizeTriageState, triageText, validateTriageProfiles } from './data/triage.js';

const VALID_SCREENS = new Set(['home', 'profile', 'lobby', 'shift', 'dispatch', 'academy', 'manual', 'config', 'result']);
const REQUIRED_DOM_IDS = [
  'appShell', 'btnNewGame', 'btnContinue', 'avatarGrid', 'playerName', 'btnCreateProfile',
  'btnStartShift', 'chatLog', 'questionActions', 'incidentFacts', 'dispatchMap', 'unitGrid',
  'btnConfirmDispatch', 'feedbackList', 'footerVersion', 'footerDateTime', 'footerModule',
  'btnAcademy', 'academyModuleGrid', 'academyProgressFill', 'academyLesson', 'btnAcademyContinue',
  'callBranchConsole', 'callerEmotionBadge', 'approachSelector', 'intelStatus',
  'triagePanel', 'triagePriorityGrid', 'triageNatureGrid', 'triageProtocolGrid', 'btnSubmitTriage', 'triageStatusBadge'
];

const baseContent = Object.freeze({ avatars: baseAvatars, ranks: baseRanks, units: baseUnits, incidents: baseIncidents, protocolQuestions: baseProtocolQuestions });
const i18n = new I18nManager({ translations: TRANSLATIONS, supportedLocales: SUPPORTED_LOCALES, defaultLocale: 'pt-BR' });
const t = (key, values = {}, fallback = '') => i18n.t(key, values, fallback);
let { avatars, ranks, units, incidents, protocolQuestions } = localizeGameContent(baseContent, i18n.locale);
const gameContentReport = validateGameContent(baseContent);
const trainingReport = validateTrainingCourse(SUPPORTED_LOCALES);
const branchingReport = validateCallBranchProfiles(baseIncidents.map((item) => item.id), baseProtocolQuestions.map((item) => item.id));
const triageReport = validateTriageProfiles(baseIncidents.map((item) => item.id));
const contentReport = Object.freeze({
  ...gameContentReport,
  ok: gameContentReport.ok && trainingReport.ok && branchingReport.ok && triageReport.ok,
  errors: [...gameContentReport.errors, ...trainingReport.errors, ...branchingReport.errors, ...triageReport.errors],
  warnings: [...(gameContentReport.warnings || []), ...(trainingReport.warnings || []), ...(branchingReport.warnings || [])],
  training: trainingReport,
  branching: branchingReport,
  triage: triageReport
});
const localeReport = validateContentTranslations(baseContent, SUPPORTED_LOCALES);
const trainingStepIds = getTrainingStepIds();
const saveContext = {
  avatarIds: new Set(baseAvatars.map((item) => item.id)),
  incidentIds: new Set(baseIncidents.map((item) => item.id)),
  unitIds: new Set(baseUnits.map((item) => item.id)),
  questionIds: new Set(baseProtocolQuestions.map((item) => item.id)),
  trainingStepIds: new Set(trainingStepIds),
  triagePriorityIds: new Set(TRIAGE_PRIORITIES.map((item) => item.id)),
  triageNatureIds: new Set(TRIAGE_NATURE_IDS),
  triageProtocolIds: new Set(TRIAGE_PROTOCOL_IDS)
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
  btnAcademy: document.getElementById('btnAcademy'),
  academySummaryLabel: document.getElementById('academySummaryLabel'),
  academySummaryValue: document.getElementById('academySummaryValue'),
  btnManualAcademy: document.getElementById('btnManualAcademy'),
  manualIntro: document.getElementById('manualIntro'),
  btnManualStart: document.getElementById('btnManualStart'),
  btnResetCareer: document.getElementById('btnResetCareer'),
  shiftAvatar: document.getElementById('shiftAvatar'),
  shiftOperatorName: document.getElementById('shiftOperatorName'),
  timerValue: document.getElementById('timerValue'),
  incidentTitle: document.getElementById('incidentTitle'),
  severityBadge: document.getElementById('severityBadge'),
  chatLog: document.getElementById('chatLog'),
  questionActions: document.getElementById('questionActions'),
  callBranchConsole: document.getElementById('callBranchConsole'),
  callerEmotionBadge: document.getElementById('callerEmotionBadge'),
  lineStatusBadge: document.getElementById('lineStatusBadge'),
  callerTrustFill: document.getElementById('callerTrustFill'),
  callerStressFill: document.getElementById('callerStressFill'),
  callerClarityFill: document.getElementById('callerClarityFill'),
  callerTrustValue: document.getElementById('callerTrustValue'),
  callerStressValue: document.getElementById('callerStressValue'),
  callerClarityValue: document.getElementById('callerClarityValue'),
  approachSelector: document.getElementById('approachSelector'),
  approachHint: document.getElementById('approachHint'),
  incidentFacts: document.getElementById('incidentFacts'),
  intelStatus: document.getElementById('intelStatus'),
  triagePanel: document.getElementById('triagePanel'),
  triageStatusBadge: document.getElementById('triageStatusBadge'),
  triageConfidenceLabel: document.getElementById('triageConfidenceLabel'),
  triageConfidenceValue: document.getElementById('triageConfidenceValue'),
  triageConfidenceFill: document.getElementById('triageConfidenceFill'),
  triagePriorityLabel: document.getElementById('triagePriorityLabel'),
  triagePriorityGrid: document.getElementById('triagePriorityGrid'),
  triageNatureLabel: document.getElementById('triageNatureLabel'),
  triageNatureGrid: document.getElementById('triageNatureGrid'),
  triageProtocolLabel: document.getElementById('triageProtocolLabel'),
  triageProtocolGrid: document.getElementById('triageProtocolGrid'),
  triageAssessment: document.getElementById('triageAssessment'),
  btnSubmitTriage: document.getElementById('btnSubmitTriage'),
  miniMap: document.getElementById('miniMap'),
  trainingCoach: document.getElementById('trainingCoach'),
  trainingCoachTitle: document.getElementById('trainingCoachTitle'),
  trainingCoachText: document.getElementById('trainingCoachText'),
  dispatchCoach: document.getElementById('dispatchCoach'),
  dispatchCoachTitle: document.getElementById('dispatchCoachTitle'),
  dispatchCoachText: document.getElementById('dispatchCoachText'),
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
  academyEyebrow: document.getElementById('academyEyebrow'),
  academyTitle: document.getElementById('academyTitle'),
  academyIntro: document.getElementById('academyIntro'),
  academyCertBadge: document.getElementById('academyCertBadge'),
  academyProgressLabel: document.getElementById('academyProgressLabel'),
  academyProgressText: document.getElementById('academyProgressText'),
  academyAccuracy: document.getElementById('academyAccuracy'),
  academyProgressFill: document.getElementById('academyProgressFill'),
  academyReward: document.getElementById('academyReward'),
  academyAssistanceTitle: document.getElementById('academyAssistanceTitle'),
  academyAssistanceText: document.getElementById('academyAssistanceText'),
  btnToggleAssistance: document.getElementById('btnToggleAssistance'),
  academyModuleGrid: document.getElementById('academyModuleGrid'),
  academyLesson: document.getElementById('academyLesson'),
  academyLessonKicker: document.getElementById('academyLessonKicker'),
  academyLessonTitle: document.getElementById('academyLessonTitle'),
  academyLessonAttempts: document.getElementById('academyLessonAttempts'),
  academyScenarioLabel: document.getElementById('academyScenarioLabel'),
  academyScenario: document.getElementById('academyScenario'),
  academyObjectiveLabel: document.getElementById('academyObjectiveLabel'),
  academyObjective: document.getElementById('academyObjective'),
  academyDecisionLabel: document.getElementById('academyDecisionLabel'),
  academyPrompt: document.getElementById('academyPrompt'),
  academyOptions: document.getElementById('academyOptions'),
  academyFeedback: document.getElementById('academyFeedback'),
  btnAcademyLessonBack: document.getElementById('btnAcademyLessonBack'),
  btnAcademyNext: document.getElementById('btnAcademyNext'),
  btnAcademyExit: document.getElementById('btnAcademyExit'),
  btnAcademyReset: document.getElementById('btnAcademyReset'),
  btnAcademyContinue: document.getElementById('btnAcademyContinue'),
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
  bootWarnings: [],
  academySession: null,
  selectedApproach: 'direct',
  callerState: null,
  questionQuality: {},
  discoveredIntel: new Set(),
  branchHistory: [],
  triageState: createInitialTriageState()
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
  renderAcademyChrome();
  if (appState.player) { renderAcademy(); updateGuidanceCoach(); }
  if (appState.activeIncident) renderTriagePanel();
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
    selectedApproach: appState.selectedApproach,
    callerState: appState.callerState,
    questionQuality: appState.questionQuality,
    discoveredIntel: [...appState.discoveredIntel],
    branchHistory: appState.branchHistory,
    triageState: appState.triageState,
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
  appState.academySession = null;
  appState.selectedApproach = 'direct';
  appState.callerState = null;
  appState.questionQuality = {};
  appState.discoveredIntel = new Set();
  appState.branchHistory = [];
  appState.triageState = createInitialTriageState();
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


function interpolateTraining(template, values = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

function trainingPack() { return getTrainingCourse(i18n.locale); }
function trainingUi(key, values = {}) { return interpolateTraining(trainingPack().ui[key] ?? key, values); }

function normalizeCurrentPlayer() {
  if (!appState.player) return null;
  appState.player = normalizePlayer(appState.player, saveContext);
  return appState.player;
}

function trainingProgress() {
  return normalizeCurrentPlayer()?.training ?? {
    completedSteps: [], attempts: 0, firstTryCorrect: 0, certified: false,
    rewardClaimed: false, assistedMode: true, completedAt: null
  };
}

function moduleIsComplete(module, completed = new Set(trainingProgress().completedSteps)) {
  return module.steps.every((step) => completed.has(step.id));
}

function moduleIsUnlocked(moduleIndex, completed = new Set(trainingProgress().completedSteps)) {
  if (moduleIndex <= 0) return true;
  return moduleIsComplete(trainingPack().modules[moduleIndex - 1], completed);
}

function renderAcademyChrome() {
  const ui = trainingPack().ui;
  if (dom.btnAcademy) dom.btnAcademy.textContent = ui.lobbyButton;
  if (dom.btnManualAcademy) dom.btnManualAcademy.textContent = ui.lobbyButton;
  if (dom.manualIntro) dom.manualIntro.textContent = ui.manualIntro;
  if (dom.academyEyebrow) dom.academyEyebrow.textContent = ui.eyebrow;
  if (dom.academyTitle) dom.academyTitle.textContent = ui.title;
  if (dom.academyIntro) dom.academyIntro.textContent = ui.intro;
  if (dom.academyProgressLabel) dom.academyProgressLabel.textContent = ui.progress;
  if (dom.academyAssistanceTitle) dom.academyAssistanceTitle.textContent = ui.assistanceTitle;
  if (dom.academyAssistanceText) dom.academyAssistanceText.textContent = ui.assistanceText;
  if (dom.academyScenarioLabel) dom.academyScenarioLabel.textContent = ui.scenario;
  if (dom.academyObjectiveLabel) dom.academyObjectiveLabel.textContent = ui.objective;
  if (dom.academyDecisionLabel) dom.academyDecisionLabel.textContent = ui.decision;
  if (dom.btnAcademyLessonBack) dom.btnAcademyLessonBack.textContent = ui.reviewCourse;
  if (dom.btnAcademyExit) dom.btnAcademyExit.textContent = ui.exit;
  if (dom.btnAcademyReset) dom.btnAcademyReset.textContent = ui.reset;
  if (dom.trainingCoachTitle) dom.trainingCoachTitle.textContent = ui.coachTitle;
  if (dom.dispatchCoachTitle) dom.dispatchCoachTitle.textContent = ui.coachTitle;
}

function renderAcademyStatus() {
  if (!appState.player) return;
  const progress = trainingProgress();
  const ui = trainingPack().ui;
  const done = progress.completedSteps.length;
  const status = progress.certified ? ui.certified : done ? ui.inTraining : ui.notStarted;
  if (dom.academySummaryLabel) dom.academySummaryLabel.textContent = ui.lobbyCertification;
  if (dom.academySummaryValue) {
    dom.academySummaryValue.textContent = status;
    dom.academySummaryValue.classList.toggle('is-certified', progress.certified);
    dom.academySummaryValue.classList.toggle('is-progress', !progress.certified && done > 0);
  }
}

function renderAcademy() {
  renderAcademyChrome();
  if (!appState.player || !dom.academyModuleGrid) return;
  const pack = trainingPack();
  const ui = pack.ui;
  const progress = trainingProgress();
  const completed = new Set(progress.completedSteps);
  const done = completed.size;
  const total = trainingStepIds.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const accuracy = done ? Math.round((Math.min(progress.firstTryCorrect, done) / done) * 100) : 0;
  const status = progress.certified ? ui.certified : done ? ui.inTraining : ui.notStarted;

  dom.academyCertBadge.textContent = status;
  dom.academyCertBadge.classList.toggle('is-certified', progress.certified);
  dom.academyCertBadge.classList.toggle('is-progress', !progress.certified && done > 0);
  dom.academyProgressText.textContent = interpolateTraining(ui.completed, { done, total });
  dom.academyAccuracy.textContent = interpolateTraining(ui.accuracy, { score: accuracy });
  dom.academyProgressFill.style.width = `${Math.max(done ? 4 : 0, percent)}%`;
  dom.academyReward.textContent = interpolateTraining(ui.reward, { xp: TRAINING_REWARD_XP });
  dom.btnToggleAssistance.textContent = progress.assistedMode ? ui.assistanceOn : ui.assistanceOff;
  dom.btnToggleAssistance.classList.toggle('is-selected', progress.assistedMode);
  dom.btnToggleAssistance.setAttribute('aria-pressed', String(progress.assistedMode));
  dom.btnAcademyContinue.textContent = progress.certified ? ui.reviewCourse : done ? ui.continueCourse : ui.startCourse;

  dom.academyModuleGrid.innerHTML = pack.modules.map((module, index) => {
    const complete = moduleIsComplete(module, completed);
    const unlocked = moduleIsUnlocked(index, completed);
    const state = complete ? ui.completedModule : unlocked ? ui.available : ui.locked;
    const action = complete ? ui.review : ui.start;
    return `<button class="academy-module-card ${complete ? 'is-complete' : ''} ${unlocked && !complete ? 'is-current' : ''}" data-academy-module="${index}" ${unlocked ? '' : 'disabled'} aria-label="${escapeHtml(`${module.title}. ${state}. ${action}`)}">
      <span class="academy-module-number">${escapeHtml(module.number)}</span>
      <h4>${escapeHtml(module.title)}</h4>
      <p>${escapeHtml(module.summary)}</p>
      <span class="academy-module-state">${escapeHtml(state)}</span>
    </button>`;
  }).join('');

  if (appState.academySession) renderAcademyLesson();
  else dom.academyLesson.hidden = true;
  renderAcademyStatus();
}

function firstIncompleteTrainingPosition() {
  const pack = trainingPack();
  const completed = new Set(trainingProgress().completedSteps);
  for (let moduleIndex = 0; moduleIndex < pack.modules.length; moduleIndex += 1) {
    const stepIndex = pack.modules[moduleIndex].steps.findIndex((step) => !completed.has(step.id));
    if (stepIndex >= 0) return { moduleIndex, stepIndex };
  }
  return { moduleIndex: 0, stepIndex: 0 };
}

function openAcademy() {
  if (!appState.player) { setActiveScreen('profile'); return; }
  appState.academySession = null;
  renderAcademy();
  setActiveScreen('academy');
}

function continueAcademy() {
  if (!appState.player) return;
  const progress = trainingProgress();
  if (progress.completedSteps.length >= trainingStepIds.length && !progress.rewardClaimed) {
    finishAcademyCourse();
    return;
  }
  const position = firstIncompleteTrainingPosition();
  startAcademyModule(position.moduleIndex, position.stepIndex);
}

function startAcademyModule(moduleIndex, preferredStepIndex = null) {
  if (!appState.player) return;
  const pack = trainingPack();
  const index = Number.isInteger(moduleIndex) ? moduleIndex : Number(moduleIndex);
  if (!pack.modules[index] || !moduleIsUnlocked(index)) return;
  const completed = new Set(trainingProgress().completedSteps);
  const firstIncomplete = pack.modules[index].steps.findIndex((step) => !completed.has(step.id));
  const stepIndex = preferredStepIndex == null ? (firstIncomplete >= 0 ? firstIncomplete : 0) : Math.max(0, Math.min(pack.modules[index].steps.length - 1, preferredStepIndex));
  appState.academySession = {
    moduleIndex: index,
    stepIndex,
    attemptsOnStep: 0,
    answered: false,
    wrongOptions: new Set(),
    lastFeedback: '',
    lastCorrect: false
  };
  renderAcademy();
  dom.academyLesson.hidden = false;
  window.requestAnimationFrame(() => dom.academyLesson.scrollIntoView({ behavior: accessibilityPrefs.reduceMotion ? 'auto' : 'smooth', block: 'start' }));
}

function getActiveTrainingStep() {
  const session = appState.academySession;
  if (!session) return null;
  const module = trainingPack().modules[session.moduleIndex];
  const step = module?.steps[session.stepIndex];
  return module && step ? { module, step, session } : null;
}

function renderAcademyLesson() {
  const active = getActiveTrainingStep();
  if (!active) { dom.academyLesson.hidden = true; return; }
  const { module, step, session } = active;
  const ui = trainingPack().ui;
  dom.academyLesson.hidden = false;
  dom.academyLessonKicker.textContent = interpolateTraining(ui.module, { number: module.number });
  dom.academyLessonTitle.textContent = step.title;
  dom.academyLessonAttempts.textContent = interpolateTraining(ui.attempts, { count: session.attemptsOnStep });
  dom.academyScenario.textContent = step.scenario;
  dom.academyObjective.textContent = step.objective;
  dom.academyPrompt.textContent = step.prompt;
  dom.academyOptions.innerHTML = step.options.map((option, index) => {
    const isWrong = session.wrongOptions.has(option.id);
    const isCorrect = session.answered && option.correct;
    const disabled = session.answered || isWrong;
    return `<button class="academy-option ${isWrong ? 'is-wrong' : ''} ${isCorrect ? 'is-correct' : ''}" data-academy-option="${escapeHtml(option.id)}" ${disabled ? 'disabled' : ''}>
      <span class="academy-option-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option.text)}</span>
    </button>`;
  }).join('');
  dom.academyFeedback.hidden = !session.lastFeedback;
  dom.academyFeedback.textContent = session.lastFeedback;
  dom.academyFeedback.classList.toggle('is-correct', session.lastCorrect);
  dom.academyFeedback.classList.toggle('is-wrong', Boolean(session.lastFeedback) && !session.lastCorrect);
  dom.btnAcademyNext.hidden = !session.answered;
  const isFinal = session.moduleIndex === trainingPack().modules.length - 1 && session.stepIndex === module.steps.length - 1;
  dom.btnAcademyNext.textContent = isFinal ? ui.finish : ui.next;
}

function answerAcademyOption(optionId) {
  const active = getActiveTrainingStep();
  if (!active || active.session.answered) return;
  const { step, session } = active;
  const option = step.options.find((item) => item.id === optionId);
  if (!option || session.wrongOptions.has(option.id)) return;
  const progress = trainingProgress();
  session.attemptsOnStep += 1;
  progress.attempts += 1;
  session.lastFeedback = option.feedback;
  session.lastCorrect = option.correct;
  if (option.correct) {
    session.answered = true;
    const alreadyCompleted = progress.completedSteps.includes(step.id);
    if (!alreadyCompleted) {
      progress.completedSteps.push(step.id);
      if (session.attemptsOnStep === 1) progress.firstTryCorrect += 1;
    }
    if (progress.completedSteps.length >= trainingStepIds.length) {
      progress.certified = true;
      progress.completedAt = progress.completedAt || new Date().toISOString();
      if (!progress.rewardClaimed) {
        progress.rewardClaimed = true;
        appState.player.xp += TRAINING_REWARD_XP;
        notify(interpolateTraining(trainingUi('certificationReward'), { xp: TRAINING_REWARD_XP }), 'success');
      }
    }
  } else {
    session.wrongOptions.add(option.id);
  }
  appState.player.training = progress;
  persistGame({ includeSession: false, createRecovery: progress.certified });
  if (progress.certified) renderLobby();
  renderAcademy();
}

function advanceAcademy() {
  const active = getActiveTrainingStep();
  if (!active || !active.session.answered) return;
  const { module, session } = active;
  if (session.stepIndex + 1 < module.steps.length) {
    startAcademyModule(session.moduleIndex, session.stepIndex + 1);
    return;
  }
  if (session.moduleIndex + 1 < trainingPack().modules.length) {
    startAcademyModule(session.moduleIndex + 1, 0);
    return;
  }
  finishAcademyCourse();
}

function finishAcademyCourse() {
  const progress = trainingProgress();
  if (progress.completedSteps.length < trainingStepIds.length) { renderAcademy(); return; }
  progress.certified = true;
  progress.completedAt = progress.completedAt || new Date().toISOString();
  let rewardGranted = false;
  if (!progress.rewardClaimed) {
    progress.rewardClaimed = true;
    appState.player.xp += TRAINING_REWARD_XP;
    rewardGranted = true;
  }
  appState.player.training = progress;
  appState.academySession = null;
  persistGame({ includeSession: false, createRecovery: true });
  renderLobby();
  renderAcademy();
  notify(rewardGranted ? interpolateTraining(trainingUi('certificationReward'), { xp: TRAINING_REWARD_XP }) : trainingUi('certificationRewardClaimed'), 'success');
}

function resetAcademy() {
  if (!appState.player || !window.confirm(trainingUi('resetConfirm'))) return;
  const old = trainingProgress();
  appState.player.training = {
    completedSteps: [], attempts: 0, firstTryCorrect: 0, certified: false,
    rewardClaimed: old.rewardClaimed, assistedMode: true, completedAt: null
  };
  appState.academySession = null;
  persistGame({ includeSession: false, createRecovery: true });
  renderLobby();
  renderAcademy();
  notify(trainingUi('resetDone'), 'success');
}

function toggleTrainingAssistance() {
  if (!appState.player) return;
  const progress = trainingProgress();
  progress.assistedMode = !progress.assistedMode;
  appState.player.training = progress;
  persistGame({ includeSession: Boolean(appState.activeIncident) });
  renderAcademy();
  updateGuidanceCoach();
  notify(progress.assistedMode ? trainingUi('assistanceOn') : trainingUi('assistanceOff'), 'success');
}

function updateGuidanceCoach() {
  const ui = trainingPack().ui;
  const enabled = Boolean(appState.player?.training?.assistedMode);
  if (dom.trainingCoach) dom.trainingCoach.hidden = !enabled || !appState.activeIncident;
  if (dom.dispatchCoach) dom.dispatchCoach.hidden = !enabled || !appState.activeIncident;
  if (!enabled || !appState.activeIncident) return;

  let shiftMessage = ui.coachDispatchReady;
  if (!appState.askedQuestions.has('location')) shiftMessage = ui.coachLocation;
  else if (!appState.askedQuestions.has('weapon') && !appState.askedQuestions.has('suspect')) shiftMessage = ui.coachRisk;
  else if (!appState.askedQuestions.has('victims')) shiftMessage = ui.coachVictims;
  else if (!appState.askedQuestions.has('safety')) shiftMessage = ui.coachSafety;
  if (dom.trainingCoachText) dom.trainingCoachText.textContent = shiftMessage;

  let dispatchMessage = ui.coachDispatchReadyConfirm;
  if (!appState.selectedUnits.size) dispatchMessage = ui.coachDispatchEmpty;
  else {
    const correct = new Set(appState.activeIncident.correctUnits);
    if ([...appState.selectedUnits].some((id) => !correct.has(id))) dispatchMessage = ui.coachDispatchProportional;
  }
  if (dom.dispatchCoachText) dom.dispatchCoachText.textContent = dispatchMessage;
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
  renderAcademyStatus();
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
  appState.selectedApproach = 'direct';
  appState.callerState = null;
  appState.questionQuality = {};
  appState.discoveredIntel = new Set();
  appState.branchHistory = [];
  appState.triageState = createInitialTriageState();
  if (appState.timerHandle) clearInterval(appState.timerHandle);
  appState.timerHandle = null;
}

function appendMessage(type, text, { scroll = true, className = '' } = {}) {
  const node = document.createElement('div');
  node.className = `message ${type}${className ? ` ${className}` : ''}`;
  node.textContent = text;
  dom.chatLog.appendChild(node);
  if (scroll) scrollChatToBottom();
}

function approachLabel(id = appState.selectedApproach) {
  return t(`branching.approaches.${id}`, {}, id);
}

function intelTextById(id) {
  if (!appState.activeIncident || typeof id !== 'string') return '';
  const [type, rawIndex] = id.split(':');
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 0) return '';
  if (type === 'fact') return appState.activeIncident.facts?.[index] || '';
  if (type === 'contradiction') return appState.activeIncident.contradictions?.[index] || '';
  return '';
}

function allIntelIds() {
  if (!appState.activeIncident) return [];
  const profile = getCallBranchProfile(appState.activeIncident.id);
  const ids = [...(profile.initialIntel || [])];
  for (const rules of Object.values(profile.intelByQuestion || {})) {
    for (const raw of rules || []) ids.push(typeof raw === 'string' ? raw : raw?.id);
  }
  return [...new Set(ids.filter(Boolean))];
}

function renderIncidentIntel() {
  if (!dom.incidentFacts || !appState.activeIncident) return;
  const discovered = [...appState.discoveredIntel].filter((id) => intelTextById(id));
  const possible = allIntelIds();
  const hiddenCount = Math.max(0, possible.length - discovered.length);
  const rows = discovered.map((id) => {
    const type = id.startsWith('contradiction:') ? ' is-contradiction' : '';
    return `<li class="${type.trim()}">${escapeHtml(intelTextById(id))}</li>`;
  });
  if (!rows.length) rows.push(`<li class="is-locked">${escapeHtml(t('branching.noIntel'))}</li>`);
  if (hiddenCount) rows.push(`<li class="is-locked">${escapeHtml(t('branching.hiddenIntel', { count: hiddenCount }))}</li>`);
  dom.incidentFacts.innerHTML = rows.join('');
  if (dom.intelStatus) dom.intelStatus.textContent = t('branching.intelCount', { count: discovered.length });
}


function triageConfidenceHint(confidence) {
  if (confidence >= 75) return triageText(i18n.locale, 'highConfidence');
  if (confidence >= 45) return triageText(i18n.locale, 'mediumConfidence');
  return triageText(i18n.locale, 'lowConfidence');
}

function updateTriageConfidence() {
  const confidence = calculateTriageConfidence({ askedQuestionIds:[...appState.askedQuestions], discoveredIntel:[...appState.discoveredIntel], callerState:appState.callerState });
  appState.triageState.confidence = confidence;
  if (dom.triageConfidenceValue) dom.triageConfidenceValue.textContent = `${confidence}%`;
  if (dom.triageConfidenceFill) dom.triageConfidenceFill.style.width = `${Math.max(4, confidence)}%`;
  if (dom.triageAssessment && !appState.triageState.submitted) dom.triageAssessment.textContent = confidence < 30 ? triageText(i18n.locale, 'pendingHint') : triageConfidenceHint(confidence);
}

function renderTriagePanel() {
  if (!dom.triagePanel || !appState.activeIncident) return;
  const state = appState.triageState || createInitialTriageState();
  dom.triagePanel.querySelector('[data-triage-eyebrow]')?.replaceChildren(document.createTextNode(triageText(i18n.locale, 'panelEyebrow')));
  dom.triagePanel.querySelector('[data-triage-title]')?.replaceChildren(document.createTextNode(triageText(i18n.locale, 'panelTitle')));
  if (dom.triageStatusBadge) { dom.triageStatusBadge.textContent = triageText(i18n.locale, state.submitted ? 'statusReady' : 'statusPending'); dom.triageStatusBadge.classList.toggle('is-ready', state.submitted); }
  if (dom.triageConfidenceLabel) dom.triageConfidenceLabel.textContent = triageText(i18n.locale, 'confidence');
  if (dom.triagePriorityLabel) dom.triagePriorityLabel.textContent = triageText(i18n.locale, 'priorityLabel');
  if (dom.triageNatureLabel) dom.triageNatureLabel.textContent = triageText(i18n.locale, 'natureLabel');
  if (dom.triageProtocolLabel) dom.triageProtocolLabel.textContent = triageText(i18n.locale, 'protocolLabel');
  dom.triagePriorityGrid.innerHTML = TRIAGE_PRIORITIES.map((priority) => { const label=triageText(i18n.locale, `priorities.${priority.id}.0`); const desc=triageText(i18n.locale, `priorities.${priority.id}.1`); return `<button type="button" class="triage-priority triage-${priority.tone} ${state.priorityId===priority.id?'is-selected':''}" data-triage-priority="${priority.id}" aria-pressed="${state.priorityId===priority.id}"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(desc)}</span></button>`; }).join('');
  dom.triageNatureGrid.innerHTML = TRIAGE_NATURE_IDS.map((id) => `<button type="button" class="triage-choice ${state.natureId===id?'is-selected':''}" data-triage-nature="${id}" aria-pressed="${state.natureId===id}">${escapeHtml(triageText(i18n.locale, `natures.${id}`))}</button>`).join('');
  dom.triageProtocolGrid.innerHTML = TRIAGE_PROTOCOL_IDS.map((id) => `<button type="button" class="triage-protocol ${state.protocolIds.includes(id)?'is-selected':''}" data-triage-protocol="${id}" aria-pressed="${state.protocolIds.includes(id)}"><span aria-hidden="true">${state.protocolIds.includes(id)?'✓':'+'}</span>${escapeHtml(triageText(i18n.locale, `protocols.${id}`))}</button>`).join('');
  dom.btnSubmitTriage.textContent = triageText(i18n.locale, state.submitted ? 'revise' : 'submit');
  updateTriageConfidence();
  if (state.submitted && state.lastAssessment && dom.triageAssessment) {
    const assessment = state.lastAssessment;
    const status = assessment.undertriage ? 'undertriage' : assessment.overtriage ? 'overtriage' : 'exact';
    dom.triageAssessment.textContent = `${triageText(i18n.locale, status)} ${triageConfidenceHint(state.confidence)}`;
    dom.triageAssessment.dataset.tone = assessment.undertriage ? 'danger' : assessment.overtriage ? 'warning' : 'success';
  } else if (dom.triageAssessment) dom.triageAssessment.dataset.tone = 'info';
  dom.btnOpenDispatch?.classList.toggle('is-locked', !state.submitted);
  dom.btnOpenDispatch?.setAttribute('aria-disabled', String(!state.submitted));
}

function selectTriagePriority(id) { if (!TRIAGE_PRIORITIES.some((item)=>item.id===id)) return; appState.triageState.priorityId=id; renderTriagePanel(); persistGame({includeSession:true}); }
function selectTriageNature(id) { if (!TRIAGE_NATURE_IDS.includes(id)) return; appState.triageState.natureId=id; renderTriagePanel(); persistGame({includeSession:true}); }
function toggleTriageProtocol(id) { if (!TRIAGE_PROTOCOL_IDS.includes(id)) return; const set=new Set(appState.triageState.protocolIds); if(set.has(id))set.delete(id);else set.add(id); appState.triageState.protocolIds=[...set]; renderTriagePanel(); persistGame({includeSession:true}); }
function submitTriage() {
  const state=appState.triageState;
  if(!state.priorityId || !state.natureId || !state.protocolIds.length){notify(triageText(i18n.locale,'missing'),'warning');return;}
  const wasSubmitted=state.submitted;
  state.submitted=true; state.revisions += wasSubmitted ? 1 : 0; updateTriageConfidence();
  const assessment=assessTriage(appState.activeIncident.id,state); state.lastAssessment=assessment;
  if(assessment?.undertriage){appState.risk=Math.min(100,appState.risk+Math.max(6,assessment.priorityDistance*7));updateRiskMeter();}
  appendMessage('system', triageText(i18n.locale, wasSubmitted?'revised':'registered', {count:state.revisions,priority:triageText(i18n.locale,`priorities.${state.priorityId}.0`),nature:triageText(i18n.locale,`natures.${state.natureId}`)}), {className:'triage-log'});
  renderTriagePanel(); persistGame({includeSession:true}); notify(triageText(i18n.locale, wasSubmitted?'revised':'registered', {count:state.revisions,priority:triageText(i18n.locale,`priorities.${state.priorityId}.0`),nature:triageText(i18n.locale,`natures.${state.natureId}`)}), assessment?.undertriage?'danger':assessment?.overtriage?'warning':'success');
}

function renderCallerState() {
  if (!appState.activeIncident || !appState.callerState) return;
  const state = appState.callerState;
  if (dom.callerEmotionBadge) dom.callerEmotionBadge.textContent = t(`branching.emotions.${state.emotion}`, {}, state.emotion);
  if (dom.lineStatusBadge) {
    dom.lineStatusBadge.textContent = t(`branching.line.${state.lineStatus}`, {}, state.lineStatus);
    dom.lineStatusBadge.classList.toggle('is-unstable', state.lineStatus === 'unstable');
  }
  const meters = [
    [dom.callerTrustFill, dom.callerTrustValue, state.trust],
    [dom.callerStressFill, dom.callerStressValue, state.stress],
    [dom.callerClarityFill, dom.callerClarityValue, state.clarity]
  ];
  for (const [fill, value, amount] of meters) {
    if (fill) fill.style.width = `${Math.max(4, Math.min(100, amount))}%`;
    if (value) value.textContent = String(amount);
  }
  [...(dom.approachSelector?.querySelectorAll('[data-approach]') || [])].forEach((button) => {
    const active = button.dataset.approach === appState.selectedApproach;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (dom.approachHint) dom.approachHint.textContent = t(`branching.hints.${appState.selectedApproach}`);
}

function setCommunicationApproach(approach, { persist = true } = {}) {
  appState.selectedApproach = CALL_APPROACH_IDS.includes(approach) ? approach : 'direct';
  renderCallerState();
  if (persist && appState.activeIncident) persistGame({ includeSession: true });
}

function shortenBranchReply(reply, reaction) {
  const text = String(reply || '');
  if (reaction !== 'blocked' || text.length < 90) return text;
  const limit = Math.max(60, Math.floor(text.length * 0.58));
  return `${text.slice(0, limit).trim()}…`;
}

function localizedBranchReply(record, reply) {
  if (record.interruption || record.reaction === 'interrupted') return t('branching.reactions.interrupted');
  return t(`branching.reactions.${record.reaction}`, { reply: shortenBranchReply(reply, record.reaction) }, reply);
}

function appendIntelMessages(ids, { scroll = false } = {}) {
  for (const id of ids || []) {
    const text = intelTextById(id);
    if (!text) continue;
    const key = id.startsWith('contradiction:') ? 'branching.contradictionRevealed' : 'branching.intelRevealed';
    appendMessage('system', t(key, { intel: text }), { scroll, className: 'branch-intel' });
  }
}

function rebuildIncidentChat() {
  dom.chatLog.innerHTML = '';
  const incident = appState.activeIncident;
  const shift = shiftProfile(appState.selectedShift);
  appendMessage('operator', `${t('common.operator')}: ${incident.opening}`, { scroll: false });
  appendMessage('caller', `${incident.callerName.toUpperCase()}: ${incident.callerOpening}`, { scroll: false });
  appendMessage('system', `${t('common.protocol')}: ${t('shift.protocolGuidance')}`, { scroll: false });
  appendMessage('system', `${t('common.shift')}: ${t('shift.queueStatus', { shift: shift.label, count: appState.callQueue.length })}`, { scroll: false });

  const history = appState.branchHistory.length ? appState.branchHistory : [...appState.askedQuestions].map((questionId) => ({
    questionId, approach: 'direct', reaction: 'strained', quality: appState.questionQuality[questionId] || 0.65,
    completed: true, interruption: false, revealedIntel: []
  }));
  for (const record of history) {
    const question = protocolQuestions.find((item) => item.id === record.questionId);
    if (!question) continue;
    const meta = t('branching.approachMeta', { approach: approachLabel(record.approach), quality: Math.round((record.quality || 0) * 100) });
    appendMessage('operator', `${t('common.operator')} • ${meta}: ${question.prompt}`, { scroll: false });
    appendMessage('caller', `${incident.callerName.toUpperCase()}: ${localizedBranchReply(record, incident.questionReplies[question.id])}`, { scroll: false });
    if (record.interruption) appendMessage('system', t('branching.interruption'), { scroll: false, className: 'branch-alert' });
    if (record.completed) appendMessage('system', `${t('common.protocol')} ${t('shift.registered', { protocol: question.protocol })}`, { scroll: false });
    appendIntelMessages(record.revealedIntel, { scroll: false });
  }
  [...appState.triggeredEvents].sort((a, b) => a - b).forEach((index) => {
    const event = incident.events[index];
    if (event) appendMessage(/^(SISTEMA|SYSTEM|SISTEMA):/.test(event.text) ? 'system' : 'caller', event.text, { scroll: false });
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
  renderIncidentIntel();
  renderCallerState();
  renderTriagePanel();
  dom.timerValue.textContent = formatTime(appState.timerSeconds);
  updateRiskMeter();
  renderQuestionButtons();
  renderMiniMap();
  renderDispatchMap();
  renderUnits();
  updateRadioFeed(t('shift.currentQueue', { radio: shift.radio, count: 1 + appState.callQueue.length, recovered: restored ? t('shift.recoveredSuffix') : '' }, `${shift.radio} ${1 + appState.callQueue.length}`));
  updateGuidanceCoach();
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
  appState.callerState = createInitialCallerState(appState.activeIncident.id);
  appState.selectedApproach = 'direct';
  appState.questionQuality = {};
  appState.branchHistory = [];
  appState.triageState = createInitialTriageState();
  appState.discoveredIntel = new Set(getCallBranchProfile(appState.activeIncident.id).initialIntel || []);
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
  appState.selectedApproach = session.selectedApproach || 'direct';
  appState.callerState = session.callerState || createInitialCallerState(incident.id);
  appState.questionQuality = { ...(session.questionQuality || {}) };
  appState.discoveredIntel = new Set(session.discoveredIntel || getCallBranchProfile(incident.id).initialIntel || []);
  appState.branchHistory = Array.isArray(session.branchHistory) ? [...session.branchHistory] : [];
  appState.triageState = normalizeTriageState(session.triageState);
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
      if (appState.callerState) {
        appState.callerState.stress = Math.min(100, appState.callerState.stress + Math.max(2, Math.round(event.risk / 2)));
        appState.callerState.clarity = Math.max(0, appState.callerState.clarity - Math.max(1, Math.round(event.risk / 4)));
        appState.callerState.emotion = emotionFromState(appState.callerState);
      }
      appendMessage(/^(SISTEMA|SYSTEM|SISTEMA):/.test(event.text) ? 'system' : 'caller', event.text);
      updateRiskMeter();
      renderCallerState();
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

function stableQuestionRank(questionId, incidentId) {
  const seed = `${incidentId}:${questionId}`;
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) hash = Math.imul(hash ^ seed.charCodeAt(index), 16777619);
  return hash >>> 0;
}

function getQuestionOptions() {
  const incidentId = appState.activeIncident?.id || '';
  const ordered = [...protocolQuestions].sort((a, b) => stableQuestionRank(a.id, incidentId) - stableQuestionRank(b.id, incidentId));
  return ordered.filter((button) => !appState.askedQuestions.has(button.id)).slice(0, 3);
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
  updateGuidanceCoach();
}

function buildDispatchResult() {
  const incident = appState.activeIncident;
  const correct = new Set(incident.correctUnits);
  const selected = appState.selectedUnits;
  const correctSelected = [...selected].filter((id) => correct.has(id));
  const missing = [...correct].filter((id) => !selected.has(id));
  const extra = [...selected].filter((id) => !correct.has(id));
  const idealAsked = incident.idealQuestions.filter((id) => appState.askedQuestions.has(id));
  const idealQuality = incident.idealQuestions.reduce((sum, id) => sum + (appState.questionQuality[id] || 0), 0);
  const coverageRatio = incident.idealQuestions.length ? idealQuality / incident.idealQuestions.length : 0;
  const coveragePercent = Math.round(coverageRatio * 100);
  const protocolScore = Math.round(coverageRatio * 40);
  const completedQuality = Object.values(appState.questionQuality).filter((value) => Number.isFinite(value));
  const averageQuality = completedQuality.length ? completedQuality.reduce((sum, value) => sum + value, 0) / completedQuality.length : 0;
  const callerState = appState.callerState || createInitialCallerState(incident.id);
  const branchScore = Math.max(0, Math.round(averageQuality * 18) - callerState.interruptions * 5);
  const timeScore = Math.max(0, 35 - Math.max(0, appState.timerSeconds - incident.urgencyLimit));
  const dispatchScore = correctSelected.length * 28 - missing.length * 32 - extra.reduce((acc, id) => acc + (units.find((unit) => unit.id === id)?.weight ?? 1) * 10, 0);
  const riskPenalty = appState.risk >= 90 && appState.timerSeconds > incident.urgencyLimit ? 18 : 0;
  const queuePressure = appState.callQueue.length * 2;
  const triageAssessment = assessTriage(incident.id, appState.triageState);
  const triageScore = triageAssessment ? (triageAssessment.priorityCorrect ? 22 : Math.max(-18, 10 - triageAssessment.priorityDistance * 14)) + (triageAssessment.natureCorrect ? 12 : -8) + Math.round(triageAssessment.protocolRatio * 22) - Math.max(0, appState.triageState.revisions - 1) * 2 : -30;
  const total = Math.max(0, 25 + protocolScore + branchScore + timeScore + dispatchScore + triageScore - riskPenalty - queuePressure);
  const grade = total >= 130 ? 'A' : total >= 100 ? 'B' : total >= 70 ? 'C' : 'D';
  const headline = total >= 130 ? t('result.exemplary') : total >= 100 ? t('result.safe') : total >= 70 ? t('result.caveats') : t('result.criticalFailures');
  const names = (ids) => ids.map((id) => units.find((unit) => unit.id === id)?.name || id).join(', ');
  const coverageText = t('branching.coverageText', { coverage: coveragePercent, asked: idealAsked.length, total: incident.idealQuestions.length });
  const feedback = [
    { ok: missing.length === 0 && correctSelected.length === correct.size, title: missing.length === 0 ? t('result.dispatchOk') : t('result.dispatchLow'), text: t('result.requiredSelected', { required: names(incident.correctUnits), selected: names([...selected]) || t('common.none') }) },
    { ok: coverageRatio >= 0.62, title: t('result.criticalData'), text: t('result.criticalDataText', { asked: idealAsked.length, total: incident.idealQuestions.length, coverageText }) },
    { ok: averageQuality >= 0.62 && callerState.interruptions <= 1, title: t('branching.branchQualityTitle'), text: t('branching.branchQualityText', { quality: Math.round(averageQuality * 100), trust: callerState.trust, stress: callerState.stress, clarity: callerState.clarity, interruptions: callerState.interruptions }) },
    { ok: Boolean(triageAssessment?.priorityCorrect && triageAssessment?.natureCorrect && triageAssessment?.protocolRatio >= 0.66), title: triageText(i18n.locale, 'scoreTitle'), text: triageText(i18n.locale, 'scoreText', { priorityResult: triageAssessment?.priorityCorrect ? triageText(i18n.locale, 'correct') : triageText(i18n.locale, 'incorrect'), natureResult: triageAssessment?.natureCorrect ? triageText(i18n.locale, 'correct') : triageText(i18n.locale, 'incorrect'), covered: triageAssessment?.covered ?? 0, required: triageAssessment?.required ?? 0, confidence: appState.triageState?.confidence ?? 0 }) },
    { ok: appState.timerSeconds <= incident.urgencyLimit, title: t('result.responseTime'), text: t('result.responseTimeText', { time: formatTime(appState.timerSeconds), limit: formatTime(incident.urgencyLimit) }) },
    { ok: extra.length === 0, title: t('result.proportional'), text: extra.length ? t('result.excessive', { extra: names(extra) }) : t('result.noOverload') },
    { ok: appState.risk < 90 || appState.timerSeconds <= incident.urgencyLimit, title: t('result.escalation'), text: t('result.escalationText', { risk: appState.risk }) },
    { ok: appState.callQueue.length <= 2, title: t('result.queue'), text: t('result.queueText', { shift: shiftProfile(appState.selectedShift).label, count: appState.callQueue.length }) }
  ];
  return { total, feedback, headline, grade, incidentId: incident.id, incidentTitle: incident.title, time: formatTime(appState.timerSeconds), averageQuality: Math.round(averageQuality * 100), coveragePercent, triageScore };
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
  if (!appState.callerState) appState.callerState = createInitialCallerState(appState.activeIncident.id);

  const branch = resolveCallBranch({
    incidentId: appState.activeIncident.id,
    state: appState.callerState,
    approach: appState.selectedApproach,
    questionId: id,
    isIdeal: appState.activeIncident.idealQuestions.includes(id),
    askedCount: appState.askedQuestions.size,
    alreadyDiscovered: [...appState.discoveredIntel]
  });
  appState.callerState = branch.nextState;
  const record = {
    questionId: id,
    approach: branch.approach,
    reaction: branch.reaction,
    quality: branch.quality,
    completed: branch.completed,
    interruption: branch.interruption,
    revealedIntel: branch.revealedIntel
  };
  appState.branchHistory = [...appState.branchHistory, record].slice(-30);

  const meta = t('branching.approachMeta', { approach: approachLabel(branch.approach), quality: Math.round(branch.quality * 100) });
  appendMessage('operator', `${t('common.operator')} • ${meta}: ${question.prompt}`);
  appendMessage('caller', `${appState.activeIncident.callerName.toUpperCase()}: ${localizedBranchReply(record, appState.activeIncident.questionReplies[id])}`);
  appState.risk = Math.max(0, Math.min(100, appState.risk + branch.riskDelta));

  if (branch.interruption) {
    appendMessage('system', t('branching.interruption'), { className: 'branch-alert' });
    updateRiskMeter();
    renderCallerState();
    renderQuestionButtons();
    renderTriagePanel();
    updateGuidanceCoach();
    persistGame({ includeSession: true });
    return;
  }

  appState.askedQuestions.add(id);
  appState.questionQuality[id] = branch.quality;
  for (const intelId of branch.revealedIntel) appState.discoveredIntel.add(intelId);
  appendMessage('system', `${t('common.protocol')} ${t('shift.registered', { protocol: question.protocol })}`);
  appendIntelMessages(branch.revealedIntel, { scroll: true });
  updateRiskMeter();
  renderCallerState();
  renderIncidentIntel();
  renderQuestionButtons();
  renderTriagePanel();
  updateGuidanceCoach();
  scrollChatToBottom();
  persistGame({ includeSession: true });
}

function createProfile() {
  const name = dom.playerName.value.trim();
  if (!name) { dom.playerName.focus(); notify(t('notifications.missingName'), 'warning'); return; }
  appState.player = normalizePlayer({ name, country: dom.playerCountry.value, mode: appState.selectedMode, avatarId: appState.selectedAvatarId, language: i18n.locale, xp:0, resolved:0, bestTime:null, history:[], safeStreak:0, createdAt:new Date().toISOString(), preferredShift:'manha', training:{ completedSteps:[], attempts:0, firstTryCorrect:0, certified:false, rewardClaimed:false, assistedMode:true, completedAt:null } }, saveContext);
  persistGame({ includeSession:false, createRecovery:true });
  refreshContinueState();
  renderLobby();
  openAcademy();
  notify(trainingUi('welcome'), 'success');
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
  dom.btnAcademy?.addEventListener('click', openAcademy);
  dom.btnManualAcademy?.addEventListener('click', openAcademy);
  dom.btnAcademyExit?.addEventListener('click', () => { appState.academySession = null; renderLobby(); setActiveScreen('lobby'); });
  dom.btnAcademyContinue?.addEventListener('click', continueAcademy);
  dom.btnAcademyLessonBack?.addEventListener('click', () => { appState.academySession = null; renderAcademy(); });
  dom.btnAcademyNext?.addEventListener('click', advanceAcademy);
  dom.btnAcademyReset?.addEventListener('click', resetAcademy);
  dom.btnToggleAssistance?.addEventListener('click', toggleTrainingAssistance);
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
  dom.btnOpenDispatch.addEventListener('click', () => {
    if (!appState.triageState?.submitted) { notify(triageText(i18n.locale, 'dispatchBlocked'), 'warning'); dom.triagePanel?.scrollIntoView({ behavior:'smooth', block:'center' }); return; }
    setActiveScreen('dispatch');
  });
  dom.btnSubmitTriage?.addEventListener('click', submitTriage);
  dom.btnConfirmDispatch.addEventListener('click', finalizeDispatch);
  dom.btnReturnLobby.addEventListener('click', () => { if(appState.callQueue.length) startShift(); else { clearActiveSession({persist:true}); renderLobby(); setActiveScreen('lobby'); } });
  dom.btnEndShift.addEventListener('click', () => { clearActiveSession({persist:true}); renderLobby(); setActiveScreen('lobby'); });
  dom.btnRunDiagnostics?.addEventListener('click', () => { const report=refreshDiagnostics(); notify(report.ok?t('diagnostics.auditOk'):t('diagnostics.auditWarning'), report.ok?'success':'warning'); });
  dom.btnExportDiagnostics?.addEventListener('click', () => downloadDiagnosticReport(refreshDiagnostics(), runtimeGuard.getReport(), `central190-${i18n.locale}-diagnostics-${Date.now()}.json`));
  dom.btnRestoreBackup?.addEventListener('click', restoreBackupFromUi);
  document.body.addEventListener('click', (event) => {
    const triagePriority=event.target.closest('[data-triage-priority]'); if(triagePriority){selectTriagePriority(triagePriority.dataset.triagePriority);return;}
    const triageNature=event.target.closest('[data-triage-nature]'); if(triageNature){selectTriageNature(triageNature.dataset.triageNature);return;}
    const triageProtocol=event.target.closest('[data-triage-protocol]'); if(triageProtocol){toggleTriageProtocol(triageProtocol.dataset.triageProtocol);return;}
    const approachButton=event.target.closest('[data-approach]'); if(approachButton){setCommunicationApproach(approachButton.dataset.approach);return;}
    const academyModule=event.target.closest('[data-academy-module]'); if(academyModule){startAcademyModule(Number(academyModule.dataset.academyModule));return;}
    const academyOption=event.target.closest('[data-academy-option]'); if(academyOption){answerAcademyOption(academyOption.dataset.academyOption);return;}
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
  renderAcademyChrome();
  updateFooter();
  dom.appShell.classList.add('home-active');
  renderAvatars(); updateSelectedAvatar(); attachEvents();
  if (loaded.player) { appState.player=loaded.player; appState.player.language=i18n.locale; appState.selectedShift=loaded.player.preferredShift||'manha'; renderLobby(); renderAcademy(); }
  setShift(appState.selectedShift, { persist:false });
  refreshContinueState(); refreshDiagnostics(); updateInstallButton(); registerServiceWorker();
  if (!contentReport.ok || !localeReport.ok) { dom.btnStartShift.disabled=true; dom.btnManualStart.disabled=true; notify(t('notifications.contentBlocked'),'danger'); }
  else if (appState.bootWarnings.length) notify(appState.bootWarnings[0],'warning');
}

init();

export { contentReport, trainingReport, saveManager, SAVE_KEYS };
