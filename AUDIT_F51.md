# AUDIT F51 — v4.5.0

Build: `CENTRAL190-4500-F51-CHAMADAS-DUPLICADAS-20260624-184500-BRT`

- `js/duplicate-calls.js` criado.
- `index.html` carrega `js/duplicate-calls.js`.
- `duplicateCallsPanel` inserido no plantão.
- `js/app.js` renderiza painel Chamadas Duplicadas e botões de unir/separar.
- `js/multitask.js` considera duplicidade no risco e pressão.
- `js/supervisor.js` alerta possíveis duplicidades.
- `js/dispatch.js` anexa `duplicateSummary` ao relatório final.
- `js/debriefing.js` reconhece boa unificação de chamadas.
- Save schema atualizado para 49.
- JavaScript auditado por `node --check`.
