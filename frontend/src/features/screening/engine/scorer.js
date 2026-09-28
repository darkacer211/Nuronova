/**
 * Pure client-side scoring engine for screening questionnaires.
 * Encapsulates psychometric scoring strategies:
 * - asrs_dual: Shaded-box criteria + continuous sum
 * - aq10_binary: Agree vs disagree keyed binary summation
 * - catq_likert: 7-point Likert scale with reverse scoring & 3 subscales
 */

/**
 * Score ASRS v1.1 6Q
 * @param {Object} testConfig - asrs6 config
 * @param {Object} responses - map of item ID to response value (0-4)
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
 * @param {Object} testConfig - aq10 config
 * @param {Object} responses - map of item ID to string value ('definitely_agree', etc.)
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
 * @param {Object} testConfig - catq config
 * @param {Object} responses - map of item ID to numeric value (1-7)
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
    // 7-point Likert reverse score formula: 8 - rawVal
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
 * Universal dispatcher
 */
export function scoreTest(testConfig, responses) {
  if (testConfig.scoringStrategy === 'asrs_dual') {
    return scoreASRS6(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'aq10_binary') {
    return scoreAQ10(testConfig, responses);
  }
  if (testConfig.scoringStrategy === 'catq_likert') {
    return scoreCATQ(testConfig, responses);
  }
  throw new Error(`Unsupported scoring strategy: ${testConfig.scoringStrategy}`);
}
