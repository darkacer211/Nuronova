import React from 'react';
import { Activity, ShieldCheck, Cpu, Mic, Eye } from 'lucide-react';

export default function Header({ currentStep, gazeActive, micActive, onReset }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-badge" onClick={onReset} title="Return to Screening Home">
          <div className="brand-logo-icon">🧠</div>
          <div className="brand-text">
            <h1>NeuroNova</h1>
            <span>Cognitive Neuro-Analytics & Screening</span>
          </div>
        </div>

        <div className="header-telemetry">
          <div className="telemetry-chip active" title="Zero video sent over network. MediaPipe runs strictly in-browser.">
            <ShieldCheck size={14} color="#10b981" />
            <span>Edge Privacy Protected</span>
          </div>

          <div className={`telemetry-chip ${gazeActive ? 'active' : ''}`}>
            <Eye size={14} color={gazeActive ? '#10b981' : '#94a3b8'} />
            <span>Oculomotor: {gazeActive ? 'Active' : 'Standby'}</span>
          </div>

          <div className={`telemetry-chip ${micActive ? 'active' : ''}`}>
            <Mic size={14} color={micActive ? '#10b981' : '#94a3b8'} />
            <span>Phonation: {micActive ? 'Live' : 'Standby'}</span>
          </div>

          {currentStep !== 'preflight' && (
            <button
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Reset Session
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
