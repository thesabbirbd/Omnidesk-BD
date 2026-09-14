// Web Audio API & Speech Synthesis Engine for Omnidesk BD
// Synthesizes studio-grade futuristic power-on chimes and clean female voice welcomes

class SoundEngine {
  constructor() {
    this.audioCtx = null;
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isSoundEnabled() {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('studyos_sound_enabled') !== 'false';
  }

  setSoundEnabled(enabled) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studyos_sound_enabled', enabled ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('studyos-sound-toggled', { detail: enabled }));
    }
  }

  /**
   * Synthesize a modern futuristic power-on chime with dual harmonics, lowpass sweep & reverb tail
   */
  playPowerOnChime() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master gain for the whole chord
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.28, now + 0.12);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      masterGain.connect(ctx.destination);

      // Lowpass resonant filter sweep (creates that deep, satisfying electronic power-up hum)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.8);
      filter.Q.setValueAtTime(4.2, now);
      filter.connect(masterGain);

      // Sub-bass fundamental (warmth)
      const oscSub = ctx.createOscillator();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(110, now); // A2
      oscSub.frequency.exponentialRampToValueAtTime(220, now + 0.35); // Glide up to A3
      oscSub.frequency.exponentialRampToValueAtTime(440, now + 1.2); // Settle on A4

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.linearRampToValueAtTime(0.1, now + 1.8);
      oscSub.connect(subGain);
      subGain.connect(filter);

      // Mid harmonic (Cyber chord E4 -> C#5 -> E5)
      const oscMid = ctx.createOscillator();
      oscMid.type = 'triangle';
      oscMid.frequency.setValueAtTime(329.63, now + 0.1); // E4
      oscMid.frequency.exponentialRampToValueAtTime(659.25, now + 0.9); // E5

      const midGain = ctx.createGain();
      midGain.gain.setValueAtTime(0.001, now);
      midGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
      midGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
      oscMid.connect(midGain);
      midGain.connect(filter);

      // High futuristic shimmer (Chime tone)
      const oscHigh = ctx.createOscillator();
      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(880, now + 0.25); // A5
      oscHigh.frequency.exponentialRampToValueAtTime(1760, now + 1.1); // A6 shimmer

      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.001, now);
      highGain.gain.linearRampToValueAtTime(0.15, now + 0.35);
      highGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
      oscHigh.connect(highGain);
      highGain.connect(filter);

      // Start all nodes
      oscSub.start(now);
      oscMid.start(now + 0.08);
      oscHigh.start(now + 0.22);

      oscSub.stop(now + 2.8);
      oscMid.stop(now + 2.8);
      oscHigh.stop(now + 2.8);
    } catch (e) {
      console.warn("Could not synthesize power-on audio:", e);
    }
  }

  /**
   * Warm studio female voice greeting: "Welcome to Omnidesk BD"
   */
  speakWelcome(onEndCallback) {
    if (!this.isSoundEnabled()) {
      if (onEndCallback) onEndCallback();
      return;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Clear any pending speech

      const utterance = new SpeechSynthesisUtterance("Welcome to Omnidesk BD");
      utterance.rate = 0.92; // Warm, confident studio pace
      utterance.pitch = 1.06; // Natural friendly female pitch
      utterance.volume = 1.0;

      // Select high quality female voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferredFemale = voices.find(v => 
          (v.lang.startsWith('en')) && 
          (v.name.includes('Female') || 
           v.name.includes('Zira') || 
           v.name.includes('Samantha') || 
           v.name.includes('Google UK English Female') || 
           v.name.includes('Google US English') || 
           v.name.includes('Natural') || 
           v.name.includes('Victoria') ||
           v.name.includes('Karen') ||
           v.name.includes('Moira'))
        );

        if (preferredFemale) {
          utterance.voice = preferredFemale;
        } else {
          const anyEnglish = voices.find(v => v.lang.startsWith('en'));
          if (anyEnglish) utterance.voice = anyEnglish;
        }
      }

      if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = onEndCallback;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (onEndCallback) onEndCallback();
    }
  }

  /**
   * Combined Futuristic Boot Sequence Trigger:
   * Power-on sound plays immediately, followed by the warm female greeting
   */
  triggerBootAudio(onComplete) {
    this.playPowerOnChime();
    // Start speech after the power chime swells (~650ms for maximum futuristic cinematic effect)
    setTimeout(() => {
      this.speakWelcome(onComplete);
    }, 650);
  }
}

export const soundEngine = new SoundEngine();
