# Central 190 — v0.19.0 — Fase 13

Build: `CENTRAL190-0190-F13-20260613-1259-BRT`  
Compilação: `13/06/2026 12:59:23 BRT`  
Save: schema 11, com migração automática dos saves v10 e chaves legadas.

## Conteúdo principal
- Carreira completa com 7 patentes, XP, reputação e critérios reais de promoção.
- Advertências com reincidência, perda de reputação e expiração por plantões.
- 7 cursos, 4 especializações, 6 metas e 10 conquistas.
- Plantão contínuo preservado: 3 chamadas por turno, entrada progressiva, fila viva, espera, escalada, pausa, retomada, abandono e relatório consolidado.
- PT-BR, inglês e espanhol; PWA offline; layout mobile-first; tela cheia.
- Proteção anti-quebra com checksum, backup local, migração, diagnóstico e captura de erros.

## Execução
Hospede a pasta em um servidor HTTP estático. Para teste local:

```bash
python -m http.server 8080
```

Abra `http://localhost:8080`.
