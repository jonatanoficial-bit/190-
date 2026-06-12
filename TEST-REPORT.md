# Test Report — Central 190 v0.13.0

**Build:** CENTRAL190-0130-20260612-1641-BRT  
**Resultado:** APROVADA

## Testes automatizados

- Sintaxe do controlador principal, Academia, ramificações, triagem e service worker.
- Banco com oito ocorrências válidas.
- Paridade entre PT-BR, EN-US e ES-419.
- Academia com cinco módulos e dez decisões.
- Oito perfis de ligação e três posturas de comunicação.
- Oito perfis de triagem.
- Quatro prioridades, sete naturezas e onze protocolos.
- Referências válidas entre ocorrências e classificações.
- Save schema v5.
- Checksum, backup, recuperação e migração.
- Estrutura HTML sem IDs duplicados.
- Manifesto PWA, cache e caminhos locais.
- Presença dos controles e estilos responsivos da triagem.

## Auditoria jogável

Método: execução da própria build em documento autônomo pelo Chrome DevTools Protocol, incorporando os HTML, CSS, JavaScript e assets reais. Essa abordagem foi necessária porque a política administrativa do Chromium do ambiente bloqueou navegação em endereços locais.

### Fluxo auditado

1. Início do plantão.
2. Coleta de quatro informações críticas.
3. Classificação P1.
4. Seleção da natureza correta.
5. Aplicação dos seis protocolos exigidos no caso auditado.
6. Registro e recuperação do save.
7. Troca entre os três idiomas.
8. Abertura do despacho.
9. Seleção de recursos.
10. Relatório final.

### Resultado observado

- Confiança inicial: 14%.
- Confiança após confirmação e classificação: 81%.
- Avaliação de prioridade: correta.
- Avaliação de natureza: correta.
- Cobertura de protocolos: 6 de 6.
- Save recuperado: schema v5, checksum válido e triagem integral.
- Nota final do fluxo auditado: A.
- XP do fluxo auditado: 210.
- Erros de execução: 0.
- Rolagem horizontal: 0 px.

## Resoluções auditadas

- 360×640;
- 390×844;
- 412×915;
- 768×1024;
- 1366×768.

Em todas as resoluções, o botão de registrar/atualizar triagem e o botão de abrir despacho ficaram alcançáveis após a rolagem.

## Instalação limpa

O pacote final é acompanhado por manifesto SHA-256. A auditoria de entrega inclui extração em diretório limpo, conferência dos hashes internos e repetição integral de `npm test`.
