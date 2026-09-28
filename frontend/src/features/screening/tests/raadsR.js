/**
 * Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R)
 * Citation: Ritvo, R. A., Ritvo, E. R., Guthrie, D., Ritvo, M. J., Hufnagel, D. H., McMahon, W.,
 * Tonge, B., Mataix-Cols, D., Jassi, A., Attwood, T., & Eloff, J. (2011). The Ritvo Autism Asperger
 * Diagnostic Scale-Revised (RAADS-R): a scale to revise the diagnosis of autism spectrum disorder in adults.
 * Journal of Autism and Developmental Disorders, 41(8), 884–897.
 *
 * LICENSING NOTICE:
 * Copyright © 2011 Riva Ariella Ritvo, PhD, and Western Psychological Services (WPS).
 * To adhere strictly to copyright, all item wording is held as structured placeholders
 * pending authorized text loading via licensing.config.
 */

// 16 normative reverse-scored items (all in social relatedness)
const RAADS_REVERSE_ITEMS = new Set([1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 52, 60, 64, 70, 77, 80]);

const SUBSCALE_MAPPINGS = {
  language: new Set([2, 7, 15, 27, 35, 58, 66]), // 7 items
  sensory_motor: new Set([3, 4, 5, 10, 12, 16, 17, 19, 22, 25, 29, 31, 34, 36, 42, 46, 49, 51, 54, 57]), // 20 items
  circumscribed_interests: new Set([9, 13, 24, 30, 32, 40, 41, 50, 56, 59, 62, 63, 67, 74]), // 14 items
  // Remaining 39 items belong to social_relatedness
};

function getSubscale(itemNum) {
  if (SUBSCALE_MAPPINGS.language.has(itemNum)) return 'language';
  if (SUBSCALE_MAPPINGS.sensory_motor.has(itemNum)) return 'sensory_motor';
  if (SUBSCALE_MAPPINGS.circumscribed_interests.has(itemNum)) return 'circumscribed_interests';
  return 'social_relatedness';
}

const SUBSCALE_LABELS = {
  social_relatedness: 'Social Relatedness',
  circumscribed_interests: 'Circumscribed Interests',
  language: 'Language',
  sensory_motor: 'Sensory-Motor',
};

// Generate 80 placeholder items adhering to licensing audit rules
const items = [];
for (let num = 1; num <= 80; num++) {
  const subscale = getSubscale(num);
  const isReverse = RAADS_REVERSE_ITEMS.has(num);
  items.push({
    id: `raads_${num}`,
    number: num,
    text: `[Item ${num} Placeholder: ${SUBSCALE_LABELS[subscale]} - Licensed text required © 2011 Ritvo et al.]`,
    subscale,
    isReverse,
  });
}

export const raadsR = {
  id: 'raads_r',
  name: 'Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R)',
  shortName: 'RAADS-R (Adult Autism)',
  condition: 'Autism Spectrum (Adult Self-Report)',
  minAge: 18,
  description:
    'An 80-item self-report questionnaire designed to assist clinicians in evaluating adult autism across Social Relatedness, Circumscribed Interests, Language, and Sensory-Motor domains.',
  citation: 'Ritvo et al. (2011). J Autism Dev Disord, 41(8), 884-897.',
  copyrightNotice:
    '© 2011 Riva Ariella Ritvo & Western Psychological Services (WPS). Items held as placeholders pending authorized text bundle.',
  scoringStrategy: 'raads_r',
  scale: [
    { value: 'true_now_and_young', label: 'True now and when I was young' },
    { value: 'true_only_now', label: 'True only now' },
    { value: 'true_only_young', label: 'True only when I was young' },
    { value: 'never_true', label: 'Never true' },
  ],
  items,
  subscales: {
    social_relatedness: { name: 'Social Relatedness', totalItems: 39, cutoff: 31, maxScore: 117 },
    circumscribed_interests: { name: 'Circumscribed Interests', totalItems: 14, cutoff: 15, maxScore: 42 },
    language: { name: 'Language', totalItems: 7, cutoff: 4, maxScore: 21 },
    sensory_motor: { name: 'Sensory-Motor', totalItems: 20, cutoff: 16, maxScore: 60 },
  },
  thresholds: {
    clinicalCutoff: 65, // Out of 240
    maxScore: 240,
  },
  interpretations: {
    elevated: {
      title: 'Scores Above Clinical Threshold (Autistic Traits Indicated)',
      badge: 'badge-violet',
      summary:
        'Total RAADS-R score is at or above 65. In published clinical validation (Ritvo et al., 2011), 97% of autistic adults scored 65 or higher, compared to neurotypical comparison groups. Comprehensive clinical assessment is recommended.',
    },
    nonElevated: {
      title: 'Scores Below Clinical Cutoff',
      badge: 'badge-emerald',
      summary:
        'Total RAADS-R score is below 65. While few autistic adults score below 65 in clinical studies, individual traits across specific sensory or social subscales should still be considered.',
    },
  },
};
