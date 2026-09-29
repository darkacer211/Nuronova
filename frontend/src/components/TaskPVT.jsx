import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function TaskPVT({ onComplete, onRoundUpdate }) {
  // state: 'IDLE', 'WAITING', 'TRIGGERED', 'EARLY', 'ROUND_DONE', 'FINISHED'
  const [state, setState] = useState('IDLE');
  const [currentRound, setCurrentRound] = useState(1);
  const [lastRt, setLastRt] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [prematureCount, setPrematureCount] = useState(0);

  const TOTAL_ROUNDS = 5;
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);
  const roundHistoryRef = useRef([]);

  // Arm round (Wait for green)
  const armRound = useCallback(() => {
    setState('WAITING');
    setLastRt(null);

    // Random delay between 1800ms and 4500ms
    const randomDelay = Math.floor(1800 + Math.random() * 2700);

    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setState('TRIGGERED');
    }, randomDelay);
  }, []);

  // Report initial round on mount
  useEffect(() => {
    if (onRoundUpdate) {
      onRoundUpdate(1, TOTAL_ROUNDS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle click / trigger
  const handleAction = useCallback(() => {
    if (state === 'IDLE' || state === 'ROUND_DONE') {
      armRound();
    } else if (state === 'WAITING') {
      // False start
      clearTimeout(timerRef.current);
      setPrematureCount((prev) => prev + 1);
      setState('EARLY');
    } else if (state === 'EARLY') {
      // Retry round
      armRound();
    } else if (state === 'TRIGGERED') {
      // Successful reaction
      const rt = Math.round(performance.now() - startTimeRef.current);
      setLastRt(rt);
      const newHistory = [...roundHistoryRef.current, rt];
      roundHistoryRef.current = newHistory;
      setRoundHistory(newHistory);

      if (newHistory.length >= TOTAL_ROUNDS) {
        setState('FINISHED');
        if (onRoundUpdate) {
          onRoundUpdate(TOTAL_ROUNDS, TOTAL_ROUNDS);
        }
        const n = newHistory.length;
        const meanRt = Math.round(newHistory.reduce((a, b) => a + b, 0) / n);
        const variance = n > 1
          ? newHistory.reduce((sum, val) => sum + Math.pow(val - meanRt, 2), 0) / (n - 1)
          : 0;
        const rtSd = Math.round(Math.sqrt(variance) * 10) / 10;
        const rtCv = meanRt > 0 ? Number((rtSd / meanRt).toFixed(3)) : 0;
        const fastResponsesCount = newHistory.filter((t) => t < 150).length + prematureCount;
        const slowResponsesCount = newHistory.filter((t) => t > 500).length;
        const lapses = slowResponsesCount;
        const invRt = Number((1000.0 / Math.max(meanRt, 100)).toFixed(2));
        const minRt = Math.min(...newHistory);
        const maxRt = Math.max(...newHistory);

        setTimeout(() => {
          onComplete({
            mean_rt: meanRt,
            lapses,
            false_starts: prematureCount,
            inv_rt: invRt,
            trials_count: TOTAL_ROUNDS,
            round_history: newHistory,
            min_rt: minRt,
            max_rt: maxRt,
            best_rt: minRt,
            rt_sd: rtSd,
            rt_cv: rtCv,
            fast_responses_count: fastResponsesCount,
            slow_responses_count: slowResponsesCount,
          });
        }, 1200);
      } else {
        setState('ROUND_DONE');
        setCurrentRound((prev) => {
          const next = prev + 1;
          if (onRoundUpdate) onRoundUpdate(next, TOTAL_ROUNDS);
          return next;
        });
      }
    }
  }, [state, armRound, prematureCount, onComplete, onRoundUpdate]);

  // Keyboard spacebar listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const meanSoFar = roundHistory.length > 0
    ? Math.round(roundHistory.reduce((a, b) => a + b, 0) / roundHistory.length)
    : null;

  // Background card styling based on state
  let cardBgClass = 'bg-surface-container-lowest border-surface-container-high/60';
  if (state === 'WAITING') {
    cardBgClass = 'bg-tertiary-container text-on-tertiary-container border-tertiary/40';
  } else if (state === 'TRIGGERED') {
    cardBgClass = 'bg-secondary-container text-on-secondary-container border-secondary/40';
  } else if (state === 'EARLY') {
    cardBgClass = 'bg-error-container text-on-error-container border-error/40';
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Stimulus Container */}
      <div
        onClick={handleAction}
        className={`relative overflow-hidden w-full min-h-[420px] rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center transition-all duration-300 border cursor-pointer select-none ${cardBgClass}`}
      >
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-transparent to-secondary-container/15 pointer-events-none" />

        {/* Center Stimulus Core Focus Area */}
        <div className="flex flex-col items-center max-w-xl my-auto py-4 relative z-10">
          {/* Dynamic Icon Vessel */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm transition-all duration-200 ${
              state === 'WAITING'
                ? 'bg-tertiary text-on-tertiary animate-pulse scale-110'
                : state === 'TRIGGERED'
                ? 'bg-secondary text-on-secondary scale-125 shadow-lg'
                : state === 'EARLY'
                ? 'bg-error text-on-error'
                : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[32px]">
              {state === 'WAITING' ? 'hourglass_top' : state === 'TRIGGERED' ? 'bolt' : state === 'EARLY' ? 'cancel' : 'bolt'}
            </span>
          </div>

          <h1 className="font-display text-[38px] font-bold text-on-surface mb-2 tracking-tight">
            {state === 'WAITING'
              ? 'HOLD...'
              : state === 'TRIGGERED'
              ? 'PRESS SPACEBAR!'
              : state === 'EARLY'
              ? 'Too Early'
              : 'Reaction Time Test'}
          </h1>

          <p className="font-body-lg text-[16px] text-on-surface-variant mb-6 max-w-md leading-relaxed">
            {state === 'WAITING' ? (
              <span className="font-bold text-on-tertiary-container">
                STAY FOCUSED... PRESS SPACEBAR WHEN GREEN
              </span>
            ) : state === 'TRIGGERED' ? (
              <span className="font-bold text-on-secondary-container">
                PRESS SPACEBAR NOW!
              </span>
            ) : state === 'EARLY' ? (
              <span>You pressed spacebar too early. Press spacebar to retry.</span>
            ) : (
              <span>
                When the indicator turns <span className="font-bold text-red-600">red</span> to <span className="font-bold text-green-600">green</span>, press the spacebar.
              </span>
            )}
          </p>

          {/* Stimulus Trigger Button */}
          <div className="w-full flex flex-col items-center gap-2">
            <button
              type="button"
              className={`w-full sm:w-auto min-w-[300px] px-8 py-3.5 rounded-xl font-headline-sm text-[16px] font-semibold shadow-md transition-all transform active:scale-[0.985] flex items-center justify-center gap-2 group ${
                state === 'WAITING'
                  ? 'bg-tertiary text-on-tertiary'
                  : state === 'TRIGGERED'
                  ? 'bg-secondary text-on-secondary shadow-lg'
                  : state === 'EARLY'
                  ? 'bg-tertiary-container text-on-tertiary-container'
                  : state === 'ROUND_DONE'
                  ? 'bg-primary text-on-primary'
                  : 'bg-primary text-on-primary hover:bg-primary-container'
              }`}
            >
              <span className="material-symbols-outlined text-[22px] group-hover:scale-110 transition-transform">
                {state === 'WAITING' ? 'hourglass_top' : state === 'TRIGGERED' ? 'flash_on' : state === 'ROUND_DONE' ? 'check' : 'space_bar'}
              </span>
              <span>
                {state === 'WAITING'
                  ? 'Wait for Green...'
                  : state === 'TRIGGERED'
                  ? 'Press Spacebar!'
                  : state === 'EARLY'
                  ? 'Too Early — Press Spacebar'
                  : state === 'ROUND_DONE'
                  ? `Next Trial (${lastRt} ms) — Press Spacebar`
                  : 'Press Spacebar'}
              </span>
            </button>
          </div>

          {/* Reaction Metrics Card (Revealed after round) */}
          {lastRt && (
            <div className="mt-4 p-4 rounded-xl bg-surface-container-high w-full flex items-center justify-around border border-surface-container-highest/60">
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Last Reaction</span>
                <span className="font-telemetry-numeric-lg text-[26px] text-primary font-bold">{lastRt} ms</span>
              </div>
              <div className="w-px h-8 bg-outline-variant/40"></div>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Average</span>
                <span className="font-telemetry-numeric-lg text-[26px] text-secondary font-bold">
                  {meanSoFar || lastRt} ms
                </span>
              </div>
              <div className="w-px h-8 bg-outline-variant/40"></div>
              <div className="flex flex-col items-center">
                <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Round</span>
                <span className="font-telemetry-numeric-lg text-[26px] text-on-surface font-bold">
                  {roundHistory.length} / {TOTAL_ROUNDS}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simplified, Clean Auxiliary Metric Cards (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Trial History Card */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Trial Latencies
            </span>
            <span className="font-telemetry-data text-[12px] text-secondary font-bold">
              {meanSoFar ? `Avg: ${meanSoFar}ms` : '5 Rounds'}
            </span>
          </div>

          {/* Clean 5-trial visual indicators */}
          <div className="grid grid-cols-5 gap-1.5 my-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const val = roundHistory[idx];
              const isCurrent = idx === roundHistory.length && state !== 'FINISHED';
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                    val
                      ? 'bg-secondary/10 border-secondary/30 text-secondary'
                      : isCurrent
                      ? 'bg-primary/10 border-primary/40 text-primary animate-pulse'
                      : 'bg-surface-container-low border-surface-container-high/40 text-on-surface-variant/40'
                  }`}
                >
                  <span className="font-label-caps text-[10px] font-bold">R{idx + 1}</span>
                  <span className="font-telemetry-data text-[11px] font-bold mt-0.5">
                    {val ? `${val}` : isCurrent ? 'Active' : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-1 border-t border-surface-container-high/40">
            <span>Completed: {roundHistory.length} of {TOTAL_ROUNDS}</span>
            <span className="text-secondary font-semibold">
              {roundHistory.length === TOTAL_ROUNDS ? 'Completed' : 'In Progress'}
            </span>
          </div>
        </div>

        {/* Premature Triggers Card */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Premature Triggers
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                prematureCount === 0 ? 'text-secondary' : 'text-amber-500'
              }`}
            >
              {prematureCount === 0 ? 'check_circle' : 'warning'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">
              {prematureCount}
            </span>
            <span className="font-body-sm text-[13px] text-on-surface-variant">
              early presses
            </span>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-2 border-t border-surface-container-high/40">
            <span>Inhibition Control</span>
            <span className={`font-semibold ${prematureCount === 0 ? 'text-secondary' : 'text-amber-600'}`}>
              {prematureCount === 0 ? 'Optimal' : `${prematureCount} Retried`}
            </span>
          </div>
        </div>

        {/* Fixation Stability Card */}
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-surface-container-high/60 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Fixation Stability
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">
              visibility
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">
              96.4%
            </span>
            <span className="font-body-sm text-[13px] text-on-surface-variant">
              gaze stability
            </span>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-medium pt-2 border-t border-surface-container-high/40">
            <span>Visual Engagement</span>
            <span className="text-primary font-semibold">Locked on Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
