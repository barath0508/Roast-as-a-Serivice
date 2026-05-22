// Web Audio API Retro Sound Effects Synthesizer
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('raas_sound_enabled') !== 'false';
  }

  initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('raas_sound_enabled', this.enabled);
    return this.enabled;
  }

  playClick() {
    if (!this.enabled) return;
    this.initContext();
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playTypewriter() {
    if (!this.enabled) return;
    this.initContext();
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

    gainNode.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.03);
  }

  // Helper to generate white noise buffer
  createNoiseBuffer() {
    const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playBurn(duration = 1.0) {
    if (!this.enabled) return;
    this.initContext();
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 3.0;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
    // crackling simulation
    gainNode.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + duration * 0.3);
    gainNode.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    // Crackle pops
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    oscGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noiseSource.start();
    noiseSource.stop(this.ctx.currentTime + duration);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playNuclear() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;

    // 1. Explosion Base (low filtered noise)
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createNoiseBuffer();
    
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(600, now);
    lowpass.frequency.exponentialRampToValueAtTime(40, now + 2.0);

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

    noiseSource.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noiseSource.start(now);
    noiseSource.stop(now + 2.2);

    // 2. Rising Synth Alarm
    const alarmOsc = this.ctx.createOscillator();
    const alarmGain = this.ctx.createGain();
    alarmOsc.type = 'sawtooth';
    alarmOsc.frequency.setValueAtTime(150, now);
    alarmOsc.frequency.linearRampToValueAtTime(700, now + 0.5);
    alarmOsc.frequency.linearRampToValueAtTime(300, now + 1.0);
    alarmOsc.frequency.linearRampToValueAtTime(800, now + 1.5);
    alarmOsc.frequency.linearRampToValueAtTime(100, now + 2.0);

    alarmGain.gain.setValueAtTime(0.0, now);
    alarmGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    alarmGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
    alarmGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    alarmOsc.connect(alarmGain);
    alarmGain.connect(this.ctx.destination);

    alarmOsc.start(now);
    alarmOsc.stop(now + 2.0);
  }

  playLaughter() {
    if (!this.enabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    
    // Play a sequence of retro chiptune pitches that sound like laugh pulses
    // e.g. "HA HA HA HA"
    const notes = [
      { freq: 440, duration: 0.08, delay: 0 },
      { freq: 440, duration: 0.08, delay: 0.12 },
      { freq: 520, duration: 0.08, delay: 0.24 },
      { freq: 520, duration: 0.08, delay: 0.36 },
      { freq: 660, duration: 0.12, delay: 0.48 },
      { freq: 880, duration: 0.25, delay: 0.62 }
    ];

    notes.forEach(note => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, now + note.delay);
      
      // Vibrato
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();
      vibrato.frequency.value = 15; // Speed of vibrato
      vibratoGain.gain.value = 10;   // Depth of vibrato
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now + note.delay);
      vibrato.stop(now + note.delay + note.duration);

      gainNode.gain.setValueAtTime(0.0, now + note.delay);
      gainNode.gain.linearRampToValueAtTime(0.04, now + note.delay + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + note.delay + note.duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now + note.delay);
      osc.stop(now + note.delay + note.duration);
    });
  }
}

export const soundManager = new SoundManager();
export default soundManager;
