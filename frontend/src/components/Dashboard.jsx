import React, { useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Brain,
  Zap,
  ShieldCheck,
  TrendingUp,
  Download,
  RotateCcw,
  Sparkles,
  Info,
  Activity,
  Award,
  AlertCircle,
  Eye,
  Mic,
  MousePointer,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ analysisResult, onRetake }) {
  useEffect(() => {
    // Trigger festive celebratory confetti on dashboard launch
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#10b981'],
    });
  }, []);

  if (!analysisResult) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
        <p>Loading cognitive analytics...</p>
      </div>
    );
  }

  const {
    session_id,
    cpi_score,
    percentile_rank,
    confidence_interval,
    domains,
    shap_explanations,
    narrative_report,
  } = analysisResult;

  // Prepare radar chart data
  const radarData = [
    { domain: 'Executive Function', score: domains.executive_function, fullMark: 100 },
    { domain: 'Sustained Attention', score: domains.sustained_attention, fullMark: 100 },
    { domain: 'Processing Speed', score: domains.processing_speed, fullMark: 100 },
    { domain: 'Cognitive Stability', score: domains.cognitive_stability, fullMark: 100 },
  ];

  // Prepare SHAP chart data (top 6 impacts)
  const shapData = (shap_explanations || []).slice(0, 6).map((item) => ({
    name: item.label,
    impact: item.impact_value,
    direction: item.direction,
    description: item.description,
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner & Export Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge-pill badge-emerald">Analysis Validated</span>
            <span className="mono-num" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Session: {session_id}
            </span>
          </div>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Neuro-Cognitive Assessment Profile
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            <Download size={16} />
            <span>Print / PDF Report</span>
          </button>
          <button onClick={onRetake} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
            <RotateCcw size={16} />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Grid: CPI Score Card + Domain Radar */}
      <div className="grid-2">
        {/* CPI Main Index Card */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge-pill badge-cyan">Primary Index</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '8px' }}>
                  Cognitive Performance Index (CPI)
                </h3>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} color="var(--cyan-glow)" />
              </div>
            </div>

            <div style={{ margin: '24px 0 16px 0', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span
                className="mono-num"
                style={{
                  fontSize: '4.8rem',
                  fontWeight: 800,
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #ffffff 30%, var(--cyan-glow) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {cpi_score}
              </span>
              <span style={{ fontSize: '1.4rem', color: 'var(--text-dim)', fontWeight: 600 }}>/ 100</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span className="badge-pill badge-violet" style={{ fontSize: '0.82rem', padding: '6px 12px' }}>
                <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
                {percentile_rank}th Percentile Rank
              </span>
              <span className="mono-num" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                95% CI: [{confidence_interval[0]} - {confidence_interval[1]}]
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The CPI represents a standardized multi-domain psychometric composite calibrated against age-normative distributions, incorporating reaction speed, executive inhibition, working memory capacity, and oculomotor stability.
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            <span>Model: Surrogate GradientBoosting</span>
            <span>Normative Mean: 75.0 (SD=12.0)</span>
          </div>
        </div>

        {/* 4 Cognitive Domains Radar Chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cognitive Domain Distribution</h3>
            <span className="badge-pill badge-violet">4 Dimensions</span>
          </div>

          <div style={{ width: '100%', height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="domain"
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.06)"
                  tick={{ fill: 'var(--text-dim)', fontSize: 9 }}
                />
                <Radar
                  name="Subject Score"
                  dataKey="score"
                  stroke="var(--cyan-glow)"
                  fill="url(#radarGradient)"
                  fillOpacity={0.45}
                />
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--cyan-primary)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--violet-primary)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Domain Metrics Grid */}
          <div className="grid-2" style={{ marginTop: '12px', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Executive Function:</span>
              <strong className="mono-num" style={{ color: 'var(--cyan-glow)' }}>{domains.executive_function}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Sustained Attention:</span>
              <strong className="mono-num" style={{ color: 'var(--emerald-glow)' }}>{domains.sustained_attention}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Processing Speed:</span>
              <strong className="mono-num" style={{ color: 'var(--violet-glow)' }}>{domains.processing_speed}</strong>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cognitive Stability:</span>
              <strong className="mono-num" style={{ color: 'var(--amber-primary)' }}>{domains.cognitive_stability}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Feature Attribution Waterfall Card */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Sparkles size={16} color="var(--violet-glow)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Explainable AI (SHAP) Biomarker Attribution
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              TreeExplainer breakdown showing which physiological and cognitive biomarkers boosted or dragged your overall score.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--emerald-primary)', borderRadius: '2px' }} />
              Performance Booster (+)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--rose-primary)', borderRadius: '2px' }} />
              Cognitive Drag / Fatigue (-)
            </span>
          </div>
        </div>

        {/* Feature Attribution List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {shapData.map((item, idx) => {
            const isPos = item.direction === 'positive';
            const widthPct = Math.min(Math.abs(item.impact) * 12, 100);

            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>{item.name}</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.description}</p>
                  </div>
                  <div
                    className="mono-num"
                    style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: isPos ? 'var(--emerald-glow)' : 'var(--rose-primary)',
                      padding: '4px 10px',
                      background: isPos ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {isPos ? `+${item.impact}` : `${item.impact}`} pts
                  </div>
                </div>

                {/* Impact Bar */}
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${widthPct}%`,
                      background: isPos ? 'var(--emerald-primary)' : 'var(--rose-primary)',
                      borderRadius: 'var(--radius-full)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Clinical Narration & Actionable Guidance */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Brain size={24} color="var(--cyan-glow)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Executive Performance Narrative</h3>
        </div>

        {/* Narrative Summary */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(139, 92, 246, 0.08))',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            marginBottom: '24px',
            lineHeight: 1.7,
            fontSize: '0.95rem',
            color: 'var(--text-main)',
          }}
        >
          {narrative_report.summary}
        </div>

        <div className="grid-2" style={{ marginBottom: '24px' }}>
          {/* Key Strengths */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--emerald-glow)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} />
              Demonstrated Cognitive Strengths
            </h4>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {narrative_report.key_strengths.map((str, i) => (
                <li key={i}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Fatigue Indicators */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: 'var(--rose-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              Observed Fatigue & Friction Patterns
            </h4>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {narrative_report.fatigue_indicators.map((fat, i) => (
                <li key={i}>{fat}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ color: 'var(--cyan-glow)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '12px' }}>
            Evidence-Based Optimization Recommendations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {narrative_report.recommendations.map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical Medical Disclaimer */}
        <div style={{ marginTop: '24px', padding: '14px 18px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--amber-primary)', lineHeight: 1.5 }}>
          <strong>Non-Diagnostic Disclosure:</strong> {narrative_report.disclaimer}
        </div>
      </div>
    </div>
  );
}
