window.C190_EvidenceChain = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4300-F49-EVIDENCIAS-PERICIA-20260624-164500-BRT";

  const REQUIREMENTS = {
    violencia: ["local preservado", "testemunha", "identificação", "relato cronológico", "viatura no local"],
    samu: ["condição da vítima", "tempo de sintomas", "idade aproximada", "hospital/regulação", "unidade acionada"],
    resgate: ["risco secundário", "área isolada", "bombeiros/defesa civil", "fotos do local", "vítimas contabilizadas"],
    trânsito: ["ponto de referência", "sentido da via", "vítimas", "bloqueio viário", "apoio CET"],
    geral: ["endereço", "natureza da ocorrência", "solicitante", "providência adotada"]
  };

  function textOf(call = {}) {
    return `${call.type || ""} ${call.summary || ""} ${call.address || ""} ${(call.tags || []).join(" ")} ${(call.protocol?.asked || []).join(" ")}`.toLowerCase();
  }

  function categoryOf(call = {}) {
    const text = textOf(call);
    if (/arma|roubo|violência|agressor|ameaça|briga|tiro|furto/.test(text)) return "violencia";
    if (/samu|ferid|vítima|mal súbito|infarto|criança|idoso|ambulância/.test(text)) return "samu";
    if (/alag|enchente|queda|desab|incêndio|fumaça|bombeiro|resgate/.test(text)) return "resgate";
    if (/colisão|acidente|atropel|trânsito|moto|carro|via/.test(text)) return "trânsito";
    return "geral";
  }

  function collectedEvidence(call = {}, state = null) {
    const items = [];
    const protocol = call.protocol || {};
    const dispatch = call.resourceDispatch || {};
    const support = call.supportNetwork || {};
    const radio = call.fieldRadio || {};
    const loc = window.C190_LocationIntel?.normalize?.(call) || {};
    if ((protocol.asked || []).length >= 2) items.push("relato cronológico");
    if ((protocol.asked || []).some((x) => /nome|solicitante|telefone|testemunha|quem/.test(String(x).toLowerCase()))) items.push("solicitante");
    if ((protocol.asked || []).some((x) => /testemunha|viu|presenciou/.test(String(x).toLowerCase()))) items.push("testemunha");
    if ((protocol.asked || []).some((x) => /idade|vítima|sintoma|ferido|estado/.test(String(x).toLowerCase()))) items.push("condição da vítima");
    if ((protocol.asked || []).some((x) => /tempo|quando|horas|minutos/.test(String(x).toLowerCase()))) items.push("tempo de sintomas");
    if ((protocol.asked || []).some((x) => /identificação|característica|roupa|placa|suspeito/.test(String(x).toLowerCase()))) items.push("identificação");
    if (loc.stage === "precise" || loc.stage === "block") items.push("endereço", "ponto de referência");
    if (loc.stage === "precise") items.push("sentido da via");
    if ((dispatch.selected || []).length) items.push("unidade acionada", "viatura no local", "providência adotada");
    if ((dispatch.selected || []).some((id) => /bm|defesa/.test(String(id)))) items.push("bombeiros/defesa civil", "área isolada");
    if ((dispatch.selected || []).some((id) => /samu/.test(String(id)))) items.push("hospital/regulação");
    if ((support.activated || []).some((id) => /cet|traffic|via/.test(String(id)))) items.push("apoio CET", "bloqueio viário");
    if ((support.activated || []).some((id) => /hospital|samu|regula/.test(String(id)))) items.push("hospital/regulação");
    if ((support.activated || []).some((id) => /defesa|bombeiro|cobom/.test(String(id)))) items.push("risco secundário");
    if (radio.active || radio.finalized || call.status === "field" || call.status === "resolved") items.push("local preservado", "vítimas contabilizadas");
    if (call.status === "resolved") items.push("fotos do local");
    return [...new Set(items)];
  }

  function analyzeCall(call, state) {
    const category = categoryOf(call);
    const required = REQUIREMENTS[category] || REQUIREMENTS.geral;
    const collected = collectedEvidence(call, state);
    const missing = required.filter((item) => !collected.includes(item));
    const score = Math.max(0, Math.min(100, Math.round((collected.filter((item) => required.includes(item)).length / Math.max(1, required.length)) * 100)));
    const chainLevel = score >= 82 ? "complete" : score >= 58 ? "partial" : score >= 34 ? "fragile" : "critical";
    const label = chainLevel === "complete" ? "Cadeia preservada" : chainLevel === "partial" ? "Documentação parcial" : chainLevel === "fragile" ? "Provas frágeis" : "Cadeia crítica";
    return {
      callId: call?.id || null,
      type: call?.type || "Ocorrência",
      category,
      required,
      collected,
      missing,
      score,
      chainLevel,
      label,
      needsForensics: ["violencia", "resgate", "trânsito"].includes(category) && score < 82,
      reportQuality: score >= 82 ? "alto" : score >= 58 ? "médio" : "baixo",
    };
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    const active = !!shift?.active;
    const calls = shift?.calls || [];
    const relevant = calls.filter((call) => ["waiting", "active", "field", "resolved", "failed"].includes(call.status));
    const callReports = relevant.map((call) => analyzeCall(call, state));
    const avgScore = callReports.length ? Math.round(callReports.reduce((sum, item) => sum + Number(item.score || 0), 0) / callReports.length) : 100;
    const critical = callReports.filter((item) => ["critical", "fragile"].includes(item.chainLevel));
    const forensic = callReports.filter((item) => item.needsForensics);
    const level = avgScore < 42 || critical.some((item) => item.chainLevel === "critical") ? "critical" : avgScore < 66 || critical.length ? "attention" : "ready";
    const recommended = callReports
      .filter((item) => item.missing.length)
      .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
      .slice(0, 3)
      .map((item) => ({
        callId: item.callId,
        type: item.type,
        text: `${item.type}: registrar ${item.missing.slice(0, 2).join(" e ")}.`,
        score: item.score,
      }));
    return {
      active,
      version: VERSION,
      build: BUILD,
      avgScore,
      level,
      label: level === "critical" ? "Cadeia de custódia crítica" : level === "attention" ? "Documentação incompleta" : "Evidências preservadas",
      callReports,
      critical,
      forensic,
      recommended,
      summary: {
        evidenceScore: avgScore,
        fragileCases: critical.length,
        forensicPending: forensic.length,
        documentedCases: callReports.filter((item) => item.chainLevel === "complete").length,
      },
      relief: level === "ready" ? 3 : level === "attention" ? -6 : -14,
    };
  }

  function callModifier(call, state) {
    const report = analyzeCall(call, state);
    if (report.chainLevel === "complete") return { riskBonus: -3, notes: ["Cadeia de custódia bem preservada."] };
    const bonus = report.chainLevel === "critical" ? 13 : report.chainLevel === "fragile" ? 8 : report.chainLevel === "partial" ? 3 : 0;
    return {
      riskBonus: bonus,
      notes: report.missing.length ? [`Faltam evidências: ${report.missing.slice(0, 2).join(", ")}.`] : [],
    };
  }

  function pressureRelief(state) {
    return Number(analyze(state).relief || 0);
  }

  function decorateReport(report, state) {
    if (!report || typeof report !== "object") return report;
    const calls = Array.isArray(report.calls) ? report.calls : [];
    const callReports = calls.map((call) => analyzeCall(call, state));
    const evidenceScore = callReports.length ? Math.round(callReports.reduce((sum, item) => sum + Number(item.score || 0), 0) / callReports.length) : 100;
    return {
      ...report,
      evidenceSummary: {
        version: VERSION,
        evidenceScore,
        fragileCases: callReports.filter((item) => ["critical", "fragile"].includes(item.chainLevel)).length,
        forensicPending: callReports.filter((item) => item.needsForensics).length,
        callReports,
      },
    };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      avgScore: report.avgScore,
      level: report.level,
      fragileCases: report.critical.length,
      forensicPending: report.forensic.length,
    };
  }

  return { VERSION, BUILD, analyzeCall, analyze, callModifier, pressureRelief, decorateReport, diagnostics };
})();
