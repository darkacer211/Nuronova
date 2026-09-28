/**
 * Modified Checklist for Autism in Toddlers, Revised with Follow-Up (M-CHAT-R/F)
 * Citation: Robins, D. L., Fein, D., & Barton, M. L. (2009). The Modified Checklist for Autism
 * in Toddlers, Revised with Follow-Up (M-CHAT-R/F).
 *
 * LICENSING NOTICE:
 * The M-CHAT-R/F is free for clinical, research, and educational use. However, incorporating it
 * into electronic products or commercial software requires explicit author permission via mchatscreen.com.
 * To respect author copyright (© 2009 Robins, Fein, & Barton), item texts and Follow-Up trees are
 * structured as placeholders until authorized text is supplied.
 */

export const mchat = {
  id: 'mchat',
  name: 'Modified Checklist for Autism in Toddlers (M-CHAT-R/F)',
  shortName: 'Toddler Autism Screen (M-CHAT-R/F)',
  condition: 'Autism (Pediatric)',
  minAgeMonths: 16,
  maxAgeMonths: 30,
  targetRespondent: 'Parent / Caregiver',
  description:
    'A validated parent-report screening tool designed to evaluate risk for Autism Spectrum Disorder (ASD) in toddlers aged 16 to 30 months.',
  citation: 'Robins, Fein, & Barton (2009). Pediatrics, 133(1), 37-45.',
  copyrightNotice:
    '© 2009 Diana Robins, Deborah Fein, & Marianne Barton. Used under clinical screening terms with item placeholders pending electronic license confirmation.',
  scale: [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
  ],
  // 20 items: reverse-keyed items are 2, 5, 12 (where 'Yes' = at-risk point)
  // All other items are standard keyed (where 'No' = at-risk point)
  items: [
    { id: 'mc_1', number: 1, text: '[Item 1 Placeholder: Points to objects of interest - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_2', number: 2, text: '[Item 2 Placeholder: Hearing sensitivity / suspected deafness - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_3', number: 3, text: '[Item 3 Placeholder: Pretend play behaviors - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_4', number: 4, text: '[Item 4 Placeholder: Climbing on objects - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_5', number: 5, text: '[Item 5 Placeholder: Unusual finger movements near eyes - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_6', number: 6, text: '[Item 6 Placeholder: Pointing to ask for something - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_7', number: 7, text: '[Item 7 Placeholder: Pointing to show something interesting - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_8', number: 8, text: '[Item 8 Placeholder: Interest in other children - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_9', number: 9, text: '[Item 9 Placeholder: Showing objects to parents - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_10', number: 10, text: '[Item 10 Placeholder: Responds to name when called - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_11', number: 11, text: '[Item 11 Placeholder: Smiles back when smiled at - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_12', number: 12, text: '[Item 12 Placeholder: Upset by everyday noises - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_13', number: 13, text: '[Item 13 Placeholder: Walking ability - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_14', number: 14, text: '[Item 14 Placeholder: Looks at parent’s eyes when talking/playing - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_15', number: 15, text: '[Item 15 Placeholder: Imitating parent’s actions - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_16', number: 16, text: '[Item 16 Placeholder: Turns head to look at what parent is looking at - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_17', number: 17, text: '[Item 17 Placeholder: Attempts to get parent to watch them - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_18', number: 18, text: '[Item 18 Placeholder: Understands verbal requests - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_19', number: 19, text: '[Item 19 Placeholder: Looks at parent’s face in new situations - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
    { id: 'mc_20', number: 20, text: '[Item 20 Placeholder: Enjoys movement and sensory activities - Licensed text required © 2009 Robins et al.]', atRiskAnswer: 'no' },
  ],
  scoringStrategy: 'mchat_scoring',
  thresholds: {
    lowRiskMax: 2,       // 0-2 = Low Risk
    mediumRiskMax: 7,    // 3-7 = Medium Risk (triggers Follow-Up)
    highRiskMin: 8,      // 8-20 = High Risk (immediate referral)
  },
  interpretations: {
    lowRisk: {
      headline: 'Low Risk for Autism Spectrum Differences',
      summary:
        'Your responses yielded a score of 0–2. If your child is younger than 24 months, standard clinical guidelines recommend rescreening after their second birthday. No additional screening action is currently indicated unless developmental concerns emerge.',
      recommendation:
        'Continue regular pediatric developmental well-checks. If you develop concerns regarding speech, social reciprocity, or motor milestones, discuss them with your pediatrician.',
    },
    mediumRisk: {
      headline: 'Medium Risk: Developmental Follow-Up Recommended',
      summary:
        'Your initial responses yielded a score of 3–7. In standard clinical practice, this triggers the M-CHAT-R/F structured Follow-Up interview to clarify specific social and communication behaviors.',
      recommendation:
        'If 2 or more items remain elevated after clarification, a comprehensive developmental evaluation by a pediatrician or early childhood intervention specialist is strongly recommended.',
    },
    highRisk: {
      headline: 'Elevated Risk: Comprehensive Developmental Evaluation Advised',
      summary:
        'Your responses yielded a score of 8 or higher. At this level, clinical guidelines bypass follow-up interviews and recommend immediate evaluation for developmental support.',
      recommendation:
        'Contact your pediatrician promptly to request a comprehensive developmental evaluation and referral to early intervention services. Early support significantly benefits social, communication, and motor development.',
    },
  },
};
