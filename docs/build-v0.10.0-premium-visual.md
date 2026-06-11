# Central 190 v0.10.0 — Reconstrução visual premium

## Objetivo

Elevar a percepção de qualidade do produto sem misturar aparência com gameplay. A nova camada visual foi criada como um arquivo separado para facilitar manutenção, auditoria e rollback.

## Sistema visual

A interface utiliza uma linguagem de central operacional contemporânea:

- azul ciano para informação e navegação;
- âmbar para decisões operacionais;
- verde para integridade e sucesso;
- vermelho para risco e encerramento;
- fundos azul-petróleo com contraste controlado;
- molduras técnicas discretas;
- tipografia de sistema para funcionamento offline.

## Telas

### Home

Recebeu título cinematográfico, status operacional e ações destacadas, preservando o fundo existente.

### Perfil

Avatares passaram a usar cards técnicos com seleção âmbar. No desktop, a tela utiliza uma composição em duas colunas.

### Lobby

Transformado em dashboard operacional. Estatísticas, carreira, turno, histórico e ações possuem hierarquia própria.

### Plantão

Chat, prioridade, risco, mapa e perguntas agora se distinguem visualmente com mais clareza.

### Despacho

Mapa e unidades receberam aparência tática, indicadores de seleção e ETA mais legíveis.

### Configurações e diagnóstico

Mantêm o sistema anti-quebra em evidência, com melhor leitura de resultados e ações.

### Resultado

O debriefing passou a enfatizar nota, XP e critérios técnicos, sem alterar o cálculo existente.

## Proteções

- Nenhuma regra de ocorrência foi modificada.
- Nenhuma chave do save foi removida.
- O schema de save permanece em v2.
- A camada visual pode ser desativada removendo uma única referência CSS.
