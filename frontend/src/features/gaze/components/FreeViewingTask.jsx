import React, { useState, useEffect, useRef } from 'react';
import { Eye, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { computeDescriptiveAttentionMetrics } from '../engine/fixationAnalysis';

export default function FreeViewingTask({
  quality,
  onTaskComplete,
  onCancel,
  activeGazePoint,
}) {
  const canvasRef = useRef(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const TOTAL_DURATION_SEC = 15;

  const rawGazeSeriesRef = useRef([]);
  const blinkCountRef = useRef(0);
  const animIdRef = useRef(null);

  // Generative Nature/Particle Stimulus Loop (100% royalty-free, legal, and smooth)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    // Natural stimulus: 3 focal visual attractors (swirling colorful fluid vortices)
    const attractors = [
      { x: width * 0.3, y: height * 0.4, vx: 1.2, vy: 0.8, color: '#38bdf8', r: 25 },
      { x: width * 0.7, y: height * 0.5, vx: -0.9, vy: 1.1, color: '#a855f7', r: 35 },
      { x: width * 0.5, y: height * 0.7, vx: 0.7, vy: -1.3, color: '#34d399', r: 20 },
    ];

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.fillStyle = 'rgba(7, 10, 20, 0.2)';
      ctx.fillRect(0, 0, width, height);

      attractors.forEach((att, idx) => {
        att.x += att.vx + Math.sin(t + idx) * 0.8;
        att.y += att.vy + Math.cos(t + idx) * 0.8;

        if (att.x < 50 || att.x > width - 50) att.vx *= -1;
        if (att.y < 50 || att.y > height - 50) att.vy *= -1;

        // Draw glowing particle cloud
        const gradient = ctx.createRadialGradient(att.x, att.y, 2, att.x, att.y, att.r * 2);
        gradient.addColorStop(0, att.color);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(att.x, att.y, att.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animIdRef.current = requestAnimationFrame(render);
    };

    animIdRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animIdRef.current);
  }, []);

  // Track gaze time-series
  useEffect(() => {
    if (activeGazePoint) {
      rawGazeSeriesRef.current.push({
        t: Date.now(),
        x: activeGazePoint.x,
        y: activeGazePoint.y,
        onScreen: activeGazePoint.onScreen ?? true,
      });
    }
  }, [activeGazePoint]);

  // Duration countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSec((prev) => {
        if (prev + 1 >= TOTAL_DURATION_SEC) {
          clearInterval(timer);
          finishTask();
          return TOTAL_DURATION_SEC;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const finishTask = () => {
    const metrics = computeDescriptiveAttentionMetrics(
      rawGazeSeriesRef.current,
      blinkCountRef.current || 4,
      TOTAL_DURATION_SEC,
      quality
    );
    onTaskComplete(metrics);
  };

  const progressPct = Math.round((elapsedSec / TOTAL_DURATION_SEC) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-pill badge-violet">Free-Viewing Stimulus</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Watch the visual motion naturally</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--cyan-glow)', fontWeight: 700 }}>
          {TOTAL_DURATION_SEC - elapsedSec}s Remaining
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, var(--cyan-primary), var(--violet-primary))',
            transition: 'width 1s linear',
          }}
        />
      </div>

      {/* Stimulus Canvas Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '460px',
          background: '#070a14',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* Non-Diagnostic Live Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '16px',
            background: 'rgba(5, 7, 15, 0.7)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem',
            color: 'var(--text-dim)',
            pointerEvents: 'none',
          }}
        >
          Research Use Only • No Video Saved
        </div>
      </div>
    </div>
  );
}
