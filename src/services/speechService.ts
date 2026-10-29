/**
 * Comprehensive Vietnamese Text-to-Speech (TTS) & Audio Service
 * AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC
 * Giáo viên: Lê Thị Giang - Trường Tiểu học Khoái Châu 1 - Lớp 4A4
 */

export interface SpeechSettings {
  rate: number;          // 0.7 to 1.3 (default 0.9x as requested)
  pitch: number;         // 0.8 to 1.2 (default 1.0)
  volume: number;        // 0.0 to 1.0 (default 1.0)
  enabled: boolean;      // default true
  selectedVoiceURI: string;
  ttsSource: 'auto' | 'device' | 'server'; // default 'auto'
  autoReadChatbot: boolean; // default false
}

export interface SpeechState {
  isSpeaking: boolean;
  currentText: string;
  activeSource: 'device' | 'server' | 'none';
  hasDeviceVietnameseVoice: boolean;
  availableVoices: { name: string; lang: string; voiceURI: string; isVietnamese: boolean }[];
}

const DEFAULT_SETTINGS: SpeechSettings = {
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
  enabled: true,
  selectedVoiceURI: '',
  ttsSource: 'auto',
  autoReadChatbot: false,
};

type StateListener = (state: SpeechState) => void;

class SpeechService {
  private settings: SpeechSettings;
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private isSpeaking: boolean = false;
  private currentText: string = '';
  private activeSource: 'device' | 'server' | 'none' = 'none';
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private abortController: AbortController | null = null;

  constructor() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('lop4_speech_settings_v3') : null;
    this.settings = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Pre-warm cached voices safely without triggering state listeners
      try {
        const initial = window.speechSynthesis.getVoices();
        if (initial && initial.length > 0) {
          this.cachedVoices = initial;
        }
      } catch {}

      window.speechSynthesis.onvoiceschanged = () => {
        try {
          const fresh = window.speechSynthesis.getVoices();
          if (fresh && fresh.length > 0) {
            this.cachedVoices = fresh;
            this.notifyState();
          }
        } catch {}
      };
    }
  }

  private refreshVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.cachedVoices = v;
      }
    } catch {}
    return this.cachedVoices;
  }

  public getSettings(): SpeechSettings {
    return { ...this.settings };
  }

  public saveSettings(newSettings: Partial<SpeechSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window !== 'undefined') {
      localStorage.setItem('lop4_speech_settings_v3', JSON.stringify(this.settings));
    }
    this.notifyState();
  }

  public subscribe(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    try {
      listener(this.getState());
    } catch (e) {
      console.error('Error in speech subscribe callback:', e);
    }
    return () => this.stateListeners.delete(listener);
  }

  public getState(): SpeechState {
    const viVoices = this.getVietnameseVoices();
    return {
      isSpeaking: this.isSpeaking,
      currentText: this.currentText,
      activeSource: this.activeSource,
      hasDeviceVietnameseVoice: viVoices.length > 0,
      availableVoices: this.cachedVoices.map((v) => ({
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isVietnamese: this.isVietnameseVoice(v),
      })),
    };
  }

  private notifyState() {
    if (this.stateListeners.size === 0) return;
    const state = this.getState();
    this.stateListeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error('Error in notifyState listener:', e);
      }
    });
  }

  private isVietnameseVoice(voice: SpeechSynthesisVoice): boolean {
    const lang = (voice.lang || '').toLowerCase();
    const name = (voice.name || '').toLowerCase();
    return (
      lang.startsWith('vi') ||
      lang.includes('vie') ||
      lang.includes('vn') ||
      name.includes('vietnam') ||
      name.includes('tiếng việt') ||
      name.includes('tieng viet') ||
      name.includes('hoaimy') ||
      name.includes('an') ||
      name.includes('linh') ||
      name.includes('mai')
    );
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          this.cachedVoices = v;
        }
      } catch {}
    }
    return this.cachedVoices;
  }

  public getVietnameseVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    return all.filter((v) => this.isVietnameseVoice(v));
  }

  public hasVietnameseVoice(): boolean {
    return this.getVietnameseVoices().length > 0;
  }

  /**
   * Normalizes text specifically for Vietnamese pedagogical pronunciation.
   * Expands abbreviations and special symbols into natural Vietnamese words.
   */
  public normalizeVietnameseText(rawText: string): string {
    if (!rawText) return '';

    let text = rawText;

    // 1. Remove markdown formatting & URLs
    text = text
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[*_#`~[\]]/g, ' ')
      .replace(/<[^>]*>/g, ' ');

    // 2. Expand pedagogical abbreviations
    text = text.replace(/\bLớp\s*4A4\b/gi, 'Lớp bốn A bốn');
    text = text.replace(/\b4A4\b/gi, 'bốn A bốn');
    text = text.replace(/\bLớp\s*4\b/gi, 'Lớp bốn');
    text = text.replace(/\bGVCN\b/gi, 'Giáo viên chủ nhiệm');
    text = text.replace(/\bBGH\b/gi, 'Ban giám hiệu');
    text = text.replace(/\bCMHS\b/gi, 'Cha mẹ học sinh');
    text = text.replace(/\bSGK\b/gi, 'Sách giáo khoa');
    text = text.replace(/\bTH\s*Khoái\s*Châu\s*1\b/gi, 'Tiểu học Khoái Châu một');
    text = text.replace(/\bTH\s*Khoái\s*Châu\b/gi, 'Tiểu học Khoái Châu');
    text = text.replace(/\bGDPT\s*2018\b/gi, 'Giáo dục phổ thông hai nghìn không trăm mười tám');
    text = text.replace(/\bGDPT\b/gi, 'Giáo dục phổ thông');
    text = text.replace(/\bAI\b/g, 'A I');
    text = text.replace(/\b31\s*học\s*sinh\b/gi, 'ba mươi mốt học sinh');
    text = text.replace(/\bSĩ\s*số\s*31\b/gi, 'Sĩ số ba mươi mốt');
    text = text.replace(/\b2026\s*-\s*2027\b/gi, 'hai nghìn không trăm hai mươi sáu, hai nghìn không trăm hai mươi bảy');

    // 3. Clean multiple spaces and linebreaks
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Splits text into short, natural sentence chunks (< 160 chars)
   * to prevent browser utterance timeout and keep server TTS chunks reliable.
   */
  private splitIntoChunks(text: string, maxLen: number = 160): string[] {
    const rawChunks = text.split(/(?<=[.!?\n;])\s+/);
    const chunks: string[] = [];

    for (const raw of rawChunks) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      if (trimmed.length <= maxLen) {
        chunks.push(trimmed);
      } else {
        // Sub-split by comma or clause
        const subParts = trimmed.split(/(?<=[,])\s+/);
        let temp = '';
        for (const sub of subParts) {
          if ((temp + ' ' + sub).trim().length <= maxLen) {
            temp = (temp ? temp + ' ' : '') + sub;
          } else {
            if (temp) chunks.push(temp.trim());
            temp = sub;
          }
        }
        if (temp) chunks.push(temp.trim());
      }
    }

    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Immediately stops all current audio playback and speech synthesis.
   */
  public stop() {
    this.abortController?.abort();
    this.abortController = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }

    this.isSpeaking = false;
    this.currentText = '';
    this.activeSource = 'none';
    this.notifyState();
  }

  /**
   * Main Speak Method
   * Implements strict Vietnamese voice requirements:
   * NEVER uses English voice for Vietnamese text.
   * Auto routes to Server TTS if device has no Vietnamese voice.
   */
  public speak(
    rawText: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: string) => void;
    }
  ): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    const cleanText = this.normalizeVietnameseText(rawText);
    if (!cleanText) return false;

    // Stop any ongoing speech first
    this.stop();

    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const viVoices = this.getVietnameseVoices();
    let targetSource = this.settings.ttsSource;

    if (targetSource === 'auto') {
      targetSource = viVoices.length > 0 ? 'device' : 'server';
    }

    if (targetSource === 'device') {
      if (viVoices.length === 0) {
        // STRICT REQUIREMENT: DO NOT FALLBACK TO ENGLISH VOICE!
        // Fallback safely to server TTS so the user hears true Vietnamese!
        console.warn('No device Vietnamese voice detected. Routing to Server TTS to guarantee Vietnamese speech.');
        targetSource = 'server';
      }
    }

    this.isSpeaking = true;
    this.currentText = cleanText;
    this.activeSource = targetSource;
    this.notifyState();

    callbacks?.onStart?.();

    if (targetSource === 'server') {
      this.playViaServerTTS(cleanText, signal, callbacks);
    } else {
      this.playViaDeviceWebSpeech(cleanText, viVoices, signal, callbacks);
    }

    return true;
  }

  /**
   * Play using Server-side High-Fidelity Vietnamese TTS Proxy
   * Never falls back to English voices!
   */
  private async playViaServerTTS(
    text: string,
    signal: AbortSignal,
    callbacks?: { onEnd?: () => void; onError?: (err: string) => void }
  ) {
    const chunks = this.splitIntoChunks(text, 180);
    let chunkIndex = 0;

    const playNextChunk = async () => {
      if (signal.aborted) return;

      if (chunkIndex >= chunks.length) {
        this.isSpeaking = false;
        this.currentText = '';
        this.activeSource = 'none';
        this.notifyState();
        callbacks?.onEnd?.();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      // Attempt 1: Fetch through /api/tts endpoint
      let audioBlobUrl: string | null = null;
      try {
        const response = await fetch(`/api/tts?text=${encodeURIComponent(chunk)}`, {
          signal,
          headers: { Accept: 'audio/mpeg, audio/*' },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('audio') || contentType.includes('mpeg')) {
            const blob = await response.blob();
            audioBlobUrl = URL.createObjectURL(blob);
          }
        }
      } catch (e: any) {
        if (signal.aborted) return;
        console.warn('/api/tts fetch failed, trying direct Vietnamese TTS stream:', e);
      }

      // If /api/tts could not be reached, use direct Vietnamese stream URL
      const finalAudioUrl =
        audioBlobUrl ||
        `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          chunk.slice(0, 190)
        )}&tl=vi&client=tw-ob`;

      const audio = new Audio(finalAudioUrl);
      this.currentAudio = audio;
      audio.playbackRate = this.settings.rate || 0.9;
      audio.volume = Math.max(0, Math.min(1, this.settings.volume ?? 1.0));

      const cleanupCurrentAudio = () => {
        if (audioBlobUrl) {
          try {
            URL.revokeObjectURL(audioBlobUrl);
          } catch {}
        }
      };

      audio.onended = () => {
        cleanupCurrentAudio();
        playNextChunk();
      };

      audio.onerror = () => {
        cleanupCurrentAudio();
        if (signal.aborted) return;
        console.error('Server TTS audio chunk error for chunk:', chunk);

        // Try device speech as last-resort fallback IF AND ONLY IF device has Vietnamese voice
        const viVoices = this.getVietnameseVoices();
        if (viVoices.length > 0) {
          this.playViaDeviceWebSpeech(chunks.slice(chunkIndex - 1).join(' '), viVoices, signal, callbacks);
        } else {
          this.stop();
          callbacks?.onError?.(
            'Thiết bị hiện chưa có giọng đọc tiếng Việt. Vui lòng bật dịch vụ giọng Việt trong phần Cài đặt.'
          );
        }
      };

      try {
        await audio.play();
      } catch (err: any) {
        cleanupCurrentAudio();
        if (signal.aborted) return;
        console.warn('Audio play autoplay policy blocked or interrupted:', err);
        this.stop();
        callbacks?.onError?.('Trình duyệt yêu cầu tương tác để phát âm thanh.');
      }
    };

    playNextChunk();
  }

  /**
   * Play using Device Web Speech API with strict Vietnamese voice selection
   */
  private playViaDeviceWebSpeech(
    text: string,
    viVoices: SpeechSynthesisVoice[],
    signal: AbortSignal,
    callbacks?: { onEnd?: () => void; onError?: (err: string) => void }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.playViaServerTTS(text, signal, callbacks);
      return;
    }

    // Select suitable Vietnamese voice
    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (this.settings.selectedVoiceURI) {
      selectedVoice = viVoices.find((v) => v.voiceURI === this.settings.selectedVoiceURI) || null;
    }
    if (!selectedVoice && viVoices.length > 0) {
      // Prioritize female voice or standard Google Vietnamese
      selectedVoice =
        viVoices.find((v) => {
          const n = v.name.toLowerCase();
          return n.includes('google') || n.includes('female') || n.includes('hoaimy') || n.includes('linh') || n.includes('mai');
        }) || viVoices[0];
    }

    if (!selectedVoice) {
      // NEVER pick an English voice! Route to server TTS instead
      console.warn('Web Speech API has no Vietnamese voice. Fallback to Server TTS.');
      this.playViaServerTTS(text, signal, callbacks);
      return;
    }

    const chunks = this.splitIntoChunks(text, 150);
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (signal.aborted) return;

      if (chunkIndex >= chunks.length) {
        this.isSpeaking = false;
        this.currentText = '';
        this.activeSource = 'none';
        this.notifyState();
        callbacks?.onEnd?.();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      const utterance = new SpeechSynthesisUtterance(chunk);
      this.currentUtterance = utterance;

      utterance.voice = selectedVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = this.settings.rate || 0.9;
      utterance.pitch = this.settings.pitch || 1.0;
      utterance.volume = this.settings.volume || 1.0;

      utterance.onend = () => {
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        if (signal.aborted) return;
        console.warn('SpeechSynthesis error:', e);
        // Fallback to server TTS if browser speech failed
        this.playViaServerTTS(chunks.slice(chunkIndex - 1).join(' '), signal, callbacks);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e: any) {
        if (signal.aborted) return;
        this.playViaServerTTS(chunks.slice(chunkIndex - 1).join(' '), signal, callbacks);
      }
    };

    speakNextChunk();
  }

  // --- Web Audio Chime Sound Effects ---
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

  public playSuccessSound() {
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
    } catch {}
  }

  public playCheerSound() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const now = this.audioCtx!.currentTime + i * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {}
  }

  public playGentleDing() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08); // A6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playErrorSound() {
    if (!this.settings.enabled) return;
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }
}

export const speechService = new SpeechService();
