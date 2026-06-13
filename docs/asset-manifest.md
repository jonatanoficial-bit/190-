# Central 190 — Asset Manifest v0.18.0

## Backgrounds ativos

- `assets/backgrounds/bg-home-city-night.webp` — home.
- `assets/backgrounds/bg-control-room-lobby.webp` — perfil, lobby e configurações.
- `assets/backgrounds/bg-control-room-hall.webp` — plantão, despacho, manual e resultado.
- `assets/backgrounds/bg-home-reference.png` — compatibilidade com regras históricas do CSS base.

## Avatares

- `avatar-operator-01-lead.png`
- `avatar-operator-02-brunette.png`
- `avatar-operator-03-specialist.png`
- `avatar-operator-04-bearded.png`
- `avatar-operator-05-analyst-glasses.png`

## Unidades

- `unit-police-cruiser.png`
- `unit-ambulance-samu.png`
- `unit-helicopter-police.png`

As unidades foram recompostas em canvases otimizados para a interface atual.

## Insígnias

- `insignia-rank-01-basic.png`
- `insignia-rank-02-intermediate.png`
- `insignia-rank-03-advanced.png`
- `insignia-rank-04-elite.png`

Todas foram redimensionadas para 512×512 com transparência preservada.

## Ícones

- `icon-alert.png`
- `icon-check.png`
- `icon-error.png`
- `icon-incident-marker.png`
- `icon-radar.png`
- `icon-stopwatch.png`
- `icon-192.png`
- `icon-512.png`

## Arquivos removidos

- `bg-home-hero-clean.png` — sem uso.
- `bg-home-hero-clean2.png` — sem uso.
- `ui-panel-kit.png` — sem uso.

## Resultado

O diretório de assets foi reduzido de aproximadamente 16,67 MB para 4,69 MB, sem remover nenhum recurso usado pelo jogo.

## v0.11.0 — Academia operacional

Esta fase não adiciona imagens rasterizadas. Toda a nova interface da academia, módulos, progresso, feedback e orientação foi construída em HTML/CSS para manter leveza, responsividade e compatibilidade com os três idiomas.


## v0.12.0 — Ligações ramificadas

Esta fase não adiciona imagens rasterizadas. O console emocional, medidores, posturas, inteligência confirmada e estados da linha foram construídos em HTML/CSS. Isso preserva a tradução dinâmica, reduz peso e evita produzir três versões de cada elemento visual.


## v0.13.0 — Triagem profissional

Esta fase não adiciona imagens rasterizadas. Prioridades, naturezas, protocolos, confiança e estados de classificação foram construídos em HTML/CSS. A decisão preserva leveza, acessibilidade, adaptação mobile e tradução dinâmica nos três idiomas.


## v0.14.0 — Mapa tático funcional

Esta fase não adiciona imagens rasterizadas. Distritos, estradas, rotas, tráfego, bloqueios, marcadores, controles e alertas são renderizados por HTML, CSS e SVG dinâmico. Os três arquivos de unidades existentes são reutilizados como marcadores, evitando aumento significativo do pacote e mantendo textos traduzíveis.


## v0.15.0 — Central de recursos

A Fase 9 reutiliza os sprites transparentes existentes de viatura, ambulância e helicóptero. Identidade, prefixo, base, condição e status são gerados em código para manter a interface trilíngue e evitar imagens com texto. Nenhum novo asset raster obrigatório foi adicionado.

## v0.16.0 — Despacho profissional

A Fase 10 não adiciona imagens rasterizadas. Prioridades, ordens, linha do tempo, redirecionamento e cancelamento foram construídos em HTML/CSS para preservar acessibilidade, baixo peso e tradução dinâmica.

## v0.17.0 — Operação de campo

A Fase 11 reutiliza os sprites das equipes e os fundos operacionais existentes. Canal de rádio, métricas, cartões de equipe, ações, estados e desfechos são renderizados em HTML/CSS, sem texto incorporado em imagem. Nenhum novo asset raster obrigatório foi adicionado.


## v0.18.0 — Plantão contínuo

A Fase 12 não exige novos arquivos raster. Fila, prioridades, estados, relógio, cartões e relatório consolidado são renderizados em HTML/CSS para manter os três idiomas, acessibilidade e baixo peso. Os assets existentes de avatares, unidades, insígnias e fundos foram preservados.
