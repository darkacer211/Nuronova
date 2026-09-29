// api/transcribe.js (Vercel Serverless Function)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const groqApiKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '').trim();
  const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();
  const openAiApiKey = (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '').trim();

  if (!groqApiKey && !geminiApiKey && !openAiApiKey) {
    return res.status(400).json({
      error: 'No transcription API key configured. Please set GROQ_API_KEY in Vercel environment variables or enter a key in the application UI.'
    });
  }

  try {
    // Collect request body chunks
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length < 500) {
      return res.status(400).json({ error: 'Audio payload is empty or too short' });
    }

    // 1. Prioritize Groq Whisper Large v3
    if (groqApiKey) {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      const postDataStart = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n` +
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`
      );
      const postDataEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
      const payload = Buffer.concat([postDataStart, buffer, postDataEnd]);

      const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: payload,
      });

      if (groqRes.ok) {
        const json = await groqRes.json();
        return res.status(200).json({
          transcript: json.text || '',
          duration_seconds: json.duration || 25,
          provider: 'Groq Whisper',
        });
      }
    }

    // 2. Fallback to Gemini
    if (geminiApiKey) {
      const base64Audio = buffer.toString('base64');
      const models = ['gemini-3.8-flash', 'gemini-3.5-transcribe', 'gemini-flash-latest'];
      for (const model of models) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: 'Transcribe all animal names and spoken words from this verbal fluency test audio accurately. Return only the plain transcribed words.' },
                    { inline_data: { mime_type: 'audio/wav', data: base64Audio } }
                  ]
                }]
              })
            }
          );

          if (geminiRes.ok) {
            const json = await geminiRes.json();
            const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return res.status(200).json({
              transcript: text.trim(),
              duration_seconds: 25,
              provider: `Google Gemini (${model})`,
            });
          }
        } catch (e) {
          console.warn(`Model ${model} failed, trying next:`, e);
        }
      }
    }

    return res.status(502).json({ error: 'Cloud transcription providers failed' });
  } catch (err) {
    console.error('Serverless transcribe error:', err);
    return res.status(500).json({ error: err.message || 'Internal transcription error' });
  }
}
