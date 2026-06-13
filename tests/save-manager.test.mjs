import assert from 'node:assert/strict';
import { SafeSaveManager, SAVE_KEYS, createEnvelope, normalizeSavePayload, verifyEnvelope } from '../js/core/save-manager.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(String(key)) ? this.map.get(String(key)) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}
const context = {
  avatarIds:new Set(['operator-01']), incidentIds:new Set(['incident-01']), unitIds:new Set(['police']),
  questionIds:new Set(['location']), trainingStepIds:new Set(['location-address','location-direction']), triagePriorityIds:new Set(['P1','P2','P3','P4']), triageNatureIds:new Set(['violence']), triageProtocolIds:new Set(['confirm-location','life-threat'])
};
const raw = {
  player: {
    name:'<Operador>', country:'Brasil', mode:'carreira', avatarId:'operator-01', language:'en-US', xp:10, resolved:1,
    preferredShift:'manha', history:[{ incidentId:'incident-01', title:'Caso', score:20, grade:'B', time:'00:09', at:new Date().toISOString() }],
    training:{ completedSteps:['location-address'], attempts:2, firstTryCorrect:1, certified:false, rewardClaimed:false, assistedMode:true }, shiftHistory:[{shiftRunId:'shift-1',shiftId:'manha',endedAt:new Date().toISOString(),summary:{calls:3,completed:2,abandoned:1,averageScore:120,totalScore:240,serviceLevel:60,grade:'B'}}], resources:{cycle:0,resources:[{id:'police-p201',status:'available',readyCycles:0,readiness:94,condition:97,fatigue:16,missions:0}]}
  },
  session: { screen:'shift', incidentId:'incident-01', callQueueIds:[], selectedUnitIds:['police'], askedQuestionIds:['location'], timerSeconds:9, risk:70, triggeredEvents:[], selectedShift:'manha', selectedApproach:'calm', callerState:{trust:60,stress:50,clarity:70,interruptions:1,lastApproach:'calm',emotion:'cooperative',lineStatus:'stable'}, questionQuality:{location:.88}, discoveredIntel:['fact:0'], branchHistory:[{questionId:'location',approach:'calm',reaction:'cooperative',quality:.88,completed:true,interruption:false,revealedIntel:['fact:0']}], triageState:{priorityId:'P1',natureId:'violence',protocolIds:['confirm-location','life-threat'],submitted:true,revisions:0,confidence:82,lastAssessment:{priorityCorrect:true,natureCorrect:true,covered:2,required:2,undertriage:false,overtriage:false}}, tacticalMapState:{incidentId:'incident-01',selectedUnitId:'police',routeModes:{police:'secure',ambulance:'balanced',helicopter:'fastest'},zoom:1.2,panX:3,panY:-2,interactions:4}, selectedResourceIds:['police-p201'], resourceNetwork:{cycle:0,resources:[{id:'police-p201',status:'available',readyCycles:0,readiness:94,condition:97,fatigue:16,missions:0}]}, dispatchCommandState:{incidentId:'incident-01',submitted:true,priorityId:'urgent',orderIds:['approach','secure'],timeline:[{eventId:'enroute',at:9,unitId:'police-p201'}]}, fieldOperationState:{incidentId:'incident-01',started:true,completed:false,currentStage:1,control:52,danger:58,civilians:2,victimsProtected:0,reinforcements:0,elapsedSeconds:32,decisions:[{stageId:'arrival',actionId:'secure',quality:'ideal',supported:true,at:32,control:52,danger:58}],radioLog:[{type:'team',text:'arrival:secure:ideal',at:32}]}, continuousShift:{shiftRunId:'shift-live',shiftId:'manha',status:'active',startedAt:new Date().toISOString(),elapsedSeconds:30,activeCallId:'call-1-incident-01',calls:[{callId:'call-1-incident-01',incidentId:'incident-01',priorityId:'high',status:'active',receivedAt:0,waitSeconds:0,activeSeconds:30,escalations:0,maxWaitSeconds:190,snapshot:null,result:null}],events:[]}, savedAt:new Date().toISOString() }
};
const normalized=normalizeSavePayload(raw,context);
assert.equal(normalized.player.country,'BR');
assert.equal(normalized.player.language,'en-US');
assert.equal(normalized.player.history[0].incidentId,'incident-01');
assert.deepEqual(normalized.player.training.completedSteps,['location-address']);
assert.equal(normalized.player.training.assistedMode,true);
const envelope=createEnvelope(normalized,{appVersion:'v0.18.0',schemaVersion:10});
assert.equal(verifyEnvelope(envelope,{schemaVersion:10}).ok,true);
envelope.payload.player.xp=999;
assert.equal(verifyEnvelope(envelope,{schemaVersion:10}).ok,false,'Checksum deveria detectar alteração.');
const storage=new MemoryStorage();
const manager=new SafeSaveManager({appVersion:'v0.18.0',schemaVersion:10,context,storage});
manager.save(raw); manager.save({...raw,player:{...raw.player,xp:25}});
assert.ok(storage.getItem(SAVE_KEYS.backup));
storage.setItem(SAVE_KEYS.primary,'{corrompido');
const recovered=manager.load();
assert.equal(recovered.source,'backup');
assert.equal(recovered.player.xp,10);
assert.equal(recovered.player.training.completedSteps.length,1);
const legacyStorage=new MemoryStorage();
legacyStorage.setItem('central190-save-v080',JSON.stringify({schemaVersion:2,appVersion:'v0.10.0',savedAt:new Date().toISOString(),payload:raw,checksum:'legacy'}));
const legacyManager=new SafeSaveManager({appVersion:'v0.18.0',schemaVersion:10,context,storage:legacyStorage});
const migrated=legacyManager.load();
assert.equal(migrated.source,'legacy');
assert.equal(migrated.player.country,'BR');
assert.equal(migrated.player.language,'en-US');
assert.equal(migrated.player.training.assistedMode,true);
assert.ok(legacyStorage.getItem(SAVE_KEYS.primary));
assert.equal(normalized.session.selectedApproach,'calm');
assert.equal(normalized.session.questionQuality.location,0.88);
assert.equal(normalized.session.branchHistory.length,1);
assert.equal(normalized.session.triageState.priorityId,'P1');
assert.equal(normalized.session.triageState.submitted,true);
assert.equal(normalized.session.tacticalMapState.routeModes.police,'secure');
assert.equal(normalized.session.tacticalMapState.zoom,1.2);
assert.ok(normalized.player.resources.resources.length >= 8);
assert.deepEqual(normalized.session.selectedResourceIds,['police-p201']);
assert.equal(normalized.session.resourceNetwork.resources.length,8);
assert.equal(normalized.session.dispatchCommandState.priorityId,'urgent');
assert.equal(normalized.session.dispatchCommandState.orderIds.length,2);
assert.equal(normalized.session.fieldOperationState.currentStage,1);
assert.equal(normalized.session.fieldOperationState.decisions[0].actionId,'secure');
assert.equal(normalized.session.continuousShift.calls.length,1);
assert.equal(normalized.player.shiftHistory[0].summary.grade,'B');
console.log('PASS save-manager: schema v10, central de recursos, mapa tático, triagem, ramificações, academia, checksum, backup, recuperação e migração.');
