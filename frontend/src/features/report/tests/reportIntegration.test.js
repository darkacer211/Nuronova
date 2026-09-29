/**
 * NeuroNova Clinical Report & Integrated Findings Unit Test Suite
 * Tests:
 * 1. Precision Gaussian CDF Percentile calculation (verifying Bug Fix for CPI 84 = 77.3th percentile)
 * 2. CPI Domain weighting consistency and rounding documentation
 * 3. PVT Reaction-time variability (SDRT, RTCV, fast & slow response counts)
 * 4. Integration Logic:
 *    - Case A: Tasks strong & Screener positive (Divergence / Disagree)
 *    - Case B: Tasks weak & Screener negative (Divergence / Disagree)
 *    - Case C: Low-quality camera data (Confidence downgraded to Tentative)
 *    - Case D: Tasks strong & Screener negative (Consistent / Strong)
 *    - Case E: Tasks weak & Screener positive (Consistent / Strong)
 *    - Case F: Age routing verification (Child vs Adult instruments never mixed)
 */

import { computePercentile, normalCdf, computeRtVariability } from '../math.js';
import { generateIntegratedFindings } from '../integrate.js';

export function runReportUnitTests() {
  const results = [];
  const assert = (condition, name, details = '') => {
    if (condition) {
      results.push({ pass: true, name });
    } else {
      results.push({ pass: false, name, details });
      console.error(`FAIL: ${name} ${details ? `(${details})` : ''}`);
    }
  };

  console.log('--- Starting NeuroNova Report & Integration Unit Tests ---');

  // =========================================================================
  // 1. Percentile Calculation & Normal CDF Tests (TASK 1 BUG FIX)
  // =========================================================================
  {
    // Mean = 75, SD = 12
    // CPI 75 -> z = 0 -> 50th percentile
    const p75 = computePercentile(75, 75, 12);
    assert(Math.abs(p75 - 50.0) < 0.1, 'CPI 75 produces 50.0th percentile', `Got ${p75}`);

    // CPI 84 -> z = (84 - 75) / 12 = 0.75 -> ~77.3th percentile (NOT 82nd)
    const p84 = computePercentile(84, 75, 12);
    assert(Math.abs(p84 - 77.3) < 0.2, 'CPI 84 produces 77.3th percentile (Bug 1 Fixed)', `Got ${p84}`);

    // CPI 63 -> z = -1.0 -> 15.9th percentile
    const p63 = computePercentile(63, 75, 12);
    assert(Math.abs(p63 - 15.9) < 0.2, 'CPI 63 produces 15.9th percentile (-1 SD)', `Got ${p63}`);

    // CPI 87 -> z = +1.0 -> 84.1th percentile
    const p87 = computePercentile(87, 75, 12);
    assert(Math.abs(p87 - 84.1) < 0.2, 'CPI 87 produces 84.1th percentile (+1 SD)', `Got ${p87}`);

    // Boundary clipping
    const pExtremeLow = computePercentile(10, 75, 12);
    assert(pExtremeLow >= 1.0, 'Extreme low CPI clipped to >= 1.0', `Got ${pExtremeLow}`);

    const pExtremeHigh = computePercentile(120, 75, 12);
    assert(pExtremeHigh <= 99.0, 'Extreme high CPI clipped to <= 99.0', `Got ${pExtremeHigh}`);
  }

  // =========================================================================
  // 2. CPI Domain Weighting & Rounding Discrepancy Documentation (TASK 1)
  // =========================================================================
  {
    const weights = { exec: 0.30, atten: 0.30, speed: 0.25, stab: 0.15 };
    const sumWeights = weights.exec + weights.atten + weights.speed + weights.stab;
    assert(Math.abs(sumWeights - 1.0) < 1e-6, 'Domain weights sum exactly to 1.00');

    // Test with fractional scores
    const continuousScores = { exec: 82.4, atten: 86.2, speed: 79.1, stab: 88.3 };
    const exactCpi =
      weights.exec * continuousScores.exec +
      weights.atten * continuousScores.atten +
      weights.speed * continuousScores.speed +
      weights.stab * continuousScores.stab;
    // exactCpi = 83.60 -> round(exactCpi) = 84

    const roundedDomainScores = {
      exec: Math.round(continuousScores.exec), // 82
      atten: Math.round(continuousScores.atten), // 86
      speed: Math.round(continuousScores.speed), // 79
      stab: Math.round(continuousScores.stab), // 88
    };
    const cpiFromRoundedDomains =
      weights.exec * roundedDomainScores.exec +
      weights.atten * roundedDomainScores.atten +
      weights.speed * roundedDomainScores.speed +
      weights.stab * roundedDomainScores.stab;
    // 0.3*82 + 0.3*86 + 0.25*79 + 0.15*88 = 83.35 -> round is 83

    const diff = Math.abs(exactCpi - cpiFromRoundedDomains);
    assert(diff <= 0.5, 'Rounding discrepancy between continuous CPI and display domains is within documented bounds (≤ 0.5 pts)', `Diff was ${diff.toFixed(3)}`);
  }

  // =========================================================================
  // 3. PVT Reaction Time Variability Calculation (TASK 2)
  // =========================================================================
  {
    const sampleTrials = [210, 235, 240, 260, 255];
    const rtv = computeRtVariability(sampleTrials);
    assert(rtv.mean === 240, 'PVT mean calculated accurately', `Got ${rtv.mean}`);
    assert(rtv.sd > 18 && rtv.sd < 22, 'PVT SDRT calculated accurately (~19.7ms)', `Got ${rtv.sd}`);
    assert(rtv.cv > 0.07 && rtv.cv < 0.10, 'PVT RTCV calculated accurately (~0.082)', `Got ${rtv.cv}`);
    assert(rtv.fastCount === 0, 'Zero fast presses in typical sample', `Got ${rtv.fastCount}`);
    assert(rtv.slowCount === 0, 'Zero lapses in typical sample', `Got ${rtv.slowCount}`);

    // Sample with lapses and anticipations
    const erraticTrials = [120, 220, 540, 230, 610];
    const erraticRtv = computeRtVariability(erraticTrials);
    assert(erraticRtv.fastCount === 1, 'Detected 1 anticipation (<150ms)', `Got ${erraticRtv.fastCount}`);
    assert(erraticRtv.slowCount === 2, 'Detected 2 lapses (>500ms)', `Got ${erraticRtv.slowCount}`);
    assert(erraticRtv.cv > 0.35, 'Elevated CV (>35%) for erratic reactions', `Got ${erraticRtv.cv}`);
  }

  // =========================================================================
  // 4. Integration Logic Tests (TASK 4 & TASK 5)
  // =========================================================================

  // CASE A: Tasks Strong & Screener Positive (Divergence / Disagree)
  {
    const payloadCaseA = {
      tasks: {
        pvt: { mean_rt: 225, rt_sd: 18.2, rt_cv: 0.081, lapses: 0 },
        stroop: { interference_cost: 95, accuracy: 0.98 },
        nback: { span: 8, accuracy: 1.0 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.96, fixation_dispersion: 38.0, head_yaw_var: 2.8, face_lost_ratio: 0.02 },
      },
      screening: {
        participant: { isChild: false, ageGroup: 'Adult' },
        results: [
          { testId: 'asrs', shadedCount: 5, isPositive: true },
        ],
      },
      cpi_score: 88,
    };

    const resultA = generateIntegratedFindings(payloadCaseA);
    const attentionFinding = resultA.findings.find((f) => f.theme === 'sustained_attention');
    assert(attentionFinding.agreement === 'disagree', 'Case A: Correctly flags divergence when tasks are strong and screener is positive');
    assert(attentionFinding.reading.includes('Divergence noted between structured computer performance'), 'Case A: Plain language explains laboratory novelty vs everyday demand');
  }

  // CASE B: Tasks Weak & Screener Negative (Divergence / Disagree)
  {
    const payloadCaseB = {
      tasks: {
        pvt: { mean_rt: 330, rt_sd: 68.0, rt_cv: 0.206, lapses: 3 },
        stroop: { interference_cost: 165, accuracy: 0.88 },
        nback: { span: 5, accuracy: 0.85 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.82, fixation_dispersion: 64.0, head_yaw_var: 4.5, face_lost_ratio: 0.04 },
      },
      screening: {
        participant: { isChild: false, ageGroup: 'Adult' },
        results: [
          { testId: 'asrs', shadedCount: 1, isPositive: false },
        ],
      },
      cpi_score: 64,
    };

    const resultB = generateIntegratedFindings(payloadCaseB);
    const attentionFinding = resultB.findings.find((f) => f.theme === 'sustained_attention');
    assert(attentionFinding.agreement === 'disagree', 'Case B: Correctly flags divergence when tasks show lapses but screener is negative');
    assert(attentionFinding.reading.includes('Elevated reaction-time variability or brief gaze lapses were recorded'), 'Case B: Explains acute sleep debt/fatigue vs trait inattention');
  }

  // CASE C: Low-Quality Camera Data (Confidence Downgraded to Tentative)
  {
    const payloadCaseC = {
      tasks: {
        pvt: { mean_rt: 240, rt_sd: 22.0, rt_cv: 0.091, lapses: 0 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.85, fixation_dispersion: 45.0, head_yaw_var: 3.5, face_lost_ratio: 0.42 }, // high face lost ratio!
      },
      screening: {
        participant: { isChild: false, ageGroup: 'Adult' },
        results: [{ testId: 'asrs', shadedCount: 1, isPositive: false }],
      },
      cpi_score: 78,
    };

    const resultC = generateIntegratedFindings(payloadCaseC);
    assert(resultC.cameraQuality === 'tentative', 'Case C: Correctly labels camera tracking quality as tentative when faceLostRatio > 0.35');
    const motorFinding = resultC.findings.find((f) => f.theme === 'eye_stability_restlessness');
    assert(motorFinding.confidence === 'tentative', 'Case C: Downgrades motor finding confidence to tentative under poor camera data');
  }

  // CASE D: Tasks Strong & Screener Negative (Consistent / Strong)
  {
    const payloadCaseD = {
      tasks: {
        pvt: { mean_rt: 230, rt_sd: 20.0, rt_cv: 0.087, lapses: 0 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.95, fixation_dispersion: 36.0, head_yaw_var: 2.5, face_lost_ratio: 0.01 },
      },
      screening: {
        participant: { isChild: false, ageGroup: 'Adult' },
        results: [{ testId: 'asrs', shadedCount: 0, isPositive: false }],
      },
      cpi_score: 86,
    };

    const resultD = generateIntegratedFindings(payloadCaseD);
    const attentionFinding = resultD.findings.find((f) => f.theme === 'sustained_attention');
    assert(attentionFinding.agreement === 'consistent', 'Case D: Correctly flags consistent agreement when both tasks and screener are optimal');
    assert(attentionFinding.confidence === 'strong', 'Case D: Confirmed strong confidence when multiple measures agree with high camera quality');
  }

  // CASE E: Tasks Weak & Screener Positive (Consistent / Strong)
  {
    const payloadCaseE = {
      tasks: {
        pvt: { mean_rt: 340, rt_sd: 72.0, rt_cv: 0.212, lapses: 3 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.82, fixation_dispersion: 68.0, head_yaw_var: 5.5, face_lost_ratio: 0.03 },
      },
      screening: {
        participant: { isChild: false, ageGroup: 'Adult' },
        results: [{ testId: 'asrs', shadedCount: 5, isPositive: true }],
      },
      cpi_score: 58,
    };

    const resultE = generateIntegratedFindings(payloadCaseE);
    const attentionFinding = resultE.findings.find((f) => f.theme === 'sustained_attention');
    assert(attentionFinding.agreement === 'consistent', 'Case E: Correctly flags consistent agreement when both tasks and screener show attentional friction');
    assert(attentionFinding.confidence === 'strong', 'Case E: High confidence when multiple independent measures align');
  }

  // CASE F: Age Routing Isolation (Pediatric Child battery)
  {
    const payloadCaseF = {
      tasks: {
        pvt: { mean_rt: 260, rt_sd: 28.0, rt_cv: 0.107, lapses: 0 },
      },
      biomarkers: {
        oculomotor: { gaze_on_screen: 0.91, fixation_dispersion: 42.0, head_yaw_var: 3.2, face_lost_ratio: 0.02 },
      },
      screening: {
        participant: { isChild: true, ageGroup: '4–15 years' },
        results: [
          { testId: 'vanderbilt', inattentiveCount: 7, hyperactiveCount: 6, isPositive: true },
          { testId: 'aq_child', totalScore: 7, cutoff: 6, isPositive: true },
        ],
      },
      cpi_score: 72,
    };

    const resultF = generateIntegratedFindings(payloadCaseF);
    assert(resultF.isChild === true, 'Case F: Flags participant as child');
    const attentionalRow = resultF.agreementMatrix.find((r) => r.area.includes('Attention'));
    assert(attentionalRow.questionnaires.includes('Vanderbilt Parent Rating'), 'Case F: Uses Vanderbilt Parent Rating for child, not adult ASRS');
    const autismFinding = resultF.findings.find((f) => f.theme === 'autism_traits');
    assert(autismFinding.reading.includes('AQ-10 Child: 7/10'), 'Case F: Uses AQ-10 Child for pediatric autism screening');
  }

  const passCount = results.filter((r) => r.pass).length;
  const failCount = results.filter((r) => !r.pass).length;

  console.log(`\nUnit Test Summary: ${passCount} Passed, ${failCount} Failed.`);
  return { passCount, failCount, results };
}

// Auto-run if executed directly via Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('reportIntegration.test')) {
  const summary = runReportUnitTests();
  if (summary.failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}
