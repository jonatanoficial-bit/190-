# Test Report — Central 190 v0.14.0

**Build:** CENTRAL190-0140-20260612-1702-BRT  
**Resultado:** APROVADA

## Testes automatizados

- Sintaxe do controlador, Academia, ramificações, triagem, mapa e service worker.
- Banco com oito ocorrências válidas.
- Paridade entre PT-BR, EN-US e ES-419.
- Academia com cinco módulos e dez decisões.
- Oito perfis de ligação e três posturas de comunicação.
- Oito perfis de triagem.
- Oito perfis de mapa, cinco zonas e três estratégias de rota.
- Cálculo de distância, ETA, bloqueios, trânsito e pontuação tática.
- Save schema v6.
- Checksum, backup, recuperação e migração.
- Estrutura HTML sem IDs duplicados.
- Manifesto PWA, cache e caminhos locais.
- Presença dos controles e estilos responsivos do mapa.

## Auditoria jogável

Método: execução dos HTML, CSS e JavaScript reais em um documento autônomo pelo Chromium. Essa abordagem foi necessária porque a política administrativa do ambiente bloqueou navegação em endereços locais. Para reduzir o peso do documento de auditoria, imagens pesadas foram substituídas apenas no harness por placeholders; os arquivos reais foram verificados separadamente pelos testes de caminhos e pelo manifesto de hashes.

### Fluxo auditado

1. Criação do operador.
2. Saída da Academia e início do plantão.
3. Registro da triagem.
4. Abertura do despacho.
5. Zoom do mapa de 100% para 115%.
6. Arraste real com mouse/pointer.
7. Seleção da viatura.
8. Troca para rota segura.
9. Acesso aos controles finais.
10. Fechamento e reabertura simulados com recuperação da sessão.
11. Persistência do mapa e do idioma espanhol.

### Resultado observado

- Estratégias disponíveis: 3.
- Zoom funcional: aprovado.
- Arraste funcional: aprovado.
- Seleção de rota: aprovada.
- Ausência de rolagem horizontal: aprovada.
- Avisos sem bloquear toque: aprovado.
- Recuperação da sessão: mapa, rota, zoom, deslocamento e idioma restaurados.
- Erros JavaScript no fluxo: 0.

## Resoluções auditadas

- 360×640;
- 390×844;
- 412×915;
- 768×1024;
- 1366×768.

Em todas as resoluções, mapa, planejador, cartões e botão de concluir despacho permaneceram alcançáveis.

## Instalação limpa

O pacote final é acompanhado por manifesto SHA-256. A auditoria de entrega inclui extração em diretório vazio, conferência dos hashes internos, teste da compactação e repetição integral de `npm test`.
