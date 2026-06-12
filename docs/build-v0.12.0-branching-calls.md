# Central 190 v0.12.0 — Ligações ramificadas

## Objetivo

Transformar chamadas estáticas em interações que respondem ao comportamento do operador, criando tensão, leitura emocional e consequências antes do despacho.

## Arquitetura

O motor principal está em `js/core/call-branching.js`. Ele não depende diretamente do DOM e pode ser testado de forma isolada. Cada ocorrência recebe um perfil com estado inicial, temperamento, limiar de interrupção e mapa de inteligência oculta.

`js/app.js` integra o motor à interface, ao histórico do chat, à pontuação e aos checkpoints do save.

## Estado do solicitante

- **Confiança:** disposição para cooperar e aceitar instruções.
- **Estresse:** risco de pânico, respostas truncadas e interrupção.
- **Clareza:** qualidade e precisão dos dados fornecidos.
- **Emoção:** descrição derivada dos três indicadores.
- **Linha:** estável ou instável.

Os valores são normalizados para evitar estados impossíveis ou dados corrompidos no save.

## Posturas

### Acolhedora

Adequada para pânico, crianças, vítimas vulneráveis ou solicitantes confusos. Reduz estresse e tende a ampliar confiança.

### Objetiva

Equilibra precisão e velocidade. É especialmente útil quando a ligação está estável e o operador precisa organizar fatos.

### Urgente

Pode ser necessária diante de ameaça imediata. O uso excessivo, entretanto, eleva o risco de interrupção e perda de informação.

## Perguntas e informações

As perguntas são apresentadas em ordem determinística variável, sem priorizar automaticamente a opção ideal. Cada resposta pode:

- revelar um fato;
- confirmar um dado crítico;
- expor contradição;
- alterar estado emocional;
- interromper a linha;
- exigir repetição.

## Persistência

O save v4 registra toda a sessão ramificada. Após recarga, o chat é reconstruído pelo histórico e os indicadores retornam ao estado salvo.

## Mobile

Em telas abaixo de 780 px, o plantão utiliza fluxo vertical rolável. O chat mantém rolagem própria limitada, enquanto console emocional, perguntas e ações permanecem no fluxo principal e alcançáveis por toque.
