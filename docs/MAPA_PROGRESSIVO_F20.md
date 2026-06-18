# Fase 20 — Mapa operacional jogável com localização progressiva

Nesta fase o mapa deixa de revelar a ocorrência automaticamente. A precisão depende do que o jogador pergunta na ligação.

## Estágios

1. Sem localização: ocorrência não aparece no mapa.
2. Área aproximada: bairro/setor ou referência, raio amplo.
3. Rua provável: rua/endereço principal, raio médio.
4. Quadra provável: rua + número ou rua + referência, raio reduzido.
5. Local confirmado: endereço + número + referência, raio mínimo.

## Recursos próximos

O mapa passa a exibir unidades simuladas de PM, Bombeiros e SAMU como prévia para a Fase 21 de despacho real.

## Anti-quebra

O mapa tático offline usa os mesmos estágios de precisão e continua funcionando sem internet. Tiles externos não são cacheados.
