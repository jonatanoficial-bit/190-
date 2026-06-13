import assert from 'node:assert/strict';
import { assessProfessionalDispatch, createInitialDispatchCommandState, dispatchText, normalizeDispatchCommandState, progressDispatchTimeline, validateDispatchCommandCatalog } from '../js/data/dispatch-professional.js';

const incidentIds = ['domestic-weapon-risk','armed-robbery-escape','collision-victims-fuel','panic-line-ambiguous-threat','kidnapping-attempt-school','shots-fired-bar','noise-party-threat','morning-school-traffic'];
const report = validateDispatchCommandCatalog(incidentIds);
assert.equal(report.ok, true, report.errors.join('; '));
assert.equal(report.profiles, 8);
let state = createInitialDispatchCommandState('domestic-weapon-risk');
state = normalizeDispatchCommandState({...state, submitted:true, priorityId:'urgent', orderIds:['approach','secure','medical']}, 'domestic-weapon-risk');
state = progressDispatchTimeline(state, [{id:'police-p201'},{id:'ambulance-a12'}], 60);
const assessment = assessProfessionalDispatch('domestic-weapon-risk', state, [{id:'police-p201'},{id:'ambulance-a12'}]);
assert.ok(assessment.score >= 25);
assert.equal(assessment.covered, 3);
assert.equal(assessment.priorityCorrect, true);
assert.ok(dispatchText('en-US','title').includes('dispatch'));
assert.ok(dispatchText('es-419','priorityOptions.urgent').length > 0);
console.log(`PASS professional-dispatch: ${report.profiles} perfis, ${report.orders} ordens, ${report.priorities} prioridades e ${report.events} eventos validados.`);
