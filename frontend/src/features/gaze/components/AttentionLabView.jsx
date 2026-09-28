import React, { useState } from 'react';
import { Eye, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Camera, Lock, Info } from 'lucide-react';
import GazeConsentModal from './GazeConsentModal';
import CalibrationView from './CalibrationView';
import FreeViewingTask from './FreeViewingTask';

export default function AttentionLabView({ onBack }) {
  // steps: 'intro', 'calibrating', 'viewing', 'results'
  const [step, setStep] = useState('intro');
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [qualityResult, setQualityResult] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleStartConsent = () => {
    setIsConsentModalOpen(true);
  };

  const handleAcceptConsent = () => {
    setIsConsentModalOpen(false);
    setHasConsented(true);
    setStep('calibrating');
  };

  const handleDeclineConsent = () => {
    setIsConsentModalOpen(false);
    setHasConsented(false);
  };

  const handleCalibrationDone = (quality) => {
    setQualityResult(quality);
    setStep('viewing');
  };

  const handleTaskComplete = (results) => {
    setAnalysisResults(results);
    setStep('results');
  };

  const handleReset = () => {
    setStep('intro');
    setQualityResult(null);
    setAnalysisResults(null);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <GazeConsentModal
        isOpen={isConsentModalOpen}
        onAccept={handleAcceptConsent}
        onDecline={handleDeclineConsent}
      />

      {/* Step 1: Attention Lab Intro */}
      {step === 'intro' && (
        <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <Eye size={28} color="var(--violet-glow)" />
          </div>

          <span className="badge-pill badge-violet" style={{ marginBottom: '10px', display: 'inline-block' }}>
            Experimental Research Module • Attention Lab
          </span>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
            Oculomotor Attention & Free-Viewing Exploration
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            Modeled on recent eye-tracking studies (Deng et al., ECML PKDD 2022), this voluntary module estimates natural exploratory gaze, visual dwelling patterns, and blink stability during a short free-viewing stimulus task.
          </p>

          {/* Strict Non-Diagnostic Warning Banner */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              textAlign: 'left',
              maxWidth: '680px',
              margin: '0 auto 24px auto',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <ShieldAlert size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.84rem', color: '#fef3c7', lineHeight: 1.5 }}>
              <strong>Strict Clinical Disclaimer: </strong>
              This module is strictly experimental and for research/informational curiosity only. Webcam eye tracking is far less precise than laboratory infrared hardware. <strong>It cannot diagnose ADHD or Autism</strong>, and it will <strong>never</strong> modify your clinical questionnaire scores.
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            {onBack && (
              <button onClick={onBack} className="btn-secondary" style={{ padding: '12px 22px', fontSize: '0.9rem' }}>
                Back to Screeners
              </button>
            )}
            <button onClick={handleStartConsent} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
              <Camera size={16} />
              <span>Review Privacy & Start Attention Lab</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Calibration */}
      {step === 'calibrating' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge-pill badge-cyan">Step 1 of 2: 5-Point Calibration</span>
            <button onClick={handleReset} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
              Cancel
            </button>
          </div>
          <CalibrationView
            onCalibrationComplete={handleCalibrationDone}
            onCancel={handleReset}
          />
        </div>
      )}

      {/* Step 3: Free-Viewing Stimulus */}
      {step === 'viewing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FreeViewingTask
            quality={qualityResult}
            onTaskComplete={handleTaskComplete}
            onCancel={handleReset}
          />
        </div>
      )}

      {/* Step 4: Results Dashboard */}
      {step === 'results' && analysisResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span className="badge-pill badge-violet" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  Attention Lab Analysis Completed
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                  Descriptive Oculomotor Attention Profile
                </h3>
              </div>
              <button onClick={handleReset} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.84rem' }}>
                <RotateCcw size={14} />
                <span>Repeat Task</span>
              </button>
            </div>

            {/* Notice */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                marginBottom: '24px',
              }}
            >
              <Info size={14} color="var(--cyan-glow)" style={{ display: 'inline', marginRight: '6px' }} />
              <span>{analysisResults.strictNotice}</span>
            </div>

            {/* Metric Tiles */}
            {analysisResults.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>OFF-SCREEN DIVERSION</div>
                  <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                    {analysisResults.metrics.offScreenPercent}%
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {analysisResults.interpretations.offScreenTime}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>MEAN FIXATION DWELL</div>
                  <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--violet-glow)' }}>
                    {analysisResults.metrics.meanFixationDurationMs} ms
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {analysisResults.interpretations.fixationStyle}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>EXPLORATORY SACCADES</div>
                  <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-glow)' }}>
                    {analysisResults.metrics.saccadeRatePerMin} / min
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {analysisResults.interpretations.saccadeProfile}
                  </div>
                </div>
              </div>
            )}

            {/* Quality Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Data Quality Score: {analysisResults.quality?.qualityScore}% ({analysisResults.quality?.grade})</span>
              <span>All video frames discarded on-device • 0 bytes uploaded</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
