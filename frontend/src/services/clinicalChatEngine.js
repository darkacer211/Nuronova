/**
 * clinicalChatEngine.js
 * Intelligent, client-side conversational clinical assistant for NeuroNova.
 * Provides ultra-natural, empathetic, multilingual responses (English, Hindi, Marathi)
 * for Autism, ADHD, AuDHD, and cognitive performance queries.
 */

const CLINICAL_KNOWLEDGE = [
  {
    key: 'greetings',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'नमस्ते', 'नमस्कार', 'हैलो'],
    response: {
      en: "Hey there! I'm Nova, your companion for all things AuDHD, Autism, ADHD, and cognitive energy. How is your brain feeling today? Whether you want to talk focus hacks, sensory self-care, or walk through your screening results, I'm right here with you.",
      hi: "नमस्ते! मैं नोवा हूँ—ऑटिज्म, ADHD और AuDHD के सफर में आपकी अपनी साथी। आज आपका मूड और ध्यान कैसा है? चाहे काम शुरू करने की उलझन हो, सेंसरी थकान हो या अपने टेस्ट स्कोर को समझना हो, मैं हर कदम पर आपके साथ हूँ।",
      mr: "नमस्कार! मी नोव्हा—ऑटिझम, ADHD आणि AuDHD च्या प्रवासात तुमची हक्काची मार्गदर्शक. आज कसे वाटत आहे? कामावर लक्ष केंद्रित करणे असो, मानसिक थकवा कमी करणे असो किंवा तुमचे स्कोअर समजून घेणे असो, मी इथे मदतीसाठी तयार आहे.",
    },
  },
  {
    key: 'gratitude',
    keywords: ['thank', 'thanks', 'thx', 'appreciate', 'धन्यवाद', 'शुक्रिया', 'आभार'],
    response: {
      en: "You're so very welcome! Navigating neurodiversity can feel exhausting at times, but you are doing amazing by taking time to understand your brain. Whenever any other question pops into your head, I'll be right here.",
      hi: "बहुत-बहुत धन्यवाद! अपने दिमाग की कार्यशैली को समझना और खुद को स्वीकार करना बहुत बड़ी बात है। जब भी कोई नया सवाल मन में आए, मैं हमेशा यहीं हूँ!",
      mr: "अगदी मनापासून धन्यवाद! स्वतःच्या मेंदूची कार्यपद्धती समजून घेणे खूप मोलाचे आहे. पुन्हा कधीही काही विचारायचे असल्यास मी नेहमीच सोबत आहे!",
    },
  },
  {
    key: 'identity',
    keywords: ['who are you', 'what are you', 'what do you do', 'who is nova', 'तुम कौन हो', 'तू कोण आहेस', 'तुझे नाव'],
    response: {
      en: "I'm Nova, NeuroNova's neurodiversity companion! I'm designed specifically around the lived experiences and neuroscience of Autism, ADHD, and AuDHD. I help you understand your brain's unique rhythms, navigate executive dysfunction, tame sensory overwhelm, and interpret your cognitive screening results with warmth and zero judgment.",
      hi: "मैं नोवा हूँ—न्यूरोनोवा की विशेष साथी! मैं ऑटिज्म, ADHD और AuDHD के विज्ञान और असल अनुभवों को ध्यान में रखकर बनाई गई हूँ। मैं आपको अपने दिमाग की अनूठी कार्यशैली समझने, काम शुरू करने की बाधाओं से निपटने और अपने टेस्ट नतीजों को आसान भाषा में समझने में मदद करती हूँ।",
      mr: "मी नोव्हा—न्यूरोनोव्हाची विशेष मार्गदर्शक! मी ऑटिझम, ADHD आणि AuDHD च्या विज्ञानावर आधारित आहे. तुमचा मेंदू कसा विचार करतो, कामाची सुरुवात करण्यात येणारे अडथळे कसे दूर करावेत आणि चाचण्यांचे निकाल सहज कसे समजून घ्यावेत यामध्ये मी तुम्हाला मदत करते.",
    },
  },
  {
    key: 'audhd',
    keywords: ['audhd', 'both', 'autism and adhd', 'adhd and autism', 'autistic adhd', 'दोस्त', 'दोनों', 'दोन्ही'],
    response: {
      en: "Having AuDHD can genuinely feel like your brain is running two opposing operating systems at once. One half is desperately craving structure, predictability, and a quiet deep dive, while the other half is chasing shiny new dopamine and gets bored in thirty seconds. It's not a flaw—it's a real neurotype. The secret is building flexible routines: give yourself a reliable anchor, but leave plenty of freedom for spontaneous bursts of interest.",
      hi: "AuDHD का अनुभव ऐसा होता है जैसे एक ही दिमाग में दो अलग-अलग पहिए घूम रहे हों! आपका ऑटिस्टिक हिस्सा शांति, निश्चित दिनचर्या और व्यवस्था चाहता है, जबकि ADHD हिस्सा लगातार नई उत्तेजना, डोपामाइन और बदलाव ढूंढता है। जब ये दोनों टकराते हैं, तो काम अटक जाता है। इसका सबसे बढ़िया तरीका है 'लचीली दिनचर्या'—ज़रूरी कामों के लिए ढांचा बनाएं, लेकिन मस्ती और अचानक आए विचारों के लिए भी पूरी छूट रखें!",
      mr: "AuDHD म्हणजे एकाच मेंदूत दोन परस्परविरोधी विचार चालणे! ऑटिझम पैलूला शांतता, ठरावीक दिनक्रम आणि शिस्त आवडते, तर ADHD पैलूला सतत नवीन गोष्टी, डोपामाइन आणि उत्साह हवा असतो. या दोन्हींच्या संघर्षात अनेकदा काम रखडते. यावर मात करण्यासाठी 'लवचिक दिनक्रम' आखा—महत्त्वाच्या कामांसाठी चौकट ठेवा, पण अचानक सुचणाऱ्या कल्पना आणि आवडीसाठीही भरपूर वेळ मोकळा ठेवा!",
    },
  },
  {
    key: 'executive_dysfunction',
    keywords: ['executive', 'start task', 'starting task', 'start work', 'get started', 'getting started', 'hard to start', 'trouble starting', 'struggling to start', 'procrastinat', 'cant start', "can't start", 'cant do', "can't do", 'paralysis', 'couch lock', 'lazy', 'laziness', 'आलस', 'काम शुरू', 'टालना', 'अडचण'],
    response: {
      en: "First off, please hear this: you are NOT lazy. Executive dysfunction is a genuine glitch in dopamine signaling in your prefrontal cortex. It literally makes starting a task feel as physically exhausting as pushing a stalled car. When you get stuck, lower the bar completely: try the micro-step rule. Don't write the whole report—just open the file and type one sentence. Once you break that initial friction, momentum usually takes over.",
      hi: "सबसे पहली बात: आप बिल्कुल भी आलसी नहीं हैं! काम शुरू न कर पाना दिमाग में डोपामाइन की कमी की वजह से होता है। इसे 'टास्क पैरालिसिस' कहते हैं, जहां काम के बारे में सोचते-सोचते ही थकावट होने लगती है। इसका सीधा इलाज है काम को इतना छोटा कर देना कि दिमाग डरे ही नहीं। पूरी फाइल बनाने के बजाय सिर्फ फाइल खोलकर एक लाइन लिखें। एक बार शुरुआत हो गई, तो आगे बढ़ना बहुत आसान हो जाता है।",
      mr: "सगळ्यात आधी हे लक्षात घ्या: तुम्ही आळशी मुळीच नाही आहात! काम सुरू करता न येणे हा मेंदूतील डोपामाइनच्या प्रवाहाशी संबंधित अडथळा आहे. याला 'टास्क पॅरालिसिस' म्हणतात. यातून बाहेर पडण्यासाठी काम अत्यंत लहान करा—उदा. संपूर्ण काम करण्याऐवजी फक्त कॉम्प्युटर उघडून एक ओळ लिहा किंवा कामाची जागा बदला. सुरुवात झाली की पुढचा रस्ता खूप सोपा होतो.",
    },
  },
  {
    key: 'focus_attention',
    keywords: ['focus', 'cant focus', "can't focus", 'hard to focus', 'concentrat', 'attention', 'distract', 'dopamine', 'zone out', 'daydream', 'mind wandering', 'study', 'ध्यान', 'एकाग्रता', 'लक्ष', 'भटकना'],
    response: {
      en: "ADHD and AuDHD brains aren't broken; they are interest-based nervous systems. Your brain doesn't have an attention deficit—it has an attention regulation difference. Without dopamine, focusing feels like tuning a radio into pure static. Try pairing boring tasks with high-dopamine triggers: sip your favorite cold drink, put on instrumental video-game soundtracks, change your physical workspace, or gamify your timer with a fifteen-minute sprint.",
      hi: "ADHD वाले दिमाग में ध्यान की कमी नहीं होती, बल्कि ध्यान को नियंत्रित करने का तरीका अलग होता है। अगर किसी काम में रुचि या डोपामाइन नहीं है, तो ध्यान लगाना रेडियो की सरसराहट जैसा लगता है। इसके लिए बोरिंग काम के साथ कोई मजेदार चीज जोड़ें: जैसे मनपसंद चाय या गाना, या केवल 15 मिनट का टाइमर लगाकर खुद से रेस लगाना। दिमाग को जैसे ही थोड़ा डोपामाइन मिलता है, फोकस खुद-ब-खुद लौट आता है।",
      mr: "ADHD मेंदूमध्ये एकाग्रतेचा अभाव नसतो, तर लक्ष नियंत्रित करण्याची पद्धत वेगळी असते. ज्या कामात उत्साह किंवा डोपामाइन मिळत नाही, तिथे लक्ष देणे खूप अवघड वाटते. यावर उपाय म्हणजे कंटाळवाण्या कामासोबत काहीतरी आनंददायी जोडणे: जसे की आवडते संगीत ऐकणे, चहाचा घोट घेणे, किंवा १५ मिनिटांचा टाईमर लावून काम करणे. डोपामाइन मिळाले की एकाग्रता आपोआप वाढते.",
    },
  },
  {
    key: 'sensory_overload',
    keywords: ['sensory', 'noise', 'sound', 'loud', 'light', 'texture', 'crowd', 'overload', 'overwhelm', 'सेंसरी', 'आवाज़', 'रोशनी', 'थकान', 'आवाज', 'प्रकाश'],
    response: {
      en: "Sensory overload happens when your nervous system's intake filter gets completely flooded. Fluorescent lights, fabric seams, and background chatter hit your brain at full blast without getting filtered out. If you're feeling on edge or irritable, your sensory cup is overflowing. Step into a dim room, slip on noise-canceling headphones, drink cold water, and give your senses ten minutes of quiet nothingness to reset.",
      hi: "सेंसरी ओवरलोड तब होता है जब दिमाग एक साथ बहुत सारी आवाज़ों, तेज रोशनी या भीड़ को झेलते-झेलते थक जाता है। सामान्य व्यक्ति का दिमाग पृष्ठभूमि के शोर को अनदेखा कर देता है, लेकिन न्यूरोडाइवर्जेंट दिमाग में हर आवाज़ पूरी तीव्रता से गूंजती है। जब भी चिड़चिड़ाहट महसूस हो, तुरंत थोड़ी देर के लिए शांत अंधेरे कमरे में जाएं, हेडफ़ोन लगाएं और कुछ मिनट गहरी सांस लें।",
      mr: "सेन्सरी ओव्हरलोड म्हणजे जेव्हा मेंदूवर आवाज, प्रखर प्रकाश, किंवा गर्दीचा एकाच वेळी प्रचंड ताण येतो. इतर लोकांचा मेंदू अनावश्यक आवाजांकडे दुर्लक्ष करू शकतो, पण आपला मेंदू प्रत्येक आवाज तीव्रतेने नोंदवतो. जेव्हा डोके भणभणायला लागेल किंवा चीडचीड होईल, तेव्हा मंद प्रकाशात शांत बसा, हेडफोन लावा आणि मेंदूला १० मिनिटांची शांतता द्या.",
    },
  },
  {
    key: 'meltdowns_shutdowns',
    keywords: ['meltdown', 'shutdown', 'crying', 'angry', 'explode', 'numb', 'can\'t talk', 'cant talk', 'nonverbal', 'mute', 'गुस्सा', 'रोना', 'चुप', 'राग'],
    response: {
      en: "Meltdowns and shutdowns are physiological fight-or-flight emergencies, never tantrums or drama. A meltdown is an external explosion when sensory and emotional pressure breaches the dam. A shutdown is that same crisis turned completely inward—going mute, staring blankly, or feeling frozen and numb. The cure isn't logic; it's physical safety: soft blankets, darkness, water, zero talking, and complete emotional acceptance.",
      hi: "मेल्टडाउन या शटडाउन कोई नखरा या ड्रामा नहीं है—यह दिमाग की भारी ओवरलोडिंग का नतीजा है। मेल्टडाउन में भावनाएं गुस्से या रोने के रूप में बाहर फूट पड़ती हैं, जबकि शटडाउन में व्यक्ति पूरी तरह सुन्न होकर अंदर सिमट जाता है और बोलना भी भारी लगने लगता है। ऐसे समय में तर्क या बहस के बजाय सिर्फ शांत माहौल, अंधेरा और समझदारी की ज़रूरत होती है।",
      mr: "मेल्टडाउन किंवा शटडाउन हा कोणताही अभिनय किंवा राग नसून मेंदूचा सहनशीलतेचा बांध फुटल्याची खूण आहे. मेल्टडाउनमध्ये भावनांचा स्फोट होतो, तर शटडाउनमध्ये माणूस आतून सुन्न होतो आणि बोलणेही कठीण जाते. अशा वेळी वादाऐवजी सुरक्षित, शांत वातावरण, मंद प्रकाश आणि विश्रांतीची नितांत गरज असते.",
    },
  },
  {
    key: 'masking_burnout',
    keywords: ['mask', 'masking', 'camouflag', 'burnout', 'exhausted', 'pretend', 'fitting in', 'मास्क', 'मास्किंग', 'थकावट', 'बर्नआउट', 'लपवणे'],
    response: {
      en: "Masking is running a heavy 24/7 background program to mimic neurotypical expectations—forcing eye contact, suppressing stims, rehearsing lines before speaking, and swallowing discomfort. While it helps avoid social friction, it drains your battery at triple speed, eventually triggering deep autistic burnout where you can barely speak or function. Unmasking around safe people and giving yourself permission to just be is life-saving medicine.",
      hi: "मास्किंग का मतलब है दूसरों के सामने 'नॉर्मल' दिखने के लिए अपनी स्वाभाविक आदतों को जानबूझकर दबाना—जैसे जबरदस्ती आंखों में देखना, हिलना-डुलना रोकना, या बात करने से पहले मन में रिहर्सल करना। यह नाटक बहुत भारी पड़ता है और इससे गहरा मानसिक बर्नआउट हो जाता है। सुरक्षित लोगों के बीच अपना असली रूप अपनाना और खुद को ढोंग करने से आज़ाद करना बेहद ज़रूरी है।",
      mr: "मास्किंग म्हणजे समाजात 'इतरांसारखे' दिसण्यासाठी सतत मुखवटा घालून वावरणे—जसे की जबरदस्ती डोळ्यात डोळे घालून बोलणे किंवा नैसर्गिक सवयी लपवणे. यामुळे काही काळ सुरक्षित वाटत असले तरी मेंदूची ताकद संपून तीव्र बर्नआउट येतो. सुरक्षित मित्रांसोबत हा मुखवटा उतरवून स्वतःच्या नैसर्गिक रूपात राहणे आरोग्यासाठी अत्यंत गरजेचे आहे.",
    },
  },
  {
    key: 'time_blindness',
    keywords: ['time blindness', 'running late', 'late', 'clock', 'calendar', 'schedule', 'timer', 'deadline', 'समय', 'देरी', 'वेळ', 'उशीर'],
    response: {
      en: "In ADHD and AuDHD, time is rarely experienced as a continuous ruler. Instead, there are often only two modes: NOW and NOT NOW. If a deadline isn't immediate, it feels imaginary until panic hits. To beat time blindness, make time visible: use analog clocks with visual color wedges, set transition alarms ten minutes before you actually need to move, and always add a twenty-minute buffer to every estimate.",
      hi: "ADHD और AuDHD में समय का अनुभव आम लोगों जैसा नहीं होता। हमारे दिमाग में सिर्फ दो ही समय होते हैं: 'अभी' और 'बाद में'। जब तक कोई काम सिर पर न आ जाए, उसका अहसास ही नहीं होता। इसे 'टाइम ब्लाइंडनेस' कहते हैं। इससे निपटने के लिए दीवार पर बड़ी घड़ी लगाएं, निकलने से 10 मिनट पहले का अलार्म सेट करें, और हर काम में 15-20 मिनट का एक्स्ट्रा मार्जिन लेकर चलें।",
      mr: "ADHD मध्ये वेळेचा अंदाज सामान्यपणे येत नाही. मेंदूसाठी फक्त दोनच वेळा असतात: 'आत्ता' आणि 'नंतर'. जोपर्यंत अंतिम मुदत जवळ येत नाही तोपर्यंत कामाचे गांभीर्य वाटत नाही. यावर उपाय म्हणजे डोळ्यांसमोर दिसणारे मोठे घड्याळ वापरणे, निघण्याच्या १० मिनिटे आधीचा अलार्म लावणे आणि प्रत्येक कामासाठी २० मिनिटे जास्तीचा वेळ गृहीत धरणे.",
    },
  },
  {
    key: 'working_memory',
    keywords: ['working memory', 'memory', 'forget', 'lost', 'whiteboard', 'keys', 'याददाश्त', 'भूलना', 'स्मरण', 'विसरणे'],
    response: {
      en: "Working memory in ADHD is like a tiny mental whiteboard that someone keeps wiping with a sponge! You walk into the kitchen, a thought passes by, and poof—the goal is gone. Don't blame your intelligence! Offload memory immediately onto external tools: use whiteboard markers on your mirror, keep a quick note widget on your phone home screen, and create dedicated landing zones for your essentials right by the door.",
      hi: "ADHD में याददाश्त एक ऐसे व्हाइटबोर्ड जैसी होती है जो किसी छोटे से ख्याल से भी तुरंत साफ हो जाती है। आप किसी कमरे में जाकर भूल जाते हैं कि क्या लेने आए थे! यह कोई बुद्धिमत्ता की कमी नहीं है। दिमाग पर बोझ डालने के बजाय चीजों को तुरंत फोन में लिख लें, दरवाजे के पास चाबी-बटुए की एक निश्चित जगह बनाएं, और एक समय में एक ही बात पर ध्यान दें।",
      mr: "ADHD मध्ये स्मरणशक्ती एखाद्या लहान पाटीसारखी असते जी लगेच पुसली जाते. तुम्ही खोलीत जाताच नक्की कशासाठी आला होता हे विसरता! यात तुमची कोणतीही चूक नाही. गोष्टी लक्षात ठेवण्याचा ताण घेण्याऐवजी त्या लगेच मोबाईलमध्ये नोंदवा, घराच्या दाराजवळ चाव्या आणि पाकीट ठेवण्याची एकच जागा ठरवा.",
    },
  },
  {
    key: 'stimming',
    keywords: ['stim', 'stimming', 'fidget', 'rocking', 'pacing', 'tapping', 'स्टिम', 'हिलाना', 'बोटे', 'हात पाय'],
    response: {
      en: "Stimming—like rocking, finger-tapping, pacing, singing loops, or playing with fidget toys—is pure self-regulation! It's your brain's rhythmic way of either calming an overwhelmed nervous system or pumping dopamine into an under-stimulated brain. As long as it isn't physically hurting you, embrace your stims! They are a natural superpower for staying calm and present.",
      hi: "स्टिमिंग—जैसे पैर हिलाना, उंगलियां बजाना, टहलना या फिजेट्स का उपयोग करना—दिमाग को शांत और स्थिर रखने का एक बिल्कुल स्वाभाविक तरीका है। यह कोई बुरी आदत नहीं है, बल्कि आपका शरीर खुद को तनाव या बोरियत से बचाने के लिए यह करता है। जब तक इससे किसी को चोट न पहुंचे, स्टिमिंग को अपनाएं और खुलकर करें!",
      mr: "स्टिमिंग (जसे की पाय हलवणे, बोटे वाजवणे, येरझारा घालणे किंवा फिजेट्स वापरणे) हे भावनांवर नियंत्रण ठेवण्याचे मेंदूचे नैसर्गिक तंत्र आहे. ही कोणतीही वाईट सवय नसून मेंदूला ताण किंवा कंटाळ्यापासून वाचवण्याचा उपाय आहे. यामुळे मन शांत राहण्यास खूप मदत होते.",
    },
  },
  {
    key: 'hyperfocus',
    keywords: ['hyperfocus', 'special interest', 'obsess', 'rabbit hole', 'deep dive', 'जुनून', 'डूबा रहना', 'आवड'],
    response: {
      en: "Hyperfocus and special interests are the brilliant silver linings of neurodivergence. When a topic sparks genuine fascination, your brain floods with dopamine, letting you absorb knowledge and build things at lightning speed for hours without feeling tired. The only tricky part is transitioning away to eat, drink, or sleep—so having kind external alarms keeps your hyperfocus sustainable and joyful!",
      hi: "हाइपरफोकस और स्पेशल इंटरेस्ट न्यूरोडाइवर्जेंट दिमाग की सबसे बड़ी खूबी हैं! जब कोई विषय आपको सच में पसंद आता है, तो दिमाग में इतना डोपामाइन भर जाता है कि आप घंटों बिना थके उसमें डूब सकते हैं और कमाल का काम कर सकते हैं। बस इतना ध्यान रखें कि बीच-बीच में पानी पीने और खाना खाने के लिए अलार्म लगा लें ताकि सेहत अच्छी रहे!",
      mr: "हायपरफोकस आणि स्पेशल इंटरेस्ट ही न्यूरोडायव्हर्जंट मेंदूची खरी ताकद आहे! एखादा विषय मनापासून आवडला की मेंदू तासन् तास न थकता सखोल अभ्यास करू शकतो. फक्त एकच काळजी घ्यायची असते—वेळेवर पाणी पिणे आणि जेवणासाठी अलार्म लावणे, जेणेकरून आरोग्याकडे दुर्लक्ष होणार नाही.",
    },
  },
  {
    key: 'rsd',
    keywords: ['rsd', 'rejection', 'criticism', 'sensitive', 'hates me', 'disappointed', 'अपमान', 'बुरा लगना', 'दुखापत'],
    response: {
      en: "Rejection Sensitive Dysphoria (RSD) is an intense, physical-feeling emotional ache triggered by perceived rejection or criticism. It hits so fast that it feels like getting punched in the gut. Remind yourself: my nervous system is sounding a ten out of ten alarm for a two out of ten situation. Give your body ten minutes to ride out the adrenaline wave before responding.",
      hi: "रिजेक्शन सेंसिटिव डिस्फोरिया (RSD) एक ऐसा तीव्र मानसिक दर्द है जो किसी की छोटी सी डांट, आलोचना या नज़रअंदाज़ किए जाने पर सीने में चुभन जैसा लगता है। कई बार ऐसा लगता है कि सब हमसे नफरत करते हैं। जब ऐसा हो, तो खुद को याद दिलाएं: 'यह मेरा दिमाग एक छोटी सी बात पर खतरे का बड़ा सायरन बजा रहा है।' थोड़ा रुकें, पानी पिएं और उस भावना के शांत होने का इंतज़ार करें।",
      mr: "रिजेक्शन सेन्सिटिव्ह डिस्फोरिया (RSD) म्हणजे इतरांच्या किंचितशा टीकेमुळे किंवा दुर्लक्षामुळे मनाला होणारी तीव्र वेदना. जणू छातीवर जोराचा धक्का बसल्यासारखे वाटते. अशा वेळी स्वतःला आठवण करून द्या: 'माझा मेंदू एका किरकोळ गोष्टीवर मोठा धोक्याचा इशारा देत आहे.' दीर्घ श्वास घ्या, पाणी प्या आणि भावना शांत होऊ द्या.",
    },
  },
  {
    key: 'sleep',
    keywords: ['sleep', 'insomnia', 'awake', 'racing thoughts', 'bedtime', 'revenge bedtime', 'नींद', 'सोना', 'झोप', 'जागणे'],
    response: {
      en: "Why does the neurodivergent brain suddenly come alive at midnight? Because daytime sensory chaos is finally over, and your brain is finally having quiet, unpressured dopamine time. Instead of forcing yourself to just sleep, lower the lights an hour early, swap phone scrolling for a cozy audiobook or ambient soundscape, and keep a bedside notebook to dump racing thoughts.",
      hi: "रात को 12 बजे दिमाग अचानक एक्टिव क्यों हो जाता है? क्योंकि दिनभर का शोर-शराबा खत्म हो चुका होता है और दिमाग को बिना किसी दबाव के अपनी मर्जी का डोपामाइन मिलता है। जबरदस्ती सोने की कोशिश करने के बजाय, कमरे की बत्तियां धीमी करें, फोन दूर रखें और कोई सुकून देने वाला पॉडकास्ट या धीमी आवाज़ सुनें। सिरहाने एक डायरी रखें और मन में आने वाले विचार लिख लें।",
      mr: "रात्री मेंदू अचानक जागा का होतो? कारण दिवसभराचा गोंधळ संपलेला असतो आणि मेंदूला स्वतःच्या आवडीनुसार डोपामाइन मिळवण्यासाठी शांत वेळ मिळतो. झोपेसाठी जबरदस्ती करण्याऐवजी, खोलीतील प्रकाश मंद करा, मोबाईल बाजूला ठेवा आणि शांत संगीत किंवा ऑडिओबुक ऐका. उशीजवळ वही ठेवून डोक्यात येणारे विचार लिहून काढा.",
    },
  },
  {
    key: 'cpi_scores',
    keywords: ['cpi', 'score', 'percentile', 'results', 'speed test', 'reaction time', 'stroop', 'digit span', 'pvt', 'verbal', 'report', 'स्कोर', 'गुण', 'नतीजे', 'चाचणी'],
    response: {
      en: "NeuroNova's Cognitive Performance Index (CPI) brings your reaction speed, inhibitory focus, working memory span, and speech flow into a normalized zero to one hundred score. Crucially, CPI is NOT an IQ test—it measures your functional cognitive energy and executive control in real-time. It helps you see when your brain thrives and where it needs gentle scaffolding.",
      hi: "न्यूरोनोवा का CPI स्कोर आपकी प्रतिक्रिया गति, ध्यान नियंत्रण, याददाश्त और बोलने की सहजता को मिलाकर 0 से 100 का एक आसान स्कोर देता है। यह कोई IQ या बुद्धिमत्ता का टेस्ट नहीं है—यह केवल यह दिखाता है कि आपका दिमाग कितनी तेजी से काम करता है और कहां उसे ब्रेक या सहारे की ज़रूरत है।",
      mr: "न्यूरोनोव्हाचा CPI स्कोअर तुमच्या प्रतिसादाचा वेग, लक्ष, स्मरणशक्ती आणि बोलण्याचा प्रवाह एकत्र करून ० ते १०० दरम्यान गुण दर्शवतो. ही पारंपारिक बुद्धिमत्तेची चाचणी नसून, दैनंदिन जीवनात तुमचा मेंदू ऊर्जा आणि लक्ष कसे सांभाळतो हे समजून घेण्यासाठी आहे.",
    },
  },
  {
    key: 'diagnosis',
    keywords: ['diagnos', 'doctor', 'psychiatrist', 'official', 'am i autistic', 'am i adhd', 'डॉक्टर', 'निदान', 'तपासणी'],
    response: {
      en: "NeuroNova is an evidence-backed multimodal screening tool designed to illuminate cognitive patterns, but it is not a formal medical diagnosis. If your scores and lived experiences resonate with AuDHD, taking your NeuroNova summary report to a neurodiversity-affirming clinical psychologist or psychiatrist is an empowering next step. You deserve clarity and support.",
      hi: "न्यूरोनोवा एक आधुनिक और वैज्ञानिक स्क्रीनिंग टूल है जो आपकी मानसिक कार्यप्रणाली को समझने में मदद करता है, लेकिन यह कोई अंतिम मेडिकल डायग्नोसिस नहीं है। यदि आपके स्कोर और अनुभव AuDHD या ADHD से मेल खाते हैं, तो इस रिपोर्ट को किसी अच्छे मनोवैज्ञानिक या डॉक्टर को दिखाना एक बेहतरीन कदम होगा।",
      mr: "न्यूरोनोव्हा हे मेंदूची कार्यक्षमता समजून घेणारे शास्त्रीय स्क्रीनिंग टूल आहे, पण हे अधिकृत वैद्यकीय निदान नाही. जर तुमचे गुण आणि अनुभव AuDHD किंवा ADHD शी जुळत असतील, तर हा अहवाल घेऊन एखाद्या चांगल्या मानसोपचारतज्ज्ञांचा सल्ला घेणे अत्यंत फायदेशीर ठरेल.",
    },
  },
];

const INTENT_PATTERNS = [
  { key: 'greetings', patterns: [/\b(hello|hi|hey|good morning|good afternoon|good evening|howdy|sup|namaste|नमस्ते|नमस्कार|हैलो)\b/i] },
  { key: 'gratitude', patterns: [/\b(thank|thanks|thx|appreciate|धन्यवाद|शुक्रिया|आभार)\b/i] },
  { key: 'identity', patterns: [/\b(who are you|what are you|what can you do|who is nova|तुम कौन हो|तू कोण आहेस)\b/i] },
  { key: 'audhd', patterns: [/\b(audhd|autistic adhd)\b/i, /\b(autism|autistic)\b.*\b(adhd)\b/i, /\b(adhd)\b.*\b(autism|autistic)\b/i, /\b(both)\b.*\b(autism|adhd)\b/i] },
  {
    key: 'executive_dysfunction',
    patterns: [
      /\b(executive|procrastinat\w*|paralysis|couch lock|laziness)\b/i,
      /\b(cant|can't|cannot|unable|struggl\w*|hard|trouble)\b.*\b(start|begin|do\b|finish|get going)\b/i,
      /\b(why)\b.*\b(start|begin|procrastinat\w*)\b/i,
      /\b(start|starting)\b.*\b(task|work|project|study|anything)\b/i,
      /(काम शुरू|टालना|आलस|सुरुवात|अडचण)/i,
    ],
  },
  {
    key: 'focus_attention',
    patterns: [
      /\b(focus|concentrat\w*|distract\w*|dopamine|zone out|daydream|mind wander\w*)\b/i,
      /\b(attention)\b.*\b(span|deficit|regulation|hold)\b/i,
      /(ध्यान|एकाग्रता|लक्ष|भटकना)/i,
    ],
  },
  {
    key: 'sensory_overload',
    patterns: [
      /\b(sensory|overload|overwhelm\w*|noise|loud|fluorescent|texture)\b/i,
      /(सेंसरी|आवाज़|रोशनी|थकान|आवाज|प्रकाश)/i,
    ],
  },
  {
    key: 'meltdowns_shutdowns',
    patterns: [
      /\b(meltdown|shutdown|crying|explode|numb|nonverbal|mute|going mute)\b/i,
      /(मेल्टडाउन|शटडाउन|गुस्सा|रोना|चुप|राग)/i,
    ],
  },
  {
    key: 'masking_burnout',
    patterns: [
      /\b(mask|masking|camouflag\w*|burnout|fitting in|pretend\w* normal)\b/i,
      /(मास्क|मास्किंग|बर्नआउट|लपवणे)/i,
    ],
  },
  {
    key: 'time_blindness',
    patterns: [
      /\b(time blindness|running late|always late|lose track of time|lost track of time)\b/i,
      /\b(time)\b.*\b(management|blind|estimate|flying|pass)\b/i,
      /(समय|देरी|वेळ|उशीर)/i,
    ],
  },
  {
    key: 'working_memory',
    patterns: [
      /\b(working memory|forget\w*|forgot\w*|short term memory|whiteboard|lost keys)\b/i,
      /(याददाश्त|भूलना|स्मरण|विसरणे)/i,
    ],
  },
  {
    key: 'stimming',
    patterns: [
      /\b(stim|stimming|fidget\w*|rocking|pacing|tapping fingers)\b/i,
      /(स्टिम|हिलाना|बोटे|हात पाय)/i,
    ],
  },
  {
    key: 'hyperfocus',
    patterns: [
      /\b(hyperfocus|special interest|rabbit hole|deep dive|obsess\w*)\b/i,
      /(हाइपरफोकस|जुनून|डूबा रहना|आवड)/i,
    ],
  },
  {
    key: 'rsd',
    patterns: [
      /\b(rsd|rejection sensitive|fear of rejection|everyone hates me|criticism)\b/i,
      /(अपमान|बुरा लगना|दुखापत)/i,
    ],
  },
  {
    key: 'sleep',
    patterns: [
      /\b(sleep\w*|asleep|insomnia|bedtime|racing thoughts|cant sleep|can't sleep|staying up late)\b/i,
      /(नींद|सोना|झोप|जागणे)/i,
    ],
  },
  {
    key: 'cpi_scores',
    patterns: [
      /\b(cpi|score\w*|percentile|stroop|pvt|digit span|speed test|verbal fluency|reaction time|results|test)\b/i,
      /(स्कोर|गुण|नतीजे|चाचणी)/i,
    ],
  },
  {
    key: 'diagnosis',
    patterns: [
      /\b(diagnos\w*|doctor|psychiatrist|official|assessment|am i autistic|am i adhd)\b/i,
      /(डॉक्टर|निदान|तपासणी)/i,
    ],
  },
];

/**
 * Generate intelligent clinical response locally with weighted scoring
 */
export function generateLocalClinicalResponse(userQuery, lang = 'en') {
  const query = (userQuery || '').toLowerCase().replace(/[\u2018\u2019]/g, "'");
  const targetLang = lang === 'hi' ? 'hi' : lang === 'mr' ? 'mr' : 'en';

  // 1. High-confidence regex intent matching
  for (const { key, patterns } of INTENT_PATTERNS) {
    for (const p of patterns) {
      if (p.test(query)) {
        const found = CLINICAL_KNOWLEDGE.find((entry) => entry.key === key);
        if (found) {
          return found.response[targetLang] || found.response.en;
        }
      }
    }
  }

  // 2. Keyword fallback scoring
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of CLINICAL_KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (query.includes(kw)) {
        score += kw.length + 5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestEntry && bestScore > 0) {
    return bestEntry.response[targetLang] || bestEntry.response.en;
  }

  // Empathetic, human conversational fallback
  if (targetLang === 'hi') {
    return "यह न्यूरोडाइवर्जेंट जिंदगी का बहुत ही महत्वपूर्ण पहलू है। ऑटिज्म, ADHD और AuDHD में हमारा दिमाग और भावनाएं बिल्कुल अनोखे तरीके से काम करती हैं। क्या आप ध्यान लगाने के आसान नुस्खे, सेंसरी थकान दूर करने के उपाय, या अपने टेस्ट स्कोर के बारे में कुछ और जानना चाहते हैं?";
  } else if (targetLang === 'mr') {
    return "हा न्यूरोडायव्हर्जंट मेंदूच्या प्रवासातील अतिशय महत्त्वाचा पैलू आहे. ऑटिझम, ADHD आणि AuDHD मध्ये आपली मानसिक ऊर्जा आणि लक्ष विशिष्ट पद्धतीने कार्य करते. आपल्याला लक्ष वाढवण्याच्या सोप्या क्लृप्त्या, थकवा कमी करण्याचे उपाय किंवा चाचण्यांच्या निकालांविषयी आणखी जाणून घ्यायला आवडेल का?";
  }

  return "That touches on such a meaningful aspect of living with a neurodivergent brain. In Autism, ADHD, and AuDHD, our nervous systems navigate energy, focus, and stimulation in beautifully unique ways. Would you like to dig into practical focus hacks, explore sensory regulation, or look at what your screening scores mean for your day-to-day rhythm?";
}

/**
 * Full dispatch: Backend -> Direct Gemini API (if key) -> Intelligent Local Fallback
 */
export async function queryVoiceAgent({
  message,
  language = 'en',
  history = [],
  geminiApiKey = '',
}) {
  const backendUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    'http://127.0.0.1:8000';

  // 1. Try backend server endpoint first
  try {
    const res = await fetch(`${backendUrl}/api/v1/voice-agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        history,
        api_key: geminiApiKey,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return { reply: data.reply, provider: data.provider || 'backend' };
      }
    }
  } catch {
    // Backend offline or unreachable, proceed seamlessly
  }

  // 2. If user has a Gemini API Key, query Gemini 2.0 REST directly from browser
  if (geminiApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiApiKey}`;
      const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are Nova, an empathetic, validating clinical companion for NeuroNova specializing in Autism, ADHD, AuDHD, and cognitive wellness. Speak warmly, naturally, and conversationally in ${langName} in under 75 words. Do NOT use markdown asterisks or bullet points. User question: ${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.45,
          maxOutputTokens: 220,
        },
      };

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanedText = text.replace(/[*_#]/g, '').trim();
          return { reply: cleanedText, provider: 'gemini-direct' };
        }
      }
    } catch {
      // Proceed to intelligent local engine
    }
  }

  // 3. Guaranteed, instant, highly intelligent local clinical knowledge response
  const localReply = generateLocalClinicalResponse(message, language);
  return { reply: localReply, provider: 'clinical-intelligence-local' };
}
