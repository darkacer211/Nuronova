import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import ScreeningDisclaimer from './ScreeningDisclaimer';

export default function MChatFollowUp({ initialResult, testConfig, onCompleteFollowUp }) {
  const flaggedIds = initialResult.flaggedItemIds || [];
  const flaggedItems = testConfig.items.filter((i) => flaggedIds.includes(i.id));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState({}); // { [itemId]: boolean }

  const currentItem = flaggedItems[currentIndex];

  const handleSelect = (stillAtRisk) => {
    setFollowUpAnswers((prev) => ({
      ...prev,
      [currentItem.id]: stillAtRisk,
    }));
  };

  const handleNext = () => {
    if (currentIndex + 1 < flaggedItems.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all follow-up clarifications
      onCompleteFollowUp(followUpAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentAnswer = followUpAnswers[currentItem?.id];

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="badge-pill badge-violet" style={{ marginRight: '8px' }}>M-CHAT-R/F</span>
          <span className="badge-pill badge-amber">Structured Follow-Up Clarification</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Flagged Item {currentIndex + 1} of {flaggedItems.length}
        </div>
      </div>

      {/* Main Clarification Card */}
      <div className="glass-panel" style={{ padding: '36px 32px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--amber-primary)', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={15} />
          <span>Clarification Required (Initial response was at-risk)</span>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
          Item #{currentItem.number}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
          {currentItem.text}
        </p>

        {/* Clarification prompt */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '8px' }}>
            Follow-Up Interview Question:
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            Does your child perform this behavior spontaneously, independently, and across different environments (at home, with relatives, or in public)?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => handleSelect(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                background: currentAnswer === false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.02)',
                border: currentAnswer === false ? '1px solid var(--emerald-glow)' : '1px solid var(--border-subtle)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>Yes, they frequently do this normally (Behavior resolved / not at-risk)</span>
              {currentAnswer === false && <CheckCircle2 size={18} color="var(--emerald-glow)" />}
            </button>

            <button
              onClick={() => handleSelect(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-sm)',
                background: currentAnswer === true ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.02)',
                border: currentAnswer === true ? '1px solid var(--rose-primary)' : '1px solid var(--border-subtle)',
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>No, they rarely or never do this, or only with extensive prompting (Concern confirmed)</span>
              {currentAnswer === true && <AlertTriangle size={18} color="var(--rose-primary)" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-secondary"
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentAnswer === undefined}
            className="btn-primary"
            style={{ opacity: currentAnswer === undefined ? 0.4 : 1 }}
          >
            <span>{currentIndex + 1 === flaggedItems.length ? 'Finalize M-CHAT Follow-Up' : 'Next Item'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <ScreeningDisclaimer compact={true} />
    </div>
  );
}
