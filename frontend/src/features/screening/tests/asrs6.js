/**
 * Adult ADHD Self-Report Scale (ASRS-v1.1) 6-Question Screener
 * Citation: Kessler, R.C., Adler, L., Ames, M., Demler, O., Faraone, S., Hiripi, E., Howes, M.J.,
 * Jin, R., Secnik, K., Spencer, T., Ustun, T.B., Walters, E.E. (2005). The World Health Organization
 * Adult ADHD Self-Report Scale (ASRS). Psychological Medicine, 35(2), 245-256.
 *
 * Copyright © World Health Organization. All rights reserved.
 */

export const asrs6 = {
  id: 'asrs6',
  name: 'ASRS-v1.1 6-Question Screener',
  shortName: 'ADHD Screener (ASRS-6)',
  condition: 'ADHD',
  minAge: 18,
  description:
    'A validated 6-question screener developed in conjunction with the World Health Organization (WHO) to identify symptoms consistent with Adult ADHD.',
  citation: 'Kessler et al. (2005). Psychological Medicine, 35(2), 245-256.',
  copyrightNotice:
    'The Adult ADHD Self-Report Scale (ASRS-v1.1) is developed by the World Health Organization (WHO) and Harvard Medical School. Use is for informational/screening purposes.',
  scale: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Rarely' },
    { value: 2, label: 'Sometimes' },
    { value: 3, label: 'Often' },
    { value: 4, label: 'Very Often' },
  ],
  items: [
    {
      id: 'asrs_1',
      number: 1,
      text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
      shadedThreshold: 2, // 'Sometimes' (2) or higher is shaded
    },
    {
      id: 'asrs_2',
      number: 2,
      text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
      shadedThreshold: 2, // 'Sometimes' (2) or higher is shaded
    },
    {
      id: 'asrs_3',
      number: 3,
      text: 'How often do you have problems remembering appointments or obligations?',
      shadedThreshold: 2, // 'Sometimes' (2) or higher is shaded
    },
    {
      id: 'asrs_4',
      number: 4,
      text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
      shadedThreshold: 3, // 'Often' (3) or higher is shaded
    },
    {
      id: 'asrs_5',
      number: 5,
      text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
      shadedThreshold: 3, // 'Often' (3) or higher is shaded
    },
    {
      id: 'asrs_6',
      number: 6,
      text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
      shadedThreshold: 3, // 'Often' (3) or higher is shaded
    },
  ],
  scoringStrategy: 'asrs_dual',
  thresholds: {
    shadedBoxesPositiveCutoff: 4, // 4 or more shaded boxes = positive screen
    sumScoreBands: [
      { min: 0, max: 13, band: 'Low likelihood of ADHD traits' },
      { min: 14, max: 17, band: 'Moderate likelihood of ADHD traits' },
      { min: 18, max: 24, band: 'High likelihood of ADHD traits' },
    ],
  },
  interpretations: {
    positiveShaded: {
      headline: 'Traits Consistent with Adult ADHD',
      summary:
        'Your responses endorsed 4 or more significant criteria on the ASRS Part A screener. This indicates symptom patterns frequently consistent with adult ADHD in inattention, executive organization, or hyperactive-impulsive domains.',
      recommendation:
        'A comprehensive clinical evaluation by an adult ADHD psychiatrist or clinical psychologist is recommended to explore whether these symptoms impact daily functioning.',
    },
    negativeShaded: {
      headline: 'Traits Below Conventional ADHD Screening Threshold',
      summary:
        'Your responses yielded fewer than 4 significant criteria on the ASRS Part A screener. While periodic focus or organization difficulties may be present, the overall pattern does not meet the typical screening cutoff for adult ADHD.',
      recommendation:
        'If you still experience functional impairment or chronic executive fatigue, discussing your symptoms with a healthcare professional can help explore related factors like sleep, stress, or sensory processing.',
    },
  },
};
