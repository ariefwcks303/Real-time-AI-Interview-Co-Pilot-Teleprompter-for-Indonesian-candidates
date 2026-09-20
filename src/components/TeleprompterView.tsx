import React, { useEffect, useRef, useState } from 'react';
import { 
  Volume2, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Type, 
  Play, 
  Pause, 
  RotateCcw,
  Languages,
  BookOpen,
  HelpCircle,
  Copy,
  Check,
  Eye,
  Radio,
  ShieldCheck,
  AlertTriangle,
  Info
} from 'lucide-react';
import { CopilotResponse, CopilotStatus, TargetLanguage } from '../types';

interface TeleprompterViewProps {
  status: CopilotStatus;
  currentResponse: CopilotResponse | null;
  targetLanguage: TargetLanguage;
  interimTranscript: string;
  audioLevel: number;
  latencyMs: number | null;
  onClear: () => void;
}

export const TeleprompterView: React.FC<TeleprompterViewProps> = ({
  status,
  currentResponse,
  targetLanguage,
  interimTranscript,
  audioLevel,
  latencyMs,
  onClear,
}) => {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('large');
  const [showNativeScript, setShowNativeScript] = useState<boolean>(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showEvidencePanel, setShowEvidencePanel] = useState<boolean>(true);
  const scriptContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll loop
  useEffect(() => {
    let interval: any = null;
    if (isAutoScrolling && scriptContainerRef.current) {
      interval = setInterval(() => {
        if (scriptContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scriptContainerRef.current;
          if (scrollTop + clientHeight < scrollHeight - 5) {
            scriptContainerRef.current.scrollTop += 1.5;
          } else {
            setIsAutoScrolling(false);
          }
        }
      }, 40);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrolling]);

  const handleCopyScript = () => {
    if (!currentResponse?.teleprompterScript) return;
    navigator.clipboard.writeText(currentResponse.teleprompterScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Font size classes
  const fontClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-xl sm:text-2xl leading-relaxed sm:leading-loose tracking-wide font-medium',
    huge: 'text-2xl sm:text-3xl leading-loose tracking-wider font-semibold',
  }[fontSize];

  // Format teleprompter text by highlighting the breathing pause slashes (/)
  const renderFormattedScript = (script: string) => {
    // Split by slash and render breath pause indicators
    const segments = script.split('/');
    return (
      <div className="space-y-3">
        {segments.map((segment, idx) => {
          const trimmed = segment.trim();
          if (!trimmed) return null;
          return (
            <span key={idx} className="inline">
              <span className="text-white hover:text-rose-200 transition-colors">
                {trimmed}
              </span>
              {idx < segments.length - 1 && (
                <span 
                  title="Jeda bernafas alami / Pause intonation"
                  className="inline-flex items-center justify-center px-1.5 py-0.5 mx-2 my-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30 select-none align-middle shadow-sm"
                >
                  / jeda
                </span>
              )}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      id="floating-teleprompter-app"
      className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col relative transition-all"
    >
      {/* Top Teleprompter Status Bar (Webcam Alignment Zone) */}
      <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
            {status === 'listening' ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <span>Mendengarkan HR</span>
                  {/* Sound Wave Bars */}
                  <span className="flex items-center gap-0.5 h-3">
                    <span 
                      className="w-0.5 bg-rose-500 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, (audioLevel / 100) * 14)}px` }}
                    />
                    <span 
                      className="w-0.5 bg-rose-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(6, (audioLevel / 100) * 16)}px` }}
                    />
                    <span 
                      className="w-0.5 bg-rose-500 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, (audioLevel / 100) * 12)}px` }}
                    />
                  </span>
                </span>
              </>
            ) : status === 'thinking' || status === 'streaming' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span className="text-xs font-semibold text-amber-300">
                  AI Merumuskan STAR Script...
                </span>
              </>
            ) : status === 'ready' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Siap Dibaca</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-xs font-medium text-neutral-400">Standby</span>
              </>
            )}
          </div>

          {/* Language Mode Badge */}
          <span className="text-xs px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium hidden sm:inline-flex items-center gap-1.5">
            {targetLanguage === 'japanese' ? '🇯🇵 Japanese (Romaji + Keigo)' : '🇬🇧 British English (STAR + Phonetic)'}
          </span>
        </div>

        {/* Teleprompter Action Controls */}
        <div className="flex items-center gap-2">
          {/* Latency badge */}
          {latencyMs !== null && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
              ⚡ {latencyMs}ms
            </span>
          )}

          {/* Font Size Adjust */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-300">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 rounded transition ${fontSize === 'normal' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 rounded transition ${fontSize === 'large' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('huge')}
              className={`px-2 py-0.5 rounded transition ${fontSize === 'huge' ? 'bg-neutral-800 text-white font-bold' : 'hover:text-white'}`}
            >
              A++
            </button>
          </div>

          {/* Autoscroll Toggle */}
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            title={isAutoScrolling ? 'Hentikan Gulir Otomatis' : 'Mulai Gulir Otomatis'}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium border flex items-center gap-1 transition ${
              isAutoScrolling
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {isAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>Auto-scroll</span>
          </button>

          {/* Copy Script */}
          {currentResponse && (
            <button
              onClick={handleCopyScript}
              title="Salin Script Jawaban"
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          {/* Clear */}
          {currentResponse && (
            <button
              onClick={onClear}
              title="Reset Tampilan"
              className="p-1.5 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-neutral-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live Interim Transcript Bar (shows what HR is speaking right now in real-time) */}
      {interimTranscript && (
        <div className="px-5 py-2.5 bg-rose-950/20 border-b border-rose-900/30 flex items-center gap-2 animate-in fade-in">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="text-xs text-rose-300/80 font-medium shrink-0">HR sedang berbicara:</span>
          <span className="text-xs text-rose-100 font-mono italic truncate">{interimTranscript}</span>
        </div>
      )}

      {/* Main Body */}
      <div 
        ref={scriptContainerRef}
        className="p-6 overflow-y-auto space-y-6 max-h-[550px] scroll-smooth"
      >
        {currentResponse ? (
          <>
            {/* HR Question & Quick Indonesian Translation Box */}
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/90 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  👤 HR Tanya
                </span>
                <p className="text-sm font-medium text-neutral-200 leading-snug">
                  &quot;{currentResponse.questionOriginal}&quot;
                </p>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-neutral-900">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  🇮🇩 Maksud Inti
                </span>
                <p className="text-sm text-emerald-200 font-medium leading-snug">
                  {currentResponse.questionSummaryId}
                </p>
              </div>
            </div>

            {/* CANDIDATE CAPABILITY BOUNDARY & EVIDENCE PANEL */}
            {currentResponse.capabilityStatus && (
              <div className={`p-4 rounded-xl border transition-all ${
                currentResponse.capabilityStatus === 'SUPPORTED'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : currentResponse.capabilityStatus === 'PARTIALLY_SUPPORTED'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              }`}>
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${
                      currentResponse.capabilityStatus === 'SUPPORTED' ? 'text-emerald-400' :
                      currentResponse.capabilityStatus === 'PARTIALLY_SUPPORTED' ? 'text-amber-400' :
                      'text-rose-400'
                    }`} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Capability Boundary:
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      currentResponse.capabilityStatus === 'SUPPORTED'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : currentResponse.capabilityStatus === 'PARTIALLY_SUPPORTED'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}>
                      {currentResponse.capabilityStatus === 'SUPPORTED' && '🟢 SUPPORTED (Didukung Bukti)'}
                      {currentResponse.capabilityStatus === 'PARTIALLY_SUPPORTED' && '🟡 PARTIALLY SUPPORTED (Pivot Jujur)'}
                      {currentResponse.capabilityStatus === 'UNSUPPORTED' && '🔴 UNSUPPORTED (Keterbatasan Jujur)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowEvidencePanel(!showEvidencePanel)}
                    className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 bg-neutral-900/60 px-2.5 py-1 rounded-lg border border-neutral-800 transition"
                  >
                    <span>{showEvidencePanel ? 'Tutup Detail Bukti' : 'Lihat Detail Bukti'}</span>
                    {showEvidencePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Subtitle / Status Explanation */}
                <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">
                  {currentResponse.capabilityStatus === 'SUPPORTED' &&
                    'KoePilot memastikan jawaban sepenuhnya bertumpu pada keahlian, teknologi, dan riwayat yang Anda deklarasikan tanpa karangan metrik.'}
                  {currentResponse.capabilityStatus === 'PARTIALLY_SUPPORTED' &&
                    'Pertanyaan menyinggung teknologi/alat yang belum terdaftar di profil. AI secara jujur mengakui hal tersebut dan pivot ke kemampuan dasar yang Anda miliki.'}
                  {currentResponse.capabilityStatus === 'UNSUPPORTED' &&
                    'Keahlian yang ditanyakan di luar profil Anda. AI menyusun jawaban yang jujur mengakui batasan dengan sikap antusias mempelajari hal baru.'}
                </p>

                {/* Expandable Details Area */}
                {showEvidencePanel && (
                  <div className="mt-3 pt-3 border-t border-neutral-800/80 space-y-2.5 text-xs">
                    {/* Relevant Capabilities */}
                    {currentResponse.relevantCapabilities && currentResponse.relevantCapabilities.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                          🎯 Keahlian Terdaftar yang Digunakan (Declared Capabilities):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentResponse.relevantCapabilities.map((cap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 text-[11px] font-medium">
                              ✓ {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Capabilities / Identified Gaps */}
                    {currentResponse.missingCapabilities && currentResponse.missingCapabilities.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-amber-400/90 block mb-1">
                          ⚠️ Keahlian yang Belum Ada di Profil (Safely Acknowledged):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {currentResponse.missingCapabilities.map((gap, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300 text-[11px]">
                              × {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evidence Citations */}
                    {currentResponse.evidenceUsed && currentResponse.evidenceUsed.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                          📑 Kutipan Bukti Nyata dari Profil (Evidence Citations):
                        </span>
                        <ul className="space-y-1 text-neutral-300 list-disc list-inside text-[11px]">
                          {currentResponse.evidenceUsed.map((ev, i) => (
                            <li key={i} className="font-mono text-neutral-300">{ev}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk & Safety Note */}
                    {currentResponse.riskNote && (
                      <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-neutral-300 leading-snug">
                          <strong className="text-white font-medium">Catatan Kejujuran:</strong> {currentResponse.riskNote}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Main Teleprompter Script Area */}
            <div className="relative p-6 rounded-2xl bg-neutral-950 border border-rose-500/30 shadow-inner">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-rose-400">
                    📢 Baca Ini Dengan Tenang (Teleprompter)
                  </h3>
                </div>

                {/* Read time & native script switch */}
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  {currentResponse.estimatedReadTimeSec && (
                    <span className="flex items-center gap-1 font-mono text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      ~{currentResponse.estimatedReadTimeSec} detik
                    </span>
                  )}

                  {currentResponse.nativeScript && (
                    <button
                      onClick={() => setShowNativeScript(!showNativeScript)}
                      className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white px-2 py-0.5 bg-neutral-900 rounded border border-neutral-800 transition"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span>{showNativeScript ? 'Sembunyikan Kanji/Text' : 'Lihat Kanji/Asli'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* The Script with Breath Breaks */}
              <div className={`${fontClasses} text-neutral-100 font-sans tracking-wide selection:bg-rose-500/40`}>
                {renderFormattedScript(currentResponse.teleprompterScript)}
              </div>

              {/* Optional Native Script (Kanji/Kana) */}
              {showNativeScript && currentResponse.nativeScript && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 bg-neutral-900/40 p-3 rounded-lg text-sm text-neutral-300 font-sans leading-relaxed">
                  <span className="text-[10px] uppercase text-neutral-500 font-mono block mb-1">
                    Tulisan Asli (Kanji / Formal):
                  </span>
                  {currentResponse.nativeScript}
                </div>
              )}

              {/* Pronunciation Guide (Phonetics) for UK English or difficult words */}
              {currentResponse.pronunciationGuide && currentResponse.pronunciationGuide.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-800/60">
                  <span className="text-[11px] font-semibold text-amber-300 block mb-2">
                    🗣️ Panduan Pelafalan / British Pronunciation:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentResponse.pronunciationGuide.map((item, i) => (
                      <div
                        key={i}
                        className="px-2.5 py-1 bg-amber-950/30 border border-amber-500/30 rounded-lg text-xs"
                      >
                        <span className="font-semibold text-neutral-200">{item.word}: </span>
                        <span className="font-mono text-amber-300 font-bold">{item.phonetic}</span>
                        {item.tip && <span className="text-neutral-400 text-[10px] ml-1">({item.tip})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Two Column: Key Takeaways & Indonesian Meaning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Takeaways */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span>💡 Poin Utama (Jika Lupa Script):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-neutral-300 list-disc list-inside">
                  {currentResponse.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="leading-snug">
                      <span className="font-medium text-neutral-200">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Indonesian Meaning of what you are saying */}
              <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                  <BookOpen className="w-4 h-4" />
                  <span>🇮🇩 Arti yang Sedang Anda Ucapkan:</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  &quot;{currentResponse.indonesianTranslation}&quot;
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Empty / Standby State */
          <div className="py-14 px-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 mx-auto flex items-center justify-center text-neutral-400 shadow-inner">
              <Radio className="w-8 h-8 text-rose-500 animate-pulse-subtle" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-base font-bold text-white">
                Co-Pilot Siap Mendengarkan Pertanyaan HR
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Saat HR di Zoom atau Google Meet berbicara, Co-Pilot akan mentranskripsi suara, memberikan terjemahan maksud pertanyaan dalam 1 detik, dan menyusun script bacaan metode STAR dalam huruf Romaji / British English.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-400">
              <span className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full">
                ⚡ Latensi streaming &lt; 2s
              </span>
              <span className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full">
                🧘 Tanda jeda nafas (/) anti-robot
              </span>
              <span className="px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-full">
                🎯 Sesuai CV & Anti-halusinasi
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Teleprompter Footer Tip */}
      <div className="px-5 py-2.5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-rose-400" />
          <span>Tips: Posisikan jendela ini tepat di bawah kamera laptop agar kontak mata tetap natural.</span>
        </span>
        <span className="font-mono text-neutral-400 hidden sm:inline">
          KoePilot v1.0
        </span>
      </div>
    </div>
  );
};
