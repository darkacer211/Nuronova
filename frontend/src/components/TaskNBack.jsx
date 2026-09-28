import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'H', 'K', 'M', 'R', 'T', 'X'];

export default function TaskNBack({ onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, presenting, interstimulus, finished
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('');
  const [nLevel] = useState(2); // 2-Back
  const [userFeedback, setUserFeedback] = useState(null); // 'hit', 'fa', 'miss', null
  const [canMatch, setCanMatch] = useState(false);

  const TOTAL_TRIALS = 12;
  const historyRef = useRef([]);
  const userResponsesRef = useRef([]);
  const hasRespondedThisTrialRef = useRef(false);
  const trialTimerRef = useRef(null);
  const isiTimerRef = useRef(null);

  // Generate letter sequence with guaranteed match targets after step N
  const generateNextLetter = (hist, n) => {
    // Force match on ~40% of trials after step 2
    if (hist.length >= n && Math.random() < 0.42) {
      return hist[hist.length - n]; // True 2-back match
    }
    // Random letter from alphabet
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  };

  // Signal Detection Theory d-prime (d') calculation
  const calculateDPrime = (hits, misses, fas, crs) => {
    const targets = Math.max(hits + misses, 1);
    const nonTargets = Math.max(fas + crs, 1);

    // Log-linear adjustment for small sample sizes
    const hitRate = (hits + 0.5) / (targets + 1);
    const faRate = (fas + 0.5) / (nonTargets + 1);

    const probit = (p) => {
      const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
      const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
      const q = p - 0.5;
      if (Math.abs(q) <= 0.42) {
        const r = q * q;
        return (q * (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5])) /
               (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1.0);
      }
      const r = p < 0.5 ? p : 1 - p;
      const t = Math.sqrt(-2 * Math.log(r));
      const z = -(t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t));
      return p < 0.5 ? z : -z;
    };

    return Math.min(Math.max(probit(hitRate) - probit(faRate), 0.2), 3.8);
  };

  const finishTask = useCallback(() => {
    setPhase('finished');
    const responses = userResponsesRef.current;

    const hits = responses.filter((r) => r.result === 'hit').length;
    const misses = responses.filter((r) => r.result === 'miss').length;
    const fas = responses.filter((r) => r.result === 'fa').length;
    const crs = responses.filter((r) => r.result === 'cr').length;

    const dprime = calculateDPrime(hits, misses, fas, crs);
    const total = Math.max(hits + misses + fas + crs, 1);
    const accuracy = (hits + crs) / total;

    setTimeout(() => {
      onComplete({
        level: nLevel,
        accuracy: Number(accuracy.toFixed(2)),
        dprime: Number(dprime.toFixed(2)),
        hits,
        misses,
        false_alarms: fas,
        correct_rejections: crs,
      });
    }, 1200);
  }, [nLevel, onComplete]);

  // Main trial runner function
  const runTrial = useCallback((index) => {
    // Clear any existing trial timers
    if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
    if (isiTimerRef.current) clearTimeout(isiTimerRef.current);

    hasRespondedThisTrialRef.current = false;
    setUserFeedback(null);
    setTrialIndex(index);

    const letter = generateNextLetter(historyRef.current, nLevel);
    historyRef.current.push(letter);
    setCurrentLetter(letter);

    const isMatchCapable = historyRef.current.length > nLevel;
    setCanMatch(isMatchCapable);
    setPhase('presenting');

    // 1. Presentation window: 1000ms
    trialTimerRef.current = setTimeout(() => {
      setPhase('interstimulus');

      // 2. Inter-stimulus interval (blank): 1200ms
      isiTimerRef.current = setTimeout(() => {
        // Evaluate response if not user-triggered
        const hist = historyRef.current;
        const wasActualMatch = isMatchCapable && hist[index] === hist[index - nLevel];

        if (!hasRespondedThisTrialRef.current) {
          if (wasActualMatch) {
            userResponsesRef.current.push({ trial: index, result: 'miss' });
          } else {
            userResponsesRef.current.push({ trial: index, result: 'cr' });
          }
        }

        // Advance to next trial or finish
        if (index + 1 < TOTAL_TRIALS) {
          runTrial(index + 1);
        } else {
          finishTask();
        }
      }, 1200);
    }, 1000);
  }, [nLevel, finishTask]);

  const handleMatchPress = useCallback(() => {
    if (hasRespondedThisTrialRef.current || phase === 'instructions' || phase === 'finished') return;
    hasRespondedThisTrialRef.current = true;

    const hist = historyRef.current;
    const isActualMatch = hist.length > nLevel && hist[hist.length - 1] === hist[hist.length - 1 - nLevel];

    if (isActualMatch) {
      userResponsesRef.current.push({ trial: trialIndex, result: 'hit' });
      setUserFeedback('hit');
    } else {
      userResponsesRef.current.push({ trial: trialIndex, result: 'fa' });
      setUserFeedback('fa');
    }
  }, [phase, trialIndex, nLevel]);

  // Keyboard handler for Spacebar (start) and Key M (match)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'instructions') {
          historyRef.current = [];
          userResponsesRef.current = [];
          runTrial(0);
        } else if (phase === 'presenting' || phase === 'interstimulus') {
          handleMatchPress();
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        if (phase === 'presenting' || phase === 'interstimulus') {
          handleMatchPress();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, runTrial, handleMatchPress]);

  // Teardown timers ONLY on component unmount
  useEffect(() => {
    return () => {
      if (trialTimerRef.current) clearTimeout(trialTimerRef.current);
      if (isiTimerRef.current) clearTimeout(isiTimerRef.current);
    };
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-emerald" style={{ marginRight: '8px' }}>Task 3 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>2-Back Working Memory Task</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Letter {trialIndex + 1} of {TOTAL_TRIALS}
        </div>
      </div>

      {/* Main Interaction Arena */}
      <div className="test-arena">
        {phase === 'instructions' && (
          <div style={{ textAlign: 'center', maxWidth: '540px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 18px auto', borderRadius: '50%', background: 'var(--emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={32} color="var(--emerald-glow)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              2-Back Working Memory Updating
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '18px' }}>
              Letters will appear one by one. Press <strong style={{ color: '#fff' }}>KEY [M]</strong>, <strong style={{ color: '#fff' }}>SPACEBAR</strong>, or click the <strong style={{ color: 'var(--emerald-glow)' }}>MATCH</strong> button whenever the current letter matches the one shown <strong style={{ color: 'var(--emerald-glow)' }}>2 steps ago</strong>.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Example: <strong>A</strong> &rarr; X &rarr; <strong style={{ color: 'var(--emerald-glow)' }}>A (PRESS MATCH!)</strong> &rarr; K &rarr; ...
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                historyRef.current = [];
                userResponsesRef.current = [];
                runTrial(0);
              }}
            >
              Start 2-Back Task (Spacebar)
            </button>
          </div>
        )}

        {(phase === 'presenting' || phase === 'interstimulus') && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            {/* Target Letter or ISI Blank */}
            <div
              style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
            >
              {phase === 'presenting' ? (
                <div
                  className="mono-num"
                  style={{
                    fontSize: '6.8rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 45px rgba(16, 185, 129, 0.6)',
                  }}
                >
                  {currentLetter}
                </div>
              ) : (
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#334155' }} />
              )}
            </div>

            {/* Match Status / Feedback */}
            <div style={{ height: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {userFeedback === 'hit' && (
                <span className="badge-pill badge-emerald" style={{ fontSize: '0.88rem', padding: '6px 14px' }}>
                  ✓ Match Recorded (Correct Hit)
                </span>
              )}
              {userFeedback === 'fa' && (
                <span className="badge-pill badge-rose" style={{ fontSize: '0.88rem', padding: '6px 14px' }}>
                  ✗ False Alarm (Did not match 2-back)
                </span>
              )}
              {!userFeedback && canMatch && (
                <span style={{ fontSize: '0.82rem', color: 'var(--emerald-glow)', opacity: 0.8 }}>
                  ● 2-Back Matching Active
                </span>
              )}
              {!userFeedback && !canMatch && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Loading working memory buffer (Step {trialIndex + 1}/2)...
                </span>
              )}
            </div>

            {/* Match Action Button */}
            <button
              onClick={handleMatchPress}
              className="btn-primary"
              disabled={hasRespondedThisTrialRef.current}
              style={{
                width: '100%',
                padding: '16px 24px',
                fontSize: '1.15rem',
                background: userFeedback === 'hit'
                  ? 'var(--emerald-primary)'
                  : userFeedback === 'fa'
                  ? 'var(--rose-primary)'
                  : 'linear-gradient(135deg, var(--emerald-primary), #059669)',
                boxShadow: '0 6px 24px rgba(16, 185, 129, 0.4)',
                opacity: hasRespondedThisTrialRef.current ? 0.6 : 1,
              }}
            >
              <Zap size={20} />
              <span>{hasRespondedThisTrialRef.current ? 'RESPONSE RECORDED' : '2-BACK MATCH (Key M)'}</span>
            </button>
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--emerald-glow)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>N-Back Task Complete</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Quantifying signal detection sensitivity (d')...</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Keyboard shortcut: Press <strong>[M]</strong> or <strong>[SPACEBAR]</strong> when current letter matches the one from 2 steps ago.
      </div>
    </div>
  );
}
