import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, RotateCcw, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function TaskPVT({ onComplete }) {
  // state: 'intro', 'waiting' (red), 'early' (too soon), 'active' (green), 'result' (single round), 'finished' (5 rounds done)
  const [gameState, setGameState] = useState('intro');
  const [currentRound, setCurrentRound] = useState(1);
  const [roundTime, setRoundTime] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);

  const TOTAL_ROUNDS = 5;
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const roundHistoryRef = useRef([]);

  // Start waiting for green
  const startWaiting = useCallback(() => {
    setGameState('waiting');
    setRoundTime(0);

    // HumanBenchmark random delay between 2000ms and 5000ms
    const randomDelay = Math.floor(2000 + Math.random() * 3000);

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setGameState('active');
    }, randomDelay);
  }, []);

  // Handle click / screen press
  const handleClick = useCallback(() => {
    if (gameState === 'intro') {
      startWaiting();
    } else if (gameState === 'waiting') {
      // Clicked too early
      clearTimeout(timerRef.current);
      setGameState('early');
    } else if (gameState === 'early') {
      // Retry round
      startWaiting();
    } else if (gameState === 'active') {
      // Valid reaction!
      const rt = Math.round(performance.now() - startTimeRef.current);
      setRoundTime(rt);
      const newHistory = [...roundHistoryRef.current, rt];
      roundHistoryRef.current = newHistory;
      setRoundHistory(newHistory);

      if (newHistory.length >= TOTAL_ROUNDS) {
        setGameState('finished');
        const meanRt = Math.round(newHistory.reduce((a, b) => a + b, 0) / newHistory.length);
        const lapses = newHistory.filter((t) => t > 500).length;
        const invRt = Number((1000.0 / Math.max(meanRt, 100)).toFixed(2));

        setTimeout(() => {
          onComplete({
            mean_rt: meanRt,
            lapses,
            false_starts: 0,
            inv_rt: invRt,
            trials_count: TOTAL_ROUNDS,
            round_history: newHistory,
            best_rt: Math.min(...newHistory),
          });
        }, 1500);
      } else {
        setGameState('result');
      }
    } else if (gameState === 'result') {
      // Advance to next round
      setCurrentRound((prev) => prev + 1);
      startWaiting();
    }
  }, [gameState, startWaiting, onComplete]);

  // Teardown timers ONLY on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Keyboard spacebar listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  // Background and style configurations matching HumanBenchmark
  let bgColor = '#1e293b';
  let borderColor = 'var(--border-subtle)';
  let headline = 'Reaction Time Test';
  let subtext = 'When the red box turns green, click as quickly as you can.';

  if (gameState === 'waiting') {
    bgColor = '#ce2635'; // Deep HumanBenchmark Red
    borderColor = '#ff4d5a';
    headline = 'Wait for green...';
    subtext = 'Do not click yet!';
  } else if (gameState === 'early') {
    bgColor = '#991b1b'; // Darker red warning
    borderColor = '#f87171';
    headline = 'Too soon!';
    subtext = 'Click anywhere or press Spacebar to try again.';
  } else if (gameState === 'active') {
    bgColor = '#22c55e'; // Bright HumanBenchmark Green
    borderColor = '#4ade80';
    headline = 'CLICK!';
    subtext = 'Click now!';
  } else if (gameState === 'result') {
    bgColor = '#0f172a';
    borderColor = 'var(--cyan-primary)';
    headline = `${roundTime} ms`;
    subtext = `Round ${currentRound} of ${TOTAL_ROUNDS}. Click anywhere to continue.`;
  } else if (gameState === 'finished') {
    const avg = Math.round(roundHistory.reduce((a, b) => a + b, 0) / roundHistory.length);
    bgColor = '#0f172a';
    borderColor = 'var(--emerald-primary)';
    headline = `Average: ${avg} ms`;
    subtext = `Best: ${Math.min(...roundHistory)} ms. Finalizing reaction kinetics...`;
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-cyan" style={{ marginRight: '8px' }}>Task 1 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Visual Reaction Time</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Round {Math.min(currentRound, TOTAL_ROUNDS)} of {TOTAL_ROUNDS}
        </div>
      </div>

      {/* HumanBenchmark Interactive Arena */}
      <div
        className="test-arena"
        onClick={handleClick}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          minHeight: '440px',
          cursor: 'pointer',
          transition: 'background-color 0.05s ease',
          boxShadow: gameState === 'active' ? '0 0 50px rgba(34, 197, 94, 0.5)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '580px', pointerEvents: 'none' }}>
          {gameState === 'intro' && (
            <div style={{ width: '64px', height: '64px', margin: '0 auto 20px auto', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={36} color="#38bdf8" />
            </div>
          )}

          {gameState === 'early' && (
            <div style={{ width: '64px', height: '64px', margin: '0 auto 20px auto', borderRadius: '50%', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={36} color="#ffffff" />
            </div>
          )}

          {gameState === 'finished' && (
            <div style={{ width: '64px', height: '64px', margin: '0 auto 20px auto', borderRadius: '50%', background: 'var(--emerald-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} color="var(--emerald-glow)" />
            </div>
          )}

          <h3
            className="mono-num"
            style={{
              fontSize: gameState === 'result' || gameState === 'finished' ? '4.2rem' : '2.8rem',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '14px',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {headline}
          </h3>

          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1.05rem',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            {subtext}
          </p>

          {gameState === 'intro' && (
            <div style={{ marginTop: '24px' }}>
              <span className="btn-primary" style={{ pointerEvents: 'none' }}>
                Click Anywhere or Press Spacebar to Start
              </span>
            </div>
          )}

          {/* Show ongoing trial score pills */}
          {roundHistory.length > 0 && gameState !== 'finished' && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '28px' }}>
              {roundHistory.map((score, idx) => (
                <div
                  key={idx}
                  className="mono-num"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  R{idx + 1}: {score}ms
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <span>Standard HumanBenchmark visual latency paradigm</span>
        <span>Average human reaction time: ~200ms – 250ms</span>
      </div>
    </div>
  );
}
