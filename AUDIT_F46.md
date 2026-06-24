# AUDIT F46 — v4.0.0

Build: `CENTRAL190-4000-F46-COBERTURA-TERRITORIAL-20260624-151500-BRT`

- `js/base-logistics.js` criado.
- `index.html` carrega `js/base-logistics.js`.
- `baseLogisticsPanel` inserido no plantão.
- `js/resource-dispatch.js` aplica cobertura/base no ETA.
- `js/multitask.js` considera cobertura territorial no risco e pressão.
- `js/supervisor.js` alerta cobertura territorial irregular.
- `js/app.js` renderiza painel Cobertura Territorial.
- Save schema atualizado para 43.
- JavaScript auditado por `node --check`.
