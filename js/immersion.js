window.C190_Immersion = (() => {
  "use strict";

  const VERSION = 1;
  const BUILD = "CENTRAL190-2300-F29-BALANCEAMENTO-FINAL-20260622-120000-BRT";
  let audioContext = null;
  let master = null;
  let unlocked = false;
  let lastPlayed = 0;

  function normalizeSettings(settings = {}) {
    settings.soundEnabled = settings.soundEnabled !== false;
    settings.soundVolume = Math.max(0, Math.min(1, Number(settings.soundVolume ?? 0.42)));
    settings.radioFx = settings.radioFx !== false;
    settings.vibration = settings.vibration !== false;
    settings.immersiveHud = settings.immersiveHud !== false;
    return settings;
  }

  function allowed(state) {
    const settings = normalizeSettings(state?.settings || {});
    return settings.soundEnabled && settings.soundVolume > 0;
  }

  function unlock() {
    try {
      if (!audioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return { ok: false, reason: "unsupported" };
        audioContext = new Ctx();
        master = audioContext.createGain();
        master.gain.value = 0.34;
        master.connect(audioContext.destination);
      }
      if (audioContext.state === "suspended") audioContext.resume();
      unlocked = true;
      document.body.classList.add("audio-unlocked");
      return { ok: true, state: audioContext.state };
    } catch (error) {
      return { ok: false, reason: error?.message || "audio_error" };
    }
  }

  function settingsVolume(state) {
    return Math.max(0, Math.min(1, Number(state?.settings?.soundVolume ?? 0.42)));
  }

  function tone(freq, duration = 0.08, when = 0, type = "sine", gain = 0.12) {
    if (!audioContext || !master) return;
    const osc = audioContext.createOscillator();
    const env = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioContext.currentTime + when);
    env.gain.setValueAtTime(0.0001, audioContext.currentTime + when);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), audioContext.currentTime + when + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + when + duration);
    osc.connect(env);
    env.connect(master);
    osc.start(audioContext.currentTime + when);
    osc.stop(audioContext.currentTime + when + duration + 0.04);
  }

  function noise(duration = 0.16, when = 0, gain = 0.035) {
    if (!audioContext || !master) return;
    const buffer = audioContext.createBuffer(1, Math.max(1, Math.floor(audioContext.sampleRate * duration)), audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = audioContext.createBufferSource();
    const env = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1900;
    filter.Q.value = 0.85;
    env.gain.value = gain;
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(env);
    env.connect(master);
    src.start(audioContext.currentTime + when);
    src.stop(audioContext.currentTime + when + duration);
  }

  function vibrate(pattern, state) {
    if (!state?.settings?.vibration || !navigator.vibrate) return;
    try { navigator.vibrate(pattern); } catch (_) {}
  }

  function play(kind = "beep", state = {}) {
    if (!allowed(state)) return { ok: false, reason: "disabled" };
    const now = performance.now();
    if (now - lastPlayed < 45 && kind !== "radio") return { ok: false, reason: "throttled" };
    lastPlayed = now;
    const unlockedState = unlock();
    if (!unlockedState.ok) return unlockedState;
    master.gain.setTargetAtTime(settingsVolume(state) * 0.55, audioContext.currentTime, 0.015);
    const radioFx = state?.settings?.radioFx !== false;
    switch (kind) {
      case "ring":
        tone(880, 0.09, 0.00, "sine", 0.13); tone(1175, 0.12, 0.10, "sine", 0.11); tone(880, 0.08, 0.25, "sine", 0.10); vibrate([70, 40, 70], state); break;
      case "question":
        tone(620, 0.055, 0.00, "triangle", 0.08); tone(760, 0.055, 0.06, "triangle", 0.06); break;
      case "triage":
        tone(440, 0.05, 0.00, "square", 0.055); tone(660, 0.06, 0.08, "square", 0.045); break;
      case "unit":
        tone(310, 0.07, 0.00, "sawtooth", 0.045); tone(520, 0.07, 0.07, "sawtooth", 0.04); break;
      case "dispatch":
        tone(740, 0.08, 0.00, "triangle", 0.10); tone(980, 0.08, 0.09, "triangle", 0.08); if (radioFx) noise(0.09, 0.19, 0.02); vibrate(45, state); break;
      case "radio":
        if (radioFx) noise(0.18, 0.00, 0.038); tone(520, 0.05, 0.04, "square", 0.035); break;
      case "success":
        tone(530, 0.07, 0.00, "triangle", 0.075); tone(790, 0.09, 0.08, "triangle", 0.08); tone(1060, 0.11, 0.18, "triangle", 0.07); vibrate(40, state); break;
      case "warning":
        tone(300, 0.12, 0.00, "sawtooth", 0.06); tone(240, 0.12, 0.13, "sawtooth", 0.05); vibrate([40, 50, 40], state); break;
      case "error":
        tone(210, 0.18, 0.00, "sawtooth", 0.08); noise(0.18, 0.04, 0.022); vibrate([80, 30, 80], state); break;
      default:
        tone(610, 0.05, 0.00, "sine", 0.065);
    }
    window.dispatchEvent(new CustomEvent("c190:immersive-sound", { detail: { kind, at: new Date().toISOString() } }));
    return { ok: true, kind };
  }

  function screen(name, state) {
    if (!state?.settings?.immersiveHud) return;
    document.body.dataset.immersiveScreen = name || "dashboard";
  }

  function diagnostics(state = {}) {
    const settings = normalizeSettings(state.settings || {});
    return {
      version: VERSION,
      build: BUILD,
      supported: !!(window.AudioContext || window.webkitAudioContext),
      unlocked,
      soundEnabled: settings.soundEnabled,
      radioFx: settings.radioFx,
      vibration: settings.vibration,
      volume: settings.soundVolume,
      localGeneratedAudio: true,
      externalAudioFiles: 0,
    };
  }

  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("keydown", unlock, { once: true });

  return { VERSION, BUILD, normalizeSettings, unlock, play, screen, diagnostics };
})();
