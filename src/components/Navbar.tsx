import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  Monitor, 
  Mic, 
  User, 
  Settings, 
  Globe, 
  Radio, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { AudioSourceMode, CandidateProfile, TargetLanguage } from '../types';

interface NavbarProps {
  targetLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
  audioMode: AudioSourceMode;
  onOpenAudioModal: () => void;
  onOpenProfileDrawer: () => void;
  onToggleWebcamMirror: () => void;
  isWebcamMirrorOpen: boolean;
  profile: CandidateProfile;
  isListening: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  targetLanguage,
  onLanguageChange,
  audioMode,
  onOpenAudioModal,
  onOpenProfileDrawer,
  onToggleWebcamMirror,
  isWebcamMirrorOpen,
  profile,
  isListening,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 border-b border-neutral-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Concept */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                KoePilot <span className="text-xs font-normal text-rose-400 font-mono">声パイロット</span>
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">
                Live Co-Pilot
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Real-Time Teleprompter untuk Wawancara Kerja Jepang &amp; Global
            </p>
          </div>
        </div>

        {/* Middle & Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interview Timer */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-0.5 text-xs">
            <button
              id="switch-lang-jp-btn"
              onClick={() => onLanguageChange('japanese')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
                targetLanguage === 'japanese'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>🇯🇵</span>
              <span className="hidden md:inline">Jepang (Romaji)</span>
            </button>
            <button
              id="switch-lang-uk-btn"
              onClick={() => onLanguageChange('british_english')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition ${
                targetLanguage === 'british_english'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>🇬🇧</span>
              <span className="hidden md:inline">British English</span>
            </button>
          </div>

          {/* Audio Mode & Routing Guide Button */}
          <button
            id="open-audio-modal-btn"
            onClick={onOpenAudioModal}
            title="Pengaturan Audio Capture (Zoom / Google Meet)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              audioMode === 'display_media'
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
            }`}
          >
            {audioMode === 'display_media' ? (
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
            )}
            <span className="hidden sm:inline">
              {audioMode === 'display_media' ? 'Tab Meeting Aktif' : 'Audio Routing'}
            </span>
          </button>

          {/* Webcam Mirror Toggle */}
          <button
            id="toggle-webcam-mirror-btn"
            onClick={onToggleWebcamMirror}
            title="Latihan Kontak Mata (Cermin Kamera)"
            className={`p-2 rounded-xl text-xs border transition ${
              isWebcamMirrorOpen
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Profile & CV Drawer Button */}
          <button
            id="open-profile-drawer-btn"
            onClick={onOpenProfileDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-medium transition"
          >
            <User className="w-3.5 h-3.5 text-rose-400" />
            <span className="max-w-[90px] sm:max-w-[120px] truncate">{profile.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
