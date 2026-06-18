# Arquitetura v0.7.0

## Camadas

### Conteúdo

`js/data/content.js` mantém avatares, patentes, recursos, perguntas e ocorrências. Antes do jogo iniciar, `content-validator.js` verifica consistência e referências cruzadas.

### Persistência

`save-manager.js` é responsável por normalização, schema, checksum, backup, recuperação e migração. O restante do jogo não grava diretamente no `localStorage`.

### Runtime

`runtime-guard.js` captura erros não tratados e ativa uma interface de recuperação. O objetivo é evitar tela branca sem explicação e preservar a carreira.

### Diagnóstico

`diagnostics.js` verifica metadados, conteúdo, DOM crítico, armazenamento, backup, viewport, service worker e contexto seguro.

### Aplicação

`app.js` coordena interface e gameplay. A navegação só aceita telas registradas em `VALID_SCREENS`. A evolução futura deverá continuar extraindo domínios de gameplay desse arquivo.

## Próximas extrações recomendadas

- máquina de estados do plantão;
- motor de ocorrências;
- avaliação e pontuação;
- internacionalização;
- áudio;
- mapa e recursos operacionais.
