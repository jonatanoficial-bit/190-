window.C190_OperationalBudget = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3900-F45-ORCAMENTO-LOGISTICA-BASE-20260624-144500-BRT";

  const BASE_BUDGET = 18500;
  const TYPE_COST = {
    pm: 420,
    samu: 760,
    bombeiros: 980,
    defesa: 690,
    apoio: 520,
  };
  const SUPPORT_COST = {
    regulacao: 380,
    trauma: 1250,
    cet: 470,
    defesa: 620,
    aguia: 2800,
    gcm: 430,
    concessionaria: 520,
    cobom: 760,
  };

  function callText(call = {}) {
    return `${call.type || ""} ${call.category || ""} ${call.summary || ""} ${(call.tags || []).join(" ")}`.toLowerCase();
  }

  function selectedIds(call = {}) {
    return Array.isArray(call.resourceDispatch?.selected) ? call.resourceDispatch.selected : [];
  }

  function selectedUnits(call, state) {
    const ids = new Set(selectedIds(call));
    if (!ids.size) return [];
    return (window.C190_ResourceDispatch?.resourcesFor?.(state) || []).filter((unit) => ids.has(unit.id));
  }

  function unitCost(unit, call, state) {
    const base = TYPE_COST[unit?.type] || 500;
    const km = Number(unit?.km || 2);
    const priority = Number(call?.priority || 1);
    const air = unit?.id === "helicoptero" ? 2100 : 0;
    const maintenance = Number(unit?.maintenance?.wear || 0) * 5;
    const fuel = Math.max(0, 100 - Number(unit?.maintenance?.fuel ?? 100)) * 3;
    const fatigue = Math.max(0, 100 - Number(unit?.readiness ?? 100)) * 2;
    return Math.round(base + km * 48 + priority * 95 + air + maintenance + fuel + fatigue);
  }

  function callCost(call, state) {
    const units = selectedUnits(call, state);
    const dispatchCost = units.reduce((sum, unit) => sum + unitCost(unit, call, state), 0);
    const radioCost = call.fieldRadio?.active || call.fieldRadio?.finalized ? 260 + (call.fieldRadio?.actions?.length || 0) * 80 : 0;
    const failurePenalty = ["failed", "abandoned"].includes(call.status) ? 950 : 0;
    const overDispatch = units.length >= 5 ? (units.length - 4) * 640 : 0;
    return {
      callId: call.id,
      type: call.type,
      dispatchCost,
      radioCost,
      failurePenalty,
      overDispatch,
      total: dispatchCost + radioCost + failurePenalty + overDispatch,
      unitCount: units.length,
      units: units.map((unit) => ({ id: unit.id, short: unit.short || unit.label, cost: unitCost(unit, call, state), type: unit.type })),
    };
  }

  function supportCost(state) {
    const network = window.C190_SupportNetwork?.analyze?.(state);
    const activated = Array.isArray(network?.activated) ? network.activated : [];
    const total = activated.reduce((sum, item) => sum + (SUPPORT_COST[item.id] || SUPPORT_COST[item.type] || 520), 0);
    return { total, activated: activated.map((item) => ({ id: item.id, label: item.label, cost: SUPPORT_COST[item.id] || SUPPORT_COST[item.type] || 520 })) };
  }

  function baseBudget(state) {
    const shift = state?.dispatch?.shift;
    const difficulty = shift?.difficulty || state?.profile?.difficulty || "realista";
    const modifier = difficulty === "arcade" ? 1.22 : difficulty === "hard" || difficulty === "simulacao" ? 0.86 : 1;
    const major = window.C190_MajorIncidents?.current?.(state);
    const contingencyBoost = major?.active ? 4200 : 0;
    return Math.round(BASE_BUDGET * modifier + contingencyBoost);
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { active: false, version: VERSION, build: BUILD, budget: 0, spent: 0, remaining: 0 };
    const calls = Array.isArray(shift.calls) ? shift.calls : [];
    const callCosts = calls.map((call) => callCost(call, state));
    const support = supportCost(state);
    const maintenanceReport = window.C190_VehicleMaintenance?.analyze?.(state);
    const maintenanceReserve = (maintenanceReport?.recommendedService || []).reduce((sum, unit) => {
      const m = unit.maintenance || {};
      return sum + (m.needsFuel ? 180 : 0) + (m.needsMaintenance ? 520 : 0);
    }, 0);
    const budget = baseBudget(state);
    const spent = callCosts.reduce((sum, item) => sum + item.total, 0) + support.total + maintenanceReserve;
    const remaining = budget - spent;
    const usedPercent = Math.max(0, Math.min(160, Math.round((spent / Math.max(1, budget)) * 100)));
    const level = remaining < 0 || usedPercent >= 105 ? "critical" : usedPercent >= 82 ? "attention" : usedPercent >= 62 ? "watch" : "stable";
    const label = level === "critical" ? "Orçamento estourado" : level === "attention" ? "Orçamento em atenção" : level === "watch" ? "Gasto elevado" : "Logística equilibrada";
    const highCostCalls = callCosts.filter((item) => item.total > 1800).sort((a, b) => b.total - a.total).slice(0, 4);
    const recommendations = [];
    if (level === "critical") recommendations.push("Reduza superdespacho e priorize apoio somente quando operacionalmente necessário.");
    if (support.total > 2600) recommendations.push("Apoios externos estão pesando no orçamento; confirme real necessidade de cada acionamento.");
    if (maintenanceReserve > 900) recommendations.push("Reserve viaturas críticas para revisão/abastecimento após ocorrência.");
    if (!recommendations.length) recommendations.push("Gasto dentro do previsto para o plantão.");
    shift.operationalBudget = { version: VERSION, budget, spent, remaining, usedPercent, level, label, updatedAt: new Date().toISOString() };
    return { active: true, version: VERSION, build: BUILD, budget, spent, remaining, usedPercent, level, label, callCosts, support, maintenanceReserve, highCostCalls, recommendations };
  }

  function pressureModifier(state) {
    const report = analyze(state);
    if (!report.active) return 0;
    return report.level === "critical" ? 16 : report.level === "attention" ? 8 : report.level === "watch" ? 3 : -2;
  }

  function callModifier(call, state) {
    if (!call) return { riskBonus: 0, notes: [] };
    const cost = callCost(call, state);
    if (cost.overDispatch > 0) return { riskBonus: 7, notes: ["Possível superdespacho aumentando custo operacional."] };
    if (cost.total > 2600) return { riskBonus: 4, notes: ["Ocorrência com alto custo logístico."] };
    return { riskBonus: 0, notes: [] };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return { version: VERSION, build: BUILD, active: report.active, budget: report.budget || 0, spent: report.spent || 0, level: report.level || "none", usedPercent: report.usedPercent || 0 };
  }

  return { VERSION, BUILD, analyze, pressureModifier, callModifier, diagnostics };
})();
