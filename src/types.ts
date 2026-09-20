export type TargetLanguage = 'japanese' | 'british_english';

export type AudioSourceMode = 'display_media' | 'microphone' | 'simulator' | 'manual';

export interface PronunciationGuideItem {
  word: string;
  phonetic: string;
  tip?: string;
}

export type CapabilityStatus = 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'UNSUPPORTED';

export interface CandidateSkill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description?: string;
}

export interface CandidateExperience {
  title: string;
  organization?: string;
  description: string;
  technologies?: string[];
}

export interface CandidateProject {
  name: string;
  description: string;
  technologies?: string[];
  responsibilities?: string[];
  achievements?: string[];
}

export interface CandidateCertification {
  name: string;
  issuer?: string;
  year?: string;
}

export interface CandidateCapabilityProfile {
  skills: CandidateSkill[];
  experiences: CandidateExperience[];
  projects: CandidateProject[];
  certifications: CandidateCertification[];
}

export interface CapabilityAnalysis {
  capabilityStatus: CapabilityStatus;
  relevantCapabilities: string[];
  missingCapabilities: string[];
  evidenceUsed: string[];
  riskNote: string | null;
}

export interface CopilotResponse {
  questionSummaryId: string;
  questionOriginal: string;
  teleprompterScript: string;
  nativeScript?: string;
  pronunciationGuide?: PronunciationGuideItem[];
  indonesianTranslation: string;
  keyTakeaways: string[];
  estimatedReadTimeSec?: number;
  timestamp?: number;
  // Capability Boundary Metadata
  capabilityStatus?: CapabilityStatus;
  relevantCapabilities?: string[];
  missingCapabilities?: string[];
  evidenceUsed?: string[];
  riskNote?: string | null;
}

export interface CandidateProfile {
  id: string;
  name: string;
  targetLanguage: TargetLanguage;
  jobPosition: string;
  targetCompanyType: string;
  resumeSummary: string;
  jobDescription: string;
  badge: string;
  capabilities?: CandidateCapabilityProfile;
}

export interface MockQuestion {
  id: string;
  category: 'intro' | 'technical' | 'cultural' | 'tokutei_ginou' | 'behavioral';
  language: TargetLanguage;
  textOriginal: string;
  textTranslationId: string;
  suggestedFocus: string;
}

export type CopilotStatus = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'streaming' | 'ready' | 'error';

export type PipelineStatus = 'IDLE' | 'RECORDING' | 'PROCESSING' | 'GENERATING' | 'COMPLETED' | 'ERROR';

export interface StageLatencyItem {
  stage: string;
  key: string;
  latencyMs: number;
  percentage: number;
}

export interface PipelineStageMetrics {
  audioProcessingMs: number;
  sttMs: number;
  contextMs: number;
  generationMs: number;
  postProcessingMs: number;
  uiRenderingMs: number;
  totalMs: number;
}

export interface ObservabilityRecord {
  requestId: string;
  status: PipelineStatus;
  startTime: number;
  endTime: number | null;
  startTimeFormatted: string;
  endTimeFormatted: string | null;
  stages: PipelineStageMetrics;
  metadata: {
    audioDurationSec: number | null;
    inputCharacters: number | null;
    outputCharacters: number | null;
    modelName: string | null;
  };
  capabilityMetrics?: {
    capabilityStatus: CapabilityStatus | null;
    relevantCapabilityCount: number;
    evidenceCount: number;
    unsupportedClaimDetected: boolean;
    regenerationCount: number;
  };
  llmMetrics: {
    timeToFirstTokenMs: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    tokensPerSecond: number | null;
    finishReason: string | null;
  };
  network: {
    requestDurationMs: number | null;
    responseDurationMs: number | null;
    httpStatus: number | null;
    retryCount: number;
    errorCount: number;
  };
}
