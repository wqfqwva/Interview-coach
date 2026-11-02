import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { InterviewSetup } from './src/types/interview';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Initialize Interview & Generate First Question / Opening Round
app.post('/api/interview/init', async (req, res) => {
  try {
    const setup: InterviewSetup = req.body;
    const mode = setup.mode || 'general';

    let systemInstruction = '';
    let prompt = '';

    if (mode === 'debate') {
      const debate = setup.debateSetup!;
      systemInstruction = `당신은 ${setup.company} 채용 토론 면접장의 상대측 토론자 '${debate.opponentName}'(${debate.opponentRole})입니다.
토론 주제: "${debate.topic}"
지원자 배정 입장: ${debate.assignedStance}
당신(AI)의 입장: ${debate.assignedStance === '찬성' ? '반대' : '찬성'}
배경 상황: ${debate.contextBackground}

당신은 매우 논리정연하고 빈틈없는 베테랑 토론자입니다.
상대측(지원자)의 입장을 정면으로 반박하는 강력한 첫 번째 기조 논증 및 공격적인 질문을 1개 던지세요.
반드시 JSON 형식으로 반환하세요.`;
      prompt = `토론 면접을 개시하며, 당신의 반대 논거를 제시하고 지원자(${debate.assignedStance}측)에게 첫 발언 기회를 넘기며 압박 질문을 던지세요.`;
    } else if (mode === 'pt') {
      const pt = setup.ptSetup!;
      systemInstruction = `당신은 ${setup.company}의 ${setup.interviewerPersona.title} '${setup.interviewerPersona.name}'이자 PT 면접 평가위원장입니다.
과제명: "${pt.caseTitle}"
배경 브리핑: ${pt.backgroundBriefing}
발표 목표: ${pt.presentationGoal}

지원자에게 정중하면서도 긴장감 있게 PT 발표 세션의 시작을 선언하고, 준비한 3분 핵심 프레젠테이션(문제 정의, 핵심 전략, 실행 계획 및 기대효과)을 발표해달라고 요청하세요.
반드시 JSON 형식으로 반환하세요.`;
      prompt = `PT 면접 평가 세션을 시작하는 심사위원장의 안내 및 발표 요청 발언을 생성하세요.`;
    } else if (mode === 'english') {
      systemInstruction = `You are an elite executive interviewer '${setup.interviewerPersona.name}', ${setup.interviewerPersona.title} at ${setup.company}.
Target Job: ${setup.jobRole} (${setup.careerLevel})
Interview Mode: Global English Interview (Target CEFR: ${setup.englishSetup?.cefrTarget || 'C1 Advanced'})
Interviewer Style: Direct, intellectually demanding, probing for deep ownership, metrics, and global communication effectiveness.
ALL TEXT MUST BE IN PROFESSIONAL BUSINESS ENGLISH.
Output purely JSON.`;
      prompt = `Conduct the opening round of the global interview for the ${setup.jobRole} position at ${setup.company}. Ask a sharp, substantive question probing their most impactful technical or business achievement.`;
    } else {
      // General Interview
      systemInstruction = `당신은 ${setup.company}의 ${setup.interviewerPersona.title} '${setup.interviewerPersona.name}'입니다.
직무: ${setup.jobRole} (경력: ${setup.careerLevel})
면접 스타일: ${setup.interviewerPersona.style} (${setup.interviewerPersona.tagline})
압박 강도: ${setup.pressureLevel === 'extreme' ? '극한의 송곳 압박 (한 치의 논리적 모순도 용납하지 않음)' : setup.pressureLevel === 'high' ? '집중 압박 (구체적 수치와 근거 집요하게 요구)' : '보통 압박 (차분하지만 꼼꼼한 검증)'}

실제 대기업/빅테크/유니콘 면접관처럼 매우 전문적이고 단호하며 날카롭게 첫 질문을 던지세요.
첫 질문은 지원자의 핵심 직무 역량, 가장 도전적이었던 프로젝트 또는 문제 해결 경험을 직접 겨냥해야 합니다.
${setup.customResumeOrProject ? `지원자가 제출한 이력/프로젝트 내용: "${setup.customResumeOrProject}"` : ''}
반드시 JSON 형식으로 반환하세요.`;
      prompt = `${setup.company} ${setup.jobRole} 지원자의 1차 실무/심층 면접 첫 질문을 시작하세요.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            intent: { type: Type.STRING },
            focusKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedTimeSec: { type: Type.INTEGER },
            interviewerReaction: { type: Type.STRING },
          },
          required: ['question', 'intent', 'focusKeywords', 'recommendedTimeSec', 'interviewerReaction'],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Init interview error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '면접 시작 질문을 생성하는 중 오류가 발생했습니다.',
    });
  }
});

// 2. Evaluate Answer & Generate Follow-up Pressure Question / Debate Rebuttal / PT Defense
app.post('/api/interview/evaluate-and-tail', async (req, res) => {
  try {
    const {
      setup,
      history,
      currentQuestion,
      candidateAnswer,
      speechStats,
      currentRound,
      maxRounds,
    } = req.body;

    const mode = setup.mode || 'general';
    const isLastRound = currentRound >= maxRounds;

    let systemInstruction = '';
    let promptContext = '';

    if (mode === 'debate') {
      const debate = setup.debateSetup!;
      systemInstruction = `당신은 ${setup.company} 채용 토론 면접의 상대측 토론자 '${debate.opponentName}'입니다.
토론 주제: "${debate.topic}"
지원자 입장: ${debate.assignedStance} / 당신의 입장: ${debate.assignedStance === '찬성' ? '반대' : '찬성'}

지원자의 방금 발언을 혹독하게 논리적으로 분석하세요:
1. 지원자 주장의 논리적 허점, 비현실적인 가정, 또는 데이터 왜곡을 파악하십시오.
2. STAR 점수는 토론 역량(논점 장악력, 반박 논리, 구체적 근거, 설득력)으로 환산하여 채점하십시오.
3. ${isLastRound ? '토론 최종 결론 정리' : '지원자의 주장을 날카롭게 무너뜨리는 강력한 재반박(꼬리 질문/공격)을 던지십시오.'}
반드시 JSON으로 반환하세요.`;
      promptContext = `
[토론 맥락]
직전 당신의 발언: "${currentQuestion}"
지원자의 반론: "${candidateAnswer}"
발화 데이터: ${speechStats?.durationSec || 0}초 소요, 말버릇 ${speechStats?.fillerCount || 0}회, 시선 이탈 ${speechStats?.gazeOffCount || 0}회
라운드: ${currentRound}/${maxRounds}
`;
    } else if (mode === 'pt') {
      const pt = setup.ptSetup!;
      systemInstruction = `당신은 ${setup.company}의 PT 면접 평가위원장 '${setup.interviewerPersona.name}'입니다.
과제명: "${pt.caseTitle}"
지원자의 발표 내용을 엄격하게 심사하십시오:
1. 문제 정의의 정확성, 현실적 실행 가능성, 데이터 해석의 타당성을 평가하십시오.
2. ${isLastRound ? 'PT 종합 총평을 준비하십시오.' : '발표에서 가장 취약한 가설, 예산/리소스 맹점, 또는 실행 단계의 치명적 리스크를 집요하게 찌르는 송곳 심층 질문을 1개 던지십시오.'}
반드시 JSON으로 반환하세요.`;
      promptContext = `
[PT 심사 맥락]
직전 질문/발표 요청: "${currentQuestion}"
지원자의 발표/답변: "${candidateAnswer}"
발화 데이터: ${speechStats?.durationSec || 0}초 소요, 말버릇 ${speechStats?.fillerCount || 0}회
라운드: ${currentRound}/${maxRounds}
`;
    } else if (mode === 'english') {
      systemInstruction = `You are executive interviewer '${setup.interviewerPersona.name}' at ${setup.company}.
Evaluate the candidate's English response with high linguistic and professional rigor:
1. Assess Logic, STAR structure, Metric specificity, and Business English fluency.
2. Identify any grammatical errors, awkward phrasing, or vocabulary improvements, providing constructive corrections in 'englishGrammarFixes'.
3. Generate a sharp, probing English follow-up question (꼬리 질문) digging into their assumptions.
ALL TEXT IN JSON MUST BE IN ENGLISH (except Korean translations if helpful).`;
      promptContext = `
[Global English Interview Round ${currentRound}/${maxRounds}]
Interviewer Question: "${currentQuestion}"
Candidate Response: "${candidateAnswer}"
Delivery Stats: Duration: ${speechStats?.durationSec || 0}s, Fillers: ${speechStats?.fillerCount || 0}, Gaze deviations: ${speechStats?.gazeOffCount || 0}
`;
    } else {
      // General Interview
      systemInstruction = `당신은 ${setup.company}의 ${setup.interviewerPersona.title} '${setup.interviewerPersona.name}'입니다.
면접관 성향: ${setup.interviewerPersona.style}.
압박 수위: ${setup.pressureLevel === 'extreme' ? '극한의 송곳 압박 (날카롭고 집요한 반론, 수치 검증, 책임 회피 지적)' : setup.pressureLevel === 'high' ? '집중 압박 (정량적 근거, 트레이드오프 검증)' : '논리적 압박 (STAR 구조와 인과관계 검증)'}

지원자의 이번 답변을 혹독하고 객관적으로 평가하고, 그 답변의 맹점/모호함/생략된 부분을 집요하게 파고드는 후속 "꼬리 질문(압박 질문)"을 생성하세요.
반드시 JSON으로 반환하세요.`;
      promptContext = `
[면접 설정]
기업: ${setup.company} / 직무: ${setup.jobRole} (${setup.careerLevel})
직전 질문: "${currentQuestion}"
지원자의 답변: "${candidateAnswer}"
발화 데이터: ${speechStats?.durationSec || 0}초 소요, 말버릇 ${speechStats?.fillerCount || 0}회, 시선 이탈 ${speechStats?.gazeOffCount || 0}회
이 라운드는 ${currentRound}/${maxRounds} 라운드입니다. ${isLastRound ? '마지막 답변이므로 마무리 준비를 하세요.' : '답변의 취약점을 정조준하는 꼬리 질문을 생성하세요.'}
`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContext,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            starScores: {
              type: Type.OBJECT,
              properties: {
                situation: { type: Type.INTEGER, description: '1-100' },
                task: { type: Type.INTEGER, description: '1-100' },
                action: { type: Type.INTEGER, description: '1-100' },
                result: { type: Type.INTEGER, description: '1-100' },
              },
              required: ['situation', 'task', 'action', 'result'],
            },
            overallScore: { type: Type.INTEGER, description: '1-100점 종합 점수' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '답변에서 긍정적이었던 점 (1~2개)',
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '답변의 논리적 허점, 부족했던 수치적 근거, 모호한 표현 지적 (2~3개)',
            },
            feedbackComment: {
              type: Type.STRING,
              description: '면접관의 즉각적인 내면 평가 및 피드백 (냉철하고 직설적)',
            },
            interviewerAttitude: {
              type: Type.STRING,
              description: '면접관의 리액션 (예: 미간을 찌푸리며 노트를 끄적임, 차가운 눈빛 등)',
            },
            isLastRound: { type: Type.BOOLEAN },
            nextQuestion: {
              type: Type.STRING,
              description: isLastRound ? '마지막 정리 질문 또는 종료 멘트' : '방금 답변의 허점을 겨냥한 날카로운 꼬리 질문 또는 토론 재반박',
            },
            tailQuestionType: {
              type: Type.STRING,
              description: '수치 검증 / 트레이드오프 / 반박 및 압박 / 예외 상황 / 토론 논박 / PT 맹점 검증',
            },
            recommendedModelAnswerGuide: {
              type: Type.STRING,
              description: '이 발언을 훨씬 설득력 있게 보강하는 모범 가이드',
            },
            englishGrammarFixes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ['original', 'improved', 'reason'],
              },
              description: '영어 면접 시 문법/어휘 교정 제안',
            },
          },
          required: [
            'starScores',
            'overallScore',
            'strengths',
            'weaknesses',
            'feedbackComment',
            'interviewerAttitude',
            'isLastRound',
            'nextQuestion',
            'tailQuestionType',
            'recommendedModelAnswerGuide',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Evaluate answer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '답변 평가 및 꼬리 질문 생성 중 오류가 발생했습니다.',
    });
  }
});

// 3. Final Comprehensive Report
app.post('/api/interview/report', async (req, res) => {
  try {
    const { setup, rounds, telemetry } = req.body;
    const mode = setup.mode || 'general';

    const systemInstruction = `당신은 ${setup.company}의 최종 채용 심사위원단 및 ${setup.interviewerPersona.title} '${setup.interviewerPersona.name}'입니다.
전체 면접 세션(모드: ${mode === 'debate' ? '토론 면접' : mode === 'pt' ? 'PT 면접' : mode === 'english' ? '글로벌 영어 면접' : '일반 직무 압박 면접'})을 종합 분석하여 실제 기업 채용위원회 수준의 매우 객관적인 최종 리포트를 작성하십시오.
반드시 JSON 형식으로 반환하세요.`;

    const prompt = `
[면접 설정]
형식: ${mode}
기업: ${setup.company} / 직무: ${setup.jobRole} (${setup.careerLevel})
전체 라운드 데이터:
${JSON.stringify(rounds, null, 2)}

[지원자 종합 텔레메트리]
- 총 발화 시간: ${telemetry.totalDurationSec}초
- 평균 답변 시간: ${telemetry.avgDurationSec}초
- 총 말버릇 사용: ${telemetry.totalFillerCount}회
- 시선 이탈 횟수: ${telemetry.totalGazeOffCount}회
- 태도 지수: ${telemetry.eyeContactScore}점/100점
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passVerdict: {
              type: Type.STRING,
              description: '합격 유력 (Strong Hire) / 합격권 (Hire) / 보류 (Borderline) / 탈락 (No Hire)',
            },
            verdictSummary: {
              type: Type.STRING,
              description: '채용위원회 최종 한줄 총평 (1~2문장)',
            },
            radarScores: {
              type: Type.OBJECT,
              properties: {
                logicStructure: { type: Type.INTEGER, description: '논리적 구성 및 체계 (0-100)' },
                dataSpecificity: { type: Type.INTEGER, description: '구체성 및 수치화 검증 (0-100)' },
                stressTolerance: { type: Type.INTEGER, description: '압박 대처력 및 반박 회복력 (0-100)' },
                jobCompetency: { type: Type.INTEGER, description: '직무 전문성 및 본질 이해 (0-100)' },
                deliveryAndPresence: { type: Type.INTEGER, description: '전달력, 시선, 말버릇 절제 (0-100)' },
              },
              required: ['logicStructure', 'dataSpecificity', 'stressTolerance', 'jobCompetency', 'deliveryAndPresence'],
            },
            totalScore: { type: Type.INTEGER, description: '100점 만점 환산 점수' },
            keyStrengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '면접관의 인정을 받은 핵심 강점 3가지',
            },
            criticalWeaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '반드시 고쳐야 할 치명적 약점 및 허점 3가지',
            },
            speechAndHabitCritique: {
              type: Type.STRING,
              description: '시선 처리, 말버릇, 답변 속도 등에 대한 전문 코칭 코멘트',
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '다음 실전 면접까지 개선해야 할 액션 플랜 3단계',
            },
            roundBreakdowns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  roundNumber: { type: Type.INTEGER },
                  coreTopic: { type: Type.STRING },
                  pressureTrigger: { type: Type.STRING, description: '꼬리 질문/재반박이 발동된 계기' },
                  score: { type: Type.INTEGER },
                  oneLineVerdict: { type: Type.STRING },
                },
                required: ['roundNumber', 'coreTopic', 'pressureTrigger', 'score', 'oneLineVerdict'],
              },
            },
            modeSpecificReport: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                title: { type: Type.STRING },
                highlightMetrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      assessment: { type: Type.STRING },
                    },
                    required: ['label', 'value', 'assessment'],
                  },
                },
                coachingAdvice: { type: Type.STRING },
              },
              required: ['mode', 'title', 'highlightMetrics', 'coachingAdvice'],
            },
          },
          required: [
            'passVerdict',
            'verdictSummary',
            'radarScores',
            'totalScore',
            'keyStrengths',
            'criticalWeaknesses',
            'speechAndHabitCritique',
            'actionPlan',
            'roundBreakdowns',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Final report error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '최종 면접 리포트 생성 중 오류가 발생했습니다.',
    });
  }
});

// Production static file serving & dev middlewares
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
