# AUDIT_F23_4 — Layout mobile-first e correção visual

Build: `CENTRAL190-1740-F23-4-HOTFIX-LAYOUT-MOBILE-FIRST-20260619-191500-BRT`  
Versão: v1.7.4 — Fase 23.4  
Data: 19/06/2026 19:15:00 BRT

## Causa identificada

A camada de hotfix visual anterior aplicava `position: relative` em `.topbar`, `.sidebar` e `.main-content`. Isso anulava o layout original fixo da barra superior e do menu lateral, causando:

- menu lateral rolando junto com a página;
- topo visual desaparecendo em desktop;
- conteúdo parecendo deslocado;
- relação ruim entre texto do card inicial e botões/formulário.

## Correções

- `.topbar` fixa com z-index alto.
- `.sidebar` fixa, abaixo da topbar, com rolagem interna.
- `.main-content` reposicionado abaixo da topbar e ao lado do menu em desktop.
- Layout do card inicial refeito com grid responsivo.
- Mobile-first: formulário, perguntas, triagem e recursos em uma coluna.
- Mantidos fundos fotográficos reais da v1.7.3.
- Service Worker atualizado para novo cache.

## Auditoria estática

- CSS contém hotfix `Fase 23.4`.
- Topbar final: `position: fixed`.
- Sidebar final: `position: fixed`.
- Main content final: `margin-left: var(--sidebar)` em desktop.
- Mobile: `margin-left: 0`, sidebar overlay e formulário em coluna.
- URLs de assets CSS verificadas.
- ZIP testado sem erro.

## Gameplay preservado

- Atendimento por chat.
- Triagem, prioridade e órgão correto.
- Localização progressiva no mapa.
- Despacho de PM/Bombeiros/SAMU.
- Rádio operacional.
- Academia 190.
- Carreira e save schema 21.
