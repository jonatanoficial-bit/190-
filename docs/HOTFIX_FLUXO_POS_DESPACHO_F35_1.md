# Fase 35.1 — Hotfix fluxo contínuo pós-despacho

Build: `CENTRAL190-2910-F35-1-HOTFIX-FLUXO-POS-DESPACHO-20260624-101500-BRT`

## Problema corrigido

Após confirmar despacho, a ocorrência ficava como chamada ativa em rádio e podia dar a sensação de que a central estava presa na ligação anterior. Isso dificultava a entrada/visualização da próxima chamada.

## Correção

- Ao confirmar despacho, a ocorrência passa para estado `field`.
- A central libera `activeCallId` para atender nova ligação.
- A próxima chamada agendada é antecipada para cair em poucos segundos.
- A ocorrência anterior aparece em **Campo / pausadas** como **EM CAMPO**.
- O jogador pode tocar em **Acompanhar rádio** para voltar à ocorrência anterior.
- O rádio e as viaturas no mapa continuam funcionando.
