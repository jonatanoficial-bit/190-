# Fase 20 — v1.4.0

Build CENTRAL190-1400-F20-PROGRESSIVE-MAP-20260618-120900-BRT. Implementa mapa jogável com localização progressiva: sem localização, área aproximada, rua provável, quadra provável e local confirmado. Adiciona raio de incerteza, recursos próximos PM/Bombeiros/SAMU e integração com perguntas de bairro, rua, número, endereço e referência.

# Changelog

## v1.2.0 — Fase 18: Motor Real de Atendimento por Chamada/Chat

- Adicionado módulo `js/call-protocol.js`.
- Chamadas agora possuem fala inicial do solicitante e transcript de atendimento.
- Adicionados botões fixos de perguntas operacionais.
- Coleta de endereço, referência, situação, vítimas, arma/ameaça, segurança, dados de retorno, risco médico e risco ambiental.
- Perguntas improdutivas e perigosas são permitidas, mas penalizadas.
- Decisão final passa a considerar qualidade do protocolo.
- Mapa só exibe ocorrência quando o endereço começa a ser coletado.
- Relatórios armazenam nota do protocolo, perguntas feitas e lacunas.
- Save atualizado para schema 16 com migração do schema 15.

## v1.1.0 — Fase 17

- Restauração visual oficial e Asset Recovery.


## v1.3.0 — Fase 19
- Adicionada triagem profissional por natureza, prioridade e órgão.
- Integrada nota de triagem à resolução, XP e reputação.
- Criado módulo `js/triage.js` e relatório de classificação.
