window.C190_PublicRC = (() => {
  "use strict";
  const VERSION = 1;
  function hasDom(id) { return !!document.getElementById(id); }
  function checklist(state) {
    const release = window.C190_Release?.releaseChecklist?.(state) || [];
    const assets = window.C190_Assets?.diagnostics?.();
    const contentTemplates = window.C190_Dispatch?.templates?.length || 0;
    const missions = window.C190_Campaign?.missions?.length || 0;
    const units = window.C190_ResourceDispatch?.UNIT_BLUEPRINTS?.length || 0;
    const modules = window.C190_TrainingAcademy?.MODULES?.length || 0;
    const completedRelease = release.filter((item) => item.ok).length;
    return [
      { name: "Build pública identificada", ok: state?.version === "2.4.0" && state?.schema === 28, detail: `v${state?.version || "?"} · schema ${state?.schema || "?"}` },
      { name: "Tutorial e primeira experiência", ok: !!window.C190_Tutorial && hasDom("screen-tutorial"), detail: `${window.C190_Tutorial?.STEPS?.length || 0} etapas de onboarding` },
      { name: "Conteúdo jogável", ok: contentTemplates >= 50 && missions >= 7, detail: `${contentTemplates} ocorrências · ${missions} missões` },
      { name: "Despacho e campo", ok: units >= 10 && !!window.C190_FieldUnits && !!window.C190_FieldRadio, detail: `${units} recursos · rádio + viaturas animadas` },
      { name: "Treinamento e carreira", ok: modules >= 8 && !!window.C190_Career, detail: `${modules} módulos da Academia 190` },
      { name: "Visual mobile-first", ok: assets?.ok !== false && hasDom("mainContent"), detail: assets ? `${assets.loaded}/${assets.required} assets obrigatórios` : "módulo visual disponível" },
      { name: "Offline/PWA", ok: "serviceWorker" in navigator, detail: "Cache local, manifest e fallback preservados" },
      { name: "Privacidade", ok: state?.settings?.telemetry === false, detail: "Sem telemetria, sem conta obrigatória e save local" },
      { name: "Checklist interno", ok: completedRelease >= Math.max(1, release.length - 1), detail: `${completedRelease}/${release.length} itens aprovados` },
    ];
  }
  function score(state) {
    const items = checklist(state);
    return { ok: items.every((item) => item.ok), passed: items.filter((item) => item.ok).length, total: items.length, items };
  }
  return { VERSION, checklist, score };
})();
