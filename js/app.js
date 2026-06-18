(() => {
  "use strict";
  const BUILD = "CENTRAL190-1300-F19-TRIAGE-DISPATCH-20260618-112800-BRT";
  let state = C190_Save.load();
  let tickTimer = null;
  let autosaveTick = 0;
  let selectedMapCallId = null;
  const REGION_PRESETS = {
    sp: { lat: -23.55052, lng: -46.63331, label: "São Paulo — SP" },
    rio: { lat: -22.90685, lng: -43.1729, label: "Rio de Janeiro — RJ" },
    brasilia: { lat: -15.79389, lng: -47.88278, label: "Brasília — DF" },
    bh: { lat: -19.91668, lng: -43.93449, label: "Belo Horizonte — MG" },
    recife: { lat: -8.04756, lng: -34.877, label: "Recife — PE" },
    poa: { lat: -30.03465, lng: -51.21766, label: "Porto Alegre — RS" },
    salvador: { lat: -12.97775, lng: -38.50163, label: "Salvador — BA" },
    curitiba: { lat: -25.4284, lng: -49.2733, label: "Curitiba — PR" },
    manaus: { lat: -3.11903, lng: -60.02173, label: "Manaus — AM" },
  };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s) =>
    String(s ?? "").replace(
      /[&<>'"]/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[c],
    );
  function toast(message, type = "success") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    $("#toastRegion").appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }
  function persist() {
    C190_Save.save(state);
    renderAll();
  }
  function showScreen(name) {
    $$(".screen").forEach((s) =>
      s.classList.toggle("active", s.id === `screen-${name}`),
    );
    $$(".nav-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.screen === name),
    );
    $("#sidebar").classList.remove("open");
    $("#mainContent").scrollTop = 0;
    window.scrollTo(0, 0);
    window.C190_Assets?.markScreen?.(name);
    const labels = {
      dashboard: "Comando operacional",
      dispatch: "Plantão contínuo",
      map: "Mapa operacional real",
      content: "Operações e conteúdo",
      statistics: "Estatísticas avançadas",
      career: "Progressão profissional",
      training: "Capacitação",
      goals: "Metas de carreira",
      achievements: "Reconhecimento",
      reports: "Histórico operacional",
      release: "Homologação e visual oficial",
      settings: "Sistema e segurança",
    };
    $("#screenSubtitle").textContent = labels[name] || "Central 190";
    renderAll();
    if (["map", "dispatch"].includes(name)) {
      setTimeout(() => C190_Map.invalidate(), 40);
    }
  }
  function rank() {
    return C190_Career.ranks[C190_Career.rankIndex(state.career.rankId)];
  }
  function renderDashboard() {
    const has = !!state.profile;
    $("#careerSetup").hidden = has;
    $("#dashboardContent").hidden = !has;
    if (!has) return;
    const r = rank();
    $("#welcomeTitle").textContent =
      `${state.profile.callSign} · ${state.profile.name}`;
    $("#careerSummary").textContent =
      `${r.name} · dificuldade ${state.profile.difficulty} · ${state.career.completedCourses.length} curso(s) concluído(s)`;
    $("#rankIcon").textContent = r.icon;
    $("#rankName").textContent = r.name;
    $("#metricReputation").textContent = state.career.reputation;
    $("#repBar").style.width = `${state.career.reputation}%`;
    $("#metricXp").textContent = `${state.career.xp} XP`;
    const p = C190_Career.getPromotionStatus(state);
    const nextXp = p.next?.xp || state.career.xp;
    $("#xpBar").style.width =
      `${Math.min(100, nextXp ? (state.career.xp / nextXp) * 100 : 100)}%`;
    $("#metricShifts").textContent = state.career.totalShifts;
    $("#metricResolved").textContent =
      `${state.career.totalResolved} atendimentos`;
    const w = C190_Career.activeWarnings(state);
    $("#metricWarnings").textContent = w ? `${w} ativa(s)` : "Sem advertências";
    $("#metricConduct").textContent = w
      ? "Recupere sua conduta"
      : "Conduta excelente";
    $("#promotionPreview").innerHTML = p.next
      ? `<h3>${esc(p.next.name)}</h3><div class="requirements">${p.requirements.map((x) => `<div class="requirement ${x.ok ? "ok" : ""}"><span>${x.ok ? "✓" : "○"} ${esc(x.label)}</span><b>${x.ok ? "OK" : "Pendente"}</b></div>`).join("")}</div>`
      : `<div class="list-item">Patente máxima alcançada.</div>`;
    const active = C190_Career.goalDefs
      .filter((g) => !state.career.goals[g.id]?.claimed)
      .slice(0, 3);
    $("#goalPreview").innerHTML = active.length
      ? active
          .map((g) => {
            const v = Math.min(g.target, g.metric(state));
            return `<div class="list-item"><strong>${esc(g.name)}</strong><small>${v}/${g.target}</small><div class="progress"><i style="width:${(v / g.target) * 100}%"></i></div></div>`;
          })
          .join("")
      : '<div class="list-item">Todas as metas concluídas.</div>';
    $("#eventTimeline").innerHTML =
      state.career.events
        .slice(0, 8)
        .map(
          (e) =>
            `<div class="timeline-item"><time>${new Date(e.at).toLocaleString()}</time><div><strong>${esc(e.title)}</strong><div>${esc(e.detail)}</div></div></div>`,
        )
        .join("") || '<div class="list-item">Nenhum evento registrado.</div>';
  }
  function renderDispatch() {
    const sh = state.dispatch.shift;
    $("#startShiftBtn").textContent = sh?.active
      ? "Encerrar plantão"
      : "Iniciar plantão";
    $("#shiftStatus").textContent = sh?.active
      ? `${sh.modeLabel || "Plantão ativo"} · ${sh.elapsed}s · resolvidas ${sh.resolved} · falhas ${sh.failed} · abandonadas ${sh.abandoned}${sh.affectsCareer === false ? " · sem impacto na carreira" : ""}`
      : "Nenhum plantão ativo. Escolha um modo de jogo ou inicie um plantão de carreira.";
    const waiting = sh?.calls.filter((c) => c.status === "waiting") || [];
    $("#queueCount").textContent = waiting.length;
    $("#callQueue").innerHTML =
      waiting.map((c) => callCard(c, true)).join("") ||
      '<div class="list-item">Fila vazia.</div>';
    const active = sh?.calls.find((c) => c.id === sh.activeCallId);
    $("#activeCall").innerHTML = active
      ? activeCall(active)
      : '<div class="list-item">Nenhuma chamada em atendimento.</div>';
    const paused = sh?.calls.filter((c) => c.status === "paused") || [];
    $("#pausedCalls").innerHTML =
      paused.map((c) => callCard(c, false)).join("") ||
      '<div class="list-item">Nenhuma ocorrência pausada.</div>';
    bindDispatchButtons();
    C190_Map.render(state);
  }
  function priorityLabel(p) {
    return p === 3 ? "CRÍTICA" : p === 2 ? "ALTA" : "NORMAL";
  }
  function callCard(c, waiting) {
    const protocol = window.C190_CallProtocol?.normalize?.(c);
    const locationIntel = window.C190_LocationIntel?.normalize?.(c);
    const locationKnown = Number(locationIntel?.confidence || protocol?.locationConfidence || 0) > 0;
    const locationText = locationKnown ? `${locationIntel?.label || "Local aproximado"} · ${c.location}` : "Local aguardando bairro, rua ou referência";
    const asked = protocol?.asked?.length || 0;
    return `<div class="call-card ${c.priority === 3 ? "urgent" : waiting ? "waiting" : ""}"><div class="call-meta"><span>${priorityLabel(c.priority)}</span><span>${c.wait}s espera</span></div><strong>${esc(c.type)}</strong><span>${esc(locationText)}</span><small>${asked} pergunta(s) de protocolo · precisão ${Math.round(Number(locationIntel?.confidence || 0) * 100)}%</small><div class="call-actions"><button class="action-btn primary" data-answer="${esc(c.id)}">${waiting ? "Atender ligação" : "Retomar ligação"}</button><button class="action-btn" data-focus-call="${esc(c.id)}" ${locationKnown ? "" : "disabled"}>${locationKnown ? "Ver no mapa" : "Mapa após localização"}</button></div></div>`;
  }
  function dataChip(label, ok, value = "") {
    return `<span class="protocol-chip ${ok ? "ok" : "missing"}"><b>${esc(label)}</b>${value ? `<small>${esc(value)}</small>` : ""}</span>`;
  }
  function transcriptLine(line) {
    return `<div class="chat-line ${line.role === "operator" ? "operator" : "caller"}"><b>${line.role === "operator" ? "Operador" : "Chamador"}</b><span>${esc(line.text)}</span></div>`;
  }
  function triageButtons(call, field, list) {
    const triage = window.C190_Triage?.normalize?.(call) || {};
    return `<div class="triage-button-grid">${list.map((item) => `<button class="triage-btn ${triage[field] === item.id ? "selected" : ""}" data-triage-field="${esc(field)}" data-triage-value="${esc(item.id)}" data-call="${esc(call.id)}"><strong>${esc(item.short || item.label)}</strong><small>${esc(item.hint || item.label)}</small></button>`).join("")}</div>`;
  }
  function triagePanel(call) {
    const triage = window.C190_Triage?.normalize?.(call);
    const evaluation = window.C190_Triage?.evaluate?.(call) || { grade: "D", finalScore: 0, detail: ["triagem indisponível"], recommended: {} };
    const label = (type, id) => window.C190_Triage?.label?.(type, id) || id || "não definido";
    return `<section class="triage-panel" aria-label="Classificação operacional">
      <header><div><span class="eyebrow">TRIAGEM OPERACIONAL</span><h4>Classifique antes de despachar</h4></div><strong class="triage-grade">${esc(evaluation.grade)} · ${Number(evaluation.finalScore || 0)}/100</strong></header>
      <p class="protocol-warning">Escolha a natureza, prioridade e órgão. Erros de classificação reduzem XP, reputação e podem gerar falha mesmo com bom atendimento.</p>
      <div class="triage-summary"><span>Recomendação oculta do sistema para auditoria: ${esc(label("nature", evaluation.recommended?.nature))} · ${esc(label("priority", evaluation.recommended?.priority))} · ${esc(label("agency", evaluation.recommended?.agency))}</span></div>
      <h4>Natureza da ocorrência</h4>${triageButtons(call, "nature", window.C190_Triage?.NATURES || [])}
      <h4>Prioridade</h4>${triageButtons(call, "priority", window.C190_Triage?.PRIORITIES || [])}
      <h4>Órgão responsável</h4>${triageButtons(call, "agency", window.C190_Triage?.AGENCIES || [])}
      <div class="protocol-score triage-score"><span>Avaliação da triagem</span><strong>${esc(evaluation.grade)}</strong><div class="progress"><i style="width:${Math.max(0, Math.min(100, evaluation.finalScore || 0))}%"></i></div><small>${(evaluation.detail || []).map(esc).join(" · ")}</small></div>
    </section>`;
  }
  function activeCall(c) {
    const protocol = window.C190_CallProtocol?.normalize?.(c);
    const evaluation = window.C190_CallProtocol?.evaluate?.(c) || { percent: 0, missing: [], grade: "D", finalProtocolScore: 0, detail: [] };
    const questions = window.C190_CallProtocol?.QUESTION_BANK || [];
    const collected = protocol?.collected || {};
    const locationIntel = window.C190_LocationIntel?.normalize?.(c);
    const locationKnown = Number(locationIntel?.confidence || protocol?.locationConfidence || 0) > 0;
    const canMap = locationKnown ? "" : "disabled";
    return `<div class="call-card urgent active-protocol-card">
      <div class="call-meta"><span>${priorityLabel(c.priority)}</span><span>${c.wait}s espera</span></div>
      <h3>${esc(c.type)}</h3>
      <p>${esc(c.summary)}</p>
      <div class="protocol-score"><span>Protocolo de atendimento</span><strong>${evaluation.grade}</strong><div class="progress"><i style="width:${Math.max(0, Math.min(100, evaluation.finalProtocolScore || 0))}%"></i></div><small>${evaluation.detail.map(esc).join(" · ")}</small></div>
      <div class="protocol-data-grid">
        ${dataChip("Precisão do mapa", locationKnown, locationIntel?.label || "bloqueado")}
        ${dataChip("Bairro/setor", !!collected.neighborhood, collected.neighborhood || "")}
        ${dataChip("Rua/local", !!(collected.street || collected.address), collected.street || collected.address || "")}
        ${dataChip("Número", !!collected.number, collected.number || "")}
        ${dataChip("Referência", !!collected.reference, collected.reference || "")}
        ${dataChip("Situação", !!collected.situation)}
        ${dataChip("Vítimas", !!collected.victims)}
        ${dataChip("Arma/Risco", !!collected.weapons || !!collected.hazards)}
        ${dataChip("Segurança", !!collected.safety || !!collected.calm)}
        ${dataChip("Retorno", !!collected.caller)}
      </div>
      <div class="call-chat" aria-label="Histórico da ligação">${(protocol?.transcript || []).slice(-8).map(transcriptLine).join("")}</div>
      <h4>Perguntas fixas do operador</h4>
      <div class="question-grid">${questions.map((q) => `<button class="question-btn ${q.score < 0 ? "risk" : ""}" data-question="${esc(q.id)}" data-call="${esc(c.id)}" ${protocol?.asked?.includes(q.id) ? "disabled" : ""}><span>${esc(q.short)}</span><small>${esc(q.label)}</small></button>`).join("")}</div>
      ${triagePanel(c)}
      <button class="action-btn" data-focus-call="${esc(c.id)}" ${canMap}>${locationKnown ? "Localizar no mapa" : "Mapa bloqueado até coletar bairro/rua"}</button>
      <div class="choice-grid"><button class="choice-btn final-dispatch-btn" data-choice="0" data-call="${esc(c.id)}"><strong>Confirmar classificação e despachar</strong><small>Finaliza a ligação usando a triagem, o protocolo coletado e o despacho escolhido.</small></button></div>
      <button class="action-btn" data-pause="1">Pausar atendimento</button>
    </div>`;
  }
  function bindDispatchButtons() {
    $$("[data-answer]").forEach(
      (b) =>
        (b.onclick = () => {
          C190_Dispatch.answer(state, b.dataset.answer);
          persist();
        }),
    );
    $$("[data-question]").forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.askQuestion(state, b.dataset.call, b.dataset.question);
          persist();
          if (out?.ok) toast(out.question.score < 0 ? "Pergunta inadequada registrada no protocolo." : "Dado coletado no atendimento.", out.question.score < 0 ? "danger" : "success");
          else toast("Não foi possível registrar essa pergunta.", "warning");
        }),
    );
    $$(`[data-question]`).forEach((button) => { if (button.disabled) button.title = "Pergunta já realizada"; });
    $$(`[data-focus-call][disabled]`).forEach((button) => { button.onclick = () => toast("Colete o endereço antes de localizar no mapa.", "warning"); });
    $$(`[data-triage-field]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.setTriage(state, b.dataset.call, b.dataset.triageField, b.dataset.triageValue);
          persist();
          if (out?.ok) toast(`Triagem atualizada · nota ${out.evaluation?.grade || "N/A"}.`, "success");
          else toast("Não foi possível atualizar a triagem.", "warning");
        }),
    );
    $$(`[data-choice]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.choose(
            state,
            b.dataset.call,
            Number(b.dataset.choice),
          );
          persist();
          if (out)
            toast(
              out.call.status === "resolved"
                ? `Ocorrência resolvida · protocolo ${out.protocol?.grade || "N/A"} · triagem ${out.triage?.grade || "N/A"}.`
                : `Falha de protocolo/triagem · protocolo ${out.protocol?.grade || "N/A"} · triagem ${out.triage?.grade || "N/A"}.`,
              out.call.status === "resolved" ? "success" : "danger",
            );
        }),
    );
    $$("[data-focus-call]").forEach(
      (button) =>
        (button.onclick = () => {
          selectedMapCallId = button.dataset.focusCall;
          showScreen("map");
          setTimeout(() => C190_Map.focusCall(selectedMapCallId), 80);
        }),
    );
    const pause = $("[data-pause]");
    if (pause)
      pause.onclick = () => {
        C190_Dispatch.pause(state);
        persist();
      };
  }
  function renderCareer() {
    const idx = C190_Career.rankIndex(state.career.rankId);
    $("#rankTrack").innerHTML = C190_Career.ranks
      .map(
        (r, i) =>
          `<div class="rank-item ${i < idx ? "unlocked" : ""} ${i === idx ? "current" : ""}"><div class="rank-marker">${esc(r.icon)}</div><div><strong>${esc(r.name)}</strong><small>${r.xp} XP · rep. ${r.rep} · ${r.courses} cursos</small></div><span>${i < idx ? "Concluída" : i === idx ? "Atual" : "Bloqueada"}</span></div>`,
      )
      .join("");
    const perf = C190_Career.performance(state);
    $("#performanceBreakdown").innerHTML = Object.entries({
      Atendimento: perf.service,
      Disciplina: perf.discipline,
      Reputação: perf.reputation,
      Capacitação: perf.training,
    })
      .map(
        ([k, v]) =>
          `<div class="list-item"><div class="requirement"><span>${k}</span><b>${v}%</b></div><div class="progress"><i style="width:${v}%"></i></div></div>`,
      )
      .join("");
    const active = state.career.warnings.filter((w) => !w.expired);
    $("#warningList").innerHTML = active.length
      ? active
          .map(
            (w) =>
              `<div class="warning-card"><strong>${esc(w.title)}</strong><p>${esc(w.reason)}</p><small>${w.remainingShifts} plantão(ões) para expirar · reincidências ${w.count}</small></div>`,
          )
          .join("")
      : '<div class="list-item">Nenhuma advertência ativa.</div>';
    $("#specializationList").innerHTML = C190_Career.specs
      .map((sp) => {
        const ok = sp.requires.every((id) =>
          state.career.completedCourses.includes(id),
        );
        return `<div class="specialization-card ${state.career.specialization === sp.id ? "selected" : ""}"><div class="card-icon">${sp.icon}</div><h3>${esc(sp.name)}</h3><p>${esc(sp.desc)}</p><small>Requer: ${sp.requires.map((id) => C190_Career.courses.find((c) => c.id === id)?.name).join(" + ")}</small><button class="action-btn primary" data-spec="${sp.id}" ${ok ? "" : "disabled"}>${state.career.specialization === sp.id ? "Selecionada" : ok ? "Especializar" : "Bloqueada"}</button></div>`;
      })
      .join("");
    $$("[data-spec]").forEach(
      (b) =>
        (b.onclick = () => {
          if (C190_Career.selectSpecialization(state, b.dataset.spec)) {
            persist();
            toast("Especialização atualizada.");
          }
        }),
    );
  }
  function renderCourses() {
    $("#courseGrid").innerHTML = C190_Career.courses
      .map((c) => {
        const done = state.career.completedCourses.includes(c.id);
        const locked = C190_Career.rankIndex(state.career.rankId) < c.minRank;
        return `<article class="course-card ${locked ? "locked" : ""}"><div class="card-icon">${c.icon}</div><h3>${esc(c.name)}</h3><p>${esc(c.desc)}</p><div class="tag-row"><span class="tag">Custo ${c.cost} XP</span><span class="tag">Patente ${C190_Career.ranks[c.minRank].name}</span></div><button class="action-btn primary" data-course="${c.id}" ${done || locked ? "disabled" : ""}>${done ? "Concluído" : locked ? "Bloqueado" : "Matricular"}</button></article>`;
      })
      .join("");
    $$("[data-course]").forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Career.completeCourse(state, b.dataset.course);
          if (out.ok) {
            persist();
            toast(`Curso concluído: ${out.course.name}`);
            if (out.promotion) showPromotion(out.promotion);
          } else
            toast(
              out.reason === "xp"
                ? "XP insuficiente para este curso."
                : "Curso indisponível.",
              "warning",
            );
        }),
    );
  }
  function renderGoals() {
    $("#goalsGrid").innerHTML = C190_Career.goalDefs
      .map((g) => {
        const rec = state.career.goals[g.id] || {};
        const v = Math.min(g.target, g.metric(state));
        return `<article class="goal-card"><h3>${rec.claimed ? "✓ " : ""}${esc(g.name)}</h3><p>${esc(g.desc)}</p><div class="progress"><i style="width:${(v / g.target) * 100}%"></i></div><strong>${v}/${g.target}</strong><span class="tag">Recompensa ${g.reward.xp} XP${g.reward.rep ? ` + ${g.reward.rep} reputação` : ""}</span></article>`;
      })
      .join("");
  }
  function renderAchievements() {
    $("#achievementGrid").innerHTML = C190_Career.achievements
      .map((a) => {
        const on = state.career.achievements.includes(a.id);
        return `<article class="achievement-card ${on ? "" : "locked"}"><div class="card-icon">${a.icon}</div><h3>${esc(a.name)}</h3><p>${esc(a.desc)}</p><span class="tag">${on ? "Desbloqueada" : "Bloqueada"}</span></article>`;
      })
      .join("");
  }
  function renderReports() {
    $("#reportList").innerHTML =
      state.dispatch.reports
        .map(
          (r, i) =>
            `<article class="report-card"><div class="requirement"><h3>${esc(r.modeLabel || "Plantão de carreira")} #${state.dispatch.reports.length - i}</h3><b>Nota ${r.grade} · ${r.score}/100</b></div><small>${new Date(r.startedAt).toLocaleString()} · duração ${r.duration}s · ${esc(C190_Content.cityById(r.cityId || "sp").name)}${r.affectsCareer === false ? " · sem impacto na carreira" : ""}</small><div class="report-stats"><div class="report-stat"><strong>${r.resolved}</strong><span>Resolvidas</span></div><div class="report-stat"><strong>${r.failed}</strong><span>Falhas</span></div><div class="report-stat"><strong>${r.abandoned}</strong><span>Abandonadas</span></div><div class="report-stat"><strong>${r.calls.length}</strong><span>Chamadas</span></div><div class="report-stat"><strong>${r.grade}</strong><span>Nota</span></div></div></article>`,
        )
        .join("") || '<div class="panel">Nenhum relatório disponível.</div>';
  }
  function regionPresetKey(center) {
    const match = Object.entries(REGION_PRESETS).find(
      ([, preset]) =>
        Math.abs(Number(center.lat) - preset.lat) < 0.0002 &&
        Math.abs(Number(center.lng) - preset.lng) < 0.0002,
    );
    return match?.[0] || "custom";
  }
  function renderMap() {
    const allCalls = (state.dispatch.shift?.calls || []).filter((call) => call && call.status !== "scheduled");
    const calls = allCalls;
    const mappedCalls = C190_Map.callsOf(state);
    const center = C190_Map.centerOf(state);
    const activeShift = !!state.dispatch.shift?.active;
    $("#mapModeSelect").value = state.settings.mapMode || "auto";
    $("#mapRegionSelect").value = regionPresetKey(center);
    $("#mapRegionSelect").disabled = activeShift;
    $("#useMyRegionBtn").disabled = activeShift;
    $("#mapRegionLabel").textContent = center.label;
    $("#mapIncidentCount").textContent = `${mappedCalls.length}/${calls.length}`;
    $("#mapIncidentList").innerHTML =
      calls
        .map(
          (call) =>
            (() => { const loc = C190_LocationIntel?.normalize?.(call); const visible = C190_Map.locationVisible(call); return `<button class="map-incident-card ${selectedMapCallId === call.id ? "selected" : ""} ${visible ? "" : "locked"}" data-map-select="${esc(call.id)}"><span class="map-priority p${call.priority}">${priorityLabel(call.priority)}</span><strong>${esc(call.type)}</strong><small>${esc(loc?.label || "Sem localização")} · ${esc(visible ? call.location : "pergunte bairro/endereço")} · ${C190_Map.statusText(call.status)}</small></button>`; })(),
        )
        .join("") ||
      '<div class="list-item">Inicie um plantão ou colete localização para visualizar ocorrências no mapa.</div>';

    if (!calls.some((call) => call.id === selectedMapCallId)) {
      selectedMapCallId =
        calls.find((call) => call.status === "active")?.id ||
        calls[0]?.id ||
        null;
    }
    const selected = calls.find((call) => call.id === selectedMapCallId);
    $("#mapSelectedCall").innerHTML = selected
      ? (() => { const display = C190_Map.displayLocation(selected); const loc = C190_LocationIntel?.normalize?.(selected); const missing = C190_LocationIntel?.missingForPrecision?.(selected) || []; return `<div class="selected-map-call"><span class="map-priority p${selected.priority}">${priorityLabel(selected.priority)}</span><h3>${esc(selected.type)}</h3><p>${esc(selected.summary)}</p><div class="location-intel-card stage-${esc(loc?.stage || "none")}"><strong>${esc(loc?.label || "Sem localização")}</strong><span>${esc(loc?.hint || "Colete dados na ligação para liberar o mapa.")}</span><small>${missing.length ? `Falta para precisão: ${esc(missing.join(", "))}` : "Localização precisa suficiente para despacho."}</small></div><div class="coordinate-box"><span>${esc(display?.visible ? selected.location : "Mapa bloqueado até coletar bairro, rua ou referência")}</span><code>${display?.visible ? `${Number(display.lat).toFixed(5)}, ${Number(display.lng).toFixed(5)} · raio ~${Math.round(display.radiusMeters || 0)}m` : "sem coordenada operacional"}</code></div><div class="button-row">${["waiting", "paused"].includes(selected.status) ? `<button class="action-btn primary" data-map-answer-inline="${esc(selected.id)}">Atender agora</button>` : ""}<button class="action-btn" data-open-dispatch="1">Abrir plantão</button></div></div>`; })()
      : '<div class="list-item">Selecione uma ocorrência no mapa.</div>';

    $("#mapSettingsSummary").textContent =
      `${center.label} · modo ${state.settings.mapMode || "auto"} · privacidade aproximada`;

    $$("[data-map-select]").forEach(
      (button) =>
        (button.onclick = () => {
          selectedMapCallId = button.dataset.mapSelect;
          renderMap();
          if (C190_Map.locationVisible(calls.find((call) => call.id === selectedMapCallId))) C190_Map.focusCall(selectedMapCallId);
          else toast("Colete bairro, rua ou referência antes de focar no mapa.", "warning");
        }),
    );
    $$("[data-map-answer-inline]").forEach(
      (button) =>
        (button.onclick = () => {
          if (C190_Dispatch.answer(state, button.dataset.mapAnswerInline)) {
            persist();
            showScreen("dispatch");
            toast("Ocorrência aberta para atendimento.");
          }
        }),
    );
    $$("[data-open-dispatch]").forEach(
      (button) => (button.onclick = () => showScreen("dispatch")),
    );
    C190_Map.render(state);
  }


  function launchAllowed() {
    if (!state.profile) {
      showScreen("dashboard");
      toast("Crie sua carreira antes de iniciar um modo de jogo.", "warning");
      return false;
    }
    if (state.dispatch.shift?.active) {
      showScreen("dispatch");
      toast("Já existe um plantão ativo. Conclua ou encerre o turno atual.", "warning");
      return false;
    }
    return true;
  }

  function renderContent() {
    C190_Content.normalize(state);
    const content = state.content;
    const activeCity = C190_Content.cityById(content.activeCityId);
    $("#contentActiveCity").textContent = activeCity.name;

    const challenges = C190_Content.ensureChallenges(state);
    $("#challengeGrid").innerHTML = ["daily", "weekly"]
      .map((kind) => {
        const record = challenges[kind];
        const def = C190_Content.challengeDef(kind, record);
        const ready = record.progress >= def.target;
        const label = kind === "daily" ? "DESAFIO DIÁRIO" : "DESAFIO SEMANAL";
        return `<div class="challenge-card ${record.claimed ? "completed" : ready ? "ready" : ""}">
          <span class="eyebrow">${label}</span>
          <h3>${esc(def.name)}</h3>
          <p>${esc(def.desc)}</p>
          <div class="progress"><i style="width:${Math.min(100, (record.progress / def.target) * 100)}%"></i></div>
          <div class="challenge-footer"><strong>${record.progress}/${def.target}</strong><span>+${def.reward.xp} XP · +${def.reward.rep} rep.</span></div>
          <div class="button-row">
            <button class="action-btn" data-launch-challenge="${kind}" ${record.claimed ? "disabled" : ""}>Jogar desafio</button>
            <button class="action-btn primary" data-claim-challenge="${kind}" ${ready && !record.claimed ? "" : "disabled"}>${record.claimed ? "Resgatado" : "Resgatar"}</button>
          </div>
        </div>`;
      })
      .join("");

    const rankIndex = C190_Career.rankIndex(state.career.rankId);
    $("#specialProgress").textContent = `${content.special.completed.length}/${C190_Content.specialCases.length}`;
    $("#specialOperationsGrid").innerHTML = C190_Content.specialCases
      .map((special) => {
        const locked = rankIndex < special.minRank;
        const completed = content.special.completed.includes(special.id);
        const best = content.special.bestScores[special.id] || 0;
        const requiredRank = C190_Career.ranks[special.minRank]?.name || "Operador III";
        return `<article class="special-operation-card ${locked ? "locked" : ""} ${completed ? "completed" : ""}">
          <div class="special-icon">${special.icon}</div>
          <div class="special-body"><div class="tag-row"><span class="tag">${esc(C190_Content.cityById(special.cityId).name)}</span><span class="tag">${special.templateIds.length} chamadas</span></div>
          <h3>${esc(special.name)}</h3><p>${esc(special.desc)}</p>
          <small>${completed ? `Concluída · melhor nota ${best}` : `Requer ${esc(requiredRank)} · recompensa ${special.reward.xp} XP`}</small></div>
          <button class="action-btn primary" data-special="${special.id}" ${locked ? "disabled" : ""}>${locked ? "Bloqueada" : completed ? "Jogar novamente" : "Iniciar operação"}</button>
        </article>`;
      })
      .join("");

    const unlockedCities = C190_Content.cities.filter((city) => C190_Content.cityUnlocked(state, city));
    $("#cityModuleProgress").textContent = `${unlockedCities.length}/${C190_Content.cities.length}`;
    $("#cityModulesGrid").innerHTML = C190_Content.cities
      .map((city) => {
        const unlocked = C190_Content.cityUnlocked(state, city);
        const active = content.activeCityId === city.id;
        const stats = content.stats.cityStats[city.id] || { shifts: 0, resolved: 0, bestScore: 0 };
        return `<article class="city-module-card ${active ? "active" : ""} ${unlocked ? "" : "locked"}">
          <div class="city-code">${esc(city.icon)}</div><h3>${esc(city.name)}</h3><p>${esc(city.profile)}</p>
          <div class="city-module-stats"><span>${stats.shifts} turnos</span><span>${stats.resolved} resolvidas</span><span>melhor ${stats.bestScore}</span></div>
          <button class="action-btn ${active ? "primary" : ""}" data-city-module="${city.id}" ${unlocked && !active ? "" : "disabled"}>${active ? "Cidade ativa" : unlocked ? "Ativar módulo" : `Libera em ${city.unlockShifts} plantões`}</button>
        </article>`;
      })
      .join("");

    $("#sandboxCity").innerHTML = unlockedCities
      .map((city) => `<option value="${city.id}">${esc(city.name)}</option>`)
      .join("");
    $("#sandboxCity").value = unlockedCities.some((city) => city.id === content.sandbox.cityId)
      ? content.sandbox.cityId
      : activeCity.id;
    $("#sandboxCallCount").value = content.sandbox.callCount;
    $("#sandboxArrivalGap").value = String(content.sandbox.arrivalGap);
    $("#sandboxPriority").value = content.sandbox.priorityMix;
    $("#sandboxCategory").value = content.sandbox.templateSet;

    $("#expansionRegistry").innerHTML = C190_Content.expansionRegistry
      .map(
        (pack) => `<div class="expansion-card"><span class="expansion-status">${pack.status === "slot-ready" ? "SLOT PRONTO" : "FUTURO"}</span><h3>${esc(pack.name)}</h3><p>${esc(pack.detail)}</p><small>${esc(pack.type)} · API ${pack.api}</small></div>`,
      )
      .join("");

    $$('[data-launch-challenge]').forEach((button) => {
      button.onclick = () => {
        if (!launchAllowed()) return;
        const shift = C190_Content.launchChallenge(state, button.dataset.launchChallenge);
        if (!shift) return toast("Não foi possível iniciar o desafio.", "warning");
        persist();
        showScreen("dispatch");
        toast("Desafio iniciado.");
      };
    });
    $$('[data-claim-challenge]').forEach((button) => {
      button.onclick = () => {
        const result = C190_Content.claimChallenge(state, button.dataset.claimChallenge);
        if (!result.ok) return toast("O desafio ainda não está pronto para resgate.", "warning");
        persist();
        toast(`Recompensa resgatada: +${result.def.reward.xp} XP.`);
      };
    });
    $$('[data-special]').forEach((button) => {
      button.onclick = () => {
        if (!launchAllowed()) return;
        const result = C190_Content.launchSpecial(state, button.dataset.special);
        if (!result.ok) return toast("Operação especial indisponível para a patente atual.", "warning");
        persist();
        showScreen("dispatch");
        toast(`Operação iniciada: ${result.special.name}`);
      };
    });
    $$('[data-city-module]').forEach((button) => {
      button.onclick = () => {
        const result = C190_Content.selectCity(state, button.dataset.cityModule);
        if (!result.ok) return toast(result.reason === "active_shift" ? "Encerre o plantão antes de trocar de cidade." : "Módulo ainda bloqueado.", "warning");
        persist();
        C190_Map.fit(state);
        toast(`Módulo ativado: ${result.city.name}`);
      };
    });
  }

  function renderStatistics() {
    const summary = C190_Content.statsSummary(state);
    const playMinutes = Math.round(summary.totalPlaySeconds / 60);
    const metrics = [
      [summary.totalReports, "Relatórios"],
      [`${summary.successRate}%`, "Taxa de resolução"],
      [summary.averageScore, "Nota média"],
      [summary.bestScore, "Melhor nota"],
      [summary.perfectShifts, "Turnos perfeitos"],
      [`${playMinutes} min`, "Tempo operacional"],
    ];
    $("#statisticsMetrics").innerHTML = metrics
      .map(([value, label]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`)
      .join("");

    const modeLabels = {
      career: "Carreira",
      challenge_daily: "Desafio diário",
      challenge_weekly: "Desafio semanal",
      special: "Operação especial",
      sandbox: "Sandbox",
    };
    const modeEntries = Object.entries(summary.modeCounts);
    const maxMode = Math.max(1, ...modeEntries.map(([, value]) => value));
    $("#modeStatistics").innerHTML = modeEntries.length
      ? modeEntries
          .map(([mode, value]) => `<div class="bar-stat"><div><span>${modeLabels[mode] || esc(mode)}</span><b>${value}</b></div><div class="progress"><i style="width:${(value / maxMode) * 100}%"></i></div></div>`)
          .join("")
      : '<div class="list-item">Nenhum modo concluído.</div>';

    const gradeEntries = ["S", "A", "B", "C", "D"].map((grade) => [grade, summary.gradeCounts[grade] || 0]);
    const maxGrade = Math.max(1, ...gradeEntries.map(([, value]) => value));
    $("#gradeStatistics").innerHTML = gradeEntries
      .map(([grade, value]) => `<div class="bar-stat"><div><span>Nota ${grade}</span><b>${value}</b></div><div class="progress"><i style="width:${(value / maxGrade) * 100}%"></i></div></div>`)
      .join("");

    const cityEntries = Object.entries(summary.cityStats).sort((a, b) => b[1].shifts - a[1].shifts);
    $("#cityStatistics").innerHTML = cityEntries.length
      ? `<div class="city-stat-head"><span>Cidade</span><span>Turnos</span><span>Resolvidas</span><span>Melhor nota</span></div>${cityEntries
          .map(([cityId, cityStats]) => `<div class="city-stat-row"><strong>${esc(C190_Content.cityById(cityId).name)}</strong><span>${cityStats.shifts}</span><span>${cityStats.resolved}</span><span>${cityStats.bestScore}</span></div>`)
          .join("")}`
      : '<div class="list-item">As estatísticas por cidade aparecerão após o primeiro turno.</div>';

    $("#recentResults").innerHTML = state.dispatch.reports.slice(0, 8)
      .map((report) => `<div class="recent-result"><div><strong>${esc(report.modeLabel || "Plantão")}</strong><small>${esc(C190_Content.cityById(report.cityId || "sp").name)} · ${new Date(report.startedAt).toLocaleString()}</small></div><div class="result-score"><b>${report.score}</b><span>${report.grade}</span></div></div>`)
      .join("") || '<div class="list-item">Nenhum resultado registrado.</div>';
  }


  function releaseCheckMarkup(items) {
    return items.map((item) => `<div class="release-check ${item.ok ? "ok" : "pending"}"><span>${item.ok ? "✓" : "!"}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.detail)}</small></div></div>`).join("");
  }
  function releaseUiCopy() {
    const copies = {
      "pt-BR": { approved: "Itens aprovados", schema: "Schema do save", difficulty: "Dificuldade", connectivity: "Conectividade", online: "Online", offline: "Offline", rcPass: "RC APROVADO", rcReview: "RC EM HOMOLOGAÇÃO", coreOnline: "Mapa real disponível quando o provedor responder. Todo o núcleo do jogo permanece preparado para funcionar offline.", coreOffline: "Sem conexão: interface, save, carreira, conteúdo e mapa tático continuam disponíveis.", workerOk: "Service Worker compatível", workerNo: "Service Worker indisponível neste navegador", escalation: "Escalada", abandonment: "Abandono", pace: "Ritmo", localData: "Dados somente no aparelho", privacyText: "Sem telemetria, sem conta obrigatória e sem envio do save para a nuvem.", localUse: "Uso local", region: "Região", approx: "Localização aproximada", active: "ativa", inactive: "não usada", telemetry: "Telemetria: desativada" },
      en: { approved: "Approved items", schema: "Save schema", difficulty: "Difficulty", connectivity: "Connectivity", online: "Online", offline: "Offline", rcPass: "RC APPROVED", rcReview: "RC UNDER REVIEW", coreOnline: "The real map is available when the provider responds. The entire game core remains ready for offline use.", coreOffline: "Offline: interface, save, career, content and tactical map remain available.", workerOk: "Service Worker supported", workerNo: "Service Worker unavailable in this browser", escalation: "Escalation", abandonment: "Abandonment", pace: "Pace", localData: "Data stored on this device", privacyText: "No telemetry, no mandatory account and no cloud save upload.", localUse: "Local use", region: "Region", approx: "Approximate location", active: "active", inactive: "not used", telemetry: "Telemetry: disabled" },
      es: { approved: "Elementos aprobados", schema: "Esquema de guardado", difficulty: "Dificultad", connectivity: "Conectividad", online: "En línea", offline: "Sin conexión", rcPass: "RC APROBADO", rcReview: "RC EN HOMOLOGACIÓN", coreOnline: "El mapa real está disponible cuando el proveedor responde. Todo el núcleo permanece preparado para funcionar sin conexión.", coreOffline: "Sin conexión: interfaz, guardado, carrera, contenido y mapa táctico siguen disponibles.", workerOk: "Service Worker compatible", workerNo: "Service Worker no disponible en este navegador", escalation: "Escalada", abandonment: "Abandono", pace: "Ritmo", localData: "Datos solo en el dispositivo", privacyText: "Sin telemetría, sin cuenta obligatoria y sin envío del guardado a la nube.", localUse: "Uso local", region: "Región", approx: "Ubicación aproximada", active: "activa", inactive: "no usada", telemetry: "Telemetría: desactivada" }
    };
    return copies[C190_I18N.language] || copies["pt-BR"];
  }

  function renderRelease() {
    C190_Release.normalize(state);
    const ui = releaseUiCopy();
    const checklist = C190_Release.releaseChecklist(state);
    const device = state.release.lastDeviceAudit || C190_Release.deviceAudit();
    const privacy = C190_Release.privacySummary(state);
    const balance = C190_Release.profileFor(state);
    const install = C190_Release.installStatus();
    const passed = checklist.filter((item) => item.ok).length;
    const overall = checklist.every((item) => item.ok);
    $("#releaseStatusBadge").textContent = overall ? ui.rcPass : ui.rcReview;
    $("#releaseStatusBadge").classList.toggle("ok", overall);
    $("#releaseMetrics").innerHTML = [
      [`${passed}/${checklist.length}`, ui.approved],
      [state.schema, ui.schema],
      [balance.label, ui.difficulty],
      [navigator.onLine ? ui.online : ui.offline, ui.connectivity],
    ].map(([value, label]) => `<article class="metric-card"><span>${esc(label)}</span><strong>${esc(value)}</strong></article>`).join("");
    $("#releaseChecklist").innerHTML = releaseCheckMarkup(checklist);
    $("#deviceAuditOutput").innerHTML = releaseCheckMarkup(device.checks || []);
    $("#offlineReleaseStatus").innerHTML = `<strong>${esc(install.label)}</strong><p>${navigator.onLine ? ui.coreOnline : ui.coreOffline}</p><small>${"serviceWorker" in navigator ? ui.workerOk : ui.workerNo}</small>`;
    $("#installAppBtn").disabled = install.code === "installed";
    $("#balanceProfileCard").innerHTML = `<strong>${esc(balance.label)}</strong><p>${esc(balance.description)}</p><div class="release-mini-grid"><span>${esc(ui.escalation)}: ${balance.escalationAt}s</span><span>${esc(ui.abandonment)}: ${balance.abandonLimit}s</span><span>${esc(ui.pace)}: ${Math.round(balance.arrivalFactor * 100)}%</span><span>Balance v${C190_Release.BALANCE_VERSION}</span></div>`;
    $("#privacyReleaseCard").innerHTML = `<strong>${esc(ui.localData)}</strong><p>${esc(ui.privacyText)}</p><div class="release-mini-grid"><span>${esc(ui.localUse)}: ${esc(privacy.storageLabel)}</span><span>${esc(ui.region)}: ${esc(privacy.mapCenterLabel)}</span><span>${esc(ui.approx)}: ${privacy.approximateLocation ? esc(ui.active) : esc(ui.inactive)}</span><span>${esc(ui.telemetry)}</span></div>`;
  }


  function renderAssetsAudit() {
    const d = window.C190_Assets?.diagnostics?.();
    const summary = $("#assetAuditSummary");
    const list = $("#assetAuditList");
    if (!summary || !list) return;
    if (!d) {
      summary.textContent = "Módulo de assets indisponível.";
      list.innerHTML = "";
      return;
    }
    summary.textContent = d.ok
      ? `Identidade visual ativa: ${d.loaded}/${d.required} assets carregados.`
      : `Modo seguro visual: ${d.missing.length} asset(s) ausente(s), sem quebrar o jogo.`;
    const rows = window.C190_Assets.required.map((src) => {
      const ok = !d.missing.includes(src);
      return `<div class="asset-row ${ok ? "ok" : "warn"}"><strong>${ok ? "✓" : "!"}</strong> ${esc(src)}</div>`;
    }).join("");
    list.innerHTML = rows;
  }

  function renderSettings() {
    C190_Release.normalize(state);
    $("#largeTextToggle").checked = state.settings.largeText;
    $("#reduceMotionToggle").checked = state.settings.reduceMotion;
    $("#highContrastToggle").checked = state.settings.highContrast;
    $("#largeTargetsToggle").checked = state.settings.largeTargets;
    $("#screenReaderHintsToggle").checked = state.settings.screenReaderHints;
    C190_Release.applyAccessibility(state);
    $("#saveStatus").textContent =
      `Schema ${state.schema} · versão ${state.version} · atualizado ${new Date(state.updatedAt).toLocaleString()} · backup ${C190_Save.storageInfo().hasBackup ? "disponível" : "ainda não criado"}`;
  }
  function renderAll() {
    C190_AntiBreak.safe(
      () => {
        renderDashboard();
        renderDispatch();
        renderCareer();
        renderCourses();
        renderGoals();
        renderAchievements();
        renderReports();
        renderMap();
        renderContent();
        renderStatistics();
        renderRelease();
        renderSettings();
      },
      () => {
        $("#fatalFallback").hidden = false;
      },
    );
  }
  function showPromotion(r) {
    $("#promotionTitle").textContent = "Promoção conquistada";
    $("#promotionText").textContent =
      `Você foi promovido para ${r.name}. Novos cursos e responsabilidades foram liberados.`;
    $("#promotionDialog").showModal();
  }
  function shiftEnded(e) {
    persist();
    const r = e.detail.report;
    $("#shiftReportContent").innerHTML =
      `<p class="report-mode-line"><strong>${esc(r.modeLabel || "Plantão de carreira")}</strong> · ${esc(C190_Content.cityById(r.cityId || "sp").name)}${r.affectsCareer === false ? " · sem impacto na carreira" : ""}</p><div class="report-stats"><div class="report-stat"><strong>${r.grade}</strong><span>Nota</span></div><div class="report-stat"><strong>${r.score}</strong><span>Pontuação</span></div><div class="report-stat"><strong>${r.resolved}</strong><span>Resolvidas</span></div><div class="report-stat"><strong>${r.failed}</strong><span>Falhas</span></div><div class="report-stat"><strong>${r.abandoned}</strong><span>Abandonadas</span></div></div>${r.specialFirstCompletion ? '<div class="special-reward-banner">Operação especial concluída pela primeira vez. Recompensa de carreira aplicada.</div>' : ""}`;
    $("#shiftReportDialog").showModal();
    if (e.detail.promotion)
      setTimeout(() => showPromotion(e.detail.promotion), 250);
  }
  function initEvents() {
    $("#careerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#operatorName").value.trim(),
        callSign = $("#callSign").value.trim();
      if (name.length < 2 || callSign.length < 2) {
        toast("Preencha nome e nome de guerra.", "warning");
        return;
      }
      state.profile = { name, callSign, difficulty: $("#difficulty").value };
      C190_Career.addEvent(
        state,
        "career",
        "Carreira iniciada",
        `${callSign} assumiu o posto de Operador III.`,
      );
      persist();
      toast("Carreira criada com sucesso.");
    });
    $$(".nav-btn").forEach(
      (b) => (b.onclick = () => showScreen(b.dataset.screen)),
    );
    $("#menuToggle").onclick = () => $("#sidebar").classList.toggle("open");
    $("#languageSelect").value = C190_I18N.language;
    $("#languageSelect").onchange = (e) => {
      C190_I18N.setLanguage(e.target.value);
      renderAll();
    };
    $("#fullscreenBtn").onclick = async () => {
      try {
        if (!document.fullscreenElement)
          await document.documentElement.requestFullscreen();
        else await document.exitFullscreen();
      } catch {
        toast("Tela cheia não permitida neste navegador.", "warning");
      }
    };
    $("#startShiftBtn").onclick = () => {
      if (!state.profile) {
        showScreen("dashboard");
        toast("Crie sua carreira antes do primeiro plantão.", "warning");
        return;
      }
      if (state.dispatch.shift?.active) {
        if (
          confirm(
            "Encerrar o plantão atual? Chamadas pendentes serão registradas como abandonadas.",
          )
        ) {
          C190_Dispatch.forceFinish(state);
          persist();
        }
      } else {
        C190_Content.launchCareer(state);
        persist();
        toast("Plantão de carreira iniciado.");
      }
    };
    $("#launchCareerFromContentBtn").onclick = () => {
      if (!launchAllowed()) return;
      C190_Content.launchCareer(state);
      persist();
      showScreen("dispatch");
      toast("Plantão de carreira iniciado.");
    };
    $("#launchSandboxBtn").onclick = () => {
      if (!launchAllowed()) return;
      const result = C190_Content.launchSandbox(state, {
        callCount: Number($("#sandboxCallCount").value),
        arrivalGap: Number($("#sandboxArrivalGap").value),
        priorityMix: $("#sandboxPriority").value,
        templateSet: $("#sandboxCategory").value,
        cityId: $("#sandboxCity").value,
        penalties: false,
      });
      if (!result.ok) return toast("Não foi possível iniciar o Sandbox.", "warning");
      persist();
      showScreen("dispatch");
      toast("Sandbox iniciado sem impacto na carreira.");
    };
    $("#openMapScreenBtn").onclick = () => showScreen("map");
    $("#openMapSettingsBtn").onclick = () => showScreen("map");
    $("#mapFitBtn").onclick = () => C190_Map.fit(state);
    $("#retryRealMapBtn").onclick = () => {
      C190_Map.retry();
      toast("Nova tentativa de conexão com o mapa real iniciada.");
    };
    $("#mapModeSelect").onchange = (event) => {
      state.settings.mapMode = event.target.value;
      C190_Map.retry();
      persist();
    };
    $("#mapRegionSelect").onchange = (event) => {
      const preset = REGION_PRESETS[event.target.value];
      if (!preset) return;
      const city = C190_Content.cities.find((item) => item.id === event.target.value);
      if (city) {
        const result = C190_Content.selectCity(state, city.id);
        if (!result.ok) {
          renderMap();
          toast("Este módulo de cidade ainda está bloqueado na carreira.", "warning");
          return;
        }
      } else {
        state.settings.mapCenter = { ...preset };
      }
      persist();
      C190_Map.fit(state);
      toast(`Região operacional alterada para ${preset.label}.`);
    };
    $("#useMyRegionBtn").onclick = () => {
      if (state.dispatch.shift?.active) {
        toast("Encerre o plantão atual antes de mudar a região.", "warning");
        return;
      }
      if (!navigator.geolocation) {
        toast("Geolocalização não disponível neste dispositivo.", "warning");
        return;
      }
      toast("Solicitando apenas a região aproximada...", "warning");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.settings.mapCenter = {
            lat: Number(position.coords.latitude.toFixed(3)),
            lng: Number(position.coords.longitude.toFixed(3)),
            label: "Região aproximada do jogador",
          };
          persist();
          C190_Map.fit(state);
          toast("Região aproximada aplicada ao mapa.");
        },
        () => toast("Não foi possível obter sua região.", "warning"),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
      );
    };
    $("#largeTextToggle").onchange = (e) => {
      state.settings.largeText = e.target.checked;
      persist();
    };
    $("#reduceMotionToggle").onchange = (e) => {
      state.settings.reduceMotion = e.target.checked;
      persist();
    };
    $("#highContrastToggle").onchange = (e) => { state.settings.highContrast = e.target.checked; persist(); };
    $("#largeTargetsToggle").onchange = (e) => { state.settings.largeTargets = e.target.checked; persist(); };
    $("#screenReaderHintsToggle").onchange = (e) => { state.settings.screenReaderHints = e.target.checked; persist(); };
    $("#exportSaveBtn").onclick = () => C190_Save.exportData(state);
    $("#restoreBackupBtn").onclick = () => {
      try { state = C190_Save.restoreBackup(); renderAll(); toast("Backup restaurado com sucesso."); }
      catch { toast("Nenhum backup válido está disponível.", "warning"); }
    };
    $("#importSaveInput").onchange = async (e) => {
      try {
        state = await C190_Save.importData(e.target.files[0]);
        renderAll();
        toast("Save importado com sucesso.");
      } catch {
        toast("Arquivo de save inválido.", "danger");
      }
    };
    $("#resetSaveBtn").onclick = () => {
      if (
        confirm(
          "Reiniciar toda a carreira? Um backup interno do último save continuará disponível apenas até o próximo salvamento.",
        )
      ) {
        state = C190_Save.reset();
        C190_Save.save(state);
        renderAll();
        showScreen("dashboard");
        toast("Carreira reiniciada.", "warning");
      }
    };
    $("#runDiagnosticsBtn").onclick = () => {
      const d = C190_AntiBreak.diagnostics(state);
      $("#diagnosticOutput").textContent = JSON.stringify(d, null, 2);
      toast(
        d.ok ? "Diagnóstico aprovado." : "Diagnóstico encontrou pendências.",
        d.ok ? "success" : "warning",
      );
    };

    $("#runReleaseAuditBtn").onclick = () => {
      state.release.lastDeviceAudit = C190_Release.deviceAudit();
      C190_Save.save(state, { forceBackup: true });
      renderAll();
      toast(state.release.lastDeviceAudit.ok ? "Aparelho aprovado na auditoria." : "A auditoria encontrou limitações.", state.release.lastDeviceAudit.ok ? "success" : "warning");
    };
    $("#refreshOfflineBtn").onclick = () => { renderRelease(); toast("Status de instalação e conectividade atualizado."); };
    $("#installAppBtn").onclick = async () => {
      const result = await C190_Release.requestInstall();
      if (result.ok) toast("Instalação iniciada com sucesso.");
      else toast(result.reason === "installed" ? "O aplicativo já está instalado." : "Use o menu do navegador para instalar o jogo.", "warning");
      renderRelease();
    };
    $("#clearApproxLocationBtn").onclick = () => {
      C190_Release.clearApproximateLocation(state);
      persist();
      C190_Map.fit(state);
      toast("A região aproximada foi removida do save.");
    };
    $("#markReleaseNotesBtn").onclick = () => { state.release.notesSeen = true; state.release.privacySeen = true; persist(); toast("Notas de lançamento registradas como lidas."); };
    $("#closePromotionBtn").onclick = () => $("#promotionDialog").close();
    $("#closeReportBtn").onclick = () => $("#shiftReportDialog").close();
    window.addEventListener("c190:shift-ended", shiftEnded);
    window.addEventListener("c190:map-call-select", (event) => {
      selectedMapCallId = event.detail.id;
      renderMap();
    });
    window.addEventListener("c190:map-answer", (event) => {
      if (C190_Dispatch.answer(state, event.detail.id)) {
        persist();
        showScreen("dispatch");
        toast("Ocorrência aberta para atendimento.");
      }
    });
    window.addEventListener("c190:map-notice", (event) =>
      toast(event.detail.text, event.detail.type || "warning"),
    );
    window.addEventListener("resize", () => C190_Map.invalidate());
    window.addEventListener("online", renderRelease);
    window.addEventListener("offline", renderRelease);
    window.addEventListener("c190:install-ready", renderRelease);
    window.addEventListener("c190:installed", renderRelease);
    window.addEventListener("beforeunload", () => C190_Save.save(state));
  }
  function startTicker() {
    clearInterval(tickTimer);
    tickTimer = setInterval(() => {
      if (state.dispatch.shift?.active) {
        C190_Dispatch.tick(state);
        autosaveTick += 1;
        if (autosaveTick >= Math.max(3, Number(state.settings.autosaveSeconds || 5))) {
          C190_Save.save(state);
          autosaveTick = 0;
        }
        renderDispatch();
      }
    }, 1000);
  }
  function init() {
    window.C190_AppDebug = { state: () => state, renderAll, renderDispatch };
    C190_I18N.init();
    $("#languageSelect").value = C190_I18N.language;
    $("#buildLabel").textContent = `${BUILD} · 18/06/2026 10:55:00 BRT`;
    initEvents();
    renderAll();
    const requestedScreen = location.hash.replace("#", "");
    if (["dashboard", "dispatch", "map", "content", "statistics", "career", "training", "goals", "achievements", "reports", "release", "settings"].includes(requestedScreen)) showScreen(requestedScreen);
    startTicker();
    window.C190_Assets?.preload?.().then(() => renderAssetsAudit()).catch(() => renderAssetsAudit());
    window.C190_Assets?.markScreen?.(requestedScreen || "dashboard");
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("sw.js").catch(() => {});
    renderAssetsAudit();
    const diag = C190_AntiBreak.diagnostics(state);
    if (!diag.ok) console.warn("[C190] diagnostics", diag);
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
