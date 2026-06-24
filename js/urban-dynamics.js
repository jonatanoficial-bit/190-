window.C190_UrbanDynamics = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3600-F42-COMANDO-UNIFICADO-20260624-131500-BRT";

  const WEATHER = [
    { id: "clear", label: "Tempo aberto", icon: "☀", eta: 1.00, risk: 0, radio: "visibilidade boa" },
    { id: "rain", label: "Chuva moderada", icon: "🌧", eta: 1.18, risk: 6, radio: "pista molhada e baixa visibilidade" },
    { id: "storm", label: "Temporal localizado", icon: "⛈", eta: 1.34, risk: 12, radio: "alagamentos e múltiplos chamados" },
    { id: "fog", label: "Neblina/baixa visibilidade", icon: "🌫", eta: 1.14, risk: 4, radio: "visibilidade reduzida" }
  ];
  const TRAFFIC = [
    { id: "free", label: "Trânsito livre", icon: "🟢", eta: 0.94, pressure: 0 },
    { id: "normal", label: "Fluxo normal", icon: "🟡", eta: 1.00, pressure: 2 },
    { id: "heavy", label: "Pico de trânsito", icon: "🟠", eta: 1.28, pressure: 10 },
    { id: "blocked", label: "Via bloqueada/obras", icon: "🔴", eta: 1.48, pressure: 16 }
  ];
  const PERIODS = [
    { id: "morning", label: "Manhã", icon: "🌅", eta: 1.08, pressure: 4 },
    { id: "afternoon", label: "Tarde", icon: "🏙", eta: 1.04, pressure: 2 },
    { id: "evening_peak", label: "Pico da noite", icon: "🌆", eta: 1.22, pressure: 10 },
    { id: "night", label: "Madrugada", icon: "🌙", eta: 0.96, pressure: 6 }
  ];

  function pick(list, seed) {
    const index = Math.abs(Math.floor(seed)) % list.length;
    return list[index];
  }

  function seedFor(shift) {
    const elapsed = Number(shift?.elapsed || 0);
    const callCount = (shift?.calls || []).length;
    const citySeed = String(shift?.cityId || "sp").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Math.floor(elapsed / 22) + callCount * 7 + citySeed;
  }

  function profileFor(shift) {
    const seed = seedFor(shift);
    const weather = pick(WEATHER, seed);
    const traffic = pick(TRAFFIC, seed + Math.floor(Number(shift?.elapsed || 0) / 35));
    const period = pick(PERIODS, seed + 2);
    const eventActive = (seed + Number(shift?.elapsed || 0)) % 5 === 0;
    const event = eventActive
      ? { id: "urban_event", label: "Evento urbano/obra", icon: "🚧", eta: 1.12, pressure: 8, note: "rota pode exigir desvio" }
      : { id: "none", label: "Sem evento urbano", icon: "✅", eta: 1.00, pressure: 0, note: "sem impacto relevante" };
    const etaMultiplier = Number((weather.eta * traffic.eta * period.eta * event.eta).toFixed(2));
    const pressureBonus = weather.risk + traffic.pressure + period.pressure + event.pressure;
    const riskLevel = pressureBonus >= 30 ? "critical" : pressureBonus >= 20 ? "high" : pressureBonus >= 10 ? "medium" : "normal";
    return {
      version: VERSION,
      build: BUILD,
      updatedAt: new Date().toISOString(),
      weather,
      traffic,
      period,
      event,
      etaMultiplier,
      pressureBonus,
      riskLevel,
      radioText: `${weather.radio}; ${traffic.label.toLowerCase()}; ${period.label.toLowerCase()}; ${event.note}.`,
    };
  }

  function updateShift(state, shift = state?.dispatch?.shift) {
    if (!shift?.active) return null;
    const previous = shift.urbanDynamics || {};
    const profile = profileFor(shift);
    shift.urbanDynamics = profile;
    if (previous.weather?.id && previous.weather.id !== profile.weather.id) {
      try {
        window.dispatchEvent(new CustomEvent("c190:shift-event", {
          detail: { kind: "urban_change", text: `Condição urbana alterada: ${profile.weather.label}, ${profile.traffic.label}.`, urban: profile }
        }));
      } catch (_) {}
    }
    return profile;
  }

  function current(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return null;
    return shift.urbanDynamics || updateShift(state, shift);
  }

  function etaMultiplier(state) {
    return Number(current(state)?.etaMultiplier || 1);
  }

  function pressureBonus(state) {
    return Number(current(state)?.pressureBonus || 0);
  }

  function callModifier(call, state) {
    const urban = current(state);
    if (!urban || !call) return { riskBonus: 0, notes: [] };
    const text = `${call.type || ""} ${call.summary || ""} ${(call.tags || []).join(" ")}`.toLowerCase();
    const notes = [];
    let riskBonus = 0;
    if (urban.weather.id === "storm" && /alag|queda|colisão|acidente|enchente|resgate|bombeiro/.test(text)) {
      riskBonus += 10;
      notes.push("Temporal aumenta risco desta ocorrência.");
    }
    if (urban.traffic.id === "blocked" && /samu|ferid|vítima|criança|idoso|acidente/.test(text)) {
      riskBonus += 8;
      notes.push("Via bloqueada aumenta tempo-resposta crítico.");
    }
    if (urban.period.id === "night" && /ameaça|violência|roubo|agressor|arma/.test(text)) {
      riskBonus += 6;
      notes.push("Madrugada aumenta risco de segurança da equipe.");
    }
    return { riskBonus, notes };
  }

  function diagnostics(state) {
    const urban = current(state);
    return {
      version: VERSION,
      build: BUILD,
      active: !!urban,
      weather: urban?.weather?.id || null,
      traffic: urban?.traffic?.id || null,
      period: urban?.period?.id || null,
      etaMultiplier: urban?.etaMultiplier || 1,
      pressureBonus: urban?.pressureBonus || 0,
      riskLevel: urban?.riskLevel || "normal",
    };
  }

  return { VERSION, BUILD, updateShift, current, etaMultiplier, pressureBonus, callModifier, diagnostics };
})();
