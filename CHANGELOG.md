## v3.8.0 — Fase 44 — Áudio de ocorrência e voz PT-BR

- Adicionados sons de ocorrência por categoria: fogo/resgate, médico/SAMU, pânico/risco e chuva/desastre.
- Adicionada voz PT-BR por síntese do navegador.
- O chamador e o rádio operacional podem ser narrados.
- Novos controles em Configurações.
- Mantém o ZIP leve: nenhum MP3/WAV/OGG externo.

# Central 190 v2.3.0 — Fase 29

Build: CENTRAL190-3800-F44-MANUTENCAO-VIATURAS-20260624-141500-BRT
Save schema: 27

## Fase 29 — Balanceamento final

- Novo módulo `js/balance.js` com pesos oficiais da nota final.
- Pontuação final agora combina protocolo, triagem, despacho, rádio, localização e resultado.
- Correção de economia: evita multiplicação dupla de dificuldade no XP.
- XP por chamada, reputação e advertências agora têm limites comerciais.
- Relatórios mostram resumo do balanceamento.
- Dificuldades Assistido, Realista e Especialista preservadas com impacto ajustado.

---


## v2.2.0 — Fase 28 — Casos realistas e multi-etapas

- 18 novas ocorrências realistas.
- Falas específicas por ocorrência.
- Rádio com evolução própria por caso.
- Novas operações especiais: Trama Urbana e Fronteira de Resgate.
- Nova missão de campanha: Turno realista.
- Correção do contador duplicado de ocorrências resolvidas.

# Central 190 v1.8.0 — Fase 24 — RC AAA, áudio e imersão

Build: `CENTRAL190-3800-F44-MANUTENCAO-VIATURAS-20260624-141500-BRT`  
Data: 20/06/2026 17:30:00 BRT

- Áudio operacional gerado localmente por Web Audio API.
- Sons de telefone, perguntas, triagem, despacho, rádio, sucesso, alerta e erro.
- Configurações de áudio e vibração em Configurações.
- Relatórios finais com breakdown profissional por chamada.
- Polimento visual e mobile-first preservando fundos fotográficos e layout corrigido.
- Save schema 22 com migração automática.

---

# Central 190 v1.8.0 — Fase 24 — Hotfix layout mobile-first

Build: `CENTRAL190-3800-F44-MANUTENCAO-VIATURAS-20260624-141500-BRT`

- Topbar e sidebar restauradas como fixas.
- Card de nova carreira reorganizado para texto e formulário alinhados.
- Mobile priorizado: formulário em uma coluna, botões maiores, painel compacto e rolagem natural.
- Fundos fotográficos reais da v1.7.3 preservados.
- Cache PWA atualizado para `central190-v3.8.0-f44-manutencao-viaturas