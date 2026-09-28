import { asrs6 } from './asrs6.js';
import { aq10 } from './aq10.js';
import { catq } from './catq.js';
import { mchat } from './mchat.js';
import { aqChild } from './aqChild.js';
import { vanderbilt } from './vanderbilt.js';
import { raadsR } from './raadsR.js';
import { aq50 } from './aq50.js';
import { rbq2a } from './rbq2a.js';

export const SCREENER_REGISTRY = {
  asrs6,
  aq10,
  catq,
  mchat,
  aq_child: aqChild,
  vanderbilt,
  raads_r: raadsR,
  aq50,
  rbq2a,
};

export const SCREENING_FLOWS = [
  // Pediatric Flows (Parent / Caregiver Assisted)
  {
    id: 'pediatric_mchat',
    targetAgeGroup: 'toddler',
    title: 'Toddler Autism Screen (M-CHAT-R/F)',
    badge: '16–30 Months',
    duration: '~5 mins',
    respondent: 'Parent / Caregiver Assisted',
    description: 'The standard 20-item parent screener for autism risk in toddlers aged 16 to 30 months (Robins et al.).',
    testIds: ['mchat'],
  },
  {
    id: 'pediatric_child',
    targetAgeGroup: 'child',
    title: 'Child & Adolescent Autism Screen (AQ-Child)',
    badge: 'Ages 4–15',
    duration: '~5 mins',
    respondent: 'Parent / Caregiver Assisted',
    description: 'Parent-report screening framework for school-age children (Auyeung & Baron-Cohen).',
    testIds: ['aq_child'],
  },

  // Adult Flows (18+ Self-Report)
  {
    id: 'quick_audhd',
    targetAgeGroup: 'adult',
    title: 'Adult Quick AuDHD Screen',
    badge: 'Recommended (18+)',
    duration: '~5 mins',
    respondent: 'Self-Report',
    description: 'The dual-screening pairing: ASRS-6 for ADHD traits plus AQ-10 for core autistic traits.',
    testIds: ['asrs6', 'aq10'],
  },
  {
    id: 'extended_audhd',
    targetAgeGroup: 'adult',
    title: 'Adult Extended AuDHD Screen (+ Camouflaging)',
    badge: 'Comprehensive (18+)',
    duration: '~10-12 mins',
    respondent: 'Self-Report',
    description: 'Includes ASRS-6, AQ-10, and the 25-item CAT-Q to detect high masking and social compensation.',
    testIds: ['asrs6', 'aq10', 'catq'],
  },
];
