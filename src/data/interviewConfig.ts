import {
  CompanyOption,
  JobRoleOption,
  InterviewerPersona,
  DebateSetup,
  PTSetup,
} from '../types/interview';

export const COMPANIES: CompanyOption[] = [
  {
    id: 'toss',
    name: '토스 (비바리퍼블리카)',
    category: '유니콘/스타트업',
    badge: 'Toss',
    culture: '극단적 투명성과 주도성, 실패를 통한 급진적 학습',
    primaryFocus: '고객 중심 본질 파악, 불필요한 관행 타파, 정량적 비즈니스 임팩트',
  },
  {
    id: 'naver',
    name: '네이버 (NAVER)',
    category: '테크/플랫폼',
    badge: 'NAVER',
    culture: '대규모 분산 트래픽 처리, 글로벌 서비스 경쟁력과 안정성',
    primaryFocus: '아키텍처 확장성, 기술적 기본기, 대규모 데이터 트래픽 대응 경험',
  },
  {
    id: 'kakao',
    name: '카카오 (Kakao)',
    category: '테크/플랫폼',
    badge: 'Kakao',
    culture: '자기주도적 문제 해결, 열린 소통과 자기 주도성',
    primaryFocus: '플랫폼 서비스 UX 개선, 협업 갈등 조율 능력, 기술 트레이드오프 이해',
  },
  {
    id: 'samsung',
    name: '삼성전자 (Samsung Electronics)',
    category: '대기업/제조',
    badge: 'Samsung',
    culture: '철저한 품질 관리, 공정 최적화 및 글로벌 초격차',
    primaryFocus: '체계적인 문제 해결 프로세스, 원가 및 효율 개선, 조직 융화도',
  },
  {
    id: 'hyundai',
    name: '현대자동차 (Hyundai Motor)',
    category: '대기업/제조',
    badge: 'Hyundai',
    culture: '모빌리티 혁신과 SDV(소프트웨어 중심 자동차) 전환',
    primaryFocus: '시스템 안정성, 이종 기술 간 융합 능력, 능동적 오너십',
  },
  {
    id: 'coupang',
    name: '쿠팡 (Coupang)',
    category: '테크/플랫폼',
    badge: 'Coupang',
    culture: '고객 와우(Wow the Customer), 데이터 드리븐 의사결정',
    primaryFocus: '심층 원인 분석(Root Cause Analysis), 극한의 속도와 지표 검증',
  },
  {
    id: 'daangn',
    name: '당근 (Karrot)',
    category: '유니콘/스타트업',
    badge: 'Daangn',
    culture: '하이퍼로컬 커뮤니티, 자율과 책임 기반의 팀플레이',
    primaryFocus: '진정성 있는 사용자 관찰, 가설 검증 사이클, 직관과 데이터의 조화',
  },
  {
    id: 'google',
    name: 'Google / 글로벌 테크',
    category: '빅테크',
    badge: 'Global Tech',
    culture: 'Googleyness, 10x 스케일 사고, 포용성과 개방적 엔지니어링',
    primaryFocus: '구조화된 사고(Structured Thinking), 모호성 대처력, 리더십 원칙',
  },
];

export const JOB_ROLES: JobRoleOption[] = [
  {
    id: 'backend',
    name: '백엔드 소프트웨어 엔지니어',
    category: '개발/기술',
    sampleQuestions: [
      '대규모 트래픽 병목 현상을 진단하고 최적화했던 가장 인상적인 경험을 말씀해 주세요.',
      '분산 시스템 환경에서 데이터 정합성과 성능 사이의 트레이드오프를 어떻게 해결하셨습니까?',
    ],
  },
  {
    id: 'frontend',
    name: '프론트엔드 웹 엔지니어',
    category: '개발/기술',
    sampleQuestions: [
      '복잡한 웹 애플리케이션에서 렌더링 성능과 초기 로딩 속도를 혁신적으로 개선한 사례를 설명해 주세요.',
      '컴포넌트 설계 시 재사용성과 비즈니스 로직 격리를 위해 어떤 철학을 고수하시나요?',
    ],
  },
  {
    id: 'pm',
    name: '프로덕트 매니저 (PM / PO)',
    category: '기획/PM',
    sampleQuestions: [
      '핵심 비즈니스 지표가 정체되었을 때, 어떤 가설을 세우고 우선순위를 결정하여 반등시켰습니까?',
      '개발팀 및 사업 부서와의 심각한 요구사항 충돌 상황을 어떻게 데이터로 설득하셨나요?',
    ],
  },
  {
    id: 'data_ai',
    name: '데이터 분석가 / AI 엔지니어',
    category: '데이터/AI',
    sampleQuestions: [
      '데이터의 불균형이나 품질 이슈를 극복하고 실제 프로덕션 의사결정을 이끌어낸 프로젝트를 소개해주세요.',
      '단순 모델 성능(F1, AUC) 외에 실제 비즈니스 ROI를 어떻게 증명하셨습니까?',
    ],
  },
  {
    id: 'growth_marketer',
    name: '그로스 / 퍼포먼스 마케터',
    category: '비즈니스/마케팅',
    sampleQuestions: [
      'CAC(고객획득비용)를 절감하면서도 전환율(CVR)을 유의미하게 끌어올린 A/B 테스트 사례를 구체적으로 말씀해 주세요.',
      '예산 집행 효율이 급감하는 위기 상황에서 어떤 퍼널 병목을 찾아내셨습니까?',
    ],
  },
  {
    id: 'biz_dev',
    name: '사업개발 (BD) / 전략기획',
    category: '비즈니스/마케팅',
    sampleQuestions: [
      '기존 시장의 진입 장벽을 뚫고 신규 파트너십이나 수익 모델을 창출한 대표적인 실행기를 들려주세요.',
      '회사의 한정된 리소스 속에서 과감하게 포기해야 했던 사업 기회와 그 논리적 배경은 무엇이었습니까?',
    ],
  },
];

export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'senior_tech_lead',
    name: '박준혁 수석',
    title: '테크 리드 & 시스템 아키텍트',
    avatarColor: 'bg-slate-900 dark:bg-slate-800 text-white',
    avatarGradient: 'from-slate-800 to-slate-950',
    avatarInitials: 'JH',
    style: '기술적 딥다이브 & 구조적 꼬리 질문',
    tagline: '“내부 구현 원리와 실패 케이스를 완벽히 이해하고 쓰셨습니까?”',
    pressureStyle: '도서관식 팩트 체크와 아키텍처 엣지케이스 집중 공격',
    description: '추상적인 프레임워크 이름 나열을 극도로 싫어하며, 실제 장애 시 디버깅 경험과 로우레벨 작동 원리를 집요하게 파고듭니다.',
  },
  {
    id: 'ruthless_po',
    name: '이지민 PO',
    title: '프로덕트 헤드 & VP of Product',
    avatarColor: 'bg-emerald-950 dark:bg-emerald-900 text-white',
    avatarGradient: 'from-emerald-900 to-slate-900',
    avatarInitials: 'JM',
    style: '비즈니스 임팩트 & 정량 수치 검증',
    tagline: '“그래서 그 작업이 실제 비즈니스 매출과 지표에 몇 % 기여했습니까?”',
    pressureStyle: '수치가 빠진 두루뭉술한 답변을 즉시 잘라내며 기여도 분리 요구',
    description: '“열심히 했다”, “협력했다” 식의 주관적 표현을 절대 넘기지 않고, 객관적 데이터와 본인만의 단독 기여도를 냉정하게 분리해냅니다.',
  },
  {
    id: 'culture_director',
    name: '최동수 실장',
    title: '피플 앤 컬처 인사총괄',
    avatarColor: 'bg-amber-950 dark:bg-amber-900 text-white',
    avatarGradient: 'from-amber-950 to-slate-900',
    avatarInitials: 'DS',
    style: '갈등 대처 & 솔직성 압박 검증',
    tagline: '“솔직히 말씀해보세요. 그 갈등에서 본인의 과실은 정말 전혀 없었나요?”',
    pressureStyle: '방어기제 무장해제, 스트레스 상황에서의 태도와 신뢰성 검증',
    description: '모범 답안 뒤에 숨은 지원자의 진솔한 인성과 위기 시 진짜 성향을 끄집어내기 위해 미묘한 심리적 압박을 가합니다.',
  },
  {
    id: 'global_exec',
    name: '알렉스 김 디렉터',
    title: '글로벌 엔지니어링 디렉터',
    avatarColor: 'bg-indigo-950 dark:bg-indigo-900 text-white',
    avatarGradient: 'from-indigo-950 to-slate-900',
    avatarInitials: 'AK',
    style: '글로벌 원칙 & 극한 상황 시뮬레이션',
    tagline: '“만약 데이터가 전혀 없고 리소스가 1/5로 줄어든다면 어떻게 하시겠습니까?”',
    pressureStyle: '가혹한 제약조건 부여 및 모호한 환경에서의 우선순위 타격',
    description: '정해진 답이 없는 극한의 딜레마 환경을 던져 지원자의 구조적 논리력과 우선순위 판단력을 시험합니다.',
  },
];

// 2. Debate Topics & Opponents
export const DEBATE_TOPICS: DebateSetup[] = [
  {
    topic: '사내 AI 코딩 도구 전면 도입에 따른 주니어 엔지니어 신규 공채 축소 찬반',
    assignedStance: '찬성',
    opponentName: '김민우 선임 토론자',
    opponentRole: '인재개발팀 시니어 & 반대측 패널',
    contextBackground:
      'AI 기반 개발 생산성이 30% 이상 향상되면서 기초 코딩 작업이 자동화되고 있습니다. 한편에서는 기초 체력을 다질 신규 주니어 채용을 줄이고 검증된 시니어 중심 편성이 불가피하다는 주장과, 장기적 인재 파이프라인 붕괴를 우려하는 반론이 팽팽히 맞섭니다.',
  },
  {
    topic: '전사 원격근무(재택근무) 전면 철회 및 주 5일 오피스 상시 출근제 환원',
    assignedStance: '반대',
    opponentName: '박서진 조직전략팀장',
    opponentRole: '경영기획실 & 찬성측 패널',
    contextBackground:
      '빅테크 기업들이 오피스 복귀를 선언하는 가운데, 대면 협업 밀도 및 조직 충성도 강화를 위해 주 5일 출근으로 환원해야 한다는 경영진 측과, 유연근무를 통한 핵심 인재 유출 방지 및 자율 생산성을 강조하는 실무진 간의 치열한 논쟁입니다.',
  },
  {
    topic: '플랫폼 핵심 무료 서비스의 전면 유료 멤버십화 및 수익성 방어',
    assignedStance: '찬성',
    opponentName: '정태호 그로스 리드',
    opponentRole: '사용자경험실 & 반대측 패널',
    contextBackground:
      '플랫폼 영업이익 적자 탈출을 위해 기존 무료 유저에게 제공되던 핵심 기능을 유료 구독으로 전환하는 방안입니다. 단기 사용자 이탈을 감수하더라도 현금흐름 흑자 전환이 시급하다는 입장과, 네트워크 효과 붕괴를 우려하는 입장이 대립합니다.',
  },
];

// 3. PT Interview Cases & Dossiers
export const PT_CASES: PTSetup[] = [
  {
    caseTitle: '신규 동남아 이커머스 시장 진출 및 12개월 내 GMV 1,000억 달성 전략',
    backgroundBriefing:
      '국내 시장의 성장률이 연 3%대로 정체됨에 따라, 회사는 연 20% 이상 급성장 중인 동남아 3개국(베트남, 인도네시아, 태국) 중 한 곳을 교두보로 선정하여 진출하기로 결정했습니다. 현지 로컬 강자와 글로벌 거대 플랫폼의 틈새에서 차별화된 침투 전략이 필요합니다.',
    dataPoints: [
      { label: '국내 시장 성장률', value: '전년 대비 +2.8% (포화 상태)' },
      { label: '목표 시장 모바일 침투율', value: '78.4% (MZ세대 중심)' },
      { label: '가용 초기 투자 예산', value: '150억 원 (1차 라운드)' },
      { label: '경쟁사 평균 배송 리드타임', value: '3.2일 (물류 인프라 취약)' },
    ],
    presentationGoal: '시장 진입 타겟 국가 선정 이유, 킬러 카테고리, 물류/배송 차별화 방안 및 3개년 손익 분기(BEP) 로드맵을 3분간 발표하십시오.',
    prepTimeSec: 180,
  },
  {
    caseTitle: '주문 결제 피크타임 장애율 99.99% 달성을 위한 아키텍처 개편 및 리스크 전략',
    backgroundBriefing:
      '분기 최대 프로모션 행사 시 초당 주문 트랜잭션이 평시의 15배인 45,000 TPS까지 폭증하여 데이터베이스 커넥션 풀 고갈 및 타임아웃 장애가 3회 반복 발생했습니다. 다음 달 대규모 할인 페스타 전까지 무중단 결제 파이프라인을 구축해야 합니다.',
    dataPoints: [
      { label: '피크 예상 트래픽', value: '최대 45,000 TPS' },
      { label: '현재 DB 응답 한계', value: '12,000 TPS (Connection Pool 98% 점유)' },
      { label: '목표 다운타임 SLA', value: '99.99% (연간 허용 장애 52분 이내)' },
      { label: '개편 적용 가능 기간', value: '3주 (실제 가동 직전 리허설 포함)' },
    ],
    presentationGoal: '이벤트 기반 아키텍처(EDA) 또는 서킷 브레이커/캐싱 레이어 도입 방안과 결제 정합성(ACID) 유지 방안을 3분간 발표하십시오.',
    prepTimeSec: 180,
  },
  {
    caseTitle: 'CAC 40% 절감 및 D30 리텐션율 2배 개선을 위한 풀퍼널 그로스 전략',
    backgroundBriefing:
      '신규 유저 유입 단가(CAC)가 플랫폼 광고 단가 상승으로 인해 1인당 48,000원까지 치솟았습니다. 반면 설치 후 30일 리텐션은 8.2%에 불과하여 마케팅 예산이 누수되고 있습니다. 온보딩 퍼널 및 추천 리워드 개편안이 시급합니다.',
    dataPoints: [
      { label: '현재 1인당 CAC', value: '48,000원 (전년비 +65% 급증)' },
      { label: 'D1 / D7 / D30 리텐션', value: '32% ➔ 14% ➔ 8.2%' },
      { label: '온보딩 첫 거래 전환율', value: '12.4% (4단계에서 58% 이탈)' },
      { label: '오가닉 바이럴 계수(K-Factor)', value: '0.22 (자발적 확산 미비)' },
    ],
    presentationGoal: '온보딩 퍼널 병목 개선안, 데이터 기반 트리거 푸시 전략, 바이럴 루프 구축을 통한 리텐션 반등 전략을 3분간 발표하십시오.',
    prepTimeSec: 180,
  },
];

// Korean filler words
export const KOREAN_FILLER_WORDS = [
  '어...',
  '어',
  '음...',
  '음',
  '그...',
  '그',
  '약간',
  '솔직히',
  '진짜',
  '그니까',
  '이제',
  '되게',
  '사실상',
  '뭐랄까',
  '저기',
];

// English filler words for English interview
export const ENGLISH_FILLER_WORDS = [
  'um',
  'uh',
  'you know',
  'like',
  'basically',
  'actually',
  'sort of',
  'kind of',
  'i mean',
  'honestly',
];

export function analyzeFillerWords(
  text: string,
  isEnglish: boolean = false
): { totalCount: number; detectedMap: { [word: string]: number } } {
  if (!text) return { totalCount: 0, detectedMap: {} };

  const wordList = isEnglish ? ENGLISH_FILLER_WORDS : KOREAN_FILLER_WORDS;
  const detectedMap: { [word: string]: number } = {};
  let totalCount = 0;

  for (const filler of wordList) {
    const cleanWord = filler.replace(/\./g, '');
    const regex = isEnglish
      ? new RegExp(`\\b${cleanWord}\\b`, 'gi')
      : new RegExp(`(^|\\s)${cleanWord}(\\s|[.,!?]|$)`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      detectedMap[cleanWord] = (detectedMap[cleanWord] || 0) + matches.length;
      totalCount += matches.length;
    }
  }

  return { totalCount, detectedMap };
}
