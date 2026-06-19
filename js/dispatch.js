window.C190_Dispatch = (() => {
  "use strict";

  const good = (text, xp = 120, rep = 2) => ({ text, q: 2, xp, rep });
  const weak = (text, xp = 35, rep = -2) => ({ text, q: -1, xp, rep });
  const bad = (text, rep = -5) => ({ text, q: -3, xp: 0, rep });

  const templates = [
    { id: "threat_street", type: "Ameaça em via pública", category: "protection", tags: ["urban"], priority: 3, location: "Rua das Palmeiras", summary: "Solicitante relata ameaça e agressor próximo.", choices: [good("Confirmar local, características e risco imediato; acionar viatura prioritária.", 150), weak("Registrar sem confirmar presença do agressor."), bad("Orientar que confronte o agressor antes do envio da equipe.")] },
    { id: "domestic_silent", type: "Violência doméstica — ligação silenciosa", category: "protection", tags: ["domestic", "urban"], priority: 3, location: "Jardim Aurora", summary: "A vítima fala baixo e informa que o agressor está no imóvel.", choices: [good("Usar perguntas fechadas, confirmar risco, manter linha segura e despachar apoio.", 170, 3), weak("Solicitar relato longo antes de qualquer despacho.", 40, -3), bad("Pedir que confronte o agressor para confirmar a denúncia.", -7)] },
    { id: "traffic_victim", type: "Acidente com vítima", category: "traffic", tags: ["traffic"], priority: 3, location: "Avenida Central", summary: "Colisão entre dois veículos; uma pessoa não responde.", choices: [good("Confirmar segurança da cena, estado da vítima e acionar resgate e trânsito.", 160), weak("Enviar apenas uma viatura sem coletar dados médicos.", 55), bad("Orientar a remoção imediata da vítima por populares.")] },
    { id: "noise", type: "Perturbação do sossego", category: "community", tags: ["neighborhood", "urban"], priority: 1, location: "Vila Nova", summary: "Som alto recorrente durante a madrugada.", choices: [good("Registrar endereço, recorrência e risco; despachar conforme prioridade.", 95, 1), weak("Encerrar por não ser emergência.", 30, -1), weak("Tratar como prioridade máxima ignorando a fila crítica.", 35, -2)] },
    { id: "missing_teen", type: "Pessoa desaparecida", category: "protection", tags: ["urban", "remote"], priority: 2, location: "Parque Municipal", summary: "Família procura adolescente desaparecido há algumas horas.", choices: [good("Coletar descrição, último local, vulnerabilidades e acionar protocolo de busca.", 135), bad("Mandar aguardar 24 horas antes de registrar.", -6), weak("Registrar apenas nome e telefone.", 40)] },
    { id: "robbery_live", type: "Roubo em andamento", category: "critical", tags: ["urban", "tourism"], priority: 3, location: "Mercado Popular", summary: "Funcionário relata suspeito armado dentro do comércio.", choices: [good("Manter o solicitante em segurança, obter descrição discreta e acionar resposta imediata.", 180, 3), bad("Pedir que tente impedir a fuga.", -7), weak("Colocar em espera sem confirmar risco.", 20, -4)] },
    { id: "animal_road", type: "Animal em risco na via", category: "community", tags: ["traffic", "remote"], priority: 1, location: "Estrada do Norte", summary: "Animal ferido bloqueia parcialmente o trânsito.", choices: [good("Avaliar risco viário, orientar sinalização e acionar serviço competente.", 80, 1), weak("Ignorar por não envolver pessoa.", 25, -1), bad("Mandar o solicitante retirar o animal sem segurança.", -3)] },
    { id: "neighbors", type: "Conflito entre vizinhos", category: "community", tags: ["neighborhood", "urban"], priority: 2, location: "Conjunto Esperança", summary: "Discussão intensa com possível dano ao portão.", choices: [good("Separar fatos, verificar armas ou feridos e despachar conforme risco.", 110, 1), bad("Tomar partido de um dos envolvidos.", -4), bad("Classificar como trote sem verificação.", -3)] },
    { id: "child_risk", type: "Criança em situação de risco", category: "protection", tags: ["domestic", "urban"], priority: 3, location: "Residencial Horizonte", summary: "Vizinha ouve pedidos de socorro de uma criança em apartamento próximo.", choices: [good("Confirmar endereço, risco imediato e presença do responsável; acionar proteção e viatura.", 175, 3), weak("Pedir que a vizinha entre no imóvel.", 25, -4), bad("Encerrar por falta de identificação da criança.", -6)] },
    { id: "weapon_report", type: "Pessoa armada", category: "critical", tags: ["urban"], priority: 3, location: "Praça da Estação", summary: "Diversos solicitantes relatam uma pessoa exibindo arma.", choices: [good("Cruzar descrições, orientar abrigo e despachar equipes com alerta de risco.", 185, 3), weak("Divulgar pelo telefone que a polícia está chegando.", 30, -3), bad("Mandar um solicitante seguir o suspeito.", -7)] },
    { id: "domestic_return", type: "Retorno à violência doméstica", category: "protection", tags: ["domestic"], priority: 3, location: "Rua do Ipê", summary: "A ligação cai e retorna; a vítima usa uma palavra-código combinada.", choices: [good("Reconhecer o código, manter comunicação mínima e atualizar imediatamente as equipes.", 190, 4), weak("Solicitar confirmação verbal detalhada do perigo.", 35, -4), bad("Cancelar o despacho porque a primeira ligação caiu.", -8)] },
    { id: "flood_vehicle", type: "Veículo preso em alagamento", category: "weather", tags: ["flood", "weather"], priority: 3, location: "Avenida Beira Rio", summary: "Família está dentro de um veículo com a água subindo.", choices: [good("Orientar abandono seguro somente se viável, manter contato e acionar resgate especializado.", 190, 3), weak("Pedir que tentem atravessar o trecho alagado.", 20, -5), bad("Aguardar a água baixar antes de registrar.", -7)] },
    { id: "power_outage", type: "Queda de energia em grande área", category: "infrastructure", tags: ["weather", "urban"], priority: 2, location: "Setor Norte", summary: "Semáforos e iluminação pública estão inoperantes em vários bairros.", choices: [good("Mapear pontos críticos, informar trânsito e concessionária e priorizar riscos à vida.", 145, 2), weak("Registrar cada ligação sem consolidar o incidente.", 40, -2), bad("Ignorar por ser responsabilidade exclusiva da concessionária.", -5)] },
    { id: "tree_road", type: "Árvore caída sobre a via", category: "weather", tags: ["weather", "traffic"], priority: 2, location: "Rua das Acácias", summary: "Árvore bloqueia a via e há fios próximos ao solo.", choices: [good("Isolar o risco, impedir aproximação e acionar trânsito, energia e defesa civil.", 140, 2), weak("Orientar moradores a cortar galhos.", 25, -4), bad("Classificar como baixa prioridade sem perguntar sobre fios.", -5)] },
    { id: "missing_flood", type: "Pessoa levada pela correnteza", category: "weather", tags: ["flood", "river"], priority: 3, location: "Canal do Leste", summary: "Testemunha perdeu de vista uma pessoa durante enxurrada.", choices: [good("Fixar último ponto visto, descrição e sentido da correnteza; acionar busca e resgate.", 200, 4), weak("Pedir que a testemunha entre na água para procurar.", 20, -6), bad("Esperar confirmação por outra ligação.", -8)] },
    { id: "event_crowd", type: "Compressão de multidão", category: "event", tags: ["event", "tourism"], priority: 3, location: "Portão Leste do Estádio", summary: "Torcedores informam empurra-empurra e pessoas caídas.", choices: [good("Identificar o portão, interromper fluxo, acionar equipes médicas e segurança do evento.", 190, 3), weak("Orientar a multidão a correr para outra saída.", 20, -5), bad("Aguardar o organizador confirmar antes de despachar.", -7)] },
    { id: "missing_child", type: "Criança perdida em evento", category: "event", tags: ["event", "tourism"], priority: 2, location: "Setor de Alimentação", summary: "Responsável perdeu uma criança de sete anos em área lotada.", choices: [good("Coletar descrição imediata, último ponto e acionar protocolo interno sem expor dados sensíveis.", 145, 2), weak("Mandar o responsável procurar sozinho.", 30, -3), bad("Pedir que publique dados completos nas redes sociais.", -5)] },
    { id: "fight_event", type: "Briga generalizada", category: "event", tags: ["event", "urban"], priority: 3, location: "Acesso Sul", summary: "Grupos entram em confronto e há relato de objetos arremessados.", choices: [good("Dimensionar grupos, verificar armas e feridos e coordenar reforço e rota de acesso.", 180, 3), weak("Enviar uma única equipe sem contexto.", 40, -3), bad("Orientar um solicitante a filmar de perto.", -6)] },
    { id: "medical_event", type: "Emergência médica em evento", category: "event", tags: ["event"], priority: 3, location: "Arquibancada Central", summary: "Pessoa inconsciente em meio à arquibancada lotada.", choices: [good("Fixar setor e fileira, abrir corredor e acionar equipe médica com apoio de segurança.", 175, 3), weak("Pedir que carreguem a pessoa pela multidão sem avaliação.", 25, -4), bad("Transferir a ligação sem registrar a localização.", -6)] },
    { id: "traffic_event", type: "Bloqueio viário após evento", category: "traffic", tags: ["event", "traffic"], priority: 2, location: "Viaduto do Estádio", summary: "Ônibus parado bloqueia duas faixas durante a saída do público.", choices: [good("Confirmar risco, organizar desvio e acionar trânsito e remoção.", 125, 2), weak("Orientar motoristas a usar a contramão.", 20, -4), bad("Ignorar até o fim do evento.", -4)] },
    { id: "bank_alarm", type: "Alarme bancário confirmado", category: "critical", tags: ["urban", "government"], priority: 3, location: "Agência Central", summary: "Monitoramento confirma pessoas armadas dentro da agência.", choices: [good("Preservar canal discreto, confirmar acessos e acionar protocolo de cerco sem alertar suspeitos.", 210, 4), weak("Telefonar para a agência e perguntar pelos suspeitos.", 20, -6), bad("Divulgar pelo rádio aberto dados sensíveis de reféns.", -8)] },
    { id: "hostage_report", type: "Possível situação com reféns", category: "critical", tags: ["urban"], priority: 3, location: "Rua do Comércio", summary: "Mensagem curta indica clientes retidos e pelo menos dois suspeitos.", choices: [good("Validar sinais sem expor a fonte, atualizar comando e acionar negociação especializada.", 220, 4), weak("Solicitar que o informante confronte os suspeitos.", 15, -7), bad("Tratar como informação não confirmada e encerrar.", -8)] },
    { id: "suspect_vehicle", type: "Veículo suspeito em fuga", category: "critical", tags: ["traffic", "urban"], priority: 3, location: "Avenida do Contorno", summary: "Veículo com características ligadas à ocorrência deixa a região em alta velocidade.", choices: [good("Registrar direção, placas parciais e riscos, distribuindo alerta sem incentivar perseguição civil.", 180, 3), weak("Pedir ao solicitante que acompanhe o veículo.", 20, -6), bad("Bloquear todas as vias sem coordenação.", -5)] },
    { id: "perimeter_conflict", type: "Conflito no perímetro", category: "critical", tags: ["urban"], priority: 2, location: "Perímetro Oeste", summary: "Familiares e imprensa aproximam-se da área isolada.", choices: [good("Separar áreas, preservar acesso de emergência e solicitar equipe para controle seguro.", 155, 2), weak("Liberar acesso para obter informações.", 35, -4), bad("Retirar todo o isolamento sem ordem de comando.", -6)] },
    { id: "negotiation_update", type: "Atualização de negociação", category: "critical", tags: ["urban"], priority: 3, location: "Comando Avançado", summary: "Negociador solicita histórico objetivo das ligações e mudanças de comportamento.", choices: [good("Consolidar cronologia, fontes e sinais de risco sem interpretações não confirmadas.", 230, 4), weak("Transmitir rumores junto com os fatos.", 40, -4), bad("Omitir chamadas anteriores para agilizar o relatório.", -7)] },
    { id: "elevator_trapped", type: "Pessoas presas em elevador", category: "infrastructure", tags: ["urban"], priority: 2, location: "Edifício República", summary: "Quatro pessoas, incluindo idoso, estão presas durante apagão.", choices: [good("Confirmar ventilação e sintomas, impedir tentativa de saída e acionar resgate técnico.", 150, 2), weak("Orientar que forcem as portas.", 20, -5), bad("Aguardar o retorno da energia sem avaliar saúde.", -6)] },
    { id: "traffic_blackout", type: "Semáforos apagados", category: "infrastructure", tags: ["traffic", "urban"], priority: 2, location: "Cruzamento Metropolitano", summary: "Colisões leves começam a ocorrer em cruzamento de alto fluxo.", choices: [good("Priorizar o cruzamento, acionar trânsito e verificar vítimas e bloqueios.", 140, 2), weak("Mandar condutores resolverem entre si.", 25, -3), bad("Classificar todas as chamadas como duplicadas sem registrar agravamento.", -5)] },
    { id: "hospital_generator", type: "Falha de gerador hospitalar", category: "infrastructure", tags: ["urban", "government"], priority: 3, location: "Hospital Municipal", summary: "Hospital relata instabilidade no gerador e pacientes dependentes de equipamentos.", choices: [good("Elevar prioridade, acionar energia, defesa civil e coordenação médica, preservando vias de acesso.", 230, 4), weak("Orientar apenas contato com a concessionária.", 25, -6), bad("Aguardar confirmação de interrupção total.", -8)] },
    { id: "looting_risk", type: "Risco de saque durante apagão", category: "protection", tags: ["urban"], priority: 2, location: "Centro Comercial", summary: "Comerciantes relatam grupo forçando portas em rua sem iluminação.", choices: [good("Confirmar quantidade, risco e localização, orientar abrigo e despachar patrulhamento coordenado.", 165, 3), weak("Pedir aos comerciantes que enfrentem o grupo.", 20, -6), bad("Ignorar por não haver furto consumado.", -5)] },
    { id: "fire_electrical", type: "Incêndio elétrico", category: "infrastructure", tags: ["urban", "weather"], priority: 3, location: "Subestação Leste", summary: "Fumaça intensa e estalos são vistos em instalação elétrica.", choices: [good("Estabelecer distância segura, acionar bombeiros e concessionária e alertar sobre energização.", 210, 4), weak("Orientar populares a usar água.", 10, -8), bad("Enviar equipe sem informar risco elétrico.", -7)] },
    { id: "river_boat", type: "Embarcação à deriva", category: "remote", tags: ["river", "remote"], priority: 3, location: "Encontro das Águas", summary: "Pequena embarcação perdeu motor e aproxima-se de área de correnteza forte.", choices: [good("Fixar posição, número de pessoas e coletes, mantendo contato e acionando resgate fluvial.", 190, 3), weak("Orientar que todos entrem na água.", 15, -7), bad("Aguardar a embarcação chegar à margem sozinha.", -6)] },
    { id: "hills_slide", type: "Risco de deslizamento", category: "weather", tags: ["hills", "weather"], priority: 3, location: "Encosta da Liberdade", summary: "Moradores relatam rachaduras e movimento de terra após chuva forte.", choices: [good("Orientar saída segura sem retorno ao imóvel e acionar defesa civil e apoio de emergência.", 195, 4), weak("Pedir que verifiquem a rachadura de perto.", 15, -7), bad("Aguardar deslizamento confirmado para registrar.", -8)] },
  ];

  function operationalCenter(state) {
    const saved = state?.settings?.mapCenter || window.C190_Map?.DEFAULT_CENTER || { lat: -23.55052, lng: -46.63331, label: "São Paulo — SP" };
    return { lat: Number(saved.lat) || -23.55052, lng: Number(saved.lng) || -46.63331, label: saved.label || "São Paulo — SP" };
  }

  function randomCoordinate(center, index) {
    const angle = Math.random() * Math.PI * 2 + index * 1.37;
    const distance = 0.006 + Math.random() * 0.03;
    const lat = center.lat + Math.sin(angle) * distance;
    const lng = center.lng + (Math.cos(angle) * distance) / Math.max(0.35, Math.cos((center.lat * Math.PI) / 180));
    return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
  }

  function makeCall(template, index, center, arrivalGap) {
    const coordinate = randomCoordinate(center, index);
    const call = {
      ...JSON.parse(JSON.stringify(template)),
      templateId: template.id,
      id: `C${Date.now()}-${index}-${Math.floor(Math.random() * 9999)}`,
      ...coordinate,
      region: center.label,
      status: "scheduled",
      wait: 0,
      arrivesAt: index === 0 ? 0 : index * arrivalGap,
      createdAt: new Date().toISOString(),
      attempts: 0,
      locationRevealed: false,
    };
    window.C190_CallProtocol?.normalize?.(call);
    window.C190_LocationIntel?.normalize?.(call);
    window.C190_Triage?.normalize?.(call);
    return call;
  }

  function ensureCoordinates(state) {
    const center = operationalCenter(state);
    const calls = state?.dispatch?.shift?.calls || [];
    calls.forEach((call, index) => {
      if (!Number.isFinite(Number(call.lat)) || !Number.isFinite(Number(call.lng))) {
        Object.assign(call, randomCoordinate(center, index));
        call.region = call.region || center.label;
      }
      window.C190_CallProtocol?.normalize?.(call);
      window.C190_LocationIntel?.normalize?.(call);
      window.C190_Triage?.normalize?.(call);
    });
  }

  function shuffle(list) {
    return [...list].sort(() => Math.random() - 0.5);
  }

  function candidateTemplates(options = {}) {
    if (Array.isArray(options.templateIds) && options.templateIds.length) {
      return options.templateIds.map((id) => templates.find((item) => item.id === id)).filter(Boolean);
    }
    let pool = [...templates];
    const city = window.C190_Content?.cityById(options.cityId || "sp");
    if (city?.tags?.length) {
      const preferred = pool.filter((item) => item.tags?.some((tag) => city.tags.includes(tag)));
      pool = [...preferred, ...preferred, ...pool.filter((item) => !preferred.includes(item))];
    }
    if (options.templateSet && options.templateSet !== "all") {
      const filtered = pool.filter((item) => item.category === options.templateSet || item.tags?.includes(options.templateSet));
      if (filtered.length) pool = filtered;
    }
    if (options.priorityMix && options.priorityMix !== "mixed") {
      const target = options.priorityMix === "critical" ? 3 : options.priorityMix === "high" ? 2 : 1;
      const filtered = pool.filter((item) => item.priority === target);
      if (filtered.length) pool = filtered;
    }
    return pool;
  }

  function startShift(state, options = {}) {
    if (state.dispatch.shift?.active) return null;
    window.C190_Content?.normalize(state);
    const center = operationalCenter(state);
    const callCount = Math.max(1, Math.min(12, Number(options.callCount || 3)));
    const balance = window.C190_Release?.shiftBalance?.(state, options) || {
      difficulty: state.profile?.difficulty || "realista",
      difficultyLabel: state.profile?.difficulty || "Realista",
      arrivalGap: Math.max(4, Math.min(40, Number(options.arrivalGap || 18))),
      escalationAt: 30,
      abandonLimit: 78,
      balanceVersion: 1,
    };
    const arrivalGap = balance.arrivalGap;
    let pool = candidateTemplates(options);
    if (!pool.length) pool = templates;
    let chosen = [];
    while (chosen.length < callCount) chosen.push(...shuffle(pool));
    chosen = chosen.slice(0, callCount).map((template, index) => makeCall(template, index, center, arrivalGap));

    state.dispatch.shift = {
      active: true,
      startedAt: new Date().toISOString(),
      elapsed: 0,
      calls: chosen,
      activeCallId: null,
      resolved: 0,
      failed: 0,
      abandoned: 0,
      qualityTotal: 0,
      events: [],
      mode: options.mode || "career",
      modeLabel: options.label || "Plantão de carreira",
      cityId: options.cityId || state.content?.activeCityId || "sp",
      affectsCareer: options.affectsCareer !== false,
      penalties: options.penalties !== false,
      specialId: options.specialId || null,
      challengeKind: options.challengeKind || null,
      arrivalGap,
      escalationAt: balance.escalationAt,
      abandonLimit: balance.abandonLimit,
      difficulty: balance.difficulty,
      difficultyLabel: balance.difficultyLabel,
      balanceVersion: balance.balanceVersion,
    };
    return state.dispatch.shift;
  }

  function tick(state) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return;
    ensureCoordinates(state);
    shift.elapsed++;
    shift.calls.forEach((call) => {
      if (call.status === "scheduled" && shift.elapsed >= call.arrivesAt) {
        call.status = "waiting";
        shift.events.unshift({ at: new Date().toISOString(), text: `Nova chamada: ${call.type}` });
      }
      if (call.status === "waiting") {
        call.wait++;
        if (call.wait === Number(shift.escalationAt || 30)) call.priority = Math.min(3, call.priority + 1);
        const abandonLimit = Number(shift.abandonLimit || (shift.mode === "sandbox" ? Math.max(72, shift.arrivalGap * 8) : 78));
        if (call.wait >= abandonLimit) {
          call.status = "abandoned";
          shift.abandoned++;
          if (shift.affectsCareer) {
            window.C190_Career.applyOutcome(state, { quality: -2, xp: 0, rep: -4, abandoned: true, reason: `Chamada abandonada após ${call.wait}s: ${call.type}` });
          }
        }
      }
    });
    const done = shift.calls.every((call) => ["resolved", "failed", "abandoned"].includes(call.status));
    if (done && !shift.activeCallId) finishShift(state);
  }

  function answer(state, id) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return false;
    const call = shift.calls.find((item) => item.id === id);
    if (!call || !["waiting", "paused"].includes(call.status)) return false;
    if (shift.activeCallId) {
      const active = shift.calls.find((item) => item.id === shift.activeCallId);
      if (active) {
        active.status = "paused";
        active.pausedAt = new Date().toISOString();
      }
    }
    call.status = "active";
    call.attempts++;
    window.C190_CallProtocol?.normalize?.(call);
    window.C190_LocationIntel?.normalize?.(call);
    window.C190_Triage?.normalize?.(call);
    window.C190_ResourceDispatch?.normalize?.(call);
    shift.activeCallId = id;
    return true;
  }

  function pause(state) {
    const shift = state.dispatch.shift;
    if (!shift?.activeCallId) return false;
    const call = shift.calls.find((item) => item.id === shift.activeCallId);
    if (call) call.status = "paused";
    shift.activeCallId = null;
    return true;
  }

  function askQuestion(state, callId, questionId) {
    return window.C190_CallProtocol?.ask?.(state, callId, questionId) || { ok: false, reason: "protocol_unavailable" };
  }

  function setTriage(state, callId, field, value) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    return window.C190_Triage?.set?.(call, field, value) || { ok: false, reason: "triage_unavailable" };
  }


  function toggleResource(state, callId, resourceId) {
    return window.C190_ResourceDispatch?.toggle?.(state, callId, resourceId) || { ok: false, reason: "resource_dispatch_unavailable" };
  }

  function recommendResources(state, callId) {
    return window.C190_ResourceDispatch?.recommend?.(state, callId) || { ok: false, reason: "resource_dispatch_unavailable" };
  }

  function clearResources(state, callId) {
    return window.C190_ResourceDispatch?.clear?.(state, callId) || { ok: false, reason: "resource_dispatch_unavailable" };
  }

  function applyFinalOutcome(state, call, finalOutcome, choiceText = "Acompanhamento operacional") {
    const shift = state.dispatch.shift;
    if (!shift?.active || !call) return null;
    if (["resolved", "failed"].includes(call.status)) return null;
    const trainedOutcome = window.C190_TrainingAcademy?.applyOutcome?.(state, call, finalOutcome) || finalOutcome;
    call.trainingResult = trainedOutcome.training || null;
    call.outcome = trainedOutcome.resolved ? "resolved" : "failed";
    call.status = call.outcome;
    call.radioResult = trainedOutcome.radio || call.fieldRadio?.finalOutcome?.radio || null;
    shift.activeCallId = null;
    if (call.outcome === "resolved") shift.resolved++;
    else shift.failed++;
    shift.qualityTotal += Number(trainedOutcome.quality || 0);
    if (shift.affectsCareer) {
      const adjusted = window.C190_Release?.adjustOutcome?.(state, {
        quality: trainedOutcome.quality,
        xp: trainedOutcome.xp,
        rep: trainedOutcome.rep,
        resolved: call.outcome === "resolved",
        failed: call.outcome === "failed",
        reason: `${call.type}: ${choiceText} · protocolo ${trainedOutcome.protocol?.grade || "N/A"} · triagem ${trainedOutcome.triage?.grade || "N/A"} · despacho ${trainedOutcome.resourceDispatch?.grade || "N/A"} · rádio ${trainedOutcome.radio?.grade || "N/A"} · treinamento ${trainedOutcome.training?.label || "sem bônus"} (${(trainedOutcome.radio?.actions || []).map((a) => a.id).join(", ") || "sem ações"})`,
      }) || {
        quality: trainedOutcome.quality, xp: trainedOutcome.xp, rep: trainedOutcome.rep,
        resolved: call.outcome === "resolved", failed: call.outcome === "failed",
        reason: `${call.type}: ${choiceText} · treinamento ${trainedOutcome.training?.label || "sem bônus"}`,
      };
      window.C190_Career.applyOutcome(state, adjusted);
    }
    const done = shift.calls.every((item) => ["resolved", "failed", "abandoned"].includes(item.status));
    if (done) finishShift(state);
    return { call, finalOutcome: trainedOutcome };
  }

  function choose(state, callId, index) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return null;
    const call = shift.calls.find((item) => item.id === callId);
    if (!call || call.status !== "active") return null;
    window.C190_CallProtocol?.normalize?.(call);
    window.C190_LocationIntel?.normalize?.(call);
    window.C190_Triage?.normalize?.(call);
    window.C190_ResourceDispatch?.normalize?.(call);
    const choice = call.choices[index];
    if (!choice) return null;
    const protocolOutcome = window.C190_CallProtocol?.applyDecision?.(call, choice) || {
      quality: choice.q,
      xp: choice.xp,
      rep: choice.rep,
      resolved: choice.q >= 1,
      failed: choice.q < 1,
      protocol: null,
    };
    const triageOutcome = window.C190_Triage?.applyDecision?.(call, protocolOutcome) || protocolOutcome;
    const preliminaryOutcome = window.C190_ResourceDispatch?.applyDecision?.(call, triageOutcome, state) || triageOutcome;
    call.selected = index;
    call.protocolResult = preliminaryOutcome.protocol;
    call.triageResult = preliminaryOutcome.triage || call.triage?.evaluation || null;
    call.resourceDispatchResult = preliminaryOutcome.resourceDispatch || call.resourceDispatch?.evaluation || null;
    const radio = window.C190_FieldRadio?.start?.(call, preliminaryOutcome, state);
    if (radio?.ok) {
      call.status = "active";
      shift.activeCallId = call.id;
      return { call, choice, protocol: preliminaryOutcome.protocol, triage: preliminaryOutcome.triage || null, resourceDispatch: preliminaryOutcome.resourceDispatch || null, radio: radio.radio, awaitingRadio: true };
    }
    const applied = applyFinalOutcome(state, call, preliminaryOutcome, choice.text);
    return { call, choice, protocol: preliminaryOutcome.protocol, triage: preliminaryOutcome.triage || null, resourceDispatch: preliminaryOutcome.resourceDispatch || null, finalOutcome: applied?.finalOutcome || preliminaryOutcome };
  }

  function radioAction(state, callId, actionId) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return { ok: false, reason: "shift_inactive" };
    const call = shift.calls.find((item) => item.id === callId);
    if (!call || call.status !== "active") return { ok: false, reason: "call_not_active" };
    const out = window.C190_FieldRadio?.act?.(state, callId, actionId) || { ok: false, reason: "radio_unavailable" };
    if (out?.finalized && out.finalOutcome) {
      const applied = applyFinalOutcome(state, call, out.finalOutcome, "Acompanhamento de rádio e encerramento de campo");
      return { ...out, call, finalOutcome: applied?.finalOutcome || out.finalOutcome };
    }
    return out;
  }

  function finishShift(state) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return null;
    shift.active = false;
    shift.endedAt = new Date().toISOString();
    const base = shift.resolved * 30 - shift.failed * 18 - shift.abandoned * 22 + shift.qualityTotal * 5;
    const score = Math.max(0, Math.min(100, 55 + base));
    const grade = score >= 92 ? "S" : score >= 80 ? "A" : score >= 68 ? "B" : score >= 55 ? "C" : "D";
    const report = {
      id: `R${Date.now()}`,
      startedAt: shift.startedAt,
      endedAt: shift.endedAt,
      duration: shift.elapsed,
      resolved: shift.resolved,
      failed: shift.failed,
      abandoned: shift.abandoned,
      score,
      grade,
      mode: shift.mode,
      modeLabel: shift.modeLabel,
      cityId: shift.cityId,
      affectsCareer: shift.affectsCareer,
      specialId: shift.specialId,
      challengeKind: shift.challengeKind,
      difficulty: shift.difficulty || state.profile?.difficulty || "realista",
      difficultyLabel: shift.difficultyLabel || "Realista",
      balanceVersion: shift.balanceVersion || 1,
      calls: shift.calls.map((call) => ({
        templateId: call.templateId || call.id,
        type: call.type,
        category: call.category,
        status: call.status,
        wait: call.wait,
        priority: call.priority,
        outcome: call.outcome || call.status,
        location: call.location,
        lat: call.lat,
        lng: call.lng,
        region: call.region,
        locationStage: call.locationIntel?.stage || null,
        locationConfidence: call.locationIntel?.confidence ?? call.protocol?.locationConfidence ?? 0,
        locationRadiusMeters: call.locationIntel?.radiusMeters || null,
        locationConfirmed: !!call.locationConfirmed,
        protocolGrade: call.protocolResult?.grade || call.protocol?.evaluation?.grade || null,
        protocolScore: call.protocolResult?.finalProtocolScore || call.protocol?.evaluation?.finalProtocolScore || null,
        protocolMissing: call.protocolResult?.missing || call.protocol?.evaluation?.missing || [],
        protocolMistakes: call.protocolResult?.mistakes || call.protocol?.evaluation?.mistakes || 0,
        askedQuestions: call.protocol?.asked || [],
        triageGrade: call.triageResult?.grade || call.triage?.evaluation?.grade || null,
        triageScore: call.triageResult?.finalScore || call.triage?.evaluation?.finalScore || null,
        triageNature: call.triage?.nature || null,
        triagePriority: call.triage?.priority || null,
        triageAgency: call.triage?.agency || null,
        resourceDispatchGrade: call.resourceDispatchResult?.grade || call.resourceDispatch?.evaluation?.grade || null,
        resourceDispatchScore: call.resourceDispatchResult?.finalScore || call.resourceDispatch?.evaluation?.finalScore || null,
        resourceDispatchSelected: call.resourceDispatchResult?.selected || call.resourceDispatch?.evaluation?.selected || [],
        radioGrade: call.radioResult?.grade || call.fieldRadio?.grade || null,
        radioScore: call.radioResult?.finalScore || call.fieldRadio?.finalScore || null,
        radioActions: call.radioResult?.actions || call.fieldRadio?.actions || [],
        trainingBonus: call.trainingResult || null,
        radioLog: call.radioResult?.log || call.fieldRadio?.log || [],
      })),
    };

    let promotion = null;
    if (shift.affectsCareer) promotion = window.C190_Career.endShift(state, report);
    else {
      state.dispatch.reports.unshift(report);
      state.dispatch.reports = state.dispatch.reports.slice(0, 60);
    }
    window.C190_Content?.onShiftEnded(state, report);
    window.dispatchEvent(new CustomEvent("c190:shift-ended", { detail: { report, promotion } }));
    return report;
  }

  function forceFinish(state) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return null;
    shift.calls.forEach((call) => {
      if (!["resolved", "failed", "abandoned"].includes(call.status)) {
        call.status = "abandoned";
        shift.abandoned++;
        if (shift.affectsCareer) {
          window.C190_Career.applyOutcome(state, { quality: -1, xp: 0, rep: -2, abandoned: true, reason: `Plantão encerrado com chamada pendente: ${call.type}` });
        }
      }
    });
    shift.activeCallId = null;
    return finishShift(state);
  }

  return {
    templates,
    operationalCenter,
    randomCoordinate,
    ensureCoordinates,
    candidateTemplates,
    startShift,
    tick,
    answer,
    pause,
    askQuestion,
    setTriage,
    toggleResource,
    recommendResources,
    clearResources,
    choose,
    radioAction,
    finishShift,
    forceFinish,
  };
})();
