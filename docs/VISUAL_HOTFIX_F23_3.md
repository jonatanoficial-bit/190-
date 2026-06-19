# Central 190 — Fase 23.3 Hotfix Fundos Fotográficos Reais

Build: `CENTRAL190-1730-F23-3-HOTFIX-FUNDOS-FOTOGRAFICOS-20260619-184500-BRT`
Versão: v1.7.3
Save schema: 21 preservado.

## Problema corrigido

A Fase 23.2 ainda usava, em algumas telas principais, fundos vetoriais/line-art como `bg-dashboard-room.webp`, `bg-dispatch-immersive.webp`, `bg-map-ops.webp`, `bg-career-room.webp` e `bg-settings-room.webp` como prioridade visual. Esses arquivos não são ruins, mas dão aparência de tela genérica/técnica e não a atmosfera cinematográfica desejada.

A Fase 23.3 muda a prioridade visual: fundos fotográficos e cinematográficos passam a ser a camada principal; artes vetoriais ficam apenas como fallback, painéis técnicos ou legado.

## Mapeamento oficial ativo

- Global/default: `assets/backgrounds/bg-control-room-hall.webp`
- Dashboard/painel: `assets/backgrounds/bg-home-city-night.webp`
- Plantão/chat/rádio/relatórios: `assets/backgrounds/bg-home-hero-clean2.png` com fallback `assets/backgrounds/bg-control-room-lobby.webp`
- Mapa/conteúdo/operações: `assets/backgrounds/bg-home-city-night.webp`
- Carreira/cursos/academia/metas/conquistas/estatísticas: `assets/backgrounds/bg-control-room-lobby.webp`
- Configurações/lançamento: `assets/backgrounds/bg-control-room-hall.webp`
- Fallback global: `assets/backgrounds/bg-central-room.webp`

## Arquivos mantidos como fallback/legado

- `assets/backgrounds/bg-dashboard-room.webp`
- `assets/backgrounds/bg-dispatch-immersive.webp`
- `assets/backgrounds/bg-map-ops.webp`
- `assets/backgrounds/bg-career-room.webp`
- `assets/backgrounds/bg-settings-room.webp`
- SVGs antigos em `assets/backgrounds/`

## Observação de UI

Algumas imagens de menu (`bg-home-hero-clean.png`, `bg-home-hero-clean2.png`, `bg-home-reference.png`) possuem textos ou botões embutidos. Por isso, elas são usadas com overlay escuro e painéis com vidro, evitando que concorram com os botões reais do jogo.
