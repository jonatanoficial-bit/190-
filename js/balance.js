window.C190_Balance = (() => {
  "use strict";

  const VERSION = 1;
  const BALANCE_VERSION = 3;

  const gradeThresholds = [
    { grade: "S", min: 92 },
    { grade: "A", min: 80 },
    { grade: "B", min: 68 },
    { grade: "C", min: 55 },
    { grade: "D", min: 0 },
  ];

  const scoreWeights = {
    protocol: 0.20,
    triage: 0.20,
    dispatch: 0.22,
    radio: 0.18,
    location: 0.12,
    outcome: 0.08,
  };

  const economy = {
    maxXpPerCall: 260,
    maxRepGainPerCall: 6,
    maxRepLossPerCall: -9,
    abandonedQuality: -2,
    warningCriticalQuality: -4,
    warningProcedureQuality: -2,
    perfectShiftBonusXp: 90,
    perfectShiftBonusRep: 2,
  };

  const difficultyProfiles = {
    assistido: {
      id: "assistido",
      label: "Assistido",
      xpFactor: 0.92,
      positiveRepFactor: 0.85,
      negativeRepFactor: 0.55,
      warningFactor: 0.65,
      scoreGrace: 5,
      description: "Mais tolerante, ideal para aprender protocolo sem travar a carreira.",
    },
    realista: {
      id: "realista",
      label: "Realista",
      xpFactor: 1,
      positiveRepFactor: 1,
      negativeRepFactor: 1,
      warningFactor: 1,
      scoreGrace: 0,
      description: "Pontuação e consequências equilibradas para a carreira principal.",
    },
    especialista: {
      id: "especialista",
      label: "Especialista",
      xpFactor: 1.18,
      positiveRepFactor: 1.12,
      negativeRepFactor: 1.35,
      warningFactor: 1.25,
      scoreGrace: -3,
      description: "Maior recompensa, mas menos tolerância a erro crítico de atendimento.",
    },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function grade(score) {
    const item = gradeThresholds.find((g) => score >= g.min) || gradeThresholds[gradeThresholds.length - 1];
    return item.grade;
  }

  function difficulty(state) {
    const id = state?.profile?.difficulty && difficultyProfiles[state.profile.difficulty] ? state.profile.difficulty : "realista";
    return difficultyProfiles[id];
  }

  function n(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function callScore(call) {
    const protocol = n(call?.protocolResult?.finalProtocolScore ?? call?.protocol?.evaluation?.finalProtocolScore, 45);
    const triage = n(call?.triageResult?.finalScore ?? call?.triage?.evaluation?.finalScore, 45);
    const dispatch = n(call?.resourceDispatchResult?.finalScore ?? call?.resourceDispatch?.evaluation?.finalScore, 45);
    const radio = n(call?.radioResult?.finalScore ?? call?.fieldRadio?.finalScore, call?.fieldRadio?.finalized ? 45 : 55);
    const confidence = n(call?.locationIntel?.confidence ?? call?.protocol?.locationConfidence, 0);
    const location = clamp(Math.round(confidence * 100), 0, 100);
    const outcome = call?.status === "resolved" || call?.outcome === "resolved" ? 100 : call?.status === "abandoned" ? 0 : 28;
    const score = Math.round(
      protocol * scoreWeights.protocol +
      triage * scoreWeights.triage +
      dispatch * scoreWeights.dispatch +
      radio * scoreWeights.radio +
      location * scoreWeights.location +
      outcome * scoreWeights.outcome,
    );
    return {
      score: clamp(score, 0, 100),
      grade: grade(clamp(score, 0, 100)),
      parts: { protocol, triage, dispatch, radio, location, outcome },
    };
  }

  function shiftScore(state, shift) {
    const profile = difficulty(state);
    const calls = Array.isArray(shift?.calls) ? shift.calls : [];
    const scored = calls.map(callScore);
    const average = scored.length ? scored.reduce((sum, item) => sum + item.score, 0) / scored.length : 0;
    const resolved = Number(shift?.resolved || 0);
    const failed = Number(shift?.failed || 0);
    const abandoned = Number(shift?.abandoned || 0);
    const total = Math.max(1, resolved + failed + abandoned);
    const resolutionBonus = Math.round((resolved / total) * 10);
    const failurePenalty = failed * 7 + abandoned * 11;
    const overloadPenalty = total >= 7 ? 2 : 0;
    const difficultyGrace = profile.scoreGrace;
    const finalScore = clamp(Math.round(average + resolutionBonus - failurePenalty - overloadPenalty + difficultyGrace), 0, 100);
    return {
      version: VERSION,
      balanceVersion: BALANCE_VERSION,
      score: finalScore,
      grade: grade(finalScore),
      averageCallScore: Math.round(average),
      resolutionBonus,
      failurePenalty,
      overloadPenalty,
      difficulty: profile.id,
      difficultyGrace,
      weights: { ...scoreWeights },
      calls: scored,
    };
  }

  function careerOutcome(state, outcome = {}) {
    const profile = difficulty(state);
    const alreadyBalanced = Number(outcome.balanceVersion || 0) >= BALANCE_VERSION || !!outcome.difficulty;
    const rawXp = n(outcome.xp, 0);
    const rawRep = n(outcome.rep, 0);
    const rawQuality = n(outcome.quality, 0);
    const xp = alreadyBalanced ? rawXp : rawXp * profile.xpFactor;
    const repFactor = rawRep < 0 ? profile.negativeRepFactor : profile.positiveRepFactor;
    const rep = alreadyBalanced ? rawRep : rawRep * repFactor;
    const cappedXp = clamp(Math.round(xp), 0, economy.maxXpPerCall);
    const cappedRep = Math.round(clamp(rep, economy.maxRepLossPerCall, economy.maxRepGainPerCall));
    let warning = null;
    if (rawQuality <= economy.warningCriticalQuality) {
      warning = {
        title: "Falha crítica de protocolo",
        reason: outcome.reason || "Erro grave no atendimento, triagem, despacho ou rádio.",
        durationShifts: Math.max(3, Math.round(4 * profile.warningFactor)),
      };
    } else if (rawQuality <= economy.warningProcedureQuality) {
      warning = {
        title: "Falha de procedimento",
        reason: outcome.reason || "Procedimento operacional abaixo do padrão esperado.",
        durationShifts: Math.max(2, Math.round(3 * profile.warningFactor)),
      };
    }
    return {
      ...outcome,
      xp: cappedXp,
      rep: cappedRep,
      quality: rawQuality,
      difficulty: profile.id,
      balanceVersion: BALANCE_VERSION,
      warning,
    };
  }

  function shiftBonus(state, report) {
    const profile = difficulty(state);
    const perfect = Number(report?.failed || 0) === 0 && Number(report?.abandoned || 0) === 0 && Number(report?.resolved || 0) > 0;
    if (!perfect) return { xp: 0, rep: 0, label: "sem bônus" };
    const score = Number(report?.score || 0);
    if (score < 80) return { xp: 0, rep: 0, label: "sem bônus" };
    const xp = Math.round(economy.perfectShiftBonusXp * profile.xpFactor * (score >= 92 ? 1.25 : 1));
    const rep = score >= 92 ? economy.perfectShiftBonusRep + 1 : economy.perfectShiftBonusRep;
    return { xp, rep, label: score >= 92 ? "plantão perfeito elite" : "plantão perfeito" };
  }

  function summary(state) {
    const profile = difficulty(state);
    return {
      version: VERSION,
      balanceVersion: BALANCE_VERSION,
      profile,
      weights: { ...scoreWeights },
      economy: { ...economy },
      label: `Balanceamento v${BALANCE_VERSION} · ${profile.label}`,
    };
  }

  return {
    VERSION,
    BALANCE_VERSION,
    scoreWeights,
    economy,
    difficultyProfiles,
    grade,
    difficulty,
    callScore,
    shiftScore,
    careerOutcome,
    shiftBonus,
    summary,
  };
})();
