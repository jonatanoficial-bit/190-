window.C190_Immersion = (() => {
  "use strict";

  const VERSION = 2;
  const BUILD = "CENTRAL190-2800-F34-AUDIO-VOZ-PTBR-20260623-123800-BRT";
  let audioContext = null;
  let master = null;
  let unlocked = false;
  let lastPlayed = 0;
  let lastVoiceAt = 0;

  function normalizeSettings(settings = {}) {
    settings.soundEnabled = settings.soundEnabled !== false;
    settings.soundVolume = Math.max(0, Math.min(1, Number(settings.soundVolume ?? 0.42)));
    settings.radioFx = settings.radioFx !== false;
    settings.vibration = settings.vibration !== false;
    settings.immersiveHud = settings.immersiveHud !== false;
    settings.voiceEnabled = settings.voiceEnabled !== false;
    settings.callerVoice = settings.callerVoice !== false;
    settings.radioVoice = settings.radioVoice !== false;
    settings.occurrenceFx = settings.occurrenceFx !== false;
    settings.voiceRate = Math.max(0.75, Math.min(1.25, Number(settings.voiceRate ?? 0.94)));
    settings.voicePitch = Math.max(0.75, Math.min(1.25, Number(settings.voicePitch ?? 1.0)));
    return settings;
  }

  function allowed(state) {
    const settings = normalizeSettings(state?.settings || {});
    return settings.soundEnabled && settings.soundVolume > 0;
  }

  function voiceAllowed(state) {
    const settings = normalizeSettings(state?.settings || {});
    return settings.voiceEnabled && settings.soundVolume > 0 && "speechSynthesis" in window;
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

  function noise(duration = 0.16, when = 0, gain = 0.035, filterType = "bandpass", freq = 1900) {
    if (!audioContext || !master) return;
    const buffer = audioContext.createBuffer(1, Math.max(1, Math.floor(audioContext.sampleRate * duration)), audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = audioContext.createBufferSource();
    const env = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = 0.85;
    env.gain.value = gain;
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(env);
    env.connect(master);
    src.start(audioContext.currentTime + when);
    src.stop(audioContext.currentTime + when + duration);
  }

  function siren(when = 0, gain = 0.045) {
    tone(720, 0.16, when, "sawtooth", gain);
    tone(960, 0.16, when + 0.17, "sawtooth", gain * 0.86);
    tone(720, 0.15, when + 0.34, "sawtooth", gain * 0.76);
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
      case "siren":
        siren(0, 0.045); vibrate([35, 35, 35], state); break;
      case "fire":
        noise(0.34, 0.00, 0.028, "lowpass", 900); noise(0.18, 0.12, 0.022, "highpass", 2400); tone(220, 0.08, 0.02, "sawtooth", 0.03); break;
      case "medical":
        tone(900, 0.045, 0.00, "sine", 0.06); tone(900, 0.045, 0.18, "sine", 0.05); tone(900, 0.045, 0.36, "sine", 0.045); break;
      case "panic":
        tone(180, 0.08, 0.00, "sawtooth", 0.035); tone(260, 0.08, 0.09, "sawtooth", 0.035); noise(0.22, 0.05, 0.018, "bandpass", 1200); break;
      case "rain":
        noise(0.42, 0.00, 0.026, "highpass", 2600); tone(160, 0.15, 0.03, "triangle", 0.018); break;
      default:
        tone(610, 0.05, 0.00, "sine", 0.065);
    }
    window.dispatchEvent(new CustomEvent("c190:immersive-sound", { detail: { kind, at: new Date().toISOString() } }));
    return { ok: true, kind };
  }

  function incidentKind(call = {}) {
    const text = `${call.type || ""} ${call.summary || ""} ${call.category || ""} ${call.requiredOrgans || ""}`.toLowerCase();
    if (/incênd|fogo|fumaça|gás|bombeiro|desab|alag|queda|resgate/.test(text)) return "fire";
    if (/samu|avc|mal súbito|vítima|ferid|médic|idoso|criança|ambul/.test(text)) return "medical";
    if (/roubo|arma|agressor|violência|disparo|ameaça|fuga|pânico/.test(text)) return "panic";
    if (/chuva|enchente|alag|tempest|desliz/.test(text)) return "rain";
    return "radio";
  }

  function playIncident(call, state = {}) {
    if (state?.settings?.occurrenceFx === false) return { ok: false, reason: "disabled" };
    const kind = incidentKind(call);
    play(kind, state);
    if (["fire", "medical", "panic"].includes(kind)) setTimeout(() => play("radio", state), 260);
    return { ok: true, kind };
  }

  function pickPtVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices?.() || [];
    return voices.find((voice) => /pt-BR/i.test(voice.lang || "")) ||
           voices.find((voice) => /^pt/i.test(voice.lang || "")) ||
           voices[0] ||
           null;
  }

  function sanitizeSpeech(text = "") {
    return String(text)
      .replace(/190/g, "cento e noventa")
      .replace(/192/g, "cento e noventa e dois")
      .replace(/193/g, "cento e noventa e três")
      .replace(/PM/g, "Pê eme")
      .replace(/SAMU/g, "Samu")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 230);
  }

  function speak(text, state = {}, options = {}) {
    if (!voiceAllowed(state)) return { ok: false, reason: "voice_disabled" };
    const now = performance.now();
    if (now - lastVoiceAt < 850 && !options.force) return { ok: false, reason: "voice_throttled" };
    lastVoiceAt = now;
    try {
      const settings = normalizeSettings(state.settings || {});
      const utterance = new SpeechSynthesisUtterance(sanitizeSpeech(text));
      utterance.lang = "pt-BR";
      utterance.rate = Number(options.rate || settings.voiceRate || 0.94);
      utterance.pitch = Number(options.pitch || settings.voicePitch || 1.0);
      utterance.volume = Math.max(0.05, Math.min(1, settings.soundVolume || 0.42));
      const voice = pickPtVoice();
      if (voice) utterance.voice = voice;
      if (options.interrupt) window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return { ok: true, text: utterance.text };
    } catch (error) {
      return { ok: false, reason: error?.message || "speech_error" };
    }
  }

  function speakCall(call = {}, state = {}) {
    const settings = normalizeSettings(state.settings || {});
    if (!settings.callerVoice) return { ok: false, reason: "caller_voice_disabled" };
    const text = call.summary || call.description || call.type || "Preciso falar com a emergência.";
    playIncident(call, state);
    return speak(`Chamador. ${text}`, state, { interrupt: false, rate: 0.92, pitch: 1.02 });
  }

  function speakRadio(text, state = {}) {
    const settings = normalizeSettings(state.settings || {});
    if (!settings.radioVoice) return { ok: false, reason: "radio_voice_disabled" };
    play("radio", state);
    return speak(`Rádio operacional. ${text}`, state, { interrupt: false, rate: 0.98, pitch: 0.92 });
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
      speechSupported: "speechSynthesis" in window,
      ptVoiceAvailable: !!pickPtVoice(),
      unlocked,
      soundEnabled: settings.soundEnabled,
      radioFx: settings.radioFx,
      vibration: settings.vibration,
      volume: settings.soundVolume,
      voiceEnabled: settings.voiceEnabled,
      callerVoice: settings.callerVoice,
      radioVoice: settings.radioVoice,
      occurrenceFx: settings.occurrenceFx,
      localGeneratedAudio: true,
      externalAudioFiles: 0,
    };
  }

  document.addEventListener("pointerdown", unlock, { once: true, passive: true });
  document.addEventListener("keydown", unlock, { once: true });
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => pickPtVoice();
  }

  return { VERSION, BUILD, normalizeSettings, unlock, play, playIncident, speak, speakCall, speakRadio, screen, diagnostics };
})();
