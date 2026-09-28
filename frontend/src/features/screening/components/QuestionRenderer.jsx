import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldAlert, Upload } from 'lucide-react';
import ScreeningDisclaimer from './ScreeningDisclaimer';
import { isInstrumentRunnable, getInstrumentLicensing } from '../engine/textLoader';
import LicensingGateModal from './LicensingGateModal';

export default function QuestionRenderer({
  testConfig,
  currentIndex,
  totalItems,
  item,
  currentValue,
  onSelectOption,
  onPrev,
  onNext,
  isLastQuestion,
  onCancel,
}) {
  const [isLicensingModalOpen, setIsLicensingModalOpen] = useState(false);
  const isRunnable = isInstrumentRunnable(testConfig?.id);
  const licenseInfo = getInstrumentLicensing(testConfig?.id);

  const progressPct = Math.round(((currentIndex + 1) / (totalItems || 1)) * 100);

  // Keyboard shortcut support (1-7 for options, Enter for next, ArrowLeft for prev)
  useEffect(() => {
    if (!isRunnable) return;

    const handleKeyDown = (e) => {
      if (!testConfig?.scale) return;
      // Numbers 1 to scale.length
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= testConfig.scale.length) {
        const option = testConfig.scale[num - 1];
        if (option) {
          onSelectOption(option.value);
        }
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onPrev();
      } else if (e.key === 'Enter' && currentValue !== undefined && currentValue !== '') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentValue, testConfig?.scale, onSelectOption, onPrev, onNext, isRunnable]);

  // REFUSE EXECUTION IF TEXT IS NOT LOADED
  if (!isRunnable || !item) {
    return (
      <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <LicensingGateModal
          isOpen={isLicensingModalOpen}
          instrumentId={testConfig?.id}
          instrumentName={testConfig?.name}
          onClose={() => setIsLicensingModalOpen(false)}
          onSuccessLoaded={() => window.location.reload()}
        />

        <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <ShieldAlert size={28} color="#f59e0b" />
          </div>

          <span className="badge-pill badge-amber" style={{ marginBottom: '12px', display: 'inline-block' }}>
            Coming Soon • Licensing Pending
          </span>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            {testConfig?.name || 'Screening Instrument'}
          </h3>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '600px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
            Official question text for this clinical instrument is held under copyright ({licenseInfo.requiredCopyright}). To ensure legal compliance, the UI refuses to run this screener until authorized text is supplied.
          </p>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              maxWidth: '560px',
              margin: '0 auto 24px auto',
              textAlign: 'left',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-dim)' }}>Publisher / Rights: </strong>
              <span style={{ color: '#e2e8f0' }}>{licenseInfo.permissionContact}</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-dim)' }}>Citation: </strong>
              <span style={{ color: '#cbd5e1' }}>{licenseInfo.citation}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button onClick={onCancel} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
              Back to Screeners
            </button>
            <button
              onClick={() => setIsLicensingModalOpen(true)}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            >
              <Upload size={16} />
              <span>Supply Authorized Text</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header / Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge-pill badge-violet" style={{ marginRight: '8px' }}>
            {testConfig.shortName}
          </span>
          {item.subscale && (
            <span className="badge-pill badge-cyan" style={{ textTransform: 'capitalize' }}>
              {item.subscale}
            </span>
          )}
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Question {currentIndex + 1} of {totalItems}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--cyan-primary), var(--violet-primary))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      {/* Main Question Card */}
      <div className="glass-panel" style={{ padding: '36px 32px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
          ITEM #{item.number}
        </div>
        <h3
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            lineHeight: 1.5,
            color: '#ffffff',
            marginBottom: '32px',
          }}
        >
          {item.text}
        </h3>

        {/* Answer Options Radio List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {testConfig.scale.map((option, idx) => {
            const isSelected = currentValue === option.value;

            return (
              <button
                key={String(option.value)}
                onClick={() => onSelectOption(option.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--cyan-glow)' : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(6, 182, 212, 0.25)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: isSelected ? '6px solid var(--cyan-glow)' : '2px solid var(--text-dim)',
                      background: isSelected ? '#ffffff' : 'transparent',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '1rem', fontWeight: isSelected ? 600 : 500 }}>
                    {option.label}
                  </span>
                </div>

                <span
                  className="mono-num"
                  style={{
                    fontSize: '0.78rem',
                    color: isSelected ? 'var(--cyan-glow)' : 'var(--text-dim)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)',
                  }}
                >
                  [{idx + 1}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="btn-secondary"
            style={{ padding: '10px 18px', opacity: currentIndex === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            Exit Screener
          </button>

          <button
            onClick={onNext}
            disabled={currentValue === undefined || currentValue === ''}
            className="btn-primary"
            style={{
              padding: '10px 22px',
              opacity: currentValue === undefined || currentValue === '' ? 0.4 : 1,
            }}
          >
            <span>{isLastQuestion ? 'Complete Questionnaire' : 'Next Question'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <ScreeningDisclaimer compact={true} />
    </div>
  );
}
