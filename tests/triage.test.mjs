import assert from 'node:assert/strict';
import { TRIAGE_NATURE_IDS, TRIAGE_PRIORITY_IDS, TRIAGE_PROTOCOL_IDS, TRIAGE_PROFILES, assessTriage, calculateTriageConfidence, createInitialTriageState, normalizeTriageState, triageText, validateTriageProfiles } from '../js/data/triage.js';
import { incidents } from '../js/data/content.js';

const report = validateTriageProfiles(incidents.map((item) => item.id));
assert.equal(report.ok, true, report.errors.join('\n'));
assert.equal(report.incidents, 8);
assert.equal(report.locales, 3);
assert.equal(TRIAGE_PRIORITY_IDS.length, 4);
assert.equal(TRIAGE_NATURE_IDS.length, 7);
assert.equal(TRIAGE_PROTOCOL_IDS.length, 11);
assert.equal(Object.keys(TRIAGE_PROFILES).length, 8);
for (const locale of ['pt-BR','en-US','es-419']) {
  assert.notEqual(triageText(locale,'panelTitle'), 'panelTitle');
  assert.match(triageText(locale,'priorities.P1.0'), /P1/);
}
const state = normalizeTriageState({ priorityId:'P1', natureId:'violence', protocolIds:['confirm-location','life-threat','bad'], submitted:true, revisions:2, confidence:86 });
assert.deepEqual(state.protocolIds,['confirm-location','life-threat']);
assert.equal(state.submitted,true);
const correct = assessTriage('domestic-weapon-risk',{...state,protocolIds:TRIAGE_PROFILES['domestic-weapon-risk'].mandatoryProtocols});
assert.equal(correct.priorityCorrect,true);
assert.equal(correct.natureCorrect,true);
assert.equal(correct.protocolRatio,1);
assert.equal(correct.undertriage,false);
const under = assessTriage('domestic-weapon-risk',{...state,priorityId:'P3',protocolIds:['confirm-location']});
assert.equal(under.undertriage,true);
assert.ok(under.priorityDistance >= 2);
assert.ok(calculateTriageConfidence({askedQuestionIds:['location','victims','weapon','safety'],discoveredIntel:['fact:0','fact:1'],callerState:{clarity:80}}) >= 75);
assert.equal(createInitialTriageState().submitted,false);
console.log('PASS triage: 8 perfis, 4 prioridades, 7 naturezas, 11 protocolos e 3 idiomas validados.');
