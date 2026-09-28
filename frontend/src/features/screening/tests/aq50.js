/**
 * Autism Spectrum Quotient 50-Item (AQ-50)
 * Citation: Baron-Cohen, S., Wheelwright, S., Skinner, R., Martin, J., & Clubley, E. (2001).
 * The Autism-Spectrum Quotient (AQ): Evidence from Asperger syndrome/high-functioning autism,
 * males and females, scientists and mathematicians. Journal of Autism and Developmental Disorders, 31(1), 5–17.
 *
 * LICENSING NOTICE:
 * Copyright © 2001 Simon Baron-Cohen & Autism Research Centre, University of Cambridge.
 * Item text is held strictly as placeholders pending electronic authorization.
 */

const AQ50_AGREE_ITEMS = new Set([
  2, 4, 5, 6, 7, 9, 12, 13, 16, 18, 19, 20, 21, 22, 23, 26, 33, 35, 39, 41, 42, 43, 45, 46
]); // 24 items where agree (definitely/slightly) = 1 point

const SUBSCALE_MAPPINGS = {
  social_skill: new Set([1, 11, 13, 15, 22, 36, 44, 45, 47, 48]),
  attention_switching: new Set([2, 4, 10, 16, 25, 32, 34, 37, 43, 46]),
  attention_to_detail: new Set([5, 6, 9, 12, 19, 23, 28, 29, 30, 49]),
  communication: new Set([7, 18, 26, 27, 31, 33, 35, 38, 39, 50]),
  imagination: new Set([3, 8, 14, 17, 20, 21, 24, 40, 41, 42]),
};

const SUBSCALE_LABELS = {
  social_skill: 'Social Skill',
  attention_switching: 'Attention Switching',
  attention_to_detail: 'Attention to Detail',
  communication: 'Communication',
  imagination: 'Imagination',
};

function getSubscale(itemNum) {
  for (const [subscale, itemSet] of Object.entries(SUBSCALE_MAPPINGS)) {
    if (itemSet.has(itemNum)) return subscale;
  }
  return 'social_skill';
}

const items = [];
for (let num = 1; num <= 50; num++) {
  const subscale = getSubscale(num);
  const scoresOnAgree = AQ50_AGREE_ITEMS.has(num);
  items.push({
    id: `aq50_${num}`,
    number: num,
    text: `[Item ${num} Placeholder: ${SUBSCALE_LABELS[subscale]} - Licensed text required © 2001 Baron-Cohen et al.]`,
    subscale,
    scoresOnAgree, // true = agree gives 1 pt; false = disagree gives 1 pt
  });
}

export const aq50 = {
  id: 'aq50',
  name: 'Autism Spectrum Quotient 50-Item (AQ-50)',
  shortName: 'Full AQ-50 (Adult Autism)',
  condition: 'Autism Spectrum (Adult Self-Report)',
  minAge: 18,
  description:
    'The classic 50-item Autism Spectrum Quotient measuring cognitive and behavioral autistic traits across Social Skill, Attention Switching, Attention to Detail, Communication, and Imagination.',
  citation: 'Baron-Cohen et al. (2001). J Autism Dev Disord, 31(1), 5-17.',
  copyrightNotice:
    '© 2001 Simon Baron-Cohen & Autism Research Centre, Cambridge. Placeholders pending authorized text loading.',
  scoringStrategy: 'aq50_binary',
  scale: [
    { value: 'definitely_agree', label: 'Definitely Agree' },
    { value: 'slightly_agree', label: 'Slightly Agree' },
    { value: 'slightly_disagree', label: 'Slightly Disagree' },
    { value: 'definitely_disagree', label: 'Definitely Disagree' },
  ],
  items,
  subscales: {
    social_skill: { name: 'Social Skill', totalItems: 10, maxScore: 10 },
    attention_switching: { name: 'Attention Switching', totalItems: 10, maxScore: 10 },
    attention_to_detail: { name: 'Attention to Detail', totalItems: 10, maxScore: 10 },
    communication: { name: 'Communication', totalItems: 10, maxScore: 10 },
    imagination: { name: 'Imagination', totalItems: 10, maxScore: 10 },
  },
  thresholds: {
    clinicalCutoff: 32, // Out of 50
    maxScore: 50,
  },
  interpretations: {
    elevated: {
      title: 'Elevated Autistic Traits (Score ≥ 32/50)',
      badge: 'badge-violet',
      summary:
        'Your score is 32 or above. In clinical validation studies (Baron-Cohen et al., 2001), 79.3% of adults with Asperger syndrome or high-functioning autism scored 32 or higher, compared to 2% of the neurotypical control group.',
    },
    nonElevated: {
      title: 'Scores Below Clinical Cutoff (Score < 32/50)',
      badge: 'badge-emerald',
      summary:
        'Your score is below 32, typical of the broader population without prominent autistic cognitive traits.',
    },
  },
};
