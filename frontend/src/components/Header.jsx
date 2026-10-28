import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import logoImg from '../assets/logo.png';

export default function Header({
  currentStep,
  gazeActive = false,
  micActive = false,
  onReset,
}) {
  const [isDark, setIsDark] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const {
    language,
    setLanguage,
    supportedLanguages,
    t,
    setIsVoiceAgentOpen,
  } = useLanguage();

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const handleOutsideClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    setIsDark(isNowDark);
  };

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <header className="fixed top-0 left-0 right-0 h-20 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/60 transition-colors">
      <div className="h-20 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div
          className="flex items-center gap-3 min-w-max cursor-pointer select-none group"
          onClick={onReset}
          title="Return to Begin Assessment"
        >
          <div className="w-12 h-12 rounded-xl p-1 overflow-hidden shadow-sm transition-transform group-hover:scale-105 flex items-center justify-center bg-surface-container-high/60 border border-surface-container-high">
            <img
              src={logoImg}
              alt="NeuroNova Brain Emblem"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-[18px] font-bold text-on-surface leading-tight tracking-tight">
              {t('appTitle')}
            </span>
            <span className="font-label-caps text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase">
              {t('appSubtitle')}
            </span>
          </div>
        </div>

        {/* Right Controls: Language Selector, Gemini Live API, Voice Agent, Theme, End Session */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-max">
          {/* Top-Right Language Switcher Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-high transition-colors shadow-sm text-[13px] font-semibold"
              title="Select Language (English, Hindi, Marathi)"
            >
              <span className="text-[15px]">{currentLangObj.flag}</span>
              <span className="font-body-sm font-bold">{currentLangObj.nativeLabel}</span>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                {isLangOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface-container-lowest border border-surface-container-high shadow-xl py-1.5 z-50 animate-fadeIn backdrop-blur-lg">
                <div className="px-3 py-1 border-b border-surface-container-high/50 text-[10px] font-mono font-bold uppercase tracking-wider text-on-surface-variant">
                  Select Language
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-[13px] transition-colors ${
                      language === lang.code
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[16px]">{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                    </div>
                    {language === lang.code && (
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Dedicated AuDHD Voice Agent Header Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsVoiceAgentOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary hover:opacity-95 transition-all shadow-sm group"
            title="Open Nova Voice Agent (AuDHD & Cognitive Health)"
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px] group-hover:scale-110 transition-transform">
                smart_toy
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary animate-pulse" />
            </div>
            <span className="font-body-sm text-[12px] font-bold hidden sm:inline">
              {t('voiceAgentTitle')}
            </span>
          </button>

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
            <span className="font-body-sm text-[13px] font-semibold hidden md:inline">
              {t('endSession')}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
