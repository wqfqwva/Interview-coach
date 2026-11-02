import React, { useEffect, useState } from 'react';
import { InterviewerPersona } from '../types/interview';

export type InterviewerExpression =
  | 'neutral'
  | 'listening'
  | 'skeptical'
  | 'intense'
  | 'speaking'
  | 'taking_notes';

interface VirtualInterviewerFaceProps {
  persona: InterviewerPersona;
  isSpeaking: boolean;
  isLoading: boolean;
  attitudeText?: string;
  expressionOverride?: InterviewerExpression;
}

export const VirtualInterviewerFace: React.FC<VirtualInterviewerFaceProps> = ({
  persona,
  isSpeaking,
  isLoading,
  attitudeText,
  expressionOverride,
}) => {
  const [blink, setBlink] = useState<boolean>(false);
  const [mouthOpen, setMouthOpen] = useState<number>(0);
  const [headTilt, setHeadTilt] = useState<number>(0);

  // Determine current active expression
  let expression: InterviewerExpression = 'listening';
  if (isSpeaking) {
    expression = 'speaking';
  } else if (isLoading) {
    expression = 'skeptical';
  } else if (expressionOverride) {
    expression = expressionOverride;
  } else if (attitudeText) {
    const lower = attitudeText.toLowerCase();
    if (lower.includes('미간') || lower.includes('의구심') || lower.includes('허점') || lower.includes('찌푸')) {
      expression = 'skeptical';
    } else if (lower.includes('노트') || lower.includes('끄적') || lower.includes('기록') || lower.includes('서류')) {
      expression = 'taking_notes';
    } else if (lower.includes('차가운') || lower.includes('날카') || lower.includes('눈빛') || lower.includes('팔짱')) {
      expression = 'intense';
    }
  }

  // Blinking loop (every 3~5 seconds)
  useEffect(() => {
    let blinkTimeout: any = null;
    const triggerBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
      blinkTimeout = setTimeout(triggerBlink, 3000 + Math.random() * 2500);
    };

    blinkTimeout = setTimeout(triggerBlink, 2000);
    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  // Lip-sync mouth animation when interviewer is speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen(Math.floor(Math.random() * 3)); // 0, 1, 2
    }, 140);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Subtle breathing and head tilt
  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      setHeadTilt(Math.sin(time * 0.7) * 1.5);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Eyebrow and eye styles based on expression
  const isSkeptical = expression === 'skeptical' || expression === 'intense';
  const isTakingNotes = expression === 'taking_notes';
  const isIntense = expression === 'intense';

  const expressionBadgeText = isSpeaking
    ? '🗣️ 질문 낭독 및 쟁점 전달 중'
    : isLoading
    ? '🔍 답변의 기술적 모순 및 수치 팩트체크 중'
    : expression === 'skeptical'
    ? '🤨 미간을 찌푸리며 논리적 비약 검증 중'
    : expression === 'intense'
    ? '⚡ 차가운 눈빛으로 한계치 압박 준비 중'
    : expression === 'taking_notes'
    ? '📝 지원자 답변의 결격사유 기록 중'
    : '👂 집중 경청 및 구조적 검증 중';

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-radial from-slate-800 via-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center p-4">
      {/* Background Corporate Office Studio lighting backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(15,23,42,0.85)_100%)] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Virtual Interviewer SVG Character Rig */}
      <div
        className="relative z-10 w-44 sm:w-52 h-44 sm:h-52 transition-transform duration-300"
        style={{
          transform: `rotate(${headTilt}deg) translateY(${isTakingNotes ? '6px' : '0px'})`,
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8d5b8" />
              <stop offset="100%" stopColor="#e2b493" />
            </linearGradient>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="tieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Shoulders & Business Suit */}
          <path
            d="M 30 195 C 40 145, 65 140, 100 140 C 135 140, 160 145, 170 195 Z"
            fill="url(#suitGrad)"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Dress Shirt Collar */}
          <polygon points="100,140 85,160 100,175 115,160" fill="#f8fafc" />
          <polygon points="85,140 100,152 75,152" fill="#ffffff" />
          <polygon points="115,140 100,152 125,152" fill="#ffffff" />

          {/* Red/Navy Executive Tie */}
          <polygon points="96,152 104,152 108,185 100,195 92,185" fill="url(#tieGrad)" />

          {/* Neck */}
          <rect x="88" y="112" width="24" height="32" rx="4" fill="#deb18f" />

          {/* Head & Face Contour */}
          <ellipse cx="100" cy="85" rx="42" ry="48" fill="url(#skinGrad)" filter="url(#shadow)" />

          {/* Professional Hairstyle */}
          <path
            d="M 58 75 C 55 45, 80 32, 100 32 C 125 32, 145 42, 142 75 C 142 55, 130 45, 100 45 C 70 45, 60 55, 58 75 Z"
            fill="#1e1b18"
          />
          <path
            d="M 58 75 C 54 85, 55 98, 59 105 C 56 95, 56 82, 60 72 Z"
            fill="#1e1b18"
          />

          {/* Eyebrows (Furrow on skepticism/pressure) */}
          {/* Left Eyebrow */}
          <path
            d={
              isSkeptical
                ? 'M 72 68 Q 84 76, 92 73' // Furrowed downward
                : 'M 72 68 Q 82 64, 92 68'
            }
            stroke="#1c1917"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Eyebrow */}
          <path
            d={
              isSkeptical
                ? 'M 108 73 Q 116 76, 128 68' // Furrowed downward
                : 'M 108 68 Q 118 64, 128 68'
            }
            stroke="#1c1917"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyeglasses Frame (Sharp Engineering Master Aesthetic) */}
          <rect
            x="68"
            y="69"
            width="26"
            height="18"
            rx="4"
            fill="rgba(240, 249, 255, 0.15)"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          <rect
            x="106"
            y="69"
            width="26"
            height="18"
            rx="4"
            fill="rgba(240, 249, 255, 0.15)"
            stroke="#0284c7"
            strokeWidth="1.8"
          />
          <line x1="94" y1="76" x2="106" y2="76" stroke="#0284c7" strokeWidth="1.8" />
          <line x1="60" y1="74" x2="68" y2="74" stroke="#0284c7" strokeWidth="1.5" />
          <line x1="132" y1="74" x2="140" y2="74" stroke="#0284c7" strokeWidth="1.5" />

          {/* Eyes (Blink animation & gaze shifts) */}
          {blink ? (
            // Closed eyes on blink
            <>
              <line x1="74" y1="78" x2="88" y2="78" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="112" y1="78" x2="126" y2="78" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : isTakingNotes ? (
            // Looking down at notes
            <>
              <ellipse cx="81" cy="80" rx="6" ry="4" fill="#ffffff" />
              <circle cx="81" cy="81" r="3" fill="#0f172a" />
              <ellipse cx="119" cy="80" rx="6" ry="4" fill="#ffffff" />
              <circle cx="119" cy="81" r="3" fill="#0f172a" />
            </>
          ) : isIntense ? (
            // Squinting intense piercing eyes
            <>
              <ellipse cx="81" cy="78" rx="6" ry="3.5" fill="#ffffff" />
              <circle cx="81" cy="78" r="3" fill="#0f172a" />
              <circle cx="82" cy="77" r="1" fill="#ffffff" />
              <ellipse cx="119" cy="78" rx="6" ry="3.5" fill="#ffffff" />
              <circle cx="119" cy="78" r="3" fill="#0f172a" />
              <circle cx="120" cy="77" r="1" fill="#ffffff" />
            </>
          ) : (
            // Attentive piercing direct gaze
            <>
              <ellipse cx="81" cy="78" rx="6.5" ry="5.5" fill="#ffffff" />
              <circle cx="81" cy="78" r="3.2" fill="#0f172a" />
              <circle cx="82" cy="77" r="1.2" fill="#ffffff" />
              <ellipse cx="119" cy="78" rx="6.5" ry="5.5" fill="#ffffff" />
              <circle cx="119" cy="78" r="3.2" fill="#0f172a" />
              <circle cx="120" cy="77" r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Nose */}
          <path d="M 99 78 L 96 95 L 102 95" stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Mouth (Dynamic lip sync & critical tight lip) */}
          {isSpeaking ? (
            mouthOpen === 2 ? (
              // Wide open (speaking vowels)
              <ellipse cx="100" cy="112" rx="9" ry="6" fill="#7f1d1d" stroke="#b91c1c" strokeWidth="1.5" />
            ) : mouthOpen === 1 ? (
              // Medium open
              <ellipse cx="100" cy="112" rx="7" ry="3.5" fill="#7f1d1d" stroke="#b91c1c" strokeWidth="1.2" />
            ) : (
              // Closed speaking posture
              <line x1="93" y1="112" x2="107" y2="112" stroke="#7f1d1d" strokeWidth="2.5" strokeLinecap="round" />
            )
          ) : isSkeptical ? (
            // Tight critical pressed lips
            <path d="M 94 113 Q 100 110, 106 113" stroke="#881337" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            // Neutral listening firm line
            <line x1="93" y1="112" x2="107" y2="112" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
          )}

          {/* Subtle note-taking pen and pad in corner when taking_notes */}
          {isTakingNotes && (
            <g transform="translate(130, 130)">
              <rect x="0" y="0" width="28" height="38" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="5" y1="8" x2="23" y2="8" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="5" y1="14" x2="23" y2="14" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="5" y1="20" x2="18" y2="20" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="18" y1="2" x2="28" y2="22" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {/* Top Header Badge Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-slate-200">
          <span className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-rose-500 animate-ping' : isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
          <span className="font-semibold">{persona.name} {persona.title}</span>
        </div>

        <div className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-slate-300 font-mono text-[11px] tabular-nums">
          <span>{persona.style.split('&')[0]}</span>
        </div>
      </div>

      {/* Bottom Real-Time Attitude & Reaction Subtitle */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20">
        <div className="px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-center">
          <div className="text-[11px] font-semibold text-rose-400 flex items-center justify-center gap-1.5">
            <span>{expressionBadgeText}</span>
          </div>
          {attitudeText && (
            <p className="text-[11px] text-slate-300 italic truncate mt-0.5">
              "{attitudeText}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
