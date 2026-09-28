import React, { useState } from 'react';
import { Camera, ShieldCheck, Eye, Lock, AlertTriangle, X, Check } from 'lucide-react';

export default function GazeConsentModal({
  isOpen,
  isChild = false,
  onAccept,
  onDecline,
}) {
  const [parentConsentChecked, setParentConsentChecked] = useState(false);
  const [dataPolicyChecked, setDataPolicyChecked] = useState(false);

  if (!isOpen) return null;

  const canProceed = !isChild ? dataPolicyChecked : (dataPolicyChecked && parentConsentChecked);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '32px',
          border: '1px solid rgba(139, 92, 246, 0.35)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
          position: 'relative',
        }}
      >
        <button
          onClick={onDecline}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Eye size={24} color="var(--violet-glow)" />
          </div>
          <div>
            <span className="badge-pill badge-violet" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>
              Attention Lab • Voluntary Research Module
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              {isChild ? 'Parental Camera & Gaze Consent' : 'Webcam Gaze Tracking Consent'}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
          The Attention Lab module can optionally capture webcam movement during a short free-viewing video to measure exploratory attention, blink rates, and visual dwell times. Camera use is <strong>strictly optional</strong> and default <strong>OFF</strong>. All cognitive screeners work completely without a camera.
        </p>

        {/* Privacy Guarantees */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '18px',
            marginBottom: '20px',
            fontSize: '0.84rem',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <Lock size={16} color="var(--emerald-glow)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>100% On-Device Processing: </strong>
              <span style={{ color: 'var(--text-muted)' }}>
                Face and iris landmarking runs exclusively inside your browser via WebAssembly. <strong>Raw video frames are never stored, saved, or uploaded to any server.</strong> Frames are discarded immediately after computing numerical eye coordinates.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <ShieldCheck size={16} color="var(--cyan-glow)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Zero Biometric Templates: </strong>
              <span style={{ color: 'var(--text-muted)' }}>
                No facial geometry or biometric recognition templates are generated or stored. Only aggregated statistical counts (e.g. 18 blinks/min, 92% screen engagement) are preserved.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#fff' }}>Experimental & Non-Diagnostic: </strong>
              <span style={{ color: 'var(--text-muted)' }}>
                Webcam eye tracking is an experimental research tool with lower precision than clinical eye trackers. It will <strong>never</strong> diagnose ADHD or modify your clinical questionnaire scores.
              </span>
            </div>
          </div>
        </div>

        {/* Explicit Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={dataPolicyChecked}
              onChange={(e) => setDataPolicyChecked(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <span>
              I understand that webcam analysis is experimental and purely descriptive, that video is discarded on-device, and I voluntarily consent to browser gaze feature estimation.
            </span>
          </label>

          {isChild && (
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.84rem', color: 'var(--cyan-glow)' }}>
              <input
                type="checkbox"
                checked={parentConsentChecked}
                onChange={(e) => setParentConsentChecked(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                <strong>COPPA Parental Authorization: </strong> I certify that I am the parent or legal guardian of the child participant and provide explicit consent for this voluntary viewing exercise.
              </span>
            </label>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onDecline} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            Skip Camera (Recommended)
          </button>
          <button
            onClick={onAccept}
            disabled={!canProceed}
            className="btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              opacity: canProceed ? 1 : 0.5,
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            <Camera size={16} />
            <span>Enable Camera for Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}
