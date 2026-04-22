export const avatars = [
  { id: 'avatar-operator-01-lead', name: 'Lead', src: 'assets/avatars/avatar-operator-01-lead.png' },
  { id: 'avatar-operator-02-brunette', name: 'Brunette', src: 'assets/avatars/avatar-operator-02-brunette.png' },
  { id: 'avatar-operator-03-specialist', name: 'Specialist', src: 'assets/avatars/avatar-operator-03-specialist.png' },
  { id: 'avatar-operator-04-bearded', name: 'Bearded', src: 'assets/avatars/avatar-operator-04-bearded.png' },
  { id: 'avatar-operator-05-analyst-glasses', name: 'Analyst', src: 'assets/avatars/avatar-operator-05-analyst-glasses.png' }
];

export const ranks = [
  { minXp: 0, title: 'Atendente I', insignia: 'assets/insignias/insignia-rank-01-basic.png' },
  { minXp: 160, title: 'Atendente II', insignia: 'assets/insignias/insignia-rank-02-intermediate.png' },
  { minXp: 360, title: 'Atendente III', insignia: 'assets/insignias/insignia-rank-03-advanced.png' },
  { minXp: 700, title: 'Supervisor de Plantão', insignia: 'assets/insignias/insignia-rank-04-elite.png' }
];

export const units = [
  {
    id: 'police',
    name: 'Viatura policial',
    description: 'Resposta tática primária para ocorrências de segurança pública.',
    src: 'assets/units/unit-police-cruiser.png'
  },
  {
    id: 'ambulance',
    name: 'Ambulância de apoio',
    description: 'Suporte médico para vítimas, choque ou trauma.',
    src: 'assets/units/unit-ambulance-samu.png'
  },
  {
    id: 'helicopter',
    name: 'Helicóptero de apoio',
    description: 'Busca aérea, perseguição e visão ampliada do terreno.',
    src: 'assets/units/unit-helicopter-police.png'
  }
];

export const incidents = [
  {
    id: 'home-invasion',
    title: 'Invasão em residência',
    severity: 'Prioridade crítica',
    district: 'República',
    facts: ['Solicitante trancada em um cômodo', 'Suspeito possivelmente armado', 'Som de arrombamento em andamento'],
    callerName: 'Bianca',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Tem um homem tentando entrar no apartamento. Estou escondida e ouvi ele forçando a porta.',
    questionReplies: {
      location: 'Estou na República, perto do Viaduto Nove de Julho.',
      victims: 'Só eu aqui dentro. Ninguém ferido até agora.',
      weapon: 'Não vi a arma, mas ele gritou que estava armado.'
    },
    correctUnits: ['police'],
    mapChips: ['Prédio residencial', 'Rua bloqueada', 'Ponto de risco']
  },
  {
    id: 'traffic-collision',
    title: 'Colisão com vítimas',
    severity: 'Prioridade alta',
    district: 'Bela Vista',
    facts: ['Dois veículos envolvidos', 'Uma vítima desacordada', 'Trânsito intenso na área'],
    callerName: 'Renato',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Teve um acidente forte. Uma pessoa está presa no carro e não responde.',
    questionReplies: {
      location: 'Na Bela Vista, próximo à Avenida Paulista.',
      victims: 'Pelo menos duas vítimas. Uma parece desacordada.',
      weapon: 'Não. Só colisão de trânsito, mas tem vazamento de combustível.'
    },
    correctUnits: ['police', 'ambulance'],
    mapChips: ['Cruzamento congestionado', 'Faixa interditada', 'Risco secundário']
  },
  {
    id: 'armed-pursuit',
    title: 'Suspeito armado em fuga',
    severity: 'Prioridade crítica',
    district: 'Sé',
    facts: ['Veículo suspeito em movimento', 'Última visão rumo ao centro', 'Possível troca de tiros'],
    callerName: 'Carlos',
    opening: '190, qual é a sua emergência?',
    callerOpening: 'Um carro acabou de fugir depois de um roubo. Acho que os suspeitos estão armados.',
    questionReplies: {
      location: 'Vi eles saindo da região da Sé em direção ao centro velho.',
      victims: 'Não há vítima ferida aqui agora, mas o roubo acabou de acontecer.',
      weapon: 'Sim, um dos homens apontou uma arma para o segurança.'
    },
    correctUnits: ['police', 'helicopter'],
    mapChips: ['Rotas múltiplas', 'Busca aérea recomendada', 'Trânsito moderado']
  }
];
