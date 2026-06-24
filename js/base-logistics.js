window.C190_BaseLogistics = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4000-F46-COBERTURA-TERRITORIAL-20260624-151500-BRT";

  const BASES = [
    { id: "base-centro", label: "Base Centro", area: "Centro expandido", lat: -23.55052, lng: -46.63331, capacity: 4, focus: ["pm", "samu"] },
    { id: "base-norte", label: "Base Norte", area: "Zona Norte", lat: -23.48093, lng: -46.62689, capacity: 3, focus: ["pm", "bombeiros"] },
    { id: "base-leste", label: "Base Leste", area: "Zona Leste", lat: -23.54213, lng: -46.47565, capacity: 3, focus: ["pm", "defesa"] },
    { id: "base-sul", label: "Base Sul", area: "Zona Sul", lat: -23.65428, lng: -46.69920, capacity: 3, focus: ["samu", "bombeiros"] },
    { id: "base-oeste", label: "Base Oeste", area: "Zona Oeste", lat: -23.55814, lng: -46.72989, capacity: 2, focus: ["pm", "samu"] }
  ];

  function distanceKm(a, b) {
    const lat1 = Number(a?.lat || 0);
    const lon1 = Number(a?.lng || 0);
    const lat2 = Number(b?.lat || 0);
    const lon2 = Number(b?.lng || 0);
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const s1 = Math.sin(dLat / 2) ** 2;
    const s2 = Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - s1 - s2));
  }

  function centerOf(state) {
    return window.C190_Map?.centerOf?.(state) || state?.settings?.mapCenter || { lat: -23.55052, lng: -46.63331 };
  }

  function nearestBase(point, type = null) {
    const pool = type ? BASES.filter((base) => base.focus.includes(type)) : BASES;
    return [...(pool.length ? pool : BASES)].sort((a, b) => distanceKm(a, point) - distanceKm(b, point))[0];
  }

  function callPoint(call, state) {
    const loc = window.C190_LocationIntel?.normalize?.(call) || {};
    if (Number.isFinite(Number(loc.lat)) && Number.isFinite(Number(loc.lng))) return { lat: Number(loc.lat), lng: Number(loc.lng) };
    if (Number.isFinite(Number(call?.lat)) && Number.isFinite(Number(call?.lng))) return { lat: Number(call.lat), lng: Number(call.lng) };
    return centerOf(state);
  }

  function baseLoad(state) {
    const load = Object.fromEntries(BASES.map((base) => [base.id, { ...base, assigned: 0, field: 0, risk: 0 }]));
    const units = window.C190_ResourceDispatch?.resourcesFor?.(state) || [];
    units.forEach((unit) => {
      const base = nearestBase(unit, unit.type);
      if (!base || !load[base.id]) return;
      load[base.id].assigned += 1;
      if (unit.assignedTo) load[base.id].field += 1;
    });
    (state?.dispatch?.shift?.calls || []).filter((call) => ["waiting", "active", "field"].includes(call.status)).forEach((call) => {
      const base = nearestBase(callPoint(call, state));
      if (base && load[base.id]) load[base.id].risk += Number(call.priority || 1) * 8 + Number(call.wait || 0) * 0.4;
    });
    return Object.values(load).map((base) => {
      const coverage = Math.max(0, Math.min(100, Math.round((base.assigned / Math.max(1, base.capacity)) * 70 + Math.max(0, 30 - base.field * 8) - Math.min(30, base.risk * 0.45))));
      const level = coverage < 35 ? "critical" : coverage < 55 ? "thin" : coverage < 78 ? "balanced" : "strong";
      return { ...base, coverage, level };
    });
  }

  function enrichUnit(unit, state) {
    const base = nearestBase(unit, unit?.type);
    const dist = base ? distanceKm(unit, base) : Number(unit?.km || 2);
    const readinessPenalty = dist > 7 ? 1.18 : dist > 4 ? 1.08 : 1.0;
    return {
      ...unit,
      baseId: base?.id || null,
      baseLabel: base?.label || "Base operacional",
      baseDistanceKm: Number(dist.toFixed(1)),
      coverageEtaPenalty: readinessPenalty,
      etaMin: Math.max(1, Math.round(Number(unit.etaMin || 2) * readinessPenalty)),
    };
  }

  function analyze(state) {
    const active = !!state?.dispatch?.shift?.active;
    const bases = active ? baseLoad(state) : BASES.map((base) => ({ ...base, assigned: 0, field: 0, risk: 0, coverage: 100, level: "strong" }));
    const weak = bases.filter((base) => ["critical", "thin"].includes(base.level));
    const avgCoverage = bases.length ? Math.round(bases.reduce((sum, base) => sum + Number(base.coverage || 0), 0) / bases.length) : 100;
    const level = avgCoverage < 45 || weak.some((base) => base.level === "critical") ? "critical" : avgCoverage < 65 || weak.length >= 2 ? "attention" : "ready";
    const recommended = [...weak].sort((a, b) => Number(a.coverage || 0) - Number(b.coverage || 0)).slice(0, 3);
    return {
      active,
      version: VERSION,
      build: BUILD,
      avgCoverage,
      level,
      label: level === "critical" ? "Cobertura territorial crítica" : level === "attention" ? "Cobertura irregular" : "Cobertura adequada",
      bases,
      weak,
      recommended,
      relief: level === "ready" ? 4 : level === "attention" ? -7 : -16,
    };
  }

  function callModifier(call, state) {
    const point = callPoint(call, state);
    const base = nearestBase(point);
    const report = analyze(state);
    const baseReport = report.bases.find((item) => item.id === base?.id);
    if (!baseReport || !["critical", "thin"].includes(baseReport.level)) return { riskBonus: 0, notes: [] };
    return {
      riskBonus: baseReport.level === "critical" ? 14 : 7,
      notes: [`Área com cobertura fraca: ${baseReport.area}.`],
    };
  }

  function pressureRelief(state) {
    const report = analyze(state);
    return Number(report.relief || 0);
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      avgCoverage: report.avgCoverage,
      level: report.level,
      weakBases: report.weak.length,
    };
  }

  return { VERSION, BUILD, BASES, nearestBase, enrichUnit, analyze, callModifier, pressureRelief, diagnostics };
})();
