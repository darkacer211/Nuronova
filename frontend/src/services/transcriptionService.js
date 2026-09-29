/**
 * transcriptionService.js
 * Multi-provider speech transcription service for NeuroNova Phonation & Verbal Fluency.
 * Supports Google Gemini (via audio/wav), Groq Whisper Large v3, and OpenAI Whisper.
 */

const STORAGE_KEY = 'neuro_speech_api_key';

export function getStoredApiKey() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(STORAGE_KEY) ||
    import.meta.env.VITE_GROQ_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function setStoredApiKey(key) {
  if (typeof window === 'undefined') return;
  if (!key || !key.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, key.trim());
  }
}

export function detectKeyProvider(key) {
  if (!key) return null;
  const trimmed = key.trim();
  if (trimmed.startsWith('gsk_')) return 'groq';
  if (trimmed.startsWith('sk-')) return 'openai';
  if (trimmed.startsWith('AIza') || trimmed.startsWith('AQ.') || trimmed.includes('.')) return 'gemini';
  return 'gemini';
}

/**
 * Convert any browser AudioBuffer to standard 16kHz mono WAV format
 */
export function audioBufferToWav(audioBuffer) {
  const numChannels = 1;
  const targetSampleRate = 16000;
  const channelData = audioBuffer.getChannelData(0);

  // Downsample to 16kHz if needed
  let downsampled = channelData;
  if (audioBuffer.sampleRate !== targetSampleRate) {
    const ratio = audioBuffer.sampleRate / targetSampleRate;
    const newLen = Math.round(channelData.length / ratio);
    downsampled = new Float32Array(newLen);
    for (let i = 0; i < newLen; i++) {
      downsampled[i] = channelData[Math.min(Math.round(i * ratio), channelData.length - 1)];
    }
  }

  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const dataSize = downsampled.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, targetSampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < downsampled.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, downsampled[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

/**
 * Convert any recorded Blob (webm, mp4, ogg) to a standard audio/wav Blob
 */
export async function convertBlobToWav(audioBlob) {
  if (!audioBlob) return null;
  if (audioBlob.type && audioBlob.type.includes('wav')) {
    return audioBlob;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return audioBlob;

    const audioCtx = new AudioCtx();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const wavBlob = audioBufferToWav(decoded);
    audioCtx.close().catch(() => {});
    return wavBlob;
  } catch (err) {
    console.warn('Audio decoding to WAV notice, sending original:', err);
    return audioBlob;
  }
}

/**
 * Transcribe audio using Google Gemini Multimodal API (with audio/wav support)
 */
async function transcribeWithGemini(audioBlob, apiKey) {
  const wavBlob = await convertBlobToWav(audioBlob);
  const arrayBuffer = await wavBlob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Audio = btoa(binary);

  const models = ['gemini-3.5-transcribe', 'gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'You are an accurate clinical speech transcription system. The participant was asked to name as many animals as possible in 25 seconds for a verbal fluency assessment. Transcribe all spoken words and animal names accurately. Output only the plain transcribed words separated by spaces.',
                },
                {
                  inline_data: {
                    mime_type: 'audio/wav',
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.candidates?.[0]?.content?.parts?.[0]?.audioTranscription?.text ||
          '';
        return {
          transcript: text.trim(),
          duration: 25,
          provider: `Google Gemini (${model})`,
        };
      } else {
        const errorText = await res.text();
        lastError = new Error(`Gemini API error (${res.status} on ${model}): ${errorText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini transcription models failed.');
}

/**
 * Transcribe audio using Groq Whisper Large v3 Turbo (high speed, CORS supported)
 */
async function transcribeWithGroq(audioBlob, apiKey) {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  formData.append('file', audioBlob, `verbal_test.${ext}`);
  formData.append('model', 'whisper-large-v3-turbo');
  formData.append('response_format', 'verbose_json');
  formData.append('language', 'en');

  const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq Whisper error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    transcript: data.text || '',
    duration: typeof data.duration === 'number' ? data.duration : 25,
    provider: 'Groq Whisper Large v3',
  };
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeWithOpenAI(audioBlob, apiKey) {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  formData.append('file', audioBlob, `verbal_test.${ext}`);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'json');
  formData.append('language', 'en');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI Whisper error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    transcript: data.text || '',
    duration: 25,
    provider: 'OpenAI Whisper',
  };
}

/**
 * Fallback to Vercel serverless /api/transcribe endpoint
 */
async function transcribeWithServerless(audioBlob) {
  const wavBlob = await convertBlobToWav(audioBlob);
  const res = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/wav',
    },
    body: wavBlob,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Serverless endpoint error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    transcript: data.transcript || '',
    duration: data.duration_seconds || 25,
    provider: data.provider || 'Cloud Transcription',
  };
}

/**
 * Main transcription dispatcher
 */
export async function transcribeAudioBlob(audioBlob, explicitKey = '') {
  if (!audioBlob || audioBlob.size < 500) {
    throw new Error('Audio sample is too short or empty');
  }

  const key = (explicitKey || getStoredApiKey() || '').trim();

  if (key) {
    const provider = detectKeyProvider(key);
    if (provider === 'gemini') {
      return await transcribeWithGemini(audioBlob, key);
    } else if (provider === 'groq') {
      return await transcribeWithGroq(audioBlob, key);
    } else if (provider === 'openai') {
      return await transcribeWithOpenAI(audioBlob, key);
    }
  }

  // If no direct key in browser, try serverless endpoint /api/transcribe
  try {
    return await transcribeWithServerless(audioBlob);
  } catch (err) {
    throw new Error('No API key configured for cloud speech transcription.');
  }
}
