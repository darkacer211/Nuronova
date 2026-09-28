import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function ScreeningDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.76rem', color: 'var(--amber-primary)' }}>
        <ShieldAlert size={14} style={{ flexShrink: 0 }} />
        <span><strong>Screening Instrument:</strong> Not a diagnostic tool. Intended for personal awareness and clinical discussion.</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--amber-primary)', lineHeight: 1.6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
        <ShieldAlert size={18} />
        <span>Important Clinical & Ethical Disclaimer</span>
      </div>
      <p style={{ color: 'rgba(255, 255, 255, 0.85)', margin: 0 }}>
        This screening module provides validated self-report instruments (ASRS-v1.1, AQ-10, CAT-Q) designed to identify traits and behavioral patterns. <strong>This is not a diagnostic evaluation.</strong> Only a qualified medical doctor, clinical psychologist, or psychiatrist can provide a formal clinical diagnosis of ADHD or Autism Spectrum Conditions. All responses are scored client-side and never saved without your consent.
      </p>
    </div>
  );
}
