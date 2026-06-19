# Fase 23.1 — Hotfix de Fundos Cinematográficos

Esta fase corrige o uso real dos backgrounds no jogo.

## Fundo ativo por tela

- Global/central: `assets/backgrounds/bg-central-room.webp`
- Dashboard: `assets/backgrounds/bg-dashboard-room.webp`
- Plantão/chat/rádio/relatórios: `assets/backgrounds/bg-dispatch-immersive.webp`
- Mapa/operações/despacho: `assets/backgrounds/bg-map-ops.webp`
- Carreira/Academia/cursos/metas/conquistas/estatísticas: `assets/backgrounds/bg-career-room.webp`
- Configurações/lançamento: `assets/backgrounds/bg-settings-room.webp`

## Fundos opcionais detectados quando estiverem presentes

- `assets/backgrounds/bg-control-room-hall.webp`
- `assets/backgrounds/bg-control-room-lobby.webp`
- `assets/backgrounds/bg-home-city-night.webp`
- `assets/backgrounds/bg-home-hero-clean.png`
- `assets/backgrounds/bg-home-hero-clean2.png`
- `assets/backgrounds/bg-home-reference.png`

Esses arquivos foram vistos na pasta local do usuário. O CSS usa essas imagens automaticamente quando existirem, com fallback seguro para os WEBP obrigatórios.

## Legado

Os SVGs `bg-central-190.svg`, `bg-dashboard.svg`, `bg-dispatch.svg`, `bg-map.svg`, `bg-career.svg` e `bg-settings.svg` permanecem como histórico, mas não são mais a camada visual principal.
