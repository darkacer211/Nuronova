import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

export default function TaskPVT({ onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, waiting, active, feedback, finished
  const [trialIndex, setTrialIndex] = useState(0);
  const [displayMs, setDisplayMs] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isLapse, setIsLapse] = useState(false);

  const TOTAL_TRIALS = 10;
  const trialsDataRef = useRef([]);
  const stimulusStartRef = useRef(0);
  const delayTimerRef = useRef(null);
  const rafIdRef = useRef(null);

  // Update animated millisecond counter
  const updateCounter = useCallback(() => {
    if (phase === 'active' || stimulusStartRef.current > 0) {
      const elapsed = Math.round(performance.now() - stimulusStartRef.current);
      setDisplayMs(elapsed);
      if (elapsed > 500 && !isLapse) {
        setIsLapse(true);
      }
      rafIdRef.current = requestAnimationFrame(updateCounter);
    }
  }, [phase, isLapse]);

  // Start a new trial with randomized ISI (1800ms - 4000ms)
  const startTrial = useCallback((index) => {
    setPhase('waiting');
    setDisplayMs(0);
    setIsLapse(false);
    stimulusStartRef.current = 0;

    const randomDelay = Math.floor(1800 + Math.random() * 2200);

    delayTimerRef.current = setTimeout(() => {
      stimulusStartRef.current = performance.now();
      setPhase('active');
      rafIdRef.current = requestAnimationFrame(updateCounter);
    }, randomDelay);
  }, [updateCounter]);

  // Handle user response (Spacebar or Click)
  const handleResponse = useCallback(() => {
    if (phase === 'waiting') {
      // False start (Premature response)
      clearTimeout(delayTimerRef.current);
      trialsDataRef.current.push({ rt: 0, falseStart: true, lapse: false });
      setFeedbackMsg('FALSE START — Wait for the stimulus!');
      setPhase('feedback');

      setTimeout(() => {
        if (trialIndex + 1 < TOTAL_TRIALS) {
          setTrialIndex((prev) => prev + 1);
          startTrial(trialIndex + 1);
        } else {
          finishTask();
        }
      }, 1200);
      return;
    }

    if (phase === 'active') {
      const rt = performance.now() - stimulusStartRef.current;
      cancelAnimationFrame(rafIdRef.current);

      const isSlow = rt > 500;
      trialsDataRef.current.push({ rt: Math.round(rt), falseStart: false, lapse: isSlow });

      setFeedbackMsg(`${Math.round(rt)} ms ${isSlow ? '(Attentional Lapse)' : '✓'}`);
      setPhase('feedback');

      setTimeout(() => {
        if (trialIndex + 1 < TOTAL_TRIALS) {
          setTrialIndex((prev) => prev + 1);
          startTrial(trialIndex + 1);
        } else {
          finishTask();
        }
      }, 1000);
    }
  }, [phase, trialIndex, startTrial]);

  // Finish task and summarize psychomotor metrics
  const finishTask = useCallback(() => {
    setPhase('finished');
    const validTrials = trialsDataRef.current.filter((t) => !t.falseStart && t.rt >= 100);
    const meanRt =
      validTrials.length > 0
        ? validTrials.reduce((sum, t) => sum + t.rt, 0) / validTrials.length
        : 310.0;

    const lapses = trialsDataRef.current.filter((t) => t.lapse).length;
    const falseStarts = trialsDataRef.current.filter((t) => t.falseStart).length;
    const invRt = 1000.0 / meanRt;

    onComplete({
      mean_rt: Math.round(meanRt),
      lapses,
      false_starts: falseStarts,
      inv_rt: Number(invRt.toFixed(2)),
      trials_count: TOTAL_TRIALS,
    });
  }, [onComplete]);

  // Keyboard Spacebar Listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'instructions') {
          startTrial(0);
        } else if (phase === 'waiting' || phase === 'active') {
          handleResponse();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [phase, handleResponse, startTrial]);

  // Teardown timers ONLY on component unmount
  useEffect(() => {
    return () => {
      clearTimeout(delayTimerRef.current);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-cyan" style={{ marginRight: '8px' }}>Task 1 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Psychomotor Vigilance Task (PVT)</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Trial {trialIndex + 1} / {TOTAL_TRIALS}
        </div>
      </div>

      {/* Main Interaction Arena */}
      <div
        className="test-arena"
        onClick={() => {
          if (phase === 'instructions') startTrial(0);
          else if (phase === 'waiting' || phase === 'active') handleResponse();
        }}
        style={{
          cursor: phase === 'finished' ? 'default' : 'pointer',
          borderColor: phase === 'active' ? (isLapse ? 'var(--rose-primary)' : 'var(--cyan-primary)') : 'var(--border-subtle)',
          boxShadow: phase === 'active' ? (isLapse ? '0 0 35px rgba(244, 63, 94, 0.4)' : '0 0 35px rgba(6, 182, 212, 0.4)') : 'none',
        }}
      >
        {phase === 'instructions' && (
          <div style={{ textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 18px auto', borderRadius: '50%', background: 'var(--cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={32} color="var(--cyan-glow)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              Measure Vigilance Reaction Time
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '24px' }}>
              Keep your gaze focused on the box. As soon as the numbers start rolling in RED, press the <strong style={{ color: '#fff' }}>SPACEBAR</strong> or <strong style={{ color: '#fff' }}>CLICK</strong> as fast as you can. Do NOT click prematurely.
            </p>
            <button className="btn-primary" onClick={() => startTrial(0)}>
              Start PVT Protocol (Spacebar)
            </button>
          </div>
        )}

        {phase === 'waiting' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#334155', margin: '0 auto 16px auto' }} />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              READY... WAIT FOR COUNTER
            </p>
          </div>
        )}

        {phase === 'active' && (
          <div style={{ textAlign: 'center' }}>
            <div
              className="mono-num"
              style={{
                fontSize: '4.8rem',
                fontWeight: 800,
                color: isLapse ? 'var(--rose-primary)' : '#ff3344',
                textShadow: isLapse ? '0 0 30px rgba(244,63,94,0.8)' : '0 0 30px rgba(255,51,68,0.8)',
                letterSpacing: '-0.04em',
              }}
            >
              {displayMs}
            </div>
            <p style={{ fontSize: '0.95rem', color: isLapse ? 'var(--rose-primary)' : 'var(--text-muted)', marginTop: '8px' }}>
              {isLapse ? 'ATTENTIONAL LAPSE (>500ms) — HIT SPACEBAR!' : 'REACT NOW!'}
            </p>
          </div>
        )}

        {phase === 'feedback' && (
          <div style={{ textAlign: 'center' }}>
            <div
              className="mono-num"
              style={{
                fontSize: '2.4rem',
                fontWeight: 700,
                color: feedbackMsg.includes('FALSE') ? 'var(--amber-primary)' : 'var(--emerald-glow)',
              }}
            >
              {feedbackMsg}
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--emerald-glow)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>PVT Task Complete</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aggregating reaction kinetics...</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Tip: Maintain your visual gaze within the boundary to optimize oculomotor stability metrics.
      </div>
    </div>
  );
}
