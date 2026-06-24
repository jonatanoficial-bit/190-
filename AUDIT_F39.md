# AUDIT F39 — v3.3.0

Build: `CENTRAL190-3300-F39-AMBIENTE-URBANO-DINAMICO-20260624-114500-BRT`

- `js/urban-dynamics.js` criado.
- `index.html` carrega o módulo urbano.
- `urbanDynamicsPanel` inserido no plantão.
- `js/dispatch.js` atualiza ambiente urbano no start/tick.
- `js/resource-dispatch.js` aplica multiplicador urbano no ETA.
- `js/multitask.js` usa pressão/risco urbano.
- `js/supervisor.js` exibe impacto urbano na pressão.
- `css/style.css` contém estilos `.urban-*`.
- Save schema atualizado para 36.
- JavaScript auditado por `node --check`.
