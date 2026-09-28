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
    { id: 'mc_1', number: 1, text: 'If you point at something across the room, does your child look at it? (FOR EXAMPLE, if you point at a toy or an animal, does your child look at the toy or animal?)', atRiskAnswer: 'no' },
    { id: 'mc_2', number: 2, text: 'Have you ever wondered if your child might be deaf?', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_3', number: 3, text: 'Does your child play pretend or make-believe? (FOR EXAMPLE, pretend to drink from an empty cup, talk on a toy phone, or feed a doll or stuffed animal?)', atRiskAnswer: 'no' },
    { id: 'mc_4', number: 4, text: 'Does your child like climbing on things? (FOR EXAMPLE, furniture, playground equipment, or stairs?)', atRiskAnswer: 'no' },
    { id: 'mc_5', number: 5, text: 'Does your child make unusual finger movements near his or her eyes? (FOR EXAMPLE, does your child wiggle his or her fingers close to his or her eyes?)', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_6', number: 6, text: 'Does your child point with one finger to ask for something or to get help? (FOR EXAMPLE, pointing to a snack or toy that is out of reach?)', atRiskAnswer: 'no' },
    { id: 'mc_7', number: 7, text: 'Does your child point with one finger to show you something interesting? (FOR EXAMPLE, pointing to an airplane in the sky or a big truck in the street?)', atRiskAnswer: 'no' },
    { id: 'mc_8', number: 8, text: 'Is your child interested in other children? (FOR EXAMPLE, does your child look at other children, smile at them, or go to them?)', atRiskAnswer: 'no' },
    { id: 'mc_9', number: 9, text: 'Does your child show you things by bringing them to you or holding them up for you to see – not to get help, but just to share? (FOR EXAMPLE, showing you a flower, a stuffed animal, or a toy truck?)', atRiskAnswer: 'no' },
    { id: 'mc_10', number: 10, text: 'Does your child respond when you call his or her name? (FOR EXAMPLE, does he or she look up, talk or babble, or stop what he or she is doing when you call his or her name?)', atRiskAnswer: 'no' },
    { id: 'mc_11', number: 11, text: 'When you smile at your child, does he or she smile back at you?', atRiskAnswer: 'no' },
    { id: 'mc_12', number: 12, text: 'Does your child get upset by everyday noises? (FOR EXAMPLE, does your child scream or cry to noise such as a vacuum cleaner or loud music?)', atRiskAnswer: 'yes' }, // reverse
    { id: 'mc_13', number: 13, text: 'Does your child walk?', atRiskAnswer: 'no' },
    { id: 'mc_14', number: 14, text: 'Does your child look you in the eye when you are talking to him or her, playing with him or her, or dressing him or her?', atRiskAnswer: 'no' },
    { id: 'mc_15', number: 15, text: 'Does your child try to copy what you do? (FOR EXAMPLE, wave bye-bye, clap, or make a funny noise when you do?)', atRiskAnswer: 'no' },
    { id: 'mc_16', number: 16, text: 'If you turn your head to look at something, does your child look around to see what you are looking at?', atRiskAnswer: 'no' },
    { id: 'mc_17', number: 17, text: 'Does your child try to get you to watch him or her? (FOR EXAMPLE, does your child look at you for praise, or say "look" or "watch me"?)', atRiskAnswer: 'no' },
    { id: 'mc_18', number: 18, text: 'Does your child understand when you tell him or her to do something? (FOR EXAMPLE, if you don’t point, can your child understand "put the book on the chair" or "bring me the blanket"?)', atRiskAnswer: 'no' },
    { id: 'mc_19', number: 19, text: 'If something new happens, does your child look at your face to see how you feel about it? (FOR EXAMPLE, if he or she hears a strange or funny noise, or sees a new toy, will he or she look at your face?)', atRiskAnswer: 'no' },
    { id: 'mc_20', number: 20, text: 'Does your child like movement activities? (FOR EXAMPLE, being swung or bounced on your knee?)', atRiskAnswer: 'no' },
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
