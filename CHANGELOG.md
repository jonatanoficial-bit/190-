# Changelog — Central 190 v0.13.0

## Fase 7 de 20 — Triagem profissional e protocolos operacionais

### Adicionado

- Motor de triagem com quatro níveis de prioridade.
- Sete naturezas operacionais de ocorrência.
- Onze protocolos de atendimento e despacho.
- Perfil de triagem específico para cada uma das oito ocorrências.
- Indicador dinâmico de confiança da classificação.
- Avaliação de cobertura dos protocolos obrigatórios.
- Detecção de subtriagem e supertriagem.
- Revisão da triagem durante a ligação.
- Bloqueio seguro do despacho enquanto a triagem não estiver registrada.
- Feedback de triagem no relatório pós-despacho.
- Catálogos completos de triagem em português, inglês e espanhol.
- Teste automatizado exclusivo da estrutura de triagem.

### Alterado

- Build atualizada para `CENTRAL190-0130-20260612-1641-BRT`.
- Save atualizado do schema v4 para o schema v5.
- Sessão ativa passa a persistir prioridade, natureza, protocolos, confiança, revisões e última avaliação.
- Cálculo de desempenho passa a considerar a qualidade da triagem.
- Risco operacional pode aumentar quando ocorre subtriagem.
- Cache PWA atualizado para incluir o módulo e o CSS da triagem.
- Rodapé e diagnóstico atualizados para a Fase 7.

### Corrigido

- Garantida rolagem interna em telas pequenas após a inclusão do painel de triagem.
- Botões de registrar triagem e abrir despacho permanecem alcançáveis em 360×640.
- Removida importação sem uso no controlador principal.

### Compatibilidade

Saves das versões anteriores são migrados automaticamente. Quando uma sessão antiga não contém triagem, o jogo cria um estado seguro não classificado sem apagar o progresso existente.
