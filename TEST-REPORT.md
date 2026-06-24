## v3.8.0 — Fase 44

- JS auditado por sintaxe.
- Voz PT-BR integrada via SpeechSynthesis.
- Sons gerados localmente por Web Audio.
- Sem arquivos externos de áudio.

# Test Report — Central 190 v2.4.0 Fase 30

## Testes executados no pacote
- `node --check js/*.js`: aprovado.
- `node tests/logic-test.js`: 261 verificações aprovadas.
- Auditoria de URLs de assets CSS: 52 URLs, 0 ausentes.
- Verificação de ZIP: sem erro.

## Itens validados
- Save schema 28.
- Migração dos schemas 10–27.
- 51 templates de ocorrência.
- 10 recursos operacionais.
- 9 cidades.
- 7 operações especiais.
- 7 missões de campanha.
- 8 módulos da Academia 190.
- Tutorial com 8 etapas.
- Checklist público da RC.

## Homologação manual pendente
Celular físico, tablet e PC no domínio final, com atenção a rolagem, menu, PWA e mapa real.


## v2.5.0 — Fase 31 — Hotfix fila contínua e ícones SP
- Corrigida a continuidade de ligações após despacho: a próxima chamada é antecipada quando a ocorrência entra no rádio e não há fila em espera.
- Adicionada faixa de aviso da próxima ligação/ligação aguardando na Fila Viva.
- A Fila Viva passa a receber atualização leve mesmo quando o guardião de rolagem bloqueia renderização completa.
- Novos ícones cinematográficos inspirados em São Paulo para PM, ROCAM, Águia, Bombeiros, SAMU e Defesa Civil.
- Mapa real e mapa tático agora exibem as unidades por arte de veículo, não apenas bolinhas/texto.
