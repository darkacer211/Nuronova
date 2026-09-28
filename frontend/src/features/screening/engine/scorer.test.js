import { asrs6 } from '../tests/asrs6.js';
import { aq10 } from '../tests/aq10.js';
import { catq } from '../tests/catq.js';
import { scoreASRS6, scoreAQ10, scoreCATQ } from './scorer.js';

/**
 * Basic runnable assertion runner to verify unit test correctness in pure Node/JS.
 */
export function runScorerUnitTests() {
  const results = [];

  const assert = (condition, testName) => {
    if (condition) {
      results.push({ pass: true, name: testName });
    } else {
      results.push({ pass: false, name: testName });
      console.error(`FAIL: ${testName}`);
    }
  };

  // Test 1: ASRS-6 Shaded Box Threshold Edge Cases
  // Responses with 3 shaded boxes (Items 1, 2, 3 at value 2) -> Should be negative
  const asrs3Shaded = { asrs_1: 2, asrs_2: 2, asrs_3: 2, asrs_4: 0, asrs_5: 0, asrs_6: 0 };
  const res3 = scoreASRS6(asrs6, asrs3Shaded);
  assert(res3.shadedCount === 3, 'ASRS-6: Count exactly 3 shaded boxes');
  assert(res3.isPositive === false, 'ASRS-6: 3 shaded boxes is below cutoff (negative)');

  // Responses with 4 shaded boxes (Items 1, 2, 3, 4 at shaded values) -> Should be positive
  const asrs4Shaded = { asrs_1: 2, asrs_2: 2, asrs_3: 2, asrs_4: 3, asrs_5: 0, asrs_6: 0 };
  const res4 = scoreASRS6(asrs6, asrs4Shaded);
  assert(res4.shadedCount === 4, 'ASRS-6: Count exactly 4 shaded boxes');
  assert(res4.isPositive === true, 'ASRS-6: 4 shaded boxes meets cutoff (positive)');
  assert(res4.sumScore === 9, 'ASRS-6: Sum score correct (2+2+2+3=9)');

  // Test 2: AQ-10 Binary Keying & Cutoff
  // 5 points -> Negative
  const aq10_5pts = {
    aq_1: 'definitely_agree',   // +1
    aq_7: 'slightly_agree',     // +1
    aq_8: 'definitely_agree',   // +1
    aq_10: 'slightly_agree',    // +1
    aq_2: 'definitely_disagree',// +1
    aq_3: 'slightly_agree',     // 0 (keyed disagree)
    aq_4: 'definitely_agree',   // 0 (keyed disagree)
    aq_5: 'slightly_agree',     // 0 (keyed disagree)
    aq_6: 'definitely_agree',   // 0 (keyed disagree)
    aq_9: 'slightly_agree',     // 0 (keyed disagree)
  };
  const resAq5 = scoreAQ10(aq10, aq10_5pts);
  assert(resAq5.totalScore === 5, 'AQ-10: Exactly 5 points');
  assert(resAq5.isPositive === false, 'AQ-10: 5 points is below cutoff 6 (negative)');

  // 6 points -> Positive
  const aq10_6pts = { ...aq10_5pts, aq_3: 'definitely_disagree' }; // adds 1 pt
  const resAq6 = scoreAQ10(aq10, aq10_6pts);
  assert(resAq6.totalScore === 6, 'AQ-10: Exactly 6 points');
  assert(resAq6.isPositive === true, 'AQ-10: 6 points meets cutoff 6 (positive)');

  // Test 3: CAT-Q Reverse Scoring & Subscale Calculation
  // Items 3, 12, 19, 22, 24 are reversed (8 - val)
  // If user answers 1 (Strongly Disagree) to a reverse item, it should score 7 (8 - 1)
  const catqMinimal = {};
  catq.items.forEach((item) => {
    catqMinimal[item.id] = 1; // raw score 1 for all items
  });
  // 20 regular items with raw 1 = 20 pts
  // 5 reversed items with raw 1 = 5 * (8 - 1) = 35 pts
  // Total expected = 20 + 35 = 55
  const resCatqMin = scoreCATQ(catq, catqMinimal);
  assert(resCatqMin.totalScore === 55, 'CAT-Q: Reverse scoring formula on raw 1s yields 55 (20 + 35)');
  assert(resCatqMin.isPositive === false, 'CAT-Q: 55 is below clinical cutoff 100');

  // Verify subscale calculations exist and are non-negative
  assert(resCatqMin.subscales.compensation.score > 0, 'CAT-Q: Compensation subscale computed');
  assert(resCatqMin.subscales.masking.score > 0, 'CAT-Q: Masking subscale computed');
  assert(resCatqMin.subscales.assimilation.score > 0, 'CAT-Q: Assimilation subscale computed');

  const totalPassed = results.filter((r) => r.pass).length;
  return {
    total: results.length,
    passed: totalPassed,
    allPassed: totalPassed === results.length,
    results,
  };
}
