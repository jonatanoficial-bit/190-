# Fase 29 — Balanceamento final

A Fase 29 fecha a economia central do Central 190 para beta comercial.

## Pesos da nota final do plantão

- Protocolo de atendimento: 20%
- Triagem: 20%
- Despacho de recursos: 22%
- Rádio operacional: 18%
- Localização: 12%
- Resultado da ocorrência: 8%

## Economia

- Limite de XP por chamada: 260
- Reputação por chamada: de -9 até +6
- Bônus de plantão perfeito: até 113 XP e +3 reputação no Especialista/S
- Penalidades e advertências ajustadas por dificuldade.

## Correção importante

Antes havia risco de aplicar multiplicador de dificuldade no `release.adjustOutcome()` e novamente em `career.applyOutcome()`. Agora a carreira respeita `balanceVersion` e evita dupla multiplicação.
