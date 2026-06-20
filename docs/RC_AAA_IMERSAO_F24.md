# Fase 24 — RC AAA, áudio, imersão e polimento final

Build: `CENTRAL190-1800-F24-RC-AAA-IMERSAO-20260620-173000-BRT`  
Versão: v1.8.0

Esta fase fecha o ciclo de simulação real iniciado na Fase 18 e transforma a build em uma nova Release Candidate jogável.

## Novidades

- Áudio local por Web Audio API: telefone, beeps de protocolo, rádio, despacho, sucesso, alerta e erro.
- Sem dependência de arquivos externos de áudio.
- Vibração opcional no celular.
- Painel de áudio em Configurações.
- Relatórios mais profissionais, com detalhes por chamada.
- Checklist de lançamento reconhecendo áudio e imersão.
- Polimento de espaço em mobile, tablet e desktop.

## Configurações

- `settings.soundEnabled`
- `settings.soundVolume`
- `settings.radioFx`
- `settings.vibration`
- `settings.immersiveHud`

## Observação

Navegadores móveis só liberam áudio depois de uma interação do usuário. Por isso o módulo destrava o Web Audio no primeiro toque/clique/tecla.
