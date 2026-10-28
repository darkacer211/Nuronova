import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';

/**
 * =============================================================================
 * MOCK REPORT DATA (Self-Contained Default Dataset)
 * Swap in real user values via props or keep this calibrated profile.
 * =============================================================================
 */
const DEFAULT_CLINICAL_DATA = {
  sessionId: 'NN-2026-8942',
  date: 'Today',
  compositeScore: 64,
  maxScore: 100,
  scoreLabel: 'Moderate mental strain',
  scoreSummary: 'Your brain handled memory and physical steadiness well, with some slowdown in speed and steady attention.',
  comparisonText: 'Better than about 18% of people',
  
  // 4 Core Skills (Standardized 0-100)
  skills: [
    {
      id: 'working_memory',
      name: 'Focus & Working Memory',
      score: 77.4,
      displayScore: 77,
      status: 'strong',
      statusLabel: 'Strong',
      explanation: 'How well you hold and juggle information in your mind.',
    },
    {
      id: 'sustained_attention',
      name: 'Sustained Attention',
      score: 57.8,
      displayScore: 58,
      status: 'okay',
      statusLabel: 'Okay',
      explanation: 'How steadily your focus stays locked without drifting over time.',
    },
    {
      id: 'reaction_speed',
      name: 'Reaction Speed',
      score: 47.0,
      displayScore: 47,
      status: 'needs_attention',
      statusLabel: 'Needs attention',
      explanation: 'How quickly your brain spots unexpected changes and responds.',
    },
    {
      id: 'pressure_resilience',
      name: 'Staying Steady Under Pressure',
      score: 75.7,
      displayScore: 76,
      status: 'strong',
      statusLabel: 'Strong',
      explanation: 'How calm your head, eyes, and rhythm remain during demanding tasks.',
    },
  ],

  // 3 Key Takeaways
  takeaways: [
    {
      id: 1,
      icon: 'hourglass_bottom',
      text: 'Your attention drifted a bit during the tasks.',
    },
    {
      id: 2,
      icon: 'sync',
      text: 'Your test results and your questionnaire answers agree with each other.',
    },
    {
      id: 3,
      icon: 'health_and_safety',
      text: 'This is a screening, not a diagnosis. Share it with a doctor if you are concerned.',
    },
  ],

  // Questionnaire Checks (ADHD & Autism)
  questionnaires: [
    {
      id: 'adhd',
      title: 'Attention & Focus Check',
      instrument: 'ASRS v1.1 Screener',
      flagged: '5 of 6 focus habits reported often',
      status: 'Worth discussing with a professional',
      statusType: 'amber',
      explanation: 'You noticed frequent challenges organizing steps, finishing details, and feeling restless.',
    },
    {
      id: 'autism',
      title: 'Social & Communication Check',
      instrument: 'AQ-10 Quick Screener',
      flagged: '2 of 10 traits reported',
      status: 'Typical range',
      statusType: 'green',
      explanation: 'Your answers match how most people naturally handle conversations, sensory sounds, and routines.',
    },
  ],

  // How Your Results Line Up (Merged Cross-Modal Synthesis)
  alignmentRows: [
    {
      area: 'Attention & focus stamina',
      status: 'Consistent',
      statusType: 'green',
      note: 'Both your reaction times and your survey answers show focus dipped during longer, repetitive rounds.',
    },
    {
      area: 'Thinking under distraction',
      status: 'Consistent',
      statusType: 'green',
      note: 'Webcam eye checks and color-word tests both showed careful, deliberate pauses before answering.',
    },
    {
      area: 'Body steadiness & calm',
      status: 'Consistent',
      statusType: 'green',
      note: 'Blink rate and head posture stayed settled, showing dependable composure throughout.',
    },
    {
      area: 'Daily social communication',
      status: 'Consistent',
      statusType: 'green',
      note: 'Your responses fell squarely within everyday community patterns without sensory overwhelm.',
    },
  ],

  // What Helped & What Hurt Your Score (Plain-Language Drivers)
  drivers: [
    {
      direction: 'up',
      label: 'Steady eye focus',
      description: 'Your eyes stayed focused on the screen 95% of the time, helping your score.',
    },
    {
      direction: 'up',
      label: 'Solid number memory',
      description: 'You easily held 7 digits in sequence without losing track.',
    },
    {
      direction: 'down',
      label: 'Slower reaction time',
      description: 'Taking an average of 462 ms to click slowed your speed score down.',
    },
    {
      direction: 'down',
      label: 'Thinking through distraction',
      description: 'Extra thinking time required to ignore conflicting color words cost a few points.',
    },
  ],

  // Suggested Next Steps
  nextSteps: [
    {
      num: 1,
      title: 'Share with a Professional',
      desc: 'Save or print this summary for your doctor or counselor if daily focus challenges get in the way of study or work.',
      icon: 'medical_services',
    },
    {
      num: 2,
      title: 'Take Structured Focus Breaks',
      desc: 'Try 25-minute focus sprints followed by 5-minute screen rests to reset your attention stamina during the day.',
      icon: 'timer',
    },
    {
      num: 3,
      title: 'Retest in a Few Weeks',
      desc: 'Take this quick check again after resting well to observe how sleep and lower stress boost your mental stamina.',
      icon: 'replay',
    },
  ],

  // Detailed Measurements (Inside Collapsed Accordion)
  measurements: [
    { name: 'Average response speed', value: '462 ms', typical: '220 – 290 ms', status: 'slow', note: 'How quickly you tapped when a light flashed.' },
    { name: 'Speed consistency', value: '152.6 ms', typical: 'Under 48 ms', status: 'variable', note: 'How consistent your speed was from round to round.' },
    { name: 'Zoned out moments (lapses)', value: '2 times', typical: '0 – 1 time', status: 'mild', note: 'Rounds where a response took longer than 0.5s.' },
    { name: 'Early presses (false starts)', value: '4 times', typical: '0 – 1 time', status: 'mild', note: 'Clicking before the green signal appeared.' },
    { name: 'Color distraction delay', value: '+110 ms', typical: 'Under 150 ms', status: 'good', note: 'Extra split-second needed to filter conflicting color words.' },
    { name: 'Color accuracy', value: '94%', typical: '88% or higher', status: 'good', note: 'Percentage of color choices you got right.' },
    { name: 'Number memory span', value: '7 digits', typical: '5 – 8 digits', status: 'good', note: 'Longest number chain remembered in exact order.' },
    { name: 'Speech fluency rate', value: '135 WPM', typical: '110 – 175 WPM', status: 'good', note: 'Pace of words spoken while listing animal categories.' },
    { name: 'Screen gaze focus', value: '95%', typical: '88% or higher', status: 'good', note: 'Percentage of test time your eyes watched the stimuli.' },
    { name: 'Iris gaze drift (dispersion)', value: '42.4 px', typical: 'Under 56 px', status: 'good', note: 'How steadily your eyes held one point on screen.' },
    { name: 'Natural blink rhythm', value: '18.9 / min', typical: '12 – 24 / min', status: 'good', note: 'Spontaneous eye blink rhythm recorded via camera.' },
    { name: 'Head posture steadiness', value: '3.5° var', typical: 'Under 4.8° var', status: 'good', note: 'Physical head steadiness while sitting during testing.' },
  ],

  // Clinical Methodology & Citations (Inside Collapsed Accordion)
  clinicalAppendix: {
    methodology: 'Telemetry features are standardized against calibrated normative distributions (Population Mean = 75.0, SD = 12.0).',
    compositeFormula: 'Composite Score = 0.30 × Executive + 0.30 × Attention + 0.25 × Speed + 0.15 × Stability',
    citations: [
      'ASRS v1.1: World Health Organization (WHO) Adult ADHD Self-Report Scale (Kessler et al., 2005).',
      'AQ-10: National Institute for Health and Care Excellence (NICE CG142) brief autism screener (Allison et al., 2012).',
      'PVT: Psychomotor Vigilance Task measuring attentional lapses and intra-individual variability (Dinges & Powell, 1985; Tamm et al., 2012).',
      'Oculomotor Edge ML: Google MediaPipe FaceLandmarker tracking 478 3D landmarks at 30 Hz strictly in-memory on the client device.',
    ],
  },
};

/**
 * Clean multilingual translation dictionary for Grade 8 plain language
 */
const LOCALIZED_COPY = {
  en: {
    pageTitle: 'NeuroNova Assessment Report',
    pageSubtitle: 'A plain-language summary of your 5-minute cognitive check and survey answers.',
    printBtn: 'Download PDF / Print',
    retakeBtn: 'New Assessment',
    scoreHeading: 'Overall Cognitive Result',
    scoreLabel: 'Moderate mental strain',
    scoreSummary: 'Your brain handled memory and physical steadiness well, with some slowdown in speed and steady attention.',
    betterThan: 'Better than about 18% of people who took this test',
    takeawaysTitle: 'Your Results at a Glance',
    takeaways: [
      'Your attention drifted a bit during the tasks.',
      'Your test results and your questionnaire answers agree with each other.',
      'This is a screening, not a diagnosis. Share it with a doctor if you are concerned.',
    ],
    skillsTitle: 'Your 4 Core Skills',
    skillsSubtitle: 'Each skill is scored out of 100 based on your speed, memory, and webcam focus.',
    skills: [
      { name: 'Focus & Working Memory', explanation: 'How well you hold and juggle information in your mind.' },
      { name: 'Sustained Attention', explanation: 'How steadily your focus stays locked without drifting over time.' },
      { name: 'Reaction Speed', explanation: 'How quickly your brain spots unexpected changes and responds.' },
      { name: 'Staying Steady Under Pressure', explanation: 'How calm your head, eyes, and rhythm remain during demanding tasks.' },
    ],
    questionnairesTitle: 'Questionnaire Checks',
    questionnairesSubtitle: 'What your answers in the everyday habit surveys showed.',
    questionnaires: [
      {
        title: 'Attention & Focus Check',
        status: 'Worth discussing with a professional',
        explanation: 'You noticed frequent challenges organizing steps, finishing details, and feeling restless.',
        flagged: '5 of 6 focus habits reported often',
      },
      {
        title: 'Social & Communication Check',
        status: 'Typical range',
        explanation: 'Your answers match how most people naturally handle conversations, sensory sounds, and routines.',
        flagged: '2 of 10 traits reported',
      },
    ],
    lineupTitle: 'How Your Results Line Up',
    lineupSubtitle: 'Checking if your computerized tests match your survey answers.',
    alignmentRows: [
      { area: 'Attention & focus stamina', status: 'Consistent', note: 'Both your reaction times and your survey answers show focus dipped during longer rounds.' },
      { area: 'Thinking under distraction', status: 'Consistent', note: 'Webcam eye checks and color tests both showed careful, deliberate pauses before answering.' },
      { area: 'Body steadiness & calm', status: 'Consistent', note: 'Blink rate and head posture stayed settled, showing dependable composure throughout.' },
      { area: 'Daily social communication', status: 'Consistent', note: 'Your responses fell squarely within everyday community patterns without sensory overwhelm.' },
    ],
    driversTitle: 'What Affected Your Score',
    driversSubtitle: 'The main habits and reactions that pushed your score up or down.',
    drivers: [
      { label: 'Steady eye focus', description: 'Your eyes stayed focused on the screen 95% of the time, helping your score.' },
      { label: 'Solid number memory', description: 'You easily held 7 digits in sequence without losing track.' },
      { label: 'Slower reaction time', description: 'Taking an average of 462 ms to click slowed your speed score down.' },
      { label: 'Thinking through distraction', description: 'Extra thinking time required to ignore conflicting color words cost a few points.' },
    ],
    nextStepsTitle: 'What to Do Next',
    nextSteps: [
      { title: 'Share with a Professional', desc: 'Save or print this summary for your doctor or counselor if daily focus challenges get in the way of study or work.' },
      { title: 'Take Structured Focus Breaks', desc: 'Try 25-minute focus sprints followed by 5-minute screen rests to reset your attention stamina during the day.' },
      { title: 'Retest in a Few Weeks', desc: 'Take this quick check again after resting well to observe how sleep and lower stress boost your mental stamina.' },
    ],
    disclaimer: 'This is not a medical diagnosis. NeuroNova is an automated screening tool designed for personal awareness and wellness tracking. Only a qualified physician or psychologist can provide a medical evaluation.',
    detailedTitle: 'View Detailed Measurements (12 Test Metrics)',
    detailedSubtitle: 'Exact numbers recorded by your browser camera, microphone, and keyboard.',
    cliniciansTitle: 'For Clinicians & Researchers (How This Works)',
    cliniciansSubtitle: 'Mathematical weighting, screener cutoffs, and published peer-reviewed citations.',
    statusStrong: 'Strong',
    statusOkay: 'Okay',
    statusNeedsAttention: 'Needs attention',
  },
  hi: {
    pageTitle: 'न्यूरोनोवा मस्तिष्क जांच रिपोर्ट',
    pageSubtitle: 'आपके 5-मिनट के टेस्ट और प्रश्नावली का आसान भाषा में सारांश।',
    printBtn: 'रिपोर्ट डाउनलोड / प्रिंट करें',
    retakeBtn: 'नया टेस्ट शुरू करें',
    scoreHeading: 'आपका समग्र मस्तिष्क स्कोर',
    scoreLabel: 'हल्का मानसिक तनाव',
    scoreSummary: 'आपके मस्तिष्क ने याददाश्त और शारीरिक संतुलन में अच्छा प्रदर्शन किया, जबकि गति और लगातार ध्यान में कुछ कमी देखी गई।',
    betterThan: 'टेस्ट देने वाले लगभग 18% लोगों से बेहतर प्रदर्शन',
    takeawaysTitle: 'मुख्य बातें (एक नज़र में)',
    takeaways: [
      'टेस्ट के दौरान आपका ध्यान कुछ समय के लिए विचलित हुआ।',
      'आपके कंप्यूटर टेस्ट के नतीजे और आपके प्रश्नावली के जवाब आपस में पूरी तरह मेल खाते हैं।',
      'यह केवल एक प्रारंभिक जांच है, कोई बीमारी का निदान नहीं। चिंता होने पर डॉक्टर से बात करें।',
    ],
    skillsTitle: 'आपकी 4 प्रमुख मस्तिष्क क्षमताएं',
    skillsSubtitle: 'आपकी गति, याददाश्त और ध्यान के आधार पर 100 में से अंक।',
    skills: [
      { name: 'एकाग्रता और कार्यशील याददाश्त', explanation: 'दिमाग में जानकारी को याद रखकर इस्तेमाल करने की क्षमता।' },
      { name: 'लगातार ध्यान बनाए रखना', explanation: 'लंबे समय तक बिना भटके किसी काम पर टिके रहने की क्षमता।' },
      { name: 'प्रतिक्रिया गति (स्पीड)', explanation: 'स्क्रीन पर बदलाव देखते ही आपका हाथ कितनी जल्दी प्रतिक्रिया देता है।' },
      { name: 'दबाव में संयम बनाए रखना', explanation: 'कठिन कार्य के दौरान सिर, आंखों और शरीर की स्थिरता।' },
    ],
    questionnairesTitle: 'दैनिक आदतों की जांच (प्रश्नावली)',
    questionnairesSubtitle: 'आपके द्वारा भरे गए सवालों के आधार पर निष्कर्ष।',
    questionnaires: [
      {
        title: 'ध्यान और एकाग्रता की जांच',
        status: 'विशेषज्ञ से चर्चा योग्य',
        explanation: 'आपको काम व्यवस्थित करने, ब्यौरे पूरे करने और बेचैनी महसूस होने में कठिनाई दर्ज हुई।',
        flagged: '6 में से 5 ध्यान संबंधी लक्षण अक्सर देखे गए',
      },
      {
        title: 'सामाजिक संवाद और दिनचर्या',
        status: 'सामान्य सीमा',
        explanation: 'आपके जवाब सामान्य सामाजिक बातचीत, संवेदी आवाज़ों और दिनचर्या के अनुकूल पाए गए।',
        flagged: '10 में से केवल 2 लक्षण दर्ज',
      },
    ],
    lineupTitle: 'परीक्षण और आदतों का मिलान',
    lineupSubtitle: 'यह देखना कि कंप्यूटर टेस्ट और आपके जवाब आपस में कितना मेल खाते हैं।',
    alignmentRows: [
      { area: 'एकाग्रता और ध्यान की स्थिरता', status: 'समान निष्कर्ष', note: 'प्रतिक्रिया समय और प्रश्नावली दोनों से पता चला कि लंबे समय में ध्यान थोड़ा भटका।' },
      { area: 'भटकाव के बीच सोचने की गति', status: 'समान निष्कर्ष', note: 'कैमरा और रंग परीक्षण दोनों ने दिखाया कि आपने उत्तर देने से पहले सोच-समझकर विराम लिया।' },
      { area: 'शारीरिक संतुलन और स्थिरता', status: 'समान निष्कर्ष', note: 'पलकों की झपकी और सिर की मुद्रा शांत रही, जो शारीरिक संयम दर्शाती है।' },
      { area: 'दैनिक बातचीत और आदतें', status: 'समान निष्कर्ष', note: 'सामाजिक समझ और संवेदी अनुभव आम लोगों जैसे सामान्य पाए गए।' },
    ],
    driversTitle: 'स्कोर को प्रभावित करने वाले मुख्य कारण',
    driversSubtitle: 'वे बातें जिन्होंने आपके कुल स्कोर को बढ़ाया या कम किया।',
    drivers: [
      { label: 'स्थिर दृष्टि ध्यान', description: '95% समय आपकी नजरें स्क्रीन पर टिकी रहीं, जिससे स्कोर बेहतर हुआ।' },
      { label: 'अच्छी संख्या याददाश्त', description: 'आपने बिना भटके लगातार 7 नंबरों का सही क्रम याद रखा।' },
      { label: 'धीमी प्रतिक्रिया गति', description: 'क्लिक करने में औसतन 462 मिलीसेकंड का समय लगने से स्कोर थोड़ा कम हुआ।' },
      { label: 'भटकाव दूर करने में समय', description: 'उलझाने वाले रंगीन शब्दों को नजरअंदाज करने में अतिरिक्त समय लगा।' },
    ],
    nextStepsTitle: 'आगे के लिए उपयोगी सुझाव',
    nextSteps: [
      { title: 'डॉक्टर या विशेषज्ञ से चर्चा करें', desc: 'यदि दैनिक जीवन या पढ़ाई में ध्यान की समस्या आती है, तो यह रिपोर्ट अपने चिकित्सक को दिखाएं।' },
      { title: 'काम के बीच छोटे ब्रेक लें', desc: '25 मिनट काम और 5 मिनट आराम (पोमोडोरो) की आदत बनाएं ताकि दिमाग तरोताजा रहे।' },
      { title: 'कुछ हफ्तों बाद दोबारा जांचें', desc: 'अच्छी नींद और कम तनाव के बाद यह टेस्ट दोबारा देकर देखें कि आपकी ऊर्जा में क्या सुधार आया।' },
    ],
    disclaimer: 'यह कोई चिकित्सीय निदान (Medical Diagnosis) नहीं है। न्यूरोनोवा केवल जागरूकता और व्यक्तिगत समझ के लिए एक स्क्रीनिंग टूल है। किसी भी चिंता के लिए डॉक्टर से परामर्श लें।',
    detailedTitle: 'विस्तृत आंकड़े देखें (12 टेस्ट माप)',
    detailedSubtitle: 'कैमरा, माइक और कीबोर्ड द्वारा दर्ज किए गए सटीक आंकड़े।',
    cliniciansTitle: 'चिकित्सकों और शोधकर्ताओं के लिए (तकनीकी विवरण)',
    cliniciansSubtitle: 'गणितीय सूत्र, कटऑफ मानक और वैज्ञानिक संदर्भ।',
    statusStrong: 'मजबूत',
    statusOkay: 'सामान्य',
    statusNeedsAttention: 'ध्यान देने योग्य',
  },
  mr: {
    pageTitle: 'न्यूरोनोव्हा मेंदू तपासणी अहवाल',
    pageSubtitle: 'तुमच्या ५ मिनिटांच्या चाचणीचा सोप्या भाषेतील सारांश.',
    printBtn: 'अहवाल डाउनलोड / प्रिंट करा',
    retakeBtn: 'नवीन चाचणी सुरू करा',
    scoreHeading: 'एकूण मेंदू स्कोअर',
    scoreLabel: 'मध्यम मानसिक ताण',
    scoreSummary: 'तुमच्या मेंदूने स्मरणशक्ती आणि शारीरिक संतुलनात उत्तम कामगिरी केली, तर वेग आणि स्थिर लक्ष यामध्ये थोडा संथपणा दिसून आला.',
    betterThan: 'चाचणी दिलेल्या सुमारे १८% लोकांपेक्षा चांगला निकाल',
    takeawaysTitle: 'महत्त्वाच्या गोष्टी (एका दृष्टीक्षेपात)',
    takeaways: [
      'चाचणीदरम्यान तुमचे लक्ष काही वेळा विचलित झाले.',
      'तुमच्या संगणक चाचण्यांचे निकाल आणि प्रश्नावलीतील उत्तरे एकमेकांशी तंतोतंत जुळतात.',
      'ही केवळ एक प्राथमिक तपासणी आहे, वैद्यकीय निदान नाही. गरज वाटल्यास डॉक्टरांचा सल्ला घ्या.',
    ],
    skillsTitle: 'तुमच्या ४ मुख्य मेंदू क्षमता',
    skillsSubtitle: 'वेग, स्मरणशक्ती आणि लक्ष यांवर आधारित १०० पैकी गुण.',
    skills: [
      { name: 'एकाग्रता आणि कार्यशील स्मरणशक्ती', explanation: 'माहिती मनात ठेवून तिचा वापर करण्याची क्षमता.' },
      { name: 'सतत लक्ष केंद्रित ठेवणे', explanation: 'बऱ्याच वेळ न भरकटता एकाच गोष्टीवर लक्ष टिकवून ठेवण्याची क्षमता.' },
      { name: 'प्रतिसाद वेग (स्पीड)', explanation: 'बदल दिसताच तुमचा हात किती वेगाने प्रतिक्रिया देतो.' },
      { name: 'ताणाखाली शांत राहणे', explanation: 'कठीण कामादरम्यान डोळे, डोके आणि शरीराची स्थिरता.' },
    ],
    questionnairesTitle: 'दैनंदिन सवयींची पडताळणी (प्रश्नावली)',
    questionnairesSubtitle: 'प्रश्नांना दिलेल्या उत्तरांवर आधारित निष्कर्ष.',
    questionnaires: [
      {
        title: 'लक्ष आणि एकाग्रतेची पडताळणी',
        status: 'तज्ज्ञांशी चर्चा करण्याजोगे',
        explanation: 'कामे नियोजित करणे, तपशील पूर्ण करणे आणि अस्वस्थता यांमध्ये अडचणी जाणवल्या.',
        flagged: '६ पैकी ५ लक्षणांची वारंवार नोंद',
      },
      {
        title: 'सामाजिक संवाद आणि सवयी',
        status: 'सामान्य मर्यादा',
        explanation: 'तुमची उत्तरे सर्वसामान्य सामाजिक संवाद आणि दिनचर्येनुसार योग्य आढळली.',
        flagged: '१० पैकी केवळ २ लक्षणे',
      },
    ],
    lineupTitle: 'चाचणी आणि सवयींचा ताळमेळ',
    lineupSubtitle: 'संगणक चाचण्या आणि तुमची उत्तरे एकमेकांशी कशी जुळतात.',
    alignmentRows: [
      { area: 'लक्ष आणि एकाग्रता स्थिरता', status: 'जुळणारे निष्कर्ष', note: 'प्रतिक्रिया वेळ आणि प्रश्नावली दोन्हीवरून कामादरम्यान लक्ष विचलित झाल्याचे दिसते.' },
      { area: 'गोंधळात विचार करण्याचा वेग', status: 'जुळणारे निष्कर्ष', note: 'कॅमेरा आणि रंग चाचणी दोघांवरून उत्तरापूर्वी विचारपूर्वक वेळ घेतल्याचे स्पष्ट होते.' },
      { area: 'शारीरिक स्थिरता आणि शांतता', status: 'जुळणारे निष्कर्ष', note: 'डोळ्यांच्या हालचाली आणि डोक्याची मुद्रा शांत राहिली, जी उत्तम संयम दर्शवते.' },
      { area: 'दैनंदिन संवाद आणि सवयी', status: 'जुळणारे निष्कर्ष', note: 'सामाजिक संवाद आणि संवेदनशीलता सर्वसामान्य मर्यादेत आढळली.' },
    ],
    driversTitle: 'स्कोअरवर परिणाम करणारे मुख्य घटक',
    driversSubtitle: 'ज्या गोष्टींनी तुमचा स्कोअर वाढवला किंवा कमी केला.',
    drivers: [
      { label: 'स्थिर दृष्टी लक्ष', description: '९५% वेळ तुमचे डोळे स्क्रीनवर केंद्रित राहिले, ज्यामुळे स्कोअर सुधारला.' },
      { label: 'चांगली संख्या स्मरणशक्ती', description: 'तुम्ही न चुकता सलग ७ अंकांचा क्रम व्यवस्थित लक्षात ठेवला.' },
      { label: 'संथ प्रतिसाद वेळ', description: 'क्लिक करण्यासाठी सरासरी ४६२ मिलीसेकंद लागल्याने वेगाचा स्कोअर थोडा कमी झाला.' },
      { label: 'गोंधळात वेळ लागणे', description: 'रंगांच्या शब्दांवरून लक्ष हटवून योग्य रंग निवडताना थोडा जास्तीचा वेळ लागला.' },
    ],
    nextStepsTitle: 'पुढील मार्गदर्शक पावले',
    nextSteps: [
      { title: 'डॉक्टर किंवा तज्ज्ञांशी चर्चा करा', desc: 'अभ्यास किंवा कामात लक्ष केंद्रित करण्यात अडचण येत असल्यास हा अहवाल डॉक्टरांना दाखवा.' },
      { title: 'कामादरम्यान लहान विश्रांती घ्या', desc: '२५ मिनिटे काम आणि ५ मिनिटे विश्रांती (पोमोडोरो) अशी पद्धत वापरा जेणेकरून मेंदू ताजातवाना राहील.' },
      { title: 'काही आठवड्यांनी पुन्हा तपासा', desc: 'उत्तम झोप आणि शांत मनस्थितीनंतर ही चाचणी पुन्हा देऊन सुधारणा तपासा.' },
    ],
    disclaimer: 'हे कोणतेही वैद्यकीय निदान नाही. न्यूरोनोव्हा हे केवळ जागरूकता आणि निरीक्षणासाठी एक स्क्रीनिंग साधन आहे. योग्य निदानासाठी डॉक्टरांचा सल्ला घ्या.',
    detailedTitle: 'सविस्तर आकडेवारी पाहा (१२ चाचणी घटक)',
    detailedSubtitle: 'कॅमेरा आणि कीबोर्डद्वारे नोंदवलेले अचूक आकडे.',
    cliniciansTitle: 'तज्ज्ञांसाठी आणि संशोधकांसाठी (तांत्रिक माहिती)',
    cliniciansSubtitle: 'गणितीय सूत्रे, कटऑफ निकष आणि संदर्भ ग्रंथ.',
    statusStrong: 'उत्तम',
    statusOkay: 'सामान्य',
    statusNeedsAttention: 'सुधारणा हवी',
  },
};

/**
 * Circular SVG Gauge Component for Overall Score
 */
function CircularScoreGauge({ score = 64, maxScore = 100 }) {
  const radius = 68;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), maxScore) / maxScore) * circumference;

  return (
    <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        {/* Background track */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-surface-container-high dark:text-slate-800"
        />
        {/* Progress fill */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-amber-500 transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered Score Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-extrabold text-4xl text-on-surface tracking-tight leading-none">
          {score}
        </span>
        <span className="text-xs font-semibold text-on-surface-variant mt-1">
          out of {maxScore}
        </span>
      </div>
    </div>
  );
}

/**
 * Main Redesigned Dashboard Component
 * Clean, friendly, accessible health-tech UX designed for Grade 8 reading level.
 */
export default function Dashboard({ analysisResult, rawPayload, onRetake }) {
  const { language = 'en' } = useLanguage();
  const copy = LOCALIZED_COPY[language] || LOCALIZED_COPY.en;

  const [detailedOpen, setDetailedOpen] = useState(false);
  const [clinicianOpen, setClinicianOpen] = useState(false);

  // Trigger gentle celebratory confetti on entry
  useEffect(() => {
    confetti({
      particleCount: 28,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#f59e0b', '#6366f1'],
    });
  }, []);

  // Use props if provided, otherwise default to the requested exact dataset
  const data = {
    ...DEFAULT_CLINICAL_DATA,
    compositeScore: analysisResult?.cpi_score ? Math.round(Number(analysisResult.cpi_score)) : DEFAULT_CLINICAL_DATA.compositeScore,
    sessionId: analysisResult?.session_id || DEFAULT_CLINICAL_DATA.sessionId,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 p-4 sm:p-6 pb-24 text-on-surface transition-colors font-sans antialiased">
      {/* =========================================================================
          1. HEADER (Title, Date, Download / New Assessment Buttons)
          ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-container-high/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Completed {data.date}
            </span>
            <span className="text-xs text-on-surface-variant font-mono">
              ID: {data.sessionId}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-on-surface">
            {copy.pageTitle}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xl leading-relaxed">
            {copy.pageSubtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto shrink-0">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>{copy.printBtn}</span>
          </button>
          <button
            onClick={onRetake}
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>{copy.retakeBtn}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. HERO CARD (Score Gauge + Label + Plain-Language Summary)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        {/* Score Ring */}
        <CircularScoreGauge score={data.compositeScore} maxScore={data.maxScore} />

        {/* Text Breakdown */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {copy.scoreHeading}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{copy.scoreLabel || data.scoreLabel}</span>
            </span>
          </div>

          <p className="text-base sm:text-lg font-medium text-on-surface leading-snug">
            {copy.scoreSummary || data.scoreSummary}
          </p>

          {/* Plain Comparison Label (No Z-score or Percentile jargon) */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-low dark:bg-slate-800/80 text-xs text-on-surface-variant font-medium border border-surface-container-high/60">
            <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">group</span>
            <span>{copy.betterThan}</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. KEY TAKEAWAYS (3 Short Cards, One Sentence Each)
          ========================================================================= */}
      <section>
        <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">lightbulb</span>
          <span>{copy.takeawaysTitle}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {(copy.takeaways || data.takeaways.map(t => t.text)).map((text, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-surface-container-high/60 dark:border-slate-800 flex items-start gap-3 text-sm leading-relaxed"
            >
              <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-on-surface m-0 font-normal">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. YOUR 4 CORE SKILLS (Simple Horizontal Bars with Color Bands)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-5">
          <div>
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">bar_chart</span>
              <span>{copy.skillsTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              {copy.skillsSubtitle}
            </p>
          </div>
          {/* Friendly Legend */}
          <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium mt-2 sm:mt-0">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 70+ Strong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 55–69 Okay
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Under 55
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {data.skills.map((skill, index) => {
            const pct = Math.min(Math.max(skill.score, 10), 100);
            const localizedName = copy.skills?.[index]?.name || skill.name;
            const localizedExpl = copy.skills?.[index]?.explanation || skill.explanation;

            // Soft color bands (Avoid harsh red)
            let barColor = 'bg-emerald-500';
            let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
            let localizedStatus = copy.statusStrong;

            if (skill.status === 'okay') {
              barColor = 'bg-amber-500';
              badgeClass = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
              localizedStatus = copy.statusOkay;
            } else if (skill.status === 'needs_attention') {
              barColor = 'bg-rose-400 dark:bg-rose-500';
              badgeClass = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
              localizedStatus = copy.statusNeedsAttention;
            }

            return (
              <div key={skill.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">{localizedName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClass}`}>
                      {localizedStatus}
                    </span>
                  </div>
                  <div className="font-bold text-on-surface">
                    {skill.displayScore} <span className="text-xs text-on-surface-variant font-normal">/ 100</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-surface-container-high dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-xs text-on-surface-variant m-0 leading-normal">
                  {localizedExpl}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          5. QUESTIONNAIRE CHECKS (Attention & Social, No DSM/Cutoff Jargon)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">fact_check</span>
            <span>{copy.questionnairesTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {copy.questionnairesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(copy.questionnaires || data.questionnaires).map((q, idx) => {
            const isAmber = (data.questionnaires[idx]?.statusType || 'green') === 'amber';
            const chipClass = isAmber
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800'
              : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800';

            return (
              <div
                key={idx}
                className="p-5 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-surface-container-high/60 dark:border-slate-800 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base text-on-surface">
                      {q.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${chipClass}`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {isAmber ? 'info' : 'check_circle'}
                      </span>
                      <span>{q.status}</span>
                    </span>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed m-0">
                    {q.explanation}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-surface-container-high/50 dark:border-slate-700/60 text-xs text-on-surface-variant font-medium">
                  {q.flagged}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          6. HOW YOUR RESULTS LINE UP (Merged Simple 4 Rows)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">tune</span>
            <span>{copy.lineupTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {copy.lineupSubtitle}
          </p>
        </div>

        <div className="divide-y divide-surface-container-high/60 dark:divide-slate-800">
          {(copy.alignmentRows || data.alignmentRows).map((row, index) => (
            <div key={index} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-on-surface">{row.area}</span>
                <span className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{row.note}</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 self-start sm:self-center shrink-0">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>{row.status}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. WHAT AFFECTED YOUR SCORE (Helped / Slowed Down, No SHAP Math)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">trending_up</span>
            <span>{copy.driversTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            {copy.driversSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {(copy.drivers || data.drivers).map((item, idx) => {
            const isUp = (data.drivers[idx]?.direction || 'up') === 'up';
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-surface-container-high/50 dark:border-slate-800 flex items-start gap-3"
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isUp
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isUp ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-on-surface">{item.label}</div>
                  <div className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8. WHAT TO DO NEXT (3 Action Cards)
          ========================================================================= */}
      <section className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest dark:bg-slate-900 shadow-sm border border-surface-container-high/60 dark:border-slate-800">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">directions_run</span>
            <span>{copy.nextStepsTitle}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(copy.nextSteps || data.nextSteps).map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface-container-low dark:bg-slate-800/60 border border-surface-container-high/60 dark:border-slate-800 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm mb-2.5">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-sm text-on-surface mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed m-0">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          9. SHORT PLAIN-LANGUAGE DISCLAIMER
          ========================================================================= */}
      <section className="p-4 sm:p-5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
        <span className="material-symbols-outlined text-[20px] text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          info
        </span>
        <p className="m-0 font-normal">
          {copy.disclaimer}
        </p>
      </section>

      {/* =========================================================================
          10. COLLAPSED ACCORDIONS: DETAILED MEASUREMENTS & FOR CLINICIANS
          ========================================================================= */}
      <div className="flex flex-col gap-3">
        {/* Accordion 1: View Detailed Measurements */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-slate-900 border border-surface-container-high/70 dark:border-slate-800 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setDetailedOpen((prev) => !prev)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-surface-container-low dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">query_stats</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-on-surface">
                  {copy.detailedTitle}
                </h3>
                <p className="text-xs text-on-surface-variant m-0">
                  {copy.detailedSubtitle}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant transform transition-transform duration-200">
              {detailedOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {detailedOpen && (
            <div className="p-4 sm:p-5 border-t border-surface-container-high/60 dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.measurements.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-surface-container-lowest dark:bg-slate-800/80 border border-surface-container-high/60 dark:border-slate-700 flex flex-col justify-between gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-on-surface">{m.name}</span>
                      <span className="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">
                        {m.status === 'good' ? 'check_circle' : 'info'}
                      </span>
                    </div>
                    <div className="text-base font-extrabold text-teal-700 dark:text-teal-300 font-mono">
                      {m.value}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">
                      <span className="opacity-80">Typical: {m.typical}</span>
                    </div>
                    <div className="text-[11px] text-on-surface-variant/90 border-t border-surface-container-high/40 pt-1 mt-0.5">
                      {m.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: For Clinicians & Researchers */}
        <div className="rounded-xl bg-surface-container-lowest dark:bg-slate-900 border border-surface-container-high/70 dark:border-slate-800 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setClinicianOpen((prev) => !prev)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-surface-container-low dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-teal-600 dark:text-teal-400">science</span>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-on-surface">
                  {copy.cliniciansTitle}
                </h3>
                <p className="text-xs text-on-surface-variant m-0">
                  {copy.cliniciansSubtitle}
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant transform transition-transform duration-200">
              {clinicianOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {clinicianOpen && (
            <div className="p-4 sm:p-5 border-t border-surface-container-high/60 dark:border-slate-800 bg-surface-container-low/30 dark:bg-slate-900/50 flex flex-col gap-4 text-xs leading-relaxed text-on-surface-variant">
              <div>
                <strong className="block text-on-surface font-semibold mb-1">Standardized Psychometric Formula:</strong>
                <p className="m-0 font-mono text-[11px] bg-surface-container-lowest dark:bg-slate-800 p-2.5 rounded-lg border border-surface-container-high/60">
                  {data.clinicalAppendix.compositeFormula}
                </p>
                <p className="mt-1.5 opacity-90">
                  {data.clinicalAppendix.methodology}
                </p>
              </div>

              <div>
                <strong className="block text-on-surface font-semibold mb-1.5">Published Literature & Protocol Citations:</strong>
                <ul className="list-disc list-inside flex flex-col gap-1 pl-1">
                  {data.clinicalAppendix.citations.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
