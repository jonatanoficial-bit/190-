window.C190_UnifiedCommand = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3600-F42-COMANDO-UNIFICADO-20260624-131500-BRT";

  const CHANNELS = [
    { id: "pm", label: "PM", icon: "190", relief: 7, tags: ["roubo", "arma", "ameaça", "agressor", "violência", "fuga"] },
    { id: "bombeiros", label: "Bombeiros", icon: "193", relief: 8, tags: ["incêndio", "resgate", "fumaça", "queda", "desab", "alag"] },
    { id: "samu", label: "SAMU", icon: "192", relief: 8, tags: ["vítima", "ferid", "mal súbito", "avc", "trauma", "idoso"] },
    { id: "defesa-civil", label: "Defesa Civil", icon: "DC", relief: 7, tags: ["temporal", "enchente", "desliz", "risco estrutural", "árvore", "queda"] },
    { id: "apoio-externo", label: "Apoios externos", icon: "EXT", relief: 6, tags: ["hospital", "cet", "gás", "energia", "bloqueio", "concessionária"] },
  ];

  function ensure(shift) {
    shift.unifiedCommand = shift.unifiedCommand && typeof shift.unifiedCommand === "object"
      ? shift.unifiedCommand
      : { version: VERSION, synchronized: [], history: [], doctrine: "normal" };
    shift.unifiedCommand.version = VERSION;
    shift.unifiedCommand.synchronized = Array.isArray(shift.unifiedCommand.synchronized) ? shift.unifiedCommand.synchronized : [];
    shift.unifiedCommand.history = Array.isArray(shift.unifiedCommand.history) ? shift.unifiedCommand.history : [];
    return shift.unifiedCommand;
  }

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

  function requiredChannels(state, shift) {
    const major = window.C190_MajorIncidents?.current?.(state);
    const support = window.C190_SupportNetwork?.analyze?.(state);
    const urban = window.C190_UrbanDynamics?.current?.(state);
    const calls = [activeCall(shift), ...waitingCalls(shift), ...fieldCalls(shift)].filter(Boolean);
    const required = new Map();
    calls.forEach((call) => {
      const text = textOf(call);
      CHANNELS.forEach((channel) => {
        if (channel.tags.some((tag) => text.includes(tag))) {
          const current = required.get(channel.id) || { ...channel, reasons: [], urgency: 0 };
          current.reasons.push(call.type || "ocorrência");
          current.urgency += Number(call.priority || 1) + (call.status === "waiting" ? Math.min(4, Math.floor(Number(call.wait || 0) / 18)) : 1);
          required.set(channel.id, current);
        }
      });
    });
    if (major?.active) {
      const civil = required.get("defesa-civil") || { ...CHANNELS.find((c) => c.id === "defesa-civil"), reasons: [], urgency: 0 };
      civil.reasons.push(major.scenario?.label || "contingência");
      civil.urgency += 5;
      required.set(civil.id, civil);
      const ext = required.get("apoio-externo") || { ...CHANNELS.find((c) => c.id === "apoio-externo"), reasons: [], urgency: 0 };
      ext.reasons.push("coordenação de contingência");
      ext.urgency += 4;
      required.set(ext.id, ext);
    }
    if (support?.recommendations?.length) {
      const ext = required.get("apoio-externo") || { ...CHANNELS.find((c) => c.id === "apoio-externo"), reasons: [], urgency: 0 };
      ext.reasons.push("rede de apoio especializada");
      ext.urgency += support.recommendations.length;
      required.set(ext.id, ext);
    }
    if (urban?.traffic?.id === "blocked") {
      const ext = required.get("apoio-externo") || { ...CHANNELS.find((c) => c.id === "apoio-externo"), reasons: [], urgency: 0 };
      ext.reasons.push("via bloqueada/obras");
      ext.urgency += 3;
      required.set(ext.id, ext);
    }
    return [...required.values()].sort((a, b) => b.urgency - a.urgency);
  }

  function doctrineFor(state, required) {
    const major = window.C190_MajorIncidents?.current?.(state);
    const urban = window.C190_UrbanDynamics?.current?.(state);
    if (major?.active && major.severity?.level === "red") return { id: "contingencia", label: "Comando unificado de contingência", detail: "Priorize coordenação entre órgãos, regulação médica e rotas alternativas." };
    if (urban?.traffic?.id === "blocked") return { id: "rotas", label: "Doutrina de rotas alternativas", detail: "Coordene CET/apoios externos antes de despachar recurso pesado." };
    if (required.length >= 3) return { id: "multiagencia", label: "Operação multiagência", detail: "Sincronize canais para evitar duplicidade e resposta fragmentada." };
    return { id: "normal", label: "Comando operacional normal", detail: "Mantenha canal de rádio e despacho proporcional ao risco." };
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { active: false, version: VERSION, label: "Comando unificado aguardando plantão." };
    const command = ensure(shift);
    const required = requiredChannels(state, shift);
    const activeIds = new Set(command.synchronized.map((item) => item.id));
    const pending = required.filter((channel) => !activeIds.has(channel.id));
    const relief = pressureRelief(state);
    const doctrine = doctrineFor(state, required);
    command.doctrine = doctrine.id;
    const base = 100 - pending.length * 18 + command.synchronized.length * 9 + relief;
    const score = Math.max(0, Math.min(100, Math.round(base)));
    const level = score >= 82 ? "coordinated" : score >= 62 ? "partial" : score >= 42 ? "fragile" : "critical";
    return {
      active: true,
      version: VERSION,
      build: BUILD,
      score,
      level,
      doctrine,
      required,
      pending,
      synchronized: command.synchronized,
      history: command.history.slice(0, 6),
      relief,
      activeCall: activeCall(shift),
      waiting: waitingCalls(shift).length,
      field: fieldCalls(shift).length,
      label: level === "coordinated" ? "Operação coordenada" : level === "partial" ? "Coordenação parcial" : level === "fragile" ? "Coordenação frágil" : "Comando fragmentado",
    };
  }

  function synchronize(state, id) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { ok: false, reason: "shift_inactive" };
    const command = ensure(shift);
    const all = requiredChannels(state, shift);
    const channel = all.find((item) => item.id === id) || CHANNELS.find((item) => item.id === id);
    if (!channel) return { ok: false, reason: "unknown_channel" };
    if (!command.synchronized.some((item) => item.id === id)) {
      const item = { id: channel.id, label: channel.label, icon: channel.icon, relief: channel.relief, at: new Date().toISOString(), reasons: (channel.reasons || []).slice(0, 3) };
      command.synchronized.unshift(item);
      command.history.unshift({ at: item.at, type: "sync", text: `${channel.label} sincronizado ao comando unificado.` });
      command.history = command.history.slice(0, 12);
      try {
        window.dispatchEvent(new CustomEvent("c190:shift-event", { detail: { kind: "unified_sync", text: `Canal integrado: ${channel.label}.`, channel: item } }));
      } catch (_) {}
    }
    return { ok: true, channel };
  }

  function pressureRelief(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return 0;
    const command = ensure(shift);
    return Math.min(28, command.synchronized.reduce((sum, item) => sum + Number(item.relief || 0), 0));
  }

  function callModifier(call, state) {
    const report = analyze(state);
    if (!report.active || !call) return { riskBonus: 0, notes: [] };
    if (report.pending.length >= 2) return { riskBonus: Math.min(12, report.pending.length * 4), notes: [`Comando fragmentado: falta ${report.pending[0].label}.`] };
    if (report.synchronized.length) return { riskBonus: -5, notes: ["Comando unificado reduz risco de resposta fragmentada."] };
    return { riskBonus: 0, notes: [] };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return { version: VERSION, build: BUILD, active: report.active, score: report.score || 0, level: report.level || "none", pending: report.pending?.length || 0, synchronized: report.synchronized?.length || 0, relief: report.relief || 0 };
  }

  return { VERSION, BUILD, CHANNELS, analyze, synchronize, pressureRelief, callModifier, diagnostics };
})();
