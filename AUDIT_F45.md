# AUDIT F45 — v3.9.0

Build: `CENTRAL190-3900-F45-ORCAMENTO-LOGISTICA-BASE-20260624-144500-BRT`

- `js/operational-budget.js` criado.
- `index.html` carrega `js/operational-budget.js`.
- `operationalBudgetPanel` inserido no plantão.
- `js/app.js` renderiza painel Orçamento Operacional.
- `js/multitask.js` considera pressão/custo orçamentário.
- `js/supervisor.js` alerta pressão orçamentária.
- `js/dispatch.js` registra `budgetSummary` no relatório final.
- Save schema atualizado para 42.
- JavaScript auditado por `node --check`.
