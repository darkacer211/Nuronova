import React, { useRef, useEffect } from 'react';

export default function ClinicalTelemetryRail({
  gazeTracker,
  acousticAnalyzer,
  videoStreamRef,
  isCameraActive,
  onPause,
  onResetRound,
  onSkipTask,
}) {
  const localVideoRef = useRef(null);
  const volumeLevel = acousticAnalyzer?.volumeLevel ?? 0;
  const isMicActive = acousticAnalyzer?.isRecording ?? false;
  // Green light illuminates when sound/audio energy is received
  const hasAudio = volumeLevel > 0.04;
  const hasCamera = isCameraActive || Boolean(videoStreamRef?.current?.srcObject);

  // Bind live camera input stream to local preview
  useEffect(() => {
    const bindStream = () => {
      const activeStream = videoStreamRef?.current?.srcObject;
      if (localVideoRef.current && activeStream) {
        if (localVideoRef.current.srcObject !== activeStream) {
          localVideoRef.current.srcObject = activeStream;
          localVideoRef.current.play().catch(() => {});
        }
      }
    };

    bindStream();
    const timer = setInterval(bindStream, 400);
    return () => clearInterval(timer);
  }, [videoStreamRef, isCameraActive]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Simple, Small Camera Box & Audio Indicator */}
      <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm p-3.5 border border-surface-container-high/60 transition-colors flex flex-col gap-3">
        {/* Top Header: Camera Label & Small Circular Audio Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hasCamera ? 'bg-secondary animate-pulse' : 'bg-outline-variant'
              }`}
            ></span>
            <span className="font-headline-sm text-[13px] font-bold text-on-surface">
              Camera Input
            </span>
          </div>

          {/* Small Circular Audio Button with dynamic green light */}
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[10px] text-on-surface-variant font-medium">
              {hasAudio ? 'Audio Detected' : isMicActive ? 'Listening' : 'Audio Standby'}
            </span>
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                hasAudio
                  ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(0,108,73,0.65)] scale-110'
                  : 'bg-surface-container text-on-surface-variant border border-surface-container-high'
              }`}
              title={hasAudio ? 'Audio input active' : 'Listening for audio'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {hasAudio ? 'mic' : 'mic_none'}
              </span>
            </div>
          </div>
        </div>

        {/* Small, Clean Camera Box displaying Live Feed */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black/90 border border-surface-container-high/60 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />

          {!hasCamera && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-white/60 bg-surface-container-highest">
              <span className="material-symbols-outlined text-[24px]">videocam_off</span>
              <span className="font-body-sm text-[11px]">Camera Standby</span>
            </div>
          )}

          {hasCamera && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Supervisor Controls */}
      <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm p-4 flex flex-col gap-2 border border-surface-container-high/60 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Supervisor Controls
          </span>
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60">
            Testing Mode
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onPause}
            className="px-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center justify-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">pause</span>
            <span>Pause</span>
          </button>
          <button
            onClick={onResetRound}
            className="px-2 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-semibold transition-colors flex items-center justify-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">replay</span>
            <span>Reset</span>
          </button>
          <button
            onClick={onSkipTask}
            className="px-2 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 font-body-sm text-[12px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
            type="button"
            title="Temporary testing button: Skip current test and advance to next test"
          >
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
            <span>Skip Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}
