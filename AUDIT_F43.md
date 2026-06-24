# AUDIT F43 — v3.7.0

Build: `CENTRAL190-3700-F43-FADIGA-RODIZIO-EQUIPES-20260624-134500-BRT`

- `js/unit-fatigue.js` criado.
- `index.html` carrega `js/unit-fatigue.js`.
- `unitFatiguePanel` inserido no plantão.
- `js/resource-dispatch.js` aplica fadiga no ETA.
- `js/multitask.js` considera fadiga no risco e pressão.
- `js/supervisor.js` alerta efetivo sob desgaste.
- `js/app.js` renderiza painel Efetivo e Fadiga.
- Save schema atualizado para 40.
- JavaScript auditado por `node --check`.
