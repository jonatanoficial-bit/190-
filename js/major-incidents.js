window.C190_MajorIncidents = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3600-F42-COMANDO-UNIFICADO-20260624-131500-BRT";

  const SCENARIOS = {
    storm: {
      id: "storm_flooding",
      label: "Plano enchente e resgate",
      icon: "⛈",
      doctrine: "Acionar Bombeiros, Defesa Civil e SAMU conforme vítimas/risco estrutural.",
      pressure: 18,
      acceleration: 8,
    },
    blocked: {
      id: "blocked_corridor",
      label: "Corredor viário comprometido",
      icon: "🚧",
      doctrine: "Priorizar rotas alternativas, motocicleta e Águia quando prioridade for máxima.",
      pressure: 14,
      acceleration: 7,
    },
    evening_peak: {
      id: "evening_peak_overload",
      label: "Pico urbano de ocorrências",
      icon: "🌆",
      doctrine: "Atender por risco, manter ocorrências em campo e evitar superdespacho.",
      pressure: 10,
      acceleration: 6,
    },
    night: {
      id: "night_security",
      label: "Operação madrugada segura",
      icon: "🌙",
      doctrine: "Reforçar segurança de equipe e confirmar risco antes do deslocamento isolado.",
      pressure: 8,
      acceleration: 5,
    },
  };

  function profile(state) {
    return window.C190_UrbanDynamics?.current?.(state) || null;
  }

  function scenarioFor(state) {
    const urban = profile(state);
    if (!urban) return null;
    if (urban.weather?.id === "storm") return { ...SCENARIOS.storm, source: urban };
    if (urban.traffic?.id === "blocked") return { ...SCENARIOS.blocked, source: urban };
    if (urban.period?.id === "evening_peak" && Number(urban.pressureBonus || 0) >= 18) return { ...SCENARIOS.evening_peak, source: urban };
    if (urban.period?.id === "night" && Number(urban.pressureBonus || 0) >= 14) return { ...SCENARIOS.night, source: urban };
    if (Number(urban.pressureBonus || 0) >= 28) return { ...SCENARIOS.evening_peak, source: urban, label: "Saturação urbana simultânea" };
    return null;
  }

  function ensure(shift) {
    shift.majorIncident = shift.majorIncident && typeof shift.majorIncident === "object" ? shift.majorIncident : { version: VERSION, active: false, history: [], escalations: 0 };
    shift.majorIncident.version = VERSION;
    shift.majorIncident.history = Array.isArray(shift.majorIncident.history) ? shift.majorIncident.history : [];
    return shift.majorIncident;
  }

  function waiting(shift) { return (shift?.calls || []).filter((call) => call.status === "waiting"); }
  function scheduled(shift) { return (shift?.calls || []).filter((call) => call.status === "scheduled"); }
  function field(shift) { return (shift?.calls || []).filter((call) => call.status === "field"); }

  function severityFor(shift, scenario) {
    if (!scenario) return { score: 0, level: "none", label: "Sem contingência" };
    const waitingScore = waiting(shift).length * 14;
    const fieldScore = field(shift).length * 7;
    const urbanScore = Number(scenario.source?.pressureBonus || 0);
    const score = Math.max(0, Math.min(100, Math.round(scenario.pressure + waitingScore + fieldScore + urbanScore)));
    const level = score >= 78 ? "red" : score >= 56 ? "orange" : score >= 34 ? "yellow" : "watch";
    const label = level === "red" ? "Contingência vermelha" : level === "orange" ? "Contingência laranja" : level === "yellow" ? "Atenção ampliada" : "Monitoramento";
    return { score, level, label };
  }

  function accelerateCalls(shift, scenario, severity) {
    if (!shift?.active || !scenario || !severity || severity.score < 44) return 0;
    const elapsed = Number(shift.elapsed || 0);
    const major = ensure(shift);
    if (major.lastAccelerationElapsed && elapsed - Number(major.lastAccelerationElapsed) < 18) return 0;
    const candidates = scheduled(shift).filter((call) => !call.majorIncidentAccelerated);
    if (!candidates.length) return 0;
    const limit = severity.level === "red" ? 2 : 1;
    candidates.slice(0, limit).forEach((call, index) => {
      call.majorIncidentAccelerated = true;
      call.majorIncidentSource = scenario.id;
      call.arrivesAt = Math.min(Number(call.arrivesAt || elapsed + 20), elapsed + Math.max(2, Number(scenario.acceleration || 6) + index * 2));
      call.priority = Math.min(3, Number(call.priority || 1) + (severity.level === "red" ? 1 : 0));
    });
    major.lastAccelerationElapsed = elapsed;
    major.escalations = Number(major.escalations || 0) + 1;
    return Math.min(limit, candidates.length);
  }

  function updateShift(state, shift = state?.dispatch?.shift) {
    if (!shift?.active) return null;
    const major = ensure(shift);
    const scenario = scenarioFor(state);
    if (!scenario) {
      if (major.active) {
        major.history.unshift({ at: new Date().toISOString(), type: "stand_down", text: "Contingência encerrada: condições urbanas normalizadas." });
      }
      major.active = false;
      major.scenarioId = null;
      major.label = "Operação normal";
      major.severity = { score: 0, level: "none", label: "Sem contingência" };
      return major;
    }
    const severity = severityFor(shift, scenario);
    const changed = major.scenarioId !== scenario.id || major.severity?.level !== severity.level;
    major.active = true;
    major.scenarioId = scenario.id;
    major.label = scenario.label;
    major.icon = scenario.icon;
    major.doctrine = scenario.doctrine;
    major.pressure = Number(scenario.pressure || 0);
    major.severity = severity;
    major.source = {
      weather: scenario.source?.weather?.label || "",
      traffic: scenario.source?.traffic?.label || "",
      period: scenario.source?.period?.label || "",
      etaMultiplier: scenario.source?.etaMultiplier || 1,
    };
    const accelerated = accelerateCalls(shift, scenario, severity);
    if (changed || accelerated > 0) {
      const text = `${severity.label}: ${scenario.label}${accelerated ? ` · ${accelerated} chamada(s) antecipada(s)` : ""}.`;
      major.history.unshift({ at: new Date().toISOString(), type: "contingency", text, level: severity.level });
      major.history = major.history.slice(0, 8);
      try {
        window.dispatchEvent(new CustomEvent("c190:shift-event", { detail: { kind: "major_incident", text, major } }));
      } catch (_) {}
    }
    return major;
  }

  function current(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return null;
    return shift.majorIncident || updateShift(state, shift);
  }

  function pressureBonus(state) {
    const currentMajor = current(state);
    if (!currentMajor?.active) return 0;
    const severity = currentMajor.severity?.score || 0;
    return Math.min(24, Math.round(Number(currentMajor.pressure || 0) + severity * 0.12));
  }

  function callModifier(call, state) {
    const currentMajor = current(state);
    if (!currentMajor?.active || !call) return { riskBonus: 0, notes: [] };
    const text = `${call.type || ""} ${call.summary || ""} ${(call.tags || []).join(" ")}`.toLowerCase();
    const notes = [];
    let riskBonus = 0;
    if (/alag|enchente|queda|desab|resgate|bombeiro|fumaça|incênd/.test(text) && /enchente|resgate|Saturação/i.test(currentMajor.label || "")) {
      riskBonus += 12;
      notes.push("Contingência aumenta prioridade de resgate/bombeiros.");
    }
    if (/acidente|vítima|samu|ferid|mal súbito|avc/.test(text) && /viário|bloqueado|pico/i.test(currentMajor.label || "")) {
      riskBonus += 10;
      notes.push("Contingência viária aumenta risco de tempo-resposta.");
    }
    if (/violência|ameaça|roubo|arma|agressor/.test(text) && /madrugada|segura/i.test(currentMajor.label || "")) {
      riskBonus += 8;
      notes.push("Contingência noturna exige reforço de segurança.");
    }
    return { riskBonus, notes };
  }

  function diagnostics(state) {
    const cur = current(state);
    return {
      version: VERSION,
      build: BUILD,
      active: !!cur?.active,
      scenarioId: cur?.scenarioId || null,
      level: cur?.severity?.level || "none",
      score: cur?.severity?.score || 0,
      pressureBonus: pressureBonus(state),
      escalations: cur?.escalations || 0,
    };
  }

  return { VERSION, BUILD, updateShift, current, pressureBonus, callModifier, diagnostics };
})();
