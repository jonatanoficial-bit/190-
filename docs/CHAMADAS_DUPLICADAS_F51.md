# Fase 51 — Chamadas duplicadas, testemunhas e versões contraditórias

Build: `CENTRAL190-4500-F51-CHAMADAS-DUPLICADAS-20260624-184500-BRT`

## Novidades

- Novo módulo `js/duplicate-calls.js`.
- Painel **Chamadas Duplicadas** no plantão.
- Detecção de ligações sobre o mesmo fato.
- Confiança calculada por:
  - categoria/natureza;
  - zona/região;
  - prioridade;
  - similaridade de texto;
  - precisão/localização.
- Alerta de versões contraditórias:
  - prioridade diferente;
  - natureza diferente;
  - região diferente;
  - nível de precisão divergente.
- Ações do operador:
  - **Unir chamadas**;
  - **São casos diferentes**.
- Ao unir, uma ligação vira o caso principal e as demais viram testemunhas vinculadas.
- Central Multitarefa considera duplicidade não tratada.
- Supervisor alerta grupos pendentes.
- Relatório final recebe `duplicateSummary`.

## Objetivo

Evitar confusão quando várias pessoas ligam para a mesma emergência. O operador pode unificar chamadas relacionadas, reduzir fila artificial e tratar versões contraditórias antes de encaminhar o caso.
