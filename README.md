# Central 190 — v0.14.0

**Build ID:** `CENTRAL190-0140-20260612-1702-BRT`  
**Fase:** 8 de 20 — Mapa tático funcional e planejamento de rotas  
**Data:** 12/06/2026 às 17:02 BRT

Esta build preserva a Fundação Anti-Quebra, os três idiomas, o foco mobile, fullscreen/PWA, acessibilidade, identidade visual premium, Academia Operacional, ligações ramificadas e triagem profissional. A Fase 8 substitui o mapa estático por um sistema tático interativo que calcula distância, tempo de chegada, trânsito, bloqueios e risco para cada unidade.

## Como abrir

Abra `index.html` em um navegador moderno ou hospede a pasta em um servidor estático. Para fullscreen real, atualização controlada e melhor funcionamento offline, instale a PWA quando o navegador oferecer essa opção.

## Principais novidades

- Cinco zonas operacionais conectadas ao banco de ocorrências.
- Oito perfis táticos, um para cada ocorrência disponível.
- Rotas individuais para viatura, ambulância e apoio aéreo.
- Estratégias rápida, equilibrada e segura.
- Cálculo de distância, ETA, atraso, trânsito e risco de rota.
- Bloqueios viários e corredores congestionados representados no mapa.
- Zoom, centralização e arraste por toque ou mouse.
- Seleção de unidade diretamente no mapa e nos cartões.
- Recomendação dinâmica de rota conforme o cenário.
- Avaliação tática integrada à nota e ao relatório final.
- Estado do mapa recuperado após fechar ou recarregar o jogo.
- Save atualizado para schema v6, com checksum, backup e migração automática.
- Interface completa em PT-BR, EN-US e ES-419.
- Layout mobile rolável e composição tática própria para desktop.
- Versão, fase, data e hora visíveis no jogo.

## Testes

Execute:

```bash
npm test
```

## Documentação

- `CHANGELOG.md`
- `BUILD-REPORT.md`
- `TEST-REPORT.md`
- `docs/build-v0.14.0-tactical-map.md`
- `docs/asset-manifest.md`
- `reports/audit-v0.14.0.json`
- `reports/runtime-v014/runtime-audit-v0.14.0.json`
