export const avatars = [
  { id: 'avatar-operator-01-lead', name: 'Operador 01', src: 'assets/avatars/avatar-operator-01-lead.png' },
  { id: 'avatar-operator-02-brunette', name: 'Operadora 02', src: 'assets/avatars/avatar-operator-02-brunette.png' },
  { id: 'avatar-operator-03-specialist', name: 'Operador 03', src: 'assets/avatars/avatar-operator-03-specialist.png' },
  { id: 'avatar-operator-04-bearded', name: 'Operador 04', src: 'assets/avatars/avatar-operator-04-bearded.png' },
  { id: 'avatar-operator-05-analyst-glasses', name: 'Operadora 05', src: 'assets/avatars/avatar-operator-05-analyst-glasses.png' }
];

export const ranks = [
  { minXp: 0, title: 'Atendente I', insignia: 'assets/insignias/insignia-rank-01-basic.png' },
  { minXp: 160, title: 'Atendente II', insignia: 'assets/insignias/insignia-rank-02-intermediate.png' },
  { minXp: 360, title: 'Atendente III', insignia: 'assets/insignias/insignia-rank-03-advanced.png' },
  { minXp: 700, title: 'Supervisor de Plantão', insignia: 'assets/insignias/insignia-rank-04-elite.png' }
];

export const units = [
  { id: 'police', name: 'Viatura policial', description: 'Equipe primária para contenção, perímetro e abordagem.', src: 'assets/units/unit-police-cruiser.png', weight: 1 },
  { id: 'ambulance', name: 'Ambulância SAMU', description: 'Suporte médico para trauma, choque, desacordo ou feridos.', src: 'assets/units/unit-ambulance-samu.png', weight: 1 },
  { id: 'helicopter', name: 'Apoio aéreo', description: 'Busca aérea, perseguição, fuga em veículo e visão ampliada.', src: 'assets/units/unit-helicopter-police.png', weight: 2 }
];

export const protocolQuestions = [
  { id: 'location', label: 'Confirmar localização e referência', prompt: 'Confirme o endereço, ponto de referência e para onde a viatura deve acessar.', protocol: 'localização' },
  { id: 'victims', label: 'Verificar vítimas e feridos', prompt: 'Há feridos, reféns, crianças, idosos ou alguém preso no local?', protocol: 'vítimas' },
  { id: 'weapon', label: 'Identificar arma e ameaça', prompt: 'Você viu arma, ouviu disparos ou há ameaça direta neste momento?', protocol: 'ameaça' },
  { id: 'suspect', label: 'Descrever suspeito / veículo', prompt: 'Descreva suspeito, roupa, veículo, direção de fuga ou placa parcial.', protocol: 'suspeito' },
  { id: 'safety', label: 'Orientar abrigo e segurança', prompt: 'Você consegue se manter abrigado, sem confronto e com a linha aberta?', protocol: 'segurança' }
];

export const incidents = [
  {
    id: 'domestic-weapon-risk', title: 'Violência doméstica com risco de arma', severity: 'Prioridade crítica', district: 'Itaquera', baseRisk: 78, urgencyLimit: 34, callerName: 'Marina',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Meu companheiro está quebrando tudo. Ele bebeu, pegou uma faca e disse que ninguém vai sair daqui.',
    facts: ['Endereço inicial incompleto', 'Possível arma branca', 'Solicitante emocionalmente instável'],
    contradictions: ['Solicitante primeiro diz estar sozinha, depois menciona uma criança no quarto.'],
    events: [
      { at: 16, text: 'SISTEMA: Ruído alto detectado na ligação. A solicitante se afasta do telefone.', risk: 6 },
      { at: 30, text: 'MARINA: Ele está tentando abrir a porta do quarto. Eu estou com meu filho aqui.', risk: 10 }
    ],
    questionReplies: {
      location: 'Rua pequena perto da estação Dom Bosco... eu não sei o número, tem uma farmácia na esquina.',
      victims: 'Meu filho está comigo. Ele não está ferido, mas está chorando muito.',
      weapon: 'Eu vi uma faca na mão dele. Não ouvi disparo, só ele batendo na porta.',
      suspect: 'Camisa cinza, bermuda preta. Ele está dentro da casa, na sala.',
      safety: 'Estou trancada no quarto. Vou ficar longe da porta e manter a ligação aberta.'
    },
    correctUnits: ['police'], idealQuestions: ['location', 'victims', 'weapon', 'safety'], mapChips: ['Residência', 'Risco interno', 'Acesso estreito']
  },
  {
    id: 'armed-robbery-escape', title: 'Roubo armado com fuga em veículo', severity: 'Prioridade crítica', district: 'Sé', baseRisk: 82, urgencyLimit: 28, callerName: 'Carlos',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Um carro acabou de fugir depois de um roubo. Acho que os suspeitos estão armados. Foi muito rápido.',
    facts: ['Veículo suspeito em movimento', 'Informação de placa parcial', 'Possível arma de fogo'],
    contradictions: ['Solicitante confunde a cor do veículo entre preto e azul escuro.'],
    events: [
      { at: 14, text: 'CARLOS: Eles viraram no sentido do centro velho. Acho que tinha mais de um no carro.', risk: 4 },
      { at: 27, text: 'SISTEMA: Janela de contenção reduzida. Possível perda de contato visual.', risk: 8 }
    ],
    questionReplies: {
      location: 'Região da Sé, próximo a uma saída estreita, indo para o centro velho.',
      victims: 'O segurança caiu, mas levantou. Não sei se foi ferido.',
      weapon: 'Um deles apontou uma arma. Não sei se era revólver ou pistola.',
      suspect: 'Carro escuro, final da placa talvez 47. Dois homens, um de boné.',
      safety: 'Eu estou longe deles, do outro lado da rua. Não vou tentar seguir.'
    },
    correctUnits: ['police', 'helicopter'], idealQuestions: ['location', 'weapon', 'suspect', 'safety'], mapChips: ['Rotas múltiplas', 'Busca aérea recomendada', 'Trânsito moderado']
  },
  {
    id: 'collision-victims-fuel', title: 'Colisão grave com vítima presa', severity: 'Prioridade alta', district: 'Bela Vista', baseRisk: 74, urgencyLimit: 38, callerName: 'Renato',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Teve uma batida forte. Uma pessoa está presa no carro e não responde. Tem cheiro de combustível.',
    facts: ['Vítima presa em veículo', 'Possível vazamento de combustível', 'Via com fluxo intenso'],
    contradictions: ['Solicitante não sabe se a vítima está inconsciente ou apenas em choque.'],
    events: [
      { at: 18, text: 'RENATO: O trânsito está parando e tem gente chegando muito perto do carro.', risk: 5 },
      { at: 35, text: 'SISTEMA: Risco secundário aumentado por aglomeração e combustível.', risk: 8 }
    ],
    questionReplies: {
      location: 'Perto da Paulista, na Bela Vista, cruzamento movimentado, antes do semáforo.',
      victims: 'Uma pessoa presa, outra com corte no rosto. Ninguém está orientando o trânsito.',
      weapon: 'Não tem arma. O problema é o combustível e a vítima presa.',
      suspect: 'Não há suspeito. São dois carros, um prata e um branco.',
      safety: 'Vou afastar as pessoas e não vou deixar ninguém fumar perto.'
    },
    correctUnits: ['police', 'ambulance'], idealQuestions: ['location', 'victims', 'safety'], mapChips: ['Interdição necessária', 'SAMU recomendado', 'Risco secundário']
  },
  {
    id: 'panic-line-ambiguous-threat', title: 'Ligação em pânico com ameaça indefinida', severity: 'Prioridade alta', district: 'Liberdade', baseRisk: 69, urgencyLimit: 42, callerName: 'Ana',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Eu preciso de ajuda, tem alguém me seguindo. Eu entrei num comércio, mas ele ficou lá fora olhando.',
    facts: ['Ameaça ainda não confirmada', 'Solicitante em local público', 'Possível perseguição ou importunação'],
    contradictions: ['A solicitante alterna entre dizer que conhece e que não conhece o suspeito.'],
    events: [
      { at: 22, text: 'ANA: Ele está andando de um lado pro outro na porta. Eu estou tremendo.', risk: 5 },
      { at: 40, text: 'SISTEMA: Risco psicológico alto; ameaça física ainda não confirmada.', risk: 3 }
    ],
    questionReplies: {
      location: 'Liberdade, perto de uma loja com fachada vermelha. Não sei o número.',
      victims: 'Sou só eu. Ninguém machucado.',
      weapon: 'Não vi arma, só ele colocou a mão dentro da blusa algumas vezes.',
      suspect: 'Homem alto, jaqueta preta, mochila. Pode estar alcoolizado.',
      safety: 'Vou ficar dentro da loja, longe da porta, e falar baixo.'
    },
    correctUnits: ['police'], idealQuestions: ['location', 'suspect', 'weapon', 'safety'], mapChips: ['Local público', 'Ameaça incerta', 'Acolhimento']
  },
  {
    id: 'kidnapping-attempt-school', title: 'Tentativa de sequestro na saída de escola', severity: 'Prioridade crítica', district: 'Tatuapé', baseRisk: 86, urgencyLimit: 24, callerName: 'Patrícia',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Tem um homem tentando colocar uma menina dentro de um carro. A mãe está gritando. É na frente da escola.',
    facts: ['Criança em risco imediato', 'Veículo ainda próximo ao local', 'Múltiplas testemunhas em pânico'],
    contradictions: ['Testemunhas citam duas cores diferentes para o veículo; placa parcial ainda incerta.'],
    events: [
      { at: 12, text: 'PATRÍCIA: O carro deu ré, acho que vai tentar sair pela rua lateral.', risk: 7 },
      { at: 25, text: 'SISTEMA: Tempo crítico para bloqueio de rota. Priorizar contenção e preservação da vítima.', risk: 11 }
    ],
    questionReplies: {
      location: 'Na rua da escola, perto de um mercado pequeno. Tatuapé, rua estreita com muito carro parado.',
      victims: 'A menina está chorando, mas a mãe segurou ela. Ninguém parece ferido ainda.',
      weapon: 'Não vi arma. Ele estava puxando a criança pelo braço.',
      suspect: 'Homem de boné escuro, carro prata pequeno. A placa termina com 8 ou B, não tenho certeza.',
      safety: 'Vou manter distância, ficar dentro da escola e não deixar ninguém cercar o carro.'
    },
    correctUnits: ['police', 'helicopter'], idealQuestions: ['location', 'victims', 'suspect', 'safety'], mapChips: ['Escola', 'Bloqueio de rota', 'Busca aérea indicada']
  },
  {
    id: 'shots-fired-bar', title: 'Disparos em bar com multidão', severity: 'Prioridade crítica', district: 'Pinheiros', baseRisk: 88, urgencyLimit: 22, callerName: 'Diego',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Ouvi tiros dentro de um bar. Todo mundo saiu correndo. Tem gente caída na calçada.',
    facts: ['Possíveis feridos por arma de fogo', 'Local com aglomeração', 'Autor pode ainda estar armado'],
    contradictions: ['Solicitante não sabe se o atirador saiu ou se está escondido dentro do estabelecimento.'],
    events: [
      { at: 10, text: 'DIEGO: Tem uma mulher sangrando perto da porta. Ninguém consegue chegar nela.', risk: 9 },
      { at: 24, text: 'SISTEMA: Risco de segundo confronto aumentado. Solicitar perímetro e suporte médico.', risk: 10 }
    ],
    questionReplies: {
      location: 'Pinheiros, perto da avenida principal, bar de esquina com mesas na calçada.',
      victims: 'Vi duas pessoas caídas. Não sei se estão conscientes.',
      weapon: 'Foram vários disparos. Parece arma de fogo, ouvi pelo menos quatro tiros.',
      suspect: 'Um homem de jaqueta preta correu para uma rua lateral, mas não tenho certeza se era ele.',
      safety: 'Estou atrás de um carro, longe da entrada. Vou manter a linha aberta.'
    },
    correctUnits: ['police', 'ambulance'], idealQuestions: ['location', 'victims', 'weapon', 'safety'], mapChips: ['Disparos', 'SAMU urgente', 'Perímetro']
  }

];
