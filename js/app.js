(() => {
  "use strict";
  const BUILD = "CENTRAL190-2600-F32-VEICULOS-PNG-SP-20260623-110500-BRT";
  let state = C190_Save.load();
  let tickTimer = null;
  let autosaveTick = 0;
  let dispatchInteractionUntil = 0;
  let dispatchDeferredRender = null;
  let selectedMapCallId = null;
  let selectedCampaignMissionId = null;
  const typedLineKeys = new Set();
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
  function voiceFirstActiveCall(force = false) {
    const call = state?.dispatch?.shift?.activeCall;
    if (!call) return;
    if (!force && call._voiceIntroPlayed) return;
    call._voiceIntroPlayed = true;
    C190_Immersion?.speakCall?.(call, state);
  }
  function voiceLatestRadio(call, force = false) {
    if (!call?.radio?.log?.length) return;
    const latest = call.radio.log[call.radio.log.length - 1];
    if (!latest?.text) return;
    if (!force && latest._voicePlayed) return;
    latest._voicePlayed = true;
    C190_Immersion?.speakRadio?.(latest.text, state);
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
    document.body.classList.remove("sidebar-open");
    $("#mainContent").scrollTop = 0;
    window.scrollTo(0, 0);
    window.C190_Assets?.markScreen?.(name);
    C190_Immersion?.screen?.(name, state);
    if (state?.profile) C190_Immersion?.play?.("beep", state);
    const labels = {
      dashboard: "Comando operacional",
      dispatch: "Plantão contínuo",
      map: "Mapa operacional e despacho",
      content: "Operações e conteúdo",
      tutorial: "Tutorial e primeira experiência",
      campaign: "Campanha operacional",
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
    if (name === "tutorial") {
      setTimeout(() => {
        const main = $("#mainContent");
        if (main) main.scrollTo({ top: 0, left: 0, behavior: "auto" });
        window.scrollTo(0, 0);
      }, 60);
    }
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

  function scrollKeyFor(element, index) {
    if (element.id) return `id:${element.id}`;
    if (element.dataset?.scrollKey) return `key:${element.dataset.scrollKey}`;
    if (element.classList?.contains("call-chat")) return "class:call-chat";
    if (element.classList?.contains("radio-log")) return "class:radio-log";
    return `scrollable:${index}`;
  }
  function captureDispatchScrollState() {
    const doc = document.scrollingElement || document.documentElement;
    const snapshot = {
      documentTop: doc?.scrollTop || window.scrollY || 0,
      mainTop: $("#mainContent")?.scrollTop || 0,
      elements: {},
      activeCallId: $("#activeCall [data-active-call]")?.dataset?.activeCall || null,
    };
    const nodes = $$("#screen-dispatch .call-chat, #screen-dispatch .radio-log, #screen-dispatch .call-list, #screen-dispatch .resource-unit-grid, #activeCall [data-active-call]");
    nodes.forEach((node, index) => {
      const key = scrollKeyFor(node, index);
      snapshot.elements[key] = {
        top: node.scrollTop || 0,
        left: node.scrollLeft || 0,
        atBottom: (node.scrollHeight - node.scrollTop - node.clientHeight) < 18,
      };
    });
    return snapshot;
  }
  function restoreDispatchScrollState(snapshot) {
    if (!snapshot) return;
    requestAnimationFrame(() => {
      const main = $("#mainContent");
      if (main) main.scrollTop = snapshot.mainTop || 0;
      const doc = document.scrollingElement || document.documentElement;
      if (doc && snapshot.documentTop > 0) doc.scrollTop = snapshot.documentTop;
      const nodes = $$("#screen-dispatch .call-chat, #screen-dispatch .radio-log, #screen-dispatch .call-list, #screen-dispatch .resource-unit-grid, #activeCall [data-active-call]");
      nodes.forEach((node, index) => {
        const saved = snapshot.elements[scrollKeyFor(node, index)];
        if (!saved) {
          if (node.classList.contains("call-chat") || node.classList.contains("radio-log")) node.scrollTop = node.scrollHeight;
          return;
        }
        if (saved.atBottom && (node.classList.contains("call-chat") || node.classList.contains("radio-log"))) node.scrollTop = node.scrollHeight;
        else node.scrollTop = Math.min(saved.top || 0, Math.max(0, node.scrollHeight - node.clientHeight));
        node.scrollLeft = saved.left || 0;
      });
    });
  }
  function typewriterClass(source, line) {
    const key = `${source}:${line?.at || ""}:${line?.role || line?.source || ""}:${String(line?.text || "").slice(0, 64)}`;
    if (typedLineKeys.has(key)) return "";
    typedLineKeys.add(key);
    return " typewriter-line";
  }

  function isDispatchScreenActive() {
    return !!$("#screen-dispatch.active");
  }

  function markDispatchInteraction(duration = 950) {
    if (!isDispatchScreenActive()) return;
    dispatchInteractionUntil = Math.max(dispatchInteractionUntil, Date.now() + duration);
  }

  function dispatchRenderIsSafe() {
    return !isDispatchScreenActive() || Date.now() >= dispatchInteractionUntil;
  }

  function nextScheduledCall(shift) {
    return (shift?.calls || [])
      .filter((call) => call && call.status === "scheduled")
      .sort((a, b) => Number(a.arrivesAt || 0) - Number(b.arrivesAt || 0))[0] || null;
  }

  function renderIncomingStrip(shift) {
    const strip = $("#incomingCallStrip");
    if (!strip) return;
    if (!shift?.active) { strip.hidden = true; strip.innerHTML = ""; return; }
    const waiting = (shift.calls || []).filter((call) => call.status === "waiting");
    const next = nextScheduledCall(shift);
    if (waiting.length) {
      strip.hidden = false;
      strip.className = "incoming-call-strip live";
      strip.innerHTML = `<strong>☎ ${waiting.length} ligação(ões) aguardando</strong><span>${esc(waiting[0].type)} · prioridade ${priorityLabel(waiting[0].priority)}</span>`;
      return;
    }
    if (next) {
      const seconds = Math.max(0, Math.ceil(Number(next.arrivesAt || 0) - Number(shift.elapsed || 0)));
      strip.hidden = false;
      strip.className = "incoming-call-strip scheduled";
      strip.innerHTML = `<strong>Próxima ligação em ${seconds}s</strong><span>${esc(next.type)} · ${esc(next.region || "Central 190")}</span>`;
      return;
    }
    strip.hidden = true;
    strip.innerHTML = "";
  }

  let liteQueueSignature = "";
  function updateDispatchLite() {
    const sh = state.dispatch.shift;
    const status = $("#shiftStatus");
    if (status) {
      status.textContent = sh?.active
        ? `${sh.modeLabel || "Plantão ativo"} · ${sh.elapsed}s · campo ${(sh.calls || []).filter((c) => c.status === "field").length} · fila ${(sh.calls || []).filter((c) => c.status === "waiting").length} · resolvidas ${sh.resolved} · falhas ${sh.failed} · abandonadas ${sh.abandoned}${sh.affectsCareer === false ? " · sem impacto na carreira" : ""}`
        : "Nenhum plantão ativo. Escolha um modo de jogo ou inicie um plantão de carreira.";
    }
    const waiting = sh?.calls?.filter((c) => c.status === "waiting") || [];
    const queueCount = $("#queueCount");
    if (queueCount) queueCount.textContent = waiting.length || 0;
    renderIncomingStrip(sh);
    const queue = $("#callQueue");
    const signature = waiting.map((c) => `${c.id}:${c.priority}:${c.status}`).join("|");
    if (queue && signature !== liteQueueSignature) {
      liteQueueSignature = signature;
      queue.innerHTML = waiting.map((c) => callCard(c, true)).join("") || '<div class="list-item">Fila vazia.</div>';
      bindDispatchButtons();
    }
  }

  function scheduleDispatchRenderAfterIdle() {
    clearTimeout(dispatchDeferredRender);
    dispatchDeferredRender = setTimeout(() => {
      if (state.dispatch.shift?.active && dispatchRenderIsSafe()) renderDispatch();
      else if (state.dispatch.shift?.active) scheduleDispatchRenderAfterIdle();
    }, 980);
  }


  function pressureLabel(level) {
    return level === "critical" ? "CRÍTICO" : level === "high" ? "ALTO" : level === "medium" ? "MODERADO" : "NORMAL";
  }

  function renderUrbanDynamicsPanel() {
    const panel = $("#urbanDynamicsPanel");
    if (!panel) return;
    const urban = window.C190_UrbanDynamics?.updateShift?.(state, state.dispatch?.shift) || window.C190_UrbanDynamics?.current?.(state);
    if (!urban) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    const levelLabel = urban.riskLevel === "critical" ? "CRÍTICO" : urban.riskLevel === "high" ? "ALTO" : urban.riskLevel === "medium" ? "MODERADO" : "NORMAL";
    panel.innerHTML = `<section class="urban-card urban-${esc(urban.riskLevel)}">
      <div class="urban-main">
        <span class="eyebrow">AMBIENTE URBANO</span>
        <h3>${esc(urban.weather.label)} · ${esc(urban.traffic.label)}</h3>
        <p>${esc(urban.period.label)} · ${esc(urban.event.label)} · ETA x${Number(urban.etaMultiplier || 1).toFixed(2)}</p>
      </div>
      <div class="urban-chip-row">
        <span>${esc(urban.weather.icon)} ${esc(urban.weather.label)}</span>
        <span>${esc(urban.traffic.icon)} ${esc(urban.traffic.label)}</span>
        <span>${esc(urban.period.icon)} ${esc(urban.period.label)}</span>
        <span>${esc(urban.event.icon)} ${esc(urban.event.label)}</span>
      </div>
      <div class="urban-impact">
        <strong>${levelLabel}</strong>
        <small>Pressão +${Number(urban.pressureBonus || 0)} · ${esc(urban.radioText || "")}</small>
      </div>
    </section>`;
  }


  function renderMajorIncidentPanel() {
    const panel = $("#majorIncidentPanel");
    if (!panel) return;
    const major = window.C190_MajorIncidents?.updateShift?.(state, state.dispatch?.shift) || window.C190_MajorIncidents?.current?.(state);
    if (!major?.active) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    const severity = major.severity || { score: 0, level: "watch", label: "Monitoramento" };
    const history = (major.history || []).slice(0, 3);
    panel.innerHTML = `<section class="major-card major-${esc(severity.level)}">
      <div class="major-main">
        <span class="eyebrow">GRANDE EVENTO / CONTINGÊNCIA</span>
        <h3>${esc(major.icon || "⚠")} ${esc(major.label || "Contingência operacional")}</h3>
        <p>${esc(major.doctrine || "Acompanhe risco, fila e recursos em campo.")}</p>
      </div>
      <div class="major-severity">
        <strong>${Number(severity.score || 0)}%</strong>
        <span>${esc(severity.label || "Monitoramento")}</span>
        <div class="cinematic-progress"><i style="width:${Math.max(4, Math.min(100, Number(severity.score || 0)))}%"></i></div>
      </div>
      <div class="major-context">
        <span>Clima: ${esc(major.source?.weather || "—")}</span>
        <span>Trânsito: ${esc(major.source?.traffic || "—")}</span>
        <span>Período: ${esc(major.source?.period || "—")}</span>
        <span>ETA x${Number(major.source?.etaMultiplier || 1).toFixed(2)}</span>
      </div>
      <div class="major-history">
        ${history.length ? history.map((item) => `<small>${esc(item.text || "Alerta de contingência")}</small>`).join("") : "<small>Contingência monitorada.</small>"}
      </div>
    </section>`;
  }


  function renderSupportNetworkPanel() {
    const panel = $("#supportNetworkPanel");
    if (!panel) return;
    const network = window.C190_SupportNetwork?.analyze?.(state);
    if (!network?.active) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    const activeIds = new Set(network.activeIds || []);
    const recommendations = network.recommendations || [];
    panel.innerHTML = `<section class="support-network-card support-${esc(network.level || "attention")}">
      <div class="support-main">
        <span class="eyebrow">REDE DE APOIO</span>
        <h3>${esc(network.hospital?.label || "Regulação operacional")}</h3>
        <p>Capacidade hospitalar ${Math.max(0, 100 - Number(network.hospital?.load || 0))}% · apoio ativo ${network.activated.length} · alívio ${network.relief}</p>
      </div>
      <div class="support-score">
        <strong>${Number(network.supportScore || 0)}%</strong>
        <span>${network.level === "ready" ? "PRONTO" : network.level === "critical" ? "CRÍTICO" : "ATENÇÃO"}</span>
        <div class="cinematic-progress"><i style="width:${Math.max(4, Math.min(100, Number(network.supportScore || 0)))}%"></i></div>
      </div>
      <div class="support-recommendations">
        ${recommendations.length ? recommendations.map((item) => `<button class="support-chip type-${esc(item.type)} ${activeIds.has(item.id) ? "active" : ""}" data-support-request="${esc(item.id)}"><b>${esc(item.icon)}</b><span>${esc(item.label)}</span><small>${activeIds.has(item.id) ? "acionado" : `relevância ${item.score}`}</small></button>`).join("") : "<span class=\"support-empty\">Nenhum apoio extra recomendado agora.</span>"}
      </div>
      <div class="support-active-list">
        ${network.activated.length ? network.activated.slice(0, 3).map((item) => `<small>${esc(item.label)} acionado</small>`).join("") : "<small>Aguardando necessidade de apoio especializado.</small>"}
      </div>
    </section>`;
  }

  function renderMultiOpsPanel() {
    const panel = $("#multiOpsPanel");
    if (!panel) return;
    const analysis = window.C190_Multitask?.updateShift?.(state, state.dispatch?.shift) || window.C190_Multitask?.analyze?.(state);
    if (!analysis?.active) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    const recommended = analysis.recommended;
    const alerts = (analysis.alerts || []).slice(0, 3);
    panel.innerHTML = `<section class="multi-ops-card pressure-${esc(analysis.pressureLevel || "normal")}">
      <div class="multi-ops-main">
        <span class="eyebrow">CENTRAL MULTITAREFA</span>
        <h3>${esc(analysis.label || "Operação estável")}</h3>
        <p>Fila ${analysis.waiting.length} · em campo ${analysis.field.length} · ativo ${analysis.activeCall ? "sim" : "não"}</p>
      </div>
      <div class="multi-pressure-meter">
        <strong>${Number(analysis.pressureScore || 0)}%</strong>
        <span>${pressureLabel(analysis.pressureLevel)}</span>
        <div class="cinematic-progress"><i style="width:${Math.max(4, Math.min(100, Number(analysis.pressureScore || 0)))}%"></i></div>
      </div>
      <div class="multi-ops-recommendation">
        <strong>${recommended ? `Prioridade: ${esc(recommended.type)}` : "Nenhuma ligação aguardando"}</strong>
        <small>${recommended ? `${esc(recommended.multitask?.riskLabel || priorityLabel(recommended.priority))} · ${recommended.wait}s de espera` : "A central está livre para acompanhar campo."}</small>
        ${recommended ? `<button class="action-btn primary" data-answer-priority="${esc(recommended.id)}">Atender prioridade</button>` : ""}
      </div>
      <div class="multi-ops-alerts">
        ${alerts.length ? alerts.map((a) => `<span>${esc(a.text || "Alerta operacional")}</span>`).join("") : "<span>Sem alertas críticos.</span>"}
      </div>
    </section>`;
  }


  function supervisorGaugeClass(level) {
    return level === "danger" ? "danger" : level === "attention" ? "attention" : level === "good" ? "good" : "excellent";
  }
  function supervisorAuditCard(title, audit) {
    const ok = audit?.ok;
    const score = Number(audit?.score || 0);
    const warning = (audit?.warnings || [])[0] || "Sem alerta.";
    return `<article class="supervisor-audit ${ok ? "ok" : "warn"}">
      <strong>${esc(title)}</strong>
      <span>${score}%</span>
      <small>${esc(warning)}</small>
      <div class="cinematic-progress"><i style="width:${Math.max(4, Math.min(100, score))}%"></i></div>
    </article>`;
  }
  function renderSupervisorPanel() {
    const panel = $("#supervisorPanel");
    if (!panel) return;
    const report = window.C190_Supervisor?.analyze?.(state);
    if (!report?.active) {
      panel.hidden = true;
      panel.innerHTML = "";
      return;
    }
    panel.hidden = false;
    const risk = report.risk || { score: 0, level: "danger", label: "Sem análise" };
    const audits = report.audits || {};
    panel.innerHTML = `<section class="supervisor-card supervisor-${esc(supervisorGaugeClass(risk.level))}">
      <header>
        <div>
          <span class="eyebrow">SUPERVISOR OPERACIONAL</span>
          <h3>${esc(risk.label || "Auditoria ao vivo")}</h3>
          <small>${report.call ? `Chamada ativa: ${esc(report.call.type)}` : "Sem chamada ativa · monitorando fila e campo"}</small>
        </div>
        <div class="supervisor-score">
          <strong>${Number(risk.score || 0)}%</strong>
          <span>segurança</span>
        </div>
      </header>
      <div class="supervisor-audit-grid">
        ${supervisorAuditCard("Protocolo", audits.protocol || {})}
        ${supervisorAuditCard("Localização", audits.location || {})}
        ${supervisorAuditCard("Triagem", audits.triage || {})}
        ${supervisorAuditCard("Despacho", audits.dispatch || {})}
        ${supervisorAuditCard("Pressão", audits.pressure || {})}
      </div>
      <div class="supervisor-actions">
        ${(report.actions || []).map((item) => `<span class="supervisor-action type-${esc(item.type)}">${esc(item.text)}</span>`).join("")}
      </div>
    </section>`;
  }

  function renderDispatch() {
    const scrollSnapshot = captureDispatchScrollState();
    const sh = state.dispatch.shift;
    $("#startShiftBtn").textContent = sh?.active
      ? "Encerrar plantão"
      : "Iniciar plantão";
    $("#shiftStatus").textContent = sh?.active
      ? `${sh.modeLabel || "Plantão ativo"} · ${sh.elapsed}s · campo ${(sh.calls || []).filter((c) => c.status === "field").length} · fila ${(sh.calls || []).filter((c) => c.status === "waiting").length} · resolvidas ${sh.resolved} · falhas ${sh.failed} · abandonadas ${sh.abandoned}${sh.affectsCareer === false ? " · sem impacto na carreira" : ""}`
      : "Nenhum plantão ativo. Escolha um modo de jogo ou inicie um plantão de carreira.";
    const waitingRaw = sh?.calls.filter((c) => c.status === "waiting") || [];
    const waiting = window.C190_Multitask?.sortQueue?.(waitingRaw, sh) || waitingRaw;
    $("#queueCount").textContent = waiting.length;
    renderIncomingStrip(sh);
    renderUrbanDynamicsPanel();
    renderMajorIncidentPanel();
    renderSupportNetworkPanel();
    renderMultiOpsPanel();
    renderSupervisorPanel();
    liteQueueSignature = waiting.map((c) => `${c.id}:${c.priority}:${c.status}:${c.multitask?.riskLevel || ""}:${c.supervisor?.level || ""}`).join("|");
    $("#callQueue").innerHTML =
      waiting.map((c) => callCard(c, true)).join("") ||
      '<div class="list-item">Fila vazia.</div>';
    const active = sh?.calls.find((c) => c.id === sh.activeCallId);
    $("#activeCall").innerHTML = active
      ? activeCall(active)
      : '<div class="list-item">Nenhuma chamada em atendimento.</div>';
    restoreDispatchScrollState(scrollSnapshot);
    const paused = sh?.calls.filter((c) => ["paused", "field"].includes(c.status)) || [];
    $("#pausedCalls").innerHTML =
      paused.map((c) => callCard(c, false)).join("") ||
      '<div class="list-item">Nenhuma ocorrência pausada ou em campo.</div>';
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
    const inField = c.status === "field";
    const buttonLabel = waiting ? "Atender ligação" : inField ? "Acompanhar rádio" : "Retomar ligação";
    const fieldNote = inField ? ` · rádio em campo${c.fieldRadio?.stage != null ? ` · etapa ${Number(c.fieldRadio.stage || 0) + 1}` : ""}` : "";
    const risk = c.multitask || {};
    const riskNote = waiting && risk.riskLabel ? ` · ${risk.riskLabel} ${risk.riskScore || 0}%` : "";
    return `<div class="call-card ${c.priority === 3 ? "urgent" : waiting ? "waiting" : ""} ${inField ? "field-handoff-card" : ""} ${risk.riskLevel ? `risk-${esc(risk.riskLevel)}` : ""}"><div class="call-meta"><span>${inField ? "EM CAMPO" : risk.riskLabel || priorityLabel(c.priority)}</span><span>${c.wait}s espera</span></div><strong>${esc(c.type)}</strong><span>${esc(locationText)}</span><small>${asked} pergunta(s) de protocolo · precisão ${Math.round(Number(locationIntel?.confidence || 0) * 100)}%${fieldNote}${riskNote}</small><div class="call-actions"><button class="action-btn primary" data-answer="${esc(c.id)}">${buttonLabel}</button><button class="action-btn" data-focus-call="${esc(c.id)}" ${locationKnown ? "" : "disabled"}>${locationKnown ? "Ver no mapa" : "Mapa após localização"}</button></div></div>`;
  }
  function dataChip(label, ok, value = "") {
    return `<span class="protocol-chip ${ok ? "ok" : "missing"}"><b>${esc(label)}</b>${value ? `<small>${esc(value)}</small>` : ""}</span>`;
  }
  function caseIntel(call) {
    const items = [call?.caseProfile, call?.complexity, Array.isArray(call?.radioBeats) && call.radioBeats.length ? `${call.radioBeats.length} etapas de rádio` : ""].filter(Boolean);
    if (!items.length) return "";
    return `<div class="case-intel-strip" aria-label="Inteligência da ocorrência">${items.map((item) => `<span>${esc(item)}</span>`).join("")}</div>`;
  }
  function transcriptLine(line) {
    return `<div class="chat-line ${line.role === "operator" ? "operator" : "caller"}${typewriterClass("chat", line)}"><b>${line.role === "operator" ? "Operador" : "Chamador"}</b><span>${esc(line.text)}</span></div>`;
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
  function resourceDispatchPanel(call) {
    const dispatch = window.C190_ResourceDispatch?.normalize?.(call);
    const evaluation = window.C190_ResourceDispatch?.evaluate?.(call, state) || { grade: "D", finalScore: 0, required: { notes: [] }, selected: [], detail: ["despacho indisponível"], missing: [] };
    const resources = window.C190_ResourceDispatch?.resourcesFor?.(state) || [];
    const selected = new Set(dispatch?.selected || []);
    const requiredText = evaluation.required?.notes?.length ? evaluation.required.notes.join(" · ") : "aguardando triagem";
    return `<section class="resource-dispatch-panel" aria-label="Despacho de unidades">
      <header><div><span class="eyebrow">DESPACHO DE UNIDADES</span><h4>Escolha PM, Bombeiros, SAMU ou apoio combinado</h4></div><strong class="resource-grade">${esc(evaluation.grade)} · ${Number(evaluation.finalScore || 0)}/100</strong></header>
      <p class="protocol-warning">Recomendado pela triagem: ${esc(requiredText)}. A unidade mais próxima nem sempre é suficiente; avalie segurança da cena, vítima, fogo, água, trânsito e risco armado.</p>
      <div class="resource-unit-grid">${resources.map((unit) => `<button class="resource-unit-card ${selected.has(unit.id) ? "selected" : ""} type-${esc(unit.type)}" data-resource-toggle="${esc(unit.id)}" data-call="${esc(call.id)}"><img src="${esc(unit.icon || "assets/units/unit-police-cruiser.png")}" alt="" loading="lazy"><strong>${esc(unit.short || unit.label)}</strong><span>${esc(unit.label)}</span><small>${esc(unit.role || unit.status)} · ETA ${Number(unit.etaMin || 0)} min</small></button>`).join("")}</div>
      <div class="button-row"><button class="action-btn primary" data-resource-recommend="${esc(call.id)}">Selecionar despacho recomendado</button><button class="action-btn" data-resource-clear="${esc(call.id)}">Limpar unidades</button></div>
      <div class="protocol-score resource-score"><span>Avaliação do despacho</span><strong>${esc(evaluation.grade)}</strong><div class="progress"><i style="width:${Math.max(0, Math.min(100, evaluation.finalScore || 0))}%"></i></div><small>${(evaluation.detail || []).map(esc).join(" · ")}</small></div>
    </section>`;
  }

  function fieldUnitTracker(call) {
    const units = window.C190_FieldUnits?.operationPanel?.(state)?.filter((unit) => unit.assignedTo === call?.id || true) || [];
    if (!units.length) return "";
    return `<section class="field-units-tracker" aria-label="Unidades em campo">
      <header><div><span class="eyebrow">UNIDADES EM CAMPO</span><h4>Deslocamento para a ocorrência</h4></div><strong>${units.length}</strong></header>
      <div class="field-unit-track-grid">
        ${units.map((unit) => `<article class="field-unit-track type-${esc(unit.type)} ${unit.arrived ? "arrived" : "moving"}">
          <img src="${esc(unit.icon || "assets/units/sp-police-car-cinematic.png")}" alt="" loading="lazy" />
          <div>
            <strong>${esc(unit.short || unit.label)}</strong>
            <small>${esc(unit.statusLabel || "em deslocamento")} · ETA ${esc(unit.etaRemainingText || "calculando")}</small>
            <div class="cinematic-progress"><i style="width:${Math.max(4, Math.min(100, unit.progressPercent || 0))}%"></i></div>
          </div>
          <span>${Number(unit.progressPercent || 0)}%</span>
        </article>`).join("")}
      </div>
    </section>`;
  }

  function fieldRadioPanel(call) {
    const radio = window.C190_FieldRadio?.normalize?.(call);
    if (!radio?.active && !radio?.finalized) return "";
    const actions = window.C190_FieldRadio?.availableActions?.(call) || [];
    const stageLabel = radio.finalized ? "Encerrado" : radio.stage === 0 ? "Despacho confirmado" : radio.stage === 1 ? "Chegada aproximada" : radio.stage === 2 ? "Confirmação no local" : "Controle final";
    const gradeText = radio.finalized ? `${radio.grade || "N/A"} · ${Number(radio.finalScore || 0)}/100` : `Δ ${radio.scoreDelta >= 0 ? "+" : ""}${Number(radio.scoreDelta || 0)} pts`;
    return `<section class="field-radio-panel" aria-label="Rádio e acompanhamento de campo">
      <header><div><span class="eyebrow">RÁDIO OPERACIONAL</span><h4>Evolução da ocorrência em campo</h4></div><strong class="radio-grade">${esc(gradeText)}</strong></header>
      <p class="protocol-warning">A ocorrência não termina no despacho. Acompanhe a chegada das equipes, pedidos de apoio e encerramento real do atendimento.</p>
      <div class="radio-status-grid"><span><b>Fase</b>${esc(stageLabel)}</span><span><b>Cenário</b>${esc(radio.scenario || "operacional")}</span><span><b>Ações</b>${radio.actions.length}</span></div>
      ${fieldUnitTracker(call)}
      <div class="radio-log">${(radio.log || []).slice(0, 8).map((line) => `<div class="radio-line ${esc(line.tone || "info")}${typewriterClass("radio", line)}"><b>${esc(line.source || "RÁDIO")}</b><span>${esc(line.text || "")}</span><small>${new Date(line.at || Date.now()).toLocaleTimeString()}</small></div>`).join("")}</div>
      ${radio.finalized ? `<div class="protocol-score radio-score"><span>Avaliação do rádio</span><strong>${esc(radio.grade || "N/A")}</strong><div class="progress"><i style="width:${Math.max(0, Math.min(100, radio.finalScore || 0))}%"></i></div><small>Impacto do acompanhamento: ${radio.scoreDelta >= 0 ? "+" : ""}${Number(radio.scoreDelta || 0)} ponto(s).</small></div>` : `<h4>Ações do operador</h4><div class="radio-action-grid">${actions.map((a) => `<button class="radio-action-btn ${a.id === "close" ? "close" : ""}" data-radio-action="${esc(a.id)}" data-call="${esc(call.id)}"><strong>${esc(a.short || a.label)}</strong><small>${esc(a.hint || a.label)}</small></button>`).join("")}</div>`}
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
    const radio = window.C190_FieldRadio?.normalize?.(c);
    if (radio?.active || radio?.finalized) {
      return `<div class="call-card urgent active-protocol-card radio-active-card" data-active-call="${esc(c.id)}">
        <div class="call-meta"><span>${priorityLabel(c.priority)}</span><span>${c.wait}s espera</span></div>
        <h3>${esc(c.type)}</h3>
        <p>${esc(c.summary)}</p>
        ${caseIntel(c)}
        <div class="protocol-data-grid">
          ${dataChip("Precisão do mapa", locationKnown, locationIntel?.label || "bloqueado")}
          ${dataChip("Protocolo", !!c.protocolResult, c.protocolResult?.grade || evaluation.grade || "")}
          ${dataChip("Triagem", !!c.triageResult, c.triageResult?.grade || "")}
          ${dataChip("Despacho", !!c.resourceDispatchResult, c.resourceDispatchResult?.grade || "")}
        </div>
        ${fieldRadioPanel(c)}
        <button class="action-btn" data-focus-call="${esc(c.id)}" ${canMap}>${locationKnown ? "Localizar no mapa" : "Mapa bloqueado até coletar bairro/rua"}</button>
      </div>`;
    }
    return `<div class="call-card urgent active-protocol-card" data-active-call="${esc(c.id)}">
      <div class="call-meta"><span>${priorityLabel(c.priority)}</span><span>${c.wait}s espera</span></div>
      <h3>${esc(c.type)}</h3>
      <p>${esc(c.summary)}</p>
      ${caseIntel(c)}
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
      ${resourceDispatchPanel(c)}
      <button class="action-btn" data-focus-call="${esc(c.id)}" ${canMap}>${locationKnown ? "Localizar no mapa" : "Mapa bloqueado até coletar bairro/rua"}</button>
      <div class="choice-grid"><button class="choice-btn final-dispatch-btn" data-choice="0" data-call="${esc(c.id)}"><strong>Confirmar classificação e despachar</strong><small>Inicia rádio operacional: chegada das equipes, pedidos de apoio, reforço e encerramento em campo.</small></button></div>
      <button class="action-btn" data-pause="1">Pausar atendimento</button>
    </div>`;
  }
  function bindDispatchButtons() {
    $$("[data-answer], [data-answer-priority]").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.dataset.answer || b.dataset.answerPriority;
          C190_Dispatch.answer(state, id);
          voiceFirstActiveCall(true);
          C190_Immersion?.play?.("question", state);
          persist();
        }),
    );
    $$("[data-question]").forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.askQuestion(state, b.dataset.call, b.dataset.question);
          persist();
          if (out?.ok) { C190_Immersion?.play?.(out.question.score < 0 ? "warning" : "question", state); if (out.answer) C190_Immersion?.speak?.(`Chamador. ${out.answer}`, state, { rate: 0.94 }); toast(out.question.score < 0 ? "Pergunta inadequada registrada no protocolo." : "Dado coletado no atendimento.", out.question.score < 0 ? "danger" : "success"); }
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
          if (out?.ok) { C190_Immersion?.play?.("triage", state); toast(`Triagem atualizada · nota ${out.evaluation?.grade || "N/A"}.`, "success"); }
          else toast("Não foi possível atualizar a triagem.", "warning");
        }),
    );
    $$(`[data-resource-toggle]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.toggleResource(state, b.dataset.call, b.dataset.resourceToggle);
          persist();
          if (out?.ok) { C190_Immersion?.play?.(out.evaluation?.grade === "D" ? "warning" : "unit", state); toast(`Despacho atualizado · nota ${out.evaluation?.grade || "N/A"}.`, out.evaluation?.grade === "D" ? "warning" : "success"); }
          else toast("Não foi possível selecionar essa unidade.", "warning");
        }),
    );
    $$(`[data-resource-recommend]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.recommendResources(state, b.dataset.resourceRecommend);
          persist();
          if (out?.ok) { C190_Immersion?.play?.("dispatch", state); toast(`Despacho recomendado aplicado · nota ${out.evaluation?.grade || "N/A"}.`, "success"); }
          else toast("Não foi possível aplicar recomendação de despacho.", "warning");
        }),
    );
    $$(`[data-resource-clear]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.clearResources(state, b.dataset.resourceClear);
          persist();
          if (out?.ok) { C190_Immersion?.play?.("warning", state); toast("Unidades removidas do despacho.", "warning"); }
        }),
    );
    $$(`[data-support-request]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = window.C190_SupportNetwork?.requestSupport?.(state, b.dataset.supportRequest);
          persist();
          if (out?.ok) { C190_Immersion?.play?.("radio", state); toast(out.already ? `${out.support?.label || "Apoio"} já estava acionado.` : `Apoio acionado: ${out.support?.label || "rede especializada"}.`, "success"); }
          else toast("Não foi possível acionar apoio especializado.", "warning");
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
          if (out) {
            C190_Immersion?.play?.(out.awaitingRadio ? "dispatch" : out.call.status === "resolved" ? "success" : "error", state);
            if (out.awaitingRadio) { C190_Immersion?.play?.("siren", state); C190_Immersion?.speakRadio?.("Despacho confirmado. Equipes em deslocamento para a ocorrência.", state); }
            toast(
              out.awaitingRadio
                ? `Despacho confirmado · ocorrência enviada ao campo · próxima ligação liberada na fila · protocolo ${out.protocol?.grade || "N/A"} · triagem ${out.triage?.grade || "N/A"} · despacho ${out.resourceDispatch?.grade || "N/A"}.`
                : out.call.status === "resolved"
                  ? `Ocorrência resolvida · protocolo ${out.protocol?.grade || "N/A"} · triagem ${out.triage?.grade || "N/A"} · despacho ${out.resourceDispatch?.grade || "N/A"}.`
                  : `Falha de protocolo/triagem/despacho · protocolo ${out.protocol?.grade || "N/A"} · triagem ${out.triage?.grade || "N/A"} · despacho ${out.resourceDispatch?.grade || "N/A"}.`,
              out.awaitingRadio ? "success" : out.call.status === "resolved" ? "success" : "danger",
            );
          }
        }),
    );
    $$(`[data-radio-action]`).forEach(
      (b) =>
        (b.onclick = () => {
          const out = C190_Dispatch.radioAction(state, b.dataset.call, b.dataset.radioAction);
          persist();
          if (out?.ok) {
            C190_Immersion?.play?.(out.finalized ? (out.call?.status === "resolved" ? "success" : "error") : "radio", state);
            if (out.call) voiceLatestRadio(out.call, true);
            toast(out.finalized ? `Ocorrência encerrada em campo · rádio ${out.radio?.grade || out.finalOutcome?.radio?.grade || "N/A"}.` : "Atualização de rádio registrada.", out.finalized ? (out.call?.status === "resolved" ? "success" : "danger") : "success");
          } else {
            toast("Não foi possível registrar ação de rádio.", "warning");
          }
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
  function renderTrainingAcademy() {
    const academy = window.C190_TrainingAcademy;
    if (!academy) return;
    const summary = academy.summary(state);
    const panel = $("#academyOverview");
    if (panel) {
      panel.innerHTML = `<div class="academy-metric"><b>${summary.certificates}</b><span>Certificações</span></div><div class="academy-metric"><b>${summary.passed}</b><span>Simulações aprovadas</span></div><div class="academy-metric"><b>${summary.bestScore}</b><span>Melhor nota</span></div><div class="academy-metric"><b>${summary.effectLabel}</b><span>Efeito na carreira</span></div>`;
    }
    const effectBox = $("#trainingEffects");
    if (effectBox) {
      effectBox.innerHTML = academy.effectCards(state).map((item) => `<div class="training-effect ${item.active ? "active" : "locked"}"><strong>${esc(item.label)}</strong><span>${esc(item.detail)}</span></div>`).join("");
    }
    const modules = $("#trainingModules");
    if (modules) {
      modules.innerHTML = academy.MODULES.map((m) => {
        const cert = academy.hasCertificate(state, m.id);
        const ready = academy.moduleReadiness(state, m);
        return `<article class="training-module-card ${cert ? "certified" : ""}"><div class="card-icon">${esc(m.icon)}</div><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p><div class="tag-row"><span class="tag">${esc(m.focus)}</span><span class="tag">Nota mínima ${m.passScore}</span></div><small>${esc(ready.detail)}</small><button class="action-btn primary" data-training-module="${esc(m.id)}">${cert ? "Refazer simulação" : "Iniciar simulação"}</button></article>`;
      }).join("");
    }
    const certs = $("#certificationGrid");
    if (certs) {
      const certificates = academy.certificates(state);
      certs.innerHTML = certificates.length ? certificates.map((c) => `<div class="certificate-card"><strong>${esc(c.name)}</strong><span>${new Date(c.earnedAt).toLocaleString()} · nota ${c.score}</span></div>`).join("") : '<div class="list-item">Nenhuma certificação prática concluída ainda.</div>';
    }
    const log = $("#simulationLog");
    if (log) {
      const simulations = (state.training?.simulations || []).slice(0, 8);
      log.innerHTML = simulations.length ? simulations.map((r) => `<div class="timeline-item"><time>${new Date(r.at).toLocaleString()}</time><div><strong>${esc(r.moduleName)}</strong><div>${esc(r.grade)} · ${r.score}/100 · ${r.passed ? "aprovado" : "revisar"}</div><small>${esc(r.feedback.join(" · "))}</small></div></div>`).join("") : '<div class="list-item">Faça uma simulação para gerar relatório de treinamento.</div>';
    }
    $$('[data-training-module]').forEach((b) => (b.onclick = () => {
      const out = academy.runSimulation(state, b.dataset.trainingModule);
      if (out.ok) {
        persist();
        toast(out.result.passed ? `Certificação registrada · ${out.result.grade} (${out.result.score}/100)` : `Treinamento concluído · ${out.result.grade} (${out.result.score}/100)`, out.result.passed ? "success" : "warning");
      } else {
        toast("Não foi possível iniciar esta simulação.", "warning");
      }
    }));
  }

  function renderCourses() {
    window.C190_TrainingAcademy?.normalize?.(state);
    renderTrainingAcademy();
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
  function reportCallDetails(call) {
    const chips = [
      call.protocolGrade ? `Protocolo ${call.protocolGrade}${call.protocolScore ? `/${call.protocolScore}` : ""}` : "Protocolo pendente",
      call.triageGrade ? `Triagem ${call.triageGrade}${call.triageScore ? `/${call.triageScore}` : ""}` : "Triagem pendente",
      call.resourceDispatchGrade ? `Despacho ${call.resourceDispatchGrade}${call.resourceDispatchScore ? `/${call.resourceDispatchScore}` : ""}` : "Despacho pendente",
      call.radioGrade ? `Rádio ${call.radioGrade}${call.radioScore ? `/${call.radioScore}` : ""}` : "Rádio pendente",
    ];
    const selected = (call.resourceDispatchSelected || []).map((unit) => unit.label || unit.id || unit.type).filter(Boolean).slice(0, 4).join(", ");
    return `<details class="report-call-detail"><summary><strong>${esc(call.type || "Ocorrência")}</strong><span>${esc(call.outcome || call.status || "registro")}</span></summary><div class="report-chip-line">${chips.map((chip) => `<span>${esc(chip)}</span>`).join("")}</div><small>Localização: ${esc(call.locationStage || "não registrada")} · confiança ${Math.round(Number(call.locationConfidence || 0) * 100)}%${selected ? ` · unidades: ${esc(selected)}` : ""}</small></details>`;
  }

  function renderDebriefingPanel() {
    const panel = $("#debriefingPanel");
    if (!panel) return;
    const analysis = window.C190_Debriefing?.analyze?.(state);
    if (!analysis?.active) {
      panel.innerHTML = `<article class="panel debriefing-empty"><span class="eyebrow">DEBRIEFING PROFISSIONAL</span><h2>Sem plantão analisado</h2><p>${esc(analysis?.message || "Conclua um plantão para gerar análise profissional.")}</p></article>`;
      return;
    }
    const latest = analysis.latest;
    const lessons = latest.lessons?.length ? latest.lessons : [{ title: "Manutenção operacional", text: "Continue treinando protocolo, triagem e rádio.", count: 1 }];
    panel.innerHTML = `<article class="debriefing-hero panel">
      <header>
        <div>
          <span class="eyebrow">DEBRIEFING PROFISSIONAL</span>
          <h2>${esc(latest.modeLabel)} · Nota ${esc(latest.grade)} · ${latest.score}/100</h2>
          <small>${latest.resolved} resolvidas · ${latest.failed} falhas · ${latest.abandoned} abandonadas · tendência ${esc(analysis.trendLabel)}</small>
        </div>
        <div class="debriefing-score">
          <strong>${latest.score}</strong>
          <span>${esc(latest.grade)}</span>
        </div>
      </header>
      <p class="debriefing-note">${esc(latest.supervisorNote)}</p>
      <div class="debriefing-metrics">
        <span><b>${latest.protocolAvg || "—"}</b>Protocolo</span>
        <span><b>${latest.locationAvg || "—"}</b>Localização</span>
        <span><b>${latest.radioAvg || "—"}</b>Rádio</span>
        <span><b>${latest.decisionAvg || "—"}</b>Decisão</span>
      </div>
      <div class="debriefing-grid">
        <section>
          <h3>Pontos fortes</h3>
          <div class="debriefing-tags">${latest.strengths.map((item) => `<span class="good">${esc(item)}</span>`).join("")}</div>
        </section>
        <section>
          <h3>Plano de melhoria</h3>
          <div class="lesson-list">${lessons.slice(0, 4).map((lesson) => `<article><strong>${esc(lesson.title)} · ${lesson.count}x</strong><small>${esc(lesson.text)}</small></article>`).join("")}</div>
        </section>
        <section>
          <h3>Treino recomendado</h3>
          <div class="recommended-training"><strong>${esc(latest.recommendedCourse)}</strong><small>Priorize este módulo antes do próximo plantão crítico.</small><button class="action-btn primary" data-open-training>Ir para cursos</button></div>
        </section>
      </div>
      <details class="decision-replay">
        <summary>Replay das decisões do plantão</summary>
        <div class="decision-replay-list">${latest.callsAnalysis.slice(0, 8).map((call) => `<article><b>${call.index}. ${esc(call.type)}</b><span>${esc(call.outcome)} · ${call.score || "—"}/100</span><small>${esc(call.lesson)}</small></article>`).join("")}</div>
      </details>
    </article>`;
    $$("[data-open-training]").forEach((btn) => { btn.onclick = () => showScreen("training"); });
  }

  function renderReports() {
    renderDebriefingPanel();
    $("#reportList").innerHTML =
      state.dispatch.reports
        .map(
          (r, i) => {
            const calls = Array.isArray(r.calls) ? r.calls : [];
            const avgProtocol = calls.filter((c) => Number(c.protocolScore)).reduce((sum, c) => sum + Number(c.protocolScore || 0), 0) / Math.max(1, calls.filter((c) => Number(c.protocolScore)).length);
            const avgRadio = calls.filter((c) => Number(c.radioScore)).reduce((sum, c) => sum + Number(c.radioScore || 0), 0) / Math.max(1, calls.filter((c) => Number(c.radioScore)).length);
            return `<article class="report-card report-card-rc"><div class="requirement"><h3>${esc(r.modeLabel || "Plantão de carreira")} #${state.dispatch.reports.length - i}</h3><b>Nota ${r.grade} · ${r.score}/100</b></div><small>${new Date(r.startedAt).toLocaleString()} · duração ${r.duration}s · ${esc(C190_Content.cityById(r.cityId || "sp").name)}${r.affectsCareer === false ? " · sem impacto na carreira" : ""}</small><div class="report-stats"><div class="report-stat"><strong>${r.resolved}</strong><span>Resolvidas</span></div><div class="report-stat"><strong>${r.failed}</strong><span>Falhas</span></div><div class="report-stat"><strong>${r.abandoned}</strong><span>Abandonadas</span></div><div class="report-stat"><strong>${calls.length}</strong><span>Chamadas</span></div><div class="report-stat"><strong>${Math.round(avgProtocol) || "—"}</strong><span>Protocolo médio</span></div><div class="report-stat"><strong>${Math.round(avgRadio) || "—"}</strong><span>Rádio médio</span></div></div>${r.scoreBreakdown ? `<div class="balance-report-strip"><span>Média chamada: ${esc(r.scoreBreakdown.averageCallScore)}</span><span>Bônus resolução: +${esc(r.scoreBreakdown.resolutionBonus)}</span><span>Penalidade: -${esc(r.scoreBreakdown.failurePenalty)}</span><span>Dif.: ${esc(r.scoreBreakdown.difficulty)}</span></div>` : ""}<div class="report-call-list">${calls.slice(0, 5).map(reportCallDetails).join("")}</div></article>`;
          },
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


  function tutorialCheckMarkup(items) {
    return items.map((item) => `<div class="release-check ${item.ok ? "ok" : "pending"}"><span>${item.ok ? "✓" : "!"}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.detail)}</small></div></div>`).join("");
  }
  function renderTutorial() {
    if (!window.C190_Tutorial) return;
    C190_Tutorial.normalize(state);
    const summary = C190_Tutorial.summary(state);
    const completed = new Set(state.tutorial?.completed || []);
    const activeShift = !!state.dispatch.shift?.active;
    const badge = $("#tutorialProgressBadge");
    if (badge) badge.textContent = `${summary.completed}/${summary.total}`;
    const stepGrid = $("#tutorialStepGrid");
    if (stepGrid) {
      stepGrid.innerHTML = C190_Tutorial.STEPS.map((step, index) => {
        const done = completed.has(step.id);
        const next = summary.next?.id === step.id;
        return `<article class="tutorial-step-card ${done ? "done" : ""} ${next ? "next" : ""}"><span>${done ? "✓" : String(index + 1).padStart(2, "0")}</span><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p><button class="action-btn" data-tutorial-focus="${esc(step.focus)}" data-tutorial-step="${esc(step.id)}">${done ? "Rever etapa" : "Praticar"}</button></article>`;
      }).join("");
    }
    const checklist = $("#tutorialChecklist");
    if (checklist) checklist.innerHTML = tutorialCheckMarkup(C190_Tutorial.checklist(state));
    const guided = $("#startGuidedShiftBtn");
    if (guided) {
      guided.disabled = activeShift;
      guided.textContent = activeShift ? "Plantão ativo" : "Iniciar plantão guiado";
      guided.onclick = () => {
        if (!launchAllowed()) return;
        C190_Tutorial.mark(state, "answer");
        C190_Tutorial.mark(state, "address");
        const started = C190_Dispatch.startShift(state);
        if (!started) return toast("Não foi possível iniciar o plantão guiado.", "warning");
        persist();
        C190_Immersion?.play?.("ring", state);
        showScreen("dispatch");
        toast("Plantão guiado iniciado. Atenda, pergunte endereço e avance por todas as etapas.");
      };
    }
    const campaignBtn = $("#startCampaignTutorialBtn");
    if (campaignBtn) campaignBtn.onclick = () => { C190_Tutorial.mark(state, "report"); persist(); showScreen("campaign"); toast("Escolha a próxima missão da campanha."); };
    const readinessBtn = $("#runReadinessBtn");
    if (readinessBtn) readinessBtn.onclick = () => { state.release.lastDeviceAudit = C190_Release.deviceAudit(); state.tutorial.readinessRuns = Number(state.tutorial.readinessRuns || 0) + 1; persist(); renderTutorial(); toast(state.release.lastDeviceAudit.ok ? "Aparelho aprovado para jogar." : "Há limitações no aparelho, veja Lançamento.", state.release.lastDeviceAudit.ok ? "success" : "warning"); };
    $$('[data-open-release]').forEach((button) => { button.onclick = () => showScreen("release"); });
    $$('[data-tutorial-focus]').forEach((button) => {
      button.onclick = () => {
        C190_Tutorial.mark(state, button.dataset.tutorialStep);
        persist();
        showScreen(button.dataset.tutorialFocus || "dispatch");
        toast("Etapa marcada como praticada.");
      };
    });
  }


  function renderCampaign() {
    if (!window.C190_Campaign) return;
    C190_Campaign.normalize(state);
    const summary = C190_Campaign.summary(state);
    if (!selectedCampaignMissionId) selectedCampaignMissionId = state.campaign.selectedMissionId || summary.next?.id || C190_Campaign.missions[0]?.id;
    const selected = C190_Campaign.missionById(selectedCampaignMissionId) || summary.next || C190_Campaign.missions[0];
    state.campaign.selectedMissionId = selected?.id || state.campaign.selectedMissionId;
    const progress = Math.max(0, Math.min(100, summary.percent || 0));
    const nextLabel = summary.next ? `Próxima: ${summary.next.title}` : "Campanha concluída";
    const active = !!state.dispatch.shift?.active;
    $("#campaignProgressBadge").textContent = `${summary.completed}/${summary.total}`;
    $("#campaignOverview").innerHTML = `<div class="campaign-overview-grid"><div><strong>${summary.completed}/${summary.total}</strong><span>missões concluídas</span></div><div><strong>${summary.bestAverage || 0}</strong><span>média das melhores notas</span></div><div><strong>${summary.attempts || 0}</strong><span>tentativas registradas</span></div><div><strong>${esc(nextLabel)}</strong><span>jornada atual</span></div></div><div class="progress campaign-progress"><i style="width:${progress}%"></i></div>`;
    $("#campaignMissionGrid").innerHTML = C190_Campaign.missions.map((mission) => {
      const status = C190_Campaign.statusFor(state, mission);
      const city = C190_Content.cityById(mission.cityId);
      const selectedClass = mission.id === selected?.id ? "selected" : "";
      return `<article class="campaign-mission-card ${selectedClass} ${status.completed ? "completed" : ""} ${status.available ? "" : "locked"}" data-campaign-mission="${esc(mission.id)}"><div class="campaign-icon">${esc(mission.icon)}</div><div class="campaign-mission-body"><div class="tag-row"><span class="tag">Capítulo ${mission.chapter}</span><span class="tag">${esc(city.name)}</span><span class="tag">mín. ${mission.minScore}</span></div><h3>${esc(mission.title)}</h3><p>${esc(mission.subtitle)}</p><small>${esc(status.label)} · melhor ${status.best || 0} · ${status.attempts || 0} tentativa(s)</small></div><button class="action-btn ${status.available ? "primary" : ""}" data-campaign-launch="${esc(mission.id)}" ${status.canLaunch ? "" : "disabled"}>${status.completed ? "Rejogar" : status.available ? "Iniciar" : "Bloqueada"}</button></article>`;
    }).join("");
    if (selected) {
      const status = C190_Campaign.statusFor(state, selected);
      const city = C190_Content.cityById(selected.cityId);
      $("#campaignBriefing").innerHTML = `<span class="eyebrow">CAPÍTULO ${selected.chapter}</span><h3>${esc(selected.title)}</h3><p>${esc(selected.briefing)}</p><div class="campaign-briefing-stats"><span><b>Cidade</b>${esc(city.name)}</span><span><b>Chamadas</b>${selected.callCount}</span><span><b>Nota mínima</b>${selected.minScore}</span><span><b>Recompensa</b>+${selected.reward.xp} XP · +${selected.reward.rep} rep.</span></div><h4>Objetivos</h4><ul class="campaign-objectives">${selected.objectives.map((o) => `<li>${esc(o)}</li>`).join("")}</ul><button class="primary-btn" data-campaign-launch="${esc(selected.id)}" ${status.canLaunch ? "" : "disabled"}>${active ? "Plantão ativo" : status.available ? "Iniciar missão selecionada" : esc(status.label)}</button>`;
    }
    const history = state.campaign.history || [];
    $("#campaignTimeline").innerHTML = history.length ? history.slice(0, 12).map((item) => `<div class="list-item"><strong>${esc(item.title || "Campanha")}</strong><small>${new Date(item.at).toLocaleString()} · ${esc(item.detail || "")}</small></div>`).join("") : '<div class="list-item">Nenhuma missão de campanha iniciada.</div>';
    $$('[data-campaign-mission]').forEach((card) => {
      card.onclick = (event) => {
        if (event.target.closest('button')) return;
        selectedCampaignMissionId = card.dataset.campaignMission;
        state.campaign.selectedMissionId = selectedCampaignMissionId;
        renderCampaign();
      };
    });
    $$('[data-campaign-launch]').forEach((button) => {
      button.onclick = () => {
        if (!launchAllowed()) return;
        const result = C190_Campaign.launch(state, button.dataset.campaignLaunch);
        if (!result.ok) return toast(result.reason === "locked" ? "Missão ainda bloqueada." : "Não foi possível iniciar a campanha.", "warning");
        persist();
        showScreen("dispatch");
        C190_Immersion?.play?.("ring", state);
        toast(`Missão iniciada: ${result.mission.title}`);
      };
    });
    const nextBtn = $("#launchNextCampaignBtn");
    if (nextBtn) {
      nextBtn.disabled = active || !summary.next;
      nextBtn.textContent = active ? "Plantão ativo" : summary.next ? "Iniciar próxima missão" : "Campanha concluída";
      nextBtn.onclick = () => {
        if (!launchAllowed()) return;
        const mission = C190_Campaign.nextMission(state);
        const result = C190_Campaign.launch(state, mission?.id);
        if (!result.ok) return toast("Próxima missão ainda não disponível.", "warning");
        persist();
        showScreen("dispatch");
        C190_Immersion?.play?.("ring", state);
        toast(`Missão iniciada: ${result.mission.title}`);
      };
    }
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
    const balanceSummary = window.C190_Balance?.summary?.(state);
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
    const publicRc = window.C190_PublicRC?.score?.(state);
    const publicRcNode = $("#publicRcChecklist");
    if (publicRcNode) publicRcNode.innerHTML = releaseCheckMarkup(publicRc?.items || []);
    $("#offlineReleaseStatus").innerHTML = `<strong>${esc(install.label)}</strong><p>${navigator.onLine ? ui.coreOnline : ui.coreOffline}</p><small>${"serviceWorker" in navigator ? ui.workerOk : ui.workerNo}</small>`;
    $("#installAppBtn").disabled = install.code === "installed";
    $("#balanceProfileCard").innerHTML = `<strong>${esc(balance.label)}</strong><p>${esc(balance.description)}</p><div class="release-mini-grid"><span>${esc(ui.escalation)}: ${balance.escalationAt}s</span><span>${esc(ui.abandonment)}: ${balance.abandonLimit}s</span><span>${esc(ui.pace)}: ${Math.round(balance.arrivalFactor * 100)}%</span><span>Balance v${C190_Release.BALANCE_VERSION}</span></div>${balanceSummary ? `<div class="balance-breakdown"><b>Pesos da nota final</b><small>Protocolo ${Math.round(balanceSummary.weights.protocol*100)}% · Triagem ${Math.round(balanceSummary.weights.triage*100)}% · Despacho ${Math.round(balanceSummary.weights.dispatch*100)}% · Rádio ${Math.round(balanceSummary.weights.radio*100)}% · Localização ${Math.round(balanceSummary.weights.location*100)}%</small><small>Limite: ${balanceSummary.economy.maxXpPerCall} XP por chamada · reputação ${balanceSummary.economy.maxRepLossPerCall} a +${balanceSummary.economy.maxRepGainPerCall}</small></div>` : ""}`;
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
      ? `Identidade visual ativa: ${d.loaded}/${d.required} assets obrigatórios carregados · ${d.optionalLoaded || 0}/${d.optional || 0} fundos cinematográficos opcionais detectados.`
      : `Modo seguro visual: ${d.missing.length} asset(s) obrigatório(s) ausente(s), sem quebrar o jogo.`;
    const requiredRows = window.C190_Assets.required.map((src) => {
      const ok = !d.missing.includes(src);
      return `<div class="asset-row ${ok ? "ok" : "warn"}"><strong>${ok ? "✓" : "!"}</strong> obrigatório · ${esc(src)}</div>`;
    }).join("");
    const optionalRows = (window.C190_Assets.optionalCinematic || []).map((src) => {
      const ok = !(d.optionalMissing || []).includes(src);
      return `<div class="asset-row ${ok ? "ok" : "warn"}"><strong>${ok ? "✓" : "○"}</strong> cinematográfico opcional · ${esc(src)}</div>`;
    }).join("");
    list.innerHTML = requiredRows + optionalRows;
  }

  function renderSettings() {
    C190_Release.normalize(state);
    C190_Immersion?.normalizeSettings?.(state.settings);
    $("#largeTextToggle").checked = state.settings.largeText;
    $("#reduceMotionToggle").checked = state.settings.reduceMotion;
    $("#highContrastToggle").checked = state.settings.highContrast;
    $("#largeTargetsToggle").checked = state.settings.largeTargets;
    $("#screenReaderHintsToggle").checked = state.settings.screenReaderHints;
    const soundToggle = $("#soundEnabledToggle");
    if (soundToggle) soundToggle.checked = state.settings.soundEnabled !== false;
    const radioFxToggle = $("#radioFxToggle");
    if (radioFxToggle) radioFxToggle.checked = state.settings.radioFx !== false;
    const occurrenceFxToggle = $("#occurrenceFxToggle");
    if (occurrenceFxToggle) occurrenceFxToggle.checked = state.settings.occurrenceFx !== false;
    const vibrationToggle = $("#vibrationToggle");
    if (vibrationToggle) vibrationToggle.checked = state.settings.vibration !== false;
    const voiceEnabledToggle = $("#voiceEnabledToggle");
    if (voiceEnabledToggle) voiceEnabledToggle.checked = state.settings.voiceEnabled !== false;
    const callerVoiceToggle = $("#callerVoiceToggle");
    if (callerVoiceToggle) callerVoiceToggle.checked = state.settings.callerVoice !== false;
    const radioVoiceToggle = $("#radioVoiceToggle");
    if (radioVoiceToggle) radioVoiceToggle.checked = state.settings.radioVoice !== false;
    const volumeRange = $("#soundVolumeRange");
    if (volumeRange) volumeRange.value = String(Math.round(Number(state.settings.soundVolume ?? 0.42) * 100));
    const voiceRateRange = $("#voiceRateRange");
    if (voiceRateRange) voiceRateRange.value = String(Math.round(Number(state.settings.voiceRate ?? 0.94) * 100));
    const immersion = C190_Immersion?.diagnostics?.(state);
    const immersionStatus = $("#immersionStatus");
    if (immersionStatus && immersion) immersionStatus.textContent = `Áudio ${immersion.soundEnabled ? "ativo" : "desativado"} · volume ${Math.round(immersion.volume * 100)}% · voz PT-BR ${immersion.voiceEnabled ? "ativa" : "desativada"} · ${immersion.speechSupported ? "síntese disponível" : "síntese indisponível"} · ${immersion.ptVoiceAvailable ? "voz PT localizada" : "voz padrão do navegador"} · sem arquivos externos.`;
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
        renderTutorial();
        renderCampaign();
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
      `<p class="report-mode-line"><strong>${esc(r.modeLabel || "Plantão de carreira")}</strong> · ${esc(C190_Content.cityById(r.cityId || "sp").name)}${r.affectsCareer === false ? " · sem impacto na carreira" : ""}</p><div class="report-stats"><div class="report-stat"><strong>${r.grade}</strong><span>Nota</span></div><div class="report-stat"><strong>${r.score}</strong><span>Pontuação</span></div><div class="report-stat"><strong>${r.resolved}</strong><span>Resolvidas</span></div><div class="report-stat"><strong>${r.failed}</strong><span>Falhas</span></div><div class="report-stat"><strong>${r.abandoned}</strong><span>Abandonadas</span></div></div>${r.specialFirstCompletion ? '<div class="special-reward-banner">Operação especial concluída pela primeira vez. Recompensa de carreira aplicada.</div>' : ""}${r.campaignMissionTitle ? `<div class="special-reward-banner">Campanha: ${esc(r.campaignMissionTitle)} · ${r.campaignPassed ? "missão concluída" : "repetição recomendada"}${r.campaignReward ? ` · +${r.campaignReward.xp} XP` : ""}</div>` : ""}`;
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
      C190_Immersion?.play?.("success", state);
      toast("Carreira criada com sucesso.");
    });
    $$(".nav-btn").forEach(
      (b) => (b.onclick = () => showScreen(b.dataset.screen)),
    );
    $("#menuToggle").onclick = () => {
      const sidebar = $("#sidebar");
      sidebar.classList.toggle("open");
      document.body.classList.toggle("sidebar-open", sidebar.classList.contains("open"));
    };
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        $("#sidebar")?.classList.remove("open");
        document.body.classList.remove("sidebar-open");
      }
    });
    document.addEventListener("click", (event) => {
      const sidebar = $("#sidebar");
      if (!sidebar?.classList.contains("open")) return;
      if (event.target.closest("#sidebar") || event.target.closest("#menuToggle")) return;
      sidebar.classList.remove("open");
      document.body.classList.remove("sidebar-open");
    }, true);
    ["scroll", "wheel", "touchmove", "pointerdown", "keydown"].forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (!isDispatchScreenActive()) return;
        if (event.target?.closest?.("#screen-dispatch") || event.target === document || event.target === document.body) {
          markDispatchInteraction(eventName === "scroll" ? 1250 : 950);
        }
      }, { passive: true, capture: true });
    });
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
        C190_Immersion?.play?.("ring", state);
        toast("Plantão de carreira iniciado.");
      }
    };
    $("#launchCareerFromContentBtn").onclick = () => {
      if (!launchAllowed()) return;
      C190_Content.launchCareer(state);
      persist();
      showScreen("dispatch");
      C190_Immersion?.play?.("ring", state);
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
      C190_Immersion?.play?.("ring", state);
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
    const soundEnabledToggle = $("#soundEnabledToggle");
    if (soundEnabledToggle) soundEnabledToggle.onchange = (e) => { state.settings.soundEnabled = e.target.checked; C190_Immersion?.unlock?.(); persist(); C190_Immersion?.play?.(e.target.checked ? "success" : "warning", state); };
    const radioFxToggle = $("#radioFxToggle");
    if (radioFxToggle) radioFxToggle.onchange = (e) => { state.settings.radioFx = e.target.checked; persist(); C190_Immersion?.play?.("radio", state); };
    const occurrenceFxToggle = $("#occurrenceFxToggle");
    if (occurrenceFxToggle) occurrenceFxToggle.onchange = (e) => { state.settings.occurrenceFx = e.target.checked; persist(); C190_Immersion?.playIncident?.(state.dispatch?.shift?.activeCall || { type: "Ocorrência teste", summary: "Sons de ocorrência ativados." }, state); };
    const vibrationToggle = $("#vibrationToggle");
    if (vibrationToggle) vibrationToggle.onchange = (e) => { state.settings.vibration = e.target.checked; persist(); C190_Immersion?.play?.("beep", state); };
    const voiceEnabledToggle = $("#voiceEnabledToggle");
    if (voiceEnabledToggle) voiceEnabledToggle.onchange = (e) => { state.settings.voiceEnabled = e.target.checked; persist(); C190_Immersion?.speak?.(e.target.checked ? "Voz em português do Brasil ativada." : "Voz desativada.", state, { force: true, interrupt: true }); };
    const callerVoiceToggle = $("#callerVoiceToggle");
    if (callerVoiceToggle) callerVoiceToggle.onchange = (e) => { state.settings.callerVoice = e.target.checked; persist(); C190_Immersion?.speak?.(e.target.checked ? "Narrativa do chamador ativada." : "Narrativa do chamador desativada.", state, { force: true, interrupt: true }); };
    const radioVoiceToggle = $("#radioVoiceToggle");
    if (radioVoiceToggle) radioVoiceToggle.onchange = (e) => { state.settings.radioVoice = e.target.checked; persist(); C190_Immersion?.speakRadio?.(e.target.checked ? "Rádio operacional com voz ativado." : "Rádio operacional com voz desativado.", state); };
    const soundVolumeRange = $("#soundVolumeRange");
    if (soundVolumeRange) soundVolumeRange.oninput = (e) => { state.settings.soundVolume = Math.max(0, Math.min(1, Number(e.target.value) / 100)); C190_Immersion?.normalizeSettings?.(state.settings); renderSettings(); };
    const voiceRateRange = $("#voiceRateRange");
    if (voiceRateRange) voiceRateRange.oninput = (e) => { state.settings.voiceRate = Math.max(0.75, Math.min(1.25, Number(e.target.value) / 100)); C190_Immersion?.normalizeSettings?.(state.settings); renderSettings(); };
    const testAudioBtn = $("#testAudioBtn");
    if (testAudioBtn) testAudioBtn.onclick = () => { C190_Immersion?.unlock?.(); C190_Immersion?.play?.("ring", state); setTimeout(() => C190_Immersion?.play?.("radio", state), 360); setTimeout(() => C190_Immersion?.play?.("success", state), 760); renderSettings(); };
    const testVoiceBtn = $("#testVoiceBtn");
    if (testVoiceBtn) testVoiceBtn.onclick = () => { C190_Immersion?.unlock?.(); C190_Immersion?.speak?.("Central cento e noventa, qual é a emergência? Informe endereço, referência e risco imediato.", state, { force: true, interrupt: true }); renderSettings(); };
    const testOccurrenceFxBtn = $("#testOccurrenceFxBtn");
    if (testOccurrenceFxBtn) testOccurrenceFxBtn.onclick = () => { C190_Immersion?.playIncident?.({ type: "Incêndio com vítima", summary: "Fumaça no prédio, possível vítima no local." }, state); setTimeout(() => C190_Immersion?.speakRadio?.("Primeira unidade informa chegada nas proximidades e pede confirmação visual do local.", state), 320); renderSettings(); };
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
      const d = { ...C190_AntiBreak.diagnostics(state), fieldUnits: C190_FieldUnits?.diagnostics?.(state) };
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
    window.addEventListener("c190:shift-event", (event) => {
      const kind = event.detail?.kind || "info";
      if (kind === "incoming") {
        C190_Immersion?.play?.("ring", state);
        C190_Immersion?.speak?.("Nova ligação de emergência entrando na fila.", state, { rate: 0.98 });
        toast(event.detail?.text || "Nova ligação na fila.", "warning");
        updateDispatchLite();
      } else if (kind === "incoming_scheduled" || kind === "field_handoff") {
        if (kind === "field_handoff") toast(event.detail?.text || "Ocorrência em campo. Central liberada para nova ligação.", "success");
        updateDispatchLite();
        renderSupervisorPanel();
      }
    });
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
        if (dispatchRenderIsSafe()) {
          renderDispatch();
        } else {
          updateDispatchLite();
          scheduleDispatchRenderAfterIdle();
        }
      }
    }, 1000);
  }
  function init() {
    window.C190_AppDebug = { state: () => state, renderAll, renderDispatch, immersion: () => C190_Immersion?.diagnostics?.(state), dispatchFlow: () => C190_Dispatch?.diagnostics?.(state) };
    C190_I18N.init();
    $("#languageSelect").value = C190_I18N.language;
    $("#buildLabel").textContent = `${BUILD} · 22/06/2026 13:15:00 BRT`;
    initEvents();
    renderAll();
    const requestedScreen = location.hash.replace("#", "");
    if (["dashboard", "dispatch", "map", "content", "tutorial", "campaign", "statistics", "career", "training", "goals", "achievements", "reports", "release", "settings"].includes(requestedScreen)) showScreen(requestedScreen);
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
