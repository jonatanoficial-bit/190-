# Fase 23.4 — Hotfix layout mobile-first e auditoria visual

Build: `CENTRAL190-1740-F23-4-HOTFIX-LAYOUT-MOBILE-FIRST-20260619-191500-BRT`  
Versão: v1.7.4  
Save schema: 21 preservado.

## Correção principal

A auditoria do print mostrou que uma camada visual anterior colocou `.topbar`, `.sidebar` e `.main-content` como `position: relative`. Isso quebrou a arquitetura do layout: o menu lateral passou a rolar junto com a página, a barra superior sumiu durante a rolagem e o card de criação de carreira ficou visualmente deslocado.

## Ajustes aplicados

- `.topbar` restaurada como `position: fixed`.
- `.sidebar` restaurada como `position: fixed`, com rolagem interna própria.
- `.main-content` voltou a respeitar `margin-left: var(--sidebar)` no desktop e `margin-left: 0` no mobile.
- `#careerSetup.setup-card` virou grid controlado: texto à esquerda, formulário à direita no desktop; uma coluna no mobile.
- Card inicial compactado para caber melhor em telas de 1366×768.
- Em mobile, formulário em uma coluna, inputs com altura mínima e área de toque segura.
- Chat e rádio mantidos com rolagem natural e `overscroll-behavior`.
- Fundos fotográficos reais da Fase 23.3 preservados.

## Fundos preservados

- `assets/backgrounds/bg-control-room-hall.webp`
- `assets/backgrounds/bg-control-room-lobby.webp`
- `assets/backgrounds/bg-home-city-night.webp`
- `assets/backgrounds/bg-home-hero-clean2.png`
- `assets/backgrounds/bg-central-room.webp`

## Critério mobile

O mobile é prioridade. A versão final força:

- menu lateral fechado por padrão;
- conteúdo com largura 100%;
- formulário de carreira em uma coluna;
- perguntas de atendimento em uma coluna;
- triagem em uma coluna;
- mapa com altura mínima de 360px;
- chat com altura dinâmica baseada na viewport.
