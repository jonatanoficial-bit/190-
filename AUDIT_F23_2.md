# AUDIT_F23_2 — Hotfix fundos fotográficos reais

Build: CENTRAL190-1730-F23-3-HOTFIX-FUNDOS-FOTOGRAFICOS-20260619-184500-BRT
Versão: v1.7.3 — Fase 23.3
Save schema: 21

## Escopo

Correção visual baseada no ZIP baixado do GitHub/Vercel enviado pelo usuário. Foram analisados os fundos da pasta `assets/backgrounds` e definido um mapeamento funcional por tela.

## Resultado da análise dos fundos

- `bg-control-room-hall.webp`: usado como fundo global/default.
- `bg-control-room-lobby.webp`: usado no início de carreira e ambiente interno.
- `bg-dashboard-room.webp`: usado no dashboard.
- `bg-dispatch-immersive.webp`: usado no plantão, atendimento, rádio e relatórios.
- `bg-map-ops.webp`: usado no mapa e despacho operacional.
- `bg-career-room.webp`: usado em carreira, cursos, metas, conquistas e estatísticas.
- `bg-settings-room.webp`: usado em configurações e lançamento.
- `bg-central-room.webp`: mantido como fallback global.
- `bg-home-city-night.webp`: preservado como referência/splash; não usado como fundo desktop do formulário.
- `bg-home-hero-clean.png`, `bg-home-hero-clean2.png`, `bg-home-reference.png`: preservados como referência/marketing; não usados atrás de botões vivos por já terem UI impressa.

## Validações

- Assets extras copiados para o ZIP v1.7.3.
- CSS recebeu camada final F23.3 com curadoria por tela.
- `sw.js` recebeu cache novo `central190-v1.7.3-f23-3-hotfix-fundos-fotograficos`.
- `js/assets.js` separa fundos ativos e fundos de referência.
- Save schema mantido em 21.
- Sistemas preservados: carreira, atendimento, triagem, mapa, despacho, rádio, Academia 190.
