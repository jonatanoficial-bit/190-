window.C190_Campaign = (() => {
  "use strict";

  const VERSION = "1.9.0";
  const CAMPAIGN_VERSION = 1;

  const missions = [
    {
      id: "turno_zero",
      chapter: 1,
      icon: "☎",
      title: "Turno Zero — Primeira noite",
      subtitle: "Entrada controlada no fluxo real de atendimento.",
      cityId: "sp",
      minRank: 0,
      minShifts: 0,
      minScore: 60,
      callCount: 3,
      arrivalGap: 18,
      templateIds: ["noise", "neighbors", "threat_street"],
      reward: { xp: 260, rep: 2 },
      briefing: "Mostre domínio básico: colete endereço, entenda a situação, classifique com calma e despache sem exageros.",
      objectives: ["resolver ao menos 2 chamadas", "não abandonar chamadas", "nota final mínima 60"],
    },
    {
      id: "bairro_alerta",
      chapter: 2,
      icon: "◇",
      title: "Bairro em alerta",
      subtitle: "Chamadas conectadas em uma mesma região.",
      cityId: "sp",
      minRank: 0,
      minShifts: 1,
      minScore: 68,
      callCount: 4,
      arrivalGap: 16,
      templateIds: ["threat_street", "child_risk", "weapon_report", "domestic_silent"],
      reward: { xp: 380, rep: 3 },
      briefing: "A central recebe relatos diferentes do mesmo bairro. Priorize risco armado e proteção de vulneráveis.",
      objectives: ["mapear ao menos 3 ocorrências", "triagem correta em casos graves", "nota final mínima 68"],
    },
    {
      id: "chuva_forte",
      chapter: 3,
      icon: "☂",
      title: "Chuva forte — resposta integrada",
      subtitle: "Clima severo, Bombeiros e Defesa Civil.",
      cityId: "recife",
      minRank: 1,
      minShifts: 3,
      minScore: 70,
      callCount: 5,
      arrivalGap: 15,
      templateIds: ["flood_vehicle", "tree_road", "power_outage", "traffic_victim", "missing_flood"],
      reward: { xp: 520, rep: 4 },
      briefing: "Uma frente de chuva cria ocorrências simultâneas. Use Bombeiros, SAMU e Defesa Civil quando necessário.",
      objectives: ["evitar orientação perigosa", "acionar órgão correto", "nota final mínima 70"],
    },
    {
      id: "final_estadio",
      chapter: 4,
      icon: "◎",
      title: "Final no estádio",
      subtitle: "Evento lotado, multidão e emergência médica.",
      cityId: "rio",
      minRank: 2,
      minShifts: 5,
      minScore: 74,
      callCount: 5,
      arrivalGap: 14,
      templateIds: ["event_crowd", "missing_child", "fight_event", "medical_event", "traffic_event"],
      reward: { xp: 650, rep: 5 },
      briefing: "O evento exige localização por setor, fluxo de público, apoio médico e coordenação com segurança.",
      objectives: ["coletar referência/setor", "não expor dados sensíveis", "nota final mínima 74"],
    },
    {
      id: "cerco_critico",
      chapter: 5,
      icon: "◆",
      title: "Cerco crítico",
      subtitle: "Alto risco, possível refém e rádio ativo.",
      cityId: "bh",
      minRank: 3,
      minShifts: 8,
      minScore: 78,
      callCount: 5,
      arrivalGap: 13,
      templateIds: ["bank_alarm", "hostage_report", "suspect_vehicle", "perimeter_conflict", "negotiation_update"],
      reward: { xp: 820, rep: 6 },
      briefing: "Evite expor informações sensíveis. Despache força adequada, acompanhe rádio e proteja o perímetro.",
      objectives: ["despacho tático suficiente", "acompanhar rádio até o fim", "nota final mínima 78"],
    },
    {
      id: "apagao_metropolitano",
      chapter: 6,
      icon: "⚡",
      title: "Apagão metropolitano",
      subtitle: "Crise regional com múltiplas prioridades.",
      cityId: "poa",
      minRank: 4,
      minShifts: 12,
      minScore: 82,
      callCount: 6,
      arrivalGap: 12,
      templateIds: ["power_outage", "elevator_trapped", "traffic_blackout", "hospital_generator", "looting_risk", "fire_electrical"],
      reward: { xp: 1050, rep: 8 },
      briefing: "A cidade escureceu. Concentre recursos nos riscos à vida, infraestrutura crítica e escalada de segurança.",
      objectives: ["priorizar vida acima de patrimônio", "acionar múltiplos órgãos", "nota final mínima 82"],
    },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function defaultCampaign() {
    return {
      version: CAMPAIGN_VERSION,
      activeMissionId: null,
      selectedMissionId: "turno_zero",
      completed: [],
      attempts: {},
      bestScores: {},
      rewardsClaimed: [],
      history: [],
      lastUnlockedAt: null,
    };
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return defaultCampaign();
    const current = state.campaign && typeof state.campaign === "object" ? state.campaign : {};
    state.campaign = {
      ...defaultCampaign(),
      ...current,
      version: CAMPAIGN_VERSION,
      completed: Array.isArray(current.completed) ? current.completed : [],
      rewardsClaimed: Array.isArray(current.rewardsClaimed) ? current.rewardsClaimed : [],
      history: Array.isArray(current.history) ? current.history.slice(0, 80) : [],
      attempts: current.attempts && typeof current.attempts === "object" ? current.attempts : {},
      bestScores: current.bestScores && typeof current.bestScores === "object" ? current.bestScores : {},
    };
    if (!missions.some((m) => m.id === state.campaign.selectedMissionId)) state.campaign.selectedMissionId = nextMission(state)?.id || missions[0].id;
    return state.campaign;
  }

  function cityName(id) {
    return window.C190_Content?.cityById?.(id)?.name || id || "Cidade operacional";
  }

  function previousCompleted(state, mission) {
    if (mission.chapter <= 1) return true;
    const previous = missions.find((item) => item.chapter === mission.chapter - 1);
    return !previous || state.campaign.completed.includes(previous.id);
  }

  function unlocked(state, mission) {
    normalize(state);
    const rankIndex = window.C190_Career?.rankIndex?.(state.career?.rankId || "operador_iii") ?? 0;
    const shifts = Number(state.career?.totalShifts || 0);
    return previousCompleted(state, mission) && rankIndex >= Number(mission.minRank || 0) && shifts >= Number(mission.minShifts || 0);
  }

  function lockReason(state, mission) {
    if (unlocked(state, mission)) return "Disponível";
    if (!previousCompleted(state, mission)) return "Conclua a missão anterior";
    const rankIndex = window.C190_Career?.rankIndex?.(state.career?.rankId || "operador_iii") ?? 0;
    if (rankIndex < Number(mission.minRank || 0)) return `Requer patente ${window.C190_Career?.ranks?.[mission.minRank]?.name || "superior"}`;
    if (Number(state.career?.totalShifts || 0) < Number(mission.minShifts || 0)) return `Requer ${mission.minShifts} plantões de carreira`;
    return "Bloqueada";
  }

  function nextMission(state) {
    normalize(state);
    return missions.find((mission) => !state.campaign.completed.includes(mission.id) && unlocked(state, mission)) || missions.find((mission) => !state.campaign.completed.includes(mission.id)) || null;
  }

  function missionById(id) {
    return missions.find((mission) => mission.id === id) || null;
  }

  function statusFor(state, mission) {
    normalize(state);
    const completed = state.campaign.completed.includes(mission.id);
    const available = unlocked(state, mission);
    const attempts = Number(state.campaign.attempts[mission.id] || 0);
    const best = Number(state.campaign.bestScores[mission.id] || 0);
    return {
      completed,
      available,
      attempts,
      best,
      label: completed ? "Concluída" : available ? "Disponível" : lockReason(state, mission),
      canLaunch: available && !state.dispatch?.shift?.active,
    };
  }

  function launch(state, missionId) {
    normalize(state);
    if (!state.profile) return { ok: false, reason: "profile_missing" };
    if (state.dispatch?.shift?.active) return { ok: false, reason: "active_shift" };
    const mission = missionById(missionId || nextMission(state)?.id);
    if (!mission) return { ok: false, reason: "mission_missing" };
    if (!unlocked(state, mission)) return { ok: false, reason: "locked", mission };
    const shift = window.C190_Dispatch?.startShift?.(state, {
      mode: "campaign",
      label: `Campanha ${mission.chapter}: ${mission.title}`,
      cityId: mission.cityId,
      callCount: mission.callCount,
      arrivalGap: mission.arrivalGap,
      templateIds: mission.templateIds,
      affectsCareer: true,
      penalties: true,
      missionId: mission.id,
      campaignChapter: mission.chapter,
    });
    if (!shift) return { ok: false, reason: "shift_failed" };
    shift.campaignId = "main";
    shift.missionId = mission.id;
    shift.campaignChapter = mission.chapter;
    shift.campaignMinScore = mission.minScore;
    state.campaign.activeMissionId = mission.id;
    state.campaign.selectedMissionId = mission.id;
    state.campaign.attempts[mission.id] = Number(state.campaign.attempts[mission.id] || 0) + 1;
    state.campaign.history.unshift({
      at: new Date().toISOString(),
      type: "start",
      missionId: mission.id,
      title: mission.title,
      detail: `Missão iniciada em ${cityName(mission.cityId)}.`,
    });
    state.campaign.history = state.campaign.history.slice(0, 80);
    return { ok: true, mission, shift };
  }

  function onShiftEnded(state, report) {
    normalize(state);
    if (!report || report.mode !== "campaign") return null;
    const missionId = report.missionId || state.campaign.activeMissionId;
    const mission = missionById(missionId);
    if (!mission) return null;
    const score = Number(report.score || 0);
    const passed = score >= Number(mission.minScore || 0) && Number(report.abandoned || 0) === 0 && Number(report.failed || 0) <= Math.max(0, Math.floor((mission.callCount || 3) / 4));
    state.campaign.bestScores[mission.id] = Math.max(Number(state.campaign.bestScores[mission.id] || 0), score);
    state.campaign.activeMissionId = null;
    report.campaignMissionId = mission.id;
    report.campaignMissionTitle = mission.title;
    report.campaignPassed = passed;
    report.campaignRequiredScore = mission.minScore;
    let firstCompletion = false;
    if (passed && !state.campaign.completed.includes(mission.id)) {
      state.campaign.completed.push(mission.id);
      firstCompletion = true;
      state.campaign.lastUnlockedAt = new Date().toISOString();
      if (!state.campaign.rewardsClaimed.includes(mission.id)) {
        state.career.xp = Math.max(0, Number(state.career.xp || 0) + Number(mission.reward.xp || 0));
        state.career.reputation = clamp(Number(state.career.reputation || 0) + Number(mission.reward.rep || 0), 0, 100);
        state.campaign.rewardsClaimed.push(mission.id);
        window.C190_Career?.addEvent?.(state, "campaign", "Missão de campanha concluída", `${mission.title}: +${mission.reward.xp} XP · +${mission.reward.rep} reputação`);
        window.C190_Career?.evaluate?.(state);
      }
    }
    report.campaignFirstCompletion = firstCompletion;
    report.campaignReward = firstCompletion ? clone(mission.reward) : null;
    state.campaign.history.unshift({
      at: new Date().toISOString(),
      type: passed ? "complete" : "retry",
      missionId: mission.id,
      title: mission.title,
      score,
      grade: report.grade,
      detail: passed ? `Concluída com nota ${report.grade} (${score}/100).` : `Repetir recomendável: ${score}/100, mínimo ${mission.minScore}.`,
    });
    state.campaign.history = state.campaign.history.slice(0, 80);
    return { mission, passed, firstCompletion };
  }

  function summary(state) {
    normalize(state);
    const completed = state.campaign.completed.length;
    const total = missions.length;
    const next = nextMission(state);
    const bestAverage = missions.reduce((sum, mission) => sum + Number(state.campaign.bestScores[mission.id] || 0), 0) / Math.max(1, missions.filter((m) => Number(state.campaign.bestScores[m.id] || 0) > 0).length || 1);
    return {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
      next,
      bestAverage: Math.round(bestAverage) || 0,
      attempts: Object.values(state.campaign.attempts).reduce((sum, value) => sum + Number(value || 0), 0),
    };
  }

  return {
    VERSION,
    CAMPAIGN_VERSION,
    missions: clone(missions),
    defaultCampaign,
    normalize,
    summary,
    missionById,
    statusFor,
    unlocked,
    lockReason,
    nextMission,
    launch,
    onShiftEnded,
  };
})();
