export function installRuntimeGuard({ buildInfo, onRecover }) {
  const events = [];
  const record = (type, detail) => {
    const entry = {
      type,
      detail: String(detail || 'Erro desconhecido').slice(0, 500),
      at: new Date().toISOString(),
      buildId: buildInfo.buildId
    };
    events.push(entry);
    if (events.length > 20) events.shift();
    return entry;
  };

  const panel = document.getElementById('recoveryPanel');
  const errorCode = document.getElementById('recoveryErrorCode');
  const showRecovery = (entry) => {
    if (!panel) return;
    if (errorCode) errorCode.textContent = `${entry.type} • ${entry.at.slice(11, 19)}`;
    panel.hidden = false;
  };

  window.addEventListener('error', (event) => showRecovery(record('runtime-error', event.error?.message || event.message)));
  window.addEventListener('unhandledrejection', (event) => showRecovery(record('unhandled-rejection', event.reason?.message || event.reason)));

  document.getElementById('btnRecoverySafe')?.addEventListener('click', () => {
    panel.hidden = true;
    onRecover?.();
  });
  document.getElementById('btnRecoveryReload')?.addEventListener('click', () => window.location.reload());

  return {
    record,
    events,
    hide() { if (panel) panel.hidden = true; },
    getReport() { return [...events]; }
  };
}
