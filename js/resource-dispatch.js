window.C190_ResourceDispatch = (() => {
  "use strict";

  const VERSION = 1;
  const EARTH_LAT_METERS = 111320;

  const TYPE_LABELS = {
    pm: "Polícia Militar",
    bombeiros: "Bombeiros 193",
    samu: "SAMU 192",
    defesa: "Defesa Civil",
  };

  const UNIT_BLUEPRINTS = [
    { id: "pm-01", type: "pm", label: "Viatura PM 01", short: "PM-01", role: "patrulhamento", km: 1.4, angle: 0.18, capacity: 1, icon: "assets/units/sp-police-car-cinematic.png" },
    { id: "pm-02", type: "pm", label: "Viatura PM 02", short: "PM-02", role: "apoio de área", km: 2.6, angle: 2.12, capacity: 1, icon: "assets/units/sp-police-car-cinematic.png" },
    { id: "pm-rocam", type: "pm", label: "ROCAM/Moto patrulha", short: "ROCAM", role: "chegada rápida", km: 1.1, angle: 4.92, capacity: 1, icon: "assets/units/sp-police-motorcycle-cinematic.png" },
    { id: "pm-forca", type: "pm", label: "Força Tática", short: "FT", role: "alto risco", km: 4.0, angle: 5.72, capacity: 2, icon: "assets/units/sp-police-support-cinematic.png", minPriority: "critica" },
    { id: "bm-01", type: "bombeiros", label: "Bombeiros Auto Bomba", short: "AB-193", role: "incêndio e salvamento", km: 3.5, angle: 3.95, capacity: 2, icon: "assets/units/sp-fire-truck-cinematic.png" },
    { id: "bm-resgate", type: "bombeiros", label: "Bombeiros Resgate", short: "UR-193", role: "resgate técnico", km: 4.7, angle: 1.52, capacity: 2, icon: "assets/units/sp-fire-rescue-cinematic.png" },
    { id: "samu-usb", type: "samu", label: "SAMU USB", short: "USB-192", role: "suporte básico", km: 2.8, angle: 5.18, capacity: 1, icon: "assets/units/sp-samu-ambulance-cinematic.png" },
    { id: "samu-usa", type: "samu", label: "SAMU Avançado", short: "USA-192", role: "risco de vida", km: 5.2, angle: 0.96, capacity: 2, icon: "assets/units/sp-samu-ambulance-cinematic.png", minPriority: "critica" },
    { id: "defesa-01", type: "defesa", label: "Defesa Civil", short: "DC", role: "alagamento/risco estrutural", km: 5.9, angle: 2.86, capacity: 1, icon: "assets/units/sp-civil-defense-cinematic.png" },
    { id: "helicoptero", type: "pm", label: "Águia Helicóptero", short: "ÁGUIA", role: "busca e apoio aéreo", km: 7.2, angle: 3.34, capacity: 2, icon: "assets/units/sp-police-helicopter-cinematic.png", minPriority: "maxima" },
  ];

  const PRIORITY_LEVEL = { baixa: 1, media: 2, alta: 3, critica: 4, maxima: 5 };

  function centerOf(state) {
    return window.C190_Map?.centerOf?.(state) || state?.settings?.mapCenter || { lat: -23.55052, lng: -46.63331, label: "São Paulo — SP" };
  }

  function priorityLevel(id) {
    return PRIORITY_LEVEL[id] || 0;
  }

  function deterministicEta(unit, call) {
    const base = Number(unit.km || 2) * (unit.type === "pm" ? 2.3 : unit.type === "samu" ? 2.8 : 3.0);
    const stage = window.C190_LocationIntel?.normalize?.(call)?.stage || "none";
    const uncertainty = stage === "precise" ? 0 : stage === "block" ? 1 : stage === "street" ? 2 : stage === "region" ? 4 : 7;
    const statusDelay = unit.status === "em base" ? 1 : unit.status === "em retorno" ? 2 : 0;
    return Math.max(2, Math.round(base + uncertainty + statusDelay));
  }

  function resourcesFor(state) {
    const center = centerOf(state);
    const lat = Number(center.lat) || -23.55052;
    const lng = Number(center.lng) || -46.63331;
    const cos = Math.max(0.35, Math.cos((lat * Math.PI) / 180));
    const activeCall = (state?.dispatch?.shift?.calls || []).find((call) => call.id === state?.dispatch?.shift?.activeCallId);
    const selected = new Set(activeCall?.resourceDispatch?.selected || []);
    return UNIT_BLUEPRINTS.map((unit, index) => {
      const meters = Number(unit.km || 2) * 1000;
      const item = {
        ...unit,
        version: VERSION,
        status: unit.status || (index % 4 === 0 ? "em base" : "disponível"),
        selected: selected.has(unit.id),
        assignedTo: selected.has(unit.id) ? activeCall?.id || null : null,
        etaMin: activeCall ? Math.max(2, Math.round(deterministicEta(unit, activeCall) * (window.C190_UrbanDynamics?.etaMultiplier?.(state) || 1))) : Math.max(2, Math.round(Number(unit.km || 2) * 2.6 * (window.C190_UrbanDynamics?.etaMultiplier?.(state) || 1))),
        lat: Number((lat + Math.sin(unit.angle) * meters / EARTH_LAT_METERS).toFixed(6)),
        lng: Number((lng + Math.cos(unit.angle) * meters / (EARTH_LAT_METERS * cos)).toFixed(6)),
      };
      return item;
    });
  }

  function normalize(call) {
    if (!call) return null;
    const existing = call.resourceDispatch && typeof call.resourceDispatch === "object" ? call.resourceDispatch : {};
    const selected = Array.isArray(existing.selected) ? existing.selected.filter(Boolean) : [];
    call.resourceDispatch = {
      version: VERSION,
      selected,
      submitted: !!existing.submitted,
      evaluation: existing.evaluation || null,
      log: Array.isArray(existing.log) ? existing.log : [],
      updatedAt: existing.updatedAt || new Date().toISOString(),
    };
    return call.resourceDispatch;
  }

  function hasText(call, needles) {
    const text = `${call?.id || ""} ${call?.type || ""} ${call?.category || ""} ${(call?.tags || []).join(" ")} ${call?.summary || ""}`.toLowerCase();
    return needles.some((needle) => text.includes(needle));
  }

  function selectedResources(call, state) {
    const dispatch = normalize(call);
    const pool = resourcesFor(state);
    return dispatch.selected.map((id) => pool.find((unit) => unit.id === id)).filter(Boolean);
  }

  function requiredFor(call) {
    const triage = window.C190_Triage?.evaluate?.(call) || { recommended: { agency: "pm", priority: "media", nature: "community_order" } };
    const rec = triage.recommended || {};
    const selectedAgency = call?.triage?.agency || rec.agency || "pm";
    const priority = call?.triage?.priority || rec.priority || "media";
    const nature = call?.triage?.nature || rec.nature || "community_order";
    const level = priorityLevel(priority);
    const req = { pm: 0, bombeiros: 0, samu: 0, defesa: 0, minTotal: 1, priority, nature, agency: selectedAgency, notes: [] };
    const victimRisk = hasText(call, ["vítima", "vitima", "ferid", "inconsciente", "hospital", "médica", "medica", "criança", "queda"]);
    const weaponRisk = hasText(call, ["arma", "armad", "refém", "refens", "banco", "agressor", "roubo", "ameaça", "ameaça"]);
    const fireRisk = hasText(call, ["incêndio", "incendio", "fumaça", "gas", "elétrico", "eletrico"]);
    const weatherRisk = hasText(call, ["alag", "correnteza", "enchente", "desliz", "árvore", "arvore", "fios", "chuva"]);
    const trafficRisk = hasText(call, ["acidente", "colisão", "colisao", "trânsito", "transito", "semáforo", "semaforo"]);

    if (selectedAgency === "pm") req.pm = level >= 4 || weaponRisk ? 2 : 1;
    if (selectedAgency === "bombeiros") req.bombeiros = fireRisk || weatherRisk || level >= 4 ? 2 : 1;
    if (selectedAgency === "samu") req.samu = level >= 4 || victimRisk ? 1 : 1;
    if (selectedAgency === "multi") {
      req.pm = weaponRisk || nature === "domestic_violence" || nature === "crime_in_progress" || nature === "event_crowd" ? 1 : 0;
      req.bombeiros = fireRisk || weatherRisk || trafficRisk || nature === "fire_rescue" || nature === "weather_disaster" || nature === "remote_rescue" ? 1 : 0;
      req.samu = victimRisk || nature === "medical_emergency" || trafficRisk || level >= 4 ? 1 : 0;
      if (!req.pm && !req.bombeiros && !req.samu) req.pm = 1;
    }

    if (victimRisk && selectedAgency !== "samu") req.samu = Math.max(req.samu, level >= 4 ? 1 : 0);
    if ((weaponRisk || nature === "domestic_violence" || nature === "crime_in_progress") && selectedAgency !== "pm") req.pm = Math.max(req.pm, 1);
    if ((fireRisk || weatherRisk || nature === "fire_rescue" || nature === "weather_disaster" || nature === "remote_rescue") && selectedAgency !== "bombeiros") req.bombeiros = Math.max(req.bombeiros, 1);
    if (weatherRisk || nature === "infrastructure_risk") req.defesa = Math.max(req.defesa, level >= 4 ? 1 : 0);

    req.minTotal = Math.max(1, req.pm + req.bombeiros + req.samu + req.defesa, level >= 5 ? 2 : level >= 4 ? 2 : 1);
    if (req.pm) req.notes.push(`${req.pm} unidade(s) PM`);
    if (req.bombeiros) req.notes.push(`${req.bombeiros} unidade(s) Bombeiros`);
    if (req.samu) req.notes.push(`${req.samu} unidade(s) SAMU`);
    if (req.defesa) req.notes.push(`${req.defesa} apoio Defesa Civil`);
    return req;
  }

  function counts(resources) {
    return resources.reduce((acc, unit) => {
      acc[unit.type] = (acc[unit.type] || 0) + 1;
      return acc;
    }, { pm: 0, bombeiros: 0, samu: 0, defesa: 0 });
  }

  function evaluate(call, state) {
    normalize(call);
    const req = requiredFor(call);
    const selected = selectedResources(call, state);
    const c = counts(selected);
    const details = [];
    let score = 42;

    for (const type of ["pm", "bombeiros", "samu", "defesa"]) {
      const need = Number(req[type] || 0);
      if (!need) continue;
      if (c[type] >= need) {
        score += type === "defesa" ? 7 : 15;
        details.push(`${TYPE_LABELS[type]} suficiente`);
      } else if (c[type] > 0) {
        score += 3;
        details.push(`${TYPE_LABELS[type]} insuficiente`);
      } else {
        score -= type === "defesa" ? 5 : 17;
        details.push(`faltou ${TYPE_LABELS[type]}`);
      }
    }

    if (!selected.length) {
      score -= 25;
      details.push("nenhuma unidade selecionada");
    }
    if (selected.length >= req.minTotal) score += 9;
    else {
      score -= 10;
      details.push("quantidade abaixo do mínimo operacional");
    }

    const extra = selected.length - req.minTotal;
    if (extra > 2) {
      score -= 7;
      details.push("despacho excessivo sobrecarrega a central");
    } else if (extra > 0) {
      score += 2;
      details.push("reforço conservador aceitável");
    }

    const minEta = selected.length ? Math.min(...selected.map((unit) => Number(unit.etaMin || 99))) : 99;
    if (minEta <= 5) { score += 8; details.push(`primeira unidade em ${minEta} min`); }
    else if (minEta <= 9) { score += 2; details.push(`chegada moderada em ${minEta} min`); }
    else { score -= 6; details.push(`chegada lenta em ${minEta} min`); }

    const loc = window.C190_LocationIntel?.normalize?.(call);
    const confidence = Number(loc?.confidence || 0);
    if (confidence >= 0.78) score += 8;
    else if (confidence >= 0.55) { score += 2; details.push("localização ainda aproximada"); }
    else { score -= 14; details.push("despacho com localização fraca"); }

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    const grade = finalScore >= 92 ? "S" : finalScore >= 80 ? "A" : finalScore >= 68 ? "B" : finalScore >= 55 ? "C" : "D";
    const modifier = grade === "S" ? 3 : grade === "A" ? 2 : grade === "B" ? 1 : grade === "C" ? 0 : -4;
    const result = {
      version: VERSION,
      finalScore,
      grade,
      modifier,
      required: req,
      selected: selected.map((unit) => ({ id: unit.id, type: unit.type, label: unit.label, etaMin: unit.etaMin })),
      selectedIds: selected.map((unit) => unit.id),
      detail: details,
      missing: [
        c.pm < req.pm ? "PM" : null,
        c.bombeiros < req.bombeiros ? "Bombeiros" : null,
        c.samu < req.samu ? "SAMU" : null,
        c.defesa < req.defesa ? "Defesa Civil" : null,
      ].filter(Boolean),
    };
    call.resourceDispatch.evaluation = result;
    return result;
  }

  function toggle(state, callId, resourceId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    const dispatch = normalize(call);
    const pool = resourcesFor(state);
    if (!pool.some((unit) => unit.id === resourceId)) return { ok: false, reason: "resource_not_found" };
    const selected = new Set(dispatch.selected);
    if (selected.has(resourceId)) selected.delete(resourceId);
    else selected.add(resourceId);
    dispatch.selected = [...selected];
    dispatch.updatedAt = new Date().toISOString();
    dispatch.log.unshift({ at: new Date().toISOString(), action: selected.has(resourceId) ? "select" : "remove", resourceId });
    dispatch.evaluation = evaluate(call, state);
    return { ok: true, call, dispatch, evaluation: dispatch.evaluation };
  }

  function clear(state, callId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    const dispatch = normalize(call);
    dispatch.selected = [];
    dispatch.updatedAt = new Date().toISOString();
    dispatch.log.unshift({ at: new Date().toISOString(), action: "clear" });
    dispatch.evaluation = evaluate(call, state);
    return { ok: true, call, dispatch, evaluation: dispatch.evaluation };
  }

  function recommend(state, callId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    const dispatch = normalize(call);
    const req = requiredFor(call);
    const pool = resourcesFor(state).sort((a, b) => Number(a.etaMin || 99) - Number(b.etaMin || 99));
    const selected = [];
    for (const type of ["pm", "bombeiros", "samu", "defesa"]) {
      const need = Number(req[type] || 0);
      if (!need) continue;
      pool.filter((unit) => unit.type === type).slice(0, need).forEach((unit) => selected.push(unit.id));
    }
    if (!selected.length) {
      const firstPm = pool.find((unit) => unit.type === "pm") || pool[0];
      if (firstPm) selected.push(firstPm.id);
    }
    dispatch.selected = [...new Set(selected)];
    dispatch.updatedAt = new Date().toISOString();
    dispatch.log.unshift({ at: new Date().toISOString(), action: "recommend", selected: [...dispatch.selected] });
    dispatch.evaluation = evaluate(call, state);
    return { ok: true, call, dispatch, evaluation: dispatch.evaluation };
  }

  function applyDecision(call, outcome, state) {
    const evaluation = evaluate(call, state);
    normalize(call).submitted = true;
    call.resourceDispatchResult = evaluation;
    const quality = Number(outcome?.quality || 0) + evaluation.modifier;
    const xpMultiplier = evaluation.grade === "S" ? 1.18 : evaluation.grade === "A" ? 1.08 : evaluation.grade === "D" ? 0.45 : 1;
    const repAdjustment = evaluation.modifier + (evaluation.grade === "S" ? 1 : 0);
    return {
      ...outcome,
      quality,
      xp: Math.max(0, Math.round(Number(outcome?.xp || 0) * xpMultiplier)),
      rep: Number(outcome?.rep || 0) + repAdjustment,
      resolved: quality >= 1,
      failed: quality < 1,
      resourceDispatch: evaluation,
    };
  }

  return {
    VERSION,
    TYPE_LABELS,
    UNIT_BLUEPRINTS,
    resourcesFor,
    normalize,
    selectedResources,
    requiredFor,
    evaluate,
    toggle,
    clear,
    recommend,
    applyDecision,
  };
})();
