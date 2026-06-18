# Central 190 v0.14.0 — Mapa tático funcional

## Objetivo

Transformar o mapa estático do despacho em um sistema operacional que influencie decisões, tempo de resposta, risco e pontuação.

## Estrutura implementada

O módulo `js/data/tactical-map.js` concentra dados geográficos, perfis por ocorrência, bases das unidades, estratégias, cálculo de rotas, normalização do save e avaliação do plano. O controlador principal apenas consome os resultados e renderiza a interface.

## Dados por ocorrência

Cada perfil pode definir:

- zona operacional;
- coordenadas do incidente;
- intensidade do trânsito;
- bloqueios e gravidade;
- fatores de risco;
- rota recomendada por unidade.

## Unidades

A build calcula rotas separadas para:

- viatura policial;
- ambulância SAMU;
- apoio aéreo.

As unidades partem de bases diferentes, possuem velocidades distintas e reagem de forma própria aos obstáculos. Bloqueios viários não afetam o helicóptero.

## Interface

A interface oferece:

- distritos táticos;
- rede viária;
- rotas animadas;
- incidentes e bloqueios;
- indicadores de trânsito;
- zoom e centralização;
- arraste por toque/mouse;
- planejador com três estratégias;
- métricas e alertas;
- cartões sincronizados com o mapa.

## Persistência

O save schema v6 registra o estado tático da sessão. Ao continuar um plantão, a build restaura ocorrência, zoom, deslocamento, unidade em foco e estratégia de cada recurso.

## Expansão futura

O módulo permite acrescentar novos distritos, cidades, bases, recursos, bloqueios e perfis sem alterar o formato do restante da carreira. A Fase 9 utilizará esta fundação para criar disponibilidade real, ocupação e retorno das equipes.
