/**
 * Speech & Sound Synthesis Service for Vietnamese Audio & Effects
 */

export interface SpeechSettings {
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean;
  selectedVoiceURI: string;
}

const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  enabled: true,
  selectedVoiceURI: '',
};

class SpeechService {
  private settings: SpeechSettings;
  private audioCtx: AudioContext | null = null;

  constructor() {
    const saved = localStorage.getItem('lop4_speech_settings');
    this.settings = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  }

  getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  saveSettings(newSettings: Partial<SpeechSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('lop4_speech_settings', JSON.stringify(this.settings));
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  getVietnameseVoices(): SpeechSynthesisVoice[] {
    const voices = this.getVoices();
    return voices.filter(
      (v) => v.lang.startsWith('vi') || v.lang.includes('VIE') || v.name.toLowerCase().includes('vietnam')
    );
  }

  hasVietnameseVoice(): boolean {
    return this.getVietnameseVoices().length > 0;
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  speak(
    text: string,
    callbacks?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }
  ): boolean {
    if (!this.settings.enabled) return false;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks?.onError?.('Trình duyệt không hỗ trợ Web Speech API.');
      return false;
    }

    // Cancel current reading
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = this.settings.rate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;
    utterance.lang = 'vi-VN';

    const viVoices = this.getVietnameseVoices();
    if (this.settings.selectedVoiceURI) {
      const selected = this.getVoices().find((v) => v.voiceURI === this.settings.selectedVoiceURI);
      if (selected) utterance.voice = selected;
    } else if (viVoices.length > 0) {
      utterance.voice = viVoices[0];
    }

    utterance.onstart = () => callbacks?.onStart?.();
    utterance.onend = () => callbacks?.onEnd?.();
    utterance.onerror = (e) => callbacks?.onError?.(e);

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      callbacks?.onError?.(e);
      return false;
    }
  }

  // Web Audio chime sounds
  private initAudioCtx() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSuccessSound() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore audio errors
    }
  }

  playCheerSound() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime + idx * 0.08;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch {
      // ignore audio errors
    }
  }

  playGentleDing() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore audio errors
    }
  }
}

export const speechService = new SpeechService();
