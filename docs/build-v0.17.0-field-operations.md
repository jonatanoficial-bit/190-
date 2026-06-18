# Fase 11 — Operação de campo

## Objetivo

Criar um estágio operacional jogável entre o despacho e o relatório, eliminando o resultado instantâneo e permitindo que as decisões posteriores à chegada das equipes influenciem o caso.

## Arquitetura

O módulo `js/data/field-operations.js` mantém catálogo, normalização, resolução das decisões, cálculo de desfecho, pontuação e validação. A interface está em `css/field-operations-v017.css` e é integrada pelo estado principal em `js/app.js`.

## Modelo de simulação

Cada ocorrência possui três etapas próprias e um estado inicial de controle, perigo e civis. As ações alteram:

- controle da cena;
- perigo operacional;
- tempo decorrido;
- vítimas protegidas;
- reforços;
- falhas;
- condição do suspeito;
- condição das vítimas.

Ações que exigem polícia, ambulância ou helicóptero são avaliadas contra as equipes realmente enviadas. Uma ordem sem recurso compatível gera falha operacional e aumento de perigo.

## Persistência

O save schema v9 armazena etapa, decisões, rádio, métricas, desfecho e pontuação. A normalização impede quebra quando dados antigos ou corrompidos contêm índices fora do catálogo.

## Internacionalização

Rótulos, dicas, etapas, rádio, desfechos e relatórios estão disponíveis em PT-BR, EN-US e ES-419.

## Auditoria

A validação cobre os 8 perfis, 24 etapas, 9 ações, 4 desfechos e três idiomas. O fluxo real e a recuperação foram testados nas cinco resoluções oficiais.
