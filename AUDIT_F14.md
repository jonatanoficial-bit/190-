# AUDITORIA — Fase 14 v0.20.0

Build `CENTRAL190-0200-F14-20260617-100821-BRT` — 17/06/2026 10:08:21 BRT

## Escopo auditado
- Integridade de HTML, CSS, JavaScript, JSON, manifest, service worker e referências locais.
- Save schema 12, checksum, backup e migração do schema 11.
- Geração, persistência e validade das coordenadas das ocorrências.
- Leaflet local, atribuição OpenStreetMap, modos real/automático/tático e fallback offline.
- Garantia de que o service worker não intercepta nem armazena blocos cartográficos externos.
- Seleção, enquadramento e atendimento de ocorrência pelo mapa.
- Preservação de carreira, cursos, metas, conquistas e plantão contínuo.
- Responsividade mobile 390×844 e desktop 1366×768.

## Resultado automatizado
- Auditoria estrutural: PASS — 112 verificações, 39 arquivos.
- Testes lógicos: PASS — 26 verificações de migração, carreira, plantão e georreferenciamento.
- Chromium headless em mobile e desktop: PASS.
- Erros JavaScript: 0.
- Overflow horizontal: 0.
- Diagnóstico interno anti-quebra: PASS.

## Cenários de navegador validados
1. Criar carreira e iniciar plantão.
2. Receber ocorrência com coordenadas.
3. Abrir a tela de mapa real e confirmar Leaflet carregado.
4. Listar e selecionar a ocorrência pelo mapa.
5. Alternar para o modo tático e confirmar o fallback.
6. Executar o diagnóstico anti-quebra com schema 12.

## Limite controlado
O motor Leaflet está no pacote e funciona offline, mas o desenho cartográfico real depende do servidor de tiles e de internet. O jogo nunca depende disso para continuar: em falha, usa o mapa tático interno. A auditoria em sandbox validou a integração do motor e o fallback; a disponibilidade visual dos tiles deve ser homologada também no ambiente final de hospedagem.
