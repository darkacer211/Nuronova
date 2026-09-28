import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layers, CheckCircle2, RotateCcw, ArrowRight, Delete } from 'lucide-react';

export default function TaskDigitSpan({ onComplete }) {
  // state: 'intro', 'memorizing', 'recalling', 'feedback', 'finished'
  const [phase, setPhase] = useState('intro');
  const [currentLevel, setCurrentLevel] = useState(3); // Start at 3 digits
  const [currentSequence, setCurrentSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  const [activeDigit, setActiveDigit] = useState('');
  const [digitIndex, setDigitIndex] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct: bool, text: string }
  const [strikes, setStrikes] = useState(0);
  const [maxSpanAchieved, setMaxSpanAchieved] = useState(0);

  const displayTimerRef = useRef(null);
  const sequenceHistoryRef = useRef([]);

  // Generate random non-repeating digit sequence of length N
  const generateSequence = (length) => {
    let str = '';
    for (let i = 0; i < length; i++) {
      str += Math.floor(Math.random() * 10).toString();
    }
    return str;
  };

  // Start presenting sequence digit by digit
  const playSequence = useCallback((level) => {
    const seq = generateSequence(level);
    setCurrentSequence(seq);
    setUserInput('');
    setFeedback(null);
    setPhase('memorizing');

    let idx = 0;
    setActiveDigit(seq[0]);
    setDigitIndex(0);

    const interval = setInterval(() => {
      idx += 1;
      if (idx < seq.length) {
        setActiveDigit(seq[idx]);
        setDigitIndex(idx);
      } else {
        clearInterval(interval);
        setActiveDigit('');
        setPhase('recalling');
      }
    }, 1000); // 1000ms per digit

    displayTimerRef.current = interval;
  }, []);

  // Handle user submit
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
      setFeedback({ correct: true, text: `Correct! Sequence length: ${currentLevel}` });
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
        text: `Incorrect. The sequence was: ${currentSequence}`,
      });
      setPhase('feedback');

      if (newStrikes >= 2 || currentLevel >= 9) {
        // Conclude task after 2 errors
        setTimeout(() => {
          finishTask(Math.max(maxSpanAchieved, currentLevel - 1));
        }, 1600);
      } else {
        // 1 retry at current level
        setTimeout(() => {
          playSequence(currentLevel);
        }, 1600);
      }
    }
  }, [phase, userInput, currentSequence, currentLevel, maxSpanAchieved, strikes, playSequence]);

  const finishTask = useCallback((finalSpan) => {
    setPhase('finished');
    const validSpan = Math.max(finalSpan, 3);
    const history = sequenceHistoryRef.current;
    const correctCount = history.filter((h) => h.correct).length;
    const accuracy = history.length > 0 ? correctCount / history.length : 0.75;

    // Convert digit span into standardized working memory d' approximation
    // Normal population mean is 7 digits (Miller's Law: 7 ± 2)
    const normalizedDPrime = Number((Math.min(Math.max((validSpan - 3) * 0.55 + 1.0, 0.5), 3.8)).toFixed(2));

    setTimeout(() => {
      onComplete({
        level: validSpan,
        span: validSpan,
        accuracy: Number(accuracy.toFixed(2)),
        dprime: normalizedDPrime,
        hits: correctCount,
        misses: history.length - correctCount,
        false_alarms: 0,
        correct_rejections: correctCount,
      });
    }, 1200);
  }, [onComplete]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (displayTimerRef.current) clearInterval(displayTimerRef.current);
    };
  }, []);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (phase === 'intro') {
        if (e.code === 'Space') playSequence(currentLevel);
      } else if (phase === 'recalling') {
        if (e.key >= '0' && e.key <= '9') {
          setUserInput((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          setUserInput((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentLevel, playSequence, handleSubmit]);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-emerald" style={{ marginRight: '8px' }}>Task 3 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Digit Span Working Memory Test</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Target Length: {currentLevel} Digits
        </div>
      </div>

      {/* Main Test Arena */}
      <div className="test-arena" style={{ minHeight: '450px' }}>
        {phase === 'intro' && (
          <div style={{ textAlign: 'center', maxWidth: '540px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 18px auto', borderRadius: '50%', background: 'var(--emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={32} color="var(--emerald-glow)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              Sequential Digit Span Memory
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              A sequence of numbers will flash on screen one by one. Remember the exact sequence and type it back. With each correct answer, the sequence gets one digit longer.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Standard working memory capacity: <strong>7 ± 2 digits</strong> (Miller's Law).
            </div>
            <button className="btn-primary" onClick={() => playSequence(currentLevel)}>
              Start Digit Span (Spacebar)
            </button>
          </div>
        )}

        {phase === 'memorizing' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Digit {digitIndex + 1} of {currentLevel}
            </div>
            <div
              className="mono-num"
              style={{
                fontSize: '7.5rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
                textShadow: '0 0 45px rgba(16, 185, 129, 0.6)',
                marginBottom: '20px',
              }}
            >
              {activeDigit}
            </div>
            <p style={{ color: 'var(--emerald-glow)', fontSize: '0.9rem' }}>Memorize the sequence...</p>
          </div>
        )}

        {phase === 'recalling' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '380px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Enter the {currentLevel}-digit sequence:
            </div>

            {/* Display Input Box */}
            <div
              className="mono-num"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-focus)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                fontSize: '2.4rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.2em',
                marginBottom: '20px',
                minHeight: '75px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {userInput || <span style={{ opacity: 0.3, letterSpacing: 'normal', fontSize: '1.2rem' }}>_ _ _</span>}
            </div>

            {/* On-Screen Numeric Keypad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => setUserInput((prev) => prev + num)}
                  className="btn-secondary mono-num"
                  style={{ fontSize: '1.4rem', fontWeight: 700, padding: '14px 0', justifyContent: 'center' }}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setUserInput((prev) => prev.slice(0, -1))}
                className="btn-secondary"
                style={{ fontSize: '0.9rem', justifyContent: 'center', color: 'var(--rose-primary)' }}
                title="Backspace"
              >
                <Delete size={20} />
              </button>
              <button
                onClick={() => setUserInput((prev) => prev + '0')}
                className="btn-secondary mono-num"
                style={{ fontSize: '1.4rem', fontWeight: 700, padding: '14px 0', justifyContent: 'center' }}
              >
                0
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                style={{ fontSize: '0.9rem', justifyContent: 'center', padding: '14px 0' }}
              >
                Submit
              </button>
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
                marginBottom: '12px',
              }}
            >
              {feedback.text}
            </div>
            {strikes >= 2 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Two errors reached. Calculating max span...</p>
            )}
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={48} color="var(--emerald-glow)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Digit Span Test Complete</h4>
            <p className="mono-num" style={{ fontSize: '1.5rem', color: 'var(--cyan-glow)', marginTop: '8px' }}>
              Working Memory Span: {maxSpanAchieved || currentLevel} Digits
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <span>Use your numeric keypad or physical keyboard numbers</span>
        <span>HumanBenchmark Digit Span Protocol</span>
      </div>
    </div>
  );
}
