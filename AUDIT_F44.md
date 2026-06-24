# AUDIT F44 — v3.8.0

Build: `CENTRAL190-3800-F44-MANUTENCAO-VIATURAS-20260624-141500-BRT`

- `js/vehicle-maintenance.js` criado.
- `index.html` carrega `js/vehicle-maintenance.js`.
- `vehicleMaintenancePanel` inserido no plantão.
- `js/resource-dispatch.js` aplica manutenção no ETA.
- `js/multitask.js` considera manutenção no risco e pressão.
- `js/supervisor.js` alerta frota com baixa prontidão.
- `js/app.js` renderiza painel Frota e Manutenção.
- Save schema atualizado para 41.
- JavaScript auditado por `node --check`.
