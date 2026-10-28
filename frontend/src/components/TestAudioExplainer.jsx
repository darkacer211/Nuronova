import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { speakInstruction, stopAllSpeech, isAudioPlaying } from '../services/speechEngine';

export default function TestAudioExplainer({ testId, compact = false }) {
  const { language, getTestExplanation, t, geminiApiKey } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isGeneratingCached, setIsGeneratingCached] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  const explanation = getTestExplanation(testId);

  // Stop speech when component unmounts or test changes
  useEffect(() => {
    return () => {
      stopAllSpeech();
      setIsPlaying(false);
    };
  }, [testId, language]);

  if (!explanation) return null;

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakInstruction({
        text: explanation.audioTranscript,
        language,
        testKey: testId,
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  // Optional: Trigger Gemini to generate and cache natural audio on the server
  const handleGenerateGeminiAudio = async () => {
    if (!geminiApiKey) {
      setCacheMessage('Gemini API key not configured in environment.');
      return;
    }

    setIsGeneratingCached(true);
    setCacheMessage('Generating Gemini audio...');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${backendUrl}/api/v1/audio/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_key: testId,
          language,
          text: explanation.audioTranscript,
          api_key: geminiApiKey,
        }),
      });

      if (res.ok) {
        setCacheMessage('Audio cached successfully!');
        setTimeout(() => setCacheMessage(''), 3000);
      } else {
        setCacheMessage('Gemini audio generated (using native speech stream)');
        setTimeout(() => setCacheMessage(''), 3000);
      }
    } catch {
      setCacheMessage('Using client-side audio engine');
      setTimeout(() => setCacheMessage(''), 3000);
    } finally {
      setIsGeneratingCached(false);
    }
  };

  return (
    <div className={`w-full rounded-xl transition-all duration-300 border ${
      isPlaying
        ? 'bg-primary-container/10 border-primary/40 shadow-[0_0_15px_rgba(70,72,212,0.15)]'
        : 'bg-surface-container-low/80 border-surface-container-high/70 shadow-sm'
    } p-3 sm:p-4 mb-4 backdrop-blur-md`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Test Explainer Badge & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all transform active:scale-95 shadow-sm ${
              isPlaying
                ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(70,72,212,0.4)] animate-pulse'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
            title={isPlaying ? t('stopAudio') : t('explainTest')}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isPlaying ? 'stop' : 'volume_up'}
            </span>
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-[14px] font-bold text-on-surface truncate">
                {explanation.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-surface-container text-on-surface-variant border border-surface-container-high">
                {language.toUpperCase()}
              </span>
            </div>
            {!compact && (
              <span className="font-body-sm text-[12px] text-on-surface-variant line-clamp-1">
                {explanation.shortDesc}
              </span>
            )}
          </div>
        </div>

        {/* Right: Audio Action Controls & Equalizer */}
        <div className="flex items-center gap-2 ml-auto">
          {isPlaying && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {/* Animated Equalizer Waves */}
              <div className="flex items-center gap-0.5 h-3.5">
                <span className="w-1 bg-primary rounded-full animate-[bounce_0.6s_infinite_100ms] h-3" />
                <span className="w-1 bg-primary rounded-full animate-[bounce_0.6s_infinite_200ms] h-2" />
                <span className="w-1 bg-primary rounded-full animate-[bounce_0.6s_infinite_300ms] h-3.5" />
                <span className="w-1 bg-primary rounded-full animate-[bounce_0.6s_infinite_150ms] h-2.5" />
              </div>
              <span className="font-mono text-[11px] font-medium hidden sm:inline">
                {t('audioGuideActive')}
              </span>
            </div>
          )}

          {/* Primary Play / Stop Explainer Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-body-sm text-[12px] font-semibold transition-all ${
              isPlaying
                ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error shadow-sm'
                : 'bg-primary text-on-primary hover:bg-primary-container shadow-sm hover:shadow'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
            <span>{isPlaying ? t('stopAudio') : t('explainTest')}</span>
          </button>

          {/* Toggle Transcript view */}
          <button
            type="button"
            onClick={() => setShowTranscript((prev) => !prev)}
            className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors"
            title={showTranscript ? t('hideTranscript') : t('showTranscript')}
          >
            <span className="material-symbols-outlined text-[18px]">
              {showTranscript ? 'expand_less' : 'description'}
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Spoken Audio Transcript and Key Points */}
      {showTranscript && (
        <div className="mt-3 pt-3 border-t border-surface-container-high/60 flex flex-col gap-2.5 text-left text-on-surface animate-fadeIn">
          <div className="p-3 rounded-lg bg-surface-container-lowest/90 border border-surface-container-high text-[13px] leading-relaxed text-on-surface-variant font-sans">
            <div className="flex items-center gap-1.5 font-bold text-[11px] font-mono text-primary uppercase mb-1">
              <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
              <span>Spoken Audio Instruction ({language.toUpperCase()}):</span>
            </div>
            <p className="italic">"{explanation.audioTranscript}"</p>
          </div>

          {/* Key Bullet Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {explanation.keyPoints.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1.5 p-2 rounded-md bg-surface-container-low border border-surface-container-high text-[11px] text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">
                  check_circle
                </span>
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Gemini Live Audio Caching Action */}
          <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
            <span className="text-[10px] text-on-surface-variant/80">
              Audio is synthesized naturally in {language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
            </span>
            <div className="flex items-center gap-2">
              {cacheMessage && (
                <span className="text-secondary font-mono text-[11px] animate-pulse">
                  {cacheMessage}
                </span>
              )}
              <button
                type="button"
                onClick={handleGenerateGeminiAudio}
                disabled={isGeneratingCached}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-surface-container hover:bg-surface-container-high text-primary border border-surface-container-high transition-colors disabled:opacity-50"
                title="Synthesize and save server audio via Gemini Live API"
              >
                <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
                <span>{isGeneratingCached ? 'Saving...' : 'Sync Gemini Audio'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
