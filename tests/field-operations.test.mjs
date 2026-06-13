import assert from 'node:assert/strict';
import { assessFieldOperation, createInitialFieldOperationState, fieldStageText, fieldText, resolveFieldAction, validateFieldOperationCatalog } from '../js/data/field-operations.js';

const incidentIds = ['domestic-weapon-risk','armed-robbery-escape','collision-victims-fuel','panic-line-ambiguous-threat','kidnapping-attempt-school','shots-fired-bar','noise-party-threat','morning-school-traffic'];
const report = validateFieldOperationCatalog(incidentIds);
assert.equal(report.ok, true, report.errors.join('; '));
assert.equal(report.profiles, 8);
assert.equal(report.stages, 24);
assert.equal(report.actions, 9);

const context = { selectedResources:[{id:'police-p201',typeId:'police'},{id:'ambulance-a12',typeId:'ambulance'}] };
let state = createInitialFieldOperationState('domestic-weapon-risk');
state = resolveFieldAction(state,'domestic-weapon-risk','secure',context).state;
state = resolveFieldAction(state,'domestic-weapon-risk','negotiate',context).state;
state = resolveFieldAction(state,'domestic-weapon-risk','arrest',context).state;
const assessment = assessFieldOperation('domestic-weapon-risk',state);
assert.equal(state.completed,true);
assert.equal(assessment.decisions,3);
assert.equal(assessment.idealDecisions,3);
assert.ok(assessment.score >= 30);
assert.ok(['controlled','partial'].includes(assessment.outcomeId));
assert.ok(fieldText('en-US','actionLabels.negotiate').includes('Negotiate'));
assert.ok(fieldText('es-419','outcomes.controlled').length > 0);
assert.ok(fieldStageText('pt-BR','domestic-weapon-risk','arrival').length > 20);

let unsupported = createInitialFieldOperationState('kidnapping-attempt-school');
const unsupportedResult = resolveFieldAction(unsupported,'kidnapping-attempt-school','airSupport',{selectedResources:[{id:'police-p201',typeId:'police'}]});
assert.equal(unsupportedResult.supported,false);
assert.equal(unsupportedResult.quality,'unsupported');
assert.ok(unsupportedResult.state.danger > unsupported.danger);
console.log(`PASS field-operations: ${report.profiles} perfis, ${report.stages} etapas, ${report.actions} ações e ${report.outcomes} desfechos validados.`);
