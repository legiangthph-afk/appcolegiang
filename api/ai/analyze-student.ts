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

    const { studentName, surveyData, observations } = body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Chưa cấu hình GEMINI_API_KEY.',
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
        systemInstruction:
          'Bạn là chuyên gia tâm lý sư phạm tiểu học Việt Nam, luôn dùng ngôn ngữ tôn trọng, nâng đỡ và khích lệ học sinh.',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, analysis: data }));
  } catch (error: any) {
    console.error('Student analysis error on Vercel handler:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: error?.message || 'Lỗi khi phân tích học sinh.' }));
  }
}
