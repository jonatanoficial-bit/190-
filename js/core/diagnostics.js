export function runDiagnostics({ buildInfo, contentReport, localeReport, saveManager, requiredDomIds = [], t = (key) => key }) {
  const items = [];
  const add = (id, ok, label, detail) => items.push({ id, ok: Boolean(ok), label, detail });
  add('build', Boolean(buildInfo?.version && buildInfo?.buildId && buildInfo?.buildIso), t('diagnostics.labels.build'), buildInfo?.buildId || t('diagnostics.details.absent'));
  add('content', contentReport.ok, t('diagnostics.labels.content'), contentReport.ok ? t('diagnostics.details.incidentsValidated', { count: contentReport.stats.incidents }) : t('diagnostics.details.errors', { count: contentReport.errors.length }));
  add('locales', localeReport?.ok, t('diagnostics.labels.locales'), localeReport?.ok ? t('diagnostics.details.localesReady') : t('diagnostics.details.localeErrors', { count: localeReport?.missing?.length || 0 }));
  const missingDom = requiredDomIds.filter((id) => !document.getElementById(id));
  add('dom', missingDom.length === 0, t('diagnostics.labels.dom'), missingDom.length ? t('diagnostics.details.missing', { items: missingDom.join(', ') }) : t('diagnostics.details.componentsFound', { count: requiredDomIds.length }));
  add('storage', saveManager.storageSelfTest(), t('diagnostics.labels.storage'), t('diagnostics.details.storageOps'));
  add('backup', true, t('diagnostics.labels.backup'), saveManager.hasBackup() ? t('diagnostics.details.backupAvailable') : t('diagnostics.details.backupLater'));
  add('viewport', window.innerWidth >= 280 && window.innerHeight >= 480, t('diagnostics.labels.viewport'), `${window.innerWidth}×${window.innerHeight}`);
  add('serviceWorker', 'serviceWorker' in navigator, t('diagnostics.labels.serviceWorker'), 'serviceWorker' in navigator ? t('diagnostics.details.compatible') : t('diagnostics.details.unavailable'));
  add('secureContext', window.isSecureContext || location.hostname === 'localhost' || location.protocol === 'file:', t('diagnostics.labels.secureContext'), location.protocol === 'file:' ? t('diagnostics.details.localFile') : location.protocol);
  return { ok: items.every((item) => item.ok), generatedAt: new Date().toISOString(), build: buildInfo, content: contentReport, locales: localeReport, viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio || 1 }, language: document.documentElement.lang, userAgent: navigator.userAgent, save: saveManager.lastStatus, items };
}

export function downloadDiagnosticReport(report, runtimeEvents = [], filename = `central190-diagnostics-${Date.now()}.json`) {
  const payload = { ...report, runtimeEvents };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(href);
}
