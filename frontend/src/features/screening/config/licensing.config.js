/**
 * Central Licensing & Instrument Rights Registry
 *
 * Tracks legal status, copyright notices, author permission contacts,
 * and whether official authorized item text has been supplied.
 *
 * Status Options:
 * - 'licensed': Formal commercial/electronic agreement secured.
 * - 'free-with-conditions': Public/open-access research instrument permissible under clinical/educational terms.
 * - 'permission-pending': Proprietary/copyrighted scale held with clearly marked placeholders until authorized text is supplied.
 */

export const LICENSING_STATUS = {
  LICENSED: 'licensed',
  FREE_WITH_CONDITIONS: 'free-with-conditions',
  PERMISSION_PENDING: 'permission-pending',
};

export const INSTRUMENT_LICENSES = {
  asrs6: {
    id: 'asrs6',
    name: 'Adult ADHD Self-Report Scale (ASRS-v1.1) 6-Question Screener',
    status: LICENSING_STATUS.FREE_WITH_CONDITIONS,
    requiredCopyright:
      '© World Health Organization / Harvard Medical School. All rights reserved. Free for clinical, research, and non-commercial self-screening use.',
    permissionContact: 'World Health Organization (permissions@who.int)',
    citation: 'Kessler, R.C., et al. (2005). Psychological Medicine, 35(2), 245-256.',
    textLoaded: true,
    isPlaceholderOnly: false,
  },
  aq10: {
    id: 'aq10',
    name: 'Autism Spectrum Quotient 10-Item (AQ-10 Adult)',
    status: LICENSING_STATUS.FREE_WITH_CONDITIONS,
    requiredCopyright:
      '© Autism Research Centre (ARC), University of Cambridge. Open-access published clinical screening instrument (NICE Clinical Guideline CG142 recommended).',
    permissionContact: 'Autism Research Centre (arc-admin@medschl.cam.ac.uk)',
    citation: 'Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). J Am Acad Child Adolesc Psychiatry, 51(2), 202-212.',
    textLoaded: true,
    isPlaceholderOnly: false,
  },
  catq: {
    id: 'catq',
    name: 'Camouflaging Autistic Traits Questionnaire (CAT-Q)',
    status: LICENSING_STATUS.FREE_WITH_CONDITIONS,
    requiredCopyright:
      '© Hull et al. (2019). Published under Creative Commons Attribution 4.0 International License (CC-BY 4.0).',
    permissionContact: 'Laura Hull (University College London / University of Bristol)',
    citation: 'Hull, L., et al. (2019). Molecular Autism, 10, Article 43.',
    textLoaded: true,
    isPlaceholderOnly: false,
  },
  mchat: {
    id: 'mchat',
    name: 'Modified Checklist for Autism in Toddlers, Revised with Follow-Up (M-CHAT-R/F)',
    status: LICENSING_STATUS.FREE_WITH_CONDITIONS,
    requiredCopyright:
      '© 2009 Diana Robins, Deborah Fein, & Marianne Barton. Authorized for clinical and research screening.',
    permissionContact: 'Dr. Diana Robins / mchatscreen.com (contact@mchatscreen.com)',
    citation: 'Robins, D. L., Fein, D., & Barton, M. L. (2009). Pediatrics, 133(1), 37-45.',
    textLoaded: true,
    isPlaceholderOnly: false,
  },
  aq_child: {
    id: 'aq_child',
    name: 'Autism Spectrum Quotient - Child Version (AQ-Child / CAST)',
    status: LICENSING_STATUS.PERMISSION_PENDING,
    requiredCopyright:
      '© Autism Research Centre, University of Cambridge. Electronic clinical distribution pending formal licensing agreement.',
    permissionContact: 'Autism Research Centre (arc-admin@medschl.cam.ac.uk)',
    citation: 'Auyeung, B., Baron-Cohen, S., et al. (2008). J Autism Dev Disord, 38(7), 1230–1240.',
    textLoaded: false,
    isPlaceholderOnly: true,
  },
  raads_r: {
    id: 'raads_r',
    name: 'Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R)',
    status: LICENSING_STATUS.PERMISSION_PENDING,
    requiredCopyright:
      '© 2011 Riva Ariella Ritvo & Western Psychological Services (WPS). All rights reserved.',
    permissionContact: 'Western Psychological Services (rights@wpspublish.com)',
    citation: 'Ritvo, R. A., et al. (2011). J Autism Dev Disord, 41(8), 884-897.',
    textLoaded: false,
    isPlaceholderOnly: true,
  },
  aq50: {
    id: 'aq50',
    name: 'Autism Spectrum Quotient 50-Item (AQ-50)',
    status: LICENSING_STATUS.PERMISSION_PENDING,
    requiredCopyright:
      '© 2001 Simon Baron-Cohen & Autism Research Centre, Cambridge.',
    permissionContact: 'Autism Research Centre (arc-admin@medschl.cam.ac.uk)',
    citation: 'Baron-Cohen, S., et al. (2001). J Autism Dev Disord, 31(1), 5-17.',
    textLoaded: false,
    isPlaceholderOnly: true,
  },
  rbq2a: {
    id: 'rbq2a',
    name: 'Repetitive Behaviors Questionnaire-2 Adult (RBQ-2A)',
    status: LICENSING_STATUS.PERMISSION_PENDING,
    requiredCopyright:
      '© 2015 Sarah Barrett, Rebecca Uljarević, et al. Molecular Autism.',
    permissionContact: 'Molecular Autism (BMC) / Sarah Barrett',
    citation: 'Barrett, S. L., et al. (2015). Molecular Autism, 6, Article 58.',
    textLoaded: false,
    isPlaceholderOnly: true,
  },
  vanderbilt: {
    id: 'vanderbilt',
    name: 'NICHQ Vanderbilt ADHD Assessment Scale (Parent/Teacher Informant)',
    status: LICENSING_STATUS.PERMISSION_PENDING,
    requiredCopyright:
      '© 2002 American Academy of Pediatrics and National Institute for Children’s Health Quality (NICHQ).',
    permissionContact: 'National Institute for Children’s Health Quality (info@nichq.org)',
    citation: 'Wolraich, M. L., et al. (2003). Journal of Pediatric Psychology, 28(8), 559–568.',
    textLoaded: false,
    isPlaceholderOnly: true,
  },
};
