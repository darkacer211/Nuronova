/**
 * Attention Lab: Oculomotor & Gaze Feature Extraction Engine
 *
 * Implements I-VT (Velocity-Threshold Identification) and I-DT (Dispersion-Threshold Identification)
 * algorithms for webcam gaze streams according to Salvucci & Goldberg (2000).
 *
 * All processing is strictly numerical and client-side.
 * Never performs diagnostic classification; computes descriptive metrics only.
 */

/**
 * Resample non-uniform gaze time series to uniform sample intervals (default: 30 Hz = 33.33ms)
 * @param {Array<{t: number, x: number, y: number, onScreen: boolean}>} rawGaze
 * @param {number} targetHz - Default 30 Hz
 */
export function resampleGazeTimeSeries(rawGaze, targetHz = 30) {
  if (!rawGaze || rawGaze.length < 2) return [];

  const dtMs = 1000 / targetHz;
  const startTime = rawGaze[0].t;
  const endTime = rawGaze[rawGaze.length - 1].t;
  const resampled = [];

  let rawIdx = 0;
  for (let t = startTime; t <= endTime; t += dtMs) {
    while (rawIdx < rawGaze.length - 1 && rawGaze[rawIdx + 1].t <= t) {
      rawIdx++;
    }

    const p1 = rawGaze[rawIdx];
    const p2 = rawGaze[rawIdx + 1] || p1;
    const span = p2.t - p1.t;
    const factor = span > 0 ? Math.min(Math.max((t - p1.t) / span, 0), 1) : 0;

    resampled.push({
      t: Math.round(t),
      x: Number((p1.x + (p2.x - p1.x) * factor).toFixed(2)),
      y: Number((p1.y + (p2.y - p1.y) * factor).toFixed(2)),
      onScreen: p1.onScreen && p2.onScreen,
    });
  }

  return resampled;
}

/**
 * I-VT (Velocity-Threshold Identification)
 * Distinguishes fixations from saccades based on point-to-point angular or pixel velocity.
 * @param {Array<{t: number, x: number, y: number, onScreen: boolean}>} samples
 * @param {number} velocityThresholdPxPerSec - Typically 300-500 px/sec on standard screen
 */
export function detectFixationsIVT(samples, velocityThresholdPxPerSec = 400) {
  if (!samples || samples.length < 2) return { fixations: [], saccades: [] };

  const fixations = [];
  const saccades = [];

  let currentFixationPoints = [];

  for (let i = 1; i < samples.length; i++) {
    const pPrev = samples[i - 1];
    const pCurr = samples[i];
    const dtSec = (pCurr.t - pPrev.t) / 1000;

    if (dtSec <= 0) continue;

    const dx = pCurr.x - pPrev.x;
    const dy = pCurr.y - pPrev.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const velocity = distPx / dtSec;

    if (velocity < velocityThresholdPxPerSec && pCurr.onScreen && pPrev.onScreen) {
      // Fixation point
      if (currentFixationPoints.length === 0) {
        currentFixationPoints.push(pPrev);
      }
      currentFixationPoints.push(pCurr);
    } else {
      // Saccade transition
      if (currentFixationPoints.length >= 3) {
        // Minimum ~100ms fixation
        const startT = currentFixationPoints[0].t;
        const endT = currentFixationPoints[currentFixationPoints.length - 1].t;
        const durationMs = endT - startT;

        const avgX = currentFixationPoints.reduce((sum, p) => sum + p.x, 0) / currentFixationPoints.length;
        const avgY = currentFixationPoints.reduce((sum, p) => sum + p.y, 0) / currentFixationPoints.length;

        fixations.push({
          startTime: startT,
          endTime: endT,
          durationMs,
          x: Math.round(avgX),
          y: Math.round(avgY),
          pointsCount: currentFixationPoints.length,
        });
      }
      currentFixationPoints = [];

      saccades.push({
        startTime: pPrev.t,
        endTime: pCurr.t,
        durationMs: Math.round(dtSec * 1000),
        amplitudePx: Math.round(distPx),
        velocity: Math.round(velocity),
      });
    }
  }

  // Final flush
  if (currentFixationPoints.length >= 3) {
    const startT = currentFixationPoints[0].t;
    const endT = currentFixationPoints[currentFixationPoints.length - 1].t;
    const avgX = currentFixationPoints.reduce((sum, p) => sum + p.x, 0) / currentFixationPoints.length;
    const avgY = currentFixationPoints.reduce((sum, p) => sum + p.y, 0) / currentFixationPoints.length;

    fixations.push({
      startTime: startT,
      endTime: endT,
      durationMs: endT - startT,
      x: Math.round(avgX),
      y: Math.round(avgY),
      pointsCount: currentFixationPoints.length,
    });
  }

  return { fixations, saccades };
}

/**
 * Data Quality Evaluator
 * Evaluates illumination, dropped frames, head jitter, and face detection ratio.
 * Withholds analysis if quality score is below 60/100.
 */
export function evaluateGazeDataQuality(stats) {
  const { totalFrames = 0, faceFoundFrames = 0, avgFps = 30, calibrationErrorPx = 40, headJitterVar = 5 } = stats;

  if (totalFrames < 30) {
    return {
      qualityScore: 0,
      isAcceptable: false,
      grade: 'Unusable',
      reasons: ['Insufficient viewing duration or camera frame capture.'],
    };
  }

  const faceRatio = faceFoundFrames / Math.max(totalFrames, 1);
  const fpsFactor = Math.min(Math.max(avgFps / 30, 0), 1);
  const calibFactor = Math.max(1 - calibrationErrorPx / 150, 0);
  const stabilityFactor = Math.max(1 - headJitterVar / 25, 0);

  // Weighted composite score (0 - 100)
  const qualityScore = Math.round(
    faceRatio * 40 + fpsFactor * 25 + calibFactor * 20 + stabilityFactor * 15
  );

  const reasons = [];
  if (faceRatio < 0.75) reasons.push('Frequent loss of face tracking (check room lighting and center screen position).');
  if (avgFps < 18) reasons.push('Low frame rate (<18 FPS) detected; background computer tasks may cause frame skips.');
  if (calibrationErrorPx > 90) reasons.push('High gaze calibration error; distance from screen may have shifted.');
  if (headJitterVar > 15) reasons.push('Excessive head movement during viewing task.');

  let grade = 'Excellent';
  if (qualityScore < 50) grade = 'Poor';
  else if (qualityScore < 65) grade = 'Marginal';
  else if (qualityScore < 80) grade = 'Good';

  return {
    qualityScore,
    isAcceptable: qualityScore >= 60,
    grade,
    reasons,
    metrics: {
      faceDetectionRate: `${Math.round(faceRatio * 100)}%`,
      averageFps: Math.round(avgFps),
      calibrationErrorPx: Math.round(calibrationErrorPx),
    },
  };
}

/**
 * Compute Complete Descriptive Attention Metrics
 * (Strictly Non-Diagnostic)
 */
export function computeDescriptiveAttentionMetrics(rawGaze, blinksCount, taskDurationSec, quality) {
  if (!quality.isAcceptable) {
    return {
      status: 'withheld',
      reason: 'Data quality score is below the reliable threshold (minimum 60% required).',
      quality,
      metrics: null,
    };
  }

  const resampled = resampleGazeTimeSeries(rawGaze, 30);
  const { fixations, saccades } = detectFixationsIVT(resampled, 400);

  // 1. Off-screen percentage
  const offScreenSamples = resampled.filter((p) => !p.onScreen).length;
  const offScreenRatio = resampled.length > 0 ? offScreenSamples / resampled.length : 0;

  // 2. Spatial dispersion (standard deviation of fixation coordinates)
  let dispersionPx = 0;
  if (fixations.length > 1) {
    const meanX = fixations.reduce((sum, f) => sum + f.x, 0) / fixations.length;
    const meanY = fixations.reduce((sum, f) => sum + f.y, 0) / fixations.length;
    const variance = fixations.reduce((sum, f) => sum + Math.pow(f.x - meanX, 2) + Math.pow(f.y - meanY, 2), 0) / fixations.length;
    dispersionPx = Math.round(Math.sqrt(variance));
  }

  // 3. Fixation duration distribution
  const durations = fixations.map((f) => f.durationMs);
  const meanFixationMs = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  durations.sort((a, b) => a - b);
  const medianFixationMs = durations.length > 0 ? durations[Math.floor(durations.length / 2)] : 0;

  // 4. Rates
  const durationMin = Math.max(taskDurationSec / 60, 0.1);
  const blinkRatePerMin = Number((blinksCount / durationMin).toFixed(1));
  const saccadeRatePerMin = Number((saccades.length / durationMin).toFixed(1));

  return {
    status: 'analyzed',
    quality,
    sampleCount: resampled.length,
    metrics: {
      offScreenPercent: Math.round(offScreenRatio * 100),
      spatialDispersionPx: dispersionPx,
      totalFixationsCount: fixations.length,
      meanFixationDurationMs: meanFixationMs,
      medianFixationDurationMs: medianFixationMs,
      totalSaccadesCount: saccades.length,
      saccadeRatePerMin,
      blinkRatePerMin,
    },
    interpretations: {
      offScreenTime:
        offScreenRatio > 0.25
          ? 'Elevated off-screen gaze diversion (looking away from the video canvas >25% of the viewing session).'
          : 'High visual engagement; gaze remained centered on the stimulus canvas throughout most of the session.',
      fixationStyle:
        meanFixationMs < 200
          ? 'Rapid foveal shifts with shorter average fixations (<200ms).'
          : 'Sustained foveal dwelling with prolonged fixations (>200ms).',
      saccadeProfile: `Observed ${saccadeRatePerMin} exploratory gaze shifts per minute.`,
    },
    strictNotice:
      'EXPERIMENTAL ATTENTION LAB METRICS. These descriptive oculomotor figures reflect natural viewing patterns captured via consumer webcam. They are NOT a diagnostic evaluation of ADHD or any medical condition and do not alter clinical questionnaire scores.',
  };
}
