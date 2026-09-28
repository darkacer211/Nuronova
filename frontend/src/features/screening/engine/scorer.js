/**
 * Pure client-side scoring engine for screening questionnaires.
 * Encapsulates psychometric scoring strategies:
 * - asrs_dual: Shaded-box criteria + continuous sum
 * - aq10_binary: Agree vs disagree keyed binary summation
 * - catq_likert: 7-point Likert scale with reverse scoring & 3 subscales
 * - mchat_scoring: M-CHAT-R/F 20 yes/no items with reverse keys & medium-risk follow-up logic
 */

/**
 * Score ASRS v1.1 6Q
 */
export function scoreASRS6(testConfig, responses) {
  let shadedCount = 0;
  let sumScore = 0;
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const val = responses[item.id] !== undefined ? Number(responses[item.id]) : 0;
    sumScore += val;
    const isShaded = val >= item.shadedThreshold;
    if (isShaded) shadedCount += 1;

    itemScores.push({
      id: item.id,
      number: item.number,
      value: val,
      isShaded,
    });
  });

  const isPositive = shadedCount >= testConfig.thresholds.shadedBoxesPositiveCutoff;

  let sumBand = 'Low likelihood of ADHD traits';
  for (const b of testConfig.thresholds.sumScoreBands) {
    if (sumScore >= b.min && sumScore <= b.max) {
      sumBand = b.band;
      break;
    }
  }

  const interpretation = isPositive
    ? testConfig.interpretations.positiveShaded
    : testConfig.interpretations.negativeShaded;

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    shadedCount,
    maxShaded: testConfig.items.length,
    sumScore,
    maxSumScore: 24,
    sumBand,
    isPositive,
    headline: interpretation.headline,
    summary: interpretation.summary,
    recommendation: interpretation.recommendation,
    itemScores,
  };
}

/**
 * Score AQ-10 Adult Autism
 */
export function scoreAQ10(testConfig, responses) {
  let totalScore = 0;
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const val = responses[item.id] || '';
    let itemPt = 0;

    if (item.scoredDirection === 'agree') {
      if (val === 'definitely_agree' || val === 'slightly_agree') {
        itemPt = 1;
      }
    } else if (item.scoredDirection === 'disagree') {
      if (val === 'definitely_disagree' || val === 'slightly_disagree') {
        itemPt = 1;
      }
    }

    totalScore += itemPt;
    itemScores.push({
      id: item.id,
      number: item.number,
      response: val,
      point: itemPt,
    });
  });

  const isPositive = totalScore >= testConfig.thresholds.cutoff;
  const interpretation = isPositive
    ? testConfig.interpretations.aboveCutoff
    : testConfig.interpretations.belowCutoff;

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    maxScore: testConfig.thresholds.maxScore,
    cutoff: testConfig.thresholds.cutoff,
    isPositive,
    headline: interpretation.headline,
    summary: interpretation.summary,
    recommendation: interpretation.recommendation,
    itemScores,
  };
}

/**
 * Score CAT-Q Camouflaging
 */
export function scoreCATQ(testConfig, responses) {
  let totalScore = 0;
  const subscales = {
    compensation: 0,
    masking: 0,
    assimilation: 0,
  };
  const itemScores = [];

  const reverseSet = new Set(testConfig.reverseScoredItemNumbers);

  testConfig.items.forEach((item) => {
    const rawVal = responses[item.id] !== undefined ? Number(responses[item.id]) : 4;
    const isReverse = reverseSet.has(item.number);
    const finalScore = isReverse ? 8 - rawVal : rawVal;

    totalScore += finalScore;
    if (item.subscale && subscales[item.subscale] !== undefined) {
      subscales[item.subscale] += finalScore;
    }

    itemScores.push({
      id: item.id,
      number: item.number,
      raw: rawVal,
      final: finalScore,
      isReverse,
      subscale: item.subscale,
    });
  });

  const isElevated = totalScore >= testConfig.thresholds.clinicalCutoff;
  const interpretation = isElevated
    ? testConfig.interpretations.elevatedCamouflaging
    : testConfig.interpretations.typicalCamouflaging;

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    minScore: testConfig.thresholds.minScore,
    maxScore: testConfig.thresholds.maxScore,
    cutoff: testConfig.thresholds.clinicalCutoff,
    isPositive: isElevated,
    headline: interpretation.headline,
    summary: interpretation.summary,
    note: interpretation.note || '',
    subscales: {
      compensation: {
        score: subscales.compensation,
        maxScore: 63,
        name: testConfig.subscales.compensation.name,
        description: testConfig.subscales.compensation.description,
      },
      masking: {
        score: subscales.masking,
        maxScore: 56,
        name: testConfig.subscales.masking.name,
        description: testConfig.subscales.masking.description,
      },
      assimilation: {
        score: subscales.assimilation,
        maxScore: 56,
        name: testConfig.subscales.assimilation.name,
        description: testConfig.subscales.assimilation.description,
      },
    },
    itemScores,
  };
}

/**
 * Score M-CHAT-R/F (16–30 months)
 * @param {Object} testConfig - mchat config
 * @param {Object} responses - map of item ID to 'yes' / 'no'
 * @param {Object} followUpResponses - map of flagged item IDs to boolean (true if still at-risk)
 */
export function scoreMChat(testConfig, responses, followUpResponses = null) {
  let totalScore = 0;
  const flaggedItems = [];
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const val = (responses[item.id] || '').toLowerCase().trim();
    const isAtRisk = val === item.atRiskAnswer;
    const point = isAtRisk ? 1 : 0;

    totalScore += point;
    if (isAtRisk) {
      flaggedItems.push(item);
    }

    itemScores.push({
      id: item.id,
      number: item.number,
      response: val,
      isAtRisk,
      point,
    });
  });

  // Evaluate risk level
  let riskLevel = 'low';
  let isPositive = false;
  let requiresFollowUp = false;
  let interpretation = testConfig.interpretations.lowRisk;

  if (totalScore >= testConfig.thresholds.highRiskMin) {
    riskLevel = 'high';
    isPositive = true;
    requiresFollowUp = false;
    interpretation = testConfig.interpretations.highRisk;
  } else if (totalScore > testConfig.thresholds.lowRiskMax) {
    // 3 to 7: Medium risk
    riskLevel = 'medium';
    requiresFollowUp = true;
    interpretation = testConfig.interpretations.mediumRisk;

    // If Follow-Up interview responses were completed:
    if (followUpResponses && typeof followUpResponses === 'object') {
      let confirmedCount = 0;
      flaggedItems.forEach((item) => {
        if (followUpResponses[item.id] === true) {
          confirmedCount += 1;
        }
      });

      // M-CHAT-R/F rule: If score remains 2 or higher after Follow-Up, the screen is POSITIVE.
      if (confirmedCount >= 2) {
        isPositive = true;
        interpretation = {
          headline: 'Follow-Up Confirms Risk: Developmental Evaluation Recommended',
          summary: `Following clarification on the ${flaggedItems.length} initial flagged items, ${confirmedCount} behaviors continue to indicate developmental communication differences.`,
          recommendation: 'Schedule a comprehensive developmental evaluation with your pediatrician or early childhood intervention specialist.',
        };
      } else {
        isPositive = false;
        interpretation = {
          headline: 'Follow-Up Screen Negative: Low Current Risk',
          summary: `Following clarification on the initial flagged items, only ${confirmedCount} behavior(s) remained elevated (fewer than the cutoff of 2).`,
          recommendation: 'Continue routine well-child developmental surveillance with your pediatrician.',
        };
      }
    }
  }

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    maxScore: 20,
    riskLevel,
    isPositive,
    requiresFollowUp,
    flaggedItemIds: flaggedItems.map((i) => i.id),
    flaggedItemNumbers: flaggedItems.map((i) => i.number),
    headline: interpretation.headline,
    summary: interpretation.summary,
    recommendation: interpretation.recommendation,
    itemScores,
  };
}

/**
 * Score RAADS-R (80 items, 4 subscales)
 * Citation: Ritvo, R. A., et al. (2011). J Autism Dev Disord, 41(8), 884-897.
 * Standard responses: true_now_and_young (3), true_only_now (2), true_only_young (1), never_true (0).
 * Reverse items (16 normative items in social relatedness): true_now_and_young (0), true_only_now (1), true_only_young (2), never_true (3).
 * Cutoff: Total score >= 65 indicates high likelihood of autism spectrum condition.
 */
export function scoreRAADSR(testConfig, responses) {
  let totalScore = 0;
  const subscales = {
    social_relatedness: { score: 0, count: 0, cutoff: 31, max: 117, name: 'Social Relatedness' },
    circumscribed_interests: { score: 0, count: 0, cutoff: 15, max: 42, name: 'Circumscribed Interests' },
    language: { score: 0, count: 0, cutoff: 4, max: 21, name: 'Language' },
    sensory_motor: { score: 0, count: 0, cutoff: 16, max: 60, name: 'Sensory-Motor' },
  };
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const rawVal = responses[item.id];
    let score = 0;

    if (item.isReverse) {
      if (rawVal === 'never_true') score = 3;
      else if (rawVal === 'true_only_young') score = 2;
      else if (rawVal === 'true_only_now') score = 1;
      else if (rawVal === 'true_now_and_young') score = 0;
    } else {
      if (rawVal === 'true_now_and_young') score = 3;
      else if (rawVal === 'true_only_now') score = 2;
      else if (rawVal === 'true_only_young') score = 1;
      else if (rawVal === 'never_true') score = 0;
    }

    totalScore += score;
    if (subscales[item.subscale]) {
      subscales[item.subscale].score += score;
      subscales[item.subscale].count += 1;
    }

    itemScores.push({
      id: item.id,
      number: item.number,
      subscale: item.subscale,
      rawVal,
      score,
      isReverse: item.isReverse,
    });
  });

  const isPositive = totalScore >= (testConfig.thresholds?.clinicalCutoff || 65);
  const interpretation = isPositive
    ? testConfig.interpretations.elevated
    : testConfig.interpretations.nonElevated;

  const subscaleResults = {};
  for (const [key, data] of Object.entries(subscales)) {
    subscaleResults[key] = {
      ...data,
      isElevated: data.score >= data.cutoff,
    };
  }

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    maxScore: testConfig.thresholds?.maxScore || 240,
    cutoff: testConfig.thresholds?.clinicalCutoff || 65,
    isPositive,
    subscales: subscaleResults,
    headline: interpretation.title,
    summary: interpretation.summary,
    recommendation: isPositive
      ? 'A score >= 65 is strongly correlated with autism spectrum diagnosis in adults. A formal clinical diagnostic interview is recommended.'
      : 'Scores below 65 indicate autistic traits are within typical comparison ranges.',
    itemScores,
  };
}

/**
 * Score AQ-50 (50 items, 5 subscales)
 * Citation: Baron-Cohen, S., et al. (2001). J Autism Dev Disord, 31(1), 5-17.
 * Binary scoring (1 point per item):
 * - If scoresOnAgree: definitely_agree or slightly_agree = 1, else 0
 * - If not scoresOnAgree: definitely_disagree or slightly_disagree = 1, else 0
 * Cutoff: Total score >= 32 indicates clinically significant autistic traits.
 */
export function scoreAQ50(testConfig, responses) {
  let totalScore = 0;
  const subscales = {
    social_skill: { score: 0, count: 0, max: 10, name: 'Social Skill' },
    attention_switching: { score: 0, count: 0, max: 10, name: 'Attention Switching' },
    attention_to_detail: { score: 0, count: 0, max: 10, name: 'Attention to Detail' },
    communication: { score: 0, count: 0, max: 10, name: 'Communication' },
    imagination: { score: 0, count: 0, max: 10, name: 'Imagination' },
  };
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const rawVal = responses[item.id];
    let score = 0;

    if (item.scoresOnAgree) {
      if (rawVal === 'definitely_agree' || rawVal === 'slightly_agree') {
        score = 1;
      }
    } else {
      if (rawVal === 'definitely_disagree' || rawVal === 'slightly_disagree') {
        score = 1;
      }
    }

    totalScore += score;
    if (subscales[item.subscale]) {
      subscales[item.subscale].score += score;
      subscales[item.subscale].count += 1;
    }

    itemScores.push({
      id: item.id,
      number: item.number,
      subscale: item.subscale,
      rawVal,
      score,
    });
  });

  const isPositive = totalScore >= (testConfig.thresholds?.clinicalCutoff || 32);
  const interpretation = isPositive
    ? testConfig.interpretations.elevated
    : testConfig.interpretations.nonElevated;

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    maxScore: testConfig.thresholds?.maxScore || 50,
    cutoff: testConfig.thresholds?.clinicalCutoff || 32,
    isPositive,
    subscales,
    headline: interpretation.title,
    summary: interpretation.summary,
    recommendation: isPositive
      ? 'A score of 32 or higher indicates significant autistic traits; 80% of adults with Asperger syndrome or autism score at or above this threshold.'
      : 'Scores below 32 fall into the general neurotypical range.',
    itemScores,
  };
}

/**
 * Score RBQ-2A (20 items, 2 subscales)
 * Citation: Barrett, S. L., et al. (2015). Molecular Autism, 6, Article 58.
 * Responses: 1 to 4 rating.
 * Metric: Total sum (20-80) and Mean item score (total / 20).
 * Cutoff: Mean score >= 1.75 indicates clinically elevated repetitive behaviors.
 */
export function scoreRBQ2A(testConfig, responses) {
  let totalScore = 0;
  const subscales = {
    repetitive_motor_behaviors: { score: 0, count: 0, max: 32, name: 'Repetitive Motor Behaviors' },
    insistence_on_sameness: { score: 0, count: 0, max: 48, name: 'Insistence on Sameness' },
  };
  const itemScores = [];

  testConfig.items.forEach((item) => {
    const rawVal = responses[item.id] !== undefined ? Number(responses[item.id]) : 1;
    totalScore += rawVal;

    if (subscales[item.subscale]) {
      subscales[item.subscale].score += rawVal;
      subscales[item.subscale].count += 1;
    }

    itemScores.push({
      id: item.id,
      number: item.number,
      subscale: item.subscale,
      value: rawVal,
    });
  });

  const meanScore = Number((totalScore / Math.max(testConfig.items.length, 1)).toFixed(2));
  const rmbMean = Number((subscales.repetitive_motor_behaviors.score / 8).toFixed(2));
  const isMean = Number((subscales.insistence_on_sameness.score / 12).toFixed(2));

  subscales.repetitive_motor_behaviors.mean = rmbMean;
  subscales.insistence_on_sameness.mean = isMean;

  const isPositive = meanScore >= (testConfig.thresholds?.clinicalMeanCutoff || 1.75);
  const interpretation = isPositive
    ? testConfig.interpretations.elevated
    : testConfig.interpretations.nonElevated;

  return {
    testId: testConfig.id,
    name: testConfig.name,
    condition: testConfig.condition,
    totalScore,
    maxScore: testConfig.thresholds?.maxScore || 80,
    meanScore,
    meanCutoff: testConfig.thresholds?.clinicalMeanCutoff || 1.75,
    isPositive,
    subscales,
    headline: interpretation.title,
    summary: interpretation.summary,
    recommendation: isPositive
      ? 'A mean score >= 1.75 indicates elevated repetitive motor behaviors or insistence on sameness typical of autistic adults.'
      : 'Repetitive behaviors and insistence on sameness scores are within typical adult ranges.',
    itemScores,
  };
}

/**
 * Universal dispatcher
 */
export function scoreTest(testConfig, responses, followUpResponses = null) {
  if (testConfig.scoringStrategy === 'asrs_dual') {
    return scoreASRS6(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'aq10_binary') {
    return scoreAQ10(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'catq_likert') {
    return scoreCATQ(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'mchat_scoring') {
    return scoreMChat(testConfig, responses, followUpResponses);
  }
  if (testConfig.scoringStrategy === 'raads_r') {
    return scoreRAADSR(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'aq50_binary') {
    return scoreAQ50(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'rbq2a_likert') {
    return scoreRBQ2A(testConfig, responses);
  }
  throw new Error(`Unsupported scoring strategy: ${testConfig.scoringStrategy}`);
}
