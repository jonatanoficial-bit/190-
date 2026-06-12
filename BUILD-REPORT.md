# Build Report — Central 190 v0.13.0

**Build ID:** CENTRAL190-0130-20260612-1641-BRT  
**Data:** 12/06/2026  
**Hora:** 16:41 BRT  
**Fase:** 7 de 20  
**Módulo:** Triagem profissional e protocolos operacionais

## Escopo concluído

A Fase 7 transforma a passagem da ligação para o despacho em uma decisão operacional formal. O jogador precisa classificar a prioridade, identificar a natureza predominante e selecionar os protocolos adequados antes de mobilizar recursos.

## Modelo de prioridade

- **P1 — Crítica:** ameaça imediata à vida, violência ativa ou risco extremo.
- **P2 — Alta:** possibilidade relevante de agravamento, vítima vulnerável ou crime em andamento.
- **P3 — Moderada:** situação controlável que ainda demanda resposta operacional.
- **P4 — Baixa:** demanda sem ameaça imediata, adequada para resposta não emergencial.

A classificação é comparada ao perfil da ocorrência. Prioridade abaixo da necessária é tratada como subtriagem; prioridade exagerada pode indicar supertriagem e sobrecarga da rede.

## Naturezas e protocolos

O sistema possui sete naturezas e onze protocolos traduzidos. Cada ocorrência define prioridade esperada, natureza correta, protocolos obrigatórios e complementares. A cobertura é calculada sobre as informações confirmadas durante a ligação, evitando que o operador receba a solução antecipadamente.

## Integração com o gameplay

- O despacho permanece bloqueado até o registro da triagem.
- A triagem pode ser revisada antes da mobilização.
- Subtriagem eleva o risco operacional.
- Prioridade, natureza e protocolos influenciam o relatório final.
- O resultado informa compatibilidade, cobertura e falhas de protocolo.
- A confiança combina confirmação de localização, ameaça, vítimas, clareza e cobertura operacional.

## Save v5 e migração

A sessão passa a armazenar:

- `priorityId`;
- `natureId`;
- `protocolIds`;
- `submitted`;
- `revisions`;
- `confidence`;
- `lastAssessment`.

Saves antigos são normalizados para um estado de triagem seguro. Checksum, backup rotativo, recuperação e migração automática continuam ativos.

## Responsividade

O painel usa controles de toque, grade adaptativa e rolagem interna. A auditoria confirmou ausência de rolagem horizontal e acesso aos botões finais em 360×640, 390×844, 412×915, 768×1024 e 1366×768.

## Anti-quebra preservado

- validação de conteúdo;
- validação dos três idiomas;
- validação da Academia Operacional;
- validação das ligações ramificadas;
- validação dos oito perfis de triagem;
- checksum e backup do save;
- recuperação da sessão;
- proteção global contra erros;
- diagnóstico interno;
- cache PWA vinculado ao Build ID;
- hashes SHA-256 e manifesto de arquivos.
