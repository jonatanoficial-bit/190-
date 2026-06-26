window.C190_LegalFollowup = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-4400-F50-ENCAMINHAMENTO-LEGAL-20260624-171500-BRT";

  const PATHWAYS = {
    violencia: {
      label: "Delegacia / investigação criminal",
      required: ["BO completo", "autor/vítima identificados", "testemunhas", "perícia quando aplicável", "preservação do local"],
      destination: "Distrito Policial / Plantão de Polícia Civil",
    },
    samu: {
      label: "Regulação médica / hospital",
      required: ["ficha de atendimento", "condição da vítima", "destino hospitalar", "horário de remoção"],
      destination: "Regulação SAMU / Hospital referência",
    },
    resgate: {
      label: "Defesa Civil / laudo técnico",
      required: ["área isolada", "risco secundário", "órgão técnico acionado", "registro fotográfico", "responsável local"],
      destination: "Defesa Civil / Bombeiros / órgão técnico",
    },
    trânsito: {
      label: "BOAT / trânsito / perícia",
      required: ["via e sentido", "vítimas", "placas envolvidas", "bloqueio viário", "apoio CET"],
      destination: "Polícia / CET / perícia de trânsito",
    },
    geral: {
      label: "Boletim operacional",
      required: ["natureza", "endereço", "solicitante", "providência", "resultado"],
      destination: "Registro interno da central",
    },
  };

  function textOf(call = {}) {
    return `${call.type || ""} ${call.summary || ""} ${call.address || ""} ${(call.tags || []).join(" ")} ${(call.protocol?.asked || []).join(" ")}`.toLowerCase();
  }

  function categoryOf(call = {}) {
    const text = textOf(call);
    if (/arma|roubo|violência|agressor|ameaça|briga|tiro|furto|suspeito/.test(text)) return "violencia";
    if (/samu|ferid|vítima|mal súbito|infarto|criança|idoso|ambulância|hospital/.test(text)) return "samu";
    if (/alag|enchente|queda|desab|incêndio|fumaça|bombeiro|resgate|defesa civil/.test(text)) return "resgate";
    if (/colisão|acidente|atropel|trânsito|moto|carro|via|placa/.test(text)) return "trânsito";
    return "geral";
  }

  function legalItems(call = {}, state = null) {
    const items = [];
    const txt = textOf(call);
    const protocol = call.protocol || {};
    const dispatch = call.resourceDispatch || {};
    const support = call.supportNetwork || {};
    const evidence = window.C190_EvidenceChain?.analyzeCall?.(call, state) || null;
    const asked = (protocol.asked || []).map((x) => String(x).toLowerCase());
    if ((asked || []).length >= 3 || evidence?.score >= 58) items.push("BO completo", "natureza", "providência");
    if (evidence?.collected?.includes("endereço") || /rua|avenida|travessa|km|sentido/.test(txt)) items.push("endereço", "via e sentido");
    if (evidence?.collected?.includes("solicitante")) items.push("solicitante");
    if (evidence?.collected?.includes("testemunha")) items.push("testemunhas");
    if (evidence?.collected?.includes("identificação") || /placa|suspeito|autor|vítima|nome|característica/.test(txt)) items.push("autor/vítima identificados", "placas envolvidas");
    if (evidence?.collected?.includes("local preservado")) items.push("preservação do local");
    if (evidence?.collected?.includes("condição da vítima")) items.push("condição da vítima", "vítimas");
    if (evidence?.collected?.includes("hospital/regulação") || (support.activated || []).some((id) => /hospital|samu|regula/.test(String(id)))) items.push("destino hospitalar");
    if ((dispatch.selected || []).some((id) => /samu/.test(String(id)))) items.push("ficha de atendimento", "horário de remoção");
    if ((dispatch.selected || []).some((id) => /bm|defesa/.test(String(id))) || (support.activated || []).some((id) => /defesa|bombeiro|cobom/.test(String(id)))) items.push("área isolada", "órgão técnico acionado", "risco secundário");
    if ((support.activated || []).some((id) => /cet|traffic|via/.test(String(id)))) items.push("apoio CET", "bloqueio viário");
    if (evidence?.needsForensics || evidence?.collected?.includes("fotos do local")) items.push("perícia quando aplicável", "registro fotográfico");
    if (call.status === "resolved") items.push("resultado", "responsável local");
    return [...new Set(items)];
  }

  function analyzeCall(call = {}, state = null) {
    const category = categoryOf(call);
    const pathway = PATHWAYS[category] || PATHWAYS.geral;
    const items = legalItems(call, state);
    const missing = pathway.required.filter((item) => !items.includes(item));
    const evidence = window.C190_EvidenceChain?.analyzeCall?.(call, state) || { score: 70, chainLevel: "partial" };
    const base = Math.round((items.filter((item) => pathway.required.includes(item)).length / Math.max(1, pathway.required.length)) * 100);
    const score = Math.max(0, Math.min(100, Math.round(base * 0.66 + Number(evidence.score || 60) * 0.34)));
    const level = score >= 84 ? "complete" : score >= 64 ? "adequate" : score >= 42 ? "pending" : "critical";
    const label = level === "complete" ? "Encaminhamento sólido" : level === "adequate" ? "Encaminhamento aceitável" : level === "pending" ? "Pendência legal" : "Risco jurídico";
    return {
      callId: call.id || null,
      type: call.type || "Ocorrência",
      category,
      pathway: pathway.label,
      destination: pathway.destination,
      required: pathway.required,
      items,
      missing,
      score,
      level,
      label,
      evidenceScore: Number(evidence.score || 0),
      investigationImpact: score >= 84 ? "fortalece investigação" : score >= 64 ? "investigação viável" : "risco de retrabalho",
    };
  }

  function analyze(state) {
    const shift = state?.dispatch?.shift;
    const active = !!shift?.active;
    const calls = (shift?.calls || []).filter((call) => ["waiting", "active", "field", "resolved", "failed"].includes(call.status));
    const callReports = calls.map((call) => analyzeCall(call, state));
    const avgScore = callReports.length ? Math.round(callReports.reduce((sum, item) => sum + Number(item.score || 0), 0) / callReports.length) : 100;
    const pending = callReports.filter((item) => ["pending", "critical"].includes(item.level));
    const critical = callReports.filter((item) => item.level === "critical");
    const level = avgScore < 45 || critical.length ? "critical" : avgScore < 68 || pending.length ? "attention" : "ready";
    const recommended = pending
      .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
      .slice(0, 4)
      .map((item) => `${item.type}: encaminhar para ${item.destination} e completar ${item.missing.slice(0, 2).join(" / ")}.`);
    return {
      active,
      version: VERSION,
      build: BUILD,
      avgScore,
      level,
      label: level === "critical" ? "Risco jurídico crítico" : level === "attention" ? "Encaminhamento pendente" : "Fluxo legal adequado",
      callReports,
      pending,
      critical,
      recommended,
      summary: {
        legalScore: avgScore,
        pendingCases: pending.length,
        criticalCases: critical.length,
        completeCases: callReports.filter((item) => item.level === "complete").length,
      },
      relief: level === "ready" ? 3 : level === "attention" ? -7 : -16,
    };
  }

  function callModifier(call, state) {
    const report = analyzeCall(call, state);
    if (report.level === "complete") return { riskBonus: -2, notes: ["Encaminhamento legal sólido."] };
    const bonus = report.level === "critical" ? 14 : report.level === "pending" ? 8 : 3;
    return {
      riskBonus: bonus,
      notes: report.missing.length ? [`Pendência legal: ${report.missing.slice(0, 2).join(", ")}.`] : [],
    };
  }

  function pressureRelief(state) {
    return Number(analyze(state).relief || 0);
  }

  function decorateReport(report, state) {
    if (!report || typeof report !== "object") return report;
    const calls = Array.isArray(report.calls) ? report.calls : [];
    const callReports = calls.map((call) => analyzeCall(call, state));
    const legalScore = callReports.length ? Math.round(callReports.reduce((sum, item) => sum + Number(item.score || 0), 0) / callReports.length) : 100;
    return {
      ...report,
      legalSummary: {
        version: VERSION,
        legalScore,
        pendingCases: callReports.filter((item) => ["pending", "critical"].includes(item.level)).length,
        criticalCases: callReports.filter((item) => item.level === "critical").length,
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
      pendingCases: report.pending.length,
      criticalCases: report.critical.length,
    };
  }

  return { VERSION, BUILD, analyzeCall, analyze, callModifier, pressureRelief, decorateReport, diagnostics };
})();
