import React, { useState } from 'react';
import { FinalReportData, InterviewSetup, InterviewRound } from '../types/interview';
import {
  Award,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  MessageSquare,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Swords,
  Presentation,
  Globe2,
  Sparkles,
} from 'lucide-react';

interface ReportViewProps {
  setup: InterviewSetup;
  report: FinalReportData;
  rounds: InterviewRound[];
  onRestart: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  setup,
  report,
  rounds,
  onRestart,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  const isDebate = setup.mode === 'debate';
  const isPT = setup.mode === 'pt';
  const isEnglish = setup.mode === 'english';

  const getVerdictStyle = (verdict: string) => {
    if (verdict.includes('Strong Hire') || verdict.includes('합격 유력')) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        badge: 'bg-emerald-600 text-white',
        icon: CheckCircle2,
      };
    }
    if (verdict.includes('Hire') || verdict.includes('합격권')) {
      return {
        bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
        badge: 'bg-sky-600 text-white',
        icon: CheckCircle2,
      };
    }
    if (verdict.includes('Borderline') || verdict.includes('보류')) {
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        badge: 'bg-amber-600 text-white',
        icon: AlertOctagon,
      };
    }
    return {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
      badge: 'bg-rose-600 text-white',
      icon: XCircle,
    };
  };

  const style = getVerdictStyle(report.passVerdict);
  const VerdictIcon = style.icon;

  const handleCopyReport = () => {
    const text = `[VERITAS AI 면접 결과 리포트]
- 면접 형식: ${isDebate ? '토론 면접' : isPT ? 'PT 면접' : isEnglish ? '글로벌 영어 면접' : '일반 압박 면접'}
- 지원 기업: ${setup.company} (${setup.jobRole}, ${setup.careerLevel})
- 판정 결과: ${report.passVerdict} (총점: ${report.totalScore}점)
- 심사 총평: ${report.verdictSummary}

[5대 역량 점수]
1. 논리적 구성 및 체계: ${report.radarScores.logicStructure}점
2. 구체성 및 수치 검증: ${report.radarScores.dataSpecificity}점
3. 압박 대처력: ${report.radarScores.stressTolerance}점
4. 직무 전문성: ${report.radarScores.jobCompetency}점
5. 전달력 및 태도/시선: ${report.radarScores.deliveryAndPresence}점

[핵심 강점]
${report.keyStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

[보완 필요 치명적 약점]
${report.criticalWeaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

[개선 액션 플랜]
${report.actionPlan.map((a, i) => `STEP ${i + 1}: ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate totals from rounds
  const totalFillers = rounds.reduce((acc, r) => acc + (r.speechStats?.fillerCount || 0), 0);
  const avgGazeCenter = Math.round(
    rounds.reduce((acc, r) => acc + (r.speechStats?.gazeCenterPercent || 90), 0) /
      Math.max(1, rounds.length)
  );
  const totalGazeOffs = rounds.reduce((acc, r) => acc + (r.speechStats?.gazeOffCount || 0), 0);
  const avgDurationSec = Math.round(
    rounds.reduce((acc, r) => acc + (r.speechStats?.durationSec || 60), 0) /
      Math.max(1, rounds.length)
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Top Header Card */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${style.bg} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${style.badge}`}>
              <VerdictIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black">{report.passVerdict}</span>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-black/10 dark:bg-white/10">
                  종합 {report.totalScore}점
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-semibold bg-black/10 dark:bg-white/10">
                  {isDebate ? '⚔️ 토론 면접' : isPT ? '📊 PT 면접' : isEnglish ? '🌐 영어 면접' : '💼 압박 면접'}
                </span>
              </div>
              <p className="text-xs sm:text-sm mt-0.5 opacity-90">
                {setup.company} {setup.jobRole} ({setup.careerLevel}) 심층 채용 평가
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '결과 복사하기'}</span>
            </button>
            <button
              onClick={onRestart}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>새 면접 시작</span>
            </button>
          </div>
        </div>

        {/* Executive Verdict Summary */}
        <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-black/5 dark:border-white/5">
          <span className="text-xs font-bold block mb-1">채용위원회 최종 한줄 총평</span>
          <p className="text-sm font-medium leading-relaxed">{report.verdictSummary}</p>
        </div>
      </div>

      {/* Mode-Specific Highlight Card */}
      {report.modeSpecificReport && (
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
              {isDebate ? <Swords className="w-4 h-4" /> : isPT ? <Presentation className="w-4 h-4" /> : <Globe2 className="w-4 h-4" />}
              <span>{report.modeSpecificReport.title}</span>
            </div>
            <span className="text-xs text-slate-400">특수 형식 정밀 진단</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {report.modeSpecificReport.highlightMetrics.map((hm, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-xs text-slate-400 block">{hm.label}</span>
                <span className="text-base font-bold text-white font-mono">{hm.value}</span>
                <p className="text-[11px] text-slate-300 leading-tight">{hm.assessment}</p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-semibold text-rose-400 block mb-0.5">전문 심사위원 어드바이스:</span>
            <p className="text-[11px] leading-relaxed">{report.modeSpecificReport.coachingAdvice}</p>
          </div>
        </div>
      )}

      {/* 5 Core Competency Bar Chart Grid */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <h2>5대 핵심 역량 정밀 진단</h2>
          </div>
          <span className="text-xs text-slate-400">100점 만점 기준</span>
        </div>

        <div className="space-y-3.5 pt-2">
          {[
            {
              name: isDebate ? '논점 장악력 및 논리 체계 (Claim & Structure)' : isPT ? '문제 정의력 및 슬라이드 구조화' : '논리적 구성 및 체계 (Structure & Coherence)',
              score: report.radarScores.logicStructure,
              color: 'bg-indigo-500',
            },
            {
              name: isDebate ? '근거 데이터 및 사실 기반 설득력' : isPT ? '수치 기반 ROI 및 시장 지표 검증' : '정량적 구체성 및 수치화 검증 (Data Specificity)',
              score: report.radarScores.dataSpecificity,
              color: 'bg-emerald-500',
            },
            {
              name: isDebate ? '상대측 재반박 공방 대응력' : isPT ? '심사위원 맹점 송곳 질문 방어력' : '압박 대처력 및 유연성 (Stress Resilience)',
              score: report.radarScores.stressTolerance,
              color: 'bg-rose-500',
            },
            {
              name: isDebate ? '사안 본질 이해 및 전략적 통찰' : isPT ? '전략 실행 가능성 및 리스크 관리' : '직무 전문성 및 도메인 지식 (Domain Mastery)',
              score: report.radarScores.jobCompetency,
              color: 'bg-sky-500',
            },
            {
              name: isEnglish ? 'Global Fluency, Lexical Resource & Pronunciation' : '전달력 및 비언어적 안정도 (시선, 말버릇)',
              score: report.radarScores.deliveryAndPresence,
              color: 'bg-amber-500',
            },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {item.score}점
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-700`}
                  style={{ width: `${Math.min(100, Math.max(5, item.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Verbal Telemetry & Speech Habits Audit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <Eye className="w-4 h-4 text-sky-500" />
            <span>시선 처리 분석</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {avgGazeCenter}%
            </span>
            <span className="text-xs text-slate-500">평균 정면 주시율</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            시선 이탈 총 {totalGazeOffs}회 감지. {totalGazeOffs > 4 ? '압박 질문 시 아래나 옆을 보는 경향이 있습니다.' : '안정적인 아이컨택을 유지했습니다.'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>말버릇 (Filler Words)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {totalFillers}회
            </span>
            <span className="text-xs text-slate-500">불필요 추임새</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {totalFillers > 5 ? (isEnglish ? 'Reduce words like "um", "like" to project executive presence.' : '"어...", "약간", "솔직히" 등의 습관적 어휘 절제가 필요합니다.') : '군더더기 없는 절제된 어휘 전달력을 보였습니다.'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-xs">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>평균 발언 페이싱</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {avgDurationSec}초
            </span>
            <span className="text-xs text-slate-500">문항당 소요</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {isPT ? 'PT 발표 및 질의응답 대응 적정성' : '권장 페이싱 60~90초 기준 준수'}
          </p>
        </div>
      </div>

      {/* Professional Speech & Habit Critique */}
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-rose-500" />
          <span>전문 면접관의 발화 및 태도 코칭</span>
        </span>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
          {report.speechAndHabitCritique}
        </p>
      </div>

      {/* Strengths & Critical Vulnerabilities Dual Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Strengths */}
        <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h3>면접관의 인정을 받은 핵심 강점</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {report.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Weaknesses */}
        <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <AlertOctagon className="w-4 h-4" />
            <h3>반드시 보완해야 할 치명적 맹점</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {report.criticalWeaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3-Step Action Plan */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
          <Award className="w-4 h-4" />
          <h3>실전 최종 합격을 위한 3단계 즉각 실행 플랜</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {report.actionPlan.map((action, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 font-mono font-bold text-[10px]">
                ACTION 0{idx + 1}
              </span>
              <p className="text-slate-300 leading-relaxed">{action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forensic Round-by-Round Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <FileSpreadsheet className="w-4 h-4 text-rose-500" />
          <h2>문항별 상세 포렌식 기록 (질문 ➔ 답변 ➔ 꼬리 질문 유발 요인)</h2>
        </div>

        <div className="space-y-3">
          {rounds.map((round) => {
            const isExpanded = expandedRound === round.roundNumber;
            return (
              <div
                key={round.roundNumber}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden text-xs"
              >
                <button
                  onClick={() => setExpandedRound(isExpanded ? null : round.roundNumber)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                        Round 0{round.roundNumber}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {round.question}
                      </span>
                    </div>
                    {round.evaluation && (
                      <p className="text-slate-500 text-[11px] line-clamp-1">
                        {isDebate ? '재반박 촉발 요인:' : '꼬리질문 요인:'} {round.evaluation.weaknesses?.[0] || '논리 검증'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {round.evaluation && (
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {round.evaluation.overallScore}점
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">지원자의 제출 발언:</span>
                      <p className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed">
                        {round.candidateAnswer}
                      </p>
                    </div>

                    {round.evaluation && (
                      <>
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                          <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                            지적된 취약점 & 후속 반격 요인:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                            {round.evaluation.weaknesses.map((w, idx) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                            권장 모범 발언/반박 개선안:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                            {round.evaluation.recommendedModelAnswerGuide}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
