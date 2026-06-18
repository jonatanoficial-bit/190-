# Central 190 v0.13.0 — Triagem profissional

## Objetivo

Criar uma etapa obrigatória entre a ligação e o despacho, aproximando o jogo de uma central real de emergências. A classificação deixa de ser implícita e passa a exigir decisão consciente do operador.

## Estrutura implementada

### Prioridades

- P1 — crítica;
- P2 — alta;
- P3 — moderada;
- P4 — baixa.

### Naturezas

O catálogo contém sete naturezas operacionais, identificadas por IDs estáveis e traduzidas em PT-BR, EN-US e ES-419.

### Protocolos

O catálogo contém onze protocolos selecionáveis. Cada caso possui protocolos obrigatórios e complementares, permitindo avaliar cobertura mínima sem impor uma única sequência de cliques.

## Regras de segurança

- O despacho não abre sem triagem registrada.
- IDs desconhecidos são descartados na normalização do save.
- Um save antigo recebe estado inicial não classificado.
- A recompensa e a nota não dependem de textos traduzidos, apenas de IDs estáveis.
- A avaliação não expõe previamente o gabarito da ocorrência.
- A triagem pode ser revista, e o número de revisões é persistido.

## Consequências

- Subtriagem aumenta o risco.
- Supertriagem reduz eficiência operacional.
- Protocolos ausentes diminuem a nota.
- Classificação compatível melhora o resultado.
- Confiança baixa alerta que ainda faltam informações essenciais.

## Mobile first

A interface utiliza botões grandes, seleção visível, grade adaptativa e rolagem interna. Nenhum texto foi incorporado a imagens, preservando acessibilidade e tradução dinâmica.
