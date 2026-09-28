/**
 * Autism Spectrum Quotient 10-Item Adult (AQ-10)
 * Citation: Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief “red flags” for autism
 * spectrum conditions: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for
 * Autism in toddlers in screening and assessment. Journal of the American Academy of Child &
 * Adolescent Psychiatry, 51(2), 202-212.
 *
 * Developed by the Autism Research Centre (ARC), University of Cambridge.
 */

export const aq10 = {
  id: 'aq10',
  name: 'Autism Spectrum Quotient (AQ-10 Adult)',
  shortName: 'Autism Quick Screen (AQ-10)',
  condition: 'Autism',
  minAge: 18,
  description:
    'A brief 10-item screening questionnaire recommended by NICE guidelines to assess whether an adult exhibits traits that warrant a comprehensive autism assessment.',
  citation: 'Allison, Auyeung, & Baron-Cohen (2012). JAACAP, 51(2), 202-212.',
  copyrightNotice:
    'Autism Spectrum Quotient (AQ-10) © Autism Research Centre, University of Cambridge. Used for non-commercial screening and awareness.',
  scale: [
    { value: 'definitely_agree', label: 'Definitely Agree' },
    { value: 'slightly_agree', label: 'Slightly Agree' },
    { value: 'slightly_disagree', label: 'Slightly Disagree' },
    { value: 'definitely_disagree', label: 'Definitely Disagree' },
  ],
  items: [
    {
      id: 'aq_1',
      number: 1,
      text: 'I often notice small sounds when others do not.',
      scoredDirection: 'agree', // 1 pt for definitely/slightly agree
    },
    {
      id: 'aq_2',
      number: 2,
      text: 'I usually concentrate more on the whole picture, rather than the small details.',
      scoredDirection: 'disagree', // 1 pt for definitely/slightly disagree
    },
    {
      id: 'aq_3',
      number: 3,
      text: 'I find it easy to do more than one thing at once.',
      scoredDirection: 'disagree',
    },
    {
      id: 'aq_4',
      number: 4,
      text: 'If there is an interruption, I can switch back to what I was doing very quickly.',
      scoredDirection: 'disagree',
    },
    {
      id: 'aq_5',
      number: 5,
      text: 'I find it easy to “read between the lines” when someone is talking to me.',
      scoredDirection: 'disagree',
    },
    {
      id: 'aq_6',
      number: 6,
      text: 'I know how to tell if someone listening to me is getting bored.',
      scoredDirection: 'disagree',
    },
    {
      id: 'aq_7',
      number: 7,
      text: 'When I’m reading a story I find it difficult to work out the characters’ intentions.',
      scoredDirection: 'agree',
    },
    {
      id: 'aq_8',
      number: 8,
      text: 'I like to collect information about categories of things (e.g. types of car, types of bird, types of train, types of plant).',
      scoredDirection: 'agree',
    },
    {
      id: 'aq_9',
      number: 9,
      text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face.',
      scoredDirection: 'disagree',
    },
    {
      id: 'aq_10',
      number: 10,
      text: 'I find it difficult to work out people’s intentions.',
      scoredDirection: 'agree',
    },
  ],
  scoringStrategy: 'aq10_binary',
  thresholds: {
    cutoff: 6, // 6 or more suggests further diagnostic assessment
    maxScore: 10,
  },
  interpretations: {
    aboveCutoff: {
      headline: 'Traits Consistent with the Autism Spectrum',
      summary:
        'Your score is 6 or higher out of 10. According to clinical validation studies and NICE screening guidelines, this score indicates patterns of social communication, attention to detail, or sensory differences frequently shared by autistic individuals.',
      recommendation:
        'A comprehensive diagnostic assessment with a clinical psychologist or psychiatrist specializing in adult autism is recommended to explore these findings further.',
    },
    belowCutoff: {
      headline: 'Traits Below Conventional Autism Screening Cutoff',
      summary:
        'Your score is below 6 out of 10. This indicates fewer observable traits aligned with the core criteria screened by the AQ-10.',
      recommendation:
        'Note that brief screeners can sometimes miss subtle presentations, particularly in individuals with high camouflaging/masking tendencies (see CAT-Q screener).',
    },
  },
};
