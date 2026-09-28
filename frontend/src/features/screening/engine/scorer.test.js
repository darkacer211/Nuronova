import { asrs6 } from '../tests/asrs6.js';
import { aq10 } from '../tests/aq10.js';
import { catq } from '../tests/catq.js';
import { mchat } from '../tests/mchat.js';
import { scoreASRS6, scoreAQ10, scoreCATQ, scoreMChat } from './scorer.js';

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
  const asrs3Shaded = { asrs_1: 2, asrs_2: 2, asrs_3: 2, asrs_4: 0, asrs_5: 0, asrs_6: 0 };
  const res3 = scoreASRS6(asrs6, asrs3Shaded);
  assert(res3.shadedCount === 3, 'ASRS-6: Count exactly 3 shaded boxes');
  assert(res3.isPositive === false, 'ASRS-6: 3 shaded boxes is below cutoff (negative)');

  const asrs4Shaded = { asrs_1: 2, asrs_2: 2, asrs_3: 2, asrs_4: 3, asrs_5: 0, asrs_6: 0 };
  const res4 = scoreASRS6(asrs6, asrs4Shaded);
  assert(res4.shadedCount === 4, 'ASRS-6: Count exactly 4 shaded boxes');
  assert(res4.isPositive === true, 'ASRS-6: 4 shaded boxes meets cutoff (positive)');

  // Test 2: AQ-10 Binary Keying & Cutoff
  const aq10_5pts = {
    aq_1: 'definitely_agree',
    aq_7: 'slightly_agree',
    aq_8: 'definitely_agree',
    aq_10: 'slightly_agree',
    aq_2: 'definitely_disagree',
  };
  const resAq5 = scoreAQ10(aq10, aq10_5pts);
  assert(resAq5.totalScore === 5, 'AQ-10: Exactly 5 points');
  assert(resAq5.isPositive === false, 'AQ-10: 5 points is below cutoff 6 (negative)');

  const aq10_6pts = { ...aq10_5pts, aq_3: 'definitely_disagree' };
  const resAq6 = scoreAQ10(aq10, aq10_6pts);
  assert(resAq6.totalScore === 6, 'AQ-10: Exactly 6 points');
  assert(resAq6.isPositive === true, 'AQ-10: 6 points meets cutoff 6 (positive)');

  // Test 3: CAT-Q Reverse Scoring & Subscale Calculation
  const catqMinimal = {};
  catq.items.forEach((item) => {
    catqMinimal[item.id] = 1;
  });
  const resCatqMin = scoreCATQ(catq, catqMinimal);
  assert(resCatqMin.totalScore === 55, 'CAT-Q: Reverse scoring formula on raw 1s yields 55 (20 + 35)');

  // Test 4: M-CHAT-R/F Pediatric Scoring
  // 4a: Reverse keyed item check: Item 2, 5, 12 are reverse keyed (where 'yes' = at risk)
  // All other items 'yes' = safe (0 pt)
  const mchatAllYes = {};
  mchat.items.forEach((item) => {
    mchatAllYes[item.id] = 'yes';
  });
  // 'yes' triggers points ONLY on items 2, 5, 12 -> total = 3
  const resMchatReverse = scoreMChat(mchat, mchatAllYes);
  assert(resMchatReverse.totalScore === 3, 'M-CHAT: Answering all YES triggers at-risk points only on reverse items 2, 5, 12 (score 3)');

  // 4b: Low risk boundary (score 2)
  const mchatLow = { mc_2: 'yes', mc_5: 'yes' }; // 2 pts
  const resMchatLow = scoreMChat(mchat, mchatLow);
  assert(resMchatLow.totalScore === 2, 'M-CHAT: Exactly 2 points');
  assert(resMchatLow.riskLevel === 'low', 'M-CHAT: Score 2 is low risk');
  assert(resMchatLow.requiresFollowUp === false, 'M-CHAT: Low risk does not require Follow-Up');

  // 4c: Medium risk lower boundary (score 3)
  const mchatMed3 = { mc_2: 'yes', mc_5: 'yes', mc_12: 'yes' }; // 3 pts
  const resMchatMed3 = scoreMChat(mchat, mchatMed3);
  assert(resMchatMed3.totalScore === 3, 'M-CHAT: Exactly 3 points');
  assert(resMchatMed3.riskLevel === 'medium', 'M-CHAT: Score 3 is medium risk');
  assert(resMchatMed3.requiresFollowUp === true, 'M-CHAT: Medium risk triggers Follow-Up');

  // 4d: Medium risk upper boundary (score 7)
  const mchatMed7 = { mc_2: 'yes', mc_5: 'yes', mc_12: 'yes', mc_1: 'no', mc_3: 'no', mc_4: 'no', mc_6: 'no' }; // 7 pts
  const resMchatMed7 = scoreMChat(mchat, mchatMed7);
  assert(resMchatMed7.totalScore === 7, 'M-CHAT: Exactly 7 points');
  assert(resMchatMed7.riskLevel === 'medium', 'M-CHAT: Score 7 is medium risk');

  // 4e: High risk boundary (score 8)
  const mchatHigh8 = { ...mchatMed7, mc_7: 'no' }; // 8 pts
  const resMchatHigh8 = scoreMChat(mchat, mchatHigh8);
  assert(resMchatHigh8.totalScore === 8, 'M-CHAT: Exactly 8 points');
  assert(resMchatHigh8.riskLevel === 'high', 'M-CHAT: Score 8 is high risk');
  assert(resMchatHigh8.isPositive === true, 'M-CHAT: High risk is immediately screen positive');
  assert(resMchatHigh8.requiresFollowUp === false, 'M-CHAT: High risk bypasses Follow-Up');

  // 4f: Follow-Up logic pass vs fail (cutoff is 2 confirmed items)
  // Scenario A: Medium risk with 1 confirmed item -> Negative
  const followUp1 = { mc_2: true, mc_5: false, mc_12: false };
  const resFollowUp1 = scoreMChat(mchat, mchatMed3, followUp1);
  assert(resFollowUp1.isPositive === false, 'M-CHAT Follow-Up: 1 confirmed item is screen negative (cutoff is 2)');

  // Scenario B: Medium risk with 2 confirmed items -> Positive
  const followUp2 = { mc_2: true, mc_5: true, mc_12: false };
  const resFollowUp2 = scoreMChat(mchat, mchatMed3, followUp2);
  assert(resFollowUp2.isPositive === true, 'M-CHAT Follow-Up: 2 confirmed items is screen positive');

  const totalPassed = results.filter((r) => r.pass).length;
  return {
    total: results.length,
    passed: totalPassed,
    allPassed: totalPassed === results.length,
    results,
  };
}
