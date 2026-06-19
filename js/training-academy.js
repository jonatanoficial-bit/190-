window.C190_TrainingAcademy = (() => {
  "use strict";

  const VERSION = 1;

  const MODULES = [
    { id: "call_protocol", icon: "☎", name: "Atendimento guiado", focus: "Protocolo", passScore: 78, courseId: "comunicacao", desc: "Treina abertura da ligação, calma, dados mínimos e perguntas essenciais." },
    { id: "geo_reference", icon: "⌖", name: "Geolocalização e referência", focus: "Mapa", passScore: 76, courseId: "geolocalizacao", desc: "Treina bairro, rua, número, referência e leitura do raio de incerteza." },
    { id: "triage_priority", icon: "⌁", name: "Triagem profissional", focus: "Prioridade", passScore: 80, courseId: "triagem", desc: "Treina natureza, prioridade e escolha correta entre PM, Bombeiros, SAMU ou combinado." },
    { id: "domestic_care", icon: "⚖", name: "Proteção e acolhimento", focus: "Vulneráveis", passScore: 82, courseId: "violencia_domestica", desc: "Treina ligação silenciosa, palavra-código, segurança do chamador e vítimas vulneráveis." },
    { id: "resource_dispatch", icon: "▣", name: "Despacho integrado", focus: "Unidades", passScore: 80, courseId: "despacho_integrado", desc: "Treina seleção de viaturas, Bombeiros, SAMU, Defesa Civil e reforço proporcional." },
    { id: "field_radio", icon: "◌", name: "Rádio e comando de campo", focus: "Rádio", passScore: 80, courseId: "radio_operacional", desc: "Treina reforço, redirecionamento, encerramento e resposta aos informes de campo." },
    { id: "negotiation", icon: "◇", name: "Negociação em alto risco", focus: "Crise", passScore: 84, courseId: "negociacao", desc: "Treina chamadas críticas, risco armado, refém, agressor e redução de danos." },
    { id: "quality_audit", icon: "✓", name: "Auditoria de qualidade", focus: "Relatório", passScore: 86, courseId: "auditoria", desc: "Treina leitura do relatório, correção de erro e padrão de excelência para promoção." },
  ];

  const COURSE_EFFECTS = {
    comunicacao: { label: "Comunicação", protocol: 5, xp: 0.015 },
    geolocalizacao: { label: "Geolocalização", location: 7, resource: 2, xp: 0.012 },
    triagem: { label: "Triagem", triage: 6, xp: 0.015 },
    violencia_domestica: { label: "Acolhimento", protocol: 3, radio: 2, rep: 1 },
    gerenciamento: { label: "Múltiplas ocorrências", resource: 3, radio: 2, xp: 0.01 },
    despacho_integrado: { label: "Despacho integrado", resource: 7, xp: 0.015 },
    lideranca: { label: "Liderança", radio: 3, rep: 1 },
    radio_operacional: { label: "Rádio operacional", radio: 7, xp: 0.015 },
    negociacao: { label: "Negociação", protocol: 3, radio: 4, rep: 1 },
    auditoria: { label: "Auditoria", triage: 2, resource: 2, radio: 2, rep: 1 },
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  const gradeFor = (score) => score >= 92 ? "S" : score >= 80 ? "A" : score >= 68 ? "B" : score >= 55 ? "C" : "D";

  function defaultTraining() {
    return {
      version: VERSION,
      certificates: [],
      simulations: [],
      stats: { total: 0, passed: 0, bestScore: 0, averageScore: 0 },
      recommendedModuleId: null,
      lastBonus: null,
    };
  }

  function migrate(source) {
    const base = defaultTraining();
    if (source && typeof source === "object") {
      base.certificates = Array.isArray(source.certificates) ? source.certificates : [];
      base.simulations = Array.isArray(source.simulations) ? source.simulations.slice(0, 30) : [];
      base.stats = { ...base.stats, ...(source.stats || {}) };
      base.recommendedModuleId = source.recommendedModuleId || null;
      base.lastBonus = source.lastBonus || null;
    }
    return base;
  }

  function normalize(state) {
    if (!state) return defaultTraining();
    state.training = migrate(state.training);
    return state.training;
  }

  function completed(state) {
    return new Set(state?.career?.completedCourses || []);
  }

  function certificateIds(state) {
    return new Set((state?.training?.certificates || []).map((c) => c.moduleId));
  }

  function hasCertificate(state, moduleId) {
    return certificateIds(state).has(moduleId);
  }

  function certificates(state) {
    normalize(state);
    return (state.training.certificates || []).map((cert) => ({ ...cert, name: MODULES.find((m) => m.id === cert.moduleId)?.name || cert.moduleId }));
  }

  function effectTotals(state) {
    const courses = completed(state);
    const certs = certificateIds(state);
    const totals = { protocol: 0, location: 0, triage: 0, resource: 0, radio: 0, rep: 0, xp: 0, labels: [] };
    for (const id of courses) {
      const e = COURSE_EFFECTS[id];
      if (!e) continue;
      totals.protocol += e.protocol || 0;
      totals.location += e.location || 0;
      totals.triage += e.triage || 0;
      totals.resource += e.resource || 0;
      totals.radio += e.radio || 0;
      totals.rep += e.rep || 0;
      totals.xp += e.xp || 0;
      totals.labels.push(e.label);
    }
    for (const module of MODULES) {
      if (!certs.has(module.id)) continue;
      if (module.id === "call_protocol") totals.protocol += 2;
      if (module.id === "geo_reference") totals.location += 3;
      if (module.id === "triage_priority") totals.triage += 3;
      if (module.id === "resource_dispatch") totals.resource += 3;
      if (module.id === "field_radio") totals.radio += 3;
      if (module.id === "quality_audit") totals.rep += 1;
    }
    totals.xp = clamp(totals.xp, 0, 0.15);
    return totals;
  }

  function effectCards(state) {
    const courses = completed(state);
    return Object.entries(COURSE_EFFECTS).map(([id, e]) => ({
      id,
      active: courses.has(id),
      label: e.label,
      detail: courses.has(id)
        ? [`Protocolo +${e.protocol || 0}`, `Triagem +${e.triage || 0}`, `Despacho +${e.resource || 0}`, `Rádio +${e.radio || 0}`, e.rep ? `Rep +${e.rep}` : null].filter(Boolean).join(" · ")
        : `Concluir curso para ativar efeito prático`,
    }));
  }

  function moduleReadiness(state, module) {
    const courses = completed(state);
    const cert = hasCertificate(state, module.id);
    if (cert) return { ready: true, detail: "Certificação conquistada. Refazer melhora estatísticas." };
    if (courses.has(module.courseId)) return { ready: true, detail: "Curso formal concluído: alta chance de certificação." };
    return { ready: true, detail: "Pode treinar antes do curso, mas a prova será mais difícil." };
  }

  function seedScore(state, module) {
    const courses = completed(state);
    const certs = certificateIds(state);
    const rank = window.C190_Career?.rankIndex?.(state?.career?.rankId) || 0;
    let score = 56 + rank * 3 + Math.min(15, (state?.career?.reputation || 50) / 8);
    if (courses.has(module.courseId)) score += 18;
    if (certs.has(module.id)) score += 5;
    if ((state?.career?.completedCourses || []).length >= 4) score += 4;
    const variation = Math.floor(Math.random() * 13) - 5;
    return clamp(Math.round(score + variation), 0, 100);
  }

  function runSimulation(state, moduleId) {
    normalize(state);
    const module = MODULES.find((m) => m.id === moduleId);
    if (!module) return { ok: false, reason: "module_not_found" };
    const score = seedScore(state, module);
    const grade = gradeFor(score);
    const passed = score >= module.passScore;
    const feedback = [];
    if (score >= 92) feedback.push("padrão excelente");
    else if (passed) feedback.push("aprovado para operação");
    else feedback.push("revisar antes da certificação");
    if (!(state.career?.completedCourses || []).includes(module.courseId)) feedback.push("curso formal recomendado");
    if (module.id === "geo_reference") feedback.push("atenção ao endereço completo e ponto de referência");
    if (module.id === "resource_dispatch") feedback.push("equilibrar órgão correto, quantidade e ETA");
    if (module.id === "field_radio") feedback.push("não encerrar antes da confirmação de controle");

    const result = {
      id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
      moduleId: module.id,
      moduleName: module.name,
      at: new Date().toISOString(),
      score,
      grade,
      passed,
      feedback,
    };
    state.training.simulations.unshift(result);
    state.training.simulations = state.training.simulations.slice(0, 30);
    state.training.stats.total = Number(state.training.stats.total || 0) + 1;
    state.training.stats.passed = Number(state.training.stats.passed || 0) + (passed ? 1 : 0);
    state.training.stats.bestScore = Math.max(Number(state.training.stats.bestScore || 0), score);
    const totalScore = state.training.simulations.reduce((sum, item) => sum + Number(item.score || 0), 0);
    state.training.stats.averageScore = Math.round(totalScore / Math.max(1, state.training.simulations.length));
    state.training.recommendedModuleId = passed ? null : module.id;

    if (passed && !hasCertificate(state, module.id)) {
      state.training.certificates.push({ moduleId: module.id, earnedAt: result.at, score, grade });
      state.career.xp += score >= 92 ? 160 : 95;
      state.career.reputation = clamp((state.career.reputation || 50) + (score >= 92 ? 2 : 1), 0, 100);
      window.C190_Career?.addEvent?.(state, "training", "Certificação conquistada", `${module.name} · ${grade} (${score}/100)`);
    } else {
      state.career.xp += passed ? 35 : 15;
      window.C190_Career?.addEvent?.(state, "training", "Simulação concluída", `${module.name} · ${grade} (${score}/100)`);
    }
    window.C190_Career?.evaluate?.(state);
    return { ok: true, result, module };
  }

  function lowGradeModule(outcome) {
    const pairs = [
      ["call_protocol", outcome?.protocol?.finalProtocolScore],
      ["triage_priority", outcome?.triage?.finalScore],
      ["resource_dispatch", outcome?.resourceDispatch?.finalScore],
      ["field_radio", outcome?.radio?.finalScore],
    ];
    const low = pairs.filter(([, score]) => Number(score || 0) < 68).sort((a,b) => Number(a[1] || 0) - Number(b[1] || 0))[0];
    return low?.[0] || null;
  }

  function applyOutcome(state, call, finalOutcome) {
    normalize(state);
    const totals = effectTotals(state);
    const protocolScore = Number(finalOutcome?.protocol?.finalProtocolScore || 0);
    const triageScore = Number(finalOutcome?.triage?.finalScore || 0);
    const resourceScore = Number(finalOutcome?.resourceDispatch?.finalScore || 0);
    const radioScore = Number(finalOutcome?.radio?.finalScore || 0);
    const rawBonus = Math.round(
      (protocolScore >= 68 ? totals.protocol : totals.protocol * 0.4) / 12 +
      (triageScore >= 68 ? totals.triage : totals.triage * 0.4) / 12 +
      (resourceScore >= 68 ? totals.resource : totals.resource * 0.4) / 12 +
      (radioScore >= 68 ? totals.radio : totals.radio * 0.4) / 12
    );
    const qualityBonus = clamp(rawBonus, 0, 3);
    const xpMultiplier = 1 + totals.xp;
    const repBonus = totals.rep && (protocolScore + triageScore + resourceScore + radioScore) / 4 >= 70 ? Math.min(2, totals.rep) : 0;
    const adjusted = {
      ...finalOutcome,
      quality: Number(finalOutcome?.quality || 0) + qualityBonus,
      xp: Math.max(0, Math.round(Number(finalOutcome?.xp || 0) * xpMultiplier)),
      rep: Number(finalOutcome?.rep || 0) + repBonus,
      training: {
        qualityBonus,
        xpMultiplier: Number(xpMultiplier.toFixed(3)),
        repBonus,
        label: qualityBonus || repBonus || totals.xp ? `+${qualityBonus} qualidade · XP x${xpMultiplier.toFixed(2)} · rep +${repBonus}` : "sem bônus ativo",
        activeCourses: totals.labels,
      },
    };
    state.training.lastBonus = adjusted.training;
    state.training.recommendedModuleId = lowGradeModule(finalOutcome);
    return adjusted;
  }

  function summary(state) {
    normalize(state);
    const totalCourses = (state.career?.completedCourses || []).length;
    const eff = effectTotals(state);
    return {
      certificates: (state.training.certificates || []).length,
      passed: Number(state.training.stats.passed || 0),
      bestScore: Number(state.training.stats.bestScore || 0),
      effectLabel: `${totalCourses} curso(s) · XP x${(1 + eff.xp).toFixed(2)}`,
    };
  }

  return { VERSION, MODULES, defaultTraining, migrate, normalize, hasCertificate, certificates, effectTotals, effectCards, moduleReadiness, runSimulation, applyOutcome, summary };
})();
