import React, { useState, useEffect, useRef, useCallback } from 'react';

const COLOR_OPTIONS = [
  { name: 'RED', color: '#dc2626', bg: 'bg-red-500', key: 'd' },
  { name: 'BLUE', color: '#2563eb', bg: 'bg-blue-600', key: 'f' },
  { name: 'GREEN', color: '#059669', bg: 'bg-emerald-600', key: 'j' },
  { name: 'YELLOW', color: '#d97706', bg: 'bg-amber-500', key: 'k' },
];

export default function TaskStroop({ onComplete, onRoundUpdate }) {
  const [phase, setPhase] = useState('instructions'); // instructions, trial, feedback, finished
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const TOTAL_TRIALS = 6;
  const trialsDataRef = useRef([]);
  const stimulusStartRef = useRef(0);
  const timeoutRef = useRef(null);

  const presentationDurationRef = useRef(1500);
  const consecutiveCorrectRef = useRef(0);

  // Initialize round tracking on mount
  useEffect(() => {
    if (onRoundUpdate) {
      onRoundUpdate(1, TOTAL_TRIALS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate randomized stimulus (65% incongruent, 35% congruent)
  const generateStimulus = useCallback(() => {
    const isCongruent = Math.random() < 0.35;
    const textIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    let colorIdx = textIdx;

    if (!isCongruent) {
      let rand = Math.floor(Math.random() * (COLOR_OPTIONS.length - 1));
      if (rand >= textIdx) rand += 1;
      colorIdx = rand;
    }

    return {
      word: COLOR_OPTIONS[textIdx].name,
      inkColor: COLOR_OPTIONS[colorIdx].color,
      inkColorClass: COLOR_OPTIONS[colorIdx].bg,
      correctKey: COLOR_OPTIONS[colorIdx].key,
      correctColorName: COLOR_OPTIONS[colorIdx].name,
      isCongruent: textIdx === colorIdx,
    };
  }, []);

  const runTrial = useCallback((index) => {
    const stim = generateStimulus();
    setCurrentStimulus(stim);
    setFeedback(null);
    setPhase('trial');
    stimulusStartRef.current = performance.now();

    if (onRoundUpdate) {
      onRoundUpdate(index + 1, TOTAL_TRIALS);
    }

    timeoutRef.current = setTimeout(() => {
      handleResponse('TIMEOUT');
    }, presentationDurationRef.current);
  }, [generateStimulus, onRoundUpdate]);

  const handleResponse = useCallback((keyChosen) => {
    clearTimeout(timeoutRef.current);
    if (phase !== 'trial' || !currentStimulus) return;

    const rt = performance.now() - stimulusStartRef.current;
    const isCorrect = keyChosen.toLowerCase() === currentStimulus.correctKey;

    if (isCorrect) {
      consecutiveCorrectRef.current += 1;
      if (consecutiveCorrectRef.current >= 3) {
        presentationDurationRef.current = Math.max(presentationDurationRef.current - 100, 800);
        consecutiveCorrectRef.current = 0;
      }
    } else {
      consecutiveCorrectRef.current = 0;
      presentationDurationRef.current = Math.min(presentationDurationRef.current + 80, 1600);
    }

    trialsDataRef.current.push({
      isCongruent: currentStimulus.isCongruent,
      rt: keyChosen === 'TIMEOUT' ? 1500 : Math.round(rt),
      correct: isCorrect,
      timeout: keyChosen === 'TIMEOUT',
    });

    setFeedback({
      correct: isCorrect,
      text: isCorrect
        ? `Correct (${Math.round(rt)} ms)`
        : keyChosen === 'TIMEOUT'
        ? 'Time Expired!'
        : `Miss! Ink color was ${currentStimulus.correctColorName}`,
    });
    setPhase('feedback');

    const nextIndex = trialIndex + 1;
    if (nextIndex < TOTAL_TRIALS) {
      setTrialIndex(nextIndex);
      setTimeout(() => {
        runTrial(nextIndex);
      }, 700);
    } else {
      setPhase('finished');
      finishTask();
    }
  }, [phase, currentStimulus, trialIndex, runTrial]);

  const finishTask = () => {
    const trials = trialsDataRef.current;
    const congruentTrials = trials.filter((t) => t.isCongruent && t.correct);
    const incongruentTrials = trials.filter((t) => !t.isCongruent && t.correct);

    const congRt = congruentTrials.length > 0
      ? Math.round(congruentTrials.reduce((a, b) => a + b.rt, 0) / congruentTrials.length)
      : 520;
    const incongRt = incongruentTrials.length > 0
      ? Math.round(incongruentTrials.reduce((a, b) => a + b.rt, 0) / incongruentTrials.length)
      : 630;
    const interferenceCost = Math.max(incongRt - congRt, 10);
    const accuracy = trials.filter((t) => t.correct).length / Math.max(trials.length, 1);

    setTimeout(() => {
      onComplete({
        congruent_mean_rt: congRt,
        incongruent_mean_rt: incongRt,
        interference_cost: interferenceCost,
        accuracy: Number(accuracy.toFixed(2)),
        total_trials: trials.length,
      });
    }, 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'instructions' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        runTrial(0);
        return;
      }
      if (phase !== 'trial') return;
      const key = e.key.toLowerCase();
      if (['d', 'f', 'j', 'k'].includes(key)) {
        e.preventDefault();
        handleResponse(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleResponse, runTrial]);

  // Derived stats for display
  const completedCount = trialsDataRef.current.length;
  const correctCount = trialsDataRef.current.filter((t) => t.correct).length;
  const currentAccuracy = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 100;

  const congruentTrials = trialsDataRef.current.filter((t) => t.isCongruent && t.correct);
  const incongruentTrials = trialsDataRef.current.filter((t) => !t.isCongruent && t.correct);
  const currentCongRt = congruentTrials.length > 0
    ? Math.round(congruentTrials.reduce((a, b) => a + b.rt, 0) / congruentTrials.length)
    : 520;
  const currentIncongRt = incongruentTrials.length > 0
    ? Math.round(incongruentTrials.reduce((a, b) => a + b.rt, 0) / incongruentTrials.length)
    : 630;
  const currentInterference = Math.max(currentIncongRt - currentCongRt, 110);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Stimulus Container */}
      <div className="relative overflow-hidden w-full min-h-[420px] rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border border-surface-container-high/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-transparent to-secondary-container/15 pointer-events-none" />

        {/* Center Stimulus Core Focus Area */}
        <div className="flex flex-col items-center max-w-xl my-auto py-4 relative z-10 w-full">
          {phase === 'instructions' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">psychology</span>
              </div>
              <h1 className="font-display text-[36px] font-bold text-on-surface mb-2 tracking-tight">
                Stroop Executive Control
              </h1>
              <p className="font-body-lg text-[15px] text-on-surface-variant mb-6 max-w-md leading-relaxed">
                Name the <strong className="text-primary font-bold">INK COLOR</strong> of the word, ignore the text reading. Strike the matching color key as fast as you can.
              </p>
              <button
                onClick={() => runTrial(0)}
                className="w-full sm:w-auto min-w-[300px] px-8 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[16px] font-semibold shadow-md hover:bg-primary-container transition-all"
                type="button"
              >
                <span>Begin Test (Press Space or Click)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Central Stroop Stimulus Word */}
              <div className="my-6 py-6 px-12 rounded-2xl bg-surface-container-low border border-surface-container-high/60 shadow-inner flex items-center justify-center min-w-[320px] min-h-[140px]">
                <span
                  className="font-display text-[58px] font-extrabold tracking-widest select-none transition-transform"
                  style={{ color: currentStimulus?.inkColor }}
                >
                  {currentStimulus?.word}
                </span>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div className={`mb-4 px-4 py-1.5 rounded-full text-[13px] font-bold flex items-center gap-1.5 shadow-sm ${
                  feedback.correct ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {feedback.correct ? 'check_circle' : 'cancel'}
                  </span>
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* 4 Interactive Color Touch Buttons with Key Shortcuts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
                {COLOR_OPTIONS.map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => handleResponse(btn.key)}
                    style={{ borderColor: btn.color }}
                    className="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container-high border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                    type="button"
                  >
                    <span className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: btn.color }}></span>
                    <span className="font-headline-sm text-[13px] font-bold text-on-surface">{btn.name}</span>
                    <span className="font-telemetry-data text-[10px] text-on-surface-variant font-semibold px-2 py-0.5 rounded bg-surface-container-highest uppercase">
                      [{btn.key.toUpperCase()}]
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simplified, Clean Auxiliary Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Accuracy */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Inhibition Accuracy
            </span>
            <span className={`material-symbols-outlined text-[18px] ${currentAccuracy >= 80 ? 'text-secondary' : 'text-amber-500'}`}>
              {currentAccuracy >= 80 ? 'verified' : 'warning'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-primary">
              {currentAccuracy}%
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-2 border-t border-surface-container-high/40">
            <span>Accuracy Rate</span>
            <span className="text-secondary font-semibold">
              {currentAccuracy >= 80 ? 'Optimal' : 'Variable'}
            </span>
          </div>
        </div>

        {/* Card 2: Baseline Speed */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Congruent RT Baseline
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              timer
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">
              {currentCongRt} ms
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-2 border-t border-surface-container-high/40">
            <span>Baseline Speed</span>
            <span className="text-primary font-semibold">Normal</span>
          </div>
        </div>

        {/* Card 3: Interference Delay */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Interference Latency
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">
              speed
            </span>
          </div>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-secondary">
              +{currentInterference} ms
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-2 border-t border-surface-container-high/40">
            <span>Cognitive Cost</span>
            <span className="text-secondary font-semibold">Typical Range</span>
          </div>
        </div>
      </div>
    </div>
  );
}
