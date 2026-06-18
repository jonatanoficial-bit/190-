const SHARED = Object.freeze({
  'pt-BR': {
    avatars: ['Operador 01','Operadora 02','Operador 03','Operador 04','Operadora 05'],
    ranks: ['Atendente I','Atendente II','Atendente III','Supervisor de Plantão'],
    units: {
      police: ['Viatura policial','Equipe primária para contenção, perímetro e abordagem.'],
      ambulance: ['Ambulância SAMU','Suporte médico para trauma, choque, desacordo ou feridos.'],
      helicopter: ['Apoio aéreo','Busca aérea, perseguição, fuga em veículo e visão ampliada.']
    },
    questions: {
      location: ['Confirmar localização e referência','Confirme o endereço, ponto de referência e para onde a viatura deve acessar.','localização'],
      victims: ['Verificar vítimas e feridos','Há feridos, reféns, crianças, idosos ou alguém preso no local?','vítimas'],
      weapon: ['Identificar arma e ameaça','Você viu arma, ouviu disparos ou há ameaça direta neste momento?','ameaça'],
      suspect: ['Descrever suspeito / veículo','Descreva suspeito, roupa, veículo, direção de fuga ou placa parcial.','suspeito'],
      safety: ['Orientar abrigo e segurança','Você consegue se manter abrigado, sem confronto e com a linha aberta?','segurança']
    }
  },
  'en-US': {
    avatars: ['Operator 01','Operator 02','Operator 03','Operator 04','Operator 05'],
    ranks: ['Call Taker I','Call Taker II','Call Taker III','Shift Supervisor'],
    units: {
      police: ['Police patrol unit','Primary team for containment, perimeter control and approach.'],
      ambulance: ['SAMU ambulance','Medical support for trauma, shock, unconsciousness or injuries.'],
      helicopter: ['Air support','Aerial search, pursuit, vehicle escape and expanded visibility.']
    },
    questions: {
      location: ['Confirm location and landmark','Confirm the address, landmark and best access route for the unit.','location'],
      victims: ['Check victims and injuries','Are there injured people, hostages, children, older adults or anyone trapped?','victims'],
      weapon: ['Identify weapon and threat','Did you see a weapon, hear shots or is there a direct threat right now?','threat'],
      suspect: ['Describe suspect / vehicle','Describe the suspect, clothing, vehicle, escape direction or partial plate.','suspect'],
      safety: ['Direct caller to safety','Can you stay sheltered, avoid confrontation and keep the line open?','safety']
    }
  },
  'es-419': {
    avatars: ['Operador 01','Operadora 02','Operador 03','Operador 04','Operadora 05'],
    ranks: ['Operador I','Operador II','Operador III','Supervisor de turno'],
    units: {
      police: ['Patrulla policial','Equipo principal para contención, perímetro y abordaje.'],
      ambulance: ['Ambulancia SAMU','Apoyo médico para trauma, choque, inconsciencia o heridos.'],
      helicopter: ['Apoyo aéreo','Búsqueda aérea, persecución, fuga vehicular y visión ampliada.']
    },
    questions: {
      location: ['Confirmar ubicación y referencia','Confirma la dirección, el punto de referencia y el mejor acceso para la unidad.','ubicación'],
      victims: ['Verificar víctimas y heridos','¿Hay heridos, rehenes, niños, adultos mayores o alguien atrapado?','víctimas'],
      weapon: ['Identificar arma y amenaza','¿Viste un arma, escuchaste disparos o hay una amenaza directa ahora?','amenaza'],
      suspect: ['Describir sospechoso / vehículo','Describe al sospechoso, ropa, vehículo, dirección de fuga o placa parcial.','sospechoso'],
      safety: ['Indicar refugio y seguridad','¿Puedes permanecer protegido, evitar el enfrentamiento y mantener la línea abierta?','seguridad']
    }
  }
});

const INCIDENTS = Object.freeze({
  'en-US': {
    'domestic-weapon-risk': {
      title:'Domestic violence with weapon risk', severity:'Critical priority', district:'Itaquera', opening:'190, what is your emergency?',
      callerOpening:'My partner is smashing everything. He has been drinking, grabbed a knife and said nobody is leaving.',
      facts:['Initial address is incomplete','Possible edged weapon','Caller is emotionally distressed'],
      contradictions:['The caller first says she is alone, then mentions a child in the bedroom.'],
      events:[['SYSTEM: Loud noise detected on the call. The caller moves away from the phone.',6],['MARINA: He is trying to open the bedroom door. My son is here with me.',10]],
      replies:{ location:'A small street near Dom Bosco station... I do not know the number. There is a pharmacy on the corner.', victims:'My son is with me. He is not hurt, but he is crying a lot.', weapon:'I saw a knife in his hand. I did not hear shots, only him hitting the door.', suspect:'Gray shirt, black shorts. He is inside the house, in the living room.', safety:'I am locked in the bedroom. I will stay away from the door and keep the line open.' },
      chips:['Residence','Internal risk','Narrow access']
    },
    'armed-robbery-escape': {
      title:'Armed robbery with vehicle escape', severity:'Critical priority', district:'Sé', opening:'190, what is your emergency?',
      callerOpening:'A car just sped away after a robbery. I think the suspects are armed. It happened very fast.',
      facts:['Suspect vehicle is moving','Partial plate information','Possible firearm'], contradictions:['The caller alternates between black and dark blue when describing the vehicle.'],
      events:[['CARLOS: They turned toward the old downtown area. I think there was more than one person in the car.',4],['SYSTEM: Containment window reduced. Visual contact may be lost.',8]],
      replies:{ location:'Sé district, near a narrow exit, heading toward the old downtown area.', victims:'The security guard fell but got up. I do not know whether he was injured.', weapon:'One of them pointed a gun. I could not tell whether it was a revolver or pistol.', suspect:'Dark car, plate may end in 47. Two men, one wearing a cap.', safety:'I am far away, across the street. I will not try to follow them.' }, chips:['Multiple routes','Air search recommended','Moderate traffic']
    },
    'collision-victims-fuel': {
      title:'Serious collision with trapped victim', severity:'High priority', district:'Bela Vista', opening:'190, what is your emergency?',
      callerOpening:'There was a major crash. One person is trapped in the car and is not responding. I can smell fuel.',
      facts:['Victim trapped in vehicle','Possible fuel leak','Heavy traffic road'], contradictions:['The caller does not know whether the victim is unconscious or in shock.'],
      events:[['RENATO: Traffic is stopping and people are getting very close to the car.',5],['SYSTEM: Secondary risk increased due to the crowd and fuel.',8]],
      replies:{ location:'Near Paulista Avenue in Bela Vista, at a busy intersection before the traffic light.', victims:'One person trapped and another with a cut on the face. Nobody is directing traffic.', weapon:'There is no weapon. The problem is the fuel and the trapped victim.', suspect:'There is no suspect. Two cars are involved, one silver and one white.', safety:'I will move people away and make sure nobody smokes nearby.' }, chips:['Road closure required','EMS recommended','Secondary risk']
    },
    'panic-line-ambiguous-threat': {
      title:'Panicked caller with unclear threat', severity:'High priority', district:'Liberdade', opening:'190, what is your emergency?',
      callerOpening:'I need help. Someone is following me. I went inside a store, but he is standing outside watching.',
      facts:['Threat not yet confirmed','Caller is in a public place','Possible stalking or harassment'], contradictions:['The caller alternates between saying she knows and does not know the suspect.'],
      events:[['ANA: He is pacing outside the door. I am shaking.',5],['SYSTEM: High psychological risk; physical threat remains unconfirmed.',3]],
      replies:{ location:'Liberdade, near a store with a red storefront. I do not know the number.', victims:'Only me. Nobody is injured.', weapon:'I did not see a weapon, but he put his hand inside his jacket several times.', suspect:'Tall man, black jacket, backpack. He may be intoxicated.', safety:'I will stay inside the store, away from the door, and speak quietly.' }, chips:['Public place','Unclear threat','Victim support']
    },
    'kidnapping-attempt-school': {
      title:'Attempted abduction outside a school', severity:'Critical priority', district:'Tatuapé', opening:'190, what is your emergency?',
      callerOpening:'A man is trying to force a girl into a car. Her mother is screaming. It is in front of the school.',
      facts:['Child in immediate danger','Vehicle still near the scene','Multiple panicked witnesses'], contradictions:['Witnesses report two different vehicle colors; partial plate is uncertain.'],
      events:[['PATRÍCIA: The car reversed. I think he will try to leave through the side street.',7],['SYSTEM: Critical route-blocking window. Prioritize containment and victim protection.',11]],
      replies:{ location:'On the school street, near a small market. Tatuapé, a narrow street with many parked cars.', victims:'The girl is crying, but her mother is holding her. Nobody appears injured yet.', weapon:'I did not see a weapon. He was pulling the child by the arm.', suspect:'Man in a dark cap, small silver car. The plate ends in 8 or B, I am not sure.', safety:'I will keep my distance, stay inside the school and stop people from surrounding the car.' }, chips:['School','Route blockade','Air search indicated']
    },
    'shots-fired-bar': {
      title:'Shots fired at crowded bar', severity:'Critical priority', district:'Pinheiros', opening:'190, what is your emergency?',
      callerOpening:'I heard shots inside a bar. Everyone ran out. There are people down on the sidewalk.',
      facts:['Possible gunshot victims','Crowded location','Shooter may still be armed'], contradictions:['The caller does not know whether the shooter left or is hiding inside.'],
      events:[['DIEGO: A woman is bleeding near the entrance. Nobody can reach her.',9],['SYSTEM: Risk of a second confrontation increased. Establish a perimeter and request medical support.',10]],
      replies:{ location:'Pinheiros, near the main avenue, a corner bar with tables on the sidewalk.', victims:'I saw two people down. I do not know whether they are conscious.', weapon:'There were several shots. It sounded like a firearm, at least four shots.', suspect:'A man in a black jacket ran into a side street, but I am not sure he was the shooter.', safety:'I am behind a car, away from the entrance. I will keep the line open.' }, chips:['Shots fired','Urgent EMS','Perimeter']
    },
    'noise-party-threat': {
      title:'Noise complaint with neighbor threat', severity:'Medium priority', district:'Mooca', opening:'190, what is your emergency?',
      callerOpening:'There is a very loud party and one neighbor threatened another with a bottle. Everyone is shouting in the hallway.',
      facts:['Conflict between neighbors','Possible imminent assault','Shared residential environment'], contradictions:['The caller does not know whether there was an assault or only a verbal threat.'],
      events:[['SUELI: I just heard glass breaking in the hallway. I am not leaving my apartment.',7],['SYSTEM: The incident may escalate to physical violence if mediation is delayed.',5]],
      replies:{ location:'Mooca, an old apartment building, third floor. The doorman can identify the apartment.', victims:'Apparently nobody is injured, but many people are agitated.', weapon:'I saw a bottle in one person’s hand, not a firearm.', suspect:'Resident from the rear apartment, red shirt, intoxicated.', safety:'I will stay inside my apartment and will not open the door.' }, chips:['Apartment building','Conflict','Mediation']
    },
    'morning-school-traffic': {
      title:'Pedestrian struck near a school', severity:'High priority', district:'Santana', opening:'190, what is your emergency?',
      callerOpening:'A child was hit near the crosswalk. The driver stopped, but many people surrounded the car.',
      facts:['Minor victim','School-hour traffic','Crowd at the scene'], contradictions:['Witnesses disagree whether the vehicle ran the light or the child ran into the street.'],
      events:[['EDSON: The child is crying but does not want to stand. Traffic is completely blocked.',7],['SYSTEM: Risk of a secondary collision increased due to the crowd in the road.',6]],
      replies:{ location:'Santana, on the school street, near a bakery and the crosswalk.', victims:'One child on the ground and a teacher trying to calm them. I do not see heavy bleeding.', weapon:'There is no weapon. The danger is traffic and the crowd in the road.', suspect:'The driver stayed at the scene. White car. The driver appears nervous.', safety:'I will move people away from traffic and tell them not to move the child.' }, chips:['School','EMS','Traffic']
    }
  },
  'es-419': {
    'domestic-weapon-risk': {
      title:'Violencia doméstica con riesgo de arma', severity:'Prioridad crítica', district:'Itaquera', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Mi pareja está rompiendo todo. Bebió, tomó un cuchillo y dijo que nadie va a salir.',
      facts:['Dirección inicial incompleta','Posible arma blanca','Solicitante emocionalmente alterada'], contradictions:['Primero dice estar sola y luego menciona a un niño en la habitación.'],
      events:[['SISTEMA: Se detecta ruido fuerte en la llamada. La solicitante se aleja del teléfono.',6],['MARINA: Está intentando abrir la puerta. Mi hijo está aquí conmigo.',10]],
      replies:{ location:'Una calle pequeña cerca de la estación Dom Bosco... no sé el número. Hay una farmacia en la esquina.', victims:'Mi hijo está conmigo. No está herido, pero llora mucho.', weapon:'Vi un cuchillo en su mano. No escuché disparos, solo golpes en la puerta.', suspect:'Camisa gris, pantalón corto negro. Está dentro de la casa, en la sala.', safety:'Estoy encerrada en la habitación. Me alejaré de la puerta y mantendré la línea abierta.' }, chips:['Residencia','Riesgo interno','Acceso estrecho']
    },
    'armed-robbery-escape': {
      title:'Robo armado con fuga en vehículo', severity:'Prioridad crítica', district:'Sé', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Un auto acaba de huir después de un robo. Creo que los sospechosos están armados. Fue muy rápido.',
      facts:['Vehículo sospechoso en movimiento','Información parcial de la placa','Posible arma de fuego'], contradictions:['El solicitante confunde el color entre negro y azul oscuro.'],
      events:[['CARLOS: Giraron hacia el centro histórico. Creo que había más de una persona en el auto.',4],['SISTEMA: Ventana de contención reducida. Puede perderse el contacto visual.',8]],
      replies:{ location:'Zona de Sé, cerca de una salida estrecha, rumbo al centro histórico.', victims:'El guardia cayó, pero se levantó. No sé si está herido.', weapon:'Uno apuntó un arma. No sé si era revólver o pistola.', suspect:'Auto oscuro, la placa quizá termina en 47. Dos hombres, uno con gorra.', safety:'Estoy lejos, al otro lado de la calle. No intentaré seguirlos.' }, chips:['Rutas múltiples','Búsqueda aérea recomendada','Tránsito moderado']
    },
    'collision-victims-fuel': {
      title:'Colisión grave con víctima atrapada', severity:'Prioridad alta', district:'Bela Vista', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Hubo un choque fuerte. Una persona está atrapada en el auto y no responde. Hay olor a combustible.',
      facts:['Víctima atrapada en vehículo','Posible fuga de combustible','Vía con tránsito intenso'], contradictions:['El solicitante no sabe si la víctima está inconsciente o en choque.'],
      events:[['RENATO: El tránsito se está deteniendo y la gente se acerca demasiado al auto.',5],['SISTEMA: Riesgo secundario aumentado por la multitud y el combustible.',8]],
      replies:{ location:'Cerca de la avenida Paulista, en Bela Vista, cruce concurrido antes del semáforo.', victims:'Una persona atrapada y otra con un corte en la cara. Nadie dirige el tránsito.', weapon:'No hay arma. El problema es el combustible y la víctima atrapada.', suspect:'No hay sospechoso. Son dos autos, uno plateado y otro blanco.', safety:'Alejaré a la gente y no dejaré que nadie fume cerca.' }, chips:['Cierre de vía necesario','SAMU recomendado','Riesgo secundario']
    },
    'panic-line-ambiguous-threat': {
      title:'Llamada de pánico con amenaza indefinida', severity:'Prioridad alta', district:'Liberdade', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Necesito ayuda. Alguien me sigue. Entré en un comercio, pero se quedó afuera mirando.',
      facts:['Amenaza aún no confirmada','Solicitante en lugar público','Posible persecución o acoso'], contradictions:['La solicitante alterna entre decir que conoce y no conoce al sospechoso.'],
      events:[['ANA: Camina de un lado a otro frente a la puerta. Estoy temblando.',5],['SISTEMA: Riesgo psicológico alto; amenaza física aún no confirmada.',3]],
      replies:{ location:'Liberdade, cerca de una tienda con fachada roja. No sé el número.', victims:'Solo yo. Nadie está herido.', weapon:'No vi un arma, pero metió la mano dentro de la chaqueta varias veces.', suspect:'Hombre alto, chaqueta negra, mochila. Puede estar alcoholizado.', safety:'Me quedaré dentro de la tienda, lejos de la puerta, y hablaré bajo.' }, chips:['Lugar público','Amenaza incierta','Apoyo a la víctima']
    },
    'kidnapping-attempt-school': {
      title:'Intento de secuestro frente a una escuela', severity:'Prioridad crítica', district:'Tatuapé', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Un hombre intenta meter a una niña en un auto. La madre está gritando. Es frente a la escuela.',
      facts:['Niña en peligro inmediato','Vehículo todavía cerca','Múltiples testigos en pánico'], contradictions:['Los testigos mencionan dos colores diferentes; la placa parcial es incierta.'],
      events:[['PATRÍCIA: El auto retrocedió. Creo que intentará salir por la calle lateral.',7],['SISTEMA: Tiempo crítico para bloquear la ruta. Priorizar contención y protección de la víctima.',11]],
      replies:{ location:'En la calle de la escuela, cerca de un mercado pequeño. Tatuapé, calle estrecha con muchos autos estacionados.', victims:'La niña está llorando, pero la madre la sostiene. Nadie parece herido todavía.', weapon:'No vi un arma. Estaba jalando a la niña del brazo.', suspect:'Hombre con gorra oscura, auto plateado pequeño. La placa termina en 8 o B, no estoy segura.', safety:'Mantendré distancia, entraré en la escuela y evitaré que la gente rodee el auto.' }, chips:['Escuela','Bloqueo de ruta','Búsqueda aérea indicada']
    },
    'shots-fired-bar': {
      title:'Disparos en bar con multitud', severity:'Prioridad crítica', district:'Pinheiros', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Escuché disparos dentro de un bar. Todos salieron corriendo. Hay personas caídas en la acera.',
      facts:['Posibles víctimas de arma de fuego','Lugar concurrido','El autor puede seguir armado'], contradictions:['El solicitante no sabe si el tirador salió o está escondido dentro.'],
      events:[['DIEGO: Hay una mujer sangrando cerca de la puerta. Nadie logra acercarse.',9],['SISTEMA: Aumentó el riesgo de un segundo enfrentamiento. Solicitar perímetro y apoyo médico.',10]],
      replies:{ location:'Pinheiros, cerca de la avenida principal, bar de esquina con mesas en la acera.', victims:'Vi dos personas caídas. No sé si están conscientes.', weapon:'Fueron varios disparos. Parece arma de fuego, escuché al menos cuatro.', suspect:'Un hombre con chaqueta negra corrió hacia una calle lateral, pero no sé si era él.', safety:'Estoy detrás de un auto, lejos de la entrada. Mantendré la línea abierta.' }, chips:['Disparos','SAMU urgente','Perímetro']
    },
    'noise-party-threat': {
      title:'Ruido y amenaza entre vecinos', severity:'Prioridad media', district:'Mooca', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Hay una fiesta muy ruidosa y un vecino amenazó a otro con una botella. Todos gritan en el pasillo.',
      facts:['Conflicto entre vecinos','Posible agresión inminente','Ambiente residencial compartido'], contradictions:['La solicitante no sabe si hubo agresión o solo amenaza verbal.'],
      events:[['SUELI: Acabo de escuchar vidrio romperse en el pasillo. No saldré de mi casa.',7],['SISTEMA: El incidente puede escalar a violencia física si demora la mediación.',5]],
      replies:{ location:'Mooca, edificio antiguo, tercer piso. El portero puede indicar el departamento.', victims:'Aparentemente nadie está herido, pero hay mucha gente alterada.', weapon:'Vi una botella en la mano de uno, no un arma de fuego.', suspect:'Vecino del departamento del fondo, camiseta roja, alcoholizado.', safety:'Me quedaré dentro de mi departamento y no abriré la puerta.' }, chips:['Edificio','Conflicto','Mediación']
    },
    'morning-school-traffic': {
      title:'Atropello cerca de una escuela', severity:'Prioridad alta', district:'Santana', opening:'190, ¿cuál es su emergencia?',
      callerOpening:'Un niño fue atropellado cerca del cruce peatonal. El conductor se detuvo, pero mucha gente rodeó el auto.',
      facts:['Víctima menor de edad','Tránsito en horario escolar','Multitud en el lugar'], contradictions:['Los testigos discrepan si el auto pasó el semáforo o si el niño corrió.'],
      events:[['EDSON: El niño llora, pero no quiere levantarse. El tránsito quedó bloqueado.',7],['SISTEMA: Aumentó el riesgo de otro accidente por la multitud en la vía.',6]],
      replies:{ location:'Santana, calle de la escuela, cerca de una panadería y del cruce peatonal.', victims:'Un niño en el suelo y una maestra intentando calmarlo. No veo sangrado intenso.', weapon:'No hay arma. El riesgo es el tránsito y la gente en la calle.', suspect:'El conductor se quedó en el lugar. Auto blanco. Parece nervioso.', safety:'Alejaré a las personas de la vía y pediré que no muevan al niño.' }, chips:['Escuela','SAMU','Tránsito']
    }
  }
});

function translatedEvent(base, tuple) {
  return { ...base, text: tuple?.[0] ?? base.text, risk: tuple?.[1] ?? base.risk };
}

export function localizeGameContent({ avatars, ranks, units, incidents, protocolQuestions }, locale) {
  const selected = SHARED[locale] || SHARED['pt-BR'];
  if (locale === 'pt-BR') return {
    avatars: avatars.map((item, index) => ({ ...item, name: selected.avatars[index] || item.name })),
    ranks: ranks.map((item, index) => ({ ...item, title: selected.ranks[index] || item.title })),
    units: units.map((item) => ({ ...item, name: selected.units[item.id]?.[0] || item.name, description: selected.units[item.id]?.[1] || item.description })),
    protocolQuestions: protocolQuestions.map((item) => ({ ...item, label: selected.questions[item.id]?.[0] || item.label, prompt: selected.questions[item.id]?.[1] || item.prompt, protocol: selected.questions[item.id]?.[2] || item.protocol })),
    incidents: incidents.map((item) => ({ ...item }))
  };
  const incidentSet = INCIDENTS[locale] || {};
  return {
    avatars: avatars.map((item, index) => ({ ...item, name: selected.avatars[index] || item.name })),
    ranks: ranks.map((item, index) => ({ ...item, title: selected.ranks[index] || item.title })),
    units: units.map((item) => ({ ...item, name: selected.units[item.id]?.[0] || item.name, description: selected.units[item.id]?.[1] || item.description })),
    protocolQuestions: protocolQuestions.map((item) => ({ ...item, label: selected.questions[item.id]?.[0] || item.label, prompt: selected.questions[item.id]?.[1] || item.prompt, protocol: selected.questions[item.id]?.[2] || item.protocol })),
    incidents: incidents.map((item) => {
      const tr = incidentSet[item.id];
      if (!tr) return { ...item };
      return {
        ...item, title: tr.title, severity: tr.severity, district: tr.district, opening: tr.opening,
        callerOpening: tr.callerOpening, facts: tr.facts, contradictions: tr.contradictions,
        events: item.events.map((event, index) => translatedEvent(event, tr.events[index])),
        questionReplies: { ...item.questionReplies, ...tr.replies }, mapChips: tr.chips
      };
    })
  };
}

export function validateContentTranslations(baseContent, locales = ['pt-BR','en-US','es-419']) {
  const missing = [];
  for (const locale of locales) {
    const localized = localizeGameContent(baseContent, locale);
    if (localized.avatars.length !== baseContent.avatars.length) missing.push(`${locale}:avatars`);
    if (localized.ranks.length !== baseContent.ranks.length) missing.push(`${locale}:ranks`);
    if (localized.units.length !== baseContent.units.length) missing.push(`${locale}:units`);
    if (localized.protocolQuestions.length !== baseContent.protocolQuestions.length) missing.push(`${locale}:questions`);
    for (const incident of localized.incidents) {
      if (!incident.title || !incident.opening || !incident.callerOpening || !incident.facts?.length || !incident.mapChips?.length) missing.push(`${locale}:${incident.id}`);
      for (const id of incident.idealQuestions || []) if (!incident.questionReplies?.[id]) missing.push(`${locale}:${incident.id}:${id}`);
    }
  }
  return Object.freeze({ ok: missing.length === 0, missing, locales: locales.length, incidents: baseContent.incidents.length });
}
