import React, { useState } from 'react';
import {
  COMPANIES,
  JOB_ROLES,
  INTERVIEWER_PERSONAS,
  DEBATE_TOPICS,
  PT_CASES,
} from '../data/interviewConfig';
import {
  InterviewSetup,
  InterviewMode,
  PressureLevel,
  InterviewerPersona,
} from '../types/interview';
import {
  Flame,
  ShieldAlert,
  Sliders,
  Sparkles,
  UserCheck,
  Building2,
  Briefcase,
  ChevronRight,
  Mic,
  Camera,
  FileText,
  Swords,
  Presentation,
  Globe2,
  CheckCircle2,
} from 'lucide-react';

interface SetupViewProps {
  onStartInterview: (setup: InterviewSetup) => void;
  isLoading: boolean;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStartInterview, isLoading }) => {
  const [selectedMode, setSelectedMode] = useState<InterviewMode>('general');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('samsung_ds');
  const [selectedJobRoleId, setSelectedJobRoleId] = useState<string>('semiconductor_process');
  const [careerLevel, setCareerLevel] = useState<'신입' | '주니어 (1~3년)' | '시니어 (4년 이상)'>('주니어 (1~3년)');
  const [pressureLevel, setPressureLevel] = useState<PressureLevel>('high');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('semi_master');
  const [resumeText, setResumeText] = useState<string>(
    'GAA 3나노 공정 라인에서 게이트 산화막 에칭 시 플라즈마 전력과 압력 파라미터를 최적화하여 채널 결함 밀도를 28% 저감하고 수율 마진을 확보했습니다.'
  );
  const [enableCamera, setEnableCamera] = useState<boolean>(true);
  const [enableVoice, setEnableVoice] = useState<boolean>(true);

  // Debate mode state
  const [selectedDebateIndex, setSelectedDebateIndex] = useState<number>(0);
  const [assignedStance, setAssignedStance] = useState<'찬성' | '반대'>('찬성');

  // PT mode state
  const [selectedPTIndex, setSelectedPTIndex] = useState<number>(0);

  // English mode state
  const [cefrTarget, setCefrTarget] = useState<'B2 (Professional)' | 'C1 (Advanced)' | 'C2 (Mastery)'>('C1 (Advanced)');
  const [accentPreference, setAccentPreference] = useState<'American' | 'British'>('American');

  const selectedCompany = COMPANIES.find((c) => c.id === selectedCompanyId) || COMPANIES[0];
  const selectedJobRole = JOB_ROLES.find((j) => j.id === selectedJobRoleId) || JOB_ROLES[0];
  const selectedPersona = INTERVIEWER_PERSONAS.find((p) => p.id === selectedPersonaId) || INTERVIEWER_PERSONAS[0];

  const handleStart = () => {
    const baseSetup: InterviewSetup = {
      mode: selectedMode,
      company: selectedCompany.name,
      companyCategory: selectedCompany.category,
      jobRole: selectedJobRole.name,
      careerLevel,
      pressureLevel,
      interviewerPersona: selectedPersona,
      customResumeOrProject: resumeText.trim(),
      enableCamera,
      enableVoice,
    };

    if (selectedMode === 'debate') {
      const template = DEBATE_TOPICS[selectedDebateIndex];
      baseSetup.debateSetup = {
        ...template,
        assignedStance,
      };
    } else if (selectedMode === 'pt') {
      baseSetup.ptSetup = PT_CASES[selectedPTIndex];
    } else if (selectedMode === 'english') {
      baseSetup.englishSetup = {
        targetDomain: selectedCompany.name,
        cefrTarget,
        accentPreference,
      };
    }

    onStartInterview(baseSetup);
  };

  // Quick 1-Click Presets
  const applyPreset = (
    mode: InterviewMode,
    companyId: string,
    roleId: string,
    personaId: string,
    level: PressureLevel
  ) => {
    setSelectedMode(mode);
    setSelectedCompanyId(companyId);
    setSelectedJobRoleId(roleId);
    setSelectedPersonaId(personaId);
    setPressureLevel(level);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Hero Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <span>REALISTIC MULTI-FORMAT AI PRESSURE INTERVIEW</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
          일반 압박부터 <span className="text-rose-600 dark:text-rose-500">토론, PT, 영어 면접</span>까지
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          실제 기업 채용 단계별 특수 면접 환경을 완벽 재현하고 논리적 허점과 시선·말버릇을 끝까지 파고듭니다.
        </p>

        {/* 4 Mode Segmented Navigation */}
        <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto text-xs font-semibold">
          {[
            { id: 'general' as const, label: '직무 압박 면접', icon: Briefcase, desc: '꼬리 질문 & STAR 수치화' },
            { id: 'debate' as const, label: '토론 면접', icon: Swords, desc: '찬반 배정 & AI 실시간 반론' },
            { id: 'pt' as const, label: 'PT 면접', icon: Presentation, desc: '3분 케이스 발표 & 심사위원 압박' },
            { id: 'english' as const, label: '글로벌 영어 면접', icon: Globe2, desc: 'CEFR 유창성 & 영문 STT/TTS' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedMode(tab.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-rose-600 text-white border-transparent shadow-md ring-2 ring-rose-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-rose-500'}`} />
                  <span className="font-bold">{tab.label}</span>
                </div>
                <span className={`text-[10px] leading-tight ${isSelected ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Engineering College Quick Scenarios */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">공과대학 추천 프리셋:</span>
          <button
            onClick={() => {
              setSelectedMode('general');
              setSelectedCompanyId('samsung_ds');
              setSelectedJobRoleId('semiconductor_process');
              setSelectedPersonaId('semi_master');
              setPressureLevel('extreme');
              setResumeText('3나노 GAA 나노시트 식각 공정 수율 저하 분석 및 파라미터 튜닝');
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            🔬 삼성전자 DS 반도체 수율 송곳압박
          </button>
          <button
            onClick={() => {
              setSelectedMode('general');
              setSelectedCompanyId('hyundai_rnd');
              setSelectedJobRoleId('mechanical_cae');
              setSelectedPersonaId('mobility_lead');
              setPressureLevel('high');
              setResumeText('전기차 배터리 팩 냉각을 위한 3D 열유동해석(CFD) 및 이종 접합 강도 검증');
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            🚗 현대차 R&D 기계/CAE 가혹조건 검증
          </button>
          <button
            onClick={() => {
              setSelectedMode('general');
              setSelectedCompanyId('lg_ensol');
              setSelectedJobRoleId('battery_chemical');
              setSelectedPersonaId('battery_specialist');
              setPressureLevel('high');
              setResumeText('하이니켈 양극재 열폭주 억제를 위한 산화물 코팅 및 덴드라이트 방지');
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            🔋 LG엔솔 배터리 소재/안전마진
          </button>
          <button
            onClick={() => {
              setSelectedMode('general');
              setSelectedCompanyId('tech_engineering');
              setSelectedJobRoleId('computer_systems');
              setSelectedPersonaId('kernel_master');
              setPressureLevel('extreme');
              setResumeText('리눅스 커널 I/O 스케줄링 튜닝 및 락프리 메모리 동시성 파이프라인');
            }}
            className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            💻 네이버 클라우드 커널/분산시스템
          </button>
        </div>
      </section>

      {/* Mode-Specific Customization Deck */}
      {selectedMode === 'debate' && (
        <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
            <Swords className="w-4 h-4 text-amber-600" />
            <h2>토론 면접 시나리오 및 입장 배정</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEBATE_TOPICS.map((item, idx) => {
              const isSelected = selectedDebateIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDebateIndex(idx)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-amber-500 shadow-sm ring-1 ring-amber-500'
                      : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    논제 0{idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.topic}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white">
                선택된 논제: {DEBATE_TOPICS[selectedDebateIndex].topic}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">나의 배정 입장:</span>
                <button
                  onClick={() => setAssignedStance('찬성')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                    assignedStance === '찬성'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  찬성측 발언
                </button>
                <button
                  onClick={() => setAssignedStance('반대')}
                  className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                    assignedStance === '반대'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  반대측 발언
                </button>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              {DEBATE_TOPICS[selectedDebateIndex].contextBackground}
            </p>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              ⚔️ AI 상대 토론자: {DEBATE_TOPICS[selectedDebateIndex].opponentName} ({DEBATE_TOPICS[selectedDebateIndex].opponentRole})
            </div>
          </div>
        </div>
      )}

      {selectedMode === 'pt' && (
        <div className="p-6 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300">
            <Presentation className="w-4 h-4 text-indigo-600" />
            <h2>실전 PT 면접 비즈니스 케이스 선택</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PT_CASES.map((pt, idx) => {
              const isSelected = selectedPTIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPTIndex(idx)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">
                    케이스 0{idx + 1}
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {pt.caseTitle}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/40 text-xs space-y-3">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                과제 브리핑: {PT_CASES[selectedPTIndex].caseTitle}
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {PT_CASES[selectedPTIndex].backgroundBriefing}
              </p>
            </div>

            {/* Provided Data Points */}
            <div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                제공된 비즈니스 데이터 시트:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PT_CASES[selectedPTIndex].dataPoints.map((dp, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block truncate">{dp.label}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {dp.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
              🎯 발표 미션: {PT_CASES[selectedPTIndex].presentationGoal}
            </div>
          </div>
        </div>
      )}

      {selectedMode === 'english' && (
        <div className="p-6 rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/40 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-900 dark:text-sky-300">
            <Globe2 className="w-4 h-4 text-sky-600" />
            <h2>Global English Interview Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Target CEFR Proficiency Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['B2 (Professional)', 'C1 (Advanced)', 'C2 (Mastery)'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setCefrTarget(lvl)}
                    className={`py-2 px-1.5 text-[11px] rounded-lg font-medium text-center border cursor-pointer ${
                      cefrTarget === lvl
                        ? 'bg-sky-600 text-white border-transparent font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {lvl.split(' ')[0]}
                    <span className="block text-[9px] opacity-80">{lvl.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Accent & Persona Tone
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['American', 'British'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setAccentPreference(acc)}
                    className={`py-2 px-2 text-xs rounded-lg font-medium text-center border cursor-pointer ${
                      accentPreference === acc
                        ? 'bg-sky-600 text-white border-transparent font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {acc} Accent
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-sky-700 dark:text-sky-400">
            💡 English Mode automatically activates en-US Web Speech Recognition and real-time tracking for filler words such as "um", "like", "you know", and provides instant grammar fixes!
          </div>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Target Company & Job Role */}
        <div className="space-y-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Building2 className="w-4 h-4 text-rose-500" />
              <h2>1. 목표 기업 선택</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {COMPANIES.map((company) => {
                const isSelected = company.id === selectedCompanyId;
                return (
                  <button
                    key={company.id}
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={`p-3 text-left rounded-lg text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-rose-500 shadow-sm ring-1 ring-rose-500'
                        : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100">{company.name.split(' ')[0]}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {company.category}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                {selectedCompany.name} 평가 키포인트
              </span>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                {selectedCompany.primaryFocus}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Briefcase className="w-4 h-4 text-sky-500" />
              <h2>2. 지원 직무 및 연차</h2>
            </div>
            <select
              value={selectedJobRoleId}
              onChange={(e) => setSelectedJobRoleId(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {JOB_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.category})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-1.5 mt-2.5">
              {(['신입', '주니어 (1~3년)', '시니어 (4년 이상)'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCareerLevel(lvl)}
                  className={`py-1.5 px-2 text-xs rounded-md font-medium text-center transition-colors cursor-pointer border ${
                    careerLevel === lvl
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2: Interviewer Persona & Pressure Level */}
        <div className="space-y-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2>3. 압박 수위 설정</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'moderate' as const, label: '보통 압박', desc: '논리 구조 & STAR 점검' },
                { id: 'high' as const, label: '집중 압박', desc: '수치·트레이드오프 검증' },
                { id: 'extreme' as const, label: '극한 송곳', desc: '치명적 맹점 파고들기' },
              ].map((lvl) => {
                const isSelected = pressureLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setPressureLevel(lvl.id)}
                    className={`p-2.5 text-center rounded-lg text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold ring-1 ring-rose-500'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div>{lvl.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-900 dark:text-white font-semibold text-sm">
              <UserCheck className="w-4 h-4 text-indigo-500" />
              <h2>4. 면접관 페르소나 선택</h2>
            </div>
            <div className="space-y-2">
              {INTERVIEWER_PERSONAS.map((persona) => {
                const isSelected = persona.id === selectedPersonaId;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersonaId(persona.id)}
                    className={`w-full p-3 text-left rounded-lg text-xs transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-white/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                          {persona.avatarInitials}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{persona.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">{persona.title}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {persona.style.split('&')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 italic line-clamp-1">
                      {persona.tagline}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Resume Input & Hardware Settings */}
        <div className="space-y-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>내 대표 프로젝트 / 이력 요약 (선택)</span>
                </label>
                <span className="text-[10px] text-slate-400">맞춤 질문 생성용</span>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={4}
                placeholder="본인이 진행했던 주요 프로젝트, 직무 성과 또는 어필하고 싶은 경험을 입력하면 면접관이 이를 정밀 타격하여 질문합니다."
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none leading-relaxed"
              />
            </div>

            {/* Hardware sensor toggles */}
            <div className="p-3 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                실시간 분석 센서 설정
              </span>

              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-500" />
                  <span>카메라 시선 & 자세 추적 (HUD)</span>
                </span>
                <input
                  type="checkbox"
                  checked={enableCamera}
                  onChange={(e) => setEnableCamera(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-500" />
                  <span>실시간 음성 STT & 말버릇 분석</span>
                </span>
                <input
                  type="checkbox"
                  checked={enableVoice}
                  onChange={(e) => setEnableVoice(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
              </label>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              id="start-interview-btn"
              onClick={handleStart}
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-lg text-sm font-bold text-white bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 cursor-pointer"
            >
              {isLoading ? (
                <span>면접실 생성 및 시나리오 구성 중...</span>
              ) : (
                <>
                  <span>
                    {selectedMode === 'debate'
                      ? '실전 토론 면접 시작하기'
                      : selectedMode === 'pt'
                      ? '실전 PT 면접 시작하기'
                      : selectedMode === 'english'
                      ? 'Start English Interview'
                      : '실전 압박 면접 시작하기'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              최대 3개의 심층 라운드가 진행된 후 5대 역량 종합 리포트가 발급됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
