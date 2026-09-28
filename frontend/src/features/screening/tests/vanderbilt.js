/**
 * NICHQ Vanderbilt Assessment Scale (Parent Informant)
 * Pediatric ADHD & Comorbidity Screener
 * Target Age: Children aged 6 to 12 years.
 * Completed by Parent / Caregiver.
 *
 * LICENSING NOTICE:
 * Developed by Mark L. Wolraich, MD, and distributed by the National Institute for Children's Health
 * Quality (NICHQ) and American Academy of Pediatrics (AAP). Copyright © 2002 AAP & NICHQ.
 * Item texts are held as placeholders pending formal electronic licensing.
 */

export const vanderbilt = {
  id: 'vanderbilt',
  name: 'NICHQ Vanderbilt Assessment Scale (Parent Informant)',
  shortName: 'Pediatric ADHD Screen (Vanderbilt)',
  condition: 'ADHD (Pediatric)',
  minAgeYears: 6,
  maxAgeYears: 12,
  targetRespondent: 'Parent / Caregiver',
  description:
    'A standardized parent rating scale evaluating inattentive and hyperactive/impulsive symptoms alongside comorbid behavioral indicators in children aged 6 to 12.',
  citation: 'Wolraich, M. L., et al. (2003). Journal of Pediatric Psychology, 28(8), 559–568.',
  copyrightNotice:
    '© 2002 American Academy of Pediatrics and National Institute for Children’s Health Quality (NICHQ). Item text held as placeholder.',
  isStub: true,
  items: [],
  scale: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Occasionally' },
    { value: 2, label: 'Often' },
    { value: 3, label: 'Very Often' },
  ],
  guidanceMessage:
    'Vanderbilt evaluation requires multi-informant (parent + teacher) behavioral checklists alongside a clinical diagnostic interview. Placeholder active pending electronic license confirmation.',
};
