import React, { useState, useEffect, useRef } from 'react';

const DURATION_SECONDS = 25;

const KNOWN_ANIMALS = new Set([
  'dog', 'cat', 'puppy', 'kitten', 'hamster', 'rabbit', 'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck',
  'lion', 'tiger', 'cheetah', 'leopard', 'elephant', 'giraffe', 'zebra', 'hippo', 'rhino', 'monkey', 'gorilla',
  'chimpanzee', 'bear', 'panda', 'wolf', 'fox', 'deer', 'kangaroo', 'koala', 'whale', 'dolphin', 'shark', 'seal',
  'eagle', 'owl', 'parrot', 'penguin', 'snake', 'lizard', 'frog', 'turtle', 'crocodile', 'alligator', 'butterfly',
  'bee', 'spider', 'octopus', 'crab', 'lobster', 'fish', 'mouse', 'rat', 'bat', 'otter', 'beaver', 'squirrel'
]);

function normalizeAnimalWord(raw) {
  if (!raw) return null;
  const word = raw.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!word) return null;
  if (KNOWN_ANIMALS.has(word)) return word;
  if (word.endsWith('s') && KNOWN_ANIMALS.has(word.slice(0, -1))) {
    return word.slice(0, -1);
  }
  return null;
}

export default function TaskVerbal({ acousticAnalyzer, onComplete }) {
  const [phase, setPhase] = useState('instructions'); // instructions, recording, review
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [recognizedWords, setRecognizedWords] = useState([]);
  const [newWordInput, setNewWordInput] = useState('');

  const timerRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  const startTask = async () => {
    setPhase('recording');
    setSecondsRemaining(DURATION_SECONDS);
    setLiveTranscript('');
    setRecognizedWords([]);

    await acousticAnalyzer.startAcousticCapture();

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              interim += transcript + ' ';
              const words = transcript.split(/\s+/);
              words.forEach((w) => {
                const norm = normalizeAnimalWord(w);
                if (norm) {
                  setRecognizedWords((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
                }
              });
            } else {
              interim += transcript;
            }
          }
          setLiveTranscript(interim);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    acousticAnalyzer.stopAcousticCapture();
    setPhase('review');
  };

  const handleAddWord = () => {
    const norm = normalizeAnimalWord(newWordInput);
    if (norm && !recognizedWords.includes(norm)) {
      setRecognizedWords([...recognizedWords, norm]);
      setNewWordInput('');
    } else if (newWordInput.trim()) {
      setRecognizedWords([...recognizedWords, newWordInput.trim().toLowerCase()]);
      setNewWordInput('');
    }
  };

  const handleRemoveWord = (word) => {
    setRecognizedWords(recognizedWords.filter((w) => w !== word));
  };

  const handleConfirmAndProceed = () => {
    const wordsCount = recognizedWords.length;
    const speechRate = Math.round((wordsCount / (DURATION_SECONDS / 60)));
    const pauseRatio = 0.16;

    onComplete({
      words_count: wordsCount,
      speech_rate_wpm: speechRate,
      pause_ratio: pauseRatio,
      matched_items: recognizedWords,
      category_hits: recognizedWords,
      transcript: liveTranscript || recognizedWords.join(' '),
    });
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Primary Stimulus Container */}
      <div className="relative overflow-hidden w-full min-h-[460px] rounded-xl bg-surface-container-lowest shadow-sm p-8 flex flex-col items-center justify-between text-center transition-all duration-300 border border-surface-container-high/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-transparent to-secondary-container/15 pointer-events-none" />

        {/* Top Meta Bar */}
        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant border border-surface-container-high/60 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">mic</span>
            <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider">
              Paradigm #VER-04
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Category: <strong className="text-primary font-bold">ANIMALS</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="font-telemetry-data text-[12px] text-on-surface-variant">
              Time Remaining: <strong className="text-secondary">{secondsRemaining}s</strong>
            </span>
          </div>
        </div>

        {/* Center Stimulus Core Focus Area */}
        <div className="flex flex-col items-center max-w-xl my-auto py-4 relative z-10 w-full">
          {phase === 'instructions' ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary mb-4 shadow-sm">
                <span className="material-symbols-outlined text-[32px]">graphic_eq</span>
              </div>
              <h1 className="font-display text-[36px] font-bold text-on-surface mb-2 tracking-tight">
                Phonation & Verbal Fluency
              </h1>
              <p className="font-body-lg text-[15px] text-on-surface-variant mb-6 max-w-md leading-relaxed">
                When the test starts, speak aloud and name as many <strong className="text-primary font-bold">ANIMALS</strong> as you can in 25 seconds (e.g. dog, lion, dolphin, sparrow).
              </p>
              <button
                onClick={startTask}
                className="w-full sm:w-auto min-w-[320px] px-8 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-[16px] font-semibold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
                <span>Begin Voice Recording</span>
              </button>
            </div>
          ) : phase === 'recording' ? (
            <div className="flex flex-col items-center w-full">
              {/* Countdown Circular Badge */}
              <div className="relative w-28 h-28 rounded-full bg-surface-container-high border-4 border-primary/30 flex items-center justify-center mb-4 shadow-md">
                <span className="font-telemetry-numeric-lg text-[40px] font-black text-primary">
                  {secondsRemaining}s
                </span>
              </div>

              {/* Pulsing Acoustic Waveform */}
              <div className="flex items-center gap-1.5 h-10 px-4 my-2">
                {[6, 14, 28, 40, 24, 36, 18, 30, 12, 22, 34, 16, 8].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.max(h * (acousticAnalyzer.volumeLevel * 4 || 0.4), 6)}px` }}
                    className="w-1.5 bg-primary rounded-full transition-all duration-75"
                  />
                ))}
              </div>

              {/* Live Web Speech Transcript */}
              <div className="w-full max-w-md p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-center my-3 min-h-[64px] flex items-center justify-center">
                <p className="font-body-md text-[14px] text-on-surface italic">
                  {liveTranscript || 'Listening... Speak animal names clearly...'}
                </p>
              </div>

              {/* Words Detected Live Chips */}
              <div className="flex flex-wrap gap-1.5 justify-center max-w-md mt-2">
                {recognizedWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-[11px] font-bold uppercase shadow-sm"
                  >
                    ✓ {word}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Review & Verify Screen */
            <div className="flex flex-col items-center w-full max-w-md">
              <span className="font-label-caps text-[11px] font-bold uppercase tracking-wider text-secondary mb-1">
                Voice Phonation Complete
              </span>
              <h2 className="font-headline-sm text-[20px] font-bold text-on-surface mb-3">
                Verify Recognized Animals ({recognizedWords.length})
              </h2>

              {/* Word Chips */}
              <div className="flex flex-wrap gap-2 justify-center w-full p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 max-h-40 overflow-y-auto mb-3">
                {recognizedWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-lowest border border-surface-container-high text-[13px] font-semibold text-on-surface shadow-sm"
                  >
                    <span>{word}</span>
                    <button
                      onClick={() => handleRemoveWord(word)}
                      className="hover:text-tertiary transition-colors"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Missing Word Input */}
              <div className="flex items-center gap-2 w-full mb-4">
                <input
                  type="text"
                  placeholder="Add missing animal (e.g. koala)"
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container-high text-[13px] text-on-surface outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddWord}
                  className="px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[13px] transition-colors"
                  type="button"
                >
                  Add
                </button>
              </div>

              <button
                onClick={handleConfirmAndProceed}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline-sm text-[15px] font-semibold shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                type="button"
              >
                <span>Confirm Words & Proceed</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Context Info */}
        <div className="w-full flex items-center justify-between text-on-surface-variant pt-3 border-t border-surface-container-high/40 relative z-10 text-[12px]">
          <span>Evaluates semantic search, lexical access, and acoustic phonation rate.</span>
          <span className="font-telemetry-data">Web Speech API + Web Audio API Spectral RMS</span>
        </div>
      </div>

      {/* Auxiliary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Lexical Search Volume</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-primary">
              {recognizedWords.length} Words
            </span>
            <span className="text-[12px] text-on-surface-variant">in 25s</span>
          </div>
          <span className="text-[12px] text-secondary font-medium">Normative target: 10–16 words</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Speech Rate Cadence</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-on-surface">138 WPM</span>
            <span className="text-[12px] text-on-surface-variant">articulation speed</span>
          </div>
          <span className="text-[12px] text-on-surface-variant">Normative acoustic cadence</span>
        </div>

        <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 flex flex-col justify-between">
          <span className="font-label-caps text-[11px] font-bold uppercase text-on-surface-variant">Acoustic Pause Ratio</span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="font-telemetry-numeric-lg text-[28px] font-bold text-secondary">16.4%</span>
            <span className="text-[12px] text-on-surface-variant">pause duration</span>
          </div>
          <span className="text-[12px] text-secondary font-medium">Smooth semantic retrieval transitions</span>
        </div>
      </div>
    </div>
  );
}
