window.C190_Career = (() => {
  const ranks=[
    {id:'operador_iii',name:'Operador III',icon:'I',xp:0,rep:0,courses:0,shifts:0},
    {id:'operador_ii',name:'Operador II',icon:'II',xp:450,rep:55,courses:1,shifts:2},
    {id:'operador_i',name:'Operador I',icon:'III',xp:1100,rep:62,courses:2,shifts:5},
    {id:'supervisor',name:'Supervisor de Plantão',icon:'S',xp:2200,rep:70,courses:3,shifts:9},
    {id:'coordenador',name:'Coordenador Operacional',icon:'C',xp:3900,rep:78,courses:4,shifts:15},
    {id:'inspetor',name:'Inspetor de Central',icon:'★',xp:6200,rep:86,courses:5,shifts:24},
    {id:'comandante',name:'Comandante da Central',icon:'✦',xp:9500,rep:93,courses:7,shifts:36}
  ];
  const courses=[
    {id:'comunicacao',icon:'◉',name:'Comunicação de crise',desc:'Melhora a coleta de informações e reduz penalidades por abordagem inadequada.',cost:250,minRank:0},
    {id:'triagem',icon:'⌁',name:'Triagem e priorização',desc:'Aprimora a classificação de risco e o controle da fila.',cost:420,minRank:1},
    {id:'violencia_domestica',icon:'⚖',name:'Atendimento à violência doméstica',desc:'Abordagem segura, acolhedora e orientada a protocolo.',cost:620,minRank:1},
    {id:'gerenciamento',icon:'▦',name:'Gerenciamento de múltiplas ocorrências',desc:'Reduz impacto de chamadas simultâneas e melhora retomadas.',cost:850,minRank:2},
    {id:'lideranca',icon:'♜',name:'Liderança operacional',desc:'Requisito para funções de supervisão e coordenação.',cost:1200,minRank:3},
    {id:'negociacao',icon:'◇',name:'Negociação em alto risco',desc:'Aumenta a chance de resolução excelente em ocorrências críticas.',cost:1450,minRank:3},
    {id:'auditoria',icon:'✓',name:'Auditoria e qualidade',desc:'Capacita para metas de excelência, conformidade e comando.',cost:1800,minRank:4}
  ];
  const specs=[
    {id:'despacho',icon:'☎',name:'Despacho Tático',desc:'Bônus de reputação em ocorrências críticas.',requires:['triagem','gerenciamento']},
    {id:'acolhimento',icon:'♥',name:'Acolhimento e Proteção',desc:'Reduz advertências por comunicação e amplia recompensas sociais.',requires:['comunicacao','violencia_domestica']},
    {id:'comando',icon:'★',name:'Comando Operacional',desc:'Acelera promoções e melhora avaliação de plantões.',requires:['lideranca','auditoria']},
    {id:'negociador',icon:'◇',name:'Negociador de Crise',desc:'Bônus em decisões delicadas e cenários de alto risco.',requires:['comunicacao','negociacao']}
  ];
  const achievements=[
    {id:'primeiro_turno',icon:'◷',name:'Primeiro Plantão',desc:'Conclua seu primeiro plantão.',test:s=>s.career.totalShifts>=1},
    {id:'dez_ocorrencias',icon:'10',name:'Linha Quente',desc:'Resolva 10 ocorrências.',test:s=>s.career.totalResolved>=10},
    {id:'cinquenta_ocorrencias',icon:'50',name:'Voz da Central',desc:'Resolva 50 ocorrências.',test:s=>s.career.totalResolved>=50},
    {id:'turno_perfeito',icon:'★',name:'Turno Perfeito',desc:'Conclua um plantão sem falhas ou abandonos.',test:s=>s.career.perfectShifts>=1},
    {id:'sem_advertencia',icon:'✓',name:'Conduta Exemplar',desc:'Chegue a 5 plantões sem advertências ativas.',test:s=>s.career.totalShifts>=5&&activeWarnings(s)===0},
    {id:'especialista',icon:'◆',name:'Especialista',desc:'Conclua uma especialização.',test:s=>!!s.career.specialization},
    {id:'supervisor',icon:'S',name:'Liderança Reconhecida',desc:'Alcance a patente de Supervisor.',test:s=>rankIndex(s.career.rankId)>=3},
    {id:'reputacao_90',icon:'90',name:'Confiança Pública',desc:'Alcance 90 pontos de reputação.',test:s=>s.career.reputation>=90},
    {id:'todos_cursos',icon:'▣',name:'Formação Completa',desc:'Conclua todos os cursos.',test:s=>s.career.completedCourses.length>=courses.length},
    {id:'comandante',icon:'✦',name:'Comando Máximo',desc:'Alcance a patente final.',test:s=>s.career.rankId==='comandante'}
  ];
  const goalDefs=[
    {id:'resolve_5',name:'Atendimento consistente',desc:'Resolva 5 ocorrências.',target:5,metric:s=>s.career.totalResolved,reward:{xp:220,rep:2}},
    {id:'complete_3_shifts',name:'Ritmo de plantão',desc:'Conclua 3 plantões.',target:3,metric:s=>s.career.totalShifts,reward:{xp:300,rep:3}},
    {id:'take_2_courses',name:'Capacitação contínua',desc:'Conclua 2 cursos.',target:2,metric:s=>s.career.completedCourses.length,reward:{xp:380,rep:3}},
    {id:'streak_6',name:'Sequência segura',desc:'Alcance 6 resoluções corretas seguidas.',target:6,metric:s=>s.career.bestStreak,reward:{xp:450,rep:4}},
    {id:'reach_rep_75',name:'Confiança institucional',desc:'Alcance 75 de reputação.',target:75,metric:s=>s.career.reputation,reward:{xp:550,rep:0}},
    {id:'perfect_2',name:'Excelência operacional',desc:'Conclua 2 plantões perfeitos.',target:2,metric:s=>s.career.perfectShifts,reward:{xp:700,rep:5}}
  ];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  function rankIndex(id){ return Math.max(0,ranks.findIndex(r=>r.id===id)); }
  function activeWarnings(state){ const now=Date.now(); return state.career.warnings.filter(w=>!w.expired&&(!w.expiresAt||new Date(w.expiresAt).getTime()>now)).length; }
  function addEvent(state,type,title,detail){ state.career.events.unshift({id:crypto.randomUUID?.()||String(Date.now()+Math.random()),at:new Date().toISOString(),type,title,detail}); state.career.events=state.career.events.slice(0,60); }
  function applyOutcome(state,{quality=0,xp=0,rep=0,resolved=false,failed=false,abandoned=false,reason=''}){
    const difficulty=state.profile?.difficulty||'realista'; const mult=difficulty==='especialista'?1.2:difficulty==='assistido'?.85:1;
    state.career.xp=Math.max(0,state.career.xp+Math.round(xp*mult)); state.career.reputation=clamp(state.career.reputation+rep,0,100); state.career.decisionScore+=quality; state.career.decisionCount++;
    if(resolved){state.career.totalResolved++;state.career.streak++;state.career.bestStreak=Math.max(state.career.bestStreak,state.career.streak);} if(failed){state.career.totalFailed++;state.career.streak=0;} if(abandoned){state.career.totalAbandoned++;state.career.streak=0;}
    if(reason) addEvent(state,quality>=1?'success':'warning',quality>=1?'Ocorrência resolvida':'Desempenho afetado',reason);
    if(quality<=-2) issueWarning(state,'Falha de protocolo',reason||'Decisão incompatível com o protocolo operacional.',3);
    evaluate(state);
  }
  function issueWarning(state,title,reason,durationShifts=3){ const existing=state.career.warnings.find(w=>!w.expired&&w.title===title); if(existing){existing.count=(existing.count||1)+1;existing.remainingShifts=Math.max(existing.remainingShifts||0,durationShifts);} else state.career.warnings.push({id:crypto.randomUUID?.()||String(Date.now()),title,reason,issuedAt:new Date().toISOString(),remainingShifts:durationShifts,expired:false,count:1}); state.career.reputation=clamp(state.career.reputation-3,0,100); addEvent(state,'danger','Advertência recebida',title); }
  function decayWarnings(state){ state.career.warnings.forEach(w=>{if(!w.expired){w.remainingShifts=(w.remainingShifts??1)-1;if(w.remainingShifts<=0){w.expired=true;addEvent(state,'success','Advertência encerrada',w.title);}}}); }
  function getPromotionStatus(state){ const idx=rankIndex(state.career.rankId); const next=ranks[idx+1]; if(!next) return {next:null,eligible:false,requirements:[]}; const req=[{label:`${next.xp} XP`,ok:state.career.xp>=next.xp},{label:`Reputação ${next.rep}`,ok:state.career.reputation>=next.rep},{label:`${next.courses} curso(s)`,ok:state.career.completedCourses.length>=next.courses},{label:`${next.shifts} plantão(ões)`,ok:state.career.totalShifts>=next.shifts},{label:'Sem advertência ativa',ok:activeWarnings(state)===0}]; return {next,eligible:req.every(r=>r.ok),requirements:req}; }
  function promoteIfEligible(state){ const p=getPromotionStatus(state); if(p.eligible&&p.next){ const old=ranks[rankIndex(state.career.rankId)]; state.career.rankId=p.next.id;state.career.promotions++;state.career.reputation=clamp(state.career.reputation+4,0,100);addEvent(state,'promotion','Promoção confirmada',`${old.name} → ${p.next.name}`); return p.next;} return null; }
  function completeCourse(state,id){ const c=courses.find(x=>x.id===id); if(!c||state.career.completedCourses.includes(id)) return {ok:false,reason:'indisponivel'}; const idx=rankIndex(state.career.rankId); if(idx<c.minRank) return {ok:false,reason:'patente'}; if(state.career.xp<c.cost) return {ok:false,reason:'xp'}; state.career.xp-=c.cost;state.career.completedCourses.push(id);state.career.reputation=clamp(state.career.reputation+2,0,100);addEvent(state,'course','Curso concluído',c.name);evaluate(state);return {ok:true,course:c,promotion:promoteIfEligible(state)}; }
  function selectSpecialization(state,id){ const sp=specs.find(x=>x.id===id); if(!sp) return false; if(!sp.requires.every(r=>state.career.completedCourses.includes(r))) return false; state.career.specialization=id;state.career.reputation=clamp(state.career.reputation+3,0,100);addEvent(state,'specialization','Especialização definida',sp.name);evaluate(state);return true; }
  function evaluateGoals(state){ goalDefs.forEach(g=>{ const rec=state.career.goals[g.id]||{claimed:false}; const value=Math.min(g.target,g.metric(state)); if(value>=g.target&&!rec.claimed){rec.claimed=true;rec.completedAt=new Date().toISOString();state.career.xp+=g.reward.xp;state.career.reputation=clamp(state.career.reputation+g.reward.rep,0,100);addEvent(state,'goal','Meta concluída',`${g.name}: +${g.reward.xp} XP`);} rec.value=value;state.career.goals[g.id]=rec; }); }
  function evaluateAchievements(state){ achievements.forEach(a=>{if(!state.career.achievements.includes(a.id)&&a.test(state)){state.career.achievements.push(a.id);addEvent(state,'achievement','Conquista desbloqueada',a.name);}}); }
  function evaluate(state){ evaluateGoals(state);evaluateAchievements(state);return promoteIfEligible(state); }
  function endShift(state,report){ state.career.totalShifts++; if(report.failed===0&&report.abandoned===0) state.career.perfectShifts++; decayWarnings(state); state.dispatch.reports.unshift(report); state.dispatch.reports=state.dispatch.reports.slice(0,40); addEvent(state,report.failed===0?'success':'warning','Plantão concluído',`${report.resolved} resolvidas · nota ${report.grade}`); return evaluate(state); }
  function performance(state){ const avg=state.career.decisionCount?state.career.decisionScore/state.career.decisionCount:0; return {avg,service:clamp(Math.round(70+avg*10),0,100),discipline:clamp(100-activeWarnings(state)*18,0,100),reputation:state.career.reputation,training:Math.round(state.career.completedCourses.length/courses.length*100)}; }
  return {ranks,courses,specs,achievements,goalDefs,rankIndex,activeWarnings,addEvent,applyOutcome,issueWarning,decayWarnings,getPromotionStatus,promoteIfEligible,completeCourse,selectSpecialization,evaluate,endShift,performance};
})();
