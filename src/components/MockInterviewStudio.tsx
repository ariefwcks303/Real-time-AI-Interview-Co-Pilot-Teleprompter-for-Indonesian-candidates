import React, { useState } from 'react';
import { Play, Volume2, Send, Sparkles, StopCircle, RefreshCw, MessageSquare, ChevronRight } from 'lucide-react';
import { MockQuestion, TargetLanguage } from '../types';
import { MOCK_QUESTIONS } from '../data/presets';
import { speakHrQuestion } from '../utils/speech';

interface MockInterviewStudioProps {
  targetLanguage: TargetLanguage;
  onSimulateQuestion: (
    questionText: string,
    timing?: { audioProcessingMs?: number; sttMs?: number; audioDurationSec?: number }
  ) => void;
  isProcessing: boolean;
}

export const MockInterviewStudio: React.FC<MockInterviewStudioProps> = ({
  targetLanguage,
  onSimulateQuestion,
  isProcessing,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speechController, setSpeechController] = useState<{ stop: () => void } | null>(null);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  const filteredQuestions = MOCK_QUESTIONS.filter((q) => {
    if (q.language !== targetLanguage) return false;
    if (activeCategory !== 'all' && q.category !== activeCategory) return false;
    return true;
  });

  const handlePlayVoice = (question: MockQuestion) => {
    if (speakingId === question.id && speechController) {
      speechController.stop();
      setSpeakingId(null);
      setSpeechController(null);
      return;
    }

    if (speechController) {
      speechController.stop();
    }

    setSpeakingId(question.id);
    const controller = speakHrQuestion(
      question.textOriginal,
      question.language,
      () => setSpeakingId(question.id),
      () => {
        setSpeakingId(null);
        setSpeechController(null);
      }
    );
    setSpeechController(controller);
  };

  const handleTriggerSim = (text: string) => {
    onSimulateQuestion(text);
  };

  return (
    <div id="mock-interview-studio" className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Simulasi Pertanyaan HR (Mock Interview)</h3>
            <p className="text-xs text-neutral-400">
              Uji latensi teleprompter (&lt; 3 detik) dengan pertanyaan asli HR {targetLanguage === 'japanese' ? 'Jepang' : 'British'}
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              activeCategory === 'all'
                ? 'bg-neutral-700 text-white'
                : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Semua
          </button>
          {targetLanguage === 'japanese' && (
            <button
              onClick={() => setActiveCategory('tokutei_ginou')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                activeCategory === 'tokutei_ginou'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Tokutei Ginou
            </button>
          )}
          <button
            onClick={() => setActiveCategory('technical')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              activeCategory === 'technical'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Teknis / Project
          </button>
          <button
            onClick={() => setActiveCategory('cultural')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              activeCategory === 'cultural'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-neutral-800/60 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Budaya Kerja
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {filteredQuestions.map((q) => {
          const isSpeaking = speakingId === q.id;
          return (
            <div
              key={q.id}
              id={`mock-q-${q.id}`}
              className="p-3 bg-neutral-950/60 border border-neutral-800/90 rounded-xl hover:border-neutral-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60">
                    {q.category.toUpperCase()}
                  </span>
                  <span className="text-xs text-neutral-400 truncate">
                    🇮🇩 {q.textTranslationId}
                  </span>
                </div>
                <p className="text-sm font-semibold text-neutral-100 font-sans leading-snug">
                  {q.textOriginal}
                </p>
                <p className="text-[11px] text-amber-400/80 italic">
                  💡 Tips: {q.suggestedFocus}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Voice button */}
                <button
                  onClick={() => handlePlayVoice(q)}
                  title="Dengarkan Suara HR"
                  className={`p-2 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                      : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {isSpeaking ? (
                    <>
                      <StopCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Suara HR</span>
                    </>
                  )}
                </button>

                {/* Send to AI button */}
                <button
                  disabled={isProcessing}
                  onClick={() => handleTriggerSim(q.textOriginal)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1 active:scale-95"
                >
                  <span>Minta Script</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Question Input */}
      <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="custom-hr-question-input"
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customQuestion.trim()) {
                handleTriggerSim(customQuestion.trim());
                setCustomQuestion('');
              }
            }}
            placeholder={
              targetLanguage === 'japanese'
                ? 'Ketik pertanyaan HR Jepang manual (misal: "あなたの強みは何ですか？")...'
                : 'Type custom British HR question (e.g. "Tell me about your tech stack and leadership style")...'
            }
            className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition"
          />
        </div>
        <button
          disabled={!customQuestion.trim() || isProcessing}
          onClick={() => {
            if (customQuestion.trim()) {
              handleTriggerSim(customQuestion.trim());
              setCustomQuestion('');
            }
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-semibold rounded-xl transition shrink-0 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim</span>
        </button>
      </div>
    </div>
  );
};
