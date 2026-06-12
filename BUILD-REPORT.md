# Build Report — Central 190 v0.14.0

**Build ID:** CENTRAL190-0140-20260612-1702-BRT  
**Data:** 12/06/2026  
**Hora:** 17:02 BRT  
**Fase:** 8 de 20  
**Módulo:** Mapa tático funcional e planejamento de rotas

## Escopo concluído

A Fase 8 transforma o mapa do despacho em uma parte real da simulação. Cada ocorrência possui localização, condições de trânsito, bloqueios e perfil operacional próprios. Cada recurso parte de uma base diferente e recebe distância, tempo de chegada e risco calculados de acordo com a estratégia escolhida.

## Modelo geográfico

O cenário atual contém cinco zonas operacionais:

- Zona Norte;
- Centro;
- Zona Leste;
- Zona Oeste;
- Zona Sul.

Os oito casos existentes possuem coordenadas, zona, intensidade de trânsito, bloqueios e modificadores específicos. O sistema foi estruturado para receber cidades e mapas adicionais nas fases futuras sem reescrever o controlador principal.

## Estratégias de rota

- **Rápida:** prioriza tempo, aceitando maior exposição a trânsito e bloqueios.
- **Equilibrada:** combina previsibilidade, tempo e segurança operacional.
- **Segura:** evita áreas críticas e reduz risco, podendo aumentar o ETA.

A recomendação muda conforme a ocorrência, o tipo de unidade e os obstáculos ativos. O apoio aéreo não é afetado por bloqueios rodoviários.

## Interação e gameplay

- zoom entre limites seguros;
- centralização instantânea;
- arraste do mapa por toque ou mouse;
- seleção de unidades pelos marcadores ou cartões;
- rotas e ETAs atualizados sem recarregar a tela;
- alertas de bloqueio e incompatibilidade;
- nota tática de até 30 pontos integrada ao resultado;
- relatório informa eficiência, risco médio e adequação das rotas.

## Save v6 e migração

A sessão passa a armazenar:

- ocorrência vinculada ao mapa;
- nível de zoom;
- deslocamento horizontal e vertical;
- unidade atualmente em foco;
- estratégia de rota por unidade.

Saves antigos são normalizados para um estado tático seguro. Checksum, backup rotativo, recuperação e migração automática continuam ativos.

## Responsividade

A antiga grade compacta do despacho foi substituída porque comprimia o mapa dinâmico. A versão atual usa fluxo vertical rolável no celular e grade de duas colunas no desktop. A auditoria confirmou ausência de rolagem horizontal e acesso aos controles finais em 360×640, 390×844, 412×915, 768×1024 e 1366×768.

## Anti-quebra preservado

- validação das oito ocorrências;
- validação dos três idiomas;
- validação da Academia Operacional;
- validação das ligações ramificadas;
- validação da triagem;
- validação dos oito perfis táticos;
- checksum e backup do save;
- recuperação da sessão;
- proteção global contra erros;
- diagnóstico interno;
- cache PWA vinculado ao Build ID;
- hashes SHA-256 e manifesto de arquivos.
