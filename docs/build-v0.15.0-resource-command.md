# Fase 9 — Central de Recursos

## Objetivo

Substituir a seleção abstrata de polícia, ambulância e helicóptero por equipes específicas, persistentes e sujeitas à disponibilidade operacional.

## Modelo de dados

Cada recurso possui:

- ID estável;
- prefixo;
- tipo;
- base operacional;
- quantidade de tripulantes;
- estado;
- ciclos restantes para liberação;
- prontidão;
- condição;
- fadiga;
- número de missões.

## Ciclo operacional

No início de cada novo atendimento, a frota avança um ciclo. Equipes ocupadas ou em deslocamento passam a retornar; equipes retornando tornam-se disponíveis; manutenção recupera condição progressivamente. Equipes despachadas recebem fadiga e desgaste e podem retornar à base ou entrar em manutenção conforme a condição final.

## Seleção e cobertura

Somente equipes disponíveis podem ser reservadas. O sistema aceita uma equipe por tipo e calcula a cobertura residual da rede. Alertas orientam o jogador quando o despacho deixa a cidade sem reserva policial, médica ou aérea.

## Pontuação

A avaliação considera:

- adequação dos tipos enviados;
- prontidão média;
- condição média;
- fadiga;
- quantidade de equipes mobilizadas;
- cobertura residual;
- uso excessivo ou insuficiente da frota.

## Internacionalização

Status, rótulos, mensagens, alertas e feedback estão disponíveis em PT-BR, EN-US e ES-419. IDs e regras permanecem independentes do idioma para evitar corrupção de saves.

## Compatibilidade

Saves v0.14.0 e anteriores são migrados para schema v7. Seleções genéricas antigas são convertidas para a melhor equipe disponível de cada tipo.
