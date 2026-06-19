# Central 190 v1.6.0 — Fase 22

- Adicionado módulo `js/field-radio.js`.
- Ocorrências continuam vivas após o despacho.
- Novo painel de rádio operacional dentro do atendimento ativo.
- Ações de rádio: reforço PM, SAMU, Bombeiros, Defesa Civil, redirecionamento, linha aberta e encerramento.
- Relatórios agora registram nota, pontuação, ações e log de rádio.
- Save schema 20 com migração automática dos schemas anteriores.

# Central 190 — Changelog

## v1.6.0 — Fase 22 — Despacho de Unidades
- Adicionado motor `C190_ResourceDispatch`.
- Seleção de viaturas PM, ROCAM, Força Tática, Bombeiros, Resgate, SAMU USB, SAMU Avançado, Defesa Civil e Helicóptero.
- Pontuação por cobertura correta, quantidade, ETA e precisão do mapa.
- Resultado do despacho integrado ao sucesso da ocorrência, XP, reputação e relatório.
- Mapa passa a destacar recursos selecionados.
- Fundos visuais do hotfix v1.4.1 preservados e documentados.

# v1.4.1 — Fase 20.1 Hotfix Visual e Rolagem

- Corrige fundos/assets que não apareciam no GitHub Pages.
- Adiciona fundos imersivos WEBP para central, dashboard, plantão, mapa, carreira e configurações.
- Muda a camada de fundo para `.app-shell::before`, sem depender de z-index negativo.
- Aplica fundo visível no card ativo de atendimento.
- Corrige rolagem do chat da ligação para não voltar sozinha durante os ticks.
- Atualiza cache do Service Worker para forçar renovação visual.

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
