# BUILD-REPORT — Central 190 v0.18.0

**Build ID:** `CENTRAL190-0180-20260613-1221-BRT`  
**Fase:** 12 de 20 — Plantão contínuo, fila viva e relatório consolidado  
**Data/hora:** 13/06/2026 às 12:21 BRT  
**Save schema:** 10  
**Continuous shift schema:** 1

## Objetivo

Substituir o ciclo isolado de uma ocorrência por um plantão operacional contínuo. O jogador agora administra três chamadas, alterna atendimentos, suporta pressão de espera, perde chamadas abandonadas e recebe um relatório consolidado ao final.

## Arquivos principais adicionados

- `js/data/continuous-shift.js`
- `css/continuous-shift-v018.css`
- `tests/continuous-shift.test.mjs`
- `docs/build-v0.18.0-continuous-shift.md`

## Integrações

O sistema foi conectado a:

- lobby;
- atendimento e triagem;
- despacho;
- operação de campo;
- resultado individual;
- save, backup e recuperação;
- histórico do operador;
- PWA e cache;
- três idiomas.

## Sistema anti-quebra

- normalização de todos os estados da fila;
- limite rígido de três chamadas;
- IDs validados contra o banco de ocorrências;
- snapshots clonados antes de persistir;
- apenas uma chamada ativa por vez;
- migração automática de saves anteriores;
- checksum e backup rotativo;
- recuperação do turno por até 24 horas;
- validação de caminhos e componentes essenciais;
- manifesto SHA-256 da entrega.

## Limitação do ambiente de auditoria

A política administrativa do Chromium bloqueou navegação direta por `localhost` e `file://`. A auditoria jogável foi executada em um documento autônomo gerado com o HTML, CSS e JavaScript reais da build incorporados. Os caminhos e assets do ZIP foram validados separadamente pela suíte de referências, hashes e extração limpa.
