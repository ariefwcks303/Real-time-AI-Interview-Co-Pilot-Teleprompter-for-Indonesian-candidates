import React from 'react';
import { X, User, Briefcase, FileText, Globe2, Sparkles, Check, Bookmark } from 'lucide-react';
import { CandidateProfile, TargetLanguage } from '../types';
import { PRESET_PROFILES } from '../data/presets';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CandidateProfile;
  onUpdateProfile: (updated: CandidateProfile) => void;
  onSelectPreset: (preset: CandidateProfile) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="profile-drawer"
        className="w-full max-w-xl bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl text-neutral-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Konteks Profil & CV Kandidat</h2>
              <p className="text-xs text-neutral-400">Dasar data AI agar jawaban STAR akurat dan tidak berhalusinasi</p>
            </div>
          </div>
          <button
            id="close-profile-drawer-btn"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-rose-400" />
              Pilih Profil Cepat (Presets):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESET_PROFILES.map((preset) => {
                const isSelected = profile.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-${preset.id}`}
                    onClick={() => onSelectPreset(preset)}
                    className={`p-3 text-left rounded-xl border transition relative ${
                      isSelected
                        ? 'border-rose-500/50 bg-rose-500/10 text-white shadow-sm shadow-rose-900/30'
                        : 'border-neutral-800 bg-neutral-950/50 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800/50'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 text-rose-400">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="text-xs font-semibold block text-neutral-200 truncate pr-4">
                      {preset.badge}
                    </span>
                    <span className="text-xs font-medium text-rose-300/90 block mt-0.5 truncate">
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-neutral-400 block truncate mt-0.5">
                      {preset.jobPosition}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            {/* Candidate Name & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">Nama Kandidat</label>
                <input
                  id="input-candidate-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                  placeholder="Misal: Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5 flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-neutral-400" />
                  Target Bahasa Interview
                </label>
                <select
                  id="select-target-language"
                  value={profile.targetLanguage}
                  onChange={(e) =>
                    onUpdateProfile({
                      ...profile,
                      targetLanguage: e.target.value as TargetLanguage,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                >
                  <option value="japanese">🇯🇵 Bahasa Jepang (Romaji & Keigo Sopan)</option>
                  <option value="british_english">🇬🇧 British English (UK Corporate Tone)</option>
                </select>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                Posisi yang Dilamar
              </label>
              <input
                id="input-job-position"
                type="text"
                value={profile.jobPosition}
                onChange={(e) => onUpdateProfile({ ...profile, jobPosition: e.target.value })}
                placeholder="Misal: Tokutei Ginou Kaigo / Frontend Engineer"
                className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>

            {/* Resume Summary */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  Ringkasan CV & Pengalaman Kerja
                </label>
                <span className="text-[11px] text-neutral-500">Kunci anti-halusinasi</span>
              </div>
              <textarea
                id="input-candidate-resume"
                rows={5}
                value={profile.resumeSummary}
                onChange={(e) => onUpdateProfile({ ...profile, resumeSummary: e.target.value })}
                placeholder="Paste ringkasan pengalaman kerja, proyek penting, skill utama, dan pencapaian Anda..."
                className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 leading-relaxed font-mono transition"
              />
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                  Deskripsi Pekerjaan (Job Description)
                </label>
                <span className="text-[11px] text-neutral-500">Opsional</span>
              </div>
              <textarea
                id="input-job-description"
                rows={3}
                value={profile.jobDescription}
                onChange={(e) => onUpdateProfile({ ...profile, jobDescription: e.target.value })}
                placeholder="Paste kualifikasi atau persyaratan yang diminta oleh perusahaan..."
                className="w-full p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 leading-relaxed font-mono transition"
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            Tersimpan otomatis di sesi browser Anda.
          </p>
          <button
            id="save-profile-btn"
            onClick={onClose}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition active:scale-95"
          >
            Gunakan Profil Ini
          </button>
        </div>
      </div>
    </div>
  );
};
