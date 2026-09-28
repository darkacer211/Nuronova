import React from 'react';
import { Award, AlertCircle, CheckCircle2, Info, TrendingUp, Sparkles } from 'lucide-react';

export default function InterpretationCard({ result }) {
  const isPos = result.isPositive;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        borderLeft: isPos ? '4px solid var(--violet-primary)' : '4px solid var(--emerald-primary)',
        marginBottom: '20px',
      }}
    >
      {/* Test Title & Status Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="badge-pill badge-violet" style={{ marginBottom: '6px', display: 'inline-block' }}>
            {result.condition} Assessment
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.name}</h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          {result.testId === 'asrs6' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.shadedCount} / {result.maxShaded} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>Shaded Criteria</span>
            </div>
          )}

          {result.testId === 'aq10' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.totalScore} / {result.maxScore} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>(Cutoff &ge; {result.cutoff})</span>
            </div>
          )}

          {result.testId === 'catq' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.totalScore} / {result.maxScore} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>(Clinical Cutoff &ge; {result.cutoff})</span>
            </div>
          )}

          {result.testId === 'raads_r' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.totalScore} / {result.maxScore} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>(Cutoff &ge; {result.cutoff})</span>
            </div>
          )}

          {result.testId === 'aq50' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.totalScore} / {result.maxScore} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>(Cutoff &ge; {result.cutoff})</span>
            </div>
          )}

          {result.testId === 'rbq2a' && (
            <div className="mono-num" style={{ fontSize: '1.4rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
              {result.meanScore} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>Mean (Cutoff &ge; {result.meanCutoff})</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary Interpretation Headline */}
      <div
        style={{
          background: isPos ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          border: isPos ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem', color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)', marginBottom: '6px' }}>
          {isPos ? <Sparkles size={20} /> : <CheckCircle2 size={20} />}
          <span>{result.headline}</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
          {result.summary}
        </p>
      </div>

      {/* Subscales Breakdown */}
      {result.subscales && typeof result.subscales === 'object' && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--cyan-glow)' }}>
            {result.testId === 'catq' ? 'Camouflaging Subscale Distribution' : 'Subscale Distribution'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.keys(result.subscales).map((key) => {
              const sub = result.subscales[key];
              const score = sub?.score ?? (typeof sub === 'number' ? sub : 0);
              const maxVal = sub?.maxScore || sub?.max || (score > 0 ? score : 100);
              const pct = Math.min(100, Math.max(0, Math.round((score / maxVal) * 100)));
              const subName = sub?.name || key.replace(/_/g, ' ');

              return (
                <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', textTransform: 'capitalize' }}>{subName}</span>
                    <span className="mono-num" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--cyan-glow)' }}>
                      {score} / {maxVal}
                    </span>
                  </div>
                  {sub?.description && (
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                      {sub.description}
                    </div>
                  )}
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, var(--cyan-primary), var(--violet-primary))',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASRS Sum Score Band */}
      {result.testId === 'asrs6' && result.sumBand && (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Continuous Sum Metric (0–24 Scale):</span>
          <span className="mono-num" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {result.sumScore} / 24 • <span style={{ color: 'var(--cyan-glow)' }}>{result.sumBand}</span>
          </span>
        </div>
      )}

      {/* What this does and does not mean */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
          What This Means & What It Does Not Mean:
        </strong>
        <span>
          A positive screener indicates you share significant behavioral traits with neurodivergent individuals, which may explain executive or social friction. However, it does <em>not</em> mean you have a medical diagnosis. Only a comprehensive clinical evaluation by an adult specialist can confirm or rule out ADHD or Autism.
        </span>
      </div>
    </div>
  );
}
