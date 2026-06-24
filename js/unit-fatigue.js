window.C190_UnitFatigue = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3700-F43-FADIGA-RODIZIO-EQUIPES-20260624-134500-BRT";

  function unitUsage(state) {
    const shift = state?.dispatch?.shift;
    const usage = {};
    (shift?.calls || []).forEach((call) => {
      const selected = call?.resourceDispatch?.selected || [];
      selected.forEach((id) => {
        usage[id] = usage[id] || { dispatched: 0, field: 0, resolved: 0, failed: 0 };
        usage[id].dispatched += 1;
        if (call.status === "field" || call.fieldRadio?.active) usage[id].field += 1;
        if (call.status === "resolved") usage[id].resolved += 1;
        if (call.status === "failed" || call.status === "abandoned") usage[id].failed += 1;
      });
    });
    return usage;
  }

  function fatigueFor(unit, state) {
    const shift = state?.dispatch?.shift;
    const usage = unitUsage(state)[unit?.id] || { dispatched: 0, field: 0, resolved: 0, failed: 0 };
    const elapsed = Number(shift?.elapsed || 0);
    const base = usage.dispatched * 17 + usage.field * 12 + usage.failed * 6 + Math.floor(elapsed / 85);
    const typePenalty = unit?.type === "samu" ? 4 : unit?.type === "bombeiros" ? 6 : unit?.id === "helicoptero" ? 8 : 0;
    const fatigue = Math.max(0, Math.min(100, base + typePenalty));
    const readiness = Math.max(0, 100 - fatigue);
    const level = fatigue >= 78 ? "critical" : fatigue >= 58 ? "tired" : fatigue >= 34 ? "attention" : "ready";
    const label = level === "critical" ? "Exausta" : level === "tired" ? "Cansada" : level === "attention" ? "Atenção" : "Pronta";
    return {
      version: VERSION,
      unitId: unit?.id || null,
      fatigue,
      readiness,
      level,
      label,
      dispatched: usage.dispatched,
      field: usage.field,
      etaPenalty: level === "critical" ? 1.35 : level === "tired" ? 1.20 : level === "attention" ? 1.08 : 1.0,
      riskBonus: level === "critical" ? 12 : level === "tired" ? 7 : level === "attention" ? 3 : 0,
      needsRest: level === "critical" || (level === "tired" && usage.field === 0),
    };
  }

  function enrichUnit(unit, state) {
    const fatigue = fatigueFor(unit, state);
    return {
      ...unit,
      fatigue,
      fatigueLevel: fatigue.level,
      fatigueLabel: fatigue.label,
      readiness: fatigue.readiness,
      etaMin: Math.max(1, Math.round(Number(unit.etaMin || 2) * Number(fatigue.etaPenalty || 1))),
    };
  }

  function analyze(state) {
    const resources = window.C190_ResourceDispatch?.resourcesFor?.(state) || [];
    const units = resources.map((unit) => enrichUnit(unit, state));
    const tired = units.filter((unit) => ["critical", "tired"].includes(unit.fatigueLevel));
    const field = units.filter((unit) => unit.assignedTo);
    const avgReadiness = units.length ? Math.round(units.reduce((sum, unit) => sum + Number(unit.readiness || 0), 0) / units.length) : 100;
    const level = avgReadiness < 45 || tired.some((unit) => unit.fatigueLevel === "critical")
      ? "critical"
      : avgReadiness < 65 || tired.length >= 2
        ? "attention"
        : "ready";
    const recommendedRest = tired.filter((unit) => unit.fatigue?.needsRest).slice(0, 3);
    return {
      active: !!state?.dispatch?.shift?.active,
      version: VERSION,
      build: BUILD,
      avgReadiness,
      level,
      label: level === "critical" ? "Rodízio urgente" : level === "attention" ? "Efetivo sob desgaste" : "Efetivo operacional",
      units,
      tired,
      field,
      recommendedRest,
      relief: level === "ready" ? 4 : level === "attention" ? -5 : -12,
    };
  }

  function callModifier(call, state) {
    const selected = new Set(call?.resourceDispatch?.selected || []);
    if (!selected.size) return { riskBonus: 0, notes: [] };
    const report = analyze(state);
    const selectedUnits = report.units.filter((unit) => selected.has(unit.id));
    const tired = selectedUnits.filter((unit) => ["critical", "tired"].includes(unit.fatigueLevel));
    if (!tired.length) return { riskBonus: 0, notes: [] };
    const riskBonus = tired.reduce((sum, unit) => sum + Number(unit.fatigue?.riskBonus || 0), 0);
    return {
      riskBonus: Math.min(18, riskBonus),
      notes: [`Equipe desgastada no despacho: ${tired.map((unit) => unit.short || unit.label).slice(0, 2).join(", ")}.`],
    };
  }

  function etaMultiplierForUnit(unit, state) {
    return fatigueFor(unit, state).etaPenalty || 1;
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      avgReadiness: report.avgReadiness,
      level: report.level,
      tired: report.tired.length,
      field: report.field.length,
    };
  }

  return { VERSION, BUILD, fatigueFor, enrichUnit, analyze, callModifier, etaMultiplierForUnit, diagnostics };
})();
