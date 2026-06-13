window.C190_AntiBreak = (() => {
  const errors=[];
  function capture(type,detail){errors.push({at:new Date().toISOString(),type,detail:String(detail?.message||detail)});errors.splice(30);}
  window.addEventListener('error',e=>capture('error',e.error||e.message));
  window.addEventListener('unhandledrejection',e=>capture('promise',e.reason));
  function diagnostics(state){
    const ids=['app','mainContent','sidebar','careerForm','startShiftBtn','courseGrid','achievementGrid'];
    const missing=ids.filter(id=>!document.getElementById(id));
    const checks=[
      {name:'DOM essencial',ok:missing.length===0,detail:missing.length?`Ausentes: ${missing.join(', ')}`:'Todos os elementos essenciais presentes'},
      {name:'Save schema',ok:state?.schema===11,detail:`schema=${state?.schema}`},
      {name:'Estrutura da carreira',ok:!!state?.career&&Array.isArray(state.career.warnings),detail:'Módulo de carreira disponível'},
      {name:'Estrutura do plantão',ok:!!state?.dispatch&&Array.isArray(state.dispatch.reports),detail:'Módulo de despacho disponível'},
      {name:'LocalStorage',ok:(()=>{try{localStorage.setItem('__c190_test','1');localStorage.removeItem('__c190_test');return true}catch{return false}})(),detail:'Leitura e escrita local'},
      {name:'Erros capturados',ok:errors.length===0,detail:errors.length?`${errors.length} erro(s) registrado(s)`:'Nenhum erro em tempo de execução'}
    ];
    return {ok:checks.every(c=>c.ok),checks,errors:[...errors],timestamp:new Date().toISOString(),version:'0.19.0',build:'CENTRAL190-0190-F13-20260613-1259-BRT'};
  }
  function safe(fn,fallback){try{return fn()}catch(err){capture('safe-wrapper',err);return typeof fallback==='function'?fallback(err):fallback;}}
  return {diagnostics,safe,errors};
})();
