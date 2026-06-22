window.C190_Map = (() => {
  "use strict";

  const DEFAULT_CENTER = {
    lat: -23.55052,
    lng: -46.63331,
    label: "São Paulo — SP",
  };
  const instances = new Map();
  let globalTileFailures = 0;
  let lastState = null;
  let lastNotice = "";

  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>'"]/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[char],
    );

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function centerOf(state) {
    const saved = state?.settings?.mapCenter || DEFAULT_CENTER;
    const lat = Number(saved.lat);
    const lng = Number(saved.lng);
    return {
      lat: Number.isFinite(lat) ? clamp(lat, -85, 85) : DEFAULT_CENTER.lat,
      lng: Number.isFinite(lng) ? clamp(lng, -180, 180) : DEFAULT_CENTER.lng,
      label: saved.label || DEFAULT_CENTER.label,
    };
  }

  function locationVisible(call) {
    if (!call) return false;
    const display = window.C190_LocationIntel?.displayLocation?.(call);
    if (display) return !!display.visible;
    if (!call.protocol) return true;
    return !!call.locationRevealed || Number(call.protocol?.locationConfidence || 0) > 0 || !!call.protocol?.collected?.address;
  }

  function displayLocation(call) {
    const progressive = window.C190_LocationIntel?.displayLocation?.(call);
    if (progressive) return progressive;
    if (!locationVisible(call)) return { visible: false };
    return { visible: true, lat: Number(call.lat), lng: Number(call.lng), radiusMeters: 0, stage: { id: "precise", label: "Local conhecido" }, confidence: 1, precise: true };
  }

  function callsOf(state) {
    return (state?.dispatch?.shift?.calls || []).filter(
      (call) =>
        call &&
        call.status !== "scheduled" &&
        displayLocation(call)?.visible &&
        Number.isFinite(Number(displayLocation(call)?.lat)) &&
        Number.isFinite(Number(displayLocation(call)?.lng)),
    );
  }

  function modeOf(state) {
    const requested = state?.settings?.mapMode || "auto";
    const leafletReady = typeof window.L !== "undefined";
    const online = navigator.onLine !== false;
    if (requested === "tactical") return "tactical";
    if (!leafletReady || !online || globalTileFailures >= 4) return "tactical";
    return "real";
  }

  function priorityText(priority) {
    return priority === 3 ? "Crítica" : priority === 2 ? "Alta" : "Normal";
  }

  function statusText(status) {
    const labels = {
      waiting: "Na fila",
      active: "Em atendimento",
      paused: "Pausada",
      resolved: "Resolvida",
      failed: "Falha de protocolo",
      abandoned: "Abandonada",
    };
    return labels[status] || status;
  }

  function markerClass(call) {
    return `c190-map-marker priority-${call.priority || 1} status-${call.status || "waiting"}`;
  }

  function markerIcon(call, compact) {
    return window.L.divIcon({
      className: "c190-div-icon",
      html: `<button class="${markerClass(call)}" aria-label="${escapeHtml(call.type)}"><span>${call.priority || 1}</span></button>`,
      iconSize: compact ? [32, 32] : [38, 38],
      iconAnchor: compact ? [16, 16] : [19, 19],
      popupAnchor: [0, -18],
    });
  }
  function resourceIcon(resource, compact) {
    const label = resource.type === "pm" ? "PM" : resource.type === "bombeiros" ? "193" : "192";
    return window.L.divIcon({
      className: "c190-div-icon",
      html: `<button class="resource-marker type-${escapeHtml(resource.type)} ${resource.selected ? "selected" : ""} ${resource.moving ? "moving" : ""} ${resource.arrived ? "arrived" : ""}" style="--unit-progress:${Math.round((resource.progress || 0) * 100)}%" aria-label="${escapeHtml(resource.label)}"><span>${escapeHtml(resource.short || label)}</span></button>`,
      iconSize: compact ? [28, 28] : [34, 34],
      iconAnchor: compact ? [14, 14] : [17, 17],
      popupAnchor: [0, -16],
    });
  }

  function resourcePopup(resource) {
    return `<div class="map-popup-card"><strong>${escapeHtml(resource.label)}</strong><span>${escapeHtml(resource.moving ? `Em deslocamento · ${Math.round((resource.progress || 0) * 100)}%` : resource.arrived ? "No local" : resource.selected ? "Selecionada para despacho" : resource.status)}</span><small>${escapeHtml(resource.role || "unidade operacional")} · ETA ${Number(resource.etaMin || 0)} min</small></div>`;
  }


  function popupHtml(call) {
    const action = ["waiting", "paused"].includes(call.status)
      ? `<button class="map-popup-action" data-map-answer="${escapeHtml(call.id)}">Atender ocorrência</button>`
      : "";
    const display = displayLocation(call);
    const missing = window.C190_LocationIntel?.missingForPrecision?.(call) || [];
    return `<div class="map-popup-card">
      <strong>${escapeHtml(call.type)}</strong>
      <span>${escapeHtml(display?.precise ? call.location : (display?.stage?.label || "Endereço não confirmado"))}</span>
      <small>${priorityText(call.priority)} · ${statusText(call.status)} · ${Number(call.wait || 0)}s</small>
      <small>Precisão: ${escapeHtml(display?.stage?.label || "Sem localização")}${display?.radiusMeters ? ` · raio ~${Math.round(display.radiusMeters)}m` : ""}</small>
      ${missing.length ? `<small>Falta: ${escapeHtml(missing.join(", "))}</small>` : ""}
      ${action}
    </div>`;
  }

  function notify(text, type = "info") {
    if (lastNotice === text) return;
    lastNotice = text;
    window.dispatchEvent(
      new CustomEvent("c190:map-notice", { detail: { text, type } }),
    );
  }

  function createRealMap(record, state) {
    const center = centerOf(state);
    const map = window.L.map(record.containerId, {
      zoomControl: !record.compact,
      attributionControl: true,
      preferCanvas: true,
      minZoom: 3,
      maxZoom: 19,
      keyboard: !record.compact,
      dragging: true,
      tap: true,
    }).setView([center.lat, center.lng], record.compact ? 13 : 14);

    const tileLayer = window.L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
        crossOrigin: true,
      },
    );

    record.tileErrors = 0;
    tileLayer.on("tileerror", () => {
      record.tileErrors += 1;
      globalTileFailures += 1;
      if (record.tileErrors >= 3) {
        record.failed = true;
        notify(
          "Os blocos do mapa real não carregaram. O mapa tático foi ativado automaticamente.",
          "warning",
        );
        render(lastState);
      }
    });
    tileLayer.on("tileload", () => {
      record.tileErrors = Math.max(0, record.tileErrors - 1);
      globalTileFailures = Math.max(0, globalTileFailures - 1);
    });
    tileLayer.addTo(map);

    record.map = map;
    record.tileLayer = tileLayer;
    record.markerLayer = window.L.layerGroup().addTo(map);
    record.routeLayer = window.L.layerGroup().addTo(map);
    record.centralLayer = window.L.layerGroup().addTo(map);
    record.resourceLayer = window.L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 50);
  }

  function bindPopupActions(record) {
    if (!record.map) return;
    if (record.popupHandler) {
      record.map.off("popupopen", record.popupHandler);
    }
    record.popupHandler = (event) => {
      const root = event.popup.getElement();
      if (!root) return;
      const button = root.querySelector("[data-map-answer]");
      if (button) {
        button.onclick = () => {
          window.dispatchEvent(
            new CustomEvent("c190:map-answer", {
              detail: { id: button.dataset.mapAnswer },
            }),
          );
          record.map.closePopup();
        };
      }
    };
    record.map.on("popupopen", record.popupHandler);
  }

  function updateReal(record, state) {
    if (!record.map) createRealMap(record, state);
    if (!record.map || record.failed) return false;
    const center = centerOf(state);
    const calls = callsOf(state);

    record.markerLayer.clearLayers();
    record.routeLayer.clearLayers();
    record.centralLayer.clearLayers();
    record.resourceLayer?.clearLayers?.();

    const centralIcon = window.L.divIcon({
      className: "c190-div-icon",
      html: '<div class="c190-central-marker" title="Central operacional">190</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
    window.L.marker([center.lat, center.lng], {
      icon: centralIcon,
      keyboard: false,
      zIndexOffset: 900,
    })
      .bindTooltip(escapeHtml(center.label), { direction: "top" })
      .addTo(record.centralLayer);

    const mapResources = (window.C190_FieldUnits?.resourcesForMap?.(state)) || (window.C190_ResourceDispatch?.resourcesFor?.(state)) || (window.C190_LocationIntel?.resourcesFor?.(state)) || [];
    mapResources.forEach((resource) => {
      window.L.marker([Number(resource.lat), Number(resource.lng)], {
        icon: resourceIcon(resource, record.compact),
        title: resource.label,
        zIndexOffset: resource.moving || resource.arrived ? 760 : 450,
      }).bindPopup(resourcePopup(resource), { closeButton: true, maxWidth: 240 }).addTo(record.resourceLayer);
      if ((resource.moving || resource.arrived) && Number.isFinite(Number(resource.targetLat)) && Number.isFinite(Number(resource.targetLng))) {
        window.L.polyline(
          [[Number(resource.lat), Number(resource.lng)], [Number(resource.targetLat), Number(resource.targetLng)]],
          { color: resource.type === "pm" ? "#60a5fa" : resource.type === "bombeiros" ? "#fb7185" : resource.type === "samu" ? "#34d399" : "#fbbf24", weight: record.compact ? 2 : 3, opacity: 0.76, dashArray: resource.arrived ? null : "6 8", className: "unit-route-line" }
        ).addTo(record.routeLayer);
      }
    });

    calls.forEach((call) => {
      const display = displayLocation(call);
      if (!display?.visible) return;
      const marker = window.L.marker([Number(display.lat), Number(display.lng)], {
        icon: markerIcon(call, record.compact),
        title: call.type,
        riseOnHover: true,
        zIndexOffset: call.status === "active" ? 1000 : call.priority * 100,
      });
      marker.bindPopup(popupHtml(call), {
        closeButton: true,
        maxWidth: 280,
      });
      marker.on("click", () => {
        window.dispatchEvent(
          new CustomEvent("c190:map-call-select", {
            detail: { id: call.id },
          }),
        );
      });
      marker.addTo(record.markerLayer);
      if (display.radiusMeters > 0 && !record.compact) {
        window.L.circle([Number(display.lat), Number(display.lng)], {
          radius: display.radiusMeters,
          weight: display.precise ? 1 : 2,
          opacity: display.precise ? 0.32 : 0.75,
          fillOpacity: display.precise ? 0.04 : 0.10,
          className: `location-radius stage-${display.stageId || "region"}`,
        }).addTo(record.routeLayer);
      }

      if (["waiting", "active", "paused"].includes(call.status)) {
        window.L.polyline(
          [
            [center.lat, center.lng],
            [Number(display.lat), Number(display.lng)],
          ],
          {
            color:
              call.priority === 3
                ? "#fb7185"
                : call.priority === 2
                  ? "#f59e0b"
                  : "#60a5fa",
            weight: call.status === "active" ? 4 : 2,
            opacity: call.status === "active" ? 0.9 : 0.48,
            dashArray: call.status === "active" ? null : "7 8",
          },
        ).addTo(record.routeLayer);
      }
    });

    bindPopupActions(record);
    const signature = calls
      .map((call) => `${call.id}:${call.status}:${call.priority}`)
      .join("|");
    if (signature !== record.lastSignature) {
      record.lastSignature = signature;
      if (calls.length) {
        const bounds = window.L.latLngBounds([
          [center.lat, center.lng],
          ...calls.map((call) => { const d = displayLocation(call); return [Number(d.lat), Number(d.lng)]; }),
        ]);
        record.map.fitBounds(bounds.pad(record.compact ? 0.16 : 0.23), {
          maxZoom: record.compact ? 14 : 15,
          animate: false,
        });
      } else {
        record.map.setView([center.lat, center.lng], record.compact ? 13 : 14, {
          animate: false,
        });
      }
    }
    setTimeout(() => record.map.invalidateSize(), 0);
    return true;
  }

  function tacticalPosition(call, center, calls) {
    const spread = calls.reduce(
      (acc, item) => ({
        lat: Math.max(acc.lat, Math.abs(Number(displayLocation(item)?.lat || item.lat) - center.lat)),
        lng: Math.max(acc.lng, Math.abs(Number(displayLocation(item)?.lng || item.lng) - center.lng)),
      }),
      { lat: 0.018, lng: 0.018 },
    );
    const d = displayLocation(call) || call;
    const x = 50 + ((Number(d.lng) - center.lng) / (spread.lng * 2.5)) * 100;
    const y = 50 - ((Number(d.lat) - center.lat) / (spread.lat * 2.5)) * 100;
    return { x: clamp(x, 8, 92), y: clamp(y, 8, 92) };
  }

  function updateTactical(record, state) {
    const fallback = document.getElementById(record.fallbackId);
    if (!fallback) return;
    const center = centerOf(state);
    const calls = callsOf(state);
    fallback.innerHTML = `
      <div class="tactical-grid-label north">N</div>
      <div class="tactical-grid-label scale">SETOR ${escapeHtml(center.label).toUpperCase()}</div>
      <button class="tactical-central" style="left:50%;top:50%" title="${escapeHtml(center.label)}">190</button>
      ${calls
        .map((call) => {
          const position = tacticalPosition(call, center, calls);
          return `<button class="tactical-marker ${markerClass(call)}" data-map-call="${escapeHtml(call.id)}" style="left:${position.x}%;top:${position.y}%" aria-label="${escapeHtml(call.type)}">
            <span>${call.priority || 1}</span><small>${escapeHtml(window.C190_LocationIntel?.qualityLabel?.(call) || call.type)}</small>
          </button>`;
        })
        .join("")}
      ${((window.C190_FieldUnits?.movingResources?.(state)) || []).map((resource) => {
        const fakeCall = { lat: resource.lat, lng: resource.lng, priority: 2, status: resource.arrived ? "resolved" : "active", type: resource.short || resource.label };
        const position = tacticalPosition(fakeCall, center, [...calls, fakeCall]);
        return `<button class="tactical-resource-marker type-${escapeHtml(resource.type)} ${resource.moving ? "moving" : "arrived"}" style="left:${position.x}%;top:${position.y}%;--unit-progress:${Math.round((resource.progress || 0) * 100)}%" title="${escapeHtml(resource.label)}"><span>${escapeHtml(resource.short || "UN")}</span></button>`;
      }).join("")}
      ${calls.length ? "" : '<div class="tactical-empty">Nenhuma ocorrência georreferenciada no plantão atual.</div>'}
    `;
    fallback.querySelectorAll("[data-map-call]").forEach((button) => {
      button.onclick = () =>
        window.dispatchEvent(
          new CustomEvent("c190:map-call-select", {
            detail: { id: button.dataset.mapCall },
          }),
        );
    });
  }

  function ensureRecord(containerId, fallbackId, compact) {
    if (!document.getElementById(containerId)) return null;
    let record = instances.get(containerId);
    if (!record) {
      record = {
        containerId,
        fallbackId,
        compact,
        map: null,
        failed: false,
        tileErrors: 0,
        lastSignature: "",
      };
      instances.set(containerId, record);
    }
    return record;
  }

  function renderRecord(containerId, fallbackId, state, compact) {
    const record = ensureRecord(containerId, fallbackId, compact);
    if (!record) return;
    const container = document.getElementById(containerId);
    const fallback = document.getElementById(fallbackId);
    const requested = state?.settings?.mapMode || "auto";
    let mode = modeOf(state);
    if (record.failed) mode = "tactical";

    if (mode === "real") {
      container.hidden = false;
      if (fallback) fallback.hidden = true;
      if (!updateReal(record, state)) mode = "tactical";
    }
    if (mode === "tactical") {
      container.hidden = true;
      if (fallback) fallback.hidden = false;
      updateTactical(record, state);
    }

    document.querySelectorAll("[data-map-status]").forEach((element) => {
      const reason =
        mode === "real"
          ? "Mapa real online"
          : requested === "tactical"
            ? "Mapa tático selecionado"
            : navigator.onLine === false
              ? "Sem internet · mapa tático"
              : "Mapa real indisponível · modo tático";
      element.textContent = reason;
      element.dataset.mode = mode;
    });
  }

  function render(state) {
    if (!state) return;
    lastState = state;
    renderRecord("dispatchMap", "dispatchMapFallback", state, true);
    renderRecord("operationsMap", "operationsMapFallback", state, false);
  }

  function fit(state = lastState) {
    if (!state) return;
    const center = centerOf(state);
    const calls = callsOf(state);
    instances.forEach((record) => {
      if (!record.map || record.failed || modeOf(state) !== "real") return;
      if (!calls.length) {
        record.map.setView([center.lat, center.lng], record.compact ? 13 : 14, {
          animate: false,
        });
        return;
      }
      const bounds = window.L.latLngBounds([
        [center.lat, center.lng],
        ...calls.map((call) => [Number(call.lat), Number(call.lng)]),
      ]);
      record.map.fitBounds(bounds.pad(record.compact ? 0.16 : 0.23), {
        maxZoom: record.compact ? 14 : 15,
      });
    });
  }

  function focusCall(id) {
    if (!id || !lastState) return;
    const call = callsOf(lastState).find((item) => item.id === id);
    if (!call) return;
    instances.forEach((record) => {
      if (!record.map || record.failed || modeOf(lastState) !== "real") return;
      const display = displayLocation(call);
      record.map.setView(
        [Number(display.lat), Number(display.lng)],
        display.precise ? (record.compact ? 15 : 16) : (record.compact ? 14 : 15),
      );
      record.markerLayer.eachLayer((layer) => {
        const latLng = layer.getLatLng?.();
        if (
          latLng &&
          Math.abs(latLng.lat - Number(display.lat)) < 0.000001 &&
          Math.abs(latLng.lng - Number(display.lng)) < 0.000001
        ) {
          layer.openPopup?.();
        }
      });
    });
  }

  function invalidate() {
    instances.forEach((record) => {
      if (record.map) setTimeout(() => record.map.invalidateSize(), 20);
    });
  }

  function retry() {
    globalTileFailures = 0;
    lastNotice = "";
    instances.forEach((record) => {
      record.failed = false;
      record.tileErrors = 0;
      record.lastSignature = "";
    });
    render(lastState);
  }

  function diagnostics(state = lastState) {
    return {
      leafletLoaded: typeof window.L !== "undefined",
      requestedMode: state?.settings?.mapMode || "auto",
      effectiveMode: state ? modeOf(state) : "unknown",
      online: navigator.onLine !== false,
      mapInstances: instances.size,
      tileFailures: globalTileFailures,
      center: state ? centerOf(state) : DEFAULT_CENTER,
      callsWithCoordinates: state ? callsOf(state).length : 0,
      protocolLocationGate: true,
      progressiveLocation: true,
      callsByLocationStage: state ? (state.dispatch?.shift?.calls || []).reduce((acc, call) => { const stage = window.C190_LocationIntel?.normalize?.(call)?.stage || "none"; acc[stage] = (acc[stage] || 0) + 1; return acc; }, {}) : {},
      availableResources: state ? ((window.C190_FieldUnits?.resourcesForMap?.(state)) || (window.C190_ResourceDispatch?.resourcesFor?.(state)) || (window.C190_LocationIntel?.resourcesFor?.(state)) || []).length : 0,
      movingResources: state ? (window.C190_FieldUnits?.diagnostics?.(state)?.movingUnits || 0) : 0,
      resourceDispatchVersion: window.C190_ResourceDispatch?.VERSION || 0,
      provider: "OpenStreetMap Standard raster tiles",
      tileCaching: false,
    };
  }

  window.addEventListener("online", () => retry());
  window.addEventListener("offline", () => render(lastState));

  return {
    DEFAULT_CENTER,
    centerOf,
    callsOf,
    locationVisible,
    displayLocation,
    modeOf,
    render,
    fit,
    focusCall,
    invalidate,
    retry,
    diagnostics,
    priorityText,
    statusText,
  };
})();
