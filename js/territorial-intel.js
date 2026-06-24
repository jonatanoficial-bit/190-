window.C190_TerritorialIntel = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4100-F47-INTELIGENCIA-TERRITORIAL-20260624-154500-BRT";

  const ZONES = [
    { id: "centro", label: "Centro expandido", keywords: ["centro", "sé", "república", "consolação"], riskBase: 44, focus: ["violência", "trânsito", "roubo"] },
    { id: "norte", label: "Zona Norte", keywords: ["norte", "santana", "tucuruvi", "cachoeirinha", "casa verde"], riskBase: 38, focus: ["violência", "resgate", "família"] },
    { id: "leste", label: "Zona Leste", keywords: ["leste", "itaquera", "tatuapé", "penha"], riskBase: 42, focus: ["acidente", "roubo", "samu"] },
    { id: "sul", label: "Zona Sul", keywords: ["sul", "jabaquara", "campo limpo", "capão", "santo amaro"], riskBase: 40, focus: ["samu", "alagamento", "incêndio"] },
    { id: "oeste", label: "Zona Oeste", keywords: ["oeste", "pinheiros", "lapa", "butantã"], riskBase: 35, focus: ["trânsito", "queda", "roubo"] }
  ];

  function textOf(call = {}) {
    return `${call.type || ""} ${call.summary || ""} ${call.address || ""} ${call.location || ""} ${(call.tags || []).join(" ")}`.toLowerCase();
  }

  function zoneForCall(call = {}, state = null) {
    const text = textOf(call);
    const matched = ZONES.find((zone) => zone.keywords.some((word) => text.includes(word)));
    if (matched) return matched;
    const point = window.C190_LocationIntel?.normalize?.(call) || call;
    const base = window.C190_BaseLogistics?.nearestBase?.(point);
    if (base?.area?.includes("Norte")) return ZONES.find((z) => z.id === "norte");
    if (base?.area?.includes("Leste")) return ZONES.find((z) => z.id === "leste");
    if (base?.area?.includes("Sul")) return ZONES.find((z) => z.id === "sul");
    if (base?.area?.includes("Oeste")) return ZONES.find((z) => z.id === "oeste");
    return ZONES[0];
  }

  function categoryOf(call = {}) {
    const text = textOf(call);
    if (/alag|enchente|queda|desab|incêndio|fumaça|bombeiro|resgate/.test(text)) return "resgate";
    if (/samu|ferid|vítima|mal súbito|infarto|criança|idoso|ambulância/.test(text)) return "samu";
    if (/arma|roubo|violência|agressor|ameaça|briga|tiro|furto/.test(text)) return "violência";
    if (/colisão|acidente|atropel|trânsito|moto|carro/.test(text)) return "trânsito";
    return "geral";
  }

  function history(state) {
    const reports = state?.dispatch?.reports || [];
    const historicalCalls = reports.flatMap((report) => Array.isArray(report.calls) ? report.calls : []);
    const activeCalls = state?.dispatch?.shift?.calls || [];
    return [...historicalCalls, ...activeCalls];
  }

  function zoneStats(state) {
    const stats = Object.fromEntries(ZONES.map((zone) => [zone.id, {
      ...zone,
      total: 0,
      waiting: 0,
      field: 0,
      failed: 0,
      critical: 0,
      categories: {},
      score: zone.riskBase,
    }]));
    history(state).forEach((call) => {
      const zone = zoneForCall(call, state);
      const item = stats[zone.id] || stats.centro;
      const category = categoryOf(call);
      item.total += 1;
      item.categories[category] = (item.categories[category] || 0) + 1;
      if (call.status === "waiting") item.waiting += 1;
      if (call.status === "field") item.field += 1;
      if (call.status === "failed" || call.status === "abandoned") item.failed += 1;
      if (Number(call.priority || 1) >= 3) item.critical += 1;
      item.score += 5 + Number(call.priority || 1) * 3 + Number(call.wait || 0) * 0.35;
      if (call.status === "failed" || call.status === "abandoned") item.score += 10;
    });
    const urban = window.C190_UrbanDynamics?.current?.(state);
    const major = window.C190_MajorIncidents?.current?.(state);
    Object.values(stats).forEach((item) => {
      if (urban?.weather?.id === "storm" && item.focus.some((f) => ["alagamento", "incêndio"].includes(f))) item.score += 12;
      if (urban?.traffic?.id === "blocked" && item.focus.includes("trânsito")) item.score += 10;
      if (major?.active) item.score += Number(major.pressureBonus || 10) * 0.35;
      item.riskScore = Math.max(0, Math.min(100, Math.round(item.score)));
      item.level = item.riskScore >= 78 ? "hot" : item.riskScore >= 58 ? "warm" : item.riskScore >= 40 ? "attention" : "stable";
      item.mainCategory = Object.entries(item.categories).sort((a, b) => b[1] - a[1])[0]?.[0] || item.focus[0] || "geral";
    });
    return Object.values(stats).sort((a, b) => b.riskScore - a.riskScore);
  }

  function analyze(state) {
    const active = !!state?.dispatch?.shift?.active;
    const zones = zoneStats(state);
    const hot = zones.filter((zone) => ["hot", "warm"].includes(zone.level));
    const avgRisk = zones.length ? Math.round(zones.reduce((sum, zone) => sum + Number(zone.riskScore || 0), 0) / zones.length) : 0;
    const level = avgRisk >= 74 || hot.some((zone) => zone.level === "hot") ? "critical" : avgRisk >= 54 || hot.length >= 2 ? "attention" : "stable";
    const prediction = zones[0];
    const recommended = zones.slice(0, 3).map((zone) => ({
      zoneId: zone.id,
      label: zone.label,
      action: zone.level === "hot"
        ? `Priorizar patrulha preventiva em ${zone.label}`
        : zone.level === "warm"
          ? `Reforçar monitoramento em ${zone.label}`
          : `Manter cobertura em ${zone.label}`,
      category: zone.mainCategory,
      riskScore: zone.riskScore,
    }));
    return {
      active,
      version: VERSION,
      build: BUILD,
      zones,
      hot,
      avgRisk,
      level,
      label: level === "critical" ? "Manchas de risco críticas" : level === "attention" ? "Risco territorial elevado" : "Risco territorial controlado",
      prediction: prediction ? {
        zoneId: prediction.id,
        label: prediction.label,
        category: prediction.mainCategory,
        riskScore: prediction.riskScore,
        text: `Maior probabilidade: ${prediction.mainCategory} em ${prediction.label}`,
      } : null,
      recommended,
      relief: level === "stable" ? 3 : level === "attention" ? -8 : -18,
    };
  }

  function callModifier(call, state) {
    const report = analyze(state);
    const zone = zoneForCall(call, state);
    const zoneReport = report.zones.find((item) => item.id === zone.id);
    if (!zoneReport || !["hot", "warm"].includes(zoneReport.level)) return { riskBonus: 0, notes: [] };
    const bonus = zoneReport.level === "hot" ? 13 : 7;
    return {
      riskBonus: bonus,
      notes: [`Mancha de risco ativa: ${zoneReport.label} (${zoneReport.mainCategory}).`],
    };
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
      avgRisk: report.avgRisk,
      level: report.level,
      hotZones: report.hot.length,
      prediction: report.prediction?.text || null,
    };
  }

  return { VERSION, BUILD, ZONES, zoneForCall, analyze, callModifier, pressureRelief, diagnostics };
})();
