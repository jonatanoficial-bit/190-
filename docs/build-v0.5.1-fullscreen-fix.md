# Central 190 — Build v0.5.1

## Objetivo
Corrigir a arquitetura de tela da v0.5.0 para comportamento de jogo mobile, evitando rolagem global, sobreposição de painéis e botões inacessíveis.

## Alterações principais
- `app-shell` agora ocupa a viewport inteira.
- `body` e `html` ficam sem rolagem global.
- Cada tela controla sua própria rolagem interna.
- Tela de atendimento usa grade fixa: topo, chat, perguntas e ações.
- Chat possui rolagem interna e acompanha novas mensagens.
- Área de suporte do atendimento é compactada em mobile e vira painel lateral em desktop.
- Despacho usa mapa e unidades com ações sempre acessíveis.
- Adicionado `manifest.webmanifest` com `display: fullscreen`.
- Adicionado `sw.js` para base PWA/cache.

## Regras preservadas
- Sem alteração de caminhos dos assets.
- ZIP completo do projeto.
- Build, data, hora e módulo visíveis no rodapé.
