# Mapa Operacional Real — Fase 14

## Arquitetura
- Motor: Leaflet 1.9.4, armazenado em `vendor/leaflet/`.
- Camada online padrão: raster do OpenStreetMap.
- Fallback: mapa tático próprio em HTML/CSS, sem rede.
- Controlador: `js/map.js`.
- Coordenadas: criadas ao iniciar/migrar plantões e salvas no schema 12.

## Modos
- **Automático:** usa o mapa real quando o navegador está online e troca para o tático em caso de falha.
- **Mapa real:** solicita a camada online, preservando fallback de segurança.
- **Tático offline:** não solicita cartografia e mantém os marcadores em grade operacional.

## Privacidade
A geolocalização não é solicitada ao abrir o jogo. Ela somente é pedida quando o jogador toca em “Usar minha região aproximada”. A posição é arredondada para três casas decimais antes de ser armazenada localmente e não é enviada pelo código do jogo a servidor próprio.

## Licenças e atribuição
A atribuição do Leaflet e do OpenStreetMap permanece visível no canto do mapa. Não remova os créditos. A licença do Leaflet está em `vendor/leaflet/LICENSE`; consulte também `THIRD_PARTY_NOTICES.md`.

## Escala comercial
O endpoint padrão de tiles é adequado para demonstração e uso moderado sujeito à política do serviço. Para lançamento comercial com grande quantidade de jogadores, altere a constante de tiles em `js/map.js` para um provedor contratado/compatível ou uma infraestrutura própria. Não remova a atribuição de dados do OpenStreetMap quando a camada continuar baseada nesses dados.

## Anti-quebra
Após três falhas de tiles em uma instância, o jogo sinaliza a falha e ativa o modo tático. O service worker ignora requisições externas, evitando cache não autorizado e problemas de quota.
