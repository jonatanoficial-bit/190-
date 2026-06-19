window.C190_Save = (() => {
  "use strict";

  const KEY = "central190_save_v21";
  const BACKUP = "central190_save_v21_backup";
  const LEGACY = [
    "central190_save_v20",
    "central190_save_v20_backup",
    "central190_save_v19",
    "central190_save_v19_backup",
    "central190_save_v18",
    "central190_save_v18_backup",
    "central190_save_v17",
    "central190_save_v17_backup",
    "central190_save_v16",
    "central190_save_v16_backup",
    "central190_save_v15",
    "central190_save_v15_backup",
    "central190_save_v14",
    "central190_save_v14_backup",
    "central190_save_v13",
    "central190_save_v12",
    "central190_save_v11",
    "central190_save_v10",
    "central190_save_v9",
    "central_190_save",
    "c190_save",
  ];
  const SCHEMA = 21;
  const VERSION = "1.7.4";
  const BUILD = "CENTRAL190-1740-F23-4-HOTFIX-LAYOUT-MOBILE-FIRST-20260619-191500-BRT";
  const DEFAULT_CENTER = {
    lat: -23.55052,
    lng: -46.63331,
    label: "São Paulo — SP",
  };

  const defaultContent = () =>
    window.C190_Content?.defaultContent?.() || {
      registryVersion: 1,
      activeCityId: "sp",
      lastMode: "career",
      stats: {
        totalPlaySeconds: 0,
        totalReports: 0,
        bestScore: 0,
        bestResolved: 0,
        totalResolved: 0,
        totalFailed: 0,
        totalAbandoned: 0,
        criticalResolved: 0,
        perfectShifts: 0,
        modeCounts: {},
        gradeCounts: {},
        cityStats: {},
      },
      challenges: {},
      special: { completed: [], attempts: {}, bestScores: {} },
      sandbox: {
        callCount: 5,
        arrivalGap: 12,
        penalties: false,
        priorityMix: "mixed",
        cityId: "sp",
        templateSet: "all",
      },
      expansions: { enabled: [], installed: [], rejected: [] },
    };

  let lastBackupAt = 0;

  const defaultState = () => ({
    schema: SCHEMA,
    version: VERSION,
    build: BUILD,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: null,
    career: {
      rankId: "operador_iii",
      xp: 0,
      reputation: 50,
      warnings: [],
      completedCourses: [],
      specialization: null,
      promotions: 0,
      totalResolved: 0,
      totalFailed: 0,
      totalAbandoned: 0,
      totalShifts: 0,
      perfectShifts: 0,
      streak: 0,
      bestStreak: 0,
      decisionScore: 0,
      decisionCount: 0,
      goals: {},
      achievements: [],
      events: [],
    },
    dispatch: { shift: null, reports: [] },
    content: defaultContent(),
    release: {
      version: VERSION,
      phase: 23,
      visualRecovery: 1,
      callProtocolVersion: 2,
      triageVersion: 1,
      locationIntelVersion: 1,
      resourceDispatchVersion: 1,
      fieldRadioVersion: 1,
      trainingAcademyVersion: 1,
      balanceVersion: 2,
      firstOpenedAt: new Date().toISOString(),
      notesSeen: false,
      privacySeen: false,
      installDismissed: false,
      lastDeviceAudit: null,
    },
    training: window.C190_TrainingAcademy?.defaultTraining?.() || { version: 1, certificates: [], simulations: [], stats: { total: 0, passed: 0, bestScore: 0 }, recommendedModuleId: null },
    settings: {
      largeText: false,
      reduceMotion: false,
      highContrast: false,
      largeTargets: false,
      screenReaderHints: true,
      telemetry: false,
      autosaveSeconds: 5,
      mapMode: "auto",
      mapCenter: { ...DEFAULT_CENTER },
      mapZoom: 14,
      mapPrivacy: "approximate",
      visualTheme: "official-assets",
      assetFallback: "safe-css",
    },
  });

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function checksum(object) {
    const serialized = JSON.stringify(object);
    let hash = 2166136261;
    for (let index = 0; index < serialized.length; index++) {
      hash ^= serialized.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function envelope(state) {
    const data = clone(state);
    data.schema = SCHEMA;
    data.version = VERSION;
    data.build = BUILD;
    data.updatedAt = new Date().toISOString();
    return { schema: SCHEMA, checksum: checksum(data), data };
  }

  function validCenter(center) {
    return (
      center &&
      Number.isFinite(Number(center.lat)) &&
      Number.isFinite(Number(center.lng)) &&
      Number(center.lat) >= -85 &&
      Number(center.lat) <= 85 &&
      Number(center.lng) >= -180 &&
      Number(center.lng) <= 180
    );
  }

  function validate(state) {
    return (
      !!state &&
      typeof state === "object" &&
      state.schema === SCHEMA &&
      state.career &&
      state.dispatch &&
      state.content &&
      state.content.stats &&
      state.content.sandbox &&
      state.release &&
      state.release.balanceVersion === 2 &&
      state.release.visualRecovery === 1 &&
      state.release.callProtocolVersion === 2 &&
      state.release.triageVersion === 1 &&
      state.release.locationIntelVersion === 1 &&
      state.release.resourceDispatchVersion === 1 &&
      state.settings &&
      state.settings.telemetry === false &&
      ["auto", "real", "tactical"].includes(state.settings.mapMode) &&
      validCenter(state.settings.mapCenter)
    );
  }

  function randomCoordinate(center, index) {
    const angle = index * 2.11 + 0.71;
    const distance = 0.009 + (index % 4) * 0.006;
    const lat = Number(center.lat) + Math.sin(angle) * distance;
    const lng =
      Number(center.lng) +
      (Math.cos(angle) * distance) /
        Math.max(0.35, Math.cos((Number(center.lat) * Math.PI) / 180));
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  function enrichDispatch(dispatch, center) {
    const result = dispatch && typeof dispatch === "object" ? dispatch : {};
    result.reports = Array.isArray(result.reports) ? result.reports : [];
    result.reports = result.reports.map((report) => ({
      mode: "career",
      modeLabel: "Plantão de carreira",
      cityId: "sp",
      affectsCareer: true,
      ...report,
    }));
    if (result.shift && Array.isArray(result.shift.calls)) {
      result.shift.mode = result.shift.mode || "career";
      result.shift.modeLabel = result.shift.modeLabel || "Plantão de carreira";
      result.shift.cityId = result.shift.cityId || "sp";
      result.shift.affectsCareer = result.shift.affectsCareer !== false;
      result.shift.calls.forEach((call, index) => {
        if (!Number.isFinite(Number(call.lat)) || !Number.isFinite(Number(call.lng))) {
          Object.assign(call, randomCoordinate(center, index));
        } else {
          call.lat = Number(call.lat);
          call.lng = Number(call.lng);
        }
        call.region = call.region || center.label;
        window.C190_CallProtocol?.normalize?.(call);
        window.C190_LocationIntel?.normalize?.(call);
        window.C190_Triage?.normalize?.(call);
        window.C190_ResourceDispatch?.normalize?.(call);
        window.C190_FieldRadio?.normalize?.(call);
      });
    }
    return result;
  }

  function migrate(raw) {
    const source = raw?.data || raw || {};
    const base = defaultState();

    if (source.profile) {
      base.profile = {
        name: source.profile.name || source.profile.operatorName || "Operador",
        callSign: source.profile.callSign || source.profile.callsign || "Águia",
        difficulty: source.profile.difficulty || "realista",
      };
    }

    const career = source.career || {};
    Object.assign(base.career, {
      rankId: career.rankId || career.rank || base.career.rankId,
      xp: Number(career.xp || 0),
      reputation: Number(career.reputation ?? 50),
      warnings: Array.isArray(career.warnings) ? career.warnings : [],
      completedCourses: Array.isArray(career.completedCourses) ? career.completedCourses : [],
      specialization: career.specialization || null,
      promotions: Number(career.promotions || 0),
      totalResolved: Number(career.totalResolved || career.resolved || 0),
      totalFailed: Number(career.totalFailed || career.failed || 0),
      totalAbandoned: Number(career.totalAbandoned || career.abandoned || 0),
      totalShifts: Number(career.totalShifts || career.shifts || 0),
      perfectShifts: Number(career.perfectShifts || 0),
      streak: Number(career.streak || 0),
      bestStreak: Number(career.bestStreak || 0),
      decisionScore: Number(career.decisionScore || 0),
      decisionCount: Number(career.decisionCount || 0),
      goals: career.goals || {},
      achievements: Array.isArray(career.achievements) ? career.achievements : [],
      events: Array.isArray(career.events) ? career.events : [],
    });

    const incomingSettings = source.settings || {};
    const incomingCenter = validCenter(incomingSettings.mapCenter)
      ? {
          lat: Number(incomingSettings.mapCenter.lat),
          lng: Number(incomingSettings.mapCenter.lng),
          label: incomingSettings.mapCenter.label || "Região operacional",
        }
      : { ...DEFAULT_CENTER };

    base.settings = {
      ...base.settings,
      ...incomingSettings,
      mapMode: ["auto", "real", "tactical"].includes(incomingSettings.mapMode)
        ? incomingSettings.mapMode
        : "auto",
      mapCenter: incomingCenter,
      mapZoom: Math.max(3, Math.min(19, Number(incomingSettings.mapZoom || 14))),
      mapPrivacy: "approximate",
    };

    base.release = { ...base.release, ...(source.release || {}), version: VERSION, phase: 23, visualRecovery: 1, callProtocolVersion: 2, triageVersion: 1,
      locationIntelVersion: 1, resourceDispatchVersion: 1,
      fieldRadioVersion: 1, trainingAcademyVersion: 1, balanceVersion: 2 };
    base.settings.telemetry = false;
    base.dispatch = enrichDispatch(source.dispatch || base.dispatch, incomingCenter);
    base.content = source.content && typeof source.content === "object" ? clone(source.content) : defaultContent();
    base.training = window.C190_TrainingAcademy?.migrate?.(source.training) || base.training || { version: 1, certificates: [], simulations: [], stats: { total: 0, passed: 0, bestScore: 0 }, recommendedModuleId: null };
    if (window.C190_Content?.normalize) window.C190_Content.normalize(base);

    // Vincula a cidade migrada pela coordenada conhecida, preservando centros personalizados.
    const matchedCity = window.C190_Content?.cities?.find(
      (city) =>
        Math.abs(Number(city.center.lat) - incomingCenter.lat) < 0.0003 &&
        Math.abs(Number(city.center.lng) - incomingCenter.lng) < 0.0003,
    );
    if (matchedCity && !source.content?.activeCityId) base.content.activeCityId = matchedCity.id;

    base.schema = SCHEMA;
    base.version = VERSION;
    base.build = BUILD;
    base.createdAt = source.createdAt || base.createdAt;
    base.updatedAt = new Date().toISOString();
    window.C190_Release?.normalize?.(base);
    return base;
  }

  function load() {
    try {
      const currentText = localStorage.getItem(KEY);
      if (currentText) {
        const currentEnvelope = JSON.parse(currentText);
        if (currentEnvelope.checksum !== checksum(currentEnvelope.data)) throw new Error("checksum_mismatch");
        if (validate(currentEnvelope.data)) {
          if (window.C190_Content?.normalize) window.C190_Content.normalize(currentEnvelope.data);
          window.C190_Release?.normalize?.(currentEnvelope.data);
          return currentEnvelope.data;
        }
        const migratedCurrent = migrate(currentEnvelope);
        save(migratedCurrent);
        return migratedCurrent;
      }

      for (const legacyKey of LEGACY) {
        const legacyText = localStorage.getItem(legacyKey);
        if (!legacyText) continue;
        const migrated = migrate(JSON.parse(legacyText));
        save(migrated);
        return migrated;
      }
    } catch (error) {
      console.warn("[C190] primary save failed", error);
      try {
        const backupEnvelope = JSON.parse(localStorage.getItem(BACKUP));
        if (backupEnvelope) {
          const migratedBackup = migrate(backupEnvelope);
          if (validate(migratedBackup)) return migratedBackup;
        }
      } catch (_) {}
    }
    return defaultState();
  }

  function save(state, options = {}) {
    if (window.C190_Content?.normalize) window.C190_Content.normalize(state);
    window.C190_Release?.normalize?.(state);
    const nextEnvelope = envelope(state);
    const current = localStorage.getItem(KEY);
    const now = Date.now();
    const shouldBackup = !options.skipBackup && (options.forceBackup || now - lastBackupAt >= 30000);
    if (current && shouldBackup) {
      localStorage.setItem(BACKUP, current);
      lastBackupAt = now;
    }
    localStorage.setItem(KEY, JSON.stringify(nextEnvelope));
    Object.assign(state, nextEnvelope.data);
    window.dispatchEvent(new CustomEvent("c190:saved"));
    return true;
  }

  function reset() {
    localStorage.removeItem(KEY);
    return defaultState();
  }

  function restoreBackup() {
    const text = localStorage.getItem(BACKUP);
    if (!text) throw new Error("backup_missing");
    const restored = migrate(JSON.parse(text));
    if (!validate(restored)) throw new Error("backup_invalid");
    save(restored, { skipBackup: true });
    return restored;
  }

  function storageInfo() {
    const primary = localStorage.getItem(KEY) || "";
    const backup = localStorage.getItem(BACKUP) || "";
    return { primaryBytes: primary.length * 2, backupBytes: backup.length * 2, hasBackup: !!backup };
  }

  function exportData(state) {
    const blob = new Blob([JSON.stringify(envelope(state), null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `CENTRAL190-save-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
  }

  async function importData(file) {
    const importedEnvelope = JSON.parse(await file.text());
    const state = migrate(importedEnvelope);
    if (!validate(state)) throw new Error("invalid_save");
    save(state);
    return state;
  }

  return {
    KEY,
    BACKUP,
    SCHEMA,
    VERSION,
    BUILD,
    DEFAULT_CENTER,
    defaultState,
    load,
    save,
    reset,
    exportData,
    importData,
    restoreBackup,
    storageInfo,
    checksum,
    validate,
    migrate,
  };
})();
