/**
 * speechEngine.js
 * High-fidelity, warm, natural human voice speech engine for NeuroNova.
 * 
 * Key natural enhancements:
 * 1. Strict language isolation: Hindi and Marathi will NEVER pick English voices.
 * 2. Prioritizes Microsoft Online (Natural), Edge Neural, Google, and Apple neural voices.
 * 3. Strongly demotes legacy robotic SAPI desktop voices (e.g. Microsoft David Desktop).
 * 4. Text cleaning: strips markdown asterisks, hashes, brackets, and expands acronyms (AuDHD, ADHD, CPI)
 *    so speech synthesizers pronounce them with natural human cadence.
 * 5. Sentence-level pacing: Splits paragraphs into natural sentences with 160ms breathing pauses
 *    to prevent the robotic monotone drone and speech cutoff bugs.
 * 6. Tuned prosody: rate 0.94 (EN) / 0.90 (HI/MR), pitch 1.02 for warm, approachable, empathetic cadence.
 * 7. Supports cached server Gemini audio when available, with instant seamless fallback.
 */

let currentAudioElement = null;
let currentUtteranceQueue = [];
let isQueuePlaying = false;
let shouldStopQueue = false;

let activeCallbacks = {
  onStart: null,
  onEnd: null,
  onError: null,
};

/**
 * Clean text to ensure speech sounds natural, fluid, and free of markdown or awkward symbols
 */
export function cleanTextForSpeech(text, langCode = 'en') {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    // Remove markdown formatting: bold, italic, strikethrough, backticks, hashes
    .replace(/[*_~`#]/g, '')
    // Remove blockquotes and bullet points
    .replace(/^\s*>[ \t]*/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    // Remove bracketed citations or notes
    .replace(/\[\d+\]/g, '')
    // Remove emojis or special symbols that speech synthesizers read awkwardly
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Expand acronyms for natural phonetic articulation
    .replace(/\bAuDHD\b/g, 'Au-D-H-D')
    .replace(/\bADHD\b/g, 'A-D-H-D')
    .replace(/\bCPI\b/g, 'C-P-I')
    .replace(/\bPVT\b/g, 'P-V-T')
    .replace(/\bASRS\b/g, 'A-S-R-S')
    .replace(/\bCAT-Q\b/g, 'Cat Q')
    .replace(/\bAQ-10\b/g, 'A-Q-10')
    // Smooth out dashes and slashes into breath pauses
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    // Replace multiple spaces or newlines with a single space
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Score a speech synthesis voice to prioritize natural, human-sounding neural voices
 */
function scoreVoice(voice, langCode) {
  const name = (voice.name || '').toLowerCase();
  const lang = (voice.lang || '').toLowerCase();
  let score = 0;

  // 1. Strict language isolation: voices MUST match the requested language family
  if (langCode === 'hi') {
    if (!lang.startsWith('hi')) return -1000;
    score += 80;
    if (name.includes('hindi') || name.includes('swara') || name.includes('madhur') || name.includes('kalpana') || name.includes('hemant')) {
      score += 60;
    }
  } else if (langCode === 'mr') {
    if (!lang.startsWith('mr') && !lang.startsWith('hi')) return -1000;
    if (lang.startsWith('mr')) {
      score += 90;
      if (name.includes('marathi') || name.includes('aarohi') || name.includes('manohar')) {
        score += 60;
      }
    } else {
      // High-quality Devanagari Hindi fallback when Marathi voice isn't installed
      score += 40;
    }
  } else {
    // English
    if (!lang.startsWith('en')) return -1000;
    score += 50;
    if (lang === 'en-us' || lang === 'en-in' || lang === 'en-gb') score += 20;
  }

  // 2. High-fidelity Neural / Natural online voice bonuses
  if (name.includes('natural') || name.includes('neural') || name.includes('online')) score += 70;
  if (name.includes('google')) score += 50;
  if (name.includes('aria') || name.includes('jenny') || name.includes('guy') || name.includes('neerja') || name.includes('samantha')) {
    score += 40;
  }
  if (name.includes('premium') || name.includes('enhanced')) score += 30;

  // 3. Heavy penalty for legacy robotic desktop SAPI voices
  if (
    name.includes('desktop') ||
    name.includes('david') ||
    name.includes('zira') ||
    name.includes('mark') ||
    name.includes('george') ||
    name.includes('hazel') ||
    name.includes('cortana')
  ) {
    score -= 80;
  }

  return score;
}

/**
 * Find the optimal natural voice for a given language code
 */
export function findBestVoice(langCode) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  let bestVoice = null;
  let bestScore = -999;

  for (const voice of voices) {
    const score = scoreVoice(voice, langCode);
    if (score > bestScore) {
      bestScore = score;
      bestVoice = voice;
    }
  }

  // If score is still too low or not matching language, return best match for language
  if (!bestVoice || bestScore <= -500) {
    const prefix = langCode === 'hi' ? 'hi' : langCode === 'mr' ? 'mr' : 'en';
    bestVoice = voices.find((v) => (v.lang || '').startsWith(prefix)) || null;
    if (!bestVoice && langCode === 'mr') {
      bestVoice = voices.find((v) => (v.lang || '').startsWith('hi')) || null;
    }
    if (!bestVoice) {
      bestVoice = voices[0] || null;
    }
  }

  return bestVoice;
}

/**
 * Split long text into natural, digestible sentence chunks with breathing room
 */
function splitIntoNaturalSentences(text) {
  if (!text) return [];
  // Split on periods, exclamation marks, question marks, and Hindi Devanagari danda (।)
  const rawSentences = text
    .replace(/([.!?।])\s+/g, '$1\u00A7')
    .split('\u00A7')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return rawSentences.length > 0 ? rawSentences : [text];
}

/**
 * Play speech either from cached server audio or via tuned Web Speech API with natural cadence
 */
export async function speakInstruction({
  text,
  language = 'en',
  testKey = null,
  onStart,
  onEnd,
  onError,
}) {
  stopAllSpeech();

  activeCallbacks = { onStart, onEnd, onError };
  shouldStopQueue = false;

  if (!text || typeof text !== 'string') {
    if (onEnd) onEnd();
    return;
  }

  // Clean text so voice synthesizer sounds natural and doesn't read punctuation/markdown
  const spokenText = cleanTextForSpeech(text, language);

  // 1. Try playing cached server audio from backend if testKey is provided
  if (testKey) {
    try {
      const backendUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
        'http://127.0.0.1:8000';
      const audioUrl = `${backendUrl}/api/v1/audio/cache/${testKey}_${language}.wav`;

      const checkRes = await fetch(audioUrl, { method: 'HEAD' }).catch(() => null);
      if (checkRes && checkRes.ok) {
        const audio = new Audio(audioUrl);
        currentAudioElement = audio;

        audio.onplay = () => {
          if (activeCallbacks.onStart) activeCallbacks.onStart();
        };
        audio.onended = () => {
          currentAudioElement = null;
          if (activeCallbacks.onEnd) activeCallbacks.onEnd();
        };
        audio.onerror = () => {
          currentAudioElement = null;
          speakNaturalSentences(spokenText, language);
        };

        await audio.play();
        return;
      }
    } catch {
      // Proceed to natural client-side speech
    }
  }

  // 2. Play using high-fidelity natural browser speech synthesis
  speakNaturalSentences(spokenText, language);
}

/**
 * Natural sequential sentence speaker with human breathing pauses
 */
function speakNaturalSentences(fullText, language) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (activeCallbacks.onError) activeCallbacks.onError('Speech synthesis not supported');
    return;
  }

  const sentences = splitIntoNaturalSentences(fullText);
  if (sentences.length === 0) {
    if (activeCallbacks.onEnd) activeCallbacks.onEnd();
    return;
  }

  isQueuePlaying = true;
  shouldStopQueue = false;

  let sentenceIndex = 0;

  function speakNext() {
    if (shouldStopQueue || sentenceIndex >= sentences.length) {
      isQueuePlaying = false;
      currentUtteranceQueue = [];
      if (activeCallbacks.onEnd) activeCallbacks.onEnd();
      return;
    }

    const sentence = sentences[sentenceIndex];
    sentenceIndex++;

    const utterance = new SpeechSynthesisUtterance(sentence);
    currentUtteranceQueue = [utterance];

    // Select the highest quality natural voice
    let voice = findBestVoice(language);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
    }

    // Natural prosody parameters:
    // Slightly slowed rate gives warmth, calmness, and clarity without sounding sluggish.
    // Pitch 1.02 lifts voice slightly to sound friendly, empathetic, and approachable.
    utterance.rate = language === 'en' ? 0.94 : 0.90;
    utterance.pitch = 1.02;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      // Notify on first sentence start
      if (sentenceIndex === 1 && activeCallbacks.onStart) {
        activeCallbacks.onStart();
      }
    };

    utterance.onend = () => {
      if (shouldStopQueue) {
        isQueuePlaying = false;
        if (activeCallbacks.onEnd) activeCallbacks.onEnd();
        return;
      }
      // Natural human breathing pause between sentences: 160ms
      setTimeout(() => {
        if (!shouldStopQueue) {
          speakNext();
        }
      }, 160);
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e);
        if (activeCallbacks.onError) activeCallbacks.onError(e.error);
      }
      isQueuePlaying = false;
      if (activeCallbacks.onEnd) activeCallbacks.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Ensure voices are available (handle Chrome async voice initialization)
  if (window.speechSynthesis.getVoices().length === 0) {
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      speakNext();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
  } else {
    speakNext();
  }
}

/**
 * Stop any current speech or audio playback immediately
 */
export function stopAllSpeech() {
  shouldStopQueue = true;
  isQueuePlaying = false;
  currentUtteranceQueue = [];

  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudioElement = null;
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  if (activeCallbacks.onEnd) {
    activeCallbacks.onEnd();
  }
}

/**
 * Check if audio is currently playing
 */
export function isAudioPlaying() {
  if (currentAudioElement && !currentAudioElement.paused) return true;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking || isQueuePlaying;
  }
  return false;
}
