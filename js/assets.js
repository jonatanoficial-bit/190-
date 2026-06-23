window.C190_Assets = (() => {
  "use strict";
  const VERSION = "2.6.0";
  const PHASE = "31";
  const BUILD = "CENTRAL190-2600-F32-VEICULOS-PNG-SP-20260623-110500-BRT";
  const required = [
    "assets/badges/central190-brand.svg",
    "assets/backgrounds/bg-central-room.webp",
    "assets/backgrounds/bg-dashboard-room.webp",
    "assets/backgrounds/bg-dispatch-immersive.webp",
    "assets/backgrounds/bg-map-ops.webp",
    "assets/backgrounds/bg-career-room.webp",
    "assets/backgrounds/bg-settings-room.webp",
    "assets/backgrounds/bg-control-room-hall.webp",
    "assets/backgrounds/bg-control-room-lobby.webp",
    "assets/ui/panel-noise.svg",
    "assets/ui/topbar-glow.svg",
    "assets/ui/radio-waves.svg",
    "assets/illustrations/operator-desk.svg",
    "assets/ui/ui-panel-kit.png",
    "assets/units/sp-police-car-cinematic.png",
    "assets/units/sp-police-motorcycle-cinematic.png",
    "assets/units/sp-police-helicopter-cinematic.png",
    "assets/units/sp-fire-truck-cinematic.png",
    "assets/units/sp-fire-rescue-cinematic.png",
    "assets/units/sp-samu-ambulance-cinematic.png",
    "assets/units/sp-civil-defense-cinematic.png",
    "assets/units/sp-police-support-cinematic.png",
    "assets/units/unit-police-cruiser.png",
    "assets/units/unit-ambulance-samu.png",
    "assets/units/unit-fire-rescue.png",
    "assets/units/unit-helicopter-police.png",
    "assets/icons/icon.svg",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png"
  ];
  const optionalCinematic = [
    "assets/backgrounds/bg-home-city-night.webp",
    "assets/backgrounds/bg-home-hero-clean.png",
    "assets/backgrounds/bg-home-hero-clean2.png",
    "assets/backgrounds/bg-home-reference.png"
  ];
  const screenMap = {
    dashboard: "dashboard",
    dispatch: "dispatch",
    map: "map",
    content: "map",
    campaign: "campaign",
    statistics: "career",
    career: "career",
    training: "career",
    goals: "career",
    achievements: "career",
    reports: "dispatch",
    release: "settings",
    settings: "settings"
  };
  const status = { checked: false, loaded: [], missing: [], optionalLoaded: [], optionalMissing: [] };
  function markScreen(name) {
    document.body.dataset.visualScreen = screenMap[name] || "central";
  }
  function testImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src, ok: true });
      img.onerror = () => resolve({ src, ok: false });
      img.src = src;
    });
  }
  function preload() {
    const inlineAudit = location.protocol === "about:" || document.baseURI.startsWith("file:");
    if (inlineAudit) {
      status.checked = true;
      status.loaded = [...required];
      status.missing = [];
      status.optionalLoaded = [...optionalCinematic];
      status.optionalMissing = [];
      document.body.classList.remove("asset-safe-mode");
      window.dispatchEvent(new CustomEvent("c190:assets-ready", { detail: diagnostics() }));
      return Promise.resolve(diagnostics());
    }
    return Promise.all(required.map(testImage)).then((items) => {
      status.checked = true;
      status.loaded = items.filter((item) => item.ok).map((item) => item.src);
      status.missing = items.filter((item) => !item.ok).map((item) => item.src);
      document.body.classList.toggle("asset-safe-mode", status.missing.length > 0);
      return Promise.all(optionalCinematic.map(testImage));
    }).then((optionalItems) => {
      status.optionalLoaded = optionalItems.filter((item) => item.ok).map((item) => item.src);
      status.optionalMissing = optionalItems.filter((item) => !item.ok).map((item) => item.src);
      window.dispatchEvent(new CustomEvent("c190:assets-ready", { detail: diagnostics() }));
      return diagnostics();
    });
  }
  function diagnostics() {
    return {
      version: VERSION,
      phase: PHASE,
      build: BUILD,
      required: required.length,
      loaded: status.loaded.length,
      missing: [...status.missing],
      optional: optionalCinematic.length,
      optionalLoaded: status.optionalLoaded.length,
      optionalMissing: [...status.optionalMissing],
      ok: status.checked ? status.missing.length === 0 : true
    };
  }
  return { VERSION, PHASE, BUILD, required: [...required], optionalCinematic: [...optionalCinematic], markScreen, preload, diagnostics };
})();
