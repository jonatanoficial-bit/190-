# Central 190 — Fase 23.3 Curadoria visual dos assets

Build: `CENTRAL190-1730-F23-3-HOTFIX-FUNDOS-FOTOGRAFICOS-20260619-184500-BRT`

## Decisão visual

Foram analisados os 12 fundos rasterizados presentes na pasta `assets/backgrounds`. A correção desta fase não é simplesmente trocar caminhos; é escolher o fundo correto para cada função do jogo.

## Imagens usadas ativamente

- `bg-control-room-hall.webp`: fundo global/default por parecer uma central física real, escura e sem texto impresso.
- `bg-control-room-lobby.webp`: início de carreira e ambiente interno, sem conflito com formulário.
- `bg-dashboard-room.webp`: painel inicial, métricas e cards do dashboard.
- `bg-dispatch-immersive.webp`: plantão, atendimento por chat, rádio e relatórios.
- `bg-map-ops.webp`: mapa, operações e despacho de unidades.
- `bg-career-room.webp`: carreira, Academia 190, metas, conquistas e estatísticas.
- `bg-settings-room.webp`: configurações e lançamento.
- `bg-central-room.webp`: fallback técnico global.

## Imagens preservadas como referência, não como fundo jogável

- `bg-home-hero-clean.png`, `bg-home-hero-clean2.png` e `bg-home-reference.png` já possuem menu/botões/texto impressos. Usá-las atrás de botões reais deixa a UI duplicada e bagunçada.
- `bg-home-city-night.webp` é uma arte vertical externa de cidade. Funciona melhor como pôster/splash do que atrás do formulário desktop do operador.

## Correções aplicadas

- Painéis voltaram a usar vidro + textura, não fotos repetidas.
- Dashboard deixou de usar imagem com helicóptero/cidade como fundo principal.
- Home/carreira deixou de usar imagens com botões impressos atrás do formulário.
- `sw.js` recebeu cache novo para forçar o navegador a abandonar o visual antigo.
- `js/assets.js` agora audita fundos ativos e separa fundos de referência.

## Gameplay preservado

Nenhum sistema de carreira, atendimento, triagem, mapa, despacho, rádio ou Academia 190 foi removido. Save schema permanece em 21.
