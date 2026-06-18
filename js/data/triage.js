export const TRIAGE_PRIORITY_IDS = Object.freeze(['P1','P2','P3','P4']);
export const TRIAGE_NATURE_IDS = Object.freeze(['violence','robbery','traffic-rescue','threat','child-risk','firearm','public-order']);
export const TRIAGE_PROTOCOL_IDS = Object.freeze([
  'confirm-location','life-threat','victim-count','weapon-suspect','caller-safety','keep-line',
  'medical-guidance','traffic-control','protect-vulnerable','broadcast-alert','preserve-scene'
]);

export const TRIAGE_PRIORITIES = Object.freeze([
  { id:'P1', rank:1, tone:'critical' },
  { id:'P2', rank:2, tone:'urgent' },
  { id:'P3', rank:3, tone:'priority' },
  { id:'P4', rank:4, tone:'routine' }
]);

export const TRIAGE_PROFILES = Object.freeze({
  'domestic-weapon-risk': { priorityId:'P1', natureId:'violence', mandatoryProtocols:['confirm-location','life-threat','weapon-suspect','caller-safety','keep-line','protect-vulnerable'] },
  'armed-robbery-escape': { priorityId:'P1', natureId:'robbery', mandatoryProtocols:['confirm-location','life-threat','weapon-suspect','caller-safety','broadcast-alert'] },
  'collision-victims-fuel': { priorityId:'P1', natureId:'traffic-rescue', mandatoryProtocols:['confirm-location','life-threat','victim-count','medical-guidance','traffic-control','preserve-scene'] },
  'panic-line-ambiguous-threat': { priorityId:'P2', natureId:'threat', mandatoryProtocols:['confirm-location','life-threat','weapon-suspect','caller-safety','keep-line'] },
  'kidnapping-attempt-school': { priorityId:'P1', natureId:'child-risk', mandatoryProtocols:['confirm-location','life-threat','protect-vulnerable','broadcast-alert','caller-safety','keep-line'] },
  'shots-fired-bar': { priorityId:'P1', natureId:'firearm', mandatoryProtocols:['confirm-location','life-threat','victim-count','weapon-suspect','medical-guidance','preserve-scene'] },
  'noise-party-threat': { priorityId:'P2', natureId:'public-order', mandatoryProtocols:['confirm-location','life-threat','weapon-suspect','caller-safety'] },
  'morning-school-traffic': { priorityId:'P1', natureId:'traffic-rescue', mandatoryProtocols:['confirm-location','life-threat','victim-count','medical-guidance','traffic-control','protect-vulnerable'] }
});

const TEXT = Object.freeze({
  'pt-BR': {
    panelTitle:'Triagem profissional', panelEyebrow:'Classificação operacional', statusPending:'Não classificada', statusReady:'Classificada', confidence:'Confiança da triagem',
    priorityLabel:'Nível de prioridade', natureLabel:'Natureza principal', protocolLabel:'Protocolos operacionais', submit:'Registrar triagem', revise:'Atualizar triagem',
    missing:'Selecione prioridade, natureza e pelo menos um protocolo.', registered:'Triagem registrada: {priority} • {nature}.', revised:'Triagem atualizada. Revisões: {count}.',
    dispatchBlocked:'Registre a triagem profissional antes de abrir o despacho.', undertriage:'Subtriagem detectada: o risco operacional aumentou.', overtriage:'Classificação acima do necessário: atenção ao uso da rede.', exact:'Classificação compatível com os indícios confirmados.',
    pendingHint:'Colete localização, risco imediato e vítimas antes de classificar.', lowConfidence:'Baixa confiança: ainda faltam informações críticas.', mediumConfidence:'Confiança moderada: a decisão pode ser revisada.', highConfidence:'Alta confiança: os dados essenciais foram confirmados.',
    scoreTitle:'Triagem e protocolo', scoreText:'Prioridade {priorityResult}; natureza {natureResult}; protocolos {covered}/{required}; confiança {confidence}%.', correct:'correta', incorrect:'incorreta',
    priorities:{ P1:['P1 • Crítica','Ameaça imediata à vida, arma, sequestro ou trauma grave.'], P2:['P2 • Urgente','Risco relevante ou provável escalada sem ameaça letal confirmada.'], P3:['P3 • Prioritária','Resposta necessária com cena estável e sem perigo imediato.'], P4:['P4 • Não emergencial','Demanda administrativa ou sem necessidade de resposta imediata.'] },
    natures:{ violence:'Violência interpessoal', robbery:'Roubo ou crime patrimonial', 'traffic-rescue':'Trânsito e resgate', threat:'Ameaça ou perseguição', 'child-risk':'Criança ou vulnerável em risco', firearm:'Arma de fogo ou disparos', 'public-order':'Ordem pública e conflito' },
    protocols:{
      'confirm-location':'Confirmar endereço, referência e acesso', 'life-threat':'Verificar ameaça imediata à vida', 'victim-count':'Contar vítimas e condição aparente',
      'weapon-suspect':'Identificar arma, suspeito e direção', 'caller-safety':'Orientar abrigo e não confronto', 'keep-line':'Manter a linha aberta quando seguro',
      'medical-guidance':'Acionar suporte médico e evitar movimentação indevida', 'traffic-control':'Prevenir risco secundário e controlar o fluxo',
      'protect-vulnerable':'Priorizar criança, idoso ou pessoa vulnerável', 'broadcast-alert':'Difundir alerta de suspeito ou veículo', 'preserve-scene':'Preservar local e possíveis evidências'
    }
  },
  'en-US': {
    panelTitle:'Professional triage', panelEyebrow:'Operational classification', statusPending:'Not classified', statusReady:'Classified', confidence:'Triage confidence',
    priorityLabel:'Priority level', natureLabel:'Primary incident type', protocolLabel:'Operational protocols', submit:'Register triage', revise:'Update triage',
    missing:'Select a priority, incident type and at least one protocol.', registered:'Triage registered: {priority} • {nature}.', revised:'Triage updated. Revisions: {count}.',
    dispatchBlocked:'Register professional triage before opening dispatch.', undertriage:'Under-triage detected: operational risk increased.', overtriage:'Classification exceeds current need: protect network capacity.', exact:'Classification matches the confirmed indicators.',
    pendingHint:'Confirm location, immediate danger and victims before classifying.', lowConfidence:'Low confidence: critical information is still missing.', mediumConfidence:'Moderate confidence: the decision may need revision.', highConfidence:'High confidence: essential data has been confirmed.',
    scoreTitle:'Triage and protocol', scoreText:'Priority {priorityResult}; type {natureResult}; protocols {covered}/{required}; confidence {confidence}%.', correct:'correct', incorrect:'incorrect',
    priorities:{ P1:['P1 • Critical','Immediate threat to life, weapon, abduction or major trauma.'], P2:['P2 • Urgent','Relevant risk or likely escalation without confirmed lethal threat.'], P3:['P3 • Priority','Response required with a stable scene and no immediate danger.'], P4:['P4 • Non-emergency','Administrative demand or no immediate response required.'] },
    natures:{ violence:'Interpersonal violence', robbery:'Robbery or property crime', 'traffic-rescue':'Traffic and rescue', threat:'Threat or stalking', 'child-risk':'Child or vulnerable person at risk', firearm:'Firearm or shots fired', 'public-order':'Public order and conflict' },
    protocols:{
      'confirm-location':'Confirm address, landmark and access', 'life-threat':'Check for immediate threat to life', 'victim-count':'Count victims and apparent condition',
      'weapon-suspect':'Identify weapon, suspect and direction', 'caller-safety':'Guide caller to shelter and avoid confrontation', 'keep-line':'Keep the line open when safe',
      'medical-guidance':'Request medical support and avoid unsafe movement', 'traffic-control':'Prevent secondary risk and control traffic',
      'protect-vulnerable':'Prioritize children, elderly or vulnerable people', 'broadcast-alert':'Broadcast suspect or vehicle alert', 'preserve-scene':'Preserve the scene and possible evidence'
    }
  },
  'es-419': {
    panelTitle:'Triaje profesional', panelEyebrow:'Clasificación operativa', statusPending:'Sin clasificar', statusReady:'Clasificada', confidence:'Confianza del triaje',
    priorityLabel:'Nivel de prioridad', natureLabel:'Naturaleza principal', protocolLabel:'Protocolos operativos', submit:'Registrar triaje', revise:'Actualizar triaje',
    missing:'Selecciona prioridad, naturaleza y al menos un protocolo.', registered:'Triaje registrado: {priority} • {nature}.', revised:'Triaje actualizado. Revisiones: {count}.',
    dispatchBlocked:'Registra el triaje profesional antes de abrir el despacho.', undertriage:'Se detectó subtriaje: aumentó el riesgo operativo.', overtriage:'La clasificación supera la necesidad actual: protege la capacidad de la red.', exact:'La clasificación coincide con los indicios confirmados.',
    pendingHint:'Confirma ubicación, peligro inmediato y víctimas antes de clasificar.', lowConfidence:'Baja confianza: todavía falta información crítica.', mediumConfidence:'Confianza moderada: la decisión puede requerir revisión.', highConfidence:'Alta confianza: los datos esenciales fueron confirmados.',
    scoreTitle:'Triaje y protocolo', scoreText:'Prioridad {priorityResult}; naturaleza {natureResult}; protocolos {covered}/{required}; confianza {confidence}%.', correct:'correcta', incorrect:'incorrecta',
    priorities:{ P1:['P1 • Crítica','Amenaza inmediata a la vida, arma, secuestro o trauma grave.'], P2:['P2 • Urgente','Riesgo relevante o probable escalada sin amenaza letal confirmada.'], P3:['P3 • Prioritaria','Respuesta necesaria con escena estable y sin peligro inmediato.'], P4:['P4 • No emergente','Demanda administrativa o sin respuesta inmediata necesaria.'] },
    natures:{ violence:'Violencia interpersonal', robbery:'Robo o delito patrimonial', 'traffic-rescue':'Tránsito y rescate', threat:'Amenaza o persecución', 'child-risk':'Niño o persona vulnerable en riesgo', firearm:'Arma de fuego o disparos', 'public-order':'Orden público y conflicto' },
    protocols:{
      'confirm-location':'Confirmar dirección, referencia y acceso', 'life-threat':'Verificar amenaza inmediata a la vida', 'victim-count':'Contar víctimas y condición aparente',
      'weapon-suspect':'Identificar arma, sospechoso y dirección', 'caller-safety':'Orientar refugio y evitar confrontación', 'keep-line':'Mantener la línea abierta cuando sea seguro',
      'medical-guidance':'Solicitar apoyo médico y evitar movimientos inseguros', 'traffic-control':'Prevenir riesgo secundario y controlar el tránsito',
      'protect-vulnerable':'Priorizar niños, mayores o personas vulnerables', 'broadcast-alert':'Difundir alerta de sospechoso o vehículo', 'preserve-scene':'Preservar el lugar y posibles evidencias'
    }
  }
});

function interpolate(template, values = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export function getTriageText(locale = 'pt-BR') { return TEXT[locale] || TEXT['pt-BR']; }
export function triageText(locale, key, values = {}) {
  const source = getTriageText(locale);
  const value = key.split('.').reduce((node, part) => node?.[part], source);
  return interpolate(value ?? key, values);
}
export function getTriageProfile(incidentId) { return TRIAGE_PROFILES[incidentId] || null; }

export function createInitialTriageState() {
  return { priorityId:null, natureId:null, protocolIds:[], submitted:false, revisions:0, confidence:0, lastAssessment:null };
}

export function normalizeTriageState(value) {
  const source = value && typeof value === 'object' ? value : {};
  const priorityId = TRIAGE_PRIORITY_IDS.includes(source.priorityId) ? source.priorityId : null;
  const natureId = TRIAGE_NATURE_IDS.includes(source.natureId) ? source.natureId : null;
  const protocolIds = (Array.isArray(source.protocolIds) ? source.protocolIds : []).filter((id, index, all) => TRIAGE_PROTOCOL_IDS.includes(id) && all.indexOf(id) === index).slice(0, TRIAGE_PROTOCOL_IDS.length);
  const submitted = Boolean(source.submitted && priorityId && natureId && protocolIds.length);
  return {
    priorityId, natureId, protocolIds, submitted,
    revisions: Math.max(0, Math.min(99, Number.isFinite(Number(source.revisions)) ? Math.trunc(Number(source.revisions)) : 0)),
    confidence: Math.max(0, Math.min(100, Number.isFinite(Number(source.confidence)) ? Math.round(Number(source.confidence)) : 0)),
    lastAssessment: source.lastAssessment && typeof source.lastAssessment === 'object' ? {
      priorityCorrect:Boolean(source.lastAssessment.priorityCorrect), natureCorrect:Boolean(source.lastAssessment.natureCorrect),
      covered:Math.max(0, Math.trunc(Number(source.lastAssessment.covered) || 0)), required:Math.max(0, Math.trunc(Number(source.lastAssessment.required) || 0)),
      undertriage:Boolean(source.lastAssessment.undertriage), overtriage:Boolean(source.lastAssessment.overtriage)
    } : null
  };
}

export function calculateTriageConfidence({ askedQuestionIds = [], discoveredIntel = [], callerState = null } = {}) {
  const asked = new Set(askedQuestionIds);
  let score = 8;
  if (asked.has('location')) score += 24;
  if (asked.has('victims')) score += 18;
  if (asked.has('weapon')) score += 18;
  if (asked.has('suspect')) score += 12;
  if (asked.has('safety')) score += 12;
  score += Math.min(10, (Array.isArray(discoveredIntel) ? discoveredIntel.length : 0) * 2);
  if (callerState) score += Math.round(((Number(callerState.clarity) || 0) / 100) * 8);
  return Math.max(0, Math.min(100, score));
}

export function assessTriage(incidentId, state) {
  const profile = getTriageProfile(incidentId);
  const normalized = normalizeTriageState(state);
  if (!profile || !normalized.submitted) return null;
  const expectedRank = TRIAGE_PRIORITIES.find((item) => item.id === profile.priorityId)?.rank ?? 4;
  const chosenRank = TRIAGE_PRIORITIES.find((item) => item.id === normalized.priorityId)?.rank ?? 4;
  const mandatory = new Set(profile.mandatoryProtocols);
  const covered = normalized.protocolIds.filter((id) => mandatory.has(id)).length;
  return {
    priorityCorrect: normalized.priorityId === profile.priorityId,
    natureCorrect: normalized.natureId === profile.natureId,
    covered,
    required: mandatory.size,
    protocolRatio: mandatory.size ? covered / mandatory.size : 1,
    undertriage: chosenRank > expectedRank,
    overtriage: chosenRank < expectedRank,
    priorityDistance: Math.abs(chosenRank - expectedRank)
  };
}

export function validateTriageProfiles(incidentIds = []) {
  const errors = [];
  for (const id of incidentIds) {
    const profile = TRIAGE_PROFILES[id];
    if (!profile) { errors.push(`${id}:missingProfile`); continue; }
    if (!TRIAGE_PRIORITY_IDS.includes(profile.priorityId)) errors.push(`${id}:priority`);
    if (!TRIAGE_NATURE_IDS.includes(profile.natureId)) errors.push(`${id}:nature`);
    if (!Array.isArray(profile.mandatoryProtocols) || profile.mandatoryProtocols.length < 3) errors.push(`${id}:protocolCount`);
    for (const protocolId of profile.mandatoryProtocols || []) if (!TRIAGE_PROTOCOL_IDS.includes(protocolId)) errors.push(`${id}:protocol:${protocolId}`);
  }
  for (const locale of Object.keys(TEXT)) {
    const text = TEXT[locale];
    for (const id of TRIAGE_PRIORITY_IDS) if (!text.priorities[id]?.[0] || !text.priorities[id]?.[1]) errors.push(`${locale}:priority:${id}`);
    for (const id of TRIAGE_NATURE_IDS) if (!text.natures[id]) errors.push(`${locale}:nature:${id}`);
    for (const id of TRIAGE_PROTOCOL_IDS) if (!text.protocols[id]) errors.push(`${locale}:protocol:${id}`);
  }
  return Object.freeze({ ok:errors.length === 0, errors, incidents:incidentIds.length, locales:Object.keys(TEXT).length, protocols:TRIAGE_PROTOCOL_IDS.length });
}
