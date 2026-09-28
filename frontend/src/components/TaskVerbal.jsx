import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Volume2, CheckCircle2, Loader2, Sparkles, ArrowRight, MessageSquare, Radio } from 'lucide-react';

const DURATION_SECONDS = 25;

// Common animal names dictionary to highlight detected semantic items
const KNOWN_ANIMALS = new Set([
  'dog', 'cat', 'lion', 'tiger', 'elephant', 'monkey', 'zebra', 'giraffe', 'bear', 'wolf',
  'fox', 'rabbit', 'deer', 'horse', 'cow', 'sheep', 'goat', 'pig', 'chicken', 'duck',
  'eagle', 'hawk', 'owl', 'parrot', 'penguin', 'snake', 'lizard', 'frog', 'toad', 'turtle',
  'shark', 'whale', 'dolphin', 'fish', 'octopus', 'crab', 'lobster', 'bee', 'ant', 'butterfly',
  'spider', 'cheetah', 'leopard', 'panther', 'rhino', 'hippo', 'kangaroo', 'koala', 'panda',
  'gorilla', 'chimpanzee', 'camel', 'llama', 'bat', 'otter', 'seal', 'walrus', 'crocodile', 'alligator',
  'mouse', 'rat', 'hamster', 'parrot', 'canary', 'swan', 'goose', 'turkey', 'ostrich', 'peacock'
]);

export default function TaskVerbal({ acousticAnalyzer, onComplete }) {
  // state: 'instructions', 'recording', 'uploading', 'review'
  const [phase, setPhase] = useState('instructions');
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [finalMetrics, setFinalMetrics] = useState(null);

  const countdownIntervalRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const accumulatedSpeechRef = useRef('');

  // Start speech recognition + acoustic capture
  const startTask = async () => {
    accumulatedSpeechRef.current = '';
    setLiveTranscript('');

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
          let currentStr = '';
          for (let i = 0; i < event.results.length; i++) {
            currentStr += event.results[i][0].transcript + ' ';
          }
          accumulatedSpeechRef.current = currentStr.trim();
          setLiveTranscript(currentStr.trim());
        };

        recognition.onerror = (err) => {
          console.warn('SpeechRecognition status:', err?.error);
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
    setPhase('uploading');
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Stop speech recognition
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }

    acousticAnalyzer.stopAcousticCapture();
    const summary = acousticAnalyzer.getAcousticSummary();
    const audioBlob = acousticAnalyzer.getAudioBlob();

    let transcript = accumulatedSpeechRef.current.trim();
    let wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
    let wpm = wordCount > 0 ? Math.round((wordCount / (DURATION_SECONDS - secondsRemaining || 25)) * 60) : 0;
    let hesitations = 0;

    // Send audio blob to FastAPI /api/v1/transcribe for verification or fallback
    if (audioBlob) {
      try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'verbal_fluency.webm');

        const res = await fetch('http://localhost:8000/api/v1/transcribe', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          // If browser speech recognition was empty (e.g. Firefox/Safari), use backend transcription
          if (!transcript && data.transcript && data.transcript.trim()) {
            transcript = data.transcript;
            wpm = data.speech_rate_wpm || 120.0;
            wordCount = data.word_count || transcript.split(/\s+/).length;
            hesitations = data.hesitation_count || 0;
          }
        }
      } catch (err) {
        console.warn('Backend transcription API check:', err);
      }
    }

    // If still empty (silent mic or user didn't speak)
    if (!transcript) {
      transcript = 'No distinct speech detected during interval.';
      wordCount = 0;
      wpm = 0;
    }

    // Identify semantic animal matches in transcript
    const words = transcript.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z]/g, ''));
    const matchedAnimals = Array.from(new Set(words.filter((w) => KNOWN_ANIMALS.has(w))));

    // If words were spoken, recompute WPM realistically
    if (wordCount > 0 && wpm === 0) {
      wpm = Math.round((wordCount / 25) * 60);
    }

    const metrics = {
      words_count: wordCount,
      speech_rate_wpm: wpm,
      pause_ratio: summary.pause_ratio,
      mean_pause_duration_ms: summary.mean_pause_duration_ms,
      hesitation_count: hesitations,
      transcript: transcript,
      matched_items: matchedAnimals,
    };

    setTranscriptionResult({
      transcript,
      wpm,
      wordCount,
      matchedAnimals,
      pauseRatio: summary.pause_ratio,
    });
    setFinalMetrics(metrics);
    setPhase('review');
  };

  const handleProceed = () => {
    if (finalMetrics) {
      onComplete(finalMetrics);
    }
  };

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (speechRecognitionRef.current) {
        try {
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
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px 18px', minHeight: '60px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--cyan-glow)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                <Radio size={14} className="spin-animate" />
                <span>Live Audio Transcription:</span>
              </div>
              <p style={{ fontSize: '0.92rem', color: liveTranscript ? '#fff' : 'var(--text-dim)', fontStyle: liveTranscript ? 'normal' : 'italic', margin: 0 }}>
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
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Analyzing Phonation Dynamics</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Transcribing speech and extracting acoustic hesitation ratios...</p>
          </div>
        )}

        {phase === 'review' && transcriptionResult && (
          <div style={{ textAlign: 'left', width: '100%', maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <CheckCircle2 size={24} color="var(--emerald-glow)" />
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Speech Capture & Verification</h4>
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

            {/* Detected Target Items */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Recognized Category Targets ({transcriptionResult.matchedAnimals.length}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {transcriptionResult.matchedAnimals.length > 0 ? (
                  transcriptionResult.matchedAnimals.map((item, idx) => (
                    <span
                      key={idx}
                      className="badge-pill badge-emerald"
                      style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                    >
                      ✓ {item.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    No target animal matches detected in transcript.
                  </span>
                )}
              </div>
            </div>

            {/* Key Acoustic Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Speech Rate</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cyan-glow)' }}>
                  {transcriptionResult.wpm} WPM
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Word Count</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-glow)' }}>
                  {transcriptionResult.wordCount} words
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pause Ratio</div>
                <div className="mono-num" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--amber-primary)' }}>
                  {Math.round(transcriptionResult.pauseRatio * 100)}%
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
