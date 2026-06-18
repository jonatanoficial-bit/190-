# Central 190 — Fase 18: Motor Real de Atendimento por Chamada/Chat

A Fase 18 muda o núcleo do plantão: a ocorrência não aparece mais como um caso pronto. O jogador atende uma ligação, conversa com o chamador em formato de chat e precisa coletar dados antes de escolher o encaminhamento.

## Fluxo implementado

1. Chamada entra na fila viva.
2. Operador atende a ligação.
3. Chamador abre a conversa com informações incompletas.
4. Jogador usa botões fixos de protocolo para perguntar endereço, situação, vítimas, arma, segurança, dados de retorno e riscos ambientais.
5. Perguntas inseguras ou improdutivas são permitidas, mas registram erro.
6. O sistema calcula nota de protocolo S/A/B/C/D.
7. A decisão final usa a qualidade da escolha e a qualidade do atendimento.
8. Endereço precisa ser coletado para liberar a visualização da ocorrência no mapa.

## Pontuação

O sistema avalia campos essenciais e erros de atendimento. Encerrar com decisão correta, mas sem endereço ou sem triagem mínima, pode gerar falha de protocolo. Perguntas perigosas, como pedir para o chamador se aproximar, geram penalidade.

## Compatibilidade

A fase preserva carreira, mapa real, mapa tático offline, assets visuais, cidades, desafios, operações especiais, sandbox, PWA e migração de saves antigos.
