import { safeInteger, safeString } from '../core/utils.js';

export const MAP_ROUTE_MODES = Object.freeze([
  Object.freeze({ id:'fastest', distanceFactor:.94, trafficFactor:1.18, blockageFactor:1.0, riskFactor:1.16 }),
  Object.freeze({ id:'balanced', distanceFactor:1, trafficFactor:1, blockageFactor:.58, riskFactor:1 }),
  Object.freeze({ id:'secure', distanceFactor:1.14, trafficFactor:.84, blockageFactor:.22, riskFactor:.78 })
]);
export const MAP_ROUTE_MODE_IDS = Object.freeze(MAP_ROUTE_MODES.map((item) => item.id));
export const MAP_UNIT_IDS = Object.freeze(['police','ambulance','helicopter']);

export const TACTICAL_DISTRICTS = Object.freeze([
  Object.freeze({ id:'north', x:7, y:7, w:36, h:29 }),
  Object.freeze({ id:'center', x:35, y:31, w:30, h:32 }),
  Object.freeze({ id:'east', x:63, y:13, w:30, h:43 }),
  Object.freeze({ id:'west', x:5, y:42, w:32, h:43 }),
  Object.freeze({ id:'south', x:42, y:64, w:48, h:27 })
]);

export const UNIT_BASES = Object.freeze({
  police: Object.freeze({ x:16, y:72, speedKmh:48, turnoutMinutes:.7 }),
  ambulance: Object.freeze({ x:73, y:18, speedKmh:42, turnoutMinutes:1.2 }),
  helicopter: Object.freeze({ x:72, y:75, speedKmh:145, turnoutMinutes:2.1 })
});

const P = (districtId, x, y, trafficLevel, trafficFactor, blockages, recommended, criticality = 'standard') => Object.freeze({
  districtId,
  incident: Object.freeze({ x, y }),
  trafficLevel,
  trafficFactor,
  blockages: Object.freeze(blockages.map((item) => Object.freeze(item))),
  recommended: Object.freeze({ ...recommended }),
  criticality
});

export const INCIDENT_MAP_PROFILES = Object.freeze({
  'domestic-weapon-risk': P('east', 79, 39, 'heavy', 1.32, [
    { id:'east-works', type:'roadworks', x:63, y:48, severity:2, affects:['fastest','balanced'] }
  ], { police:'secure', ambulance:'balanced', helicopter:'fastest' }, 'armed'),
  'armed-robbery-escape': P('center', 51, 46, 'heavy', 1.38, [
    { id:'center-collision', type:'collision', x:41, y:57, severity:3, affects:['fastest','balanced'] },
    { id:'center-closure', type:'closure', x:60, y:34, severity:2, affects:['secure'] }
  ], { police:'fastest', ambulance:'balanced', helicopter:'fastest' }, 'pursuit'),
  'collision-victims-fuel': P('center', 58, 56, 'congested', 1.52, [
    { id:'fuel-perimeter', type:'hazard', x:59, y:55, severity:3, affects:['fastest'] },
    { id:'avenue-block', type:'closure', x:47, y:66, severity:2, affects:['balanced'] }
  ], { police:'secure', ambulance:'secure', helicopter:'fastest' }, 'rescue'),
  'panic-line-ambiguous-threat': P('center', 55, 41, 'moderate', 1.16, [
    { id:'market-loading', type:'roadworks', x:61, y:45, severity:1, affects:['fastest'] }
  ], { police:'balanced', ambulance:'balanced', helicopter:'fastest' }),
  'kidnapping-attempt-school': P('east', 71, 31, 'heavy', 1.36, [
    { id:'school-zone', type:'school', x:70, y:30, severity:2, affects:['fastest'] },
    { id:'east-ramp', type:'closure', x:58, y:27, severity:2, affects:['balanced'] }
  ], { police:'fastest', ambulance:'balanced', helicopter:'fastest' }, 'pursuit'),
  'shots-fired-bar': P('west', 25, 58, 'congested', 1.44, [
    { id:'bar-crowd', type:'crowd', x:26, y:58, severity:3, affects:['fastest'] },
    { id:'west-lane', type:'collision', x:38, y:54, severity:2, affects:['balanced'] }
  ], { police:'secure', ambulance:'secure', helicopter:'fastest' }, 'armed'),
  'noise-party-threat': P('east', 68, 51, 'moderate', 1.18, [
    { id:'residential-lane', type:'roadworks', x:73, y:57, severity:1, affects:['fastest'] }
  ], { police:'balanced', ambulance:'balanced', helicopter:'fastest' }),
  'morning-school-traffic': P('north', 30, 23, 'congested', 1.48, [
    { id:'school-crossing', type:'school', x:31, y:23, severity:3, affects:['fastest'] },
    { id:'north-queue', type:'collision', x:38, y:36, severity:2, affects:['balanced'] }
  ], { police:'secure', ambulance:'secure', helicopter:'fastest' }, 'rescue')
});

const TRAFFIC_DELAY = Object.freeze({ light:.88, moderate:1, heavy:1.2, congested:1.42 });
const PX_TO_KM = .145;

function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
function validMode(value) { return MAP_ROUTE_MODE_IDS.includes(value) ? value : 'balanced'; }
function validUnit(value) { return MAP_UNIT_IDS.includes(value) ? value : 'police'; }

export function getTacticalMapProfile(incidentId) {
  return INCIDENT_MAP_PROFILES[incidentId] || P('center', 52, 50, 'moderate', 1.12, [], { police:'balanced', ambulance:'balanced', helicopter:'fastest' });
}

export function createInitialMapState(incidentId) {
  const profile = getTacticalMapProfile(incidentId);
  return {
    incidentId: safeString(incidentId, '', 80),
    selectedUnitId: 'police',
    routeModes: {
      police: 'balanced',
      ambulance: 'balanced',
      helicopter: 'fastest'
    },
    zoom: 1,
    panX: 0,
    panY: 0,
    interactions: 0
  };
}

export function normalizeMapState(state, incidentId) {
  const source = state && typeof state === 'object' ? state : {};
  const initial = createInitialMapState(incidentId || source.incidentId);
  return {
    incidentId: safeString(incidentId || source.incidentId, initial.incidentId, 80),
    selectedUnitId: validUnit(source.selectedUnitId),
    routeModes: {
      police: validMode(source.routeModes?.police),
      ambulance: validMode(source.routeModes?.ambulance),
      helicopter: validMode(source.routeModes?.helicopter)
    },
    zoom: clamp(source.zoom || 1, 1, 1.8),
    panX: clamp(source.panX, -25, 25),
    panY: clamp(source.panY, -20, 20),
    interactions: safeInteger(source.interactions, 0, 100000, 0)
  };
}

export function setUnitRouteMode(state, unitId, modeId, incidentId) {
  const next = normalizeMapState(state, incidentId);
  const safeUnit = validUnit(unitId);
  next.selectedUnitId = safeUnit;
  next.routeModes[safeUnit] = validMode(modeId);
  next.interactions += 1;
  return next;
}

export function setMapViewport(state, { zoom, panX, panY } = {}, incidentId) {
  const next = normalizeMapState(state, incidentId);
  if (zoom != null) next.zoom = clamp(zoom, 1, 1.8);
  if (panX != null) next.panX = clamp(panX, -25, 25);
  if (panY != null) next.panY = clamp(panY, -20, 20);
  next.interactions += 1;
  return next;
}

export function calculateUnitRoute(incidentId, unitId, modeId = 'balanced') {
  const profile = getTacticalMapProfile(incidentId);
  const base = UNIT_BASES[validUnit(unitId)];
  const mode = MAP_ROUTE_MODES.find((item) => item.id === validMode(modeId));
  const dx = profile.incident.x - base.x;
  const dy = profile.incident.y - base.y;
  const directKm = Math.max(.8, Math.hypot(dx, dy) * PX_TO_KM);
  const distanceKm = directKm * mode.distanceFactor;
  const trafficBase = TRAFFIC_DELAY[profile.trafficLevel] || 1;
  const trafficDelay = 1 + Math.max(0, trafficBase * profile.trafficFactor - 1) * mode.trafficFactor;
  const affected = unitId === 'helicopter' ? [] : profile.blockages.filter((blockage) => blockage.affects.includes(mode.id));
  const blockageMinutes = affected.reduce((sum, item) => sum + item.severity * .7 * mode.blockageFactor, 0);
  const travelMinutes = unitId === 'helicopter'
    ? base.turnoutMinutes + (distanceKm / base.speedKmh) * 60
    : base.turnoutMinutes + (distanceKm / base.speedKmh) * 60 * trafficDelay + blockageMinutes;
  const etaMinutes = Math.max(1, Math.round(travelMinutes));
  const recommendedMode = profile.recommended[unitId] || (unitId === 'helicopter' ? 'fastest' : 'balanced');
  const recommended = mode.id === recommendedMode;
  const routeRisk = clamp(Math.round((affected.length * 18 + (trafficDelay - 1) * 45 + (profile.criticality === 'armed' && mode.id === 'fastest' ? 15 : 0)) * mode.riskFactor), 0, 100);
  const controlA = { x: clamp(base.x + dx * .32 + (mode.id === 'secure' ? -9 : mode.id === 'fastest' ? 5 : 0), 3, 97), y: clamp(base.y + dy * .28 + (mode.id === 'secure' ? 8 : -2), 3, 97) };
  const controlB = { x: clamp(base.x + dx * .7 + (mode.id === 'secure' ? 7 : mode.id === 'fastest' ? -4 : 0), 3, 97), y: clamp(base.y + dy * .72 + (mode.id === 'secure' ? -6 : 3), 3, 97) };
  return {
    incidentId, unitId, modeId:mode.id, distanceKm:Number(distanceKm.toFixed(1)), etaMinutes,
    trafficDelay:Number(trafficDelay.toFixed(2)), blockageIds:affected.map((item) => item.id),
    routeRisk, recommended, recommendedMode, start:{x:base.x,y:base.y}, end:{...profile.incident}, controlA, controlB
  };
}

export function getTacticalRoutes(incidentId, state) {
  const normalized = normalizeMapState(state, incidentId);
  return MAP_UNIT_IDS.map((unitId) => calculateUnitRoute(incidentId, unitId, normalized.routeModes[unitId]));
}

export function assessTacticalPlan(incidentId, selectedUnitIds = [], state) {
  const normalized = normalizeMapState(state, incidentId);
  const ids = [...new Set(Array.isArray(selectedUnitIds) ? selectedUnitIds.filter((id) => MAP_UNIT_IDS.includes(id)) : [])];
  const routes = ids.map((unitId) => calculateUnitRoute(incidentId, unitId, normalized.routeModes[unitId]));
  const recommendedCount = routes.filter((route) => route.recommended).length;
  const blockadeHits = routes.reduce((sum, route) => sum + route.blockageIds.length, 0);
  const avgEta = routes.length ? routes.reduce((sum, route) => sum + route.etaMinutes, 0) / routes.length : 0;
  const avgRisk = routes.length ? routes.reduce((sum, route) => sum + route.routeRisk, 0) / routes.length : 100;
  const score = routes.length
    ? clamp(Math.round(8 + recommendedCount * 8 - (routes.length - recommendedCount) * 4 - blockadeHits * 2 - Math.max(0, avgRisk - 55) * .15), 0, 30)
    : 0;
  return {
    score,
    routeCount:routes.length,
    recommendedCount,
    blockadeHits,
    averageEtaMinutes:routes.length ? Number(avgEta.toFixed(1)) : 0,
    averageRisk:routes.length ? Math.round(avgRisk) : 100,
    routes,
    ok:routes.length > 0 && recommendedCount === routes.length && avgRisk <= 65
  };
}

export function validateTacticalMapProfiles(incidentIds = []) {
  const errors = [];
  const warnings = [];
  const expected = new Set(incidentIds);
  for (const id of expected) {
    const profile = INCIDENT_MAP_PROFILES[id];
    if (!profile) { errors.push(`Perfil de mapa ausente: ${id}`); continue; }
    if (!TACTICAL_DISTRICTS.some((district) => district.id === profile.districtId)) errors.push(`Distrito inválido em ${id}: ${profile.districtId}`);
    if (!Number.isFinite(profile.incident?.x) || !Number.isFinite(profile.incident?.y)) errors.push(`Coordenadas inválidas em ${id}`);
    for (const unitId of MAP_UNIT_IDS) {
      if (!MAP_ROUTE_MODE_IDS.includes(profile.recommended?.[unitId])) errors.push(`Rota recomendada inválida em ${id}/${unitId}`);
      const route = calculateUnitRoute(id, unitId, profile.recommended?.[unitId]);
      if (!(route.distanceKm > 0) || !(route.etaMinutes > 0)) errors.push(`Cálculo de rota inválido em ${id}/${unitId}`);
    }
    const blockageIds = profile.blockages.map((item) => item.id);
    if (new Set(blockageIds).size !== blockageIds.length) errors.push(`Bloqueios duplicados em ${id}`);
  }
  for (const id of Object.keys(INCIDENT_MAP_PROFILES)) if (!expected.has(id)) warnings.push(`Perfil de mapa sem ocorrência ativa: ${id}`);
  return { ok:errors.length === 0, errors, warnings, profileCount:Object.keys(INCIDENT_MAP_PROFILES).length, routeModeCount:MAP_ROUTE_MODES.length, districtCount:TACTICAL_DISTRICTS.length };
}
