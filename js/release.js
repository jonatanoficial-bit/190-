window.C190_Release = (() => {
  "use strict";

  const VERSION = "1.5.0";
  const PHASE = 21;
  const BALANCE_VERSION = 2;
  const BUILD = "CENTRAL190-1500-F21-RESOURCE-DISPATCH-20260619-144500-BRT";
  const DEFAULT_CITY = { lat: -23.55052, lng: -46.63331, label: "São Paulo — SP" };
  let deferredInstallPrompt = null;


  const localeCopy = {
    "pt-BR": {
      assistedLabel: "Assistido", assistedDesc: "Mais tempo para decidir e penalidades reduzidas.",
      realisticLabel: "Realista", realisticDesc: "Ritmo e consequências equilibrados para a carreira principal.",
      expertLabel: "Especialista", expertDesc: "Chamadas mais rápidas, menos tolerância e recompensas maiores.",
      viewport: "Viewport responsivo", storage: "Armazenamento local", worker: "Service Worker", fullscreen: "Tela cheia", input: "Entrada", capacity: "Capacidade do dispositivo",
      saveMigration: "Save e migração", balance: "Balanceamento", offline: "Offline", privacy: "Privacidade", accessibility: "Acessibilidade", diagnostics: "Diagnóstico anti-quebra", compatibility: "Compatibilidade do aparelho", credits: "Créditos e licenças", visual: "Identidade visual", callProtocol: "Atendimento por ligação", triage: "Triagem e despacho",
      installed: "Aplicativo instalado", installReady: "Instalação disponível", installBrowser: "Use o menu do navegador para instalar"
    },
    en: {
      assistedLabel: "Assisted", assistedDesc: "More time to decide with reduced penalties.",
      realisticLabel: "Realistic", realisticDesc: "Balanced pace and consequences for the main career.",
      expertLabel: "Expert", expertDesc: "Faster calls, lower tolerance and larger rewards.",
      viewport: "Responsive viewport", storage: "Local storage", worker: "Service Worker", fullscreen: "Fullscreen", input: "Input", capacity: "Device capacity",
      saveMigration: "Save and migration", balance: "Balancing", offline: "Offline", privacy: "Privacy", accessibility: "Accessibility", diagnostics: "Anti-break diagnostics", compatibility: "Device compatibility", credits: "Credits and licenses", visual: "Visual identity", callProtocol: "Call handling protocol", triage: "Triage and dispatch",
      installed: "App installed", installReady: "Installation available", installBrowser: "Use the browser menu to install"
    },
    es: {
      assistedLabel: "Asistido", assistedDesc: "Más tiempo para decidir y penalizaciones reducidas.",
      realisticLabel: "Realista", realisticDesc: "Ritmo y consecuencias equilibrados para la carrera principal.",
      expertLabel: "Especialista", expertDesc: "Llamadas más rápidas, menor tolerancia y mayores recompensas.",
      viewport: "Vista adaptable", storage: "Almacenamiento local", worker: "Service Worker", fullscreen: "Pantalla completa", input: "Entrada", capacity: "Capacidad del dispositivo",
      saveMigration: "Guardado y migración", balance: "Balance", offline: "Sin conexión", privacy: "Privacidad", accessibility: "Accesibilidad", diagnostics: "Diagnóstico anti-fallos", compatibility: "Compatibilidad del dispositivo", credits: "Créditos y licencias", visual: "Identidad visual", callProtocol: "Protocolo de atención", triage: "Triaje y despacho",
      installed: "Aplicación instalada", installReady: "Instalación disponible", installBrowser: "Usa el menú del navegador para instalar"
    }
  };

  function copy() {
    return localeCopy[window.C190_I18N?.language] || localeCopy["pt-BR"];
  }

  const balanceProfiles = {
    assistido: {
      id: "assistido",
      label: "Assistido",
      arrivalFactor: 1.25,
      escalationAt: 42,
      abandonLimit: 110,
      positiveXpFactor: 0.9,
      positiveRepFactor: 1,
      negativeRepFactor: 0.65,
      description: "Mais tempo para decidir e penalidades reduzidas.",
    },
    realista: {
      id: "realista",
      label: "Realista",
      arrivalFactor: 1,
      escalationAt: 30,
      abandonLimit: 78,
      positiveXpFactor: 1,
      positiveRepFactor: 1,
      negativeRepFactor: 1,
      description: "Ritmo e consequências equilibrados para a carreira principal.",
    },
    especialista: {
      id: "especialista",
      label: "Especialista",
      arrivalFactor: 0.8,
      escalationAt: 24,
      abandonLimit: 60,
      positiveXpFactor: 1.15,
      positiveRepFactor: 1.1,
      negativeRepFactor: 1.35,
      description: "Chamadas mais rápidas, menos tolerância e recompensas maiores.",
    },
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalize(state) {
    if (!state || typeof state !== "object") return state;
    state.settings = state.settings || {};
    const defaults = {
      largeText: false,
      reduceMotion: false,
      highContrast: false,
      largeTargets: false,
      screenReaderHints: true,
      mapMode: "auto",
      mapCenter: { ...DEFAULT_CITY },
      mapZoom: 14,
      mapPrivacy: "approximate",
      telemetry: false,
      autosaveSeconds: 5,
    };
    state.settings = { ...defaults, ...state.settings, telemetry: false };
    state.release = {
      version: VERSION,
      phase: PHASE,
      balanceVersion: BALANCE_VERSION,
      visualRecovery: 1,
      callProtocolVersion: 2,
      triageVersion: 1,
      locationIntelVersion: 1,
      resourceDispatchVersion: 1,
      firstOpenedAt: state.release?.firstOpenedAt || new Date().toISOString(),
      notesSeen: !!state.release?.notesSeen,
      privacySeen: !!state.release?.privacySeen,
      installDismissed: !!state.release?.installDismissed,
      lastDeviceAudit: state.release?.lastDeviceAudit || null,
    };
    return state;
  }

  function profileFor(state) {
    const id = balanceProfiles[state?.profile?.difficulty] ? state.profile.difficulty : "realista";
    const profile = balanceProfiles[id];
    const text = copy();
    const localized = id === "assistido"
      ? { label: text.assistedLabel, description: text.assistedDesc }
      : id === "especialista"
        ? { label: text.expertLabel, description: text.expertDesc }
        : { label: text.realisticLabel, description: text.realisticDesc };
    return { ...profile, ...localized };
  }

  function shiftBalance(state, options = {}) {
    const profile = profileFor(state);
    const isSandbox = options.mode === "sandbox";
    const baseGap = Math.max(4, Math.min(40, Number(options.arrivalGap || 18)));
    return {
      difficulty: profile.id,
      difficultyLabel: profile.label,
      arrivalGap: isSandbox ? baseGap : Math.max(4, Math.round(baseGap * profile.arrivalFactor)),
      escalationAt: isSandbox ? 30 : profile.escalationAt,
      abandonLimit: isSandbox ? Math.max(72, baseGap * 8) : profile.abandonLimit,
      balanceVersion: BALANCE_VERSION,
    };
  }

  function adjustOutcome(state, outcome) {
    const profile = profileFor(state);
    const xp = Number(outcome.xp || 0);
    const rep = Number(outcome.rep || 0);
    return {
      ...outcome,
      xp: Math.max(0, Math.round(xp * profile.positiveXpFactor)),
      rep: Math.round(rep * (rep < 0 ? profile.negativeRepFactor : profile.positiveRepFactor)),
      difficulty: profile.id,
      balanceVersion: BALANCE_VERSION,
    };
  }

  function storageBytes() {
    try {
      let total = 0;
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index) || "";
        total += key.length + String(localStorage.getItem(key) || "").length;
      }
      return total * 2;
    } catch {
      return 0;
    }
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function standalone() {
    return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true;
  }

  function deviceAudit() {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const touch = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
    const memory = Number(navigator.deviceMemory || 0);
    const cores = Number(navigator.hardwareConcurrency || 0);
    const text = copy();
    const checks = [
      { name: text.viewport, ok: width >= 320 && height >= 480, detail: `${width}×${height}` },
      { name: text.storage, ok: (() => { try { localStorage.setItem("__c190_release", "1"); localStorage.removeItem("__c190_release"); return true; } catch { return false; } })(), detail: "Save local e backup" },
      { name: text.worker, ok: "serviceWorker" in navigator, detail: "Instalação e modo offline" },
      { name: text.fullscreen, ok: !!document.documentElement.requestFullscreen || standalone(), detail: standalone() ? "Aplicativo instalado" : "API disponível" },
      { name: text.input, ok: true, detail: touch ? "Toque e teclado" : "Mouse e teclado" },
      { name: text.capacity, ok: !memory || memory >= 2, detail: `${memory || "não informada"} GB RAM · ${cores || "?"} núcleos` },
    ];
    const result = {
      ok: checks.every((item) => item.ok),
      checks,
      viewport: { width, height },
      touch,
      online: navigator.onLine,
      standalone: standalone(),
      userAgent: navigator.userAgent,
      at: new Date().toISOString(),
    };
    return result;
  }

  function privacySummary(state) {
    normalize(state);
    const center = state.settings.mapCenter || DEFAULT_CITY;
    return {
      telemetry: false,
      accountRequired: false,
      cloudUpload: false,
      localOnly: true,
      approximateLocation: center.label === "Região aproximada do jogador",
      mapCenterLabel: center.label,
      storageBytes: storageBytes(),
      storageLabel: formatBytes(storageBytes()),
    };
  }

  function releaseChecklist(state) {
    normalize(state);
    const diagnostics = window.C190_AntiBreak?.diagnostics?.(state);
    const device = deviceAudit();
    const privacy = privacySummary(state);
    const text = copy();
    return [
      { name: text.saveMigration, ok: state.schema === 19, detail: "Compatível com schemas 10–18" },
      { name: text.balance, ok: state.release.balanceVersion === BALANCE_VERSION, detail: profileFor(state).label },
      { name: text.visual, ok: window.C190_Assets?.diagnostics?.().ok !== false, detail: `${window.C190_Assets?.diagnostics?.().loaded || 0}/${window.C190_Assets?.diagnostics?.().required || 0} assets carregados` },
      { name: text.callProtocol, ok: !!window.C190_CallProtocol && state.release.callProtocolVersion === 2, detail: `${window.C190_CallProtocol?.QUESTION_BANK?.length || 0} perguntas fixas · localização progressiva` },
      { name: "Mapa progressivo", ok: !!window.C190_LocationIntel && state.release.locationIntelVersion === 1, detail: `${window.C190_LocationIntel?.STAGES?.length || 0} estágios de precisão` },
      { name: "Despacho de unidades", ok: !!window.C190_ResourceDispatch && state.release.resourceDispatchVersion === 1, detail: `${window.C190_ResourceDispatch?.UNIT_BLUEPRINTS?.length || 0} recursos operacionais` },
      { name: text.offline, ok: "serviceWorker" in navigator, detail: navigator.onLine ? "Online com fallback" : "Executando sem conexão" },
      { name: text.privacy, ok: privacy.telemetry === false && privacy.localOnly, detail: "Sem telemetria e sem conta obrigatória" },
      { name: text.accessibility, ok: true, detail: "Contraste, alvos ampliados, teclado e redução de movimento" },
      { name: text.diagnostics, ok: diagnostics ? diagnostics.ok : true, detail: diagnostics?.ok ? "Aprovado" : "Executar novamente" },
      { name: text.compatibility, ok: device.ok, detail: `${device.viewport.width}×${device.viewport.height}` },
      { name: text.credits, ok: true, detail: "Leaflet/OpenStreetMap documentados" },
    ];
  }

  function applyAccessibility(state) {
    normalize(state);
    document.body.classList.toggle("large-text", !!state.settings.largeText);
    document.body.classList.toggle("reduce-motion", !!state.settings.reduceMotion);
    document.body.classList.toggle("high-contrast", !!state.settings.highContrast);
    document.body.classList.toggle("large-targets", !!state.settings.largeTargets);
    document.body.classList.toggle("screen-reader-hints", !!state.settings.screenReaderHints);
  }

  function clearApproximateLocation(state) {
    normalize(state);
    const city = window.C190_Content?.cityById?.(state.content?.activeCityId || "sp");
    state.settings.mapCenter = city
      ? { ...city.center, label: city.name }
      : { ...DEFAULT_CITY };
    return state.settings.mapCenter;
  }

  function installStatus() {
    const text = copy();
    if (standalone()) return { code: "installed", label: text.installed };
    if (deferredInstallPrompt) return { code: "ready", label: text.installReady };
    return { code: "browser", label: text.installBrowser };
  }

  async function requestInstall() {
    if (!deferredInstallPrompt) return { ok: false, reason: standalone() ? "installed" : "unavailable" };
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return { ok: choice.outcome === "accepted", reason: choice.outcome };
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    window.dispatchEvent(new CustomEvent("c190:install-ready"));
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    window.dispatchEvent(new CustomEvent("c190:installed"));
  });

  return {
    VERSION,
    PHASE,
    BUILD,
    BALANCE_VERSION,
    balanceProfiles: clone(balanceProfiles),
    normalize,
    profileFor,
    shiftBalance,
    adjustOutcome,
    deviceAudit,
    privacySummary,
    releaseChecklist,
    applyAccessibility,
    clearApproximateLocation,
    installStatus,
    requestInstall,
    standalone,
  };
})();
