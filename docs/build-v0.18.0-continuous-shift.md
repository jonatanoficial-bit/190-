# Fase 12 — Plantão contínuo

## Visão geral

A Fase 12 transforma cada sessão em um turno com três chamadas. Uma ligação começa ativa, a segunda entra após 18 segundos e a terceira após 42 segundos. O operador precisa decidir quando permanecer no atendimento atual e quando alternar para uma ocorrência mais urgente.

## Estados da chamada

- `incoming`: ainda não entrou na central;
- `waiting`: aguardando atendimento;
- `active`: atendimento atual;
- `paused`: atendimento interrompido com snapshot salvo;
- `completed`: ocorrência encerrada com resultado;
- `abandoned`: solicitante desistiu ou o plantão foi encerrado.

## Prioridade e espera

A prioridade é derivada do risco-base da ocorrência:

- crítica;
- alta;
- média;
- baixa.

Cada prioridade possui limite máximo de espera e dois marcos de escalada. Chamadas críticas escalam e abandonam mais rapidamente.

## Snapshot da ocorrência

Ao trocar de ligação, o sistema salva:

- tela atual;
- ocorrência;
- perguntas e informações descobertas;
- estado emocional do solicitante;
- triagem;
- mapa e rotas;
- recursos selecionados;
- ordens de despacho;
- operação de campo;
- cronômetro e risco.

Ao retomar, esses dados são reconstruídos sem reiniciar a ocorrência.

## Relatório consolidado

O fechamento do turno calcula:

- total de chamadas;
- chamadas concluídas;
- chamadas abandonadas;
- pontuação média;
- pontuação total;
- nível de serviço;
- nota A, B, C ou D.

O resumo é salvo no histórico do operador.

## Regras anti-quebra

- apenas uma chamada pode ficar ativa;
- no máximo três chamadas por turno;
- IDs inválidos são descartados na normalização;
- snapshots passam por clonagem segura;
- saves antigos recebem uma fila nova sem perder a carreira;
- turno e ocorrência são recuperáveis após recarga;
- o relatório permanece acessível mesmo sem ocorrência ativa.
