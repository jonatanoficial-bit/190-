import assert from 'node:assert/strict';
import { SafeSaveManager, SAVE_KEYS, createEnvelope, normalizeSavePayload, verifyEnvelope } from '../js/core/save-manager.js';

class MemoryStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(String(key)) ? this.map.get(String(key)) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}
const context = { avatarIds:new Set(['operator-01']), incidentIds:new Set(['incident-01']), unitIds:new Set(['police']), questionIds:new Set(['location']) };
const raw = {
  player: { name:'<Operador>', country:'Brasil', mode:'carreira', avatarId:'operator-01', language:'en-US', xp:10, resolved:1, preferredShift:'manha', history:[{ incidentId:'incident-01', title:'Caso', score:20, grade:'B', time:'00:09', at:new Date().toISOString() }] },
  session: { screen:'shift', incidentId:'incident-01', callQueueIds:[], selectedUnitIds:['police'], askedQuestionIds:['location'], timerSeconds:9, risk:70, triggeredEvents:[], selectedShift:'manha', savedAt:new Date().toISOString() }
};
const normalized=normalizeSavePayload(raw,context);
assert.equal(normalized.player.country,'BR');
assert.equal(normalized.player.language,'en-US');
assert.equal(normalized.player.history[0].incidentId,'incident-01');
const envelope=createEnvelope(normalized,{appVersion:'v0.8.0',schemaVersion:2});
assert.equal(verifyEnvelope(envelope,{schemaVersion:2}).ok,true);
envelope.payload.player.xp=999;
assert.equal(verifyEnvelope(envelope,{schemaVersion:2}).ok,false,'Checksum deveria detectar alteração.');
const storage=new MemoryStorage();
const manager=new SafeSaveManager({appVersion:'v0.8.0',schemaVersion:2,context,storage});
manager.save(raw); manager.save({...raw,player:{...raw.player,xp:25}});
assert.ok(storage.getItem(SAVE_KEYS.backup));
storage.setItem(SAVE_KEYS.primary,'{corrompido');
const recovered=manager.load();
assert.equal(recovered.source,'backup');
assert.equal(recovered.player.xp,10);
const legacyStorage=new MemoryStorage();
legacyStorage.setItem(SAVE_KEYS.legacy[0],JSON.stringify({schemaVersion:1,appVersion:'v0.7.0',savedAt:new Date().toISOString(),payload:raw,checksum:'legacy'}));
const legacyManager=new SafeSaveManager({appVersion:'v0.8.0',schemaVersion:2,context,storage:legacyStorage});
const migrated=legacyManager.load();
assert.equal(migrated.source,'legacy');
assert.equal(migrated.player.country,'BR');
assert.equal(migrated.player.language,'en-US');
assert.ok(legacyStorage.getItem(SAVE_KEYS.primary));
console.log('PASS save-manager: schema v2, idioma, checksum, backup, recuperação e migração.');
