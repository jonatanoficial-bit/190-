# AUDITORIA — Fase 15 v0.21.0

Build `CENTRAL190-0210-F15-20260617-104343-BRT` — 17/06/2026 10:43:43 BRT

## Escopo auditado
- Integridade de HTML, CSS, JavaScript, JSON, manifest, service worker e referências locais.
- Save schema 13, checksum, backup e migração do schema 12.
- Preservação do mapa real, fallback tático e dados geográficos.
- 32 modelos de ocorrência e regras de geração por cidade, prioridade e modo.
- Desafios diário/semanal, progresso, recompensa e proteção contra resgate duplicado.
- Cinco operações especiais, exigência de patente, repetição e recompensa única.
- Sandbox configurável e isolamento total da carreira.
- Nove módulos de cidade e desbloqueios por plantões.
- Estatísticas avançadas e registro por modo, nota e cidade.
- Expansion Registry API v1 e rejeição de manifestos incompatíveis.
- Responsividade mobile 390×844 e desktop 1366×768.

## Resultado automatizado
- Auditoria integrada: **PASS — 258 verificações em 45 arquivos auditáveis**.
- Testes lógicos: **PASS — 83 verificações**.
- Navegador desktop e mobile: **PASS**.
- Erros JavaScript: **0**.
- Erros de console: **0**.
- Overflow horizontal: **0**.
- Diagnóstico interno anti-quebra: **PASS**.
- Contagem validada: **9 cidades, 5 operações especiais, 32 modelos de ocorrência**.
- Sandbox validado com quatro chamadas e carreira permanecendo em zero plantões.

## Cenários de navegador validados
1. Criar uma carreira nova.
2. Abrir a central de operações e renderizar dois desafios, cinco operações e nove cidades.
3. Iniciar Sandbox com quatro chamadas.
4. Confirmar `affectsCareer = false` e ausência de incremento de plantões.
5. Abrir o mapa e forçar o fallback tático.
6. Abrir estatísticas e renderizar seis indicadores principais.
7. Executar o diagnóstico interno com schema 13.
8. Confirmar ausência de rolagem horizontal em mobile e desktop.

## Limites controlados
- O mapa cartográfico real continua dependente da internet e do provedor de tiles; o fallback tático preserva a jogabilidade.
- O registro de expansões ainda não instala conteúdo remoto. Ele fornece apenas contrato e slots seguros para etapas futuras.
- Os desafios usam o relógio local do dispositivo. Alterações manuais de data podem antecipar a rotação, mas não permitem resgatar duas vezes o mesmo registro salvo.

## Evidências
- `tests/logic-test.js`
- `tests/BROWSER_AUDIT.json`
- `tests/F15-desktop.png`
- `tests/F15-mobile.png`
- `tests/ROTEIRO_TESTE_JOGAVEL.md`
