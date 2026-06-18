import { safeInteger, safeString } from './utils.js';

export const CALL_APPROACH_IDS = Object.freeze(['calm', 'direct', 'urgent']);

export const CALL_BRANCH_PROFILES = Object.freeze({
  'domestic-weapon-risk': {
    temperament: 'fearful', initial: { trust: 42, stress: 86, clarity: 30 }, interruptionThreshold: 90,
    initialIntel: ['fact:2'],
    intelByQuestion: {
      location: [{ id: 'fact:0', minClarity: 35 }], victims: [{ id: 'contradiction:0', minTrust: 48 }],
      weapon: [{ id: 'fact:1', minClarity: 34 }], safety: [{ id: 'fact:2', minTrust: 35 }]
    }
  },
  'armed-robbery-escape': {
    temperament: 'witness', initial: { trust: 55, stress: 72, clarity: 48 }, interruptionThreshold: 94,
    initialIntel: ['fact:0'],
    intelByQuestion: {
      location: [{ id: 'fact:0', minClarity: 42 }], weapon: [{ id: 'fact:2', minTrust: 42 }],
      suspect: [{ id: 'fact:1', minClarity: 54 }, { id: 'contradiction:0', minTrust: 50 }], safety: [{ id: 'fact:0', minTrust: 35 }]
    }
  },
  'collision-victims-fuel': {
    temperament: 'agitated', initial: { trust: 58, stress: 78, clarity: 44 }, interruptionThreshold: 95,
    initialIntel: ['fact:0'],
    intelByQuestion: {
      location: [{ id: 'fact:2', minClarity: 38 }], victims: [{ id: 'fact:0', minTrust: 38 }, { id: 'contradiction:0', minClarity: 48 }],
      safety: [{ id: 'fact:1', minTrust: 42 }]
    }
  },
  'panic-line-ambiguous-threat': {
    temperament: 'fearful', initial: { trust: 34, stress: 91, clarity: 24 }, interruptionThreshold: 88,
    initialIntel: ['fact:1'],
    intelByQuestion: {
      location: [{ id: 'fact:1', minClarity: 30 }], suspect: [{ id: 'fact:2', minTrust: 48 }, { id: 'contradiction:0', minTrust: 62 }],
      weapon: [{ id: 'fact:0', minClarity: 42 }], safety: [{ id: 'fact:1', minTrust: 38 }]
    }
  },
  'kidnapping-attempt-school': {
    temperament: 'witness', initial: { trust: 52, stress: 89, clarity: 46 }, interruptionThreshold: 96,
    initialIntel: ['fact:0'],
    intelByQuestion: {
      location: [{ id: 'fact:1', minClarity: 42 }], victims: [{ id: 'fact:0', minTrust: 36 }],
      suspect: [{ id: 'fact:1', minClarity: 52 }, { id: 'contradiction:0', minTrust: 54 }], safety: [{ id: 'fact:2', minTrust: 40 }]
    }
  },
  'shots-fired-bar': {
    temperament: 'agitated', initial: { trust: 46, stress: 93, clarity: 34 }, interruptionThreshold: 91,
    initialIntel: ['fact:1'],
    intelByQuestion: {
      location: [{ id: 'fact:1', minClarity: 34 }], victims: [{ id: 'fact:0', minTrust: 46 }],
      weapon: [{ id: 'fact:2', minClarity: 46 }, { id: 'contradiction:0', minTrust: 58 }], safety: [{ id: 'fact:1', minTrust: 34 }]
    }
  },
  'noise-party-threat': {
    temperament: 'irritated', initial: { trust: 50, stress: 68, clarity: 50 }, interruptionThreshold: 92,
    initialIntel: ['fact:0'],
    intelByQuestion: {
      location: [{ id: 'fact:2', minClarity: 38 }], weapon: [{ id: 'fact:1', minTrust: 44 }, { id: 'contradiction:0', minClarity: 58 }],
      safety: [{ id: 'fact:0', minTrust: 35 }]
    }
  },
  'morning-school-traffic': {
    temperament: 'witness', initial: { trust: 62, stress: 76, clarity: 53 }, interruptionThreshold: 96,
    initialIntel: ['fact:0'],
    intelByQuestion: {
      location: [{ id: 'fact:1', minClarity: 42 }], victims: [{ id: 'fact:0', minTrust: 35 }],
      safety: [{ id: 'fact:2', minTrust: 42 }, { id: 'contradiction:0', minClarity: 62 }]
    }
  }
});

const APPROACH_EFFECTS = Object.freeze({
  calm:   { trust: 11, stress: -11, clarity: 4, risk: -1, quality: 0.12 },
  direct: { trust: 4,  stress: -3,  clarity: 11, risk: -3, quality: 0.09 },
  urgent: { trust: -8, stress: 10,  clarity: 8, risk: -4, quality: -0.04 }
});

const TEMPERAMENT_EFFECTS = Object.freeze({
  fearful: {
    calm: { trust: 4, stress: -4, clarity: 1 }, direct: { trust: 0, stress: 1, clarity: 1 }, urgent: { trust: -5, stress: 7, clarity: -2 }
  },
  witness: {
    calm: { trust: 1, stress: -2, clarity: 0 }, direct: { trust: 2, stress: -1, clarity: 4 }, urgent: { trust: -2, stress: 3, clarity: 2 }
  },
  agitated: {
    calm: { trust: 3, stress: -5, clarity: 0 }, direct: { trust: 0, stress: 1, clarity: 2 }, urgent: { trust: -4, stress: 6, clarity: -1 }
  },
  irritated: {
    calm: { trust: 2, stress: -4, clarity: 0 }, direct: { trust: 3, stress: -2, clarity: 3 }, urgent: { trust: -6, stress: 7, clarity: -2 }
  }
});

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const roundQuality = (value) => Math.round(clamp(value, 0.2, 1) * 100) / 100;

export function getCallBranchProfile(incidentId) {
  return CALL_BRANCH_PROFILES[incidentId] || {
    temperament: 'witness', initial: { trust: 50, stress: 70, clarity: 45 }, interruptionThreshold: 94,
    initialIntel: ['fact:0'], intelByQuestion: {}
  };
}

export function createInitialCallerState(incidentId) {
  const profile = getCallBranchProfile(incidentId);
  return {
    trust: clamp(profile.initial.trust),
    stress: clamp(profile.initial.stress),
    clarity: clamp(profile.initial.clarity),
    interruptions: 0,
    lastApproach: 'direct',
    emotion: emotionFromState(profile.initial),
    lineStatus: 'stable'
  };
}

export function normalizeCallerState(value, incidentId) {
  const fallback = createInitialCallerState(incidentId);
  const source = value && typeof value === 'object' ? value : {};
  const state = {
    trust: safeInteger(source.trust, 0, 100, fallback.trust),
    stress: safeInteger(source.stress, 0, 100, fallback.stress),
    clarity: safeInteger(source.clarity, 0, 100, fallback.clarity),
    interruptions: safeInteger(source.interruptions, 0, 99, 0),
    lastApproach: CALL_APPROACH_IDS.includes(source.lastApproach) ? source.lastApproach : 'direct',
    emotion: safeString(source.emotion, fallback.emotion, 24),
    lineStatus: ['stable', 'unstable'].includes(source.lineStatus) ? source.lineStatus : 'stable'
  };
  state.emotion = emotionFromState(state);
  return state;
}

export function emotionFromState(state) {
  const stress = clamp(state?.stress);
  const trust = clamp(state?.trust);
  const clarity = clamp(state?.clarity);
  if (stress >= 90) return 'panic';
  if (stress >= 76) return 'agitated';
  if (trust < 28) return 'resistant';
  if (clarity < 36) return 'confused';
  if (stress <= 48 && trust >= 58) return 'cooperative';
  return 'tense';
}

function effectFor(profile, approach) {
  const base = APPROACH_EFFECTS[approach] || APPROACH_EFFECTS.direct;
  const temperament = TEMPERAMENT_EFFECTS[profile.temperament]?.[approach] || {};
  return {
    trust: base.trust + (temperament.trust || 0),
    stress: base.stress + (temperament.stress || 0),
    clarity: base.clarity + (temperament.clarity || 0),
    risk: base.risk,
    quality: base.quality
  };
}

function eligibleIntel(entries, nextState, quality, alreadyDiscovered = new Set()) {
  const revealed = [];
  for (const raw of entries || []) {
    const rule = typeof raw === 'string' ? { id: raw } : raw;
    if (!rule?.id || alreadyDiscovered.has(rule.id)) continue;
    if (quality < (rule.minQuality ?? 0.55)) continue;
    if (nextState.trust < (rule.minTrust ?? 0)) continue;
    if (nextState.clarity < (rule.minClarity ?? 0)) continue;
    if (nextState.stress > (rule.maxStress ?? 100)) continue;
    revealed.push(rule.id);
  }
  return revealed;
}

export function resolveCallBranch({ incidentId, state, approach = 'direct', questionId, isIdeal = false, askedCount = 0, alreadyDiscovered = [] }) {
  const profile = getCallBranchProfile(incidentId);
  const current = normalizeCallerState(state, incidentId);
  const selectedApproach = CALL_APPROACH_IDS.includes(approach) ? approach : 'direct';
  const effect = effectFor(profile, selectedApproach);
  const repeatedUrgency = selectedApproach === 'urgent' && current.lastApproach === 'urgent';
  const next = {
    ...current,
    trust: clamp(current.trust + effect.trust),
    stress: clamp(current.stress + effect.stress),
    clarity: clamp(current.clarity + effect.clarity),
    lastApproach: selectedApproach,
    lineStatus: 'stable'
  };

  const interruption = (next.stress >= profile.interruptionThreshold && selectedApproach === 'urgent')
    || (repeatedUrgency && next.stress >= profile.interruptionThreshold - 5)
    || (next.trust <= 14 && selectedApproach === 'urgent');

  if (interruption) {
    next.interruptions += 1;
    next.lineStatus = 'unstable';
    next.clarity = clamp(next.clarity - 8);
    next.emotion = emotionFromState(next);
    return {
      nextState: next,
      approach: selectedApproach,
      reaction: 'interrupted',
      quality: 0,
      completed: false,
      interruption: true,
      riskDelta: Math.max(5, 8 + next.interruptions * 2),
      revealedIntel: []
    };
  }

  let quality = 0.56
    + ((next.trust - 50) / 180)
    + ((next.clarity - 50) / 155)
    - (Math.max(0, next.stress - 65) / 140)
    + effect.quality
    + (isIdeal ? 0.04 : -0.04)
    + Math.min(0.05, askedCount * 0.01);
  quality = roundQuality(quality);

  let reaction = 'blocked';
  if (quality >= 0.84) reaction = 'cooperative';
  else if (quality >= 0.58) reaction = 'strained';

  const revealedIntel = eligibleIntel(
    profile.intelByQuestion?.[questionId],
    next,
    quality,
    new Set(alreadyDiscovered)
  );

  next.lineStatus = quality < 0.45 ? 'unstable' : 'stable';
  next.emotion = emotionFromState(next);
  return {
    nextState: next,
    approach: selectedApproach,
    reaction,
    quality,
    completed: true,
    interruption: false,
    riskDelta: effect.risk + (quality < 0.45 ? 3 : quality > 0.82 ? -2 : 0),
    revealedIntel
  };
}

export function normalizeQuestionQuality(value, questionIds = new Set()) {
  const source = value && typeof value === 'object' ? value : {};
  const output = {};
  for (const [key, raw] of Object.entries(source)) {
    if (!questionIds.has(key)) continue;
    output[key] = roundQuality(raw);
  }
  return output;
}

export function normalizeBranchHistory(value, questionIds = new Set()) {
  return (Array.isArray(value) ? value : []).slice(-30).map((item) => ({
    questionId: questionIds.has(item?.questionId) ? item.questionId : '',
    approach: CALL_APPROACH_IDS.includes(item?.approach) ? item.approach : 'direct',
    reaction: ['cooperative', 'strained', 'blocked', 'interrupted'].includes(item?.reaction) ? item.reaction : 'strained',
    quality: roundQuality(item?.quality || 0.2),
    completed: item?.completed !== false,
    interruption: Boolean(item?.interruption),
    revealedIntel: (Array.isArray(item?.revealedIntel) ? item.revealedIntel : []).map((id) => safeString(id, '', 40)).filter(Boolean).slice(0, 8)
  })).filter((item) => item.questionId);
}

export function validateCallBranchProfiles(incidentIds = [], questionIds = []) {
  const errors = [];
  const warnings = [];
  const allowedQuestions = new Set(questionIds);
  for (const incidentId of incidentIds) {
    const profile = CALL_BRANCH_PROFILES[incidentId];
    if (!profile) { errors.push(`${incidentId}: perfil ramificado ausente.`); continue; }
    for (const key of ['trust', 'stress', 'clarity']) {
      if (!Number.isFinite(profile.initial?.[key]) || profile.initial[key] < 0 || profile.initial[key] > 100) errors.push(`${incidentId}: estado inicial ${key} inválido.`);
    }
    if (!Number.isFinite(profile.interruptionThreshold)) errors.push(`${incidentId}: limiar de interrupção ausente.`);
    for (const [questionId, entries] of Object.entries(profile.intelByQuestion || {})) {
      if (!allowedQuestions.has(questionId)) errors.push(`${incidentId}: pergunta de ramificação inexistente ${questionId}.`);
      if (!Array.isArray(entries)) errors.push(`${incidentId}: intel de ${questionId} não é lista.`);
    }
  }
  for (const incidentId of Object.keys(CALL_BRANCH_PROFILES)) if (!incidentIds.includes(incidentId)) warnings.push(`${incidentId}: perfil sem ocorrência correspondente.`);
  return Object.freeze({ ok: errors.length === 0, errors, warnings, profiles: Object.keys(CALL_BRANCH_PROFILES).length });
}
