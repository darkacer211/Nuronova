import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Upload, AlertCircle, X, RefreshCw } from 'lucide-react';
import { getInstrumentLicensing, loadInstrumentTextBundle, resetLoadedTexts } from '../engine/textLoader';

export default function LicensingGateModal({
  isOpen,
  instrumentId,
  instrumentName,
  onClose,
  onSuccessLoaded,
}) {
  const [inputText, setInputText] = useState('');
  const [loadError, setLoadError] = useState(null);
  const [loadSuccess, setLoadSuccess] = useState(false);

  if (!isOpen || !instrumentId) return null;

  const licenseInfo = getInstrumentLicensing(instrumentId);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          loadInstrumentTextBundle(content);
          setLoadSuccess(true);
          setLoadError(null);
          if (onSuccessLoaded) onSuccessLoaded(instrumentId);
        }
      } catch (err) {
        setLoadError(err.message || 'Failed to parse text bundle.');
        setLoadSuccess(false);
      }
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = () => {
    try {
      if (!inputText.trim()) {
        setLoadError('Please paste valid JSON or CSV item data.');
        return;
      }
      loadInstrumentTextBundle(inputText.trim());
      setLoadSuccess(true);
      setLoadError(null);
      if (onSuccessLoaded) onSuccessLoaded(instrumentId);
    } catch (err) {
      setLoadError(err.message || 'Failed to parse text bundle.');
      setLoadSuccess(false);
    }
  };

  const handleReset = () => {
    resetLoadedTexts(instrumentId);
    setLoadSuccess(false);
    setLoadError(null);
    setInputText('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(5, 7, 15, 0.85)',
        backdropFilter: 'blur(8px)',
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
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.15)',
        }}
      >
        <button
          onClick={onClose}
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
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={22} color="#f59e0b" />
          </div>
          <div>
            <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem', marginBottom: '4px' }}>
              Copyright & Licensing Gate
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {instrumentName || licenseInfo.name}
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
          This instrument is protected by copyright. To respect intellectual property and clinical licensing regulations, official question text is not distributed in the public repository without permission. The screening engine refuses execution until authorized text is supplied.
        </p>

        {/* Legal & Permission Metadata */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-dim)' }}>Status: </strong>
            <span style={{ color: licenseInfo.textLoaded ? '#10b981' : '#f59e0b', textTransform: 'uppercase', fontWeight: 600 }}>
              {licenseInfo.textLoaded ? 'Text Loaded (Ready)' : licenseInfo.status}
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-dim)' }}>Copyright: </strong>
            <span style={{ color: '#e2e8f0' }}>{licenseInfo.requiredCopyright}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-dim)' }}>Citation: </strong>
            <span style={{ color: '#cbd5e1' }}>{licenseInfo.citation}</span>
          </div>
          <div>
            <strong style={{ color: 'var(--text-dim)' }}>Permission Contact: </strong>
            <span style={{ color: 'var(--cyan-glow)' }}>{licenseInfo.permissionContact}</span>
          </div>
        </div>

        {/* Dynamic Loader Form */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
            Supply Authorized Item Text (JSON or CSV)
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
            Provide your licensed item bundle. Once supplied, it replaces placeholders with zero code modifications.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <label className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={14} />
              <span>Upload JSON / CSV</span>
              <input type="file" accept=".json,.csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            {licenseInfo.textLoaded && (
              <button onClick={handleReset} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                <RefreshCw size={14} />
                <span>Clear Loaded Text</span>
              </button>
            )}
          </div>

          <textarea
            placeholder={`Or paste JSON or CSV here, e.g.:\n{\n  "${instrumentId}": [\n    { "number": 1, "text": "Question 1 official wording" }\n  ]\n}`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{
              width: '100%',
              height: '110px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              color: '#e2e8f0',
              resize: 'vertical',
            }}
          />

          {loadError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontSize: '0.82rem', marginTop: '8px' }}>
              <AlertCircle size={14} />
              <span>{loadError}</span>
            </div>
          )}

          {loadSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.82rem', marginTop: '8px' }}>
              <CheckCircle2 size={14} />
              <span>Authorized items loaded successfully! Instrument unlocked.</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Close
            </button>
            <button onClick={handleManualSubmit} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Apply Text Bundle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
