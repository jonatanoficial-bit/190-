# AUDIT F50 — v4.4.0

Build: `CENTRAL190-4400-F50-ENCAMINHAMENTO-LEGAL-20260624-171500-BRT`

- `js/legal-followup.js` criado.
- `index.html` carrega `js/legal-followup.js`.
- `legalFollowupPanel` inserido no plantão.
- `js/app.js` renderiza painel Encaminhamento Legal.
- `js/multitask.js` integra legal follow-up e corrige variáveis indefinidas de camadas anteriores.
- `js/supervisor.js` integra legal follow-up e corrige declarações de bases/inteligência/prevenção.
- `js/debriefing.js` reconhece qualidade de encaminhamento legal.
- `js/dispatch.js` anexa `evidenceSummary` e `legalSummary` ao relatório final.
- Save schema atualizado para 47.
- JavaScript auditado por `node --check`.
