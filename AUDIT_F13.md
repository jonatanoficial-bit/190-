# AUDITORIA — Fase 13 v0.19.0

Build `CENTRAL190-0190-F13-20260613-1259-BRT` — 13/06/2026 12:59:23 BRT

## Escopo auditado
- Integridade estrutural HTML/CSS/JavaScript.
- Referências de arquivos locais.
- IDs críticos e navegação entre 8 telas.
- Save schema 11, checksum, backup e migração.
- Progressão de carreira e critérios de promoção.
- Plantão contínuo, fila, decisões e fechamento do relatório.
- Responsividade por CSS em 320, 360, 390, 412, 768 e 1366 px.
- PWA e cache offline.

## Resultado
Os testes automatizados incluídos em `tests/audit.py` devem retornar código 0. A build foi empacotada apenas após aprovação desses testes.

## Limite conhecido de compatibilidade
Como o ZIP físico da v0.18.0 não estava anexado nesta conversa, esta entrega foi construída como reconstrução completa compatível com os requisitos e com migração de saves v10, não como diff binário sobre o pacote anterior.

## Teste funcional em navegador
- Chromium headless, viewport mobile 390×844: aprovado, 0 erros JavaScript e 0 overflow horizontal.
- Chromium headless, viewport desktop 1366×768: aprovado, 0 erros JavaScript e 0 overflow horizontal.
- Fluxos validados: criação de carreira, plantão, chamada, decisão, telas de carreira/cursos/conquistas e diagnóstico interno.

## Teste lógico automatizado
- 15 verificações: migração v10→v11, promoção, bloqueio por advertência, expiração disciplinar, custo de curso, 3 chamadas por plantão e relatório consolidado.
- Resultado: PASS.
