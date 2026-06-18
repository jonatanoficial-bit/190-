window.C190_CallProtocol = (() => {
  "use strict";

  const VERSION = 2;

  const QUESTION_BANK = [
    { id: "neighborhood", label: "Qual bairro ou setor da cidade?", short: "Bairro/setor", field: "neighborhood", category: "localização", score: 2, confidence: 0.25 },
    { id: "street", label: "Qual rua, avenida ou local principal?", short: "Rua/local", field: "street", category: "localização", score: 3, confidence: 0.55 },
    { id: "number", label: "Consegue confirmar número, bloco, portão ou complemento?", short: "Número", field: "number", category: "localização", score: 2, confidence: 0.20 },
    { id: "address", label: "Qual é o endereço completo?", short: "Endereço", field: "address", category: "localização", score: 3, confidence: 0.55, essential: true },
    { id: "reference", label: "Tem ponto de referência ou bairro?", short: "Referência", field: "reference", category: "localização", score: 2, confidence: 0.25 },
    { id: "situation", label: "O que exatamente está acontecendo agora?", short: "Situação", field: "situation", category: "triagem", score: 3, essential: true },
    { id: "caller", label: "Seu nome e telefone para retorno?", short: "Dados do chamador", field: "caller", category: "registro", score: 1 },
    { id: "victims", label: "Há feridos, crianças, idosos ou alguém em risco?", short: "Vítimas", field: "victims", category: "risco", score: 3 },
    { id: "weapons", label: "Existe arma, ameaça imediata ou agressor no local?", short: "Arma/ameaça", field: "weapons", category: "risco", score: 3 },
    { id: "aggressor", label: "O suspeito/agressor ainda está no local?", short: "Suspeito no local", field: "aggressor", category: "risco", score: 2 },
    { id: "safety", label: "Você está em local seguro para continuar falando?", short: "Segurança", field: "safety", category: "proteção", score: 2 },
    { id: "people", label: "Quantas pessoas ou veículos estão envolvidos?", short: "Quantidade", field: "people", category: "triagem", score: 1 },
    { id: "medical", label: "A vítima respira, está consciente ou sangrando?", short: "Estado clínico", field: "medical", category: "médico", score: 2 },
    { id: "hazards", label: "Há fogo, fumaça, fios, gás, água ou risco de explosão?", short: "Riscos ambientais", field: "hazards", category: "bombeiros", score: 2 },
    { id: "calm", label: "Mantenha distância segura e siga minhas orientações.", short: "Orientação segura", field: "calm", category: "acolhimento", score: 2 },
    { id: "irrelevant_story", label: "Conte tudo desde o começo, mesmo o que não for urgente.", short: "Pergunta improdutiva", field: "irrelevant", category: "erro", score: -2, mistake: "Perdeu tempo com relato longo antes da triagem essencial." },
    { id: "unsafe_confront", label: "Você consegue se aproximar para confirmar melhor?", short: "Orientação perigosa", field: "unsafe", category: "erro", score: -5, mistake: "Orientou o chamador a se expor ao risco." },
    { id: "delay", label: "Ligue novamente se piorar, por enquanto vou aguardar.", short: "Atraso indevido", field: "delay", category: "erro", score: -6, mistake: "Atrasou uma ocorrência sem coletar dados mínimos." },
  ];

  const QUESTION_MAP = Object.fromEntries(QUESTION_BANK.map((q) => [q.id, q]));

  const openings = {
    protection: "Moço, preciso de ajuda agora. Tem uma pessoa ameaçando aqui e eu não sei o que fazer!",
    traffic: "Alô, aconteceu um acidente aqui, tem gente caída e os carros estão parando no meio da via!",
    health: "Por favor, tem uma pessoa passando mal, eu não sei se ela está respirando direito!",
    fire: "Tem fumaça e muita gente gritando. Eu não sei se é incêndio, mas está perigoso!",
    critical: "A situação está muito tensa aqui. Tem risco para várias pessoas e ninguém sabe o que fazer!",
    infrastructure: "O problema começou de repente e está colocando a rua em risco. Preciso falar com alguém da emergência!",
    remote: "Estou em uma área afastada, o sinal está ruim e precisamos de resgate.",
    weather: "A chuva piorou muito, tem risco para as casas e o pessoal está com medo.",
    default: "Alô, preciso de uma viatura ou de alguém da emergência. Não sei explicar direito, mas é urgente!",
  };

  const referencePool = [
    "em frente a uma farmácia 24h",
    "perto de uma escola municipal",
    "ao lado de um mercado grande",
    "na esquina com uma praça",
    "próximo ao ponto final de ônibus",
    "perto de um posto de combustível",
  ];

  const callerNames = ["Marcos", "Luciana", "Rafael", "Ana", "Daniel", "Sônia", "Carlos", "Patrícia"];

  function seedFrom(text) {
    let value = 0;
    String(text || "central190").split("").forEach((char) => {
      value = (value * 31 + char.charCodeAt(0)) >>> 0;
    });
    return value || 17;
  }

  function pick(list, seed) {
    return list[Math.abs(seed) % list.length];
  }

  function categoryOf(call) {
    if (call?.category) return call.category;
    if (call?.tags?.includes("traffic")) return "traffic";
    if (call?.tags?.includes("weather")) return "weather";
    return "default";
  }

  function requiredQuestions(call) {
    const category = categoryOf(call);
    const tags = call?.tags || [];
    const required = new Set(["address", "situation"]);
    if ((Number(call?.priority) || 1) >= 2) required.add("victims");
    if (["protection", "critical"].includes(category) || tags.includes("domestic")) {
      required.add("weapons");
      required.add("safety");
    }
    if (["traffic", "health"].includes(category) || tags.includes("traffic")) required.add("medical");
    if (["fire", "infrastructure", "weather", "remote"].includes(category) || tags.includes("weather")) required.add("hazards");
    return [...required];
  }

  function profileFor(call) {
    const seed = seedFrom(`${call?.templateId || call?.id}-${call?.type}-${call?.location}`);
    const category = categoryOf(call);
    const reference = pick(referencePool, seed + 3);
    const caller = pick(callerNames, seed + 7);
    const location = call?.location || "local não informado";
    const type = call?.type || "ocorrência";
    const priority = Number(call?.priority || 1);
    const base = {
      address: `Estou em ${location}. O número não sei confirmar, mas é ${reference}.`,
      reference: `É ${reference}. Estou no setor ${call?.region || "da cidade"}.`,
      situation: `Parece ser ${type.toLowerCase()}. Está acontecendo agora e as pessoas estão nervosas.`,
      caller: `Meu nome é ${caller}. O telefone é o mesmo desta ligação.`,
      victims: priority >= 3 ? "Sim, há pessoa em risco e talvez ferida. Precisa mandar apoio rápido." : "Não vi ferido grave, mas tem gente assustada e a situação pode piorar.",
      weapons: ["protection", "critical"].includes(category) || call?.tags?.includes("domestic") ? "Pode ter arma ou objeto perigoso. O suspeito ainda está alterado." : "Não vi arma, mas não consigo garantir; tem muita confusão.",
      aggressor: ["protection", "critical"].includes(category) || call?.tags?.includes("domestic") ? "Sim, a pessoa ainda está por perto e pode voltar para cima da vítima." : "Não sei identificar suspeito; há várias pessoas olhando.",
      safety: "Estou tentando ficar afastado. Se eu falar baixo é porque tem gente por perto.",
      people: priority >= 3 ? "Pelo menos três pessoas envolvidas, talvez mais curiosos chegando." : "Duas ou três pessoas diretamente envolvidas.",
      medical: ["traffic", "health"].includes(category) || call?.tags?.includes("traffic") ? "Uma pessoa parece machucada e está reclamando de dor. Não sei avaliar respiração direito." : "Não sei dizer, mas não ouvi queixa médica grave ainda.",
      hazards: ["fire", "infrastructure", "weather", "remote"].includes(category) || call?.tags?.includes("weather") ? "Tem risco no ambiente: fumaça, fios, água ou área instável. Não dá para aproximar." : "Não vejo fogo ou vazamento, mas a rua está movimentada.",
      calm: "Entendi. Vou manter distância, não vou confrontar ninguém e vou ficar na linha se for seguro.",
      irrelevant: "Eu posso contar, mas vai demorar... tem muita coisa antiga nessa história.",
      unsafe: "Não, eu não quero chegar perto. Isso parece perigoso.",
      delay: "Moço, não dá para esperar. A situação pode piorar agora.",
    };
    const locationProfile = window.C190_LocationIntel?.enrichProfile?.(call) || {};
    return { ...base, ...locationProfile, opening: openings[category] || openings.default };
  }

  function create(call) {
    const profile = profileFor(call);
    const required = requiredQuestions(call);
    return {
      version: VERSION,
      opening: profile.opening,
      profile,
      required,
      asked: [],
      collected: {},
      mistakes: [],
      score: 0,
      maxScore: 18,
      locationConfidence: 0,
      completed: false,
      evaluation: null,
      transcript: [
        { role: "caller", text: profile.opening, at: new Date().toISOString() },
      ],
    };
  }

  function normalize(call) {
    if (!call) return null;
    if (!call.protocol || call.protocol.version !== VERSION) {
      const existing = call.protocol || {};
      call.protocol = { ...create(call), ...existing, version: VERSION };
      call.protocol.profile = { ...profileFor(call), ...(existing.profile || {}) };
      call.protocol.profile = { ...call.protocol.profile, ...(window.C190_LocationIntel?.enrichProfile?.(call) || {}) };
      call.protocol.required = Array.isArray(existing.required) && existing.required.length ? existing.required : requiredQuestions(call);
      call.protocol.asked = Array.isArray(existing.asked) ? existing.asked : [];
      call.protocol.transcript = Array.isArray(existing.transcript) && existing.transcript.length ? existing.transcript : create(call).transcript;
      call.protocol.collected = existing.collected && typeof existing.collected === "object" ? existing.collected : {};
      call.protocol.mistakes = Array.isArray(existing.mistakes) ? existing.mistakes : [];
      call.protocol.locationConfidence = Number(existing.locationConfidence || 0);
      call.protocol.score = Number(existing.score || 0);
    }
    return call.protocol;
  }

  function ask(state, callId, questionId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    const protocol = normalize(call);
    const question = QUESTION_MAP[questionId];
    if (!question) return { ok: false, reason: "question_not_found" };
    if (protocol.asked.includes(questionId)) return { ok: false, reason: "already_asked" };

    protocol.asked.push(questionId);
    protocol.score += question.score;
    const answer = protocol.profile[question.field] || "Não consegui responder com clareza.";
    const now = new Date().toISOString();
    protocol.transcript.push({ role: "operator", text: question.label, at: now, score: question.score });
    protocol.transcript.push({ role: "caller", text: answer, at: now });

    if (question.score > 0) {
      protocol.collected[question.id] = answer;
      if (["neighborhood", "street", "number", "address", "reference"].includes(question.id)) {
        protocol.locationConfidence = Math.min(1, Math.max(protocol.locationConfidence || 0, question.confidence || 0.2));
        window.C190_LocationIntel?.normalize?.(call);
      }
    }
    if (question.mistake) protocol.mistakes.push({ id: question.id, text: question.mistake, at: now });
    window.C190_LocationIntel?.normalize?.(call);
    protocol.evaluation = evaluate(call);
    return { ok: true, call, question, answer, evaluation: protocol.evaluation, location: call.locationIntel || null };
  }

  function completeness(call) {
    const protocol = normalize(call);
    const collected = protocol.collected || {};
    const missing = protocol.required.filter((id) => !collected[id]);
    const requiredDone = protocol.required.length - missing.length;
    const percent = protocol.required.length ? Math.round((requiredDone / protocol.required.length) * 100) : 100;
    return { requiredDone, requiredTotal: protocol.required.length, missing, percent };
  }

  function evaluate(call) {
    const protocol = normalize(call);
    const comp = completeness(call);
    const mistakes = protocol.mistakes?.length || 0;
    let modifier = 0;
    if (comp.percent >= 100) modifier += 3;
    else if (comp.percent >= 75) modifier += 1;
    else if (comp.percent < 50) modifier -= 3;
    modifier -= Math.min(5, mistakes * 2);
    if ((protocol.locationConfidence || 0) < 0.5) modifier -= 2;
    if (!protocol.collected?.situation) modifier -= 2;
    const finalProtocolScore = Math.max(0, Math.min(100, 50 + protocol.score * 4 + modifier * 8));
    const grade = finalProtocolScore >= 92 ? "S" : finalProtocolScore >= 80 ? "A" : finalProtocolScore >= 68 ? "B" : finalProtocolScore >= 55 ? "C" : "D";
    const detail = [];
    if (comp.missing.length) detail.push(`faltou: ${comp.missing.map((id) => QUESTION_MAP[id]?.short || id).join(", ")}`);
    if (mistakes) detail.push(`${mistakes} erro(s) de atendimento`);
    if ((protocol.locationConfidence || 0) < 0.5) detail.push("localização insuficiente para despacho preciso");
    if (!detail.length) detail.push("protocolo essencial coletado");
    return { ...comp, mistakes, modifier, finalProtocolScore, grade, detail };
  }

  function applyDecision(call, choice) {
    const evaluation = evaluate(call);
    const choiceQ = Number(choice?.q || 0);
    const q = choiceQ + evaluation.modifier;
    const xpMultiplier = evaluation.grade === "S" ? 1.25 : evaluation.grade === "A" ? 1.12 : evaluation.grade === "D" ? 0.55 : 1;
    const repAdjustment = evaluation.modifier + (evaluation.grade === "S" ? 1 : 0);
    const result = {
      quality: q,
      protocol: evaluation,
      xp: Math.max(0, Math.round(Number(choice?.xp || 0) * xpMultiplier)),
      rep: Number(choice?.rep || 0) + repAdjustment,
      resolved: q >= 1,
      failed: q < 1,
    };
    call.protocol.completed = true;
    call.protocol.evaluation = evaluation;
    call.protocol.finalDecision = { choice: choice?.text || "Decisão", ...result };
    return result;
  }

  function labels(ids) {
    return ids.map((id) => QUESTION_MAP[id]?.short || id);
  }

  return {
    VERSION,
    QUESTION_BANK,
    QUESTION_MAP,
    create,
    normalize,
    ask,
    evaluate,
    applyDecision,
    completeness,
    labels,
  };
})();
