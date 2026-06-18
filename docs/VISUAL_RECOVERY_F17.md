# Fase 17 — v1.1.0: Restauração Visual Oficial e Asset Recovery

Build: `CENTRAL190-1100-F17-ASSET-RECOVERY-20260618-100837-BRT`  
Compilação: 18/06/2026 10:08:37 BRT

## Objetivo

Corrigir a perda de identidade visual das fases reconstruídas e tornar a interface asset-first.

## O que foi feito

- Criada camada visual oficial usando assets locais em `assets/backgrounds`, `assets/ui`, `assets/badges` e `assets/illustrations`.
- Adicionado `js/assets.js` para auditar carregamento dos assets.
- Adicionado painel de auditoria visual em Configurações.
- Atualizado Service Worker para cachear os assets visuais locais.
- Atualizado schema do save para 15, preservando migração dos schemas 10–14.
- Mantidos carreira, mapa real, cidades, desafios, Sandbox, acessibilidade e privacidade.

## Limite conhecido

O pacote v1.0.0 recebido nesta conversa não continha os fundos originais do primeiro jogo 190. Por isso, esta fase restaura uma identidade visual local coerente e documentada com assets novos, mas não consegue recuperar imagens originais que não estavam dentro do ZIP.
