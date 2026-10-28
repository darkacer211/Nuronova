import React, { useRef, useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakInstruction, stopAllSpeech, isAudioPlaying } from '../services/speechEngine';

export default function ClinicalTelemetryRail({
  currentStep,
  testId,
  gazeTracker,
  acousticAnalyzer,
  videoStreamRef,
  cameraStream,
  isCameraActive,
  onRequestCamera,
  onPause,
  onResetRound,
  onSkipTask,
}) {
  const { language, t, getTestExplanation } = useLanguage();
  const [isExplaining, setIsExplaining] = useState(false);
  const localVideoRef = useRef(null);
  const volumeLevel = acousticAnalyzer?.volumeLevel ?? 0;
  const isMicActive = acousticAnalyzer?.isRecording ?? false;
  // Green light illuminates when sound/audio energy is received
  const hasAudio = volumeLevel > 0.04;
  const hasCamera = isCameraActive || Boolean(cameraStream) || Boolean(videoStreamRef?.current?.srcObject);

  // Stop explanation speech when test step changes or unmounts
  useEffect(() => {
    stopAllSpeech();
    setIsExplaining(false);
  }, [currentStep, testId, language]);

  // Bind live camera input stream to local preview
  useEffect(() => {
    const bindStream = () => {
      const activeStream = cameraStream || videoStreamRef?.current?.srcObject;
      if (localVideoRef.current && activeStream) {
        if (localVideoRef.current.srcObject !== activeStream) {
          localVideoRef.current.srcObject = activeStream;
          localVideoRef.current.play().catch(() => {});
        }
        if (gazeTracker?.attachVideo) {
          gazeTracker.attachVideo(localVideoRef.current);
        }
      }
    };

    bindStream();
    const timer = setInterval(bindStream, 400);
    return () => clearInterval(timer);
  }, [cameraStream, videoStreamRef, isCameraActive, gazeTracker]);

  const handleDirectEnableCamera = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      if (onRequestCamera) {
        onRequestCamera(stream);
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
        if (gazeTracker?.startTracking) {
          gazeTracker.startTracking(localVideoRef.current, stream);
        } else if (gazeTracker?.attachVideo) {
          gazeTracker.attachVideo(localVideoRef.current);
        }
      }
    } catch (err) {
      console.warn('Direct camera enable notice:', err);
    }
  };

  // Auto-acquire camera on mount if not active
  useEffect(() => {
    if (!hasCamera && navigator.mediaDevices?.getUserMedia) {
      handleDirectEnableCamera();
    }
  }, []);

  // Resolve current active test ID
  const activeTestKey =
    testId ||
    (currentStep === 'task_pvt'
      ? 'pvt'
      : currentStep === 'task_stroop'
      ? 'stroop'
      : currentStep === 'task_digit_span'
      ? 'digit_span'
      : currentStep === 'task_verbal'
      ? 'verbal'
      : 'pvt');

  // Handle Explain Test toggle
  const handleToggleExplain = () => {
    if (isExplaining || isAudioPlaying()) {
      stopAllSpeech();
      setIsExplaining(false);
    } else {
      const exp = getTestExplanation(activeTestKey);
      if (exp && exp.audioTranscript) {
        setIsExplaining(true);
        speakInstruction({
          text: exp.audioTranscript,
          language,
          testKey: activeTestKey,
          onStart: () => setIsExplaining(true),
          onEnd: () => setIsExplaining(false),
          onError: () => setIsExplaining(false),
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Simple, Small Camera Box, Blink Counter & Audio Indicator */}
      <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm p-3.5 border border-surface-container-high/60 transition-colors flex flex-col gap-3">
        {/* Top Header: Camera Label, Blink Counter & Small Circular Audio Button */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                hasCamera ? 'bg-secondary animate-pulse' : 'bg-outline-variant'
              }`}
            ></span>
            <span className="font-headline-sm text-[13px] font-bold text-on-surface">
              {t('cameraCheckTitle')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Gaze Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold border ${
                gazeTracker?.liveGazeStatus === 'Blink'
                  ? 'bg-primary/20 border-primary text-primary animate-pulse'
                  : gazeTracker?.liveGazeStatus === 'On Screen'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-surface-container border-surface-container-high text-on-surface-variant'
              }`}
              title="Real-time eye gaze engagement"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{gazeTracker?.liveGazeStatus || 'Standby'}</span>
            </div>

            {/* Live Blink Counter Badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface"
              title="Real-time spontaneous blink count tracked via MediaPipe face blendshapes"
            >
              <span className="material-symbols-outlined text-[15px] text-primary">visibility</span>
              <span>Blinks: <strong className="font-mono text-primary text-[13px]">{gazeTracker?.liveBlinkCount ?? 0}</strong></span>
            </div>

            {/* Small Circular Audio Button with dynamic green light */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                hasAudio
                  ? 'bg-secondary text-on-secondary shadow-[0_0_12px_rgba(0,108,73,0.65)] scale-110'
                  : 'bg-surface-container text-on-surface-variant border border-surface-container-high'
              }`}
              title={hasAudio ? t('activeAudio') : t('standbyAudio')}
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
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90 bg-surface-container-highest/95 p-3 text-center">
              <span className="material-symbols-outlined text-[26px] text-primary">videocam</span>
              <span className="font-body-sm text-[12px] font-semibold text-on-surface">{t('standbyAudio')}</span>
              <button
                onClick={handleDirectEnableCamera}
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>{t('cameraEnable')}</span>
              </button>
            </div>
          )}

          {hasCamera && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span>{t('cameraLive')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Supervisor Controls on the Right Rail */}
      <div className="w-full rounded-xl bg-surface-container-lowest shadow-sm p-4 flex flex-col gap-2.5 border border-surface-container-high/60 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t('supervisorControls')}
          </span>
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
            {t('testingMode')}
          </span>
        </div>

        {/* Primary Action Buttons: Pause, Explain Test, Skip Test */}
        <div className="grid grid-cols-3 gap-2">
          {/* Pause Button */}
          <button
            onClick={onPause}
            className="px-2 py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-[12px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
            type="button"
            title="Pause current test"
          >
            <span className="material-symbols-outlined text-[16px]">pause</span>
            <span>{t('pause')}</span>
          </button>

          {/* Explain Test Button - Positioned with Pause and Skip at the right */}
          <button
            onClick={handleToggleExplain}
            className={`px-2 py-2.5 rounded-lg font-body-sm text-[12px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm ${
              isExplaining
                ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error animate-pulse'
                : 'bg-primary text-on-primary hover:bg-primary-container hover:shadow'
            }`}
            type="button"
            title={isExplaining ? t('stopAudio') : 'Explain Test'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExplaining ? 'stop' : 'volume_up'}
            </span>
            <span>{isExplaining ? t('stopAudio') : 'Explain Test'}</span>
          </button>

          {/* Skip Test Button */}
          <button
            onClick={onSkipTask}
            className="px-2 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 font-body-sm text-[12px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-sm"
            type="button"
            title="Skip current test and advance"
          >
            <span className="material-symbols-outlined text-[16px]">skip_next</span>
            <span>{t('skipTest')}</span>
          </button>
        </div>

        {/* Secondary Reset Button */}
        {onResetRound && (
          <button
            onClick={onResetRound}
            className="w-full py-1.5 rounded-lg bg-surface-container/60 hover:bg-surface-container text-on-surface-variant font-body-sm text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">replay</span>
            <span>{t('resetRound')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
