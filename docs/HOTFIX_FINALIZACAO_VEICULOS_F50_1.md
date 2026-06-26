# Fase 50.1 — Hotfix finalização intuitiva e veículos visíveis

Build: `CENTRAL190-4410-F50-1-HOTFIX-FINALIZACAO-VEICULOS-20260624-181500-BRT`

## Problemas corrigidos

1. **Finalização da ocorrência confusa**
   - O jogador não sabia se deveria manter linha aberta, aguardar rádio ou encerrar.
   - O caso policial podia parecer preso eternamente em campo.

2. **Ícones das viaturas sumiram**
   - O mapa dependia muito de `background-image` por classe CSS.
   - Agora o marcador Leaflet renderiza o PNG real dentro do botão do veículo.

## Ajustes aplicados

- Botão de ocorrência em campo agora aparece como **Acompanhar / finalizar**.
- Painel de rádio ganhou guia:
  - passo 1: despacho;
  - passo 2: chegada/contato;
  - passo 3: verificação;
  - passo 4: finalizar.
- Botão **FINALIZAR OCORRÊNCIA** ganhou destaque verde.
- Botão **Manter linha** avisa que não encerra.
- Toasts deixam claro se a ocorrência continua aberta.
- Marcadores do mapa agora usam `<img src="assets/units/...">`.
- Fallback visual para cards de despacho/campo.
- Cache do service worker atualizado para evitar versão antiga presa.

## Veículos garantidos

- PM-01 / PM-02;
- ROCAM;
- Força Tática;
- SAMU USB / USA;
- Bombeiros AB / Resgate;
- Defesa Civil;
- Águia Helicóptero.
