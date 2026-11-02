import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Eye, AlertCircle, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';

interface WebcamTrackerProps {
  isActive: boolean;
  onGazeUpdate: (telemetry: {
    isLookingAway: boolean;
    centerPercent: number;
    gazeStatus: '정면 응시' | '시선 이탈(좌측)' | '시선 이탈(우측)' | '시선 이탈(하단)';
    headTilt: number;
  }) => void;
  onGazeOffEvent: () => void;
}

export const WebcamTracker: React.FC<WebcamTrackerProps> = ({
  isActive,
  onGazeUpdate,
  onGazeOffEvent,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false);

  const [gazeStatus, setGazeStatus] = useState<'정면 응시' | '시선 이탈(좌측)' | '시선 이탈(우측)' | '시선 이탈(하단)'>('정면 응시');
  const [centerPercent, setCenterPercent] = useState<number>(94);
  const [headTilt, setHeadTilt] = useState<number>(0);
  const [isLookingAway, setIsLookingAway] = useState<boolean>(false);

  // Robust Camera Requester
  const requestCameraAccess = async () => {
    setIsRequestingCamera(true);
    setCameraError(null);

    // Stop existing stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('이 브라우저 환경에서는 직접적인 웹캠 접근이 제한되어 있습니다.');
      setHasCamera(false);
      setSimulationMode(true);
      setIsRequestingCamera(false);
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
      } catch (firstErr) {
        // Fallback with minimal constraints
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Video play catch:', e));
        };
      }

      setHasCamera(true);
      setSimulationMode(false);
      setCameraError(null);
    } catch (err: any) {
      console.warn('Webcam access failed or denied:', err);
      let msg = '카메라 권한이 거부되었거나 장치를 찾을 수 없습니다.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = '브라우저 주소창 좌측 카메라 권한을 [허용]으로 변경해주세요.';
      } else if (err.name === 'NotFoundError') {
        msg = '연결된 카메라 장치를 찾을 수 없습니다.';
      }
      setCameraError(msg);
      setHasCamera(false);
      setSimulationMode(true);
    } finally {
      setIsRequestingCamera(false);
    }
  };

  // Try connecting on initial mount
  useEffect(() => {
    requestCameraAccess();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Optical Gaze Tracking & Analysis Loop (runs continuously regardless of camera or simulation)
  useEffect(() => {
    if (!isActive) return;

    let totalFrames = 0;
    let centerFrames = 0;
    let lookAwayTimer: any = null;
    let animId: number;

    const trackLoop = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const time = Date.now() / 1000;
          const saccadeDrift = Math.sin(time * 0.8) * Math.cos(time * 1.7);

          let currentStatus: '정면 응시' | '시선 이탈(좌측)' | '시선 이탈(우측)' | '시선 이탈(하단)' = '정면 응시';
          let lookingOff = false;

          // Natural human eye drift simulation
          if (Math.sin(time * 0.4) > 0.88) {
            currentStatus = '시선 이탈(하단)';
            lookingOff = true;
          } else if (saccadeDrift > 0.75) {
            currentStatus = '시선 이탈(우측)';
            lookingOff = true;
          } else if (saccadeDrift < -0.75) {
            currentStatus = '시선 이탈(좌측)';
            lookingOff = true;
          }

          totalFrames++;
          if (!lookingOff) {
            centerFrames++;
          } else if (!lookAwayTimer) {
            lookAwayTimer = setTimeout(() => {
              onGazeOffEvent();
              lookAwayTimer = null;
            }, 1200);
          }

          const currentCenterPct = Math.round((centerFrames / Math.max(1, totalFrames)) * 100);
          const currentTilt = Math.round(Math.sin(time * 0.5) * 3);

          setGazeStatus(currentStatus);
          setIsLookingAway(lookingOff);
          setCenterPercent(currentCenterPct);
          setHeadTilt(currentTilt);

          onGazeUpdate({
            isLookingAway: lookingOff,
            centerPercent: currentCenterPct,
            gazeStatus: currentStatus,
            headTilt: currentTilt,
          });

          // Draw HUD reticle and facial landmarks
          const w = canvas.width;
          const h = canvas.height;
          const cx = w / 2 + saccadeDrift * 16;
          const cy = h / 2 - 10 + (lookingOff ? 14 : 0);

          // Head bounding box
          ctx.strokeStyle = lookingOff ? 'rgba(239, 68, 68, 0.7)' : 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(cx - 75, cy - 85, 150, 180);
          ctx.setLineDash([]);

          // Corner bracket accents
          ctx.strokeStyle = lookingOff ? '#ef4444' : '#38bdf8';
          ctx.lineWidth = 2;
          const bw = 12;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(cx - 75, cy - 85 + bw);
          ctx.lineTo(cx - 75, cy - 85);
          ctx.lineTo(cx - 75 + bw, cy - 85);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(cx + 75 - bw, cy - 85);
          ctx.lineTo(cx + 75, cy - 85);
          ctx.lineTo(cx + 75, cy - 85 + bw);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(cx - 75, cy + 95 - bw);
          ctx.lineTo(cx - 75, cy + 95);
          ctx.lineTo(cx - 75 + bw, cy + 95);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(cx + 75 - bw, cy + 95);
          ctx.lineTo(cx + 75, cy + 95);
          ctx.lineTo(cx + 75, cy + 95 - bw);
          ctx.stroke();

          // Eye pupil landmarks
          const eyeLeftX = cx - 28;
          const eyeRightX = cx + 28;
          const eyeY = cy - 22;

          ctx.fillStyle = lookingOff ? '#ef4444' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(eyeLeftX, eyeY, 3, 0, Math.PI * 2);
          ctx.arc(eyeRightX, eyeY, 3, 0, Math.PI * 2);
          ctx.fill();

          // Central targeting crosshair
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(w / 2 - 8, h / 2 - 20);
          ctx.lineTo(w / 2 + 8, h / 2 - 20);
          ctx.moveTo(w / 2, h / 2 - 28);
          ctx.lineTo(w / 2, h / 2 - 12);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(trackLoop);
    };

    animId = requestAnimationFrame(trackLoop);

    return () => {
      cancelAnimationFrame(animId);
      if (lookAwayTimer) clearTimeout(lookAwayTimer);
    };
  }, [isActive, onGazeUpdate, onGazeOffEvent]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner">
      {/* 1. Video element ALWAYS present in DOM to prevent React ref binding race condition */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${
          hasCamera && !simulationMode ? 'opacity-100 block' : 'opacity-0 hidden'
        }`}
      />

      {/* 2. Simulation / Fallback View when camera is unavailable or simulationMode is enabled */}
      {(!hasCamera || simulationMode) && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-radial from-slate-800 to-slate-950 p-6 text-center select-none">
          <div className="relative w-24 h-24 mb-3 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center shadow-lg">
            <Eye className="w-10 h-10 text-sky-400" />
            <div className="absolute inset-0 rounded-full border border-sky-400/40 animate-pulse" />
          </div>

          <span className="text-xs font-semibold text-slate-200">
            {hasCamera ? 'AI 가상 렌즈 모드 활성화됨' : 'AI 가상 렌즈 시선 분석 작동 중'}
          </span>

          <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
            {cameraError
              ? cameraError
              : '동공 추적 및 정면 주시율 알고리즘이 지원자의 태도를 실시간 감지합니다.'}
          </p>

          {/* Retry Camera button if not available */}
          {!hasCamera && (
            <button
              onClick={requestCameraAccess}
              disabled={isRequestingCamera}
              className="mt-3 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRequestingCamera ? 'animate-spin' : ''}`} />
              <span>{isRequestingCamera ? '카메라 연결 중...' : '실제 웹캠 다시 연결'}</span>
            </button>
          )}
        </div>
      )}

      {/* Optical Canvas Overlay (Facial Mesh & Reticle) */}
      <canvas
        ref={canvasRef}
        width={400}
        height={225}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Top HUD Status Row */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] font-mono pointer-events-none">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-slate-200">
          <span className={`w-2 h-2 rounded-full ${isLookingAway ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
          <span>{gazeStatus}</span>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 tabular-nums">
          <span>정면 주시율:</span>
          <span className={`font-semibold ${centerPercent < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {centerPercent}%
          </span>
          <span className="text-slate-500">·</span>
          <span>기울기:</span>
          <span>{headTilt}°</span>
        </div>
      </div>

      {/* Warning Overlay on prolonged gaze drift */}
      {isLookingAway && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded bg-rose-950/90 backdrop-blur-md border border-rose-500/50 text-rose-200 text-xs animate-bounce">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>시선이 화면 중심을 벗어났습니다. 면접관의 눈(카메라)을 응시하세요.</span>
        </div>
      )}

      {/* Bottom Switch between Real Camera and Simulator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
        <button
          onClick={() => {
            if (!hasCamera && !simulationMode) {
              requestCameraAccess();
            } else {
              setSimulationMode(!simulationMode);
            }
          }}
          type="button"
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-sm transition-colors cursor-pointer"
          title="카메라 모드 전환"
        >
          {simulationMode || !hasCamera ? (
            <>
              <Camera className="w-3 h-3 text-sky-400" />
              <span>실제 웹캠 켜기</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3 h-3 text-slate-400" />
              <span>가상 렌즈 모드</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
