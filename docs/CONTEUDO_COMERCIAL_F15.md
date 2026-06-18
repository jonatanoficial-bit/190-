# Conteúdo Comercial e Longevidade — Fase 15

## Objetivo
Criar razões duradouras para retornar ao Central 190 sem transformar o jogo em repetição artificial. Os novos modos usam o mesmo núcleo de despacho, mas possuem regras próprias de progressão, estatísticas e recompensa.

## Modos

### Plantão de carreira
Mantém três chamadas progressivas, afeta XP, reputação, disciplina, promoções, metas e desafios.

### Desafios rotativos
O jogo mantém um desafio diário e um semanal. A escolha é estável durante o período, pois deriva da data local e da semana ISO. O progresso é salvo e a recompensa só pode ser resgatada uma vez.

Métricas possíveis:
- ocorrências resolvidas;
- plantões concluídos;
- turnos perfeitos;
- nota mínima 80;
- prioridades críticas resolvidas;
- cidades diferentes utilizadas.

### Operações especiais
São sequências autorais com chamadas conectadas e cidade definida:
1. Operação Linha Segura;
2. Noite de Tempestade;
3. Final no Estádio;
4. Cerco Bancário;
5. Apagão Metropolitano.

Cada operação possui requisito de patente. A primeira conclusão com nota 70 ou superior concede a recompensa exclusiva. Tentativas e melhor nota permanecem registradas.

### Sandbox
Permite testar livremente:
- 1 a 12 chamadas;
- intervalo de 4 a 40 segundos;
- módulo de cidade;
- mistura de prioridades;
- penalidades opcionais.

O resultado entra apenas nas estatísticas gerais do Sandbox. O modo não altera XP, reputação, promoções, advertências, metas de carreira nem total de plantões válidos.

## Módulos de cidade
Cada cidade possui centro geográfico, perfil operacional e etiquetas temáticas usadas na seleção das ocorrências.

| Cidade | Liberação |
|---|---:|
| São Paulo, Rio de Janeiro, Brasília, Belo Horizonte, Recife e Porto Alegre | Inicial |
| Salvador | 8 plantões |
| Curitiba | 12 plantões |
| Manaus | 18 plantões |

Operações especiais podem levar o jogador a uma cidade ainda não liberada sem desbloqueá-la permanentemente para o plantão livre.

## Estatísticas
A tela de estatísticas apresenta:
- relatórios totais;
- taxa de resolução;
- nota média e melhor nota;
- turnos perfeitos;
- tempo operacional;
- modos jogados;
- distribuição de notas;
- desempenho por cidade;
- resultados recentes.

## Persistência e compatibilidade
- Save schema 13.
- Migração automática do schema 12.
- Normalização defensiva de campos ausentes.
- Relatórios antigos continuam válidos.
- Estado de desafios, Sandbox, operações e estatísticas é persistido junto ao save principal.
