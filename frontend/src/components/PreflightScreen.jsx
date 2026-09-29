import React, { useState, useRef } from 'react';

export default function PreflightScreen({
  onStartProtocol,
  onStartToddlerScreening,
  gazeTracker,
  acousticAnalyzer,
  onCameraStreamReady,
}) {
  const [selectedPathway, setSelectedPathway] = useState('full'); // 'full' or 'toddler'
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [participantId] = useState(() => 'NN-2025-' + Math.floor(100 + Math.random() * 900) + 'B');
  const [ageBracket, setAgeBracket] = useState('26-45');
  const [toddlerNickname, setToddlerNickname] = useState('');
  const videoPreviewRef = useRef(null);

  // Request camera and initialize gaze tracking
  const handleEnableCamera = async () => {
    try {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
      } catch (err1) {
        console.warn('Ideal video constraint failed, attempting generic video:', err1);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }
      if (onCameraStreamReady) {
        onCameraStreamReady(stream);
      }
      setCameraReady(true);
    } catch (err) {
      console.warn('Camera permission issue:', err);
      setCameraReady(false);
      alert('Camera access could not be acquired. Please ensure camera permissions are allowed in your browser address bar.');
    }
  };

  // Request mic and test level
  const handleEnableMic = async () => {
    const success = await acousticAnalyzer.startAcousticCapture();
    if (success) {
      setMicReady(true);
    }
  };

  // Volume scale calculation for animated voice waveform
  const vol = acousticAnalyzer?.volumeLevel ?? 0;
  // Normalized dynamic multiplier
  const volMultiplier = Math.max(vol * 5, 0.25);

  // Sound wave bar heights pattern matching the user's reference image
  const leftBarHeights = [14, 28, 42, 54, 38, 48, 30];
  const rightBarHeights = [30, 48, 38, 54, 42, 28, 14];

  return (
    <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-6 pb-16">
      {/* 1. TOP CONSOLE META BANNER */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[24px]">vital_signs</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-primary">
                Begin Assessment Console
              </span>

            </div>
            <h1 className="font-headline-sm text-[20px] font-bold text-on-surface tracking-tight mt-0.5">
              Protocol Configuration & Sensor Calibration
            </h1>
          </div>
        </div>


      </div>

      {/* 2. CLINICAL PATHWAY SELECTION DECK WITH HOVER REVEALS */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60 flex flex-col gap-6 transition-colors">
        <div className="flex flex-col gap-1">
          <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-primary">
            Step 1 of 2: Pathway Allocation
          </span>
          <h2 className="font-headline-lg text-[24px] font-bold text-on-surface tracking-tight">
            Select Clinical Assessment Protocol
          </h2>
        </div>

        {/* The Two Pathway Cards with Mouse Hover Reveal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pathway A: Adults & Youth (16+) Full Battery */}
          <div
            onClick={() => setSelectedPathway('full')}
            className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              selectedPathway === 'full'
                ? 'bg-surface-container-high/40 border-primary shadow-sm'
                : 'bg-surface-container-low border-surface-container-high hover:border-primary/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-[11px] font-bold uppercase tracking-wider">
                  Comprehensive Battery
                </span>
                <span className="font-telemetry-data text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>~8–10 mins</span>
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-on-primary shadow-md transition-transform duration-200 group-hover:scale-105 ${
                  selectedPathway === 'full'
                    ? 'bg-gradient-to-tr from-primary to-primary-container text-white'
                    : 'bg-surface-container-highest text-primary'
                }`}>
                  <span className="material-symbols-outlined text-[32px]">psychology</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-headline-sm text-[18px] font-bold text-on-surface">
                      Adults & Youth (Ages 16+)
                    </h3>
                  </div>
                  <span className="font-body-sm text-[13px] text-on-surface-variant">
                    Computer Reflex Tasks + Behavioral Screeners
                  </span>
                </div>
              </div>

              {/* Module Inclusion Badges */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-surface-container-high/60">
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Reaction Kinetics (PVT)
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Stroop Executive
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Digit Span Buffer
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Speech Phonation
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  ASRS-6 & AQ-10
                </span>
              </div>
            </div>
          </div>

          {/* Pathway B: Toddlers (16–30m) & Children */}
          <div
            onClick={() => setSelectedPathway('toddler')}
            className={`group relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
              selectedPathway === 'toddler'
                ? 'bg-surface-container-high/40 border-secondary shadow-sm'
                : 'bg-surface-container-low border-surface-container-high hover:border-secondary/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-caps text-[11px] font-bold uppercase tracking-wider">
                  Caregiver Assisted
                </span>
                <span className="font-telemetry-data text-[12px] text-on-surface-variant font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>~4–5 mins</span>
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-on-secondary shadow-md transition-transform duration-200 group-hover:scale-105 ${
                  selectedPathway === 'toddler'
                    ? 'bg-gradient-to-tr from-secondary to-emerald-500 text-white'
                    : 'bg-surface-container-highest text-secondary'
                }`}>
                  <span className="material-symbols-outlined text-[32px]">child_care</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-headline-sm text-[18px] font-bold text-on-surface">
                      Toddlers (16–30m) & Children
                    </h3>
                  </div>
                  <span className="font-body-sm text-[13px] text-on-surface-variant">
                    Standardized Parent Observation (M-CHAT-R/F)
                  </span>
                </div>
              </div>

              {/* Module Inclusion Badges */}
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-surface-container-high/60">
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  M-CHAT-R/F Validated
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  20 Milestone Items
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Automated Follow-Up Flow
                </span>
                <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-[11px] font-semibold text-on-surface border border-surface-container-high">
                  Bypasses Reflex Tasks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTIMODAL HARDWARE PREFLIGHT (SQUARE WEBCAM & BILATERAL AUDIO WAVEFORM) */}
      {selectedPathway === 'full' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Edge Oculomotor Cam (Square Viewport) */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-primary">visibility</span>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Eye Tracking Camera
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-label-caps text-[11px] font-bold uppercase ${
                  cameraReady ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {cameraReady ? 'Calibrated (60 FPS)' : 'Standby / Optional'}
                </span>
              </div>

              {/* Square Video Preview Box */}
              <div className="aspect-square w-full max-w-[340px] mx-auto bg-inverse-surface rounded-2xl overflow-hidden relative flex items-center justify-center border border-surface-container-high/40 shadow-md">
                <video
                  ref={videoPreviewRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />

                {!cameraReady && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                    <span className="material-symbols-outlined text-[40px] text-slate-300 mb-2">videocam</span>
                    <p className="font-body-sm text-[13px] text-slate-300 max-w-xs mb-3">
                      Enables real-time blink rate extraction, fixation dispersion, and on-screen gaze adherence.
                    </p>
                    <button
                      onClick={handleEnableCamera}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-[13px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">camera</span>
                      <span>Test & Calibrate Camera</span>
                    </button>
                  </div>
                )}

                {cameraReady && (
                  <>
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      <span className="text-white font-telemetry-data text-[11px]">
                        Gaze: {gazeTracker.faceDetected ? 'Centered' : 'Searching'}
                      </span>
                    </div>



                    <div className="absolute bottom-2 inset-x-2 z-20 bg-black/70 backdrop-blur-md p-2 rounded-lg flex items-center justify-between text-white text-[11px] font-telemetry-data border border-white/10">
                      <span>Face Mesh: {gazeTracker.faceDetected ? '🟢 478 Points Locked' : '🟡 Centering'}</span>
                      <span className="text-secondary font-semibold">WebAssembly Active</span>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>

          {/* Card 2: Phonation Acoustic Sensor (Animated Bilateral Sound Waves) */}
          <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-primary">mic</span>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Speech Phonation Sensor
                  </h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-label-caps text-[11px] font-bold uppercase ${
                  micReady ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {micReady ? 'Calibrated' : 'Standby / Optional'}
                </span>
              </div>

              {/* Square / Balanced Container with Animated Bilateral Soundwave Logo */}
              <div className="aspect-square w-full max-w-[340px] mx-auto bg-surface-container-low rounded-2xl p-6 flex flex-col justify-center items-center border border-surface-container-high/40 text-center shadow-inner relative overflow-hidden">
                {!micReady ? (
                  <div className="flex flex-col items-center">
                    {/* Idle Static Graphic */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                      <span className="w-1.5 h-4 rounded-full bg-primary/40"></span>
                      <span className="w-1.5 h-7 rounded-full bg-primary/40"></span>
                      <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-md mx-1">
                        <span className="material-symbols-outlined text-[28px]">mic</span>
                      </div>
                      <span className="w-1.5 h-7 rounded-full bg-primary/40"></span>
                      <span className="w-1.5 h-4 rounded-full bg-primary/40"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    </div>

                    <p className="font-body-sm text-[13px] text-on-surface-variant max-w-xs mb-4">
                      Calibrates microphone sensitivity, acoustic amplitude, and speech pause rhythm.
                    </p>
                    <button
                      onClick={handleEnableMic}
                      className="px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-body-sm text-[13px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">mic</span>
                      <span>Calibrate Microphone</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center justify-center">
                    {/* DYNAMIC BILATERAL SOUNDWAVE (Matches uploaded user reference image) */}
                    <div className="flex items-center justify-center gap-1.5 w-full my-4">
                      {/* Left dot */}
                      <span className="w-2 h-2 rounded-full bg-purple-600 self-center"></span>

                      {/* Left expanding soundwave bars */}
                      {leftBarHeights.map((h, i) => {
                        const dynamicHeight = Math.max(h * volMultiplier, 6);
                        return (
                          <div
                            key={`left-${i}`}
                            style={{ height: `${dynamicHeight}px` }}
                            className="w-1.5 bg-gradient-to-t from-purple-700 to-purple-500 rounded-full transition-all duration-75"
                          />
                        );
                      })}

                      {/* Central Circular Microphone Icon Vessel */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-fuchsia-500 flex items-center justify-center text-white shadow-lg mx-2 transform transition-transform duration-100 hover:scale-105">
                        <span className="material-symbols-outlined text-[32px]">mic</span>
                      </div>

                      {/* Right expanding soundwave bars */}
                      {rightBarHeights.map((h, i) => {
                        const dynamicHeight = Math.max(h * volMultiplier, 6);
                        return (
                          <div
                            key={`right-${i}`}
                            style={{ height: `${dynamicHeight}px` }}
                            className="w-1.5 bg-gradient-to-t from-purple-700 to-purple-500 rounded-full transition-all duration-75"
                          />
                        );
                      })}

                      {/* Right dot */}
                      <span className="w-2 h-2 rounded-full bg-purple-600 self-center"></span>
                    </div>

                    <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-secondary mt-3">
                      Live Phonation Stream Active
                    </span>
                    <span className="font-telemetry-data text-[12px] text-on-surface-variant mt-1">
                      Speak aloud to test speech resonance
                    </span>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      ) : (
        /* Toddler Pathway Detail Card */
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
              <span className="material-symbols-outlined text-[22px]">child_care</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
                Pediatric Screening Details
              </h3>
              <span className="font-body-sm text-[12px] text-on-surface-variant">
                Standardized for toddlers aged 16 to 30 months
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <label className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant block mb-1">
              Child's Name or Nickname (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Leo"
              value={toddlerNickname}
              onChange={(e) => setToddlerNickname(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-[14px] text-on-surface outline-none focus:border-secondary"
            />
          </div>
        </div>
      )}

      {/* 4. TARGET AGE SELECTION (CENTERED / COMPACT) */}
      {selectedPathway === 'full' && (
        <div className="p-6 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant block">
              Target Age Bracket:
            </span>
            <span className="font-body-sm text-[13px] text-on-surface-variant">
              Calibrates normative baseline reaction velocity and working memory curves.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['16-25', '26-45', '46-65', '65+'].map((bracket) => (
              <button
                key={bracket}
                onClick={() => setAgeBracket(bracket)}
                className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  ageBracket === bracket
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container text-on-surface border border-surface-container-high'
                }`}
                type="button"
              >
                {bracket}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. CENTERED LAUNCH ACTION & CONSENT CHECKBOX BELOW IT */}
      <div className="p-8 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col items-center justify-center text-center gap-4 transition-colors">
        {/* Centered Primary Launch Button */}
        <button
          onClick={() => {
            if (selectedPathway === 'toddler') {
              onStartToddlerScreening(toddlerNickname || 'Toddler');
            } else {
              onStartProtocol(participantId);
            }
          }}
          disabled={!consentGiven}
          className={`px-10 py-4 rounded-xl font-headline-sm text-[16px] font-bold transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-40 text-white transform hover:scale-[1.01] active:scale-[0.99] ${
            selectedPathway === 'toddler'
              ? 'bg-secondary hover:bg-secondary/90 shadow-secondary/20'
              : 'bg-primary hover:bg-primary-container shadow-primary/25'
          }`}
          type="button"
        >
          <span>
            {selectedPathway === 'toddler' ? 'Launch M-CHAT-R/F Milestone Screener' : 'Begin Full Assessment'}
          </span>
          <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
        </button>

        {/* Well-Formatted Centered Consent Checkbox Directly Below */}
        <div className="flex items-center justify-center gap-2.5 max-w-xl mx-auto pt-1">
          <input
            type="checkbox"
            id="consentCheckbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer flex-shrink-0"
          />
          <label htmlFor="consentCheckbox" className="font-body-sm text-[13px] text-on-surface-variant cursor-pointer leading-normal select-none">
            I understand this functional assessment measures reaction kinetics, working memory, and behavioral traits for cognitive awareness. It is non-diagnostic.
          </label>
        </div>
      </div>
    </div>
  );
}
