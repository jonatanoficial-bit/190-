# Central 190 v0.11.0 — Tutorial e Academia Operacional

## Objetivo

Criar uma formação jogável para pessoas sem experiência em segurança pública compreenderem a lógica básica do simulador antes de iniciar um plantão.

## Módulos

1. **Localização e referência** — endereço, ponto de referência, descrição e direção de fuga.
2. **Risco imediato** — arma, agressor ativo, disparo, incêndio e riscos secundários.
3. **Vítimas e prioridade médica** — consciência, respiração, hemorragia e pessoas vulneráveis.
4. **Segurança do solicitante** — abrigo, discrição, distância e proibição de perseguição.
5. **Despacho proporcional** — combinação de segurança e socorro sem sobrecarregar a rede.

## Fluxo

`Lobby → Academia → módulo desbloqueado → cenário → decisão → feedback → próxima etapa → certificação`

## Regras de progressão

- Os módulos são desbloqueados em sequência.
- Uma resposta incorreta não bloqueia a formação.
- A etapa só é concluída após a alternativa correta.
- Acertos na primeira tentativa alimentam a taxa de precisão.
- A certificação é concedida após as 10 decisões.
- A recompensa de 150 XP é concedida uma única vez.
- Módulos concluídos podem ser revisados.

## Internacionalização

A academia utiliza um catálogo próprio por idioma. Todos os pacotes precisam manter os mesmos IDs de módulos e etapas. O teste `training.test.mjs` bloqueia a build se houver estrutura divergente ou decisão sem resposta correta única.

## Persistência

A academia usa o save protegido da carreira. O schema v3 migra jogadores antigos para um estado inicial seguro, com orientação assistida ativada por padrão.
