# AUDIT F41 — v3.5.0

Build: `CENTRAL190-3500-F41-REDE-APOIO-ESPECIALIZADO-20260624-124500-BRT`

- `js/support-network.js` criado.
- `index.html` contém `supportNetworkPanel` e carrega o módulo.
- `js/app.js` renderiza o painel Rede de Apoio e vincula botões de acionamento.
- `js/dispatch.js` atualiza rede de apoio no início e no tick do plantão.
- `js/multitask.js` considera apoio pendente/acionado no risco e pressão.
- `js/supervisor.js` alerta apoio especializado pendente.
- `css/style.css` contém estilos `.support-*`.
- Save schema atualizado para 38.
- JavaScript auditado por `node --check`.
