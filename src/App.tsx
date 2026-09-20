import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { ObservabilityDashboard } from './components/ObservabilityDashboard';
import { TeleprompterView } from './components/TeleprompterView';
import { AudioCaptureModal } from './components/AudioCaptureModal';
import { ProfileDrawer } from './components/ProfileDrawer';
import { MockInterviewStudio } from './components/MockInterviewStudio';
import { WebcamMirror } from './components/WebcamMirror';
import { SessionHistory } from './components/SessionHistory';
import { 
  AudioSourceMode, 
  CandidateProfile, 
  CopilotResponse, 
  CopilotStatus, 
  ObservabilityRecord, 
  PipelineStatus, 
  TargetLanguage 
} from './types';
import { PRESET_PROFILES } from './data/presets';
import { 
  createAudioLevelMeter, 
  createSpeechRecognizer, 
  SpeechRecognitionController,
  SpeechTimingMeta
} from './utils/speech';
import { 
  Mic, 
  MicOff, 
  Monitor, 
  Sparkles, 
  AlertCircle, 
  Radio
} from 'lucide-react';

interface PipelineTimingHints {
  audioProcessingMs?: number;
  sttMs?: number;
  audioDurationSec?: number;
}

export default function App() {
  // Profiles and language state
  const [profile, setProfile] = useState<CandidateProfile>(PRESET_PROFILES[0]);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(PRESET_PROFILES[0].targetLanguage);

  // Modals & Panels state
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);
  const [isWebcamMirrorOpen, setIsWebcamMirrorOpen] = useState<boolean>(false);

  // Audio capture state
  const [audioMode, setAudioMode] = useState<AudioSourceMode>('simulator');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Copilot generation state
  const [status, setStatus] = useState<CopilotStatus>('idle');
  const [currentResponse, setCurrentResponse] = useState<CopilotResponse | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CopilotResponse[]>([]);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Observability & Telemetry state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>('IDLE');
  const [currentObservability, setCurrentObservability] = useState<ObservabilityRecord | null>(null);
  const [observabilityHistory, setObservabilityHistory] = useState<ObservabilityRecord[]>([]);
  const reqCounterRef = useRef<number>(1);

  // References for cleanup
  const speechRecognizerRef = useRef<SpeechRecognitionController | null>(null);
  const audioLevelMeterRef = useRef<{ close: () => void } | null>(null);
  const activeMediaStreamRef = useRef<MediaStream | null>(null);

  // Sync profile language with target language
  const handleLanguageChange = (lang: TargetLanguage) => {
    setTargetLanguage(lang);
    setProfile((prev) => ({ ...prev, targetLanguage: lang }));
    if (lang === 'british_english' && profile.targetLanguage === 'japanese') {
      const ukPreset = PRESET_PROFILES.find((p) => p.targetLanguage === 'british_english');
      if (ukPreset) setProfile(ukPreset);
    } else if (lang === 'japanese' && profile.targetLanguage === 'british_english') {
      const jpPreset = PRESET_PROFILES.find((p) => p.targetLanguage === 'japanese');
      if (jpPreset) setProfile(jpPreset);
    }
    if (isListening) {
      stopListening();
    }
  };

  const handleSelectPreset = (preset: CandidateProfile) => {
    setProfile(preset);
    setTargetLanguage(preset.targetLanguage);
    if (isListening) {
      stopListening();
    }
  };

  // Trigger AI Copilot Script Generation with full Stage Instrumentation
  const requestCopilotScript = async (
    questionText: string, 
    timingHints?: PipelineTimingHints
  ) => {
    // Generate sequential Request ID
    const reqNum = reqCounterRef.current++;
    const reqId = `REQ-${reqNum.toString().padStart(3, '0')}`;
    
    // High-resolution start timers
    const e2eStartTime = performance.now();
    const startDate = new Date();
    const startTimeFormatted =
      startDate.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
      '.' +
      startDate.getMilliseconds().toString().padStart(3, '0');

    // Structured logging: START
    console.log(`[${reqId}] START`);

    // Explicit Stage Latencies: Audio Processing & STT
    const audioProcessingMs = Math.max(1, Math.round(timingHints?.audioProcessingMs ?? 85));
    const sttMs = Math.max(1, Math.round(timingHints?.sttMs ?? 260));
    console.log(`[${reqId}] AUDIO_PROCESSING: ${audioProcessingMs} ms`);
    console.log(`[${reqId}] STT: ${sttMs} ms`);

    setStatus('thinking');
    setPipelineStatus('GENERATING');
    setErrorMessage(null);
    setInterimTranscript('');

    let netDuration = 0;
    let httpStatus = 200;

    try {
      const netStartTime = performance.now();

      const response = await fetch('/api/copilot/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          targetLanguage,
          candidateName: profile.name,
          candidateResume: profile.resumeSummary,
          jobPosition: profile.jobPosition,
          jobDescription: profile.jobDescription,
        }),
      });

      netDuration = performance.now() - netStartTime;
      httpStatus = response.status;

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data: any = await response.json();
      const serverObs = data._observability || {};

      // Stage: Context analysis & Stage: LLM response generation
      const contextMs = Math.max(1, Math.round(serverObs.contextMs || 12));
      const generationMs = Math.max(1, Math.round(serverObs.generationMs || Math.max(1, netDuration - contextMs)));
      console.log(`[${reqId}] CONTEXT: ${contextMs} ms`);
      console.log(`[${reqId}] GENERATION: ${generationMs} ms`);

      // Stage: Post-processing / formatting
      const postProcessStart = performance.now();
      const enrichedResponse: CopilotResponse = {
        questionSummaryId: data.questionSummaryId,
        questionOriginal: data.questionOriginal || questionText,
        teleprompterScript: data.teleprompterScript,
        nativeScript: data.nativeScript,
        pronunciationGuide: data.pronunciationGuide,
        indonesianTranslation: data.indonesianTranslation,
        keyTakeaways: data.keyTakeaways || [],
        estimatedReadTimeSec: data.estimatedReadTimeSec,
        timestamp: Date.now(),
      };
      const postProcessingMs = Math.max(1, Math.round(performance.now() - postProcessStart));
      console.log(`[${reqId}] POST_PROCESSING: ${postProcessingMs} ms`);

      // Stage: UI Rendering (measured using requestAnimationFrame to capture DOM paint)
      const uiRenderStart = performance.now();
      setCurrentResponse(enrichedResponse);
      setSessionHistory((prev) => [enrichedResponse, ...prev]);
      setStatus('ready');

      requestAnimationFrame(() => {
        const uiRenderingMs = Math.max(1, Math.round(performance.now() - uiRenderStart));
        const totalMs = Math.round(performance.now() - e2eStartTime);
        setLatencyMs(totalMs);

        // Structured logging: END
        console.log(`[${reqId}] END: ${totalMs} ms`);

        const endDate = new Date();
        const endTimeFormatted =
          endDate.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          '.' +
          endDate.getMilliseconds().toString().padStart(3, '0');

        const record: ObservabilityRecord = {
          requestId: reqId,
          status: 'COMPLETED',
          startTime: startDate.getTime(),
          endTime: endDate.getTime(),
          startTimeFormatted,
          endTimeFormatted,
          stages: {
            audioProcessingMs,
            sttMs,
            contextMs,
            generationMs,
            postProcessingMs,
            uiRenderingMs,
            totalMs,
          },
          metadata: {
            audioDurationSec: timingHints?.audioDurationSec ?? (audioProcessingMs + sttMs) / 1000,
            inputCharacters: serverObs.inputCharacters ?? (questionText.length + profile.resumeSummary.length),
            outputCharacters: serverObs.outputCharacters ?? data.teleprompterScript?.length ?? 0,
            modelName: serverObs.modelName ?? 'gemini-3.8-flash',
          },
          llmMetrics: {
            timeToFirstTokenMs: null, // N/A for non-streaming batch endpoint
            inputTokens: serverObs.inputTokens ?? null,
            outputTokens: serverObs.outputTokens ?? null,
            totalTokens: serverObs.totalTokens ?? null,
            tokensPerSecond:
              serverObs.outputTokens && generationMs > 0
                ? Number((serverObs.outputTokens / (generationMs / 1000)).toFixed(1))
                : null,
            finishReason: serverObs.finishReason ?? 'STOP',
          },
          network: {
            requestDurationMs: Math.round(netDuration),
            responseDurationMs: Math.round(netDuration),
            httpStatus,
            retryCount: serverObs.retryCount ?? 0,
            errorCount: 0,
          },
        };

        setCurrentObservability(record);
        setObservabilityHistory((prev) => [record, ...prev.slice(0, 9)]);
        setPipelineStatus('COMPLETED');
      });
    } catch (err: any) {
      console.error(`[${reqId}] ERROR:`, err);
      const totalMs = Math.round(performance.now() - e2eStartTime);
      console.log(`[${reqId}] END: ${totalMs} ms (ERROR)`);

      const endDate = new Date();
      const endTimeFormatted =
        endDate.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        '.' +
        endDate.getMilliseconds().toString().padStart(3, '0');

      const failedRecord: ObservabilityRecord = {
        requestId: reqId,
        status: 'ERROR',
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        startTimeFormatted,
        endTimeFormatted,
        stages: {
          audioProcessingMs,
          sttMs,
          contextMs: 0,
          generationMs: Math.round(netDuration),
          postProcessingMs: 0,
          uiRenderingMs: 1,
          totalMs,
        },
        metadata: {
          audioDurationSec: timingHints?.audioDurationSec ?? null,
          inputCharacters: questionText.length,
          outputCharacters: 0,
          modelName: 'gemini-3.8-flash',
        },
        llmMetrics: {
          timeToFirstTokenMs: null,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          tokensPerSecond: null,
          finishReason: 'ERROR',
        },
        network: {
          requestDurationMs: Math.round(netDuration),
          responseDurationMs: Math.round(netDuration),
          httpStatus: httpStatus || 500,
          retryCount: 0,
          errorCount: 1,
        },
      };

      setCurrentObservability(failedRecord);
      setObservabilityHistory((prev) => [failedRecord, ...prev.slice(0, 9)]);
      setStatus('error');
      setPipelineStatus('ERROR');
      setErrorMessage(err.message || 'Gagal menghubungi AI Teleprompter.');
    }
  };

  // Start Web Speech Recognition + Audio Stream
  const startSpeechRecognition = (stream?: MediaStream) => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.abort();
    }

    setPipelineStatus('RECORDING');

    const recognizer = createSpeechRecognizer({
      language: targetLanguage,
      onInterimResult: (text) => {
        setInterimTranscript(text);
        setStatus('listening');
        setPipelineStatus('RECORDING');
      },
      onFinalResult: (finalText, timing) => {
        setInterimTranscript('');
        setPipelineStatus('PROCESSING');
        requestCopilotScript(finalText, {
          audioProcessingMs: timing?.audioMs,
          sttMs: timing?.sttMs,
          audioDurationSec: timing?.audioDurationSec,
        });
      },
      onError: (err) => {
        console.warn('STT Error:', err);
      },
      onEnd: () => {
        // Keep loop alive if needed
      },
    });

    if (recognizer) {
      speechRecognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
      setStatus('listening');
    }

    if (stream) {
      activeMediaStreamRef.current = stream;
      if (audioLevelMeterRef.current) {
        audioLevelMeterRef.current.close();
      }
      audioLevelMeterRef.current = createAudioLevelMeter(stream, (level) => {
        setAudioLevel(level);
      });
    }
  };

  const stopListening = () => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
      speechRecognizerRef.current = null;
    }
    if (audioLevelMeterRef.current) {
      audioLevelMeterRef.current.close();
      audioLevelMeterRef.current = null;
    }
    if (activeMediaStreamRef.current) {
      activeMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      activeMediaStreamRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    setInterimTranscript('');
    if (status === 'listening') {
      setStatus('idle');
      setPipelineStatus('IDLE');
    }
  };

  // Request Tab Audio Capture
  const handleRequestDisplayAudio = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setErrorMessage(
          'Tidak ada audio tab yang dibagikan. Pastikan Anda mencentang "Share tab audio" saat memilih tab Google Meet / Zoom.'
        );
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      setAudioMode('display_media');
      startSpeechRecognition(stream);

      audioTracks[0].onended = () => {
        stopListening();
      };
    } catch (err: any) {
      console.warn('Display media capture cancelled or failed:', err);
      if (err.name !== 'NotAllowedError') {
        setErrorMessage('Gagal membuka tangkapan tab meeting: ' + err.message);
      }
    }
  };

  // Request Microphone Capture
  const handleRequestMicAudio = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setAudioMode('microphone');
      startSpeechRecognition(stream);
    } catch (err: any) {
      console.warn('Mic access failed:', err);
      setErrorMessage('Izin mikrofon ditolak atau tidak tersedia.');
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (audioMode === 'display_media') {
        handleRequestDisplayAudio();
      } else if (audioMode === 'microphone') {
        handleRequestMicAudio();
      } else {
        setIsAudioModalOpen(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      {/* Navbar Header */}
      <Navbar
        targetLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        audioMode={audioMode}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
        onToggleWebcamMirror={() => setIsWebcamMirrorOpen(!isWebcamMirrorOpen)}
        isWebcamMirrorOpen={isWebcamMirrorOpen}
        profile={profile}
        isListening={isListening}
      />

      {/* Mini Observability Dashboard (Top of App) */}
      <ObservabilityDashboard
        currentRecord={currentObservability}
        history={observabilityHistory}
        onClearHistory={() => setObservabilityHistory([])}
        status={pipelineStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Error Alert Bar */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start justify-between gap-3 text-sm text-rose-200 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline shrink-0"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Live Status & Quick Audio Action Banner */}
        <div className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-400'
              }`}
            >
              {isListening ? <Radio className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isListening ? '🔴 Co-Pilot Sedang Mendengarkan HR' : '⚪ Co-Pilot Dalam Kondisi Standby'}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                  {audioMode === 'display_media'
                    ? 'Tab Meet Audio'
                    : audioMode === 'microphone'
                    ? 'Mikrofon Laptop'
                    : 'Simulator Studio'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kandidat: <strong className="text-neutral-200">{profile.name}</strong> • Posisi:{' '}
                <strong className="text-neutral-200">{profile.jobPosition}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Start/Stop Listening Button */}
            <button
              id="toggle-listening-btn"
              onClick={handleToggleListening}
              className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${
                isListening
                  ? 'bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-rose-400" />
                  <span>Matikan Pendengaran</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Nyalakan Mic / Tab Audio</span>
                </>
              )}
            </button>

            {/* Audio Routing Guide Trigger */}
            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="px-3 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium rounded-xl transition flex items-center gap-1.5"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cara Tangkap Audio Zoom</span>
            </button>
          </div>
        </div>

        {/* Webcam Alignment Mirror */}
        {isWebcamMirrorOpen && (
          <div className="animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                Cermin Posisi Kamera (Latihan Eye Contact):
              </span>
              <button
                onClick={() => setIsWebcamMirrorOpen(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Tutup Cermin
              </button>
            </div>
            <WebcamMirror isCompact={false} />
          </div>
        )}

        {/* Centerpiece: Real-Time Teleprompter */}
        <TeleprompterView
          status={status}
          currentResponse={currentResponse}
          targetLanguage={targetLanguage}
          interimTranscript={interimTranscript}
          audioLevel={audioLevel}
          latencyMs={latencyMs}
          onClear={() => {
            setCurrentResponse(null);
            setStatus('idle');
            setLatencyMs(null);
          }}
        />

        {/* Mock Interview Audio Studio */}
        <MockInterviewStudio
          targetLanguage={targetLanguage}
          onSimulateQuestion={(qText, timing) => requestCopilotScript(qText, timing)}
          isProcessing={status === 'thinking' || status === 'streaming'}
        />

        {/* Session History List */}
        <SessionHistory
          history={sessionHistory}
          onSelect={(item) => setCurrentResponse(item)}
          onClear={() => setSessionHistory([])}
        />
      </main>

      {/* Audio Capture Modal */}
      <AudioCaptureModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        currentMode={audioMode}
        onSelectMode={(mode) => setAudioMode(mode)}
        onRequestDisplayAudio={handleRequestDisplayAudio}
        onRequestMicAudio={handleRequestMicAudio}
      />

      {/* Profile & CV Context Drawer */}
      <ProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
