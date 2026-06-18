# v0.7.0 — Fundação Anti-Quebra

A primeira fase não altera o conceito visual nem amplia o conteúdo. Ela reduz os riscos que impediriam a evolução segura do projeto.

## Critérios de aceite cumpridos

- ZIP integral e independente.
- Versão, data e hora visíveis.
- Save com integridade verificável.
- Backup e recuperação.
- Migração de versões antigas.
- Retomada do plantão após recarga.
- Validação do conteúdo antes de iniciar gameplay.
- Erro global interceptado por tela de recuperação.
- Diagnóstico visível no próprio jogo.
- PWA com cache exclusivo da build.
- Testes em cinco resoluções.

## Compatibilidade de saves

O jogo procura na seguinte ordem:

1. `central190-save-v070`;
2. `central190-save-v070-backup`;
3. `central190-save-v052`;
4. `central190-save-v050`;
5. `central190-save-v040`;
6. `central190-save-v030`;
7. `central190-save-v020`;
8. `central190-save-v010`.

Dados fora dos limites permitidos são normalizados. Referências inexistentes a avatar, ocorrência, unidade ou pergunta são descartadas.
