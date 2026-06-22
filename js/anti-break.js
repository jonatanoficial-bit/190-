window.C190_AntiBreak = (() => {
  "use strict";

  const errors = [];

  function capture(type, detail) {
    errors.push({
      at: new Date().toISOString(),
      type,
      detail: String(detail?.message || detail),
    });
    errors.splice(30);
  }

  window.addEventListener("error", (event) =>
    capture("error", event.error || event.message),
  );
  window.addEventListener("unhandledrejection", (event) =>
    capture("promise", event.reason),
  );

  function diagnostics(state) {
    const essentialIds = [
      "app",
      "mainContent",
      "sidebar",
      "careerForm",
      "startShiftBtn",
      "courseGrid",
      "achievementGrid",
      "dispatchMap",
      "dispatchMapFallback",
      "operationsMap",
      "operationsMapFallback",
      "mapModeSelect",
      "mapIncidentList",
      "challengeGrid",
      "specialOperationsGrid",
      "cityModulesGrid",
      "launchSandboxBtn",
      "statisticsMetrics",
      "cityStatistics",
      "campaignProgressBadge",
      "campaignMissionGrid",
      "campaignBriefing",
      "campaignTimeline",
      "releaseChecklist",
      "deviceAuditOutput",
      "installAppBtn",
      "highContrastToggle",
      "restoreBackupBtn",
      "assetAuditSummary",
      "assetAuditList",
      "academyOverview",
      "trainingModules",
      "trainingEffects",
      "certificationGrid",
      "simulationLog",
    ];
    const missing = essentialIds.filter((id) => !document.getElementById(id));
    const mapDiagnostics = window.C190_Map?.diagnostics(state) || {
      leafletLoaded: false,
      effectiveMode: "unavailable",
    };
    const activeCalls = state?.dispatch?.shift?.calls || [];
    const callsWithoutCoordinates = activeCalls.filter(
      (call) =>
        !Number.isFinite(Number(call.lat)) ||
        !Number.isFinite(Number(call.lng)),
    );
    const content = state?.content;
    const validCities = Array.isArray(window.C190_Content?.cities)
      ? window.C190_Content.cities.length >= 9
      : false;
    const validSpecial = Array.isArray(window.C190_Content?.specialCases)
      ? window.C190_Content.specialCases.length >= 5
      : false;

    const checks = [
      {
        name: "DOM essencial",
        ok: missing.length === 0,
        detail: missing.length
          ? `Ausentes: ${missing.join(", ")}`
          : "Todos os elementos essenciais presentes",
      },
      {
        name: "Save schema",
        ok: state?.schema === 23,
        detail: `schema=${state?.schema}`,
      },
      {
        name: "Release Candidate",
        ok: !!window.C190_Release && state?.release?.balanceVersion === 2 && state?.release?.visualRecovery === 1 && state?.settings?.telemetry === false && state?.release?.callProtocolVersion === 2 && state?.release?.triageVersion === 1 && state?.release?.locationIntelVersion === 1 && state?.release?.resourceDispatchVersion === 1 && state?.release?.fieldRadioVersion === 1 && state?.release?.trainingAcademyVersion === 1 && state?.release?.campaignVersion === 1 && !!window.C190_ResourceDispatch && !!window.C190_FieldRadio && !!window.C190_TrainingAcademy && !!window.C190_Campaign,
        detail: `v${window.C190_Release?.VERSION || "?"} · balance ${state?.release?.balanceVersion || "?"}`,
      },
      {
        name: "Estrutura da carreira",
        ok: !!state?.career && Array.isArray(state.career.warnings),
        detail: "Módulo de carreira disponível",
      },
      {
        name: "Motor de atendimento e triagem",
        ok: !!state?.dispatch && Array.isArray(state.dispatch.reports) && !!window.C190_CallProtocol && !!window.C190_Triage,
        detail: `Protocolo v${window.C190_CallProtocol?.VERSION || "?"} · triagem v${window.C190_Triage?.VERSION || "?"} · recursos v${window.C190_ResourceDispatch?.VERSION || "?"} · rádio v${window.C190_FieldRadio?.VERSION || "?"} · academia v${window.C190_TrainingAcademy?.VERSION || "?"}`,
      },
      {
        name: "Classificação operacional",
        ok: !!window.C190_Triage && Array.isArray(window.C190_Triage.NATURES) && window.C190_Triage.NATURES.length >= 10 && window.C190_Triage.AGENCIES.length >= 4,
        detail: `${window.C190_Triage?.NATURES?.length || 0} naturezas · ${window.C190_Triage?.AGENCIES?.length || 0} órgãos`,
      },
      {
        name: "Mapa progressivo",
        ok: !!window.C190_LocationIntel && Array.isArray(window.C190_LocationIntel.STAGES) && window.C190_LocationIntel.STAGES.length >= 5,
        detail: `${window.C190_LocationIntel?.STAGES?.length || 0} estágios de precisão`,
      },
      {
        name: "Despacho de unidades",
        ok: !!window.C190_ResourceDispatch && Array.isArray(window.C190_ResourceDispatch.UNIT_BLUEPRINTS) && window.C190_ResourceDispatch.UNIT_BLUEPRINTS.length >= 9,
        detail: `${window.C190_ResourceDispatch?.UNIT_BLUEPRINTS?.length || 0} unidades operacionais`,
      },

      {
        name: "Campanha operacional",
        ok: !!window.C190_Campaign && Array.isArray(window.C190_Campaign.missions) && window.C190_Campaign.missions.length >= 6 && !!state?.campaign,
        detail: `${window.C190_Campaign?.summary?.(state)?.completed || 0}/${window.C190_Campaign?.missions?.length || 0} missões`,
      },
      {
        name: "Academia e certificações",
        ok: !!window.C190_TrainingAcademy && Array.isArray(window.C190_TrainingAcademy.MODULES) && window.C190_TrainingAcademy.MODULES.length >= 8 && !!state?.training,
        detail: `${window.C190_TrainingAcademy?.MODULES?.length || 0} módulos · ${(state?.training?.certificates || []).length} certificado(s)`,
      },
      {
        name: "Conteúdo comercial",
        ok:
          !!content &&
          !!content.stats &&
          !!content.sandbox &&
          !!content.challenges,
        detail: `cidade=${content?.activeCityId || "ausente"} · relatórios=${content?.stats?.totalReports ?? "?"}`,
      },
      {
        name: "Módulos de cidades",
        ok: validCities,
        detail: `${window.C190_Content?.cities?.length || 0} módulos registrados`,
      },
      {
        name: "Operações especiais",
        ok: validSpecial,
        detail: `${window.C190_Content?.specialCases?.length || 0} operações registradas`,
      },
      {
        name: "Sandbox isolado",
        ok:
          typeof window.C190_Content?.launchSandbox === "function" &&
          Number(content?.sandbox?.callCount || 0) >= 1 &&
          Number(content?.sandbox?.callCount || 0) <= 12,
        detail: `configuração=${content?.sandbox?.callCount || 0} chamadas`,
      },
      {
        name: "Registro de expansões",
        ok:
          window.C190_Content?.REGISTRY_VERSION === 1 &&
          typeof window.C190_Content?.validateExpansion === "function",
        detail: `API ${window.C190_Content?.REGISTRY_VERSION || "indisponível"}`,
      },
      {
        name: "Biblioteca de mapa",
        ok: !!mapDiagnostics.leafletLoaded,
        detail: mapDiagnostics.leafletLoaded
          ? "Leaflet 1.9.4 carregado localmente"
          : "Leaflet indisponível; fallback tático continua funcional",
      },
      {
        name: "Fallback tático",
        ok: typeof window.C190_Map?.render === "function",
        detail: `modo efetivo=${mapDiagnostics.effectiveMode}`,
      },
      {
        name: "Coordenadas das ocorrências",
        ok: callsWithoutCoordinates.length === 0,
        detail: callsWithoutCoordinates.length
          ? `${callsWithoutCoordinates.length} ocorrência(s) sem coordenadas`
          : "Todas as ocorrências ativas possuem coordenadas válidas",
      },
      {
        name: "Configuração geográfica",
        ok:
          ["auto", "real", "tactical"].includes(state?.settings?.mapMode) &&
          Number.isFinite(Number(state?.settings?.mapCenter?.lat)) &&
          Number.isFinite(Number(state?.settings?.mapCenter?.lng)),
        detail: `${state?.settings?.mapMode} · ${state?.settings?.mapCenter?.label || "sem região"}`,
      },
      {
        name: "Identidade visual / assets",
        ok: window.C190_Assets?.diagnostics?.().ok !== false,
        detail: (() => { const d = window.C190_Assets?.diagnostics?.(); return d ? `${d.loaded}/${d.required} assets carregados` : "Módulo visual indisponível"; })(),
      },
      {
        name: "LocalStorage",
        ok: (() => {
          try {
            localStorage.setItem("__c190_test", "1");
            localStorage.removeItem("__c190_test");
            return true;
          } catch {
            return false;
          }
        })(),
        detail: "Leitura e escrita local",
      },
      {
        name: "Erros capturados",
        ok: errors.length === 0,
        detail: errors.length
          ? `${errors.length} erro(s) registrado(s)`
          : "Nenhum erro em tempo de execução",
      },
    ];

    return {
      ok: checks.every((check) => check.ok),
      checks,
      map: mapDiagnostics,
      errors: [...errors],
      timestamp: new Date().toISOString(),
      version: "2.1.0",
      build: "CENTRAL190-2100-F27-MOBILE-HOMOLOGATION-TOUCH-SCROLL-20260622-104500-BRT",
    };
  }

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (error) {
      capture("safe-wrapper", error);
      return typeof fallback === "function" ? fallback(error) : fallback;
    }
  }

  return { diagnostics, safe, errors };
})();
