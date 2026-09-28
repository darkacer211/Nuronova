import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function AgeGateModal({ isOpen, onConfirm, onCancel, testName }) {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 9, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="var(--cyan-glow)" />
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '10px' }}>
          Age Verification (18+)
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
          The questionnaires included in this screener (<strong>{testName}</strong>) are clinically normed and validated strictly for adults aged <strong>18 years or older</strong>. They are not intended or validated for pediatric or adolescent self-assessment.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            id="ageCheck"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
          />
          <label htmlFor="ageCheck" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer', lineHeight: 1.5 }}>
            I confirm that I am at least 18 years of age and understand that this screener provides functional self-awareness, not a clinical diagnosis.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.88rem', opacity: confirmed ? 1 : 0.4 }}
          >
            <span>Proceed to Screener</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
