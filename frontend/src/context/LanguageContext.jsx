import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  SUPPORTED_LANGUAGES,
  UI_TRANSLATIONS,
  TEST_EXPLANATIONS,
  getTranslatedQuestion,
  getTranslatedScaleLabel,
} from '../utils/translations';
import { preloadLiveToken } from '../services/geminiLiveClient';

const LanguageContext = createContext(null);

const STORAGE_KEY_LANG = 'neuronova_language';

export function LanguageProvider({ children }) {
  // 1. Language state: English default
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        return saved;
      }
    }
    return 'en';
  });

  // 2. Gemini API key: Strictly read from environment variable (Vercel / .env)
  const [geminiApiKey] = useState(() => {
    return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
  });

  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);

  // Pre-load ephemeral token on mount so calling connects with 0ms delay
  useEffect(() => {
    if (geminiApiKey) {
      preloadLiveToken(geminiApiKey);
    }
  }, [geminiApiKey]);

  // Sync language changes
  const setLanguage = useCallback((langCode) => {
    if (langCode === 'en' || langCode === 'hi' || langCode === 'mr') {
      setLanguageState(langCode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_LANG, langCode);
      }
    }
  }, []);

  // Safe stub for backwards compatibility
  const setGeminiApiKey = useCallback(() => {}, []);

  // Helper for UI translation
  const t = useCallback(
    (key, fallback = '') => {
      const entry = UI_TRANSLATIONS[key];
      if (!entry) return fallback || key;
      return entry[language] || entry.en || fallback || key;
    },
    [language]
  );

  // Helper for test explanations
  const getTestExplanation = useCallback(
    (testId) => {
      const exp = TEST_EXPLANATIONS[testId];
      if (!exp) return null;
      return {
        id: exp.id,
        name: exp.name[language] || exp.name.en,
        shortDesc: exp.shortDesc[language] || exp.shortDesc.en,
        audioTranscript: exp.audioTranscript[language] || exp.audioTranscript.en,
        keyPoints: exp.keyPoints[language] || exp.keyPoints.en,
      };
    },
    [language]
  );

  // Helper to get translated question
  const getQuestion = useCallback(
    (item) => getTranslatedQuestion(item, language),
    [language]
  );

  // Helper to get translated scale option
  const getScale = useCallback(
    (label) => getTranslatedScaleLabel(label, language),
    [language]
  );

  const value = {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
    getTestExplanation,
    getQuestion,
    getScale,
    geminiApiKey,
    setGeminiApiKey,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    isVoiceAgentOpen,
    setIsVoiceAgentOpen,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
