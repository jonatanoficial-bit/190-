# Changelog — Central 190 v0.14.0

## Fase 8 de 20 — Mapa tático funcional e planejamento de rotas

### Adicionado

- Motor tático com cinco zonas operacionais.
- Oito perfis de mapa vinculados às ocorrências existentes.
- Três estratégias de rota: rápida, equilibrada e segura.
- Cálculo individual de distância, ETA, atraso e risco para cada unidade.
- Trânsito por distrito, bloqueios viários e modificadores de percurso.
- Rotas visuais animadas para polícia, ambulância e apoio aéreo.
- Controles de zoom, centralização e arraste por toque ou mouse.
- Seleção de unidade diretamente no mapa.
- Planejador de rota com recomendação e aviso contextual.
- Avaliação tática integrada ao resultado e à pontuação.
- Teste automatizado exclusivo do motor do mapa.

### Alterado

- Build atualizada para `CENTRAL190-0140-20260612-1702-BRT`.
- Save atualizado do schema v5 para o schema v6.
- Sessão ativa passa a persistir zoom, deslocamento, unidade em foco e estratégia de cada recurso.
- Cartões das unidades passam a exibir distância, ETA e rota escolhida.
- Despacho deixa de usar posições e tempos meramente fixos.
- Cache PWA atualizado para incluir o módulo e o CSS do mapa tático.
- Rodapé, configurações e diagnóstico atualizados para a Fase 8.

### Corrigido

- Removido conflito com a grade antiga que comprimira o mapa dinâmico no mobile.
- Tela de despacho reconstruída como fluxo rolável em celular e grade ampliada em desktop.
- Avisos temporários passaram a ignorar eventos de toque, evitando bloquear botões.
- Helicóptero deixa de receber penalidade indevida por bloqueios rodoviários.
- Controles finais permanecem alcançáveis em 360×640.

### Compatibilidade

Saves das versões anteriores são migrados automaticamente. Sessões antigas recebem um estado tático seguro, mantendo carreira, ocorrência, triagem e progresso já existentes.
