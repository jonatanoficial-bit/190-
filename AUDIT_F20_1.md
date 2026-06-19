# AUDIT F20.1 — Hotfix visual e rolagem

Build: `CENTRAL190-1410-F20-1-HOTFIX-VISUAL-SCROLL-20260618-131700-BRT`

## Correções

- Fundos imersivos WEBP adicionados em `assets/backgrounds/`.
- CSS passa a aplicar fundos em `.app-shell::before`, evitando z-index negativo.
- Tela de plantão usa `bg-dispatch-immersive.webp` também dentro do card ativo.
- `js/assets.js` audita os novos assets.
- `sw.js` usa cache novo `central190-v1.4.1-f20-1-hotfix-visual-scroll`.
- Chat da ligação preserva a posição da barra de rolagem durante o tick do plantão.

## Validação

- Caminhos de assets obrigatórios existentes.
- Sintaxe JavaScript básica validada.
- ZIP completo preserva carreira, mapa, triagem, atendimento por chat e localização progressiva.
