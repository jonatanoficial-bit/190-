# Auditoria Fase 23.1 — Hotfix Visual

Build: `CENTRAL190-1710-F23-1-HOTFIX-FUNDOS-CINEMATICOS-20260619-173500-BRT`  
Versão: `1.7.1`  
Save schema: `21` preservado.

## Verificações

- CSS recompilado com variáveis principais apontando para WEBP/PNG.
- Service Worker atualizado para cache novo.
- Assets obrigatórios presentes: 19/19.
- Fundos opcionais registrados sem quebrar se ausentes.
- SVGs antigos removidos da prioridade visual no CSS e no cache principal.
- Sintaxe JavaScript validada.
- Integridade do ZIP validada.

## Comando de conferência sugerido

```bash
grep -R "bg-dispatch\|bg-map\|bg-central\|bg-career\|bg-settings\|bg-dashboard\|bg-home\|bg-control" css js sw.js index.html
```

O resultado esperado deve mostrar os WEBP/PNG cinematográficos como ativos e os SVGs apenas como `legacyOnly`, se aparecerem.
