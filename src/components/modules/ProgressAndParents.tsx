import React, { useState } from 'react';
import {
  TrendingUp,
  MessageSquare,
  Users,
  Send,
  Sparkles,
  CheckCircle,
  Eye,
  Calendar,
  Filter,
  Check,
  Shield,
  Heart,
  Star,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';

export const ProgressAndParents: React.FC = () => {
  const {
    students,
    parentMessages,
    sendParentMessage,
    markParentMessageRead,
    currentSession,
    missions,
  } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  // AI Message Generator State
  const [msgTopic, setMsgTopic] = useState('Khen ngợi tinh thần tự giác học Toán và nỗ lực phát biểu');
  const [msgDetails, setMsgDetails] = useState('Tuần này em đã rất tích cực, hỗ trợ bạn cùng bàn và giơ tay 3 lần.');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'message_center'>('dashboard');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // If user role is parent, lock to their child only for privacy!
  const isParentRole = currentSession.role === 'parent';
  const effectiveStudent = isParentRole
    ? students.find((s) => s.id === currentSession.studentId) || selectedStudent
    : selectedStudent;

  // Filter messages
  const visibleMessages = isParentRole
    ? parentMessages.filter((m) => m.studentId === effectiveStudent.id)
    : parentMessages;

  // Generate Message with AI
  const handleGenerateAIMessage = async () => {
    setIsGeneratingMessage(true);
    speechService.playGentleDing();

    try {
      const msg = await aiService.generateParentMessage({
        studentName: effectiveStudent.fullName,
        parentName: effectiveStudent.parentName || 'Quý phụ huynh',
        topic: msgTopic,
        details: msgDetails,
      });
      setGeneratedMessage(msg);
      speechService.playSuccessSound();
    } catch {
      setGeneratedMessage(
        `Kính gửi phụ huynh em ${effectiveStudent.fullName}! Cô giáo Lê Thị Giang xin thông báo: Trong tuần học vừa qua, em đã rất nỗ lực rèn luyện, hòa đồng cùng bạn bè và hoàn thành tốt nhiệm vụ học tập. Kính mong gia đình tiếp tục động viên em duy trì tinh thần tự giác tại nhà nhé!`
      );
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleSendMessage = () => {
    if (!generatedMessage.trim()) return;

    sendParentMessage({
      studentId: effectiveStudent.id,
      studentName: effectiveStudent.fullName,
      parentName: effectiveStudent.parentName || 'Phụ huynh',
      content: generatedMessage,
      type: 'khen_ngoi',
    });

    speechService.playSuccessSound();
    alert(`Đã gửi tin nhắn trao đổi đến phụ huynh em ${effectiveStudent.fullName}!`);
    setGeneratedMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">📊</span>
            <h2 className="text-2xl font-bold font-heading">Theo Dõi Tiến Bộ & Kết Nối Phụ Huynh</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl">
            Bảo mật thông tin riêng tư, theo dõi sự trưởng thành của học sinh qua các biểu đồ sinh động và kết nối thông điệp tích cực cùng gia đình.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-white/20 p-1 rounded-2xl border border-white/30">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' ? 'bg-white text-sky-800 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Bảng Tiến Bộ
          </button>
          <button
            onClick={() => setActiveTab('message_center')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'message_center' ? 'bg-white text-sky-800 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> AI Viết Tin Nhắn Phụ Huynh
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Controls Filter */}
          {!isParentRole && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Xem theo tổ:</span>
                {[
                  { id: 'all', label: 'Toàn lớp' },
                  { id: 1, label: 'Tổ 1' },
                  { id: 2, label: 'Tổ 2' },
                  { id: 3, label: 'Tổ 3' },
                  { id: 4, label: 'Tổ 4' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedGroup === g.id
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Chọn học sinh:</span>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-sky-500"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Visual Progress Meters for selected student */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Biểu Đồ Tiến Bộ & Chỉ Số Rèn Luyện: {effectiveStudent.fullName}
                </h3>
                <p className="text-xs text-slate-500">Mã: {effectiveStudent.code} • Tổ {effectiveStudent.groupNumber}</p>
              </div>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" /> {effectiveStudent.starsCount} Sao tích lũy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1 */}
              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-sky-900">
                  <span>Tiến bộ học tập</span>
                  <span>92%</span>
                </div>
                <div className="w-full h-3 bg-sky-200 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full w-[92%]" />
                </div>
                <span className="text-[10px] text-slate-500 block">Hoàn thành tốt môn Toán & Tiếng Việt</span>
              </div>

              {/* Metric 2 */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                  <span>Nhiệm vụ hạnh phúc</span>
                  <span>88%</span>
                </div>
                <div className="w-full h-3 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[88%]" />
                </div>
                <span className="text-[10px] text-slate-500 block">Đã hoàn thành 5/6 nhiệm vụ tuần</span>
              </div>

              {/* Metric 3 */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                  <span>Kỹ năng hợp tác</span>
                  <span>85%</span>
                </div>
                <div className="w-full h-3 bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[85%]" />
                </div>
                <span className="text-[10px] text-slate-500 block">Biết lắng nghe và hòa đồng cùng bạn</span>
              </div>

              {/* Metric 4 */}
              <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-purple-900">
                  <span>Chuyên cần & Nề nếp</span>
                  <span>98%</span>
                </div>
                <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[98%]" />
                </div>
                <span className="text-[10px] text-slate-500 block">Đi học đúng giờ, chuẩn bị bài chu đáo</span>
              </div>
            </div>

            {/* Badges showcase */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 uppercase block mb-3">
                🏆 Bảng Danh Hiệu Đã Đạt Được:
              </span>
              <div className="flex flex-wrap gap-2">
                {effectiveStudent.badges?.map((badge, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 shadow-xs"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE CENTER TAB */}
      {activeTab === 'message_center' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: AI Generator (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-slate-800 text-base">Soạn Tin Nhắn Phụ Huynh Bằng AI</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Gửi tới phụ huynh em:</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">
                  {effectiveStudent.fullName} (Phụ huynh: {effectiveStudent.parentName || 'Gia đình'})
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nội dung chính cần trao đổi:</label>
                <input
                  type="text"
                  value={msgTopic}
                  onChange={(e) => setMsgTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Chi tiết quan sát của cô giáo:</label>
                <textarea
                  value={msgDetails}
                  onChange={(e) => setMsgDetails(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAIMessage}
                  disabled={isGeneratingMessage}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isGeneratingMessage ? 'AI Đang Soạn Tin...' : 'AI VIẾT TIN NHẮN PHỤ HUYNH'}
                </button>
              </div>

              {generatedMessage && (
                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
                  <span className="text-xs font-bold text-sky-900 block">Nội dung tin nhắn gợi ý (Cô có thể chỉnh sửa trước khi gửi):</span>
                  <textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white rounded-xl border border-sky-200 text-xs text-slate-800 leading-relaxed"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSendMessage}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Phê duyệt & Gửi tin nhắn
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Message Log (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">Hộp Thư Liên Lạc & Xác Nhận Đã Đọc</h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {visibleMessages.length > 0 ? (
                visibleMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{msg.studentName} ({msg.parentName})</span>
                      <span className="text-[10px] text-slate-400">{msg.date}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{msg.content}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[11px] flex items-center gap-1 text-emerald-600 font-bold">
                        <Check className="w-3.5 h-3.5" /> {msg.readStatus ? 'Phụ huynh đã đọc' : 'Đã gửi'}
                      </span>
                      {isParentRole && !msg.readStatus && (
                        <button
                          onClick={() => markParentMessageRead(msg.id)}
                          className="px-2.5 py-1 bg-sky-600 text-white font-bold rounded-lg text-[10px]"
                        >
                          Xác nhận đã đọc
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chưa có tin nhắn nào trong lịch sử trao đổi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
