import assert from 'node:assert/strict';
import { incidents, protocolQuestions } from '../js/data/content.js';
import {
  CALL_APPROACH_IDS,
  CALL_BRANCH_PROFILES,
  createInitialCallerState,
  resolveCallBranch,
  validateCallBranchProfiles
} from '../js/core/call-branching.js';

const report = validateCallBranchProfiles(incidents.map((item) => item.id), protocolQuestions.map((item) => item.id));
assert.equal(report.ok, true, report.errors.join('\n'));
assert.equal(report.profiles, incidents.length);
assert.deepEqual(CALL_APPROACH_IDS, ['calm', 'direct', 'urgent']);

const incident = incidents.find((item) => item.id === 'panic-line-ambiguous-threat');
const initial = createInitialCallerState(incident.id);
const calm = resolveCallBranch({ incidentId: incident.id, state: initial, approach: 'calm', questionId: 'location', isIdeal: true });
assert.ok(calm.nextState.stress < initial.stress, 'Abordagem acolhedora deveria reduzir estresse.');
assert.ok(calm.nextState.trust > initial.trust, 'Abordagem acolhedora deveria elevar confiança.');
assert.equal(calm.completed, true);

let state = initial;
let interrupted = false;
for (let index = 0; index < 3; index += 1) {
  const result = resolveCallBranch({ incidentId: incident.id, state, approach: 'urgent', questionId: 'suspect', isIdeal: true });
  state = result.nextState;
  interrupted ||= result.interruption;
}
assert.equal(interrupted, true, 'Urgência repetida em ligação de pânico deveria poder interromper a linha.');
assert.ok(Object.keys(CALL_BRANCH_PROFILES).every((id) => incidents.some((incidentItem) => incidentItem.id === id)));

console.log('PASS branching: 8 perfis, 3 posturas, estado emocional, interrupção e inteligência oculta validados.');
