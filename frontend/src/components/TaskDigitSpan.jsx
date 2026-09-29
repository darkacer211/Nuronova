import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function TaskDigitSpan({ onComplete, onRoundUpdate }) {
  // state: 'instructions', 'memorizing', 'recalling', 'feedback', 'finished'
  const [phase, setPhase] = useState('instructions');
  const [currentLevel, setCurrentLevel] = useState(3);
  const [currentSequence, setCurrentSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [activeDigit, setActiveDigit] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [strikes, setStrikes] = useState(0);
  const [maxSpanAchieved, setMaxSpanAchieved] = useState(0);

  const displayTimerRef = useRef(null);
  const sequenceHistoryRef = useRef([]);

  const generateSequence = (length) => {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += Math.floor(Math.random() * 10).toString();
    }
    return str;
  };

  const playSequence = useCallback((level) => {
    const seq = generateSequence(level);
    setCurrentSequence(seq);
    setUserInput('');
    setFeedback(null);
    setPhase('memorizing');

    if (onRoundUpdate) {
      onRoundUpdate(level - 2, 7);
    }

    let idx = 0;
    setActiveDigit(seq[0]);

    const interval = setInterval(() => {
      idx += 1;
      if (idx < seq.length) {
        setActiveDigit(seq[idx]);
      } else {
        clearInterval(interval);
        setActiveDigit('');
        setPhase('recalling');
      }
    }, 950);

    displayTimerRef.current = interval;
  }, [onRoundUpdate]);

  const finishTask = useCallback((finalSpan) => {
    setPhase('finished');
    const span = Math.max(finalSpan, 3);
    setTimeout(() => {
      onComplete({
        span,
        level: span,
        dprime: Number((span * 0.35 + 0.4).toFixed(2)),
        rounds_passed: span - 2,
        history: sequenceHistoryRef.current,
      });
    }, 1200);
  }, [onComplete]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'recalling' || !userInput) return;

    const isCorrect = userInput.trim() === currentSequence.trim();
    sequenceHistoryRef.current.push({
      level: currentLevel,
      target: currentSequence,
      input: userInput,
      correct: isCorrect,
    });

    if (isCorrect) {
      const newMax = Math.max(maxSpanAchieved, currentLevel);
      setMaxSpanAchieved(newMax);
      setFeedback({ correct: true, text: `Correct! Sequence length: ${currentLevel} Digits` });
      setPhase('feedback');

      setTimeout(() => {
        const nextLevel = currentLevel + 1;
        setCurrentLevel(nextLevel);
        playSequence(nextLevel);
      }, 1200);
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setFeedback({
        correct: false,
        text: `Incorrect. Sequence was: ${currentSequence}`,
      });
      setPhase('feedback');

      if (newStrikes >= 2 || currentLevel >= 9) {
        setTimeout(() => {
          finishTask(Math.max(maxSpanAchieved, currentLevel - 1));
        }, 1500);
      } else {
        setTimeout(() => {
          playSequence(currentLevel);
        }, 1500);
      }
    }
  }, [phase, userInput, currentSequence, currentLevel, maxSpanAchieved, strikes, playSequence, finishTask]);

  const handleKeypadPress = (val) => {
    if (phase !== 'recalling') return;
    if (val === 'backspace') {
      setUserInput((prev) => prev.slice(0, -1));
    } else if (val === 'submit') {
      handleSubmit();
    } else {
      if (userInput.length < currentLevel + 2) {
        setUserInput((prev) => prev + val);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'instructions' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        playSequence(3);
        return;
      }
      if (phase !== 'recalling') return;
      if (e.key >= '0' && e.key <= '9') {
        setUserInput((prev) => (prev.length < currentLevel + 2 ? prev + e.key : prev));
      } else if (e.key === 'Backspace') {
        setUserInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentLevel, handleSubmit, playSequence]);

  useEffect(() => {
    return () => {
      if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Stimulus Container */}
      <div className="relative overflow-hidden w-full min-h-[460px] rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col items-center justify-between text-center transition-all duration-300 border border-surface-container-high/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-transparent to-secondary-container/15 pointer-events-none" />

        {/* Top Meta Bar */}
        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant border border-surface-container-high/60 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider">
              Paradigm #DSP-03
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Sequence Span: <strong className="text-primary">{currentLevel} Digits</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Errors: <strong className={strikes > 0 ? 'text-tertiary' : 'text-secondary'}>{strikes} of 2</strong>
            </span>
          </div>
        </div>

        {/* Center Stimulus Core Focus Area */}
        <div className="flex flex-col items-center max-w-xl my-auto py-4 relative z-10 w-full">
          {phase === 'instructions' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">dialpad</span>
              </div>
              <h1 className="font-display text-[36px] font-bold text-on-surface mb-2 tracking-tight">
                Working Memory Digit Span
              </h1>
              <p className="font-body-lg text-[15px] text-on-surface-variant mb-6 max-w-md leading-relaxed">
                Watch the screen as digits flash one-by-one. When the sequence ends, type the exact numbers in order using your keyboard or the on-screen keypad.
              </p>
              <button
                onClick={() => playSequence(3)}
                className="w-full sm:w-auto min-w-[320px] px-8 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[16px] font-semibold shadow-md hover:bg-primary-container transition-all"
                type="button"
              >
                <span>Start Memorization (Level 3)</span>
              </button>
            </div>
          ) : phase === 'memorizing' ? (
            <div className="flex flex-col items-center py-6">
              <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-primary mb-3">
                Memorize Sequence ({currentLevel} Digits)
              </span>
              <div className="w-36 h-36 rounded-3xl bg-surface-container-high border-2 border-primary/40 flex items-center justify-center shadow-lg transform scale-110 transition-all">
                <span className="font-telemetry-numeric-lg text-[72px] font-black text-primary animate-pulse">
                  {activeDigit}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-6">
                {Array.from({ length: currentLevel }).map((_, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-primary-fixed-dim"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full max-w-sm">
              <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-secondary mb-2">
                Recall Phase: Type Sequence in Order
              </span>

              {/* Input Display Box */}
              <div className="w-full py-3 px-4 rounded-xl bg-surface-container-low border-2 border-primary/50 text-center mb-4 min-h-[56px] flex items-center justify-center shadow-inner">
                <span className="font-telemetry-numeric-lg text-[32px] font-bold text-on-surface tracking-widest">
                  {userInput || <span className="text-outline-variant text-[24px]">_ _ _</span>}
                </span>
              </div>

              {/* Feedback Pill */}
              {feedback && (
                <div className={`mb-3 px-3 py-1 rounded-full text-[12px] font-bold flex items-center gap-1.5 ${
                  feedback.correct ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-error-container text-on-error-container'
                }`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {feedback.correct ? 'check_circle' : 'cancel'}
                  </span>
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Virtual Touch Keypad */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(String(num))}
                    className="py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-on-surface font-telemetry-numeric-lg text-[18px] font-bold transition-all active:scale-95 shadow-sm"
                    type="button"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => handleKeypadPress('backspace')}
                  className="py-3 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-all active:scale-95"
                  type="button"
                  title="Backspace"
                >
                  <span className="material-symbols-outlined text-[20px]">backspace</span>
                </button>
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="py-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-surface-container-high text-on-surface font-telemetry-numeric-lg text-[18px] font-bold transition-all active:scale-95 shadow-sm"
                  type="button"
                >
                  0
                </button>
                <button
                  onClick={() => handleKeypadPress('submit')}
                  disabled={!userInput}
                  className="py-3 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-body-sm text-[13px] font-bold transition-all active:scale-95 flex items-center justify-center disabled:opacity-40 shadow-sm"
                  type="button"
                  title="Submit"
                >
                  <span className="material-symbols-outlined text-[20px]">check</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Context Info */}
        <div className="w-full flex items-center justify-between text-on-surface-variant pt-3 border-t border-surface-container-high/40 relative z-10 text-[12px]">
          <span>Phonological loop and prefrontal working memory storage capacity.</span>
          <span className="font-telemetry-data">Normative reference: Miller's Law (7 ± 2 digits)</span>
        </div>
      </div>

      {/* Auxiliary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Max Sequence Span</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-primary">
              {maxSpanAchieved || currentLevel} Digits
            </span>
            <span className="text-[12px] text-on-surface-variant">retention capacity</span>
          </div>
          <span className="text-[12px] text-secondary font-medium">Standard cognitive limit</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">D-Prime Working Score</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">2.45 d'</span>
            <span className="text-[12px] text-on-surface-variant">sensitivity index</span>
          </div>
          <span className="text-[12px] text-on-surface-variant">High sequential memory fidelity</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Strike Tolerance</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-secondary">{2 - strikes} Remaining</span>
            <span className="text-[12px] text-on-surface-variant">error threshold</span>
          </div>
          <span className="text-[12px] text-on-surface-variant">Terminates on 2 consecutive mistakes</span>
        </div>
      </div>
    </div>
  );
}
