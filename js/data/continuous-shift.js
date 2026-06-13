import { safeInteger, safeString } from '../core/utils.js';

export const SHIFT_CALL_STATUS_IDS = Object.freeze(['incoming','waiting','active','paused','completed','abandoned']);
export const SHIFT_STATUS_IDS = Object.freeze(['idle','active','completed','closed']);
export const SHIFT_QUEUE_SIZE = 3;

const WAIT_LIMITS = Object.freeze({ critical:150, high:190, medium:240, low:300 });
const ESCALATION_MARKS = Object.freeze({ critical:[45,95], high:[60,125], medium:[80,165], low:[100,210] });

function priorityFromDescriptor(item = {}) {
  const risk = Number(item.baseRisk || 0);
  if (risk >= 84) return 'critical';
  if (risk >= 68) return 'high';
  if (risk >= 52) return 'medium';
  return 'low';
}

function waitLimit(priorityId) { return WAIT_LIMITS[priorityId] || WAIT_LIMITS.medium; }
function escalationMarks(priorityId) { return ESCALATION_MARKS[priorityId] || ESCALATION_MARKS.medium; }

function cloneSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return null;
  try { return JSON.parse(JSON.stringify(snapshot)); } catch { return null; }
}

export function createContinuousShift(descriptors = [], shiftId = 'manha', nowIso = new Date().toISOString()) {
  const selected = descriptors.slice(0, SHIFT_QUEUE_SIZE);
  const calls = selected.map((item, index) => {
    const priorityId = priorityFromDescriptor(item);
    const receivedAt = index === 0 ? 0 : index === 1 ? 18 : 42;
    return {
      callId: `call-${index + 1}-${safeString(item.id, 'incident', 80)}`,
      incidentId: safeString(item.id, '', 80),
      priorityId,
      status: index === 0 ? 'active' : 'incoming',
      receivedAt,
      waitSeconds: 0,
      activeSeconds: 0,
      escalations: 0,
      maxWaitSeconds: waitLimit(priorityId),
      snapshot: null,
      result: null,
      completedAt: null,
      abandonedAt: null
    };
  });
  return {
    shiftRunId: `shift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    shiftId: safeString(shiftId, 'manha', 20),
    status: calls.length ? 'active' : 'idle',
    startedAt: safeString(nowIso, new Date().toISOString(), 40),
    endedAt: null,
    elapsedSeconds: 0,
    activeCallId: calls[0]?.callId || null,
    calls,
    events: calls.length ? [{ type:'shift-started', at:0, callId:calls[0].callId }] : [],
    summary: null
  };
}

function normalizeResult(result) {
  if (!result || typeof result !== 'object') return null;
  return {
    score: safeInteger(result.score, 0, 100000, 0),
    grade: ['A','B','C','D'].includes(result.grade) ? result.grade : 'D',
    time: /^\d{2,3}:\d{2}$/.test(result.time || '') ? result.time : '00:00',
    incidentTitle: safeString(result.incidentTitle, '', 160),
    outcomeId: safeString(result.outcomeId, 'partial', 30)
  };
}

export function normalizeContinuousShift(state, incidentIds = new Set()) {
  if (!state || typeof state !== 'object') return null;
  const validIncidents = incidentIds instanceof Set ? incidentIds : new Set(incidentIds || []);
  const calls = (Array.isArray(state.calls) ? state.calls : []).slice(0, SHIFT_QUEUE_SIZE).map((call, index) => {
    const incidentId = safeString(call?.incidentId, '', 80);
    if (!incidentId || (validIncidents.size && !validIncidents.has(incidentId))) return null;
    const priorityId = ['critical','high','medium','low'].includes(call?.priorityId) ? call.priorityId : 'medium';
    const status = SHIFT_CALL_STATUS_IDS.includes(call?.status) ? call.status : (index === 0 ? 'active' : 'waiting');
    return {
      callId: safeString(call?.callId, `call-${index + 1}-${incidentId}`, 120),
      incidentId,
      priorityId,
      status,
      receivedAt: safeInteger(call?.receivedAt, 0, 86400, index === 0 ? 0 : index * 20),
      waitSeconds: safeInteger(call?.waitSeconds, 0, 86400, 0),
      activeSeconds: safeInteger(call?.activeSeconds, 0, 86400, 0),
      escalations: safeInteger(call?.escalations, 0, 10, 0),
      maxWaitSeconds: safeInteger(call?.maxWaitSeconds, 30, 3600, waitLimit(priorityId)),
      snapshot: cloneSnapshot(call?.snapshot),
      result: normalizeResult(call?.result),
      completedAt: call?.completedAt ? safeString(call.completedAt, '', 40) : null,
      abandonedAt: call?.abandonedAt ? safeString(call.abandonedAt, '', 40) : null
    };
  }).filter(Boolean);
  if (!calls.length) return null;
  let activeCallId = safeString(state.activeCallId, '', 120) || null;
  const activeCalls = calls.filter((call) => call.status === 'active');
  if (activeCalls.length > 1) activeCalls.slice(1).forEach((call) => { call.status = 'paused'; });
  if (!calls.some((call) => call.callId === activeCallId && call.status === 'active')) activeCallId = activeCalls[0]?.callId || null;
  const status = SHIFT_STATUS_IDS.includes(state.status) ? state.status : 'active';
  return {
    shiftRunId: safeString(state.shiftRunId, `shift-${Date.now()}`, 120),
    shiftId: safeString(state.shiftId, 'manha', 20),
    status,
    startedAt: safeString(state.startedAt, new Date().toISOString(), 40),
    endedAt: state.endedAt ? safeString(state.endedAt, '', 40) : null,
    elapsedSeconds: safeInteger(state.elapsedSeconds, 0, 172800, 0),
    activeCallId,
    calls,
    events: (Array.isArray(state.events) ? state.events : []).slice(-120).map((event) => ({
      type: safeString(event?.type, 'event', 50),
      at: safeInteger(event?.at, 0, 172800, 0),
      callId: event?.callId ? safeString(event.callId, '', 120) : null,
      detail: event?.detail ? safeString(event.detail, '', 120) : null
    })),
    summary: state.summary && typeof state.summary === 'object' ? {
      calls: safeInteger(state.summary.calls, 0, SHIFT_QUEUE_SIZE, calls.length),
      completed: safeInteger(state.summary.completed, 0, SHIFT_QUEUE_SIZE, 0),
      abandoned: safeInteger(state.summary.abandoned, 0, SHIFT_QUEUE_SIZE, 0),
      averageScore: safeInteger(state.summary.averageScore, 0, 100000, 0),
      totalScore: safeInteger(state.summary.totalScore, 0, 1000000, 0),
      serviceLevel: safeInteger(state.summary.serviceLevel, 0, 100, 0),
      grade: ['A','B','C','D'].includes(state.summary.grade) ? state.summary.grade : 'D'
    } : null
  };
}

function pushEvent(state, type, callId = null, detail = null) {
  state.events.push({ type, callId, detail, at:state.elapsedSeconds });
  state.events = state.events.slice(-120);
}

function chooseNextCall(calls) {
  const priorityWeight = {critical:4,high:3,medium:2,low:1};
  return calls.filter((call) => ['waiting','paused'].includes(call.status))
    .sort((a,b) => (priorityWeight[b.priorityId] - priorityWeight[a.priorityId]) || (b.waitSeconds - a.waitSeconds))[0] || null;
}

export function advanceContinuousShift(input, seconds = 1) {
  const state = normalizeContinuousShift(input) || input;
  if (!state || state.status !== 'active') return { state, events:[] };
  const delta = Math.max(1, safeInteger(seconds, 1, 3600, 1));
  const generated = [];
  for (let tick = 0; tick < delta; tick += 1) {
    state.elapsedSeconds += 1;
    for (const call of state.calls) {
      if (call.status === 'incoming' && state.elapsedSeconds >= call.receivedAt) {
        call.status = 'waiting';
        const event = {type:'call-arrived',callId:call.callId,at:state.elapsedSeconds};
        state.events.push(event); generated.push(event);
      }
      if (['waiting','paused'].includes(call.status)) {
        call.waitSeconds += 1;
        const marks = escalationMarks(call.priorityId);
        if (call.escalations < marks.length && call.waitSeconds >= marks[call.escalations]) {
          call.escalations += 1;
          const event = {type:'call-escalated',callId:call.callId,detail:String(call.escalations),at:state.elapsedSeconds};
          state.events.push(event); generated.push(event);
        }
        if (call.waitSeconds >= call.maxWaitSeconds) {
          call.status = 'abandoned';
          call.abandonedAt = new Date().toISOString();
          const event = {type:'call-abandoned',callId:call.callId,at:state.elapsedSeconds};
          state.events.push(event); generated.push(event);
        }
      } else if (call.status === 'active') call.activeSeconds += 1;
    }
    if (!state.calls.some((call) => call.status === 'active')) {
      const next = chooseNextCall(state.calls);
      if (next) {
        next.status = 'active';
        state.activeCallId = next.callId;
        const event = {type:'call-auto-activated',callId:next.callId,at:state.elapsedSeconds};
        state.events.push(event); generated.push(event);
      } else state.activeCallId = null;
    }
  }
  state.events = state.events.slice(-120);
  return { state, events:generated };
}

export function switchActiveCall(input, targetCallId, currentSnapshot = null) {
  const state = input;
  if (!state || state.status !== 'active') return { state, ok:false, reason:'inactive' };
  const target = state.calls.find((call) => call.callId === targetCallId);
  if (!target || !['waiting','paused'].includes(target.status)) return { state, ok:false, reason:'unavailable' };
  const current = state.calls.find((call) => call.status === 'active');
  if (current) {
    current.status = 'paused';
    current.snapshot = cloneSnapshot(currentSnapshot);
    pushEvent(state,'call-paused',current.callId);
  }
  target.status = 'active';
  state.activeCallId = target.callId;
  pushEvent(state,target.snapshot ? 'call-resumed' : 'call-activated',target.callId);
  return { state, ok:true, target };
}

export function storeActiveCallSnapshot(input, snapshot) {
  const state = input;
  if (!state) return state;
  const active = state.calls.find((call) => call.callId === state.activeCallId);
  if (active && active.status === 'active') active.snapshot = cloneSnapshot(snapshot);
  return state;
}

export function completeActiveCall(input, result = {}) {
  const state = input;
  if (!state) return { state, next:null };
  const active = state.calls.find((call) => call.callId === state.activeCallId);
  if (!active) return { state, next:null };
  active.status = 'completed';
  active.snapshot = null;
  active.result = normalizeResult(result);
  active.completedAt = new Date().toISOString();
  pushEvent(state,'call-completed',active.callId,active.result?.grade || null);
  let next = chooseNextCall(state.calls);
  if (!next) {
    next = state.calls.filter((call) => call.status === 'incoming').sort((a,b) => a.receivedAt - b.receivedAt)[0] || null;
    if (next) { next.receivedAt = state.elapsedSeconds; next.status = 'waiting'; }
  }
  if (next) {
    next.status = 'active';
    state.activeCallId = next.callId;
    pushEvent(state,next.snapshot ? 'call-resumed' : 'call-activated',next.callId);
  } else state.activeCallId = null;
  if (!state.calls.some((call) => ['incoming','waiting','paused','active'].includes(call.status))) state.status = 'completed';
  return { state, next };
}

export function closeContinuousShift(input, { abandonPending = true } = {}) {
  const state = input;
  if (!state) return null;
  if (abandonPending) {
    state.calls.forEach((call) => {
      if (['incoming','waiting','paused','active'].includes(call.status)) {
        call.status = 'abandoned';
        call.abandonedAt = new Date().toISOString();
        pushEvent(state,'call-abandoned',call.callId,'shift-closed');
      }
    });
  }
  state.activeCallId = null;
  state.status = state.calls.every((call) => ['completed','abandoned'].includes(call.status)) ? 'completed' : 'closed';
  state.endedAt = new Date().toISOString();
  state.summary = buildContinuousShiftSummary(state);
  return state;
}

export function buildContinuousShiftSummary(input) {
  const state = input;
  const calls = state?.calls || [];
  const completed = calls.filter((call) => call.status === 'completed');
  const abandoned = calls.filter((call) => call.status === 'abandoned');
  const totalScore = completed.reduce((sum, call) => sum + Number(call.result?.score || 0), 0);
  const averageScore = completed.length ? Math.round(totalScore / completed.length) : 0;
  const answeredWithinTarget = calls.filter((call) => call.status === 'completed' && call.waitSeconds <= Math.round(call.maxWaitSeconds * .65)).length;
  const serviceLevel = calls.length ? Math.max(0, Math.round(((answeredWithinTarget + completed.length - abandoned.length) / (calls.length * 2)) * 100)) : 0;
  const grade = abandoned.length === 0 && averageScore >= 165 && serviceLevel >= 75 ? 'A'
    : abandoned.length <= 1 && averageScore >= 125 && serviceLevel >= 55 ? 'B'
      : completed.length >= 1 && averageScore >= 85 ? 'C' : 'D';
  return { calls:calls.length, completed:completed.length, abandoned:abandoned.length, averageScore, totalScore, serviceLevel, grade };
}

export function continuousShiftText(locale, path, values = {}) {
  const pack = TEXT[locale] || TEXT['pt-BR'];
  const value = path.split('.').reduce((node,key) => node?.[key], pack);
  return String(value ?? path).replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

export function validateContinuousShiftCatalog(incidentIds = []) {
  const ids = Array.isArray(incidentIds) ? incidentIds : [...incidentIds];
  const errors = [];
  if (ids.length < SHIFT_QUEUE_SIZE) errors.push('O plantão contínuo exige ao menos três ocorrências.');
  for (const locale of ['pt-BR','en-US','es-419']) {
    if (!TEXT[locale]) errors.push(`Texto ausente: ${locale}`);
    for (const key of ['title','queue','switch','reportTitle','endShift']) if (!TEXT[locale]?.[key]) errors.push(`${locale}.${key} ausente`);
  }
  return { ok:errors.length === 0, errors, warnings:[], queueSize:SHIFT_QUEUE_SIZE, statuses:SHIFT_CALL_STATUS_IDS.length, locales:3 };
}

const TEXT = Object.freeze({
  'pt-BR': Object.freeze({
    title:'Plantão contínuo', subtitle:'Fila viva, espera e retomada operacional', queue:'Fila de chamadas', active:'Em atendimento', waiting:'Em espera', incoming:'Entrando', paused:'Pausada', completed:'Concluída', abandoned:'Abandonada', switch:'Atender esta chamada', resume:'Retomar chamada', unavailable:'Esta chamada ainda não está disponível.', cannotSwitch:'Finalize ou retorne da operação de campo antes de alternar chamadas.', callArrived:'Nova chamada entrou na fila.', callEscalated:'Uma chamada em espera agravou o risco.', callAbandoned:'O solicitante abandonou uma chamada após espera excessiva.', shiftActive:'Plantão em andamento', elapsed:'Tempo do plantão', queueCount:'{count} pendente(s)', wait:'Espera {time}', receivedIn:'Entrada em {time}', priority:{critical:'Crítica',high:'Alta',medium:'Média',low:'Baixa'}, reportTitle:'Relatório consolidado do turno', reportSubtitle:'Desempenho geral do plantão', calls:'Chamadas', resolved:'Concluídas', lost:'Abandonadas', average:'Média', serviceLevel:'Nível de serviço', totalXp:'XP operacional', endShift:'Encerrar plantão', continueShift:'Continuar plantão', returnLobby:'Voltar ao lobby', noActive:'Não existe plantão ativo.', closed:'Plantão encerrado e relatório consolidado.', nextCall:'Próxima chamada', finishReport:'Ver relatório do turno', activeShiftLobby:'Existe um plantão em andamento. Retome para preservar a fila e os tempos de espera.', endConfirm:'Encerrar agora marcará chamadas pendentes como abandonadas. Continuar?', statusLine:'{completed}/{total} concluídas • {abandoned} abandonada(s) • {pending} pendente(s)' 
  }),
  'en-US': Object.freeze({
    title:'Continuous shift', subtitle:'Live queue, waiting and operational resume', queue:'Call queue', active:'Being handled', waiting:'Waiting', incoming:'Incoming', paused:'Paused', completed:'Completed', abandoned:'Abandoned', switch:'Handle this call', resume:'Resume call', unavailable:'This call is not available yet.', cannotSwitch:'Finish or leave the field operation before switching calls.', callArrived:'A new call entered the queue.', callEscalated:'A waiting call escalated in risk.', callAbandoned:'The caller abandoned a call after excessive waiting.', shiftActive:'Shift in progress', elapsed:'Shift time', queueCount:'{count} pending', wait:'Wait {time}', receivedIn:'Arrives in {time}', priority:{critical:'Critical',high:'High',medium:'Medium',low:'Low'}, reportTitle:'Consolidated shift report', reportSubtitle:'Overall shift performance', calls:'Calls', resolved:'Completed', lost:'Abandoned', average:'Average', serviceLevel:'Service level', totalXp:'Operational XP', endShift:'End shift', continueShift:'Continue shift', returnLobby:'Return to lobby', noActive:'There is no active shift.', closed:'Shift closed and consolidated report generated.', nextCall:'Next call', finishReport:'View shift report', activeShiftLobby:'A shift is in progress. Resume it to preserve the queue and waiting times.', endConfirm:'Ending now will mark pending calls as abandoned. Continue?', statusLine:'{completed}/{total} completed • {abandoned} abandoned • {pending} pending'
  }),
  'es-419': Object.freeze({
    title:'Turno continuo', subtitle:'Cola activa, espera y reanudación operativa', queue:'Cola de llamadas', active:'En atención', waiting:'En espera', incoming:'Entrando', paused:'Pausada', completed:'Completada', abandoned:'Abandonada', switch:'Atender esta llamada', resume:'Retomar llamada', unavailable:'Esta llamada todavía no está disponible.', cannotSwitch:'Finaliza o sal de la operación de campo antes de cambiar de llamada.', callArrived:'Una nueva llamada entró en la cola.', callEscalated:'Una llamada en espera aumentó su riesgo.', callAbandoned:'El solicitante abandonó una llamada por espera excesiva.', shiftActive:'Turno en curso', elapsed:'Tiempo del turno', queueCount:'{count} pendiente(s)', wait:'Espera {time}', receivedIn:'Entrada en {time}', priority:{critical:'Crítica',high:'Alta',medium:'Media',low:'Baja'}, reportTitle:'Informe consolidado del turno', reportSubtitle:'Rendimiento general del turno', calls:'Llamadas', resolved:'Completadas', lost:'Abandonadas', average:'Promedio', serviceLevel:'Nivel de servicio', totalXp:'XP operativo', endShift:'Cerrar turno', continueShift:'Continuar turno', returnLobby:'Volver al lobby', noActive:'No hay un turno activo.', closed:'Turno cerrado e informe consolidado generado.', nextCall:'Próxima llamada', finishReport:'Ver informe del turno', activeShiftLobby:'Hay un turno en curso. Retómalo para conservar la cola y los tiempos de espera.', endConfirm:'Cerrar ahora marcará las llamadas pendientes como abandonadas. ¿Continuar?', statusLine:'{completed}/{total} completadas • {abandoned} abandonada(s) • {pending} pendiente(s)'
  })
});
