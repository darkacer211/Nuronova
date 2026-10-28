import React, { useEffect, useState } from 'react';
import LicensingGateModal from './LicensingGateModal';
import { isInstrumentRunnable, getInstrumentLicensing } from '../engine/textLoader';
import { useLanguage } from '../../../context/LanguageContext';
import { speakInstruction, stopAllSpeech, isAudioPlaying } from '../../../services/speechEngine';

export default function QuestionRenderer({
  testConfig,
  currentIndex,
  totalItems,
  item,
  currentValue,
  onSelectOption,
  onPrev,
  onNext,
  isLastQuestion,
  onCancel,
}) {
  const { language, t, getQuestion, getScale } = useLanguage();
  const [isLicensingModalOpen, setIsLicensingModalOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const isRunnable = isInstrumentRunnable(testConfig?.id);
  const licenseInfo = getInstrumentLicensing(testConfig?.id);

  const progressPct = Math.round(((currentIndex + 1) / (totalItems || 1)) * 100);

  // Stop reading audio on question change or unmount
  useEffect(() => {
    stopAllSpeech();
    setIsReading(false);
  }, [currentIndex, language]);

  // Keyboard shortcut support (1-7 for options, Enter for next, ArrowLeft for prev)
  useEffect(() => {
    if (!isRunnable) return;

    const handleKeyDown = (e) => {
      if (!testConfig?.scale) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= testConfig.scale.length) {
        const option = testConfig.scale[num - 1];
        if (option) {
          onSelectOption(option.value);
        }
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onPrev();
      } else if (e.key === 'Enter' && currentValue !== undefined && currentValue !== '') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentValue, testConfig?.scale, onSelectOption, onPrev, onNext, isRunnable]);

  if (!isRunnable || !item) {
    return (
      <div className="max-w-[780px] mx-auto w-full flex flex-col gap-6 py-4">
        <LicensingGateModal
          isOpen={isLicensingModalOpen}
          instrumentId={testConfig?.id}
          instrumentName={testConfig?.name}
          onClose={() => setIsLicensingModalOpen(false)}
          onSuccessLoaded={() => window.location.reload()}
        />

        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[28px]">shield</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-label-caps text-[11px] font-bold uppercase mb-3 inline-block">
            Licensing Authorization Pending
          </span>

          <h3 className="font-headline-sm text-[20px] font-bold text-on-surface mb-2">
            {testConfig?.name || 'Screening Instrument'}
          </h3>

          <p className="font-body-md text-[14px] text-on-surface-variant max-w-lg mx-auto mb-6 leading-relaxed">
            Official question text for this clinical instrument is held under copyright ({licenseInfo.requiredCopyright}). The system requires authorized text confirmation.
          </p>

          <button
            onClick={() => setIsLicensingModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-body-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
            type="button"
          >
            Supply Authorized Text
          </button>
        </div>
      </div>
    );
  }

  // Get simple, natural question text in chosen language
  const translatedQuestionText = getQuestion(item);

  // Toggle Read Question
  const handleToggleRead = () => {
    if (isReading || isAudioPlaying()) {
      stopAllSpeech();
      setIsReading(false);
    } else {
      setIsReading(true);
      speakInstruction({
        text: translatedQuestionText,
        language,
        onStart: () => setIsReading(true),
        onEnd: () => setIsReading(false),
        onError: () => setIsReading(false),
      });
    }
  };

  return (
    <div className="max-w-[780px] mx-auto w-full flex flex-col gap-5 py-4">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-[11px] font-bold uppercase">
            {testConfig.shortName}
          </span>
          {item.subscale && (
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-[11px] font-bold uppercase">
              {item.subscale}
            </span>
          )}
        </div>
        <span className="font-telemetry-data text-[13px] text-on-surface-variant">
          {t('questionProgress')} <strong>{currentIndex + 1}</strong> {t('ofTotal')} {totalItems}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden border border-surface-container-high/40">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Question Card with Dedicated Read Question Button */}
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-surface-container-high/60">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            {t('questionProgress')} #{item.number}
          </span>

          {/* Dedicated Read Question Button */}
          <button
            onClick={handleToggleRead}
            type="button"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              isReading
                ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error animate-pulse'
                : 'bg-primary/10 hover:bg-primary/20 text-primary'
            }`}
            title={isReading ? t('stopReading') : t('readQuestion')}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isReading ? 'stop' : 'volume_up'}
            </span>
            <span>{isReading ? t('stopReading') : t('readQuestion')}</span>
          </button>
        </div>

        <h3 className="font-headline-sm text-[22px] font-bold text-on-surface leading-snug mb-8">
          {translatedQuestionText}
        </h3>

        {/* Answer Options Radio List with Simplified Language Labels */}
        <div className="flex flex-col gap-3 mb-8">
          {testConfig.scale.map((option, idx) => {
            const isSelected = currentValue === option.value;
            const translatedLabel = getScale(option.label);

            return (
              <button
                key={String(option.value)}
                onClick={() => onSelectOption(option.value)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-primary-fixed/30 border-primary text-on-surface font-semibold shadow-sm'
                    : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container hover:border-primary/40 text-on-surface'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-primary bg-primary' : 'border-outline-variant bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                  </div>
                  <span className="font-body-md text-[15px]">{translatedLabel}</span>
                </div>

                <span className="font-telemetry-data text-[11px] text-on-surface-variant font-bold px-2 py-0.5 rounded bg-surface-container-highest uppercase">
                  [{idx + 1}]
                </span>
              </button>
            );
          })}
        </div>

        {/* Card Footer Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-surface-container-high/60">
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 font-body-sm text-[13px] font-semibold transition-colors flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>{t('navPrevious')}</span>
          </button>

          <button
            onClick={onNext}
            disabled={currentValue === undefined || currentValue === ''}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 font-headline-sm text-[14px] font-semibold transition-all flex items-center gap-2 shadow-sm"
            type="button"
          >
            <span>{isLastQuestion ? t('navComplete') : t('navNext')}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
