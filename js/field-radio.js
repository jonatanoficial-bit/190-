window.C190_FieldRadio = (() => {
  "use strict";

  const VERSION = 1;

  const ACTIONS = [
    { id: "advance", label: "Aguardar nova atualização", short: "Aguardar", score: 0, hint: "Mantém a escuta operacional sem alterar recursos." },
    { id: "keep_line", label: "Manter chamador em linha segura", short: "Linha aberta", score: 6, hint: "Útil quando vítima, agressor ou risco ainda estão presentes." },
    { id: "pm_backup", label: "Enviar reforço policial", short: "Reforço PM", score: 0, hint: "Necessário em arma, agressor, multidão ou cerco." },
    { id: "samu_support", label: "Acionar/confirmar SAMU", short: "SAMU", score: 0, hint: "Necessário para feridos, inconsciente ou mal súbito." },
    { id: "fire_support", label: "Acionar/confirmar Bombeiros", short: "Bombeiros", score: 0, hint: "Necessário para fogo, resgate, acidente grave ou alagamento." },
    { id: "civil_defense", label: "Acionar Defesa Civil", short: "Defesa Civil", score: 0, hint: "Útil para alagamento, árvore, fios, queda de energia ou risco estrutural." },
    { id: "reroute", label: "Redirecionar unidade mais próxima", short: "Redirecionar", score: 4, hint: "Corrige demora ou endereço ajustado pelo mapa." },
    { id: "close", label: "Encerrar ocorrência", short: "Encerrar", score: -8, hint: "Só use quando o rádio informar situação controlada." },
  ];

  const byId = (id) => ACTIONS.find((a) => a.id === id) || ACTIONS[0];

  function textOf(call) {
    return `${call?.id || ""} ${call?.type || ""} ${call?.category || ""} ${(call?.tags || []).join(" ")} ${call?.summary || ""}`.toLowerCase();
  }

  function has(call, words) {
    const txt = textOf(call);
    return words.some((w) => txt.includes(w));
  }

  function riskProfile(call) {
    return {
      weapon: has(call, ["arma", "armad", "roubo", "refém", "refens", "banco", "agressor", "ameaça", "briga", "confronto"]),
      victim: has(call, ["vítima", "vitima", "ferid", "inconsciente", "médica", "medica", "criança", "queda", "mal súbito", "mal subito"]),
      fire: has(call, ["incêndio", "incendio", "fogo", "fumaça", "gas", "elétrico", "eletrico"]),
      weather: has(call, ["alag", "correnteza", "enchente", "desliz", "árvore", "arvore", "fios", "chuva", "energia"]),
      crowd: has(call, ["multidão", "multidao", "evento", "estádio", "estadio", "torcedores", "portão", "portao"]),
    };
  }

  function selectedTypes(call) {
    const selected = call?.resourceDispatchResult?.selected || call?.resourceDispatch?.evaluation?.selected || [];
    return new Set(selected.map((u) => u.type));
  }

  function scenario(call) {
    const risk = riskProfile(call);
    if (risk.weapon) return "critical_security";
    if (risk.fire || risk.weather) return "rescue_environment";
    if (risk.victim) return "medical_scene";
    if (risk.crowd) return "crowd_control";
    return "routine_patrol";
  }

  function normalize(call) {
    if (!call) return null;
    const existing = call.fieldRadio && typeof call.fieldRadio === "object" ? call.fieldRadio : {};
    call.fieldRadio = {
      version: VERSION,
      active: !!existing.active,
      finalized: !!existing.finalized,
      stage: Number(existing.stage || 0),
      scenario: existing.scenario || scenario(call),
      scoreDelta: Number(existing.scoreDelta || 0),
      actions: Array.isArray(existing.actions) ? existing.actions : [],
      log: Array.isArray(existing.log) ? existing.log : [],
      startedAt: existing.startedAt || null,
      finalizedAt: existing.finalizedAt || null,
      preliminaryOutcome: existing.preliminaryOutcome || null,
      finalOutcome: existing.finalOutcome || null,
      grade: existing.grade || null,
      finalScore: existing.finalScore || null,
    };
    return call.fieldRadio;
  }

  function pushLog(radio, source, text, tone = "info") {
    radio.log.unshift({ at: new Date().toISOString(), source, text, tone });
    radio.log = radio.log.slice(0, 14);
  }

  function opening(call) {
    const risk = riskProfile(call);
    if (risk.weapon) return "Copom, equipe informa deslocamento com cautela. Possível risco armado, aguardando cerco seguro.";
    if (risk.fire || risk.weather) return "Central, equipe de resgate em deslocamento. Solicita confirmação de ponto de acesso e isolamento da área.";
    if (risk.victim) return "Central, unidade em deslocamento. Preparar apoio médico e manter solicitante orientado até chegada.";
    if (risk.crowd) return "Central, equipe segue para controle de fluxo. Solicita atualização sobre portão, setor e vias de acesso.";
    return "Central, viatura em deslocamento. Solicitante será localizado no endereço informado.";
  }

  function stageText(call, nextStage) {
    const risk = riskProfile(call);
    if (nextStage === 1) return "Primeira unidade informa chegada nas proximidades e pede confirmação visual do local.";
    if (nextStage === 2) {
      if (risk.weapon) return "Equipe no local confirma tensão elevada e solicita decisão: reforço, perímetro ou manter linha segura.";
      if (risk.victim) return "Equipe confirma vítima no local e solicita prioridade para atendimento médico.";
      if (risk.fire || risk.weather) return "Equipe confirma risco ambiental e solicita apoio técnico para isolamento e resgate.";
      if (risk.crowd) return "Equipe relata concentração de pessoas e solicita orientação para fluxo e reforço preventivo.";
      return "Equipe informa contato com solicitante e aguarda autorização para encerramento ou nova verificação.";
    }
    if (nextStage === 3) return "Situação controlada em campo. Equipe solicita encerramento operacional e registro final.";
    return "Rádio operacional ativo.";
  }

  function start(call, preliminaryOutcome, state) {
    const radio = normalize(call);
    if (radio.active || radio.finalized) return { ok: true, call, radio };
    radio.active = true;
    radio.stage = 0;
    radio.scenario = scenario(call);
    radio.startedAt = new Date().toISOString();
    radio.preliminaryOutcome = {
      quality: Number(preliminaryOutcome?.quality || 0),
      xp: Number(preliminaryOutcome?.xp || 0),
      rep: Number(preliminaryOutcome?.rep || 0),
      resolved: !!preliminaryOutcome?.resolved,
      failed: !!preliminaryOutcome?.failed,
      protocol: preliminaryOutcome?.protocol || null,
      triage: preliminaryOutcome?.triage || null,
      resourceDispatch: preliminaryOutcome?.resourceDispatch || null,
    };
    const resources = (call?.resourceDispatchResult?.selected || []).map((u) => u.label || u.id).join(", ") || "nenhuma unidade registrada";
    pushLog(radio, "SISTEMA", `Despacho confirmado: ${resources}. A ocorrência seguirá viva no rádio.`, "success");
    pushLog(radio, "RÁDIO", opening(call), "info");
    if (state?.dispatch?.shift?.events) state.dispatch.shift.events.unshift({ at: new Date().toISOString(), text: `Rádio ativo: ${call.type}` });
    return { ok: true, call, radio };
  }

  function actionScore(call, actionId) {
    const risk = riskProfile(call);
    const types = selectedTypes(call);
    let score = byId(actionId).score || 0;
    if (actionId === "pm_backup") score += risk.weapon || risk.crowd ? 12 : -4;
    if (actionId === "samu_support") score += risk.victim ? 12 : -3;
    if (actionId === "fire_support") score += risk.fire || risk.weather ? 12 : -3;
    if (actionId === "civil_defense") score += risk.weather ? 10 : -2;
    if (actionId === "keep_line") score += risk.weapon || risk.victim ? 6 : 1;
    if (actionId === "reroute") score += (call?.locationIntel?.confidence || call?.protocol?.locationConfidence || 0) < 0.78 ? 6 : 2;
    if (actionId === "close") score += normalize(call).stage >= 3 ? 8 : -14;
    if (actionId === "pm_backup" && types.has("pm")) score -= 1;
    if (actionId === "samu_support" && types.has("samu")) score += 2;
    if (actionId === "fire_support" && types.has("bombeiros")) score += 2;
    return score;
  }

  function act(state, callId, actionId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call) return { ok: false, reason: "call_not_found" };
    const radio = normalize(call);
    if (!radio.active || radio.finalized) return { ok: false, reason: "radio_not_active" };
    const action = byId(actionId);
    const delta = actionScore(call, action.id);
    radio.scoreDelta += delta;
    radio.actions.push({ id: action.id, at: new Date().toISOString(), delta });
    pushLog(radio, "OPERADOR", `${action.label} (${delta >= 0 ? "+" : ""}${delta} pts)`, delta >= 0 ? "success" : "warning");

    if (action.id === "close" && radio.stage < 3) {
      pushLog(radio, "RÁDIO", "Encerramento solicitado antes de confirmação de controle. Campo informa necessidade de nova verificação.", "danger");
      radio.stage = Math.min(3, radio.stage + 1);
      return { ok: true, call, radio, finalized: false };
    }

    if (radio.stage < 3) {
      radio.stage += 1;
      pushLog(radio, "RÁDIO", stageText(call, radio.stage), radio.stage >= 3 ? "success" : "info");
      return { ok: true, call, radio, finalized: false };
    }
    return finalize(state, callId);
  }

  function gradeFor(score) {
    return score >= 92 ? "S" : score >= 80 ? "A" : score >= 68 ? "B" : score >= 55 ? "C" : "D";
  }

  function finalize(state, callId) {
    const shift = state?.dispatch?.shift;
    const call = shift?.calls?.find((item) => item.id === callId);
    if (!call) return { ok: false, reason: "call_not_found" };
    const radio = normalize(call);
    const preliminary = radio.preliminaryOutcome || { quality: 0, xp: 0, rep: 0, resolved: false };
    const baseScore = (preliminary.resourceDispatch?.finalScore || 55) * 0.55 + (preliminary.triage?.finalScore || 55) * 0.2 + (preliminary.protocol?.finalProtocolScore || 55) * 0.15 + 10;
    const finalScore = Math.max(0, Math.min(100, Math.round(baseScore + radio.scoreDelta)));
    const grade = gradeFor(finalScore);
    const qualityBonus = grade === "S" ? 3 : grade === "A" ? 2 : grade === "B" ? 1 : grade === "C" ? 0 : -4;
    const resolved = !!preliminary.resolved && finalScore >= 55;
    const finalOutcome = {
      ...preliminary,
      quality: Number(preliminary.quality || 0) + qualityBonus,
      xp: Math.max(0, Math.round(Number(preliminary.xp || 0) * (grade === "S" ? 1.15 : grade === "A" ? 1.08 : grade === "D" ? 0.55 : 1))),
      rep: Number(preliminary.rep || 0) + (grade === "S" ? 2 : grade === "A" ? 1 : grade === "D" ? -4 : grade === "C" ? -1 : 0),
      resolved,
      failed: !resolved,
      radio: { grade, finalScore, scoreDelta: radio.scoreDelta, actions: [...radio.actions], log: [...radio.log] },
    };
    radio.active = false;
    radio.finalized = true;
    radio.finalizedAt = new Date().toISOString();
    radio.grade = grade;
    radio.finalScore = finalScore;
    radio.finalOutcome = finalOutcome;
    pushLog(radio, "SISTEMA", resolved ? `Ocorrência encerrada com controle em campo. Nota rádio ${grade}.` : `Ocorrência encerrada com falhas de acompanhamento. Nota rádio ${grade}.`, resolved ? "success" : "danger");
    return { ok: true, call, radio, finalized: true, finalOutcome };
  }

  function availableActions(call) {
    const radio = normalize(call);
    if (!radio?.active || radio.finalized) return [];
    if (radio.stage >= 3) return ACTIONS.filter((a) => ["close", "reroute", "keep_line"].includes(a.id));
    return ACTIONS.filter((a) => a.id !== "close" || radio.stage >= 2);
  }

  return { VERSION, ACTIONS, normalize, start, act, finalize, availableActions, riskProfile, scenario };
})();
