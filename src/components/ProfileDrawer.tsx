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

          {/* CANDIDATE CAPABILITY BOUNDARY SECTION */}
          <div className="pt-4 border-t border-neutral-800 space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Batasan Kapabilitas Kandidat (Declared Evidence)
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Anti-Fabrication Guard
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  KoePilot hanya akan menghasilkan jawaban berdasarkan keterampilan, pengalaman, dan bukti nyata yang Anda deklarasikan di bawah ini. AI dilarang mengarang teknologi atau metrik di luar bukti ini.
                </p>
              </div>

              {/* 1. SKILLS SECTION */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                    🎯 Keterampilan Terdeklarasi (Declared Skills)
                    <span className="text-[10px] text-neutral-400">({profile.capabilities?.skills?.length ?? 0})</span>
                  </span>
                </div>

                {/* Skill List */}
                <div className="flex flex-wrap gap-1.5">
                  {(profile.capabilities?.skills ?? []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-neutral-900 border border-neutral-800 text-neutral-200 group"
                    >
                      <span className="font-medium text-white">{skill.name}</span>
                      {skill.level && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          skill.level === 'expert' ? 'bg-purple-500/20 text-purple-300' :
                          skill.level === 'advanced' ? 'bg-indigo-500/20 text-indigo-300' :
                          skill.level === 'intermediate' ? 'bg-sky-500/20 text-sky-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {skill.level}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSkills = (profile.capabilities?.skills ?? []).filter((_, i) => i !== idx);
                          onUpdateProfile({
                            ...profile,
                            capabilities: {
                              skills: updatedSkills,
                              experiences: profile.capabilities?.experiences ?? [],
                              projects: profile.capabilities?.projects ?? [],
                              certifications: profile.capabilities?.certifications ?? [],
                            },
                          });
                        }}
                        className="text-neutral-500 hover:text-rose-400 transition"
                        title="Hapus skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(profile.capabilities?.skills ?? []).length === 0 && (
                    <span className="text-xs text-neutral-500 italic">Belum ada skill yang ditambahkan.</span>
                  )}
                </div>

                {/* Add Skill Quick Form */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-900">
                  <input
                    id="new-skill-name"
                    type="text"
                    placeholder="Nama Skill (misal: Python, Docker)"
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.currentTarget;
                        const val = target.value.trim();
                        if (val) {
                          const currentSkills = profile.capabilities?.skills ?? [];
                          onUpdateProfile({
                            ...profile,
                            capabilities: {
                              skills: [...currentSkills, { name: val, level: 'intermediate' }],
                              experiences: profile.capabilities?.experiences ?? [],
                              projects: profile.capabilities?.projects ?? [],
                              certifications: profile.capabilities?.certifications ?? [],
                            },
                          });
                          target.value = '';
                        }
                      }
                    }}
                  />
                  <select
                    id="new-skill-level"
                    defaultValue="intermediate"
                    className="px-2 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 focus:outline-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    id="add-skill-btn"
                    onClick={() => {
                      const input = document.getElementById('new-skill-name') as HTMLInputElement;
                      const levelSelect = document.getElementById('new-skill-level') as HTMLSelectElement;
                      const val = input?.value?.trim();
                      if (val) {
                        const currentSkills = profile.capabilities?.skills ?? [];
                        onUpdateProfile({
                          ...profile,
                          capabilities: {
                            skills: [
                              ...currentSkills,
                              { name: val, level: (levelSelect?.value as any) || 'intermediate' },
                            ],
                            experiences: profile.capabilities?.experiences ?? [],
                            projects: profile.capabilities?.projects ?? [],
                            certifications: profile.capabilities?.certifications ?? [],
                          },
                        });
                        input.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* 2. EXPERIENCE SECTION */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200">
                    💼 Riwayat Pekerjaan (Work Experiences)
                  </span>
                  <span className="text-[10px] text-neutral-400">({profile.capabilities?.experiences?.length ?? 0})</span>
                </div>

                <div className="space-y-2">
                  {(profile.capabilities?.experiences ?? []).map((exp, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{exp.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (profile.capabilities?.experiences ?? []).filter((_, i) => i !== idx);
                            onUpdateProfile({
                              ...profile,
                              capabilities: {
                                skills: profile.capabilities?.skills ?? [],
                                experiences: updated,
                                projects: profile.capabilities?.projects ?? [],
                                certifications: profile.capabilities?.certifications ?? [],
                              },
                            });
                          }}
                          className="text-neutral-500 hover:text-rose-400 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                      {exp.organization && <p className="text-[11px] text-neutral-400">{exp.organization}</p>}
                      <p className="text-neutral-300 text-[11px] leading-relaxed">{exp.description}</p>
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {exp.technologies.map((t, ti) => (
                            <span key={ti} className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(profile.capabilities?.experiences ?? []).length === 0 && (
                    <p className="text-xs text-neutral-500 italic">Belum ada entri pengalaman terstruktur.</p>
                  )}
                </div>

                {/* Add Experience Quick Trigger */}
                <div className="pt-2 border-t border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    id="new-exp-title"
                    type="text"
                    placeholder="Jabatan / Posisi"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <input
                    id="new-exp-org"
                    type="text"
                    placeholder="Perusahaan / Organisasi"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <input
                    id="new-exp-desc"
                    type="text"
                    placeholder="Deskripsi singkat tanggung jawab"
                    className="sm:col-span-2 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <button
                    type="button"
                    id="add-exp-btn"
                    onClick={() => {
                      const titleEl = document.getElementById('new-exp-title') as HTMLInputElement;
                      const orgEl = document.getElementById('new-exp-org') as HTMLInputElement;
                      const descEl = document.getElementById('new-exp-desc') as HTMLInputElement;
                      if (titleEl?.value?.trim()) {
                        const currentExps = profile.capabilities?.experiences ?? [];
                        onUpdateProfile({
                          ...profile,
                          capabilities: {
                            skills: profile.capabilities?.skills ?? [],
                            experiences: [
                              ...currentExps,
                              {
                                title: titleEl.value.trim(),
                                organization: orgEl?.value?.trim() || undefined,
                                description: descEl?.value?.trim() || titleEl.value.trim(),
                              },
                            ],
                            projects: profile.capabilities?.projects ?? [],
                            certifications: profile.capabilities?.certifications ?? [],
                          },
                        });
                        titleEl.value = '';
                        if (orgEl) orgEl.value = '';
                        if (descEl) descEl.value = '';
                      }
                    }}
                    className="sm:col-span-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition"
                  >
                    + Tambah Pengalaman
                  </button>
                </div>
              </div>

              {/* 3. PROJECTS SECTION */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200">
                    🚀 Proyek Nyata (Projects)
                  </span>
                  <span className="text-[10px] text-neutral-400">({profile.capabilities?.projects?.length ?? 0})</span>
                </div>

                <div className="space-y-2">
                  {(profile.capabilities?.projects ?? []).map((proj, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-1 relative group">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{proj.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (profile.capabilities?.projects ?? []).filter((_, i) => i !== idx);
                            onUpdateProfile({
                              ...profile,
                              capabilities: {
                                skills: profile.capabilities?.skills ?? [],
                                experiences: profile.capabilities?.experiences ?? [],
                                projects: updated,
                                certifications: profile.capabilities?.certifications ?? [],
                              },
                            });
                          }}
                          className="text-neutral-500 hover:text-rose-400 text-xs"
                        >
                          Hapus
                        </button>
                      </div>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">{proj.description}</p>
                      {proj.achievements && proj.achievements.length > 0 && (
                        <p className="text-[11px] text-emerald-400 font-mono">
                          ★ {proj.achievements.join(' | ')}
                        </p>
                      )}
                    </div>
                  ))}
                  {(profile.capabilities?.projects ?? []).length === 0 && (
                    <p className="text-xs text-neutral-500 italic">Belum ada proyek terdaftar.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-900 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    id="new-proj-name"
                    type="text"
                    placeholder="Nama Proyek"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <input
                    id="new-proj-desc"
                    type="text"
                    placeholder="Deskripsi singkat"
                    className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <button
                    type="button"
                    id="add-proj-btn"
                    onClick={() => {
                      const nameEl = document.getElementById('new-proj-name') as HTMLInputElement;
                      const descEl = document.getElementById('new-proj-desc') as HTMLInputElement;
                      if (nameEl?.value?.trim()) {
                        const currentProjs = profile.capabilities?.projects ?? [];
                        onUpdateProfile({
                          ...profile,
                          capabilities: {
                            skills: profile.capabilities?.skills ?? [],
                            experiences: profile.capabilities?.experiences ?? [],
                            projects: [
                              ...currentProjs,
                              {
                                name: nameEl.value.trim(),
                                description: descEl?.value?.trim() || nameEl.value.trim(),
                              },
                            ],
                            certifications: profile.capabilities?.certifications ?? [],
                          },
                        });
                        nameEl.value = '';
                        if (descEl) descEl.value = '';
                      }
                    }}
                    className="sm:col-span-2 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition"
                  >
                    + Tambah Proyek
                  </button>
                </div>
              </div>

              {/* 4. CERTIFICATIONS SECTION */}
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200">
                    📜 Sertifikasi Resmi (Certifications)
                  </span>
                  <span className="text-[10px] text-neutral-400">({profile.capabilities?.certifications?.length ?? 0})</span>
                </div>

                <div className="space-y-1.5">
                  {(profile.capabilities?.certifications ?? []).map((cert, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                      <div>
                        <span className="font-semibold text-white">{cert.name}</span>
                        <span className="text-neutral-400 text-[11px] ml-2">
                          {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (profile.capabilities?.certifications ?? []).filter((_, i) => i !== idx);
                          onUpdateProfile({
                            ...profile,
                            capabilities: {
                              skills: profile.capabilities?.skills ?? [],
                              experiences: profile.capabilities?.experiences ?? [],
                              projects: profile.capabilities?.projects ?? [],
                              certifications: updated,
                            },
                          });
                        }}
                        className="text-neutral-500 hover:text-rose-400 text-xs"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                  {(profile.capabilities?.certifications ?? []).length === 0 && (
                    <p className="text-xs text-neutral-500 italic">Belum ada sertifikasi terdaftar.</p>
                  )}
                </div>

                <div className="pt-2 border-t border-neutral-900 flex flex-wrap gap-2 text-xs">
                  <input
                    id="new-cert-name"
                    type="text"
                    placeholder="Nama Sertifikasi"
                    className="flex-1 min-w-[140px] px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <input
                    id="new-cert-issuer"
                    type="text"
                    placeholder="Penerbit"
                    className="w-28 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <input
                    id="new-cert-year"
                    type="text"
                    placeholder="Tahun"
                    className="w-20 px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500"
                  />
                  <button
                    type="button"
                    id="add-cert-btn"
                    onClick={() => {
                      const nameEl = document.getElementById('new-cert-name') as HTMLInputElement;
                      const issuerEl = document.getElementById('new-cert-issuer') as HTMLInputElement;
                      const yearEl = document.getElementById('new-cert-year') as HTMLInputElement;
                      if (nameEl?.value?.trim()) {
                        const currentCerts = profile.capabilities?.certifications ?? [];
                        onUpdateProfile({
                          ...profile,
                          capabilities: {
                            skills: profile.capabilities?.skills ?? [],
                            experiences: profile.capabilities?.experiences ?? [],
                            projects: profile.capabilities?.projects ?? [],
                            certifications: [
                              ...currentCerts,
                              {
                                name: nameEl.value.trim(),
                                issuer: issuerEl?.value?.trim() || undefined,
                                year: yearEl?.value?.trim() || undefined,
                              },
                            ],
                          },
                        });
                        nameEl.value = '';
                        if (issuerEl) issuerEl.value = '';
                        if (yearEl) yearEl.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition"
                  >
                    + Tambah
                  </button>
                </div>
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
