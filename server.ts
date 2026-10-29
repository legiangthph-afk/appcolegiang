import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// High-fidelity Vietnamese Text-To-Speech (TTS) Proxy Endpoint
const handleVietnameseTTS = async (text: string, res: Response) => {
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Nội dung âm thanh trống.' });
  }

  // Google Translate TTS chunk limit ~200 characters
  const cleanChunk = text.trim().slice(0, 200);
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanChunk)}&tl=vi&client=tw-ob`;

  try {
    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`TTS provider returned HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes',
    });

    return res.send(buffer);
  } catch (err: any) {
    console.error('TTS Proxy Error:', err);
    return res.status(502).json({ error: 'Không thể tổng hợp giọng đọc tiếng Việt qua máy chủ.' });
  }
};

app.get('/api/tts', async (req: Request, res: Response) => {
  const text = (req.query.text as string) || '';
  return handleVietnameseTTS(text, res);
});

app.post('/api/tts', async (req: Request, res: Response) => {
  const { text } = req.body || {};
  return handleVietnameseTTS(text, res);
});

// Generic AI generation endpoint using gemini-3.8-flash
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, systemInstruction, responseType } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Nội dung yêu cầu (prompt) không được để trống.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm khóa API trong bảng Cài đặt hoặc chạy ở chế độ trải nghiệm.',
        needsConfig: true,
      });
    }

    const config: any = {
      systemInstruction: systemInstruction || 'Bạn là trợ lý AI giáo dục chuyên nghiệp, ấm áp, thấu hiểu dành cho giáo viên chủ nhiệm lớp 4A4, Trường Tiểu học Khoái Châu 1, Hưng Yên.',
      temperature: 0.7,
    };

    if (responseType === 'json') {
      config.responseMimeType = 'application/json';
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const text = response.text || '';
    res.json({ text, success: true });
  } catch (error: any) {
    console.error('Error generating AI content:', error);
    res.status(500).json({
      error: error?.message || 'Đã xảy ra lỗi khi gọi AI.',
      success: false,
    });
  }
});

// Specialized AI Student Needs Analysis
app.post('/api/ai/analyze-student', async (req: Request, res: Response) => {
  try {
    const { studentName, surveyData, observations } = req.body;

    if (!aiClient) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY.',
        needsConfig: true,
      });
    }

    const prompt = `
Phân tích nhu cầu học sinh tiểu học (Lớp 4) dựa trên dữ liệu sau:
- Tên học sinh (ẩn danh/mã số): ${studentName || 'Học sinh'}
- Dữ liệu khảo sát: ${JSON.stringify(surveyData || {})}
- Quan sát của giáo viên: ${observations || 'Không có ghi chú thêm'}

Yêu cầu:
1. Đưa ra phân tích mang tính nhân văn, sư phạm tích cực, không gắn nhãn hay chẩn đoán bệnh lý/tâm lý.
2. Trả về định dạng JSON với cấu trúc:
{
  "strengths": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "supportNeeds": ["Nhu cầu hỗ trợ 1", "Nhu cầu hỗ trợ 2"],
  "recommendedGoals": ["Mục tiêu rèn luyện phù hợp 1", "Mục tiêu 2"],
  "suggestedActivities": ["Hoạt động khuyến nghị 1", "Hoạt động 2"],
  "parentCollaboration": "Gợi ý phối hợp cùng phụ huynh nhẹ nhàng, thân thiện"
}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        systemInstruction: 'Bạn là chuyên gia tâm lý sư phạm tiểu học Việt Nam, luôn dùng ngôn ngữ tôn trọng, nâng đỡ và khích lệ học sinh.',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.json({ success: true, analysis: data });
  } catch (error: any) {
    console.error('Student analysis error:', error);
    res.status(500).json({ error: error?.message || 'Lỗi khi phân tích học sinh.' });
  }
});

// Chatbot endpoint with 3 personas: Teacher, Student, Parent
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, role = 'teacher', chatHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn trống.' });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY.',
        needsConfig: true,
      });
    }

    let systemInstruction = '';
    if (role === 'teacher') {
      systemInstruction = `Bạn là "Bạn AI Hạnh Phúc" - cộng sự đắc lực của cô giáo Lê Thị Giang, chủ nhiệm lớp 4A4 Trường Tiểu học Khoái Châu 1. 
Bạn hỗ trợ giáo viên giải pháp sư phạm tích cực, soạn bài, xử lý tình huống lớp học nhẹ nhàng, động viên học sinh rụt rè, xây dựng lớp học hạnh phúc. Trả lời súc tích, thực tế, ấm áp.`;
    } else if (role === 'student') {
      systemInstruction = `Bạn là "Bạn AI Hạnh Phúc" - người bạn robot siêu thân thiện, đáng yêu của các bạn nhỏ lớp 4A4! 
Nói chuyện bằng giọng vui tươi, dễ thương, dùng icon sinh động. Giải thích kiến thức bài học lớp 4 thật đơn giản, đố vui thông minh, khích lệ bạn nhỏ cố gắng. Tuyệt đối không yêu cầu hay hỏi các thông tin riêng tư, bí mật của học sinh.`;
    } else {
      systemInstruction = `Bạn là "Bạn AI Hạnh Phúc" - cầu nối yêu thương hỗ trợ quý phụ huynh học sinh lớp 4A4 trường Tiểu học Khoái Châu 1.
Tư vấn cho cha mẹ cách đồng hành cùng con tại nhà, lắng nghe cảm xúc của trẻ lớp 4, rèn nếp tự giác, phối hợp nhịp nhàng với cô giáo chủ nhiệm. Giọng điệu chân thành, tôn trọng, đồng cảm.`;
    }

    // Build contents from history
    const contents: any[] = [];
    if (Array.isArray(chatHistory)) {
      for (const item of chatHistory.slice(-6)) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content || item.text || '' }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'Bạn AI Hạnh Phúc luôn sẵn sàng đồng hành cùng bạn!',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error?.message || 'Lỗi xử lý tin nhắn trò chuyện.' });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
