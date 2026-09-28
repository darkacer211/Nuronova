import React from 'react';
import { Download, ArrowLeft, Printer, ShieldCheck } from 'lucide-react';
import { SUPPORT_RESOURCES } from './supportResources';

export default function ClinicalSummaryExport({ results, onBack }) {
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Bar (hidden on print) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Results</span>
        </button>

        <button onClick={handlePrint} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
          <Printer size={16} />
          <span>Print or Save to PDF</span>
        </button>
      </div>

      {/* Printable Clinical Sheet */}
      <div
        className="glass-panel"
        style={{
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {/* Clinician Header */}
        <div style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Clinical Discussion Summary • Adult Neurodiversity Screening
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '6px' }}>
              Self-Report Screening Summary for Healthcare Providers
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Prepared to assist primary care physicians, psychiatrists, or clinical psychologists during diagnostic intake.
            </p>
          </div>
          <div className="mono-num" style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            <div>Date: {currentDate}</div>
            <div>Screener: NeuroNova v1.0</div>
          </div>
        </div>

        {/* Executive Summary List */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', color: '#ffffff' }}>
            Instruments Completed & Endorsement Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.map((res, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 22px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{res.name}</h4>
                  <span
                    className="mono-num"
                    style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: res.isPositive ? 'var(--violet-glow)' : 'var(--emerald-glow)',
                    }}
                  >
                    {res.testId === 'asrs6' && `${res.shadedCount}/6 Criteria Endorsed (${res.isPositive ? 'Positive Screen' : 'Below Cutoff'})`}
                    {res.testId === 'aq10' && `${res.totalScore}/10 Points (${res.isPositive ? 'Positive Screen' : 'Below Cutoff'})`}
                    {res.testId === 'catq' && `${res.totalScore}/175 (${res.isPositive ? 'Elevated Camouflaging' : 'Typical Range'})`}
                    {res.testId === 'mchat' && `${res.totalScore ?? 0}/20 Points (${res.isPositive ? 'Elevated Pediatric Risk' : 'Typical Range'})`}
                    {!['asrs6', 'aq10', 'catq', 'mchat'].includes(res.testId) && res.totalScore !== undefined && `${res.totalScore}${res.maxScore ? `/${res.maxScore}` : ''} Points (${res.isPositive ? 'Above Cutoff' : 'Below Cutoff'})`}
                  </span>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                  {res.summary}
                </p>

                {/* Subscales breakdown */}
                {res.subscales && typeof res.subscales === 'object' && (
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {Object.entries(res.subscales).map(([key, sub]) => {
                      const name = sub?.name || key.replace(/_/g, ' ');
                      const score = sub?.score ?? (typeof sub === 'number' ? sub : 0);
                      const max = sub?.maxScore || sub?.max || null;
                      return (
                        <span key={key} style={{ textTransform: 'capitalize' }}>
                          {name}: <strong>{score}{max ? `/${max}` : ''}</strong>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guidance for Healthcare Providers */}
        <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: 'var(--radius-md)', padding: '18px 22px', marginBottom: '28px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--cyan-glow)', display: 'block', marginBottom: '6px' }}>
            Clinical Notice for Evaluators:
          </strong>
          These results reflect validated self-report instruments. In adults, especially those who developed strong compensatory or camouflaging mechanisms (evaluated above by the CAT-Q), childhood history and collateral reports remain critical. Elevated camouflaging scores are frequently associated with secondary anxiety, depression, and executive burnout.
        </div>

        {/* References & Instrument Citations */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          <strong>Validated References:</strong>
          <ul style={{ paddingLeft: '18px', marginTop: '6px' }}>
            <li>ASRS-v1.1: Kessler RC et al. (2005). Psychological Medicine, 35(2), 245-256. World Health Organization.</li>
            <li>AQ-10: Allison C, Auyeung B, Baron-Cohen S (2012). J Am Acad Child Adolesc Psychiatry, 51(2), 202-212.</li>
            <li>CAT-Q: Hull L, Mandy W, Lai MC, Baron-Cohen S et al. (2018). J Autism Dev Disord, 49(3), 819-833.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
