window.C190_DuplicateCalls = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4500-F51-CHAMADAS-DUPLICADAS-20260624-184500-BRT";

  const STOPWORDS = new Set(["de", "da", "do", "das", "dos", "em", "no", "na", "um", "uma", "com", "para", "por", "tem", "foi", "rua", "avenida", "av", "perto", "próximo", "proximo"]);

  function textOf(call = {}) {
    return `${call.type || ""} ${call.summary || ""} ${call.address || ""} ${call.location || ""} ${(call.tags || []).join(" ")}`.toLowerCase();
  }

  function categoryOf(call = {}) {
    const text = textOf(call);
    if (/arma|roubo|violência|agressor|ameaça|briga|tiro|furto|suspeito/.test(text)) return "violencia";
    if (/samu|ferid|vítima|mal súbito|infarto|criança|idoso|ambulância|hospital/.test(text)) return "samu";
    if (/alag|enchente|queda|desab|incêndio|fumaça|bombeiro|resgate|defesa civil/.test(text)) return "resgate";
    if (/colisão|acidente|atropel|trânsito|moto|carro|via|placa/.test(text)) return "transito";
    return "geral";
  }

  function tokenSet(call = {}) {
    return new Set(textOf(call)
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((item) => item.length >= 4 && !STOPWORDS.has(item)));
  }

  function jaccard(a, b) {
    const A = tokenSet(a);
    const B = tokenSet(b);
    if (!A.size || !B.size) return 0;
    let inter = 0;
    A.forEach((item) => { if (B.has(item)) inter += 1; });
    return inter / Math.max(1, A.size + B.size - inter);
  }

  function zoneOf(call, state) {
    return window.C190_TerritorialIntel?.zoneForCall?.(call, state)?.id
      || window.C190_BaseLogistics?.nearestBase?.(call)?.id
      || "centro";
  }

  function locationStage(call) {
    return window.C190_LocationIntel?.normalize?.(call)?.stage || call?.locationIntel?.stage || "none";
  }

  function similarity(a, b, state) {
    const sameCategory = categoryOf(a) === categoryOf(b);
    const sameZone = zoneOf(a, state) === zoneOf(b, state);
    const textScore = jaccard(a, b);
    const samePriority = Number(a.priority || 1) === Number(b.priority || 1);
    let score = textScore * 46 + (sameCategory ? 25 : 0) + (sameZone ? 18 : 0) + (samePriority ? 6 : 0);
    const stageA = locationStage(a);
    const stageB = locationStage(b);
    if (stageA !== "none" && stageB !== "none" && stageA !== stageB) score -= 5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  function contradictionFor(calls = []) {
    const priorities = new Set(calls.map((call) => Number(call.priority || 1)));
    const categories = new Set(calls.map(categoryOf));
    const zones = new Set(calls.map((call) => zoneOf(call)));
    const locationStages = new Set(calls.map(locationStage));
    const notes = [];
    if (priorities.size >= 2) notes.push("prioridade informada diferente");
    if (categories.size >= 2) notes.push("natureza da ocorrência contraditória");
    if (zones.size >= 2) notes.push("localização/região divergente");
    if (locationStages.size >= 2) notes.push("nível de precisão de endereço diferente");
    return notes;
  }

  function ensureState(state) {
    const shift = state?.dispatch?.shift;
    if (!shift) return null;
    shift.duplicateCalls = shift.duplicateCalls && typeof shift.duplicateCalls === "object" ? shift.duplicateCalls : {
      version: VERSION,
      merged: {},
      separated: {},
      history: [],
    };
    shift.duplicateCalls.version = VERSION;
    shift.duplicateCalls.merged = shift.duplicateCalls.merged || {};
    shift.duplicateCalls.separated = shift.duplicateCalls.separated || {};
    shift.duplicateCalls.history = Array.isArray(shift.duplicateCalls.history) ? shift.duplicateCalls.history : [];
    return shift.duplicateCalls;
  }

  function groupKey(calls) {
    return calls.map((call) => call.id).sort().join("__");
  }

  function activeCalls(state) {
    return (state?.dispatch?.shift?.calls || []).filter((call) =>
      ["waiting", "active", "field"].includes(call.status) && !call.duplicateLinkedTo
    );
  }

  function buildGroups(state) {
    const store = ensureState(state);
    const calls = activeCalls(state);
    const pairs = [];
    for (let i = 0; i < calls.length; i += 1) {
      for (let j = i + 1; j < calls.length; j += 1) {
        const score = similarity(calls[i], calls[j], state);
        if (score >= 58) pairs.push({ a: calls[i], b: calls[j], score });
      }
    }

    const clusters = [];
    pairs.sort((a, b) => b.score - a.score).forEach((pair) => {
      let cluster = clusters.find((group) => group.calls.some((call) => call.id === pair.a.id || call.id === pair.b.id));
      if (!cluster) {
        cluster = { calls: [], maxScore: pair.score };
        clusters.push(cluster);
      }
      [pair.a, pair.b].forEach((call) => {
        if (!cluster.calls.some((item) => item.id === call.id)) cluster.calls.push(call);
      });
      cluster.maxScore = Math.max(cluster.maxScore, pair.score);
    });

    return clusters
      .map((cluster) => {
        const key = groupKey(cluster.calls);
        const leader = [...cluster.calls].sort((a, b) => Number(b.priority || 1) - Number(a.priority || 1) || Number(b.wait || 0) - Number(a.wait || 0))[0];
        const contradictions = contradictionFor(cluster.calls);
        const witnesses = cluster.calls.length;
        const score = Math.max(cluster.maxScore, Math.min(100, 54 + witnesses * 10 + (contradictions.length ? 5 : 0)));
        return {
          key,
          calls: cluster.calls,
          leader,
          score,
          witnesses,
          contradictions,
          category: categoryOf(leader),
          zone: zoneOf(leader, state),
          merged: !!store?.merged?.[key],
          separated: !!store?.separated?.[key],
        };
      })
      .filter((group) => group.calls.length >= 2 && !group.separated)
      .sort((a, b) => b.score - a.score);
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    const active = !!shift?.active;
    const store = ensureState(state);
    const groups = active ? buildGroups(state) : [];
    const pending = groups.filter((group) => !group.merged);
    const merged = groups.filter((group) => group.merged);
    const avgScore = groups.length ? Math.round(groups.reduce((sum, group) => sum + group.score, 0) / groups.length) : 100;
    const level = pending.some((group) => group.contradictions.length >= 2) ? "critical" : pending.length ? "attention" : "ready";
    return {
      active,
      version: VERSION,
      build: BUILD,
      groups,
      pending,
      merged,
      history: store?.history || [],
      avgScore,
      level,
      label: level === "critical" ? "Versões contraditórias" : level === "attention" ? "Possível duplicidade" : "Chamadas organizadas",
      relief: level === "ready" ? 3 : level === "attention" ? -7 : -14,
      summary: {
        duplicateGroups: groups.length,
        pendingGroups: pending.length,
        mergedGroups: Object.keys(store?.merged || {}).length,
        separatedGroups: Object.keys(store?.separated || {}).length,
      },
    };
  }

  function mergeGroup(state, key) {
    const store = ensureState(state);
    const group = analyze(state).groups.find((item) => item.key === key);
    if (!group) return { ok: false, reason: "group_not_found" };
    const leader = group.leader;
    const linked = group.calls.filter((call) => call.id !== leader.id);
    leader.duplicateGroup = leader.duplicateGroup || { version: VERSION, linkedIds: [], witnessCount: 1, contradictions: [] };
    leader.duplicateGroup.linkedIds = [...new Set([...(leader.duplicateGroup.linkedIds || []), ...linked.map((call) => call.id)])];
    leader.duplicateGroup.witnessCount = group.calls.length;
    leader.duplicateGroup.contradictions = group.contradictions;
    leader.duplicateGroup.mergedAt = new Date().toISOString();

    linked.forEach((call) => {
      call.duplicateLinkedTo = leader.id;
      call.statusBeforeDuplicateMerge = call.status;
      call.status = "linked";
      call.duplicateResolution = "merged";
      call.duplicateMergedAt = new Date().toISOString();
      call.wait = Math.max(0, Number(call.wait || 0));
    });

    store.merged[key] = { at: new Date().toISOString(), leaderId: leader.id, linkedIds: linked.map((call) => call.id), contradictions: group.contradictions };
    store.history.unshift({ at: new Date().toISOString(), action: "merge", key, leaderId: leader.id, linked: linked.length });
    store.history = store.history.slice(0, 20);
    return { ok: true, group, leader, linked };
  }

  function treatSeparate(state, key) {
    const store = ensureState(state);
    const group = analyze(state).groups.find((item) => item.key === key);
    if (!group) return { ok: false, reason: "group_not_found" };
    store.separated[key] = { at: new Date().toISOString(), callIds: group.calls.map((call) => call.id), reason: "operator_decision" };
    store.history.unshift({ at: new Date().toISOString(), action: "separate", key, calls: group.calls.length });
    store.history = store.history.slice(0, 20);
    return { ok: true, group };
  }

  function callModifier(call, state) {
    const report = analyze(state);
    const group = report.groups.find((item) => item.calls.some((c) => c.id === call.id));
    if (!group) return { riskBonus: 0, notes: [] };
    if (group.merged || call.duplicateLinkedTo) return { riskBonus: -2, notes: ["Chamadas duplicadas já unificadas."] };
    return {
      riskBonus: group.contradictions.length ? 8 : 4,
      notes: [`Possível duplicidade: ${group.witnesses} ligação(ões) sobre o mesmo fato.`],
    };
  }

  function pressureRelief(state) {
    return Number(analyze(state).relief || 0);
  }

  function decorateReport(report, state) {
    if (!report || typeof report !== "object") return report;
    const summary = analyze(state).summary;
    return { ...report, duplicateSummary: { version: VERSION, ...summary } };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      level: report.level,
      groups: report.groups.length,
      pending: report.pending.length,
      merged: report.merged.length,
    };
  }

  return { VERSION, BUILD, analyze, mergeGroup, treatSeparate, callModifier, pressureRelief, decorateReport, diagnostics };
})();
