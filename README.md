## v4.4.1 — Fase 50.1 — Áudio de ocorrência e voz PT-BR

Esta build adiciona áudio operacional avançado e voz PT-BR sem arquivos externos, usando Web Audio API e SpeechSynthesis do navegador.

# Central 190 — Simulador Operacional

Versão: **v2.4.0 — Fase 30 — RC pública/comercial**

Simulador fictício de central de emergência com atendimento por chat, coleta de endereço, triagem, mapa real/tático, despacho de PM/Bombeiros/SAMU/Defesa Civil, rádio operacional, viaturas animadas, carreira, campanha, cursos e tutorial guiado.

## Jogabilidade principal
1. Atenda a chamada.
2. Pergunte endereço, referência, risco e segurança.
3. Classifique natureza, prioridade e órgão responsável.
4. Despache recursos no mapa.
5. Acompanhe a evolução pelo rádio.
6. Encerre com relatório e evolução de carreira.

## Fase 30
- Tutorial operacional com 8 etapas.
- Checklist público da RC.
- Manifest e Service Worker atualizados.
- Save schema 28 com migração dos schemas anteriores.
- Mobile-first preservado.

## Privacidade
Save local no navegador. Sem telemetria, sem conta obrigatória e sem upload de dados para nuvem.


## v2.5.0 — Fase 31 — Hotfix fila contínua e ícones SP
- Corrigida a continuidade de ligações após despacho: a próxima chamada é antecipada quando a ocorrência entra no rádio e não há fila em espera.
- Adicionada faixa de aviso da próxima ligação/ligação aguardando na Fila Viva.
- A Fila Viva passa a receber atualização leve mesmo quando o guardião de rolagem bloqueia renderização completa.
- Novos ícones cinematográficos inspirados em São Paulo para PM, ROCAM, Águia, Bombeiros, SAMU e Defesa Civil.
- Mapa real e mapa tático agora exibem as unidades por arte de veículo, não apenas bolinhas/texto.
