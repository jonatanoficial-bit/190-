window.C190_Debriefing = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-3200-F38-DEBRIEFING-PROFISSIONAL-20260624-112500-BRT";

  const courseMap = {
    protocol: "Protocolo de atendimento",
    location: "Geolocalização progressiva",
    triage: "Triagem e prioridade",
    dispatch: "Despacho de recursos",
    radio: "Rádio operacional",
    pressure: "Gestão de fila"
  };

  function gradeLabel(score) {
    const n = Number(score || 0);
    return n >= 92 ? "S" : n >= 80 ? "A" : n >= 68 ? "B" : n >= 55 ? "C" : "D";
  }

  function average(values = []) {
    const valid = values.map(Number).filter((v) => Number.isFinite(v));
    if (!valid.length) return 0;
    return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
  }

  function callScore(call = {}) {
    const protocol = Number(call.protocolScore || 0);
    const triage = Number(call.triageScore || 0);
    const dispatch = Number(call.resourceDispatchScore || call.dispatchScore || 0);
    const radio = Number(call.radioScore || 0);
    const location = Number(call.locationConfidence || 0) * 100;
    return average([protocol, triage, dispatch, radio, location].filter((v) => v > 0));
  }

  function weaknessesForCall(call = {}) {
    const weak = [];
    if (Number(call.protocolScore || 0) && Number(call.protocolScore || 0) < 65) weak.push("protocol");
    if (Number(call.locationConfidence || 0) < 0.45) weak.push("location");
    if (Number(call.triageScore || 0) && Number(call.triageScore || 0) < 65) weak.push("triage");
    if (Number(call.resourceDispatchScore || call.dispatchScore || 0) && Number(call.resourceDispatchScore || call.dispatchScore || 0) < 65) weak.push("dispatch");
    if (Number(call.radioScore || 0) && Number(call.radioScore || 0) < 65) weak.push("radio");
    if (String(call.outcome || call.status || "").includes("abandoned")) weak.push("pressure");
    return [...new Set(weak)];
  }

  function lessonText(key) {
    const lessons = {
      protocol: "Faça perguntas essenciais antes de classificar: endereço, referência, risco imediato, vítimas e segurança do solicitante.",
      location: "Melhore a precisão do mapa antes do despacho: bairro, rua, número, referência visual e sentido da via.",
      triage: "Defina natureza, prioridade e órgão correto antes de mobilizar recursos.",
      dispatch: "Evite enviar recurso insuficiente em ocorrência crítica ou exagerar em casos simples.",
      radio: "Acompanhe chegada, cenário real, necessidade de apoio e encerramento em campo.",
      pressure: "Atenda a fila por risco e tempo de espera; chamadas críticas não podem ficar aguardando."
    };
    return lessons[key] || "Revise o procedimento operacional.";
  }

  function analyzeReport(report = {}) {
    const calls = Array.isArray(report.calls) ? report.calls : [];
    const weaknesses = {};
    calls.forEach((call) => {
      weaknessesForCall(call).forEach((key) => {
        weaknesses[key] = (weaknesses[key] || 0) + 1;
      });
    });
    const sortedWeak = Object.entries(weaknesses).sort((a, b) => b[1] - a[1]);
    const protocolAvg = average(calls.map((c) => c.protocolScore).filter(Boolean));
    const radioAvg = average(calls.map((c) => c.radioScore).filter(Boolean));
    const locationAvg = average(calls.map((c) => Number(c.locationConfidence || 0) * 100).filter(Boolean));
    const callScores = calls.map(callScore).filter(Boolean);
    const decisionAvg = average(callScores);
    const finalScore = Number(report.score || decisionAvg || 0);
    const strengths = [];
    if (Number(report.resolved || 0) > Number(report.failed || 0)) strengths.push("Boa taxa de resolução.");
    if (protocolAvg >= 75) strengths.push("Protocolo consistente.");
    if (radioAvg >= 75) strengths.push("Bom acompanhamento de rádio.");
    if (locationAvg >= 70) strengths.push("Boa precisão de localização.");
    if (!strengths.length) strengths.push("Plantão útil para aprendizado operacional.");

    const lessons = sortedWeak.map(([key, count]) => ({
      key,
      count,
      title: courseMap[key] || key,
      text: lessonText(key),
    }));

    const recommendedCourse = lessons[0]?.title || (finalScore < 70 ? "Protocolo de atendimento" : "Rádio operacional");
    const supervisorNote = finalScore >= 82
      ? "Plantão com desempenho profissional. Continue refinando tempo de resposta e decisões sob pressão."
      : finalScore >= 65
        ? "Plantão aceitável, mas há pontos claros para treinamento antes de avançar."
        : "Plantão abaixo do ideal. Revise protocolo, triagem e despacho antes de operar cenários mais críticos.";

    return {
      reportId: report.id || null,
      modeLabel: report.modeLabel || report.mode || "Plantão",
      grade: report.grade || gradeLabel(finalScore),
      score: Math.round(finalScore),
      duration: Number(report.duration || 0),
      resolved: Number(report.resolved || 0),
      failed: Number(report.failed || 0),
      abandoned: Number(report.abandoned || 0),
      calls: calls.length,
      protocolAvg,
      radioAvg,
      locationAvg,
      decisionAvg,
      strengths,
      lessons,
      recommendedCourse,
      supervisorNote,
      callsAnalysis: calls.map((call, index) => ({
        index: index + 1,
        type: call.type || "Ocorrência",
        outcome: call.outcome || call.status || "registro",
        score: callScore(call),
        weaknesses: weaknessesForCall(call),
        lesson: weaknessesForCall(call).map(lessonText)[0] || "Decisão aceitável para o cenário."
      })),
    };
  }

  function latestReport(state) {
    const reports = state?.dispatch?.reports || [];
    return reports[0] || reports[reports.length - 1] || null;
  }

  function analyze(state) {
    const reports = state?.dispatch?.reports || [];
    const latest = latestReport(state);
    if (!latest) {
      return {
        active: false,
        version: VERSION,
        build: BUILD,
        title: "Sem debriefing disponível",
        message: "Conclua um plantão para gerar análise profissional, lições e plano de melhoria."
      };
    }
    const analyzed = analyzeReport(latest);
    const history = reports.slice(0, 5).map(analyzeReport);
    const trend = history.length >= 2 ? Math.round(history[0].score - history[history.length - 1].score) : 0;
    return {
      active: true,
      version: VERSION,
      build: BUILD,
      latest: analyzed,
      history,
      trend,
      trendLabel: trend > 0 ? `+${trend} pontos de evolução` : trend < 0 ? `${trend} pontos de queda` : "estável",
    };
  }

  function diagnostics(state) {
    const report = analyze(state);
    return {
      version: VERSION,
      build: BUILD,
      active: report.active,
      latestScore: report.latest?.score || 0,
      lessons: report.latest?.lessons?.length || 0,
      trend: report.trend || 0,
    };
  }

  return { VERSION, BUILD, analyzeReport, analyze, diagnostics };
})();
