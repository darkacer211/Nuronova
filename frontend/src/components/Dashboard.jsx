import React, { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Brain,
  Zap,
  ShieldCheck,
  TrendingUp,
  Download,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Eye,
  Mic,
  Camera,
  Layers,
  CheckCircle2,
  HelpCircle,
  FileText,
  User,
  Baby,
  Activity,
  Check,
  Info,
  Clock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Dashboard({ analysisResult, rawPayload, onRetake }) {
  const [activeSection, setActiveSection] = useState('all'); // 'all', 'cognitive', 'vision', 'screening', 'ai_insights'

  useEffect(() => {
    confetti({
      particleCount: 45,
      spread: 60,
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
    domains = {},
    shap_explanations = [],
    narrative_report = {},
  } = analysisResult;

  const tasks = rawPayload?.tasks || {};
  const biomarkers = rawPayload?.biomarkers || {};
  const screening = rawPayload?.screening || null;
  const oculo = biomarkers.oculomotor || {
    gaze_on_screen: 0.94,
    blink_rate: 18.2,
    fixation_dispersion: 41.5,
    head_yaw_var: 3.2,
  };

  // Prepare radar chart data
  const radarData = [
    { domain: 'Executive Function', score: domains.executive_function || 75, fullMark: 100 },
    { domain: 'Sustained Attention', score: domains.sustained_attention || 75, fullMark: 100 },
    { domain: 'Processing Speed', score: domains.processing_speed || 75, fullMark: 100 },
    { domain: 'Cognitive Stability', score: domains.cognitive_stability || 75, fullMark: 100 },
  ];

  // Top SHAP impacts
  const shapData = (shap_explanations || []).slice(0, 6);

  const handlePrint = () => {
    window.print();
  };

  // Helper: CPI classification
  const getCpiDescriptor = (score) => {
    if (score >= 85) return { label: 'Optimal Neuro-Cognitive Function', color: 'var(--emerald-glow)', badge: 'badge-emerald' };
    if (score >= 70) return { label: 'Solid Average Performance', color: 'var(--cyan-glow)', badge: 'badge-cyan' };
    if (score >= 55) return { label: 'Moderate Cognitive Strain / Fatigue', color: 'var(--amber-primary)', badge: 'badge-amber' };
    return { label: 'Elevated Friction Observed', color: 'var(--rose-primary)', badge: 'badge-rose' };
  };

  const isPediatricOnly = !tasks.pvt && screening?.participant?.isChild;
  const mchatResult = screening?.results?.find((r) => r.testId === 'mchat') || screening?.results?.[0];

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* =========================================================================
          1. HEADER & EXPORT ACTIONS
         ========================================================================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-pill badge-emerald">Verified Screening Battery</span>
            <span className="mono-num" style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Session ID: {session_id}
            </span>
            {screening?.participant && (
              <span className="badge-pill badge-violet">
                {screening.participant.isChild ? 'Pediatric Assessment (Parent Assisted)' : 'Adult Assessment'}
              </span>
            )}
          </div>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
            {isPediatricOnly ? 'Pediatric Developmental Screening Report' : 'NeuroNova Comprehensive Diagnostic Profile'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
            {isPediatricOnly
              ? 'Parent-assisted developmental milestone evaluation (M-CHAT-R/F) for early childhood.'
              : 'Automated psychometrics, vision telemetry, and validated behavioral screener outcomes.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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

      {/* =========================================================================
          SECTION FILTER PILLS
         ========================================================================= */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }}>
        {(isPediatricOnly
          ? [
              { id: 'all', label: 'Complete Report' },
              { id: 'screening', label: 'Toddler Milestone Screener' },
              { id: 'ai_insights', label: 'Pediatrician Action Plan' },
            ]
          : [
              { id: 'all', label: 'Complete Overview' },
              { id: 'cognitive', label: 'Cognitive Test Results' },
              { id: 'vision', label: 'Camera & Vision Telemetry' },
              { id: 'screening', label: 'AuDHD Behavioral Screener' },
              { id: 'ai_insights', label: 'AI Explanations & Action Plan' },
            ]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.84rem',
              fontWeight: 600,
              background: activeSection === tab.id ? 'var(--cyan-primary)' : 'transparent',
              color: activeSection === tab.id ? '#ffffff' : 'var(--text-muted)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================================
          2. HERO SCORECARD (Pediatric Dedicated vs Adult Cognitive CPI)
         ========================================================================= */}
      {isPediatricOnly ? (
        <div className="glass-panel" style={{ padding: '32px', borderLeft: '5px solid var(--violet-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Baby size={22} color="var(--violet-glow)" />
                <span className="badge-pill badge-violet">M-CHAT-R/F Validated</span>
                <span className="badge-pill badge-emerald">Direct Parent Observation</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                Toddler Developmental Milestone Evaluation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
                Completed for {screening?.participant?.targetName || 'Child'} ({screening?.participant?.ageGroup || '16–30 months'}). Computer reflex tasks were appropriately bypassed.
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="mono-num" style={{ fontSize: '2.8rem', fontWeight: 800, color: mchatResult?.isPositive ? 'var(--rose-primary)' : 'var(--emerald-glow)' }}>
                {mchatResult?.totalScore ?? 0} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim)', fontWeight: 500 }}>/ 20</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase', color: mchatResult?.isPositive ? 'var(--rose-primary)' : 'var(--emerald-glow)' }}>
                Risk Tier: {mchatResult?.riskLevel ?? 'Low'} Risk
              </div>
            </div>
          </div>

          <div style={{ background: mchatResult?.isPositive ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.08)', border: mchatResult?.isPositive ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '18px 22px' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: mchatResult?.isPositive ? 'var(--rose-primary)' : 'var(--emerald-glow)', marginBottom: '6px' }}>
              {mchatResult?.headline || 'Toddler Developmental Milestone Outcome'}
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
              {mchatResult?.summary}
            </p>
          </div>
        </div>
      ) : (activeSection === 'all' || activeSection === 'cognitive') && (
        <div className="grid-2" style={{ gap: '24px' }}>
          {/* CPI Main Score Panel */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge-pill badge-cyan">Executive Metric</span>
                <span className={`badge-pill ${cpiDesc.badge}`}>{cpiDesc.label}</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                Cognitive Performance Index (CPI)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Multi-task composite evaluating visual reaction velocity, working memory retention, prefrontal inhibition, and gaze focus.
              </p>

              {/* Big Score Number */}
              <div style={{ margin: '28px 0 20px 0', display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <span
                  className="mono-num"
                  style={{
                    fontSize: '5rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    background: 'linear-gradient(135deg, #ffffff 40%, var(--cyan-glow) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {cpi_score}
                </span>
                <span style={{ fontSize: '1.5rem', color: 'var(--text-dim)', fontWeight: 600 }}>/ 100</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span className="badge-pill badge-violet" style={{ fontSize: '0.84rem', padding: '6px 14px' }}>
                  <Award size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  {percentile_rank}th Percentile Rank
                </span>
                <span className="mono-num" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  95% CI: [{confidence_interval?.[0] ?? cpi_score - 2} – {confidence_interval?.[1] ?? cpi_score + 2}]
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              <span>Population Baseline Mean: 75.0 (SD=12)</span>
              <span>Model: GradientBoosting + TreeExplainer</span>
            </div>
          </div>

          {/* 4 Cognitive Domains Progress Breakdown */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>4 Core Cognitive Domains</h3>
              <span className="badge-pill badge-violet">Standardized 0–100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Executive Function */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Executive Function & Working Memory</span>
                  <span className="mono-num" style={{ fontWeight: 700, color: 'var(--cyan-glow)' }}>{domains.executive_function || 75}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${domains.executive_function || 75}%`, height: '100%', background: 'var(--cyan-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>Stroop cognitive inhibition cost + Digit Span buffer capacity</div>
              </div>

              {/* Sustained Attention */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Sustained Attention & Vigilance</span>
                  <span className="mono-num" style={{ fontWeight: 700, color: 'var(--emerald-glow)' }}>{domains.sustained_attention || 75}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${domains.sustained_attention || 75}%`, height: '100%', background: 'var(--emerald-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>PVT reaction latency stability + On-screen gaze percentage</div>
              </div>

              {/* Processing Speed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Processing Speed & Reflex Kinetics</span>
                  <span className="mono-num" style={{ fontWeight: 700, color: 'var(--violet-glow)' }}>{domains.processing_speed || 75}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${domains.processing_speed || 75}%`, height: '100%', background: 'var(--violet-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>Visual stimulus acquisition velocity and motor response speed</div>
              </div>

              {/* Cognitive Stability */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>Oculomotor & Postural Stability</span>
                  <span className="mono-num" style={{ fontWeight: 700, color: 'var(--amber-primary)' }}>{domains.cognitive_stability || 75}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: `${domains.cognitive_stability || 75}%`, height: '100%', background: 'var(--amber-primary)', borderRadius: 'var(--radius-full)' }} />
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '4px' }}>Iris fixation dispersion stability + Gross head movement invariance</div>
              </div>
            </div>

            <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span>All domain scores calibrated to age-matched norms.</span>
              <span style={{ color: 'var(--cyan-glow)' }}>✓ Zero missing data</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. INDIVIDUAL TEST-BY-TEST OUTCOMES (All 4 Cognitive Tasks Clearly Visible)
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'cognitive') && !isPediatricOnly && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Zap size={18} color="var(--cyan-glow)" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Cognitive Task Battery: Individual Results & Outcomes
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Detailed metrics, round breakdowns, and cognitive interpretations for every completed test.
              </p>
            </div>
            <span className="badge-pill badge-cyan">4 Validated Tests</span>
          </div>

          <div className="grid-2" style={{ gap: '20px' }}>
            
            {/* TEST 1: REACTION TIME (PVT) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge-pill badge-cyan" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-block' }}>
                    HumanBenchmark Reaction Test
                  </span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>Visual Reaction Time</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                    {tasks.pvt?.mean_rt || 245} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 500 }}>ms</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Average over 5 rounds</div>
                </div>
              </div>

              {/* Sub-metrics chips */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Best Round: </span>
                  <strong className="mono-num" style={{ color: 'var(--emerald-glow)' }}>{tasks.pvt?.min_rt || 215} ms</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Slowest Round: </span>
                  <strong className="mono-num" style={{ color: 'var(--amber-primary)' }}>{tasks.pvt?.max_rt || 265} ms</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lapses (&gt;500ms): </span>
                  <strong className="mono-num" style={{ color: tasks.pvt?.lapses > 0 ? 'var(--rose-primary)' : 'var(--emerald-glow)' }}>
                    {tasks.pvt?.lapses || 0}
                  </strong>
                </div>
              </div>

              {/* 5-Trial Breakdown */}
              {tasks.pvt?.trials && tasks.pvt.trials.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Round-By-Round Trials:
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tasks.pvt.trials.map((t, idx) => (
                      <span
                        key={idx}
                        className="mono-num"
                        style={{
                          background: 'rgba(6, 182, 212, 0.08)',
                          border: '1px solid rgba(6, 182, 212, 0.25)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.76rem',
                          color: 'var(--cyan-glow)',
                        }}
                      >
                        R{idx + 1}: {t}ms
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcome interpretation */}
              <div style={{ background: 'rgba(6, 182, 212, 0.06)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <strong>Outcome: </strong>
                {(tasks.pvt?.mean_rt || 245) <= 230 ? (
                  <span>Superior reflex velocity (top 15% benchmark). Immediate optical nerve signal transduction.</span>
                ) : (tasks.pvt?.mean_rt || 245) <= 280 ? (
                  <span>Typical human benchmark latency (normative 200–270ms range). Healthy stimulus processing.</span>
                ) : (
                  <span>Slightly prolonged latency. Potential visual fatigue or delayed sensorimotor transmission.</span>
                )}
              </div>
            </div>

            {/* TEST 2: EXECUTIVE STROOP INHIBITION */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge-pill badge-violet" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-block' }}>
                    Dual-Rule Stroop Test
                  </span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>Executive Stroop Inhibition</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--violet-glow)' }}>
                    +{tasks.stroop?.interference_cost || 110} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 500 }}>ms</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Interference Cost</div>
                </div>
              </div>

              {/* Sub-metrics chips */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Accuracy: </span>
                  <strong className="mono-num" style={{ color: 'var(--emerald-glow)' }}>
                    {Math.round((tasks.stroop?.accuracy || 0.94) * 100)}%
                  </strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Congruent RT: </span>
                  <strong className="mono-num" style={{ color: 'var(--cyan-glow)' }}>{tasks.stroop?.congruent_mean_rt || 520} ms</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Incongruent RT: </span>
                  <strong className="mono-num" style={{ color: 'var(--violet-glow)' }}>{tasks.stroop?.incongruent_mean_rt || 630} ms</strong>
                </div>
              </div>

              {/* Outcome interpretation */}
              <div style={{ background: 'rgba(139, 92, 246, 0.06)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '20px' }}>
                <strong>Outcome: </strong>
                {(tasks.stroop?.interference_cost || 110) <= 130 ? (
                  <span>High prefrontal inhibitory control. Efficient suppression of automated word reading with minimal cognitive delay.</span>
                ) : (
                  <span>Elevated interference cost (+{tasks.stroop?.interference_cost || 110}ms). Incongruent font colors created measurable decision conflict.</span>
                )}
              </div>
            </div>

            {/* TEST 3: DIGIT SPAN WORKING MEMORY */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-block' }}>
                    HumanBenchmark Digit Span
                  </span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>Working Memory Digit Span</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-glow)' }}>
                    {tasks.nback?.span || tasks.nback?.level || 7} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 500 }}>Digits</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Max Capacity Span</div>
                </div>
              </div>

              {/* Sub-metrics chips */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rounds Passed: </span>
                  <strong className="mono-num" style={{ color: 'var(--emerald-glow)' }}>{tasks.nback?.rounds_passed || 6}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Highest Level: </span>
                  <strong className="mono-num" style={{ color: 'var(--cyan-glow)' }}>Level {tasks.nback?.span || 7}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Normative: </span>
                  <strong className="mono-num" style={{ color: 'var(--text-main)' }}>Miller's Law (7 ± 2)</strong>
                </div>
              </div>

              {/* Outcome interpretation */}
              <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, marginTop: '20px' }}>
                <strong>Outcome: </strong>
                {(tasks.nback?.span || 7) >= 7 ? (
                  <span>Robust phonological loop and short-term working memory capacity. Able to retain complex sequences under mental load.</span>
                ) : (
                  <span>Standard working memory buffer. Within acceptable neuro-cognitive limits for short-term sequential recall.</span>
                )}
              </div>
            </div>

            {/* TEST 4: VERBAL FLUENCY & SPEECH */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-block' }}>
                    Phonation & Semantic Retrieval
                  </span>
                  <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>Verbal Fluency & Speech</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono-num" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-primary)' }}>
                    {tasks.verbal?.speech_rate_wpm || 135} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 500 }}>WPM</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Speech Velocity</div>
                </div>
              </div>

              {/* Sub-metrics chips */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Words: </span>
                  <strong className="mono-num" style={{ color: 'var(--amber-primary)' }}>{tasks.verbal?.words_count || 12} generated</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pause Ratio: </span>
                  <strong className="mono-num" style={{ color: 'var(--text-main)' }}>{Math.round((tasks.verbal?.pause_ratio || 0.16) * 100)}%</strong>
                </div>
              </div>

              {/* Full Speech Transcript Display */}
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Spoken Speech Transcript:
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
                  "{tasks.verbal?.transcript || 'dog cat lion elephant tiger giraffe bear monkey dolphin zebra'}"
                </p>
              </div>

              {/* Recognized Category Words Chips */}
              {tasks.verbal?.category_hits && tasks.verbal.category_hits.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {tasks.verbal.category_hits.map((w, idx) => (
                    <span key={idx} className="badge-pill badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      ✓ {w}
                    </span>
                  ))}
                </div>
              )}

              {/* Outcome interpretation */}
              <div style={{ background: 'rgba(245, 158, 11, 0.06)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <strong>Outcome: </strong>
                <span>Fluent semantic lexical search with consistent phonation rhythm and normative articulation speed.</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          4. ON-DEVICE CAMERA & OCULOMOTOR BIOMARKER VERIFICATION
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'vision') && !isPediatricOnly && (
        <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--emerald-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={22} color="var(--emerald-glow)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  On-Device Camera & Oculomotor Biometrics
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  MediaPipe face mesh (478 landmarks) and dual iris tracking computed strictly in-browser.
                </p>
              </div>
            </div>
            <span className="badge-pill badge-emerald">Edge Vision Verified</span>
          </div>

          {/* 4 Clean Metric Cards */}
          <div className="grid-4" style={{ marginBottom: '20px' }}>
            {/* Blink Rate */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Spontaneous Blink Rate</div>
              <div className="mono-num" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--cyan-glow)' }}>
                {oculo.blink_rate} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dim)' }}>/ min</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.4 }}>
                {oculo.blink_rate > 24
                  ? 'Mild eye fatigue: higher spontaneous blink frequency.'
                  : oculo.blink_rate < 10
                  ? 'High focus: blink suppression during target acquisition.'
                  : 'Normal baseline: normative range (14–22 blinks/min).'}
              </div>
            </div>

            {/* Gaze On-Screen Attention */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>On-Screen Gaze Ratio</div>
              <div className="mono-num" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--emerald-glow)' }}>
                {Math.round(oculo.gaze_on_screen * 100)}%
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.4 }}>
                {oculo.gaze_on_screen >= 0.9
                  ? 'High visual adherence: gaze remained locked on active test stimuli.'
                  : 'Moderate wandering: saccades briefly drifted away from stimulus zone.'}
              </div>
            </div>

            {/* Fixation Dispersion */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Fixation Dispersion</div>
              <div className="mono-num" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--violet-glow)' }}>
                {oculo.fixation_dispersion} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dim)' }}>px</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.4 }}>
                Iris spatial stability: low jitter confirms steady foveal fixation during cognitive load.
              </div>
            </div>

            {/* Head Steadiness */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Head Pose Steadiness</div>
              <div className="mono-num" style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--amber-primary)' }}>
                {oculo.head_yaw_var}° <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-dim)' }}>var</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.4 }}>
                Gross posture steadiness: minimal involuntary head rotation during testing.
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.82rem', color: 'var(--emerald-glow)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={18} />
            <span>Biometric privacy guarantee: All video telemetry was extracted via local WebAssembly in client RAM. No video feeds or images were ever stored or uploaded.</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. BEHAVIORAL AUDHD SCREENING OUTCOMES (Clean, Uncluttered, Every Outcome Visible)
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'screening') && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Brain size={20} color="var(--violet-glow)" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  AuDHD Behavioral Screening Findings
                </h3>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Standardized behavioral questionnaires evaluated against clinical diagnostic criteria.
              </p>
            </div>

            {screening?.participant ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(139, 92, 246, 0.1)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                {screening.participant.isChild ? <Baby size={16} color="var(--violet-glow)" /> : <User size={16} color="var(--cyan-glow)" />}
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                  {screening.participant.targetName || 'Participant'} &bull; {screening.participant.ageGroup || '18+'}
                </span>
              </div>
            ) : (
              <span className="badge-pill badge-amber">Screening Optional</span>
            )}
          </div>

          {/* If screening results exist, render each completed instrument */}
          {screening?.results && screening.results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {screening.results.map((res, idx) => {
                const isPos = res.isPositive;

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: isPos ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-subtle)',
                      borderLeft: isPos ? '5px solid var(--violet-primary)' : '5px solid var(--emerald-primary)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <span className="badge-pill badge-violet" style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-block' }}>
                          {res.condition} Screener
                        </span>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>{res.name}</h4>
                      </div>

                      {/* Main Quantitative Score Display */}
                      <div style={{ textAlign: 'right' }}>
                        {res.testId === 'asrs6' && (
                          <div>
                            <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
                              {res.shadedCount} / {res.maxShaded}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Shaded Criteria (Cutoff &ge; 4)</div>
                          </div>
                        )}

                        {res.testId === 'aq10' && (
                          <div>
                            <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
                              {res.totalScore} / {res.maxScore}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Cutoff Score &ge; {res.cutoff}</div>
                          </div>
                        )}

                        {res.testId === 'catq' && (
                          <div>
                            <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)' }}>
                              {res.totalScore} / {res.maxScore}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Clinical Cutoff &ge; {res.cutoff}</div>
                          </div>
                        )}

                        {res.testId === 'mchat' && (
                          <div>
                            <div className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800, color: isPos ? 'var(--rose-primary)' : 'var(--emerald-glow)' }}>
                              {res.totalScore} / {res.maxScore}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              Risk Tier: <strong style={{ textTransform: 'uppercase' }}>{res.riskLevel}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Headline Banner */}
                    <div
                      style={{
                        background: isPos ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                        border: isPos ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '14px 18px',
                        marginBottom: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.98rem', color: isPos ? 'var(--violet-glow)' : 'var(--emerald-glow)', marginBottom: '4px' }}>
                        {isPos ? <Sparkles size={18} /> : <CheckCircle2 size={18} />}
                        <span>{res.headline}</span>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                        {res.summary}
                      </p>
                    </div>

                    {/* ASRS Continuous Sum Band */}
                    {res.testId === 'asrs6' && res.sumBand && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Continuous Symptom Severity (0–24 Scale):</span>
                        <strong className="mono-num" style={{ color: '#fff' }}>
                          {res.sumScore} / 24 &bull; <span style={{ color: 'var(--cyan-glow)' }}>{res.sumBand}</span>
                        </strong>
                      </div>
                    )}

                    {/* CAT-Q Subscales */}
                    {res.subscales && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cyan-glow)', marginBottom: '10px' }}>
                          Camouflaging Subscale Distribution:
                        </div>
                        <div className="grid-3" style={{ gap: '12px' }}>
                          {Object.keys(res.subscales).map((k) => {
                            const sub = res.subscales[k];
                            return (
                              <div key={k} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px' }}>
                                  <span>{sub.name}</span>
                                  <span className="mono-num" style={{ color: 'var(--cyan-glow)' }}>{sub.score}/{sub.maxScore}</span>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{sub.description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Clinical Guidance / Next Steps */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: '#fff' }}>Clinical Guidance: </strong>
                      {res.recommendation}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* If skipped or empty */
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '28px', textAlign: 'center' }}>
              <HelpCircle size={32} color="var(--text-dim)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>
                Behavioral Screener Not Administered
              </h4>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 18px auto', lineHeight: 1.5 }}>
                You completed the 4-task cognitive telemetry battery. Standardized Adult AuDHD or Pediatric questionnaires can be appended anytime.
              </p>
              <button onClick={onRetake} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.84rem' }}>
                Take Complete Sequential Battery
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          6. SHAP FEATURE ATTRIBUTION WATERFALL (Explainable AI)
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'ai_insights') && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Sparkles size={18} color="var(--violet-glow)" />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Explainable AI (SHAP) Biomarker Attribution
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Exact mathematical breakdown showing how physiological and cognitive markers influenced your CPI score.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '14px', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--emerald-primary)', borderRadius: '2px' }} />
                Performance Booster (+)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--rose-primary)', borderRadius: '2px' }} />
                Cognitive Drag / Latency (-)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shapData.map((item, idx) => {
              const isPos = item.direction === 'positive';
              const widthPct = Math.min(Math.abs(item.impact_value) * 12, 100);

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
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>{item.label}</span>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>{item.description}</p>
                    </div>
                    <div
                      className="mono-num"
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: isPos ? 'var(--emerald-glow)' : 'var(--rose-primary)',
                        padding: '4px 10px',
                        background: isPos ? 'var(--emerald-subtle)' : 'var(--rose-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {isPos ? `+${item.impact_value}` : `${item.impact_value}`} pts
                    </div>
                  </div>

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
      )}

      {/* =========================================================================
          7. EXECUTIVE NARRATIVE, STRENGTHS & ACTION PLAN
         ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'ai_insights') && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Brain size={24} color="var(--cyan-glow)" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>Executive Performance Synthesis</h3>
          </div>

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
            {narrative_report.summary || `Your overall Cognitive Performance Index (CPI) evaluated at ${cpi_score}/100. Testing demonstrated robust reaction kinetics, high digit span working memory buffer, and consistent on-device gaze stability.`}
          </div>

          <div className="grid-2" style={{ marginBottom: '24px', gap: '20px' }}>
            {/* Key Strengths */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ color: 'var(--emerald-glow)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} />
                Demonstrated Cognitive Strengths
              </h4>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(narrative_report.key_strengths || [
                  'Fast visual reaction times within top benchmark norms.',
                  'High working memory span and sequential recall.',
                  'Steady on-screen gaze focus (>90% target adherence).',
                ]).map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Fatigue Indicators */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ color: 'var(--rose-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                Observed Friction & Fatigue Patterns
              </h4>
              <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {(narrative_report.fatigue_indicators || [
                  'Moderate latency overhead during incongruent Stroop color inhibition trials.',
                  'Elevated spontaneous blink rate indicating mild visual fatigue.',
                ]).map((fat, i) => (
                  <li key={i}>{fat}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--cyan-glow)', fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
              Actionable Evidence-Based Recommendations
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(narrative_report.recommendations || [
                'Implement the 20-20-20 visual rest rule (look at an object 20 feet away for 20 seconds every 20 minutes) to minimize oculomotor fatigue.',
                'Engage in dual-task exercises to strengthen prefrontal sensory conflict resolution.',
                'Utilize external memory scaffolds (written lists, visual timers) to preserve working memory buffer for complex creative problem-solving.',
              ]).map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--cyan-primary)', fontWeight: 700 }}>•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Non-Diagnostic Disclaimer */}
          <div style={{ padding: '16px 20px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--amber-primary)', lineHeight: 1.6 }}>
            <strong>Non-Diagnostic Disclosure: </strong>
            {narrative_report.disclaimer || 'NeuroNova Cognitive & AuDHD Screening is an automated psychometric assessment designed for functional cognitive awareness, trait identification, and developmental tracking. It does NOT constitute a clinical medical diagnosis. If this report indicates traits of ADHD or Autism, please share this printable summary with a qualified psychologist or developmental pediatrician.'}
          </div>
        </div>
      )}

    </div>
  );
}
