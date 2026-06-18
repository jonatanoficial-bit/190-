window.C190_Assets = (() => {
  "use strict";
  const VERSION = "1.1.0";
  const PHASE = 17;
  const BUILD = "CENTRAL190-1100-F17-ASSET-RECOVERY-20260618-100837-BRT";
  const required = [
    "assets/badges/central190-brand.svg",
    "assets/backgrounds/bg-central-190.svg",
    "assets/backgrounds/bg-dashboard.svg",
    "assets/backgrounds/bg-dispatch.svg",
    "assets/backgrounds/bg-map.svg",
    "assets/backgrounds/bg-career.svg",
    "assets/backgrounds/bg-settings.svg",
    "assets/ui/panel-noise.svg",
    "assets/ui/topbar-glow.svg",
    "assets/ui/radio-waves.svg",
    "assets/illustrations/operator-desk.svg",
    "assets/icons/icon.svg",
    "assets/icons/icon-192.png",
    "assets/icons/icon-512.png"
  ];
  const screenMap = {
    dashboard: "dashboard",
    dispatch: "dispatch",
    map: "map",
    content: "map",
    statistics: "career",
    career: "career",
    training: "career",
    goals: "career",
    achievements: "career",
    reports: "dispatch",
    release: "settings",
    settings: "settings"
  };
  const status = { checked: false, loaded: [], missing: [] };
  function markScreen(name) {
    document.body.dataset.visualScreen = screenMap[name] || "central";
  }
  function preload() {
    const inlineAudit = location.protocol === "about:" || document.baseURI.startsWith("file:");
    if (inlineAudit) {
      status.checked = true;
      status.loaded = [...required];
      status.missing = [];
      document.body.classList.remove("asset-safe-mode");
      window.dispatchEvent(new CustomEvent("c190:assets-ready", { detail: diagnostics() }));
      return Promise.resolve(diagnostics());
    }
    const tests = required.map((src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src, ok: true });
      img.onerror = () => resolve({ src, ok: false });
      img.src = src;
    }));
    return Promise.all(tests).then((items) => {
      status.checked = true;
      status.loaded = items.filter((item) => item.ok).map((item) => item.src);
      status.missing = items.filter((item) => !item.ok).map((item) => item.src);
      document.body.classList.toggle("asset-safe-mode", status.missing.length > 0);
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
      ok: status.checked ? status.missing.length === 0 : true
    };
  }
  return { VERSION, PHASE, BUILD, required: [...required], markScreen, preload, diagnostics };
})();
