window.C190_Triage = (() => {
  "use strict";

  const VERSION = 1;

  const NATURES = [
    { id: "crime_in_progress", label: "Crime em andamento", categories: ["critical"], tags: ["urban", "government"], severity: 5 },
    { id: "domestic_violence", label: "Violência doméstica/proteção", categories: ["protection"], tags: ["domestic"], severity: 5 },
    { id: "public_threat", label: "Ameaça/conflito em via pública", categories: ["protection", "community"], tags: ["neighborhood"], severity: 3 },
    { id: "traffic_accident", label: "Acidente/trânsito", categories: ["traffic"], tags: ["traffic"], severity: 4 },
    { id: "medical_emergency", label: "Emergência médica", categories: ["health", "event"], tags: ["event"], severity: 4 },
    { id: "fire_rescue", label: "Incêndio/salvamento", categories: ["fire", "infrastructure"], tags: ["weather"], severity: 5 },
    { id: "infrastructure_risk", label: "Risco urbano/infraestrutura", categories: ["infrastructure"], tags: ["government"], severity: 4 },
    { id: "weather_disaster", label: "Chuva, alagamento ou deslizamento", categories: ["weather"], tags: ["weather", "flood", "hills"], severity: 5 },
    { id: "remote_rescue", label: "Resgate remoto/fluvial", categories: ["remote"], tags: ["remote", "river"], severity: 4 },
    { id: "community_order", label: "Ordem pública/comunidade", categories: ["community"], tags: ["urban"], severity: 2 },
    { id: "missing_person", label: "Pessoa desaparecida/vulnerável", categories: ["protection"], tags: ["remote"], severity: 3 },
    { id: "event_crowd", label: "Evento/multidão", categories: ["event"], tags: ["event", "tourism"], severity: 4 },
  ];

  const PRIORITIES = [
    { id: "baixa", label: "Baixa", level: 1, hint: "Registro e fila normal" },
    { id: "media", label: "Média", level: 2, hint: "Atendimento comum com acompanhamento" },
    { id: "alta", label: "Alta", level: 3, hint: "Risco relevante ou vítima possível" },
    { id: "critica", label: "Crítica", level: 4, hint: "Risco imediato à vida ou violência ativa" },
    { id: "maxima", label: "Máxima", level: 5, hint: "Ameaça extrema, reféns, arma, incêndio grave ou múltiplas vítimas" },
  ];

  const AGENCIES = [
    { id: "pm", label: "Polícia Militar", short: "PM", hint: "Crime, violência, ameaça, proteção e preservação da ordem" },
    { id: "bombeiros", label: "Bombeiros", short: "193", hint: "Incêndio, salvamento, resgate técnico, alagamento e risco ambiental" },
    { id: "samu", label: "SAMU", short: "192", hint: "Emergência clínica, vítima inconsciente, dor intensa ou risco médico" },
    { id: "multi", label: "Despacho combinado", short: "PM + apoio", hint: "PM, Bombeiros e/ou SAMU quando segurança, resgate e saúde se cruzam" },
  ];

  const byId = (list, id) => list.find((item) => item.id === id);

  function category(call) {
    return call?.category || "community";
  }

  function tags(call) {
    return Array.isArray(call?.tags) ? call.tags : [];
  }

  function includesAny(values, targets) {
    return targets.some((target) => values.includes(target));
  }

  function recommendedNature(call) {
    const cat = category(call);
    const t = tags(call);
    const text = `${call?.id || ""} ${call?.type || ""}`.toLowerCase();
    if (text.includes("desaparecid")) return "missing_person";
    if (cat === "critical" || text.includes("roubo") || text.includes("refém") || text.includes("refens") || text.includes("banc")) return "crime_in_progress";
    if (t.includes("domestic") || text.includes("doméstica") || text.includes("domestica") || text.includes("criança")) return "domestic_violence";
    if (cat === "traffic" || t.includes("traffic") || text.includes("acidente") || text.includes("semáforo")) return "traffic_accident";
    if (cat === "health" || text.includes("médica") || text.includes("inconsciente") || text.includes("hospital")) return "medical_emergency";
    if (cat === "fire" || text.includes("incêndio") || text.includes("fumaça") || text.includes("elétrico")) return "fire_rescue";
    if (cat === "weather" || includesAny(t, ["weather", "flood", "hills"])) return "weather_disaster";
    if (cat === "remote" || includesAny(t, ["remote", "river"])) return "remote_rescue";
    if (cat === "infrastructure") return "infrastructure_risk";
    if (cat === "event" || t.includes("event")) return "event_crowd";
    if (cat === "protection") return "public_threat";
    return "community_order";
  }

  function recommendedPriority(call) {
    const cat = category(call);
    const t = tags(call);
    const text = `${call?.id || ""} ${call?.type || ""} ${call?.summary || ""}`.toLowerCase();
    const base = Number(call?.priority || 1);
    if (cat === "critical" || text.includes("refém") || text.includes("banc") || text.includes("armad") || text.includes("hospital") || text.includes("incêndio elétrico")) return "maxima";
    if (base >= 3 || includesAny(t, ["domestic", "flood", "hills", "river"])) return "critica";
    if (base === 2 || cat === "infrastructure" || cat === "event" || cat === "traffic") return "alta";
    if (text.includes("perturbação") || text.includes("animal") || text.includes("sossego")) return "baixa";
    return "media";
  }

  function recommendedAgency(call) {
    const cat = category(call);
    const t = tags(call);
    const text = `${call?.id || ""} ${call?.type || ""} ${call?.summary || ""}`.toLowerCase();
    const collected = call?.protocol?.collected || {};
    const medicalFlag = !!collected.medical || text.includes("vítima") || text.includes("vitima") || text.includes("inconsciente") || text.includes("ferid") || text.includes("hospital");
    if (cat === "health") return "samu";
    if (cat === "fire" || text.includes("incêndio") || text.includes("fumaça") || text.includes("elevador") || text.includes("embarcação")) return medicalFlag ? "multi" : "bombeiros";
    if (cat === "weather" || includesAny(t, ["flood", "hills", "river"])) return "bombeiros";
    if (cat === "traffic") return medicalFlag ? "multi" : "pm";
    if (cat === "infrastructure") return medicalFlag || text.includes("elétrico") || text.includes("gerador") ? "multi" : "bombeiros";
    if (cat === "event") return medicalFlag ? "multi" : "pm";
    if (cat === "critical") return medicalFlag ? "multi" : "pm";
    if (cat === "protection") return medicalFlag ? "multi" : "pm";
    if (cat === "remote") return "bombeiros";
    return "pm";
  }

  function compatibilityForAgency(selected, recommended, call) {
    if (selected === recommended) return { points: 25, label: "órgão correto" };
    const highRisk = ["critica", "maxima"].includes(recommendedPriority(call));
    if (selected === "multi" && highRisk) return { points: 16, label: "despacho combinado aceitável, ainda que amplo" };
    if (recommended === "multi" && ["pm", "bombeiros", "samu"].includes(selected)) return { points: -12, label: "despacho incompleto para ocorrência combinada" };
    if ((recommended === "samu" && selected === "bombeiros") || (recommended === "bombeiros" && selected === "samu")) return { points: -8, label: "apoio parcialmente relacionado, mas órgão principal errado" };
    return { points: -20, label: "órgão incorreto" };
  }

  function priorityLevel(id) {
    return byId(PRIORITIES, id)?.level || 0;
  }

  function priorityScore(selected, recommended) {
    if (!selected) return { points: -18, label: "prioridade não definida" };
    const delta = priorityLevel(selected) - priorityLevel(recommended);
    if (delta === 0) return { points: 20, label: "prioridade correta" };
    if (Math.abs(delta) === 1) return { points: delta < 0 ? -6 : 8, label: delta < 0 ? "subpriorização leve" : "priorização conservadora" };
    return { points: delta < 0 ? -22 : -10, label: delta < 0 ? "subpriorização grave" : "superpriorização grave" };
  }

  function natureScore(selected, recommended, call) {
    if (!selected) return { points: -15, label: "natureza não classificada" };
    if (selected === recommended) return { points: 20, label: "natureza correta" };
    const sel = byId(NATURES, selected);
    const rec = byId(NATURES, recommended);
    const cat = category(call);
    const t = tags(call);
    const related = !!sel && (sel.categories.includes(cat) || includesAny(sel.tags || [], t) || Math.abs((sel.severity || 1) - (rec?.severity || 1)) <= 1);
    return related ? { points: 6, label: "natureza parcialmente compatível" } : { points: -16, label: "natureza incorreta" };
  }

  function create(call) {
    return {
      version: VERSION,
      nature: null,
      priority: null,
      agency: null,
      submitted: false,
      updatedAt: new Date().toISOString(),
      recommended: {
        nature: recommendedNature(call),
        priority: recommendedPriority(call),
        agency: recommendedAgency(call),
      },
      evaluation: null,
    };
  }

  function normalize(call) {
    if (!call) return null;
    const existing = call.triage && typeof call.triage === "object" ? call.triage : {};
    if (!existing.version || existing.version !== VERSION) {
      call.triage = { ...create(call), ...existing, version: VERSION };
    }
    call.triage.recommended = {
      nature: recommendedNature(call),
      priority: recommendedPriority(call),
      agency: recommendedAgency(call),
    };
    return call.triage;
  }

  function set(call, field, value) {
    const triage = normalize(call);
    const valid =
      (field === "nature" && !!byId(NATURES, value)) ||
      (field === "priority" && !!byId(PRIORITIES, value)) ||
      (field === "agency" && !!byId(AGENCIES, value));
    if (!valid) return { ok: false, reason: "invalid_triage_value", triage };
    triage[field] = value;
    triage.updatedAt = new Date().toISOString();
    triage.evaluation = evaluate(call);
    return { ok: true, triage, evaluation: triage.evaluation };
  }

  function evaluate(call) {
    const triage = normalize(call);
    const rec = triage.recommended || create(call).recommended;
    const ns = natureScore(triage.nature, rec.nature, call);
    const ps = priorityScore(triage.priority, rec.priority, call);
    const agency = triage.agency ? compatibilityForAgency(triage.agency, rec.agency, call) : { points: -20, label: "órgão não definido" };
    const details = [ns.label, ps.label, agency.label];
    let score = 45 + ns.points + ps.points + agency.points;
    const protocol = call?.protocol;
    const collected = protocol?.collected || {};
    if (!collected.address) { score -= 8; details.push("endereço ausente"); }
    if (!collected.situation) { score -= 6; details.push("situação não esclarecida"); }
    if ((rec.priority === "critica" || rec.priority === "maxima") && !collected.victims && !collected.weapons && !collected.hazards) {
      score -= 8;
      details.push("risco crítico sem checagem suficiente");
    }
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    const grade = finalScore >= 92 ? "S" : finalScore >= 80 ? "A" : finalScore >= 68 ? "B" : finalScore >= 55 ? "C" : "D";
    const modifier = grade === "S" ? 3 : grade === "A" ? 2 : grade === "B" ? 1 : grade === "C" ? 0 : -3;
    return {
      finalScore,
      grade,
      modifier,
      selected: { nature: triage.nature, priority: triage.priority, agency: triage.agency },
      recommended: rec,
      detail: details,
      missing: [
        !triage.nature ? "natureza" : null,
        !triage.priority ? "prioridade" : null,
        !triage.agency ? "órgão" : null,
      ].filter(Boolean),
    };
  }

  function applyDecision(call, protocolOutcome) {
    const triage = normalize(call);
    const evaluation = evaluate(call);
    triage.submitted = true;
    triage.evaluation = evaluation;
    call.triageResult = evaluation;
    const quality = Number(protocolOutcome?.quality || 0) + evaluation.modifier;
    const xpMultiplier = evaluation.grade === "S" ? 1.22 : evaluation.grade === "A" ? 1.1 : evaluation.grade === "D" ? 0.55 : 1;
    const repAdjustment = evaluation.modifier + (evaluation.grade === "S" ? 1 : 0);
    return {
      ...protocolOutcome,
      quality,
      xp: Math.max(0, Math.round(Number(protocolOutcome?.xp || 0) * xpMultiplier)),
      rep: Number(protocolOutcome?.rep || 0) + repAdjustment,
      resolved: quality >= 1,
      failed: quality < 1,
      triage: evaluation,
    };
  }

  function label(type, id) {
    const source = type === "nature" ? NATURES : type === "priority" ? PRIORITIES : AGENCIES;
    return byId(source, id)?.label || id || "não definido";
  }

  return {
    VERSION,
    NATURES,
    PRIORITIES,
    AGENCIES,
    recommendedNature,
    recommendedPriority,
    recommendedAgency,
    create,
    normalize,
    set,
    evaluate,
    applyDecision,
    label,
  };
})();
