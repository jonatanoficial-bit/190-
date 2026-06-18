# Arquitetura de internacionalização — v0.8.0

## Princípio

Nenhum dado persistido deve depender de texto traduzido. Nomes exibidos podem mudar; IDs não.

## Camadas

### Interface

`js/i18n/translations.js` contém os catálogos PT-BR, EN-US e ES-419. O catálogo em português define o contrato de chaves.

`js/core/i18n.js` oferece:

- resolução de locale completo ou abreviado;
- fallback para PT-BR;
- interpolação `{variavel}`;
- persistência do locale;
- aplicação em texto, placeholder, ARIA, alt e subtítulo visual.

### Conteúdo jogável

`js/i18n/content-translations.js` aplica traduções sobre o banco-base sem alterar seus IDs. A localização recria apenas a representação visual de:

- avatares;
- patentes;
- recursos;
- perguntas;
- ocorrências.

### Estado e save

O save guarda códigos e IDs:

- `country: BR`;
- `language: en-US`;
- `incidentId: incident-01`;
- IDs de unidade e pergunta.

Ao carregar, o conteúdo visual é reconstruído no idioma escolhido.

## Troca durante o jogo

A troca de idioma executa, em ordem:

1. define e persiste o locale;
2. recria o conteúdo localizado;
3. aplica os textos estáticos do documento;
4. sincroniza os seletores;
5. atualiza rodapé e metadados;
6. renderiza novamente lobby, ocorrência, despacho ou resultado ativo;
7. salva o locale junto ao perfil.

## Barreiras anti-quebra

- igualdade exata de chaves entre os três catálogos;
- validação das traduções das 8 ocorrências;
- fallback para o catálogo base;
- IDs estáveis no save;
- migração do schema anterior;
- diagnóstico interno de locales;
- teste contra IDs HTML duplicados.
