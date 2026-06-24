window.C190_SupportNetwork = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3600-F42-COMANDO-UNIFICADO-20260624-131500-BRT";

  const SUPPORTS = [
    { id: "regulacao-samu", label: "Regulação SAMU", icon: "192", type: "medical", relief: 10, tags: ["samu", "vítima", "ferid", "avc", "mal súbito", "acidente"] },
    { id: "hospital-trauma", label: "Hospital referência trauma", icon: "H", type: "hospital", relief: 12, tags: ["ferid", "arma", "queda", "colisão", "trauma", "vítima"] },
    { id: "cet-transito", label: "CET / bloqueio viário", icon: "CET", type: "traffic", relief: 9, tags: ["trânsito", "via", "colisão", "acidente", "bloqueada", "obras"] },
    { id: "defesa-civil", label: "Defesa Civil", icon: "DC", type: "civil", relief: 11, tags: ["alag", "desliz", "queda", "enchente", "risco estrutural", "temporal"] },
    { id: "aguia-aereo", label: "Águia / apoio aéreo", icon: "Á", type: "air", relief: 13, tags: ["fuga", "arma", "roubo", "agressor", "mata", "área aberta", "crítico"] },
    { id: "gcm-apoio", label: "GCM / apoio municipal", icon: "GCM", type: "security", relief: 6, tags: ["praça", "escola", "patrimônio", "apoio", "isolamento"] },
    { id: "concessionaria", label: "Concessionária energia/gás", icon: "⚡", type: "utility", relief: 8, tags: ["gás", "energia", "fio", "explosão", "fumaça", "risco"] },
    { id: "cobom-extra", label: "COBOM / reforço Bombeiros", icon: "193", type: "fire", relief: 10, tags: ["incêndio", "fogo", "resgate", "desab", "bombeiro", "fumaça"] }
  ];

  const HOSPITALS = [
    { id: "hm-central", label: "Hospital Municipal Central", capacity: 78, trauma: 70, pediatric: 55 },
    { id: "ps-zona-norte", label: "Pronto-Socorro Zona Norte", capacity: 64, trauma: 58, pediatric: 62 },
    { id: "upa-apoio", label: "UPA apoio clínico", capacity: 71, trauma: 38, pediatric: 60 },
    { id: "hospital-trauma-sp", label: "Referência trauma SP", capacity: 52, trauma: 92, pediatric: 44 }
  ];

  function textOf(call = {}) {
    return `${call.type || ""} ${call.summary || ""} ${call.category || ""} ${(call.tags || []).join(" ")} ${call.location || ""}`.toLowerCase();
  }

  function activeCall(shift) {
    return (shift?.calls || []).find((call) => call.id === shift?.activeCallId) || null;
  }

  function waitingCalls(shift) {
    return (shift?.calls || []).filter((call) => call.status === "waiting");
  }

  function fieldCalls(shift) {
    return (shift?.calls || []).filter((call) => call.status === "field");
  }

  function ensure(shift) {
    shift.supportNetwork = shift.supportNetwork && typeof shift.supportNetwork === "object" ? shift.supportNetwork : { version: VERSION, activated: [], history: [] };
    shift.supportNetwork.version = VERSION;
    shift.supportNetwork.activated = Array.isArray(shift.supportNetwork.activated) ? shift.supportNetwork.activated : [];
    shift.supportNetwork.history = Array.isArray(shift.supportNetwork.history) ? shift.supportNetwork.history : [];
    return shift.supportNetwork;
  }

  function hospitalLoad(state, shift) {
    const urban = window.C190_UrbanDynamics?.current?.(state);
    const major = window.C190_MajorIncidents?.current?.(state);
    const pressure = Number(urban?.pressureBonus || 0) + (major?.active ? Number(major?.severity?.score || 0) * 0.22 : 0) + waitingCalls(shift).length * 4 + fieldCalls(shift).length * 5;
    return Math.max(0, Math.min(100, Math.round(42 + pressure)));
  }

  function bestHospital(call, state, shift) {
    const text = textOf(call);
    const load = hospitalLoad(state, shift);
    const scored = HOSPITALS.map((hospital) => {
      let score = hospital.capacity - load * 0.22;
      if (/trauma|arma|ferid|queda|colisão|acidente|vítima/.test(text)) score += hospital.trauma * 0.38;
      if (/criança|bebê|menor|escola/.test(text)) score += hospital.pediatric * 0.32;
      return { ...hospital, score: Math.round(score), load };
    }).sort((a, b) => b.score - a.score);
    return scored[0] || HOSPITALS[0];
  }

  function recommendedSupports(call, state, shift) {
    const text = textOf(call);
    const urban = window.C190_UrbanDynamics?.current?.(state);
    const major = window.C190_MajorIncidents?.current?.(state);
    const list = SUPPORTS.map((support) => {
      const tagHits = support.tags.filter((tag) => text.includes(tag)).length;
      let score = tagHits * 22;
      if (major?.active && ["civil", "traffic", "fire", "medical"].includes(support.type)) score += 12;
      if (urban?.traffic?.id === "blocked" && support.type === "traffic") score += 24;
      if (["rain", "storm"].includes(urban?.weather?.id) && support.type === "civil") score += 18;
      if (Number(call?.priority || 1) >= 3 && ["air", "medical", "hospital"].includes(support.type)) score += 8;
      return { ...support, score, recommended: score >= 18 };
    }).filter((support) => support.score > 0).sort((a, b) => b.score - a.score);
    return list.slice(0, 4);
  }

  function activationSet(shift) {
    return new Set(ensure(shift).activated.map((item) => item.id));
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { active: false, version: VERSION, supportScore: 0, relief: 0, recommendations: [] };
    const network = ensure(shift);
    const call = activeCall(shift) || waitingCalls(shift)[0] || fieldCalls(shift)[0] || null;
    const hospital = bestHospital(call || {}, state, shift);
    const recommendations = recommendedSupports(call || {}, state, shift);
    const activeIds = activationSet(shift);
    const activated = network.activated.slice(0, 8);
    const relief = activated.reduce((sum, item) => sum + Number(item.relief || 0), 0);
    const missingCritical = recommendations.filter((item) => item.recommended && !activeIds.has(item.id)).length;
    const supportScore = Math.max(0, Math.min(100, Math.round(76 + relief - missingCritical * 12 - hospital.load * 0.18)));
    const level = supportScore >= 78 ? "ready" : supportScore >= 58 ? "attention" : "critical";
    shift.supportNetwork.snapshot = { supportScore, level, relief, hospital: hospital.label, recommendations: recommendations.length, updatedAt: new Date().toISOString() };
    return { active: true, version: VERSION, build: BUILD, supportScore, level, relief, call, hospital, recommendations, activated, activeIds: [...activeIds] };
  }

  function requestSupport(state, supportId) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { ok: false, reason: "shift_inactive" };
    const network = ensure(shift);
    const support = SUPPORTS.find((item) => item.id === supportId);
    if (!support) return { ok: false, reason: "support_not_found" };
    if (network.activated.some((item) => item.id === support.id)) return { ok: true, already: true, support };
    const item = { ...support, at: new Date().toISOString(), elapsed: shift.elapsed || 0 };
    network.activated.unshift(item);
    network.history.unshift({ at: item.at, type: "support_requested", text: `Apoio acionado: ${support.label}` });
    network.activated = network.activated.slice(0, 12);
    network.history = network.history.slice(0, 10);
    try {
      window.dispatchEvent(new CustomEvent("c190:shift-event", { detail: { kind: "support_requested", text: `Apoio especializado acionado: ${support.label}.`, support } }));
    } catch (_) {}
    return { ok: true, support };
  }

  function pressureRelief(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return 0;
    return Math.min(24, ensure(shift).activated.reduce((sum, item) => sum + Number(item.relief || 0), 0));
  }

  function callModifier(call, state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active || !call) return { riskBonus: 0, notes: [] };
    const activeIds = activationSet(shift);
    const recommendations = recommendedSupports(call, state, shift).filter((item) => item.recommended);
    const missing = recommendations.filter((item) => !activeIds.has(item.id));
    if (!missing.length) return { riskBonus: -6, notes: ["Apoio especializado adequado reduz risco operacional."] };
    return { riskBonus: Math.min(14, missing.length * 5), notes: [`Apoio pendente: ${missing[0].label}.`] };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return { version: VERSION, build: BUILD, active: report.active, score: report.supportScore || 0, level: report.level || "none", recommendations: report.recommendations?.length || 0, activated: report.activated?.length || 0 };
  }

  return { VERSION, BUILD, SUPPORTS, HOSPITALS, analyze, requestSupport, pressureRelief, callModifier, diagnostics };
})();
