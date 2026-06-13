import assert from 'node:assert/strict';
import {
  RESOURCE_CATALOG, RESOURCE_STATUS_IDS, RESOURCE_TYPE_IDS, assessResourcePlan,
  completeResourceDispatch, createInitialResourceNetwork, getAvailableResources,
  getBestAvailableResource, getResourceById, normalizeResourceNetwork,
  normalizeSelectedResourceIds, summarizeResourceNetwork, validateResourceCatalog
} from '../js/data/resource-management.js';

const report = validateResourceCatalog();
assert.equal(report.ok, true, report.errors.join('\n'));
assert.equal(RESOURCE_CATALOG.length, 8);
assert.equal(RESOURCE_STATUS_IDS.length, 5);
assert.deepEqual(RESOURCE_TYPE_IDS, ['police','ambulance','helicopter']);

const initial = createInitialResourceNetwork();
assert.equal(normalizeResourceNetwork(initial).resources.length, 8);
for (const typeId of RESOURCE_TYPE_IDS) assert.ok(getBestAvailableResource(initial, typeId), `sem recurso disponível: ${typeId}`);

const police = getBestAvailableResource(initial, 'police');
const ambulance = getBestAvailableResource(initial, 'ambulance');
const selected = normalizeSelectedResourceIds([police.id, ambulance.id, 'invalid'], initial);
assert.deepEqual(selected.sort(), [police.id, ambulance.id].sort());
const summary = summarizeResourceNetwork(initial, selected);
assert.equal(summary.selected, 2);
assert.ok(summary.coveragePercent >= 34 && summary.coveragePercent <= 100);
const assessment = assessResourcePlan(initial, selected);
assert.equal(assessment.selectedCount, 2);
assert.ok(assessment.score >= 0 && assessment.score <= 30);

const completed = completeResourceDispatch(initial, selected, { routes:[
  { unitId:'police', routeRisk:20, etaMinutes:5 },
  { unitId:'ambulance', routeRisk:12, etaMinutes:7 }
] });
for (const id of selected) {
  const resource = getResourceById(completed,id);
  assert.ok(['returning','maintenance'].includes(resource.status));
  assert.equal(resource.missions,1);
}
assert.ok(getAvailableResources(completed).length < getAvailableResources(initial).length + 3);
console.log(`resource-management: ${report.count} resources, ${report.statuses} statuses, ${assessment.score}/30 assessment`);
