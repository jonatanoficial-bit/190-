# Central 190 v2.3.0 — Fase 29

Build: CENTRAL190-2300-F29-BALANCEAMENTO-FINAL-20260622-120000-BRT
Save schema: 27

## Fase 29 — Balanceamento final

- Novo módulo `js/balance.js` com pesos oficiais da nota final.
- Pontuação final agora combina protocolo, triagem, despacho, rádio, localização e resultado.
- Correção de economia: evita multiplicação dupla de dificuldade no XP.
- XP por chamada, reputação e advertências agora têm limites comerciais.
- Relatórios mostram resumo do balanceamento.
- Dificuldades Assistido, Realista e Especialista preservadas com impacto ajustado.

---


# Central 190 v2.2.0 — Fase 28

Build focada em casos realistas, falas variadas e ocorrências multi-etapas, preservando mobile-first, viaturas animadas, rádio, mapa progressivo e carreira.

# Central 190 v1.8.0 — Fase 24 — RC AAA, áudio e imersão

Build: `CENTRAL190-1800-F24-RC-AAA-IMERSAO-20260620-173000-BRT`  
Data: 20/06/2026 17:30:00 BRT

- Áudio operacional gerado localmente por Web Audio API.
- Sons de telefone, perguntas, triagem, despacho, rádio, sucesso, alerta e erro.
- Configurações de áudio e vibração em Configurações.
- Relatórios finais com breakdown profissional por chamada.
- Polimento visual e mobile-first preservando fundos fotográficos e layout corrigido.
- Save schema 22 com migração automática.

---

# Central 190 v1.8.0 — Fase 24 — Hotfix layout mobile-first

Build: `CENTRAL190-1800-F24-RC-AAA-IMERSAO-20260620-173000-BRT`

- Topbar e sidebar restauradas como fixas.
- Card de nova carreira reorganizado para texto e formulário alinhados.
- Mobile priorizado: formulário em uma coluna, botões maiores, painel compacto e rolagem natural.
- Fundos fotográficos reais da v1.7.3 preservados.
- Cache PWA atualizado para `central190-v1.8.0-f23-4-layout-mobile-first`.

---

# Central 190 — v1.7.0 Fase 23

Build: `CENTRAL190-1700-F23-TRAINING-ACADEMY-20260619-162400-BRT`

Fase 23 adiciona Academia 190, simulações práticas, certificações profissionais e efeitos reais dos cursos no atendimento, triagem, mapa, despacho e rádio.

## Execução

Abra `index.html` ou publique a raiz no GitHub Pages.

## Save

Schema 21 com migração automática dos schemas anteriores.


## v1.7.1 — Fase 23.1 Hotfix de fundos cinematográficos

- Corrigido mapeamento ativo dos fundos: as variáveis principais agora usam WEBP/PNG cinematográficos.
- SVGs antigos permanecem como legado, mas não comandam mais a interface.
- Service Worker atualizado para novo cache `CENTRAL190-1710-F23-1-HOTFIX-FUNDOS-CINEMATICOS-20260619-173500-BRT`.
- Painel de assets separa obrigatórios e opcionais.
- Save schema preservado em 21; nenhuma perda de progresso.


## v1.9.0 — Fase 25: Campanha Operacional
- Nova tela Campanha.
- 6 missões narrativas encadeadas.
- Missões usam atendimento, triagem, mapa progressivo, despacho e rádio.
- Recompensas de campanha integradas à carreira.
- Save schema 23 com migração automática.


### Fase 26 — v2.0.0

A Fase 26 transforma o despacho em acompanhamento visual: as unidades selecionadas passam a se deslocar no mapa em direção à ocorrência. O plantão recebeu proteção contra salto de rolagem, efeito de máquina de escrever e compactação mobile-first.

### Fase 27 — v2.1.0

Homologação mobile-first. A fase ajusta rolagem única, touch, sidebar em overlay, safe-area, layout do plantão em telas pequenas e guardião de renderização para impedir que o timer do plantão puxe a rolagem de volta enquanto o jogador lê chat, rádio e informações da ocorrência.
