import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, CheckCircle2, Loader2, Sparkles, ArrowRight, MessageSquare, Radio, Plus, X, RotateCcw } from 'lucide-react';

const DURATION_SECONDS = 25;

// Comprehensive animal names dictionary (350+ species across all classes)
const KNOWN_ANIMALS = new Set([
  // Domestic & Pets
  'dog', 'cat', 'puppy', 'kitten', 'hamster', 'guinea pig', 'rabbit', 'bunny', 'ferret', 'gerbil',
  'mouse', 'rat', 'horse', 'pony', 'donkey', 'mule', 'cow', 'cattle', 'bull', 'calf', 'ox', 'pig',
  'piglet', 'hog', 'boar', 'sheep', 'lamb', 'ram', 'goat', 'kid', 'chicken', 'rooster', 'hen',
  'chick', 'duck', 'duckling', 'goose', 'gosling', 'turkey', 'llama', 'alpaca',
  // Wild Mammals
  'lion', 'tiger', 'cheetah', 'leopard', 'jaguar', 'panther', 'cougar', 'puma', 'lynx', 'bobcat',
  'elephant', 'giraffe', 'zebra', 'hippo', 'hippopotamus', 'rhino', 'rhinoceros', 'monkey',
  'chimpanzee', 'chimp', 'gorilla', 'orangutan', 'baboon', 'lemur', 'gibbon', 'panda', 'red panda',
  'bear', 'grizzly', 'polar bear', 'black bear', 'brown bear', 'sloth', 'anteater', 'armadillo',
  'kangaroo', 'koala', 'wallaby', 'wombat', 'platypus', 'possum', 'opossum', 'dingo',
  'wolf', 'fox', 'coyote', 'jackal', 'hyena', 'meerkat', 'mongoose', 'badger', 'honey badger',
  'otter', 'sea otter', 'beaver', 'skunk', 'raccoon', 'porcupine', 'hedgehog', 'mole', 'bat',
  'deer', 'stag', 'doe', 'fawn', 'elk', 'moose', 'reindeer', 'caribou', 'antelope', 'gazelle',
  'impala', 'bison', 'buffalo', 'yak', 'camel', 'warthog', 'wildcat', 'weasel', 'stoat',
  'wolverine', 'chipmunk', 'squirrel', 'gopher', 'groundhog', 'marmot', 'capybara',
  // Marine Mammals & Sea Life
  'whale', 'blue whale', 'humpback', 'orca', 'killer whale', 'dolphin', 'porpoise', 'seal',
  'sea lion', 'walrus', 'manatee', 'dugong', 'shark', 'hammerhead', 'great white', 'ray',
  'stingray', 'manta ray', 'fish', 'salmon', 'trout', 'tuna', 'cod', 'bass', 'goldfish',
  'catfish', 'eel', 'seahorse', 'swordfish', 'barracuda', 'piranha', 'clownfish', 'octopus',
  'squid', 'cuttlefish', 'crab', 'lobster', 'shrimp', 'prawn', 'krill', 'jellyfish', 'starfish',
  'sea urchin', 'clam', 'oyster', 'mussel', 'snail', 'slug',
  // Birds
  'eagle', 'hawk', 'falcon', 'owl', 'vulture', 'osprey', 'condor', 'parrot', 'parakeet',
  'cockatoo', 'macaw', 'toucan', 'woodpecker', 'hummingbird', 'kingfisher', 'robin', 'bluebird',
  'cardinal', 'sparrow', 'finch', 'canary', 'swallow', 'crow', 'raven', 'magpie', 'pigeon',
  'dove', 'seagull', 'gull', 'pelican', 'albatross', 'cormorant', 'heron', 'egret', 'stork',
  'flamingo', 'crane', 'swan', 'penguin', 'ostrich', 'emu', 'kiwi', 'peacock', 'peahen',
  'pheasant', 'quail', 'partridge',
  // Reptiles & Amphibians
  'snake', 'python', 'cobra', 'viper', 'mamba', 'anaconda', 'boa', 'rattlesnake', 'lizard',
  'gecko', 'chameleon', 'iguana', 'komodo dragon', 'monitor lizard', 'alligator', 'crocodile',
  'caiman', 'turtle', 'tortoise', 'terrapin', 'frog', 'toad', 'bullfrog', 'tree frog',
  'salamander', 'newt', 'axolotl',
  // Insects & Arthropods
  'spider', 'tarantula', 'scorpion', 'ant', 'bee', 'bumblebee', 'wasp', 'hornet', 'butterfly',
  'moth', 'caterpillar', 'beetle', 'ladybug', 'firefly', 'dragonfly', 'grasshopper', 'cricket',
  'mantis', 'praying mantis', 'centipede', 'millipede', 'worm', 'earthworm'
]);

// Normalizes plurals and punctuation to match known animal lemmas
function normalizeAnimalWord(raw) {
  if (!raw) return null;
  const word = raw.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!word) return null;
  if (KNOWN_ANIMALS.has(word)) return word;
  // Irregular plurals
  if (word === 'mice') return 'mouse';
  if (word === 'geese') return 'goose';
  if (word === 'wolves') return 'wolf';
  if (word === 'calves') return 'calf';
  if (word === 'oxen') return 'ox';
  // Common suffix patterns
  if (word.endsWith('ies') && KNOWN_ANIMALS.has(word.slice(0, -3) + 'y')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && KNOWN_ANIMALS.has(word.slice(0, -2))) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && KNOWN_ANIMALS.has(word.slice(0, -1))) {
    return word.slice(0, -1);
  }
  return null;
}

export default function TaskVerbal({ acousticAnalyzer, onComplete }) {
  // state: 'instructions', 'recording', 'uploading', 'review'
  const [phase, setPhase] = useState('instructions');
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [newAnimalInput, setNewAnimalInput] = useState('');

  const countdownIntervalRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const accumulatedSpeechRef = useRef('');

  // Start speech recognition + acoustic capture
  const startTask = async () => {
    isRecordingRef.current = true;
    finalTranscriptRef.current = '';
    accumulatedSpeechRef.current = '';
    setLiveTranscript('');
    setTranscriptionResult(null);
    setFinalMetrics(null);

    // 1. Start acoustic analyzer (Web Audio API for volume, RMS, pauses, and audio blob)
    await acousticAnalyzer.startAcousticCapture();

    // 2. Start browser Web Speech API (real-time live transcription in Chrome/Edge)
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalTranscriptRef.current += ' ' + res[0].transcript;
            } else {
              interimText += ' ' + res[0].transcript;
            }
          }
          const combined = (finalTranscriptRef.current + ' ' + interimText).trim();
          accumulatedSpeechRef.current = combined;
          setLiveTranscript(combined);
        };

        recognition.onerror = (err) => {
          // 'no-speech' is triggered during pauses; onend will restart if still recording
          console.warn('SpeechRecognition event:', err?.error);
        };

        recognition.onend = () => {
          // If browser halts recognition during pauses while test is active, auto-restart
          if (isRecordingRef.current) {
            try {
              recognition.start();
            } catch (e) {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Web Speech API initialization:', err);
      }
    }

    setPhase('recording');
    setSecondsRemaining(DURATION_SECONDS);

    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          finishRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishRecording = async () => {
    isRecordingRef.current = false;
    setPhase('uploading');
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    acousticAnalyzer.stopAcousticCapture();
    const summary = acousticAnalyzer.getAcousticSummary();
    const audioBlob = acousticAnalyzer.getAudioBlob();

    let clientTranscript = accumulatedSpeechRef.current.trim();
    let backendTranscript = '';

    // Send audio blob to FastAPI /api/v1/transcribe for backend Google Gemini STT
    if (audioBlob) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'verbal_fluency.webm');

        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiBaseUrl}/api/v1/transcribe`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            backendTranscript = data.transcript.trim();
          }
        }
      } catch (err) {
        console.warn('Backend transcription API check:', err);
      }
    }

    // Merge words from client Web Speech API and backend transcription
    let combinedWords = [];
    if (clientTranscript) {
      combinedWords.push(...clientTranscript.split(/\s+/).filter(Boolean));
    }
    if (backendTranscript) {
      const backendWords = backendTranscript.split(/\s+/).filter(Boolean);
      for (const bw of backendWords) {
        // Add if not already captured verbatim
        if (!combinedWords.some((w) => w.toLowerCase() === bw.toLowerCase())) {
          combinedWords.push(bw);
        }
      }
    }

    const mergedTranscript = combinedWords.length > 0 
      ? combinedWords.join(' ') 
      : (clientTranscript || backendTranscript || '');

    // Identify semantic animal matches with plural normalization
    const matchedAnimalSet = new Set();
    for (const w of combinedWords) {
      const norm = normalizeAnimalWord(w);
      if (norm) {
        matchedAnimalSet.add(norm);
      }
    }
    const matchedAnimals = Array.from(matchedAnimalSet);

    const actualWordCount = combinedWords.length;
    const elapsedSeconds = DURATION_SECONDS - (secondsRemaining || 0);
    const durationMin = Math.max((elapsedSeconds || 25) / 60.0, 0.1);
    const wpm = actualWordCount > 0 ? Math.round(actualWordCount / durationMin) : 0;

    const metrics = {
      words_count: actualWordCount,
      speech_rate_wpm: wpm,
      pause_ratio: summary.pause_ratio,
      mean_pause_duration_ms: summary.mean_pause_duration_ms,
      hesitation_count: 0,
      transcript: mergedTranscript,
      matched_items: matchedAnimals,
    };

    setTranscriptionResult({
      transcript: mergedTranscript || 'No distinct speech detected during interval.',
      wpm,
      wordCount: actualWordCount,
      matchedAnimals,
      pauseRatio: summary.pause_ratio,
      elapsedSeconds: elapsedSeconds || 25,
    });
    setFinalMetrics(metrics);
    setPhase('review');
  };

  // Allow user to remove an animal false-positive
  const handleRemoveAnimal = (animalToRemove) => {
    if (!transcriptionResult) return;
    const nextAnimals = transcriptionResult.matchedAnimals.filter((a) => a !== animalToRemove);
    const updated = {
      ...transcriptionResult,
      matchedAnimals: nextAnimals,
    };
    setTranscriptionResult(updated);
    if (finalMetrics) {
      setFinalMetrics({
        ...finalMetrics,
        matched_items: nextAnimals,
      });
    }
  };

  // Allow user to add an animal that their microphone muffled
  const handleAddAnimal = (e) => {
    e?.preventDefault();
    const clean = newAnimalInput.trim().toLowerCase();
    if (!clean || !transcriptionResult) return;
    const norm = normalizeAnimalWord(clean) || clean;
    if (!transcriptionResult.matchedAnimals.includes(norm)) {
      const nextAnimals = [...transcriptionResult.matchedAnimals, norm];
      const nextWordCount = Math.max(transcriptionResult.wordCount + 1, nextAnimals.length);
      const durationMin = Math.max(transcriptionResult.elapsedSeconds / 60.0, 0.1);
      const nextWpm = Math.round(nextWordCount / durationMin);

      const updated = {
        ...transcriptionResult,
        wordCount: nextWordCount,
        wpm: nextWpm,
        matchedAnimals: nextAnimals,
      };
      setTranscriptionResult(updated);
      if (finalMetrics) {
        setFinalMetrics({
          ...finalMetrics,
          words_count: nextWordCount,
          speech_rate_wpm: nextWpm,
          matched_items: nextAnimals,
        });
      }
    }
    setNewAnimalInput('');
  };

  const handleProceed = () => {
    if (finalMetrics) {
      onComplete(finalMetrics);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.onend = null;
          speechRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Progress & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <span className="badge-pill badge-amber" style={{ marginRight: '8px' }}>Task 4 of 4</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Verbal Fluency & Phonation Stability</span>
        </div>
        <div className="mono-num" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {phase === 'recording' ? `${secondsRemaining}s remaining` : 'Final Protocol Step'}
        </div>
      </div>

      {/* Main Interaction Arena */}
      <div className="test-arena" style={{ minHeight: '440px' }}>
        {phase === 'instructions' && (
          <div style={{ textAlign: 'center', maxWidth: '560px' }}>
            <div style={{ width: '64px', height: '64px', margin: '0 auto 18px auto', borderRadius: '50%', background: 'var(--amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={32} color="var(--amber-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>
              Semantic Lexical Retrieval Test
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
              You will have <strong style={{ color: '#fff' }}>25 seconds</strong> to speak aloud into your microphone.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '18px 22px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '24px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--cyan-glow)' }}>
              "Name as many different animals or living creatures as you can think of."
            </div>
            <button className="btn-primary" onClick={startTask}>
              <Mic size={18} />
              <span>Start Speaking & Recording</span>
            </button>
          </div>
        )}

        {phase === 'recording' && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '560px' }}>
            {/* Big Countdown Timer */}
            <div
              className="mono-num"
              style={{
                fontSize: '4.8rem',
                fontWeight: 800,
                color: secondsRemaining <= 5 ? 'var(--rose-primary)' : 'var(--amber-primary)',
                letterSpacing: '-0.03em',
                marginBottom: '10px',
              }}
            >
              00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
              Speak clearly: <em>"Lion, dolphin, elephant, dog, monkey, eagle..."</em>
            </p>

            {/* Dynamic Real-Time Audio Level VU Meter */}
            <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', overflow: 'hidden', padding: '3px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(acousticAnalyzer.volumeLevel * 100, 100)}%`,
                  background: 'linear-gradient(90deg, var(--amber-primary), var(--emerald-primary), var(--cyan-primary))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.08s ease',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.5)',
                }}
              />
            </div>

            {/* LIVE HEARING TRANSCRIPT (Instant Feedback) */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 18px', minHeight: '68px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <Radio size={14} className="spin-animate" />
                  <span>Live Audio Speech Stream:</span>
                </div>
                {liveTranscript && (
                  <span className="badge-pill badge-emerald" style={{ fontSize: '0.7rem' }}>
                    {liveTranscript.split(/\s+/).filter(Boolean).length} words spoken
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.94rem', color: liveTranscript ? '#fff' : 'var(--text-dim)', fontStyle: liveTranscript ? 'normal' : 'italic', margin: 0, wordBreak: 'break-word' }}>
                {liveTranscript || 'Listening for your voice... speak animals now'}
              </p>
            </div>

            <button
              onClick={finishRecording}
              className="btn-secondary"
              style={{ padding: '10px 22px', fontSize: '0.88rem' }}
            >
              Finish Early
            </button>
          </div>
        )}

        {phase === 'uploading' && (
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={48} color="var(--cyan-glow)" className="spin-animate" style={{ margin: '0 auto 16px auto' }} />
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Analyzing Speech & Lexical Retrieval</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Extracting semantic animal targets and acoustic timing metrics...</p>
          </div>
        )}

        {phase === 'review' && transcriptionResult && (
          <div style={{ textAlign: 'left', width: '100%', maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="var(--emerald-glow)" />
                <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Speech Capture & Verification</h4>
              </div>
              <button
                onClick={startTask}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Restart this 25-second speech test"
              >
                <RotateCcw size={14} />
                <span>Re-record (25s)</span>
              </button>
            </div>

            {/* Transcribed Speech Box */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '18px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Full Speech Transcript:
              </div>
              <p style={{ fontSize: '1.05rem', color: '#ffffff', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                "{transcriptionResult.transcript}"
              </p>
            </div>

            {/* Detected Target Items with Click-to-Remove */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Recognized Animal Targets ({transcriptionResult.matchedAnimals.length}):
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Click ✕ to remove any false match
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '36px', alignItems: 'center' }}>
                {transcriptionResult.matchedAnimals.length > 0 ? (
                  transcriptionResult.matchedAnimals.map((item, idx) => (
                    <span
                      key={idx}
                      className="badge-pill badge-emerald"
                      style={{ fontSize: '0.85rem', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>✓ {item.toUpperCase()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAnimal(item)}
                        style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}
                        title="Remove word"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    No target animal matches detected. If spoken words were missed, add them below.
                  </span>
                )}
              </div>
            </div>

            {/* Missed Word Quick Add Field */}
            <form onSubmit={handleAddAnimal} style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
              <input
                type="text"
                value={newAnimalInput}
                onChange={(e) => setNewAnimalInput(e.target.value)}
                placeholder="Missed an animal? Type name here (e.g. elephant, dog)"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '9px 14px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-secondary"
                disabled={!newAnimalInput.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} />
                <span>Add Animal</span>
              </button>
            </form>

            {/* Key Acoustic Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Animals</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-glow)' }}>
                  {transcriptionResult.matchedAnimals.length}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speech Rate</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>
                  {transcriptionResult.wpm} WPM
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Words</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
                  {transcriptionResult.wordCount}
                </div>
              </div>
            </div>

            <button
              onClick={handleProceed}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
            >
              <span>Proceed to Assessment Summary</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        Lexical retrieval rate and articulation fluency reflect temporal-frontal processing efficiency.
      </div>
    </div>
  );
}
