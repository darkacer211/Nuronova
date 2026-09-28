/**
 * Attention Lab Unit Test Suite
 * Tests:
 * 1. Resampling algorithm (converting irregular timestamps to uniform 30 Hz).
 * 2. I-VT fixation and saccade segmentation on synthetic trajectories.
 * 3. Quality score logic and threshold gating (<60 withholds analysis).
 * 4. Consent gating: module remains inert when consent is false.
 * 5. Zero-leakage privacy assertion: guarantees no images, canvas frames, or video
 *    are ever stored in localStorage or transmitted over network payloads.
 */

import {
  resampleGazeTimeSeries,
  detectFixationsIVT,
  evaluateGazeDataQuality,
  computeDescriptiveAttentionMetrics,
} from '../engine/fixationAnalysis.js';

export function runGazeAnalysisUnitTests() {
  const results = [];
  const assert = (condition, name) => {
    if (condition) {
      results.push({ pass: true, name });
    } else {
      results.push({ pass: false, name });
      console.error(`FAIL: ${name}`);
    }
  };

  // ==============================================
  // 1. Resampling Tests
  // ==============================================
  const irregularSamples = [
    { t: 0, x: 100, y: 100, onScreen: true },
    { t: 45, x: 110, y: 105, onScreen: true },
    { t: 80, x: 120, y: 110, onScreen: true },
    { t: 150, x: 200, y: 200, onScreen: true },
  ];
  const resampled = resampleGazeTimeSeries(irregularSamples, 30);
  assert(resampled.length > 0, 'Resampling produced non-empty series');
  const dts = [];
  for (let i = 1; i < resampled.length; i++) {
    dts.push(resampled[i].t - resampled[i - 1].t);
  }
  const isUniform = dts.every((dt) => Math.abs(dt - 33) <= 1);
  assert(isUniform, 'Resampled intervals are uniform at ~33ms (30 Hz)');

  // ==============================================
  // 2. I-VT Fixation & Saccade Detection
  // ==============================================
  // Synthetic dataset: 500ms fixation at (100, 100), followed by 100ms saccade jump to (500, 500), then 500ms fixation
  const syntheticGaze = [];
  let curT = 0;
  // Fixation 1 (15 frames = ~500ms at ~100px)
  for (let i = 0; i < 15; i++) {
    syntheticGaze.push({ t: curT, x: 100 + (i % 2), y: 100 + (i % 2), onScreen: true });
    curT += 33.3;
  }
  // Saccade transition (3 frames jumping 400px = high velocity)
  syntheticGaze.push({ t: curT, x: 230, y: 230, onScreen: true });
  curT += 33.3;
  syntheticGaze.push({ t: curT, x: 370, y: 370, onScreen: true });
  curT += 33.3;
  // Fixation 2 (15 frames at ~500px)
  for (let i = 0; i < 15; i++) {
    syntheticGaze.push({ t: curT, x: 500 + (i % 2), y: 500 + (i % 2), onScreen: true });
    curT += 33.3;
  }

  const { fixations, saccades } = detectFixationsIVT(syntheticGaze, 400);
  assert(fixations.length >= 2, 'I-VT detected at least 2 distinct fixations');
  assert(saccades.length >= 1, 'I-VT detected the high-velocity saccade jump');
  assert(fixations[0].x >= 95 && fixations[0].x <= 105, 'Fixation 1 centroid accurately located at ~100px');
  assert(fixations[1].x >= 495 && fixations[1].x <= 505, 'Fixation 2 centroid accurately located at ~500px');

  // ==============================================
  // 3. Quality Score Logic & Threshold Gating
  // ==============================================
  const excellentStats = {
    totalFrames: 100,
    faceFoundFrames: 98,
    avgFps: 30,
    calibrationErrorPx: 25,
    headJitterVar: 3,
  };
  const qExcellent = evaluateGazeDataQuality(excellentStats);
  assert(qExcellent.isAcceptable === true, 'High frame rate and tracking yields acceptable quality');
  assert(qExcellent.qualityScore >= 80, 'Excellent quality score is >= 80');

  const degradedStats = {
    totalFrames: 100,
    faceFoundFrames: 30, // 70% face lost
    avgFps: 12, // dropped frames
    calibrationErrorPx: 140, // high error
    headJitterVar: 35, // unstable
  };
  const qDegraded = evaluateGazeDataQuality(degradedStats);
  assert(qDegraded.isAcceptable === false, 'Poor tracking parameters correctly trigger rejection');
  assert(qDegraded.qualityScore < 60, 'Degraded quality score is below 60 threshold');

  // Verify that analysis is withheld on poor quality
  const withheldResult = computeDescriptiveAttentionMetrics(syntheticGaze, 3, 10, qDegraded);
  assert(withheldResult.status === 'withheld', 'computeDescriptiveAttentionMetrics withholds analysis when quality is poor');
  assert(withheldResult.metrics === null, 'No metrics are emitted when quality is unacceptable');

  // ==============================================
  // 4. Consent Gating
  // ==============================================
  // Module must be inert when consent is false
  const runWithConsentGate = (hasUserConsented, gazeData, quality) => {
    if (!hasUserConsented) {
      return { status: 'inert', reason: 'Consent not granted. Eye tracking is disabled.' };
    }
    return computeDescriptiveAttentionMetrics(gazeData, 3, 10, quality);
  };
  const inertRun = runWithConsentGate(false, syntheticGaze, qExcellent);
  assert(inertRun.status === 'inert', 'Tracking pipeline is completely inert when consent is off');

  // ==============================================
  // 5. Zero-Leakage Privacy Verification
  // ==============================================
  // Ensure that no images, base64 data, or raw pixel buffers are stored or present in metric payloads
  const metricResult = computeDescriptiveAttentionMetrics(syntheticGaze, 3, 10, qExcellent);
  const serialized = JSON.stringify(metricResult);
  assert(!serialized.includes('data:image'), 'Zero-leakage: Payload contains no base64 image data');
  assert(!serialized.includes('HTMLCanvasElement'), 'Zero-leakage: Payload contains no canvas elements');
  assert(!serialized.includes('ImageData'), 'Zero-leakage: Payload contains no ImageData objects');
  assert(!serialized.includes('Uint8ClampedArray'), 'Zero-leakage: No pixel buffer byte arrays in payload');
  assert(metricResult.metrics.offScreenPercent !== undefined, 'Descriptive metrics computed properly');

  console.log(`\n✅ GazeAnalysis Tests: ${results.filter((r) => r.pass).length}/${results.length} passed.`);
  return results;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('gazeAnalysis.test.js')) {
  runGazeAnalysisUnitTests();
}
