# Adult ADHD & Autism Self-Screening Module (`features/screening/`)

A privacy-first, validated self-screening module for adults (18+) built with React and client-side psychometric scoring.

---

## 📋 Included Instruments & Licenses

1. **Adult ADHD Self-Report Scale (ASRS-v1.1) 6-Question Screener**
   - **Citation:** Kessler RC, Adler L, Ames M, Demler O, Faraone S, Hiripi E, Howes MJ, Jin R, Secnik K, Spencer T, Ustun TB, Walters EE (2005). The World Health Organization Adult ADHD Self-Report Scale (ASRS). *Psychological Medicine*, 35(2), 245–256.
   - **Copyright:** © World Health Organization & Harvard Medical School. Free for non-commercial screening and educational use.

2. **Autism Spectrum Quotient 10-Item Adult (AQ-10)**
   - **Citation:** Allison C, Auyeung B, Baron-Cohen S (2012). Toward brief “red flags” for autism spectrum conditions: The Short Autism Spectrum Quotient and the Short Quantitative Checklist for Autism in toddlers in screening and assessment. *Journal of the American Academy of Child & Adolescent Psychiatry*, 51(2), 202–212.
   - **Copyright:** © Autism Research Centre, University of Cambridge. Recommended by UK NICE clinical guidelines.

3. **Camouflaging Autistic Traits Questionnaire (CAT-Q)**
   - **Citation:** Hull L, Mandy W, Lai MC, Baron-Cohen S, Allison C, Smith P, Petrides KV (2018). Development and Validation of the Camouflaging Autistic Traits Questionnaire (CAT-Q). *Journal of Autism and Developmental Disorders*, 49(3), 819–833.
   - **Copyright:** © 2018 Laura Hull and colleagues. Open access.

---

## 🛠️ How to Add a New Questionnaire

The screening engine is 100% data-driven. Adding a new questionnaire does **not** require modifying the UI components:

1. **Create a Config File** in `tests/<testId>.js`:
```javascript
export const myNewTest = {
  id: 'my_test',
  name: 'Full Instrument Name',
  shortName: 'Brief Name',
  condition: 'Target Domain (e.g. Sensory Processing)',
  minAge: 18,
  description: 'Clinical summary of the instrument.',
  citation: 'Author et al. (Year). Journal, Vol(Issue), Pages.',
  copyrightNotice: 'Copyright holder and usage terms.',
  scale: [
    { value: 0, label: 'Never' },
    { value: 1, label: 'Sometimes' },
    { value: 2, label: 'Often' },
  ],
  items: [
    { id: 'item_1', number: 1, text: 'Question text here...' },
  ],
  scoringStrategy: 'my_strategy', // Handle in engine/scorer.js
  thresholds: { cutoff: 10 },
  interpretations: {
    positive: { headline: '...', summary: '...' },
    negative: { headline: '...', summary: '...' },
  },
};
```

2. **Register the Strategy** in `engine/scorer.js` if it uses a unique scoring method.
3. **Register the Test & Add to Flows** in `tests/index.js`.
