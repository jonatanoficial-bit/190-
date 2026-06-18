# Expansion Registry API v1 — Fase 15

## Finalidade
A API v1 reserva uma interface estável para futuros pacotes de cidades, operações, ocorrências ou mídia sem acoplar diretamente cada expansão ao núcleo do jogo.

## Manifesto mínimo

```json
{
  "id": "city_pack_exemplo",
  "api": 1,
  "content": [
    { "type": "city", "id": "exemplo" }
  ]
}
```

## Regras de validação
- `id`: obrigatório, entre 3 e 40 caracteres, usando letras minúsculas, números, `_` ou `-`.
- `api`: deve ser exatamente `1`.
- `content`: deve ser uma lista.

A função pública de validação é:

```js
C190_Content.validateExpansion(manifest)
```

Retorno:

```json
{
  "ok": true,
  "errors": []
}
```

## Slots reservados
A build registra três categorias iniciais:
- `city-pack`: pacotes de cidades;
- `case-pack`: campanhas e operações especiais;
- `media-pack`: futuras vozes e comunicação de rádio localizada.

## Limites atuais
A Fase 15 valida e exibe o registro, mas não instala código remoto nem baixa pacotes executáveis. Isso é intencional: evita execução insegura e mantém a build offline e auditável. Uma fase futura deverá definir assinatura, catálogo, versionamento, dependências e política de remoção antes da instalação real de DLCs.
