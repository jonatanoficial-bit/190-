import assert from 'node:assert/strict';
import {
  SHIFT_CALL_STATUS_IDS, SHIFT_QUEUE_SIZE, advanceContinuousShift, buildContinuousShiftSummary,
  closeContinuousShift, completeActiveCall, continuousShiftText, createContinuousShift,
  normalizeContinuousShift, switchActiveCall, validateContinuousShiftCatalog
} from '../js/data/continuous-shift.js';

const descriptors = [
  {id:'incident-a',baseRisk:90},
  {id:'incident-b',baseRisk:72},
  {id:'incident-c',baseRisk:55}
];
const report = validateContinuousShiftCatalog(descriptors.map((item)=>item.id));
assert.equal(report.ok,true);
assert.equal(report.queueSize,SHIFT_QUEUE_SIZE);
assert.equal(SHIFT_CALL_STATUS_IDS.length,6);
let state = createContinuousShift(descriptors,'noite','2026-06-13T11:56:00-03:00');
assert.equal(state.calls.length,3);
assert.equal(state.calls[0].status,'active');
assert.equal(state.calls[1].status,'incoming');
let advanced = advanceContinuousShift(state,20);
state = advanced.state;
assert.equal(state.calls[1].status,'waiting');
assert.ok(advanced.events.some((event)=>event.type==='call-arrived'));
const switched = switchActiveCall(state,state.calls[1].callId,{screen:'shift',incidentId:'incident-a',timerSeconds:12});
assert.equal(switched.ok,true);
state = switched.state;
assert.equal(state.calls[0].status,'paused');
assert.equal(state.calls[1].status,'active');
assert.equal(state.calls[0].snapshot.timerSeconds,12);
state = completeActiveCall(state,{score:180,grade:'A',time:'01:05',incidentTitle:'Caso B',outcomeId:'controlled'}).state;
assert.equal(state.calls[1].status,'completed');
assert.ok(state.calls.some((call)=>call.status==='active'));
state = completeActiveCall(state,{score:130,grade:'B',time:'01:30',incidentTitle:'Caso A',outcomeId:'partial'}).state;
state = completeActiveCall(state,{score:110,grade:'C',time:'01:45',incidentTitle:'Caso C',outcomeId:'partial'}).state;
assert.equal(state.status,'completed');
state = closeContinuousShift(state,{abandonPending:false});
const summary = buildContinuousShiftSummary(state);
assert.equal(summary.completed,3);
assert.equal(summary.abandoned,0);
assert.equal(summary.totalScore,420);
assert.ok(['A','B','C'].includes(summary.grade));
const normalized = normalizeContinuousShift(state,new Set(descriptors.map((item)=>item.id)));
assert.equal(normalized.calls.length,3);
assert.ok(continuousShiftText('en-US','reportTitle').includes('Consolidated'));
assert.ok(continuousShiftText('es-419','endShift').includes('Cerrar'));
console.log(`PASS continuous-shift: ${report.queueSize} chamadas, ${report.statuses} estados, fila viva, retomada, abandono e relatório em ${report.locales} idiomas.`);
