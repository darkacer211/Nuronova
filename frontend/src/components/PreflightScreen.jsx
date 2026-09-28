import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight, Activity, Brain } from 'lucide-react';

export default function PreflightScreen({
  onStartProtocol,
  gazeTracker,
  acousticAnalyzer,
}) {
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [participantId, setParticipantId] = useState(() => 'NN-' + Math.floor(1000 + Math.random() * 9000));
  const videoPreviewRef = useRef(null);

  // Request camera and initialize gaze tracker
  const handleEnableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
        await gazeTracker.startTracking(videoPreviewRef.current);
        setCameraReady(true);
      }
    } catch (err) {
      console.warn('Camera permission issue:', err);
      // Fallback mode allows user to proceed even if no camera
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
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Welcome Card */}
      <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span className="badge-pill badge-cyan">Neuro-Cognitive Assessment v1.0</span>
          <span className="badge-pill badge-violet">Multimodal Telemetry</span>
        </div>
        <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Welcome to the NeuroNova Screening Suite
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '720px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
          An advanced cognitive performance evaluation quantifying executive inhibition, sustained psychomotor vigilance, working memory updating, and speech fluency.
        </p>

        {/* Protocol Steps Overview */}
        <div className="grid-4" style={{ marginTop: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ color: 'var(--cyan-glow)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>TASK 1</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>Psychomotor Vigilance</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Sub-millisecond reaction times & sustained alertness lapses.</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ color: 'var(--violet-glow)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>TASK 2</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>Dual-Rule Stroop</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Cognitive interference cost & executive response inhibition.</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ color: 'var(--emerald-glow)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>TASK 3</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>N-Back Working Memory</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Signal sensitivity index (d') and active phonological buffer.</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
            <div style={{ color: 'var(--amber-primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>TASK 4</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>Verbal Phonation</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Lexical retrieval velocity, pause ratios, and speech rate.</div>
          </div>
        </div>
      </div>

      {/* Pre-flight Diagnostic Panels */}
      <div className="grid-2">
        {/* Camera & Oculomotor Sensor Diagnostic */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Camera size={20} color="var(--cyan-glow)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Webcam & Gaze Sensor</h3>
            </div>
            {cameraReady ? (
              <span className="badge-pill badge-emerald">Connected</span>
            ) : (
              <span className="badge-pill badge-amber">Optional</span>
            )}
          </div>

          <div style={{ width: '100%', height: '200px', background: '#07090e', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
            <video
              ref={videoPreviewRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            {!cameraReady && (
              <div style={{ position: 'absolute', textAlign: 'center', padding: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Enable webcam to track gaze stability, blinks, and head posture.
                </p>
                <button onClick={handleEnableCamera} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px' }}>
                  Enable Camera Preview
                </button>
              </div>
            )}
            {cameraReady && (
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px', background: 'rgba(7,9,14,0.75)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Face Status: {gazeTracker.faceDetected ? '🟢 Detected' : '🟡 Align Center'}</span>
                <span>On-Device GPU/WASM</span>
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '10px' }}>
            Privacy note: Video never leaves your computer. MediaPipe executes strictly within browser memory.
          </p>
        </div>

        {/* Microphone & Audio Diagnostic */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mic size={20} color="var(--violet-glow)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Microphone & Phonation</h3>
            </div>
            {micReady ? (
              <span className="badge-pill badge-emerald">Calibrated</span>
            ) : (
              <span className="badge-pill badge-amber">Optional</span>
            )}
          </div>

          <div style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#07090e', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-subtle)' }}>
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
                  Microphone stream active. Speak to test VU meter:
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
              Participant Session ID (Hashed / Anonymized):
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

      {/* Consent & Ethics Checkbox */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            id="consentCheckbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            style={{ marginTop: '4px', cursor: 'pointer', accentColor: 'var(--cyan-primary)', width: '18px', height: '18px' }}
          />
          <label htmlFor="consentCheckbox" style={{ fontSize: '0.86rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-main)' }}>Participant Consent & Functional Disclosure:</strong> I acknowledge that NeuroNova collects reaction latency, eye-gaze distribution, and speech fluency strictly for cognitive performance awareness and research benchmarking. This assessment is non-diagnostic and does not replace medical consultation.
          </label>
        </div>

        <button
          id="startScreeningBtn"
          className="btn-primary"
          disabled={!consentGiven}
          style={{ whiteSpace: 'nowrap', opacity: consentGiven ? 1 : 0.4 }}
          onClick={() => onStartProtocol(participantId)}
        >
          <span>Begin Screening</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
