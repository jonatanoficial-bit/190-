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
    { id: "bus_hijack_partial", type: "Ônibus retido com passageiros", category: "critical", tags: ["traffic", "urban"], priority: 3, location: "Terminal Leste", summary: "Passageiro envia áudio curto dizendo que um homem armado impede a saída do ônibus.", complexity: "caso multi-etapas", caseProfile: "Segurança pública + vítimas + controle de perímetro", callProfile: { opening: "Estou falando baixo do fundo do ônibus. Tem um homem armado perto do motorista e ninguém pode descer.", situation: "O ônibus está parado no Terminal Leste. O homem grita com o motorista e fala que ninguém sai até chegar alguém da empresa.", victims: "Tem crianças e idosos aqui. Ninguém parece baleado, mas uma senhora está passando mal.", weapons: "Sim, ele mostra uma arma na cintura e fica olhando para a porta.", safety: "Estou escondido atrás do banco. Posso responder só coisas rápidas.", people: "Acho que tem umas vinte pessoas no ônibus, fora quem está no terminal.", medical: "Uma senhora está com falta de ar e muito nervosa.", reference: "Fica no box 4, perto da lanchonete azul e da saída dos ônibus municipais." }, radioOpening: "Central, primeira equipe em rota discreta. Solicito perímetro sem aproximação brusca do coletivo.", radioBeats: ["Equipe informa visual do ônibus e confirma passageiros no interior. Solicita bloqueio do terminal sem alarme público.", "Comando confirma suspeito agitado próximo ao motorista. SAMU deve ficar em ponto seguro até liberação da cena.", "Situação estabilizada. Equipe solicita registro de vítimas, apoio psicológico e encerramento controlado."] , choices: [good("Manter o informante oculto, confirmar box, risco armado e despachar PM com apoio médico em ponto seguro.", 230, 4), weak("Mandar uma viatura entrar no terminal com sirene para intimidar o suspeito.", 30, -6), bad("Pedir ao passageiro que tente tomar a arma quando houver distração.", -9)] },
    { id: "school_gate_threat", type: "Ameaça em portão de escola", category: "protection", tags: ["urban", "domestic"], priority: 3, location: "Escola Municipal Esperança", summary: "Funcionária relata responsável alterado tentando entrar após discussão familiar.", complexity: "proteção de crianças", caseProfile: "Escola + agressor + vítimas vulneráveis", callProfile: { opening: "Aqui é da secretaria da escola. Um pai está no portão gritando e tentando forçar a entrada.", situation: "Ele discutiu com a mãe da criança mais cedo e agora quer entrar sem autorização.", victims: "Há crianças no pátio e funcionários segurando a porta. Ninguém ferido ainda.", weapons: "Não vi arma, mas ele está com uma ferramenta metálica na mão.", safety: "Estamos trancados na secretaria. O portão está fechado, mas ele está batendo.", people: "Tem cerca de 80 crianças no período e quatro funcionários no portão.", reference: "Portão principal, muro amarelo, ao lado da UBS do bairro." }, radioOpening: "Equipe escolar orientada a manter portões fechados. Viatura se aproxima sem sirene para evitar pânico.", radioBeats: ["Equipe confirma indivíduo no portão e crianças recolhidas para área interna.", "Agressor resiste verbalmente; necessário manter escola em abrigo até abordagem segura.", "Indivíduo contido sem invasão. Direção solicita orientação para registro e proteção da família."], choices: [good("Confirmar escola, proteger crianças, manter portões fechados e despachar PM com abordagem controlada.", 210, 4), weak("Pedir que a direção converse do lado de fora para acalmar.", 35, -5), bad("Orientar liberar a entrada para evitar tumulto na rua.", -8)] },
    { id: "gas_leak_building", type: "Cheiro de gás em prédio", category: "fire", tags: ["urban"], priority: 3, location: "Condomínio Horizonte", summary: "Moradores sentem cheiro forte de gás no corredor e há idosos nos apartamentos.", complexity: "risco ambiental", caseProfile: "Bombeiros + evacuação + segurança", callProfile: { opening: "Tem um cheiro muito forte de gás no corredor do prédio. Alguns vizinhos estão descendo desesperados.", situation: "O cheiro vem do terceiro andar. O síndico não sabe fechar o registro geral.", victims: "Tem idosos no quarto andar e uma criança chorando no apartamento 302.", hazards: "Sim, risco de gás. Tem gente querendo acender luz e usar elevador.", safety: "Estou na escada, mas muita gente está parada no corredor.", people: "Pelo menos vinte moradores circulando, alguns subindo para pegar documentos.", reference: "Prédio azul em frente à padaria, bloco B, entrada pela Rua das Flores." }, radioOpening: "Bombeiros em deslocamento. Central deve orientar não acionar interruptores e evitar elevador.", radioBeats: ["Guarnição chega ao quarteirão e solicita evacuação por escada e isolamento da entrada.", "Equipe confirma vazamento provável no terceiro andar. Precisa de concessionária e controle de curiosos.", "Registro fechado, ventilação iniciada e moradores orientados. Aguardando vistoria para retorno."], choices: [good("Orientar evacuação segura, não usar elevador/interruptores e acionar Bombeiros e concessionária.", 220, 4), weak("Pedir que o síndico procure o vazamento com lanterna do celular.", 25, -6), bad("Mandar moradores abrir janelas e acender luzes para enxergar melhor.", -9)] },
    { id: "stroke_home", type: "Suspeita de AVC em residência", category: "health", tags: ["urban"], priority: 3, location: "Rua Santa Clara", summary: "Familiar relata fala enrolada, boca torta e fraqueza em um idoso.", complexity: "triagem médica", caseProfile: "SAMU + tempo crítico", callProfile: { opening: "Meu pai começou a falar estranho e a boca dele está torta. Eu não sei o que faço.", situation: "Ele estava sentado e de repente deixou o copo cair. Agora não consegue levantar um braço.", victims: "É meu pai, 68 anos. Está consciente, mas confuso.", medical: "Respira, mas a fala está enrolada e um lado do rosto parece caído.", safety: "Ele está deitado de lado no sofá. Tirei objetos de perto.", people: "Estamos eu e minha mãe com ele.", reference: "Casa térrea com portão verde, perto da igreja da praça." }, radioOpening: "SAMU em deslocamento. Central orienta horário de início dos sintomas e manter vias aéreas livres.", radioBeats: ["Equipe médica solicita confirmação de horário exato do início dos sintomas e medicações usadas.", "USB chega ao endereço e avalia necessidade de suporte avançado conforme sinais neurológicos.", "Paciente estabilizado para transporte. Família orientada e ocorrência encerrada com prioridade clínica."], choices: [good("Coletar sintomas, horário de início, estado respiratório e acionar SAMU com prioridade.", 210, 4), weak("Orientar dar água com açúcar e aguardar melhora.", 25, -6), bad("Mandar transportar de moto para chegar mais rápido.", -8)] },
    { id: "bridge_jump_risk", type: "Pessoa em risco na ponte", category: "protection", tags: ["urban", "traffic"], priority: 3, location: "Ponte Nova", summary: "Motorista vê pessoa do lado externo da grade da ponte.", complexity: "crise emocional", caseProfile: "Negociação + trânsito + Bombeiros", callProfile: { opening: "Tem uma pessoa do lado de fora da grade da ponte. Os carros estão freando de repente.", situation: "Ela parece chorando e não responde quando as pessoas chamam.", victims: "É uma pessoa adulta. Não sei se está machucada, mas o risco é imediato.", weapons: "Não vi arma. O perigo é ela cair ou pular.", safety: "Eu parei longe. Tem gente querendo chegar perto e filmar.", hazards: "O trânsito está perigoso e a queda é alta.", reference: "Sentido centro, logo depois do radar, faixa da direita." }, radioOpening: "Central, viatura e resgate em deslocamento. Solicito controle de trânsito e abordagem por profissional treinado.", radioBeats: ["Equipe chega na ponte e isola a faixa direita. Populares afastados para reduzir pressão.", "Bombeiros posicionam resgate. Operador deve manter informação objetiva e evitar comandos bruscos.", "Pessoa retirada da área de risco e entregue ao atendimento especializado."], choices: [good("Controlar trânsito, afastar curiosos, acionar PM/Bombeiros/SAMU e preservar comunicação calma.", 230, 4), weak("Pedir que populares segurem a pessoa imediatamente.", 20, -6), bad("Mandar buzinar para ela sair da ponte.", -9)] },
    { id: "landslide_home", type: "Casa atingida por deslizamento", category: "weather", tags: ["hills", "weather"], priority: 3, location: "Morro do Sol", summary: "Após chuva, barranco cede e parte de uma casa fica soterrada.", complexity: "desastre local", caseProfile: "Bombeiros + Defesa Civil + busca", callProfile: { opening: "O barranco caiu em cima de uma casa. Tem gente gritando de dentro.", situation: "Metade da parede cedeu. A chuva continua e o chão está descendo.", victims: "A família mora ali. Ouvi pelo menos duas pessoas pedindo socorro.", hazards: "Tem risco de novo deslizamento, fios caídos e muita lama.", safety: "Estou do outro lado da rua. Os vizinhos querem cavar com enxada.", people: "Muita gente na rua, uns dez moradores tentando ajudar.", reference: "Escadão da caixa d'água, terceira viela, casa azul." }, radioOpening: "Resgate técnico e Defesa Civil acionados. Central orienta afastar voluntários por risco de novo deslizamento.", radioBeats: ["Equipe confirma área instável e solicita bloqueio da viela para acesso dos bombeiros.", "Vítima localizada verbalmente. Necessário manter silêncio operacional e impedir escavação improvisada.", "Resgate em andamento com área isolada. Defesa Civil assume avaliação das casas vizinhas."], choices: [good("Fixar último ponto das vítimas, afastar curiosos e acionar Bombeiros/Defesa Civil com prioridade máxima.", 240, 5), weak("Orientar vizinhos a cavar enquanto a equipe não chega.", 20, -7), bad("Registrar como dano material até confirmar feridos.", -9)] },
    { id: "mall_panic", type: "Pânico em shopping", category: "event", tags: ["urban", "event"], priority: 3, location: "Shopping Central", summary: "Correria após barulho parecido com disparo; há pessoas caídas nas escadas.", complexity: "multidão e boato", caseProfile: "Fluxo de massa + vítimas + verificação", callProfile: { opening: "Começou uma correria no shopping, todo mundo gritou que tinha tiro, mas eu não sei se foi tiro mesmo.", situation: "Foi perto da praça de alimentação. Muita gente correu para a escada rolante.", victims: "Tem pessoas caídas, acho que pisotearam alguém. Não vi sangue.", weapons: "Não vi arma; só ouvi um estouro e depois pânico.", safety: "Estou dentro de uma loja com a porta abaixada.", people: "Centenas de pessoas estavam no corredor.", reference: "Segundo piso, perto do cinema e da praça de alimentação." }, radioOpening: "Equipe segue para controle de fluxo. Informação de disparo não confirmada; prioridade é vítimas e evacuação ordenada.", radioBeats: ["Segurança do shopping confirma correria e vítimas por queda. Nenhum disparo confirmado até agora.", "SAMU e brigada acessam segundo piso. PM organiza corredor seguro e bloqueia novas entradas.", "Boato controlado, vítimas atendidas e área vistoriada. Ocorrência encerrada com relatório de pânico coletivo."], choices: [good("Separar fato de boato, confirmar setor, acionar PM/SAMU e orientar abrigo seguro sem estimular correria.", 220, 4), weak("Anunciar pelo telefone que houve disparo para todos saírem rápido.", 20, -7), bad("Pedir ao chamador para sair filmando o corredor.", -8)] },
    { id: "elder_abandonment", type: "Idoso vulnerável sozinho", category: "protection", tags: ["urban"], priority: 2, location: "Vila Esperança", summary: "Vizinha encontra idoso confuso, sem água e com porta aberta há horas.", complexity: "assistência e proteção", caseProfile: "Vulnerável + saúde + rede de apoio", callProfile: { opening: "Meu vizinho idoso está sozinho, muito confuso, e a porta ficou aberta desde cedo.", situation: "Ele não lembra o nome dos familiares e a casa está muito quente.", victims: "É um senhor idoso, parece desidratado e fraco.", medical: "Ele está acordado, mas fala coisas sem sentido e quase caiu quando tentou levantar.", safety: "Estou na porta com ele, sem mexer em nada da casa.", people: "Só eu e outra vizinha ajudando, sem familiares no local.", reference: "Casa 12, viela atrás do mercado, portão branco." }, radioOpening: "Unidade em deslocamento. Central orienta manter idoso em local ventilado, sem medicação improvisada.", radioBeats: ["Equipe chega e confirma vulnerabilidade social. SAMU avalia sinais de desidratação.", "Necessário acionar rede de proteção e localizar familiares sem expor dados sensíveis.", "Idoso encaminhado para atendimento e registro de proteção concluído."], choices: [good("Coletar endereço, condição clínica e rede de apoio; acionar SAMU e proteção social conforme risco.", 170, 3), weak("Orientar dar remédio que houver em casa.", 25, -5), bad("Encerrar porque não há crime em andamento.", -6)] },
    { id: "motorcycle_chase_witness", type: "Moto em fuga com disparos ou estouros", category: "critical", tags: ["traffic", "urban"], priority: 3, location: "Avenida Industrial", summary: "Testemunha relata moto em alta velocidade, estouros e pessoas se abaixando.", complexity: "perseguição indireta", caseProfile: "Risco armado + trânsito + testemunha", callProfile: { opening: "Passou uma moto muito rápido, parecia tiro ou escapamento estourando, todo mundo se jogou no chão.", situation: "A moto entrou na Avenida Industrial sentido centro, cortando os carros.", victims: "Não vi feridos, mas uma pessoa caiu da calçada com o susto.", weapons: "Não tenho certeza se era arma. Eu ouvi dois estouros e vi alguém olhando para trás.", safety: "Estou dentro da loja agora, longe da porta.", people: "Muitos pedestres na calçada e carros freando.", reference: "Em frente ao atacadão, perto do viaduto." }, radioOpening: "Central difunde alerta sem incentivar perseguição por civis. Equipes devem checar câmeras e rotas prováveis.", radioBeats: ["Viatura identifica rota provável e solicita placas parciais/descrição da moto.", "Equipe no viaduto relata tráfego intenso; prioridade é prevenção de acidente e abordagem segura.", "Alerta encerrado com patrulhamento reforçado e orientação à testemunha para registro complementar."], choices: [good("Coletar direção, descrição e possível vítima, orientar abrigo e difundir alerta com segurança.", 185, 3), weak("Pedir ao chamador para seguir a moto e informar a placa.", 25, -6), bad("Ignorar por não confirmar se eram tiros.", -6)] },
    { id: "clinic_aggression", type: "Agressão em unidade de saúde", category: "protection", tags: ["urban", "government"], priority: 3, location: "UPA Norte", summary: "Recepção de UPA relata paciente agressivo ameaçando equipe e quebrando objetos.", complexity: "serviço essencial", caseProfile: "PM + saúde + preservação de atendimento", callProfile: { opening: "Aqui é da UPA. Um paciente está quebrando cadeiras e ameaçando a equipe.", situation: "Ele está alterado na recepção e impede o atendimento de outros pacientes.", victims: "Uma técnica de enfermagem foi empurrada. Tem pacientes idosos aguardando.", weapons: "Ele pegou um suporte metálico, não sei se vai usar como arma.", safety: "A equipe entrou para a área interna, mas a porta de vidro pode quebrar.", people: "A recepção está cheia, umas trinta pessoas.", reference: "Entrada principal da UPA Norte, ao lado da base do SAMU." }, radioOpening: "Viatura em deslocamento para unidade de saúde. Central orienta equipe a manter barreira física e rota de saída.", radioBeats: ["Equipe chega e confirma agressor na recepção com objeto metálico.", "SAMU permanece operacional; necessário preservar atendimento e separar pacientes vulneráveis.", "Indivíduo contido, equipe médica avalia envolvidos e UPA retoma fluxo."], choices: [good("Preservar equipe e pacientes, confirmar risco e despachar PM com apoio médico disponível.", 200, 4), weak("Pedir à recepção para conter fisicamente o paciente até a viatura chegar.", 20, -6), bad("Encerrar por acontecer dentro de unidade de saúde.", -7)] },
    { id: "wrong_address_followup", type: "Endereço confuso — chamada em pânico", category: "community", tags: ["urban"], priority: 2, location: "Rua Projetada", summary: "Chamador nervoso informa nome de rua incompleto e ponto de referência contraditório.", complexity: "localização difícil", caseProfile: "Endereço + confirmação + risco de despacho errado", callProfile: { opening: "Eu não sei o nome certo da rua, é uma rua projetada, tem uma confusão aqui e todo mundo está gritando.", neighborhood: "Acho que é Jardim América, mas pode ser Jardim Novo. Eu vim de carona e não conheço.", street: "A placa está quebrada. Vejo só 'Rua Projetada' e um número 3 pintado no poste.", number: "Não tem número visível. A casa tem portão azul e uma árvore grande na frente.", address: "Não consigo endereço completo. O melhor é usar o mercado Bom Preço como referência.", reference: "Fica atrás do mercado Bom Preço, perto de uma quadra coberta.", situation: "É uma briga entre duas famílias, mas não sei quem começou.", victims: "Tem uma pessoa caída sentada na calçada, consciente.", weapons: "Ouvi alguém falar em faca, mas não vi.", safety: "Estou do outro lado da rua." }, radioOpening: "Central alerta possível divergência de endereço. Viatura deve confirmar ponto de referência antes de entrar na rua.", radioBeats: ["Equipe chega ao mercado de referência e solicita complemento de portão/cor para evitar despacho errado.", "Local encontrado após varredura curta. Confirmada briga familiar com uma vítima leve.", "Ocorrência controlada. Registro destaca importância da referência no atendimento."], choices: [good("Priorizar referência, bairro provável, portão/cor e orientar viatura com margem de busca.", 165, 2), weak("Despachar apenas para Rua Projetada sem referência.", 40, -4), bad("Encerrar porque o chamador não sabe o endereço exato.", -7)] },
    { id: "river_child_missing", type: "Criança desaparecida perto de rio", category: "remote", tags: ["river", "remote"], priority: 3, location: "Comunidade Ribeirinha", summary: "Família perdeu criança de vista próximo a barranco e embarcações.", complexity: "busca fluvial", caseProfile: "Bombeiros + comunidade + tempo crítico", callProfile: { opening: "Meu sobrinho sumiu perto do rio. A gente chamou e ele não responde.", situation: "Ele brincava perto dos barcos e depois ninguém viu mais.", victims: "É uma criança de 6 anos, camiseta vermelha.", hazards: "O rio está cheio e a margem é escorregadia.", safety: "A família quer entrar na água, mas está escurecendo.", people: "Tem muitos vizinhos procurando sem coordenação.", reference: "Trapiche de madeira da comunidade, depois da igreja pequena." }, radioOpening: "Resgate fluvial acionado. Central orienta manter último ponto visto e impedir buscas isoladas na água.", radioBeats: ["Equipe chega ao trapiche e estabelece último ponto visto com familiares.", "Barco de resgate inicia varredura; comunidade deve permanecer em áreas seguras e iluminadas.", "Busca coordenada em andamento com perímetro definido e registro de testemunhas."], choices: [good("Fixar descrição, último ponto visto e acionar resgate fluvial, impedindo busca improvisada.", 225, 4), weak("Pedir que todos entrem na água para procurar em linha.", 15, -7), bad("Orientar aguardar até amanhecer por ser área remota.", -9)] },
    { id: "factory_smoke", type: "Fumaça em galpão industrial", category: "fire", tags: ["urban", "infrastructure"], priority: 3, location: "Distrito Industrial", summary: "Funcionário relata fumaça química e trabalhadores saindo tossindo.", complexity: "produto perigoso", caseProfile: "Bombeiros + isolamento + risco químico", callProfile: { opening: "Saiu uma fumaça estranha do galpão e o pessoal está tossindo muito.", situation: "A fumaça vem da área de estoque. Tem cheiro forte, parece produto químico.", victims: "Três funcionários estão tossindo e um sentou no chão.", hazards: "Pode ter produto inflamável. Não sabemos se é vazamento ou incêndio começando.", safety: "Estamos do lado de fora, mas o vento está levando a fumaça para a rua.", people: "Turno com uns quarenta funcionários.", reference: "Galpão 7, portão de carga, perto da guarita vermelha." }, radioOpening: "Bombeiros acionados com alerta de possível produto perigoso. Central orienta afastamento contra o vento.", radioBeats: ["Equipe chega e solicita informações de produtos armazenados e ponto de acesso ao galpão.", "Vítimas triadas fora da área quente; necessidade de isolamento maior devido ao vento.", "Fumaça controlada e perímetro técnico mantido até avaliação ambiental."], choices: [good("Orientar isolamento, afastamento contra o vento, acionar Bombeiros e SAMU para expostos.", 230, 4), weak("Pedir que funcionários voltem para identificar o produto.", 15, -8), bad("Tratar como fumaça comum e enviar apenas patrulha.", -8)] },
    { id: "market_robbery_after", type: "Roubo recém-ocorrido com vítima em crise", category: "critical", tags: ["urban"], priority: 3, location: "Mercado São Jorge", summary: "Assaltantes fugiram, caixa está em crise e cliente pode estar ferido.", complexity: "pós-crime imediato", caseProfile: "PM + SAMU + preservação de cena", callProfile: { opening: "Acabaram de assaltar o mercado. Eles fugiram agora e a caixa está passando mal.", situation: "Foram dois homens. Um apontou arma e fugiram numa moto preta.", victims: "A caixa está tremendo muito e um cliente caiu quando todo mundo correu.", weapons: "Sim, tinham arma. Já saíram, mas ninguém sabe se voltam.", safety: "Estamos com a porta fechada. Ninguém está perseguindo.", people: "Quatro funcionários e alguns clientes ficaram dentro.", reference: "Mercado São Jorge, esquina com a Rua B, perto do ponto de ônibus." }, radioOpening: "Viatura desloca para preservação de cena e busca por rota de fuga. SAMU avalia vítima em crise.", radioBeats: ["Equipe chega e confirma fuga em moto preta. Solicita descrição sem expor vítimas.", "SAMU avalia caixa e cliente caído. PM preserva imagens e orienta testemunhas.", "Ocorrência encerrada com boletim preliminar, vítimas orientadas e alerta irradiado."], choices: [good("Garantir segurança, coletar descrição/direção, preservar cena e acionar PM/SAMU.", 205, 4), weak("Mandar funcionários correrem atrás para ver a placa.", 20, -7), bad("Encerrar porque os suspeitos já fugiram.", -7)] },
    { id: "nightclub_overdose", type: "Mal súbito em casa noturna", category: "health", tags: ["event", "urban"], priority: 3, location: "Casa Noturna Eclipse", summary: "Jovem inconsciente no banheiro, amigos não sabem o que ingeriu.", complexity: "saúde + multidão", caseProfile: "SAMU + PM preventiva + acesso", callProfile: { opening: "Tem uma menina desacordada no banheiro da balada. Ninguém sabe o que ela tomou.", situation: "Ela desmaiou faz poucos minutos. O som está alto e está difícil abrir caminho.", victims: "É uma jovem, respira fraco e não responde.", medical: "Ela respira, mas muito devagar. Está fria e pálida.", safety: "A segurança tirou curiosos, mas tem muita gente no corredor.", people: "Uns seis amigos estão em volta, todos nervosos.", reference: "Casa Noturna Eclipse, entrada lateral pela Rua Dois, banheiro feminino." }, radioOpening: "SAMU em deslocamento. Central orienta abrir corredor, manter vias aéreas e não oferecer bebida ou remédio.", radioBeats: ["Equipe chega à entrada lateral e solicita segurança para corredor até o banheiro.", "Paciente em avaliação. PM preventiva mantém controle de acesso e identifica responsáveis.", "Vítima encaminhada para atendimento. Local orientado sobre preservação de informações."], choices: [good("Coletar estado clínico, abrir acesso ao SAMU, orientar segurança e apoio preventivo.", 210, 4), weak("Pedir aos amigos para dar banho frio e café.", 20, -7), bad("Mandar retirar a vítima para a calçada antes da avaliação.", -8)] },
    { id: "domestic_codeword_child", type: "Código de emergência com criança", category: "protection", tags: ["domestic", "urban"], priority: 3, location: "Conjunto das Flores", summary: "Criança liga fingindo pedir pizza e repete palavra combinada pela mãe.", complexity: "chamada disfarçada", caseProfile: "Violência doméstica + menor + comunicação segura", callProfile: { opening: "Oi... eu queria pedir uma pizza grande. Minha mãe falou para eu dizer 'estrela azul'.", situation: "Meu pai está gritando com minha mãe no quarto. Eu estou na cozinha.", victims: "Minha mãe está chorando e eu estou com meu irmão pequeno.", weapons: "Eu vi uma faca na mesa, mas não sei se ele pegou.", safety: "Estou falando baixinho. Não posso demorar.", people: "Eu, meu irmão, minha mãe e meu pai.", reference: "Bloco C, apartamento 24, portaria pela rua de trás." }, radioOpening: "Central reconhece possível código de emergência. Viatura desloca sem sirene e com cautela no condomínio.", radioBeats: ["Equipe chega à portaria e solicita confirmação silenciosa do bloco antes da subida.", "No apartamento há discussão ativa. Necessário preservar crianças e separar agressor da vítima.", "Vítima e crianças em segurança. Ocorrência encaminhada como proteção doméstica."], choices: [good("Manter linguagem segura, coletar bloco/apartamento e despachar PM sem expor a criança.", 240, 5), weak("Pedir para a criança explicar tudo em voz alta.", 20, -8), bad("Encerrar como brincadeira por falar em pizza.", -10)] },
    { id: "subway_platform_fall", type: "Queda em plataforma de trem/metrô", category: "traffic", tags: ["urban", "event"], priority: 3, location: "Estação Central", summary: "Pessoa cai na área dos trilhos; usuários gritam e tentam ajudar.", complexity: "transporte coletivo", caseProfile: "Bombeiros + energia + controle de multidão", callProfile: { opening: "Uma pessoa caiu na área dos trilhos! Tem gente tentando puxar ela.", situation: "O trem ainda não chegou, mas as luzes piscam e todo mundo está gritando.", victims: "Uma pessoa nos trilhos, parece consciente, mas não consegue subir.", hazards: "Tem risco elétrico e de trem chegando.", safety: "Estou na plataforma. A segurança está correndo para o local.", people: "Plataforma cheia, muita gente se aproximando da borda.", reference: "Plataforma sentido bairro, perto da escada rolante central." }, radioOpening: "Central aciona bombeiros/resgate e comunica operador ferroviário para bloqueio de energia e circulação.", radioBeats: ["Segurança da estação confirma vítima nos trilhos. Circulação deve ser interrompida antes de acesso.", "Equipe de resgate entra somente após confirmação técnica de segurança da via.", "Vítima retirada e plataforma controlada. Trens aguardam liberação operacional."], choices: [good("Confirmar plataforma, impedir aproximação, acionar resgate e bloquear operação ferroviária.", 235, 5), weak("Pedir que usuários puxem a vítima antes do trem chegar.", 15, -9), bad("Enviar apenas viatura comum sem informar risco ferroviário.", -8)] },
    { id: "false_call_pattern", type: "Possível trote repetido com risco real", category: "community", tags: ["urban"], priority: 2, location: "Praça do Relógio", summary: "Ligação parece trote, mas menciona criança chorando e veículo suspeito.", complexity: "verificação de credibilidade", caseProfile: "Trote aparente + dado verificável", callProfile: { opening: "Vocês nunca vêm mesmo... tem um carro parado aqui e uma criança chorando, mas deixa pra lá.", situation: "O carro está parado há muito tempo perto da praça. A pessoa que ligou antes riu, mas eu estou vendo uma criança.", victims: "Pode ter uma criança dentro do carro. Não consigo ver direito.", weapons: "Não vi arma. Só tem um adulto andando perto do veículo.", safety: "Estou na banca de jornal, olhando de longe.", people: "Vejo um adulto e talvez uma criança no banco de trás.", reference: "Praça do Relógio, perto da banca verde e da câmera municipal." }, radioOpening: "Central trata como verificação com dado vulnerável. Viatura desloca em prioridade moderada para checagem.", radioBeats: ["Viatura chega à praça e procura veículo com base na referência da banca.", "Equipe confirma criança chorando no veículo; responsável localizado em comércio próximo.", "Situação verificada e resolvida com orientação. Registro evita descarte indevido de chamada."], choices: [good("Não descartar como trote; coletar referência, veículo e criança, despachando verificação.", 165, 3), weak("Encerrar porque houve ligação anterior rindo.", 30, -5), bad("Orientar o chamador a abrir o carro.", -7)] },
    { id: "rural_domestic_shot", type: "Disparo ouvido em área rural", category: "critical", tags: ["remote", "domestic"], priority: 3, location: "Estrada do Sítio Alto", summary: "Vizinho relata gritos, disparo e dificuldade de sinal em sítio afastado.", complexity: "área remota armada", caseProfile: "PM + rota + segurança do chamador", callProfile: { opening: "Eu ouvi um tiro vindo do sítio vizinho. O sinal cai toda hora, por favor anota rápido.", situation: "Antes do disparo tinha discussão de casal. Depois ficou silêncio.", victims: "Não sei se alguém foi atingido, mas mora uma mulher com duas crianças lá.", weapons: "Sim, aqui é comum terem espingarda. Eu ouvi um disparo forte.", safety: "Estou dentro de casa com a luz apagada. Não vou sair.", people: "A família vizinha tem quatro pessoas.", reference: "Depois da ponte de madeira, segunda porteira vermelha, estrada de terra." }, radioOpening: "Equipe desloca para área rural com cautela. Central deve manter referência de ponte e porteira para rota segura.", radioBeats: ["Viatura encontra a ponte e solicita confirmação da porteira antes de avançar sem luz.", "Equipe aproxima e confirma residência silenciosa. Necessário reforço e abordagem tática.", "Família localizada e área preservada. Registro conclui com apoio especializado."], choices: [good("Coletar referências rurais, manter chamador seguro e despachar PM com cautela e possível reforço.", 235, 5), weak("Pedir ao vizinho que vá verificar se alguém foi atingido.", 15, -8), bad("Aguardar nova ligação por falta de endereço formal.", -9)] },
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

  function pendingScheduled(shift) {
    return (shift?.calls || [])
      .filter((call) => call && call.status === "scheduled")
      .sort((a, b) => Number(a.arrivesAt || 0) - Number(b.arrivesAt || 0));
  }

  function waitingCalls(shift) {
    return (shift?.calls || []).filter((call) => call && call.status === "waiting");
  }

  function fieldCalls(shift) {
    return (shift?.calls || []).filter((call) => call && call.status === "field");
  }

  function announceShiftEvent(shift, text, kind = "info", call = null) {
    if (!shift?.events) return;
    const event = { at: new Date().toISOString(), text, kind, callId: call?.id || null };
    shift.events.unshift(event);
    try {
      window.dispatchEvent(new CustomEvent("c190:shift-event", { detail: { ...event, call } }));
    } catch {}
  }

  function primeNextCall(shift, delaySeconds = 3, reason = "contínuo") {
    if (!shift?.active) return null;
    if (waitingCalls(shift).length) return null;
    const next = pendingScheduled(shift)[0];
    if (!next) return null;
    const currentElapsed = Number(shift.elapsed || 0);
    const target = currentElapsed + Math.max(1, Number(delaySeconds || 3));
    if (Number(next.arrivesAt || 0) > target) {
      next.arrivesAt = target;
      next.primedAfterDispatch = true;
      next.primeReason = reason;
    }
    announceShiftEvent(shift, `Próxima ligação em ${Math.max(1, Math.round(next.arrivesAt - currentElapsed))}s: ${next.type}`, "incoming_scheduled", next);
    return next;
  }

  function releaseCallToField(shift, call) {
    if (!shift?.active || !call) return null;
    if (call.fieldRadio?.active && call.status === "active") {
      call.status = "field";
      call.fieldHandoffAt = new Date().toISOString();
      call.operatorHandoff = true;
      if (shift.activeCallId === call.id) shift.activeCallId = null;
      announceShiftEvent(shift, `Ocorrência em campo: ${call.type}. Central liberada para nova chamada.`, "field_handoff", call);
    }
    return call;
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
      campaignId: options.campaignId || null,
      missionId: options.missionId || null,
      campaignChapter: options.campaignChapter || null,
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
        call.wait = Math.max(0, Number(call.wait || 0));
        call.arrivedAtElapsed = shift.elapsed;
        if (!call.announcedWaiting) {
          call.announcedWaiting = true;
          announceShiftEvent(shift, `Nova ligação na fila: ${call.type}`, "incoming", call);
        }
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
    window.C190_Multitask?.updateShift?.(state, shift);
    const waitingNow = shift.calls.filter((call) => call.status === "waiting").length;
    const fieldNow = shift.calls.filter((call) => call.status === "field").length;
    const scheduledNow = shift.calls.filter((call) => call.status === "scheduled").length;
    if (!shift.activeCallId && fieldNow > 0 && waitingNow === 0 && scheduledNow > 0) {
      primeNextCall(shift, 4, "central multitarefa");
    }
    const done = shift.calls.every((call) => ["resolved", "failed", "abandoned"].includes(call.status));
    if (done && !shift.activeCallId) finishShift(state);
  }

  function answer(state, id) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return false;
    const call = shift.calls.find((item) => item.id === id);
    if (!call || !["waiting", "paused", "field"].includes(call.status)) return false;
    if (shift.activeCallId && shift.activeCallId !== id) {
      const active = shift.calls.find((item) => item.id === shift.activeCallId);
      if (active) {
        active.status = active.fieldRadio?.active ? "field" : "paused";
        active.pausedAt = new Date().toISOString();
      }
    }
    call.status = "active";
    call.resumedFromField = !!call.fieldRadio?.active;
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
    if (!done) primeNextCall(shift, 4, "após encerramento de campo");
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
      releaseCallToField(shift, call);
      primeNextCall(shift, 2, "após despacho");
      return { call, choice, protocol: preliminaryOutcome.protocol, triage: preliminaryOutcome.triage || null, resourceDispatch: preliminaryOutcome.resourceDispatch || null, radio: radio.radio, awaitingRadio: true, releasedToField: true };
    }
    const applied = applyFinalOutcome(state, call, preliminaryOutcome, choice.text);
    return { call, choice, protocol: preliminaryOutcome.protocol, triage: preliminaryOutcome.triage || null, resourceDispatch: preliminaryOutcome.resourceDispatch || null, finalOutcome: applied?.finalOutcome || preliminaryOutcome };
  }

  function radioAction(state, callId, actionId) {
    const shift = state.dispatch.shift;
    if (!shift?.active) return { ok: false, reason: "shift_inactive" };
    const call = shift.calls.find((item) => item.id === callId);
    if (!call || !["active", "field"].includes(call.status)) return { ok: false, reason: "call_not_active" };
    const wasField = call.status === "field";
    if (wasField) call.status = "active";
    const out = window.C190_FieldRadio?.act?.(state, callId, actionId) || { ok: false, reason: "radio_unavailable" };
    if (wasField && !out?.finalized && call.status === "active") call.status = "field";
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
    const balancedScore = window.C190_Balance?.shiftScore?.(state, shift) || null;
    const base = shift.resolved * 30 - shift.failed * 18 - shift.abandoned * 22 + shift.qualityTotal * 5;
    const score = balancedScore?.score ?? Math.max(0, Math.min(100, 55 + base));
    const grade = balancedScore?.grade ?? (score >= 92 ? "S" : score >= 80 ? "A" : score >= 68 ? "B" : score >= 55 ? "C" : "D");
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
      campaignId: shift.campaignId || null,
      missionId: shift.missionId || null,
      campaignChapter: shift.campaignChapter || null,
      difficulty: shift.difficulty || state.profile?.difficulty || "realista",
      difficultyLabel: shift.difficultyLabel || "Realista",
      balanceVersion: balancedScore?.balanceVersion || shift.balanceVersion || 3,
      scoreBreakdown: balancedScore,
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
    const campaignResult = window.C190_Campaign?.onShiftEnded?.(state, report) || null;
    window.dispatchEvent(new CustomEvent("c190:shift-ended", { detail: { report, promotion, campaignResult } }));
    return report;
  }

  function diagnostics(state) {
    const shift = state?.dispatch?.shift || null;
    if (!shift?.active) return { active: false };
    return {
      active: true,
      elapsed: shift.elapsed,
      activeCallId: shift.activeCallId,
      waiting: waitingCalls(shift).length,
      scheduled: pendingScheduled(shift).length,
      field: fieldCalls(shift).length,
      resolved: shift.resolved,
      failed: shift.failed,
      abandoned: shift.abandoned,
    };
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
    fieldCalls,
    primeNextCall,
    diagnostics,
  };
})();
