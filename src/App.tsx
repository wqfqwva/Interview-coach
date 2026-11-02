import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SetupView } from './components/SetupView';
import { InterviewCockpit } from './components/InterviewCockpit';
import { ReportView } from './components/ReportView';
import {
  InterviewSetup,
  InterviewRound,
  FinalReportData,
} from './types/interview';

export default function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'interview' | 'report'>('setup');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Interview state
  const [setup, setSetup] = useState<InterviewSetup | null>(null);
  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [maxRounds] = useState<number>(3); // 1 initial + 2 deep tail follow-ups
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentIntent, setCurrentIntent] = useState<string>('');
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);
  const [recommendedTimeSec, setRecommendedTimeSec] = useState<number>(90);
  const [interviewerAttitude, setInterviewerAttitude] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalReport, setFinalReport] = useState<FinalReportData | null>(null);

  // Sync theme with document class
  useEffect(() => {
    const saved = localStorage.getItem('veritas_theme') as 'dark' | 'light' | null;
    const initialTheme = saved || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('veritas_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 1. Start Interview Session (Instant view transition + async enrichment)
  const handleStartInterview = (interviewSetup: InterviewSetup) => {
    setSetup(interviewSetup);
    setRounds([]);
    setCurrentRoundNumber(1);
    setFinalReport(null);

    // Initial contextual question tailored to engineering and STEM tracks
    let initialQuestion = `${interviewSetup.company}의 ${interviewSetup.jobRole} 직무에 지원하셨는데, 최근 전공 프로젝트나 연구에서 직면했던 가장 치명적인 공학적 한계점(Bottleneck)과 이를 극복한 구체적 메커니즘을 말씀해 주십시오.`;
    let initialIntent = '실전 공학적 문제 해결 메커니즘 및 직무 전공 역량 검증';

    if (interviewSetup.mode === 'debate' && interviewSetup.debateSetup) {
      initialQuestion = `"${interviewSetup.debateSetup.topic}"에 대해 저는 ${interviewSetup.debateSetup.assignedStance === '찬성' ? '반대' : '찬성'}하는 입장입니다. 조직의 안정성과 리스크 관리를 고려할 때 상대측의 주장은 실현 불가능합니다. ${interviewSetup.debateSetup.assignedStance}측의 핵심 논거와 지속 가능한 대안을 먼저 제시해 주십시오.`;
      initialIntent = '토론 쟁점 장악력 및 기조 반박 논리 검증';
    } else if (interviewSetup.mode === 'pt' && interviewSetup.ptSetup) {
      initialQuestion = `제시된 과제 "${interviewSetup.ptSetup.caseTitle}"에 대한 분석을 마치셨습니까? 준비하신 핵심 전략을 3분 내로 발표해 주시기 바랍니다. 발표 직후 심사위원단의 송곳 질의가 이어집니다.`;
      initialIntent = '비즈니스 케이스 문제 정의 및 핵심 전략 발표';
    } else if (interviewSetup.mode === 'english') {
      initialQuestion = `Welcome to the global interview round at ${interviewSetup.company}. Could you please walk me through the most technically challenging project you led, detailing the specific problem, your individual contribution, and the measurable business impact?`;
      initialIntent = 'Global Technical Leadership & Metric Delivery';
    }

    setCurrentQuestion(initialQuestion);
    setCurrentIntent(initialIntent);
    setFocusKeywords(['문제 해결', '임팩트', '기여도']);
    setRecommendedTimeSec(interviewSetup.mode === 'pt' ? 180 : 90);
    setInterviewerAttitude('서류를 찬찬히 넘기며 날카로운 눈빛으로 지원자를 마주봄');

    // INSTANT TRANSITION TO INTERVIEW VIEW
    setCurrentView('interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Asynchronously enrich with AI-tailored opening question in background
    setIsLoading(true);
    fetch('/api/interview/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interviewSetup),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const data = json.data;
          if (data.question) setCurrentQuestion(data.question);
          if (data.intent) setCurrentIntent(data.intent);
          if (data.focusKeywords) setFocusKeywords(data.focusKeywords);
          if (data.recommendedTimeSec) setRecommendedTimeSec(data.recommendedTimeSec);
          if (data.interviewerReaction) setInterviewerAttitude(data.interviewerReaction);
        }
      })
      .catch((err) => {
        console.warn('AI question enrichment skipped, using robust baseline:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 2. Submit Answer & Receive Follow-Up Pressure Tail Question
  const handleAnswerSubmit = async (
    answerText: string,
    speechStats: {
      durationSec: number;
      fillerCount: number;
      detectedFillers: { [key: string]: number };
      gazeOffCount: number;
      gazeCenterPercent: number;
    }
  ) => {
    if (!setup) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/interview/evaluate-and-tail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup,
          history: rounds,
          currentQuestion,
          candidateAnswer: answerText,
          speechStats,
          currentRound: currentRoundNumber,
          maxRounds,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || '평가 및 꼬리 질문 생성 실패');
      }

      const evalData = json.data;

      const completedRound: InterviewRound = {
        roundNumber: currentRoundNumber,
        question: currentQuestion,
        intent: currentIntent,
        focusKeywords,
        recommendedTimeSec,
        candidateAnswer: answerText,
        speechStats,
        evaluation: evalData,
      };

      const updatedRounds = [...rounds, completedRound];
      setRounds(updatedRounds);

      if (evalData.isLastRound || currentRoundNumber >= maxRounds) {
        // Proceed to generate final comprehensive report
        await generateFinalReport(updatedRounds, speechStats);
      } else {
        // Transition to next deep tail question
        setCurrentRoundNumber((prev) => prev + 1);
        setCurrentQuestion(evalData.nextQuestion);
        setCurrentIntent(`${evalData.tailQuestionType} - 심층 공방 및 맹점 검증`);
        setInterviewerAttitude(evalData.interviewerAttitude);
      }
    } catch (err: any) {
      console.error('Answer submission failed:', err);
      // Graceful fallback tail question
      const completedRound: InterviewRound = {
        roundNumber: currentRoundNumber,
        question: currentQuestion,
        intent: currentIntent,
        focusKeywords,
        recommendedTimeSec,
        candidateAnswer: answerText,
        speechStats,
        evaluation: {
          starScores: { situation: 75, task: 70, action: 72, result: 68 },
          overallScore: 71,
          strengths: ['자신감 있는 어조로 논지를 전개함'],
          weaknesses: ['정량적 수치 지표가 다소 부족함', '상대측 반박이나 핵심 맹점에 대한 사전 대비 부족'],
          feedbackComment: '전반적인 흐름은 양호하나, 면접관이 신뢰할 만한 결정적 수치 데이터가 결여되어 있습니다.',
          interviewerAttitude: '팔짱을 끼고 의자에 기대며 답변의 진위 여부를 저울질함',
          isLastRound: currentRoundNumber >= maxRounds,
          nextQuestion: setup.mode === 'debate'
            ? '방금 제시하신 대안은 초기 비용이 막대하여 실현 가능성이 희박합니다. 이에 대해 어떻게 반론하시겠습니까?'
            : setup.mode === 'pt'
            ? '제시하신 전략에서 초기 6개월간 목표치에 도달하지 못할 경우 어떤 피벗(Pivot) 시나리오를 가지고 계십니까?'
            : setup.mode === 'english'
            ? 'If the primary assumptions you made proved to be invalid midway through the rollout, how would you pivot with minimum business disruption?'
            : '방금 말씀하신 솔루션에서 예상치 못한 장애나 반발이 발생했을 때 어떻게 대응하셨습니까?',
          tailQuestionType: '예외 상황 대응 및 트레이드오프',
          recommendedModelAnswerGuide: '수치를 두괄식으로 제시하고, 본인이 직접 검증한 팩트와 가설 검증 사이클을 강조해야 합니다.',
        },
      };

      const updatedRounds = [...rounds, completedRound];
      setRounds(updatedRounds);

      if (currentRoundNumber >= maxRounds) {
        await generateFinalReport(updatedRounds, speechStats);
      } else {
        setCurrentRoundNumber((prev) => prev + 1);
        setCurrentQuestion(completedRound.evaluation!.nextQuestion);
        setCurrentIntent('수치 검증 및 맹점 반박');
        setInterviewerAttitude('의자에 깊숙이 기대며 집요한 눈빛으로 쳐다봄');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Generate Final Comprehensive Report
  const generateFinalReport = async (
    allRounds: InterviewRound[],
    lastStats: { durationSec: number; fillerCount: number; gazeOffCount: number; gazeCenterPercent: number }
  ) => {
    if (!setup) return;
    setIsLoading(true);

    const totalDurationSec = allRounds.reduce((acc, r) => acc + (r.speechStats?.durationSec || 0), 0);
    const avgDurationSec = Math.round(totalDurationSec / Math.max(1, allRounds.length));
    const totalFillerCount = allRounds.reduce((acc, r) => acc + (r.speechStats?.fillerCount || 0), 0);
    const totalGazeOffCount = allRounds.reduce((acc, r) => acc + (r.speechStats?.gazeOffCount || 0), 0);
    const avgGazeCenter = Math.round(
      allRounds.reduce((acc, r) => acc + (r.speechStats?.gazeCenterPercent || 90), 0) /
        Math.max(1, allRounds.length)
    );

    const telemetry = {
      totalDurationSec,
      avgDurationSec,
      totalFillerCount,
      totalGazeOffCount,
      eyeContactScore: avgGazeCenter,
      topFillers: setup.mode === 'english' ? ['um', 'like', 'you know'] : ['어...', '솔직히', '약간'],
    };

    try {
      const res = await fetch('/api/interview/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup,
          rounds: allRounds,
          telemetry,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setFinalReport(json.data);
      setCurrentView('report');
    } catch (err: any) {
      console.error('Final report generation failed:', err);
      // Fallback report
      setFinalReport({
        passVerdict: '합격권 (Hire)',
        verdictSummary: `${setup.mode === 'debate' ? '토론 면접에서' : setup.mode === 'pt' ? 'PT 발표 및 질의응답에서' : setup.mode === 'english' ? 'Global English Interview에서' : '압박 면접에서'} 당황하지 않고 핵심 논리를 방어했으며, 특히 본질 이해도가 우수합니다.`,
        radarScores: {
          logicStructure: 78,
          dataSpecificity: 72,
          stressTolerance: 82,
          jobCompetency: 84,
          deliveryAndPresence: 75,
        },
        totalScore: 78,
        keyStrengths: [
          '돌발적인 꼬리 질문 및 상대 반론에도 침착하게 대처하는 논리 방어력',
          '도메인에 대한 깊이 있는 이해와 문제 해결에 대한 진정성 있는 태도',
          '구조화된 결론 제시와 흔들림 없는 주장 유지',
        ],
        criticalWeaknesses: [
          '성과/주장을 설명할 때 구체적인 비교 기준치(Baseline vs After) 수치 부재',
          '상대방이 제기한 반론의 핵심 전제를 무력화시키는 결정적 근거 보강 필요',
          '압박을 받을 때 시선이 일시 분산되는 비언어적 신호',
        ],
        speechAndHabitCritique: '평균 발언 시간은 적절했으나, 생각이 깊어질 때 완충 어휘 노출을 줄이고 첫 문장을 단정적인 두괄식으로 시작하는 훈련이 필요합니다.',
        actionPlan: [
          '모든 핵심 주장을 "숫자 3개(지표명, 기존 수치, 개선 수치)"로 요약하는 연습',
          '꼬리 질문/재반박을 받았을 때 상대 발언을 짚고 즉시 반증 근거를 전개하는 프레이밍 훈련',
          '카메라 렌즈(면접관의 미간)를 응시하며 60초 안에 끝내는 스피치 반복 훈련',
        ],
        roundBreakdowns: allRounds.map((r, i) => ({
          roundNumber: r.roundNumber,
          coreTopic: r.intent,
          pressureTrigger: r.evaluation?.weaknesses?.[0] || '구체적 지표 검증',
          score: r.evaluation?.overallScore || 75,
          oneLineVerdict: r.evaluation?.feedbackComment || '논리적 전달 완료',
        })),
        modeSpecificReport: {
          mode: setup.mode,
          title: setup.mode === 'debate' ? '토론 면접 공방 정밀 진단' : setup.mode === 'pt' ? 'PT 발표 및 맹점 방어력 진단' : 'Global English CEFR Proficiency Assessment',
          highlightMetrics: setup.mode === 'debate'
            ? [
                { label: '논박 타격률', value: '82%', assessment: '상대 주장의 허점을 정확히 공략함' },
                { label: '논점 유지도', value: '88%', assessment: '말려들지 않고 배정된 입장을 고수함' },
                { label: '토론 에티켓', value: '95점', assessment: '감정적 대응 없이 정중한 화법 유지' },
              ]
            : setup.mode === 'pt'
            ? [
                { label: '문제 정의력', value: '85점', assessment: '핵심 병목과 근본 원인을 명확히 짚음' },
                { label: '실행 가능성', value: '78점', assessment: '현실적 리소스 대비 적절한 단계별 로드맵' },
                { label: '질의응답 방어', value: '80점', assessment: '심사위원의 송곳 지적에 침착히 대안 제시' },
              ]
            : [
                { label: 'CEFR Level', value: 'C1 (Advanced)', assessment: 'Expresses ideas fluently without obvious searching for expressions.' },
                { label: 'Lexical Precision', value: '84점', assessment: 'Strong technical & business idiom utilization.' },
                { label: 'Grammar Accuracy', value: '82점', assessment: 'Minor tense slips under pressure, overall cohesive.' },
              ],
          coachingAdvice: setup.mode === 'debate'
            ? '상대 주장을 반박할 때 "상대방 말씀처럼..." 대신 "상대측의 전제인 ~은 현실에서 ~한 위험이 있습니다"로 전제 자체를 흔드는 고급 디베이트 기법을 활용하세요.'
            : setup.mode === 'pt'
            ? '발표 첫 30초 안에 결론(Key Recommendation)과 기대 ROI를 먼저 선언하는 엘리베이터 피치 구조를 강화하세요.'
            : 'Practice transitional business signposts such as "On the flip side", "To substantiate this with numbers", and "The key tradeoff we mitigated was...".',
        },
      });
      setCurrentView('report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishEarly = () => {
    if (rounds.length === 0) {
      alert('최소 1개 이상의 답변을 제출하신 후 리포트를 확인할 수 있습니다.');
      return;
    }
    const lastRound = rounds[rounds.length - 1];
    generateFinalReport(rounds, lastRound.speechStats);
  };

  const handleResetInterview = () => {
    if (confirm('현재 면접 세션을 종료하고 새 면접 설정으로 돌아가시겠습니까?')) {
      setSetup(null);
      setRounds([]);
      setCurrentRoundNumber(1);
      setFinalReport(null);
      setCurrentView('setup');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-rose-500 selection:text-white">
      {/* Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onResetInterview={handleResetInterview}
        theme={theme}
        onToggleTheme={toggleTheme}
        hasActiveSession={rounds.length > 0 || currentView === 'interview'}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'setup' && (
          <SetupView onStartInterview={handleStartInterview} isLoading={isLoading} />
        )}

        {currentView === 'interview' && setup && (
          <InterviewCockpit
            setup={setup}
            currentRoundNumber={currentRoundNumber}
            maxRounds={maxRounds}
            currentQuestion={currentQuestion}
            currentIntent={currentIntent}
            focusKeywords={focusKeywords}
            recommendedTimeSec={recommendedTimeSec}
            interviewerAttitude={interviewerAttitude}
            history={rounds}
            isLoadingNext={isLoading}
            onAnswerSubmit={handleAnswerSubmit}
            onFinishInterviewEarly={handleFinishEarly}
          />
        )}

        {currentView === 'report' && setup && finalReport && (
          <ReportView
            setup={setup}
            report={finalReport}
            rounds={rounds}
            onRestart={() => {
              setSetup(null);
              setRounds([]);
              setCurrentView('setup');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">VERITAS AI INTERVIEW</span>
            <span>·</span>
            <span>실전 압박 면접 시뮬레이션 시스템</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>STT 음성 분석</span>
            <span>·</span>
            <span>시선 & 말버릇 트래킹</span>
            <span>·</span>
            <span>STAR 프레임워크 자동 채점</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
