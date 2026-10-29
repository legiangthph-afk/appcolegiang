import React, { useState } from 'react';
import {
  Sparkles,
  HeartHandshake,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  Send,
  Volume2,
  BookmarkPlus,
  Compass,
  Smile,
  BookMarked,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';

export const AIAssistantCare: React.FC = () => {
  const { students, awardStar } = useApp();

  const [aiPrompt, setAiPrompt] = useState(
    'Hãy giúp tôi xây dựng phương án động viên học sinh còn rụt rè khi phát biểu trong tiết học Toán lớp 4.'
  );
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Classroom quick tracker states (nề nếp tích cực)
  const [selectedStudentForTrack, setSelectedStudentForTrack] = useState(students[0]?.id || '');
  const [trackCategory, setTrackCategory] = useState<'dodung' | 'noiquy' | 'hoptac' | 'viectot'>('viectot');
  const [trackNote, setTrackNote] = useState('');
  const [trackHistory, setTrackHistory] = useState([
    {
      id: 'th-1',
      studentName: 'Trần Mai Phương',
      category: 'Việc tốt',
      note: 'Chủ động cho bạn mượn bút chì và thước kẻ trong giờ Mỹ thuật.',
      time: '08:45 Hôm nay',
      stars: 2,
    },
    {
      id: 'th-2',
      studentName: 'Lê Hoàng Nam',
      category: 'Tinh thần hợp tác',
      note: 'Tích cực hỗ trợ các bạn tổ 1 thảo luận bài tập nhóm môn Khoa học.',
      time: '09:30 Hôm nay',
      stars: 2,
    },
  ]);

  const presetTopics = [
    'Phương án động viên học sinh còn rụt rè khi phát biểu',
    'Giải pháp hỗ trợ học sinh khó hòa nhập với bạn mới',
    'Biện pháp rèn nề nếp tự giác chuẩn bị đồ dùng học tập',
    'Xây dựng tinh thần đoàn kết, không trêu chọc bạn trong giờ ra chơi',
    'Kỹ năng phối hợp với phụ huynh khi trẻ có biểu hiện xao nhãng',
    'Giáo dục hành vi tích cực bằng lời khen quá trình (Growth Mindset)',
  ];

  const handleAskAI = async (customQuestion?: string) => {
    const question = customQuestion || aiPrompt;
    if (!question.trim()) return;

    setIsGenerating(true);
    speechService.playGentleDing();

    try {
      const systemInstruction = `Bạn là chuyên gia sư phạm tiểu học và tâm lý học đường Việt Nam, là trợ lý số đáng tin cậy của cô giáo chủ nhiệm lớp 4.
Nguyên tắc bất di bất dịch:
- Tuyệt đối không gắn nhãn tiêu cực (không gọi trẻ là "cá biệt", "chậm tiến", "lười biếng").
- Luôn đưa ra các giải pháp giáo dục tích cực, tôn trọng nhân phẩm và cảm xúc của trẻ.
- Đưa ra 3-4 bước thực hiện cụ thể, dễ áp dụng trong thực tế lớp học lớp 4.`;

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: question, systemInstruction }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.text);
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Pedagogical guidance fallback
      setAiResponse(`HƯỚNG DẪN SƯ PHẠM TÍCH CỰC CHO CÔ GIÁO:

1. Kỹ thuật "Khởi động cặp đôi" (Think - Pair - Share):
Trước khi yêu cầu học sinh phát biểu cá nhân trước toàn thể lớp, hãy cho em trao đổi ý kiến với bạn cùng bàn trong 1 phút. Khi có sự đồng thuận từ bạn, trẻ sẽ giảm 80% cảm giác lo âu.

2. Sử dụng "Lời khen ghi nhận nỗ lực":
Thay vì chỉ khen câu trả lời đúng, hãy công nhận sự can đảm: "Cô nhận thấy em đã rất tập trung suy nghĩ và dũng cảm giơ tay! Đó là phẩm chất tuyệt vời của một học sinh lớp 4A4!".

3. Giao nhiệm vụ nhỏ có thể hoàn thành ngay:
Khởi đầu bằng câu hỏi trắc nghiệm hoặc câu hỏi đóng mà em chắc chắn biết, sau đó tăng dần độ mở của câu hỏi.

4. Trao sao hạnh phúc khích lệ:
Tặng ngay 2 Ngôi sao hạnh phúc vào bảng thi đua để khẳng định sự tiến bộ của em.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentForTrack);
    if (!st) return;

    const catNameMap = {
      dodung: 'Đồ dùng học tập',
      noiquy: 'Nội quy gương mẫu',
      hoptac: 'Tinh thần hợp tác',
      viectot: 'Việc tốt',
    };

    const newRecord = {
      id: `th-${Date.now()}`,
      studentName: st.fullName,
      category: catNameMap[trackCategory],
      note: trackNote || 'Thực hiện tốt nề nếp',
      time: 'Vừa xong',
      stars: 2,
    };

    setTrackHistory((prev) => [newRecord, ...prev]);
    awardStar(st.id, 2);
    speechService.playSuccessSound();
    setTrackNote('');
    alert(`Đã ghi nhận nề nếp tích cực và tặng 2 sao cho em ${st.fullName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">🛡️</span>
            <h2 className="text-2xl font-bold font-heading">AI Hỗ Trợ Quản Lý & Chăm Sóc Học Sinh</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl">
            Tư vấn giải pháp sư phạm tích cực, không bêu tên hay dán nhãn tiêu cực, kiến tạo môi trường học tập an toàn và yêu thương.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trợ lý AI Chủ nhiệm (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-base">Trợ Lý AI Chủ Nhiệm – Tư Vấn Sư Phạm</h3>
          </div>

          {/* Quick topic buttons */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 block">Chủ đề thường gặp:</span>
            <div className="flex flex-wrap gap-1.5">
              {presetTopics.map((top, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiPrompt(top);
                    handleAskAI(top);
                  }}
                  className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-lg text-xs font-medium border border-sky-100 transition-all text-left"
                >
                  💡 {top}
                </button>
              ))}
            </div>
          </div>

          {/* Query input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Tình huống sư phạm cần giải pháp:</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Nhập tình huống lớp học (ví dụ: Làm thế nào để các bạn trong tổ 2 hòa giải và hợp tác tốt hơn?)..."
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 italic">
                * AI không thay thế quyết định của cô giáo, mọi phương án đều tôn trọng trẻ em.
              </span>
              <button
                onClick={() => handleAskAI()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? 'AI Đang Tư Vấn...' : 'Hỏi Trợ Lý AI'}
              </button>
            </div>
          </div>

          {/* AI Response Output */}
          {aiResponse && (
            <div className="p-5 bg-gradient-to-br from-sky-50 via-indigo-50/40 to-white rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Giải pháp sư phạm tích cực khuyến nghị:
                </span>
                <button
                  onClick={() => speechService.speak(aiResponse)}
                  className="p-1.5 text-sky-600 hover:bg-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Volume2 className="w-4 h-4" /> Nghe đọc
                </button>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Ghi nhận nề nếp & Việc tốt tích cực (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Ghi Nhận Nề Nếp & Việc Tốt Tích Cực</h3>
          </div>

          <form onSubmit={handleSaveTrack} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Chọn học sinh:</label>
              <select
                value={selectedStudentForTrack}
                onChange={(e) => setSelectedStudentForTrack(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.fullName} (Tổ {s.groupNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tiêu chí ghi nhận:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'viectot', label: '🌸 Việc tốt giúp bạn' },
                  { id: 'hoptac', label: '🤝 Tinh thần hợp tác' },
                  { id: 'dodung', label: '📚 Đồ dùng đầy đủ' },
                  { id: 'noiquy', label: '⭐ Nội quy gương mẫu' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTrackCategory(item.id as any)}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      trackCategory === item.id
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Ghi chú cụ thể:</label>
              <input
                type="text"
                value={trackNote}
                onChange={(e) => setTrackNote(e.target.value)}
                placeholder="Ví dụ: Giúp bạn kê lại bàn ghế sau giờ ăn trưa..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Ghi nhận & Tặng 2 Sao Hạnh Phúc
            </button>
          </form>

          {/* History */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Nhật ký vừa ghi nhận:</span>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {trackHistory.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{rec.studentName}</span>
                    <span className="text-emerald-600">+{rec.stars} ⭐</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">{rec.note}</div>
                  <div className="text-slate-400 text-[10px] mt-1">{rec.time} • {rec.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
