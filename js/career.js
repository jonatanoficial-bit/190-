window.C190_Career = (() => {
  "use strict";

  const ranks = [
    { id: "operador_iii", name: "Operador III", icon: "I", xp: 0, rep: 0, courses: 0, shifts: 0 },
    { id: "operador_ii", name: "Operador II", icon: "II", xp: 450, rep: 55, courses: 1, shifts: 2 },
    { id: "operador_i", name: "Operador I", icon: "III", xp: 1100, rep: 62, courses: 2, shifts: 5 },
    { id: "supervisor", name: "Supervisor de Plantão", icon: "S", xp: 2200, rep: 70, courses: 3, shifts: 9 },
    { id: "coordenador", name: "Coordenador Operacional", icon: "C", xp: 3900, rep: 78, courses: 4, shifts: 15 },
    { id: "inspetor", name: "Inspetor de Central", icon: "★", xp: 6200, rep: 86, courses: 5, shifts: 24 },
    { id: "comandante", name: "Comandante da Central", icon: "✦", xp: 9500, rep: 93, courses: 7, shifts: 36 },
  ];

  const courses = [
    { id: "comunicacao", icon: "◉", name: "Comunicação de crise", desc: "Melhora a coleta de informações e reduz penalidades por abordagem inadequada.", cost: 250, minRank: 0 },
    { id: "triagem", icon: "⌁", name: "Triagem e priorização", desc: "Aprimora a classificação de risco e o controle da fila.", cost: 420, minRank: 1 },
    { id: "violencia_domestica", icon: "⚖", name: "Atendimento à violência doméstica", desc: "Abordagem segura, acolhedora e orientada a protocolo.", cost: 620, minRank: 1 },
    { id: "gerenciamento", icon: "▦", name: "Gerenciamento de múltiplas ocorrências", desc: "Reduz impacto de chamadas simultâneas e melhora retomadas.", cost: 850, minRank: 2 },
    { id: "lideranca", icon: "♜", name: "Liderança operacional", desc: "Requisito para funções de supervisão e coordenação.", cost: 1200, minRank: 3 },
    { id: "negociacao", icon: "◇", name: "Negociação em alto risco", desc: "Aumenta a chance de resolução excelente em ocorrências críticas.", cost: 1450, minRank: 3 },
    { id: "auditoria", icon: "✓", name: "Auditoria e qualidade", desc: "Capacita para metas de excelência, conformidade e comando.", cost: 1800, minRank: 4 },
    { id: "geolocalizacao", icon: "⌖", name: "Geolocalização de emergência", desc: "Melhora a precisão do mapa, leitura de referência e redução de erro de endereço.", cost: 980, minRank: 2 },
    { id: "despacho_integrado", icon: "▣", name: "Despacho integrado PM/Bombeiros/SAMU", desc: "Aprimora seleção de recursos, despacho combinado e tempo de chegada.", cost: 1320, minRank: 3 },
    { id: "radio_operacional", icon: "◌", name: "Rádio operacional e comando de campo", desc: "Melhora decisões após o despacho, reforços, redirecionamento e encerramento.", cost: 1560, minRank: 4 },
  ];

  const specs = [
    { id: "despacho", icon: "☎", name: "Despacho Tático", desc: "Bônus de reputação em ocorrências críticas.", requires: ["triagem", "gerenciamento"] },
    { id: "acolhimento", icon: "♥", name: "Acolhimento e Proteção", desc: "Reduz advertências por comunicação e amplia recompensas sociais.", requires: ["comunicacao", "violencia_domestica"] },
    { id: "comando", icon: "★", name: "Comando Operacional", desc: "Acelera promoções e melhora avaliação de plantões.", requires: ["lideranca", "auditoria"] },
    { id: "negociador", icon: "◇", name: "Negociador de Crise", desc: "Bônus em decisões delicadas e cenários de alto risco.", requires: ["comunicacao", "negociacao"] },
  ];

  const achievements = [
    { id: "primeiro_turno", icon: "◷", name: "Primeiro Plantão", desc: "Conclua seu primeiro plantão.", test: (state) => state.career.totalShifts >= 1 },
    { id: "dez_ocorrencias", icon: "10", name: "Linha Quente", desc: "Resolva 10 ocorrências.", test: (state) => state.career.totalResolved >= 10 },
    { id: "cinquenta_ocorrencias", icon: "50", name: "Voz da Central", desc: "Resolva 50 ocorrências.", test: (state) => state.career.totalResolved >= 50 },
    { id: "turno_perfeito", icon: "★", name: "Turno Perfeito", desc: "Conclua um plantão sem falhas ou abandonos.", test: (state) => state.career.perfectShifts >= 1 },
    { id: "sem_advertencia", icon: "✓", name: "Conduta Exemplar", desc: "Chegue a 5 plantões sem advertências ativas.", test: (state) => state.career.totalShifts >= 5 && activeWarnings(state) === 0 },
    { id: "especialista", icon: "◆", name: "Especialista", desc: "Conclua uma especialização.", test: (state) => !!state.career.specialization },
    { id: "supervisor", icon: "S", name: "Liderança Reconhecida", desc: "Alcance a patente de Supervisor.", test: (state) => rankIndex(state.career.rankId) >= 3 },
    { id: "reputacao_90", icon: "90", name: "Confiança Pública", desc: "Alcance 90 pontos de reputação.", test: (state) => state.career.reputation >= 90 },
    { id: "todos_cursos", icon: "▣", name: "Formação Completa", desc: "Conclua todos os cursos.", test: (state) => state.career.completedCourses.length >= courses.length },
    { id: "comandante", icon: "✦", name: "Comando Máximo", desc: "Alcance a patente final.", test: (state) => state.career.rankId === "comandante" },
    { id: "tres_cidades", icon: "⌖", name: "Cobertura Regional", desc: "Conclua plantões em três cidades.", test: (state) => Object.keys(state.content?.stats?.cityStats || {}).length >= 3 },
    { id: "sandbox_cinco", icon: "∞", name: "Laboratório Operacional", desc: "Conclua cinco sessões de Sandbox.", test: (state) => Number(state.content?.stats?.modeCounts?.sandbox || 0) >= 5 },
    { id: "especial_tres", icon: "◆", name: "Força-Tarefa", desc: "Conclua três operações especiais.", test: (state) => (state.content?.special?.completed || []).length >= 3 },
    { id: "desafio_duplo", icon: "✓", name: "Rotina de Elite", desc: "Resgate as recompensas diária e semanal.", test: (state) => !!state.content?.challenges?.daily?.claimed && !!state.content?.challenges?.weekly?.claimed },
    { id: "cem_relatorios", icon: "100", name: "Central Incansável", desc: "Registre cem relatórios de todos os modos.", test: (state) => Number(state.content?.stats?.totalReports || 0) >= 100 },
    { id: "certificacao_tripla", icon: "EDU", name: "Operador Certificado", desc: "Conquiste três certificações práticas da Academia 190.", test: (state) => (state.training?.certificates || []).length >= 3 },
    { id: "instrutor_qualidade", icon: "QA", name: "Instrutor de Qualidade", desc: "Alcance nota máxima em uma simulação de treinamento.", test: (state) => Number(state.training?.stats?.bestScore || 0) >= 95 },
  ];

  const goalDefs = [
    { id: "resolve_5", name: "Atendimento consistente", desc: "Resolva 5 ocorrências.", target: 5, metric: (state) => state.career.totalResolved, reward: { xp: 220, rep: 2 } },
    { id: "complete_3_shifts", name: "Ritmo de plantão", desc: "Conclua 3 plantões.", target: 3, metric: (state) => state.career.totalShifts, reward: { xp: 300, rep: 3 } },
    { id: "take_2_courses", name: "Capacitação contínua", desc: "Conclua 2 cursos.", target: 2, metric: (state) => state.career.completedCourses.length, reward: { xp: 380, rep: 3 } },
    { id: "streak_6", name: "Sequência segura", desc: "Alcance 6 resoluções corretas seguidas.", target: 6, metric: (state) => state.career.bestStreak, reward: { xp: 450, rep: 4 } },
    { id: "reach_rep_75", name: "Confiança institucional", desc: "Alcance 75 de reputação.", target: 75, metric: (state) => state.career.reputation, reward: { xp: 550, rep: 0 } },
    { id: "perfect_2", name: "Excelência operacional", desc: "Conclua 2 plantões perfeitos.", target: 2, metric: (state) => state.career.perfectShifts, reward: { xp: 700, rep: 5 } },
  ];

  const clamp = (number, min, max) => Math.max(min, Math.min(max, number));

  function rankIndex(id) {
    return Math.max(0, ranks.findIndex((rank) => rank.id === id));
  }

  function activeWarnings(state) {
    const now = Date.now();
    return state.career.warnings.filter(
      (warning) =>
        !warning.expired &&
        (!warning.expiresAt || new Date(warning.expiresAt).getTime() > now),
    ).length;
  }

  function addEvent(state, type, title, detail) {
    state.career.events.unshift({
      id: crypto.randomUUID?.() || String(Date.now() + Math.random()),
      at: new Date().toISOString(),
      type,
      title,
      detail,
    });
    state.career.events = state.career.events.slice(0, 80);
  }

  function applyOutcome(
    state,
    { quality = 0, xp = 0, rep = 0, resolved = false, failed = false, abandoned = false, reason = "" },
  ) {
    const difficulty = state.profile?.difficulty || "realista";
    const multiplier = difficulty === "especialista" ? 1.2 : difficulty === "assistido" ? 0.85 : 1;
    state.career.xp = Math.max(0, state.career.xp + Math.round(xp * multiplier));
    state.career.reputation = clamp(state.career.reputation + rep, 0, 100);
    state.career.decisionScore += quality;
    state.career.decisionCount++;
    if (resolved) {
      state.career.totalResolved++;
      state.career.streak++;
      state.career.bestStreak = Math.max(state.career.bestStreak, state.career.streak);
    }
    if (failed) {
      state.career.totalFailed++;
      state.career.streak = 0;
    }
    if (abandoned) {
      state.career.totalAbandoned++;
      state.career.streak = 0;
    }
    if (reason) addEvent(state, quality >= 1 ? "success" : "warning", quality >= 1 ? "Ocorrência resolvida" : "Desempenho afetado", reason);
    if (quality <= -2) issueWarning(state, "Falha de protocolo", reason || "Decisão incompatível com o protocolo operacional.", 3);
    evaluate(state);
  }

  function issueWarning(state, title, reason, durationShifts = 3) {
    const existing = state.career.warnings.find((warning) => !warning.expired && warning.title === title);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      existing.remainingShifts = Math.max(existing.remainingShifts || 0, durationShifts);
    } else {
      state.career.warnings.push({
        id: crypto.randomUUID?.() || String(Date.now()),
        title,
        reason,
        issuedAt: new Date().toISOString(),
        remainingShifts: durationShifts,
        expired: false,
        count: 1,
      });
    }
    state.career.reputation = clamp(state.career.reputation - 3, 0, 100);
    addEvent(state, "danger", "Advertência recebida", title);
  }

  function decayWarnings(state) {
    state.career.warnings.forEach((warning) => {
      if (!warning.expired) {
        warning.remainingShifts = (warning.remainingShifts ?? 1) - 1;
        if (warning.remainingShifts <= 0) {
          warning.expired = true;
          addEvent(state, "success", "Advertência encerrada", warning.title);
        }
      }
    });
  }

  function getPromotionStatus(state) {
    const currentIndex = rankIndex(state.career.rankId);
    const next = ranks[currentIndex + 1];
    if (!next) return { next: null, eligible: false, requirements: [] };
    const requirements = [
      { label: `${next.xp} XP`, ok: state.career.xp >= next.xp },
      { label: `Reputação ${next.rep}`, ok: state.career.reputation >= next.rep },
      { label: `${next.courses} curso(s)`, ok: state.career.completedCourses.length >= next.courses },
      { label: `${next.shifts} plantão(ões)`, ok: state.career.totalShifts >= next.shifts },
      { label: "Sem advertência ativa", ok: activeWarnings(state) === 0 },
    ];
    return { next, eligible: requirements.every((requirement) => requirement.ok), requirements };
  }

  function promoteIfEligible(state) {
    const promotion = getPromotionStatus(state);
    if (promotion.eligible && promotion.next) {
      const old = ranks[rankIndex(state.career.rankId)];
      state.career.rankId = promotion.next.id;
      state.career.promotions++;
      state.career.reputation = clamp(state.career.reputation + 4, 0, 100);
      addEvent(state, "promotion", "Promoção confirmada", `${old.name} → ${promotion.next.name}`);
      return promotion.next;
    }
    return null;
  }

  function completeCourse(state, id) {
    const course = courses.find((item) => item.id === id);
    if (!course || state.career.completedCourses.includes(id)) return { ok: false, reason: "indisponivel" };
    if (rankIndex(state.career.rankId) < course.minRank) return { ok: false, reason: "patente" };
    if (state.career.xp < course.cost) return { ok: false, reason: "xp" };
    state.career.xp -= course.cost;
    state.career.completedCourses.push(id);
    state.career.reputation = clamp(state.career.reputation + 2, 0, 100);
    addEvent(state, "course", "Curso concluído", course.name);
    evaluate(state);
    return { ok: true, course, promotion: promoteIfEligible(state) };
  }

  function selectSpecialization(state, id) {
    const specialization = specs.find((item) => item.id === id);
    if (!specialization) return false;
    if (!specialization.requires.every((required) => state.career.completedCourses.includes(required))) return false;
    state.career.specialization = id;
    state.career.reputation = clamp(state.career.reputation + 3, 0, 100);
    addEvent(state, "specialization", "Especialização definida", specialization.name);
    evaluate(state);
    return true;
  }

  function evaluateGoals(state) {
    goalDefs.forEach((goal) => {
      const record = state.career.goals[goal.id] || { claimed: false };
      const value = Math.min(goal.target, goal.metric(state));
      if (value >= goal.target && !record.claimed) {
        record.claimed = true;
        record.completedAt = new Date().toISOString();
        state.career.xp += goal.reward.xp;
        state.career.reputation = clamp(state.career.reputation + goal.reward.rep, 0, 100);
        addEvent(state, "goal", "Meta concluída", `${goal.name}: +${goal.reward.xp} XP`);
      }
      record.value = value;
      state.career.goals[goal.id] = record;
    });
  }

  function evaluateAchievements(state) {
    achievements.forEach((achievement) => {
      if (!state.career.achievements.includes(achievement.id) && achievement.test(state)) {
        state.career.achievements.push(achievement.id);
        addEvent(state, "achievement", "Conquista desbloqueada", achievement.name);
      }
    });
  }

  function evaluate(state) {
    evaluateGoals(state);
    evaluateAchievements(state);
    return promoteIfEligible(state);
  }

  function endShift(state, report) {
    state.career.totalShifts++;
    if (report.failed === 0 && report.abandoned === 0) state.career.perfectShifts++;
    decayWarnings(state);
    state.dispatch.reports.unshift(report);
    state.dispatch.reports = state.dispatch.reports.slice(0, 60);
    addEvent(state, report.failed === 0 ? "success" : "warning", "Plantão concluído", `${report.resolved} resolvidas · nota ${report.grade}`);
    return evaluate(state);
  }

  function performance(state) {
    const average = state.career.decisionCount ? state.career.decisionScore / state.career.decisionCount : 0;
    return {
      avg: average,
      service: clamp(Math.round(70 + average * 10), 0, 100),
      discipline: clamp(100 - activeWarnings(state) * 18, 0, 100),
      reputation: state.career.reputation,
      training: Math.round((state.career.completedCourses.length / courses.length) * 100),
    };
  }

  return {
    ranks,
    courses,
    specs,
    achievements,
    goalDefs,
    rankIndex,
    activeWarnings,
    addEvent,
    applyOutcome,
    issueWarning,
    decayWarnings,
    getPromotionStatus,
    promoteIfEligible,
    completeCourse,
    selectSpecialization,
    evaluate,
    endShift,
    performance,
  };
})();
