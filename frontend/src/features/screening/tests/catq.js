/**
 * Camouflaging Autistic Traits Questionnaire (CAT-Q)
 * Citation: Hull, L., Mandy, W., Lai, M.C., Baron-Cohen, S., Allison, C., Smith, P., & Petrides, K.V. (2018).
 * Development and Validation of the Camouflaging Autistic Traits Questionnaire (CAT-Q).
 * Journal of Autism and Developmental Disorders, 49(3), 819-833.
 */

export const catq = {
  id: 'catq',
  name: 'Camouflaging Autistic Traits Questionnaire (CAT-Q)',
  shortName: 'Autism Camouflaging (CAT-Q)',
  condition: 'Camouflaging / Masking',
  minAge: 18,
  description:
    'A 25-item self-report measure of social camouflaging (masking, compensating, and assimilating) behaviors in autistic and non-autistic adults.',
  citation: 'Hull et al. (2018). J Autism Dev Disord, 49(3), 819-833.',
  copyrightNotice:
    'CAT-Q © 2018 Laura Hull and colleagues. Used for non-commercial educational and screening purposes.',
  scale: [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Somewhat Disagree' },
    { value: 4, label: 'Neither Agree nor Disagree' },
    { value: 5, label: 'Somewhat Agree' },
    { value: 6, label: 'Agree' },
    { value: 7, label: 'Strongly Agree' },
  ],
  subscales: {
    compensation: {
      name: 'Compensation',
      description: 'Actively learning social rules, rehearsing scripts, and finding ways to navigate social interaction artificially.',
      itemNumbers: [1, 4, 5, 8, 11, 14, 17, 20, 23],
    },
    masking: {
      name: 'Masking',
      description: 'Hiding autistic traits or presenting a non-autistic persona to blend in with peers.',
      itemNumbers: [2, 6, 9, 12, 15, 18, 21, 24],
    },
    assimilation: {
      name: 'Assimilation',
      description: 'Trying to fit in with others, avoiding social rejection, or feeling unable to be authentic around others.',
      itemNumbers: [3, 7, 10, 13, 16, 19, 22, 25],
    },
  },
  items: [
    { id: 'catq_1', number: 1, text: 'When I am interacting with someone, I deliberately copy their body language or facial expressions.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_2', number: 2, text: 'I monitor my body language or facial expressions so that I appear relaxed.', subscale: 'masking', reverseScored: false },
    { id: 'catq_3', number: 3, text: 'I rarely feel the need to put on an act in order to get through a social situation.', subscale: 'assimilation', reverseScored: true },
    { id: 'catq_4', number: 4, text: 'I have developed a script to follow in social situations.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_5', number: 5, text: 'I repeat sentences that I have heard other people say in social situations.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_6', number: 6, text: 'I adjust my body language or facial expressions so that I appear interested by the person I am talking to.', subscale: 'masking', reverseScored: false },
    { id: 'catq_7', number: 7, text: 'In social situations, I feel like I am pretending to be normal.', subscale: 'assimilation', reverseScored: false },
    { id: 'catq_8', number: 8, text: 'I learn how people use their bodies and faces in social interaction by watching television and films, or by reading fiction.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_9', number: 9, text: 'I make sure that I make the “right” amount of eye contact with others.', subscale: 'masking', reverseScored: false },
    { id: 'catq_10', number: 10, text: 'I have to force myself to interact with people when I am in social situations.', subscale: 'assimilation', reverseScored: false },
    { id: 'catq_11', number: 11, text: 'I have researched rules of social interaction in order to improve my social skills.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_12', number: 12, text: 'I am always myself, even when I am around other people.', subscale: 'masking', reverseScored: true },
    { id: 'catq_13', number: 13, text: 'I feel pressured to act in the same way as other people in social situations.', subscale: 'assimilation', reverseScored: false },
    { id: 'catq_14', number: 14, text: 'I practice social interactions with other people in my head before they happen.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_15', number: 15, text: 'I think about what my face and body look like when I am talking to someone.', subscale: 'masking', reverseScored: false },
    { id: 'catq_16', number: 16, text: 'I feel free to be myself when I am with other people.', subscale: 'assimilation', reverseScored: true }, // wait item 16 note
    { id: 'catq_17', number: 17, text: 'I use my knowledge of social rules to help me navigate social situations.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_18', number: 18, text: 'I make sure that I smile or laugh at appropriate times in a conversation.', subscale: 'masking', reverseScored: false },
    { id: 'catq_19', number: 19, text: 'I find it easy to be myself in social situations.', subscale: 'assimilation', reverseScored: true },
    { id: 'catq_20', number: 20, text: 'I try to find out what other people are interested in so that I can talk to them about it.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_21', number: 21, text: 'I am aware of how my body language or facial expressions look to other people.', subscale: 'masking', reverseScored: false },
    { id: 'catq_22', number: 22, text: 'I do not feel the need to hide my true thoughts and feelings in social situations.', subscale: 'assimilation', reverseScored: true },
    { id: 'catq_23', number: 23, text: 'I use phrases that other people say when talking to others.', subscale: 'compensation', reverseScored: false },
    { id: 'catq_24', number: 24, text: 'I do not monitor my body language or facial expressions during social situations.', subscale: 'masking', reverseScored: true },
    { id: 'catq_25', number: 25, text: 'In social situations, I feel like I am performing on stage.', subscale: 'assimilation', reverseScored: false },
  ],
  scoringStrategy: 'catq_likert',
  reverseScoredItemNumbers: [3, 12, 19, 22, 24],
  thresholds: {
    clinicalCutoff: 100, // ~100+ suggests significant camouflaging
    minScore: 25,
    maxScore: 175,
  },
  interpretations: {
    elevatedCamouflaging: {
      headline: 'Elevated Social Camouflaging & Masking Traits',
      summary:
        'Your total CAT-Q score is 100 or higher. This suggests a significant tendency to mask autistic traits, cognitively compensate for social communication differences, and assimilate to neurotypical expectations.',
      note:
        'High camouflaging often masks underlying autistic differences on standard screeners and is strongly associated with social exhaustion, chronic anxiety, and autistic burnout. Scores can also be elevated by generalized or social anxiety.',
    },
    typicalCamouflaging: {
      headline: 'Low-to-Moderate Social Camouflaging',
      summary:
        'Your total CAT-Q score is below 100, indicating lower levels of explicit masking or conscious compensatory social strategizing in daily life.',
    },
  },
};
