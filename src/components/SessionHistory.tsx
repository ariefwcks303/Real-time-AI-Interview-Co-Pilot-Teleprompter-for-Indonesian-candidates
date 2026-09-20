import React from 'react';
import { History, Clock, ChevronRight, Copy, Trash2, Check } from 'lucide-react';
import { CopilotResponse } from '../types';

interface SessionHistoryProps {
  history: CopilotResponse[];
  onSelect: (item: CopilotResponse) => void;
  onClear: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  const [copiedIdx, setCopiedIdx] = React.useState<number | null>(null);

  if (history.length === 0) return null;

  const handleCopy = (text: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div id="session-history-panel" className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-neutral-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Riwayat Pertanyaan Sesi Ini</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {history.length}
          </span>
        </div>
        <button
          onClick={onClear}
          title="Hapus Riwayat"
          className="text-xs text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus</span>
        </button>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {history.map((item, idx) => {
          const timeStr = item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : `#${idx + 1}`;

          return (
            <div
              key={idx}
              onClick={() => onSelect(item)}
              className="p-3 bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 rounded-xl transition cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{timeStr}</span>
                </div>
                <p className="text-xs font-semibold text-neutral-200 truncate">
                  &quot;{item.questionOriginal}&quot;
                </p>
                <p className="text-[11px] text-emerald-400/90 truncate">
                  🇮🇩 {item.questionSummaryId}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 pt-1">
                <button
                  onClick={(e) => handleCopy(item.teleprompterScript, idx, e)}
                  title="Salin Script"
                  className="p-1.5 text-neutral-500 hover:text-neutral-200 rounded hover:bg-neutral-800 transition"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-300 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
