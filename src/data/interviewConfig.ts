import {
  CompanyOption,
  JobRoleOption,
  InterviewerPersona,
  DebateSetup,
  PTSetup,
} from '../types/interview';

export const COMPANIES: CompanyOption[] = [
  {
    id: 'samsung_ds',
    name: '삼성전자 DS부문 (반도체)',
    category: '대기업/제조',
    badge: 'Samsung DS',
    culture: '초격차 기술 리더십, 철저한 데이터 기반 원인 분석(RCA), 공정 완벽주의',
    primaryFocus: '나노 공정 수율 최적화, 물리화학적 결함 메커니즘, 양산 재현성 및 품질 마진',
  },
  {
    id: 'hyundai_rnd',
    name: '현대자동차 연구개발본부 (남양 R&D)',
    category: '대기업/제조',
    badge: 'Hyundai R&D',
    culture: '소프트웨어 중심 자동차(SDV) 전환, 가혹 조건 신뢰성 및 기능안전(ISO 26262)',
    primaryFocus: '차량 전동화 제어 로직, 극한 환경 내구 해석, 시스템 안전 여유도(Safety Margin)',
  },
  {
    id: 'lg_ensol',
    name: 'LG에너지솔루션 (배터리 연구소)',
    category: '대기업/제조',
    badge: 'LG Ensol',
    culture: '글로벌 1위 배터리 R&D, 안전 최우선 원칙, 화학/전기 복합 엔지니어링',
    primaryFocus: '배터리 셀 열폭주 방지 메커니즘, 소재 배합 트레이드오프, 급속 충전 수명 열화',
  },
  {
    id: 'sk_hynix',
    name: 'SK하이닉스 (메모리 개발)',
    category: '대기업/제조',
    badge: 'SK hynix',
    culture: 'HBM3e 및 CXL 기술 선도, 극한의 집적도 극복, 엔지니어링 끈기',
    primaryFocus: '고대역폭 메모리 3D TSV 패키징, 열 방출 설계, 타이밍 지터 및 신호 무결성',
  },
  {
    id: 'hanwha_aero',
    name: '한화에어로스페이스 (항공우주/방산)',
    category: '대기업/제조',
    badge: 'Hanwha Aero',
    culture: '우주 발사체 및 첨단 가스터빈 엔진, 제로 결함(Zero Defect) 공학',
    primaryFocus: '고온·고압 극한 유동해석(CFD), 복합소재 경량화, 정밀 유도제어 알고리즘',
  },
  {
    id: 'posco',
    name: '포스코홀딩스 (스마트 제철/이차전지소재)',
    category: '대기업/제조',
    badge: 'POSCO',
    culture: '수소환원제철 탄소중립, 초대형 연속 공정 제어, 소재 과학',
    primaryFocus: '대형 제철 설비 실시간 디지털 트윈, 연속 주조 불량 제어, 리튬 추출 공정 수율',
  },
  {
    id: 'tech_engineering',
    name: '네이버/카카오/토스 엔지니어링',
    category: '테크/플랫폼',
    badge: 'Tech Infra',
    culture: '대규모 분산 컴퓨팅 인프라, 무중단 고가용성 아키텍처, 락프리 최적화',
    primaryFocus: '대규모 트래픽 병목 튜닝, 분산 합의 알고리즘, 리눅스 커널 I/O 스케줄링',
  },
  {
    id: 'global_tech_hardware',
    name: '글로벌 엔지니어링 (Tesla / ASML / Intel)',
    category: '빅테크',
    badge: 'Global Hardware',
    culture: 'First Principles(제1원리 사고), 기술 혁신 가속도, 극한의 스펙 달성',
    primaryFocus: '물리적 한계 돌파, 하드웨어-소프트웨어 수직 통합, 신뢰성 검증',
  },
];

// 공과대학(STEM) 6대 핵심 학과 맞춤형 직무
export const JOB_ROLES: JobRoleOption[] = [
  {
    id: 'semiconductor_process',
    name: '반도체 공정 / 소자 엔지니어 (전자·신소재·물리)',
    category: '개발/기술',
    sampleQuestions: [
      'GAA(Gate-All-Around) 구조 도입 시 나노시트 단차 피복성과 채널 누설 전류를 억제하기 위해 공정 마진을 어떻게 확보하셨습니까?',
      '포토/에칭 공정 중 특정 로트(Lot)에서 발생한 Critical Dimension(CD) 산포 불량의 근본 원인을 어떤 물리화학적 메커니즘으로 분석하셨습니까?',
    ],
  },
  {
    id: 'battery_chemical',
    name: '2차전지 배터리 소재 / 셀 개발 엔지니어 (화공·재료)',
    category: '개발/기술',
    sampleQuestions: [
      '하이니켈 양극재(Ni 90% 이상) 적용 시 발생하는 미세 크랙 및 산소 탈리 현상을 억제하기 위한 표면 코팅과 도핑 전략을 설명해 주십시오.',
      '급속 충전 조건에서 리튬 덴드라이트(Dendrite) 형성으로 인한 단락 위험을 방지하기 위해 음극재 설계 및 BMS 전압 제어를 어떻게 연계하셨습니까?',
    ],
  },
  {
    id: 'mechanical_cae',
    name: '기계설계 / 모빌리티 CAE 구조·유동해석 (기계공학)',
    category: '개발/기술',
    sampleQuestions: [
      '차체 경량화를 위해 이종 접합(알루미늄-초고장력강) 구조를 채택할 때 발생하는 전식(Galvanic Corrosion) 및 피로 균열을 CAE 해석으로 어떻게 검증하셨습니까?',
      '고출력 모터 및 배터리 팩 냉각을 위한 3D 열유동해석(CFD)에서 난류 모델 선정 기준과 실제 벤치 테스트 오차율을 몇 %까지 줄이셨습니까?',
    ],
  },
  {
    id: 'electrical_embedded',
    name: '전기전자 / 전력변환 및 임베디드 제어 (전기전자)',
    category: '개발/기술',
    sampleQuestions: [
      'SiC 전력반도체 기반 인버터를 설계할 때 발생하는 높은 dv/dt에 따른 스위칭 서지와 전자기 간섭(EMI) 노이즈를 어떻게 감쇄하셨습니까?',
      '차량용 ECU 펌웨어 개발 시 ISO 26262 ASIL-D 요구사항을 충족하기 위해 메모리 보호 유닛(MPU) 및 와치독 페일세이프(Fail-safe)를 어떻게 구현하셨습니까?',
    ],
  },
  {
    id: 'computer_systems',
    name: '컴퓨터공학 / 분산 시스템 및 커널 최적화 (컴공·SW)',
    category: '개발/기술',
    sampleQuestions: [
      '대규모 동시성 I/O 환경에서 커널 컨텍스트 스위칭과 락 경합(Lock Contention)을 줄이기 위해 어떤 메모리 구조와 비동기 모델을 설계하셨습니까?',
      '분산 데이터베이스 파티셔닝 환경에서 네트워크 파티션 발생 시 데이터 정합성(Consistency)과 응답 지연의 트레이드오프를 어떻게 해결하셨습니까?',
    ],
  },
  {
    id: 'robotics_control',
    name: '로봇공학 / AI 비전 및 제어 (기계·전자·로봇 융합)',
    category: '개발/기술',
    sampleQuestions: [
      '6자유도 매니퓰레이터의 기구학적 특이점(Singularity) 근방에서 관절 각속도 발산을 방지하기 위해 역기구학 감쇠 최소자승법(DLS)을 어떻게 튜닝하셨습니까?',
      '조도 변화와 먼지 간섭이 심한 산업 현장에서 3D 비전 포인트 클라우드 노이즈를 제거하고 실시간 6-DoF 포즈를 30fps 이상으로 추정했던 사례를 말씀해 주세요.',
    ],
  },
];

// 공대 실무에 특화된 베테랑 기술 면접관 페르소나
export const INTERVIEWER_PERSONAS: InterviewerPersona[] = [
  {
    id: 'semi_master',
    name: '강태성 수석',
    title: '삼성전자 DS부문 반도체공정 수석연구원',
    avatarColor: 'bg-slate-900 dark:bg-slate-800 text-white',
    avatarGradient: 'from-slate-800 to-slate-950',
    avatarInitials: 'TS',
    style: '공정 수율 & 물리화학적 메커니즘 송곳 검증',
    tagline: '“추상적인 프레임워크나 툴 이름 말고, 물리화학적 작용 원리를 직접 칠판에 수식으로 써보시겠습니까?”',
    pressureStyle: '실제 양산 라인 수율 저하 조건 부여 및 물리적 한계치 정밀 타격',
    description: '단순 논문 지식 나열을 극도로 경계하며, 챔버 내 플라즈마 상태, 열역학 평형, 불순물 확산 메커니즘 등 기초 물리/화학 법칙에 입각한 해석을 집요하게 요구합니다.',
  },
  {
    id: 'mobility_lead',
    name: '윤현우 팀장',
    title: '현대차 남양 R&D 전동화샤시제어 리드',
    avatarColor: 'bg-sky-950 dark:bg-sky-900 text-white',
    avatarGradient: 'from-sky-900 to-slate-950',
    avatarInitials: 'HW',
    style: '극한 환경 신뢰성 & 기능안전(Fail-safe) 압박',
    tagline: '“만약 영하 40도 혹한기 노면에서 센서 하나가 먹통이 된다면, 당신이 짠 제어 로직은 차량을 안전하게 멈출 수 있습니까?”',
    pressureStyle: 'ISO 26262 안전등급 기반 최악의 엣지케이스(Worst-case) 시나리오 공격',
    description: '“이상적인 조건”에서의 테스트 데이터는 거들떠보지도 않으며, 노이즈, 부품 열화, 전원 드롭 등 실제 도로의 가혹 조건에서의 방어 알고리즘을 송곳처럼 파고듭니다.',
  },
  {
    id: 'battery_specialist',
    name: '서지원 책임',
    title: 'LG에너지솔루션 차세대 셀선행개발 책임',
    avatarColor: 'bg-emerald-950 dark:bg-emerald-900 text-white',
    avatarGradient: 'from-emerald-900 to-slate-950',
    avatarInitials: 'JW',
    style: '열역학적 안전마진 & 소재 트레이드오프 검증',
    tagline: '“에너지 밀도를 높이셨다고 했는데, 그로 인해 포기해야 했던 열 안정성 마진은 구체적으로 몇 ℃였습니까?”',
    pressureStyle: '하나를 얻으면 하나를 잃는 공학적 트레이드오프의 맹점 집중 공격',
    description: '모든 공학적 성과 뒤에 숨어있는 부작용과 위험 요소를 짚어내며, 실험실 성공 데이터와 실제 10만 셀 양산 스케일업 시의 괴리를 냉정하게 지적합니다.',
  },
  {
    id: 'kernel_master',
    name: '박준혁 마스터',
    title: '네이버/클라우드 분산컴퓨팅 시스템 수석',
    avatarColor: 'bg-indigo-950 dark:bg-indigo-900 text-white',
    avatarGradient: 'from-indigo-950 to-slate-950',
    avatarInitials: 'JH',
    style: '하드웨어 I/O 한계치 & 로우레벨 동시성 검증',
    tagline: '“라이브러리가 알아서 해줬다는 말 말고요. CPU 캐시 라인과 메모리 버스에서 바이트가 어떻게 흘렀는지 설명해보세요.”',
    pressureStyle: '블랙박스 식 추상화를 용납하지 않는 로우레벨 아키텍처 팩트체크',
    description: '고수준 API 뒤에 감춰진 하드웨어 병목과 OS 커널 스케줄러의 동작 방식을 직접 확인하며, 시스템 다운타임 99.999% 신뢰도를 검증합니다.',
  },
];

// 공학/기술 중심 실전 토론 주제
export const DEBATE_TOPICS: DebateSetup[] = [
  {
    topic: '차세대 전기차 배터리: 저비용 LFP(리튬인산철) 전면 채택 vs 고성능 NCM(삼원계) 고도화 찬반',
    assignedStance: '찬성',
    opponentName: '서지원 책임 토론자',
    opponentRole: '차세대 배터리 셀연구소 & 반대측 패널',
    contextBackground:
      '글로벌 전기차 대중화 단계에서 가격 경쟁력과 화재 안전성을 위해 LFP 배터리를 전면 확대해야 한다는 주장과, 혹한기 주행거리 급감 및 저온 출력 한계로 인해 차세대 고밀도 NCM 배터리에 집중해야 한다는 입장이 대립합니다.',
  },
  {
    topic: '완전 자율주행 센서 아키텍처: 고정밀 LiDAR 필수 탑재 vs 테슬라식 순수 카메라 비전(Pure Vision)',
    assignedStance: '반대',
    opponentName: '윤현우 수석 연구원',
    opponentRole: '자율주행 제어개발실 & 찬성측 패널',
    contextBackground:
      '인간의 시각 시스템처럼 카메라와 신경망만으로 물리 세계를 인식할 수 있다는 순수 비전 진영과, 폭우/폭설 및 야간 역광 등 극한 환경에서 인명 안전을 담보하기 위해 라이다/레이더의 물리적 거리 측정 데이터가 필수라는 진영의 치열한 공학적 격돌입니다.',
  },
  {
    topic: '반도체 패키징 기술 로드맵: 2나노 미세화 지속 vs 3D 칩렛(Chiplet) 이종 결합 전환',
    assignedStance: '찬성',
    opponentName: '강태성 선임 마스터',
    opponentRole: '차세대 패키징 개발팀 & 반대측 패널',
    contextBackground:
      '무어의 법칙이 물리적 한계에 부딪힌 가운데, 수조 원의 EUV 노광 장비 비용을 들여 선폭 미세화를 지속해야 한다는 주장과, 인터포저와 고대역폭 TSV를 활용해 개별 기능 칩을 쌓아 올리는 3D 칩렛 패키징이 경제적 최적해라는 주장이 팽팽히 맞섭니다.',
  },
];

// 공학/기술 중심 실전 PT 면접 케이스
export const PT_CASES: PTSetup[] = [
  {
    caseTitle: '2나노 파운드리 양산 도입 시 게이트 절연막 누설 전류 저감 및 수율 70% 달성 방안',
    backgroundBriefing:
      '차세대 2나노 공정 시양산 라인에서 게이트 산화막 두께가 원자 몇 층 단위로 얇아짐에 따라 양자역학적 터널링 누설 전류가 급증하여 대기 전력이 35% 초과되고 있습니다. 6개월 내 양산 골든 수율 70%를 돌파해야 합니다.',
    dataPoints: [
      { label: '현재 시양산 수율', value: '42.8% (목표치 70% 미달)' },
      { label: '게이트 누설 전류', value: '기준 스펙 대비 +38% 초과' },
      { label: 'EUV 노광 결함 밀도', value: '0.045 ea/cm²' },
      { label: '가용 공정 엔지니어링 기간', value: '18주 (고객사 샘플 납기)' },
    ],
    presentationGoal: 'High-k 절연막 신소재 변경, 나노시트 식각 프로파일 개선, 또는 결함 분석 자동화 방안을 3분간 구조화하여 발표하십시오.',
    prepTimeSec: 180,
  },
  {
    caseTitle: '전기차 400V ➔ 800V 고전압 충전 시스템 전환 시 인버터 열화 방지 및 EMI 저감 설계',
    backgroundBriefing:
      '초고속 충전 시간(18분 이내 80%)을 달성하기 위해 차량 전압 시스템을 800V로 격상하기로 결정했습니다. 그러나 SiC MOSFET의 빠른 스위칭(높은 dv/dt)으로 인해 모터 코일 절연 파괴 위험과 전장품 통신 오동작이 빈번히 발생하고 있습니다.',
    dataPoints: [
      { label: '스위칭 과전압 스파이크', value: '정격 1,200V 대비 최대 1,480V 발생' },
      { label: 'CAN 통신 패킷 에러율', value: '급가속 시 4.2% (기준치 0.01% 이하)' },
      { label: '인버터 정션 온도(Tj)', value: '최대 168℃ (안전 마진 150℃ 초과)' },
      { label: '양산 원가 한계선', value: '인버터당 추가 원가 12만 원 이내' },
    ],
    presentationGoal: '게이트 드라이버 슬루율(Slew-rate) 제어, 액티브 스너버 회로 적용, 또는 차폐 및 PCB 아트워크 개선안을 3분간 발표하십시오.',
    prepTimeSec: 180,
  },
  {
    caseTitle: '스마트 제조 라인 6축 로봇 0.05mm 반복 정밀도 유지를 위한 실시간 진동 감쇠 제어',
    backgroundBriefing:
      '정밀 전자부품 조립 라인에서 생산성 향상을 위해 산업용 로봇의 이동 속도를 20% 상향한 결과, 감속기 백래시 및 암(Arm) 구조물의 고유진동수로 인해 정지 위치에서 잔류 진동이 발생하여 조립 불량률이 3.4배 폭증했습니다.',
    dataPoints: [
      { label: '로봇 엔드이펙터 잔류 진동', value: '±0.28mm (공차 기준 ±0.05mm)' },
      { label: '진동 정정 시간(Settling time)', value: '380ms (택트타임 지연 요인)' },
      { label: '구조물 1차 고유진동수', value: '18.4 Hz' },
      { label: '조립 불량률', value: '기존 0.2% ➔ 속도 상향 후 0.68%' },
    ],
    presentationGoal: '입력 성형(Input Shaping) 필터링, 엔코더-가속도 센서 융합 피드백, 또는 가감속 S-curve 궤적 최적화 제어 전략을 3분간 발표하십시오.',
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
