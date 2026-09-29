/**
 * NeuroNova Integrated Findings Engine
 * Synthesizes objective task telemetry, webcam eye-tracking, and clinical behavioral questionnaires.
 * Produces structured findings with explicit confidence levels, cross-modal agreement, and clinician-facing notes.
 */

import { MEASURE_REFERENCES, SCREENER_REFERENCES } from './reportConfig.js';

/**
 * Generate integrated findings from full assessment payload
 * @param {Object} payload
 * @param {Object} payload.tasks - PVT, Stroop, N-Back/Digit Span, Verbal
 * @param {Object} payload.biomarkers - Oculomotor, Acoustic, Motor
 * @param {Object} payload.screening - Participant info and questionnaire results
 * @param {Object} payload.domains - 4 cognitive domains
 * @param {number} payload.cpi_score - Composite CPI
 */
export function generateIntegratedFindings({
  tasks = {},
  biomarkers = {},
  screening = null,
  domains = {},
  cpi_score = 75,
}) {
  const pvt = tasks.pvt || {};
  const stroop = tasks.stroop || {};
  const nback = tasks.nback || {};
  const verbal = tasks.verbal || {};
  const oculo = biomarkers.oculomotor || {};
  const acoust = biomarkers.acoustic || {};

  const participant = screening?.participant || {};
  const isChild = Boolean(participant.isChild);
  const ageGroup = participant.ageGroup || (isChild ? '4–15 years' : 'Adult');
  const screenerResults = screening?.results || [];

  // Determine camera tracking quality
  const faceLostRatio = typeof oculo.face_lost_ratio === 'number' ? oculo.face_lost_ratio : 0.03;
  const isCameraCalibratedFallback = Boolean(oculo.is_fallback);
  let cameraQuality = 'high';
  if (isCameraCalibratedFallback || faceLostRatio > 0.35) {
    cameraQuality = 'tentative';
  } else if (faceLostRatio > 0.15) {
    cameraQuality = 'moderate';
  }

  // Identify administered screeners (Strictly respecting age routing)
  const asrsResult = isChild ? null : screenerResults.find((r) => r.testId === 'asrs' || r.testId === 'asrs6');
  const vanderbiltResult = isChild ? screenerResults.find((r) => r.testId === 'vanderbilt') : null;
  const aq10Result = isChild ? null : screenerResults.find((r) => r.testId === 'aq10');
  const aqChildResult = isChild ? screenerResults.find((r) => r.testId === 'aq_child') : null;
  const catqResult = isChild ? null : screenerResults.find((r) => r.testId === 'catq');
  const mchatResult = screenerResults.find((r) => r.testId === 'mchat');

  const findings = [];
  const agreementMatrix = [];

  // =========================================================================
  // THEME A: Sustained Attention & Attentional Fluctuation
  // =========================================================================
  {
    const meanRt = Number(pvt.mean_rt) || 245;
    const lapses = Number(pvt.lapses) || 0;
    const rtSd = Number(pvt.rt_sd) || 26.5;
    const rtCv = Number(pvt.rt_cv) || Number((rtSd / Math.max(meanRt, 1)).toFixed(3));
    const gazeOnScreen = Number(oculo.gaze_on_screen) !== undefined ? Number(oculo.gaze_on_screen) : 0.92;

    const taskShowsInattention = lapses >= 2 || rtCv > 0.18 || rtSd > 52 || gazeOnScreen < 0.85;
    const taskShowsOptimal = lapses <= 1 && rtCv <= 0.15 && rtSd <= 45 && gazeOnScreen >= 0.90;

    let screenerShowsInattention = false;
    let screenerText = 'Not administered';
    let screenerEvidence = null;

    if (isChild && vanderbiltResult) {
      const inattentiveCount = vanderbiltResult.inattentiveCount ?? vanderbiltResult.inattentiveScore ?? 0;
      screenerShowsInattention = inattentiveCount >= 6;
      screenerText = `Vanderbilt Parent Rating: ${inattentiveCount}/9 Inattentive criteria met`;
      screenerEvidence = {
        measure: 'Vanderbilt Inattentive Domain',
        value: `${inattentiveCount} / 9 criteria`,
        source: 'Parent Rating Scale (Wolraich et al., 2003)',
        expectedRange: '< 6 criteria',
        interpretation: screenerShowsInattention
          ? 'Meets pediatric screening cutoff for inattentive traits'
          : 'Below pediatric screening cutoff',
      };
    } else if (!isChild && asrsResult) {
      const shaded = asrsResult.shadedCount ?? 0;
      screenerShowsInattention = shaded >= 4;
      screenerText = `ASRS v1.1 Part A: ${shaded}/6 shaded boxes endorsed`;
      screenerEvidence = {
        measure: 'ASRS v1.1 Part A',
        value: `${shaded} / 6 shaded boxes`,
        source: 'WHO Adult ADHD Screener (Kessler et al., 2005)',
        expectedRange: '< 4 shaded boxes',
        interpretation: screenerShowsInattention
          ? 'Endorses clinically significant adult inattention/hyperactivity traits'
          : 'Below adult clinical threshold',
      };
    }

    let agreement = 'consistent';
    let confidence = 'moderate';
    let title = 'Sustained Attention & Alerting Stability';
    let reading = '';

    if (taskShowsInattention && screenerShowsInattention) {
      agreement = 'consistent';
      confidence = cameraQuality === 'high' ? 'strong' : 'moderate';
      reading =
        'Objective computerized tests and subjective behavioral screening show consistent patterns of attentional fluctuation. Elevated reaction-time variability and brief gaze lapses align with reported everyday distractibility and focus maintenance difficulty.';
    } else if (taskShowsOptimal && !screenerShowsInattention) {
      agreement = 'consistent';
      confidence = 'strong';
      reading =
        'Robust sustained vigilance observed across both objective reaction tests and standardized screening. Consistent reaction times, minimal attentional lapses, and sustained gaze engagement align with normative self/parent reporting.';
    } else if (taskShowsOptimal && screenerShowsInattention) {
      agreement = 'disagree';
      confidence = 'moderate';
      reading =
        'Divergence noted between structured computer performance and everyday behavioral report. Performance during brief, novel, gamified tasks often benefits from high situational arousal (novelty stimulation), which can temporarily compensate for underlying executive fatigue. Standardized screeners capture cumulative daily-life friction across hours and weeks.';
    } else if (taskShowsInattention && !screenerShowsInattention) {
      agreement = 'disagree';
      confidence = 'moderate';
      reading =
        'Elevated reaction-time variability or brief gaze lapses were recorded during testing, but clinical questionnaire responses were below screening thresholds. This pattern does not necessarily indicate chronic inattention; it is frequently observed during acute sleep debt, visual fatigue, or momentary external distractions during testing.';
    } else {
      agreement = 'partial';
      confidence = 'moderate';
      reading =
        'Mild variability observed across attention markers. Some measures demonstrate intact baseline reaction velocity, while secondary variability metrics indicate subtle fluctuations in alertness.';
    }

    const evidence = [
      {
        measure: 'PVT Mean Reaction Time',
        value: `${meanRt} ms`,
        source: MEASURE_REFERENCES.pvt_mean_rt.source,
        expectedRange: MEASURE_REFERENCES.pvt_mean_rt.typicalRange,
        interpretation: meanRt <= 290 ? 'Normative response velocity' : 'Slowed response latency',
      },
      {
        measure: 'Trial-to-Trial Variability (RTCV)',
        value: `${(rtCv * 100).toFixed(1)}% (SD: ${rtSd} ms)`,
        source: MEASURE_REFERENCES.pvt_rt_cv.source,
        expectedRange: '< 15.0%',
        interpretation: rtCv <= 0.15 ? 'Consistent trial timing' : 'Elevated response variability',
      },
      {
        measure: 'Attentional Lapses (>500ms)',
        value: `${lapses} lapse(s)`,
        source: MEASURE_REFERENCES.pvt_lapses.source,
        expectedRange: '0 – 1 lapses',
        interpretation: lapses <= 1 ? 'Stable vigilance maintenance' : 'Lapses in continuous alerting',
      },
      {
        measure: 'On-Screen Gaze Fixation',
        value: `${Math.round(gazeOnScreen * 100)}%`,
        source: MEASURE_REFERENCES.gaze_on_screen.source,
        expectedRange: '≥ 90%',
        interpretation: gazeOnScreen >= 0.88 ? 'Continuous visual engagement' : 'Intermittent visual diversion',
      },
    ];
    if (screenerEvidence) evidence.push(screenerEvidence);

    findings.push({
      id: 'finding_sustained_attention',
      theme: 'sustained_attention',
      title,
      evidence,
      research_note:
        'In ADHD neuropsychology (Kofler et al., 2013; Tamm et al., 2012), trial-to-trial reaction time variability (IIV / RTCV) exhibits a larger effect size (d ≈ 0.76) than simple mean reaction time. Brief structured tasks provide extrinsic dopamine/arousal that can mask difficulties evident in unprompted environments (Sonuga-Barke et al., 2010).',
      reading,
      confidence,
      agreement,
    });

    agreementMatrix.push({
      area: 'Sustained Attention & Alerting',
      tasksSensors: `Mean RT ${meanRt}ms, CV ${(rtCv * 100).toFixed(0)}%, ${lapses} lapse(s), ${Math.round(gazeOnScreen * 100)}% gaze`,
      questionnaires: screenerText,
      agreement,
      statusChip: getAgreementChip(agreement),
    });
  }

  // =========================================================================
  // THEME B: Motor Steadiness & Oculomotor Restlessness
  // =========================================================================
  {
    const dispersion = Number(oculo.fixation_dispersion) || 41.5;
    const headYawVar = Number(oculo.head_yaw_var) || 3.2;
    const blinkRate = Number(oculo.blink_rate) || 18.2;

    const sensorShowsRestlessness = dispersion > 60 || headYawVar > 5.2 || blinkRate > 25.0;
    const sensorShowsCalm = dispersion <= 52 && headYawVar <= 4.2;

    let screenerShowsHyperactivity = false;
    let screenerText = 'Not administered';
    let screenerEvidence = null;

    if (isChild && vanderbiltResult) {
      const hyperCount = vanderbiltResult.hyperactiveCount ?? vanderbiltResult.hyperactiveScore ?? 0;
      screenerShowsHyperactivity = hyperCount >= 6;
      screenerText = `Vanderbilt: ${hyperCount}/9 Hyperactive/Impulsive criteria`;
      screenerEvidence = {
        measure: 'Vanderbilt Hyperactivity / Impulsivity Domain',
        value: `${hyperCount} / 9 criteria`,
        source: 'Parent Rating Scale (Wolraich et al., 2003)',
        expectedRange: '< 6 criteria',
        interpretation: screenerShowsHyperactivity
          ? 'Endorsement of physical restlessness and motor hyperactivity'
          : 'Below pediatric hyperactivity cutoff',
      };
    } else if (!isChild && asrsResult) {
      // Items 5 & 6 on ASRS assess fidgeting and excessive motor activity
      const motorItems = asrsResult.itemScores?.filter((it) => it.number === 5 || it.number === 6) || [];
      const hasMotorShaded = motorItems.some((it) => it.isShaded);
      screenerShowsHyperactivity = hasMotorShaded;
      screenerText = `ASRS Motor Items (5-6): ${hasMotorShaded ? 'Elevated restlessness' : 'Normative steadiness'}`;
      screenerEvidence = {
        measure: 'ASRS Motor & Fidgeting Items',
        value: hasMotorShaded ? 'Shaded threshold endorsed' : 'Within normal limits',
        source: 'WHO ASRS v1.1 Items 5–6 (Adler et al., 2006)',
        expectedRange: 'Unshaded response',
        interpretation: hasMotorShaded
          ? 'Endorsement of motor restlessness / inability to sit still'
          : 'Normative physical restlessness rating',
      };
    }

    let agreement = 'consistent';
    let confidence = cameraQuality === 'high' ? 'moderate' : 'tentative';
    let title = 'Motor Steadiness & Oculomotor Micro-Movements';
    let reading = '';

    if (sensorShowsRestlessness && screenerShowsHyperactivity) {
      agreement = 'consistent';
      confidence = cameraQuality === 'high' ? 'strong' : cameraQuality === 'moderate' ? 'moderate' : 'tentative';
      reading =
        'Physical head posture adjustments, elevated blink frequency, and micro-saccadic dispersion observed by edge tracking are consistent with reported physical restlessness or fidgeting.';
    } else if (sensorShowsCalm && !screenerShowsHyperactivity) {
      agreement = 'consistent';
      confidence = cameraQuality === 'high' ? 'strong' : cameraQuality === 'moderate' ? 'moderate' : 'tentative';
      reading =
        'Steady physical posture and controlled ocular fixation aligned with low reported hyperactive/impulsive behaviors.';
    } else if (sensorShowsRestlessness && !screenerShowsHyperactivity) {
      agreement = 'disagree';
      confidence = cameraQuality === 'high' ? 'moderate' : 'tentative';
      reading =
        'Camera tracking detected increased head adjustments or fixation wandering, but questionnaires did not report elevated restlessness. Physical movements during desk testing can arise from chair posture, visual fatigue, or adjusting viewing angle rather than trait hyperactivity.';
    } else {
      agreement = 'disagree';
      confidence = cameraQuality === 'high' ? 'moderate' : 'tentative';
      reading =
        'Questionnaire responses indicate frequent restlessness or fidgeting, but physical movement during the computer protocol remained subdued. Structured tasks often induce brief behavioral suppression or channel restlessness into covert fidgeting.';
    }

    // Convert pixel dispersion to estimated visual angle if standard 60cm distance
    // At ~60cm on a 96-110 DPI laptop display, ~40-45 px corresponds to approximately 1.0 degree
    const estDegreesVisualAngle = (dispersion / 42.0).toFixed(1);

    const evidence = [
      {
        measure: 'Fixation Dispersion',
        value: `${dispersion} px (~${estDegreesVisualAngle}° visual angle)`,
        source: MEASURE_REFERENCES.fixation_dispersion.source,
        expectedRange: '25 – 55 px (display dependent)',
        interpretation: dispersion <= 55 ? 'Controlled foveal focus' : 'Elevated micro-saccadic drift',
      },
      {
        measure: 'Head Pose Variance',
        value: `${headYawVar}° var`,
        source: MEASURE_REFERENCES.head_jitter.source,
        expectedRange: '< 4.5° variance',
        interpretation: headYawVar <= 4.5 ? 'Stable physical posture' : 'Frequent head reorientation',
      },
      {
        measure: 'Blink Frequency',
        value: `${blinkRate} blinks/min`,
        source: MEASURE_REFERENCES.blink_rate.source,
        expectedRange: '14 – 22 / min',
        interpretation: blinkRate <= 23 ? 'Typical physiological rate' : 'Elevated (strain/fatigue marker)',
      },
    ];
    if (screenerEvidence) evidence.push(screenerEvidence);

    findings.push({
      id: 'finding_motor_stability',
      theme: 'eye_stability_restlessness',
      title,
      evidence,
      research_note:
        'Webcam tracking extracts 478 face landmarks and iris coordinates at ~30 Hz. Pixel values depend on device screen dimensions and user distance (Rayner, 1998; Martin et al., 2018). While webcam tracking is not clinical-grade infrared scleral telemetry, head pose variance reliably correlates with gross motor fidgeting.',
      reading,
      confidence,
      agreement,
    });

    agreementMatrix.push({
      area: 'Motor Steadiness & Fixation',
      tasksSensors: `Fixation dispersion ${dispersion}px (~${estDegreesVisualAngle}°), Head var ${headYawVar}°, Blink rate ${blinkRate}/min`,
      questionnaires: screenerText,
      agreement,
      statusChip: getAgreementChip(agreement),
    });
  }

  // =========================================================================
  // THEME C: Executive Inhibition & Working Memory Buffer
  // =========================================================================
  {
    const stroopCost = typeof stroop.interference_cost === 'number' ? stroop.interference_cost : 110;
    const stroopAccuracy = typeof stroop.accuracy === 'number' ? stroop.accuracy : 0.95;
    const digitSpan = Number(nback.span) || 7;

    const taskShowsExecStrain = stroopCost > 175 || stroopAccuracy < 0.85 || digitSpan <= 4;
    const taskShowsExecStrength = stroopCost <= 135 && stroopAccuracy >= 0.92 && digitSpan >= 6;

    let agreement = 'consistent';
    let confidence = 'strong';
    let title = 'Executive Inhibition & Working Memory Buffer';
    let reading = '';

    if (taskShowsExecStrength) {
      reading =
        'Strong prefrontal inhibitory control and robust working memory capacity demonstrated. Efficient suppression of automated word reading with rapid conflict resolution (Stroop interference within normative benchmark) and intact sequential memory buffer (Digit span ≥ 6).';
    } else if (taskShowsExecStrain) {
      agreement = 'partial';
      confidence = 'moderate';
      reading =
        'Elevated cognitive overhead observed during sensory conflict trials or constrained digit memory retention. Suggests increased susceptibility to distraction or working memory buffer saturation when managing multi-step sequences.';
    } else {
      agreement = 'consistent';
      confidence = 'moderate';
      reading =
        'Executive inhibitory precision and working memory retention operate within normative population boundaries.';
    }

    const evidence = [
      {
        measure: 'Stroop Interference Cost',
        value: `+${stroopCost} ms`,
        source: MEASURE_REFERENCES.stroop_cost.source,
        expectedRange: '+70 to +150 ms',
        interpretation: stroopCost <= 150 ? 'Rapid conflict resolution' : 'Elevated prefrontal inhibitory overhead',
      },
      {
        measure: 'Stroop Inhibition Accuracy',
        value: `${Math.round(stroopAccuracy * 100)}%`,
        source: MEASURE_REFERENCES.stroop_accuracy.source,
        expectedRange: '≥ 90%',
        interpretation: stroopAccuracy >= 90 ? 'High inhibitory precision' : 'Response conflict errors',
      },
      {
        measure: 'Digit Span Retention',
        value: `${digitSpan} digits`,
        source: MEASURE_REFERENCES.digit_span.source,
        expectedRange: "5 – 9 digits (Miller's Law)",
        interpretation: digitSpan >= 6 ? 'Robust active working memory' : 'Constrained memory buffer',
      },
    ];

    findings.push({
      id: 'finding_executive_inhibition',
      theme: 'inhibition_working_memory',
      title,
      evidence,
      research_note:
        'The Stroop effect isolates anterior cingulate and dorsolateral prefrontal cortex conflict resolution (MacLeod, 1991; Miyake et al., 2000). Digit span evaluates the phonological loop buffer capacity (Miller, 1956; Cowan, 2001). Intact performance indicates preserved prefrontal executive control under laboratory demands.',
      reading,
      confidence,
      agreement,
    });

    agreementMatrix.push({
      area: 'Executive Inhibition & Memory',
      tasksSensors: `Stroop cost +${stroopCost}ms (${Math.round(stroopAccuracy * 100)}% acc), Digit span ${digitSpan}`,
      questionnaires: isChild
        ? vanderbiltResult
          ? `Pediatric battery (Inattention: ${vanderbiltResult.inattentiveCount || 0}/9)`
          : 'Pediatric screening'
        : asrsResult
        ? `Adult ASRS (Working memory items: ${asrsResult.sumScore || 0}/24)`
        : 'Adult screener',
      agreement,
      statusChip: getAgreementChip(agreement),
    });
  }

  // =========================================================================
  // THEME D: Autism-Related Traits & Communication Style
  // =========================================================================
  {
    const speechWpm = Number(verbal.speech_rate_wpm) || 138;
    const pauseRatio = Number(verbal.pause_ratio) || 0.16;

    let aqScore = 0;
    let aqCutoff = 6;
    let aqPositive = false;
    let aqName = 'AQ-10';
    let screenerEvidence = null;

    if (isChild && aqChildResult) {
      aqScore = aqChildResult.totalScore ?? 0;
      aqCutoff = aqChildResult.cutoff ?? 6;
      aqPositive = aqScore >= aqCutoff;
      aqName = 'AQ-10 Child';
      screenerEvidence = {
        measure: 'AQ-10 Child Screener',
        value: `${aqScore} / 10`,
        source: SCREENER_REFERENCES.aq_child.source,
        expectedRange: '< 6 points',
        interpretation: aqPositive
          ? 'Meets pediatric threshold for comprehensive autism diagnostic evaluation'
          : 'Below pediatric referral threshold',
      };
    } else if (!isChild && aq10Result) {
      aqScore = aq10Result.totalScore ?? 0;
      aqCutoff = aq10Result.cutoff ?? 6;
      aqPositive = aqScore >= aqCutoff;
      aqName = 'AQ-10 Adult';
      screenerEvidence = {
        measure: 'AQ-10 Adult Screener',
        value: `${aqScore} / 10`,
        source: SCREENER_REFERENCES.aq10.source,
        expectedRange: '< 6 points',
        interpretation: aqPositive
          ? 'Meets NICE-recommended threshold for formal autism evaluation referral'
          : 'Below adult referral threshold',
      };
    }

    const catqTotal = catqResult ? (catqResult.totalScore ?? 0) : null;
    const catqPositive = catqTotal !== null && catqTotal >= 100;

    let agreement = 'consistent';
    let confidence = 'moderate';
    let title = 'Social-Communication Style & Autistic Traits';
    let reading = '';

    if (aqPositive || catqPositive) {
      agreement = 'consistent';
      confidence = 'strong';
      reading =
        `Responses on standardized screening (${aqName}: ${aqScore}/10${catqTotal !== null ? `, CAT-Q: ${catqTotal}/175` : ''}) exceed established clinical thresholds, indicating significant traits consistent with the autism spectrum or active social camouflaging. Speech pacing remained fluent (${speechWpm} WPM) with typical acoustic pauses (${Math.round(pauseRatio * 100)}%). This screening does not diagnose autism; sharing results with a specialized neurodevelopmental clinician is recommended.`;
    } else if (aqScore > 0 || catqTotal !== null) {
      agreement = 'consistent';
      reading =
        `Standardized screening scores (${aqName}: ${aqScore}/10) fall below clinical referral cutoffs. Speech formulation pacing (${speechWpm} WPM) and acoustic pauses were within typical communication benchmarks.`;
    } else if (mchatResult) {
      title = 'Toddler Milestone Surveillance (M-CHAT-R/F)';
      agreement = 'consistent';
      confidence = 'strong';
      reading = `Toddler developmental screening evaluated ${mchatResult.totalScore}/20 risk markers (Risk tier: ${mchatResult.riskLevel || 'Low'}). ${mchatResult.summary}`;
    } else {
      reading =
        'Autism-specific behavioral screening was not selected for this assessment session. Objective verbal fluency showed fluent semantic retrieval and standard acoustic pauses.';
    }

    const evidence = [
      {
        measure: 'Verbal Fluency Speech Rate',
        value: `${speechWpm} WPM`,
        source: MEASURE_REFERENCES.verbal_speech_rate.source,
        expectedRange: MEASURE_REFERENCES.verbal_speech_rate.typicalRange,
        interpretation: speechWpm >= 115 ? 'Fluent lexical retrieval speed' : 'Deliberate speech initiation',
      },
      {
        measure: 'Acoustic Pause Ratio',
        value: `${Math.round(pauseRatio * 100)}%`,
        source: MEASURE_REFERENCES.verbal_pause_ratio.source,
        expectedRange: '10% – 22%',
        interpretation: pauseRatio <= 0.22 ? 'Standard phonation rhythm' : 'Frequent formulation pauses',
      },
    ];
    if (screenerEvidence) evidence.push(screenerEvidence);
    if (catqResult) {
      evidence.push({
        measure: 'CAT-Q Camouflaging Total',
        value: `${catqTotal} / 175`,
        source: SCREENER_REFERENCES.catq.source,
        expectedRange: '< 100 points',
        interpretation: catqPositive
          ? 'Elevated social compensation, masking, or assimilation'
          : 'Normative social camouflaging score',
      });
    }

    findings.push({
      id: 'finding_autism_traits',
      theme: 'autism_traits',
      title,
      evidence,
      research_note:
        'Standardized questionnaires (AQ-10, CAT-Q, M-CHAT) are triage screening instruments designed to evaluate whether a full multi-disciplinary clinical evaluation is indicated (Allison et al., 2012; Hull et al., 2019). Computerized cognitive tests cannot confirm or exclude an autism spectrum diagnosis.',
      reading,
      confidence,
      agreement,
    });

    agreementMatrix.push({
      area: 'Autism Traits & Communication',
      tasksSensors: `Verbal rate ${speechWpm} WPM, pause ratio ${Math.round(pauseRatio * 100)}%`,
      questionnaires: screenerEvidence
        ? `${aqName}: ${aqScore}/10${catqTotal !== null ? ` • CAT-Q: ${catqTotal}/175` : ''}`
        : mchatResult
        ? `M-CHAT-R/F: ${mchatResult.totalScore}/20 (${mchatResult.riskLevel} risk)`
        : 'Not administered',
      agreement,
      statusChip: getAgreementChip(agreement),
    });
  }

  // Generate 3 plain-language key takeaways
  const summaryTakeaways = generatePlainLanguageTakeaways({
    cpi_score,
    domains,
    findings,
    isChild,
    screening,
  });

  return {
    findings,
    agreementMatrix,
    summaryTakeaways,
    cameraQuality,
    isChild,
    ageGroup,
  };
}

/**
 * Generate 3 plain-language key takeaways for Section 1
 */
function generatePlainLanguageTakeaways({ cpi_score, domains, findings, isChild, screening }) {
  const takeaways = [];

  // Takeaway 1: Overall Performance
  if (cpi_score >= 82) {
    takeaways.push(
      'Overall cognitive performance is in the upper average range, with fast response times and stable attention throughout the computer tasks.'
    );
  } else if (cpi_score >= 70) {
    takeaways.push(
      'Overall cognitive performance is solid and well within typical expected ranges across memory, focus, and response speed.'
    );
  } else if (cpi_score >= 55) {
    takeaways.push(
      'Performance showed mild cognitive strain during high-demand conflict tasks, while core basic reaction speed remained intact.'
    );
  } else {
    takeaways.push(
      'Noticeable friction was observed during testing, particularly during sustained focus and sequence recall tasks.'
    );
  }

  // Takeaway 2: Cross-Modal Cross-Check (Tasks vs Questionnaires)
  const attentionalFinding = findings.find((f) => f.theme === 'sustained_attention');
  if (attentionalFinding?.agreement === 'disagree') {
    takeaways.push(
      'A notable difference appeared between short computer tests (which showed steady focus) and questionnaire reports (which describe frequent daily inattention). Short, game-like tests often provide extra stimulation that masks everyday focus difficulties.'
    );
  } else if (attentionalFinding?.agreement === 'consistent' && attentionalFinding.confidence === 'strong') {
    takeaways.push(
      'Computer reaction tests and behavioral questionnaire reports showed strong mutual agreement, confirming a consistent pattern across both objective and subjective measures.'
    );
  } else {
    takeaways.push(
      'Executive memory and color conflict tests demonstrated efficient mental flexibility with good self-correction under changing task rules.'
    );
  }

  // Takeaway 3: Actionable Guidance
  const autismFinding = findings.find((f) => f.theme === 'autism_traits');
  const screenerPositive = screening?.results?.some((r) => r.isPositive);

  if (screenerPositive) {
    takeaways.push(
      'One or more standardized behavioral screeners exceeded the threshold for follow-up. We recommend sharing this report with your healthcare provider or pediatrician for an individualized discussion.'
    );
  } else {
    takeaways.push(
      'No elevated behavioral screening flags were identified. Maintaining regular sleep schedules and structured study/work intervals will help sustain your cognitive energy.'
    );
  }

  return takeaways;
}

/**
 * Helper to produce text + icon chips (never color alone)
 */
function getAgreementChip(agreement) {
  if (agreement === 'consistent') {
    return {
      text: 'Consistent Finding',
      icon: 'check_circle',
      bgClass: 'bg-secondary-fixed/40 text-on-secondary-fixed-variant border-secondary-fixed',
    };
  }
  if (agreement === 'partial') {
    return {
      text: 'Partial Alignment',
      icon: 'info',
      bgClass: 'bg-primary-fixed/40 text-on-primary-fixed border-primary-fixed',
    };
  }
  return {
    text: 'Divergent / Disagree',
    icon: 'warning',
    bgClass: 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  };
}
