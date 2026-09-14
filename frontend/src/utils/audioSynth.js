// Web Audio API & Speech Synthesis Engine for Omnidesk BD
// Clean, soft glassmorphism style audio and clean female voice

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
   * Synthesize a modern, soft glassmorphism startup chime
   * Less aggressive, more ambient and smooth.
   */
  playPowerOnChime() {
    if (!this.isSoundEnabled()) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master output with very smooth attack and long decay
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.2, now + 0.3); // Softer peak
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
      masterGain.connect(ctx.destination);

      // Lowpass filter to keep it warm and non-piercing
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 1.0);
      filter.Q.setValueAtTime(2.0, now);
      filter.connect(masterGain);

      // Layer 1: Warm ambient pad
      const oscPad = ctx.createOscillator();
      oscPad.type = 'sine';
      oscPad.frequency.setValueAtTime(261.63, now); // C4
      oscPad.frequency.exponentialRampToValueAtTime(523.25, now + 0.5); // C5
      
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.001, now);
      padGain.gain.linearRampToValueAtTime(0.4, now + 0.4);
      padGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      oscPad.connect(padGain);
      padGain.connect(filter);

      // Layer 2: Shimmering glass bell
      const oscBell = ctx.createOscillator();
      oscBell.type = 'triangle';
      oscBell.frequency.setValueAtTime(783.99, now + 0.1); // G5
      oscBell.frequency.exponentialRampToValueAtTime(1046.50, now + 0.8); // C6

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.001, now);
      bellGain.gain.linearRampToValueAtTime(0.15, now + 0.5);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
      oscBell.connect(bellGain);
      bellGain.connect(filter);

      // Start & Stop
      oscPad.start(now);
      oscBell.start(now + 0.1);

      oscPad.stop(now + 4.0);
      oscBell.stop(now + 4.0);
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
    
    // NOTE: To get a true studio-quality advertisement voice, 
    // a real audio file (MP3) is required. Web Speech API is inherently limited.
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Clear any pending speech

      const utterance = new SpeechSynthesisUtterance("Welcome to Omnidesk BD");
      utterance.rate = 0.95; // Slightly slower, more natural pace
      utterance.pitch = 1.05; // Slightly higher but natural
      utterance.volume = 0.9;

      // Select high quality female voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        // Try to find the most premium voice available on the OS
        const preferredFemale = voices.find(v => 
          (v.lang.startsWith('en')) && 
          (v.name.includes('Premium') ||
           v.name.includes('Enhanced') ||
           v.name.includes('Samantha') || 
           v.name.includes('Google US English') || 
           v.name.includes('Google UK English Female') || 
           v.name.includes('Karen') ||
           v.name.includes('Moira') ||
           v.name.includes('Victoria') ||
           v.name.includes('Female'))
        );

        if (preferredFemale) {
          utterance.voice = preferredFemale;
        } else {
          const anyEnglish = voices.find(v => v.lang.startsWith('en') && !v.name.includes('Male') && !v.name.includes('David'));
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
   */
  triggerBootAudio(onComplete) {
    this.playPowerOnChime();
    
    // Start speech shortly after the smooth chime reaches its peak
    setTimeout(() => {
      this.speakWelcome(onComplete);
    }, 700);
  }
}

export const soundEngine = new SoundEngine();
