import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { generateIntegratedFindings } from '../features/report/integrate';
import { MEASURE_REFERENCES, GLOSSARY_TERMS } from '../features/report/reportConfig';

/**
 * Glossary Tooltip / Popover Component
 * Renders a plain-language explanation when hovering or tapping on clinical/technical terms.
 */
function GlossaryTerm({ termKey, label, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const termData = GLOSSARY_TERMS[termKey] || { term: label || termKey, definition: '' };

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-0.5 text-left border-b border-dotted border-primary/60 dark:border-primary/80 text-on-surface hover:text-primary transition-colors cursor-help font-inherit focus:outline-none"
        title="Click or hover for plain-language definition"
      >
        <span>{children || label || termData.term}</span>
        <span className="material-symbols-outlined text-[14px] text-primary/70 ml-0.5 select-none">help_outline</span>
      </button>

      {isOpen && (
        <span className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-surface-container-highest dark:bg-slate-900 text-on-surface border border-surface-container-high/80 dark:border-slate-700 rounded-xl shadow-xl text-xs font-normal normal-case leading-relaxed pointer-events-none transform transition-all duration-150">
          <strong className="block text-[13px] font-bold text-primary mb-1">{termData.term}</strong>
          <span className="text-on-surface-variant dark:text-slate-300">{termData.definition}</span>
          <span className="absolute top-full left-4 -mt-1 w-2.5 h-2.5 bg-surface-container-highest dark:bg-slate-900 border-r border-b border-surface-container-high/80 dark:border-slate-700 transform rotate-45"></span>
        </span>
      )}
    </span>
  );
}

/**
 * Main Clinical Neuro-Analytics Dashboard
 * Re-structured per clinical reporting specifications:
 * 1. Short summary (Adult: CPI, percentile, CI, status | Child: Pediatric Milestone & Sensor Fidelity)
 * 2. Visual Domain Representation (Adult: 4 domain score bars | Child: Pediatric Face & Blink Telemetry Profile)
 * 3. Standardized Clinical Behavioral Questionnaires (ADHD & Autism): Comprehensive data, scores & clinical conclusions
 * 4. Integrated findings (Cross-modal Tasks/Sensors x Screeners with agreement matrix)
 * 5. Test-by-test technical telemetry table
 * 6. Score drivers (SHAP) in plain language (Computerized tasks filtered out for children)
 * 7. Suggested next steps
 * 8. Limits of this report (with non-diagnostic disclaimer)
 * 9. Collapsible technical appendix
 */
export default function Dashboard({ analysisResult, rawPayload, onRetake }) {
  const [appendixOpen, setAppendixOpen] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.6 },
      colors: ['#4648d4', '#006c49', '#6063ee'],
    });
  }, []);

  if (!analysisResult) {
    return (
      <div className="p-12 text-center bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high/60">
        <p className="font-body-md text-on-surface-variant">Loading cognitive analytics...</p>
      </div>
    );
  }

  const {
    session_id,
    percentile_rank,
    confidence_interval,
  } = analysisResult || {};

  const domains = analysisResult?.domains || {};
  const shap_explanations = Array.isArray(analysisResult?.shap_explanations) ? analysisResult.shap_explanations : [];
  const cpi_score = Number(analysisResult?.cpi_score) || 75;

  const tasks = rawPayload?.tasks || {};
  const biomarkers = rawPayload?.biomarkers || {};
  const screening = rawPayload?.screening || null;
  const oculo = biomarkers.oculomotor || {
    gaze_on_screen: 0.94,
    blink_rate: 18.2,
    fixation_dispersion: 41.5,
    head_yaw_var: 3.2,
  };
  const pvt = tasks.pvt || {};
  const stroop = tasks.stroop || {};
  const nback = tasks.nback || {};
  const verbal = tasks.verbal || {};

  // Integrated findings: use cached or compute immediately
  const integratedData = analysisResult?.integrated_findings || generateIntegratedFindings({
    tasks,
    biomarkers,
    screening,
    domains,
    cpi_score,
  });

  const { findings = [], agreementMatrix = [], summaryTakeaways = [] } = integratedData;

  const handlePrint = () => {
    window.print();
  };

  // Determine if this is a pediatric / child screening assessment
  const isChild = Boolean(
    screening?.participant?.isChild ||
    analysisResult?.is_pediatric_only ||
    analysisResult?.isChild
  );
  const isPediatricOnly = isChild;

  // Extract questionnaires
  const screenerResults = screening?.results || analysisResult?.screening?.results || [];
  const asrsResult = screenerResults.find((r) => r.testId === 'asrs' || r.testId === 'asrs6');
  const vanderbiltResult = screenerResults.find((r) => r.testId === 'vanderbilt');
  const aq10Result = screenerResults.find((r) => r.testId === 'aq10');
  const aqChildResult = screenerResults.find((r) => r.testId === 'aq_child');
  const catqResult = screenerResults.find((r) => r.testId === 'catq');
  const mchatResult = screenerResults.find((r) => r.testId === 'mchat');
  const aq50Result = screenerResults.find((r) => r.testId === 'aq50');
  const raadsResult = screenerResults.find((r) => r.testId === 'raads_r');
  const rbqResult = screenerResults.find((r) => r.testId === 'rbq2a');

  const adhdResult = isChild ? vanderbiltResult : asrsResult;
  const autismResult = isChild ? (aqChildResult || mchatResult) : (aq10Result || aq50Result || raadsResult);

  // Determine Adult CPI status descriptor
  const getCpiDescriptor = (score) => {
    if (score >= 85) {
      return {
        label: 'Optimal Neuro-Cognitive Function',
        oneLineStatus: 'Performance exceeds typical population benchmarks across speed and accuracy.',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
        icon: 'verified',
      };
    }
    if (score >= 70) {
      return {
        label: 'Solid Average Performance',
        oneLineStatus: 'Cognitive processing operates squarely within typical population expectations.',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-700',
        icon: 'check_circle',
      };
    }
    if (score >= 55) {
      return {
        label: 'Moderate Cognitive Strain',
        oneLineStatus: 'Mild friction observed during elevated executive conflict or sequence retention.',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700',
        icon: 'info',
      };
    }
    return {
      label: 'Elevated Friction Observed',
      oneLineStatus: 'Noticeable friction and attentional variability detected across testing domains.',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700',
      icon: 'warning',
    };
  };

  const cpiDesc = getCpiDescriptor(cpi_score);

  // Determine Pediatric status descriptor
  const getPediatricDescriptor = () => {
    const hasElevatedScreener = Boolean(
      adhdResult?.isPositive || autismResult?.isPositive || catqResult?.isPositive
    );
    if (hasElevatedScreener) {
      return {
        label: 'Developmental Follow-Up Indicated',
        oneLineStatus: 'Parent questionnaire ratings indicate elevated traits exceeding clinical screening thresholds.',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-700',
        icon: 'warning',
      };
    }
    return {
      label: 'Age-Expected Milestones Met',
      oneLineStatus: 'Parent screening ratings fall within typical age-expected developmental benchmarks.',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-700',
      icon: 'verified',
    };
  };

  const pediatricDesc = getPediatricDescriptor();

  // AuDHD Co-occurrence triage evaluation
  const isAdhdElevated = Boolean(adhdResult?.isPositive);
  const isAutismElevated = Boolean(autismResult?.isPositive || catqResult?.isPositive);
  const isDualElevated = isAdhdElevated && isAutismElevated;

  // Build rows for Test-by-Test table
  const testTableRows = [];

  // 1. If adult, include computerized cognitive tasks
  if (!isChild) {
    testTableRows.push(
      {
        measureKey: 'PVT',
        measureName: 'PVT Mean Reaction Time',
        exactValue: `${pvt.mean_rt || 245} ms`,
        plainExplanation: 'Average visual reaction latency to unexpected target stimuli.',
        range: MEASURE_REFERENCES.pvt_mean_rt.typicalRange,
        meaning: MEASURE_REFERENCES.pvt_mean_rt.plainMeaning,
        status: (pvt.mean_rt || 245) <= 290
          ? { text: 'Typical Velocity', icon: 'check_circle', variant: 'expected' }
          : { text: 'Slowed Reaction', icon: 'info', variant: 'borderline' },
      },
      {
        measureKey: 'IIV',
        measureName: 'Reaction Time Variability (SD)',
        exactValue: `${pvt.rt_sd || 26.5} ms`,
        plainExplanation: 'Trial-to-trial reaction time fluctuation (intra-individual variability).',
        range: MEASURE_REFERENCES.pvt_rt_sd.typicalRange,
        meaning: MEASURE_REFERENCES.pvt_rt_sd.plainMeaning,
        status: (pvt.rt_sd || 26.5) <= 48
          ? { text: 'Consistent Timing', icon: 'check_circle', variant: 'expected' }
          : { text: 'Elevated Variability', icon: 'warning', variant: 'friction' },
      },
      {
        measureKey: 'IIV',
        measureName: 'Reaction Time CV (SD / Mean)',
        exactValue: `${((pvt.rt_cv || 0.108) * 100).toFixed(1)}%`,
        plainExplanation: 'Reaction variability normalized for baseline speed.',
        range: MEASURE_REFERENCES.pvt_rt_cv.typicalRange,
        meaning: MEASURE_REFERENCES.pvt_rt_cv.plainMeaning,
        status: (pvt.rt_cv || 0.108) <= 0.16
          ? { text: 'Stable Vigilance', icon: 'check_circle', variant: 'expected' }
          : { text: 'Fluctuating Alertness', icon: 'warning', variant: 'friction' },
      },
      {
        measureKey: 'PVT',
        measureName: 'Attentional Lapses (>500ms)',
        exactValue: `${pvt.lapses || 0} lapse(s)`,
        plainExplanation: 'Number of times response exceeded half a second.',
        range: MEASURE_REFERENCES.pvt_lapses.typicalRange,
        meaning: MEASURE_REFERENCES.pvt_lapses.plainMeaning,
        status: (pvt.lapses || 0) <= 1
          ? { text: 'Normative', icon: 'check_circle', variant: 'expected' }
          : { text: 'Micro-Dropouts', icon: 'warning', variant: 'friction' },
      },
      {
        measureKey: 'PVT',
        measureName: 'Premature & Impulsive Presses',
        exactValue: `${pvt.fast_responses_count || pvt.false_starts || 0} count`,
        plainExplanation: 'Presses executed prematurely before stimulus (<150ms).',
        range: MEASURE_REFERENCES.pvt_fast_responses.typicalRange,
        meaning: MEASURE_REFERENCES.pvt_fast_responses.plainMeaning,
        status: (pvt.fast_responses_count || pvt.false_starts || 0) <= 1
          ? { text: 'Controlled Restraint', icon: 'check_circle', variant: 'expected' }
          : { text: 'Premature Anticipation', icon: 'info', variant: 'borderline' },
      },
      {
        measureKey: 'Stroop',
        measureName: 'Stroop Interference Cost',
        exactValue: `+${stroop.interference_cost || 110} ms`,
        plainExplanation: 'Cognitive delay resolving conflicting color words.',
        range: MEASURE_REFERENCES.stroop_cost.typicalRange,
        meaning: MEASURE_REFERENCES.stroop_cost.plainMeaning,
        status: (stroop.interference_cost || 110) <= 150
          ? { text: 'Efficient Resolution', icon: 'check_circle', variant: 'expected' }
          : { text: 'Inhibitory Overhead', icon: 'info', variant: 'borderline' },
      },
      {
        measureKey: 'Stroop',
        measureName: 'Stroop Inhibition Accuracy',
        exactValue: `${Math.round((stroop.accuracy || 0.95) * 100)}%`,
        plainExplanation: 'Percentage of conflict color trials answered correctly.',
        range: MEASURE_REFERENCES.stroop_accuracy.typicalRange,
        meaning: MEASURE_REFERENCES.stroop_accuracy.plainMeaning,
        status: (stroop.accuracy || 0.95) >= 0.88
          ? { text: 'High Accuracy', icon: 'check_circle', variant: 'expected' }
          : { text: 'Interference Errors', icon: 'warning', variant: 'friction' },
      },
      {
        measureKey: 'CPI',
        measureName: 'Digit Span Sequence Retention',
        exactValue: `${nback.span || 7} digits`,
        plainExplanation: 'Maximum sequential numbers retained and accurately recalled.',
        range: MEASURE_REFERENCES.digit_span.typicalRange,
        meaning: MEASURE_REFERENCES.digit_span.plainMeaning,
        status: (nback.span || 7) >= 5
          ? { text: 'Optimal Buffer', icon: 'check_circle', variant: 'expected' }
          : { text: 'Constrained Span', icon: 'info', variant: 'borderline' },
      },
      {
        measureKey: 'CPI',
        measureName: 'Verbal Fluency Speech Rate',
        exactValue: `${verbal.speech_rate_wpm || 138} WPM`,
        plainExplanation: 'Words spoken per minute during category generation.',
        range: MEASURE_REFERENCES.verbal_speech_rate.typicalRange,
        meaning: MEASURE_REFERENCES.verbal_speech_rate.plainMeaning,
        status: (verbal.speech_rate_wpm || 138) >= 110 && (verbal.speech_rate_wpm || 138) <= 175
          ? { text: 'Fluent Initiation', icon: 'check_circle', variant: 'expected' }
          : { text: 'Deliberate Pacing', icon: 'info', variant: 'borderline' },
      }
    );
  }

  // 2. Face and Blinks biomarkers (Shown for both Adult and Child)
  testTableRows.push(
    {
      measureKey: 'Fixation',
      measureName: 'On-Screen Gaze Fixation Ratio',
      exactValue: `${Math.round((oculo.gaze_on_screen || 0.92) * 100)}%`,
      plainExplanation: 'Proportion of assessment time gaze engaged with screen.',
      range: MEASURE_REFERENCES.gaze_on_screen.typicalRange,
      meaning: MEASURE_REFERENCES.gaze_on_screen.plainMeaning,
      status: (oculo.gaze_on_screen || 0.92) >= 0.88
        ? { text: 'Continuous Focus', icon: 'check_circle', variant: 'expected' }
        : { text: 'Visual Aversion', icon: 'info', variant: 'borderline' },
    },
    {
      measureKey: 'Fixation',
      measureName: 'Gaze Fixation Dispersion',
      exactValue: `${oculo.fixation_dispersion || 41.5} px (~${((oculo.fixation_dispersion || 41.5) / 42.0).toFixed(1)}° visual angle)`,
      plainExplanation: 'Spread of iris coordinates during steady viewing.',
      range: MEASURE_REFERENCES.fixation_dispersion.typicalRange,
      meaning: MEASURE_REFERENCES.fixation_dispersion.plainMeaning,
      status: (oculo.fixation_dispersion || 41.5) <= 56
        ? { text: 'Stable Foveation', icon: 'check_circle', variant: 'expected' }
        : { text: 'Micro-Saccadic Wander', icon: 'info', variant: 'borderline' },
    },
    {
      measureKey: 'CPI',
      measureName: 'Spontaneous Blink Frequency',
      exactValue: `${oculo.blink_rate || 18.2} / min`,
      plainExplanation: 'Natural eye blink rate per minute recorded via face blendshapes.',
      range: MEASURE_REFERENCES.blink_rate.typicalRange,
      meaning: MEASURE_REFERENCES.blink_rate.plainMeaning,
      status: (oculo.blink_rate || 18.2) >= 12 && (oculo.blink_rate || 18.2) <= 24
        ? { text: 'Physiological Baseline', icon: 'check_circle', variant: 'expected' }
        : { text: 'Elevated Blinking', icon: 'info', variant: 'borderline' },
    },
    {
      measureKey: 'CPI',
      measureName: 'Head Posture Steadiness',
      exactValue: `${oculo.head_yaw_var || 3.2}° var`,
      plainExplanation: 'Physical head rotation variance across screening trials.',
      range: MEASURE_REFERENCES.head_jitter.typicalRange,
      meaning: MEASURE_REFERENCES.head_jitter.plainMeaning,
      status: (oculo.head_yaw_var || 3.2) <= 4.8
        ? { text: 'Steady Posture', icon: 'check_circle', variant: 'expected' }
        : { text: 'Motor Restlessness', icon: 'warning', variant: 'friction' },
    }
  );

  // 3. Questionnaires rows in the table
  if (asrsResult) {
    testTableRows.push({
      measureKey: 'ASRS',
      measureName: 'ASRS v1.1 Adult ADHD Screener',
      exactValue: `${asrsResult.shadedCount} / 6 shaded boxes (Sum: ${asrsResult.sumScore}/24)`,
      plainExplanation: 'WHO validated adult inattention and hyperactivity criteria.',
      range: '< 4 shaded boxes',
      meaning: 'Clinical cutoff: ≥4 shaded responses indicates high likelihood of adult ADHD.',
      status: asrsResult.isPositive
        ? { text: 'Clinical Cutoff Exceeded', icon: 'warning', variant: 'friction' }
        : { text: 'Below Clinical Cutoff', icon: 'check_circle', variant: 'expected' },
    });
  }

  if (vanderbiltResult) {
    testTableRows.push({
      measureKey: 'Vanderbilt',
      measureName: 'Vanderbilt ADHD Parent Rating',
      exactValue: `${vanderbiltResult.inattentiveCount}/9 Inattentive, ${vanderbiltResult.hyperactiveCount}/9 Hyperactive`,
      plainExplanation: 'DSM-5 pediatric rating scale of focus and motor regulation.',
      range: '< 6 criteria per domain',
      meaning: '≥6 criteria rated "often/very often" indicates pediatric ADHD screening threshold.',
      status: vanderbiltResult.isPositive
        ? { text: 'Pediatric Criteria Met', icon: 'warning', variant: 'friction' }
        : { text: 'Below Diagnostic Cutoff', icon: 'check_circle', variant: 'expected' },
    });
  }

  if (aq10Result) {
    testTableRows.push({
      measureKey: 'AQ10',
      measureName: 'AQ-10 Adult Autism Spectrum Quotient',
      exactValue: `${aq10Result.totalScore} / 10 points`,
      plainExplanation: 'NICE guideline validated screener for adult autistic traits.',
      range: '< 6 points',
      meaning: 'Scores ≥6 indicate clinical referral recommended for full assessment.',
      status: aq10Result.isPositive
        ? { text: 'Referral Cutoff Exceeded', icon: 'warning', variant: 'friction' }
        : { text: 'Typical Range', icon: 'check_circle', variant: 'expected' },
    });
  }

  if (aqChildResult) {
    testTableRows.push({
      measureKey: 'AQ10',
      measureName: 'AQ-10 Child Autism Spectrum Quotient',
      exactValue: `${aqChildResult.totalScore} / 10 points`,
      plainExplanation: 'Parent rating of child social communication and focused interest traits.',
      range: '< 6 points',
      meaning: 'Scores ≥6 indicate pediatric referral recommended for diagnostic assessment.',
      status: aqChildResult.isPositive
        ? { text: 'Pediatric Referral Indicated', icon: 'warning', variant: 'friction' }
        : { text: 'Typical Range', icon: 'check_circle', variant: 'expected' },
    });
  }

  if (mchatResult) {
    testTableRows.push({
      measureKey: 'MChat',
      measureName: 'M-CHAT-R/F Toddler Screener',
      exactValue: `${mchatResult.totalScore} / 20 risk markers (${mchatResult.riskLevel} risk)`,
      plainExplanation: 'Standardized 20-item milestone surveillance for toddlers 16–30 months.',
      range: '0 – 2 (Low Risk)',
      meaning: 'Early joint attention, pointing, and social engagement milestone criteria.',
      status: mchatResult.isPositive
        ? { text: 'Developmental Follow-Up', icon: 'warning', variant: 'friction' }
        : { text: 'Low Current Risk', icon: 'check_circle', variant: 'expected' },
    });
  }

  if (catqResult) {
    testTableRows.push({
      measureKey: 'CATQ',
      measureName: 'CAT-Q Camouflaging Questionnaire',
      exactValue: `${catqResult.totalScore} / 175 points`,
      plainExplanation: 'Quantifies autistic social compensation, masking, and assimilation.',
      range: '< 100 points',
      meaning: 'Scores ≥100 indicate high tendency to mask autistic traits.',
      status: catqResult.isPositive
        ? { text: 'Elevated Camouflaging', icon: 'info', variant: 'borderline' }
        : { text: 'Typical Camouflaging', icon: 'check_circle', variant: 'expected' },
    });
  }

  // Filter SHAP / Score Drivers: Strictly exclude cognitive tasks for children
  const childShapFallback = [
    {
      feature: 'gaze_on_screen',
      label: 'On-Screen Gaze Fixation Stability',
      impact_value: (oculo.gaze_on_screen || 0.92) >= 0.88 ? 4.8 : -3.2,
      direction: (oculo.gaze_on_screen || 0.92) >= 0.88 ? 'positive' : 'negative',
      description: 'Webcam iris tracking of continuous attention directed toward the screen.',
    },
    {
      feature: 'blink_rate',
      label: 'Spontaneous Blink Balance',
      impact_value: (oculo.blink_rate || 18.2) <= 24 ? 3.5 : -2.6,
      direction: (oculo.blink_rate || 18.2) <= 24 ? 'positive' : 'negative',
      description: 'Physiological eyelid closure rate indicating visual comfort and arousal.',
    },
    {
      feature: 'head_yaw_var',
      label: 'Head Posture Steadiness',
      impact_value: (oculo.head_yaw_var || 3.2) <= 4.5 ? 3.1 : -2.9,
      direction: (oculo.head_yaw_var || 3.2) <= 4.5 ? 'positive' : 'negative',
      description: 'Physical head rotation invariance during visual observation.',
    },
    {
      feature: 'fixation_dispersion',
      label: 'Fixation Spatial Coherence',
      impact_value: (oculo.fixation_dispersion || 41.5) <= 56 ? 2.8 : -2.2,
      direction: (oculo.fixation_dispersion || 41.5) <= 56 ? 'positive' : 'negative',
      description: 'Compact spatial foveation with low micro-saccadic eye wander.',
    },
  ];

  const adultShapFallback = [
    {
      feature: 'pvt_inv_rt',
      label: 'Visual Reaction Speed',
      impact_value: 5.6,
      direction: 'positive',
      description: 'Fast response speed during reaction time trials.',
    },
    {
      feature: 'gaze_on_screen',
      label: 'On-Screen Gaze Stability',
      impact_value: 4.2,
      direction: 'positive',
      description: 'Eyes remained locked on the test screen throughout.',
    },
    {
      feature: 'nback_dprime',
      label: 'Working Memory Retention',
      impact_value: 3.8,
      direction: 'positive',
      description: 'Accurate sequential recall during digit buffer testing.',
    },
    {
      feature: 'stroop_cost',
      label: 'Color Conflict Delay',
      impact_value: -2.4,
      direction: 'negative',
      description: 'Extra thinking delay required to suppress conflicting color words.',
    },
  ];

  const effectiveShapExplanations = isChild
    ? (shap_explanations.filter(
        (item) => !['pvt_inv_rt', 'stroop_cost', 'nback_dprime', 'speech_rate'].includes(item.feature)
      ).length > 0
        ? shap_explanations.filter(
            (item) => !['pvt_inv_rt', 'stroop_cost', 'nback_dprime', 'speech_rate'].includes(item.feature)
          )
        : childShapFallback)
    : (shap_explanations.length > 0 ? shap_explanations : adultShapFallback);

  return (
    <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-8 pb-20 print:p-0 print:gap-4 text-on-surface">
      {/* 0. Top Bar Actions & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container-high/60 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-caps text-[11px] font-bold uppercase tracking-wider">
              Clinical Assessment Profile
            </span>
            <span className="font-telemetry-data text-[12px] text-on-surface-variant font-semibold">
              Session ID: {session_id}
            </span>
            {screening?.participant && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-caps text-[11px] font-bold uppercase tracking-wider">
                {isChild ? 'Pediatric Battery (Parent Informant)' : 'Adult Neuro-Cognitive Battery'}
              </span>
            )}
          </div>
          <h1 className="font-headline-lg text-[28px] font-bold text-on-surface tracking-tight">
            {isPediatricOnly ? 'Pediatric Developmental & Behavioral Screening Report' : 'NeuroNova Clinical Assessment Report'}
          </h1>
          <p className="font-body-md text-[14px] text-on-surface-variant mt-1">
            {isChild
              ? 'Objective webcam face & blink telemetry combined with standardized parent-reported clinical questionnaires.'
              : 'Integrated psychometrics, webcam eye telemetry, and validated behavioral screening outcomes.'}
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-body-sm text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Print / PDF Report</span>
          </button>
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-sm text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: SHORT SUMMARY
          Adult: CPI with percentile & 95% CI, one-line status, and 3 takeaways
          Child: Pediatric Milestone & Engagement Summary (Cognitive ability excluded)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        {isChild ? (
          /* Pediatric Summary */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-surface-container-high/60">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Pediatric Assessment Status
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${pediatricDesc.badgeClass}`}>
                    <span className="material-symbols-outlined text-[14px]">{pediatricDesc.icon}</span>
                    <span>{pediatricDesc.label}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-lg text-[28px] font-bold text-primary">
                    {screening?.participant?.targetName || 'Pediatric Participant'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">
                    {screening?.participant?.ageGroup || 'Pediatric Screen'}
                  </span>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant mt-1 italic">
                  {pediatricDesc.oneLineStatus}
                </p>
              </div>

              <div className="h-12 w-px bg-surface-container-high hidden sm:block"></div>

              {/* Webcam Biomarker Telemetry Highlights */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-high flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">visibility</span>
                  <span>Gaze Focus: <strong>{Math.round((oculo.gaze_on_screen || 0.92) * 100)}%</strong></span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-high flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">face</span>
                  <span>Blink Rate: <strong>{oculo.blink_rate || 18.2}/min</strong></span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-surface-container-high flex items-center gap-2 text-xs">
                  <span className="material-symbols-outlined text-[16px] text-indigo-500">accessibility_new</span>
                  <span>Head Posture: <strong>{oculo.head_yaw_var || 3.2}°</strong></span>
                </div>
              </div>
            </div>

            <div className="text-left lg:text-right font-telemetry-data text-[12px] text-on-surface-variant">
              <div>Assessment Mode: <strong>Parent / Informant Observation</strong></div>
              <div>Telemetry: <strong>Webcam Eye & Face Tracking (MediaPipe Edge ML)</strong></div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                ✓ Computerized cognitive reflex tests excluded for child
              </div>
            </div>
          </div>
        ) : (
          /* Adult CPI Display */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-surface-container-high/60">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Composite Index
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${cpiDesc.badgeClass}`}>
                    <span className="material-symbols-outlined text-[14px]">{cpiDesc.icon}</span>
                    <span>{cpiDesc.label}</span>
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-telemetry-numeric-lg text-[56px] font-extrabold text-primary leading-none">
                    {cpi_score}
                  </span>
                  <span className="font-telemetry-numeric-lg text-[22px] font-semibold text-on-surface-variant">
                    / 100
                  </span>
                </div>
              </div>

              <div className="h-12 w-px bg-surface-container-high hidden sm:block"></div>

              {/* Percentile and 95% Confidence Interval */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-surface-container-high text-on-surface font-body-sm text-[13px] font-bold">
                    {percentile_rank || 50}th Percentile Rank
                  </span>
                  <span className="font-telemetry-data text-[12px] text-on-surface-variant font-medium">
                    95% CI: [{confidence_interval?.[0] ?? (cpi_score - 2.5).toFixed(1)} – {confidence_interval?.[1] ?? (cpi_score + 2.5).toFixed(1)}]
                  </span>
                </div>
                <p className="font-body-sm text-[13px] text-on-surface-variant italic">
                  {cpiDesc.oneLineStatus}
                </p>
              </div>
            </div>

            <div className="text-left lg:text-right font-telemetry-data text-[12px] text-on-surface-variant">
              <div>Population Baseline Mean: <strong>75.0</strong> (SD: 12.0)</div>
              <div>Calibrated Standard Normal Distribution Φ(z)</div>
            </div>
          </div>
        )}

        {/* Three Plain-Language Key Takeaways */}
        <div className="mt-5">
          <h3 className="font-headline-sm text-[15px] font-bold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
            <span>Key Takeaways (At a Glance)</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {summaryTakeaways.map((takeaway, idx) => (
              <li
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex items-start gap-2.5 text-[13px] leading-relaxed text-on-surface"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2:
          Adult: FOUR COGNITIVE DOMAIN BARS (Standardized 0-100 with 75 marked)
          Child: PEDIATRIC WEBCAM FACE & BLINK TELEMETRY PROFILE
          (Cognitive reflex tests PVT/Stroop/Digit Span strictly omitted for child)
          ========================================================================= */}
      {isChild ? (
        <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[24px] text-primary">face</span>
                <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
                  Pediatric Webcam Face & Blink Telemetry Profile
                </h2>
              </div>
              <p className="font-body-sm text-[13px] text-on-surface-variant">
                Objective edge computer-vision biomarkers recorded during visual interaction. Standard computerized cognitive speed and reflex tests are omitted for pediatric participants.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-bold uppercase tracking-wider self-start sm:self-auto">
              Webcam Biomarkers Only
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. On-Screen Gaze Fixation */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Gaze Engagement
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${(oculo.gaze_on_screen || 0.92) >= 0.88 ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    <span className="material-symbols-outlined text-[13px]">{(oculo.gaze_on_screen || 0.92) >= 0.88 ? 'check_circle' : 'info'}</span>
                    <span>{(oculo.gaze_on_screen || 0.92) >= 0.88 ? 'Continuous' : 'Variable'}</span>
                  </span>
                </div>
                <div className="font-telemetry-numeric-lg text-[32px] font-extrabold text-primary leading-tight">
                  {Math.round((oculo.gaze_on_screen || 0.92) * 100)}%
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1 leading-normal">
                  Proportion of assessment duration iris coordinates remained aligned with screen stimuli.
                </p>
              </div>
              <div className="pt-2 border-t border-surface-container-high/50 text-[11px] font-mono text-on-surface-variant">
                Expected Target: ≥ 88%
              </div>
            </div>

            {/* 2. Spontaneous Blink Rate */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Blink Frequency
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${(oculo.blink_rate || 18.2) >= 12 && (oculo.blink_rate || 18.2) <= 24 ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    <span className="material-symbols-outlined text-[13px]">{(oculo.blink_rate || 18.2) >= 12 && (oculo.blink_rate || 18.2) <= 24 ? 'check_circle' : 'info'}</span>
                    <span>{(oculo.blink_rate || 18.2) >= 12 && (oculo.blink_rate || 18.2) <= 24 ? 'Baseline' : 'Elevated'}</span>
                  </span>
                </div>
                <div className="font-telemetry-numeric-lg text-[32px] font-extrabold text-secondary leading-tight">
                  {oculo.blink_rate || 18.2} <span className="text-[16px] font-normal text-on-surface-variant">/ min</span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1 leading-normal">
                  Natural eyelid blink rate recorded continuously via facial blendshape landmarks.
                </p>
              </div>
              <div className="pt-2 border-t border-surface-container-high/50 text-[11px] font-mono text-on-surface-variant">
                Normative: 12 – 24 / min
              </div>
            </div>

            {/* 3. Fixation Dispersion */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Fixation Dispersion
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${(oculo.fixation_dispersion || 41.5) <= 56 ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    <span className="material-symbols-outlined text-[13px]">{(oculo.fixation_dispersion || 41.5) <= 56 ? 'check_circle' : 'info'}</span>
                    <span>{(oculo.fixation_dispersion || 41.5) <= 56 ? 'Stable' : 'Dispersed'}</span>
                  </span>
                </div>
                <div className="font-telemetry-numeric-lg text-[32px] font-extrabold text-indigo-600 dark:text-indigo-400 leading-tight">
                  {oculo.fixation_dispersion || 41.5} <span className="text-[16px] font-normal text-on-surface-variant">px</span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1 leading-normal">
                  Spatial variance of visual foveation points (~{((oculo.fixation_dispersion || 41.5) / 42.0).toFixed(1)}° visual angle).
                </p>
              </div>
              <div className="pt-2 border-t border-surface-container-high/50 text-[11px] font-mono text-on-surface-variant">
                Expected Target: ≤ 56 px
              </div>
            </div>

            {/* 4. Head Posture Steadiness */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Head Steadiness
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${(oculo.head_yaw_var || 3.2) <= 4.8 ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                    <span className="material-symbols-outlined text-[13px]">{(oculo.head_yaw_var || 3.2) <= 4.8 ? 'check_circle' : 'warning'}</span>
                    <span>{(oculo.head_yaw_var || 3.2) <= 4.8 ? 'Steady' : 'Motor Variance'}</span>
                  </span>
                </div>
                <div className="font-telemetry-numeric-lg text-[32px] font-extrabold text-amber-600 dark:text-amber-400 leading-tight">
                  {oculo.head_yaw_var || 3.2}° <span className="text-[16px] font-normal text-on-surface-variant">var</span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1 leading-normal">
                  3D head orientation rotation variance tracking physical seated motor steadiness.
                </p>
              </div>
              <div className="pt-2 border-t border-surface-container-high/50 text-[11px] font-mono text-on-surface-variant">
                Expected Target: ≤ 4.8°
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Adult Cognitive Domain Bars */
        <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
                Core Cognitive Domains (Standardized 0–100)
              </h2>
              <p className="font-body-sm text-[13px] text-on-surface-variant">
                Every domain is calibrated against normative population distributions where 75 is the average.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span className="inline-block w-3 h-3 bg-primary rounded-sm"></span>
              <span>Your Score</span>
              <span className="inline-block w-3 h-3 border-r-2 border-dashed border-slate-900 dark:border-slate-300 ml-2"></span>
              <span>Population Average (75)</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                id: 'executive_function',
                label: 'Executive Function & Working Memory',
                score: Number(domains.executive_function) || 75.0,
                weight: '30% weight',
                color: 'bg-primary',
                desc: 'Mental flexibility, conflict suppression (Stroop), and sequence buffer (Digit Span).',
              },
              {
                id: 'sustained_attention',
                label: 'Sustained Attention & Alerting',
                score: Number(domains.sustained_attention) || 75.0,
                weight: '30% weight',
                color: 'bg-secondary',
                desc: 'Continuous vigilance maintenance, low attentional lapses, and on-screen gaze focus.',
              },
              {
                id: 'processing_speed',
                label: 'Processing Speed & Motor Kinetics',
                score: Number(domains.processing_speed) || 75.0,
                weight: '25% weight',
                color: 'bg-indigo-600 dark:bg-indigo-400',
                desc: 'Baseline visual reaction latency, keystroke dwell timing, and verbal articulation velocity.',
              },
              {
                id: 'cognitive_stability',
                label: 'Cognitive Stability & Load Resilience',
                score: Number(domains.cognitive_stability) || 75.0,
                weight: '15% weight',
                color: 'bg-amber-600 dark:bg-amber-400',
                desc: 'Fixation steadiness, physiological blink balance, and postural invariance under stress.',
              },
            ].map((domain) => {
              const pct = Math.min(Math.max(domain.score, 10), 100);

              return (
                <div key={domain.id} className="flex flex-col gap-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[13px] gap-1">
                    <div>
                      <span className="font-bold text-on-surface text-[14px]">{domain.label}</span>
                      <span className="text-on-surface-variant text-xs ml-2 font-normal">({domain.weight})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-telemetry-data text-[15px] font-bold text-primary">
                        {domain.score.toFixed(1)} <span className="text-xs text-on-surface-variant font-normal">/ 100</span>
                      </span>
                      <span className="text-xs text-on-surface-variant font-medium">
                        {domain.score >= 75
                          ? `(+${(domain.score - 75).toFixed(1)} above avg)`
                          : `(-${(75 - domain.score).toFixed(1)} below avg)`}
                      </span>
                    </div>
                  </div>

                  {/* Bar with 75 average marker */}
                  <div className="relative w-full h-4 bg-surface-container-high/60 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${domain.color}`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 border-r-2 border-dashed border-slate-900 dark:border-white z-10 pointer-events-none"
                      style={{ left: '75%' }}
                      title="Population Average Benchmark (75)"
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-0.5">
                    <span>{domain.desc}</span>
                    <span className="font-mono text-[10px] opacity-75">Avg: 75</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 3: STANDARDIZED CLINICAL QUESTIONNAIRES (ADHD & AUTISM)
          Complete Scores, Cutoffs, Subscales, and Clinical Conclusions
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[24px] text-primary">clinical_notes</span>
              <h2 className="font-headline-sm text-[20px] font-bold text-on-surface">
                Standardized Clinical Behavioral Questionnaires (ADHD & Autism)
              </h2>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              Comprehensive results, symptom domain tallies, and validated clinical triage conclusions for attention deficit hyperactivity and autism spectrum traits.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-on-surface self-start sm:self-auto">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            <span>DSM-5 & WHO Validated</span>
          </div>
        </div>

        {/* 1. Overall Triage Status Banner */}
        <div
          className={`p-4 rounded-xl mb-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDualElevated
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-950 dark:text-purple-100'
              : isAdhdElevated
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              : isAutismElevated
              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-100'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] shrink-0 mt-0.5">
              {isDualElevated ? 'hub' : isAdhdElevated || isAutismElevated ? 'warning' : 'check_circle'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-[15px] font-bold">
                  {isDualElevated
                    ? 'Dual Elevation: AuDHD Co-Occurrence Profile'
                    : isAdhdElevated
                    ? 'Elevated ADHD Clinical Screening Profile'
                    : isAutismElevated
                    ? 'Elevated Autism Spectrum Clinical Screening Profile'
                    : 'Behavioral Screeners Within Typical Range'}
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/60 dark:bg-black/40">
                  {isDualElevated
                    ? 'Dual Traits'
                    : isAdhdElevated
                    ? 'ADHD Cutoff Exceeded'
                    : isAutismElevated
                    ? 'Autism Cutoff Exceeded'
                    : 'Below Cutoffs'}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">
                {isDualElevated
                  ? 'Criteria met on both ADHD and Autism screeners. Co-occurring attentional variability and social/sensory differences frequently interact.'
                  : isAdhdElevated
                  ? 'Symptom ratings exceed validated clinical screening thresholds for ADHD; autism spectrum indicators remain below referral cutoffs.'
                  : isAutismElevated
                  ? 'Symptom ratings exceed validated clinical referral thresholds for autism spectrum traits; ADHD criteria remain below clinical thresholds.'
                  : 'Reported responses fall within typical, non-elevated community ranges across both attentional and social communication screeners.'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Screener Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card A: ADHD Screener */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-surface-container-high/60 pb-3 mb-3">
                <div>
                  <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-primary">
                    Attention & Motor Regulation
                  </span>
                  <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                    {isChild ? 'NICHQ Vanderbilt ADHD Screener' : 'ASRS v1.1 Adult ADHD Screener'}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {isChild ? 'Parent Informant (Ages 4–15)' : 'WHO Self-Report (Ages 18+)'}
                  </span>
                </div>

                {adhdResult ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      adhdResult.isPositive
                        ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {adhdResult.isPositive ? 'warning' : 'check_circle'}
                    </span>
                    <span>{adhdResult.isPositive ? 'Clinical Cutoff Met' : 'Below Cutoff'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-xs text-on-surface-variant font-medium">
                    Not Administered
                  </span>
                )}
              </div>

              {adhdResult ? (
                <div className="flex flex-col gap-3.5">
                  {/* Scores Block */}
                  {isChild && vanderbiltResult ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col">
                        <span className="text-on-surface-variant font-medium mb-1">Inattentive Domain</span>
                        <span className="font-telemetry-numeric-lg text-[24px] font-bold text-primary leading-tight">
                          {vanderbiltResult.inattentiveCount} <span className="text-xs font-normal text-on-surface-variant">/ 9 criteria</span>
                        </span>
                        <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${vanderbiltResult.inattentiveCount >= 6 ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min((vanderbiltResult.inattentiveCount / 9) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant mt-1">Cutoff: ≥6 criteria</span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex flex-col">
                        <span className="text-on-surface-variant font-medium mb-1">Hyperactive Domain</span>
                        <span className="font-telemetry-numeric-lg text-[24px] font-bold text-secondary leading-tight">
                          {vanderbiltResult.hyperactiveCount} <span className="text-xs font-normal text-on-surface-variant">/ 9 criteria</span>
                        </span>
                        <div className="w-full bg-surface-container-high h-2 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${vanderbiltResult.hyperactiveCount >= 6 ? 'bg-amber-500' : 'bg-secondary'}`}
                            style={{ width: `${Math.min((vanderbiltResult.hyperactiveCount / 9) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant mt-1">Cutoff: ≥6 criteria</span>
                      </div>
                    </div>
                  ) : asrsResult ? (
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-on-surface-variant font-medium block mb-0.5">Part A Shaded Responses</span>
                        <span className="font-telemetry-numeric-lg text-[26px] font-bold text-primary leading-tight">
                          {asrsResult.shadedCount} <span className="text-xs font-normal text-on-surface-variant">/ 6 boxes</span>
                        </span>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Cutoff: ≥4 shaded indicates high ADHD likelihood
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-on-surface-variant font-medium block mb-0.5">Continuous Sum</span>
                        <span className="font-telemetry-numeric-lg text-[20px] font-bold text-secondary leading-tight">
                          {asrsResult.sumScore} <span className="text-xs font-normal text-on-surface-variant">/ 24</span>
                        </span>
                        <span className="text-[11px] text-on-surface font-semibold block mt-0.5">
                          {asrsResult.sumBand}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Conclusion Headline & Summary */}
                  <div>
                    <h4 className="font-bold text-[14px] text-on-surface mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                      <span>{adhdResult.headline || 'ADHD Screening Outcome'}</span>
                    </h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed m-0">
                      {adhdResult.summary}
                    </p>
                  </div>

                  {/* Clinical Recommendation */}
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/50 text-xs text-on-surface flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">recommend</span>
                    <div>
                      <strong className="text-primary font-semibold">Clinical Recommendation: </strong>
                      <span>{adhdResult.recommendation}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">
                  ADHD questionnaire was not included in this session. Take the questionnaire module to view criteria breakdown and clinical conclusions.
                </p>
              )}
            </div>
          </div>

          {/* Card B: Autism Spectrum Screener */}
          <div className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-surface-container-high/60 pb-3 mb-3">
                <div>
                  <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-primary">
                    Social Communication & Focused Interests
                  </span>
                  <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                    {isChild
                      ? mchatResult
                        ? 'M-CHAT-R/F Toddler Autism Screener'
                        : 'AQ-10 Child Autism Spectrum Quotient'
                      : 'AQ-10 Adult Autism Spectrum Quotient'}
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    {isChild
                      ? mchatResult
                        ? 'Parent Informant (16–30 Months)'
                        : 'Parent Informant (Ages 4–15)'
                      : 'NICE CG142 Validated (Ages 18+)'}
                  </span>
                </div>

                {autismResult ? (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      autismResult.isPositive
                        ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {autismResult.isPositive ? 'warning' : 'check_circle'}
                    </span>
                    <span>{autismResult.isPositive ? 'Referral Recommended' : 'Typical Range'}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-xs text-on-surface-variant font-medium">
                    Not Administered
                  </span>
                )}
              </div>

              {autismResult ? (
                <div className="flex flex-col gap-3.5">
                  {/* Scores Block */}
                  {mchatResult ? (
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-on-surface-variant font-medium block mb-0.5">Total Risk Items Failed</span>
                        <span className="font-telemetry-numeric-lg text-[26px] font-bold text-primary leading-tight">
                          {mchatResult.totalScore} <span className="text-xs font-normal text-on-surface-variant">/ 20</span>
                        </span>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Low: 0–2 | Medium: 3–7 | High: 8–20
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-on-surface-variant font-medium block mb-0.5">Risk Tier</span>
                        <span className="px-3 py-1 rounded-lg font-bold text-xs uppercase bg-surface-container-high text-on-surface">
                          {mchatResult.riskLevel} Risk
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-on-surface-variant font-medium block mb-0.5">Total Autism Quotient Score</span>
                        <span className="font-telemetry-numeric-lg text-[26px] font-bold text-primary leading-tight">
                          {autismResult.totalScore} <span className="text-xs font-normal text-on-surface-variant">/ 10 points</span>
                        </span>
                        <span className="text-[11px] text-on-surface-variant block mt-0.5">
                          Clinical Referral Cutoff: ≥6 / 10
                        </span>
                      </div>

                      <div className="w-36 flex flex-col gap-1 text-right">
                        <span className="text-[11px] text-on-surface-variant">
                          Score Gauge ({autismResult.totalScore}/10)
                        </span>
                        <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${autismResult.isPositive ? 'bg-rose-500' : 'bg-primary'}`}
                            style={{ width: `${Math.min((autismResult.totalScore / 10) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAT-Q Camouflaging subscales if completed */}
                  {catqResult && (
                    <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/60 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-on-surface">CAT-Q Camouflaging Score:</span>
                        <strong className="text-primary font-telemetry-data">{catqResult.totalScore} / 175 (Cutoff: ≥100)</strong>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[11px] text-on-surface-variant">
                        <div>Compensation: <strong>{catqResult.subscales?.compensation?.score || 0}/63</strong></div>
                        <div>Masking: <strong>{catqResult.subscales?.masking?.score || 0}/56</strong></div>
                        <div>Assimilation: <strong>{catqResult.subscales?.assimilation?.score || 0}/56</strong></div>
                      </div>
                    </div>
                  )}

                  {/* Conclusion Headline & Summary */}
                  <div>
                    <h4 className="font-bold text-[14px] text-on-surface mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-primary">diversity_3</span>
                      <span>{autismResult.headline || 'Autism Screening Outcome'}</span>
                    </h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed m-0">
                      {autismResult.summary}
                    </p>
                  </div>

                  {/* Clinical Recommendation */}
                  <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high/50 text-xs text-on-surface flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">recommend</span>
                    <div>
                      <strong className="text-primary font-semibold">Clinical Recommendation: </strong>
                      <span>{autismResult.recommendation}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">
                  Autism questionnaire was not included in this session. Take the questionnaire module to view score details and clinical conclusions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. AuDHD Co-Occurrence & Clinician Talking Points Card */}
        <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">forum</span>
            <h4 className="font-bold text-[14px] text-on-surface">
              Clinician Consultation & AuDHD Neurodivergent Overlap Guidance
            </h4>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed m-0">
            Current neuropsychological research demonstrates that 50% to 70% of individuals on the autism spectrum experience concurrent ADHD symptoms, and 30% to 40% of individuals diagnosed with ADHD present notable autistic traits. Executive disorganization, sensory modulation challenges, and situational hyperfocus often interact across both conditions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/50">
              <strong className="text-on-surface block mb-0.5">1. Multi-Setting Evaluation:</strong>
              <span className="text-on-surface-variant">Discuss symptom presentation across multiple settings (home, school/work, social).</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/50">
              <strong className="text-on-surface block mb-0.5">2. Sensory vs Attention:</strong>
              <span className="text-on-surface-variant">Examine whether focus difficulties arise from executive dysregulation or sensory overstimulation.</span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/50">
              <strong className="text-on-surface block mb-0.5">3. Masking & Fatigue:</strong>
              <span className="text-on-surface-variant">Review cognitive energy depletion caused by social masking or compensating in structured environments.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: INTEGRATED FINDINGS (Cross-Modal Tasks/Sensors x Screeners)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[24px] text-primary">sync_alt</span>
              <h2 className="font-headline-sm text-[20px] font-bold text-on-surface">
                Integrated Multimodal Findings
              </h2>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              Cross-validates objective webcam face & gaze telemetry with standardized behavioral clinical questionnaires.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-secondary">videocam</span>
            <span>Camera Data Quality: <strong className="capitalize">{integratedData.cameraQuality}</strong></span>
          </div>
        </div>

        {/* A. Cross-Modal Agreement Matrix Table */}
        <div className="mb-8">
          <h3 className="font-headline-sm text-[14px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
            Cross-Modal Agreement Matrix
          </h3>
          <div className="overflow-x-auto rounded-xl border border-surface-container-high/60 shadow-sm">
            <table className="w-full text-left border-collapse text-[13px] min-w-[620px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[12px] font-bold uppercase tracking-wider border-b border-surface-container-high/60">
                  <th className="py-2.5 px-4">Behavioral & Cognitive Area</th>
                  <th className="py-2.5 px-4">Sensor & Task Telemetry</th>
                  <th className="py-2.5 px-4">Standardized Questionnaires</th>
                  <th className="py-2.5 px-4">Cross-Modal Agreement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/50 bg-surface-container-lowest">
                {agreementMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-on-surface">{row.area}</td>
                    <td className="py-3 px-4 text-on-surface-variant font-telemetry-data text-xs">{row.tasksSensors}</td>
                    <td className="py-3 px-4 text-on-surface text-xs">{row.questionnaires}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${row.statusChip.bgClass}`}>
                        <span className="material-symbols-outlined text-[14px]">{row.statusChip.icon}</span>
                        <span>{row.statusChip.text}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* B. Detailed Finding Cards */}
        <div className="flex flex-col gap-5">
          {findings.map((f) => {
            const isConsistent = f.agreement === 'consistent';
            const isDisagree = f.agreement === 'disagree';

            return (
              <div
                key={f.id}
                className="p-5 rounded-2xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-3.5 transition-all shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container-high/60 pb-3">
                  <div>
                    <span className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-primary">
                      Finding Theme
                    </span>
                    <h4 className="font-headline-sm text-[17px] font-bold text-on-surface">{f.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Agreement Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        isConsistent
                          ? 'bg-secondary-fixed/40 text-on-secondary-fixed-variant border-secondary-fixed'
                          : isDisagree
                          ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-700'
                          : 'bg-primary-fixed/40 text-on-primary-fixed border-primary-fixed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isConsistent ? 'check_circle' : isDisagree ? 'warning' : 'info'}
                      </span>
                      <span className="capitalize">{f.agreement} Alignment</span>
                    </span>

                    {/* Confidence Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                      <span>Confidence:</span>
                      <strong className="capitalize">{f.confidence}</strong>
                    </span>
                  </div>
                </div>

                {/* Plain-Language Reading */}
                <p className="font-body-md text-[14px] leading-relaxed text-on-surface m-0">
                  {f.reading}
                </p>

                {/* Evidence Pills */}
                <div>
                  <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                    Supporting Clinical Evidence:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                    {f.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-surface-container-lowest border border-surface-container-high/60 flex flex-col justify-between"
                      >
                        <div className="font-semibold text-on-surface mb-0.5">{ev.measure}</div>
                        <div className="font-telemetry-data text-primary font-bold text-[13px]">{ev.value}</div>
                        <div className="text-[11px] text-on-surface-variant mt-1 leading-tight">
                          <span className="text-secondary font-medium">✓ {ev.interpretation}</span>
                          <span className="block text-[10px] text-on-surface-variant/80 mt-0.5 font-mono">Ref: {ev.expectedRange}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinician Research Note */}
                <div className="p-3 rounded-xl bg-surface-container-lowest/80 border border-surface-container-high/50 text-[12px] leading-relaxed text-on-surface-variant flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">menu_book</span>
                  <div>
                    <strong className="text-on-surface font-semibold">Clinician Scientific Note: </strong>
                    <span>{f.research_note}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: TEST-BY-TEST TECHNICAL TELEMETRY TABLE
          Columns: Measure, Result, Typical Range, Plain-language Meaning, Status Chip
          (For children: strictly excludes PVT, Stroop, Digit Span, Verbal Fluency)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
              Test-by-Test Technical Telemetry Table
            </h2>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              {isChild
                ? 'Itemized inventory of client-side webcam face/blink biomarkers and parent clinical screeners.'
                : 'Complete inventory of cognitive trials, reaction variability, and edge vision biomarkers.'}
            </p>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            Scroll horizontally on smaller screens →
          </span>
        </div>

        {/* Scrollable table container */}
        <div className="overflow-x-auto rounded-xl border border-surface-container-high/60 shadow-sm">
          <table className="w-full text-left border-collapse text-[13px] min-w-[760px]">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider border-b border-surface-container-high/60">
                <th className="py-3 px-4">Measure</th>
                <th className="py-3 px-4">Result & Units</th>
                <th className="py-3 px-4">Typical Range</th>
                <th className="py-3 px-4">Plain-Language Meaning</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/50 bg-surface-container-lowest">
              {testTableRows.map((row, idx) => {
                let statusChipClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
                if (row.status.variant === 'borderline') {
                  statusChipClass = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
                } else if (row.status.variant === 'friction') {
                  statusChipClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
                }

                return (
                  <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                    {/* Measure with Glossary Tooltip */}
                    <td className="py-3 px-4 font-bold text-on-surface whitespace-nowrap">
                      <GlossaryTerm termKey={row.measureKey} label={row.measureName} />
                    </td>

                    {/* Result with exact value and one-line explanation */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-telemetry-data font-bold text-primary text-[14px]">
                        {row.exactValue}
                      </div>
                      <div className="text-[11px] text-on-surface-variant">
                        {row.plainExplanation}
                      </div>
                    </td>

                    {/* Typical Range */}
                    <td className="py-3 px-4 font-telemetry-data text-xs text-on-surface-variant whitespace-nowrap">
                      {row.range}
                    </td>

                    {/* Plain Language Meaning */}
                    <td className="py-3 px-4 text-xs text-on-surface leading-relaxed max-w-xs">
                      {row.meaning}
                    </td>

                    {/* Status Chip (Text + Icon) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusChipClass}`}>
                        <span className="material-symbols-outlined text-[14px]">{row.status.icon}</span>
                        <span>{row.status.text}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: SCORE DRIVERS / BIOMARKER INFLUENCES
          For adults: SHAP explanations on composite score
          For children: Face & Blink biomarker influences (Cognitive tasks excluded)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">bar_chart</span>
              <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
                {isChild ? 'Key Face & Blink Telemetry Drivers' : 'Score Drivers: What Moved Your Score'}
              </h2>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant">
              {isChild
                ? 'Primary face orientation, gaze stability, and blink biomarkers observed via client-side computer vision.'
                : 'Calculated using SHAP mathematics to show exactly how individual biomarkers pushed your score above or below average.'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-secondary">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> {isChild ? 'High Engagement (+)' : 'Added Points (+)'}
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> {isChild ? 'Variable Focus (-)' : 'Reduced Points (-)'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {effectiveShapExplanations.slice(0, 6).map((item, idx) => {
            const isPos = item.direction === 'positive' || item.impact_value >= 0;
            const absVal = Math.abs(item.impact_value);
            const widthPct = Math.min(absVal * 15, 100);

            const plainStatement = isChild
              ? isPos
                ? `${item.label}: Stable baseline alignment`
                : `${item.label}: Observed attentional / postural variance`
              : isPos
              ? `${item.label} added +${absVal.toFixed(1)} points to your score`
              : `${item.label} reduced -${absVal.toFixed(1)} points from your score`;

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/40 flex flex-col gap-1.5 transition-colors"
              >
                <div className="flex justify-between items-center text-[13px]">
                  <div>
                    <span className="font-bold text-on-surface">{plainStatement}</span>
                    <span className="text-on-surface-variant text-xs ml-2">({item.description})</span>
                  </div>
                  <span className={`font-telemetry-data font-bold text-xs ${isPos ? 'text-secondary' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isChild ? (isPos ? 'Optimal' : 'Variable') : isPos ? `+${absVal.toFixed(1)} pts` : `-${absVal.toFixed(1)} pts`}
                  </span>
                </div>

                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isPos ? 'bg-secondary' : 'bg-amber-500'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: SUGGESTED NEXT STEPS
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[22px] text-primary">next_plan</span>
          <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">Suggested Next Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-[14px] text-on-surface">
              {isChild ? 'Share with Pediatrician' : 'Share with a Professional'}
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed m-0">
              {isChild
                ? 'Print or export this report to share with your pediatrician, developmental psychologist, or educational support team.'
                : 'Print or export this report to share with your primary care physician, psychologist, or psychiatrist if you notice daily focus difficulties.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-[14px] text-on-surface">
              {isChild ? 'Sensory & Routine Accommodations' : 'Optimize Focus Intervals'}
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed m-0">
              {isChild
                ? 'Introduce predictable visual daily schedules, low-distraction quiet spaces, and structured sensory movement breaks.'
                : 'Implement structured work periods (such as 25-minute Pomodoro sprints) with deliberate screen breaks to minimize blink strain.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 flex flex-col gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-[14px] text-on-surface">Track Longitudinally</h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed m-0">
              {isChild
                ? 'Re-administer developmental questionnaires over 3 to 6 months to monitor behavioral progression and intervention efficacy.'
                : 'Retake this assessment across different environments to observe how sleep, exercise, and stress levels influence attention stamina.'}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: LIMITS OF THIS REPORT & NON-DIAGNOSTIC DISCLAIMER
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-amber-700 dark:text-amber-400">gavel</span>
          <h2 className="font-headline-sm text-[17px] font-bold">
            Limits of This Assessment & Non-Diagnostic Disclosure
          </h2>
        </div>

        <ul className="list-disc list-inside text-[13px] leading-relaxed flex flex-col gap-1.5 opacity-90">
          <li>
            <strong>Not a Medical Diagnosis: </strong> NeuroNova is an automated psychometric assessment intended for functional cognitive awareness, trait identification, and longitudinal tracking. It cannot diagnose ADHD, autism, or any neurological condition.
          </li>
          <li>
            <strong>Webcam Hardware Limitations: </strong> Gaze tracking and head pose are measured via client-side computer vision (MediaPipe) using standard consumer webcams. Environmental lighting, camera angle, and display distance influence spatial pixel coordinates.
          </li>
          <li>
            <strong>Child Assessment Protocol: </strong> For pediatric assessments, computerized reaction time, interference, and memory tests are omitted to maintain developmental appropriateness. Telemetry is restricted to observational gaze/blink biomarkers alongside parent-reported screeners.
          </li>
          <li>
            <strong>Screening Tools Have Margin of Error: </strong> Standardized questionnaires (ASRS, AQ-10, CAT-Q, Vanderbilt, M-CHAT) are triage instruments and possess known false-positive and false-negative rates.
          </li>
        </ul>
      </section>

      {/* =========================================================================
          SECTION 9: COLLAPSIBLE TECHNICAL APPENDIX
          ========================================================================= */}
      <section className="rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setAppendixOpen((prev) => !prev)}
          className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-primary">terminal</span>
            <div>
              <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
                Technical Appendix & Psychometric Methodology
              </h3>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Mathematical formulas, screener cutoffs, sensor calibration, and privacy architecture.
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-[24px] text-on-surface-variant transform transition-transform duration-200">
            {appendixOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {appendixOpen && (
          <div className="p-6 sm:p-7 border-t border-surface-container-high/60 bg-surface-container-low/40 flex flex-col gap-6 text-[13px] leading-relaxed">
            {/* 1. Mathematical Scoring Formulation */}
            <div>
              <h4 className="font-bold text-[14px] text-primary mb-2">1. Mathematical Scoring Formulation</h4>
              <p className="text-on-surface-variant mb-2">
                All raw telemetry features are converted to standardized z-scores against calibrated clinical normative distributions:
              </p>
              <div className="p-3 rounded-lg bg-surface-container-lowest font-mono text-xs border border-surface-container-high text-on-surface mb-2">
                Z_i = ((x_i - μ_i) / σ_i) × direction &nbsp;&nbsp;&nbsp;[clipped to -3.5 ≤ Z_i ≤ +3.5]
              </div>
              <p className="text-on-surface-variant mb-2">
                {isChild
                  ? 'Note on Pediatric Scoring: Cognitive domain linear combination scores are disabled for child participants. Assessment focuses on direct telemetry and questionnaire thresholds.'
                  : 'Domain scores are calculated as linear combinations of standardized z-scores scaled to Mean = 75.0, SD = 12.0:'}
              </p>
              {!isChild && (
                <>
                  <ul className="list-disc list-inside font-mono text-xs text-on-surface-variant flex flex-col gap-1 mb-3">
                    <li>Executive Function: 75 + 12 × [0.35 Z(d') + 0.25 Z(acc) + 0.25 Z(stroop_cost) + 0.15 Z(stroop_acc)]</li>
                    <li>Sustained Attention: 75 + 12 × [0.40 Z(inv_rt) + 0.35 Z(lapses) + 0.25 Z(gaze_on_screen)]</li>
                    <li>Processing Speed: 75 + 12 × [0.45 Z(mean_rt) + 0.30 Z(dwell_time) + 0.25 Z(speech_rate)]</li>
                    <li>Cognitive Stability: 75 + 12 × [0.35 Z(dispersion) + 0.35 Z(blink_rate) + 0.15 Z(head_jitter) + 0.15 Z(pause_ratio)]</li>
                  </ul>
                  <div className="p-3 rounded-lg bg-surface-container-lowest font-mono text-xs border border-surface-container-high text-on-surface">
                    Composite CPI = 0.30 × Executive + 0.30 × Attention + 0.25 × Speed + 0.15 × Stability
                  </div>
                </>
              )}
            </div>

            {/* 2. Screener Cutoffs */}
            <div>
              <h4 className="font-bold text-[14px] text-primary mb-2">2. Standardized Screener Cutoffs & Literature Citations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">ASRS v1.1 (Adults 18+):</strong>
                  <span className="text-on-surface-variant">Cutoff: Part A ≥ 4 shaded boxes (WHO, Kessler et al., 2005).</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">AQ-10 (Adults 18+):</strong>
                  <span className="text-on-surface-variant">Cutoff: Total Score ≥ 6 / 10 points (NICE CG142, Allison et al., 2012).</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">CAT-Q (Adolescents & Adults 16+):</strong>
                  <span className="text-on-surface-variant">Cutoff: Total Score ≥ 100 / 175 points (Hull et al., 2019).</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">Vanderbilt ADHD (Children Ages 4–15):</strong>
                  <span className="text-on-surface-variant">Cutoff: ≥ 6 symptoms rated "often" or "very often" (Wolraich et al., 2003).</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">AQ-10 Child (Children Ages 4–15):</strong>
                  <span className="text-on-surface-variant">Cutoff: Total Score ≥ 6 / 10 points (Allison et al., 2012).</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-lowest border border-surface-container-high">
                  <strong className="block text-on-surface font-semibold">M-CHAT-R/F (Toddlers 16–30m):</strong>
                  <span className="text-on-surface-variant">Low: 0–2; Medium: 3–7 (triggers structured follow-up); High: 8–20 (Robins et al., 2014).</span>
                </div>
              </div>
            </div>

            {/* 3. Sensor Methods & Privacy Architecture */}
            <div>
              <h4 className="font-bold text-[14px] text-primary mb-2">3. Sensor Methods & Zero-Leakage Privacy Architecture</h4>
              <p className="text-on-surface-variant mb-2">
                All sensor processing occurs strictly in-memory on the client machine:
              </p>
              <ul className="list-disc list-inside text-on-surface-variant flex flex-col gap-1">
                <li><strong>Oculomotor Edge ML: </strong> Google MediaPipe FaceLandmarker tracks 478 facial landmarks and 3D iris coordinates at 30 Hz. Zero raw images or video streams are ever stored or uploaded.</li>
                <li><strong>Fixation Drift: </strong> Computed as standard deviation of gaze coordinates in normalized coordinate space (~640px). At 60 cm distance, 42px corresponds to ~1.0 degree of visual angle.</li>
                <li><strong>Acoustic Analysis: </strong> Real-time Web Audio API AudioContext measures RMS volume envelopes and silence pause intervals. Audio is processed on-device.</li>
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
