# Fase 50 — Encaminhamento legal e continuidade pós-ocorrência

Build: `CENTRAL190-4400-F50-ENCAMINHAMENTO-LEGAL-20260624-171500-BRT`

## Novidades

- Novo módulo `js/legal-followup.js`.
- Painel **Encaminhamento Legal** no plantão.
- Fluxos por tipo de ocorrência:
  - violência → delegacia / investigação criminal;
  - SAMU → regulação médica / hospital;
  - resgate → Defesa Civil / laudo técnico;
  - trânsito → BOAT / CET / perícia;
  - geral → boletim operacional interno.
- Pontuação legal por ocorrência.
- Pendências legais visíveis no plantão.
- `legalSummary` anexado ao relatório final.
- Supervisor Operacional alerta pendência legal.
- Debriefing reconhece bom encaminhamento.

## Hotfixes incluídos

- Corrigido risco de variáveis indefinidas na Central Multitarefa envolvendo camadas das Fases 46 a 49.
- Corrigido risco de variáveis indefinidas no Supervisor envolvendo cobertura, inteligência e prevenção.
- Relatório final agora passa por `evidenceSummary` e `legalSummary` antes de carreira/campanha.

## Objetivo

Fazer a ocorrência continuar depois do atendimento: boa documentação e encaminhamento correto fortalecem investigação, hospital, perícia e evolução profissional.
