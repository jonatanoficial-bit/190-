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


## v2.2.0 — Fase 28 — Casos realistas e multi-etapas

- 18 novas ocorrências realistas.
- Falas específicas por ocorrência.
- Rádio com evolução própria por caso.
- Novas operações especiais: Trama Urbana e Fronteira de Resgate.
- Nova missão de campanha: Turno realista.
- Correção do contador duplicado de ocorrências resolvidas.

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

# Central 190 v1.7.0 — Fase 23

## Novo

- Academia 190 com 8 módulos práticos.
- Certificações por nota.
- Cursos formais com efeito real em protocolo, localização, triagem, despacho e rádio.
- Três novos cursos: Geolocalização de emergência, Despacho integrado PM/Bombeiros/SAMU e Rádio operacional.
- Histórico de simulações e recomendações de treinamento.
- Conquistas novas ligadas à certificação.

## Preservado

- Assets, fundos, atendimento por chat, mapa real, mapa tático, triagem, despacho de unidades, rádio, carreira, cidades, Sandbox e PWA.

Build: `CENTRAL190-1700-F23-TRAINING-ACADEMY-20260619-162400-BRT`


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


## v2.0.0 — Fase 26 — Viaturas animadas, rolagem e máquina de escrever

- Adiciona módulo `js/field-units.js` para calcular deslocamento das unidades selecionadas em direção à ocorrência no mapa real/tático.
- Corrige rolagem do plantão preservando posição da página, chat e rádio durante o timer de 1 segundo.
- Adiciona efeito de máquina de escrever em novas mensagens do chamador, operador e rádio.
- Otimiza layout do plantão em mobile, tablet e desktop.
- Atualiza cache PWA para v2.0.0 e save schema 24.

## v2.1.0 — Fase 27 — Homologação mobile, touch e rolagem

- Define `#mainContent` como raiz única de rolagem do jogo.
- Evita que `body`, `sidebar`, chat, rádio e timer disputem a rolagem.
- Adiciona guardião de renderização no plantão para não puxar o usuário de volta ao topo enquanto ele lê as informações.
- Reorganiza o plantão no mobile: atendimento ativo primeiro, fila depois, pausadas depois, mapa por último.
- Melhora overlay do menu lateral, fechamento por clique fora e Escape.
- Atualiza save schema para 25 e cache PWA para v2.1.0.
