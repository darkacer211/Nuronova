import React, { useState, useEffect, useRef } from 'react';

import { useLanguage } from '../context/LanguageContext';

import { speakInstruction, stopAllSpeech } from '../services/speechEngine';

import { queryVoiceAgent } from '../services/clinicalChatEngine';

import {

  GeminiLiveSession,

  LIVE_VOICES,

  preloadLiveToken,

} from '../services/geminiLiveClient';

export default function VoiceAgent() {

  const {

    language,

    setLanguage,

    supportedLanguages,

    t,

    geminiApiKey,

    isVoiceAgentOpen,

    setIsVoiceAgentOpen,

  } = useLanguage();

  // Two primary options: "talk" or "chat"

  const [activeTab, setActiveTab] = useState('talk');

  const getWelcomeText = (lang) => {

    if (lang === 'hi') {

      return 'नमस्ते! मैं नोवा हूँ—ऑटिज्म, ADHD और AuDHD के सफर में आपकी अपनी साथी। चाहे काम शुरू करने की उलझन हो, सेंसरी थकान हो या अपने टेस्ट स्कोर को समझना हो, मैं हर कदम पर आपके साथ हूँ। आज मन में क्या सवाल है?';

    }

    if (lang === 'mr') {

      return 'नमस्कार! मी नोव्हा—तुमची मेंदू आरोग्य आणि AuDHD मार्गदर्शक. कामावर लक्ष केंद्रित करणे असो, मानसिक थकवा कमी करणे असो किंवा तुमचे स्कोअर समजून घेणे असो, मी सोबत आहे. आज काय चर्चा करूया?';

    }

    return "Hey there! I'm Nova, your companion for navigating Autism, ADHD, and AuDHD. Whether you want to talk focus hacks, untangle sensory overload, or understand your screening scores, I'm right here with you. What's on your mind today?";

  };

  const [messages, setMessages] = useState(() => [

    {

      id: 'welcome',

      sender: 'agent',

      text: getWelcomeText(language),

      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

    },

  ]);

  // Update welcome message if language changes and no interaction yet

  useEffect(() => {

    setMessages((prev) => {

      if (prev.length === 1 && prev[0].id === 'welcome') {

        return [

          {

            id: 'welcome',

            sender: 'agent',

            text: getWelcomeText(language),

            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

          },

        ];

      }

      return prev;

    });

  }, [language]);

  // Chat tab state

  const [inputText, setInputText] = useState('');

  const [isListening, setIsListening] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  const [isTyping, setIsTyping] = useState(false);

  const [recognitionError, setRecognitionError] = useState('');

  // Talk tab (Gemini Live Phone Call) state

  const [isLiveCallActive, setIsLiveCallActive] = useState(false);

  const [liveCallStatus, setLiveCallStatus] = useState('idle'); // 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended'

  const [callDuration, setCallDuration] = useState(0);

  const [isCallMicMuted, setIsCallMicMuted] = useState(false);

  const [selectedVoice, setSelectedVoice] = useState('Aoede');

  const [micVolume, setMicVolume] = useState(0);

  const [agentVolume, setAgentVolume] = useState(0);

  const liveSessionRef = useRef(null);

  const callTimerRef = useRef(null);

  const messagesEndRef = useRef(null);

  const recognitionRef = useRef(null);

  const callRecRef = useRef(null);

  const callEngineModeRef = useRef('idle'); // 'gemini' | 'native' | 'idle'

  const nativeVolumeIntervalRef = useRef(null);

  const isSpeakingRef = useRef(false);

  const geminiAudioTimeoutRef = useRef(null);

  const [liveUserTranscript, setLiveUserTranscript] = useState('');

  const [liveAgentSubtitle, setLiveAgentSubtitle] = useState('');

  // Suggested prompt chips based on selected language
  const suggestedChips = {

    en: [

      'What is AuDHD?',

      'Why can’t I start tasks?',

      'How to stop sensory overload',

      'Why do I lose track of time?',

      'Explain my test scores',

    ],

    hi: [

      'AuDHD क्या है?',

      'काम शुरू करने में दिक्कत क्यों होती है?',

      'सेंसरी ओवरलोड से कैसे बचें?',

      'समय का अंदाजा क्यों नहीं रहता?',

      'मेरे टेस्ट स्कोर का क्या मतलब है?',

    ],

    mr: [

      'AuDHD म्हणजे काय?',

      'काम सुरू करताना अडचण का येते?',

      'सेन्सरी ओव्हरलोडवर उपाय काय?',

      'वेळेचे भान का राहत नाही?',

      'माझ्या चाचणी गुणांचा अर्थ काय?',

    ],

  }[language] || [

    'What is AuDHD?',

    'Why can’t I start tasks?',

    'How to stop sensory overload',

  ];

  // Auto-scroll messages in chat

  useEffect(() => {

    if (activeTab === 'chat') {

      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    }

  }, [messages, isTyping, activeTab]);

  // Pre-fetch ephemeral token as soon as voice agent is opened

  // Clean up speech synthesis & simulated timers on unmount

  useEffect(() => {

    return () => {

      if (nativeVolumeIntervalRef.current) {

        clearInterval(nativeVolumeIntervalRef.current);

        nativeVolumeIntervalRef.current = null;

      }

      if (geminiAudioTimeoutRef.current) { clearTimeout(geminiAudioTimeoutRef.current); geminiAudioTimeoutRef.current = null; }

      stopAllSpeech();

    };

  }, []);

  useEffect(() => {

    if (isVoiceAgentOpen) {

      preloadLiveToken(geminiApiKey);

    } else {

      stopAllSpeech();

      setIsSpeaking(false);

      if (recognitionRef.current) {

        recognitionRef.current.stop();

        setIsListening(false);

      }

      if (isLiveCallActive) {

        handleEndLiveCall();

      }

    }

  }, [isVoiceAgentOpen]);

  // Call timer effect

  useEffect(() => {

    if (

      isLiveCallActive &&

      (liveCallStatus === 'connected' ||

        liveCallStatus === 'speaking' ||

        liveCallStatus === 'listening')

    ) {

      callTimerRef.current = setInterval(() => {

        setCallDuration((prev) => prev + 1);

      }, 1000);

    } else {

      if (callTimerRef.current) {

        clearInterval(callTimerRef.current);

        callTimerRef.current = null;

      }

    }

    return () => {

      if (callTimerRef.current) {

        clearInterval(callTimerRef.current);

        callTimerRef.current = null;

      }

    };

  }, [isLiveCallActive, liveCallStatus]);

  const formatCallTime = (seconds) => {

    const mins = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  };

  // --- Live Voice Calling Engine (Unified Zero-Collision Architecture) ---

  const simulateAgentVoiceVolume = (active) => {

    if (nativeVolumeIntervalRef.current) {

      clearInterval(nativeVolumeIntervalRef.current);

      nativeVolumeIntervalRef.current = null;

    }

    if (active) {

      nativeVolumeIntervalRef.current = setInterval(() => {

        setAgentVolume(Math.floor(Math.random() * 45) + 40);

      }, 120);

    } else {

      setAgentVolume(0);

    }

  };

  const startUnifiedLiveRecognition = () => {

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {

      console.warn('Speech recognition not available.');

      setRecognitionError('Speech recognition is not available in this browser. Please use Chrome or Edge.');

      return;

    }

    if (callRecRef.current) {

      try { callRecRef.current.abort(); } catch {}

      callRecRef.current = null;

    }

    try {

      const rec = new SpeechRec();

      rec.continuous = true;

      rec.interimResults = true;

      rec.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';

      let silenceTimer = null;

      let accumulatedFinal = '';

      rec.onresult = (evt) => {

        // While Nova is currently speaking aloud, suppress microphone echo so she does not self-interrupt

        if (isSpeakingRef.current) return;

        let interim = '';

        for (let i = evt.resultIndex; i < evt.results.length; i++) {

          const trans = evt.results[i][0].transcript;

          if (evt.results[i].isFinal) {

            accumulatedFinal += ' ' + trans;

          } else {

            interim += trans;

          }

        }

        const text = (accumulatedFinal || interim).trim();

        if (text) {

          setLiveUserTranscript(text);

          setMicVolume(Math.min(95, Math.floor(Math.random() * 30) + 50));

          if (silenceTimer) clearTimeout(silenceTimer);

          silenceTimer = setTimeout(() => {

            const finalText = text;

            accumulatedFinal = '';

            setLiveUserTranscript('');

            dispatchLiveUserTurn(finalText);

          }, 850);

        }

      };

      rec.onerror = (e) => {

        console.warn('Live speech recognition notice:', e.error);

        if (e.error === 'not-allowed') {

          setRecognitionError('Microphone permission required for call. Please allow microphone access.');

        }

      };

      rec.onend = () => {

        if (callEngineModeRef.current !== 'idle' && !isCallMicMuted) {

          try { rec.start(); } catch {}

        }

      };

      rec.start();

      callRecRef.current = rec;

    } catch (e) {

      console.warn('Failed to start speech recognition:', e);

    }

  };

  const dispatchLiveUserTurn = async (spokenText) => {

    if (!spokenText || !spokenText.trim()) return;

    if (callEngineModeRef.current === 'idle') return;

    setMicVolume(0);

    setLiveCallStatus('speaking');

    isSpeakingRef.current = true;

    setIsSpeaking(true);

    const userMsg = {

      id: `user_${Date.now()}`,

      sender: 'user',

      text: spokenText.trim(),

      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

    };

    setMessages((prev) => [...prev, userMsg]);

    if (geminiAudioTimeoutRef.current) {

      clearTimeout(geminiAudioTimeoutRef.current);

      geminiAudioTimeoutRef.current = null;

    }

    if (callEngineModeRef.current === 'gemini' && liveSessionRef.current?.isConnected) {

      setLiveAgentSubtitle('Thinking...');

      liveSessionRef.current.sendUserSpeech(spokenText.trim());

      // If Gemini Live does not begin streaming audio chunks within 2500ms, use clinical engine

      geminiAudioTimeoutRef.current = setTimeout(() => {

        console.warn('Gemini Live audio timeout, falling back to clinical speech engine.');

        speakNativeTurn(spokenText.trim());

      }, 2500);

    } else {

      speakNativeTurn(spokenText.trim());

    }

  };

  const speakNativeTurn = async (spokenText) => {

    if (geminiAudioTimeoutRef.current) {

      clearTimeout(geminiAudioTimeoutRef.current);

      geminiAudioTimeoutRef.current = null;

    }

    try {

      setLiveAgentSubtitle('Thinking...');

      const reply = await queryVoiceAgent(spokenText, language, geminiApiKey);

      const cleanReply = reply ? reply.trim() : (

        language === 'hi'

          ? 'मैं आपकी बात समझ रही हूँ। आगे बताइए।'

          : language === 'mr'

          ? 'मला समजले. पुढे सांगा.'

          : 'I hear you completely. Tell me more.'

      );

      const agentMsg = {

        id: `agent_${Date.now()}`,

        sender: 'agent',

        text: cleanReply,

        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

      };

      setMessages((prev) => [...prev, agentMsg]);

      setLiveAgentSubtitle(cleanReply);

      simulateAgentVoiceVolume(true);

      speakInstruction({

        text: cleanReply,

        language,

        onStart: () => {

          setIsSpeaking(true);

          isSpeakingRef.current = true;

          setLiveCallStatus('speaking');

        },

        onEnd: () => {

          simulateAgentVoiceVolume(false);

          setIsSpeaking(false);

          isSpeakingRef.current = false;

          setLiveAgentSubtitle('');

          if (callEngineModeRef.current !== 'idle') {

            setLiveCallStatus('listening');

          }

        },

        onError: () => {

          simulateAgentVoiceVolume(false);

          setIsSpeaking(false);

          isSpeakingRef.current = false;

          setLiveAgentSubtitle('');

          if (callEngineModeRef.current !== 'idle') {

            setLiveCallStatus('listening');

          }

        },

      });

    } catch (err) {

      console.error('Error generating reply:', err);

      simulateAgentVoiceVolume(false);

      setIsSpeaking(false);

      isSpeakingRef.current = false;

      setLiveAgentSubtitle('');

      if (callEngineModeRef.current !== 'idle') {

        setLiveCallStatus('listening');

      }

    }

  };

  const startNativeLiveCall = () => {

    callEngineModeRef.current = 'native';

    setIsLiveCallActive(true);

    setLiveCallStatus('speaking');

    isSpeakingRef.current = true;

    setIsSpeaking(true);

    const greetingText =

      language === 'hi'

        ? 'नमस्ते! मैं नोवा हूँ, ऑटिज़्म और ADHD में आपकी अपनी साथी। मैं आपके साथ लाइव कॉल पर हूँ। आज आप किस बारे में बात करना चाहते हैं?'

        : language === 'mr'

        ? 'नमस्कार! मी नोव्हा, आपली AuDHD मार्गदर्शक. मी आपल्यासोबत थेट कॉलवर आहे. आज आपण कोणत्या विषयावर चर्चा करूया?'

        : "Hey there! I'm Nova, your companion for Autism, ADHD, and AuDHD. I'm right here with you on the line. What's on your mind today?";

    setMessages((prev) => {

      const last = prev[prev.length - 1];

      if (last && last.sender === 'agent' && last.text === greetingText) return prev;

      return [

        ...prev,

        {

          id: `agent_${Date.now()}`,

          sender: 'agent',

          text: greetingText,

          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        },

      ];

    });

    setLiveAgentSubtitle(greetingText);

    simulateAgentVoiceVolume(true);

    speakInstruction({

      text: greetingText,

      language,

      onStart: () => {

        setIsSpeaking(true);

        isSpeakingRef.current = true;

        setLiveCallStatus('speaking');

      },

      onEnd: () => {

        simulateAgentVoiceVolume(false);

        setIsSpeaking(false);

        isSpeakingRef.current = false;

        setLiveAgentSubtitle('');

        if (callEngineModeRef.current !== 'idle') {

          setLiveCallStatus('listening');

          startUnifiedLiveRecognition();

        }

      },

      onError: () => {

        simulateAgentVoiceVolume(false);

        setIsSpeaking(false);

        isSpeakingRef.current = false;

        setLiveAgentSubtitle('');

        if (callEngineModeRef.current !== 'idle') {

          setLiveCallStatus('listening');

          startUnifiedLiveRecognition();

        }

      },

    });

  };

  // --- Start Live Call Main Entrypoint ---

  const handleStartLiveCall = async () => {

    stopAllSpeech();

    setIsSpeaking(false);

    isSpeakingRef.current = false;

    setLiveUserTranscript('');

    setLiveAgentSubtitle('');

    if (geminiAudioTimeoutRef.current) {

      clearTimeout(geminiAudioTimeoutRef.current);

      geminiAudioTimeoutRef.current = null;

    }

    if (recognitionRef.current) {

      recognitionRef.current.stop();

      setIsListening(false);

    }

    setActiveTab('talk');

    setIsLiveCallActive(true);

    setLiveCallStatus('connecting');

    setCallDuration(0);

    setIsCallMicMuted(false);

    // If no Gemini key is provided, start native call immediately

    if (!geminiApiKey) {

      startNativeLiveCall();

      return;

    }

    callEngineModeRef.current = 'gemini';

    try {

      const session = new GeminiLiveSession({

        apiKey: geminiApiKey,

        language,

        voiceName: selectedVoice,

        onStatusChange: (status) => {

          setLiveCallStatus(status);

          if (status === 'speaking') {

            if (geminiAudioTimeoutRef.current) {

              clearTimeout(geminiAudioTimeoutRef.current);

              geminiAudioTimeoutRef.current = null;

            }

            setIsSpeaking(true);

            isSpeakingRef.current = true;

          } else if (status === 'listening') {

            setIsSpeaking(false);

            isSpeakingRef.current = false;

            setLiveAgentSubtitle('');

          }

        },

        onTranscript: (turnMessage) => {

          setMessages((prev) => {

            const last = prev[prev.length - 1];

            if (last && last.sender === turnMessage.sender && last.text.trim() === turnMessage.text.trim()) {

              return prev;

            }

            return [...prev, turnMessage];

          });

        },

        onVolume: ({ micLevel, agentLevel }) => {

          setMicVolume(micLevel);

          setAgentVolume(agentLevel);

        },

        onError: (err) => {

          console.warn('Gemini Live call error, falling back to Native Live Calling:', err);

          if (callEngineModeRef.current === 'gemini') {

            if (liveSessionRef.current) {

              liveSessionRef.current.stop();

              liveSessionRef.current = null;

            }

            startNativeLiveCall();

          }

        },

      });

      liveSessionRef.current = session;

      await session.start();

      // Start unified live speech recognition

      startUnifiedLiveRecognition();

    } catch (err) {

      console.warn('Error starting Gemini live session, falling back to Native Live Calling:', err);

      startNativeLiveCall();

    }

  };

  const handleEndLiveCall = () => {

    callEngineModeRef.current = 'idle';

    if (nativeVolumeIntervalRef.current) {

      clearInterval(nativeVolumeIntervalRef.current);

      nativeVolumeIntervalRef.current = null;

    }

    if (geminiAudioTimeoutRef.current) {

      clearTimeout(geminiAudioTimeoutRef.current);

      geminiAudioTimeoutRef.current = null;

    }

    stopAllSpeech();

    if (callRecRef.current) {

      try {

        callRecRef.current.stop();

      } catch {}

      callRecRef.current = null;

    }

    if (liveSessionRef.current) {

      liveSessionRef.current.stop();

      liveSessionRef.current = null;

    }

    setIsLiveCallActive(false);

    setLiveCallStatus('idle');

    setMicVolume(0);

    setAgentVolume(0);

    setIsSpeaking(false);

    isSpeakingRef.current = false;

    setLiveUserTranscript('');

    setLiveAgentSubtitle('');

    // Add session conclusion marker in chat history

    if (callDuration > 0) {

      setMessages((prev) => [

        ...prev,

        {

          id: `call_end_${Date.now()}`,

          sender: 'system',

          text: `📞 Live Call Ended • Duration: ${formatCallTime(callDuration)}`,

          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

        },

      ]);

    }

  };

  const handleToggleCallMute = () => {

    const nextMute = !isCallMicMuted;

    setIsCallMicMuted(nextMute);

    if (nextMute) {

      if (callRecRef.current) {

        try { callRecRef.current.stop(); } catch {}

      }

    } else {

      startUnifiedLiveRecognition();

    }

    if (liveSessionRef.current) {

      liveSessionRef.current.setMute(nextMute);

    }

  };

  // Handle Speech Recognition (Microphone for text chat mode)

  const handleToggleMic = () => {

    if (isListening) {

      if (recognitionRef.current) {

        recognitionRef.current.stop();

      }

      setIsListening(false);

      return;

    }

    const SpeechRecognition =

      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setRecognitionError('Speech recognition is not supported in this browser.');

      setTimeout(() => setRecognitionError(''), 4000);

      return;

    }

    try {

      const recognition = new SpeechRecognition();

      recognitionRef.current = recognition;

      recognition.continuous = false;

      recognition.interimResults = false;

      recognition.lang =

        language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';

      recognition.onstart = () => {

        setIsListening(true);

        setRecognitionError('');

      };

      recognition.onresult = (event) => {

        const transcript = event.results[0][0].transcript;

        if (transcript) {

          setInputText(transcript);

          sendMessage(transcript);

        }

      };

      recognition.onerror = (event) => {

        console.warn('Speech recognition error:', event.error);

        setIsListening(false);

        if (event.error !== 'no-speech') {

          setRecognitionError(`Mic error: ${event.error}`);

          setTimeout(() => setRecognitionError(''), 3000);

        }

      };

      recognition.onend = () => {

        setIsListening(false);

      };

      recognition.start();

    } catch (err) {

      console.warn('Recognition start error:', err);

      setIsListening(false);

    }

  };

  // Send message to voice agent (Chat tab)

  const sendMessage = async (textToSend) => {

    const text = (textToSend || inputText).trim();

    if (!text) return;

    setInputText('');

    stopAllSpeech();

    setIsSpeaking(false);

    const userMessage = {

      id: `user_${Date.now()}`,

      sender: 'user',

      text,

      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

    };

    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true);

    try {

      const historyPayload = messages.slice(-4).map((m) => ({

        sender: m.sender,

        text: m.text,

      }));

      const res = await queryVoiceAgent({

        message: text,

        language,

        history: historyPayload,

        geminiApiKey,

      });

      const agentReply =

        res.reply ||

        'I am here to assist with any questions about Autism, ADHD, or cognitive wellness.';

      const agentMessage = {

        id: `agent_${Date.now()}`,

        sender: 'agent',

        text: agentReply,

        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

      };

      setMessages((prev) => [...prev, agentMessage]);

      setIsTyping(false);

      if (!isVoiceMuted) {

        speakResponse(agentReply);

      }

    } catch (err) {

      console.warn('Voice agent error:', err);

      setIsTyping(false);

      const fallbackReply =

        language === 'hi'

          ? 'यह न्यूरोडाइवर्जेंट जिंदगी का बहुत ही महत्वपूर्ण पहलू है। ऑटिज्म, ADHD और AuDHD में हमारा दिमाग और भावनाएं बिल्कुल अनोखे तरीके से काम करती हैं। क्या आप ध्यान लगाने के आसान नुस्खे, सेंसरी थकान दूर करने के उपाय, या अपने टेस्ट स्कोर के बारे में कुछ और जानना चाहते हैं?'

          : language === 'mr'

          ? 'हा न्यूरोडायव्हर्जंट मेंदूच्या प्रवासातील अतिशय महत्त्वाचा पैलू आहे। ऑटिझम, ADHD आणि AuDHD मध्ये आपली मानसिक ऊर्जा आणि लक्ष विशिष्ट पद्धतीने कार्य करते. आपल्याला लक्ष वाढवण्याच्या सोप्या क्लृप्त्या, थकवा कमी करण्याचे उपाय किंवा चाचण्यांच्या निकालांविषयी आणखी जाणून घ्यायला आवडेल का?'

          : 'That touches on such a meaningful aspect of living with a neurodivergent brain. In Autism, ADHD, and AuDHD, our nervous systems navigate energy, focus, and stimulation in beautifully unique ways. Would you like to dig into practical focus hacks, explore sensory regulation, or look at what your screening scores mean for your day-to-day rhythm?';

      const agentMessage = {

        id: `agent_${Date.now()}`,

        sender: 'agent',

        text: fallbackReply,

        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

      };

      setMessages((prev) => [...prev, agentMessage]);

      if (!isVoiceMuted) {

        speakResponse(fallbackReply);

      }

    }

  };

  const speakResponse = (text) => {

    setIsSpeaking(true);

    speakInstruction({

      text,

      language,

      onStart: () => setIsSpeaking(true),

      onEnd: () => setIsSpeaking(false),

      onError: () => setIsSpeaking(false),

    });

  };

  const handleReplay = (text) => {

    if (isSpeaking) {

      stopAllSpeech();

      setIsSpeaking(false);

    } else {

      speakResponse(text);

    }

  };

  const handleClearChat = () => {

    stopAllSpeech();

    setIsSpeaking(false);

    setMessages([

      {

        id: 'welcome_reset',

        sender: 'agent',

        text:

          language === 'hi'

            ? 'बिल्कुल नई शुरुआत! जब भी आपका मन करे, ध्यान, थकान, AuDHD या टेस्ट के बारे में मुझसे पूछ सकते हैं।'

            : language === 'mr'

            ? 'नवीन सुरुवात! जेव्हाही तुम्हाला लक्ष, थकवा, AuDHD किंवा चाचण्यांविषयी बोलायचे असेल, मी इथेच आहे.'

            : "Fresh start! I'm right here whenever you want to talk about focus, sensory energy, AuDHD, or your test results.",

        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

      },

    ]);

  };

  return (

    <>

      {/* Floating Trigger Button (Bottom Right) */}

      {!isVoiceAgentOpen && (

        <button

          type="button"

          onClick={() => setIsVoiceAgentOpen(true)}

          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-primary via-primary-container to-secondary text-on-primary shadow-[0_6px_28px_rgba(70,72,212,0.45)] hover:shadow-[0_8px_36px_rgba(70,72,212,0.6)] transition-all transform hover:scale-105 active:scale-95 group"

          title="Open Nova Voice Agent"

        >

          <div className="relative flex items-center justify-center w-7 h-7">

            <span className="material-symbols-outlined text-[24px] group-hover:rotate-12 transition-transform">

              phone_in_talk

            </span>

            <span className="absolute -inset-1 rounded-full border border-white/40 animate-ping opacity-60" />

          </div>

          <div className="flex flex-col text-left">

            <div className="flex items-center gap-1.5">

              <span className="font-headline-sm text-[13px] font-bold leading-none tracking-tight">

                Nova Voice

              </span>

              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />

            </div>

            <span className="text-[10px] text-white/80 font-mono tracking-wider uppercase mt-0.5">

              Talk • Chat

            </span>

          </div>

        </button>

      )}

      {/* Floating Voice Agent Window */}

      {isVoiceAgentOpen && (

        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[450px] h-[640px] max-h-[88vh] flex flex-col bg-surface-container-lowest/98 backdrop-blur-2xl border border-surface-container-high rounded-2xl shadow-2xl overflow-hidden animate-fadeIn font-sans">

          {/* Top Ambient Gradient Accent Line */}

          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary-container" />

          {/* Clean Header Bar */}

          <div className="px-4 py-2.5 bg-surface-container/60 border-b border-surface-container-high/60 flex items-center justify-between gap-2">

            <div className="flex items-center gap-2 min-w-0">

              <div

                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${

                  isLiveCallActive

                    ? 'bg-emerald-500 text-white shadow-md animate-pulse'

                    : 'bg-primary text-on-primary'

                }`}

              >

                <span className="material-symbols-outlined text-[19px]">

                  {isLiveCallActive ? 'call' : 'smart_toy'}

                </span>

              </div>

              <div className="flex flex-col min-w-0">

                <span className="font-bold text-[13px] text-on-surface truncate">

                  Nova Companion

                </span>

                <span className="text-[10px] text-on-surface-variant font-mono truncate">

                  AuDHD & Cognitive Wellness

                </span>

              </div>

            </div>

            {/* Header Right Actions: Language & Close */}

            <div className="flex items-center gap-2">

              {/* Language Selector */}

              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-surface-container-high">

                {supportedLanguages.map((l) => (

                  <button

                    key={l.code}

                    type="button"

                    onClick={() => setLanguage(l.code)}

                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${

                      language === l.code

                        ? 'bg-primary text-on-primary'

                        : 'text-on-surface-variant hover:text-on-surface'

                    }`}

                    title={l.nativeLabel}

                  >

                    {l.code.toUpperCase()}

                  </button>

                ))}

              </div>

              {/* Close Button */}

              <button

                type="button"

                onClick={() => setIsVoiceAgentOpen(false)}

                className="w-7 h-7 rounded-lg hover:bg-surface-container text-on-surface-variant flex items-center justify-center transition-colors"

                title="Close"

              >

                <span className="material-symbols-outlined text-[18px]">close</span>

              </button>

            </div>

          </div>

          {/* TWO OPTIONS ONLY: [ Talk ] | [ Chat ] */}

          <div className="px-4 pt-2.5 pb-2 bg-surface-container/40 border-b border-surface-container-high/40">

            <div className="flex p-1 rounded-xl bg-surface-container-low border border-surface-container-high">

              {/* Option 1: Talk */}

              <button

                type="button"

                onClick={() => setActiveTab('talk')}

                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${

                  activeTab === 'talk'

                    ? 'bg-primary text-on-primary shadow-sm'

                    : 'text-on-surface-variant hover:text-on-surface'

                }`}

              >

                <span className="material-symbols-outlined text-[18px]">

                  {isLiveCallActive ? 'ring_volume' : 'call'}

                </span>

                <span>Talk</span>

                {isLiveCallActive && (

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />

                )}

              </button>

              {/* Option 2: Chat */}

              <button

                type="button"

                onClick={() => setActiveTab('chat')}

                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${

                  activeTab === 'chat'

                    ? 'bg-primary text-on-primary shadow-sm'

                    : 'text-on-surface-variant hover:text-on-surface'

                }`}

              >

                <span className="material-symbols-outlined text-[18px]">chat</span>

                <span>Chat</span>

              </button>

            </div>

          </div>

          {/* ============================================================ */}

          {/* TAB 1: TALK (LIVE VOICE CALL)                                */}

          {/* ============================================================ */}

          {activeTab === 'talk' && (

            <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-surface-container-lowest via-surface-container-low/30 to-surface-container-low relative overflow-hidden animate-fadeIn">

              {/* Glow backdrop */}

              <div

                className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${

                  liveCallStatus === 'speaking'

                    ? 'opacity-40 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.25)_0%,_transparent_70%)]'

                    : isLiveCallActive

                    ? 'opacity-25 bg-[radial-gradient(ellipse_at_center,_rgba(70,72,212,0.25)_0%,_transparent_70%)]'

                    : 'opacity-10 bg-[radial-gradient(ellipse_at_center,_rgba(70,72,212,0.2)_0%,_transparent_70%)]'

                }`}

              />

              {/* Top Bar for Talk Tab */}

              <div className="relative z-10 flex items-center justify-between">

                {isLiveCallActive ? (

                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">

                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />

                    <span className="text-[11px] font-bold uppercase tracking-wider">Live Call</span>

                    <span className="font-mono text-[12px] font-bold ml-1">

                      {formatCallTime(callDuration)}

                    </span>

                  </div>

                ) : (

                  <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">

                    <span className="material-symbols-outlined text-[15px] text-primary">record_voice_over</span>

                    <span>Gemini Live Voice</span>

                  </div>

                )}

                {/* Voice Selection */}

                <select

                  value={selectedVoice}

                  disabled={isLiveCallActive}

                  onChange={(e) => setSelectedVoice(e.target.value)}

                  className="bg-surface-container border border-surface-container-high text-[11px] font-mono text-on-surface rounded-lg px-2 py-1 outline-none focus:border-primary disabled:opacity-60"

                  title="Select AI Voice"

                >

                  {LIVE_VOICES.map((v) => (

                    <option key={v.id} value={v.id}>

                      {v.name}

                    </option>

                  ))}

                </select>

              </div>

              {/* Center Main Stage */}

              <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-4 text-center">

                {/* 3D Interactive Animated Orb */}

                <div className="relative flex items-center justify-center w-36 h-36">

                  {/* Outer breathing aura */}

                  <div

                    className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${

                      liveCallStatus === 'speaking'

                        ? 'bg-emerald-400/50 scale-125'

                        : micVolume > 15

                        ? 'bg-primary/50 scale-115'

                        : isLiveCallActive

                        ? 'bg-primary/20 scale-100'

                        : 'bg-primary/15 scale-90'

                    }`}

                  />

                  {/* Core Orb with Tap-to-Interrupt capability */}

                  <button

                    type="button"

                    disabled={!isLiveCallActive}

                    onClick={() => {

                      if (isLiveCallActive && liveCallStatus === 'speaking') {

                        stopAllSpeech();

                        setIsSpeaking(false);

                        isSpeakingRef.current = false;

                        setLiveAgentSubtitle('');

                        if (liveSessionRef.current) {

                          liveSessionRef.current.handleInterruption();

                        }

                        setLiveCallStatus('listening');

                      }

                    }}

                    className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-150 ${

                      liveCallStatus === 'speaking'

                        ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-primary text-white scale-105 cursor-pointer hover:opacity-90 active:scale-95'

                        : micVolume > 15

                        ? 'bg-gradient-to-tr from-primary to-secondary text-white scale-100'

                        : isLiveCallActive

                        ? 'bg-gradient-to-tr from-surface-container-high to-surface-container-highest text-on-surface border border-primary/30'

                        : 'bg-gradient-to-tr from-surface-container via-surface-container-high to-surface-container-low text-primary border border-surface-container-high'

                    }`}

                    style={{

                      transform: isLiveCallActive

                        ? `scale(${1 + (liveCallStatus === 'speaking' ? agentVolume * 0.002 : micVolume * 0.0025)})`

                        : 'scale(1)',

                    }}

                    title={liveCallStatus === 'speaking' ? 'Click to interrupt Nova' : 'Nova Voice Orb'}

                  >

                    <span className="material-symbols-outlined text-[36px]">

                      {isLiveCallActive

                        ? liveCallStatus === 'speaking'

                          ? 'graphic_eq'

                          : micVolume > 15

                          ? 'hearing'

                          : isCallMicMuted

                          ? 'mic_off'

                          : 'call'

                        : 'mic'}

                    </span>

                    <span className="text-[10px] font-mono uppercase font-bold mt-1 opacity-90">

                      {isLiveCallActive

                        ? liveCallStatus === 'speaking'

                          ? 'Speaking'

                          : liveCallStatus === 'connecting'

                          ? 'Connecting'

                          : isCallMicMuted

                          ? 'Muted'

                          : 'Listening'

                        : 'Voice Ready'}

                    </span>

                  </button>

                </div>

                {/* Subtitle / Status Text & Live Transcript Pill */}

                <div className="w-full max-w-sm flex flex-col items-center gap-2">

                  {isLiveCallActive ? (

                    <>

                      <div className="flex items-center gap-2">

                        <span className={`w-2 h-2 rounded-full ${

                          liveCallStatus === 'speaking'

                            ? 'bg-emerald-500 animate-ping'

                            : liveCallStatus === 'connecting'

                            ? 'bg-amber-400 animate-pulse'

                            : isCallMicMuted

                            ? 'bg-error'

                            : 'bg-primary animate-pulse'

                        }`} />

                        <h3 className="font-bold text-[15px] text-on-surface">

                          {liveCallStatus === 'speaking'

                            ? 'Nova is talking...'

                            : liveCallStatus === 'connecting'

                            ? 'Connecting to Nova...'

                            : isCallMicMuted

                            ? 'Microphone Muted'

                            : 'Listening... Speak freely'}

                        </h3>

                      </div>

                      {/* Live Subtitle Pill */}

                      <div className="w-full min-h-[50px] px-4 py-2 rounded-2xl bg-surface-container/70 border border-surface-container-high/60 backdrop-blur-md flex items-center justify-center text-center shadow-sm">

                        {liveUserTranscript ? (

                          <p className="text-[12px] text-primary font-medium animate-fadeIn leading-relaxed line-clamp-2">

                            <span className="font-bold mr-1">You:</span> "{liveUserTranscript}"

                          </p>

                        ) : liveAgentSubtitle ? (

                          <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium animate-fadeIn leading-relaxed line-clamp-2">

                            <span className="font-bold mr-1">Nova:</span> "{liveAgentSubtitle}"

                          </p>

                        ) : (

                          <p className="text-[11px] text-on-surface-variant font-mono">

                            {isCallMicMuted

                              ? 'Microphone muted • Unmute to speak'

                              : liveCallStatus === 'speaking'

                              ? 'Tap orb anytime to interrupt'

                              : 'Speak naturally • Nova will reply'}

                          </p>

                        )}

                      </div>

                    </>

                  ) : (

                    <>

                      <h3 className="font-bold text-[17px] text-on-surface">

                        Talk with Nova

                      </h3>

                      <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">

                        Start a live, bidirectional phone call powered by Gemini Live. Speak naturally about AuDHD, focus, or test scores.

                      </p>

                    </>

                  )}

                </div>

                {/* Audio Waveform Equalizer (When call is active) */}

                {isLiveCallActive && (

                  <div className="flex items-center gap-1.5 h-8">

                    {[...Array(12)].map((_, i) => {

                      const barHeight =

                        liveCallStatus === 'speaking'

                          ? Math.max(20, Math.min(100, ((i % 4) + 1) * 25 + agentVolume * 0.3))

                          : isCallMicMuted

                          ? 8

                          : Math.max(10, Math.min(100, micVolume * 0.8 + (i % 3) * 12));

                      return (

                        <div

                          key={i}

                          className={`w-1.5 rounded-full transition-all duration-100 ${

                            liveCallStatus === 'speaking'

                              ? 'bg-emerald-500'

                              : micVolume > 10

                              ? 'bg-primary'

                              : 'bg-surface-container-high'

                          }`}

                          style={{ height: `${barHeight}%` }}

                        />

                      );

                    })}

                  </div>

                )}

              </div>

              {/* Bottom Action Area */}

              <div className="relative z-10 flex flex-col items-center gap-3 pt-2">

                {recognitionError && (

                  <div className="text-[11px] text-error font-mono bg-error/10 border border-error/20 px-3 py-1 rounded-lg">

                    {recognitionError}

                  </div>

                )}

                {!isLiveCallActive ? (

                  /* --- OPTION: START CALL --- */

                  <div className="w-full flex flex-col items-center gap-2">

                    <button

                      type="button"

                      onClick={handleStartLiveCall}

                      className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[15px] shadow-[0_8px_24px_rgba(16,185,129,0.35)] hover:shadow-[0_10px_32px_rgba(16,185,129,0.5)] transform hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"

                    >

                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">

                        <span className="material-symbols-outlined text-[20px]">call</span>

                      </div>

                      <span>Start Call</span>

                    </button>

                    <span className="text-[11px] text-on-surface-variant/70 font-mono">

                      Zero-delay calling • English, Hindi & Marathi

                    </span>

                  </div>

                ) : (

                  /* --- ACTIVE CALL CONTROLS: MUTE & END CALL --- */

                  <div className="flex items-center justify-center gap-6">

                    {/* Mute Mic Toggle */}

                    <button

                      type="button"

                      onClick={handleToggleCallMute}

                      className={`flex flex-col items-center gap-1 group`}

                      title={isCallMicMuted ? 'Unmute Mic' : 'Mute Mic'}

                    >

                      <div

                        className={`w-13 h-13 rounded-full flex items-center justify-center transition-all p-3.5 ${

                          isCallMicMuted

                            ? 'bg-error text-on-error shadow-lg shadow-error/30'

                            : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'

                        }`}

                      >

                        <span className="material-symbols-outlined text-[22px]">

                          {isCallMicMuted ? 'mic_off' : 'mic'}

                        </span>

                      </div>

                      <span className="text-[10px] font-mono text-on-surface-variant">

                        {isCallMicMuted ? 'Unmute' : 'Mute'}

                      </span>

                    </button>

                    {/* End Call Button */}

                    <button

                      type="button"

                      onClick={handleEndLiveCall}

                      className="flex flex-col items-center gap-1 group"

                      title="Hang up call"

                    >

                      <div className="w-16 h-16 rounded-full bg-error hover:bg-error/90 active:scale-95 text-on-error flex items-center justify-center shadow-xl shadow-error/40 transition-transform">

                        <span className="material-symbols-outlined text-[30px]">call_end</span>

                      </div>

                      <span className="text-[10px] font-mono text-error font-bold">End Call</span>

                    </button>

                  </div>

                )}

              </div>

            </div>

          )}

          {/* ============================================================ */}

          {/* TAB 2: CHAT (TEXT & SPEECH MESSAGING)                        */}

          {/* ============================================================ */}

          {activeTab === 'chat' && (

            <div className="flex-1 flex flex-col justify-between overflow-hidden animate-fadeIn">

              {/* Notice Banner */}

              <div className="px-3 py-1.5 bg-primary-container/10 border-b border-primary/20 flex items-center justify-between text-[11px] text-primary">

                <div className="flex items-center gap-1.5 truncate">

                  <span className="material-symbols-outlined text-[14px]">verified</span>

                  <span className="truncate">{t('voiceAgentScopeNotice')}</span>

                </div>

                <button

                  type="button"

                  onClick={handleClearChat}

                  className="text-[10px] font-mono text-on-surface-variant hover:text-error transition-colors ml-2"

                  title={t('clearChat')}

                >

                  Clear

                </button>

              </div>

              {/* Messages Scroll Area */}

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 space-y-1">

                {messages.map((m) => {

                  const isUser = m.sender === 'user';

                  const isSystem = m.sender === 'system';

                  if (isSystem) {

                    return (

                      <div key={m.id} className="text-center my-1.5">

                        <span className="px-3 py-1 rounded-full bg-surface-container border border-surface-container-high text-[11px] font-mono text-on-surface-variant inline-block">

                          {m.text}

                        </span>

                      </div>

                    );

                  }

                  return (

                    <div

                      key={m.id}

                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[90%] ${

                        isUser ? 'ml-auto' : 'mr-auto'

                      }`}

                    >

                      <div

                        className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${

                          isUser

                            ? 'bg-primary text-on-primary rounded-tr-none'

                            : 'bg-surface-container text-on-surface rounded-tl-none border border-surface-container-high'

                        }`}

                      >

                        <p className="whitespace-pre-wrap">{m.text}</p>

                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1">

                        <span className="text-[10px] font-mono text-on-surface-variant/70">

                          {m.timestamp}

                        </span>

                        {!isUser && (

                          <button

                            type="button"

                            onClick={() => handleReplay(m.text)}

                            className="text-[10px] text-primary flex items-center gap-0.5 hover:underline"

                            title="Listen to spoken audio"

                          >

                            <span className="material-symbols-outlined text-[12px]">volume_up</span>

                            <span>Listen</span>

                          </button>

                        )}

                      </div>

                    </div>

                  );

                })}

                {/* Thinking Indicator */}

                {isTyping && (

                  <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-container text-on-surface-variant w-fit rounded-tl-none border border-surface-container-high">

                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />

                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />

                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />

                    <span className="text-[11px] font-mono ml-1">Thinking...</span>

                  </div>

                )}

                <div ref={messagesEndRef} />

              </div>

              {/* Quick Suggestions Chips */}

              <div className="px-3 py-1.5 bg-surface-container-low/50 border-t border-surface-container-high/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">

                {suggestedChips.map((chip, idx) => (

                  <button

                    key={idx}

                    type="button"

                    onClick={() => sendMessage(chip)}

                    className="px-2.5 py-1 rounded-full text-[11px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-surface-container-high whitespace-nowrap transition-colors flex-shrink-0"

                  >

                    {chip}

                  </button>

                ))}

              </div>

              {/* Chat Input & Mic Bar */}

              <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex flex-col gap-1.5">

                {recognitionError && (

                  <span className="text-[11px] text-error font-mono px-1">

                    {recognitionError}

                  </span>

                )}

                <form

                  onSubmit={(e) => {

                    e.preventDefault();

                    sendMessage();

                  }}

                  className="flex items-center gap-2"

                >

                  {/* Mic Speech-to-Text Button */}

                  <button

                    type="button"

                    onClick={handleToggleMic}

                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${

                      isListening

                        ? 'bg-error text-on-error animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.5)]'

                        : 'bg-primary/10 text-primary hover:bg-primary/20'

                    }`}

                    title={t('micPrompt')}

                  >

                    <span className="material-symbols-outlined text-[20px]">

                      {isListening ? 'mic' : 'mic_none'}

                    </span>

                  </button>

                  {/* Text Input */}

                  <input

                    type="text"

                    value={inputText}

                    onChange={(e) => setInputText(e.target.value)}

                    placeholder={t('voiceAgentInputPlaceholder')}

                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high focus:border-primary focus:outline-none text-[13px] text-on-surface placeholder:text-on-surface-variant/50"

                  />

                  {/* Send Button */}

                  <button

                    type="submit"

                    disabled={!inputText.trim() || isTyping}

                    className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-container text-on-primary flex items-center justify-center transition-all disabled:opacity-40 disabled:pointer-events-none shadow-sm"

                    title="Send Message"

                  >

                    <span className="material-symbols-outlined text-[18px]">send</span>

                  </button>

                </form>

                <div className="text-center text-[10px] text-on-surface-variant/70 font-mono tracking-tight pt-0.5">

                  {t('disclaimerTag')}

                </div>

              </div>

            </div>

          )}

        </div>

      )}

    </>

  );

}

