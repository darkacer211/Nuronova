import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'RED', color: '#f43f5e', key: 'd' },
  { name: 'BLUE', color: '#06b6d4', key: 'f' },
  { name: 'GREEN', color: '#10b981', key: 'j' },
  { name: 'YELLOW', color: '#f59e0b', key: 'k' },
];

export default function TaskStroop({ onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, trial, feedback, finished
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentStimulus, setCurrentStimulus] = useState(null);
  const [feedback, setFeedback] = useState(null); // { correct: bool, text: string }

  const TOTAL_TRIALS = 16;
  const trialsDataRef = useRef([]);
  const stimulusStartRef = useRef(0);
  const timeoutRef = useRef(null);

  // Adaptive speed setting (starts at 1400ms, decreases by 100ms on hot streaks)
  const presentationDurationRef = useRef(1400);
  const consecutiveCorrectRef = useRef(0);

  // Generate randomized stimulus list (70% incongruent, 30% congruent)
  const generateStimulus = useCallback((index) => {
    const isCongruent = Math.random() < 0.35;
    const textIdx = Math.floor(Math.random() * COLOR_OPTIONS.length);
    let colorIdx = textIdx;

    if (!isCongruent) {
      // Pick a distinct color index
      let rand = Math.floor(Math.random() * (COLOR_OPTIONS.length - 1));
      if (rand >= textIdx) rand += 1;
      colorIdx = rand;
    }

    return {
      word: COLOR_OPTIONS[textIdx].name,
      inkColor: COLOR_OPTIONS[colorIdx].color,
      correctKey: COLOR_OPTIONS[colorIdx].key,
      correctColorName: COLOR_OPTIONS[colorIdx].name,
      isCongruent: textIdx === colorIdx,
    };
  }, []);

  const runTrial = useCallback(
    (index) => {
      const stim = generateStimulus(index);
      setCurrentStimulus(stim);
      setFeedback(null);
      setPhase('trial');
      stimulusStartRef.current = performance.now();

      // Automatic timeout for adaptive speed pressure
      timeoutRef.current = setTimeout(() => {
        handleResponse('TIMEOUT');
      }, presentationDurationRef.current);
    },
    [generateStimulus]
  );

  const handleResponse = useCallback(
    (keyChosen) => {
      clearTimeout(timeoutRef.current);
      if (phase !== 'trial' || !currentStimulus) return;

      const rt = performance.now() - stimulusStartRef.current;
      const isCorrect = keyChosen.toLowerCase() === currentStimulus.correctKey;

      if (isCorrect) {
        consecutiveCorrectRef.current += 1;
        // Adaptive staircase: increase speed if user has 3 consecutive correct
        if (consecutiveCorrectRef.current >= 3) {
          presentationDurationRef.current = Math.max(presentationDurationRef.current - 120, 750);
          consecutiveCorrectRef.current = 0;
        }
      } else {
        consecutiveCorrectRef.current = 0;
        // Ease speed if user fails
        presentationDurationRef.current = Math.min(presentationDurationRef.current + 100, 1600);
      }

      trialsDataRef.current.push({
        isCongruent: currentStimulus.isCongruent,
        rt: keyChosen === 'TIMEOUT' ? 1400 : Math.round(rt),
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

      setTimeout(() => {
        if (trialIndex + 1 < TOTAL_TRIALS) {
          setTrialIndex((prev) => prev + 1);
          runTrial(trialIndex + 1);
        } else {
          finishTask();
        }
      }, 700);
    },
    [phase, currentStimulus, trialIndex, runTrial]
  );

  const finishTask = useCallback(() => {
    setPhase('finished');
    const trials = trialsDataRef.current;
    const congruentTrials = trials.filter((t) => t.isCongruent && t.correct);
    const incongruentTrials = trials.filter((t) => !t.isCongruent && t.correct);

    const meanCongruentRt =
      congruentTrials.length > 0
        ? congruentTrials.reduce((s, t) => s + t.rt, 0) / congruentTrials.length
        : 450.0;

    const meanIncongruentRt =
      incongruentTrials.length > 0
        ? incongruentTrials.reduce((s, t) => s + t.rt, 0) / incongruentTrials.length
        : 580.0;

    const cost = Math.max(meanIncongruentRt - meanCongruentRt, 20.0);
    const accuracy = trials.filter((t) => t.correct).length / trials.length;

    onComplete({
      mean_congruent_rt: Math.round(meanCongruentRt),
      mean_incongruent_rt: Math.round(meanIncongruentRt),
      interference_cost: Math.round(cost),
      accuracy: Number(accuracy.toFixed(2)),
      total_trials: TOTAL_TRIALS,
    });
  }, [onComplete]);

  // Keyboard handler for D, F, J, K keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (phase === 'instructions') {
        if (e.code === 'Space') runTrial(0);
      } else if (phase === 'trial') {
        if (['d', 'f', 'j', 'k'].includes(key)) {
          e.preventDefault();
          handleResponse(key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutRef.current);
    };
  }, [phase, handleResponse, runTrial]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-violet" style={{ marginRight: '8px' }}>Task 2 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Dual-Rule Stroop Task</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Trial {trialIndex + 1} / {TOTAL_TRIALS}
        </div>
      </div>

      {/* Main Interaction Arena */}
      <div className="test-arena">
        {phase === 'instructions' && (
          <div style={{ textAlign: 'center', maxWidth: '540px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 18px auto', borderRadius: '50%', background: 'var(--violet-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={32} color="var(--violet-glow)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              Identify the INK COLOR, not the word
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Inhibit the urge to read the printed word. Respond exclusively to the font color using keyboard keys or buttons below:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              {COLOR_OPTIONS.map((c) => (
                <div key={c.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ color: c.color, fontWeight: 700, fontSize: '0.9rem' }}>{c.name}</div>
                  <div className="mono-num" style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>Key [{c.key.toUpperCase()}]</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => runTrial(0)}>
              Start Stroop Task (Spacebar)
            </button>
          </div>
        )}

        {phase === 'trial' && currentStimulus && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '4.2rem',
                fontWeight: 800,
                color: currentStimulus.inkColor,
                letterSpacing: '0.04em',
                textShadow: `0 0 35px ${currentStimulus.inkColor}66`,
                marginBottom: '32px',
              }}
            >
              {currentStimulus.word}
            </div>

            {/* Response buttons for touch/mouse */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleResponse(c.key)}
                  className="btn-secondary"
                  style={{
                    borderColor: c.color,
                    color: '#fff',
                    padding: '12px 20px',
                    fontSize: '0.95rem',
                    background: `${c.color}22`,
                  }}
                >
                  <span style={{ fontWeight: 700, color: c.color }}>{c.name}</span>
                  <span className="mono-num" style={{ opacity: 0.7, fontSize: '0.8rem' }}>[{c.key.toUpperCase()}]</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'feedback' && feedback && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: feedback.correct ? 'var(--emerald-glow)' : 'var(--rose-primary)',
              }}
            >
              {feedback.text}
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--emerald-glow)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Stroop Task Completed</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Quantifying interference cost...</p>
          </div>
        )}
      </div>
    </div>
  );
}
