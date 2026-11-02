export type PressureLevel = 'moderate' | 'high' | 'extreme';

export type InterviewMode = 'general' | 'debate' | 'pt' | 'english';

export interface InterviewerPersona {
  id: string;
  name: string;
  title: string;
  avatarColor: string;
  avatarGradient: string;
  avatarInitials: string;
  style: string;
  tagline: string;
  pressureStyle: string;
  description: string;
}

export interface CompanyOption {
  id: string;
  name: string;
  category: '테크/플랫폼' | '빅테크' | '대기업/제조' | '유니콘/스타트업';
  badge: string;
  culture: string;
  primaryFocus: string;
}

export interface JobRoleOption {
  id: string;
  name: string;
  category: '개발/기술' | '기획/PM' | '데이터/AI' | '비즈니스/마케팅';
  sampleQuestions: string[];
}

export interface DebateSetup {
  topic: string;
  assignedStance: '찬성' | '반대';
  opponentName: string;
  opponentRole: string;
  contextBackground: string;
}

export interface PTSetup {
  caseTitle: string;
  backgroundBriefing: string;
  dataPoints: { label: string; value: string }[];
  presentationGoal: string;
  prepTimeSec: number;
}

export interface EnglishSetup {
  targetDomain: string;
  cefrTarget: 'B2 (Professional)' | 'C1 (Advanced)' | 'C2 (Mastery)';
  accentPreference: 'American' | 'British';
}

export interface InterviewSetup {
  mode: InterviewMode;
  company: string;
  companyCategory: string;
  jobRole: string;
  careerLevel: '신입' | '주니어 (1~3년)' | '시니어 (4년 이상)';
  pressureLevel: PressureLevel;
  interviewerPersona: InterviewerPersona;
  customResumeOrProject?: string;
  enableCamera: boolean;
  enableVoice: boolean;

  // Format-specific configurations
  debateSetup?: DebateSetup;
  ptSetup?: PTSetup;
  englishSetup?: EnglishSetup;
}

export interface StarScores {
  situation: number;
  task: number;
  action: number;
  result: number;
}

export interface RoundEvaluation {
  starScores: StarScores;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  feedbackComment: string;
  interviewerAttitude: string;
  isLastRound: boolean;
  nextQuestion: string;
  tailQuestionType: string;
  recommendedModelAnswerGuide: string;

  // Specific evaluations
  debateCounterArgument?: string; // For debate mode
  ptCritique?: string; // For PT mode
  englishGrammarFixes?: { original: string; improved: string; reason: string }[]; // For English mode
}

export interface InterviewRound {
  roundNumber: number;
  question: string;
  intent: string;
  focusKeywords: string[];
  recommendedTimeSec: number;
  candidateAnswer: string;
  speechStats: {
    durationSec: number;
    fillerCount: number;
    detectedFillers: { [key: string]: number };
    gazeOffCount: number;
    gazeCenterPercent: number;
  };
  evaluation?: RoundEvaluation;
}

export interface FinalReportData {
  passVerdict: '합격 유력 (Strong Hire)' | '합격권 (Hire)' | '보류 (Borderline)' | '탈락 (No Hire)';
  verdictSummary: string;
  radarScores: {
    logicStructure: number;
    dataSpecificity: number;
    stressTolerance: number;
    jobCompetency: number;
    deliveryAndPresence: number;
  };
  totalScore: number;
  keyStrengths: string[];
  criticalWeaknesses: string[];
  speechAndHabitCritique: string;
  actionPlan: string[];
  roundBreakdowns: {
    roundNumber: number;
    coreTopic: string;
    pressureTrigger: string;
    score: number;
    oneLineVerdict: string;
  }[];

  // Mode specific report data
  modeSpecificReport?: {
    mode: InterviewMode;
    title: string;
    highlightMetrics: { label: string; value: string; assessment: string }[];
    coachingAdvice: string;
  };
}
