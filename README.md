# Central 190 - Build v0.4.0

Vale Games • Mobile-first • Site estático para GitHub Pages/Vercel.

## Destaques v0.4.0

- Carreira local expandida com histórico de relatórios.
- Nota técnica por ocorrência: A, B, C ou D.
- Progresso de patente com barra visual no lobby.
- Manual de Protocolo 190 dentro do jogo.
- Tela de configurações de simulação ultra realista.
- Banco de ocorrências ampliado com casos críticos de São Paulo.
- Mantém botão de despacho acessível e perguntas limitadas a duas por rodada.

## Publicação

Envie todos os arquivos da pasta para GitHub Pages ou Vercel como site estático. Não há backend obrigatório.

## Regra da build

Versão, data, hora e módulo aparecem no rodapé do app conforme padrão Vale Games.


## Build v0.5.0
- Sistema de turnos: manhã, tarde, noite e madrugada.
- Fila dinâmica de chamadas no plantão.
- Ocorrências filtradas por horário, com pressão operacional e rádio de supervisão.
- Penalidade leve por fila pendente e avaliação de gestão do plantão no relatório.
- Ajustes visuais mobile-first no painel de plantão e mapa.

## Build v0.5.1 — Correção estrutural full screen

Esta build é uma fase de fundação visual e de usabilidade. O foco foi corrigir o comportamento de tela para o jogo operar como app mobile-first:

- app shell ocupando 100% da viewport;
- bloqueio de rolagem global do documento;
- rolagem interna por tela;
- tela de plantão com chat rolando internamente;
- botões críticos sempre acessíveis;
- layout de despacho com mapa e ações sem sobreposição;
- metadados PWA iniciais (`manifest.webmanifest` e `sw.js`);
- versão, data, hora e módulo preservados no rodapé.

Os caminhos de assets existentes foram mantidos.
