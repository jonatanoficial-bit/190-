const fs = require("fs");
const vm = require("vm");
const path = require("path");
const root = path.resolve(__dirname, "..");
const store = {};
let checks = 0;

// Fixed local date makes rotating challenge tests deterministic.
const RealDate = Date;
const fixedNow = new RealDate("2026-06-18T13:08:37.000Z");
global.Date = class extends RealDate {
  constructor(...args) {
    super(...(args.length ? args : [fixedNow]));
  }
  static now() {
    return fixedNow.getTime();
  }
};

global.window = global;
global.localStorage = {
  getItem: (key) =>
    Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => delete store[key],
};
global.CustomEvent = function (type, options) {
  this.type = type;
  this.detail = options?.detail;
};
global.dispatchEvent = () => true;
global.addEventListener = () => true;
global.navigator = { onLine: true, maxTouchPoints: 0, userAgent: "Node audit" };
global.document = { documentElement: {}, body: { classList: { toggle: () => {}, add: () => {}, remove: () => {} } }, addEventListener: () => true };
global.performance = { now: () => Date.now() };
global.crypto = { randomUUID: () => `id-${Math.random()}` };

for (const file of [
  "js/assets.js",
  "js/release.js",
  "js/balance.js",
  "js/immersion.js",
  "js/content.js",
  "js/call-protocol.js",
  "js/triage.js",
  "js/location-intel.js",
  "js/resource-dispatch.js",
  "js/field-radio.js",
  "js/training-academy.js",
  "js/save-manager.js",
  "js/career.js",
  "js/dispatch.js",
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), {
    filename: file,
  });
}

function assert(value, message) {
  checks += 1;
  if (!value) throw new Error(message);
}

function profile(state, name = "Teste") {
  state.profile = { name, callSign: "Águia", difficulty: "realista" };
  return state;
}

function protocolReady(state, call) {
  call.status = "active";
  state.dispatch.shift.activeCallId = call.id;
  for (const question of ["neighborhood", "street", "number", "address", "reference", "situation", "victims", "weapons", "safety", "caller"]) {
    C190_Dispatch.askQuestion(state, call.id, question);
  }
  const rec = C190_Triage.evaluate(call).recommended;
  C190_Dispatch.setTriage(state, call.id, "nature", rec.nature);
  C190_Dispatch.setTriage(state, call.id, "priority", rec.priority);
  C190_Dispatch.setTriage(state, call.id, "agency", rec.agency);
  C190_Dispatch.recommendResources(state, call.id);
}

function resolveAll(state, choiceIndex = 0) {
  const shift = state.dispatch.shift;
  for (const call of shift.calls) {
    protocolReady(state, call);
    const outcome = C190_Dispatch.choose(state, call.id, choiceIndex);
    assert(!!outcome, "choice returns outcome");
    assert(outcome.protocol && ["S", "A", "B", "C", "D"].includes(outcome.protocol.grade), "protocol grade generated");
    assert(outcome.triage && ["S", "A", "B", "C", "D"].includes(outcome.triage.grade), "triage grade generated");
    if (outcome.awaitingRadio) {
      for (const action of ["keep_line", "reroute", "advance", "close"]) {
        const radio = C190_Dispatch.radioAction(state, call.id, action);
        assert(radio.ok, "radio action accepted");
        if (radio.finalized) break;
      }
      assert(["resolved", "failed"].includes(call.status), "radio finalizes call");
    }
  }
}

const migrated = C190_Save.migrate({
  schema: 12,
  profile: { name: "Legado", callSign: "Atlas" },
  career: {
    xp: 500,
    reputation: 60,
    totalShifts: 2,
    completedCourses: ["comunicacao"],
  },
  settings: {
    mapMode: "invalid",
    mapCenter: { lat: -22.90685, lng: -43.1729, label: "Rio de Janeiro — RJ" },
  },
  dispatch: {
    shift: {
      active: true,
      calls: [{ id: "old-call", type: "Teste", status: "waiting" }],
    },
    reports: [],
  },
});
assert(migrated.schema === 27, "migration schema 12 to 27");
assert(migrated.version === "2.3.0", "migration version");
assert(migrated.profile.callSign === "Atlas", "migration profile");
assert(migrated.career.xp === 500, "migration XP");
assert(migrated.settings.mapMode === "auto", "invalid map mode normalized");
assert(migrated.content.activeCityId === "rio", "known map center migrates to city module");
assert(migrated.content.stats.totalReports === 0, "content stats created");
assert(migrated.content.sandbox.callCount === 5, "sandbox defaults created");
assert(migrated.content.challenges.daily.key === "2026-06-18", "daily challenge initialized");
assert(
  Number.isFinite(migrated.dispatch.shift.calls[0].lat) &&
    Number.isFinite(migrated.dispatch.shift.calls[0].lng),
  "legacy active call enriched with coordinates",
);
assert(migrated.release.balanceVersion === 3, "release balance state created");
assert(migrated.release.callProtocolVersion === 3, "call protocol release flag created");
assert(migrated.release.locationIntelVersion === 1, "location intel release flag created");
assert(migrated.release.triageVersion === 1, "triage release flag created");
assert(migrated.release.resourceDispatchVersion === 1, "resource dispatch release flag created");
assert(migrated.release.immersionVersion === 1, "immersion release flag created");
assert(!!migrated.dispatch.shift.calls[0].protocol, "legacy active call enriched with call protocol");
assert(!!migrated.dispatch.shift.calls[0].triage, "legacy active call enriched with triage");
assert(!!migrated.dispatch.shift.calls[0].resourceDispatch, "legacy active call enriched with resource dispatch");
assert(!!migrated.dispatch.shift.calls[0].locationIntel, "legacy active call enriched with location intel");
assert(migrated.settings.telemetry === false, "telemetry forced off");
assert(C190_Save.validate(migrated), "migrated save validates");

const cityState = profile(C190_Save.defaultState(), "Cidades");
let cityResult = C190_Content.selectCity(cityState, "rio");
assert(cityResult.ok && cityState.content.activeCityId === "rio", "base city activates");
cityResult = C190_Content.selectCity(cityState, "manaus");
assert(!cityResult.ok && cityResult.reason === "locked", "advanced city is locked");
cityState.career.totalShifts = 18;
cityResult = C190_Content.selectCity(cityState, "manaus");
assert(cityResult.ok, "advanced city unlocks at requirement");
assert(cityState.settings.mapCenter.label === "Manaus — AM", "city updates map center");

const careerState = profile(C190_Save.defaultState(), "Carreira");
careerState.career.xp = 1000;
careerState.career.reputation = 70;
careerState.career.totalShifts = 5;
careerState.career.completedCourses = ["comunicacao"];
let promotion = C190_Career.getPromotionStatus(careerState);
assert(promotion.next.id === "operador_ii" && promotion.eligible, "promotion eligibility preserved");
const promoted = C190_Career.promoteIfEligible(careerState);
assert(promoted.id === "operador_ii", "promotion applied");
C190_Career.issueWarning(careerState, "Falha de protocolo", "Teste", 2);
assert(C190_Career.activeWarnings(careerState) === 1, "warning active");
C190_Career.decayWarnings(careerState);
C190_Career.decayWarnings(careerState);
assert(C190_Career.activeWarnings(careerState) === 0, "warning expires");

const courseState = profile(C190_Save.defaultState(), "Curso");
courseState.career.rankId = "operador_ii";
courseState.career.xp = 2000;
const beforeCourse = courseState.career.xp;
const course = C190_Career.completeCourse(courseState, "triagem");
assert(course.ok, "course completion");
assert(courseState.career.xp === beforeCourse - 420, "course XP cost");

const assistedState = profile(C190_Save.defaultState(), "Assistido");
assistedState.profile.difficulty = "assistido";
const assistedShift = C190_Content.launchCareer(assistedState);
assert(assistedShift.arrivalGap > 18, "assisted mode slows arrivals");
assert(assistedShift.abandonLimit === 110, "assisted mode extends abandonment");

const expertState = profile(C190_Save.defaultState(), "Especialista");
expertState.profile.difficulty = "especialista";
const expertShift = C190_Content.launchCareer(expertState);
assert(expertShift.arrivalGap < 18, "expert mode accelerates arrivals");
assert(expertShift.abandonLimit === 60, "expert mode shortens abandonment");
assert(expertShift.balanceVersion === 3, "new balance version applied");

const dispatchState = profile(C190_Save.defaultState(), "Plantão");
const careerShift = C190_Content.launchCareer(dispatchState);
assert(careerShift.calls.length === 3, "career shift has three calls");
assert(careerShift.mode === "career" && careerShift.affectsCareer, "career mode metadata");
assert(
  careerShift.calls.every(
    (call) =>
      Number.isFinite(call.lat) &&
      Number.isFinite(call.lng) &&
      call.region === "São Paulo — SP",
  ),
  "career calls are georeferenced",
);

const locationState = profile(C190_Save.defaultState(), "Mapa");
const locationShift = C190_Content.launchCareer(locationState);
const locationCall = locationShift.calls[0];
locationCall.status = "active";
locationState.dispatch.shift.activeCallId = locationCall.id;
assert(C190_LocationIntel.normalize(locationCall).stage === "none", "new call starts without mapped location");
C190_Dispatch.askQuestion(locationState, locationCall.id, "neighborhood");
assert(C190_LocationIntel.normalize(locationCall).stage === "region", "neighborhood unlocks approximate area");
C190_Dispatch.askQuestion(locationState, locationCall.id, "street");
assert(C190_LocationIntel.normalize(locationCall).stage === "street", "street unlocks street-level map");
C190_Dispatch.askQuestion(locationState, locationCall.id, "number");
assert(C190_LocationIntel.normalize(locationCall).stage === "block", "number narrows to block");
C190_Dispatch.askQuestion(locationState, locationCall.id, "reference");
assert(C190_LocationIntel.normalize(locationCall).stage === "precise", "reference confirms precise location");
const display = C190_LocationIntel.displayLocation(locationCall);
assert(display.visible && display.precise && display.radiusMeters <= 100, "precise display location generated");
assert(C190_LocationIntel.resourcesFor(locationState).length >= 5, "nearby resources generated");
assert(C190_ResourceDispatch.resourcesFor(locationState).length >= 9, "operational resources generated");
resolveAll(dispatchState);
assert(dispatchState.career.totalShifts === 1, "career shift counted");
assert(dispatchState.dispatch.reports.length === 1, "career report generated");
assert(dispatchState.content.stats.modeCounts.career === 1, "career mode stats updated");
assert(dispatchState.content.stats.totalReports === 1, "all-time reports updated");
assert(dispatchState.content.stats.cityStats.sp.shifts === 1, "city stats updated");
assert(
  dispatchState.dispatch.reports[0].calls.every(
    (call) => Number.isFinite(call.lat) && Number.isFinite(call.lng),
  ),
  "report preserves georeferencing",
);

const sandboxState = profile(C190_Save.defaultState(), "Sandbox");
const xpBeforeSandbox = sandboxState.career.xp;
const repBeforeSandbox = sandboxState.career.reputation;
const sandboxResult = C190_Content.launchSandbox(sandboxState, {
  callCount: 7,
  arrivalGap: 6,
  cityId: "rio",
  priorityMix: "critical",
  templateSet: "all",
});
assert(sandboxResult.ok, "sandbox launches");
assert(sandboxResult.shift.calls.length === 7, "sandbox custom call count");
assert(sandboxResult.shift.affectsCareer === false, "sandbox isolated from career");
assert(sandboxResult.shift.calls.every((call) => call.priority === 3), "sandbox priority filter");
resolveAll(sandboxState);
assert(sandboxState.career.totalShifts === 0, "sandbox does not count career shift");
assert(sandboxState.career.xp === xpBeforeSandbox, "sandbox does not grant XP");
assert(sandboxState.career.reputation === repBeforeSandbox, "sandbox does not change reputation");
assert(sandboxState.content.stats.modeCounts.sandbox === 1, "sandbox stats updated");
assert(sandboxState.dispatch.reports[0].affectsCareer === false, "sandbox report marked isolated");

const protocolState = profile(C190_Save.defaultState(), "Protocolo");
const protocolShift = C190_Content.launchCareer(protocolState);
const firstProtocolCall = protocolShift.calls[0];
firstProtocolCall.status = "waiting";
C190_Dispatch.answer(protocolState, firstProtocolCall.id);
let asked = C190_Dispatch.askQuestion(protocolState, firstProtocolCall.id, "address");
assert(asked.ok && firstProtocolCall.locationRevealed, "address question reveals location");
asked = C190_Dispatch.askQuestion(protocolState, firstProtocolCall.id, "unsafe_confront");
assert(asked.ok && firstProtocolCall.protocol.mistakes.length === 1, "unsafe question is penalized");
for (const question of ["neighborhood", "street", "number", "reference", "situation", "victims", "weapons", "safety", "caller", "aggressor", "people", "medical", "hazards", "calm"]) C190_Dispatch.askQuestion(protocolState, firstProtocolCall.id, question);
const protocolEvaluation = C190_CallProtocol.evaluate(firstProtocolCall);
assert(protocolEvaluation.percent >= 75, "protocol completeness calculated");
const recTriage = C190_Triage.evaluate(firstProtocolCall).recommended;
let triageSet = C190_Dispatch.setTriage(protocolState, firstProtocolCall.id, "nature", recTriage.nature);
assert(triageSet.ok, "triage nature set");
C190_Dispatch.setTriage(protocolState, firstProtocolCall.id, "priority", recTriage.priority);
C190_Dispatch.setTriage(protocolState, firstProtocolCall.id, "agency", recTriage.agency);
const recommendedResources = C190_Dispatch.recommendResources(protocolState, firstProtocolCall.id);
assert(recommendedResources.ok && recommendedResources.evaluation.finalScore >= 55, "resource dispatch recommendation works");
const triageEvaluation = C190_Triage.evaluate(firstProtocolCall);
assert(triageEvaluation.finalScore >= 80, "triage score calculated");
const protocolDecision = C190_Dispatch.choose(protocolState, firstProtocolCall.id, 0);
assert(protocolDecision.protocol.finalProtocolScore > 0, "decision includes protocol score");
assert(protocolDecision.triage.finalScore > 0, "decision includes triage score");
assert(protocolDecision.resourceDispatch.finalScore > 0, "decision includes resource dispatch score");

const challengeState = profile(C190_Save.defaultState(), "Desafios");
const challenge = C190_Content.ensureChallenges(challengeState).daily;
const challengeDef = C190_Content.challengeDef("daily", challenge);
for (let i = 0; i < 8 && challenge.progress < challengeDef.target; i++) {
  const report = {
    id: `challenge-${i}`,
    duration: 30,
    resolved: 5,
    failed: 0,
    abandoned: 0,
    score: 95,
    grade: "S",
    mode: "career",
    cityId: i % 2 ? "rio" : "sp",
    affectsCareer: true,
    calls: [
      { priority: 3, status: "resolved" },
      { priority: 3, status: "resolved" },
      { priority: 2, status: "resolved" },
    ],
  };
  C190_Content.onShiftEnded(challengeState, report);
}
assert(challenge.progress >= challengeDef.target, "daily challenge can complete");
const challengeXp = challengeState.career.xp;
const claim = C190_Content.claimChallenge(challengeState, "daily");
assert(claim.ok, "daily challenge reward claim");
assert(challengeState.career.xp === challengeXp + challengeDef.reward.xp, "challenge XP reward applied");
assert(!C190_Content.claimChallenge(challengeState, "daily").ok, "challenge cannot be claimed twice");

const specialLockedState = profile(C190_Save.defaultState(), "Especial bloqueada");
const lockedSpecial = C190_Content.launchSpecial(specialLockedState, "cerco_bancario");
assert(!lockedSpecial.ok && lockedSpecial.reason === "rank", "special operation rank lock");

const specialState = profile(C190_Save.defaultState(), "Especial");
specialState.career.rankId = "supervisor";
const specialStartXp = specialState.career.xp;
const specialResult = C190_Content.launchSpecial(specialState, "cerco_bancario");
assert(specialResult.ok, "special operation launches at rank");
assert(specialResult.shift.mode === "special", "special mode metadata");
assert(specialResult.shift.calls.length === 5, "special operation authored call count");
assert(specialResult.shift.cityId === "bh", "special operation city applied");
resolveAll(specialState);
assert(specialState.content.special.completed.includes("cerco_bancario"), "special completion stored");
assert(specialState.content.special.attempts.cerco_bancario === 1, "special attempt tracked");
assert(specialState.career.xp > specialStartXp, "special career rewards applied");
const firstRewardXp = specialState.career.xp;
const secondSpecial = C190_Content.launchSpecial(specialState, "cerco_bancario");
assert(secondSpecial.ok, "completed special can replay");
resolveAll(specialState);
assert(specialState.content.special.attempts.cerco_bancario === 2, "special replay tracked");
assert(specialState.content.special.completed.filter((id) => id === "cerco_bancario").length === 1, "special completion unique");
assert(specialState.career.xp > firstRewardXp, "replay keeps normal call XP");

assert(C190_Content.cities.length === 9, "nine city modules");
assert(C190_Content.specialCases.length === 7, "seven special operations including F28");
assert(C190_Dispatch.templates.length >= 50, "realistic incident library expanded");
assert(C190_Immersion.VERSION === 1, "immersion module loaded");
assert(C190_Immersion.diagnostics(C190_Save.defaultState()).externalAudioFiles === 0, "immersion uses generated local audio");
assert(
  C190_Content.validateExpansion({ id: "test_pack", api: 1, content: [] }).ok,
  "valid expansion manifest accepted",
);
assert(
  !C190_Content.validateExpansion({ id: "?", api: 2, content: "bad" }).ok,
  "invalid expansion manifest rejected",
);

C190_Save.save(specialState);
const loaded = C190_Save.load();
assert(loaded.schema === 27, "schema 27 save reload");
assert(C190_Save.validate(loaded), "saved state checksum and structure valid");
assert(loaded.content.special.completed.includes("cerco_bancario"), "content progression persists");

console.log(
  JSON.stringify(
    {
      status: "PASS",
      checks,
      schema: loaded.schema,
      visualAssets: typeof C190_Assets === "object" ? C190_Assets.required.length : 0,
      templates: C190_Dispatch.templates.length,
      resourceDispatchVersion: C190_ResourceDispatch.VERSION,
      immersionVersion: C190_Immersion.VERSION,
      resources: C190_ResourceDispatch.resourcesFor(loaded).length,
      cities: C190_Content.cities.length,
      specials: C190_Content.specialCases.length,
      reports: loaded.content.stats.totalReports,
    },
    null,
    2,
  ),
);
