# Test Report — Central 190 v0.10.0

## Resultado geral

**APROVADO** para continuidade da evolução.

## Testes automatizados executados

- Sintaxe de `js/app.js` e `sw.js`.
- Integridade das 8 ocorrências.
- Paridade de chaves entre PT-BR, EN-US e ES-419.
- Save schema v2, checksum, backup, recuperação e migração.
- Identificação da build e fase.
- Ausência de IDs HTML duplicados.
- Manifesto PWA 192×192 e 512×512.
- Cache sincronizado com a build.
- Presença da camada visual premium.
- Presença dos componentes visuais críticos.
- Limpeza dos assets obsoletos.
- Referências e caminhos locais.

## Auditoria visual

Foram geradas evidências estáticas em:

- 390×844;
- 360×640;
- 768×1024;
- 1366×768.

Telas verificadas: home, perfil, lobby, plantão, despacho e resultado. O teste representativo de 8 combinações confirmou:

- ausência de rolagem horizontal no documento;
- ações principais alcançáveis;
- ausência de erros de renderização no harness;
- compatibilidade da composição mobile e desktop.

## Limitação do ambiente

A política administrativa do navegador bloqueou navegação para `http://127.0.0.1` e `file://`. Por isso, a auditoria visual foi executada por um harness estático com HTML, CSS e assets incorporados via `page.set_content`. A lógica foi validada separadamente pelos testes Node/Python do projeto.
