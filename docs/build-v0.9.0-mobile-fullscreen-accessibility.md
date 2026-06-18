# Central 190 v0.9.0 — Mobile, fullscreen, PWA e acessibilidade

## Objetivo
Preparar o jogo para uso prioritário em celular, mantendo tablet e desktop jogáveis. Esta fase não altera o núcleo das ocorrências; ela reforça tela cheia, instalação, toque, rolagem, safe areas e acessibilidade.

## Entregas
- Identificação de build atualizada para v0.9.0.
- Botões e elementos interativos com alvo mínimo de toque.
- CSS com `100dvh`, `--app-height`, safe areas e rolagem interna.
- Barra de ações crítica sticky em telas longas.
- Configurações locais: texto maior, alto contraste e redução de movimento.
- Botão de instalação PWA e tratamento de `beforeinstallprompt`.
- Estado visual e `aria-pressed` para preferências.
- Media query dedicada para landscape compacto.
- Foco visível para teclado e acessibilidade.
- Manifesto e service worker sincronizados com a build.

## Observação técnica
Navegadores móveis não permitem forçar fullscreen sem interação do usuário. A build usa as duas estratégias corretas: botão de tela cheia quando permitido e PWA com `display: fullscreen` quando instalado.
