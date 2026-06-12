# Central 190 — v0.13.0

**Build ID:** `CENTRAL190-0130-20260612-1641-BRT`  
**Fase:** 7 de 20 — Triagem profissional e protocolos operacionais  
**Data:** 12/06/2026 às 16:41 BRT

Esta build preserva a Fundação Anti-Quebra, os três idiomas, o foco mobile, fullscreen/PWA, acessibilidade, identidade visual premium, Academia Operacional e ligações ramificadas das fases anteriores. A Fase 7 adiciona uma triagem obrigatória antes do despacho, com prioridade, natureza, protocolos e avaliação de risco integrados ao resultado.

## Como abrir

Abra `index.html` em um navegador moderno ou hospede a pasta em um servidor estático. Para fullscreen real, atualização controlada e melhor funcionamento offline, instale a PWA quando o navegador oferecer essa opção.

## Principais novidades

- Quatro níveis operacionais de prioridade: P1, P2, P3 e P4.
- Sete naturezas de ocorrência.
- Onze protocolos selecionáveis.
- Confiança da triagem calculada pelos dados realmente confirmados.
- Triagem obrigatória antes da abertura do despacho.
- Revisão da classificação enquanto a ocorrência permanece ativa.
- Detecção de subtriagem e supertriagem.
- Penalidade por prioridade inadequada, protocolo insuficiente ou uso excessivo da rede.
- Integração com risco, despacho, nota e relatório técnico.
- Estado completo da triagem recuperado após recarregar o jogo.
- Save atualizado para schema v5, com checksum, backup e migração automática.
- Interface e conteúdo completos em PT-BR, EN-US e ES-419.
- Layout mobile com rolagem interna e controles finais alcançáveis.
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
- `docs/build-v0.13.0-professional-triage.md`
- `docs/asset-manifest.md`
- `reports/audit-v0.13.0.json`
- `reports/runtime-v013/runtime-audit-v0.13.0.json`
