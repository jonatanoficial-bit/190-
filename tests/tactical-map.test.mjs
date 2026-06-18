import assert from 'node:assert/strict';
import { MAP_ROUTE_MODE_IDS, MAP_UNIT_IDS, TACTICAL_DISTRICTS, assessTacticalPlan, calculateUnitRoute, createInitialMapState, normalizeMapState, setMapViewport, setUnitRouteMode, validateTacticalMapProfiles } from '../js/data/tactical-map.js';
import { incidents } from '../js/data/content.js';

const ids=incidents.map((item)=>item.id);
const report=validateTacticalMapProfiles(ids);
assert.equal(report.ok,true,report.errors.join('\n'));
assert.equal(report.profileCount,ids.length);
assert.equal(MAP_ROUTE_MODE_IDS.length,3);
assert.equal(TACTICAL_DISTRICTS.length,5);
for(const incidentId of ids){
  let state=createInitialMapState(incidentId);
  for(const unitId of MAP_UNIT_IDS){
    const route=calculateUnitRoute(incidentId,unitId,state.routeModes[unitId]);
    assert.ok(route.distanceKm>0);
    assert.ok(route.etaMinutes>0);
    assert.ok(route.routeRisk>=0&&route.routeRisk<=100);
    state=setUnitRouteMode(state,unitId,route.recommendedMode,incidentId);
  }
  const plan=assessTacticalPlan(incidentId,incidents.find((item)=>item.id===incidentId).correctUnits,state);
  assert.ok(plan.score>=0&&plan.score<=30);
  assert.equal(plan.routeCount,incidents.find((item)=>item.id===incidentId).correctUnits.length);
}
let state=normalizeMapState({selectedUnitId:'invalid',routeModes:{police:'invalid'},zoom:9,panX:90,panY:-90},ids[0]);
assert.equal(state.selectedUnitId,'police');
assert.equal(state.routeModes.police,'balanced');
assert.equal(state.zoom,1.8);
assert.equal(state.panX,25);
assert.equal(state.panY,-20);
state=setMapViewport(state,{zoom:1.2,panX:4,panY:-3},ids[0]);
assert.equal(state.zoom,1.2);
console.log(`PASS tactical map: ${report.profileCount} perfis, ${report.districtCount} distritos, ${report.routeModeCount} estratégias, ETA, bloqueios e pontuação validados.`);
