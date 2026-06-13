const fs=require('fs');const vm=require('vm');const path=require('path');
const root=path.resolve(__dirname,'..');
const store={};
global.window=global;global.localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};global.CustomEvent=function(type,opts){this.type=type;this.detail=opts?.detail};global.dispatchEvent=()=>true;global.crypto={randomUUID:()=>`id-${Math.random()}`};
for(const f of ['js/save-manager.js','js/career.js','js/dispatch.js']) vm.runInThisContext(fs.readFileSync(path.join(root,f),'utf8'),{filename:f});
const assert=(v,m)=>{if(!v)throw new Error(m)};
let migrated=C190_Save.migrate({schema:10,profile:{name:'Teste',callSign:'Águia'},career:{xp:500,reputation:60,totalShifts:2,completedCourses:['comunicacao']},dispatch:{reports:[]}});
assert(migrated.schema===11,'migration schema');assert(migrated.profile.callSign==='Águia','migration profile');assert(migrated.career.xp===500,'migration XP');
let s=C190_Save.defaultState();s.profile={name:'Teste',callSign:'Águia',difficulty:'realista'};s.career.xp=1000;s.career.reputation=70;s.career.totalShifts=5;s.career.completedCourses=['comunicacao'];
let p=C190_Career.getPromotionStatus(s);assert(p.next.id==='operador_ii'&&p.eligible,'promotion eligibility');let promoted=C190_Career.promoteIfEligible(s);assert(promoted.id==='operador_ii','promotion applied');
C190_Career.issueWarning(s,'Falha de protocolo','Teste',2);assert(C190_Career.activeWarnings(s)===1,'warning active');p=C190_Career.getPromotionStatus(s);assert(!p.eligible,'warning blocks promotion');C190_Career.decayWarnings(s);C190_Career.decayWarnings(s);assert(C190_Career.activeWarnings(s)===0,'warning expires');
let cs=C190_Save.defaultState();cs.profile={name:'Curso',callSign:'Curso',difficulty:'realista'};cs.career.rankId='operador_ii';cs.career.xp=2000;const before=cs.career.xp;const course=C190_Career.completeCourse(cs,'triagem');assert(course.ok,'course completion');assert(cs.career.xp===before-420,'course XP cost');
let ds=C190_Save.defaultState();ds.profile={name:'Plantão',callSign:'Águia',difficulty:'realista'};const sh=C190_Dispatch.startShift(ds);assert(sh.calls.length===3,'three calls per shift');for(const c of sh.calls){c.status='active';sh.activeCallId=c.id;const out=C190_Dispatch.choose(ds,c.id,0);assert(out.call.status==='resolved','correct choice resolves');}
assert(ds.career.totalShifts===1,'shift counted');assert(ds.dispatch.reports.length===1,'report generated');assert(ds.dispatch.reports[0].resolved===3,'report resolved count');
console.log(JSON.stringify({status:'PASS',checks:15,rank:s.career.rankId,courses:cs.career.completedCourses.length,reports:ds.dispatch.reports.length},null,2));
