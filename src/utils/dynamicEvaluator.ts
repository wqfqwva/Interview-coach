import {
  InterviewSetup,
  RoundEvaluation,
  FinalReportData,
  InterviewRound,
} from '../types/interview';

// Extract significant technical or topical nouns from candidate answer
export function extractKeyTerms(text: string): string[] {
  const words = text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'“”]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  const stopWords = new Set([
    '어...', '음...', '그...', '약간', '솔직히', '진짜', '그니까', '이제', '되게', '사실상',
    '있는', '하는', '에서', '으로', '하고', '제가', '저희', '통해', '대한', '관한', '위해', '하고', '있습니다', '했습니다'
  ]);

  const candidates = words.filter((w) => !stopWords.has(w));
  return Array.from(new Set(candidates));
}

// Dynamically evaluate candidate answer based on its text, metrics, actions, and delivery stats
export function evaluateAnswerDynamically(
  setup: InterviewSetup,
  candidateAnswer: string,
  currentQuestion: string,
  speechStats: {
    durationSec: number;
    fillerCount: number;
    detectedFillers: { [key: string]: number };
    gazeOffCount: number;
    gazeCenterPercent: number;
  },
  currentRound: number,
  maxRounds: number
): RoundEvaluation {
  const isLastRound = currentRound >= maxRounds;
  const isEnglish = setup.mode === 'english';
  const isDebate = setup.mode === 'debate';
  const isPT = setup.mode === 'pt';

  const text = candidateAnswer.trim();
  const charLength = text.length;

  // 1. Metric / Numerical Specificity Check (%, ms, TPS, nm, 건, 개, 배, ℃ 등)
  const metricRegex = /(\d+(\.\d+)?(%|ms|s|초|분|배|건|개|원|억|만|nm|tps|v|w|a|k|℃|ghz|mhz|fps)?)/gi;
  const metricsFound = text.match(metricRegex) || [];
  const validMetrics = metricsFound.filter((m) => /\d/.test(m) && m.length >= 2);
  const metricCount = validMetrics.length;

  // 2. Action / Ownership Check
  const actionKeywords = isEnglish
    ? ['designed', 'architected', 'implemented', 'optimized', 'tuned', 'reduced', 'deployed', 'built', 'analyzed', 'lead']
    : ['직접', '설계', '구현', '최적화', '튜닝', '분석', '도입', '개선', '배포', '측정', '해석', '제어', '개발', '선정', '진단'];
  const matchedActions = actionKeywords.filter((kw) => text.toLowerCase().includes(kw));

  // 3. Evasive / Passive Words Check
  const passiveKeywords = isEnglish
    ? ['team helped', 'we discussed', 'somehow', 'worked hard', 'probably', 'basically']
    : ['팀원들이', '회의를 통해', '같이', '어쩌다', '열심히', '잘 풀려서', '무난하게', '도와줘서'];
  const matchedPassives = passiveKeywords.filter((kw) => text.includes(kw));

  // 4. Problem & Context Keywords
  const contextKeywords = isEnglish
    ? ['bottleneck', 'latency', 'failure', 'issue', 'limitation', 'overheat', 'tradeoff', 'defect']
    : ['한계', '병목', '장애', '결함', '지연', '리스크', '트래픽', '수율', '누설', '진동', '오차', '열폭주', '서지'];
  const matchedContext = contextKeywords.filter((kw) => text.includes(kw));

  // Calculate Sub-Scores (1-100)
  // Situation: Did the candidate define the context & problem?
  let situationScore = 55 + matchedContext.length * 12;
  if (charLength > 100) situationScore += 10;
  situationScore = Math.min(95, Math.max(30, situationScore));

  // Task: Was the objective clear?
  let taskScore = 60 + (text.includes('목표') || text.includes('과제') || text.includes('objective') ? 18 : 0);
  if (matchedContext.length > 0) taskScore += 10;
  taskScore = Math.min(95, Math.max(35, taskScore));

  // Action: Did the candidate take ownership?
  let actionScore = 45 + matchedActions.length * 14 - matchedPassives.length * 15;
  if (text.includes('직접') || text.includes('I specifically') || text.includes('I designed')) actionScore += 15;
  actionScore = Math.min(96, Math.max(25, actionScore));

  // Result: Did the candidate quantify measurable outcomes?
  let resultScore = 35;
  if (metricCount === 0) {
    resultScore = 40; // Harsh penalty for zero metrics
  } else if (metricCount === 1) {
    resultScore = 68;
  } else if (metricCount === 2) {
    resultScore = 84;
  } else {
    resultScore = 95;
  }

  // Deduct for short/lazy answer
  if (charLength < 40) {
    situationScore = Math.min(45, situationScore);
    taskScore = Math.min(45, taskScore);
    actionScore = Math.min(40, actionScore);
    resultScore = Math.min(35, resultScore);
  }

  // Delivery penalties from speechStats
  const fillerPenalty = Math.min(15, (speechStats.fillerCount || 0) * 3);
  const gazePenalty = Math.min(12, (speechStats.gazeOffCount || 0) * 4);

  // Overall Score (Weighted)
  let rawOverall =
    situationScore * 0.2 +
    taskScore * 0.2 +
    actionScore * 0.35 +
    resultScore * 0.25 -
    (fillerPenalty + gazePenalty) * 0.5;

  const overallScore = Math.round(Math.min(98, Math.max(28, rawOverall)));

  // Extract key nouns from user answer for targeted response
  const terms = extractKeyTerms(text);
  const focalTerm = terms[0] || (isEnglish ? 'the methodology' : '제시한 방법론');
  const secondaryTerm = terms[1] || (isEnglish ? 'the implementation' : '공정 프로세스');

  // Dynamic Strengths & Weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (metricCount >= 2) {
    strengths.push(
      isEnglish
        ? `Effectively substantiated outcomes with concrete metrics (${validMetrics.slice(0, 2).join(', ')}).`
        : `정량적 수치 지표(${validMetrics.slice(0, 2).join(', ')})를 근거로 설득력 있게 제시함.`
    );
  } else {
    weaknesses.push(
      isEnglish
        ? 'Lacks measurable quantitative metrics or baseline comparison.'
        : '구체적인 정량적 수치 지표(개선 전후 대비율, 측정치)가 전혀 없어 객관적 검증이 불가능함.'
    );
  }

  if (matchedActions.length >= 2) {
    strengths.push(
      isEnglish
        ? `Clear technical ownership demonstrated through direct engineering actions (${matchedActions.slice(0, 2).join(', ')}).`
        : `지원자가 직접 주도한 핵심 엔지니어링 액션(${matchedActions.slice(0, 2).join(', ')})이 명확히 기술됨.`
    );
  } else {
    weaknesses.push(
      isEnglish
        ? 'Passive team attribution without clear delineation of individual contribution.'
        : '본인의 단독 기여도와 팀 전체의 협업 분리가 모호하여 주도성이 결여되어 보임.'
    );
  }

  if (speechStats.fillerCount > 3) {
    weaknesses.push(
      isEnglish
        ? `Excessive verbal filler words detected (${speechStats.fillerCount} times).`
        : `생각이 정리되지 않아 불필요한 말버릇(${speechStats.fillerCount}회)이 과도하게 노출됨.`
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      isEnglish
        ? 'Maintained relevant topical focus regarding the prompt.'
        : '질문의 핵심 주제를 회피하지 않고 답변을 전개하려 시도함.'
    );
  }

  // Dynamic Tail Question Generation (directly citing what user actually said!)
  let nextQuestion = '';
  let tailQuestionType = '';
  let feedbackComment = '';
  let interviewerAttitude = '';

  if (isDebate) {
    tailQuestionType = '상대측 핵심 논박 & 대안 추궁';
    if (metricCount === 0) {
      nextQuestion = `방금 '${focalTerm}'을(를) 강조하셨지만, 이를 뒷받침할 객관적인 통계나 재무적/공학적 수치가 결여되어 있습니다. 상대측의 반론을 꺾을 수 있는 구체적인 정량 근거는 무엇입니까?`;
    } else {
      nextQuestion = `방금 말씀하신 '${focalTerm}'의 장점 이면에 숨겨진 막대한 초기 전환 비용과 현장 반발에 대한 대책은 무엇입니까? 그 비용을 상쇄할 구체적 로드맵을 밝혀주십시오.`;
    }
    feedbackComment = overallScore >= 75
      ? '상대 주장의 허점을 짚어내며 논점을 방어했으나, 반대측의 재반박 리스크에 대한 대비가 요구됩니다.'
      : '주장이 다소 감정적이거나 당위론적이며, 상대방을 압도할 수 있는 데이터 중심의 팩트가 부족합니다.';
    interviewerAttitude = overallScore >= 75 ? '턱을 괴고 지원자의 반박 논리를 흥미롭게 관찰함' : '미간을 찌푸리며 논리적 허점을 집요하게 응시함';
  } else if (isPT) {
    tailQuestionType = '예산 및 실행 맹점 검증';
    if (metricCount === 0) {
      nextQuestion = `제시하신 '${focalTerm}' 전략에서 정량적 투자 회수 기간(ROI)과 예산 집행 계획이 빠져있습니다. 초기 6개월간 목표치에 미달할 경우 어떤 비상 계획(Plan B)이 있습니까?`;
    } else {
      nextQuestion = `발표에서 '${validMetrics[0]}'을(를) 개선치로 제시하셨는데, 실제 현업 적용 시 예상치 못한 병목이 발생해 이 지표가 30% 급감한다면 어떻게 대응하시겠습니까?`;
    }
    feedbackComment = overallScore >= 75
      ? '문제 정의와 해결 전략의 연결 고리가 뚜렷합니다. 다만 실행 단계의 리스크 시나리오를 보강해야 합니다.'
      : '제안한 해결책의 현실적 실현 가능성이 떨어지며, 심사위원이 납득할 만한 리소스 배분 계획이 미흡합니다.';
    interviewerAttitude = overallScore >= 75 ? '안경을 고쳐 쓰며 발표 자료의 지표를 꼼꼼히 체크함' : '팔짱을 끼고 차가운 눈빛으로 노트를 끄적임';
  } else if (isEnglish) {
    tailQuestionType = 'Engineering Tradeoff & Root Cause';
    if (metricCount === 0) {
      nextQuestion = `You mentioned '${focalTerm}', but did not provide any quantitative metrics. What was the exact baseline metric before your intervention, and what tool did you use to verify it?`;
    } else {
      nextQuestion = `Regarding your achievement with '${focalTerm}' and ${validMetrics[0]}, what was the single biggest tradeoff you had to accept, and how did you mitigate its risk in production?`;
    }
    feedbackComment = overallScore >= 75
      ? 'Communicated technical details with confidence and logical structure.'
      : 'Response lacks precision and relies heavily on high-level assertions without engineering depth.';
    interviewerAttitude = overallScore >= 75 ? 'Nods attentively while taking notes on technical depth' : 'Furrows brows intensely, probing for missing metrics';
  } else {
    // Engineering General Interview
    tailQuestionType = metricCount === 0 ? '정량 수치 검증 및 팩트체크' : '물리적 한계 및 트레이드오프 공격';
    if (metricCount === 0) {
      nextQuestion = `방금 '${focalTerm}'을(를) 통해 개선하셨다고 했는데, 정량적인 수치 지표가 전혀 없습니다. 구체적으로 몇 %, 어떤 계측 장비나 프로파일러로 측정한 결과입니까?`;
    } else if (matchedActions.length < 2) {
      nextQuestion = `말씀하신 '${focalTerm}' 프로젝트에서 팀 전체의 역할 말고, 지원자가 직접 설계하거나 코드로 작성한 단독 기여분은 정확히 몇 %였습니까?`;
    } else {
      nextQuestion = `방금 말씀하신 '${focalTerm}' 최적화 과정에서 포기해야 했던 물리적/공학적 트레이드오프(예: 발열, 지연, 내구 수명 등)는 무엇이었고, 어떻게 한계치를 극복하셨습니까?`;
    }
    feedbackComment = overallScore >= 75
      ? `'${focalTerm}'에 대한 실무 엔지니어링 경험이 돋보입니다. 다만 엣지케이스 한계 마진에 대한 깊이를 더 파고들 필요가 있습니다.`
      : `답변이 지나치게 추상적입니다. '${focalTerm}'의 구체적인 작동 메커니즘과 데이터가 결여되어 면접관을 설득하지 못했습니다.`;
    interviewerAttitude = overallScore >= 75 ? '서류에 체크 표시를 하며 날카롭게 다음 공격 포인트를 겨냥함' : '미간을 깊게 찌푸리며 노트를 끄적이고 차가운 시선으로 응시함';
  }

  // Model Answer Guide
  const recommendedModelAnswerGuide = isEnglish
    ? `Start directly with the bottom-line metric: "By re-architecting ${focalTerm}, we reduced latency by 45%." Then detail your exact action and how you mitigated the tradeoff.`
    : `두괄식으로 결론을 먼저 선언하십시오: "당시 핵심 과제는 ${focalTerm}의 한계 극복이었습니다. 저는 직접 ${secondaryTerm} 파라미터를 튜닝하여 결함률을 25% 저감하고 마진을 확보했습니다."처럼 구체적 숫자 2개와 본인만의 단독 액션을 강조해야 방어할 수 있습니다.`;

  return {
    starScores: {
      situation: Math.round(situationScore),
      task: Math.round(taskScore),
      action: Math.round(actionScore),
      result: Math.round(resultScore),
    },
    overallScore,
    strengths,
    weaknesses,
    feedbackComment,
    interviewerAttitude,
    isLastRound,
    nextQuestion,
    tailQuestionType,
    recommendedModelAnswerGuide,
    englishGrammarFixes: isEnglish
      ? [
          {
            original: 'I did the project with my team and it was good',
            improved: `I spearheaded the ${focalTerm} optimization alongside cross-functional engineers`,
            reason: 'Use strong ownership verbs and professional vocabulary rather than simple verbs.',
          },
        ]
      : undefined,
  };
}

// Dynamically generate the final comprehensive debrief report based on all rounds
export function generateReportDynamically(
  setup: InterviewSetup,
  allRounds: InterviewRound[],
  telemetry: {
    totalDurationSec: number;
    avgDurationSec: number;
    totalFillerCount: number;
    totalGazeOffCount: number;
    eyeContactScore: number;
  }
): FinalReportData {
  const roundScores = allRounds.map((r) => r.evaluation?.overallScore || 70);
  const avgRoundScore = Math.round(
    roundScores.reduce((a, b) => a + b, 0) / Math.max(1, roundScores.length)
  );

  // Derive 5-radar scores dynamically from candidate's actual answers across all rounds
  const allAnswers = allRounds.map((r) => r.candidateAnswer).join(' ');
  const metricMatches = allAnswers.match(/\d+(\.\d+)?(%|ms|s|초|배|건|개|원|nm|tps|v|w|a|k|℃)?/gi) || [];
  const totalMetrics = metricMatches.length;

  const dataSpecificity = Math.min(96, Math.max(35, 45 + totalMetrics * 10));
  const logicStructure = Math.min(95, Math.max(40, avgRoundScore + 4));
  const stressTolerance = Math.min(94, Math.max(30, 95 - telemetry.totalGazeOffCount * 5));
  const deliveryAndPresence = Math.min(95, Math.max(35, telemetry.eyeContactScore - telemetry.totalFillerCount * 2));
  const jobCompetency = Math.min(96, Math.max(35, avgRoundScore + (totalMetrics > 3 ? 6 : -4)));

  const totalScore = Math.round(
    logicStructure * 0.25 +
    dataSpecificity * 0.25 +
    stressTolerance * 0.2 +
    jobCompetency * 0.2 +
    deliveryAndPresence * 0.1
  );

  let passVerdict: FinalReportData['passVerdict'] = '탈락 (No Hire)';
  if (totalScore >= 85) {
    passVerdict = '합격 유력 (Strong Hire)';
  } else if (totalScore >= 74) {
    passVerdict = '합격권 (Hire)';
  } else if (totalScore >= 60) {
    passVerdict = '보류 (Borderline)';
  } else {
    passVerdict = '탈락 (No Hire)';
  }

  const keyStrengths: string[] = [];
  const criticalWeaknesses: string[] = [];

  if (totalMetrics >= 4) {
    keyStrengths.push(`전체 라운드에 걸쳐 ${totalMetrics}개의 구체적인 정량적 수치 데이터를 일관되게 제시하여 신뢰성을 확보함.`);
  } else {
    criticalWeaknesses.push('답변 전반에 정량적 지표(수치 데이터)가 부족하여 공학적/사업적 성과의 신뢰성이 현저히 떨어짐.');
  }

  if (telemetry.totalFillerCount > 5) {
    criticalWeaknesses.push(`습관적 말버릇(추임새)이 총 ${telemetry.totalFillerCount}회 감지되어 전문적이고 단호한 인상을 저해함.`);
  } else {
    keyStrengths.push('불필요한 추임새 없이 절제되고 차분한 기술 용어 전달력을 보임.');
  }

  if (telemetry.totalGazeOffCount > 4) {
    criticalWeaknesses.push(`압박 꼬리 질문을 받을 때 시선 이탈(${telemetry.totalGazeOffCount}회)이 잦아 심리적 불안 신호로 비춰짐.`);
  } else {
    keyStrengths.push('면접관의 송곳 질문에도 흔들림 없이 정면 아이컨택(주시율 ' + telemetry.eyeContactScore + '%)을 유지함.');
  }

  if (keyStrengths.length < 3) {
    keyStrengths.push(`${setup.jobRole} 직무의 전공 도메인 기초 개념에 대한 충실한 이해도.`);
  }
  if (criticalWeaknesses.length < 3) {
    criticalWeaknesses.push('돌발적인 트레이드오프 검증 시 상대방 논점의 전제를 무너뜨리는 반박 깊이 보완 필요.');
  }

  const verdictSummary =
    totalScore >= 75
      ? `${setup.company}의 ${setup.jobRole} 직무 심사 기준을 충족하는 우수한 역량을 검증했습니다. 특히 공학적 문제 정의와 구체적 수치 제시 능력이 뛰어납니다.`
      : `${setup.company}의 압박 면접 문턱을 넘기 위해서는 정량 데이터 제시와 단독 기여도(Action) 구분을 획기적으로 개선해야 합니다.`;

  return {
    passVerdict,
    verdictSummary,
    radarScores: {
      logicStructure: Math.round(logicStructure),
      dataSpecificity: Math.round(dataSpecificity),
      stressTolerance: Math.round(stressTolerance),
      jobCompetency: Math.round(jobCompetency),
      deliveryAndPresence: Math.round(deliveryAndPresence),
    },
    totalScore,
    keyStrengths,
    criticalWeaknesses,
    speechAndHabitCritique:
      telemetry.totalFillerCount > 4
        ? `답변을 시작할 때 "어...", "솔직히" 대신 2초간 호흡을 가다듬고 "핵심 원인은 ~입니다"로 단언하십시오.`
        : `안정적인 발언 페이싱(평균 ${telemetry.avgDurationSec}초)과 우수한 시선 유지력을 보여주었습니다.`,
    actionPlan: [
      '모든 프로젝트 경험을 "숫자 3개(지표명, 기존치, 개선치)"로 치트시트 정리하기',
      '꼬리 질문 수신 시 변명 대신 "네, 지적하신 그 리스크에 대해..."로 즉시 팩트 제시하기',
      '카메라 렌즈를 응시하며 60초 내 STAR 결론 도출 훈련 반복',
    ],
    roundBreakdowns: allRounds.map((r) => ({
      roundNumber: r.roundNumber,
      coreTopic: r.intent,
      pressureTrigger: r.evaluation?.weaknesses?.[0] || '구체적 지표 검증',
      score: r.evaluation?.overallScore || 70,
      oneLineVerdict: r.evaluation?.feedbackComment || '답변 분석 완료',
    })),
    modeSpecificReport: {
      mode: setup.mode,
      title: setup.mode === 'debate' ? '토론 면접 공방 정밀 진단' : setup.mode === 'pt' ? 'PT 발표 및 맹점 방어력 진단' : 'Global English CEFR Assessment',
      highlightMetrics: [
        { label: '데이터 반영도', value: `${totalMetrics}개 지표`, assessment: totalMetrics >= 3 ? '충분한 수치 뒷받침' : '수치 보강 필요' },
        { label: '아이컨택 안정도', value: `${telemetry.eyeContactScore}%`, assessment: telemetry.eyeContactScore >= 80 ? '안정적 주시' : '시선 불안정' },
        { label: '말버릇 절제도', value: `${telemetry.totalFillerCount}회`, assessment: telemetry.totalFillerCount <= 3 ? '우수' : '절제 훈련 권장' },
      ],
      coachingAdvice: '지원자의 실제 발화 데이터에 기반한 실시간 맞춤 피드백입니다. 실제 면접장에서 수치와 본인 기여도를 전면에 배치하십시오.',
    },
  };
}
