/**
 * NICHQ Vanderbilt Assessment Scale (Parent Informant)
 * Pediatric ADHD Screener (Ages 4 to 15)
 * Completed by Parent / Caregiver.
 * Citation: Wolraich, M. L., et al. (2003). Journal of Pediatric Psychology, 28(8), 559–568.
 */

export const vanderbilt = {
  id: 'vanderbilt',
  name: 'NICHQ Vanderbilt Assessment Scale (Parent Informant)',
  shortName: 'Child ADHD Screen (Vanderbilt)',
  condition: 'ADHD (Pediatric)',
  minAgeYears: 4,
  maxAgeYears: 15,
  targetRespondent: 'Parent / Caregiver',
  description:
    'A standardized parent rating scale evaluating inattentive and hyperactive/impulsive behaviors in children aged 4 to 15.',
  citation: 'Wolraich, M. L., et al. (2003). Journal of Pediatric Psychology, 28(8), 559–568.',
  copyrightNotice:
    '© 2002 American Academy of Pediatrics and National Institute for Children’s Health Quality (NICHQ).',
  scale: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Occasionally' },
    { value: 2, label: 'Often' },
    { value: 3, label: 'Very Often' },
  ],
  items: [
    // Inattentive Subscale (Items 1-9)
    { id: 'vbd_1', number: 1, text: 'Does not pay close attention to details or makes careless mistakes with schoolwork or other tasks', subscale: 'inattentive' },
    { id: 'vbd_2', number: 2, text: 'Has difficulty sustaining attention on tasks or play activities', subscale: 'inattentive' },
    { id: 'vbd_3', number: 3, text: 'Does not seem to listen when spoken to directly', subscale: 'inattentive' },
    { id: 'vbd_4', number: 4, text: 'Does not follow through on instructions and fails to finish schoolwork or chores', subscale: 'inattentive' },
    { id: 'vbd_5', number: 5, text: 'Has difficulty organizing tasks and activities', subscale: 'inattentive' },
    { id: 'vbd_6', number: 6, text: 'Avoids, dislikes, or is reluctant to engage in tasks requiring sustained mental effort', subscale: 'inattentive' },
    { id: 'vbd_7', number: 7, text: 'Loses things necessary for tasks or activities (e.g. toys, school assignments, pencils, books)', subscale: 'inattentive' },
    { id: 'vbd_8', number: 8, text: 'Is easily distracted by extraneous noises or stimuli', subscale: 'inattentive' },
    { id: 'vbd_9', number: 9, text: 'Is forgetful in daily activities', subscale: 'inattentive' },
    // Hyperactive/Impulsive Subscale (Items 10-18)
    { id: 'vbd_10', number: 10, text: 'Fidgets with hands or feet or squirms in seat', subscale: 'hyperactive' },
    { id: 'vbd_11', number: 11, text: 'Leaves seat in situations in which remaining seated is expected', subscale: 'hyperactive' },
    { id: 'vbd_12', number: 12, text: 'Runs about or climbs excessively in situations in which it is inappropriate', subscale: 'hyperactive' },
    { id: 'vbd_13', number: 13, text: 'Has difficulty playing or engaging in leisure activities quietly', subscale: 'hyperactive' },
    { id: 'vbd_14', number: 14, text: 'Is "on the go" or often acts as if "driven by a motor"', subscale: 'hyperactive' },
    { id: 'vbd_15', number: 15, text: 'Talks excessively', subscale: 'hyperactive' },
    { id: 'vbd_16', number: 16, text: 'Blurts out answers before questions have been completed', subscale: 'hyperactive' },
    { id: 'vbd_17', number: 17, text: 'Has difficulty awaiting turn', subscale: 'hyperactive' },
    { id: 'vbd_18', number: 18, text: 'Interrupts or intrudes on others (e.g. butts into conversations or games)', subscale: 'hyperactive' },
  ],
  scoringStrategy: 'vanderbilt_scoring',
  thresholds: {
    cutoffPerSubscale: 6,
  },
};
