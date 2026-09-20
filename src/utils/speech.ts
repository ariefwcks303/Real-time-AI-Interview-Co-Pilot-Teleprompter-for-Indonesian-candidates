import { TargetLanguage } from '../types';

// Check if Web Speech API is supported
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

export interface SpeechRecognitionController {
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface SpeechTimingMeta {
  audioMs: number;
  sttMs: number;
  audioDurationSec: number;
}

export function createSpeechRecognizer({
  language,
  onInterimResult,
  onFinalResult,
  onError,
  onEnd,
}: {
  language: TargetLanguage;
  onInterimResult: (transcript: string) => void;
  onFinalResult: (transcript: string, timing?: SpeechTimingMeta) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}): SpeechRecognitionController | null {
  if (!isSpeechRecognitionSupported()) {
    onError('Browser Anda belum mendukung Web Speech Recognition API.');
    return null;
  }

  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const recognition = new SpeechRecognitionConstructor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = language === 'japanese' ? 'ja-JP' : 'en-GB';

  let audioStartTime = performance.now();
  let speechStartTime = performance.now();

  recognition.onaudiostart = () => {
    audioStartTime = performance.now();
  };

  recognition.onspeechstart = () => {
    speechStartTime = performance.now();
  };

  recognition.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += transcript;
      } else {
        interim += transcript;
      }
    }

    if (interim.trim()) {
      onInterimResult(interim.trim());
    }
    if (final.trim()) {
      const now = performance.now();
      const audioMs = Math.max(10, speechStartTime - audioStartTime);
      const sttMs = Math.max(50, now - speechStartTime);
      const audioDurationSec = (now - audioStartTime) / 1000;
      onFinalResult(final.trim(), { audioMs, sttMs, audioDurationSec });
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    if (event.error !== 'no-speech') {
      onError(`Speech Recognition: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch (err: any) {
        console.warn('Recognition start warning:', err);
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch (err: any) {
        console.warn('Recognition stop warning:', err);
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch (err: any) {
        console.warn('Recognition abort warning:', err);
      }
    },
  };
}

// Speak HR question using Web Speech Synthesis
export function speakHrQuestion(
  text: string,
  language: TargetLanguage,
  onStart?: () => void,
  onEnd?: () => void
): { stop: () => void } {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'japanese' ? 'ja-JP' : 'en-GB';
  utterance.rate = 0.95; // Slightly measured interview speed
  utterance.pitch = 1.0;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  const targetPrefix = language === 'japanese' ? 'ja' : 'en-GB';
  const matchingVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith(targetPrefix.toLowerCase())
  );
  if (matchingVoice) {
    utterance.voice = matchingVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
      onEnd?.();
    },
  };
}

// Audio Level Meter using Web Audio API
export function createAudioLevelMeter(
  stream: MediaStream,
  onLevelChange: (level: number) => void
): { close: () => void } {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;

    const checkLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalized = Math.min(100, Math.round((average / 128) * 100));
      onLevelChange(normalized);
      animationFrameId = requestAnimationFrame(checkLevel);
    };

    checkLevel();

    return {
      close: () => {
        cancelAnimationFrame(animationFrameId);
        source.disconnect();
        analyser.disconnect();
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      },
    };
  } catch (err) {
    console.warn('AudioContext level meter not supported:', err);
    return { close: () => {} };
  }
}
