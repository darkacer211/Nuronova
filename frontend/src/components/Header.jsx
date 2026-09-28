import React from 'react';
import { Activity, ShieldCheck, Cpu, Mic, Eye, Brain, ClipboardList } from 'lucide-react';

export default function Header({
  activeModule = 'cognitive',
  onSelectModule,
  currentStep,
  gazeActive,
  micActive,
  onReset,
}) {
  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand identity */}
        <div className="brand-badge" onClick={onReset} title="Return to Screening Home">
          <div className="brand-logo-icon">🧠</div>
          <div className="brand-text">
            <h1>NeuroNova</h1>
            <span>Cognitive Neuro-Analytics & Screening</span>
          </div>
        </div>

        {/* Unified Protocol Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
          <Brain size={14} color="var(--cyan-glow)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Unified Protocol: Cognitive Reflexes &bull; Memory &bull; Speech &bull; AuDHD Traits
          </span>
        </div>

        {/* Telemetry Chips */}
        <div className="header-telemetry">
          <div className="telemetry-chip active" title="Zero video sent over network. MediaPipe runs strictly in-browser.">
            <ShieldCheck size={14} color="#10b981" />
            <span>Privacy Guard</span>
          </div>

          <div className={`telemetry-chip ${gazeActive ? 'active' : ''}`}>
            <Eye size={14} color={gazeActive ? '#10b981' : '#94a3b8'} />
            <span>Oculomotor: {gazeActive ? 'Live' : 'Standby'}</span>
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
