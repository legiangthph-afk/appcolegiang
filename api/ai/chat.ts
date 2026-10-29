import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Phương thức không được hỗ trợ.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { message, role = 'teacher', chatHistory = [] } = body || {};

    if (!message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Nội dung tin nhắn trống.' }));
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Chưa cấu hình GEMINI_API_KEY trên môi trường Vercel.',
          needsConfig: true,
        })
      );
      return;
    }

    const aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

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

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        success: true,
        reply: response.text || 'Bạn AI Hạnh Phúc luôn sẵn sàng đồng hành cùng bạn!',
      })
    );
  } catch (error: any) {
    console.error('Chat error on Vercel handler:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error?.message || 'Lỗi xử lý tin nhắn trò chuyện.' }));
  }
}
