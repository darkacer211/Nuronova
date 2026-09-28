import React, { useState } from 'react';
import { User, Users, Baby, ArrowRight, ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';
import ScreeningDisclaimer from './ScreeningDisclaimer';

export default function AgeRouterModal({ onRouteSelected, onSkip }) {
  const [respondentType, setRespondentType] = useState('adult'); // 'adult' or 'child'
  const [childAgeGroup, setChildAgeGroup] = useState('toddler'); // 'toddler' (16-30m) or 'older' (4-15y) or 'unsupported'
  const [childNickname, setChildNickname] = useState('');
  const [adultConfirmed, setAdultConfirmed] = useState(true);

  const handleStart = () => {
    if (respondentType === 'adult') {
      onRouteSelected({
        flowId: 'quick_audhd',
        respondentType: 'adult',
        targetName: 'Adult Self-Report',
        isChild: false,
      });
    } else {
      if (childAgeGroup === 'toddler') {
        onRouteSelected({
          flowId: 'pediatric_mchat',
          respondentType: 'parent',
          targetName: childNickname.trim() ? `Child (${childNickname.trim()})` : 'Child (Toddler)',
          isChild: true,
          ageGroup: '16-30 months',
        });
      } else if (childAgeGroup === 'older') {
        onRouteSelected({
          flowId: 'pediatric_child',
          respondentType: 'parent',
          targetName: childNickname.trim() ? `Child (${childNickname.trim()})` : 'Child (Ages 4–15)',
          isChild: true,
          ageGroup: 'Ages 4–15',
        });
      }
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Step Header */}
      <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="badge-pill badge-violet">Part 2 of 2: Behavioral Screener</span>
          <span className="badge-pill badge-cyan">Privacy Protected • 100% Client-Side</span>
        </div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Age & Participant Adaptive Router
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', maxWidth: '640px', margin: '0 auto 20px auto', lineHeight: 1.6 }}>
          Cognitive tests are complete. To provide accurate, age-validated behavioral questionnaires for ADHD and Autism traits, please select who this evaluation is for.
        </p>

        <ScreeningDisclaimer compact={true} />
      </div>

      {/* Choice Panel: Adult vs Child */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }}>
          1. Who is this screening being completed for?
        </h3>

        <div className="grid-2" style={{ gap: '16px', marginBottom: '28px' }}>
          {/* Adult Option */}
          <div
            onClick={() => setRespondentType('adult')}
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: respondentType === 'adult' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255,255,255,0.02)',
              border: respondentType === 'adult' ? '2px solid var(--cyan-glow)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="var(--cyan-glow)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Myself (Adult 18+)</h4>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Self-Assessment</span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Standard adult AuDHD battery: ASRS-v1.1 (ADHD screener) + AQ-10 (Autism screener).
            </p>
          </div>

          {/* Child Option */}
          <div
            onClick={() => setRespondentType('child')}
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              background: respondentType === 'child' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.02)',
              border: respondentType === 'child' ? '2px solid var(--violet-glow)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--violet-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Baby size={20} color="var(--violet-glow)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>My Child / Toddler</h4>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>Parent / Caregiver Assisted</span>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Completed by a parent or guardian: M-CHAT-R/F (toddlers) or AQ-Child (ages 4–15).
            </p>
          </div>
        </div>

        {/* Child Sub-Options */}
        {respondentType === 'child' && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--violet-glow)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '12px' }}>
              <HeartHandshake size={18} />
              <span>Parent / Caregiver Guidance: Select Child's Age Range</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: childAgeGroup === 'toddler' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                  border: childAgeGroup === 'toddler' ? '1px solid var(--violet-glow)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="childAge"
                  checked={childAgeGroup === 'toddler'}
                  onChange={() => setChildAgeGroup('toddler')}
                  style={{ accentColor: 'var(--violet-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                    Toddler: 16 to 30 months (up to 48 months)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Standard M-CHAT-R/F parent screener for early social and communication milestones.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: childAgeGroup === 'older' ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)',
                  border: childAgeGroup === 'older' ? '1px solid var(--violet-glow)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="childAge"
                  checked={childAgeGroup === 'older'}
                  onChange={() => setChildAgeGroup('older')}
                  style={{ accentColor: 'var(--violet-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                    Older Child: Roughly 4 to 15 years old
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    School-age developmental guidance and AQ-Child / CAST clinical frameworks.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: childAgeGroup === 'unsupported' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                  border: childAgeGroup === 'unsupported' ? '1px solid var(--amber-primary)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="childAge"
                  checked={childAgeGroup === 'unsupported'}
                  onChange={() => setChildAgeGroup('unsupported')}
                  style={{ accentColor: 'var(--amber-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                    Outside Supported Ages (Under 16 months or 16–17 years)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Standard digital self-screeners are not normed for this range.
                  </div>
                </div>
              </label>
            </div>

            {/* Optional Nickname */}
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Optional Nickname (COPPA Privacy Note: No real names or identifying details stored):
              </label>
              <input
                type="text"
                placeholder="e.g. Leo (optional)"
                value={childNickname}
                onChange={(e) => setChildNickname(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  maxWidth: '300px',
                  width: '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Unsupported age message */}
        {respondentType === 'child' && childAgeGroup === 'unsupported' && (
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '18px', marginBottom: '24px', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--amber-primary)', display: 'block', marginBottom: '6px' }}>
              Developmental Guidance for Outside Supported Ages:
            </strong>
            For infants under 16 months, standardized autism questionnaires have elevated false-positive and false-negative rates. For adolescents aged 16–17, adult instruments can sometimes be used with clinical supervision. If you have any developmental concerns, please schedule a direct consultation with your pediatrician.
          </div>
        )}

        {/* Navigation Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <button onClick={onSkip} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            Skip to Cognitive Results Only
          </button>

          <button
            onClick={handleStart}
            disabled={respondentType === 'child' && childAgeGroup === 'unsupported'}
            className="btn-primary"
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              opacity: respondentType === 'child' && childAgeGroup === 'unsupported' ? 0.3 : 1,
            }}
          >
            <span>Proceed to Questionnaire</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
