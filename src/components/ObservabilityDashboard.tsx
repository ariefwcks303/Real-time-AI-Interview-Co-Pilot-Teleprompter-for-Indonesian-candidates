import React, { useState } from 'react';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  RefreshCw, 
  Server, 
  Trash2, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Radio,
  BarChart3
} from 'lucide-react';
import { ObservabilityRecord, PipelineStatus } from '../types';

interface ObservabilityDashboardProps {
  currentRecord: ObservabilityRecord | null;
  history: ObservabilityRecord[];
  onClearHistory: () => void;
  status: PipelineStatus;
}

export const ObservabilityDashboard: React.FC<ObservabilityDashboardProps> = ({
  currentRecord,
  history,
  onClearHistory,
  status,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Fallback active item to display (either currently running or latest completed)
  const active = currentRecord || (history.length > 0 ? history[0] : null);

  const getStatusBadge = (st: PipelineStatus) => {
    switch (st) {
      case 'RECORDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            RECORDING
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            PROCESSING
          </span>
        );
      case 'GENERATING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-pulse">
            <Zap className="w-3 h-3" />
            GENERATING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            COMPLETED
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40">
            <AlertCircle className="w-3 h-3" />
            ERROR
          </span>
        );
      case 'IDLE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
            IDLE
          </span>
        );
    }
  };

  const formatMs = (ms: number | null | undefined): string => {
    if (ms === null || ms === undefined) return 'N/A';
    return `${Math.round(ms).toLocaleString()} ms`;
  };

  const formatSec = (ms: number | null | undefined): string => {
    if (ms === null || ms === undefined) return 'N/A';
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Compute breakdown percentages
  const stages = active?.stages;
  const total = stages?.totalMs || 1;
  const stageList = [
    { name: 'Audio Processing', ms: stages?.audioProcessingMs ?? 0, color: 'bg-amber-400' },
    { name: 'Speech-to-Text (STT)', ms: stages?.sttMs ?? 0, color: 'bg-sky-400' },
    { name: 'Context Analysis', ms: stages?.contextMs ?? 0, color: 'bg-purple-400' },
    { name: 'LLM Generation', ms: stages?.generationMs ?? 0, color: 'bg-rose-400' },
    { name: 'Post-Processing', ms: stages?.postProcessingMs ?? 0, color: 'bg-emerald-400' },
    { name: 'UI Rendering', ms: stages?.uiRenderingMs ?? 0, color: 'bg-teal-400' },
  ];

  return (
    <section 
      id="mini-observability-dashboard" 
      className="w-full bg-neutral-950/95 border-b border-neutral-800 shadow-xl font-sans"
    >
      {/* Top Header Strip / Collapsed Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <Activity className="w-4 h-4 text-rose-500" />
            <span className="font-bold tracking-tight text-white uppercase text-[11px]">
              Pipeline Observability
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
              Diagnostic Mode
            </span>
          </div>

          <div className="h-3.5 w-px bg-neutral-800 shrink-0" />

          {/* Current Request ID */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-neutral-500">Request:</span>
            <span className="font-mono font-semibold text-neutral-200">
              {active ? active.requestId : 'None'}
            </span>
          </div>

          {/* Pipeline Status */}
          <div className="shrink-0">
            {getStatusBadge(status)}
          </div>

          {/* End-to-End Latency Badge */}
          {active && active.stages.totalMs > 0 && (
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 font-mono">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-bold">
                {formatMs(active.stages.totalMs)}
              </span>
              <span className="text-neutral-500">({formatSec(active.stages.totalMs)})</span>
            </div>
          )}

          {/* Model info badge */}
          {active?.metadata.modelName && (
            <div className="hidden md:flex items-center gap-1 shrink-0 text-neutral-400 font-mono text-[11px]">
              <Cpu className="w-3 h-3 text-neutral-500" />
              <span>{active.metadata.modelName}</span>
            </div>
          )}
        </div>

        {/* Toggle Expand / Collapse Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="toggle-observability-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition text-[11px] font-medium"
          >
            <span>{isExpanded ? 'Sembunyikan' : 'Buka Dashboard'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Metrics Section */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-neutral-800/80 space-y-4 animate-in fade-in duration-150">
          {/* Row 1: Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. End-to-End Latency */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Total Latency</span>
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-white tracking-tight">
                {active && active.stages.totalMs > 0 ? (
                  <>
                    <span>{formatMs(active.stages.totalMs)}</span>
                    <span className="block text-[11px] font-normal text-neutral-400 font-mono">
                      ({formatSec(active.stages.totalMs)})
                    </span>
                  </>
                ) : (
                  <span className="text-neutral-500">Standby</span>
                )}
              </div>
            </div>

            {/* 2. TTFT (Time to First Token) */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>TTFT</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-white">
                {active?.llmMetrics.timeToFirstTokenMs ? (
                  formatMs(active.llmMetrics.timeToFirstTokenMs)
                ) : (
                  <span className="text-neutral-500">N/A</span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 block">First token speed</span>
            </div>

            {/* 3. Token Generation Rate */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Speed (tps)</span>
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-white">
                {active?.llmMetrics.tokensPerSecond ? (
                  `${active.llmMetrics.tokensPerSecond.toFixed(1)} tok/s`
                ) : (
                  <span className="text-neutral-500">N/A</span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 block">Throughput</span>
            </div>

            {/* 4. Tokens (In / Out / Total) */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Tokens</span>
                <Layers className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-xs font-mono font-bold text-white">
                {active?.llmMetrics.totalTokens !== null && active?.llmMetrics.totalTokens !== undefined ? (
                  <span>
                    {active.llmMetrics.totalTokens}{' '}
                    <span className="text-[10px] font-normal text-neutral-400">
                      ({active.llmMetrics.inputTokens || 0} in / {active.llmMetrics.outputTokens || 0} out)
                    </span>
                  </span>
                ) : (
                  <span className="text-neutral-500">N/A</span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 block">LLM token usage</span>
            </div>

            {/* 5. Network Timing / Status */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>HTTP Status</span>
                <Globe className="w-3.5 h-3.5 text-teal-400" />
              </div>
              <div className="text-sm sm:text-base font-extrabold font-mono text-white">
                {active?.network.httpStatus ? (
                  <span className={active.network.httpStatus === 200 ? 'text-emerald-400' : 'text-rose-400'}>
                    {active.network.httpStatus} OK
                  </span>
                ) : (
                  <span className="text-neutral-500">N/A</span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500 block">
                Retry: {active?.network.retryCount ?? 0}
              </span>
            </div>

            {/* 6. Active Model */}
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span>Model</span>
                <Server className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <div className="text-xs font-mono font-bold text-neutral-200 truncate" title={active?.metadata.modelName || 'N/A'}>
                {active?.metadata.modelName || 'N/A'}
              </div>
              <span className="text-[10px] text-neutral-500 block truncate">
                Reason: {active?.llmMetrics.finishReason || 'N/A'}
              </span>
            </div>
          </div>

          {/* Row 2: Stage Latency Table + Latency Breakdown Horizontal Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Stage Latency Table (7 cols) */}
            <div className="lg:col-span-7 bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  Stage Latency Breakdown (Actual Measurements)
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  Timer: performance.now()
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800/80 text-[11px]">
                      <th className="pb-1.5 font-medium">Stage</th>
                      <th className="pb-1.5 text-right font-medium">Latency</th>
                      <th className="pb-1.5 text-right font-medium">Formatted</th>
                      <th className="pb-1.5 text-right font-medium">Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {stageList.map((item, idx) => {
                      const ratio = total > 0 ? (item.ms / total) * 100 : 0;
                      return (
                        <tr key={idx} className="hover:bg-neutral-800/40 transition">
                          <td className="py-1.5 flex items-center gap-2 font-sans font-medium text-neutral-300">
                            <span className={`w-2 h-2 rounded-full ${item.color}`} />
                            <span>{item.name}</span>
                          </td>
                          <td className="py-1.5 text-right text-neutral-200">
                            {formatMs(item.ms)}
                          </td>
                          <td className="py-1.5 text-right text-neutral-400">
                            {formatSec(item.ms)}
                          </td>
                          <td className="py-1.5 text-right text-neutral-300 font-semibold">
                            {ratio.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                    {/* Total Row */}
                    <tr className="border-t border-neutral-700 bg-neutral-950/50 font-bold">
                      <td className="py-2 text-white font-sans">Total End-to-End</td>
                      <td className="py-2 text-right text-emerald-400">{formatMs(stages?.totalMs)}</td>
                      <td className="py-2 text-right text-neutral-300">{formatSec(stages?.totalMs)}</td>
                      <td className="py-2 text-right text-white">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Latency Breakdown Visualization (Horizontal Bars) (5 cols) */}
            <div className="lg:col-span-5 bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                  Latency Contribution &amp; Bottleneck Analysis
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">% of Total</span>
              </div>

              {/* Stacked Overview Bar */}
              <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                {stageList.map((item, idx) => {
                  const ratio = total > 0 ? (item.ms / total) * 100 : 0;
                  if (ratio <= 0) return null;
                  return (
                    <div
                      key={idx}
                      className={`${item.color} h-full transition-all duration-300`}
                      style={{ width: `${Math.max(1, ratio)}%` }}
                      title={`${item.name}: ${ratio.toFixed(1)}% (${formatMs(item.ms)})`}
                    />
                  );
                })}
              </div>

              {/* Individual Bars */}
              <div className="space-y-2 pt-1 text-xs">
                {stageList.map((item, idx) => {
                  const ratio = total > 0 ? (item.ms / total) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400 font-medium truncate">{item.name}</span>
                        <span className="font-mono text-neutral-300 font-semibold">
                          {formatMs(item.ms)} ({ratio.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 3: Request Metadata & Network Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-3">
            <div>
              <span className="text-[11px] text-neutral-500 block">Request ID &amp; Timestamps</span>
              <div className="font-mono font-medium text-neutral-200 mt-0.5">
                ID: {active?.requestId || 'N/A'}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono truncate">
                Start: {active?.startTimeFormatted || 'N/A'}
              </div>
              <div className="text-[11px] text-neutral-400 font-mono truncate">
                End: {active?.endTimeFormatted || 'N/A'}
              </div>
            </div>

            <div>
              <span className="text-[11px] text-neutral-500 block">Payload Characters</span>
              <div className="font-mono text-neutral-200 mt-0.5">
                Input: {active?.metadata.inputCharacters ? `${active.metadata.inputCharacters.toLocaleString()} chars` : 'N/A'}
              </div>
              <div className="font-mono text-neutral-400 text-[11px]">
                Output: {active?.metadata.outputCharacters ? `${active.metadata.outputCharacters.toLocaleString()} chars` : 'N/A'}
              </div>
              <div className="text-[10px] text-neutral-500">Audio Duration: {active?.metadata.audioDurationSec ? `${active.metadata.audioDurationSec.toFixed(1)}s` : 'N/A'}</div>
            </div>

            <div>
              <span className="text-[11px] text-neutral-500 block">Network Timing</span>
              <div className="font-mono text-neutral-200 mt-0.5">
                Req Duration: {formatMs(active?.network.requestDurationMs)}
              </div>
              <div className="font-mono text-neutral-400 text-[11px]">
                Resp Duration: {formatMs(active?.network.responseDurationMs)}
              </div>
              <div className="text-[10px] text-neutral-500">Errors: {active?.network.errorCount ?? 0}</div>
            </div>

            <div>
              <span className="text-[11px] text-neutral-500 block">Security &amp; Privacy Note</span>
              <p className="text-[11px] text-emerald-400/90 mt-0.5">
                Zero API Keys or Secrets Exposed
              </p>
              <p className="text-[10px] text-neutral-500 leading-tight mt-1">
                All Gemini API keys are secured exclusively on the backend container.
              </p>
            </div>
          </div>

          {/* Row 4: Recent Requests Table (Last 5-10 Requests) */}
          <div className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-neutral-200">
                  Recent Requests (Browser In-Memory Diagnostics)
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                  {history.length} logged
                </span>
              </div>
              {history.length > 0 && (
                <button
                  id="clear-observability-history-btn"
                  onClick={onClearHistory}
                  className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center italic">
                Belum ada request yang tercatat. Lakukan simulasi pertanyaan atau uji coba audio live untuk mulai mengumpulkan data telemetri.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-neutral-500 border-b border-neutral-800/80 text-[11px]">
                      <th className="pb-1.5 font-medium">Request</th>
                      <th className="pb-1.5 text-right font-medium">Total</th>
                      <th className="pb-1.5 text-right font-medium">Audio/STT</th>
                      <th className="pb-1.5 text-right font-medium">Context</th>
                      <th className="pb-1.5 text-right font-medium">Generation</th>
                      <th className="pb-1.5 text-right font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {history.slice(0, 10).map((rec, i) => (
                      <tr key={i} className="hover:bg-neutral-800/40 transition">
                        <td className="py-2 text-neutral-200 font-semibold">
                          {rec.requestId}
                          <span className="block text-[10px] text-neutral-500 font-sans font-normal">
                            {rec.startTimeFormatted}
                          </span>
                        </td>
                        <td className="py-2 text-right text-emerald-300 font-bold">
                          {formatSec(rec.stages.totalMs)}
                          <span className="block text-[10px] text-neutral-500 font-normal">
                            {formatMs(rec.stages.totalMs)}
                          </span>
                        </td>
                        <td className="py-2 text-right text-sky-400">
                          {formatSec(rec.stages.sttMs + rec.stages.audioProcessingMs)}
                        </td>
                        <td className="py-2 text-right text-purple-400">
                          {formatMs(rec.stages.contextMs)}
                        </td>
                        <td className="py-2 text-right text-rose-400 font-semibold">
                          {formatSec(rec.stages.generationMs)}
                        </td>
                        <td className="py-2 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'COMPLETED' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {rec.status === 'COMPLETED' ? 'Success' : rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
