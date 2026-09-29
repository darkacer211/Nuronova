/**
 * Autism Spectrum Quotient - Child Version (AQ-10 Child)
 * Target Age: Children and adolescents roughly 4 to 15 years old.
 * Completed by Parent / Caregiver.
 * Citation: Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief “red flags” for autism
 * spectrum conditions: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for
 * Autism in toddlers in screening and assessment. Journal of the American Academy of Child &
 * Adolescent Psychiatry, 51(2), 202-212.
 */

export const aqChild = {
  id: 'aq_child',
  name: 'Autism Spectrum Quotient - Child Version (AQ-10 Child)',
  shortName: 'Child Autism Screen (AQ-10 Child)',
  condition: 'Autism (Childhood / Adolescent)',
  minAgeYears: 4,
  maxAgeYears: 15,
  targetRespondent: 'Parent / Caregiver',
  description:
    'A validated 10-item parent-report screening instrument for school-age children (ages 4 to 15 years) assessing social communication and focused interest traits.',
  citation: 'Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). J Am Acad Child Adolesc Psychiatry, 51(2), 202-212.',
  copyrightNotice:
    '© Autism Research Centre, University of Cambridge. Free for clinical and informational screening.',
  scale: [
    { value: 'definitely_agree', label: 'Definitely Agree' },
    { value: 'slightly_agree', label: 'Slightly Agree' },
    { value: 'slightly_disagree', label: 'Slightly Disagree' },
    { value: 'definitely_disagree', label: 'Definitely Disagree' },
  ],
  items: [
    { id: 'aqc_1', number: 1, text: 'S/he often notices small sounds when others do not.', scoredDirection: 'agree' },
    { id: 'aqc_2', number: 2, text: 'S/he usually concentrates more on the whole picture, rather than the small details.', scoredDirection: 'disagree' },
    { id: 'aqc_3', number: 3, text: 'In a social group, s/he can easily keep track of several different people’s conversations.', scoredDirection: 'disagree' },
    { id: 'aqc_4', number: 4, text: 'S/he finds it easy to go between different activities.', scoredDirection: 'disagree' },
    { id: 'aqc_5', number: 5, text: 'S/he doesn’t know how to keep a conversation going with his/her peers.', scoredDirection: 'agree' },
    { id: 'aqc_6', number: 6, text: 'S/he is good at social chit-chat.', scoredDirection: 'disagree' },
    { id: 'aqc_7', number: 7, text: 'When s/he is reading a story, s/he finds it difficult to work out the characters’ intentions or feelings.', scoredDirection: 'agree' },
    { id: 'aqc_8', number: 8, text: 'When s/he was in preschool, s/he used to enjoy playing games involving pretending with other children.', scoredDirection: 'disagree' },
    { id: 'aqc_9', number: 9, text: 'S/he finds it easy to work out what someone is thinking or feeling just by looking at their face.', scoredDirection: 'disagree' },
    { id: 'aqc_10', number: 10, text: 'S/he finds it difficult to make new friends.', scoredDirection: 'agree' },
  ],
  scoringStrategy: 'aq10_binary',
  thresholds: {
    cutoff: 6,
    maxScore: 10,
  },
  interpretations: {
    aboveCutoff: {
      headline: 'Elevated Traits Consistent with Childhood Autism Spectrum',
      summary: 'Parent report indicates 6 or more traits aligned with the childhood autism spectrum profile.',
      recommendation: 'A comprehensive pediatric developmental evaluation with a child psychologist or developmental pediatrician is recommended.',
    },
    belowCutoff: {
      headline: 'Traits Below Conventional Child Autism Cutoff',
      summary: 'Parent report indicates traits below the screening threshold for childhood autism spectrum conditions.',
      recommendation: 'Continue routine developmental tracking with your child’s pediatrician and educational team.',
    },
  },
};
