import React, { useState } from 'react';
import ScreeningDisclaimer from './ScreeningDisclaimer';

export default function AgeRouterModal({ onRouteSelected, onSkip }) {
  const [respondentType, setRespondentType] = useState('adult'); // 'adult' or 'child'
  const [childAgeGroup, setChildAgeGroup] = useState('toddler'); // 'toddler' or 'older'
  const [childNickname, setChildNickname] = useState('');

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
      } else {
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
    <div className="max-w-[780px] mx-auto w-full flex flex-col gap-6 py-4">
      {/* Header Card */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-[11px] font-bold uppercase">
            Part 2 of 2: Behavioral Screener
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-caps text-[11px] font-bold uppercase">
            100% Client-Side Privacy
          </span>
        </div>
        <h2 className="font-headline-lg text-[26px] font-bold text-on-surface mb-2">
          Age & Participant Adaptive Router
        </h2>
        <p className="font-body-md text-[14px] text-on-surface-variant max-w-xl mx-auto mb-4 leading-relaxed">
          Cognitive tests are complete. To provide accurate, age-validated behavioral questionnaires for ADHD and Autism traits, please select who this evaluation is for.
        </p>

        <ScreeningDisclaimer compact={true} />
      </div>

      {/* Choice Panel */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60">
        <h3 className="font-headline-sm text-[16px] font-bold text-on-surface mb-4">
          1. Who is this screening being completed for?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Adult */}
          <div
            onClick={() => setRespondentType('adult')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
              respondentType === 'adult'
                ? 'bg-surface-container-high/40 border-primary shadow-sm'
                : 'bg-surface-container-low border-surface-container-high hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">Myself (Adult 18+)</h4>
                <span className="font-label-caps text-[11px] uppercase text-on-surface-variant">Self-Assessment</span>
              </div>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              Standard adult AuDHD battery: ASRS-v1.1 (ADHD screener) + AQ-10 (Autism screener).
            </p>
          </div>

          {/* Child */}
          <div
            onClick={() => setRespondentType('child')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
              respondentType === 'child'
                ? 'bg-surface-container-high/40 border-secondary shadow-sm'
                : 'bg-surface-container-low border-surface-container-high hover:border-secondary/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                <span className="material-symbols-outlined text-[20px]">child_care</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">My Child (Parent Report)</h4>
                <span className="font-label-caps text-[11px] uppercase text-on-surface-variant">Caregiver Assisted</span>
              </div>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              Pediatric developmental instruments tailored by age range (16–30m M-CHAT-R/F or Ages 4–15).
            </p>
          </div>
        </div>

        {/* Child Sub-options */}
        {respondentType === 'child' && (
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 mb-6 flex flex-col gap-4">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-secondary">
              Select Child's Age Group:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setChildAgeGroup('toddler')}
                className={`p-3 rounded-lg text-left border transition-all ${
                  childAgeGroup === 'toddler'
                    ? 'bg-secondary-fixed/50 border-secondary text-on-secondary-fixed-variant font-bold'
                    : 'bg-surface-container-lowest border-surface-container-high text-on-surface'
                }`}
                type="button"
              >
                <div className="font-headline-sm text-[14px]">Toddler (16–30 months)</div>
                <div className="text-[12px] opacity-80">M-CHAT-R/F Validated Screener</div>
              </button>

              <button
                onClick={() => setChildAgeGroup('older')}
                className={`p-3 rounded-lg text-left border transition-all ${
                  childAgeGroup === 'older'
                    ? 'bg-secondary-fixed/50 border-secondary text-on-secondary-fixed-variant font-bold'
                    : 'bg-surface-container-lowest border-surface-container-high text-on-surface'
                }`}
                type="button"
              >
                <div className="font-headline-sm text-[14px]">Child (Ages 4–15)</div>
                <div className="text-[12px] opacity-80">Pediatric AuDHD Battery (Vanderbilt + AQ-10)</div>
              </button>
            </div>

            <div>
              <label className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant block mb-1">
                Child's Name or Nickname (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Leo"
                value={childNickname}
                onChange={(e) => setChildNickname(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container-high text-[13px] text-on-surface outline-none focus:border-secondary"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high/60">
          <button
            onClick={onSkip}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high font-body-sm text-[13px] transition-colors"
            type="button"
          >
            Skip Screener (View Cognitive Telemetry Only)
          </button>

          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[15px] font-semibold hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm"
            type="button"
          >
            <span>Proceed to Behavioral Screener</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
