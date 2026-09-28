/**
 * Comprehensive Psychometric Unit Tests for Extended Batteries:
 * - RAADS-R (80 items, 4 subscales, reverse scoring, cutoff 65)
 * - AQ-50 (50 items, 5 subscales, binary keying, cutoff 32)
 * - RBQ-2A (20 items, 2 subscales, mean item cutoff 1.75)
 */

import { raadsR } from './raadsR.js';
import { aq50 } from './aq50.js';
import { rbq2a } from './rbq2a.js';
import { scoreRAADSR, scoreAQ50, scoreRBQ2A } from '../engine/scorer.js';

export function runExtendedBatteriesUnitTests() {
  const results = [];
  const assert = (condition, name) => {
    if (condition) {
      results.push({ pass: true, name });
    } else {
      results.push({ pass: false, name });
      console.error(`FAIL: ${name}`);
    }
  };

  // ==========================================
  // 1. RAADS-R Psychometric Tests
  // ==========================================
  assert(raadsR.items.length === 80, 'RAADS-R: Exactly 80 items');
  assert(raadsR.items.filter((i) => i.isReverse).length === 16, 'RAADS-R: Exactly 16 reverse-scored items');

  // Test 1a: Minimal (All 0 points)
  const raadsZeroResponses = {};
  raadsR.items.forEach((item) => {
    raadsZeroResponses[item.id] = item.isReverse ? 'true_now_and_young' : 'never_true';
  });
  const resRaadsZero = scoreRAADSR(raadsR, raadsZeroResponses);
  assert(resRaadsZero.totalScore === 0, 'RAADS-R: Zero responses yield 0 total points');
  assert(resRaadsZero.isPositive === false, 'RAADS-R: Score 0 is negative (below 65)');

  // Test 1b: Maximum (All 3 points = 240 max)
  const raadsMaxResponses = {};
  raadsR.items.forEach((item) => {
    raadsMaxResponses[item.id] = item.isReverse ? 'never_true' : 'true_now_and_young';
  });
  const resRaadsMax = scoreRAADSR(raadsR, raadsMaxResponses);
  assert(resRaadsMax.totalScore === 240, 'RAADS-R: Maximum responses yield exactly 240 points');
  assert(resRaadsMax.isPositive === true, 'RAADS-R: Score 240 is positive');
  assert(resRaadsMax.subscales.social_relatedness.score === 117, 'RAADS-R: Social Relatedness max is 117');
  assert(resRaadsMax.subscales.circumscribed_interests.score === 42, 'RAADS-R: Circumscribed Interests max is 42');
  assert(resRaadsMax.subscales.language.score === 21, 'RAADS-R: Language max is 21');
  assert(resRaadsMax.subscales.sensory_motor.score === 60, 'RAADS-R: Sensory-Motor max is 60');

  // Test 1c: Cutoff Boundary (64 vs 65)
  // Give 64 points (e.g. 64 items with 1 point each)
  const raads64Responses = { ...raadsZeroResponses };
  for (let i = 0; i < 64; i++) {
    const item = raadsR.items[i];
    raads64Responses[item.id] = item.isReverse ? 'true_only_now' : 'true_only_young'; // 1 pt each
  }
  const resRaads64 = scoreRAADSR(raadsR, raads64Responses);
  assert(resRaads64.totalScore === 64, 'RAADS-R: Exactly 64 points');
  assert(resRaads64.isPositive === false, 'RAADS-R: Score 64 is below clinical cutoff (negative)');

  const raads65Responses = { ...raads64Responses };
  const item65 = raadsR.items[64];
  raads65Responses[item65.id] = item65.isReverse ? 'true_only_now' : 'true_only_young';
  const resRaads65 = scoreRAADSR(raadsR, raads65Responses);
  assert(resRaads65.totalScore === 65, 'RAADS-R: Exactly 65 points');
  assert(resRaads65.isPositive === true, 'RAADS-R: Score 65 meets clinical cutoff (positive)');

  // ==========================================
  // 2. AQ-50 Psychometric Tests
  // ==========================================
  assert(aq50.items.length === 50, 'AQ-50: Exactly 50 items');
  assert(aq50.items.filter((i) => i.scoresOnAgree).length === 24, 'AQ-50: Exactly 24 agree-scored items');
  assert(aq50.items.filter((i) => !i.scoresOnAgree).length === 26, 'AQ-50: Exactly 26 disagree-scored items');

  // Test 2a: Zero Score
  const aq50ZeroResponses = {};
  aq50.items.forEach((item) => {
    aq50ZeroResponses[item.id] = item.scoresOnAgree ? 'definitely_disagree' : 'definitely_agree';
  });
  const resAq50Zero = scoreAQ50(aq50, aq50ZeroResponses);
  assert(resAq50Zero.totalScore === 0, 'AQ-50: Zero responses yield 0 total points');
  assert(resAq50Zero.isPositive === false, 'AQ-50: Score 0 is negative (below 32)');

  // Test 2b: Maximum 50 Score & Subscales
  const aq50MaxResponses = {};
  aq50.items.forEach((item) => {
    aq50MaxResponses[item.id] = item.scoresOnAgree ? 'definitely_agree' : 'definitely_disagree';
  });
  const resAq50Max = scoreAQ50(aq50, aq50MaxResponses);
  assert(resAq50Max.totalScore === 50, 'AQ-50: Maximum responses yield exactly 50 points');
  assert(resAq50Max.isPositive === true, 'AQ-50: Score 50 is positive');
  assert(resAq50Max.subscales.social_skill.score === 10, 'AQ-50: Social skill max 10');
  assert(resAq50Max.subscales.attention_switching.score === 10, 'AQ-50: Attention switching max 10');
  assert(resAq50Max.subscales.attention_to_detail.score === 10, 'AQ-50: Attention to detail max 10');
  assert(resAq50Max.subscales.communication.score === 10, 'AQ-50: Communication max 10');
  assert(resAq50Max.subscales.imagination.score === 10, 'AQ-50: Imagination max 10');

  // Test 2c: Cutoff Boundary (31 vs 32)
  const aq50_31Responses = { ...aq50ZeroResponses };
  for (let i = 0; i < 31; i++) {
    const item = aq50.items[i];
    aq50_31Responses[item.id] = item.scoresOnAgree ? 'slightly_agree' : 'slightly_disagree';
  }
  const resAq50_31 = scoreAQ50(aq50, aq50_31Responses);
  assert(resAq50_31.totalScore === 31, 'AQ-50: Exactly 31 points');
  assert(resAq50_31.isPositive === false, 'AQ-50: Score 31 is below cutoff 32 (negative)');

  const aq50_32Responses = { ...aq50_31Responses };
  const item32 = aq50.items[31];
  aq50_32Responses[item32.id] = item32.scoresOnAgree ? 'slightly_agree' : 'slightly_disagree';
  const resAq50_32 = scoreAQ50(aq50, aq50_32Responses);
  assert(resAq50_32.totalScore === 32, 'AQ-50: Exactly 32 points');
  assert(resAq50_32.isPositive === true, 'AQ-50: Score 32 meets cutoff 32 (positive)');

  // ==========================================
  // 3. RBQ-2A Psychometric Tests
  // ==========================================
  assert(rbq2a.items.length === 20, 'RBQ-2A: Exactly 20 items');
  assert(rbq2a.items.filter((i) => i.subscale === 'repetitive_motor_behaviors').length === 8, 'RBQ-2A: 8 RMB items');
  assert(rbq2a.items.filter((i) => i.subscale === 'insistence_on_sameness').length === 12, 'RBQ-2A: 12 IS items');

  // Test 3a: Minimal 1.0 Mean
  const rbqMinResponses = {};
  rbq2a.items.forEach((item) => {
    rbqMinResponses[item.id] = 1;
  });
  const resRbqMin = scoreRBQ2A(rbq2a, rbqMinResponses);
  assert(resRbqMin.totalScore === 20, 'RBQ-2A: Minimal sum is 20');
  assert(resRbqMin.meanScore === 1.0, 'RBQ-2A: Minimal mean is 1.0');
  assert(resRbqMin.isPositive === false, 'RBQ-2A: Mean 1.0 is below cutoff 1.75 (negative)');

  // Test 3b: Maximum 4.0 Mean
  const rbqMaxResponses = {};
  rbq2a.items.forEach((item) => {
    rbqMaxResponses[item.id] = 4;
  });
  const resRbqMax = scoreRBQ2A(rbq2a, rbqMaxResponses);
  assert(resRbqMax.totalScore === 80, 'RBQ-2A: Maximum sum is 80');
  assert(resRbqMax.meanScore === 4.0, 'RBQ-2A: Maximum mean is 4.0');
  assert(resRbqMax.isPositive === true, 'RBQ-2A: Mean 4.0 meets cutoff 1.75 (positive)');
  assert(resRbqMax.subscales.repetitive_motor_behaviors.mean === 4.0, 'RBQ-2A: RMB mean is 4.0');
  assert(resRbqMax.subscales.insistence_on_sameness.mean === 4.0, 'RBQ-2A: IS mean is 4.0');

  // Test 3c: Cutoff Boundary (1.70 vs 1.75)
  // Total 34 / 20 = 1.70 vs Total 35 / 20 = 1.75
  const rbq34Responses = {};
  rbq2a.items.forEach((item, idx) => {
    rbq34Responses[item.id] = idx < 14 ? 2 : 1; // 14*2 + 6*1 = 34
  });
  const resRbq34 = scoreRBQ2A(rbq2a, rbq34Responses);
  assert(resRbq34.meanScore === 1.7, 'RBQ-2A: Exactly 1.70 mean score');
  assert(resRbq34.isPositive === false, 'RBQ-2A: Mean 1.70 is below cutoff 1.75 (negative)');

  const rbq35Responses = { ...rbq34Responses, [rbq2a.items[14].id]: 2 }; // 35 / 20 = 1.75
  const resRbq35 = scoreRBQ2A(rbq2a, rbq35Responses);
  assert(resRbq35.meanScore === 1.75, 'RBQ-2A: Exactly 1.75 mean score');
  assert(resRbq35.isPositive === true, 'RBQ-2A: Mean 1.75 meets clinical cutoff 1.75 (positive)');

  console.log(`\n✅ ExtendedBatteries Tests: ${results.filter((r) => r.pass).length}/${results.length} passed.`);
  return results;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('extendedBatteries.test.js')) {
  runExtendedBatteriesUnitTests();
}
