import { safeInteger, safeString, uniqueStrings } from '../core/utils.js';

export const FIELD_ACTION_IDS = Object.freeze(['secure','reinforce','pursue','negotiate','rescue','medical','arrest','withdraw','airSupport']);
export const FIELD_OUTCOME_IDS = Object.freeze(['controlled','partial','failed','critical']);

const ACTION_RULES = Object.freeze({
  secure:{ control:18, danger:-11, time:34, requires:'police' },
  reinforce:{ control:11, danger:-7, time:42, reinforcement:1 },
  pursue:{ control:15, danger:4, time:38, requires:'police' },
  negotiate:{ control:17, danger:-10, time:48 },
  rescue:{ control:13, danger:1, time:52, victim:1 },
  medical:{ control:10, danger:-5, time:43, victim:1, requires:'ambulance' },
  arrest:{ control:20, danger:-7, time:40, suspect:'arrested', requires:'police' },
  withdraw:{ control:-6, danger:-13, time:28 },
  airSupport:{ control:16, danger:-6, time:32, requires:'helicopter' }
});

const PROFILES = Object.freeze({
  'domestic-weapon-risk':{
    initial:{control:34,danger:66,civilians:2},
    stages:[
      {id:'arrival',options:['secure','negotiate','reinforce'],ideal:['secure'],acceptable:['reinforce']},
      {id:'contact',options:['negotiate','arrest','withdraw'],ideal:['negotiate'],acceptable:['withdraw']},
      {id:'resolution',options:['arrest','medical','rescue'],ideal:['arrest','medical'],acceptable:['rescue']}
    ]
  },
  'armed-robbery-escape':{
    initial:{control:27,danger:76,civilians:4},
    stages:[
      {id:'arrival',options:['secure','pursue','reinforce'],ideal:['secure'],acceptable:['reinforce']},
      {id:'tracking',options:['pursue','airSupport','reinforce'],ideal:['pursue','airSupport'],acceptable:['reinforce']},
      {id:'resolution',options:['arrest','rescue','medical'],ideal:['arrest','rescue'],acceptable:['medical']}
    ]
  },
  'collision-victims-fuel':{
    initial:{control:38,danger:68,civilians:3},
    stages:[
      {id:'arrival',options:['secure','medical','reinforce'],ideal:['secure','medical'],acceptable:['reinforce']},
      {id:'rescue',options:['rescue','medical','withdraw'],ideal:['rescue','medical'],acceptable:['withdraw']},
      {id:'resolution',options:['medical','secure','reinforce'],ideal:['medical','secure'],acceptable:['reinforce']}
    ]
  },
  'panic-line-ambiguous-threat':{
    initial:{control:30,danger:60,civilians:2},
    stages:[
      {id:'arrival',options:['secure','negotiate','reinforce'],ideal:['secure','negotiate'],acceptable:['reinforce']},
      {id:'contact',options:['negotiate','medical','arrest'],ideal:['negotiate'],acceptable:['medical']},
      {id:'resolution',options:['medical','rescue','arrest'],ideal:['medical','rescue'],acceptable:['arrest']}
    ]
  },
  'kidnapping-attempt-school':{
    initial:{control:20,danger:86,civilians:6},
    stages:[
      {id:'arrival',options:['secure','reinforce','airSupport'],ideal:['secure','reinforce'],acceptable:['airSupport']},
      {id:'tracking',options:['airSupport','pursue','rescue'],ideal:['airSupport','pursue'],acceptable:['rescue']},
      {id:'resolution',options:['arrest','rescue','medical'],ideal:['arrest','rescue'],acceptable:['medical']}
    ]
  },
  'shots-fired-bar':{
    initial:{control:18,danger:90,civilians:12},
    stages:[
      {id:'arrival',options:['secure','reinforce','withdraw'],ideal:['secure','reinforce'],acceptable:['withdraw']},
      {id:'contact',options:['rescue','medical','airSupport'],ideal:['rescue','medical'],acceptable:['airSupport']},
      {id:'resolution',options:['arrest','medical','secure'],ideal:['arrest','medical'],acceptable:['secure']}
    ]
  },
  'noise-party-threat':{
    initial:{control:50,danger:40,civilians:8},
    stages:[
      {id:'arrival',options:['negotiate','secure','reinforce'],ideal:['negotiate'],acceptable:['secure']},
      {id:'mediation',options:['negotiate','withdraw','arrest'],ideal:['negotiate'],acceptable:['withdraw']},
      {id:'resolution',options:['secure','arrest','withdraw'],ideal:['secure','withdraw'],acceptable:['arrest']}
    ]
  },
  'morning-school-traffic':{
    initial:{control:35,danger:70,civilians:4},
    stages:[
      {id:'arrival',options:['secure','medical','reinforce'],ideal:['secure','medical'],acceptable:['reinforce']},
      {id:'rescue',options:['rescue','medical','withdraw'],ideal:['rescue','medical'],acceptable:['withdraw']},
      {id:'resolution',options:['medical','secure','reinforce'],ideal:['medical','secure'],acceptable:['reinforce']}
    ]
  }
});

const TEXT = Object.freeze({
  'pt-BR': Object.freeze({
    title:'Operação de campo', subtitle:'Comando, rádio e desfecho em tempo real', phase:'Fase {current} de {total}', control:'Controle da cena', danger:'Perigo operacional', victims:'Vítimas protegidas', reinforcements:'Reforços', radio:'Canal de rádio', decision:'Decisão do operador', teams:'Equipes na cena', complete:'Concluir operação', continue:'Acompanhar operação', review:'Revisar despacho', awaiting:'Aguardando decisão', completed:'Operação encerrada', noSupport:'A ação não possui equipe compatível na cena.', actionApplied:'Ordem transmitida. Controle {control}% • perigo {danger}%.', locked:'Registre as ordens de despacho antes de iniciar a operação.', scoreTitle:'Operação de campo', scoreText:'Pontuação {score}/45. Controle {control}%, perigo {danger}%, {ideal}/{decisions} decisões ideais e desfecho {outcome}.',
    actionLabels:{secure:'Isolar e controlar a cena',reinforce:'Solicitar reforço',pursue:'Iniciar perseguição',negotiate:'Negociar e ganhar tempo',rescue:'Executar resgate',medical:'Priorizar atendimento médico',arrest:'Efetuar prisão',withdraw:'Recuar e reavaliar',airSupport:'Coordenar apoio aéreo'},
    actionHints:{secure:'Cria perímetro e protege terceiros.',reinforce:'Amplia capacidade sem abandonar a cobertura.',pursue:'Mantém contato com suspeito em fuga.',negotiate:'Reduz tensão e busca rendição segura.',rescue:'Retira pessoas da zona de risco.',medical:'Estabiliza vítimas e organiza evacuação.',arrest:'Contém e conduz o suspeito.',withdraw:'Reduz exposição enquanto reorganiza a resposta.',airSupport:'Rastreia, ilumina e coordena o perímetro.'},
    outcomes:{controlled:'Controlado',partial:'Parcial',failed:'Falha operacional',critical:'Crítico'},
    outcomeDescriptions:{controlled:'Cena estabilizada, vítimas protegidas e objetivo operacional atingido.',partial:'A ameaça foi reduzida, mas permaneceram perdas de controle ou riscos residuais.',failed:'A resposta não conteve plenamente a ocorrência e exigirá revisão de protocolo.',critical:'A situação escalou com risco elevado, perda de controle ou vítimas expostas.'},
    quality:{ideal:'Decisão ideal',acceptable:'Decisão aceitável',poor:'Decisão de alto risco',unsupported:'Sem recurso compatível'},
    radioStart:'CENTRAL: equipes confirmam chegada e assumem o comando da ocorrência.', radioComplete:'SUPERVISÃO: operação encerrada; aguarde relatório técnico.'
  }),
  'en-US': Object.freeze({
    title:'Field operation', subtitle:'Command, radio and live outcome', phase:'Phase {current} of {total}', control:'Scene control', danger:'Operational danger', victims:'Victims protected', reinforcements:'Reinforcements', radio:'Radio channel', decision:'Operator decision', teams:'Teams on scene', complete:'Close operation', continue:'Track operation', review:'Review dispatch', awaiting:'Awaiting decision', completed:'Operation closed', noSupport:'No compatible team is present for this action.', actionApplied:'Order transmitted. Control {control}% • danger {danger}%.', locked:'Log dispatch orders before starting the operation.', scoreTitle:'Field operation', scoreText:'Score {score}/45. Control {control}%, danger {danger}%, {ideal}/{decisions} ideal decisions and {outcome} outcome.',
    actionLabels:{secure:'Secure and control scene',reinforce:'Request reinforcement',pursue:'Begin pursuit',negotiate:'Negotiate and gain time',rescue:'Execute rescue',medical:'Prioritize medical care',arrest:'Make arrest',withdraw:'Withdraw and reassess',airSupport:'Coordinate air support'},
    actionHints:{secure:'Builds a perimeter and protects bystanders.',reinforce:'Adds capability without abandoning network coverage.',pursue:'Maintains contact with a fleeing suspect.',negotiate:'Reduces tension and seeks a safe surrender.',rescue:'Removes people from the danger zone.',medical:'Stabilizes victims and organizes evacuation.',arrest:'Contains and takes the suspect into custody.',withdraw:'Reduces exposure while reorganizing the response.',airSupport:'Tracks, illuminates and coordinates the perimeter.'},
    outcomes:{controlled:'Controlled',partial:'Partial',failed:'Operational failure',critical:'Critical'},
    outcomeDescriptions:{controlled:'Scene stabilized, victims protected and operational objective achieved.',partial:'The threat was reduced, but control losses or residual risks remained.',failed:'The response did not fully contain the incident and requires protocol review.',critical:'The situation escalated with high risk, loss of control or exposed victims.'},
    quality:{ideal:'Ideal decision',acceptable:'Acceptable decision',poor:'High-risk decision',unsupported:'No compatible resource'},
    radioStart:'CENTRAL: teams confirm arrival and assume incident command.', radioComplete:'SUPERVISION: operation closed; stand by for technical report.'
  }),
  'es-419': Object.freeze({
    title:'Operación de campo', subtitle:'Mando, radio y desenlace en tiempo real', phase:'Fase {current} de {total}', control:'Control de la escena', danger:'Peligro operativo', victims:'Víctimas protegidas', reinforcements:'Refuerzos', radio:'Canal de radio', decision:'Decisión del operador', teams:'Equipos en la escena', complete:'Cerrar operación', continue:'Acompañar operación', review:'Revisar despacho', awaiting:'Esperando decisión', completed:'Operación cerrada', noSupport:'No hay un equipo compatible en la escena para esta acción.', actionApplied:'Orden transmitida. Control {control}% • peligro {danger}%.', locked:'Registra las órdenes de despacho antes de iniciar la operación.', scoreTitle:'Operación de campo', scoreText:'Puntuación {score}/45. Control {control}%, peligro {danger}%, {ideal}/{decisions} decisiones ideales y desenlace {outcome}.',
    actionLabels:{secure:'Aislar y controlar la escena',reinforce:'Solicitar refuerzo',pursue:'Iniciar persecución',negotiate:'Negociar y ganar tiempo',rescue:'Ejecutar rescate',medical:'Priorizar atención médica',arrest:'Realizar detención',withdraw:'Retroceder y reevaluar',airSupport:'Coordinar apoyo aéreo'},
    actionHints:{secure:'Crea perímetro y protege a terceros.',reinforce:'Aumenta capacidad sin abandonar la cobertura.',pursue:'Mantiene contacto con un sospechoso en fuga.',negotiate:'Reduce tensión y busca una rendición segura.',rescue:'Retira personas de la zona de peligro.',medical:'Estabiliza víctimas y organiza evacuación.',arrest:'Contiene y detiene al sospechoso.',withdraw:'Reduce exposición mientras reorganiza la respuesta.',airSupport:'Rastrea, ilumina y coordina el perímetro.'},
    outcomes:{controlled:'Controlado',partial:'Parcial',failed:'Falla operativa',critical:'Crítico'},
    outcomeDescriptions:{controlled:'Escena estabilizada, víctimas protegidas y objetivo operativo alcanzado.',partial:'La amenaza se redujo, pero quedaron pérdidas de control o riesgos residuales.',failed:'La respuesta no contuvo plenamente el incidente y requiere revisar el protocolo.',critical:'La situación escaló con alto riesgo, pérdida de control o víctimas expuestas.'},
    quality:{ideal:'Decisión ideal',acceptable:'Decisión aceptable',poor:'Decisión de alto riesgo',unsupported:'Sin recurso compatible'},
    radioStart:'CENTRAL: los equipos confirman llegada y asumen el mando del incidente.', radioComplete:'SUPERVISIÓN: operación cerrada; espere el informe técnico.'
  })
});

const STAGE_TEXT = Object.freeze({
  'pt-BR': Object.freeze({
    'domestic-weapon-risk':{arrival:'A equipe chega e ouve gritos dentro da residência. Como organizar a aproximação?',contact:'O agressor mantém contato visual e a vítima está em área vulnerável. Qual comando transmitir?',resolution:'A ameaça imediata foi reduzida, mas há ferimentos e resistência. Como encerrar a ação?'},
    'armed-robbery-escape':{arrival:'Há clientes escondidos e os suspeitos deixam o comércio em um veículo. Qual é a primeira ordem?',tracking:'A fuga segue por vias movimentadas e a equipe perde visibilidade em alguns trechos. Como manter o acompanhamento?',resolution:'O veículo foi contido e existem civis próximos. Como concluir a abordagem?'},
    'collision-victims-fuel':{arrival:'A pista está bloqueada, há combustível vazando e vítimas expostas ao tráfego. Qual prioridade inicial?',rescue:'Uma vítima permanece presa e outra apresenta sangramento. Como coordenar a resposta?',resolution:'A retirada foi iniciada, mas o vazamento e o trânsito ainda oferecem risco. Como concluir?'},
    'panic-line-ambiguous-threat':{arrival:'A equipe chega com poucas informações e encontra uma pessoa em pânico. Como assumir a cena sem escalar a ameaça?',contact:'A fala é fragmentada, mas a pessoa responde ao diálogo e aponta para um cômodo. Como avançar?',resolution:'A ameaça foi esclarecida, porém há uma pessoa em choque que precisa de proteção. Qual comando final?'},
    'kidnapping-attempt-school':{arrival:'Há crianças e responsáveis em pânico, com relatos de uma tentativa de sequestro. Como organizar a área?',tracking:'Um veículo compatível foi visto deixando a região e há risco para uma criança. Como coordenar a busca?',resolution:'O veículo foi interceptado e a vítima ainda está próxima do suspeito. Como concluir com segurança?'},
    'shots-fired-bar':{arrival:'Há disparos recentes, multidão dispersando e vítimas possivelmente dentro do bar. Qual primeira ordem?',contact:'A equipe identifica feridos e possível atirador ainda ativo nos fundos. Como avançar?',resolution:'O suspeito foi localizado, existem vítimas no salão e o perímetro continua tenso. Como encerrar?'},
    'noise-party-threat':{arrival:'Há discussão entre vizinhos, música alta e ameaça verbal. Qual abordagem inicial?',mediation:'As partes falam ao mesmo tempo e uma pessoa provoca a equipe. Como conduzir?',resolution:'O volume foi reduzido e o grupo começa a dispersar, mas a tensão permanece. Como finalizar?'},
    'morning-school-traffic':{arrival:'Uma pessoa foi atropelada próximo à escola e o trânsito ameaça novas vítimas. Qual prioridade inicial?',rescue:'A vítima está no solo, alunos se aproximam e veículos ainda passam ao lado. Como coordenar a resposta?',resolution:'O atendimento começou, mas a via precisa permanecer segura para a evacuação. Como concluir?'}
  }),
  'en-US': Object.freeze({
    'domestic-weapon-risk':{arrival:'The team arrives and hears shouting inside the home. How should the approach be organized?',contact:'The aggressor maintains visual contact and the victim is exposed. What command should be sent?',resolution:'The immediate threat decreased, but there are injuries and resistance. How should the action end?'},
    'armed-robbery-escape':{arrival:'Customers are hiding while the suspects leave the store in a vehicle. What is the first order?',tracking:'The escape continues through busy roads and the team loses sight at times. How should tracking continue?',resolution:'The vehicle is contained and civilians are nearby. How should the stop conclude?'},
    'collision-victims-fuel':{arrival:'The road is blocked, fuel is leaking and victims are exposed to traffic. What is the first priority?',rescue:'One victim is trapped and another is bleeding. How should the response be coordinated?',resolution:'Extraction has begun, but the leak and traffic remain dangerous. How should it conclude?'},
    'panic-line-ambiguous-threat':{arrival:'The team arrives with limited information and finds a person in panic. How should command be established without escalating the threat?',contact:'Speech is fragmented, but the person responds and points to a room. How should the team proceed?',resolution:'The threat is clarified, but a person in shock still needs protection. What is the final command?'},
    'kidnapping-attempt-school':{arrival:'Children and guardians are panicking after reports of an attempted kidnapping. How should the area be organized?',tracking:'A matching vehicle is seen leaving the area and a child may be at risk. How should the search be coordinated?',resolution:'The vehicle is intercepted and the victim remains close to the suspect. How should the operation conclude safely?'},
    'shots-fired-bar':{arrival:'Shots were recently fired, a crowd is scattering and victims may be inside the bar. What is the first order?',contact:'Teams identify injured people and a possible active shooter near the rear. How should they advance?',resolution:'The suspect is located, victims remain in the main room and the perimeter is tense. How should it end?'},
    'noise-party-threat':{arrival:'Neighbors are arguing, music is loud and verbal threats were made. What is the first approach?',mediation:'Both sides speak at once and one person provokes the team. How should this be handled?',resolution:'The volume is down and the group starts to disperse, but tension remains. How should it finish?'},
    'morning-school-traffic':{arrival:'A person was struck near a school and traffic threatens additional victims. What is the first priority?',rescue:'The victim is on the road, students approach and vehicles still pass nearby. How should the response be coordinated?',resolution:'Care has begun, but the road must stay secure for evacuation. How should it conclude?'}
  }),
  'es-419': Object.freeze({
    'domestic-weapon-risk':{arrival:'El equipo llega y escucha gritos dentro de la vivienda. ¿Cómo organizar la aproximación?',contact:'El agresor mantiene contacto visual y la víctima está expuesta. ¿Qué orden transmitir?',resolution:'La amenaza inmediata disminuyó, pero hay lesiones y resistencia. ¿Cómo cerrar la acción?'},
    'armed-robbery-escape':{arrival:'Hay clientes ocultos mientras los sospechosos salen del comercio en un vehículo. ¿Cuál es la primera orden?',tracking:'La fuga sigue por vías transitadas y el equipo pierde visibilidad por momentos. ¿Cómo mantener el seguimiento?',resolution:'El vehículo fue contenido y hay civiles cerca. ¿Cómo concluir la detención?'},
    'collision-victims-fuel':{arrival:'La vía está bloqueada, hay combustible derramado y víctimas expuestas al tránsito. ¿Cuál es la prioridad inicial?',rescue:'Una víctima está atrapada y otra presenta sangrado. ¿Cómo coordinar la respuesta?',resolution:'La extracción comenzó, pero el derrame y el tránsito siguen siendo peligrosos. ¿Cómo concluir?'},
    'panic-line-ambiguous-threat':{arrival:'El equipo llega con poca información y encuentra a una persona en pánico. ¿Cómo asumir el mando sin aumentar la amenaza?',contact:'El relato es fragmentado, pero la persona responde y señala una habitación. ¿Cómo avanzar?',resolution:'La amenaza fue aclarada, pero una persona en shock aún necesita protección. ¿Qué orden final dar?'},
    'kidnapping-attempt-school':{arrival:'Niños y responsables están en pánico por una tentativa de secuestro. ¿Cómo organizar la zona?',tracking:'Un vehículo compatible fue visto saliendo del área y un menor puede estar en riesgo. ¿Cómo coordinar la búsqueda?',resolution:'El vehículo fue interceptado y la víctima sigue cerca del sospechoso. ¿Cómo concluir con seguridad?'},
    'shots-fired-bar':{arrival:'Hubo disparos recientes, la multitud se dispersa y puede haber víctimas dentro del bar. ¿Cuál es la primera orden?',contact:'Los equipos identifican heridos y un posible tirador activo al fondo. ¿Cómo avanzar?',resolution:'El sospechoso fue localizado, hay víctimas en el salón y el perímetro sigue tenso. ¿Cómo terminar?'},
    'noise-party-threat':{arrival:'Hay discusión entre vecinos, música alta y amenazas verbales. ¿Cuál es la primera aproximación?',mediation:'Las partes hablan al mismo tiempo y una persona provoca al equipo. ¿Cómo conducir?',resolution:'El volumen bajó y el grupo empieza a dispersarse, pero la tensión continúa. ¿Cómo finalizar?'},
    'morning-school-traffic':{arrival:'Una persona fue atropellada cerca de una escuela y el tránsito amenaza a otras víctimas. ¿Cuál es la prioridad inicial?',rescue:'La víctima está en la vía, los alumnos se acercan y los vehículos siguen pasando. ¿Cómo coordinar la respuesta?',resolution:'La atención comenzó, pero la vía debe seguir segura para la evacuación. ¿Cómo concluir?'}
  })
});

function interpolate(template, values = {}) { return String(template ?? '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`)); }
export function fieldText(locale, key, values = {}) { const source = TEXT[locale] || TEXT['pt-BR']; const value = key.split('.').reduce((acc, part) => acc?.[part], source); return interpolate(typeof value === 'string' ? value : key, values); }
export function fieldStageText(locale, incidentId, stageId) { return STAGE_TEXT[locale]?.[incidentId]?.[stageId] || STAGE_TEXT['pt-BR']?.[incidentId]?.[stageId] || stageId; }
export function getFieldOperationProfile(incidentId) { return PROFILES[incidentId] || null; }

export function createInitialFieldOperationState(incidentId = '') {
  const profile = getFieldOperationProfile(incidentId);
  return { incidentId:safeString(incidentId,''), started:false, completed:false, currentStage:0, control:profile?.initial.control ?? 30, danger:profile?.initial.danger ?? 70, civilians:profile?.initial.civilians ?? 1, victimsProtected:0, reinforcements:0, elapsedSeconds:0, decisions:[], radioLog:[], failures:0, idealDecisions:0, suspectStatus:'unknown', victimStatus:'exposed', outcomeId:'', score:0 };
}

export function normalizeFieldOperationState(state, incidentId = '') {
  const source = state && typeof state === 'object' ? state : {};
  const profile = getFieldOperationProfile(source.incidentId || incidentId);
  const fallback = createInitialFieldOperationState(source.incidentId || incidentId);
  const decisions = Array.isArray(source.decisions) ? source.decisions.slice(-12).map((item) => ({ stageId:safeString(item?.stageId,'',40), actionId:FIELD_ACTION_IDS.includes(item?.actionId)?item.actionId:'withdraw', quality:['ideal','acceptable','poor','unsupported'].includes(item?.quality)?item.quality:'poor', supported:item?.supported !== false, at:safeInteger(item?.at,0,100000,0), control:safeInteger(item?.control,0,100,0), danger:safeInteger(item?.danger,0,100,100) })) : [];
  const radioLog = Array.isArray(source.radioLog) ? source.radioLog.slice(-20).map((item) => ({ type:['central','team','system'].includes(item?.type)?item.type:'system', text:safeString(item?.text,'',280), at:safeInteger(item?.at,0,100000,0) })).filter((item)=>item.text) : [];
  const stageCount = profile?.stages.length ?? 3;
  const rawStage = safeInteger(source.currentStage,0,stageCount,0);
  const completed = Boolean(source.completed) || (Boolean(profile) && rawStage >= stageCount);
  const currentStage = completed ? stageCount : Math.min(rawStage, Math.max(0, stageCount - 1));
  return { incidentId:safeString(source.incidentId || incidentId,''), started:Boolean(source.started), completed, currentStage, control:safeInteger(source.control,0,100,fallback.control), danger:safeInteger(source.danger,0,100,fallback.danger), civilians:safeInteger(source.civilians,0,99,fallback.civilians), victimsProtected:safeInteger(source.victimsProtected,0,99,0), reinforcements:safeInteger(source.reinforcements,0,20,0), elapsedSeconds:safeInteger(source.elapsedSeconds,0,86400,0), decisions, radioLog, failures:safeInteger(source.failures,0,99,0), idealDecisions:safeInteger(source.idealDecisions,0,99,0), suspectStatus:['unknown','contained','fled','arrested'].includes(source.suspectStatus)?source.suspectStatus:'unknown', victimStatus:['exposed','assisted','safe','injured'].includes(source.victimStatus)?source.victimStatus:'exposed', outcomeId:FIELD_OUTCOME_IDS.includes(source.outcomeId)?source.outcomeId:'', score:safeInteger(source.score,0,45,0) };
}

function hasType(context, typeId) { return new Set((context?.selectedResources || []).map((item)=>item?.typeId).filter(Boolean)).has(typeId); }
function supportedAction(actionId, context) { const req = ACTION_RULES[actionId]?.requires; return !req || hasType(context, req); }

function determineOutcome(state) {
  if (state.danger >= 88 || state.control < 25 || state.failures >= 3) return 'critical';
  if (state.danger >= 72 || state.control < 43) return 'failed';
  if (state.danger >= 52 || state.control < 70 || state.failures >= 2) return 'partial';
  return 'controlled';
}

function calculateScore(state) {
  const decisions = Math.max(1, state.decisions.length);
  const idealRatio = state.idealDecisions / decisions;
  const outcomeBonus = {controlled:12,partial:6,failed:1,critical:-6}[state.outcomeId] ?? 0;
  return Math.max(0, Math.min(45, Math.round(state.control * .2 + (100-state.danger)*.12 + idealRatio*12 + outcomeBonus - state.failures*3)));
}

export function resolveFieldAction(state, incidentId, actionId, context = {}) {
  const profile = getFieldOperationProfile(incidentId);
  const current = normalizeFieldOperationState(state, incidentId);
  if (!profile || current.completed || !FIELD_ACTION_IDS.includes(actionId)) return { state:current, quality:'poor', supported:false };
  const stage = profile.stages[current.currentStage];
  if (!stage || !stage.options.includes(actionId)) return { state:current, quality:'poor', supported:false };
  const supported = supportedAction(actionId, context);
  const quality = !supported ? 'unsupported' : stage.ideal.includes(actionId) ? 'ideal' : stage.acceptable.includes(actionId) ? 'acceptable' : 'poor';
  const rule = ACTION_RULES[actionId];
  const multiplier = quality === 'ideal' ? 1 : quality === 'acceptable' ? .6 : quality === 'unsupported' ? -.55 : -.35;
  const next = normalizeFieldOperationState(current, incidentId);
  next.started = true;
  next.control = Math.max(0, Math.min(100, Math.round(next.control + rule.control * multiplier)));
  next.danger = Math.max(0, Math.min(100, Math.round(next.danger + rule.danger * (quality === 'poor' || quality === 'unsupported' ? -1 : multiplier))));
  if (quality === 'poor') { next.danger = Math.min(100,next.danger+8); next.control=Math.max(0,next.control-4); next.failures += 1; }
  if (quality === 'unsupported') { next.danger = Math.min(100,next.danger+12); next.control=Math.max(0,next.control-7); next.failures += 1; }
  if (quality === 'ideal') next.idealDecisions += 1;
  next.elapsedSeconds += Math.max(15, Math.round(rule.time * (quality === 'ideal' ? .9 : quality === 'acceptable' ? 1 : 1.2)));
  if (rule.reinforcement && supported) next.reinforcements += rule.reinforcement;
  if (rule.victim && supported && quality !== 'poor') { next.victimsProtected = Math.min(next.civilians, next.victimsProtected + rule.victim); next.victimStatus = next.victimsProtected >= next.civilians ? 'safe' : 'assisted'; }
  if (rule.suspect && supported && quality !== 'poor') next.suspectStatus = rule.suspect;
  if (actionId === 'pursue' && quality === 'poor') next.suspectStatus = 'fled';
  if (actionId === 'secure' && quality !== 'poor') next.suspectStatus = next.suspectStatus === 'unknown' ? 'contained' : next.suspectStatus;
  next.decisions.push({ stageId:stage.id, actionId, quality, supported, at:next.elapsedSeconds, control:next.control, danger:next.danger });
  next.radioLog.push({ type:quality === 'ideal' ? 'team' : quality === 'acceptable' ? 'central' : 'system', text:`${stage.id}:${actionId}:${quality}`, at:next.elapsedSeconds });
  next.currentStage += 1;
  if (next.currentStage >= profile.stages.length) {
    next.completed = true;
    if (next.victimStatus === 'exposed') next.victimStatus = next.danger > 70 ? 'injured' : 'assisted';
    next.outcomeId = determineOutcome(next);
    next.score = calculateScore(next);
  }
  return { state:normalizeFieldOperationState(next,incidentId), quality, supported, stage };
}

export function assessFieldOperation(incidentId, state) {
  const profile = getFieldOperationProfile(incidentId);
  const normalized = normalizeFieldOperationState(state, incidentId);
  const decisions = normalized.decisions.length;
  return { ok:Boolean(profile && normalized.completed && ['controlled','partial'].includes(normalized.outcomeId)), score:normalized.completed?normalized.score:0, outcomeId:normalized.outcomeId || determineOutcome(normalized), control:normalized.control, danger:normalized.danger, idealDecisions:normalized.idealDecisions, decisions, failures:normalized.failures, elapsedSeconds:normalized.elapsedSeconds, victimsProtected:normalized.victimsProtected, reinforcements:normalized.reinforcements, suspectStatus:normalized.suspectStatus, victimStatus:normalized.victimStatus };
}

export function validateFieldOperationCatalog(incidentIds = []) {
  const errors=[];
  for (const incidentId of incidentIds) {
    const profile=PROFILES[incidentId];
    if(!profile){errors.push(`Perfil de campo ausente: ${incidentId}`);continue;}
    if(!Array.isArray(profile.stages)||profile.stages.length!==3)errors.push(`Etapas inválidas: ${incidentId}`);
    for(const stage of profile.stages||[]){
      if(!stage.id||!Array.isArray(stage.options)||stage.options.length<3)errors.push(`Etapa inválida: ${incidentId}`);
      for(const action of [...(stage.options||[]),...(stage.ideal||[]),...(stage.acceptable||[])])if(!FIELD_ACTION_IDS.includes(action))errors.push(`Ação inválida ${action}: ${incidentId}`);
      for(const locale of Object.keys(TEXT))if(!STAGE_TEXT[locale]?.[incidentId]?.[stage.id])errors.push(`Texto ${locale} ausente: ${incidentId}/${stage.id}`);
    }
  }
  for(const locale of Object.keys(TEXT))for(const action of FIELD_ACTION_IDS){if(!TEXT[locale].actionLabels[action]||!TEXT[locale].actionHints[action])errors.push(`Tradução de ação ausente ${locale}/${action}`);}
  return {ok:errors.length===0,errors,profiles:Object.keys(PROFILES).length,actions:FIELD_ACTION_IDS.length,stages:Object.values(PROFILES).reduce((sum,p)=>sum+p.stages.length,0),outcomes:FIELD_OUTCOME_IDS.length};
}
