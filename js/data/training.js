export const TRAINING_REWARD_XP = 150;

const course = {
  'pt-BR': {
    ui: {
      lobbyButton: 'Academia Operacional',
      lobbyCertification: 'Certificação operacional',
      certified: 'Certificado',
      inTraining: 'Em treinamento',
      notStarted: 'Não iniciado',
      eyebrow: 'Formação interna',
      title: 'Academia Operacional 190',
      intro: 'Treinamento prático para aprender triagem, proteção do solicitante e despacho proporcional antes de enfrentar um plantão sob pressão.',
      progress: 'Progresso da certificação',
      completed: '{done} de {total} decisões concluídas',
      accuracy: 'Acerto na primeira tentativa: {score}%',
      reward: 'Recompensa de certificação: +{xp} XP',
      continueCourse: 'Continuar treinamento',
      startCourse: 'Iniciar treinamento',
      reviewCourse: 'Revisar módulos',
      exit: 'Voltar ao lobby',
      reset: 'Reiniciar academia',
      resetConfirm: 'Reiniciar todo o progresso da academia? A recompensa de XP já recebida não será concedida novamente.',
      resetDone: 'Progresso da academia reiniciado.',
      module: 'Módulo {number}',
      locked: 'Conclua o módulo anterior',
      completedModule: 'Concluído',
      available: 'Disponível',
      review: 'Revisar',
      start: 'Começar',
      objective: 'Objetivo operacional',
      scenario: 'Cenário',
      decision: 'Sua decisão',
      tryAgain: 'Tente novamente',
      correct: 'Decisão correta',
      next: 'Próxima decisão',
      finish: 'Concluir certificação',
      firstTry: 'Acerto de primeira',
      attempts: 'Tentativas: {count}',
      certificationTitle: 'Certificação concluída',
      certificationText: 'Você concluiu os cinco pilares da triagem inicial e está apto a iniciar plantões com orientação assistida.',
      certificationReward: '+{xp} XP adicionados à carreira.',
      certificationRewardClaimed: 'A recompensa desta certificação já havia sido registrada.',
      assistanceTitle: 'Modo assistido de plantão',
      assistanceText: 'Exibe orientação contextual durante ligação e despacho. Pode ser desligado a qualquer momento.',
      assistanceOn: 'Orientação ativada',
      assistanceOff: 'Orientação desativada',
      manualIntro: 'Use o manual como referência rápida ou abra a Academia Operacional para praticar os cinco pilares em decisões simuladas.',
      welcome: 'Novo operador registrado. A Academia Operacional foi aberta para seu primeiro treinamento.',
      coachTitle: 'Instrutor operacional',
      coachLocation: 'Comece confirmando onde a emergência está acontecendo. Sem localização confiável, nenhum recurso chega ao ponto certo.',
      coachRisk: 'Agora identifique risco imediato: armas, agressor presente, fogo, disparos ou ameaça ativa.',
      coachVictims: 'Confirme vítimas e condições médicas antes de decidir os recursos.',
      coachSafety: 'Oriente o solicitante a buscar abrigo e não confrontar o suspeito.',
      coachDispatchReady: 'Você já reuniu o mínimo operacional. Abra o despacho antes que o risco aumente.',
      coachDispatchEmpty: 'Selecione ao menos um recurso compatível com o risco e com as vítimas.',
      coachDispatchProportional: 'Evite excesso: escolha apenas os recursos necessários para esta ocorrência.',
      coachDispatchReadyConfirm: 'Despacho montado. Revise proporcionalidade e confirme quando estiver seguro.',
      coachDisabled: 'A orientação assistida está desligada.'
    },
    modules: [
      {
        id: 'location', number: '01', title: 'Localização e referência', summary: 'Fixar o ponto exato e a rota de acesso antes do despacho.',
        steps: [
          {
            id: 'location-address', title: 'Endereço incompleto',
            scenario: 'Uma pessoa liga dizendo apenas: “Tem um homem armado perto da praça”. A ligação está instável.',
            objective: 'Obter um ponto utilizável pelo mapa e pelas equipes.',
            prompt: 'Qual deve ser sua primeira pergunta?',
            options: [
              { id: 'a', text: 'Perguntar o nome completo do suspeito.', correct: false, feedback: 'O nome pode ajudar depois, mas ainda não permite localizar a ocorrência.' },
              { id: 'b', text: 'Confirmar rua, número ou referência visível e o bairro.', correct: true, feedback: 'Correto. A localização vem antes de detalhes secundários quando a ligação pode cair.' },
              { id: 'c', text: 'Pedir que a pessoa grave um vídeo.', correct: false, feedback: 'Isso pode expor o solicitante e atrasar o envio de recursos.' }
            ]
          },
          {
            id: 'location-direction', title: 'Suspeito em deslocamento',
            scenario: 'Após um roubo, o suspeito saiu correndo. A vítima sabe onde está, mas não informou a direção de fuga.',
            objective: 'Transformar uma localização estática em informação tática.',
            prompt: 'Qual informação é mais útil agora?',
            options: [
              { id: 'a', text: 'Cor da roupa e direção exata para onde ele seguiu.', correct: true, feedback: 'Correto. Direção e descrição ajudam a fechar rotas sem pedir perseguição à vítima.' },
              { id: 'b', text: 'Valor total dos objetos roubados.', correct: false, feedback: 'O valor será registrado, mas não orienta a busca imediata.' },
              { id: 'c', text: 'Se a vítima conhece redes sociais do suspeito.', correct: false, feedback: 'Essa investigação não substitui a descrição e a direção de fuga.' }
            ]
          }
        ]
      },
      {
        id: 'risk', number: '02', title: 'Risco imediato', summary: 'Reconhecer ameaça ativa e definir urgência sem especulação.',
        steps: [
          {
            id: 'risk-weapon', title: 'Possível arma',
            scenario: 'Uma vizinha ouve gritos e diz que alguém “pode estar armado”, mas não viu a arma.',
            objective: 'Diferenciar informação confirmada de suspeita sem minimizar o risco.',
            prompt: 'Como conduzir a triagem?',
            options: [
              { id: 'a', text: 'Registrar como arma confirmada e encerrar a ligação.', correct: false, feedback: 'A ameaça deve ser tratada com cautela, mas a informação ainda precisa ser qualificada.' },
              { id: 'b', text: 'Perguntar o que ela viu ou ouviu, se houve disparo e onde o agressor está.', correct: true, feedback: 'Correto. Você qualifica a fonte e mantém uma resposta prudente.' },
              { id: 'c', text: 'Dizer que sem visualizar a arma não há emergência.', correct: false, feedback: 'Isso ignora sinais de violência e pode colocar vítimas em risco.' }
            ]
          },
          {
            id: 'risk-fire', title: 'Risco secundário',
            scenario: 'Um veículo bateu em um poste. O motorista está consciente e há cheiro forte de combustível.',
            objective: 'Identificar agravantes que mudam o despacho.',
            prompt: 'Qual orientação é prioritária?',
            options: [
              { id: 'a', text: 'Pedir para o motorista ligar o carro e tirá-lo da via.', correct: false, feedback: 'Uma fonte de ignição pode agravar vazamento e incêndio.' },
              { id: 'b', text: 'Manter pessoas afastadas, evitar faíscas e acionar apoio compatível.', correct: true, feedback: 'Correto. O combustível transforma a colisão em risco de incêndio.' },
              { id: 'c', text: 'Esperar aparecer fogo antes de ampliar o despacho.', correct: false, feedback: 'A prevenção deve ocorrer antes da ignição.' }
            ]
          }
        ]
      },
      {
        id: 'victims', number: '03', title: 'Vítimas e prioridade médica', summary: 'Detectar feridos, vulneráveis e pessoas sem saída segura.',
        steps: [
          {
            id: 'victims-consciousness', title: 'Estado da vítima',
            scenario: 'Após uma agressão, o solicitante diz que a vítima “está muito quieta” no chão.',
            objective: 'Obter sinais mínimos para definir urgência médica.',
            prompt: 'Qual pergunta deve vir primeiro?',
            options: [
              { id: 'a', text: 'Se a vítima responde, respira normalmente e apresenta sangramento intenso.', correct: true, feedback: 'Correto. Consciência, respiração e hemorragia mudam imediatamente a prioridade.' },
              { id: 'b', text: 'Se a vítima pretende registrar queixa depois.', correct: false, feedback: 'A condição clínica vem antes do procedimento administrativo.' },
              { id: 'c', text: 'Qual era a relação entre agressor e vítima.', correct: false, feedback: 'É relevante, mas não substitui a avaliação inicial de vida.' }
            ]
          },
          {
            id: 'victims-vulnerable', title: 'Pessoa vulnerável',
            scenario: 'Há fumaça em uma residência. Um adulto saiu, mas informa que uma criança pode estar em um quarto.',
            objective: 'Reconhecer pessoa presa e impedir uma tentativa de resgate insegura.',
            prompt: 'Qual resposta é operacionalmente correta?',
            options: [
              { id: 'a', text: 'Mandar o adulto voltar imediatamente e procurar a criança.', correct: false, feedback: 'Isso pode criar uma segunda vítima e dificultar o resgate profissional.' },
              { id: 'b', text: 'Confirmar a última localização da criança, manter o adulto fora e transmitir a informação às equipes.', correct: true, feedback: 'Correto. Informação precisa sem expor o solicitante novamente.' },
              { id: 'c', text: 'Aguardar a criança sair sozinha antes de acionar apoio.', correct: false, feedback: 'Uma pessoa possivelmente presa exige resposta imediata.' }
            ]
          }
        ]
      },
      {
        id: 'safety', number: '04', title: 'Segurança do solicitante', summary: 'Orientar sem transformar o cidadão em agente de campo.',
        steps: [
          {
            id: 'safety-shelter', title: 'Ameaça próxima',
            scenario: 'A solicitante está atrás de uma porta enquanto o agressor grita no corredor do prédio.',
            objective: 'Reduzir exposição enquanto mantém informação útil.',
            prompt: 'Qual orientação é mais segura?',
            options: [
              { id: 'a', text: 'Sair para observar melhor o agressor.', correct: false, feedback: 'A observação nunca deve exigir exposição ao agressor.' },
              { id: 'b', text: 'Trancar-se, silenciar o telefone quando necessário e permanecer longe da porta.', correct: true, feedback: 'Correto. A prioridade é preservar a vítima e manter contato discreto.' },
              { id: 'c', text: 'Gritar que a polícia está chegando.', correct: false, feedback: 'Isso pode provocar escalada antes da chegada das equipes.' }
            ]
          },
          {
            id: 'safety-pursuit', title: 'Não perseguir',
            scenario: 'Depois de um furto, o solicitante diz que vai seguir o suspeito de motocicleta.',
            objective: 'Evitar confronto e manter dados úteis.',
            prompt: 'Como responder?',
            options: [
              { id: 'a', text: 'Apoiar a perseguição desde que ele mantenha distância.', correct: false, feedback: 'Mesmo à distância, a perseguição pode gerar colisão ou confronto.' },
              { id: 'b', text: 'Orientar a não seguir, pedir localização atual, direção e características do veículo.', correct: true, feedback: 'Correto. Você preserva o cidadão e aproveita a informação já disponível.' },
              { id: 'c', text: 'Encerrar a chamada porque o fato já terminou.', correct: false, feedback: 'A direção de fuga ainda pode permitir abordagem segura pelas equipes.' }
            ]
          }
        ]
      },
      {
        id: 'dispatch', number: '05', title: 'Despacho proporcional', summary: 'Enviar o recurso certo sem deixar a rede operacional descoberta.',
        steps: [
          {
            id: 'dispatch-medical', title: 'Polícia e atendimento médico',
            scenario: 'Houve agressão com vítima consciente, sangramento e agressor ainda próximo.',
            objective: 'Combinar segurança da cena e assistência médica.',
            prompt: 'Qual despacho é o mais coerente?',
            options: [
              { id: 'a', text: 'Somente ambulância, pois existe ferido.', correct: false, feedback: 'A equipe médica pode entrar em uma cena ainda insegura.' },
              { id: 'b', text: 'Viatura para segurança e SAMU para atendimento da vítima.', correct: true, feedback: 'Correto. Os recursos cobrem ameaça ativa e necessidade clínica.' },
              { id: 'c', text: 'Helicóptero e todas as viaturas disponíveis.', correct: false, feedback: 'Isso sobrecarrega a rede sem justificativa suficiente.' }
            ]
          },
          {
            id: 'dispatch-excess', title: 'Evitar sobrecarga',
            scenario: 'Um veículo foi encontrado abandonado, sem vítima, fogo, suspeito presente ou risco imediato.',
            objective: 'Preservar recursos críticos para chamadas mais graves.',
            prompt: 'Qual decisão é proporcional?',
            options: [
              { id: 'a', text: 'Enviar uma viatura para verificação e manter recursos especiais disponíveis.', correct: true, feedback: 'Correto. Uma equipe inicial pode avaliar e pedir reforço se surgirem novos riscos.' },
              { id: 'b', text: 'Enviar viatura, SAMU e helicóptero preventivamente.', correct: false, feedback: 'Não há indicação médica ou aérea no cenário apresentado.' },
              { id: 'c', text: 'Não registrar a ocorrência.', correct: false, feedback: 'Baixa urgência não significa ausência de resposta.' }
            ]
          }
        ]
      }
    ]
  },
  'en-US': {
    ui: {
      lobbyButton: 'Operations Academy', lobbyCertification: 'Operational certification', certified: 'Certified', inTraining: 'In training', notStarted: 'Not started', eyebrow: 'Internal training', title: '190 Operations Academy',
      intro: 'Hands-on training to learn triage, caller protection and proportional dispatch before facing a shift under pressure.', progress: 'Certification progress', completed: '{done} of {total} decisions completed', accuracy: 'First-attempt accuracy: {score}%', reward: 'Certification reward: +{xp} XP',
      continueCourse: 'Continue training', startCourse: 'Start training', reviewCourse: 'Review modules', exit: 'Back to lobby', reset: 'Reset academy', resetConfirm: 'Reset all academy progress? XP already awarded will not be granted again.', resetDone: 'Academy progress reset.',
      module: 'Module {number}', locked: 'Complete the previous module', completedModule: 'Completed', available: 'Available', review: 'Review', start: 'Start', objective: 'Operational objective', scenario: 'Scenario', decision: 'Your decision', tryAgain: 'Try again', correct: 'Correct decision', next: 'Next decision', finish: 'Complete certification', firstTry: 'Correct on first try', attempts: 'Attempts: {count}',
      certificationTitle: 'Certification complete', certificationText: 'You completed the five pillars of initial triage and may begin shifts with assisted guidance.', certificationReward: '+{xp} XP added to your career.', certificationRewardClaimed: 'This certification reward had already been recorded.',
      assistanceTitle: 'Assisted shift mode', assistanceText: 'Shows contextual guidance during calls and dispatch. It can be disabled at any time.', assistanceOn: 'Guidance enabled', assistanceOff: 'Guidance disabled', manualIntro: 'Use the manual as a quick reference or open the Operations Academy to practice the five pillars through simulated decisions.', welcome: 'New operator registered. The Operations Academy opened for your first training.',
      coachTitle: 'Operations instructor', coachLocation: 'Start by confirming where the emergency is happening. Without a reliable location, no unit reaches the correct point.', coachRisk: 'Now identify immediate danger: weapons, an active aggressor, fire, shots or a direct threat.', coachVictims: 'Confirm victims and medical conditions before deciding which resources to send.', coachSafety: 'Tell the caller to seek shelter and never confront the suspect.', coachDispatchReady: 'You have the minimum operational information. Open dispatch before risk increases.', coachDispatchEmpty: 'Select at least one resource compatible with the risk and victims.', coachDispatchProportional: 'Avoid excess: choose only the resources required for this incident.', coachDispatchReadyConfirm: 'Dispatch is assembled. Review proportionality and confirm when ready.', coachDisabled: 'Assisted guidance is disabled.'
    },
    modules: [
      { id:'location', number:'01', title:'Location and reference', summary:'Fix the exact point and access route before dispatch.', steps:[
        { id:'location-address', title:'Incomplete address', scenario:'A caller only says: “There is an armed man near the square.” The connection is unstable.', objective:'Obtain a point that map and field teams can actually use.', prompt:'What should your first question be?', options:[
          {id:'a',text:'Ask for the suspect’s full name.',correct:false,feedback:'A name may help later, but it still does not locate the incident.'},
          {id:'b',text:'Confirm street, number or visible landmark and the district.',correct:true,feedback:'Correct. Location comes before secondary details when the call may drop.'},
          {id:'c',text:'Ask the caller to record a video.',correct:false,feedback:'That can expose the caller and delay the response.'}
        ]},
        { id:'location-direction', title:'Suspect moving away', scenario:'After a robbery, the suspect ran away. The victim knows their own location but did not report the escape direction.', objective:'Turn a static location into tactical information.', prompt:'Which information is most useful now?', options:[
          {id:'a',text:'Clothing color and the exact direction the suspect took.',correct:true,feedback:'Correct. Direction and description support containment without asking the victim to pursue.'},
          {id:'b',text:'The total value of stolen items.',correct:false,feedback:'The value will be recorded, but it does not guide the immediate search.'},
          {id:'c',text:'Whether the victim knows the suspect’s social media.',correct:false,feedback:'That investigation does not replace description and direction of travel.'}
        ]}
      ]},
      { id:'risk', number:'02', title:'Immediate risk', summary:'Recognize an active threat and set urgency without speculation.', steps:[
        { id:'risk-weapon', title:'Possible weapon', scenario:'A neighbor hears shouting and says someone “may be armed,” but did not see a weapon.', objective:'Separate confirmed information from suspicion without minimizing risk.', prompt:'How should triage continue?', options:[
          {id:'a',text:'Record a confirmed weapon and end the call.',correct:false,feedback:'The threat requires caution, but the information still needs qualification.'},
          {id:'b',text:'Ask what was seen or heard, whether shots occurred and where the aggressor is.',correct:true,feedback:'Correct. You qualify the source while keeping a prudent response.'},
          {id:'c',text:'Say there is no emergency unless the weapon is visible.',correct:false,feedback:'That ignores warning signs of violence and can place victims at risk.'}
        ]},
        { id:'risk-fire', title:'Secondary hazard', scenario:'A vehicle hit a utility pole. The driver is conscious and there is a strong smell of fuel.', objective:'Identify aggravating factors that change dispatch.', prompt:'Which instruction is the priority?', options:[
          {id:'a',text:'Ask the driver to restart the car and move it.',correct:false,feedback:'An ignition source can worsen a leak or trigger fire.'},
          {id:'b',text:'Keep people away, avoid sparks and activate compatible support.',correct:true,feedback:'Correct. Fuel turns the collision into a fire risk.'},
          {id:'c',text:'Wait for flames before expanding the response.',correct:false,feedback:'Prevention must happen before ignition.'}
        ]}
      ]},
      { id:'victims', number:'03', title:'Victims and medical priority', summary:'Detect injuries, vulnerable people and anyone without a safe exit.', steps:[
        { id:'victims-consciousness', title:'Victim condition', scenario:'After an assault, the caller says the victim is “very still” on the ground.', objective:'Obtain minimum life signs to define medical urgency.', prompt:'Which question comes first?', options:[
          {id:'a',text:'Whether the victim responds, breathes normally and has severe bleeding.',correct:true,feedback:'Correct. Consciousness, breathing and hemorrhage immediately change priority.'},
          {id:'b',text:'Whether the victim plans to file a report later.',correct:false,feedback:'Clinical condition comes before administrative procedure.'},
          {id:'c',text:'What relationship existed between victim and aggressor.',correct:false,feedback:'It matters, but it does not replace the initial life assessment.'}
        ]},
        { id:'victims-vulnerable', title:'Vulnerable person', scenario:'There is smoke in a home. An adult escaped but says a child may still be in a bedroom.', objective:'Recognize a trapped person and prevent an unsafe rescue attempt.', prompt:'Which response is operationally correct?', options:[
          {id:'a',text:'Tell the adult to go back inside immediately.',correct:false,feedback:'That can create a second victim and complicate professional rescue.'},
          {id:'b',text:'Confirm the child’s last location, keep the adult outside and relay it to teams.',correct:true,feedback:'Correct. Precise information without exposing the caller again.'},
          {id:'c',text:'Wait for the child to leave alone before requesting support.',correct:false,feedback:'A possibly trapped person requires immediate response.'}
        ]}
      ]},
      { id:'safety', number:'04', title:'Caller safety', summary:'Guide the caller without turning them into a field agent.', steps:[
        { id:'safety-shelter', title:'Nearby threat', scenario:'The caller is behind a door while the aggressor shouts in the apartment corridor.', objective:'Reduce exposure while keeping useful contact.', prompt:'Which instruction is safest?', options:[
          {id:'a',text:'Go outside to observe the aggressor better.',correct:false,feedback:'Observation must never require exposure to the aggressor.'},
          {id:'b',text:'Lock in, silence the phone when needed and stay away from the door.',correct:true,feedback:'Correct. Preserve the victim and keep discreet contact.'},
          {id:'c',text:'Shout that police are coming.',correct:false,feedback:'That can trigger escalation before teams arrive.'}
        ]},
        { id:'safety-pursuit', title:'Do not pursue', scenario:'After a theft, the caller says they will follow the suspect on a motorcycle.', objective:'Prevent confrontation while retaining useful information.', prompt:'How should you respond?', options:[
          {id:'a',text:'Support the pursuit as long as distance is maintained.',correct:false,feedback:'Even at a distance, pursuit can cause collision or confrontation.'},
          {id:'b',text:'Tell them not to follow; request current location, direction and vehicle details.',correct:true,feedback:'Correct. You protect the caller and use the information already available.'},
          {id:'c',text:'End the call because the theft is over.',correct:false,feedback:'Direction of travel may still support a safe field interception.'}
        ]}
      ]},
      { id:'dispatch', number:'05', title:'Proportional dispatch', summary:'Send the right resource without leaving the network uncovered.', steps:[
        { id:'dispatch-medical', title:'Police and medical response', scenario:'An assault left a conscious, bleeding victim while the aggressor remains nearby.', objective:'Combine scene safety with medical care.', prompt:'Which dispatch is most coherent?', options:[
          {id:'a',text:'Ambulance only, because someone is injured.',correct:false,feedback:'Medical personnel could enter an unsafe scene.'},
          {id:'b',text:'Police unit for scene safety and ambulance for the victim.',correct:true,feedback:'Correct. The response covers both active threat and clinical need.'},
          {id:'c',text:'Helicopter and every available patrol unit.',correct:false,feedback:'That overloads the network without sufficient justification.'}
        ]},
        { id:'dispatch-excess', title:'Avoid overload', scenario:'A vehicle was found abandoned with no victim, fire, suspect present or immediate hazard.', objective:'Preserve critical resources for more severe calls.', prompt:'Which decision is proportional?', options:[
          {id:'a',text:'Send one patrol to verify and keep special resources available.',correct:true,feedback:'Correct. The first unit can assess and request support if new risks emerge.'},
          {id:'b',text:'Send patrol, ambulance and helicopter preventively.',correct:false,feedback:'There is no medical or aviation indication in the scenario.'},
          {id:'c',text:'Do not register the incident.',correct:false,feedback:'Low urgency does not mean no response.'}
        ]}
      ]}
    ]
  },
  'es-419': {
    ui: {
      lobbyButton: 'Academia Operativa', lobbyCertification: 'Certificación operativa', certified: 'Certificado', inTraining: 'En entrenamiento', notStarted: 'No iniciado', eyebrow: 'Formación interna', title: 'Academia Operativa 190',
      intro: 'Entrenamiento práctico para aprender triaje, protección del solicitante y despacho proporcional antes de enfrentar un turno bajo presión.', progress: 'Progreso de certificación', completed: '{done} de {total} decisiones completadas', accuracy: 'Acierto en el primer intento: {score}%', reward: 'Recompensa de certificación: +{xp} XP',
      continueCourse: 'Continuar entrenamiento', startCourse: 'Iniciar entrenamiento', reviewCourse: 'Revisar módulos', exit: 'Volver al lobby', reset: 'Reiniciar academia', resetConfirm: '¿Reiniciar todo el progreso de la academia? El XP ya otorgado no se concederá otra vez.', resetDone: 'Progreso de la academia reiniciado.',
      module: 'Módulo {number}', locked: 'Completa el módulo anterior', completedModule: 'Completado', available: 'Disponible', review: 'Revisar', start: 'Comenzar', objective: 'Objetivo operativo', scenario: 'Escenario', decision: 'Tu decisión', tryAgain: 'Inténtalo de nuevo', correct: 'Decisión correcta', next: 'Siguiente decisión', finish: 'Completar certificación', firstTry: 'Acierto al primer intento', attempts: 'Intentos: {count}',
      certificationTitle: 'Certificación completada', certificationText: 'Completaste los cinco pilares del triaje inicial y puedes iniciar turnos con orientación asistida.', certificationReward: '+{xp} XP agregados a tu carrera.', certificationRewardClaimed: 'La recompensa de esta certificación ya estaba registrada.',
      assistanceTitle: 'Modo de turno asistido', assistanceText: 'Muestra orientación contextual durante llamadas y despacho. Puede desactivarse en cualquier momento.', assistanceOn: 'Orientación activada', assistanceOff: 'Orientación desactivada', manualIntro: 'Usa el manual como referencia rápida o abre la Academia Operativa para practicar los cinco pilares mediante decisiones simuladas.', welcome: 'Nuevo operador registrado. La Academia Operativa se abrió para tu primer entrenamiento.',
      coachTitle: 'Instructor operativo', coachLocation: 'Comienza confirmando dónde ocurre la emergencia. Sin una ubicación confiable, ninguna unidad llegará al punto correcto.', coachRisk: 'Ahora identifica el riesgo inmediato: armas, agresor presente, fuego, disparos o amenaza activa.', coachVictims: 'Confirma víctimas y condiciones médicas antes de decidir los recursos.', coachSafety: 'Indica al solicitante que busque refugio y no confronte al sospechoso.', coachDispatchReady: 'Ya reuniste el mínimo operativo. Abre el despacho antes de que aumente el riesgo.', coachDispatchEmpty: 'Selecciona al menos un recurso compatible con el riesgo y las víctimas.', coachDispatchProportional: 'Evita el exceso: elige solo los recursos necesarios para este incidente.', coachDispatchReadyConfirm: 'Despacho preparado. Revisa la proporcionalidad y confirma cuando sea seguro.', coachDisabled: 'La orientación asistida está desactivada.'
    },
    modules: [
      { id:'location', number:'01', title:'Ubicación y referencia', summary:'Fijar el punto exacto y la ruta de acceso antes del despacho.', steps:[
        { id:'location-address', title:'Dirección incompleta', scenario:'Una persona solo dice: “Hay un hombre armado cerca de la plaza”. La llamada es inestable.', objective:'Obtener un punto utilizable por el mapa y los equipos.', prompt:'¿Cuál debe ser tu primera pregunta?', options:[
          {id:'a',text:'Preguntar el nombre completo del sospechoso.',correct:false,feedback:'El nombre puede ayudar después, pero todavía no permite localizar el incidente.'},
          {id:'b',text:'Confirmar calle, número o referencia visible y el barrio.',correct:true,feedback:'Correcto. La ubicación viene antes de detalles secundarios cuando la llamada puede caer.'},
          {id:'c',text:'Pedir que la persona grabe un video.',correct:false,feedback:'Eso puede exponer al solicitante y retrasar la respuesta.'}
        ]},
        { id:'location-direction', title:'Sospechoso en movimiento', scenario:'Tras un robo, el sospechoso huyó corriendo. La víctima sabe dónde está, pero no informó la dirección de fuga.', objective:'Convertir una ubicación estática en información táctica.', prompt:'¿Qué información es más útil ahora?', options:[
          {id:'a',text:'Color de la ropa y dirección exacta de la fuga.',correct:true,feedback:'Correcto. Dirección y descripción ayudan a cerrar rutas sin pedir persecución a la víctima.'},
          {id:'b',text:'Valor total de los objetos robados.',correct:false,feedback:'El valor se registrará, pero no guía la búsqueda inmediata.'},
          {id:'c',text:'Si la víctima conoce las redes sociales del sospechoso.',correct:false,feedback:'Esa investigación no sustituye descripción y dirección de fuga.'}
        ]}
      ]},
      { id:'risk', number:'02', title:'Riesgo inmediato', summary:'Reconocer amenaza activa y definir urgencia sin especular.', steps:[
        { id:'risk-weapon', title:'Posible arma', scenario:'Una vecina oye gritos y dice que alguien “puede estar armado”, pero no vio el arma.', objective:'Diferenciar información confirmada de sospecha sin minimizar el riesgo.', prompt:'¿Cómo continuar el triaje?', options:[
          {id:'a',text:'Registrar arma confirmada y cerrar la llamada.',correct:false,feedback:'La amenaza requiere cautela, pero la información aún debe calificarse.'},
          {id:'b',text:'Preguntar qué vio u oyó, si hubo disparos y dónde está el agresor.',correct:true,feedback:'Correcto. Calificas la fuente y mantienes una respuesta prudente.'},
          {id:'c',text:'Decir que sin ver el arma no hay emergencia.',correct:false,feedback:'Eso ignora señales de violencia y puede poner a víctimas en riesgo.'}
        ]},
        { id:'risk-fire', title:'Riesgo secundario', scenario:'Un vehículo chocó contra un poste. El conductor está consciente y hay fuerte olor a combustible.', objective:'Identificar agravantes que cambian el despacho.', prompt:'¿Cuál orientación es prioritaria?', options:[
          {id:'a',text:'Pedir al conductor que encienda el vehículo y lo retire.',correct:false,feedback:'Una fuente de ignición puede agravar la fuga o iniciar un incendio.'},
          {id:'b',text:'Alejar a las personas, evitar chispas y activar apoyo compatible.',correct:true,feedback:'Correcto. El combustible convierte la colisión en riesgo de incendio.'},
          {id:'c',text:'Esperar a que aparezcan llamas para ampliar la respuesta.',correct:false,feedback:'La prevención debe ocurrir antes de la ignición.'}
        ]}
      ]},
      { id:'victims', number:'03', title:'Víctimas y prioridad médica', summary:'Detectar heridos, personas vulnerables y quienes no tienen salida segura.', steps:[
        { id:'victims-consciousness', title:'Estado de la víctima', scenario:'Después de una agresión, el solicitante dice que la víctima está “muy quieta” en el suelo.', objective:'Obtener señales mínimas para definir urgencia médica.', prompt:'¿Qué pregunta debe ir primero?', options:[
          {id:'a',text:'Si responde, respira normalmente y presenta sangrado intenso.',correct:true,feedback:'Correcto. Conciencia, respiración y hemorragia cambian de inmediato la prioridad.'},
          {id:'b',text:'Si pretende presentar una denuncia después.',correct:false,feedback:'La condición clínica viene antes del procedimiento administrativo.'},
          {id:'c',text:'Qué relación había entre víctima y agresor.',correct:false,feedback:'Es relevante, pero no sustituye la evaluación inicial de vida.'}
        ]},
        { id:'victims-vulnerable', title:'Persona vulnerable', scenario:'Hay humo en una vivienda. Un adulto salió, pero informa que un niño puede estar en un dormitorio.', objective:'Reconocer una persona atrapada y evitar un rescate inseguro.', prompt:'¿Cuál respuesta es operativamente correcta?', options:[
          {id:'a',text:'Ordenar al adulto que vuelva de inmediato.',correct:false,feedback:'Eso puede crear una segunda víctima y dificultar el rescate profesional.'},
          {id:'b',text:'Confirmar la última ubicación del niño, mantener al adulto fuera y transmitirla.',correct:true,feedback:'Correcto. Información precisa sin exponer nuevamente al solicitante.'},
          {id:'c',text:'Esperar que el niño salga solo antes de pedir apoyo.',correct:false,feedback:'Una persona posiblemente atrapada exige respuesta inmediata.'}
        ]}
      ]},
      { id:'safety', number:'04', title:'Seguridad del solicitante', summary:'Orientar sin convertir al ciudadano en agente de campo.', steps:[
        { id:'safety-shelter', title:'Amenaza cercana', scenario:'La solicitante está detrás de una puerta mientras el agresor grita en el pasillo del edificio.', objective:'Reducir exposición manteniendo información útil.', prompt:'¿Cuál orientación es más segura?', options:[
          {id:'a',text:'Salir para observar mejor al agresor.',correct:false,feedback:'La observación nunca debe exigir exposición al agresor.'},
          {id:'b',text:'Encerrarse, silenciar el teléfono cuando sea necesario y alejarse de la puerta.',correct:true,feedback:'Correcto. Se preserva a la víctima y se mantiene contacto discreto.'},
          {id:'c',text:'Gritar que la policía está llegando.',correct:false,feedback:'Eso puede provocar escalada antes de la llegada de los equipos.'}
        ]},
        { id:'safety-pursuit', title:'No perseguir', scenario:'Después de un hurto, el solicitante dice que seguirá al sospechoso en motocicleta.', objective:'Evitar confrontación y conservar datos útiles.', prompt:'¿Cómo responder?', options:[
          {id:'a',text:'Apoyar la persecución mientras mantenga distancia.',correct:false,feedback:'Incluso a distancia, la persecución puede generar choque o confrontación.'},
          {id:'b',text:'Indicar que no lo siga y pedir ubicación, dirección y características del vehículo.',correct:true,feedback:'Correcto. Proteges al ciudadano y aprovechas la información disponible.'},
          {id:'c',text:'Cerrar la llamada porque el hecho ya terminó.',correct:false,feedback:'La dirección de fuga aún puede permitir una intervención segura.'}
        ]}
      ]},
      { id:'dispatch', number:'05', title:'Despacho proporcional', summary:'Enviar el recurso correcto sin dejar la red operativa descubierta.', steps:[
        { id:'dispatch-medical', title:'Policía y atención médica', scenario:'Una agresión dejó una víctima consciente con sangrado y el agresor sigue cerca.', objective:'Combinar seguridad de la escena y asistencia médica.', prompt:'¿Cuál despacho es más coherente?', options:[
          {id:'a',text:'Solo ambulancia, porque hay una persona herida.',correct:false,feedback:'El personal médico podría entrar en una escena insegura.'},
          {id:'b',text:'Patrulla para seguridad y ambulancia para la víctima.',correct:true,feedback:'Correcto. Los recursos cubren amenaza activa y necesidad clínica.'},
          {id:'c',text:'Helicóptero y todas las patrullas disponibles.',correct:false,feedback:'Eso sobrecarga la red sin justificación suficiente.'}
        ]},
        { id:'dispatch-excess', title:'Evitar sobrecarga', scenario:'Un vehículo fue encontrado abandonado, sin víctima, fuego, sospechoso presente ni riesgo inmediato.', objective:'Preservar recursos críticos para llamadas más graves.', prompt:'¿Cuál decisión es proporcional?', options:[
          {id:'a',text:'Enviar una patrulla para verificar y mantener recursos especiales disponibles.',correct:true,feedback:'Correcto. La primera unidad puede evaluar y pedir refuerzo si surgen riesgos.'},
          {id:'b',text:'Enviar patrulla, ambulancia y helicóptero preventivamente.',correct:false,feedback:'No hay indicación médica ni aérea en el escenario.'},
          {id:'c',text:'No registrar el incidente.',correct:false,feedback:'Baja urgencia no significa ausencia de respuesta.'}
        ]}
      ]}
    ]
  }
};

export function getTrainingCourse(locale = 'pt-BR') {
  return course[locale] || course['pt-BR'];
}

export function getTrainingStepIds() {
  return course['pt-BR'].modules.flatMap((module) => module.steps.map((step) => step.id));
}

export function getTrainingModuleIds() {
  return course['pt-BR'].modules.map((module) => module.id);
}

export function validateTrainingCourse(locales = ['pt-BR','en-US','es-419']) {
  const errors = [];
  const base = course['pt-BR'];
  const baseModuleIds = base.modules.map((module) => module.id);
  const baseStepIds = base.modules.flatMap((module) => module.steps.map((step) => step.id));
  for (const locale of locales) {
    const pack = course[locale];
    if (!pack) { errors.push(`${locale}: missing locale`); continue; }
    if (!pack.ui || !pack.modules) { errors.push(`${locale}: malformed pack`); continue; }
    const moduleIds = pack.modules.map((module) => module.id);
    const stepIds = pack.modules.flatMap((module) => module.steps.map((step) => step.id));
    if (JSON.stringify(moduleIds) !== JSON.stringify(baseModuleIds)) errors.push(`${locale}: module ids mismatch`);
    if (JSON.stringify(stepIds) !== JSON.stringify(baseStepIds)) errors.push(`${locale}: step ids mismatch`);
    for (const module of pack.modules) {
      if (!module.title || !module.summary || module.steps.length !== 2) errors.push(`${locale}:${module.id}: invalid module`);
      for (const step of module.steps) {
        if (!step.title || !step.scenario || !step.objective || !step.prompt) errors.push(`${locale}:${step.id}: incomplete text`);
        if (!Array.isArray(step.options) || step.options.length !== 3) errors.push(`${locale}:${step.id}: invalid options`);
        if (step.options.filter((option) => option.correct).length !== 1) errors.push(`${locale}:${step.id}: expected one correct option`);
      }
    }
  }
  return { ok: errors.length === 0, errors, moduleCount: baseModuleIds.length, stepCount: baseStepIds.length };
}

export const TRAINING_COURSES = Object.freeze(course);
