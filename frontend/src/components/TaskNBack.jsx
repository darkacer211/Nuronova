import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, CheckCircle2, Zap } from 'lucide-react';

const LETTERS = ['A', 'B', 'C', 'H', 'K', 'M', 'R', 'T', 'X'];

export default function TaskNBack({ onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, presenting, interstimulus, finished
  const [trialIndex, setTrialIndex] = useState(0);
  const [currentLetter, setCurrentLetter] = useState('');
  const [nLevel, setNLevel] = useState(2); // 2-Back
  const [feedbackFlash, setFeedbackFlash] = useState(null); // 'hit', 'fa', null

  const TOTAL_TRIALS = 14;
  const historyRef = useRef([]);
  const userResponsesRef = useRef([]); // { trial, pressedMatch, isActualMatch, hit, fa, miss, cr }
  const hasRespondedThisTrialRef = useRef(false);
  const timerRef = useRef(null);

  // Generate sequence with ~35% match probability
  const generateNextLetter = useCallback((hist, n) => {
    if (hist.length >= n && Math.random() < 0.38) {
      return hist[hist.length - n]; // match target
    }
    // Random non-match (or random letter)
    return LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }, []);

  const runTrial = useCallback(
    (index) => {
      hasRespondedThisTrialRef.current = false;
      setFeedbackFlash(null);

      const letter = generateNextLetter(historyRef.current, nLevel);
      historyRef.current.push(letter);
      setCurrentLetter(letter);
      setPhase('presenting');

      // Stimulus presentation duration: 900ms
      timerRef.current = setTimeout(() => {
        // Inter-stimulus blank interval: 1100ms
        setPhase('interstimulus');

        timerRef.current = setTimeout(() => {
          // Check if trial was missed
          const isActualMatch =
            historyRef.current.length > nLevel &&
            historyRef.current[historyRef.current.length - 1] ===
              historyRef.current[historyRef.current.length - 1 - nLevel];

          if (isActualMatch && !hasRespondedThisTrialRef.current) {
            userResponsesRef.current.push({
              trial: index,
              pressedMatch: false,
              isActualMatch: true,
              result: 'miss',
            });
          } else if (!isActualMatch && !hasRespondedThisTrialRef.current) {
            userResponsesRef.current.push({
              trial: index,
              pressedMatch: false,
              isActualMatch: false,
              result: 'cr', // Correct Rejection
            });
          }

          if (index + 1 < TOTAL_TRIALS) {
            setTrialIndex((prev) => prev + 1);
            runTrial(index + 1);
          } else {
            finishTask();
          }
        }, 1100);
      }, 900);
    },
    [generateNextLetter, nLevel]
  );

  const handleMatchPress = useCallback(() => {
    if (hasRespondedThisTrialRef.current || historyRef.current.length <= nLevel) return;
    hasRespondedThisTrialRef.current = true;

    const hist = historyRef.current;
    const isActualMatch = hist[hist.length - 1] === hist[hist.length - 1 - nLevel];

    if (isActualMatch) {
      userResponsesRef.current.push({
        trial: trialIndex,
        pressedMatch: true,
        isActualMatch: true,
        result: 'hit',
      });
      setFeedbackFlash('hit');
    } else {
      userResponsesRef.current.push({
        trial: trialIndex,
        pressedMatch: true,
        isActualMatch: false,
        result: 'fa', // False Alarm
      });
      setFeedbackFlash('fa');
    }
  }, [trialIndex, nLevel]);

  // Compute Signal Detection Theory d-prime (d') sensitivity
  const finishTask = useCallback(() => {
    setPhase('finished');
    const responses = userResponsesRef.current;

    const hits = responses.filter((r) => r.result === 'hit').length;
    const misses = responses.filter((r) => r.result === 'miss').length;
    const fas = responses.filter((r) => r.result === 'fa').length;
    const crs = responses.filter((r) => r.result === 'cr').length;

    const targets = Math.max(hits + misses, 1);
    const nonTargets = Math.max(fas + crs, 1);

    // Standard log-linear correction for d' extremes
    const hitRate = (hits + 0.5) / (targets + 1);
    const faRate = (fas + 0.5) / (nonTargets + 1);

    // Rational approximation for inverse normal CDF (probit)
    const probit = (p) => {
      // Simple rational Chebyshev approximation
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

    const dprime = Math.min(Math.max(probit(hitRate) - probit(faRate), 0.2), 3.8);
    const totalResponses = hits + misses + fas + crs;
    const accuracy = totalResponses > 0 ? (hits + crs) / totalResponses : 0.82;

    onComplete({
      level: nLevel,
      accuracy: Number(accuracy.toFixed(2)),
      dprime: Number(dprime.toFixed(2)),
      hits,
      misses,
      false_alarms: fas,
      correct_rejections: crs,
    });
  }, [nLevel, onComplete]);

  // Keyboard handler for 'M' key or Spacebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'instructions') {
        if (e.code === 'Space') runTrial(0);
      } else if (phase === 'presenting' || phase === 'interstimulus') {
        if (e.code === 'KeyM' || e.code === 'Space') {
          e.preventDefault();
          handleMatchPress();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [phase, handleMatchPress, runTrial]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-emerald" style={{ marginRight: '8px' }}>Task 3 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>2-Back Working Memory Task</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sequence {trialIndex + 1} / {TOTAL_TRIALS}
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
              Detect 2-Back Letter Matches
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Letters will flash sequentially on screen. Press <strong style={{ color: '#fff' }}>KEY [M]</strong> or <strong style={{ color: '#fff' }}>SPACEBAR</strong> whenever the current letter matches the one from <strong style={{ color: 'var(--emerald-glow)' }}>2 steps ago</strong>.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Example sequence: <strong>B</strong> → X → <strong style={{ color: 'var(--emerald-glow)' }}>B (MATCH!)</strong> → M → K → ...
            </div>
            <button className="btn-primary" onClick={() => runTrial(0)}>
              Start 2-Back Protocol (Spacebar)
            </button>
          </div>
        )}

        {phase === 'presenting' && (
          <div style={{ textAlign: 'center' }}>
            <div
              className="mono-num"
              style={{
                fontSize: '6.5rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                textShadow: '0 0 40px rgba(16, 185, 129, 0.5)',
                marginBottom: '28px',
              }}
            >
              {currentLetter}
            </div>

            <button
              onClick={handleMatchPress}
              className="btn-primary"
              style={{
                background: feedbackFlash === 'hit' ? 'var(--emerald-primary)' : 'linear-gradient(135deg, var(--emerald-primary), #059669)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                padding: '14px 32px',
                fontSize: '1.1rem',
              }}
            >
              <span>MATCH (Key M)</span>
            </button>
          </div>
        )}

        {phase === 'interstimulus' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155', margin: '0 auto 28px auto' }} />
            <button
              onClick={handleMatchPress}
              className="btn-secondary"
              style={{ padding: '14px 32px', fontSize: '1.1rem' }}
            >
              <span>MATCH (Key M)</span>
            </button>
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--emerald-glow)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>N-Back Task Complete</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Computing working memory sensitivity (d')...</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Working memory updating index reflects real-time prefrontal cortex buffer capacity.
      </div>
    </div>
  );
}
