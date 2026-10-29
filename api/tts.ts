import type { IncomingMessage, ServerResponse } from 'http';

interface RequestWithQuery extends IncomingMessage {
  query?: Record<string, string>;
  body?: any;
}

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Extract text from query or body
  let text = '';
  if (req.method === 'GET') {
    text = (req.query?.text as string) || '';
  } else if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }
    text = body?.text || '';
  }

  if (!text || !text.trim()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Nội dung âm thanh không được để trống.' }));
    return;
  }

  // Sanitize and limit text length for TTS stability (< 300 chars per chunk)
  const cleanChunk = text.trim().slice(0, 300);

  // Strategy 1: Google Cloud Text-to-Speech API (Neural2 / Wavenet female Vietnamese)
  const gcpTtsKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (gcpTtsKey) {
    try {
      const gcpUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${gcpTtsKey}`;
      const gcpRes = await fetch(gcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: cleanChunk },
          voice: {
            languageCode: 'vi-VN',
            name: 'vi-VN-Neural2-A', // Highest quality female Vietnamese voice
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.92,
            pitch: 0.0,
          },
        }),
      });

      if (gcpRes.ok) {
        const data = await gcpRes.json();
        if (data.audioContent) {
          const audioBuffer = Buffer.from(data.audioContent, 'base64');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', audioBuffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Accept-Ranges', 'bytes');
          res.setHeader('X-TTS-Source', 'Google-Cloud-Neural2-Female');
          res.end(audioBuffer);
          return;
        }
      }
    } catch (gcpErr) {
      console.warn('GCP TTS fallback to Google Translate TTS:', gcpErr);
    }
  }

  // Strategy 2: High-fidelity Vietnamese Translate TTS Fallback (Zero auth required, female Vietnamese voice)
  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      cleanChunk.slice(0, 190)
    )}&tl=vi&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Google TTS upstream status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-TTS-Source', 'Google-Translate-Vietnamese');
    res.end(buffer);
  } catch (err: any) {
    console.error('TTS Endpoint Error:', err);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Không thể tổng hợp giọng đọc tiếng Việt qua máy chủ.',
        detail: err?.message || String(err),
      })
    );
  }
}
