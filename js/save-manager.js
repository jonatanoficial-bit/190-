window.C190_Save = (() => {
  const KEY='central190_save_v11';
  const BACKUP='central190_save_v11_backup';
  const LEGACY=['central190_save_v10','central190_save_v9','central_190_save','c190_save'];
  const SCHEMA=11;
  const defaultState=()=>({schema:SCHEMA,version:'0.19.0',build:'CENTRAL190-0190-F13-20260613-1259-BRT',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),profile:null,career:{rankId:'operador_iii',xp:0,reputation:50,warnings:[],completedCourses:[],specialization:null,promotions:0,totalResolved:0,totalFailed:0,totalAbandoned:0,totalShifts:0,perfectShifts:0,streak:0,bestStreak:0,decisionScore:0,decisionCount:0,goals:{},achievements:[],events:[]},dispatch:{shift:null,reports:[]},settings:{largeText:false,reduceMotion:false}});
  const clone=v=>JSON.parse(JSON.stringify(v));
  function checksum(obj){ const s=JSON.stringify(obj); let h=2166136261; for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return (h>>>0).toString(16).padStart(8,'0'); }
  function envelope(state){ const data=clone(state); data.updatedAt=new Date().toISOString(); return {schema:SCHEMA,checksum:checksum(data),data}; }
  function validate(state){ return !!state && typeof state==='object' && state.schema===SCHEMA && state.career && state.dispatch && state.settings; }
  function migrate(raw){
    let s=raw?.data||raw||{}; const base=defaultState();
    if(s.profile) base.profile={name:s.profile.name||s.profile.operatorName||'Operador',callSign:s.profile.callSign||s.profile.callsign||'Águia',difficulty:s.profile.difficulty||'realista'};
    const c=s.career||{}; Object.assign(base.career,{rankId:c.rankId||c.rank||base.career.rankId,xp:Number(c.xp||0),reputation:Number(c.reputation??50),warnings:Array.isArray(c.warnings)?c.warnings:[],completedCourses:Array.isArray(c.completedCourses)?c.completedCourses:[],specialization:c.specialization||null,promotions:Number(c.promotions||0),totalResolved:Number(c.totalResolved||c.resolved||0),totalFailed:Number(c.totalFailed||c.failed||0),totalAbandoned:Number(c.totalAbandoned||c.abandoned||0),totalShifts:Number(c.totalShifts||c.shifts||0),perfectShifts:Number(c.perfectShifts||0),streak:Number(c.streak||0),bestStreak:Number(c.bestStreak||0),decisionScore:Number(c.decisionScore||0),decisionCount:Number(c.decisionCount||0),goals:c.goals||{},achievements:Array.isArray(c.achievements)?c.achievements:[],events:Array.isArray(c.events)?c.events:[]});
    base.dispatch=s.dispatch||base.dispatch; base.dispatch.reports=Array.isArray(base.dispatch.reports)?base.dispatch.reports:[]; base.settings={...base.settings,...(s.settings||{})}; return base;
  }
  function load(){
    try{
      let text=localStorage.getItem(KEY);
      if(text){ const env=JSON.parse(text); if(env.checksum!==checksum(env.data)) throw new Error('checksum_mismatch'); if(validate(env.data)) return env.data; return migrate(env); }
      for(const key of LEGACY){ const legacy=localStorage.getItem(key); if(legacy){ const migrated=migrate(JSON.parse(legacy)); save(migrated); return migrated; } }
    }catch(err){ console.warn('[C190] primary save failed',err); try{ const env=JSON.parse(localStorage.getItem(BACKUP)); if(env&&validate(env.data)) return env.data; }catch(_){} }
    return defaultState();
  }
  function save(state){ const env=envelope(state); const current=localStorage.getItem(KEY); if(current) localStorage.setItem(BACKUP,current); localStorage.setItem(KEY,JSON.stringify(env)); Object.assign(state,env.data); window.dispatchEvent(new CustomEvent('c190:saved')); return true; }
  function reset(){ localStorage.removeItem(KEY); localStorage.removeItem(BACKUP); return defaultState(); }
  function exportData(state){ const blob=new Blob([JSON.stringify(envelope(state),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`CENTRAL190-save-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  async function importData(file){ const env=JSON.parse(await file.text()); const state=migrate(env); if(!validate(state)) throw new Error('invalid_save'); save(state); return state; }
  return {KEY,BACKUP,SCHEMA,defaultState,load,save,reset,exportData,importData,checksum,validate,migrate};
})();
