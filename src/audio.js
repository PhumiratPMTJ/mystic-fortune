// Mystic Web Audio API Sound Synthesizer
// Generates magical, high-quality audio effects directly in the browser with code!

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.bgOsc = null;
    this.bgGain = null;
    this.isBgPlaying = false;
    this.bgAudio = null; // HTML5 Audio instance for MP3 background music
    this.bgPlaylist = [
      '/audio/background1.mp3',
      '/audio/background2.mp3',
      '/audio/background3.mp3',
      '/audio/background4.mp3',
      '/audio/background5.mp3'
    ]; // 5 songs playlist
    this.currentSongIndex = 0;
  }

  // Initialize Audio Context (must be called via user interaction)
  init() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && !this.ctx) {
      this.ctx = new AudioContextClass();
    }
    
    // Initialize the HTML5 Audio element for custom background music playlist
    if (!this.bgAudio) {
      // Pick a random starting song index
      this.currentSongIndex = Math.floor(Math.random() * this.bgPlaylist.length);
      this.bgAudio = new Audio(this.bgPlaylist[this.currentSongIndex]);
      this.bgAudio.volume = 0.02; // Set to extremely soft background ambient level (2%)
      
      // Auto-play a random next song when the current one ends, avoiding immediate repeats
      this.bgAudio.addEventListener('ended', () => {
        let nextIndex = this.currentSongIndex;
        if (this.bgPlaylist.length > 1) {
          while (nextIndex === this.currentSongIndex) {
            nextIndex = Math.floor(Math.random() * this.bgPlaylist.length);
          }
        }
        this.currentSongIndex = nextIndex;
        this.bgAudio.src = this.bgPlaylist[this.currentSongIndex];
        this.bgAudio.play().catch(e => {
          console.warn("Failed to auto-play the next song:", e);
        });
      });
    }
  }

  // Create a reusable filter/envelope structure
  createSynth() {
    this.init();
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    return { osc, gain, time: this.ctx.currentTime };
  }

  // Play short click sound
  playClick() {
    const synth = this.createSynth();
    if (!synth) return;
    const { osc, gain, time } = synth;
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Play wooden Esiimsi shaking sound (using filtered noise bursts)
  playShake() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;
    
    // Simulate 3-4 quick shakes
    for (let i = 0; i < 4; i++) {
      const startTime = time + i * 0.08;
      const duration = 0.04;
      
      // Create noise buffer
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      // Filter noise to sound like wood clicks
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500 + Math.random() * 500, startTime);
      filter.Q.setValueAtTime(8, startTime);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start(startTime);
      noise.stop(startTime + duration);
    }
  }

  // Play Tarot Card flip swoosh
  playFlip() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;
    const duration = 0.3;
    
    // Low frequency sine sweep with noise
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, time);
    filter.frequency.exponentialRampToValueAtTime(2000, time + duration);
    
    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.2, time + duration * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  // Play ticking sound of the roulette wheel (pitch changes based on speed)
  playSpinTick(speedRatio = 1.0) {
    const synth = this.createSynth();
    if (!synth) return;
    const { osc, gain, time } = synth;
    
    osc.type = 'triangle';
    // Higher speed = higher pitch click
    const pitch = 300 + (speedRatio * 400);
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.setValueAtTime(50, time + 0.02);
    
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
    
    osc.start(time);
    osc.stop(time + 0.03);
  }

  // Play beautiful success/win pentatonic chime
  playSuccess() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const time = this.ctx.currentTime;
    // Pentatonic scale notes
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    
    notes.forEach((freq, idx) => {
      const noteTime = time + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0.0, noteTime);
      gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  // Toggle custom MP3 background music playlist
  toggleBackgroundMusic() {
    this.init();
    if (!this.bgAudio) return false;
    
    if (this.isBgPlaying) {
      this.bgAudio.pause();
      this.isBgPlaying = false;
      return false;
    } else {
      this.isBgPlaying = true; // Set playing status to true synchronously
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.bgAudio.play()
        .catch(e => {
          console.warn("กรุณาใส่ไฟล์เพลงที่ public/audio/background1.mp3 และ background2.mp3 เพื่อใช้งานคิวเพลงคลอ:", e);
          this.isBgPlaying = false; // Reset if playback failed
          if (window.updateAudioButtonUI) {
            window.updateAudioButtonUI(false);
          }
        });
      return true;
    }
  }
}

export const MysticAudio = new AudioSynth();
export default MysticAudio;
