window.C190_PreventiveOps = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4200-F48-PATRULHAMENTO-PREVENTIVO-20260624-161500-BRT";

  const OPS = {
    patrulha_pm: { label: "Patrulha preventiva PM", icon: "🚓", duration: 90, effect: 18, cost: 260, focus: ["violência", "roubo", "geral"] },
    ponto_visivel: { label: "Ponto visível / presença", icon: "👮", duration: 70, effect: 14, cost: 180, focus: ["violência", "trânsito", "geral"] },
    rota_samu: { label: "Pré-posicionamento SAMU", icon: "🚑", duration: 85, effect: 16, cost: 320, focus: ["samu", "acidente", "trânsito"] },
    vistoria_risco: { label: "Vistoria Defesa Civil", icon: "🏗", duration: 95, effect: 20, cost: 290, focus: ["resgate", "alagamento", "incêndio"] },
    rota_bombeiros: { label: "Cobertura preventiva Bombeiros", icon: "🚒", duration: 85, effect: 17, cost: 340, focus: ["resgate", "incêndio", "alagamento"] }
  };

  function ensure(state) {
    const shift = state?.dispatch?.shift;
    if (!shift) return null;
    shift.preventiveOps = shift.preventiveOps && typeof shift.preventiveOps === "object" ? shift.preventiveOps : { version: VERSION, active: [], history: [] };
    shift.preventiveOps.version = VERSION;
    shift.preventiveOps.active = Array.isArray(shift.preventiveOps.active) ? shift.preventiveOps.active : [];
    shift.preventiveOps.history = Array.isArray(shift.preventiveOps.history) ? shift.preventiveOps.history : [];
    return shift.preventiveOps;
  }

  function activeOps(state) {
    const shift = state?.dispatch?.shift;
    const data = ensure(state);
    if (!shift?.active || !data) return [];
    const elapsed = Number(shift.elapsed || 0);
    data.active.forEach((op) => {
      if (op.status === "active" && elapsed >= Number(op.endsAt || 0)) {
        op.status = "completed";
        op.completedAt = new Date().toISOString();
        data.history.unshift({ ...op });
      }
    });
    data.active = data.active.filter((op) => op.status === "active");
    data.history = data.history.slice(0, 18);
    return data.active;
  }

  function opForCategory(category = "geral") {
    const entry = Object.entries(OPS).find(([, op]) => op.focus.includes(category));
    return entry ? entry[0] : "patrulha_pm";
  }

  function plans(state) {
    const intel = window.C190_TerritorialIntel?.analyze?.(state);
    const active = activeOps(state);
    const activeZones = new Set(active.map((op) => op.zoneId));
    const recommendations = (intel?.recommended || []).slice(0, 4);
    return recommendations.map((item, index) => {
      const opType = opForCategory(item.category);
      const op = OPS[opType] || OPS.patrulha_pm;
      const alreadyActive = activeZones.has(item.zoneId);
      return {
        id: `${item.zoneId}-${opType}`,
        zoneId: item.zoneId,
        zoneLabel: item.label,
        category: item.category,
        riskScore: item.riskScore,
        opType,
        label: op.label,
        icon: op.icon,
        cost: op.cost,
        effect: op.effect,
        priority: index + 1,
        alreadyActive,
        action: alreadyActive ? `Operação já ativa em ${item.label}` : `${op.label} em ${item.label}`,
      };
    });
  }

  function startOperation(state, zoneId, opType = null) {
    const shift = state?.dispatch?.shift;
    const data = ensure(state);
    if (!shift?.active || !data) return { ok: false, reason: "Plantão inativo." };
    const plan = plans(state).find((item) => item.zoneId === zoneId) || { zoneId, zoneLabel: zoneId, category: "geral", opType: opType || "patrulha_pm", riskScore: 50 };
    const type = opType || plan.opType || opForCategory(plan.category);
    const op = OPS[type] || OPS.patrulha_pm;
    const existing = data.active.find((item) => item.zoneId === zoneId && item.status === "active");
    if (existing) return { ok: true, alreadyActive: true, operation: existing };
    const startedAt = Number(shift.elapsed || 0);
    const operation = {
      id: `op-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      version: VERSION,
      zoneId,
      zoneLabel: plan.zoneLabel || zoneId,
      category: plan.category || "geral",
      opType: type,
      label: op.label,
      icon: op.icon,
      effect: op.effect,
      cost: op.cost,
      startedAt,
      endsAt: startedAt + Number(op.duration || 80),
      createdAt: new Date().toISOString(),
      status: "active",
    };
    data.active.unshift(operation);
    try {
      window.dispatchEvent(new CustomEvent("c190:shift-event", {
        detail: { kind: "preventive_operation", text: `${op.label} iniciada em ${operation.zoneLabel}.`, operation }
      }));
    } catch (_) {}
    return { ok: true, operation };
  }

  function coverageForZone(state, zoneId) {
    const active = activeOps(state).filter((op) => op.zoneId === zoneId);
    if (!active.length) return { active: false, effect: 0, operations: [] };
    const effect = Math.min(42, active.reduce((sum, op) => sum + Number(op.effect || 0), 0));
    return { active: true, effect, operations: active };
  }

  function analyze(state) {
    const active = !!state?.dispatch?.shift?.active;
    const activeList = activeOps(state);
    const planList = active ? plans(state) : [];
    const intel = window.C190_TerritorialIntel?.analyze?.(state);
    const hotZones = intel?.hot || [];
    const uncovered = hotZones.filter((zone) => !coverageForZone(state, zone.id).active);
    const coverageScore = Math.max(0, Math.min(100, Math.round(72 + activeList.length * 9 - uncovered.length * 18 - Math.max(0, (intel?.avgRisk || 0) - 60) * 0.45)));
    const level = coverageScore < 42 || uncovered.some((zone) => zone.level === "hot") ? "critical" : coverageScore < 64 || uncovered.length ? "attention" : "ready";
    return {
      active,
      version: VERSION,
      build: BUILD,
      activeOperations: activeList,
      plans: planList,
      uncovered,
      coverageScore,
      level,
      label: level === "critical" ? "Prevenção insuficiente" : level === "attention" ? "Prevenção em atenção" : "Prevenção ativa",
      relief: level === "ready" ? 8 : level === "attention" ? -4 : -14,
      totalCost: activeList.reduce((sum, op) => sum + Number(op.cost || 0), 0),
    };
  }

  function callModifier(call, state) {
    const zone = window.C190_TerritorialIntel?.zoneForCall?.(call, state);
    if (!zone) return { riskBonus: 0, notes: [] };
    const coverage = coverageForZone(state, zone.id);
    if (coverage.active) {
      return { riskBonus: -Math.min(16, coverage.effect), notes: [`Operação preventiva ativa em ${zone.label}.`] };
    }
    const intel = window.C190_TerritorialIntel?.analyze?.(state);
    const zoneReport = intel?.zones?.find((item) => item.id === zone.id);
    if (zoneReport?.level === "hot") return { riskBonus: 10, notes: [`Zona quente sem prevenção ativa: ${zone.label}.`] };
    return { riskBonus: 0, notes: [] };
  }

  function pressureRelief(state) {
    return Number(analyze(state).relief || 0);
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      level: report.level,
      coverageScore: report.coverageScore,
      activeOperations: report.activeOperations.length,
      uncovered: report.uncovered.length,
    };
  }

  return { VERSION, BUILD, OPS, ensure, activeOps, plans, startOperation, analyze, callModifier, pressureRelief, diagnostics };
})();
