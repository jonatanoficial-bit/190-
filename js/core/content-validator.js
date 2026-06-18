const REQUIRED_INCIDENT_FIELDS = ['id', 'title', 'severity', 'district', 'callerName', 'opening', 'callerOpening'];

function duplicateIds(items = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of items) {
    if (!item?.id) continue;
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }
  return [...duplicates];
}

export function validateGameContent({ avatars, ranks, units, incidents, protocolQuestions }) {
  const errors = [];
  const warnings = [];
  const groups = { avatars, ranks, units, incidents, protocolQuestions };

  for (const [name, value] of Object.entries(groups)) {
    if (!Array.isArray(value) || value.length === 0) errors.push(`${name}: coleção ausente ou vazia.`);
    const duplicates = duplicateIds(value);
    if (duplicates.length) errors.push(`${name}: IDs duplicados: ${duplicates.join(', ')}.`);
  }

  const avatarIds = new Set((avatars || []).map((item) => item.id));
  const unitIds = new Set((units || []).map((item) => item.id));
  const questionIds = new Set((protocolQuestions || []).map((item) => item.id));

  for (const avatar of avatars || []) {
    if (!avatar.id || !avatar.name || !avatar.src) errors.push(`Avatar inválido: ${avatar?.id || 'sem ID'}.`);
  }

  let previousXp = -1;
  for (const rank of ranks || []) {
    if (!rank.title || !rank.insignia) errors.push(`Patente inválida: ${rank?.title || 'sem título'}.`);
    if (!Number.isFinite(rank.minXp) || rank.minXp < previousXp) errors.push(`Patentes fora de ordem em ${rank?.id || 'sem ID'}.`);
    previousXp = Number(rank.minXp || 0);
  }

  for (const unit of units || []) {
    if (!unit.id || !unit.name || !unit.src) errors.push(`Unidade inválida: ${unit?.id || 'sem ID'}.`);
    if (!Number.isFinite(unit.weight) || unit.weight <= 0) warnings.push(`Unidade ${unit?.id || 'sem ID'} sem peso operacional válido.`);
  }

  for (const question of protocolQuestions || []) {
    if (!question.id || !question.label || !question.prompt || !question.protocol) errors.push(`Pergunta de protocolo inválida: ${question?.id || 'sem ID'}.`);
  }

  for (const incident of incidents || []) {
    for (const field of REQUIRED_INCIDENT_FIELDS) {
      if (!incident?.[field]) errors.push(`Ocorrência ${incident?.id || 'sem ID'} sem campo ${field}.`);
    }
    if (!Number.isFinite(incident.baseRisk) || incident.baseRisk < 0 || incident.baseRisk > 100) errors.push(`Ocorrência ${incident.id}: baseRisk inválido.`);
    if (!Number.isFinite(incident.urgencyLimit) || incident.urgencyLimit <= 0) errors.push(`Ocorrência ${incident.id}: urgencyLimit inválido.`);
    if (!Array.isArray(incident.correctUnits) || incident.correctUnits.length === 0) errors.push(`Ocorrência ${incident.id}: sem recursos corretos.`);
    for (const unitId of incident.correctUnits || []) if (!unitIds.has(unitId)) errors.push(`Ocorrência ${incident.id}: unidade inexistente ${unitId}.`);
    for (const questionId of incident.idealQuestions || []) {
      if (!questionIds.has(questionId)) errors.push(`Ocorrência ${incident.id}: pergunta ideal inexistente ${questionId}.`);
      if (!incident.questionReplies?.[questionId]) errors.push(`Ocorrência ${incident.id}: resposta ausente para ${questionId}.`);
    }
    let previousEventAt = -1;
    for (const event of incident.events || []) {
      if (!Number.isFinite(event.at) || event.at < previousEventAt) warnings.push(`Ocorrência ${incident.id}: eventos fora da ordem temporal.`);
      if (!event.text) errors.push(`Ocorrência ${incident.id}: evento sem texto.`);
      previousEventAt = Number(event.at || 0);
    }
  }

  if (avatarIds.size < 3) warnings.push('Poucos avatares disponíveis para uma experiência comercial.');
  if ((incidents || []).length < 20) warnings.push('Banco de ocorrências ainda reduzido para um produto comercial.');

  return Object.freeze({
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      avatars: avatars?.length || 0,
      ranks: ranks?.length || 0,
      units: units?.length || 0,
      incidents: incidents?.length || 0,
      protocolQuestions: protocolQuestions?.length || 0
    }
  });
}
