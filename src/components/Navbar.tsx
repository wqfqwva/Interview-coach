import React from 'react';
import { Moon, Sun, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'setup' | 'interview' | 'report';
  onNavigate: (view: 'setup' | 'interview' | 'report') => void;
  onResetInterview: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  hasActiveSession: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onResetInterview,
  theme,
  onToggleTheme,
  hasActiveSession,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Single text element Brand Zone */}
        <button
          onClick={() => onNavigate('setup')}
          className="flex items-center gap-2.5 text-left text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-sm transition-transform group-hover:scale-105">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            VERITAS INTERVIEW
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('setup')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
              currentView === 'setup' ? 'text-slate-900 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-rose-500' : ''
            }`}
          >
            면접관 설정
          </button>
          {hasActiveSession && (
            <button
              onClick={() => onNavigate('interview')}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white ${
                currentView === 'interview' ? 'text-slate-900 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-rose-500' : ''
              }`}
            >
              진행 중인 세션
            </button>
          )}
          <a
            href="#star-framework"
            onClick={(e) => {
              e.preventDefault();
              alert('STAR 평가 체계: Situation(상황 맥락 20%), Task(부여 과제 20%), Action(본인 주도 실행 40%), Result(정량적 성과 지표 20%)를 실시간으로 점수화합니다.');
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white"
          >
            STAR 평가 기준
          </a>
          <a
            href="#pressure-techniques"
            onClick={(e) => {
              e.preventDefault();
              alert('압박 꼬리질문 알고리즘: 지원자 답변에서 수치 부재, 기여도 모호성, 극단적 예외 상황 대처 여부를 파악하여 최대 3단계 심층 꼬리 질문을 발동합니다.');
            }}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white"
          >
            꼬리 질문 원리
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="테마 전환"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentView !== 'setup' ? (
            <button
              onClick={onResetInterview}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>새 면접 시작</span>
            </button>
          ) : (
            <a
              href="#start-interview-btn"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-rose-600 hover:bg-slate-800 dark:hover:bg-rose-700 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-300 dark:text-white" />
              <span>시뮬레이션 준비</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
