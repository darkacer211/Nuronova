import React, { useState } from 'react';

export default function MChatFollowUp({ initialResult, testConfig, onCompleteFollowUp }) {
  const flaggedIds = initialResult?.flaggedItemIds || [];
  const flaggedItems = testConfig?.items?.filter((i) => flaggedIds.includes(i.id)) || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [followUpAnswers, setFollowUpAnswers] = useState({});

  const currentItem = flaggedItems[currentIndex];

  if (!currentItem || flaggedItems.length === 0) {
    return (
      <div className="max-w-[780px] mx-auto w-full py-4">
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60 text-center">
          <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">
            Follow-Up Clarification Complete
          </h3>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-6">
            All milestone criteria have been clarified and scored.
          </p>
          <button
            onClick={() => onCompleteFollowUp(followUpAnswers)}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[15px] font-semibold hover:bg-primary-container transition-all"
            type="button"
          >
            Proceed to Diagnostic Profile
          </button>
        </div>
      </div>
    );
  }

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
    <div className="max-w-[780px] mx-auto w-full flex flex-col gap-5 py-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-caps text-[11px] font-bold uppercase">
            M-CHAT-R/F
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-caps text-[11px] font-bold uppercase">
            Structured Follow-Up Clarification
          </span>
        </div>
        <span className="font-telemetry-data text-[13px] text-on-surface-variant">
          Flagged Item <strong>{currentIndex + 1}</strong> of {flaggedItems.length}
        </span>
      </div>

      {/* Main Clarification Card */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60">
        <div className="flex items-center gap-2 text-amber-600 font-semibold text-[13px] mb-3">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>Clarification Required (Initial response was at-risk)</span>
        </div>

        <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">
          Item #{currentItem.number}
        </h3>
        <p className="font-body-md text-[15px] text-on-surface-variant mb-6 leading-relaxed">
          {currentItem.text}
        </p>

        {/* Structured Clarification Prompt */}
        <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/60 mb-6">
          <h4 className="font-headline-sm text-[15px] font-bold text-on-surface mb-2">
            Follow-Up Interview Question:
          </h4>
          <p className="font-body-md text-[14px] text-on-surface-variant mb-5 leading-relaxed">
            Does your child perform this behavior spontaneously, independently, and across different environments (at home, with relatives, or in public)?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleSelect(false)}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                currentAnswer === false
                  ? 'bg-secondary-fixed/50 border-secondary text-on-secondary-fixed-variant font-semibold'
                  : 'bg-surface-container-lowest border-surface-container-high hover:border-secondary/40 text-on-surface'
              }`}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-secondary">check_circle</span>
                <span>Yes, performs behavior consistently across environments (Passed)</span>
              </div>
            </button>

            <button
              onClick={() => handleSelect(true)}
              className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                currentAnswer === true
                  ? 'bg-amber-100 border-amber-500 text-amber-900 font-semibold'
                  : 'bg-surface-container-lowest border-surface-container-high hover:border-amber-400 text-on-surface'
              }`}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-amber-600">cancel</span>
                <span>No, does not perform or only does so with extensive prompting (Failed)</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high/60">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 font-body-sm text-[13px] font-semibold transition-colors"
            type="button"
          >
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={currentAnswer === undefined}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 font-headline-sm text-[14px] font-semibold transition-all shadow-sm"
            type="button"
          >
            {currentIndex + 1 === flaggedItems.length ? 'Finalize Evaluation' : 'Next Flagged Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
