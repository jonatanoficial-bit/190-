# TEST-REPORT — Central 190 v0.18.0

## Resultado geral

**APROVADO**

## Suíte automatizada

Todos os testes de `npm test` passaram:

- sintaxe JavaScript e service worker;
- 8 ocorrências;
- PT-BR, EN-US e ES-419;
- 5 módulos e 10 decisões da Academia;
- 8 perfis de ligações ramificadas;
- 8 perfis de triagem;
- 8 perfis de mapa tático;
- 8 recursos e 5 estados operacionais;
- 8 perfis de despacho profissional;
- 8 perfis e 24 etapas de campo;
- plantão contínuo com 3 chamadas e 6 estados;
- save schema v10;
- build, PWA, DOM e caminhos locais.

## Auditoria jogável

Aprovado em:

- 360×640;
- 390×844;
- 412×915;
- 768×1024;
- 1366×768.

Resultados:

- três cartões de chamada em todas as resoluções;
- nenhuma rolagem horizontal;
- botão de alternar chamada disponível após a entrada da segunda ligação;
- troca de ocorrência confirmada;
- estado restaurado após voltar ao lobby;
- recuperação em uma nova instância confirmada;
- seis métricas e três linhas no relatório consolidado;
- fluxo completo aprovado: triagem → despacho → operação de campo → resultado → próxima chamada;
- zero erros de execução;
- zero erros ou avisos de console nos fluxos auditados.

## Correção encontrada durante a auditoria

No primeiro teste desktop, o painel da fila tinha altura de aproximadamente 30 px por conflito com grades antigas. A CSS foi corrigida e o painel passou a 286 px em 1366×768, com as três chamadas visíveis e rolagem da tela preservada.
