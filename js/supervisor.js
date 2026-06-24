window.C190_Supervisor = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3100-F37-SUPERVISOR-OPERACIONAL-20260624-105500-BRT";

  function safePercent(value) {
    return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
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

  function protocolAudit(call) {
    if (!call) return { score: 0, grade: "D", warnings: ["Nenhuma chamada ativa."], ok: false };
    const evaluation = window.C190_CallProtocol?.evaluate?.(call) || null;
    const normalized = window.C190_CallProtocol?.normalize?.(call) || call.protocol || {};
    const asked = Array.isArray(normalized.asked) ? normalized.asked.length : 0;
    const missing = Array.isArray(evaluation?.missing) ? evaluation.missing : [];
    const score = safePercent(evaluation?.percent ?? asked * 14);
    const warnings = [];
    if (asked < 2) warnings.push("Colete pelo menos endereço e situação antes de avançar.");
    if (missing.length) warnings.push(`Protocolo incompleto: ${missing.slice(0, 3).join(", ")}.`);
    if (!warnings.length) warnings.push("Protocolo com dados suficientes para decisão.");
    return { score, grade: evaluation?.grade || (score >= 80 ? "A" : score >= 60 ? "B" : score >= 40 ? "C" : "D"), warnings, ok: score >= 60 };
  }

  function locationAudit(call) {
    if (!call) return { score: 0, label: "sem chamada", warnings: ["Sem chamada ativa."], ok: false };
    const intel = window.C190_LocationIntel?.normalize?.(call) || {};
    const confidence = safePercent(Number(intel.confidence || call.protocol?.locationConfidence || 0) * 100);
    const warnings = [];
    if (confidence < 35) warnings.push("Mapa ainda impreciso: confirme rua, número, referência ou bairro.");
    else if (confidence < 70) warnings.push("Local aproximado: bom para deslocamento inicial, mas ainda exige referência.");
    else warnings.push("Localização adequada para despacho.");
    return { score: confidence, label: intel.label || "localização em análise", warnings, ok: confidence >= 45 };
  }

  function triageAudit(call) {
    if (!call) return { score: 0, grade: "D", warnings: ["Sem triagem ativa."], ok: false };
    const triage = call.triage || {};
    const evaluation = call.triage?.evaluation || call.triageResult || null;
    const filled = ["nature", "priority", "organ"].filter((key) => !!triage[key]).length;
    const score = safePercent(evaluation?.score ?? filled * 32);
    const warnings = [];
    if (!triage.nature) warnings.push("Natureza da ocorrência ainda não definida.");
    if (!triage.priority) warnings.push("Prioridade operacional não definida.");
    if (!triage.organ) warnings.push("Órgão correto ainda não selecionado.");
    if (!warnings.length) warnings.push("Triagem coerente para prosseguir.");
    return { score, grade: evaluation?.grade || (score >= 85 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D"), warnings, ok: score >= 60 };
  }

  function dispatchAudit(call, state) {
    if (!call) return { score: 0, grade: "D", warnings: ["Sem despacho ativo."], ok: false };
    window.C190_ResourceDispatch?.normalize?.(call);
    const selected = Array.isArray(call.resourceDispatch?.selected) ? call.resourceDispatch.selected.length : 0;
    const evaluation = call.resourceDispatch?.evaluation || call.resourceDispatchResult || null;
    const score = safePercent(evaluation?.score ?? selected * 24);
    const warnings = [];
    if (selected <= 0) warnings.push("Nenhuma unidade selecionada para despacho.");
    else if (selected === 1 && Number(call.priority || 1) >= 3) warnings.push("Ocorrência crítica com apenas uma unidade pode ser insuficiente.");
    else if (selected >= 5) warnings.push("Muitos recursos selecionados: risco de superdespacho.");
    else warnings.push("Despacho com quantidade operacional aceitável.");
    return { score, grade: evaluation?.grade || (score >= 85 ? "A" : score >= 65 ? "B" : score >= 45 ? "C" : "D"), warnings, ok: selected > 0 && score >= 45 };
  }

  function pressureAudit(state) {
    const analysis = window.C190_Multitask?.analyze?.(state) || {};
    const shift = state?.dispatch?.shift || {};
    const waiting = waitingCalls(shift).length;
    const field = fieldCalls(shift).length;
    const score = safePercent(analysis.pressureScore ?? waiting * 20 + field * 10);
    const warnings = [];
    if (score >= 78) warnings.push("Central sobrecarregada: priorize chamadas críticas antes do rádio não urgente.");
    else if (score >= 48) warnings.push("Alta demanda: evite deixar ligações aguardando muito tempo.");
    else if (field > 0 && waiting === 0) warnings.push("Sem fila nova: momento ideal para acompanhar rádio das ocorrências em campo.");
    else warnings.push("Pressão operacional sob controle.");
    return { score, level: analysis.pressureLevel || (score >= 78 ? "critical" : score >= 48 ? "high" : "normal"), warnings, ok: score < 78 };
  }

  function finalRisk(active, audits) {
    let score = 100;
    if (active) {
      score -= (100 - audits.protocol.score) * 0.22;
      score -= (100 - audits.location.score) * 0.18;
      score -= (100 - audits.triage.score) * 0.24;
      score -= (100 - audits.dispatch.score) * 0.20;
    } else {
      score -= 20;
    }
    score -= audits.pressure.score * 0.16;
    score = safePercent(score);
    const level = score >= 82 ? "excellent" : score >= 66 ? "good" : score >= 48 ? "attention" : "danger";
    return {
      score,
      level,
      label: level === "excellent" ? "Pronto para decisão" : level === "good" ? "Operação aceitável" : level === "attention" ? "Atenção antes de confirmar" : "Risco operacional alto",
    };
  }

  function nextActions(active, audits, state) {
    const actions = [];
    if (!active) {
      const recommended = window.C190_Multitask?.analyze?.(state)?.recommended;
      if (recommended) actions.push({ type: "queue", text: `Atenda a prioridade: ${recommended.type}.` });
      else if (audits.pressure.score < 30) actions.push({ type: "field", text: "Acompanhe rádio das ocorrências em campo." });
      else actions.push({ type: "idle", text: "Aguarde nova ligação mantendo a central monitorada." });
      return actions;
    }
    if (audits.protocol.score < 60) actions.push({ type: "protocol", text: audits.protocol.warnings[0] });
    if (audits.location.score < 45) actions.push({ type: "location", text: audits.location.warnings[0] });
    if (audits.triage.score < 60) actions.push({ type: "triage", text: audits.triage.warnings[0] });
    if (audits.dispatch.score < 45) actions.push({ type: "dispatch", text: audits.dispatch.warnings[0] });
    if (!actions.length) actions.push({ type: "confirm", text: "Pode confirmar o despacho e acompanhar o rádio." });
    return actions.slice(0, 4);
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    if (!shift?.active) return { active: false, version: VERSION, label: "Supervisor aguardando plantão." };
    const active = activeCall(shift);
    const audits = {
      protocol: protocolAudit(active),
      location: locationAudit(active),
      triage: triageAudit(active),
      dispatch: dispatchAudit(active, state),
      pressure: pressureAudit(state),
    };
    const risk = finalRisk(active, audits);
    const actions = nextActions(active, audits, state);
    shift.supervisor = {
      version: VERSION,
      score: risk.score,
      level: risk.level,
      label: risk.label,
      updatedAt: new Date().toISOString(),
    };
    return {
      active: true,
      version: VERSION,
      build: BUILD,
      call: active,
      audits,
      risk,
      actions,
      waiting: waitingCalls(shift).length,
      field: fieldCalls(shift).length,
    };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      score: report.risk?.score || 0,
      level: report.risk?.level || "none",
      actions: report.actions?.length || 0,
    };
  }

  return { VERSION, BUILD, analyze, diagnostics };
})();
