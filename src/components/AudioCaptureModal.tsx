import React from 'react';
import { X, Volume2, Monitor, Mic, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AudioSourceMode } from '../types';

interface AudioCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: AudioSourceMode;
  onSelectMode: (mode: AudioSourceMode) => void;
  onRequestDisplayAudio: () => void;
  onRequestMicAudio: () => void;
}

export const AudioCaptureModal: React.FC<AudioCaptureModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onRequestDisplayAudio,
  onRequestMicAudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="audio-routing-modal"
        className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Audio Routing & HR Sound Capture</h2>
              <p className="text-xs text-neutral-400">Teknik menangkap suara jernih HR dari Zoom / Google Meet tanpa noise ruangan</p>
            </div>
          </div>
          <button
            id="close-audio-modal-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* Method 1: Web Tab Audio Capture (Recommended) */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Paling Direkomendasikan
                </span>
                <span className="text-xs text-emerald-300/80 font-medium">Digital Crystal Clear</span>
              </div>
              <Monitor className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <h3 className="text-base font-semibold text-white mb-2">
              Tangkap Audio Tab Google Meet / Zoom via Browser (<code className="text-xs font-mono text-emerald-300">getDisplayMedia</code>)
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              Ketika browser meminta izin share screen, pilih <strong>Tab Google Meet</strong> Anda dan <strong>WAJIB centang &quot;Share tab audio&quot; (Bagi audio tab)</strong>.
              Aplikasi ini akan langsung merekam output suara HR secara digital 100% jernih tanpa tercampur suara ruangan Anda!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-neutral-300 mb-4">
              <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                <span className="font-bold text-emerald-400 block mb-1">Langkah 1</span>
                Klik tombol di bawah untuk memicu izin browser
              </div>
              <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                <span className="font-bold text-emerald-400 block mb-1">Langkah 2</span>
                Pilih tab <strong>Google Meet / Zoom Web</strong>
              </div>
              <div className="p-3 bg-neutral-900/80 rounded-lg border border-neutral-800">
                <span className="font-bold text-emerald-400 block mb-1">Langkah 3</span>
                Centang kotak <strong>&quot;Share tab audio&quot;</strong>
              </div>
            </div>

            <button
              id="activate-display-audio-btn"
              onClick={() => {
                onRequestDisplayAudio();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-[0.99]"
            >
              <Monitor className="w-4 h-4" />
              Aktifkan Tangkap Audio Tab Meet / Zoom
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Method 2: Microphone Fallback */}
          <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-semibold text-white">Mikrofon Langsung (Speaker ke Mic)</h3>
              </div>
              {currentMode === 'microphone' && (
                <span className="flex items-center gap-1 text-xs text-sky-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Aktif
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed mb-3">
              Cocok jika Anda sedang latihan atau menyalakan speaker laptop dengan volume cukup agar mikrofon menangkap suara HR.
            </p>
            <button
              id="activate-mic-audio-btn"
              onClick={() => {
                onRequestMicAudio();
                onClose();
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium rounded-lg border border-neutral-700 transition"
            >
              Gunakan Mikrofon Laptop
            </button>
          </div>

          {/* Virtual Audio Drivers note for Desktop */}
          <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-950/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-400 space-y-1">
              <span className="font-semibold text-neutral-200 block">Rekomendasi Tambahan untuk Aplikasi Desktop (Electron / Tauri):</span>
              <p>
                Gunakan virtual audio driver seperti <strong>VB-Cable</strong> (Windows) atau <strong>BlackHole</strong> (macOS). Audio Zoom di-route ke virtual cable sehingga Co-Pilot mendengarkan suara HR secara background tanpa terganggu saat memakai headset.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Kandidat tetap disarankan memakai headset agar suara HR tidak menimbulkan feedback loop.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-sm text-white rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
