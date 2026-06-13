import { safeInteger, safeString, uniqueStrings } from '../core/utils.js';

export const RESOURCE_STATUS_IDS = Object.freeze(['available','occupied','enroute','returning','maintenance']);
export const RESOURCE_TYPE_IDS = Object.freeze(['police','ambulance','helicopter']);

export const RESOURCE_CATALOG = Object.freeze([
  Object.freeze({ id:'police-p201', typeId:'police', callSign:'P-201', baseDistrict:'north', crew:2, initialStatus:'available', readyCycles:0, readiness:94, condition:97, fatigue:16 }),
  Object.freeze({ id:'police-p317', typeId:'police', callSign:'P-317', baseDistrict:'center', crew:2, initialStatus:'occupied', readyCycles:1, readiness:82, condition:92, fatigue:34 }),
  Object.freeze({ id:'police-p442', typeId:'police', callSign:'P-442', baseDistrict:'east', crew:2, initialStatus:'available', readyCycles:0, readiness:87, condition:90, fatigue:27 }),
  Object.freeze({ id:'police-p508', typeId:'police', callSign:'P-508', baseDistrict:'west', crew:2, initialStatus:'returning', readyCycles:1, readiness:74, condition:84, fatigue:46 }),
  Object.freeze({ id:'ambulance-a12', typeId:'ambulance', callSign:'SAMU A-12', baseDistrict:'center', crew:3, initialStatus:'available', readyCycles:0, readiness:92, condition:95, fatigue:20 }),
  Object.freeze({ id:'ambulance-a23', typeId:'ambulance', callSign:'SAMU A-23', baseDistrict:'east', crew:3, initialStatus:'enroute', readyCycles:1, readiness:79, condition:89, fatigue:39 }),
  Object.freeze({ id:'ambulance-a37', typeId:'ambulance', callSign:'SAMU A-37', baseDistrict:'south', crew:3, initialStatus:'maintenance', readyCycles:1, readiness:58, condition:61, fatigue:18 }),
  Object.freeze({ id:'helicopter-eagle01', typeId:'helicopter', callSign:'Águia 01', baseDistrict:'south', crew:4, initialStatus:'available', readyCycles:0, readiness:86, condition:88, fatigue:25 })
]);
export const RESOURCE_IDS = Object.freeze(RESOURCE_CATALOG.map((item) => item.id));

const TEXT = Object.freeze({
  'pt-BR': Object.freeze({
    title:'Central de recursos', subtitle:'Disponibilidade operacional em tempo real', coverage:'Cobertura da rede', available:'Disponíveis', unavailable:'Indisponíveis', selected:'Reservadas', fleet:'equipes monitoradas', noAvailable:'Nenhum recurso disponível deste tipo.', reserveWarning:'O despacho deixará a rede sem cobertura de {type}.', ready:'Pronto', crew:'Guarnição: {count}', base:'Base {district}', readiness:'Prontidão', condition:'Condição', fatigue:'Fadiga', cycles:'liberação em {count} ciclo(s)', dispatchSelected:'Reservado para despacho', select:'Selecionar {callSign}', unavailableAction:'{callSign} está indisponível: {status}.', resultTitle:'Gestão da central de recursos', resultText:'Pontuação {score}/30. {selected} equipe(s) mobilizada(s), cobertura residual {coverage}% e prontidão média {readiness}%.', status:{ available:'Disponível', occupied:'Ocupada', enroute:'Em deslocamento', returning:'Retornando à base', maintenance:'Em manutenção' }, types:{ police:'policiamento', ambulance:'atendimento médico', helicopter:'apoio aéreo' }
  }),
  'en-US': Object.freeze({
    title:'Resource command center', subtitle:'Real-time operational availability', coverage:'Network coverage', available:'Available', unavailable:'Unavailable', selected:'Reserved', fleet:'teams monitored', noAvailable:'No resource of this type is available.', reserveWarning:'This dispatch will leave the network without {type} coverage.', ready:'Ready', crew:'Crew: {count}', base:'{district} base', readiness:'Readiness', condition:'Condition', fatigue:'Fatigue', cycles:'release in {count} cycle(s)', dispatchSelected:'Reserved for dispatch', select:'Select {callSign}', unavailableAction:'{callSign} is unavailable: {status}.', resultTitle:'Resource command management', resultText:'Score {score}/30. {selected} team(s) mobilized, residual coverage {coverage}% and average readiness {readiness}%.', status:{ available:'Available', occupied:'Occupied', enroute:'En route', returning:'Returning to base', maintenance:'Under maintenance' }, types:{ police:'police', ambulance:'medical response', helicopter:'air support' }
  }),
  'es-419': Object.freeze({
    title:'Central de recursos', subtitle:'Disponibilidad operativa en tiempo real', coverage:'Cobertura de la red', available:'Disponibles', unavailable:'No disponibles', selected:'Reservadas', fleet:'equipos monitoreados', noAvailable:'No hay recursos disponibles de este tipo.', reserveWarning:'Este despacho dejará la red sin cobertura de {type}.', ready:'Listo', crew:'Dotación: {count}', base:'Base {district}', readiness:'Preparación', condition:'Condición', fatigue:'Fatiga', cycles:'liberación en {count} ciclo(s)', dispatchSelected:'Reservado para despacho', select:'Seleccionar {callSign}', unavailableAction:'{callSign} no está disponible: {status}.', resultTitle:'Gestión de la central de recursos', resultText:'Puntuación {score}/30. {selected} equipo(s) movilizado(s), cobertura residual {coverage}% y preparación media {readiness}%.', status:{ available:'Disponible', occupied:'Ocupada', enroute:'En desplazamiento', returning:'Regresando a base', maintenance:'En mantenimiento' }, types:{ police:'policía', ambulance:'atención médica', helicopter:'apoyo aéreo' }
  })
});

function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
function catalogById(id) { return RESOURCE_CATALOG.find((item) => item.id === id); }
function validStatus(value) { return RESOURCE_STATUS_IDS.includes(value) ? value : 'available'; }

export function resourceText(locale, key, values = {}) {
  const source = TEXT[locale] || TEXT['pt-BR'];
  const value = key.split('.').reduce((acc, part) => acc?.[part], source);
  const template = typeof value === 'string' ? value : key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}

export function createInitialResourceNetwork() {
  return {
    cycle: 0,
    resources: RESOURCE_CATALOG.map((item) => ({
      id:item.id,
      status:item.initialStatus,
      readyCycles:item.readyCycles,
      readiness:item.readiness,
      condition:item.condition,
      fatigue:item.fatigue,
      missions:0
    }))
  };
}

export function normalizeResourceNetwork(network) {
  const source = network && typeof network === 'object' ? network : {};
  const byId = new Map((Array.isArray(source.resources) ? source.resources : []).map((item) => [item?.id, item]));
  return {
    cycle:safeInteger(source.cycle, 0, 1000000, 0),
    resources:RESOURCE_CATALOG.map((catalog) => {
      const item = byId.get(catalog.id) || {};
      let status = validStatus(item.status || catalog.initialStatus);
      let readyCycles = safeInteger(item.readyCycles, 0, 20, catalog.readyCycles);
      const condition = safeInteger(item.condition, 0, 100, catalog.condition);
      if (condition < 45) { status = 'maintenance'; readyCycles = Math.max(readyCycles, 2); }
      if (status === 'available') readyCycles = 0;
      return {
        id:catalog.id,
        status,
        readyCycles,
        readiness:safeInteger(item.readiness, 0, 100, catalog.readiness),
        condition,
        fatigue:safeInteger(item.fatigue, 0, 100, catalog.fatigue),
        missions:safeInteger(item.missions, 0, 1000000, 0)
      };
    })
  };
}

export function getResourceView(network) {
  const normalized = normalizeResourceNetwork(network);
  return normalized.resources.map((state) => ({ ...catalogById(state.id), ...state }));
}

export function getResourceById(network, id) {
  return getResourceView(network).find((item) => item.id === id) || null;
}

export function getAvailableResources(network, typeId = '') {
  return getResourceView(network).filter((item) => item.status === 'available' && (!typeId || item.typeId === typeId));
}

export function getBestAvailableResource(network, typeId) {
  return getAvailableResources(network, typeId).sort((a,b) => (b.readiness + b.condition - b.fatigue * .35) - (a.readiness + a.condition - a.fatigue * .35))[0] || null;
}

export function normalizeSelectedResourceIds(ids, network) {
  const valid = new Set(RESOURCE_IDS);
  const unique = uniqueStrings(ids, valid, 8);
  const selected = [];
  const usedTypes = new Set();
  for (const id of unique) {
    const resource = getResourceById(network, id);
    if (!resource || resource.status !== 'available' || usedTypes.has(resource.typeId)) continue;
    selected.push(id);
    usedTypes.add(resource.typeId);
  }
  return selected;
}

export function advanceResourceNetwork(network) {
  const normalized = normalizeResourceNetwork(network);
  normalized.cycle += 1;
  normalized.resources = normalized.resources.map((item) => {
    if (item.status === 'available') {
      return { ...item, readiness:clamp(item.readiness + 2,0,100), fatigue:clamp(item.fatigue - 7,0,100), condition:clamp(item.condition + 1,0,100) };
    }
    const readyCycles = Math.max(0, item.readyCycles - 1);
    if (readyCycles === 0) {
      if (item.status === 'occupied' || item.status === 'enroute') return { ...item, status:'returning', readyCycles:1, fatigue:clamp(item.fatigue + 4,0,100) };
      return { ...item, status:'available', readyCycles:0, readiness:clamp(item.readiness + 6,0,100), fatigue:clamp(item.fatigue - 9,0,100), condition:clamp(item.condition + (item.status === 'maintenance' ? 18 : 3),0,100) };
    }
    return { ...item, readyCycles, fatigue:clamp(item.fatigue - (item.status === 'maintenance' ? 5 : 1),0,100), condition:clamp(item.condition + (item.status === 'maintenance' ? 8 : 0),0,100) };
  });
  return normalizeResourceNetwork(normalized);
}

export function completeResourceDispatch(network, selectedIds = [], routeAssessment = null) {
  const normalized = advanceResourceNetwork(network);
  const selected = new Set(normalizeSelectedResourceIds(selectedIds, network));
  const routeByType = new Map((routeAssessment?.routes || []).map((route) => [route.unitId, route]));
  normalized.resources = normalized.resources.map((item) => {
    if (!selected.has(item.id)) return item;
    const catalog = catalogById(item.id);
    const route = routeByType.get(catalog.typeId);
    const wear = 3 + Math.round((route?.routeRisk || 0) / 18);
    const fatigueGain = 12 + Math.round((route?.etaMinutes || 0) / 2);
    const condition = clamp(item.condition - wear, 0, 100);
    const maintenance = condition < 48;
    return {
      ...item,
      status:maintenance ? 'maintenance' : 'returning',
      readyCycles:maintenance ? 2 : 1,
      readiness:clamp(item.readiness - 8,0,100),
      condition,
      fatigue:clamp(item.fatigue + fatigueGain,0,100),
      missions:item.missions + 1
    };
  });
  return normalizeResourceNetwork(normalized);
}

export function summarizeResourceNetwork(network, selectedIds = []) {
  const resources = getResourceView(network);
  const selected = new Set(normalizeSelectedResourceIds(selectedIds, network));
  const available = resources.filter((item) => item.status === 'available').length;
  const typeCoverage = Object.fromEntries(RESOURCE_TYPE_IDS.map((typeId) => [typeId, resources.filter((item) => item.typeId === typeId && item.status === 'available' && !selected.has(item.id)).length]));
  const coveragePercent = Math.round(RESOURCE_TYPE_IDS.filter((typeId) => typeCoverage[typeId] > 0).length / RESOURCE_TYPE_IDS.length * 100);
  return { total:resources.length, available, unavailable:resources.length-available, selected:selected.size, typeCoverage, coveragePercent };
}

export function assessResourcePlan(network, selectedIds = []) {
  const selected = normalizeSelectedResourceIds(selectedIds, network).map((id) => getResourceById(network,id)).filter(Boolean);
  const summary = summarizeResourceNetwork(network, selected.map((item) => item.id));
  const avgReadiness = selected.length ? selected.reduce((sum,item)=>sum+item.readiness,0)/selected.length : 0;
  const avgCondition = selected.length ? selected.reduce((sum,item)=>sum+item.condition,0)/selected.length : 0;
  const avgFatigue = selected.length ? selected.reduce((sum,item)=>sum+item.fatigue,0)/selected.length : 100;
  const reservePenalty = Object.values(summary.typeCoverage).filter((count)=>count===0).length * 5;
  const score = selected.length ? clamp(Math.round(8 + avgReadiness*.1 + avgCondition*.08 - avgFatigue*.05 - reservePenalty),0,30) : 0;
  return { score, selectedCount:selected.length, averageReadiness:Math.round(avgReadiness), averageCondition:Math.round(avgCondition), averageFatigue:Math.round(avgFatigue), coveragePercent:summary.coveragePercent, reserveGaps:Object.entries(summary.typeCoverage).filter(([,count])=>count===0).map(([type])=>type), ok:selected.length>0 && score>=18 && summary.coveragePercent>=34 };
}

export function validateResourceCatalog() {
  const errors=[];
  const ids=new Set();
  for (const item of RESOURCE_CATALOG) {
    if (!item.id || ids.has(item.id)) errors.push(`resource id inválido/duplicado: ${item.id}`);
    ids.add(item.id);
    if (!RESOURCE_TYPE_IDS.includes(item.typeId)) errors.push(`${item.id}: tipo inválido`);
    if (!RESOURCE_STATUS_IDS.includes(item.initialStatus)) errors.push(`${item.id}: status inválido`);
    for (const field of ['readiness','condition','fatigue']) if (!Number.isFinite(item[field]) || item[field] < 0 || item[field] > 100) errors.push(`${item.id}: ${field} inválido`);
  }
  for (const typeId of RESOURCE_TYPE_IDS) if (!RESOURCE_CATALOG.some((item)=>item.typeId===typeId)) errors.push(`tipo sem recurso: ${typeId}`);
  return { ok:errors.length===0, errors, count:RESOURCE_CATALOG.length, statuses:RESOURCE_STATUS_IDS.length, types:RESOURCE_TYPE_IDS.length };
}
