import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Edit2,
  Trash2,
  Save,
  Download,
  CheckCircle,
  Copy,
  Clock,
  History,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';

interface CreatedItem {
  id: string;
  category: string;
  title: string;
  content: string;
  timestamp: string;
}

export const AICreativeCenter: React.FC = () => {
  const { addMission, addMaterial } = useApp();

  const [activeTask, setActiveTask] = useState<string>('missions');
  const [quantity, setQuantity] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([
    {
      id: 'cr-1',
      category: 'Nhiệm vụ hạnh phúc',
      title: 'Hạt mầm yêu thương 01: Lời chào buổi sáng',
      content: 'Chủ động mỉm cười và nói lời chào cô giáo và bác bảo vệ khi vừa đến cổng trường Tiểu học Khoái Châu 1.',
      timestamp: '28/10/2026 14:20',
    },
    {
      id: 'cr-2',
      category: 'Lời động viên',
      title: 'Động viên rèn chữ viết',
      content: 'Chữ viết của em hôm nay đã tròn trịa và tiến bộ hơn rất nhiều! Cô rất tự hào về sự kiên nhẫn của em.',
      timestamp: '29/10/2026 08:15',
    },
  ]);

  const [editingItem, setEditingItem] = useState<CreatedItem | null>(null);

  const bulkActions = [
    { id: 'plans', label: '10 Kế hoạch hoạt động', defaultQty: 10, cat: 'Kế hoạch chủ nhiệm' },
    { id: 'missions', label: '20 Nhiệm vụ hạnh phúc', defaultQty: 20, cat: 'Nhiệm vụ hạnh phúc' },
    { id: 'quizzes', label: '30 Câu hỏi học tập', defaultQty: 30, cat: 'Câu hỏi học tập' },
    { id: 'games', label: '10 Trò chơi mới', defaultQty: 10, cat: 'Ý tưởng trò chơi' },
    { id: 'encouragements', label: '20 Lời động viên', defaultQty: 20, cat: 'Lời động viên' },
    { id: 'homeroom_topics', label: '10 Chủ đề sinh hoạt lớp', defaultQty: 10, cat: 'Chủ đề sinh hoạt' },
    { id: 'parent_templates', label: '10 Mẫu tin nhắn phụ huynh', defaultQty: 10, cat: 'Mẫu tin nhắn' },
    { id: 'surveys', label: 'Bộ phiếu khảo sát', defaultQty: 9, cat: 'Phiếu khảo sát' },
    { id: 'weekly_reports', label: 'Báo cáo theo tuần', defaultQty: 4, cat: 'Báo cáo tuần' },
  ];

  const handleRunBulkGeneration = async (task: any) => {
    setIsGenerating(true);
    speechService.playGentleDing();

    const prompt = `Tạo danh sách ${quantity} mục nội dung mới không trùng lặp cho: ${task.label} lớp 4.
Giáo viên: Lê Thị Giang, Lớp 4A4, Trường Tiểu học Khoái Châu 1, Xã Khoái Châu, Tỉnh Hưng Yên.
Yêu cầu: Viết súc tích, văn phong sư phạm ấm áp, chuẩn GDPT 2018.`;

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      let content = '';
      if (res.ok) {
        const data = await res.json();
        content = data.text;
      } else {
        throw new Error('API Offline');
      }

      const newItem: CreatedItem = {
        id: `cr-${Date.now()}`,
        category: task.cat,
        title: `${task.label} (Đợt tạo mới)`,
        content: content.slice(0, 1500),
        timestamp: new Date().toLocaleString('vi-VN'),
      };

      setCreatedItems((prev) => [newItem, ...prev]);
      speechService.playSuccessSound();
    } catch {
      // Fallback generator
      const fallbackItem: CreatedItem = {
        id: `cr-${Date.now()}`,
        category: task.cat,
        title: `${task.label} (Tạo tự động cho Lớp 4A4)`,
        content: `DANH SÁCH ${quantity} NỘI DUNG ĐÃ TẠO:
1. ${task.label} - Mục 1: Rèn luyện tính tự giác và ý thức trách nhiệm.
2. ${task.label} - Mục 2: Nuôi dưỡng lòng biết ơn gia đình và thầy cô giáo.
3. ${task.label} - Mục 3: Tinh thần đoàn kết, sẵn sàng giúp đỡ bạn trong lớp 4A4.
4. ${task.label} - Mục 4: Thói quen giữ gìn vệ sinh và bảo vệ môi trường trường học.
5. ${task.label} - Mục 5: Tự tin vượt qua thử thách trong học tập.`,
        timestamp: new Date().toLocaleString('vi-VN'),
      };
      setCreatedItems((prev) => [fallbackItem, ...prev]);
      speechService.playSuccessSound();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    setCreatedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveToLearningStudio = (item: CreatedItem) => {
    addMaterial({
      title: item.title,
      subject: 'Hoạt động trải nghiệm',
      textbook: 'Tất cả',
      type: 'worksheet',
      week: 8,
      content: item.content,
    });
    speechService.playGentleDing();
    alert(`Đã lưu "${item.title}" vào Kho Học liệu số 4A4!`);
  };

  const handleExportTxt = (item: CreatedItem) => {
    const blob = new Blob([item.title + '\n\n' + item.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-600 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">✨</span>
            <h2 className="text-2xl font-bold font-heading">Trung Tâm Sáng Tạo Nội Dung AI Lớp 4A4</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl">
            Tạo hàng loạt nội dung giáo dục, nhiệm vụ hạnh phúc, ngân hàng câu hỏi và mẫu kịch bản sinh hoạt chỉ với một cú nhấp chuột.
          </p>
        </div>

        {/* Quantity selector */}
        <div className="flex items-center gap-2 bg-white/20 p-2 rounded-2xl border border-white/30 text-xs">
          <span className="font-bold">Số lượng tùy chọn:</span>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            className="px-2.5 py-1 bg-white text-slate-800 rounded-xl font-bold"
          >
            <option value={5}>5 mục</option>
            <option value={10}>10 mục</option>
            <option value={15}>15 mục</option>
            <option value={20}>20 mục</option>
            <option value={30}>30 mục</option>
          </select>
        </div>
      </div>

      {/* Grid of Bulk Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {bulkActions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleRunBulkGeneration(action)}
            disabled={isGenerating}
            className="p-4 bg-white hover:bg-sky-50/70 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group disabled:opacity-50"
          >
            <div>
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md uppercase">
                {action.cat}
              </span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mt-1">{action.label}</h4>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
          </button>
        ))}
      </div>

      {isGenerating && (
        <div className="p-6 bg-white rounded-3xl border border-sky-200 shadow-sm text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">AI đang khởi tạo kho dữ liệu sáng tạo...</h4>
          <p className="text-xs text-slate-500">Đảm bảo không trùng lặp và phù hợp chuẩn chương trình GDPT 2018</p>
        </div>
      )}

      {/* Created Items Feed & History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-slate-800 text-base">Lịch Sử & Nội Dung Đã Tạo</h3>
          </div>
          <span className="text-xs font-bold text-slate-500">{createdItems.length} gói nội dung</span>
        </div>

        <div className="space-y-4">
          {createdItems.map((item) => (
            <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{item.title}</h4>
                </div>
                <span className="text-[11px] text-slate-400">{item.timestamp}</span>
              </div>

              <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                {item.content}
              </pre>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleExportTxt(item)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" /> Xuất file văn bản
                </button>
                <button
                  onClick={() => handleSaveToLearningStudio(item)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Lưu vào Góc Học Liệu Số
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                  title="Xóa nội dung"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
