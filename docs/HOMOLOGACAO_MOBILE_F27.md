# Fase 27 — Homologação mobile, touch e rolagem

## Objetivo

Corrigir a sensação de tela presa no plantão e garantir que o celular seja a prioridade de uso.

## Decisões de arquitetura

1. **Rolagem única principal:** o `#mainContent` passa a concentrar a rolagem vertical do jogo.
2. **Sidebar independente:** o menu tem rolagem própria e não empurra o conteúdo.
3. **Timer não briga com o dedo:** quando o usuário está rolando/tocando no plantão, o jogo evita reconstruir todo o HTML do atendimento a cada segundo.
4. **Mobile primeiro:** no celular o atendimento ativo aparece antes da fila e do mapa.
5. **Mapa preservado:** a animação das viaturas da Fase 26 continua ativa.

## Roteiro manual recomendado

- Abrir em celular com `?v=2.1.0-f27`.
- Criar carreira ou carregar save.
- Iniciar plantão.
- Atender uma chamada.
- Rolar até perguntas, triagem, despacho e rádio.
- Manter o dedo puxando a rolagem por alguns segundos; a tela não deve voltar sozinha.
- Abrir menu lateral e tocar fora dele; o menu deve fechar.
- Despachar unidade e abrir mapa; a viatura deve se mover em direção à ocorrência.
- Testar em orientação vertical e horizontal.
