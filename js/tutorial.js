window.C190_Tutorial = (() => {
  "use strict";
  const VERSION = 1;
  const STEPS = [
    { id: "answer", title: "Atender a ligação", detail: "Leia a fala inicial e identifique se o chamador está nervoso, confuso, silencioso ou em risco imediato.", focus: "dispatch" },
    { id: "address", title: "Coletar endereço", detail: "Pergunte bairro, rua, número e referência. Sem localização boa, o mapa não deve entregar o ponto automaticamente.", focus: "dispatch" },
    { id: "risk", title: "Entender risco", detail: "Verifique feridos, arma, agressor, incêndio, gás, trânsito, mal súbito ou risco ambiental antes de classificar.", focus: "dispatch" },
    { id: "safety", title: "Orientar segurança", detail: "Mantenha o chamador em local seguro e evite orientações perigosas. Isso influencia protocolo e reputação.", focus: "dispatch" },
    { id: "triage", title: "Classificar e priorizar", detail: "Escolha natureza, prioridade e órgão correto: PM, Bombeiros, SAMU, Defesa Civil ou combinado.", focus: "dispatch" },
    { id: "dispatch", title: "Despachar recursos", detail: "Envie unidade suficiente, próxima e adequada. Evite mandar pouco, mandar órgão errado ou exagerar sem necessidade.", focus: "dispatch" },
    { id: "radio", title: "Acompanhar rádio", detail: "A ocorrência evolui em campo. Responda pedidos de apoio, confirme SAMU/Bombeiros e encerre apenas no momento certo.", focus: "dispatch" },
    { id: "report", title: "Ler relatório", detail: "Compare protocolo, triagem, despacho, rádio, mapa e resultado final para evoluir na carreira.", focus: "reports" },
  ];
  function defaultTutorial() {
    return { version: VERSION, completed: [], lastSeenAt: null, readinessRuns: 0 };
  }
  function normalize(state) {
    state.tutorial = state.tutorial && typeof state.tutorial === "object" ? state.tutorial : defaultTutorial();
    state.tutorial.version = VERSION;
    state.tutorial.completed = Array.isArray(state.tutorial.completed) ? [...new Set(state.tutorial.completed)] : [];
    state.tutorial.readinessRuns = Number(state.tutorial.readinessRuns || 0);
    return state.tutorial;
  }
  function mark(state, stepId) {
    const tutorial = normalize(state);
    if (STEPS.some((step) => step.id === stepId) && !tutorial.completed.includes(stepId)) tutorial.completed.push(stepId);
    tutorial.lastSeenAt = new Date().toISOString();
    return summary(state);
  }
  function summary(state) {
    const tutorial = normalize(state);
    const completed = tutorial.completed.length;
    return { total: STEPS.length, completed, percent: Math.round((completed / STEPS.length) * 100), next: STEPS.find((step) => !tutorial.completed.includes(step.id)) || null };
  }
  function checklist(state) {
    normalize(state);
    const hasProfile = !!state.profile;
    const release = window.C190_Release?.releaseChecklist?.(state) || [];
    const diagnostics = window.C190_AntiBreak?.diagnostics?.(state);
    const assets = window.C190_Assets?.diagnostics?.();
    return [
      { name: "Perfil criado", ok: hasProfile, detail: hasProfile ? `${state.profile.callSign || state.profile.name} pronto para plantão` : "Crie uma carreira no Painel" },
      { name: "Tutorial disponível", ok: STEPS.length >= 8, detail: `${STEPS.length} etapas guiadas` },
      { name: "Assets e fundos", ok: assets?.ok !== false, detail: assets ? `${assets.loaded}/${assets.required} obrigatórios · ${assets.optionalLoaded || 0}/${assets.optional || 0} opcionais` : "Módulo visual carregando" },
      { name: "Núcleo anti-quebra", ok: diagnostics ? diagnostics.ok : true, detail: diagnostics?.ok ? "Sem falhas críticas" : "Execute diagnóstico em Configurações" },
      { name: "Checklist RC", ok: release.filter((item) => item.ok).length >= Math.max(1, release.length - 1), detail: `${release.filter((item) => item.ok).length}/${release.length} itens aprovados` },
    ];
  }
  return { VERSION, STEPS, defaultTutorial, normalize, mark, summary, checklist };
})();
