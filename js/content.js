window.C190_Content = (() => {
  "use strict";

  const VERSION = "0.21.0";
  const REGISTRY_VERSION = 1;

  const cities = [
    { id: "sp", name: "São Paulo — SP", center: { lat: -23.55052, lng: -46.63331 }, unlockShifts: 0, icon: "SP", profile: "Metrópole densa, grande volume e ocorrências simultâneas.", tags: ["urban", "traffic", "domestic"] },
    { id: "rio", name: "Rio de Janeiro — RJ", center: { lat: -22.90685, lng: -43.1729 }, unlockShifts: 0, icon: "RJ", profile: "Áreas turísticas, morros, vias expressas e grandes eventos.", tags: ["urban", "tourism", "event"] },
    { id: "brasilia", name: "Brasília — DF", center: { lat: -15.79389, lng: -47.88278 }, unlockShifts: 0, icon: "DF", profile: "Eixos rodoviários, prédios públicos e grandes distâncias.", tags: ["government", "traffic", "urban"] },
    { id: "bh", name: "Belo Horizonte — MG", center: { lat: -19.91668, lng: -43.93449 }, unlockShifts: 0, icon: "BH", profile: "Relevo urbano, anel rodoviário e bairros de alta densidade.", tags: ["urban", "traffic", "neighborhood"] },
    { id: "recife", name: "Recife — PE", center: { lat: -8.04756, lng: -34.877 }, unlockShifts: 0, icon: "RE", profile: "Pontes, alagamentos sazonais e grande fluxo costeiro.", tags: ["flood", "tourism", "urban"] },
    { id: "poa", name: "Porto Alegre — RS", center: { lat: -30.03465, lng: -51.21766 }, unlockShifts: 0, icon: "POA", profile: "Corredores metropolitanos, clima severo e áreas ribeirinhas.", tags: ["weather", "flood", "urban"] },
    { id: "salvador", name: "Salvador — BA", center: { lat: -12.97775, lng: -38.50163 }, unlockShifts: 8, icon: "SSA", profile: "Centro histórico, encostas, turismo e grandes festas populares.", tags: ["tourism", "event", "hills"] },
    { id: "curitiba", name: "Curitiba — PR", center: { lat: -25.4284, lng: -49.2733 }, unlockShifts: 12, icon: "CWB", profile: "Rede viária estruturada, frio intenso e integração metropolitana.", tags: ["weather", "traffic", "urban"] },
    { id: "manaus", name: "Manaus — AM", center: { lat: -3.11903, lng: -60.02173 }, unlockShifts: 18, icon: "MAO", profile: "Grandes rios, áreas remotas e logística operacional singular.", tags: ["river", "remote", "urban"] },
  ];

  const specialCases = [
    {
      id: "linha_segura",
      icon: "☎",
      name: "Operação Linha Segura",
      desc: "Uma sequência conectada de chamadas de violência doméstica exige comunicação discreta, proteção e coordenação.",
      minRank: 0,
      cityId: "sp",
      templateIds: ["domestic_silent", "threat_street", "child_risk", "weapon_report", "domestic_return"],
      reward: { xp: 550, rep: 4 },
    },
    {
      id: "tempestade",
      icon: "☂",
      name: "Noite de Tempestade",
      desc: "Alagamentos, queda de energia e acidentes elevam a pressão sobre toda a central.",
      minRank: 1,
      cityId: "recife",
      templateIds: ["flood_vehicle", "power_outage", "traffic_victim", "tree_road", "missing_flood"],
      reward: { xp: 700, rep: 5 },
    },
    {
      id: "estadio",
      icon: "◎",
      name: "Final no Estádio",
      desc: "Multidão, criança perdida, tumulto e emergência médica em um evento de grande porte.",
      minRank: 2,
      cityId: "rio",
      templateIds: ["event_crowd", "missing_child", "fight_event", "medical_event", "traffic_event"],
      reward: { xp: 900, rep: 6 },
    },
    {
      id: "cerco_bancario",
      icon: "◆",
      name: "Cerco Bancário",
      desc: "Ocorrência crítica com reféns, informações incompletas e múltiplas equipes em deslocamento.",
      minRank: 3,
      cityId: "bh",
      templateIds: ["bank_alarm", "hostage_report", "suspect_vehicle", "perimeter_conflict", "negotiation_update"],
      reward: { xp: 1250, rep: 8 },
    },
    {
      id: "apagao",
      icon: "⚡",
      name: "Apagão Metropolitano",
      desc: "Falha elétrica regional produz elevadores parados, semáforos inoperantes e chamadas simultâneas.",
      minRank: 4,
      cityId: "poa",
      templateIds: ["power_outage", "elevator_trapped", "traffic_blackout", "hospital_generator", "looting_risk", "fire_electrical"],
      reward: { xp: 1600, rep: 10 },
    },

    {
      id: "trama_urbana",
      icon: "◇",
      name: "Trama Urbana",
      desc: "Casos realistas conectam escola, ônibus retido, shopping em pânico e roubo recém-ocorrido, exigindo leitura cuidadosa de boatos e fatos.",
      minRank: 2,
      cityId: "sp",
      templateIds: ["school_gate_threat", "bus_hijack_partial", "mall_panic", "market_robbery_after", "false_call_pattern"],
      reward: { xp: 1200, rep: 7 },
    },
    {
      id: "fronteira_resgate",
      icon: "△",
      name: "Fronteira de Resgate",
      desc: "Atendimento complexo em áreas remotas, encostas, rios e área rural com referência difícil e risco real de despacho errado.",
      minRank: 3,
      cityId: "manaus",
      templateIds: ["river_child_missing", "landslide_home", "rural_domestic_shot", "factory_smoke", "gas_leak_building"],
      reward: { xp: 1450, rep: 8 },
    },  ];

  const dailyDeck = [
    { id: "daily_resolve", name: "Linha sem falhas", desc: "Resolva 3 ocorrências hoje.", metric: "resolved", target: 3, reward: { xp: 220, rep: 2 } },
    { id: "daily_score", name: "Plantão de excelência", desc: "Conclua um plantão com nota 80 ou superior.", metric: "score80", target: 1, reward: { xp: 260, rep: 2 } },
    { id: "daily_critical", name: "Resposta prioritária", desc: "Resolva 2 ocorrências críticas.", metric: "criticalResolved", target: 2, reward: { xp: 280, rep: 3 } },
    { id: "daily_clean", name: "Conduta impecável", desc: "Conclua um plantão sem falhas nem abandonos.", metric: "perfect", target: 1, reward: { xp: 300, rep: 3 } },
  ];

  const weeklyDeck = [
    { id: "weekly_shifts", name: "Semana de prontidão", desc: "Conclua 5 plantões válidos na semana.", metric: "shifts", target: 5, reward: { xp: 650, rep: 5 } },
    { id: "weekly_resolve", name: "Central produtiva", desc: "Resolva 15 ocorrências durante a semana.", metric: "resolved", target: 15, reward: { xp: 720, rep: 5 } },
    { id: "weekly_perfect", name: "Padrão ouro", desc: "Conclua 2 plantões perfeitos na semana.", metric: "perfect", target: 2, reward: { xp: 800, rep: 6 } },
    { id: "weekly_cities", name: "Cobertura nacional", desc: "Atue em 3 módulos de cidade diferentes.", metric: "cities", target: 3, reward: { xp: 850, rep: 6 } },
  ];

  const expansionRegistry = [
    { id: "city_pack_south", name: "Pacote Sul", type: "city-pack", api: 1, status: "slot-ready", detail: "Estrutura pronta para Florianópolis, Londrina e Caxias do Sul." },
    { id: "special_ops_pack", name: "Operações Especiais", type: "case-pack", api: 1, status: "slot-ready", detail: "Aceita campanhas conectadas, recompensas e requisitos de patente." },
    { id: "voice_pack", name: "Vozes e Rádio", type: "media-pack", api: 1, status: "future", detail: "Reserva técnica para áudio localizado e comunicação de rádio." },
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function localDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function weekKey(date = new Date()) {
    const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = value.getDay() || 7;
    value.setDate(value.getDate() + 4 - day);
    const yearStart = new Date(value.getFullYear(), 0, 1);
    const week = Math.ceil(((value - yearStart) / 86400000 + 1) / 7);
    return `${value.getFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  function hash(text) {
    let result = 2166136261;
    for (let i = 0; i < text.length; i++) {
      result ^= text.charCodeAt(i);
      result = Math.imul(result, 16777619);
    }
    return result >>> 0;
  }

  function challengeRecord(deck, key, kind) {
    const def = deck[hash(`${kind}:${key}`) % deck.length];
    return { key, id: def.id, progress: 0, claimed: false, completedAt: null, cityIds: [] };
  }

  function defaultContent() {
    return {
      registryVersion: REGISTRY_VERSION,
      activeCityId: "sp",
      lastMode: "career",
      stats: {
        totalPlaySeconds: 0,
        totalReports: 0,
        bestScore: 0,
        bestResolved: 0,
        totalResolved: 0,
        totalFailed: 0,
        totalAbandoned: 0,
        criticalResolved: 0,
        perfectShifts: 0,
        modeCounts: {},
        gradeCounts: {},
        cityStats: {},
      },
      challenges: {
        daily: challengeRecord(dailyDeck, localDateKey(), "daily"),
        weekly: challengeRecord(weeklyDeck, weekKey(), "weekly"),
      },
      special: { completed: [], attempts: {}, bestScores: {} },
      sandbox: {
        callCount: 5,
        arrivalGap: 12,
        penalties: false,
        priorityMix: "mixed",
        cityId: "sp",
        templateSet: "all",
      },
      expansions: { enabled: [], installed: [], rejected: [] },
    };
  }

  function normalize(state) {
    const base = defaultContent();
    const source = state.content && typeof state.content === "object" ? state.content : {};
    state.content = {
      ...base,
      ...source,
      stats: { ...base.stats, ...(source.stats || {}) },
      challenges: { ...base.challenges, ...(source.challenges || {}) },
      special: { ...base.special, ...(source.special || {}) },
      sandbox: { ...base.sandbox, ...(source.sandbox || {}) },
      expansions: { ...base.expansions, ...(source.expansions || {}) },
    };
    state.content.stats.modeCounts = { ...(source.stats?.modeCounts || {}) };
    state.content.stats.gradeCounts = { ...(source.stats?.gradeCounts || {}) };
    state.content.stats.cityStats = { ...(source.stats?.cityStats || {}) };
    state.content.special.completed = Array.isArray(source.special?.completed) ? source.special.completed : [];
    state.content.special.attempts = { ...(source.special?.attempts || {}) };
    state.content.special.bestScores = { ...(source.special?.bestScores || {}) };
    state.content.expansions.enabled = Array.isArray(source.expansions?.enabled) ? source.expansions.enabled : [];
    state.content.expansions.installed = Array.isArray(source.expansions?.installed) ? source.expansions.installed : [];
    state.content.expansions.rejected = Array.isArray(source.expansions?.rejected) ? source.expansions.rejected : [];
    state.content.registryVersion = REGISTRY_VERSION;
    ensureChallenges(state);
    if (!cities.some((city) => city.id === state.content.activeCityId)) state.content.activeCityId = "sp";
    return state.content;
  }

  function cityById(id) {
    return cities.find((city) => city.id === id) || cities[0];
  }

  function cityUnlocked(state, city) {
    return Number(state.career?.totalShifts || 0) >= city.unlockShifts;
  }

  function selectCity(state, id, force = false) {
    normalize(state);
    const city = cityById(id);
    if (!force && !cityUnlocked(state, city)) return { ok: false, reason: "locked", city };
    if (state.dispatch?.shift?.active) return { ok: false, reason: "active_shift", city };
    state.content.activeCityId = city.id;
    state.content.sandbox.cityId = city.id;
    state.settings.mapCenter = { ...city.center, label: city.name };
    return { ok: true, city };
  }

  function ensureChallenges(state, now = new Date()) {
    const content = state.content || (state.content = defaultContent());
    const dailyKey = localDateKey(now);
    const weeklyKey = weekKey(now);
    if (!content.challenges?.daily || content.challenges.daily.key !== dailyKey) {
      content.challenges = content.challenges || {};
      content.challenges.daily = challengeRecord(dailyDeck, dailyKey, "daily");
    }
    if (!content.challenges?.weekly || content.challenges.weekly.key !== weeklyKey) {
      content.challenges = content.challenges || {};
      content.challenges.weekly = challengeRecord(weeklyDeck, weeklyKey, "weekly");
    }
    return content.challenges;
  }

  function challengeDef(kind, record) {
    const deck = kind === "daily" ? dailyDeck : weeklyDeck;
    return deck.find((item) => item.id === record.id) || deck[0];
  }

  function challengeValue(def, record, report) {
    if (def.metric === "resolved") return record.progress + report.resolved;
    if (def.metric === "shifts") return record.progress + 1;
    if (def.metric === "perfect") return record.progress + (report.failed === 0 && report.abandoned === 0 ? 1 : 0);
    if (def.metric === "score80") return Math.max(record.progress, report.score >= 80 ? 1 : 0);
    if (def.metric === "criticalResolved") {
      const amount = report.calls.filter((call) => call.priority === 3 && call.status === "resolved").length;
      return record.progress + amount;
    }
    if (def.metric === "cities") {
      record.cityIds = [...new Set([...(record.cityIds || []), report.cityId || "sp"] )];
      return record.cityIds.length;
    }
    return record.progress;
  }

  function updateChallenges(state, report) {
    const challenges = ensureChallenges(state);
    for (const kind of ["daily", "weekly"]) {
      const record = challenges[kind];
      if (record.claimed) continue;
      const def = challengeDef(kind, record);
      record.progress = clamp(challengeValue(def, record, report), 0, def.target);
      if (record.progress >= def.target && !record.completedAt) record.completedAt = new Date().toISOString();
    }
  }

  function claimChallenge(state, kind) {
    normalize(state);
    const record = state.content.challenges[kind];
    if (!record) return { ok: false, reason: "missing" };
    const def = challengeDef(kind, record);
    if (record.claimed || record.progress < def.target) return { ok: false, reason: "not_ready", def, record };
    record.claimed = true;
    state.career.xp += def.reward.xp;
    state.career.reputation = clamp(state.career.reputation + def.reward.rep, 0, 100);
    window.C190_Career?.addEvent(state, "challenge", "Desafio concluído", `${def.name}: +${def.reward.xp} XP`);
    window.C190_Career?.evaluate(state);
    return { ok: true, def, record };
  }

  function onShiftEnded(state, report) {
    normalize(state);
    const stats = state.content.stats;
    stats.totalPlaySeconds += Number(report.duration || 0);
    stats.totalReports += 1;
    stats.bestScore = Math.max(stats.bestScore, Number(report.score || 0));
    stats.bestResolved = Math.max(stats.bestResolved, Number(report.resolved || 0));
    stats.totalResolved += Number(report.resolved || 0);
    stats.totalFailed += Number(report.failed || 0);
    stats.totalAbandoned += Number(report.abandoned || 0);
    stats.criticalResolved += report.calls.filter((call) => call.priority === 3 && call.status === "resolved").length;
    if (report.failed === 0 && report.abandoned === 0) stats.perfectShifts += 1;
    stats.modeCounts[report.mode || "career"] = (stats.modeCounts[report.mode || "career"] || 0) + 1;
    stats.gradeCounts[report.grade] = (stats.gradeCounts[report.grade] || 0) + 1;
    const cityId = report.cityId || state.content.activeCityId || "sp";
    const cityStats = stats.cityStats[cityId] || { shifts: 0, resolved: 0, bestScore: 0 };
    cityStats.shifts += 1;
    cityStats.resolved += report.resolved;
    cityStats.bestScore = Math.max(cityStats.bestScore, report.score);
    stats.cityStats[cityId] = cityStats;
    state.content.lastMode = report.mode || "career";

    if (report.affectsCareer !== false) updateChallenges(state, report);

    if (report.mode === "special" && report.specialId) {
      const special = specialCases.find((item) => item.id === report.specialId);
      state.content.special.attempts[report.specialId] = (state.content.special.attempts[report.specialId] || 0) + 1;
      state.content.special.bestScores[report.specialId] = Math.max(state.content.special.bestScores[report.specialId] || 0, report.score);
      if (special && report.score >= 70 && !state.content.special.completed.includes(report.specialId)) {
        state.content.special.completed.push(report.specialId);
        state.career.xp += special.reward.xp;
        state.career.reputation = clamp(state.career.reputation + special.reward.rep, 0, 100);
        window.C190_Career?.addEvent(state, "special", "Operação especial concluída", `${special.name}: +${special.reward.xp} XP`);
        window.C190_Career?.evaluate(state);
        report.specialFirstCompletion = true;
      }
    }
    window.C190_Career?.evaluate(state);
    return stats;
  }

  function launchCareer(state) {
    normalize(state);
    const city = cityById(state.content.activeCityId);
    return window.C190_Dispatch.startShift(state, {
      mode: "career",
      label: "Plantão de carreira",
      cityId: city.id,
      callCount: 3,
      affectsCareer: true,
    });
  }

  function launchChallenge(state, kind) {
    normalize(state);
    const city = cityById(state.content.activeCityId);
    return window.C190_Dispatch.startShift(state, {
      mode: kind === "weekly" ? "challenge_weekly" : "challenge_daily",
      label: kind === "weekly" ? "Desafio semanal" : "Desafio diário",
      cityId: city.id,
      callCount: kind === "weekly" ? 5 : 4,
      arrivalGap: kind === "weekly" ? 13 : 11,
      affectsCareer: true,
      challengeKind: kind,
    });
  }

  function launchSpecial(state, id) {
    normalize(state);
    const special = specialCases.find((item) => item.id === id);
    if (!special) return { ok: false, reason: "missing" };
    if ((window.C190_Career?.rankIndex(state.career.rankId) || 0) < special.minRank) return { ok: false, reason: "rank", special };
    const cityResult = selectCity(state, special.cityId, true);
    if (!cityResult.ok && cityResult.reason === "active_shift") return cityResult;
    const shift = window.C190_Dispatch.startShift(state, {
      mode: "special",
      label: special.name,
      cityId: special.cityId,
      templateIds: special.templateIds,
      callCount: special.templateIds.length,
      arrivalGap: 10,
      affectsCareer: true,
      specialId: special.id,
    });
    return { ok: !!shift, shift, special };
  }

  function launchSandbox(state, options = {}) {
    normalize(state);
    const sandbox = { ...state.content.sandbox, ...options };
    sandbox.callCount = clamp(Number(sandbox.callCount || 5), 1, 12);
    sandbox.arrivalGap = clamp(Number(sandbox.arrivalGap || 12), 4, 40);
    state.content.sandbox = sandbox;
    const cityResult = selectCity(state, sandbox.cityId, true);
    if (!cityResult.ok && cityResult.reason === "active_shift") return cityResult;
    const shift = window.C190_Dispatch.startShift(state, {
      mode: "sandbox",
      label: "Sandbox personalizado",
      cityId: sandbox.cityId,
      callCount: sandbox.callCount,
      arrivalGap: sandbox.arrivalGap,
      affectsCareer: false,
      penalties: !!sandbox.penalties,
      priorityMix: sandbox.priorityMix,
      templateSet: sandbox.templateSet,
    });
    return { ok: !!shift, shift };
  }

  function validateExpansion(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== "object") errors.push("manifest ausente");
    if (!manifest?.id || !/^[a-z0-9_-]{3,40}$/.test(manifest.id)) errors.push("id inválido");
    if (Number(manifest?.api) !== REGISTRY_VERSION) errors.push("API incompatível");
    if (!Array.isArray(manifest?.content)) errors.push("content deve ser lista");
    return { ok: errors.length === 0, errors };
  }

  function statsSummary(state) {
    normalize(state);
    const stats = state.content.stats;
    const totalDecisions = stats.totalResolved + stats.totalFailed + stats.totalAbandoned;
    return {
      ...clone(stats),
      successRate: totalDecisions ? Math.round((stats.totalResolved / totalDecisions) * 100) : 0,
      averageScore: state.dispatch.reports.length
        ? Math.round(state.dispatch.reports.reduce((sum, report) => sum + report.score, 0) / state.dispatch.reports.length)
        : 0,
      totalDecisions,
    };
  }

  return {
    VERSION,
    REGISTRY_VERSION,
    cities,
    specialCases,
    dailyDeck,
    weeklyDeck,
    expansionRegistry,
    defaultContent,
    normalize,
    cityById,
    cityUnlocked,
    selectCity,
    ensureChallenges,
    challengeDef,
    claimChallenge,
    onShiftEnded,
    launchCareer,
    launchChallenge,
    launchSpecial,
    launchSandbox,
    validateExpansion,
    statsSummary,
    localDateKey,
    weekKey,
  };
})();
