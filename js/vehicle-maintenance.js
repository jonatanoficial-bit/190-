window.C190_VehicleMaintenance = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3800-F44-MANUTENCAO-VIATURAS-20260624-141500-BRT";

  function unitUsage(state) {
    const shift = state?.dispatch?.shift;
    const usage = {};
    (shift?.calls || []).forEach((call) => {
      const selected = call?.resourceDispatch?.selected || [];
      selected.forEach((id) => {
        usage[id] = usage[id] || { trips: 0, field: 0, critical: 0, failed: 0 };
        usage[id].trips += 1;
        if (call.status === "field" || call.fieldRadio?.active) usage[id].field += 1;
        if (Number(call.priority || 1) >= 3) usage[id].critical += 1;
        if (["failed", "abandoned"].includes(call.status)) usage[id].failed += 1;
      });
    });
    return usage;
  }

  function baseFuel(unit) {
    if (unit?.id === "helicoptero") return 72;
    if (unit?.type === "samu") return 78;
    if (unit?.type === "bombeiros") return 68;
    if (unit?.type === "defesa") return 74;
    return 82;
  }

  function maintenanceFor(unit, state) {
    const shift = state?.dispatch?.shift;
    const usage = unitUsage(state)[unit?.id] || { trips: 0, field: 0, critical: 0, failed: 0 };
    const elapsed = Number(shift?.elapsed || 0);
    const distanceFactor = Math.round(Number(unit?.km || 2) * usage.trips * 3);
    const fuel = Math.max(0, Math.min(100, baseFuel(unit) - usage.trips * 9 - usage.field * 5 - distanceFactor - Math.floor(elapsed / 120)));
    const wear = Math.max(0, Math.min(100, 12 + usage.trips * 14 + usage.critical * 8 + usage.failed * 7 + Math.floor(elapsed / 100)));
    const readiness = Math.max(0, Math.min(100, Math.round((fuel * 0.42) + ((100 - wear) * 0.58))));
    const level = readiness < 34 || fuel < 18 || wear > 82
      ? "critical"
      : readiness < 55 || fuel < 35 || wear > 64
        ? "attention"
        : readiness < 74 || fuel < 50 || wear > 46
          ? "service"
          : "ready";
    const label = level === "critical" ? "Manutenção urgente" : level === "attention" ? "Baixa prontidão" : level === "service" ? "Revisar breve" : "Operacional";
    const etaPenalty = level === "critical" ? 1.45 : level === "attention" ? 1.24 : level === "service" ? 1.10 : 1.0;
    const riskBonus = level === "critical" ? 15 : level === "attention" ? 9 : level === "service" ? 4 : 0;
    return {
      version: VERSION,
      unitId: unit?.id || null,
      fuel,
      wear,
      readiness,
      level,
      label,
      etaPenalty,
      riskBonus,
      trips: usage.trips,
      field: usage.field,
      needsFuel: fuel < 35,
      needsMaintenance: wear > 64 || readiness < 55,
    };
  }

  function enrichUnit(unit, state) {
    const maintenance = maintenanceFor(unit, state);
    return {
      ...unit,
      maintenance,
      vehicleReadiness: maintenance.readiness,
      vehicleLevel: maintenance.level,
      vehicleLabel: maintenance.label,
      etaMin: Math.max(1, Math.round(Number(unit.etaMin || 2) * Number(maintenance.etaPenalty || 1))),
    };
  }

  function analyze(state) {
    const resources = window.C190_ResourceDispatch?.resourcesFor?.(state) || [];
    const units = resources.map((unit) => {
      if (unit?.maintenance?.version === VERSION) return unit;
      return enrichUnit(unit, state);
    });
    const problematic = units.filter((unit) => ["critical", "attention"].includes(unit.vehicleLevel));
    const avgReadiness = units.length ? Math.round(units.reduce((sum, unit) => sum + Number(unit.vehicleReadiness || 0), 0) / units.length) : 100;
    const level = avgReadiness < 42 || problematic.some((unit) => unit.vehicleLevel === "critical")
      ? "critical"
      : avgReadiness < 62 || problematic.length >= 2
        ? "attention"
        : "ready";
    const recommendedService = units
      .filter((unit) => unit.maintenance?.needsFuel || unit.maintenance?.needsMaintenance)
      .sort((a, b) => Number(a.vehicleReadiness || 0) - Number(b.vehicleReadiness || 0))
      .slice(0, 4);
    return {
      active: !!state?.dispatch?.shift?.active,
      version: VERSION,
      build: BUILD,
      avgReadiness,
      level,
      label: level === "critical" ? "Frota crítica" : level === "attention" ? "Frota em atenção" : "Frota operacional",
      units,
      problematic,
      recommendedService,
      relief: level === "ready" ? 3 : level === "attention" ? -6 : -14,
    };
  }

  function callModifier(call, state) {
    const selected = new Set(call?.resourceDispatch?.selected || []);
    if (!selected.size) return { riskBonus: 0, notes: [] };
    const report = analyze(state);
    const selectedUnits = report.units.filter((unit) => selected.has(unit.id));
    const weak = selectedUnits.filter((unit) => ["critical", "attention"].includes(unit.vehicleLevel));
    if (!weak.length) return { riskBonus: 0, notes: [] };
    const riskBonus = weak.reduce((sum, unit) => sum + Number(unit.maintenance?.riskBonus || 0), 0);
    return {
      riskBonus: Math.min(20, riskBonus),
      notes: [`Viatura com baixa prontidão: ${weak.map((unit) => unit.short || unit.label).slice(0, 2).join(", ")}.`],
    };
  }

  function etaMultiplierForUnit(unit, state) {
    return maintenanceFor(unit, state).etaPenalty || 1;
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      avgReadiness: report.avgReadiness,
      level: report.level,
      problematic: report.problematic.length,
      service: report.recommendedService.length,
    };
  }

  return { VERSION, BUILD, maintenanceFor, enrichUnit, analyze, callModifier, etaMultiplierForUnit, diagnostics };
})();
