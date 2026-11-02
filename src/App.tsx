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
import { evaluateAnswerDynamically, generateReportDynamically } from './utils/dynamicEvaluator';

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
      console.warn('Backend evaluation call failed or offline, computing dynamic evaluation:', err);
      const evalData = evaluateAnswerDynamically(
        setup,
        answerText,
        currentQuestion,
        speechStats,
        currentRoundNumber,
        maxRounds
      );

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
        await generateFinalReport(updatedRounds, speechStats);
      } else {
        setCurrentRoundNumber((prev) => prev + 1);
        setCurrentQuestion(evalData.nextQuestion);
        setCurrentIntent(`${evalData.tailQuestionType} - 심층 공방 및 맹점 검증`);
        setInterviewerAttitude(evalData.interviewerAttitude);
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
      console.warn('Final report generation failed or offline, computing dynamic debrief:', err);
      const dynamicReport = generateReportDynamically(setup, allRounds, telemetry);
      setFinalReport(dynamicReport);
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
