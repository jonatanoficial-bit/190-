window.C190_FieldUnits = (() => {
  "use strict";

  const VERSION = 1;
  const MIN_TRAVEL_SECONDS = 10;
  const MAX_TRAVEL_SECONDS = 56;

  function nowMs() { return Date.now(); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function activeShift(state) { return state?.dispatch?.shift || null; }
  function calls(state) { return activeShift(state)?.calls || []; }
  function displayLocation(call) { return window.C190_Map?.displayLocation?.(call) || null; }
  function selectedIds(call) {
    const result = call?.resourceDispatchResult?.selectedIds || call?.resourceDispatch?.evaluation?.selectedIds || call?.resourceDispatch?.selected || [];
    return Array.isArray(result) ? result.filter(Boolean) : [];
  }
  function radioOf(call) {
    return window.C190_FieldRadio?.normalize?.(call) || call?.fieldRadio || null;
  }
  function missionCall(state) {
    const shift = activeShift(state);
    if (!shift?.active) return null;
    const active = calls(state).find((call) => call.id === shift.activeCallId && call.status === "active");
    if (active?.fieldRadio?.active || active?.fieldRadio?.finalized || selectedIds(active).length) return active;
    return calls(state).find((call) => (call.fieldRadio?.active || call.fieldRadio?.finalized) && displayLocation(call)?.visible) || active || null;
  }
  function travelSeconds(unit, call) {
    const eta = Number(unit?.etaMin || 4);
    return clamp(eta * 8, MIN_TRAVEL_SECONDS, MAX_TRAVEL_SECONDS);
  }
  function stageBase(radio) {
    if (!radio) return 0;
    if (radio.finalized) return 1;
    if (!radio.active) return 0;
    const stage = Number(radio.stage || 0);
    if (stage <= 0) return 0.08;
    if (stage === 1) return 0.36;
    if (stage === 2) return 0.68;
    return 0.90;
  }
  function progressFor(unit, call) {
    const radio = radioOf(call);
    if (!radio?.active && !radio?.finalized) return 0;
    const started = Date.parse(radio.startedAt || call?.resourceDispatch?.updatedAt || call?.updatedAt || new Date().toISOString());
    const elapsed = Number.isFinite(started) ? Math.max(0, (nowMs() - started) / 1000) : 0;
    const timeProgress = elapsed / travelSeconds(unit, call);
    return clamp(Math.max(timeProgress, stageBase(radio)), 0, radio?.finalized ? 1 : 0.97);
  }
  function interpolate(from, to, progress) {
    return {
      lat: Number(from.lat) + (Number(to.lat) - Number(from.lat)) * progress,
      lng: Number(from.lng) + (Number(to.lng) - Number(from.lng)) * progress,
    };
  }
  function movingResources(state) {
    const call = missionCall(state);
    if (!call) return [];
    const display = displayLocation(call);
    if (!display?.visible || !Number.isFinite(Number(display.lat)) || !Number.isFinite(Number(display.lng))) return [];
    const selected = new Set(selectedIds(call));
    if (!selected.size) return [];
    const pool = window.C190_ResourceDispatch?.resourcesFor?.(state) || [];
    const target = { lat: Number(display.lat), lng: Number(display.lng) };
    return pool.filter((unit) => selected.has(unit.id)).map((unit) => {
      const start = { lat: Number(unit.lat), lng: Number(unit.lng) };
      const progress = progressFor(unit, call);
      const current = interpolate(start, target, progress);
      return {
        ...unit,
        assignedTo: call.id,
        assignedCallType: call.type,
        progress,
        moving: progress > 0 && progress < 1,
        arrived: progress >= 0.96,
        targetLat: target.lat,
        targetLng: target.lng,
        lat: Number(current.lat.toFixed(6)),
        lng: Number(current.lng.toFixed(6)),
      };
    });
  }
  function staticResources(state) {
    const moving = movingResources(state);
    const movingIds = new Set(moving.map((unit) => unit.id));
    const base = window.C190_ResourceDispatch?.resourcesFor?.(state) || window.C190_LocationIntel?.resourcesFor?.(state) || [];
    return base.filter((unit) => !movingIds.has(unit.id));
  }
  function resourcesForMap(state) {
    return [...staticResources(state), ...movingResources(state)];
  }
  function diagnostics(state) {
    const moving = movingResources(state);
    return { version: VERSION, movingUnits: moving.length, units: moving.map((u) => ({ id: u.id, progress: Math.round(u.progress * 100), call: u.assignedTo })) };
  }
  return { VERSION, resourcesForMap, movingResources, diagnostics };
})();
