import React, { useState, useEffect, useRef } from 'react';
import {
  InterviewSetup,
  InterviewRound,
} from '../types/interview';
import { WebcamTracker } from './WebcamTracker';
import { analyzeFillerWords } from '../data/interviewConfig';
import { speakInterviewerText, stopSpeaking, soundManager } from '../utils/audioSpeech';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  FileCheck,
  Swords,
  Presentation,
  Globe2,
  Table,
  CheckCircle2,
  Languages,
} from 'lucide-react';

interface InterviewCockpitProps {
  setup: InterviewSetup;
  currentRoundNumber: number;
  maxRounds: number;
  currentQuestion: string;
  currentIntent: string;
  focusKeywords: string[];
  recommendedTimeSec: number;
  interviewerAttitude: string;
  history: InterviewRound[];
  isLoadingNext: boolean;
  onAnswerSubmit: (
    answerText: string,
    speechStats: {
      durationSec: number;
      fillerCount: number;
      detectedFillers: { [key: string]: number };
      gazeOffCount: number;
      gazeCenterPercent: number;
    }
  ) => void;
  onFinishInterviewEarly: () => void;
}

export const InterviewCockpit: React.FC<InterviewCockpitProps> = ({
  setup,
  currentRoundNumber,
  maxRounds,
  currentQuestion,
  currentIntent,
  focusKeywords,
  recommendedTimeSec,
  interviewerAttitude,
  history,
  isLoadingNext,
  onAnswerSubmit,
  onFinishInterviewEarly,
}) => {
  const isEnglishMode = setup.mode === 'english';
  const isDebateMode = setup.mode === 'debate';
  const isPTMode = setup.mode === 'pt';

  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showPTDossier, setShowPTDossier] = useState<boolean>(false);

  // Gaze Tracking state
  const [gazeCenterPct, setGazeCenterPct] = useState<number>(94);
  const [gazeOffCount, setGazeOffCount] = useState<number>(0);
  const [gazeStatus, setGazeStatus] = useState<string>('정면 응시');

  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Analyze filler words in candidate text in real time (Korean vs English)
  const fillerAnalysis = analyzeFillerWords(candidateAnswer, isEnglishMode);

  // Speak question when a new round starts
  useEffect(() => {
    setElapsedSeconds(0);
    setCandidateAnswer('');
    soundManager.playTailQuestionAlert();

    if (ttsEnabled && currentQuestion) {
      setIsSpeakingTTS(true);
      speakInterviewerText(currentQuestion, () => setIsSpeakingTTS(false));
    }

    return () => {
      stopSpeaking();
    };
  }, [currentRoundNumber, currentQuestion, ttsEnabled]);

  // Answer timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentRoundNumber]);

  // Web Speech API STT Setup (ko-KR vs en-US)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = isEnglishMode ? 'en-US' : 'ko-KR';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCandidateAnswer(transcript);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isEnglishMode]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(
        isEnglishMode
          ? 'Web Speech API is not supported in this browser. Please type directly into the text box.'
          : '사용자의 브라우저에서 Web Speech API(음성인식)가 지원되지 않습니다. 아래 텍스트 입력창을 사용해주세요.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const handleTTSReplay = () => {
    if (isSpeakingTTS) {
      stopSpeaking();
      setIsSpeakingTTS(false);
    } else {
      setIsSpeakingTTS(true);
      speakInterviewerText(currentQuestion, () => setIsSpeakingTTS(false));
    }
  };

  const handleSubmit = () => {
    if (!candidateAnswer.trim()) {
      alert(isEnglishMode ? 'Please provide your response before submitting.' : '답변을 음성으로 말씀하시거나 텍스트로 입력해 주세요.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    stopSpeaking();
    soundManager.playTensionChime();

    onAnswerSubmit(candidateAnswer.trim(), {
      durationSec: elapsedSeconds,
      fillerCount: fillerAnalysis.totalCount,
      detectedFillers: fillerAnalysis.detectedMap,
      gazeOffCount,
      gazeCenterPercent: gazeCenterPct,
    });
  };

  // Quick sample test filler depending on mode
  const fillSampleAnswer = (type: 'logical' | 'evasive') => {
    if (isDebateMode) {
      if (type === 'logical') {
        setCandidateAnswer(
          '상대측 토론자께서 단기 인건비 효율화를 말씀하셨지만, 주니어 채용을 축소할 경우 3~4년 후 사내 도메인 지식을 갖춘 미드레벨 엔지니어층이 공동화되는 치명적인 기술 부채를 초래합니다. 실제로 해외 연구에 따르면 주니어 시절 AI 코드 검증을 훈련받지 못한 개발자들은 아키텍처 결함을 발견하는 능력이 42% 낮았습니다. 따라서 채용 축소가 아닌 AI를 활용하는 주니어 양성 커리큘럼으로의 전환이 필수적입니다.'
        );
      } else {
        setCandidateAnswer(
          '음... 그 말씀도 맞긴 한데요, 약간 좀 급하게 AI를 도입하면 위험할 것 같고 솔직히 개발자들도 불안해하니까요. 이제 차근차근 생각해봐야 하지 않나 싶습니다.'
        );
      }
    } else if (isPTMode) {
      if (type === 'logical') {
        setCandidateAnswer(
          '현 상황 분석 결과, 현재 45,000 TPS 피크 트래픽 발생 시 DB 커넥션 풀이 98% 고갈되는 병목이 핵심입니다. 이를 해결하기 위해 3단계 전략을 제안합니다. 첫째, 주문 접수와 실제 결제 승인을 Kafka 이벤트 기반 비동기 파이프라인으로 디커플링합니다. 둘째, Redis 분산 락과 캐싱 레이어를 적용해 DB 직접 조회를 70% 차단합니다. 셋째, 써킷 브레이커를 두어 외부 PG사 지연 시에도 장바구니 유실 없이 99.99% 가용성을 보장하겠습니다.'
        );
      } else {
        setCandidateAnswer(
          '어... 이번 프로모션에서 서버가 많이 터졌는데 솔직히 서버 인스턴스를 한 3배 정도 늘리면 해결되지 않을까 싶고요. 약간 캐시 같은 것도 붙이고 팀원들이랑 밤새 모니터링하면 잘 막을 수 있을 것 같습니다.'
        );
      }
    } else if (isEnglishMode) {
      if (type === 'logical') {
        setCandidateAnswer(
          'In my previous role, our core objective was optimizing the P99 latency of our distributed settlement pipeline. I identified that synchronous database queries accounted for 78% of the bottleneck. I architected an asynchronous event-driven workflow leveraging Redis and bulk pipelining. As a direct result, average response time dropped from 420ms to 65ms under 25 million daily transactions, reducing infrastructure costs by 30%.'
        );
      } else {
        setCandidateAnswer(
          'Um, honestly, you know, my team worked really hard on this project. Like, there were performance issues, but basically we optimized the framework and, like, users were really happy with the final result.'
        );
      }
    } else {
      if (type === 'logical') {
        setCandidateAnswer(
          '당시 핵심 지표는 P99 레이턴시였습니다. 상황 분석 결과 DB I/O 병목이 78%를 차지하고 있었고, 저는 Redis 기반 인메모리 캐싱과 벌크 쿼리 파이프라이닝을 직접 설계하여 배포했습니다. 그 결과 일간 2,500만 건 트랜잭션 상황에서도 평균 응답 시간을 420ms에서 65ms로 84% 단축시켰으며, 서버 인스턴스 비용을 월 30% 절감했습니다.'
        );
      } else {
        setCandidateAnswer(
          '어... 그 부분은 솔직히 팀원들이랑 같이 회의를 많이 해서 잘 풀었던 것 같고요. 약간 성능 문제가 있었는데 이제 프레임워크 최적화를 진행해서 전반적으로 되게 많이 빨라졌습니다. 사실상 사용자 반응도 좋았습니다.'
        );
      }
    }
  };

  // Timer color code
  const isOptimalTime = elapsedSeconds >= 45 && elapsedSeconds <= 90;
  const isOverTime = elapsedSeconds > 100;

  const previousRound = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Top Session Breadcrumb Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-rose-600 font-bold text-xs flex items-center gap-1.5">
            {isDebateMode ? (
              <>
                <Swords className="w-3.5 h-3.5" />
                <span>토론 면접 ({setup.debateSetup?.assignedStance}측)</span>
              </>
            ) : isPTMode ? (
              <>
                <Presentation className="w-3.5 h-3.5" />
                <span>실전 PT 면접</span>
              </>
            ) : isEnglishMode ? (
              <>
                <Globe2 className="w-3.5 h-3.5" />
                <span>Global English ({setup.englishSetup?.cefrTarget?.split(' ')[0]})</span>
              </>
            ) : (
              <span>
                {setup.pressureLevel === 'extreme' ? '🔥 극한 송곳 압박' : setup.pressureLevel === 'high' ? '⚡ 집중 압박' : '📋 실무 압박'}
              </span>
            )}
          </div>

          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>{setup.company}</span>
              <span className="text-slate-400">·</span>
              <span>{setup.jobRole}</span>
              <span className="text-xs text-slate-400">({setup.careerLevel})</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {isDebateMode ? (
                <span>상대 토론자: {setup.debateSetup?.opponentName} ({setup.debateSetup?.opponentRole})</span>
              ) : isPTMode ? (
                <span>심사위원장: {setup.interviewerPersona.name} {setup.interviewerPersona.title}</span>
              ) : isEnglishMode ? (
                <span>Interviewer: {setup.interviewerPersona.name} ({setup.englishSetup?.accentPreference} Accent)</span>
              ) : (
                <span>면접관: {setup.interviewerPersona.name} {setup.interviewerPersona.title} ({setup.interviewerPersona.style})</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isPTMode && (
            <button
              onClick={() => setShowPTDossier(!showPTDossier)}
              className="px-2.5 py-1.5 rounded text-xs bg-indigo-700 hover:bg-indigo-600 text-white font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              <span>케이스 데이터 시트 {showPTDossier ? '닫기' : '열기'}</span>
            </button>
          )}

          <div className="text-right">
            <span className="text-xs text-slate-400 block">진행 단계</span>
            <span className="text-sm font-mono font-bold text-rose-400">
              Round {currentRoundNumber} / {maxRounds}
            </span>
          </div>

          <button
            onClick={onFinishInterviewEarly}
            className="px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            면접 종료 및 리포트 보기
          </button>
        </div>
      </div>

      {/* PT Mode Floating Data Sheet Panel */}
      {isPTMode && showPTDossier && setup.ptSetup && (
        <div className="p-4 rounded-xl bg-indigo-950/80 border border-indigo-700 text-white text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300">
              📋 [과제 데이터 시트] {setup.ptSetup.caseTitle}
            </span>
            <span className="text-slate-400 text-[11px]">발표 중 자유롭게 인용하세요</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {setup.ptSetup.backgroundBriefing}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {setup.ptSetup.dataPoints.map((dp, i) => (
              <div key={i} className="p-2 rounded bg-slate-900/80 border border-indigo-900">
                <span className="text-[10px] text-slate-400 block truncate">{dp.label}</span>
                <span className="text-xs font-bold text-indigo-200 font-mono">{dp.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Dual Stage Split: Left AI Interviewer / Opponent, Right Candidate Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: AI Interviewer / Debate Opponent Persona Stage */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
          {/* Subtle background ambient pulse */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-rose-950/40 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            {/* Interviewer Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-lg text-white shadow-md">
                  {isDebateMode ? 'VS' : setup.interviewerPersona.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">
                      {isDebateMode ? setup.debateSetup?.opponentName : setup.interviewerPersona.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isDebateMode ? setup.debateSetup?.opponentRole : setup.interviewerPersona.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isDebateMode ? `반대 입장 견지: ${setup.debateSetup?.assignedStance === '찬성' ? '반대측' : '찬성측'} 대표` : setup.interviewerPersona.pressureStyle}
                  </div>
                </div>
              </div>

              {/* TTS Audio Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTTSReplay}
                  className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                    isSpeakingTTS
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isSpeakingTTS ? '음성 중지' : '다시 듣기'}
                >
                  {isSpeakingTTS ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attitude / Body Language Reaction Callout */}
            {interviewerAttitude && (
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
                <span className="text-rose-400 font-semibold shrink-0">
                  {isDebateMode ? '상대 토론자 태도:' : isEnglishMode ? 'Interviewer Attitude:' : '면접관 반응:'}
                </span>
                <span className="italic">{interviewerAttitude}</span>
              </div>
            )}

            {/* Current Question / Counter-Rebuttal Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-rose-400 font-bold">
                  {isDebateMode
                    ? currentRoundNumber === 1
                      ? '상대측 기조 발언 & 쟁점 제기'
                      : '⚔️ 상대측 논점 공략 & 재반박'
                    : isPTMode
                    ? currentRoundNumber === 1
                      ? '3분 PT 발표 요청'
                      : '📊 심사위원 질의응답 (맹점 파고들기)'
                    : isEnglishMode
                    ? `Global Probing Question 0${currentRoundNumber}`
                    : currentRoundNumber === 1
                    ? '핵심 역량 검증 질문'
                    : '⚡ 심층 압박 꼬리 질문'}
                </span>
                <span className="tabular-nums">권장 발언: {recommendedTimeSec}초</span>
              </div>
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-sans">
                {currentQuestion}
              </p>
            </div>

            {/* Question Intent & Keywords */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                <span className="font-medium">{isEnglishMode ? 'Evaluation Focus:' : '평가 의도:'}</span>
                <span>{currentIntent}</span>
              </div>
              {focusKeywords && focusKeywords.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                  <span className="text-slate-500">{isEnglishMode ? 'Key Competencies:' : '핵심 검증 지표:'}</span>
                  {focusKeywords.map((kw, i) => (
                    <span key={i} className="text-slate-300 font-mono">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Previous Round Quick STAR Summary pill */}
          {previousRound?.evaluation && (
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span>{isDebateMode ? '직전 반론 점수:' : isEnglishMode ? 'Previous Round Score:' : '직전 답변 STAR 종합:'}</span>
              <span className="font-mono text-emerald-400 font-bold">
                {previousRound.evaluation.overallScore}점
              </span>
              <button
                onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
                className="text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isEnglishMode ? 'View Feedback' : '직전 피드백 보기'}</span>
                {showHistoryDrawer ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Right: Candidate Camera & Optical Gaze HUD */}
        <div className="space-y-4 flex flex-col justify-between">
          <WebcamTracker
            isActive={true}
            onGazeUpdate={(telemetry) => {
              setGazeCenterPct(telemetry.centerPercent);
              setGazeStatus(telemetry.gazeStatus);
            }}
            onGazeOffEvent={() => {
              setGazeOffCount((prev) => prev + 1);
            }}
          />

          {/* Real-time telemetry summary strip */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">
                {isEnglishMode ? 'Eye Contact' : '정면 주시율'}
              </span>
              <span className={`font-bold font-mono text-sm ${gazeCenterPct < 75 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {gazeCenterPct}%
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">
                {isEnglishMode ? 'Gaze Shifts' : '시선 이탈 횟수'}
              </span>
              <span className={`font-bold font-mono text-sm ${gazeOffCount > 3 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {gazeOffCount}회
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block text-[11px]">
                {isEnglishMode ? 'Fillers (um/like)' : '말버릇 감지'}
              </span>
              <span className={`font-bold font-mono text-sm ${fillerAnalysis.totalCount > 4 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {fillerAnalysis.totalCount}회
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Answer & Speech Input Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Answering Timer & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{isEnglishMode ? 'Response Time:' : '답변 시간:'}</span>
              <span className={`font-mono text-sm font-bold ${isOverTime ? 'text-rose-500' : isOptimalTime ? 'text-emerald-500' : 'text-amber-500'}`}>
                {Math.floor(elapsedSeconds / 60)}분 {elapsedSeconds % 60}초
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {isOptimalTime ? '● 적정 답변 분량입니다.' : isOverTime ? '▲ 답변이 장황해지고 있습니다. 결론을 맺으세요.' : '○ 핵심 근거와 대안을 간결하게 제시하세요.'}
            </div>
          </div>

          {/* Quick preset buttons for instant testing */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">테스트용 예시:</span>
            <button
              onClick={() => fillSampleAnswer('logical')}
              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isDebateMode ? '논리적 반론 예시' : isPTMode ? '구조화된 PT 발표 예시' : isEnglishMode ? 'Structured English Answer' : '논리적 답변 (수치 포함)'}
            </button>
            <button
              onClick={() => fillSampleAnswer('evasive')}
              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isEnglishMode ? 'Filler-heavy Answer' : '모호한 답변 (말버릇 포함)'}
            </button>
          </div>
        </div>

        {/* Live Detected Fillers Tag Strip */}
        {fillerAnalysis.totalCount > 0 && (
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">
              {isEnglishMode ? 'Detected Fillers:' : '실시간 감지된 말버릇:'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(fillerAnalysis.detectedMap).map(([word, count]) => (
                <span key={word} className="px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 font-mono text-[11px]">
                  "{word}" ({count}회)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Textarea with Mic Button */}
        <div className="relative">
          <textarea
            value={candidateAnswer}
            onChange={(e) => setCandidateAnswer(e.target.value)}
            disabled={isLoadingNext}
            rows={5}
            placeholder={
              isDebateMode
                ? '마이크로 발언하거나 텍스트를 입력하세요. 상대방의 논리적 허점을 짚고 구체적 근거와 대안을 제시하여 반박하십시오.'
                : isPTMode
                ? '프레젠테이션 발표 내용을 말씀하세요. 문제 정의 ➔ 원인 분석 ➔ 해결 전략 ➔ 정량적 기대효과 순으로 구조화하면 높은 점수를 받습니다.'
                : isEnglishMode
                ? 'Speak in English via microphone or type your response. Structure with STAR and quantify metrics for maximum impact.'
                : '마이크 버튼을 눌러 음성으로 답변하거나 직접 텍스트를 입력하세요. 상황(S), 과제(T), 실행한 구체적 액션(A), 정량적 수치 결과(R)를 포함하면 효과적으로 방어할 수 있습니다.'
            }
            className="w-full p-4 pr-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 leading-relaxed resize-none"
          />

          {/* Floating Mic Button inside textarea */}
          <button
            onClick={toggleRecording}
            disabled={isLoadingNext}
            className={`absolute bottom-3 right-3 p-3 rounded-full transition-all shadow-md cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
            title={isRecording ? '녹음 중지' : isEnglishMode ? 'Start English Speech STT' : '음성 STT 시작'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Submit Action Row */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            {isRecording && (
              <span className="text-rose-500 font-semibold flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {isEnglishMode ? 'Listening in English... Turn off mic when finished.' : '음성 듣는 중... 말씀이 끝나면 마이크를 끄고 제출하세요.'}
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoadingNext || !candidateAnswer.trim()}
            className="py-3 px-6 rounded-lg font-bold text-xs sm:text-sm text-white bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md cursor-pointer"
          >
            {isLoadingNext ? (
              <span>
                {isDebateMode ? '상대 토론자가 재반박을 준비하는 중...' : isPTMode ? '심사위원단이 취약점을 파고드는 중...' : '답변의 모순점을 파고드는 중...'}
              </span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {isDebateMode ? '반론 제출 (상대 재반박 받기)' : isPTMode ? '발표/답변 제출 (심사위원 질문 받기)' : isEnglishMode ? 'Submit Answer' : '답변 제출 (꼬리 질문 받기)'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Drawer for Previous Round Feedback */}
      {previousRound?.evaluation && (
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <FileCheck className="w-4 h-4 text-rose-500" />
              <span>직전 라운드 (Round {previousRound.roundNumber}) 심층 분석 리포트</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
              종합 {previousRound.evaluation.overallScore}점
            </span>
          </div>

          {/* STAR 4-factor scores */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Situation (상황/논점)</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {previousRound.evaluation.starScores.situation}점
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Task (핵심 쟁점)</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {previousRound.evaluation.starScores.task}점
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Action (본인 논증/실행)</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {previousRound.evaluation.starScores.action}점
              </span>
            </div>
            <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Result (근거/파급효과)</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {previousRound.evaluation.starScores.result}점
              </span>
            </div>
          </div>

          {/* English Grammar & Phrasing Fixes if in English mode */}
          {isEnglishMode && previousRound.evaluation.englishGrammarFixes && previousRound.evaluation.englishGrammarFixes.length > 0 && (
            <div className="p-3.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 text-xs space-y-2">
              <span className="font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" />
                <span>Instant Grammar & Natural Business Phrasing Fixes:</span>
              </span>
              <div className="space-y-1.5">
                {previousRound.evaluation.englishGrammarFixes.map((fix, i) => (
                  <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-900/40">
                    <div className="text-rose-500 line-through text-[11px]">"{fix.original}"</div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">➔ "{fix.improved}"</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{fix.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses and Tail Question Reason */}
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
              <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                {isDebateMode ? '상대측 재반박 촉발 요인:' : '꼬리 질문 발동 요인:'} ({previousRound.evaluation.tailQuestionType})
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                {previousRound.evaluation.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
              <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                {isDebateMode ? '권장되는 모범 반박 전략:' : '면접관이 권장하는 모범 답변 개선안:'}
              </span>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                {previousRound.evaluation.recommendedModelAnswerGuide}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
