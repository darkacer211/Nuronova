import React, { useState, useEffect } from 'react';

export default function Header({
  currentStep,
  gazeActive = false,
  micActive = false,
  onReset,
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    setIsDark(isNowDark);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60 transition-colors">
      <div className="h-20 w-full px-6 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          className="flex items-center gap-3 min-w-max cursor-pointer select-none"
          onClick={onReset}
          title="Return to Begin Assessment"
        >
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shadow-sm transition-transform hover:scale-105">
            <span className="material-symbols-outlined text-[24px]">neurology</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-[18px] font-bold text-on-surface leading-tight tracking-tight">
              NeuroNova
            </span>
            <span className="font-label-caps text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase">
              Cognitive Neuro-Analytics & Screening
            </span>
          </div>
        </div>



        {/* Right Controls & Profile */}
        <div className="flex items-center gap-3 min-w-max">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"
            title="Toggle Light/Dark Theme"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* End Session Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors shadow-sm"
            type="button"
            title="End or Reset Session"
          >
            <span className="material-symbols-outlined text-[18px]">power_settings_new</span>
            <span className="font-body-sm text-[13px] font-semibold">End Session</span>
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm" title="Active Clinician / Participant">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
