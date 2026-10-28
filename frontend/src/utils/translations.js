/**
 * translations.js
 * Comprehensive, accessible localization dictionary for NeuroNova in English, Hindi, and Marathi.
 * Uses simple, natural, conversational phrasing instead of stiff word-to-word literal translation.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
];

export const TEST_EXPLANATIONS = {
  pvt: {
    id: 'pvt',
    name: {
      en: 'Reaction Time Test',
      hi: 'प्रतिक्रिया गति टेस्ट (स्पीड टेस्ट)',
      mr: 'प्रतिसाद वेग चाचणी (स्पीड टेस्ट)',
    },
    shortDesc: {
      en: 'Measures how fast your brain and reflexes respond when the screen changes color.',
      hi: 'यह मापता है कि स्क्रीन पर रंग बदलते ही आपका दिमाग और हाथ कितनी तेजी से प्रतिक्रिया करते हैं।',
      mr: 'स्क्रीनवर रंग बदलताच तुमचा मेंदू आणि हात किती वेगाने प्रतिसाद देतात हे तपासते.',
    },
    audioTranscript: {
      en: "Welcome to the Reaction Time Test. Your goal is to see how fast you can react. When the test begins, the screen will turn red and say 'Hold'. Stay calm and do not click yet. As soon as the screen flashes green and says 'Click!', press your spacebar or tap the screen as fast as you can. We will do 5 quick rounds. Ready? Let us begin!",
      hi: "स्पीड टेस्ट में आपका स्वागत है। इसका लक्ष्य यह देखना है कि आप कितनी तेजी से क्लिक कर सकते हैं। जब टेस्ट शुरू होगा, तो स्क्रीन लाल होगी और 'रुकें' दिखाएगी। शांत रहें और अभी क्लिक न करें। जैसे ही स्क्रीन हरी होकर 'क्लिक करें' कहे, तुरंत स्पेसबार दबाएं या स्क्रीन पर टैप करें। कुल 5 राउंड होंगे। तैयार हैं? शुरू करते हैं!",
      mr: "स्पीड टेस्टमध्ये आपले स्वागत आहे. आपण किती वेगाने प्रतिसाद देऊ शकता हे पाहणे हा या चाचणीचा उद्देश आहे. चाचणी सुरू झाल्यावर स्क्रीन लाल होईल आणि 'थांबा' असा संदेश दिसेल. घाई करू नका. स्क्रीन हिरवी होताच आणि 'क्लिक करा' संदेश येताच, लगेच स्पेसबार दाबा किंवा स्क्रीनवर टॅप करा. अशा ५ फेऱ्या होतील. तयार आहात? सुरू करूया!",
    },
    keyPoints: {
      en: [
        'Screen is RED: Wait patiently and do not click.',
        'Screen flashes GREEN: Click or press spacebar immediately!',
        '5 quick rounds to measure your average speed.',
      ],
      hi: [
        'स्क्रीन लाल है: धैर्य रखें, क्लिक न करें।',
        'स्क्रीन हरी होते ही: तुरंत क्लिक करें या स्पेस दबाएं!',
        'औसत गति जानने के लिए 5 आसान राउंड।',
      ],
      mr: [
        'स्क्रीन लाल असताना: शांतपणे थांबा, क्लिक करू नका.',
        'स्क्रीन हिरवी होताच: लगेच क्लिक करा किंवा स्पेस दाबा!',
        'सरासरी वेग तपासण्यासाठी ५ फेऱ्या.',
      ],
    },
  },

  stroop: {
    id: 'stroop',
    name: {
      en: 'Color Focus Test (Stroop)',
      hi: 'रंग पहचान और ध्यान टेस्ट (स्ट्रूप)',
      mr: 'रंग ओळख आणि लक्ष चाचणी (स्ट्रूप)',
    },
    shortDesc: {
      en: 'Tests how well your brain focuses on color while ignoring written words.',
      hi: 'यह परखता है कि आपका दिमाग लिखे हुए शब्द के बहकावे में आए बिना सही रंग कैसे पहचानता है।',
      mr: 'लिहिलेल्या शब्दाकडे दुर्लक्ष करून तुमचा मेंदू योग्य रंगावर कसा लक्ष केंद्रित करतो हे तपासते.',
    },
    audioTranscript: {
      en: "Welcome to the Color Focus Test. In this task, you will see color words like Red, Blue, Green, or Yellow. The trick is: the word might be written in a different ink color. You must choose the INK COLOR you see, not the word you read. For example, if the word RED is written in blue letters, pick Blue. You can click the buttons or use your keyboard: D for Red, F for Blue, J for Green, and K for Yellow. Answer as fast and accurately as you can!",
      hi: "रंग पहचान टेस्ट में आपका स्वागत है। इसमें आपको रंगों के नाम लिखे दिखाई देंगे, जैसे लाल, नीला, हरा या पीला। ध्यान देने वाली बात यह है कि शब्द किसी दूसरे रंग की स्याही में लिखा हो सकता है। आपको यह देखना है कि शब्द किस रंग में लिखा है, लिखा क्या है उसपर ध्यान न दें। उदाहरण के लिए, यदि 'लाल' शब्द नीले रंग में लिखा है, तो नीला बटन चुनें। जितनी जल्दी और सही हो सके उत्तर दें!",
      mr: "रंग ओळख चाचणीमध्ये आपले स्वागत आहे. यात तुम्हाला लाल, निळा, हिरवा किंवा पिवळा असे शब्द दिसतील. गंमत अशी की शब्द वेगळ्या रंगात लिहिलेला असू शकतो. तुम्हाला तो शब्द वाचायचा नाही, तर तो ज्या रंगात लिहिला आहे तो रंग निवडायचा आहे. उदा. 'लाल' हा शब्द जर निळ्या रंगात लिहिला असेल, तर निळा रंग निवडा. शक्य तितक्या वेगाने आणि अचूकपणे उत्तर द्या!",
    },
    keyPoints: {
      en: [
        'Pick the INK COLOR you see, ignore the written word.',
        'Use color buttons or keyboard keys: D, F, J, K.',
        'Focus on being both quick and accurate.',
      ],
      hi: [
        'दिखने वाले रंग को चुनें, लिखे हुए शब्द पर ध्यान न दें।',
        'रंग के बटन या कीबोर्ड शॉर्टकट (D, F, J, K) का उपयोग करें।',
        'तेज गति और सही उत्तर दोनों महत्वपूर्ण हैं।',
      ],
      mr: [
        'दिसणाऱ्या रंगावर लक्ष ठेवा, लिहिलेला शब्द वाचू नका.',
        'रंगाचे बटण किंवा कीबोर्ड कीज (D, F, J, K) वापरा.',
        'वेग आणि अचूकता दोन्ही राखण्याचा प्रयत्न करा.',
      ],
    },
  },

  digit_span: {
    id: 'digit_span',
    name: {
      en: 'Number Memory Test (Digit Span)',
      hi: 'संख्या याददाश्त टेस्ट (डिजिट स्पैन)',
      mr: 'संख्या स्मरण चाचणी (डिजिट स्पॅन)',
    },
    shortDesc: {
      en: 'Tests how many numbers in a row your memory can hold and repeat.',
      hi: 'यह टेस्ट करता है कि आप एक बार में कितने नंबर याद रखकर दोहरा सकते हैं।',
      mr: 'तुम्ही एका वेळी किती संख्या लक्षात ठेवून पुन्हा सांगू शकता हे तपासते.',
    },
    audioTranscript: {
      en: "Welcome to the Number Memory Test. Numbers will flash one by one on the screen. Watch each number carefully and remember the sequence. Once they stop, a number pad will appear. Type back the numbers in the exact order you saw them, then click Submit. It starts with 3 numbers and gets a little longer with each round. Let us see how many you can remember!",
      hi: "नंबर याददाश्त टेस्ट में आपका स्वागत है। स्क्रीन पर एक-एक करके नंबर दिखाई देंगे। सभी नंबरों को ध्यान से देखें और उनका क्रम याद रखें। जब नंबर खत्म हो जाएं, तो स्क्रीन पर नंबर पैड आएगा। उसी क्रम में नंबर टाइप करें और सबमिट दबाएं। यह 3 नंबरों से शुरू होगा और हर सही जवाब के बाद एक नंबर बढ़ता जाएगा। कोशिश करें और याद रखें!",
      mr: "संख्या स्मरण चाचणीमध्ये आपले स्वागत आहे. स्क्रीनवर एकापाठोपाठ एक अंक चमकतील. प्रत्येक अंक काळजीपूर्वक पाहा आणि तो क्रम लक्षात ठेवा. अंक संपल्यावर स्क्रीनवर नंबर पॅड दिसेल. अंक ज्या क्रमाने आले होते त्याच क्रमाने टाइप करा आणि सबमिट करा. हे ३ अंकांपासून सुरू होईल आणि प्रत्येक योग्य उत्तरानंतर एक अंक वाढेल. चला पाहूया!",
    },
    keyPoints: {
      en: [
        'Watch the numbers appear one by one.',
        'Type them in the exact same order on the keypad.',
        'The sequence grows longer as you get them right.',
      ],
      hi: [
        'एक-एक करके आने वाले नंबरों को ध्यान से देखें।',
        'उसी क्रम में नंबर पैड पर टाइप करें।',
        'सही उत्तर देने पर संख्या की लंबाई बढ़ती जाएगी।',
      ],
      mr: [
        'एकापाठोपाठ येणारे अंक लक्षपूर्वक पाहा.',
        'त्याच क्रमाने नंबर पॅडवर टाइप करा.',
        'योग्य उत्तर दिल्यावर अंकांची संख्या वाढत जाईल.',
      ],
    },
  },

  verbal: {
    id: 'verbal',
    name: {
      en: 'Voice & Word Fluency Test',
      hi: 'बोलने की गति और शब्द टेस्ट (वर्बल टेस्ट)',
      mr: 'बोलण्याचा वेग आणि शब्द चाचणी (व्हर्बल टेस्ट)',
    },
    shortDesc: {
      en: 'Measures how easily and fluently you can think of and speak words.',
      hi: 'यह देखता है कि आप कितनी सहजता और गति से शब्दों को याद करके बोल पाते हैं।',
      mr: 'तुम्ही किती सहजतेने आणि वेगाने शब्द आठवून बोलू शकता हे पाहते.',
    },
    audioTranscript: {
      en: "Welcome to the Word Fluency Test. When you press Start, you will have 25 seconds to speak out loud as many different animals as you can think of. For example: dog, cat, lion, elephant, monkey. Speak clearly at your normal speaking volume into your microphone. Do not worry about spelling or grammar—just name as many animals as you can before the time runs out. Ready? Click Start Speaking when you are set!",
      hi: "शब्द और बोलने की गति के टेस्ट में आपका स्वागत है। जब आप स्टार्ट दबाएंगे, तो आपके पास 25 सेकंड होंगे। इस समय में आपको जितने अलग-अलग जानवरों के नाम याद आएं, जोर से और साफ आवाज़ में बोलने हैं—जैसे कुत्ता, बिल्ली, शेर, हाथी, बंदर। अपने माइक में सामान्य आवाज़ में बोलें। समय समाप्त होने से पहले जितने हो सके नाम बोलें। तैयार हैं? बोलना शुरू करें!",
      mr: "शब्द चाचणीमध्ये आपले स्वागत आहे. स्टार्ट बटण दाबल्यावर आपल्याकडे २५ सेकंदांचा वेळ असेल. या वेळेत आठवतील तेवढ्या वेगवेगळ्या प्राण्यांची नावे मोठ्याने आणि स्पष्टपणे सांगा—जसे कुत्रा, मांजर, वाघ, हत्ती, माकड. आपल्या मायक्रोफोनमध्ये नेहमीच्या आवाजात स्पष्ट बोला. वेळ संपण्यापूर्वी जास्तीत जास्त प्राण्यांची नावे सांगा. तयार आहात? सुरुवात करा!",
    },
    keyPoints: {
      en: [
        'You have 25 seconds of continuous voice recording.',
        'Name as many different animals as possible.',
        'Speak clearly into your microphone at normal volume.',
      ],
      hi: [
        'आपके पास 25 सेकंड का समय होगा।',
        'जितने संभव हो उतने जानवरों के नाम बोलें।',
        'माइक में सामान्य आवाज़ में साफ-साफ बोलें।',
      ],
      mr: [
        'आपल्याकडे २५ सेकंदांचा वेळ आहे.',
        'शक्य तितक्या विविध प्राण्यांची नावे सांगा.',
        'मायक्रोफोनमध्ये स्पष्ट आणि नैसर्गिक आवाजात बोला.',
      ],
    },
  },

  questionnaire: {
    id: 'questionnaire',
    name: {
      en: 'Everyday Habits & Focus Screener',
      hi: 'दैनिक आदतें और एकाग्रता प्रश्नावली',
      mr: 'दैनंदिन सवयी आणि लक्ष प्रश्नावली',
    },
    shortDesc: {
      en: 'Simple questions about how your attention, senses, and daily routine feel.',
      hi: 'आपके ध्यान, संवेदी अनुभव और रोजमर्रा की आदतों से जुड़े सरल सवाल।',
      mr: 'तुमचे लक्ष, संवेदनशीलता आणि दैनंदिन सवयींशी संबंधित सोपे प्रश्न.',
    },
    audioTranscript: {
      en: "Welcome to the Everyday Habits Questionnaire. This section asks about your day-to-day focus, energy, and communication style. There are no right or wrong answers, and this is not an exam. Please pick whichever answer best matches your real life over the past few months. Your answers remain strictly private on your computer. When you are ready, let us go through the questions one by one.",
      hi: "दैनिक आदतें प्रश्नावली में आपका स्वागत है। इस भाग में आपके दैनिक ध्यान, ऊर्जा और बातचीत करने के तरीके से जुड़े सरल सवाल हैं। इसमें कोई सही या गलत जवाब नहीं है, यह कोई परीक्षा नहीं है। पिछले कुछ महीनों के अपने वास्तविक अनुभवों के आधार पर उत्तर चुनें। आपकी सभी जानकारी आपके फोन या कंप्यूटर पर पूरी तरह सुरक्षित और निजी है। चलिए एक-एक करके सवाल देखते हैं।",
      mr: "दैनंदिन सवयी प्रश्नावलीमध्ये आपले स्वागत आहे. या भागात तुमचे दैनंदिन लक्ष, ऊर्जा आणि संवादाच्या पद्धतींशी संबंधित सोपे प्रश्न आहेत. यात कोणतीही बरोबर किंवा चूक उत्तरे नसतात, ही परीक्षा नाही. गेल्या काही महिन्यांतील तुमच्या प्रत्यक्ष अनुभवांनुसार पर्याय निवडा. तुमची सर्व माहिती पूर्णपणे खाजगी आणि सुरक्षित राहील. चला प्रश्न पाहूया.",
    },
    keyPoints: {
      en: [
        'No right or wrong answers—pick what matches your daily life.',
        'Covers focus, sensory feelings, and everyday routines.',
        '100% Private: Stays on your local device.',
      ],
      hi: [
        'कोई सही या गलत उत्तर नहीं—वही चुनें जो आपके जीवन से मेल खाए।',
        'ध्यान, दिनचर्या और संवेदी आदतों का आसान आकलन।',
        '100% निजी और सुरक्षित: डेटा केवल आपके डिवाइस पर रहता है।',
      ],
      mr: [
        'कोणतेही बरोबर वा चूक उत्तर नाही—तुमच्या सवयींनुसार निवडा.',
        'लक्ष, दिनक्रम आणि भावनांचे सोपे मूल्यांकन.',
        '१००% खाजगी आणि सुरक्षित: माहिती तुमच्याच डिव्हाइसवर राहते.',
      ],
    },
  },
};

export const UI_TRANSLATIONS = {
  // Brand & Header
  appTitle: {
    en: 'NeuroNova',
    hi: 'न्यूरोनोवा',
    mr: 'न्यूरोनोव्हा',
  },
  appSubtitle: {
    en: 'Cognitive Neuro-Analytics & Dual-Track AuDHD Screening',
    hi: 'मस्तिष्क स्वास्थ्य और AuDHD आसान जांच',
    mr: 'मेंदूचे आरोग्य आणि AuDHD सोपी तपासणी',
  },
  endSession: {
    en: 'End Session',
    hi: 'सत्र समाप्त करें',
    mr: 'सत्र समाप्त करा',
  },
  language: {
    en: 'Language',
    hi: 'भाषा',
    mr: 'भाषा',
  },
  geminiKey: {
    en: 'Gemini Key',
    hi: 'AI कुंजी (Key)',
    mr: 'AI की (Key)',
  },
  geminiKeyActive: {
    en: 'AI Key Active',
    hi: 'AI कुंजी सक्रिय',
    mr: 'AI की सक्रिय',
  },

  // Audio Explainer & Controls
  explainTest: {
    en: 'Explain Test',
    hi: 'Explain Test',
    mr: 'Explain Test',
  },
  explainTestSimple: {
    en: 'Explain Test',
    hi: 'टेस्ट समझें',
    mr: 'चाचणी समजावून घ्या',
  },
  audioGuideActive: {
    en: 'Explaining...',
    hi: 'समझाया जा रहा है...',
    mr: 'समजावून सांगत आहे...',
  },
  stopAudio: {
    en: 'Stop Audio',
    hi: 'ऑडियो रोकें',
    mr: 'ऑडिओ थांबवा',
  },
  replayAudio: {
    en: 'Replay Audio Guide',
    hi: 'ऑडियो दोबारा सुनें',
    mr: 'ऑडिओ पुन्हा ऐका',
  },
  showTranscript: {
    en: 'Show Text',
    hi: 'लिखा हुआ देखें',
    mr: 'मजकूर पाहा',
  },
  hideTranscript: {
    en: 'Hide Text',
    hi: 'लिखा हुआ छिपाएं',
    mr: 'मजकूर लपवा',
  },
  geminiAudioCached: {
    en: 'Natural Human Voice',
    hi: 'प्राकृतिक आवाज़',
    mr: 'नैसर्गिक आवाज',
  },

  // Right Rail Controls (Pause, Skip, Reset)
  supervisorControls: {
    en: 'Test Controls',
    hi: 'टेस्ट नियंत्रण',
    mr: 'चाचणी नियंत्रण',
  },
  testingMode: {
    en: 'Active Test',
    hi: 'सक्रिय टेस्ट',
    mr: 'सुरू चाचणी',
  },
  pause: {
    en: 'Pause',
    hi: 'रोकें (Pause)',
    mr: 'थांबवा (Pause)',
  },
  resume: {
    en: 'Resume',
    hi: 'फिर शुरू करें',
    mr: 'पुन्हा सुरू करा',
  },
  resetRound: {
    en: 'Reset',
    hi: 'दोबारा करें',
    mr: 'पुन्हा करा',
  },
  skipTest: {
    en: 'Skip Test',
    hi: 'अगला टेस्ट (Skip)',
    mr: 'पुढील चाचणी (Skip)',
  },
  cameraEnable: {
    en: 'Enable Camera',
    hi: 'कैमरा चालू करें',
    mr: 'कॅमेरा सुरू करा',
  },
  cameraLive: {
    en: 'LIVE',
    hi: 'लाइव',
    mr: 'थेट (Live)',
  },
  gazeGlintDetected: {
    en: 'Eye Focus Tracked',
    hi: 'आंखों का फोकस ट्रैक हो रहा है',
    mr: 'डोळ्यांचे लक्ष ट्रॅक होत आहे',
  },
  gazeOnScreen: {
    en: 'Eye Focus on Screen',
    hi: 'स्क्रीन पर नजर का फोकस',
    mr: 'स्क्रीनवर नजर',
  },
  audioStream: {
    en: 'Microphone Activity',
    hi: 'माइक की आवाज़',
    mr: 'माइकचा आवाज',
  },
  activeAudio: {
    en: 'Active Voice',
    hi: 'आवाज़ सक्रिय',
    mr: 'आवाज सुरू',
  },
  standbyAudio: {
    en: 'Standby',
    hi: 'तैयार (शांत)',
    mr: 'तयार (शांत)',
  },

  // Preflight Screen
  preflightBadge: {
    en: 'Setup & Calibration',
    hi: 'शुरू करने से पहले जरूरी जांच',
    mr: 'सुरू करण्यापूर्वी प्राथमिक तपासणी',
  },
  preflightTitle: {
    en: 'Select Your Assessment & Check Devices',
    hi: 'अपनी जांच का प्रकार चुनें और कैमरा-माइक चेक करें',
    mr: 'चाचणीचा प्रकार निवडा आणि कॅमेरा-माइक तपासा',
  },
  pathwayStep: {
    en: 'Step 1: Choose Who Is Taking the Test',
    hi: 'चरण 1: चुनें कि टेस्ट कौन दे रहा है',
    mr: 'पायरी १: चाचणी कोण देत आहे ते निवडा',
  },
  pathwayAdultTitle: {
    en: 'Adults & Youth (Ages 16+)',
    hi: 'बड़ों और युवाओं के लिए (16+ वर्ष)',
    mr: 'मोठ्यांसाठी आणि १६+ वयोगटासाठी',
  },
  pathwayAdultSubtitle: {
    en: 'Full checkup: Speed, Color Focus, Memory, Voice & Habits',
    hi: 'सम्पूर्ण जांच: स्पीड टेस्ट, रंग पहचान, याददाश्त, बोलने की गति और आदतें',
    mr: 'पूर्ण तपासणी: स्पीड टेस्ट, रंग ओळख, स्मरणशक्ती, बोलण्याचा वेग आणि सवयी',
  },
  pathwayPediatricTitle: {
    en: 'Toddlers (16–30m) & Children',
    hi: 'छोटे बच्चों के लिए (टॉडलर और बच्चे)',
    mr: 'लहान मुलांसाठी तपासणी',
  },
  pathwayPediatricSubtitle: {
    en: 'Parent-guided observation & gentle developmental questionnaire',
    hi: 'माता-पिता द्वारा सरल अवलोकन और विकास से जुड़े आसान प्रश्न',
    mr: 'पालकांनी सहज उत्तरे द्यायची सोपी विकास प्रश्नावली',
  },
  step2Calibration: {
    en: 'Step 2: Device Checks (Camera & Mic)',
    hi: 'चरण 2: कैमरा और माइक की जांच',
    mr: 'पायरी २: कॅमेरा आणि माइकची तपासणी',
  },
  cameraCheckTitle: {
    en: 'Webcam Eye Tracking',
    hi: 'कैमरा और आंखों का फोकस',
    mr: 'कॅमेरा आणि डोळ्यांचे लक्ष',
  },
  cameraCheckDesc: {
    en: 'Tracks natural focus without saving any video recordings.',
    hi: 'बिना कोई वीडियो सेव किए केवल यह देखता है कि आपकी नजर स्क्रीन पर है या नहीं।',
    mr: 'कोणतेही व्हिडिओ रेकॉर्डिंग न साठवता तुमचे लक्ष स्क्रीनवर आहे की नाही ते पाहते.',
  },
  micCheckTitle: {
    en: 'Microphone Check',
    hi: 'माइक की आवाज़ की जांच',
    mr: 'माइकचा आवाज तपासा',
  },
  micCheckDesc: {
    en: 'Checks your microphone for the quick voice test.',
    hi: 'यह सुनिश्चित करता है कि बोलने वाले टेस्ट में आपकी आवाज़ साफ सुनाई दे।',
    mr: 'बोलण्याच्या चाचणीसाठी तुमचा आवाज स्पष्ट येत आहे ना हे तपासते.',
  },
  micTestButton: {
    en: 'Test Mic',
    hi: 'माइक टेस्ट करें',
    mr: 'माइक तपासा',
  },
  micWorking: {
    en: 'Mic Working',
    hi: 'माइक चालू है',
    mr: 'माइक सुरू आहे',
  },
  participantInfo: {
    en: 'Participant Details',
    hi: 'प्रतिभागी की जानकारी',
    mr: 'माहिती',
  },
  ageGroupLabel: {
    en: 'Age Group',
    hi: 'उम्र वर्ग',
    mr: 'वयोगट',
  },
  privacyConsent: {
    en: 'I agree to run this checkup privately on my device. No personal health records are shared.',
    hi: 'मैं यह टेस्ट अपने डिवाइस पर निजी रूप से शुरू करने के लिए सहमत हूँ। कोई निजी डेटा साझा नहीं किया जाता।',
    mr: 'मी ही चाचणी माझ्या डिव्हाइसवर खाजगीरित्या सुरू करण्यास सहमत आहे. कोणताही डेटा शेअर केला जात नाही.',
  },
  startAssessmentButton: {
    en: 'Start Assessment Now',
    hi: 'अभी टेस्ट शुरू करें',
    mr: 'आत्ताच चाचणी सुरू करा',
  },

  // Reaction Time (PVT) Task
  pvtHold: {
    en: 'WAIT FOR GREEN',
    hi: 'रुकें (हरी स्क्रीन का इंतजार करें)',
    mr: 'थांबा (हिरव्या रंगाची प्रतीक्षा करा)',
  },
  pvtClick: {
    en: 'CLICK NOW!',
    hi: 'अभी क्लिक करें!',
    mr: 'आता लगेच क्लिक करा!',
  },
  pvtEarly: {
    en: 'TOO EARLY! Wait for green.',
    hi: 'जल्दबाजी हो गई! स्क्रीन हरी होने तक रुकें।',
    mr: 'घाई झाली! स्क्रीन हिरवी होईपर्यंत थांबा.',
  },
  pvtGreat: {
    en: 'Great Reflex!',
    hi: 'शानदार गति!',
    mr: 'उत्तम प्रतिसाद!',
  },
  pvtRoundInfo: {
    en: 'Round',
    hi: 'राउंड',
    mr: 'फेरी',
  },
  pvtAverageSpeed: {
    en: 'Average Speed',
    hi: 'औसत गति',
    mr: 'सरासरी वेग',
  },
  pvtLapses: {
    en: 'Missed / Slow Clicks',
    hi: 'धीमे या चूके हुए क्लिक',
    mr: 'उशिरा दिलेले प्रतिसाद',
  },

  // Stroop Task
  stroopInstructions: {
    en: 'Pick the INK COLOR of the word, NOT the written word itself!',
    hi: 'शब्द क्या लिखा है वह न पढ़ें, बल्कि जिस रंग की स्याही में लिखा है वह रंग चुनें!',
    mr: 'लिहिलेला शब्द वाचू नका, तो ज्या रंगात लिहिला आहे तो रंग निवडा!',
  },
  colorRed: {
    en: 'RED',
    hi: 'लाल',
    mr: 'लाल',
  },
  colorBlue: {
    en: 'BLUE',
    hi: 'नीला',
    mr: 'निळा',
  },
  colorGreen: {
    en: 'GREEN',
    hi: 'हरा',
    mr: 'हिरवा',
  },
  colorYellow: {
    en: 'YELLOW',
    hi: 'पीला',
    mr: 'पिवळा',
  },
  stroopAccuracy: {
    en: 'Accuracy',
    hi: 'सटीकता',
    mr: 'अचूकता',
  },

  // Digit Span Task
  digitSpanWatch: {
    en: 'Watch & Remember the Numbers',
    hi: 'नंबरों को ध्यान से देखें और याद रखें',
    mr: 'अंक लक्षपूर्वक पाहा आणि लक्षात ठेवा',
  },
  digitSpanRecall: {
    en: 'Type the numbers in the exact order you saw them:',
    hi: 'नंबर जिस क्रम में आए थे, उसी क्रम में यहां टाइप करें:',
    mr: 'अंक ज्या क्रमाने आले होते त्याच क्रमाने टाइप करा:',
  },
  digitSpanSubmit: {
    en: 'Submit',
    hi: 'जमा करें (Submit)',
    mr: 'सबमिट करा (Submit)',
  },
  digitSpanClear: {
    en: 'Clear',
    hi: 'मिटाएं (Clear)',
    mr: 'पुसा (Clear)',
  },
  digitSpanCorrect: {
    en: 'Correct! Next round is longer.',
    hi: 'बिल्कुल सही! अगला राउंड थोड़ा लंबा होगा।',
    mr: 'अगदी बरोबर! पुढील फेरीत आणखी एक अंक असेल.',
  },
  digitSpanLength: {
    en: 'Digits to remember',
    hi: 'याद रखने के लिए नंबर',
    mr: 'लक्षात ठेवायचे अंक',
  },

  // Verbal Fluency Task
  verbalPrompt: {
    en: 'Name as many unique animals as you can speak aloud!',
    hi: 'जितने अलग-अलग जानवरों के नाम याद आएं, जोर से बोलें!',
    mr: 'शक्य तितक्या प्राण्यांची नावे मोठ्याने आणि स्पष्ट सांगा!',
  },
  verbalStart: {
    en: 'Start Speaking (25s)',
    hi: 'बोलना शुरू करें (25 सेकंड)',
    mr: 'बोलायला सुरुवात करा (२५ सेकंद)',
  },
  verbalRecording: {
    en: 'Recording Active... Speak animal names clearly!',
    hi: 'रिकॉर्डिंग चालू है... साफ आवाज़ में जानवरों के नाम बोलें!',
    mr: 'रेकॉर्डिंग सुरू आहे... प्राण्यांची नावे स्पष्टपणे बोला!',
  },
  verbalWordsCount: {
    en: 'Words Detected',
    hi: 'पहचाने गए शब्द',
    mr: 'ओळखलेले शब्द',
  },
  verbalPacing: {
    en: 'Speaking Speed',
    hi: 'बोलने की गति',
    mr: 'बोलण्याचा वेग',
  },

  // Questionnaire / QuestionRenderer
  readQuestion: {
    en: 'Read Question',
    hi: 'सवाल सुनें (Read Question)',
    mr: 'प्रश्न ऐका (Read Question)',
  },
  stopReading: {
    en: 'Stop Reading',
    hi: 'आवाज़ रोकें',
    mr: 'आवाज थांबवा',
  },
  questionProgress: {
    en: 'Question',
    hi: 'सवाल',
    mr: 'प्रश्न',
  },
  ofTotal: {
    en: 'of',
    hi: 'कुल',
    mr: 'पैकी',
  },
  questionnaireSubscale: {
    en: 'Category',
    hi: 'श्रेणी',
    mr: 'वर्ग',
  },
  navPrevious: {
    en: 'Previous Question',
    hi: 'पिछला सवाल',
    mr: 'मागील प्रश्न',
  },
  navNext: {
    en: 'Next Question',
    hi: 'अगला सवाल',
    mr: 'पुढील प्रश्न',
  },
  navComplete: {
    en: 'Finish & View Results',
    hi: 'समाप्त करें और परिणाम देखें',
    mr: 'पूर्ण करा आणि निकाल पाहा',
  },

  // Common Questionnaire Scale Labels
  scaleNever: {
    en: 'Never',
    hi: 'कभी नहीं',
    mr: 'कधीच नाही',
  },
  scaleRarely: {
    en: 'Rarely',
    hi: 'कभी-कभार',
    mr: 'फार क्वचित',
  },
  scaleSometimes: {
    en: 'Sometimes',
    hi: 'कभी-कभी',
    mr: 'कधीकधी',
  },
  scaleOften: {
    en: 'Often',
    hi: 'अक्सर',
    mr: 'वारंवार',
  },
  scaleVeryOften: {
    en: 'Very Often',
    hi: 'हमेशा / बहुत बार',
    mr: 'नेहमी / खूप वेळा',
  },
  scaleDefAgree: {
    en: 'Definitely Agree',
    hi: 'पूरी तरह सहमत',
    mr: 'पूर्णपणे सहमत',
  },
  scaleSlightAgree: {
    en: 'Slightly Agree',
    hi: 'कुछ हद तक सहमत',
    mr: 'काही प्रमाणात सहमत',
  },
  scaleSlightDisagree: {
    en: 'Slightly Disagree',
    hi: 'कुछ हद तक असहमत',
    mr: 'काही प्रमाणात असहमत',
  },
  scaleDefDisagree: {
    en: 'Definitely Disagree',
    hi: 'पूरी तरह असहमत',
    mr: 'पूर्णपणे असहमत',
  },
  scaleYes: {
    en: 'Yes',
    hi: 'हाँ',
    mr: 'होय',
  },
  scaleNo: {
    en: 'No',
    hi: 'नहीं',
    mr: 'नाही',
  },

  // Voice Agent (Chatbot)
  voiceAgentTitle: {
    en: 'Nova Voice AI',
    hi: 'नोवा AI साथी',
    mr: 'नोव्हा AI साथीदार',
  },
  voiceAgentSubtitle: {
    en: 'AuDHD & Cognitive Wellness Companion',
    hi: 'AuDHD और मस्तिष्क स्वास्थ्य मार्गदर्शक',
    mr: 'AuDHD आणि मेंदू आरोग्य मार्गदर्शक',
  },
  voiceAgentScopeNotice: {
    en: 'Ask anything about Autism, ADHD, focus, sensory overload, or your tests.',
    hi: 'ऑटिज्म, ADHD, एकाग्रता, संवेदी अनुभव या अपने टेस्ट के बारे में कुछ भी पूछें।',
    mr: 'ऑटिझम, ADHD, लक्ष, संवेदनशीलता किंवा चाचण्यांबद्दल काहीही विचारा.',
  },
  voiceAgentInputPlaceholder: {
    en: 'Ask a question in English, Hindi, or Marathi...',
    hi: 'अंग्रेजी, हिंदी या मराठी में अपना प्रश्न पूछें...',
    mr: 'इंग्रजी, हिंदी किंवा मराठीत आपला प्रश्न विचारा...',
  },
  voiceAgentListening: {
    en: 'Listening to your voice...',
    hi: 'आपकी आवाज़ सुन रहे हैं...',
    mr: 'तुमचा आवाज ऐकत आहे...',
  },
  voiceAgentSpeaking: {
    en: 'Nova is speaking...',
    hi: 'नोवा बोल रही है...',
    mr: 'नोव्हा बोलत आहे...',
  },
  micPrompt: {
    en: 'Click mic to speak',
    hi: 'बोलने के लिए माइक दबाएं',
    mr: 'बोलण्यासाठी माइक दाबा',
  },
  audioMuted: {
    en: 'Voice Muted',
    hi: 'आवाज़ बंद',
    mr: 'आवाज बंद',
  },
  audioUnmuted: {
    en: 'Voice Active',
    hi: 'आवाज़ चालू',
    mr: 'आवाज सुरू',
  },
  clearChat: {
    en: 'Clear Chat',
    hi: 'बातचीत साफ़ करें',
    mr: 'संभाषण साफ करा',
  },
  disclaimerTag: {
    en: 'Informational Guide • Not a Medical Diagnosis',
    hi: 'मार्गदर्शन जानकारी • यह कोई चिकित्सीय निदान नहीं है',
    mr: 'माहिती मार्गदर्शन • हे वैद्यकीय निदान नाही',
  },

  // Dashboard & Results
  cpiScoreTitle: {
    en: 'Cognitive Performance Index (CPI)',
    hi: 'समग्र मस्तिष्क प्रदर्शन स्कोर (CPI)',
    mr: 'एकूण मेंदू कार्यक्षमता स्कोअर (CPI)',
  },
  cpiScoreSubtitle: {
    en: 'A balanced composite of your reaction speed, focus, working memory, and speech.',
    hi: 'आपकी प्रतिक्रिया गति, ध्यान, याददाश्त और बोलने की सहजता का समग्र स्कोर।',
    mr: 'तुमचा प्रतिसाद वेग, लक्ष, स्मरणशक्ती आणि बोलण्याचा एकत्रित स्कोअर.',
  },
  percentileLabel: {
    en: 'Percentile Rank',
    hi: 'प्रतिशत रैंक (Percentile)',
    mr: 'टक्केवारी रँक (Percentile)',
  },
  confidenceRange: {
    en: 'Estimated Range',
    hi: 'अनुमानित सीमा',
    mr: 'अंदाजित मर्यादा',
  },
  domainAttention: {
    en: 'Attention & Reflex Speed',
    hi: 'एकाग्रता और प्रतिक्रिया गति',
    mr: 'लक्ष आणि प्रतिसाद वेग',
  },
  domainExecutive: {
    en: 'Focus & Distraction Control',
    hi: 'भटकाव रोकने की क्षमता (एक्जीक्यूटिव कंट्रोल)',
    mr: 'विचलित न होता लक्ष ठेवणे',
  },
  domainMemory: {
    en: 'Working Memory Span',
    hi: 'कार्यशील याददाश्त (मेमरी)',
    mr: 'कार्यशील स्मरणशक्ती',
  },
  domainVerbal: {
    en: 'Speech & Word Flow',
    hi: 'बोलने की गति और शब्द प्रवाह',
    mr: 'बोलण्याचा वेग आणि शब्द प्रवाह',
  },
  downloadReport: {
    en: 'Download PDF Report',
    hi: 'रिपोर्ट PDF डाउनलोड करें',
    mr: 'रिपोर्ट PDF डाउनलोड करा',
  },
  printReport: {
    en: 'Print Report',
    hi: 'रिपोर्ट प्रिंट करें',
    mr: 'रिपोर्ट प्रिंट करा',
  },
  retakeTests: {
    en: 'Retake Assessment',
    hi: 'दोबारा टेस्ट दें',
    mr: 'पुन्हा चाचणी द्या',
  },
  clinicalFindings: {
    en: 'Key Understandings & Daily Strengths',
    hi: 'मुख्य निष्कर्ष और आपकी व्यक्तिगत क्षमताएं',
    mr: 'मुख्य निष्कर्ष आणि तुमच्या क्षमता',
  },
  actionableSteps: {
    en: 'Simple Everyday Strategies',
    hi: 'दैनिक जीवन के लिए उपयोगी सुझाव',
    mr: 'दैनंदिन जीवनासाठी सोपे उपाय',
  },
  clinicalAssessmentProfile: {
    en: 'Clinical Assessment Profile',
    hi: 'मस्तिष्क स्वास्थ्य विश्लेषण रिपोर्ट',
    mr: 'मेंदू आरोग्य विश्लेषण अहवाल',
  },
  pediatricBattery: {
    en: 'Pediatric Battery (Parent Informant)',
    hi: 'बच्चों का मूल्यांकन (अभिभावक आधारित)',
    mr: 'मुलांचे मूल्यांकन (पालकांवर आधारित)',
  },
  adultBattery: {
    en: 'Adult Neuro-Cognitive Battery',
    hi: 'वयस्क मस्तिष्क एवं ध्यान टेस्ट',
    mr: 'प्रौढ मेंदू आणि लक्ष चाचणी',
  },
  adultReportTitle: {
    en: 'NeuroNova Clinical Assessment Report',
    hi: 'न्यूरोनोवा मस्तिष्क स्वास्थ्य और कार्यक्षमता रिपोर्ट',
    mr: 'न्यूरोनोव्हा मेंदू आरोग्य आणि कार्यक्षमता अहवाल',
  },
  pediatricReportTitle: {
    en: 'Pediatric Developmental & Behavioral Screening Report',
    hi: 'बच्चों के विकास एवं व्यवहार की रिपोर्ट',
    mr: 'मुलांचा विकास आणि वर्तणूक अहवाल',
  },
  reportSubtitle: {
    en: 'Integrated psychometrics, webcam eye telemetry, and validated behavioral screening outcomes.',
    hi: 'कंप्यूटर टेस्ट, वेबकैम से आंखों की ट्रैकिंग और प्रश्नावली पर आधारित व्यापक विश्लेषण।',
    mr: 'संगणक चाचण्या, वेबकॅम डोळ्यांचे ट्रॅकिंग आणि प्रश्नावलीवर आधारित सविस्तर अहवाल.',
  },
  pediatricReportSubtitle: {
    en: 'Objective webcam face & blink telemetry combined with standardized parent-reported clinical questionnaires.',
    hi: 'कैमरे द्वारा चेहरे व पलकों की गति और अभिभावक प्रश्नावली पर आधारित बच्चों की रिपोर्ट।',
    mr: 'कॅमेऱ्याद्वारे चेहऱ्याच्या हालचाली आणि पालकांच्या प्रश्नावलीवर आधारित मुलांचा अहवाल.',
  },
  newAssessment: {
    en: 'New Assessment',
    hi: 'नया टेस्ट शुरू करें',
    mr: 'नवीन चाचणी सुरू करा',
  },
  compositeIndex: {
    en: 'Composite Score (CPI)',
    hi: 'समग्र मस्तिष्क स्कोर (CPI)',
    mr: 'एकूण मेंदू स्कोअर (CPI)',
  },
  percentileRankSuffix: {
    en: 'th Percentile Rank',
    hi: 'वाँ प्रतिशत रैंक (Percentile)',
    mr: 'वी टक्केवारी रँक (Percentile)',
  },
  keyTakeaways: {
    en: 'Key Takeaways (At a Glance)',
    hi: 'मुख्य बातें (एक नज़र में)',
    mr: 'महत्त्वाच्या गोष्टी (एका दृष्टीक्षेपात)',
  },
  coreCognitiveDomains: {
    en: 'Core Cognitive Domains (Standardized 0–100)',
    hi: 'प्रमुख मस्तिष्क क्षमताएं (0–100 पैमाना)',
    mr: 'प्रमुख मेंदू क्षमता (०–१०० प्रमाण)',
  },
  domainsSubtitle: {
    en: 'Every domain is calibrated against normative population distributions where 75 is the average.',
    hi: 'प्रत्येक क्षेत्र की तुलना सामान्य औसत (75) से की गई है।',
    mr: 'प्रत्येक घटकाची तुलना सामान्य सरासरीशी (७५) केली आहे.',
  },
  yourScore: {
    en: 'Your Score',
    hi: 'आपका स्कोर',
    mr: 'तुमचा स्कोअर',
  },
  populationAverage: {
    en: 'Population Average (75)',
    hi: 'सामान्य औसत (75)',
    mr: 'सामान्य सरासरी (७५)',
  },
  questionnairesTitle: {
    en: 'Standardized Clinical Behavioral Questionnaires (ADHD & Autism)',
    hi: 'मानकीकृत व्यवहार संबंधी प्रश्नावली (ADHD और ऑटिज्म)',
    mr: 'मानकीकृत वर्तन प्रश्नावली (ADHD आणि ऑटिझम)',
  },
  questionnairesSubtitle: {
    en: 'Comprehensive results, symptom domain tallies, and validated clinical triage conclusions.',
    hi: 'एकाग्रता, आवेग और संवेदी विशेषताओं पर आधारित विस्तृत निष्कर्ष।',
    mr: 'लक्ष, आवेग आणि संवेदनशीलता यांवरील सविस्तर निष्कर्ष.',
  },
  clinicalRecommendation: {
    en: 'Clinical Recommendation',
    hi: 'विशेषज्ञ सलाह',
    mr: 'तज्ज्ञांचा सल्ला',
  },
  integratedFindingsTitle: {
    en: 'Integrated Multimodal Findings',
    hi: 'समग्र विश्लेषण और निष्कर्ष',
    mr: 'एकत्रित विश्लेषण आणि निष्कर्ष',
  },
  integratedFindingsSubtitle: {
    en: 'Cross-validates objective webcam face & gaze telemetry with standardized behavioral clinical questionnaires.',
    hi: 'कैमरा ट्रैकिंग और प्रश्नावली के परिणामों का सटीक मिलान और समझ।',
    mr: 'कॅमेरा ट्रॅकिंग आणि प्रश्नावलीच्या निकालांची अचूक सांगड.',
  },
  agreementMatrixTitle: {
    en: 'Cross-Modal Agreement Matrix',
    hi: 'परीक्षण मिलान सारांश',
    mr: 'चाचणी ताळमेळ सारांश',
  },
  telemetryTableTitle: {
    en: 'Test-by-Test Technical Telemetry Table',
    hi: 'प्रत्येक टेस्ट के विस्तृत आंकड़े',
    mr: 'प्रत्येक चाचणीचे सविस्तर आकडे',
  },
  telemetryTableSubtitle: {
    en: 'Complete inventory of cognitive trials, reaction variability, and edge vision biomarkers.',
    hi: 'प्रतिक्रिया समय, एकाग्रता स्थिरता और दृष्टि ट्रैकिंग का पूरा विवरण।',
    mr: 'प्रतिसाद वेळ, लक्ष स्थिरता आणि दृष्टी ट्रॅकिंगचा संपूर्ण तपशील.',
  },
  scoreDriversTitle: {
    en: 'Score Drivers: What Moved Your Score',
    hi: 'स्कोर को प्रभावित करने वाले मुख्य कारक',
    mr: 'स्कोअरवर परिणाम करणारे मुख्य घटक',
  },
  scoreDriversSubtitle: {
    en: 'Shows which individual tests and focus measures influenced your overall score most.',
    hi: 'देखें कि किन टेस्ट्स और एकाग्रता के माप ने आपके स्कोर को सबसे ज्यादा प्रभावित किया।',
    mr: 'कोणत्या चाचण्यांनी आणि घटकांनी तुमच्या स्कोअरवर सर्वाधिक प्रभाव टाकला ते पाहा.',
  },
  nextStepsTitle: {
    en: 'Suggested Next Steps',
    hi: 'आगे के लिए उपयोगी कदम',
    mr: 'पुढील मार्गदर्शक पावले',
  },
  shareWithPro: {
    en: 'Share with a Professional',
    hi: 'डॉक्टर या विशेषज्ञ से चर्चा करें',
    mr: 'डॉक्टर किंवा तज्ज्ञांशी चर्चा करा',
  },
  shareWithProDesc: {
    en: 'Print or export this report to share with your physician, psychologist, or therapist if you notice daily focus challenges.',
    hi: 'दैनिक जीवन में ध्यान या काम में समस्या आने पर यह रिपोर्ट अपने डॉक्टर या मनोचिकित्सक को दिखाएं।',
    mr: 'दैनंदिन कामात किंवा लक्ष केंद्रित करण्यात अडचण येत असल्यास हा अहवाल तुमच्या डॉक्टरांना दाखवा.',
  },
  optimizeFocus: {
    en: 'Optimize Focus Intervals',
    hi: 'काम के बीच छोटे ब्रेक लें',
    mr: 'कामादरम्यान लहान विश्रांती घ्या'
  },
  optimizeFocusDesc: {
    en: 'Implement structured work periods (such as 25-minute Pomodoro sprints) with deliberate screen breaks to minimize strain.',
    hi: '25 मिनट काम और 5 मिनट आराम (पोमोडोरो) की आदत बनाएं ताकि आंखों और दिमाग को ताजगी मिले।',
    mr: '२५ मिनिटे काम आणि ५ मिनिटे विश्रांती अशी पद्धत वापरा जेणेकरून मेंदू आणि डोळ्यांवर ताण येणार नाही.'
  },
  trackLongitudinally: {
    en: 'Track Longitudinally',
    hi: 'नियमित अंतराल पर जांचें',
    mr: 'नियमित अंतराने तपासा'
  },
  trackLongitudinallyDesc: {
    en: 'Retake this assessment across different environments to observe how sleep, exercise, and stress levels influence attention stamina.',
    hi: 'अच्छी नींद, कसरत और तनाव का आपके ध्यान पर क्या असर होता है, यह जानने के लिए कुछ समय बाद दोबारा टेस्ट दें।',
    mr: 'झोप, व्यायाम आणि ताणतणाव यांचा तुमच्या एकाग्रतेवर काय परिणाम होतो हे पाहण्यासाठी काही दिवसांनी पुन्हा चाचणी द्या.'
  },
  limitsTitle: {
    en: 'Limits of This Assessment & Non-Diagnostic Disclosure',
    hi: 'महत्वपूर्ण सूचना एवं डिस्क्लेमर',
    mr: 'महत्त्वाची सूचना आणि डिस्क्लेमर',
  },
  appendixTitle: {
    en: 'Technical Appendix & Psychometric Methodology',
    hi: 'तकनीकी विवरण और कार्यप्रणाली',
    mr: 'तांत्रिक तपशील आणि कार्यपद्धती',
  },
  appendixSubtitle: {
    en: 'Mathematical formulas, screener cutoffs, sensor calibration, and privacy architecture.',
    hi: 'गणितीय सूत्र, कटऑफ मानक, सेंसर कैलिब्रेशन और डेटा सुरक्षा।',
    mr: 'गणितीय सूत्रे, कटऑफ निकष, सेन्सर कॅलिब्रेशन आणि डेटा सुरक्षितता.',
  },
};

/**
 * Clean, simple translations for standard questionnaire questions.
 * Eliminates medical jargon and translates into friendly everyday language.
 */
export const QUESTION_TRANSLATIONS = {
  // ASRS 6-Question ADHD Screener
  asrs_1: {
    hi: 'जब किसी काम का कठिन भाग पूरा हो जाता है, तो क्या उसके बाद बचे हुए छोटे-छोटे विवरणों को पूरा करने में आपको परेशानी होती है?',
    mr: 'एखाद्या कामाचा कठीण भाग पूर्ण झाल्यावर, उरलेल्या छोट्या गोष्टी पूर्ण करणे तुम्हाला कठीण वाटते का?',
  },
  asrs_2: {
    hi: 'जब किसी ऐसे काम को करना हो जिसमें योजना बनाने की जरूरत हो, तो क्या आपको चीजों को व्यवस्थित करने में कठिनाई होती है?',
    mr: 'नियोजन करावे लागणारे काम करताना गोष्टी व्यवस्थित मांडणे किंवा नियोजन करणे तुम्हाला अवघड वाटते का?',
  },
  asrs_3: {
    hi: 'क्या आपको अपनी जरूरी मीटिंग्स, अपॉइंटमेंट या वादों को याद रखने में परेशानी होती है?',
    mr: 'महत्त्वाच्या भेटीगाठी किंवा दिलेले शब्द लक्षात ठेवण्यात तुम्हाला अडचण येते का?',
  },
  asrs_4: {
    hi: 'जब कोई ऐसा काम हो जिसमें बहुत सोच-विचार की जरूरत हो, तो क्या आप उसे शुरू करने में टालमटोल या देरी करते हैं?',
    mr: 'खूप विचार करावे लागणारे काम समोर आल्यास, ते सुरू करणे तुम्ही पुढे ढकलतात का?',
  },
  asrs_5: {
    hi: 'जब आपको लंबे समय तक एक जगह बैठना पड़ता है, तो क्या आप बेचैन होकर अपने हाथ या पैर हिलाते रहते हैं?',
    mr: 'बराच वेळ एका जागी बसावे लागल्यास, तुम्ही अस्वस्थ होऊन हात किंवा पाय हलवत राहतात का?',
  },
  asrs_6: {
    hi: 'क्या आपको ऐसा लगता है जैसे आप हर समय किसी मोटर या इंजन की तरह लगातार दौड़ रहे हैं और रुक नहीं पा रहे?',
    mr: 'तुम्ही सतत घाईत आहात किंवा एखाद्या मोटरसारखे सतत पळत आहात असे तुम्हाला अनेकदा वाटते का?',
  },

  // AQ-10 Autism Screener
  aq10_1: {
    hi: 'क्या आप अक्सर ऐसी छोटी आवाज़ें नोटिस कर लेते हैं जो दूसरे लोग नहीं सुन पाते?',
    mr: 'इतर लोकांना न ऐकू येणारे बारीक आवाज तुम्हाला लगेच ऐकू येतात का?',
  },
  aq10_2: {
    hi: 'क्या आप किसी बड़ी तस्वीर को देखने के बजाय उसके छोटे-छोटे विवरणों पर ज्यादा ध्यान देते हैं?',
    mr: 'मोठ्या चित्राकडे पाहण्यापेक्षा तुम्ही त्यातील बारकाव्यांवर जास्त लक्ष केंद्रित करता का?',
  },
  aq10_3: {
    hi: 'क्या आपके लिए एक साथ कई काम करना आसान होता है?',
    mr: 'एकाच वेळी अनेक कामे करणे तुम्हाला सोपे जाते का?',
  },
  aq10_4: {
    hi: 'अगर काम के बीच में कोई रुकावट आ जाए, तो क्या आप बहुत जल्दी वापस अपने काम पर ध्यान लगा लेते हैं?',
    mr: 'कामात अडथळा आला, तरी तुम्ही लगेच पुन्हा कामावर लक्ष केंद्रित करू शकता का?',
  },
  aq10_5: {
    hi: 'बातचीत करते समय क्या आप लोगों की बातों के छिपे हुए अर्थ को आसानी से समझ जाते हैं?',
    mr: 'संभाषणादरम्यान लोकांच्या बोलण्यातील अप्रत्यक्ष अर्थ तुम्हाला सहज समजतो का?',
  },
  aq10_6: {
    hi: 'क्या आप किसी का चेहरा देखकर तुरंत पहचान लेते हैं कि वह खुश है, दुखी है या परेशान है?',
    mr: 'एखाद्याचा चेहरा पाहून तो आनंदी आहे की दुःखी हे तुम्हाला लगेच ओळखता येते का?',
  },
  aq10_7: {
    hi: 'कहानियां पढ़ते या फिल्में देखते समय क्या आप आसानी से समझ जाते हैं कि पात्र क्या सोच रहे हैं?',
    mr: 'गोष्टी वाचताना किंवा चित्रपट पाहताना पात्रांच्या मनातील विचार तुम्हाला सहज कळतात का?',
  },
  aq10_8: {
    hi: 'क्या आपको अलग-अलग चीजों, घटनाओं या श्रेणियों के बारे में जानकारी इकट्ठा करना पसंद है?',
    mr: 'वेगवेगळ्या विषयांची किंवा गोष्टींची माहिती गोळा करणे तुम्हाला आवडते का?',
  },
  aq10_9: {
    hi: 'क्या आप लोगों के चेहरे के हाव-भाव और नजरों को देखकर उनकी भावनाएं आसानी से भांप लेते हैं?',
    mr: 'लोकांच्या चेहऱ्यावरील भाव पाहून त्यांच्या भावना ओळखणे तुम्हाला सोपे वाटते का?',
  },
  aq10_10: {
    hi: 'क्या आपको लोगों की वास्तविक नीयत या इरादों का अंदाजा लगाने में कठिनाई होती है?',
    mr: 'लोकांचे खरे हेतू ओळखणे तुम्हाला अनेकदा कठीण वाटते का?',
  },
};

/**
 * Helper to get simple question text in chosen language
 */
export function getTranslatedQuestion(item, lang = 'en') {
  if (!item) return '';
  if (lang === 'en' || !lang) return item.text || '';
  
  const itemId = item.id || `item_${item.number}`;
  const translated = QUESTION_TRANSLATIONS[itemId];
  if (translated && translated[lang]) {
    return translated[lang];
  }
  return item.text || '';
}

/**
 * Helper to get simple scale label in chosen language
 */
export function getTranslatedScaleLabel(label, lang = 'en') {
  if (!label || lang === 'en') return label;

  const map = {
    never: UI_TRANSLATIONS.scaleNever,
    rarely: UI_TRANSLATIONS.scaleRarely,
    sometimes: UI_TRANSLATIONS.scaleSometimes,
    often: UI_TRANSLATIONS.scaleOften,
    'very often': UI_TRANSLATIONS.scaleVeryOften,
    'definitely agree': UI_TRANSLATIONS.scaleDefAgree,
    'slightly agree': UI_TRANSLATIONS.scaleSlightAgree,
    'slightly disagree': UI_TRANSLATIONS.scaleSlightDisagree,
    'definitely disagree': UI_TRANSLATIONS.scaleDefDisagree,
    yes: UI_TRANSLATIONS.scaleYes,
    no: UI_TRANSLATIONS.scaleNo,
  };

  const key = String(label).toLowerCase().trim();
  const entry = map[key];
  if (entry && entry[lang]) {
    return entry[lang];
  }
  return label;
}
