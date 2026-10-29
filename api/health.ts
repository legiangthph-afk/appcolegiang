export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      hasCloudTTSApiKey: !!process.env.GOOGLE_CLOUD_TTS_API_KEY,
      timestamp: new Date().toISOString(),
      platform: 'Vercel Serverless',
    })
  );
}
