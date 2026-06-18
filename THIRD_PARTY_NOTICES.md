# Avisos de componentes de terceiros

## Leaflet 1.9.4
Copyright (c) 2010-2023, Vladimir Agafonkin; Copyright (c) 2010-2011, CloudMade.
Distribuído sob a licença BSD 2-Clause. O texto integral está em `vendor/leaflet/LICENSE`.

## OpenStreetMap
Os dados cartográficos são © OpenStreetMap contributors e devem manter atribuição visível. A build usa o servidor padrão de tiles apenas quando está online e não armazena tiles externos no cache PWA. O uso do servidor está sujeito à política do OpenStreetMap; para tráfego elevado, use um provedor adequado ou hospede sua própria infraestrutura.

## Modificações locais
A aplicação Central 190 não altera a biblioteca Leaflet. O mapa tático offline é uma implementação própria e não contém dados cartográficos do OpenStreetMap.

## Confirmação Fase 16

A build v1.0.0 RC mantém Leaflet 1.9.4 local e atribuição OpenStreetMap. Nenhum tile externo é incluído no pacote ou no cache offline.


## Assets visuais Fase 17

Os SVGs em `assets/backgrounds`, `assets/ui`, `assets/badges` e `assets/illustrations` foram criados localmente para este pacote e podem ser usados dentro do projeto Central 190.
