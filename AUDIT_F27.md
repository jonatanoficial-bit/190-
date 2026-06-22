# AUDIT_F27 — v2.1.0

Build: `CENTRAL190-2100-F27-MOBILE-HOMOLOGATION-TOUCH-SCROLL-20260622-104500-BRT`

## Foco da fase

Homologação mobile-first estrutural, correção de rolagem única, estabilização do plantão durante o timer, menu lateral em overlay no celular e otimização do layout do plantão.

## Correções aplicadas

- `#mainContent` virou a raiz principal de rolagem do jogo.
- `html/body` ficam travados para não competir com a rolagem do conteúdo.
- Sidebar tem rolagem própria e overlay no mobile.
- Escape e clique fora fecham o menu lateral em celular/tablet.
- Plantão usa guardião de renderização: enquanto o jogador rola/toca, o timer não reconstrói a área completa.
- Atualização leve mantém status/contador sem puxar a rolagem.
- Quando o usuário para de interagir, o plantão atualiza a interface completa novamente.
- Ordem mobile do plantão foi ajustada: atendimento ativo primeiro, fila depois, pausadas depois, mapa por último.
- Ajustes para safe-area, telas pequenas, landscape e alvos de toque.

## Auditoria estática

Resultado: `tests/F27_STATIC_AUDIT.json`

- JavaScript: 19 arquivos com sintaxe aprovada.
- CSS: 52 URLs de assets verificadas, nenhuma ausente.
- Save schema 25 validado.
- Cache PWA v2.1.0 validado.
- Guardião de rolagem detectado no `app.js`.
- Regras mobile/touch detectadas no `style.css`.

## Observação de homologação física

A fase foi auditada estruturalmente no pacote. Ainda é recomendado validar em celular real após publicar no Vercel/GitHub Pages: abrir plantão, rolar chat, rolar rádio, abrir/fechar menu, despachar unidade e conferir movimento da viatura no mapa.
