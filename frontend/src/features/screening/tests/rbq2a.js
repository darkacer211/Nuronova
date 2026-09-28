/**
 * Repetitive Behaviors Questionnaire-2 Adult (RBQ-2A)
 * Citation: Barrett, S. L., Uljarević, M., Baker, E. K., Richdale, A. L., Tuck, W. V., & Leekam, S. R. (2015).
 * The Repetitive Behaviors Questionnaire-2 Adult (RBQ-2A): a self-report measure of restricted and repetitive behaviours in adults.
 * Molecular Autism, 6, Article 58.
 *
 * LICENSING NOTICE:
 * Copyright © 2015 Sarah Barrett et al. Published in Molecular Autism.
 * Item text held strictly as placeholders pending authorized text loading.
 */

const SUBSCALE_MAPPINGS = {
  repetitive_motor_behaviors: new Set([1, 2, 3, 4, 5, 6, 7, 8]), // 8 items
  insistence_on_sameness: new Set([9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]), // 12 items
};

const SUBSCALE_LABELS = {
  repetitive_motor_behaviors: 'Repetitive Motor Behaviors (RMB)',
  insistence_on_sameness: 'Insistence on Sameness (IS)',
};

function getSubscale(itemNum) {
  return itemNum <= 8 ? 'repetitive_motor_behaviors' : 'insistence_on_sameness';
}

const items = [];
for (let num = 1; num <= 20; num++) {
  const subscale = getSubscale(num);
  items.push({
    id: `rbq_${num}`,
    number: num,
    text: `[Item ${num} Placeholder: ${SUBSCALE_LABELS[subscale]} - Licensed text required © 2015 Barrett et al.]`,
    subscale,
  });
}

export const rbq2a = {
  id: 'rbq2a',
  name: 'Repetitive Behaviors Questionnaire-2 Adult (RBQ-2A)',
  shortName: 'RBQ-2A (Repetitive Behaviors)',
  condition: 'Autism Spectrum / Restricted & Repetitive Behaviors',
  minAge: 18,
  description:
    'A 20-item self-report questionnaire assessing restricted and repetitive behaviors across Repetitive Motor Behaviors (RMB) and Insistence on Sameness (IS).',
  citation: 'Barrett, S. L., et al. (2015). Molecular Autism, 6, Article 58.',
  copyrightNotice:
    '© 2015 Sarah Barrett et al. Held as placeholders pending authorized text loading.',
  scoringStrategy: 'rbq2a_likert',
  scale: [
    { value: 1, label: '1 - Never or rarely' },
    { value: 2, label: '2 - Occasionally / Weekly' },
    { value: 3, label: '3 - Often / Daily' },
    { value: 4, label: '4 - Very Often / Multiple times daily' },
  ],
  items,
  subscales: {
    repetitive_motor_behaviors: { name: 'Repetitive Motor Behaviors', totalItems: 8, maxScore: 32 },
    insistence_on_sameness: { name: 'Insistence on Sameness', totalItems: 12, maxScore: 48 },
  },
  thresholds: {
    clinicalMeanCutoff: 1.75, // Average item score cutoff (Barrett et al., 2015)
    maxScore: 80,
  },
  interpretations: {
    elevated: {
      title: 'Elevated Restricted & Repetitive Behaviors (Mean ≥ 1.75)',
      badge: 'badge-violet',
      summary:
        'Your mean score is 1.75 or higher, consistent with clinically elevated patterns of repetitive motor behaviors or strong insistence on sameness documented in autistic adult populations.',
    },
    nonElevated: {
      title: 'Typical Range of Repetitive Behaviors (Mean < 1.75)',
      badge: 'badge-emerald',
      summary:
        'Your mean score falls below the 1.75 cutoff, indicating restricted and repetitive behaviors within the typical baseline range.',
    },
  },
};
