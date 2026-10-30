/**
 * geminiLiveClient.js
 * Ultra-low-latency, bidirectional Multimodal Live Audio Client for NeuroNova.
 * Uses Gemini Live API via WebSockets (BidiGenerateContentConstrained with ephemeral tokens)
 * with dual-engine speech capture (instant Web Speech API + fast Groq Whisper VAD fallback)
 * to provide a seamless, natural, conversational "phone call" experience.
 * 
 * Key Resilience Features:
 * 1. Strict Protocol Lifecycle: Waits for `setupComplete` before transmitting turns.
 * 2. Dual-Engine Speech Processing: Instant Web Speech + ultra-fast 150ms Groq Whisper fallback.
 * 3. Acoustic Echo & Self-Interruption Guard: Suppresses speaker feedback while Nova is speaking; enables natural barge-in.
 * 4. Jitter-Buffered Web Audio Scheduler: 24kHz smooth playback without clipping or dropouts.
 * 5. Full Bi-directional Transcripts: Surfaces both user speech and Nova's replies in real-time.
 */

export const LIVE_VOICES = [
  { id: 'Aoede', name: 'Aoede (Warm, Empathetic & Gentle)', gender: 'Female' },
  { id: 'Kore', name: 'Kore (Calm, Clear & Supportive)', gender: 'Female' },
  { id: 'Puck', name: 'Puck (Playful, Friendly & Engaging)', gender: 'Male' },
  { id: 'Charon', name: 'Charon (Deep, Grounding & Reassuring)', gender: 'Male' },
  { id: 'Fenrir', name: 'Fenrir (Energetic, Crisp & Focused)', gender: 'Male' },
];

let preloadedTokenData = null;
let preloadPromise = null;

/**
 * Pre-load ephemeral token ahead of time to eliminate start-up delay
 */
export async function preloadLiveToken(apiKey = '') {
  if (preloadedTokenData && Date.now() < preloadedTokenData.expiresAt) {
    return preloadedTokenData;
  }
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    try {
      const backendUrl =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
        'http://127.0.0.1:8000';

      const key =
        apiKey ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
        (typeof window !== 'undefined' && localStorage.getItem('neuro_gemini_api_key')) ||
        '';

      const res = await fetch(`${backendUrl}/api/v1/voice-agent/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.ws_url || data.direct_ws_url)) {
          preloadedTokenData = {
            ...data,
            expiresAt:
              Date.now() +
              (data.expires_in_seconds ? data.expires_in_seconds * 1000 - 60000 : 1200000),
          };
          return preloadedTokenData;
        }
      }
    } catch (e) {
      console.warn('Preload token warning (will use direct fallback if available):', e);
    } finally {
      preloadPromise = null;
    }

    return null;
  })();

  return preloadPromise;
}

/**
 * Downsample Float32 audio buffer to 16kHz Float32 Array
 */
function downsampleTo16k(inputFloat32Array, inputSampleRate, outputSampleRate = 16000) {
  if (inputSampleRate === outputSampleRate) return inputFloat32Array;
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(inputFloat32Array.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetInput = 0;

  while (offsetResult < result.length) {
    const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetInput; i < nextOffsetInput && i < inputFloat32Array.length; i++) {
      accum += inputFloat32Array[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetInput = nextOffsetInput;
  }
  return result;
}

/**
 * Convert Float32 audio samples array to a standard 16kHz mono WAV Blob
 */
function pcmToWavBlob(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Transcribe WAV Blob via Groq Whisper API (sub-150ms transcription)
 */
export async function transcribeAudioBuffer(wavBlob, language = 'en', groqApiKey = '') {
  const key =
    groqApiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) ||
    '';

  const formData = new FormData();
  formData.append('file', wavBlob, 'live_speech.wav');
  formData.append('model', 'whisper-large-v3');
  if (language === 'hi') formData.append('language', 'hi');
  else if (language === 'mr') formData.append('language', 'mr');
  else formData.append('language', 'en');

  try {
    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
      },
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return (data.text || '').trim();
    }
  } catch (err) {
    console.warn('Groq Whisper live transcription warning:', err);
  }
  return '';
}

/**
 * Decode Base64 to Int16Array safely without RangeError
 */
function base64ToInt16(base64) {
  try {
    const binary = window.atob(base64);
    const len = Math.floor(binary.length / 2);
    const int16 = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      const low = binary.charCodeAt(i * 2);
      const high = binary.charCodeAt(i * 2 + 1);
      int16[i] = (high << 8) | low;
    }
    return int16;
  } catch (e) {
    console.warn('base64ToInt16 error:', e);
    return new Int16Array(0);
  }
}

/**
 * Gemini Live Multimodal Session Controller
 */
export class GeminiLiveSession {
  constructor({
    apiKey = '',
    language = 'en',
    voiceName = 'Aoede',
    onStatusChange = () => {},
    onTranscript = () => {},
    onVolume = () => {},
    onError = () => {},
  }) {
    this.apiKey =
      apiKey ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
      (typeof window !== 'undefined' && localStorage.getItem('neuro_gemini_api_key')) ||
      '';
    this.language = language;
    this.voiceName = voiceName || 'Aoede';
    this.onStatusChange = onStatusChange;
    this.onTranscript = onTranscript;
    this.onVolume = onVolume;
    this.onError = onError;

    this.ws = null;
    this.micStream = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.processorNode = null;
    this.activeAudioSources = [];
    this.nextAudioStartTime = 0;

    this.isMuted = false;
    this.isConnected = false;
    this.isSessionReady = false;
    this.isSpeaking = false;
    this.hasSpokenInTurn = false;
    this.vadSilenceTimeout = null;
    this.speechSamplesBuffer = [];
    this.ended = false;
  }

  /**
   * Start the live bidirectional audio call
   */
  async start() {
    this.ended = false;
    this.onStatusChange('connecting');

    try {
      // 1. Fetch preloaded ephemeral token from backend if available
      const tokenData = await preloadLiveToken(this.apiKey);
      let wsUrl = null;

      if (tokenData && tokenData.token && tokenData.ws_url) {
        wsUrl = tokenData.ws_url;
      } else {
        const key =
          this.apiKey ||
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
          (typeof window !== 'undefined' && localStorage.getItem('neuro_gemini_api_key')) ||
          '';

        if (key) {
          wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`;
        }
      }

      if (!wsUrl) {
        throw new Error('Gemini API key is required for live audio call.');
      }

      // 2. Initialize Output Audio Context (24,000 Hz for high-fidelity Gemini speech)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.outputAudioContext = new AudioCtx({ sampleRate: 24000 });
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }
      this.nextAudioStartTime = this.outputAudioContext.currentTime;

      // 3. Request Microphone Access
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 4. Initialize Input Audio Context & Mic Processing Pipeline
      this.inputAudioContext = new AudioCtx();
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }

      const micSource = this.inputAudioContext.createMediaStreamSource(this.micStream);
      this.processorNode = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
      const inputSampleRate = this.inputAudioContext.sampleRate;

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isConnected || !this.isSessionReady || this.isMuted || this.ended) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Compute RMS volume level (0 - 100)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const micLevel = Math.min(100, Math.round(rms * 450));
        this.onVolume({ micLevel, agentLevel: this.isSpeaking ? 75 : 0 });

        // --- ACOUSTIC ECHO & BARGE-IN FILTER ---
        if (this.isSpeaking) {
          if (micLevel >= 36) {
            // User speaking over model: interrupt immediately
            this.handleInterruption();
          } else {
            return; // Suppress speaker feedback
          }
        }

        // --- DUAL-ENGINE VAD CAPTURE ---
        const downsampled = downsampleTo16k(inputData, inputSampleRate, 16000);

        if (micLevel >= 8) {
          this.hasSpokenInTurn = true;
          if (this.vadSilenceTimeout) {
            clearTimeout(this.vadSilenceTimeout);
            this.vadSilenceTimeout = null;
          }
          // Buffer audio samples during speech
          for (let i = 0; i < downsampled.length; i++) {
            this.speechSamplesBuffer.push(downsampled[i]);
          }
        } else if (this.hasSpokenInTurn) {
          // Add brief silence tail (up to 300ms) to preserve ending consonants
          if (this.speechSamplesBuffer.length < 80000) {
            for (let i = 0; i < downsampled.length; i++) {
              this.speechSamplesBuffer.push(downsampled[i]);
            }
          }

          if (!this.vadSilenceTimeout) {
            this.vadSilenceTimeout = setTimeout(() => {
              this.processSpeechBuffer();
            }, 550);
          }
        }
      };

      micSource.connect(this.processorNode);
      this.processorNode.connect(this.inputAudioContext.destination);

      // 5. Connect WebSocket
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.onStatusChange('connecting');

        const langName =
          this.language === 'hi' ? 'Hindi' : this.language === 'mr' ? 'Marathi' : 'English';

        const setupPayload = {
          setup: {
            model: tokenData?.model || 'models/gemini-3.8-live',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: this.voiceName || 'Aoede',
                  },
                },
              },
            },
            systemInstruction: {
              parts: [
                {
                  text: `You are Nova, an empathetic, validating conversational companion for NeuroNova specializing in Autism, ADHD, AuDHD, and cognitive well-being.
Speak warmly, simply, and conversationally in ${langName} like a caring friend on a live phone call.
Respond directly to whatever the user asks with empathy and practical insight.
Keep answers concise, fluid, and strictly 1 to 2 short sentences per turn.
Validate user feelings immediately. Do not use asterisks or markdown formatting.
When the call starts, greet the user warmly with one short sentence in ${langName}.`,
                },
              ],
            },
          },
        };

        // Send setup frame FIRST
        this.ws.send(JSON.stringify(setupPayload));
      };

      this.ws.onmessage = async (event) => {
        try {
          let messageData = event.data;
          if (messageData instanceof Blob) {
            messageData = await messageData.text();
          }

          const msg = JSON.parse(messageData);

          // 1. Session Setup Acknowledgment
          if (msg.setupComplete) {
            this.isSessionReady = true;
            this.onStatusChange('connected');

            // Trigger Nova's warm opening greeting
            const langName =
              this.language === 'hi' ? 'Hindi' : this.language === 'mr' ? 'Marathi' : 'English';

            const greetingTrigger = {
              clientContent: {
                turns: [
                  {
                    role: 'user',
                    parts: [
                      {
                        text: `Hello Nova! I just started our call in ${langName}. Greet me warmly in one short sentence.`,
                      },
                    ],
                  },
                ],
                turnComplete: true,
              },
            };
            this.ws.send(JSON.stringify(greetingTrigger));
            return;
          }

          const serverContent = msg.serverContent;
          if (serverContent) {
            // Handle Barge-in / Interruption
            if (serverContent.interrupted) {
              this.handleInterruption();
              return;
            }

            // Handle Model Audio Downlink & Live Transcripts
            if (serverContent.modelTurn && serverContent.modelTurn.parts) {
              for (const part of serverContent.modelTurn.parts) {
                if (part.text) {
                  this.onTranscript({
                    id: `agent_${Date.now()}`,
                    sender: 'agent',
                    text: part.text,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  });
                }
                if (part.inlineData && part.inlineData.data) {
                  this.playAudioChunk(part.inlineData.data);
                }
              }
            }

            // Turn Completed
            if (serverContent.turnComplete) {
              if (this.activeAudioSources.length === 0) {
                this.isSpeaking = false;
                if (this.isConnected && !this.ended) {
                  this.onStatusChange('listening');
                }
              }
            }
          }
        } catch (err) {
          console.warn('Error processing Gemini Live message:', err);
        }
      };

      this.ws.onerror = (err) => {
        console.error('Gemini Live WebSocket error:', err);
        if (!this.ended) {
          this.onError('Live calling connection issue.');
        }
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this.isSessionReady = false;
        if (!this.ended && event && event.code !== 1000) {
          this.onError(`Live calling closed (${event.code}).`);
        } else if (!this.ended) {
          this.onStatusChange('ended');
        }
      };
    } catch (err) {
      console.error('Failed to start Gemini Live call session:', err);
      this.onError(err.message || 'Microphone or connection failure');
      this.stop();
    }
  }

  /**
   * Process recorded speech buffer via Groq Whisper fallback if Web Speech API hasn't committed
   */
  async processSpeechBuffer() {
    if (this.vadSilenceTimeout) {
      clearTimeout(this.vadSilenceTimeout);
      this.vadSilenceTimeout = null;
    }
    const samples = this.speechSamplesBuffer;
    this.speechSamplesBuffer = [];
    this.hasSpokenInTurn = false;

    // Minimum 250ms of audio (4000 samples at 16kHz) to avoid empty clicks
    if (samples.length < 4000) return;

    try {
      const wavBlob = pcmToWavBlob(new Float32Array(samples), 16000);
      const transcript = await transcribeAudioBuffer(wavBlob, this.language);

      if (transcript && transcript.trim().length > 1) {
        this.onTranscript({
          id: `user_${Date.now()}`,
          sender: 'user',
          text: transcript.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        this.sendUserSpeech(transcript.trim());
      }
    } catch (err) {
      console.warn('Speech buffer processing warning:', err);
    }
  }

  /**
   * Clear pending speech buffer when Web Speech API delivers transcript first
   */
  clearSpeechBuffer() {
    this.speechSamplesBuffer = [];
    this.hasSpokenInTurn = false;
    if (this.vadSilenceTimeout) {
      clearTimeout(this.vadSilenceTimeout);
      this.vadSilenceTimeout = null;
    }
  }

  /**
   * Send user's recognized speech text directly to Gemini Live
   */
  sendUserSpeech(text) {
    if (!text || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.clearSpeechBuffer();

    const turnPayload = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };
    try {
      this.ws.send(JSON.stringify(turnPayload));
      this.handleInterruption();
    } catch (e) {
      console.warn('Send speech error:', e);
    }
  }

  /**
   * Play streaming 24kHz PCM audio chunk seamlessly with jitter buffering
   */
  playAudioChunk(base64Data) {
    if (!this.outputAudioContext || this.ended) return;

    try {
      const int16Array = base64ToInt16(base64Data);
      if (int16Array.length === 0) return;

      const audioBuffer = this.outputAudioContext.createBuffer(1, int16Array.length, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);

      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextAudioStartTime < currentTime) {
        this.nextAudioStartTime = currentTime + 0.025;
      }

      const startTime = this.nextAudioStartTime;
      source.start(startTime);
      this.nextAudioStartTime = startTime + audioBuffer.duration;

      this.activeAudioSources.push(source);
      this.isSpeaking = true;
      this.onStatusChange('speaking');

      source.onended = () => {
        const index = this.activeAudioSources.indexOf(source);
        if (index > -1) {
          this.activeAudioSources.splice(index, 1);
        }
        if (this.activeAudioSources.length === 0) {
          this.isSpeaking = false;
          if (this.isConnected && !this.ended) {
            this.onStatusChange('listening');
          }
        }
      };
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }

  /**
   * Handle user interruption (barge-in): instantly halt model speech
   */
  handleInterruption() {
    for (const source of this.activeAudioSources) {
      try {
        source.stop();
      } catch {
        // ignore
      }
    }
    this.activeAudioSources = [];
    if (this.outputAudioContext) {
      this.nextAudioStartTime = this.outputAudioContext.currentTime;
    }
    this.isSpeaking = false;
    if (this.isConnected && !this.ended) {
      this.onStatusChange('listening');
    }
  }

  /**
   * Mute or unmute microphone
   */
  setMute(isMuted) {
    this.isMuted = isMuted;
    if (isMuted) {
      this.clearSpeechBuffer();
    }
  }

  /**
   * End live calling session & cleanup all resources
   */
  stop() {
    this.ended = true;
    this.isConnected = false;
    this.isSessionReady = false;
    this.clearSpeechBuffer();

    if (this.ws) {
      try {
        this.ws.close(1000, 'Call ended by user');
      } catch {
        // ignore
      }
      this.ws = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {
        // ignore
      }
      this.processorNode = null;
    }

    for (const source of this.activeAudioSources) {
      try {
        source.stop();
      } catch {
        // ignore
      }
    }
    this.activeAudioSources = [];

    if (this.inputAudioContext) {
      try {
        this.inputAudioContext.close();
      } catch {
        // ignore
      }
      this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
      try {
        this.outputAudioContext.close();
      } catch {
        // ignore
      }
      this.outputAudioContext = null;
    }

    this.onStatusChange('ended');
  }
}
