import { checksumFNV1a, safeInteger, safeString, stableStringify, uniqueStrings } from './utils.js';
import { CALL_APPROACH_IDS, normalizeBranchHistory, normalizeCallerState, normalizeQuestionQuality } from './call-branching.js';
import { normalizeTriageState } from '../data/triage.js';
import { normalizeMapState } from '../data/tactical-map.js';
import { createInitialResourceNetwork, getBestAvailableResource, normalizeResourceNetwork, normalizeSelectedResourceIds } from '../data/resource-management.js';
import { normalizeDispatchCommandState } from '../data/dispatch-professional.js';
import { normalizeFieldOperationState } from '../data/field-operations.js';
import { normalizeContinuousShift } from '../data/continuous-shift.js';

export const SAVE_KEYS = Object.freeze({
  primary: 'central190-save-v180',
  backup: 'central190-save-v180-backup',
  recovery: 'central190-save-v180-recovery',
  legacy: ['central190-save-v170','central190-save-v160','central190-save-v150','central190-save-v140','central190-save-v130','central190-save-v120','central190-save-v110','central190-save-v080','central190-save-v070','central190-save-v052','central190-save-v050','central190-save-v040','central190-save-v030','central190-save-v020','central190-save-v010']
});

const COUNTRY_CODES = new Set(['BR','AR','CL','PT','US']);
const COUNTRY_ALIASES = Object.freeze({
  Brasil:'BR', Brazil:'BR', Brésil:'BR', BR:'BR', Argentina:'AR', AR:'AR', Chile:'CL', CL:'CL',
  Portugal:'PT', PT:'PT', 'Estados Unidos':'US', 'United States':'US', 'Estados Unidos de América':'US', US:'US'
});
const MODES = new Set(['carreira','sandbox']);
const SHIFTS = new Set(['manha','tarde','noite','madrugada']);
const LANGUAGES = new Set(['pt-BR','en-US','es-419']);
const SESSION_SCREENS = new Set(['lobby','shift','dispatch','field','result','shiftreport']);

function normalizeCountry(value) { return COUNTRY_CODES.has(value) ? value : (COUNTRY_ALIASES[value] || 'BR'); }
function normalizeLanguage(value) { return LANGUAGES.has(value) ? value : 'pt-BR'; }

function normalizeTraining(training, { trainingStepIds = new Set() } = {}) {
  const source = training && typeof training === 'object' ? training : {};
  const completedSteps = uniqueStrings(source.completedSteps, trainingStepIds, 40);
  const allCompleted = trainingStepIds.size > 0 && completedSteps.length >= trainingStepIds.size;
  return {
    completedSteps,
    attempts: safeInteger(source.attempts, 0, 1000000, 0),
    firstTryCorrect: safeInteger(source.firstTryCorrect, 0, Math.max(trainingStepIds.size, 100), 0),
    certified: Boolean(source.certified) || allCompleted,
    rewardClaimed: Boolean(source.rewardClaimed),
    assistedMode: source.assistedMode !== false,
    completedAt: source.completedAt ? safeString(source.completedAt, '', 40) : null
  };
}

export function normalizePlayer(player, { avatarIds = new Set(), incidentIds = new Set(), trainingStepIds = new Set() } = {}) {
  if (!player || typeof player !== 'object') return null;
  const fallbackAvatar = [...avatarIds][0] || 'avatar-operator-01-lead';
  const avatarId = avatarIds.has(player.avatarId) ? player.avatarId : fallbackAvatar;
  const history = (Array.isArray(player.history) ? player.history : []).slice(0, 8).map((item) => ({
    incidentId: incidentIds.has(item?.incidentId) ? item.incidentId : null,
    title: safeString(item?.title, 'Ocorrência', 120),
    score: safeInteger(item?.score, 0, 100000, 0),
    grade: ['A','B','C','D'].includes(item?.grade) ? item.grade : 'D',
    time: /^\d{2,3}:\d{2}$/.test(item?.time || '') ? item.time : '00:00',
    at: safeString(item?.at, new Date(0).toISOString(), 40)
  }));
  const shiftHistory = (Array.isArray(player.shiftHistory) ? player.shiftHistory : []).slice(0, 6).map((item) => ({
    shiftRunId: safeString(item?.shiftRunId, 'shift', 120),
    shiftId: SHIFTS.has(item?.shiftId) ? item.shiftId : 'manha',
    endedAt: safeString(item?.endedAt, new Date(0).toISOString(), 40),
    summary: {
      calls: safeInteger(item?.summary?.calls, 0, 10, 0),
      completed: safeInteger(item?.summary?.completed, 0, 10, 0),
      abandoned: safeInteger(item?.summary?.abandoned, 0, 10, 0),
      averageScore: safeInteger(item?.summary?.averageScore, 0, 100000, 0),
      totalScore: safeInteger(item?.summary?.totalScore, 0, 1000000, 0),
      serviceLevel: safeInteger(item?.summary?.serviceLevel, 0, 100, 0),
      grade: ['A','B','C','D'].includes(item?.summary?.grade) ? item.summary.grade : 'D'
    }
  }));
  return {
    name: safeString(player.name, 'Operador', 22),
    country: normalizeCountry(player.country),
    mode: MODES.has(player.mode) ? player.mode : 'carreira',
    avatarId,
    language: normalizeLanguage(player.language),
    xp: safeInteger(player.xp, 0, 1000000000, 0),
    resolved: safeInteger(player.resolved, 0, 10000000, 0),
    bestTime: player.bestTime == null ? null : safeInteger(player.bestTime, 0, 86400, 0),
    history,
    shiftHistory,
    safeStreak: safeInteger(player.safeStreak, 0, 1000000, 0),
    createdAt: safeString(player.createdAt, new Date().toISOString(), 40),
    preferredShift: SHIFTS.has(player.preferredShift) ? player.preferredShift : 'manha',
    training: normalizeTraining(player.training, { trainingStepIds }),
    resources: normalizeResourceNetwork(player.resources || createInitialResourceNetwork())
  };
}

export function normalizeSession(session, context = {}) {
  const { incidentIds = new Set(), unitIds = new Set(), questionIds = new Set() } = context;
  if (!session || typeof session !== 'object') return null;
  if (!SESSION_SCREENS.has(session.screen)) return null;
  const savedAt = Date.parse(session.savedAt || '');
  if (!Number.isFinite(savedAt) || Date.now() - savedAt > 24 * 60 * 60 * 1000) return null;
  const continuousShift = normalizeContinuousShift(session.continuousShift, incidentIds);
  const incidentId = incidentIds.has(session.incidentId) ? session.incidentId : null;
  const operationalScreen = ['shift','dispatch','field','result'].includes(session.screen);
  if (operationalScreen && !incidentId) return null;
  if (!incidentId && !continuousShift && ['lobby','shiftreport'].includes(session.screen)) return null;
  const resourceNetwork = normalizeResourceNetwork(session.resourceNetwork || createInitialResourceNetwork());
  return {
    screen: session.screen,
    incidentId,
    callQueueIds: uniqueStrings(session.callQueueIds, incidentIds, 10),
    selectedUnitIds: uniqueStrings(session.selectedUnitIds, unitIds, 20),
    selectedResourceIds: normalizeSelectedResourceIds((Array.isArray(session.selectedResourceIds) && session.selectedResourceIds.length) ? session.selectedResourceIds : uniqueStrings(session.selectedUnitIds, unitIds, 20).map((typeId) => getBestAvailableResource(resourceNetwork, typeId)?.id).filter(Boolean), resourceNetwork),
    askedQuestionIds: uniqueStrings(session.askedQuestionIds, questionIds, 20),
    timerSeconds: safeInteger(session.timerSeconds, 0, 86400, 0),
    risk: safeInteger(session.risk, 0, 100, 0),
    triggeredEvents: (Array.isArray(session.triggeredEvents) ? session.triggeredEvents : []).map((v) => safeInteger(v, 0, 1000, 0)).filter((v,i,a) => a.indexOf(v) === i).slice(0,100),
    selectedShift: SHIFTS.has(session.selectedShift) ? session.selectedShift : (continuousShift?.shiftId || 'manha'),
    selectedApproach: CALL_APPROACH_IDS.includes(session.selectedApproach) ? session.selectedApproach : 'direct',
    callerState: incidentId ? normalizeCallerState(session.callerState, incidentId) : null,
    questionQuality: normalizeQuestionQuality(session.questionQuality, questionIds),
    discoveredIntel: (Array.isArray(session.discoveredIntel) ? session.discoveredIntel : []).map((v) => safeString(v, '', 40)).filter(Boolean).filter((v,i,a) => a.indexOf(v) === i).slice(0,40),
    branchHistory: normalizeBranchHistory(session.branchHistory, questionIds),
    triageState: normalizeTriageState(session.triageState),
    tacticalMapState: normalizeMapState(session.tacticalMapState, incidentId || ''),
    resourceNetwork,
    dispatchCommandState: normalizeDispatchCommandState(session.dispatchCommandState, incidentId || ''),
    fieldOperationState: normalizeFieldOperationState(session.fieldOperationState, incidentId || ''),
    continuousShift,
    savedAt: new Date(savedAt).toISOString()
  };
}

export function normalizeSavePayload(payload, context = {}) {
  if (!payload || typeof payload !== 'object') return null;
  const legacyPlayer = payload.player ? payload.player : payload;
  const player = normalizePlayer(legacyPlayer, context);
  if (!player) return null;
  return { player, session: payload.player ? normalizeSession(payload.session, context) : null };
}

export function createEnvelope(payload, { appVersion, schemaVersion }) {
  const core = { schemaVersion, appVersion, savedAt: new Date().toISOString(), payload };
  return { ...core, checksum: checksumFNV1a(stableStringify(core)) };
}

export function verifyEnvelope(envelope, { schemaVersion }) {
  if (!envelope || typeof envelope !== 'object') return { ok:false, reason:'invalidFormat' };
  if (envelope.schemaVersion !== schemaVersion) return { ok:false, reason:'incompatibleSchema' };
  const { checksum, ...core } = envelope;
  if (checksum !== checksumFNV1a(stableStringify(core))) return { ok:false, reason:'invalidChecksum' };
  return { ok:true };
}

export class SafeSaveManager {
  constructor({ appVersion, schemaVersion, context, storage = globalThis.localStorage, translate = (key) => key }) {
    this.appVersion = appVersion;
    this.schemaVersion = schemaVersion;
    this.context = context;
    this.storage = storage;
    this.translate = translate;
    this.lastStatus = { source:'none', warnings:[] };
  }

  message(key, values = {}, fallback = key) { const value = this.translate(`save.${key}`, values, fallback); return value === `save.${key}` ? fallback : value; }

  parseEnvelope(raw) {
    const parsed = JSON.parse(raw);
    const verified = verifyEnvelope(parsed, { schemaVersion:this.schemaVersion });
    if (!verified.ok) throw Object.assign(new Error(verified.reason), { code:verified.reason });
    const payload = normalizeSavePayload(parsed.payload, this.context);
    if (!payload) throw Object.assign(new Error('invalidPayload'), { code:'invalidPayload' });
    return { envelope:parsed, payload };
  }

  save(payload, { createRecovery = false } = {}) {
    const normalized = normalizeSavePayload(payload, this.context);
    if (!normalized) throw new Error(this.message('invalidSave', {}, 'Tentativa de salvar dados inválidos.'));
    const envelope = createEnvelope(normalized, { appVersion:this.appVersion, schemaVersion:this.schemaVersion });
    const serialized = JSON.stringify(envelope);
    const current = this.storage.getItem(SAVE_KEYS.primary);
    if (current) {
      try { this.parseEnvelope(current); this.storage.setItem(SAVE_KEYS.backup, current); }
      catch { this.storage.setItem(SAVE_KEYS.recovery, current); }
    }
    this.storage.setItem(SAVE_KEYS.primary, serialized);
    if (createRecovery) this.storage.setItem(SAVE_KEYS.recovery, serialized);
    this.parseEnvelope(this.storage.getItem(SAVE_KEYS.primary));
    this.lastStatus = { source:'primary', warnings:[] };
    return envelope;
  }

  load() {
    const warnings = [];
    for (const [key, source] of [[SAVE_KEYS.primary,'primary'],[SAVE_KEYS.backup,'backup']]) {
      const raw = this.storage.getItem(key);
      if (!raw) continue;
      try {
        const result = this.parseEnvelope(raw);
        if (source === 'backup') {
          warnings.push(this.message('backupAutoRestored', {}, 'Save principal inválido; backup restaurado automaticamente.'));
          this.storage.setItem(SAVE_KEYS.primary, raw);
        }
        this.lastStatus = { source, warnings };
        return { ...result.payload, source, warnings };
      } catch (error) { warnings.push(`${source}: ${error.code || error.message}`); }
    }
    for (const key of SAVE_KEYS.legacy) {
      const raw = this.storage.getItem(key);
      if (!raw) continue;
      try {
        let parsed = JSON.parse(raw);
        if (parsed?.schemaVersion && parsed?.payload) parsed = parsed.payload;
        const payload = normalizeSavePayload(parsed?.payload || parsed, this.context);
        if (!payload) throw new Error('legacyInvalid');
        this.save(payload);
        warnings.push(this.message('legacyMigrated', { key }, `Save legado ${key} migrado para v0.18.0.`));
        this.lastStatus = { source:'legacy', warnings };
        return { ...payload, source:'legacy', warnings };
      } catch (error) { warnings.push(`${key}: ${error.message}`); }
    }
    this.lastStatus = { source:'none', warnings };
    return { player:null, session:null, source:'none', warnings };
  }

  restoreBackup() {
    const raw = this.storage.getItem(SAVE_KEYS.backup);
    if (!raw) return { ok:false, message:this.message('noBackup', {}, 'Nenhum backup íntegro disponível.') };
    try {
      const result = this.parseEnvelope(raw);
      this.storage.setItem(SAVE_KEYS.primary, raw);
      return { ok:true, payload:result.payload, message:this.message('backupRestored', {}, 'Backup restaurado com sucesso.') };
    } catch (error) { return { ok:false, message:this.message('backupInvalid', { reason:error.code || error.message }, `Backup inválido: ${error.message}`) }; }
  }

  clearAll() { [SAVE_KEYS.primary,SAVE_KEYS.backup,SAVE_KEYS.recovery,...SAVE_KEYS.legacy].forEach((key) => this.storage.removeItem(key)); this.lastStatus = { source:'none', warnings:[] }; }
  hasBackup() { try { const raw=this.storage.getItem(SAVE_KEYS.backup); if(!raw) return false; this.parseEnvelope(raw); return true; } catch { return false; } }
  storageSelfTest() { const key='central190-storage-selftest'; try { const value=`${Date.now()}-${Math.random()}`; this.storage.setItem(key,value); const ok=this.storage.getItem(key)===value; this.storage.removeItem(key); return ok; } catch { return false; } }
}
