window.C190_LocationIntel = (() => {
  "use strict";

  const VERSION = 1;
  const EARTH_LAT_METERS = 111320;

  const STAGES = [
    { id: "none", label: "Sem localização", confidence: 0, radius: 0, tone: "locked", hint: "Pergunte endereço, bairro ou referência antes de abrir no mapa." },
    { id: "region", label: "Área aproximada", confidence: 0.25, radius: 1800, tone: "low", hint: "Bairro ou ponto de referência recebido. Ainda há risco de deslocamento para área ampla." },
    { id: "street", label: "Rua provável", confidence: 0.55, radius: 650, tone: "medium", hint: "Rua/local informado, mas número e referência ainda não estão confirmados." },
    { id: "block", label: "Quadra provável", confidence: 0.78, radius: 260, tone: "good", hint: "Rua com número ou referência. Unidade pode se deslocar com margem moderada." },
    { id: "precise", label: "Local confirmado", confidence: 0.95, radius: 80, tone: "precise", hint: "Endereço, número e referência suficientes para despacho preciso." },
  ];
  const byId = Object.fromEntries(STAGES.map((stage) => [stage.id, stage]));

  function seedFrom(text) {
    let value = 2166136261;
    String(text || "central190").split("").forEach((char) => {
      value ^= char.charCodeAt(0);
      value = Math.imul(value, 16777619);
    });
    return value >>> 0;
  }

  function deterministicNumber(call) {
    const seed = seedFrom(`${call?.templateId || call?.id}-${call?.location}`);
    return 10 + (seed % 880);
  }

  function deterministicDistrict(call) {
    const region = String(call?.region || "Região operacional").split("—")[0].trim();
    const options = ["Centro operacional", "Setor Norte", "Setor Sul", "Vila Operacional", "Jardim Central", "Zona Leste"];
    return call?.district || `${options[seedFrom(call?.id || call?.type) % options.length]} · ${region}`;
  }

  function enrichProfile(call) {
    if (!call) return null;
    const number = deterministicNumber(call);
    const reference = call.protocol?.profile?.reference || "próximo a um ponto de referência informado pelo solicitante";
    const street = call.location || "via não informada";
    const neighborhood = deterministicDistrict(call);
    const profile = {
      neighborhood: `Estou no bairro/setor ${neighborhood}.`,
      street: `A rua ou local principal é ${street}.`,
      number: `Consegui ver o número ${number}.`,
      address: `Fica em ${street}, número ${number}.`,
      reference: `O ponto de referência é ${reference.replace(/^É\s+/i, "")}.`,
    };
    call.locationIntel = {
      ...(call.locationIntel || {}),
      version: VERSION,
      street,
      number,
      neighborhood,
      reference: profile.reference,
      updatedAt: call.locationIntel?.updatedAt || new Date().toISOString(),
    };
    return profile;
  }

  function askedSet(call) {
    const asked = call?.protocol?.asked;
    return new Set(Array.isArray(asked) ? asked : []);
  }

  function stageFor(call) {
    if (!call) return byId.none;
    const asked = askedSet(call);
    const collected = call.protocol?.collected || {};
    const hasAddress = asked.has("address") || !!collected.address;
    const hasReference = asked.has("reference") || !!collected.reference;
    const hasNeighborhood = asked.has("neighborhood") || !!collected.neighborhood;
    const hasStreet = asked.has("street") || !!collected.street;
    const hasNumber = asked.has("number") || !!collected.number;

    if ((hasAddress && hasNumber && hasReference) || (hasStreet && hasNumber && hasReference)) return byId.precise;
    if ((hasAddress && hasNumber) || (hasStreet && hasNumber) || (hasAddress && hasReference) || (hasStreet && hasReference)) return byId.block;
    if (hasAddress || hasStreet) return byId.street;
    if (hasReference || hasNeighborhood || Number(call.protocol?.locationConfidence || 0) >= 0.2) return byId.region;
    return byId.none;
  }

  function normalize(call) {
    if (!call) return null;
    enrichProfile(call);
    const stage = stageFor(call);
    const previous = call.locationIntel || {};
    call.locationIntel = {
      ...previous,
      version: VERSION,
      stage: stage.id,
      confidence: stage.confidence,
      radiusMeters: stage.radius,
      label: stage.label,
      hint: stage.hint,
      updatedAt: new Date().toISOString(),
    };
    if (call.protocol) {
      call.protocol.locationConfidence = Math.max(Number(call.protocol.locationConfidence || 0), stage.confidence);
      if (stage.confidence > 0) call.locationRevealed = true;
      if (stage.confidence >= 0.95) call.locationConfirmed = true;
    }
    return call.locationIntel;
  }

  function displayLocation(call) {
    const stage = normalize(call) || byId.none;
    const actualLat = Number(call?.lat);
    const actualLng = Number(call?.lng);
    if (!Number.isFinite(actualLat) || !Number.isFinite(actualLng)) return null;
    if (stage.confidence <= 0) return { visible: false, stage };

    const seed = seedFrom(`${call?.id}-${stage.stage || stage.id}`);
    const stageDef = byId[stage.stage] || byId.region;
    const radius = Number(stage.radiusMeters || stageDef.radius || 0);
    const offsetMeters = stageDef.id === "precise" ? 0 : Math.max(30, radius * 0.42);
    const angle = ((seed % 360) * Math.PI) / 180;
    const latOffset = (Math.sin(angle) * offsetMeters) / EARTH_LAT_METERS;
    const lngOffset = (Math.cos(angle) * offsetMeters) / (EARTH_LAT_METERS * Math.max(0.35, Math.cos((actualLat * Math.PI) / 180)));
    return {
      visible: true,
      lat: Number((actualLat + latOffset).toFixed(6)),
      lng: Number((actualLng + lngOffset).toFixed(6)),
      actualLat,
      actualLng,
      radiusMeters: radius,
      stage: stageDef,
      stageId: stageDef.id,
      label: stageDef.label,
      confidence: stageDef.confidence,
      precise: stageDef.id === "precise",
      hint: stageDef.hint,
    };
  }

  function qualityLabel(call) {
    return (byId[normalize(call)?.stage] || byId.none).label;
  }

  function missingForPrecision(call) {
    const asked = askedSet(call);
    const missing = [];
    if (!asked.has("address") && !asked.has("street")) missing.push("rua/endereço");
    if (!asked.has("number")) missing.push("número");
    if (!asked.has("reference")) missing.push("referência");
    return missing;
  }

  function resourcesFor(state) {
    const center = state?.settings?.mapCenter || { lat: -23.55052, lng: -46.63331, label: "São Paulo — SP" };
    const lat = Number(center.lat) || -23.55052;
    const lng = Number(center.lng) || -46.63331;
    const cos = Math.max(0.35, Math.cos((lat * Math.PI) / 180));
    const mk = (id, type, label, angle, km, status = "disponível") => {
      const meters = km * 1000;
      return {
        id,
        type,
        label,
        status,
        etaMin: Math.max(2, Math.round(km * 2.7 + (type === "samu" ? 2 : 0))),
        lat: Number((lat + Math.sin(angle) * meters / EARTH_LAT_METERS).toFixed(6)),
        lng: Number((lng + Math.cos(angle) * meters / (EARTH_LAT_METERS * cos)).toFixed(6)),
      };
    };
    return [
      mk("pm-01", "pm", "Viatura PM 01", 0.15, 1.8),
      mk("pm-02", "pm", "Viatura PM 02", 2.1, 3.4),
      mk("bm-01", "bombeiros", "Unidade Bombeiros", 4.0, 4.1),
      mk("samu-01", "samu", "SAMU USB", 5.2, 3.1),
      mk("samu-uti", "samu", "SAMU Avançado", 1.25, 5.6, "em base"),
    ];
  }

  return {
    VERSION,
    STAGES,
    normalize,
    enrichProfile,
    displayLocation,
    qualityLabel,
    missingForPrecision,
    resourcesFor,
  };
})();
