import React from 'react';

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

        {/* Global Action */}
        <div className="header-telemetry">
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
