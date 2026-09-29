/**
 * transcriptionService.js
 * Multi-provider speech transcription service for NeuroNova Phonation & Verbal Fluency.
 * Supports Groq Whisper Large v3 (fastest & free), Google Gemini Flash, and OpenAI Whisper.
 */

const STORAGE_KEY = 'neuro_speech_api_key';

export function getStoredApiKey() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(STORAGE_KEY) ||
    import.meta.env.VITE_GROQ_API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.VITE_OPENAI_API_KEY ||
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
 * Transcribe audio using Google Gemini Multimodal API
 */
async function transcribeWithGemini(audioBlob, apiKey) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Audio = btoa(binary);
  const mimeType = audioBlob.type ? audioBlob.type.split(';')[0] : 'audio/webm';

  const models = ['gemini-3.8-flash', 'gemini-3.5-transcribe', 'gemini-flash-latest'];
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
                  text: 'You are an accurate clinical speech transcription system. The participant was asked to name as many animals as possible in 25 seconds for a verbal fluency assessment. Transcribe all spoken words and animal names accurately. Output only the plain transcribed words.',
                },
                {
                  inline_data: {
                    mime_type: mimeType,
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
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
 * Fallback to Vercel serverless /api/transcribe endpoint
 */
async function transcribeWithServerless(audioBlob) {
  const formData = new FormData();
  const ext = audioBlob.type.includes('mp4') ? 'mp4' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
  formData.append('file', audioBlob, `verbal_test.${ext}`);

  const res = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Serverless endpoint error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    transcript: data.transcript || '',
    duration: data.duration_seconds || 25,
    provider: 'Cloud Transcription',
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
    if (provider === 'groq') {
      return await transcribeWithGroq(audioBlob, key);
    } else if (provider === 'gemini') {
      return await transcribeWithGemini(audioBlob, key);
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
