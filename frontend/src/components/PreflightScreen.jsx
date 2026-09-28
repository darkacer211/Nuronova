import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight, Activity, Brain, Baby, User, Sparkles } from 'lucide-react';

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
  const [participantId, setParticipantId] = useState(() => 'NN-' + Math.floor(1000 + Math.random() * 9000));
  const [toddlerNickname, setToddlerNickname] = useState('');
  const videoPreviewRef = useRef(null);

  // Request camera and initialize persistent gaze tracker
  const handleEnableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      if (onCameraStreamReady) {
        onCameraStreamReady(stream);
      }
      setCameraReady(true);
    } catch (err) {
      console.warn('Camera permission issue:', err);
      setCameraReady(false);
    }
  };

  // Request mic and test level
  const handleEnableMic = async () => {
    const success = await acousticAnalyzer.startAcousticCapture();
    if (success) {
      setMicReady(true);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Hero Welcome Card */}
      <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="badge-pill badge-cyan">NeuroNova Diagnostics</span>
          <span className="badge-pill badge-violet">Clinical-Grade Architecture</span>
        </div>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em', color: '#ffffff' }}>
          Select Your Screening Pathway
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          Choose the appropriate assessment track based on participant age and developmental requirements.
        </p>

        {/* TWO PATHWAYS SELECTION CARDS */}
        <div className="grid-2" style={{ gap: '20px', textAlign: 'left' }}>
          
          {/* PATHWAY 1: Full Adult / Youth Assessment */}
          <div
            onClick={() => setSelectedPathway('full')}
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: selectedPathway === 'full' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
              border: selectedPathway === 'full' ? '2px solid var(--cyan-glow)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedPathway === 'full' ? '0 0 25px rgba(6, 182, 212, 0.2)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-pill badge-cyan">Comprehensive Battery</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>~8–10 mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={22} color="var(--cyan-glow)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                    Adults & Youth (Ages 16+)
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Computer-Based Tasks + Self-Report</div>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Full multi-modal protocol: Visual reaction time, dual-rule Stroop inhibition, digit span working memory, speech fluency, and adult AuDHD questionnaires (ASRS-6 & AQ-10).
              </p>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--cyan-glow)', fontWeight: 600 }}>
              <span>Includes Edge Vision & Phonation Telemetry</span>
            </div>
          </div>

          {/* PATHWAY 2: Toddler / Child Screening (Direct Parent Report) */}
          <div
            onClick={() => setSelectedPathway('toddler')}
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: selectedPathway === 'toddler' ? 'rgba(139, 92, 246, 0.14)' : 'rgba(255,255,255,0.02)',
              border: selectedPathway === 'toddler' ? '2px solid var(--violet-glow)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedPathway === 'toddler' ? '0 0 25px rgba(139, 92, 246, 0.25)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-pill badge-violet">Parent / Caregiver Assisted</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>~4–5 mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--violet-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Baby size={22} color="var(--violet-glow)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                    Toddlers (16–30 Months) & Children
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Bypasses Laptop Reflex Tasks</div>
                </div>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Directly launches the 20-item <strong>M-CHAT-R/F</strong> parent questionnaire with automatic follow-up clarification for early communication & social milestones. <em>No laptop testing required for the child.</em>
              </p>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--violet-glow)', fontWeight: 600 }}>
              <span>Includes Pediatric Risk Stratification Report</span>
            </div>
          </div>

        </div>
      </div>

      {/* CONDITIONAL SECTION 1: Full Adult / Youth Preflight Diagnostics */}
      {selectedPathway === 'full' && (
        <>
          <div className="grid-2">
            {/* Camera & Oculomotor Sensor Diagnostic */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Camera size={20} color="var(--cyan-glow)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Webcam & Oculomotor Gaze Sensor</h3>
                </div>
                {cameraReady ? (
                  <span className="badge-pill badge-emerald">Connected</span>
                ) : (
                  <span className="badge-pill badge-amber">Optional</span>
                )}
              </div>

              <div style={{ width: '100%', height: '190px', background: '#07090e', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                <video
                  ref={videoPreviewRef}
                  playsInline
                  muted
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                {!cameraReady && (
                  <div style={{ position: 'absolute', textAlign: 'center', padding: '16px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Enable webcam to track spontaneous blink rate, gaze lock, and head pose.
                    </p>
                    <button onClick={handleEnableCamera} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                      Enable Camera Preview
                    </button>
                  </div>
                )}
                {cameraReady && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(7,9,14,0.85)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Face Mesh: {gazeTracker.faceDetected ? '🟢 Locked' : '🟡 Looking at Screen'}</span>
                    <span>Live Blinks: {gazeTracker.liveBlinkCount}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '10px' }}>
                Privacy guarantee: Video is processed strictly in local browser memory. Zero images or video files leave your computer.
              </p>
            </div>

            {/* Microphone & Audio Diagnostic */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mic size={20} color="var(--violet-glow)" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Microphone & Phonation Capture</h3>
                </div>
                {micReady ? (
                  <span className="badge-pill badge-emerald">Calibrated</span>
                ) : (
                  <span className="badge-pill badge-amber">Optional</span>
                )}
              </div>

              <div style={{ minHeight: '190px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#07090e', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
                {!micReady ? (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                      Enable microphone to analyze verbal fluency and phonation pauses.
                    </p>
                    <button onClick={handleEnableMic} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                      Calibrate Microphone
                    </button>
                  </div>
                ) : (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--emerald-glow)', marginBottom: '14px' }}>
                      Microphone stream active. Speak to test audio sensitivity:
                    </p>
                    {/* Audio Level VU Meter */}
                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden', padding: '2px', border: '1px solid var(--border-subtle)' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(acousticAnalyzer.volumeLevel * 100, 100)}%`,
                          background: 'linear-gradient(90deg, var(--emerald-primary), var(--cyan-primary), var(--violet-primary))',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.05s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Participant Session ID:
                </label>
                <input
                  type="text"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Consent & Start Button */}
          <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <input
                type="checkbox"
                id="consentCheckbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--cyan-primary)', width: '18px', height: '18px' }}
              />
              <label htmlFor="consentCheckbox" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--text-main)' }}>Participant Consent: </strong>
                I understand this test measures reaction kinetics, oculomotor gaze stability, and executive performance for cognitive awareness. It is non-diagnostic.
              </label>
            </div>

            <button
              id="startFullBatteryBtn"
              className="btn-primary"
              disabled={!consentGiven}
              style={{ whiteSpace: 'nowrap', opacity: consentGiven ? 1 : 0.4, padding: '12px 24px' }}
              onClick={() => onStartProtocol(participantId)}
            >
              <span>Begin Full Assessment</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </>
      )}

      {/* CONDITIONAL SECTION 2: Toddler / Child Direct Screener */}
      {selectedPathway === 'toddler' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <Baby size={28} color="var(--violet-glow)" />
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Pediatric Autism Milestone Screener (M-CHAT-R/F)
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Target age: 16 to 30 months (and up to 48 months). Completed by parent or primary caregiver.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)', borderRadius: 'var(--radius-md)', padding: '18px 20px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            <strong>Why no computer reflex tasks? </strong>
            Toddlers and young children cannot perform laptop reaction-time clicks, Stroop inhibition, or digit span memory tests. Early autism screening relies exclusively on standardized parental observation of developmental milestones (pointing, joint attention, response to name, pretend play).
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Child's First Name or Nickname (Optional & Private — never stored on external servers):
            </label>
            <input
              type="text"
              placeholder="e.g. Leo (optional)"
              value={toddlerNickname}
              onChange={(e) => setToddlerNickname(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '360px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <button
              onClick={() => setSelectedPathway('full')}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              Back to Full Battery
            </button>

            <button
              id="startToddlerBtn"
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', background: 'linear-gradient(135deg, var(--violet-primary), #7c3aed)' }}
              onClick={() => onStartToddlerScreening(toddlerNickname || 'Toddler')}
            >
              <span>Launch M-CHAT-R/F Questionnaire</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
