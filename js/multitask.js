window.C190_Multitask = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3000-F36-CENTRAL-MULTITAREFA-20260624-103500-BRT";

  function priorityWeight(call) {
    return Number(call?.priority || 1) * 34;
  }

  function waitWeight(call) {
    return Math.min(45, Math.floor(Number(call?.wait || 0) * 1.15));
  }

  function fieldWeight(shift) {
    const field = (shift?.calls || []).filter((call) => call.status === "field").length;
    return Math.min(20, field * 6);
  }

  function callRisk(call, shift) {
    const score = priorityWeight(call) + waitWeight(call) + fieldWeight(shift);
    const critical = Number(call?.priority || 1) >= 3 || Number(call?.wait || 0) >= Number(shift?.abandonLimit || 78) * 0.66;
    const high = critical || score >= 86;
    const medium = !high && (score >= 58 || Number(call?.priority || 1) >= 2);
    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      level: high ? "critical" : medium ? "high" : "normal",
      label: high ? "RISCO CRÍTICO" : medium ? "RISCO ALTO" : "ESTÁVEL",
      reason: high
        ? "Prioridade/tempo de espera exigem ação imediata."
        : medium
          ? "Ocorrência deve ser atendida antes de novas pausas."
          : "Fila dentro do limite operacional.",
    };
  }

  function waitingCalls(shift) {
    return (shift?.calls || []).filter((call) => call.status === "waiting");
  }

  function fieldCalls(shift) {
    return (shift?.calls || []).filter((call) => call.status === "field");
  }

  function activeCall(shift) {
    return (shift?.calls || []).find((call) => call.id === shift?.activeCallId) || null;
  }

  function sortQueue(calls = [], shift = null) {
    return [...calls].sort((a, b) => {
      const rb = callRisk(b, shift).score;
      const ra = callRisk(a, shift).score;
      if (rb !== ra) return rb - ra;
      if (Number(b.priority || 1) !== Number(a.priority || 1)) return Number(b.priority || 1) - Number(a.priority || 1);
      return Number(b.wait || 0) - Number(a.wait || 0);
    });
  }

  function updateShift(state, shift = state?.dispatch?.shift) {
    if (!shift?.active) return { active: false };
    shift.multitask = shift.multitask && typeof shift.multitask === "object" ? shift.multitask : { version: VERSION, alerts: [], lastCriticalAt: null };
    shift.multitask.version = VERSION;
    const waiting = waitingCalls(shift);
    const field = fieldCalls(shift);
    waiting.forEach((call) => {
      const risk = callRisk(call, shift);
      call.multitask = { version: VERSION, riskScore: risk.score, riskLevel: risk.level, riskLabel: risk.label, riskReason: risk.reason, updatedAt: new Date().toISOString() };
      const escalationPoint = Math.floor(Number(shift.abandonLimit || 78) * 0.45);
      if (call.wait >= escalationPoint && Number(call.priority || 1) < 3 && !call.multitaskEscalated) {
        call.priority = Math.min(3, Number(call.priority || 1) + 1);
        call.multitaskEscalated = true;
        shift.multitask.alerts.unshift({ at: new Date().toISOString(), type: "priority_escalated", callId: call.id, text: `Prioridade elevada por espera: ${call.type}` });
      }
    });
    const sorted = sortQueue(waiting, shift);
    const critical = sorted.find((call) => call.multitask?.riskLevel === "critical");
    const pressureScore = Math.min(100, waiting.length * 18 + field.length * 10 + (critical ? 28 : 0) + (activeCall(shift) ? 8 : 0));
    const level = pressureScore >= 78 ? "critical" : pressureScore >= 48 ? "high" : pressureScore >= 24 ? "medium" : "normal";
    shift.multitask.pressureScore = pressureScore;
    shift.multitask.pressureLevel = level;
    shift.multitask.recommendedCallId = sorted[0]?.id || null;
    shift.multitask.waiting = waiting.length;
    shift.multitask.field = field.length;
    shift.multitask.active = activeCall(shift)?.id || null;
    if (critical && shift.multitask.lastCriticalCallId !== critical.id) {
      shift.multitask.lastCriticalCallId = critical.id;
      shift.multitask.lastCriticalAt = new Date().toISOString();
      shift.multitask.alerts.unshift({ at: shift.multitask.lastCriticalAt, type: "critical_queue", callId: critical.id, text: `Fila crítica: ${critical.type}` });
      try {
        window.dispatchEvent(new CustomEvent("c190:shift-event", { detail: { kind: "multitask_critical", callId: critical.id, text: `Atenção: ${critical.type} virou prioridade crítica.` } }));
      } catch (_) {}
    }
    shift.multitask.alerts = shift.multitask.alerts.slice(0, 8);
    return analyze(state);
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { active: false, pressureScore: 0, pressureLevel: "normal", waiting: [], field: [], recommended: null, alerts: [] };
    const waiting = sortQueue(waitingCalls(shift), shift);
    const field = fieldCalls(shift);
    const recommended = waiting[0] || null;
    return {
      active: true,
      version: VERSION,
      pressureScore: Number(shift.multitask?.pressureScore || 0),
      pressureLevel: shift.multitask?.pressureLevel || "normal",
      waiting,
      field,
      activeCall: activeCall(shift),
      recommended,
      alerts: Array.isArray(shift.multitask?.alerts) ? shift.multitask.alerts : [],
      label: shift.multitask?.pressureLevel === "critical"
        ? "Central sobrecarregada"
        : shift.multitask?.pressureLevel === "high"
          ? "Alta demanda"
          : shift.multitask?.pressureLevel === "medium"
            ? "Demanda moderada"
            : "Operação estável",
    };
  }

  function diagnostics(state) {
    const analysis = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: analysis.active,
      pressureScore: analysis.pressureScore,
      pressureLevel: analysis.pressureLevel,
      waiting: analysis.waiting?.length || 0,
      field: analysis.field?.length || 0,
      recommendedCallId: analysis.recommended?.id || null,
    };
  }

  return { VERSION, BUILD, callRisk, sortQueue, updateShift, analyze, diagnostics };
})();
