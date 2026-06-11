# Build Report — Central 190 v0.10.0

**Build ID:** CENTRAL190-0100-20260611-1907-BRT  
**Data:** 11/06/2026  
**Hora:** 19:07 BRT  
**Fase:** 4 de 20  
**Módulo:** Reconstrução visual premium

## Escopo concluído

A Fase 4 substitui a aparência de protótipo por um sistema visual operacional consistente, sem modificar as regras de gameplay. A nova camada é isolada da lógica, reduzindo o risco de regressão e permitindo evolução futura por componentes.

## Arquitetura visual

- `css/style.css`: base histórica, responsividade, mobile, PWA e acessibilidade.
- `css/premium-v010.css`: tokens, componentes e composições premium da Fase 4.
- `data-screen` no shell: identifica a tela ativa sem alterar o estado do jogo.
- Elementos decorativos usam `aria-hidden` e não interferem com leitores de tela.

## Compatibilidade

- Mobile retrato continua sendo a prioridade.
- Mobile paisagem possui regra compacta.
- Tablet recebe composição centralizada e expansível.
- Desktop recebe dashboards e grids próprios, evitando aparência de aplicativo estreito ampliado.

## Desempenho de assets

- Total de assets v0.9.0: aproximadamente 16,67 MB.
- Total de assets v0.10.0: aproximadamente 4,69 MB.
- Redução aproximada: 71,8%.
- As imagens foram redimensionadas para o tamanho real de uso, preservando transparência.

## Anti-quebra preservado

- Save v2 com checksum.
- Backup rotativo.
- Recuperação de sessão.
- Migração automática.
- Diagnóstico interno.
- Validação de conteúdo e traduções.
- Service worker vinculado ao Build ID.
- ZIP com hashes SHA-256.
