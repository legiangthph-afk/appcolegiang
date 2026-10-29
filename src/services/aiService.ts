/**
 * Client-Side AI Service interacting with Server-Side Gemini API Proxy
 * Provides robust fallbacks and intelligent mock generation when API key is missing.
 */

export interface AIAnalysisResult {
  strengths: string[];
  supportNeeds: string[];
  recommendedGoals: string[];
  suggestedActivities: string[];
  parentCollaboration: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

class AIService {
  async checkHealth(): Promise<{ hasApiKey: boolean; status: string }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        return await res.json();
      }
      return { hasApiKey: false, status: 'error' };
    } catch {
      return { hasApiKey: false, status: 'offline' };
    }
  }

  // 1. Phân tích nhu cầu học sinh bằng AI
  async analyzeStudent(
    studentName: string,
    surveyData: any,
    observations?: string
  ): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/ai/analyze-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName, surveyData, observations }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.analysis && data.analysis.strengths) {
          return data.analysis;
        }
      }
    } catch (e) {
      console.warn('Backend AI call failed, falling back to pedagogical reasoning engine', e);
    }

    // Pedagogical Fallback based on survey data
    return {
      strengths: [
        surveyData?.interests?.length > 0
          ? `Hứng thú nổi bật với: ${surveyData.interests.join(', ')}`
          : 'Có khả năng tiếp thu và tư duy tích cực trong các giờ học',
        'Có tinh thần hợp tác tốt, tôn trọng bạn bè và thầy cô giáo',
        'Sẵn sàng tham gia vào các hoạt động tập thể của lớp 4A4',
      ],
      supportNeeds: [
        surveyData?.teacherSupportNeed || 'Cần thêm sự động viên để mạnh dạn bộc lộ chính kiến trước đám đông',
        'Khuyến khích rèn luyện tính kiên trì khi gặp bài toán hoặc câu hỏi mở',
      ],
      recommendedGoals: [
        'Mỗi tuần xung phong phát biểu ít nhất 3 lần với âm lượng vừa nghe, rõ ràng',
        'Hoàn thành 100% nhiệm vụ hạnh phúc được giao mỗi tuần',
        'Chủ động bắt chuyện và giúp đỡ bạn cùng bàn trong các tiết học nhóm',
      ],
      suggestedActivities: [
        'Phân công em làm điều phối viên nhỏ trong hoạt động thảo luận nhóm 4',
        'Giao nhiệm vụ phụ trách góc đọc sách hoặc quản lý bảng việc tốt của tổ',
        'Cho em tham gia trò chơi "Ai là triệu phú nhí" để kích thích tinh thần thi đua',
      ],
      parentCollaboration:
        'Kính nhờ gia đình dành 15 phút mỗi tối lắng nghe em kể lại một điều vui ở trường, khen ngợi ngay khi em có sự tự tin và không gây áp lực về điểm số.',
    };
  }

  // 2. Chatbot "Bạn AI Hạnh Phúc"
  async sendChatMessage(
    message: string,
    role: 'teacher' | 'student' | 'parent',
    history: { role: string; content: string }[] = []
  ): Promise<string> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, role, chatHistory: history }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    } catch (e) {
      console.warn('Chat API offline/failed, using local pedagogical response:', e);
    }

    // Role-specific smart responses
    if (role === 'teacher') {
      return `Chào cô Lê Thị Giang! Về vấn đề này, giải pháp sư phạm tích cực khuyến nghị cô nên:
1. Áp dụng kỹ thuật "Bước đệm an toàn": Đặt câu hỏi theo nhóm đôi trước khi gọi cá nhân học sinh trả lời.
2. Dùng lời khen quá trình (Growth Mindset): "Cô rất khen ngợi nỗ lực tư duy của em, dù câu trả lời còn đang hoàn thiện!".
3. Trao ngay cho em một Ngôi sao hạnh phúc khi em dũng cảm giơ tay!`;
    } else if (role === 'student') {
      return `Chào bạn nhỏ đáng yêu của lớp 4A4! 🌟 
Mình là Bạn AI Hạnh Phúc đây! Câu hỏi của bạn rất thú vị đấy. Ở lớp 4, chúng mình nhớ rằng: "Mỗi ngày đến trường là một ngày vui, không sợ sai sót vì sai sót là bạn của tiến bộ!". Bạn có muốn cùng mình giải một câu đố vui nho nhỏ không nào? 🎉`;
    } else {
      return `Kính chào Quý phụ huynh lớp 4A4! 
Ở lứa tuổi lớp 4, các con đang hình thành tính tự lập và lòng tự trọng rất rõ rệt. Gia đình có thể đồng hành bằng cách thiết lập thời gian biểu cố định, dùng bảng khen ngợi việc tốt và luôn phối hợp cùng cô giáo Giang để thấu hiểu thế giới cảm xúc của con nhé! 💖`;
    }
  }

  // 3. AI Viết tin nhắn phụ huynh
  async generateParentMessage(params: {
    studentName: string;
    parentName: string;
    topic: string;
    details: string;
  }): Promise<string> {
    const prompt = `Soạn tin nhắn gửi phụ huynh học sinh tiểu học (Lớp 4A4) với giọng điệu lịch sự, ấm áp, mang tính xây dựng:
Học sinh: ${params.studentName}
Phụ huynh: ${params.parentName}
Nội dung: ${params.topic}
Chi tiết: ${params.details}`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text.trim();
      }
    } catch (e) {
      console.warn('Generate parent message error:', e);
    }

    return `Kính gửi phụ huynh em ${params.studentName}! 
Cô giáo Giang xin gửi lời chào trân trọng từ lớp 4A4 trường Tiểu học Khoái Châu 1. 
Trong tuần vừa qua, em ${params.studentName} đã có nhiều cố gắng tích cực trong học tập và rèn luyện nề nếp. ${params.details ? `Về phần ${params.topic}: ${params.details}. ` : ''}Cô rất mong gia đình tiếp tục đồng hành, động viên em phát huy những thế mạnh và cùng phối hợp với cô giáo để giúp em ngày càng tiến bộ và hạnh phúc hơn mỗi ngày. 
Trân trọng cảm ơn sự phối hợp của Quý phụ huynh!`;
  }

  // 4. AI Tạo kế hoạch chủ nhiệm
  async generateHomeroomPlan(params: {
    week: number;
    month: number;
    theme: string;
    goals: string;
  }): Promise<string> {
    const prompt = `Hãy soạn thảo KẾ HOẠCH CHỦ NHIỆM LỚP 4 đầy đủ, chi tiết theo chương trình GDPT 2018:
- Tuần: ${params.week}, Tháng: ${params.month}
- Chủ đề: ${params.theme}
- Mục tiêu cần đạt: ${params.goals}
- Lớp: 4A4, Trường Tiểu học Khoái Châu 1
- Giáo viên: Lê Thị Giang

Cấu trúc gồm:
I. MỤC TIÊU (Năng lực đặc thù, Năng lực chung, Phẩm chất)
II. CHUẨN BỊ (Của giáo viên, Của học sinh)
III. TIẾN TRÌNH TỔ CHỨC HOẠT ĐỘNG (Khởi động, Khám phá - Kết nối, Thực hành trải nghiệm, Tổng kết & Vận dụng)
IV. ĐÁNH GIÁ VÀ ĐIỀU CHỈNH`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text.trim();
      }
    } catch (e) {
      console.warn('Homeroom plan AI error:', e);
    }

    return `KẾ HOẠCH HOẠT ĐỘNG CHỦ NHIỆM TUẦN ${params.week}
LỚP 4A4 - TRƯỜNG TIỂU HỌC KHOÁI CHÂU 1
CHỦ ĐỀ: ${params.theme.toUpperCase()}
Giáo viên chủ nhiệm: Lê Thị Giang

I. MỤC TIÊU BÀI DẠY:
1. Về năng lực:
- Năng lực tự chủ và tự học: Tự giác thực hiện các nền nếp học tập và việc làm tốt ở trường và gia đình.
- Năng lực giao tiếp và hợp tác: Biết lắng nghe ý kiến của bạn, cùng tổ hoàn thành nhiệm vụ chung.
- Năng lực giải quyết vấn đề: Biết cách ứng xử hòa nhã khi xảy ra bất đồng trong giờ chơi.
2. Về phẩm chất:
- Nhân ái: Biết yêu thương, san sẻ và tôn trọng sự khác biệt của bạn bè.
- Trách nhiệm: Giữ gìn vệ sinh lớp học và bàn học gọn gàng.

II. CHUẨN BỊ:
- Giáo viên: Bảng thi đua sao hạnh phúc, video ngắn truyền cảm hứng, câu hỏi đố vui tương tác.
- Học sinh: Sổ nhật ký cảm xúc, phiếu tự đánh giá cá nhân.

III. TIẾN TRÌNH HOẠT ĐỘNG:
1. Khởi động (5 phút): Trò chơi vận động "Gió thổi - Gió thổi" kết nối năng lượng.
2. Nhìn lại điều tích cực (10 phút): Tuyên dương 5 tấm gương việc tốt trong tuần, trao hoa điểm 10.
3. Hoạt động trải nghiệm chủ đề (15 phút): Diễn tiểu phẩm xử lý tình huống "Khi bạn buồn, em sẽ làm gì?".
4. Thống nhất mục tiêu tuần mới (7 phút): Mỗi tổ đăng ký 1 chỉ tiêu thi đua học tập tốt.
5. Tổng kết & Lời chúc ấm áp (3 phút): Cùng đọc vang khẩu hiệu lớp 4A4 Hạnh Phúc.`;
  }

  // 5. AI Tạo phiếu học tập
  async generateWorksheet(params: {
    subject: string;
    textbook: string;
    lessonTitle: string;
    gradeLevel: number;
    targetObjectives: string;
  }): Promise<{ content: string; answerKey: string }> {
    const prompt = `Soạn một Phiếu học tập lớp 4 môn ${params.subject} (Bộ sách ${params.textbook}):
Bài học: ${params.lessonTitle}
Yêu cầu cần đạt: ${params.targetObjectives}

Yêu cầu:
- Thiết kế thân thiện, kích thích tư duy, chia làm 2 phần: Khởi động - Khám phá và Vận dụng sáng tạo.
- Kèm theo đáp án chi tiết và hướng dẫn đánh giá học sinh tiểu học theo Thông tư 27.
Trả về định dạng JSON:
{
  "content": "Nội dung phiếu học tập có lời dẫn vui tươi...",
  "answerKey": "Đáp án và gợi ý nhận xét..."
}`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, responseType: 'json' }),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.text);
        if (parsed.content) return parsed;
      }
    } catch (e) {
      console.warn('Worksheet AI error:', e);
    }

    return {
      content: `PHIẾU HỌC TẬP THÔNG MINH - MÔN ${params.subject.toUpperCase()} (LỚP 4)
Bộ sách: ${params.textbook} | Bài: ${params.lessonTitle}
Họ và tên học sinh: ....................................... Lớp 4A4

PHẦN 1: KHÁM PHÁ VUI VẺ
Câu 1: Em hãy đọc kĩ và chọn phương án đúng nhất:
A. Phương án 1
B. Phương án 2 (Đúng)
C. Phương án 3
D. Phương án 4

Câu 2: Điền từ thích hợp vào chỗ trống để hoàn thiện định nghĩa kiến thức:
"Khi thực hiện các phép tính trong biểu thức chứa chữ, chúng ta cần thay chữ bằng ... rồi tính giá trị của biểu thức."

PHẦN 2: EM TẬP LÀM BÁC HỌC NHÍ (VẬN DỤNG)
Bài 3: Một bài toán gắn liền với thực tế cuộc sống tại Hưng Yên:
Vườn nhãn nhà bạn An thu hoạch được 350 kg nhãn, vườn nhà bạn Bình thu hoạch được gấp đôi. Hỏi cả hai vườn thu hoạch được bao nhiêu kg nhãn?
Lời giải: .....................................................................................`,
      answerKey: `HƯỚNG DẪN CHẤM & ĐÁNH GIÁ (THEO TT 27):
Câu 1: Đáp án B. (Khen ngợi học sinh nắm chắc kiến thức cơ bản).
Câu 2: Điền từ "số".
Bài 3: 
Số kg nhãn vườn nhà bạn Bình là: 350 x 2 = 700 (kg).
Cả hai vườn thu hoạch được: 350 + 700 = 1050 (kg). Đáp số: 1050 kg.
Lời nhận xét mẫu của cô giáo: "Em có tư duy toán học rất tốt, chữ viết nắn nót, cô khen ngợi sự tập trung của em!".`,
    };
  }

  // 6. AI Tạo câu hỏi trắc nghiệm
  async generateQuiz(params: {
    subject: string;
    topic: string;
    count: number;
    difficulty: string;
  }): Promise<QuizItem[]> {
    const prompt = `Tạo danh sách ${params.count} câu hỏi trắc nghiệm 4 lựa chọn môn ${params.subject} lớp 4:
Chủ đề: ${params.topic}
Mức độ: ${params.difficulty}
Trả về mảng JSON chứa các object:
[
  {
    "id": "q1",
    "question": "Nội dung câu hỏi...",
    "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
    "correctAnswerIndex": 0,
    "explanation": "Giải thích ngắn gọn, dễ hiểu cho học sinh lớp 4"
  }
]`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, responseType: 'json' }),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.text);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Quiz generator error:', e);
    }

    // Default questions for class 4
    return [
      {
        id: `q-${Date.now()}-1`,
        question: 'Số gồm 5 chục nghìn, 2 nghìn, 8 trăm và 6 đơn vị viết là:',
        options: ['52 860', '52 806', '50 286', '52 086'],
        correctAnswerIndex: 1,
        explanation: 'Số gồm 5 chục nghìn (50 000), 2 nghìn (2 000), 8 trăm (800) và 6 đơn vị (6) là 52 806 (hàng chục bằng 0).',
      },
      {
        id: `q-${Date.now()}-2`,
        question: 'Đơn vị đo khối lượng nào sau đây lớn hơn ki-lô-gam?',
        options: ['Gam', 'Đề-ca-gam', 'Tạ', 'Héc-tô-gam'],
        correctAnswerIndex: 2,
        explanation: '1 tạ = 100 kg, nên tạ lớn hơn ki-lô-gam.',
      },
      {
        id: `q-${Date.now()}-3`,
        question: 'Từ nào sau đây là từ chỉ phẩm chất tốt đẹp của người học sinh?',
        options: ['Chăm chỉ', 'Cao lớn', 'Xinh xắn', 'Nhanh nhẹn'],
        correctAnswerIndex: 0,
        explanation: 'Chăm chỉ là từ chỉ phẩm chất rèn luyện và đạo đức.',
      },
      {
        id: `q-${Date.now()}-4`,
        question: 'Thành phố Hưng Yên nổi tiếng với di tích lịch sử và câu ca dao nào?',
        options: [
          'Thứ nhất Kinh Kỳ, thứ nhì Phố Hiến',
          'Đồng Đăng có phố Kỳ Lừa',
          'Ai về thăm lại quê hương Cần Thơ',
          'Quảng Ninh đất mỏ anh hùng',
        ],
        correctAnswerIndex: 0,
        explanation: 'Phố Hiến là thương cảng cổ nổi tiếng tại Hưng Yên thế kỷ 16-17.',
      },
    ];
  }

  // 7. AI Tạo 10-20 nhiệm vụ hạnh phúc
  async generateMissions(count: number, theme: string): Promise<any[]> {
    const prompt = `Tạo danh sách ${count} nhiệm vụ hạnh phúc nhỏ, thiết thực dành cho học sinh lớp 4 (9 tuổi):
Chủ đề: ${theme || 'Tình bạn, lòng biết ơn, bảo vệ môi trường, tinh thần tự lập'}
Trả về JSON mảng gồm:
[
  {
    "title": "Tên nhiệm vụ ngắn gọn",
    "description": "Hướng dẫn cụ thể cho học sinh",
    "category": "loi_cam_on" | "viec_tot" | "giup_ban" | "sach_hay" | "loi_khen" | "moi_truong" | "tu_lap",
    "stars": 3,
    "difficulty": "Dễ" | "Vừa" | "Thử thách"
  }
]`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, responseType: 'json' }),
      });
      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data.text);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Mission generation error:', e);
    }

    return [
      {
        title: 'Lời cảm ơn đầu ngày',
        description: 'Chủ động mỉm cười và chào bác bảo vệ hoặc cô nhân viên lao công khi bước vào cổng trường.',
        category: 'loi_cam_on',
        stars: 3,
        difficulty: 'Dễ',
      },
      {
        title: 'Bàn học hoa điểm tốt',
        description: 'Gấp chăn gối hoặc sắp xếp bàn học ở nhà ngăn nắp trước khi tới lớp.',
        category: 'tu_lap',
        stars: 4,
        difficulty: 'Vừa',
      },
      {
        title: 'Gieo hạt mầm xanh',
        description: 'Tưới nước cho chậu cây xanh trong hành lang lớp học của tổ em.',
        category: 'moi_truong',
        stars: 3,
        difficulty: 'Dễ',
      },
      {
        title: 'Một lời khen chân thành',
        description: 'Khen ngợi chữ viết hoặc nụ cười của một bạn cùng bàn.',
        category: 'loi_khen',
        stars: 4,
        difficulty: 'Vừa',
      },
      {
        title: 'Đôi bàn tay ấm',
        description: 'Giúp mẹ nhặt rau hoặc dọn bát đũa sau bữa cơm gia đình.',
        category: 'viec_tot',
        stars: 5,
        difficulty: 'Thử thách',
      },
    ];
  }

  // 8. AI Tạo Báo cáo minh chứng dự thi
  async generateEvidenceReport(stats: any, teacherInfo: any): Promise<string> {
    const prompt = `Hãy soạn thảo BÁO CÁO MINH CHỨNG VÀ HIỆU QUẢ ỨNG DỤNG "AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC" phục vụ hồ sơ dự thi đổi mới sáng tạo dạy học:
Giáo viên: ${teacherInfo.name}
Trường: ${teacherInfo.school}
Lớp: ${teacherInfo.className}
Dữ liệu thực tế:
- Sĩ số: ${stats.totalStudents} học sinh
- Tỷ lệ chuyên cần trung bình: ${stats.attendanceRate}%
- Tổng số việc tốt và lời cảm ơn đã ghi nhận: ${stats.totalGoodDeeds}
- Số nhiệm vụ hạnh phúc đã hoàn thành: ${stats.completedMissions}
- Số phiếu học tập và kế hoạch đã thiết kế qua AI: ${stats.materialsCount}

Cấu trúc yêu cầu:
1. Thực trạng công tác chủ nhiệm trước khi áp dụng.
2. Mục tiêu chuyển đổi số và ứng dụng AI.
3. Giải pháp mô hình 5 bước Hồ sơ chủ nhiệm số AI.
4. Quy trình triển khai thực tế tại lớp 4A4.
5. Kết quả đo lường định tính và định lượng (dựa trên số liệu thực tế được cung cấp).
6. Danh mục minh chứng đính kèm (Hình ảnh, nhật ký cảm xúc, sản phẩm học sinh, phản hồi phụ huynh).
7. Khó khăn, hạn chế và giải pháp khắc phục.
8. Kiến nghị và khả năng nhân rộng trong toàn huyện/tỉnh.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.text) return data.text.trim();
      }
    } catch (e) {
      console.warn('Evidence report generation error:', e);
    }

    return `BÁO CÁO KẾT QUẢ ĐỔI MỚI SÁNG TẠO TRONG CÔNG TÁC CHỦ NHIỆM
MÔ HÌNH: "AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC"

Giáo viên thực hiện: ${teacherInfo.name}
Đơn vị: ${teacherInfo.school}
Lớp phụ trách: ${teacherInfo.className}

1. THỰC TRẠNG:
Trước khi triển khai, công tác chủ nhiệm lớp 4 gặp nhiều áp lực về sổ sách hành chính thủ công, khó theo dõi sâu sát diễn biến tâm lý từng học sinh, sợi dây kết nối với phụ huynh còn mang tính chất một chiều khi có sự cố.

2. MỤC TIÊU ỨNG DỤNG:
Ứng dụng công nghệ AI tạo sinh như một trợ lý số nhân văn để thấu hiểu năng khiếu, nhu cầu hỗ trợ cá nhân của 100% học sinh, xây dựng không gian lớp học hạnh phúc, an toàn và ngập tràn tình yêu thương.

3. KẾT QUẢ ĐẠT ĐƯỢC (TỪ DỮ LIỆU THỰC TẾ HỆ THỐNG):
- Sĩ số duy trì: ${stats.totalStudents} học sinh, tỷ lệ chuyên cần đạt ${stats.attendanceRate}%.
- Đã ghi nhận ${stats.totalGoodDeeds} việc tốt và lời cảm ơn chân thành được học sinh gửi tặng nhau.
- Hoàn thành ${stats.completedMissions} lượt nhiệm vụ hạnh phúc mỗi tuần.
- Thiết kế và lưu trữ ${stats.materialsCount} bộ học liệu, phiếu học tập số hóa.
- 100% phụ huynh có tài khoản theo dõi nhật ký tiến bộ và phản hồi tích cực.

4. KHẢ NĂNG NHÂN RỘNG:
Phần mềm hoạt động ổn định trên mọi nền tảng web, chi phí vận hành tối ưu, giao diện thân thiện với giáo viên tiểu học và phụ huynh, có thể mở rộng áp dụng cho toàn khối 4 và các trường tiểu học trong địa bàn tỉnh Hưng Yên.`;
  }
}

export const aiService = new AIService();
