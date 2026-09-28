import { asrs6 } from './asrs6';
import { aq10 } from './aq10';
import { catq } from './catq';
import { raadsRStub, aq50Stub, rbq2aStub } from './stubs';

export const SCREENER_REGISTRY = {
  asrs6,
  aq10,
  catq,
  raads_r: raadsRStub,
  aq50: aq50Stub,
  rbq2a: rbq2aStub,
};

export const SCREENING_FLOWS = [
  {
    id: 'quick_audhd',
    title: 'Quick AuDHD Screen',
    badge: 'Recommended',
    duration: '~5 mins',
    description: 'The standard adult dual-screen pairing: ASRS-6 for ADHD traits plus AQ-10 for core autistic traits.',
    testIds: ['asrs6', 'aq10'],
  },
  {
    id: 'extended_audhd',
    title: 'Extended AuDHD Screen (+ Camouflaging)',
    badge: 'Comprehensive',
    duration: '~10-12 mins',
    description: 'Includes ASRS-6, AQ-10, and the 25-item CAT-Q to detect high masking, social compensation, and assimilation.',
    testIds: ['asrs6', 'aq10', 'catq'],
  },
  {
    id: 'adhd_single',
    title: 'ADHD Screener Only (ASRS v1.1)',
    badge: 'Focused',
    duration: '~2-3 mins',
    description: 'The World Health Organization 6-question adult ADHD screener (Kessler et al.).',
    testIds: ['asrs6'],
  },
  {
    id: 'autism_single',
    title: 'Autism Screener Only (AQ-10)',
    badge: 'Focused',
    duration: '~3-4 mins',
    description: 'The 10-item Autism Spectrum Quotient adult screener recommended by NICE guidelines.',
    testIds: ['aq10'],
  },
  {
    id: 'catq_single',
    title: 'Camouflaging / Masking Only (CAT-Q)',
    badge: 'Deep Dive',
    duration: '~5-6 mins',
    description: 'Evaluates conscious and subconscious compensation and social masking strategies (Hull et al.).',
    testIds: ['catq'],
  },
];
