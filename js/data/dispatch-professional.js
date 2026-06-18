import { safeInteger, safeString, uniqueStrings } from '../core/utils.js';

export const DISPATCH_ORDER_IDS = Object.freeze(['approach','secure','medical','pursuit','contain','airscan','support']);
export const DISPATCH_PRIORITY_IDS = Object.freeze(['normal','urgent','silent','support']);
export const DISPATCH_EVENT_IDS = Object.freeze(['enroute','trafficDelay','rerouted','arrived','needsInfo','sceneStable']);

const ORDER_TYPES = Object.freeze({
  approach:'all', secure:'police', medical:'ambulance', pursuit:'police', contain:'police', airscan:'helicopter', support:'all'
});

const INCIDENT_RULES = Object.freeze({
  'domestic-weapon-risk':{ required:['approach','secure','medical'], preferredPriority:'urgent' },
  'armed-robbery-escape':{ required:['approach','pursuit','airscan','contain'], preferredPriority:'silent' },
  'collision-victims-fuel':{ required:['approach','medical','secure'], preferredPriority:'urgent' },
  'panic-line-ambiguous-threat':{ required:['approach','secure','support'], preferredPriority:'support' },
  'kidnapping-attempt-school':{ required:['approach','contain','airscan','secure'], preferredPriority:'urgent' },
  'shots-fired-bar':{ required:['approach','secure','medical','contain'], preferredPriority:'urgent' },
  'noise-party-threat':{ required:['approach','secure','support'], preferredPriority:'normal' },
  'morning-school-traffic':{ required:['approach','medical','secure'], preferredPriority:'urgent' }
});

const TEXT = Object.freeze({
  'pt-BR': Object.freeze({
    title:'Despacho profissional', subtitle:'Ordens, prioridade e acompanhamento', statusReady:'Ordem registrada', statusPending:'Aguardando ordem', priority:'Prioridade operacional', orders:'Ordens por equipe', timeline:'Acompanhamento do deslocamento', missing:'Defina ao menos uma prioridade e uma ordem operacional.', apply:'Registrar ordem operacional', revise:'Atualizar ordem', cancel:'Cancelar unidade', redirect:'Redirecionar rota', conflict:'Conflito de rede detectado', scoreTitle:'Despacho profissional', scoreText:'Pontuação {score}/35. {covered}/{required} ordem(ns) crítica(s) coberta(s), prioridade {priority} e {events} evento(s) acompanhados.', priorityOptions:{ normal:'Normal', urgent:'Urgente', silent:'Silenciosa', support:'Apoio coordenado' }, priorityHints:{ normal:'Mantém rede equilibrada.', urgent:'Reduz tempo, aumenta pressão da equipe.', silent:'Evita alarde em risco de fuga.', support:'Coordena saúde e contenção sem escalada.' }, orderLabels:{ approach:'Aproximação segura', secure:'Isolar e proteger a cena', medical:'Atendimento médico imediato', pursuit:'Perseguir sem perder contato', contain:'Bloquear perímetro', airscan:'Varredura aérea', support:'Apoio psicossocial' }, eventLabels:{ enroute:'Equipes em deslocamento', trafficDelay:'Trânsito alterou ETA', rerouted:'Rota redirecionada', arrived:'Primeira equipe chegou', needsInfo:'Equipe solicitou complemento', sceneStable:'Cena estabilizada' }, registered:'Ordem registrada: {priority}. {count} instrução(ões) ativa(s).', cancelled:'{callSign} cancelada e liberada para retorno.', redirected:'{callSign} redirecionada para rota {route}.', locked:'Conclua a triagem antes de registrar ordens.'
  }),
  'en-US': Object.freeze({
    title:'Professional dispatch', subtitle:'Orders, priority and response tracking', statusReady:'Order logged', statusPending:'Awaiting order', priority:'Operational priority', orders:'Team orders', timeline:'Response tracking', missing:'Set at least one priority and one operational order.', apply:'Log operational order', revise:'Update order', cancel:'Cancel unit', redirect:'Redirect route', conflict:'Network conflict detected', scoreTitle:'Professional dispatch', scoreText:'Score {score}/35. {covered}/{required} critical order(s) covered, {priority} priority and {events} tracked event(s).', priorityOptions:{ normal:'Normal', urgent:'Urgent', silent:'Silent', support:'Coordinated support' }, priorityHints:{ normal:'Keeps the network balanced.', urgent:'Cuts time, increases crew pressure.', silent:'Avoids alerting flight-risk suspects.', support:'Coordinates medical care and containment.' }, orderLabels:{ approach:'Safe approach', secure:'Secure and protect scene', medical:'Immediate medical care', pursuit:'Pursue without losing contact', contain:'Block perimeter', airscan:'Air scan', support:'Psychosocial support' }, eventLabels:{ enroute:'Teams en route', trafficDelay:'Traffic changed ETA', rerouted:'Route redirected', arrived:'First team arrived', needsInfo:'Crew requested details', sceneStable:'Scene stabilized' }, registered:'Order logged: {priority}. {count} active instruction(s).', cancelled:'{callSign} cancelled and released to return.', redirected:'{callSign} redirected to {route} route.', locked:'Complete triage before logging orders.'
  }),
  'es-419': Object.freeze({
    title:'Despacho profesional', subtitle:'Órdenes, prioridad y seguimiento', statusReady:'Orden registrada', statusPending:'Esperando orden', priority:'Prioridad operativa', orders:'Órdenes por equipo', timeline:'Seguimiento del desplazamiento', missing:'Define al menos una prioridad y una orden operativa.', apply:'Registrar orden operativa', revise:'Actualizar orden', cancel:'Cancelar unidad', redirect:'Redirigir ruta', conflict:'Conflicto de red detectado', scoreTitle:'Despacho profesional', scoreText:'Puntuación {score}/35. {covered}/{required} orden(es) crítica(s) cubierta(s), prioridad {priority} y {events} evento(s) monitoreados.', priorityOptions:{ normal:'Normal', urgent:'Urgente', silent:'Silenciosa', support:'Apoyo coordinado' }, priorityHints:{ normal:'Mantiene la red equilibrada.', urgent:'Reduce tiempo y aumenta presión.', silent:'Evita alertar sospechosos con riesgo de fuga.', support:'Coordina salud y contención.' }, orderLabels:{ approach:'Aproximación segura', secure:'Aislar y proteger escena', medical:'Atención médica inmediata', pursuit:'Perseguir sin perder contacto', contain:'Bloquear perímetro', airscan:'Barrido aéreo', support:'Apoyo psicosocial' }, eventLabels:{ enroute:'Equipos en desplazamiento', trafficDelay:'Tránsito alteró ETA', rerouted:'Ruta redirigida', arrived:'Primer equipo llegó', needsInfo:'Equipo pidió más datos', sceneStable:'Escena estabilizada' }, registered:'Orden registrada: {priority}. {count} instrucción(es) activa(s).', cancelled:'{callSign} cancelada y liberada para regreso.', redirected:'{callSign} redirigida a ruta {route}.', locked:'Completa la clasificación antes de registrar órdenes.'
  })
});

function interpolate(template, values = {}) { return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`)); }
export function dispatchText(locale, key, values = {}) { const source = TEXT[locale] || TEXT['pt-BR']; const value = key.split('.').reduce((acc, part) => acc?.[part], source); return interpolate(typeof value === 'string' ? value : key, values); }
export function createInitialDispatchCommandState(incidentId = '') { return { incidentId:safeString(incidentId,''), submitted:false, priorityId:'normal', orderIds:[], unitOrders:{}, timeline:[], conflicts:[], redirects:0, cancellations:0, revisions:0 }; }
export function normalizeDispatchCommandState(state, incidentId = '') {
  const source = state && typeof state === 'object' ? state : {};
  const validPriority = DISPATCH_PRIORITY_IDS.includes(source.priorityId) ? source.priorityId : 'normal';
  const orderIds = uniqueStrings(source.orderIds, new Set(DISPATCH_ORDER_IDS), 12);
  const unitOrders = Object.fromEntries(Object.entries(source.unitOrders || {}).map(([unitId, orders]) => [safeString(unitId,''), uniqueStrings(orders, new Set(DISPATCH_ORDER_IDS), 8)]).filter(([unitId]) => unitId));
  const timeline = Array.isArray(source.timeline) ? source.timeline.slice(-12).map((item) => ({ eventId:DISPATCH_EVENT_IDS.includes(item?.eventId) ? item.eventId : 'enroute', at:safeInteger(item?.at,0,100000,0), unitId:safeString(item?.unitId,'') })) : [];
  return { incidentId:safeString(source.incidentId || incidentId,''), submitted:Boolean(source.submitted), priorityId:validPriority, orderIds, unitOrders, timeline, conflicts:Array.isArray(source.conflicts)?source.conflicts.slice(-8):[], redirects:safeInteger(source.redirects,0,99,0), cancellations:safeInteger(source.cancellations,0,99,0), revisions:safeInteger(source.revisions,0,99,0) };
}
export function getDispatchRule(incidentId) { return INCIDENT_RULES[incidentId] || { required:['approach'], preferredPriority:'normal' }; }
export function compatibleOrdersForType(typeId) { return DISPATCH_ORDER_IDS.filter((id) => ORDER_TYPES[id] === 'all' || ORDER_TYPES[id] === typeId || (id === 'support' && typeId !== 'helicopter')); }
export function progressDispatchTimeline(state, selectedResources = [], timerSeconds = 0) {
  const next = normalizeDispatchCommandState(state, state?.incidentId);
  const known = new Set(next.timeline.map((event) => event.eventId));
  const selectedCount = Array.isArray(selectedResources) ? selectedResources.length : 0;
  if (selectedCount && !known.has('enroute')) next.timeline.push({ eventId:'enroute', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  if (selectedCount && timerSeconds >= 35 && !known.has('trafficDelay')) next.timeline.push({ eventId:'trafficDelay', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  if (next.redirects > 0 && !known.has('rerouted')) next.timeline.push({ eventId:'rerouted', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  if (selectedCount && timerSeconds >= 55 && !known.has('arrived')) next.timeline.push({ eventId:'arrived', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  if (next.orderIds.length >= 2 && !known.has('needsInfo')) next.timeline.push({ eventId:'needsInfo', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  if (next.submitted && next.timeline.length >= 4 && !known.has('sceneStable')) next.timeline.push({ eventId:'sceneStable', at:timerSeconds, unitId:selectedResources[0]?.id || '' });
  next.timeline = next.timeline.slice(-12);
  return next;
}
export function assessProfessionalDispatch(incidentId, state, selectedResources = []) {
  const normalized = normalizeDispatchCommandState(state, incidentId);
  const rule = getDispatchRule(incidentId);
  const covered = rule.required.filter((id) => normalized.orderIds.includes(id)).length;
  const required = rule.required.length;
  const priorityCorrect = normalized.priorityId === rule.preferredPriority;
  const selectedCount = Array.isArray(selectedResources) ? selectedResources.length : 0;
  const coverageScore = required ? Math.round((covered/required)*18) : 12;
  const priorityScore = priorityCorrect ? 8 : 2;
  const trackingScore = Math.min(6, normalized.timeline.length * 2);
  const penalty = Math.min(10, normalized.cancellations*3 + normalized.conflicts.length*2 + Math.max(0, normalized.redirects-1)*2);
  const score = Math.max(0, Math.min(35, coverageScore + priorityScore + trackingScore + (selectedCount ? 3 : 0) - penalty));
  return { score, ok:score>=22 && covered>=Math.max(1, required-1), covered, required, priorityCorrect, priorityId:normalized.priorityId, eventCount:normalized.timeline.length, conflicts:normalized.conflicts, cancellations:normalized.cancellations, redirects:normalized.redirects };
}
export function validateDispatchCommandCatalog(incidentIds = []) {
  const errors=[];
  for (const id of incidentIds) {
    if (!INCIDENT_RULES[id]) errors.push(`sem regra de despacho profissional: ${id}`);
    const rule=INCIDENT_RULES[id];
    if (rule) {
      for (const order of rule.required) if (!DISPATCH_ORDER_IDS.includes(order)) errors.push(`${id}: ordem inválida ${order}`);
      if (!DISPATCH_PRIORITY_IDS.includes(rule.preferredPriority)) errors.push(`${id}: prioridade inválida`);
    }
  }
  return { ok:errors.length===0, errors, orders:DISPATCH_ORDER_IDS.length, priorities:DISPATCH_PRIORITY_IDS.length, events:DISPATCH_EVENT_IDS.length, profiles:Object.keys(INCIDENT_RULES).length };
}
