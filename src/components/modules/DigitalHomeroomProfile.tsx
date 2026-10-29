import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Star,
  Award,
  Heart,
  TrendingUp,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Shield,
  MessageSquare,
  Smile,
  Send,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';

export const DigitalHomeroomProfile: React.FC = () => {
  const {
    students,
    teacherProfile,
    missions,
    emotionLogs,
    surveys,
    parentMessages,
    sendParentMessage,
    awardStar,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeStep, setActiveStep] = useState<number>(2); // Default to Step 2: Hồ sơ chi tiết
  const [personalTaskInput, setPersonalTaskInput] = useState('');
  const [newPersonalTasks, setNewPersonalTasks] = useState<string[]>([]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const survey = surveys.find((s) => s.studentId === selectedStudent?.id);
  const studentEmotions = emotionLogs.filter((e) => e.studentId === selectedStudent?.id);
  const studentMessages = parentMessages.filter((m) => m.studentId === selectedStudent?.id);

  const steps = [
    { num: 1, title: 'Khảo sát AI đầu năm', desc: 'Thu thập sở thích, năng lực' },
    { num: 2, title: 'Hồ sơ học sinh số', desc: 'Mã định danh, thế mạnh, tổ' },
    { num: 3, title: 'Nhiệm vụ cá nhân hóa', desc: 'AI gợi ý nhiệm vụ vừa sức' },
    { num: 4, title: 'Kết nối phụ huynh', desc: 'Trao đổi, động viên gia đình' },
    { num: 5, title: 'Tiến bộ & Cảm xúc', desc: 'Nhật ký theo dõi đa chiều' },
  ];

  const handlePrint = () => {
    speechService.playGentleDing();
    window.print();
  };

  const handleAddPersonalTask = () => {
    if (!personalTaskInput.trim()) return;
    setNewPersonalTasks((prev) => [...prev, personalTaskInput.trim()]);
    setPersonalTaskInput('');
    speechService.playGentleDing();
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-700 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">📁</span>
            <h2 className="text-2xl font-bold font-heading">Hồ Sơ Chủ Nhiệm Số AI Lớp 4A4</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl">
            Mô hình chuyển đổi số trung tâm 5 bước đồng hành toàn diện, giảm tải giấy tờ, bảo mật thông tin và nâng cao chất lượng giáo dục tiểu học.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-900 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 border border-sky-200"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            XUẤT HỒ SƠ CHỦ NHIỆM SỐ
          </button>
        </div>
      </div>

      {/* 5-Step Model Progression Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map((st) => (
          <button
            key={st.num}
            onClick={() => setActiveStep(st.num)}
            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
              activeStep === st.num
                ? 'bg-sky-600 text-white border-sky-700 shadow-md scale-102'
                : 'bg-white hover:bg-sky-50/70 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                  activeStep === st.num ? 'bg-white text-sky-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {st.num}
              </span>
              {activeStep === st.num && <Sparkles className="w-4 h-4 text-amber-300" />}
            </div>
            <div className="font-bold text-xs leading-snug">{st.title}</div>
            <div
              className={`text-[10px] mt-0.5 line-clamp-1 ${
                activeStep === st.num ? 'text-sky-100' : 'text-slate-400'
              }`}
            >
              {st.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Student Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-black flex items-center justify-center text-sm">
            {selectedStudent?.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <span>{selectedStudent?.fullName}</span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {selectedStudent?.code}
              </span>
              <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                Tổ {selectedStudent?.groupNumber}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Phụ huynh: {selectedStudent?.parentName} • SĐT: {selectedStudent?.parentPhone}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Xem học sinh khác:</label>
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

      {/* STEP CONTENT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 min-h-[460px]">
        {/* STEP 1: KHẢO SÁT ĐẦU NĂM BẰNG AI */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-600" />
                Bước 1: Kết Quả Khảo Sát Thấu Hiểu Đầu Năm của {selectedStudent?.fullName}
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                Đã thu thập & Phân tích
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100">
                <span className="text-xs font-bold text-sky-800 block mb-1">🎨 Sở thích & Hứng thú:</span>
                <p className="text-xs text-slate-700">
                  {survey?.answers.interests?.join(', ') || 'Giải đố Toán, Đọc truyện khoa học, Lắp ráp Lego.'}
                </p>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-xs font-bold text-emerald-800 block mb-1">🌟 Điểm mạnh tự đánh giá:</span>
                <p className="text-xs text-slate-700">
                  {survey?.answers.strengths?.join(', ') || 'Tư duy logic nhạy bén, nhớ bài tốt, thích giúp bạn.'}
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
                <span className="text-xs font-bold text-amber-800 block mb-1">🌱 Mong muốn cải thiện:</span>
                <p className="text-xs text-slate-700">
                  {survey?.answers.improvementGoals?.join(', ') || 'Nói to rõ hơn khi đứng trước lớp.'}
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
                <span className="text-xs font-bold text-purple-800 block mb-1">💌 Nhu cầu cô giáo hỗ trợ:</span>
                <p className="text-xs text-slate-700">
                  {survey?.answers.teacherSupportNeed || 'Mong cô gọi em phát biểu nhiều hơn để em bớt rụt rè.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: HỒ SƠ HỌC SINH SỐ CHI TIẾT */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                Bước 2: Hồ Sơ Cá Nhân Số Hóa Toàn Diện
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {selectedStudent?.starsCount} Sao tích lũy
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1: Basic Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Thông tin cơ bản</h4>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <div><strong>Mã HS:</strong> {selectedStudent?.code}</div>
                  <div><strong>Họ và tên:</strong> {selectedStudent?.fullName}</div>
                  <div><strong>Giới tính:</strong> {selectedStudent?.gender}</div>
                  <div><strong>Ngày sinh:</strong> {selectedStudent?.dob}</div>
                  <div><strong>Tổ:</strong> Tổ {selectedStudent?.groupNumber}</div>
                  <div><strong>Địa chỉ:</strong> {selectedStudent?.address}</div>
                </div>
              </div>

              {/* Col 2: Goals & Strengths */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Năng lực & Mục tiêu</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-emerald-700 block">Điểm mạnh:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStudent?.strengths.map((str, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                          {str}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-amber-700 block">Khó khăn cần hỗ trợ:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedStudent?.supportNeeds.map((nd, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                          {nd}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Teacher's Assessment & Badges */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Nhận xét & Danh hiệu</h4>
                <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200">
                  "{selectedStudent?.teacherNotes || 'Học sinh chăm ngoan, có ý thức rèn luyện tốt.'}"
                </p>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">Huy hiệu đã đạt:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent?.badges.map((b, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold">
                        🏆 {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: NHIỆM VỤ CÁ NHÂN HÓA */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-600" />
                Bước 3: Nhiệm Vụ Rèn Luyện Cá Nhân Hóa (AI Gợi Ý)
              </h3>
              <span className="text-xs text-sky-600 font-bold bg-sky-50 px-3 py-1 rounded-full">
                Phù hợp năng lực học sinh
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Đọc sách 15 phút mỗi ngày',
                  desc: 'Mở rộng vốn từ ngữ và rèn tính kiên nhẫn',
                  stars: 4,
                  tag: 'Phát triển tư duy',
                },
                {
                  title: 'Mạnh dạn phát biểu 1 lần/ngày',
                  desc: 'Giải tỏa sự e dè, tự tin trước bạn bè',
                  stars: 5,
                  tag: 'Rèn sự tự tin',
                },
                {
                  title: 'Giúp đỡ 1 bạn trong tổ',
                  desc: 'Cùng bạn hướng dẫn bài tập hoặc nhặt đồ dùng',
                  stars: 3,
                  tag: 'Tinh thần tương thân',
                },
              ].map((task, idx) => (
                <div key={idx} className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded">
                        {task.tag}
                      </span>
                      <span className="text-amber-500 font-bold text-xs flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> +{task.stars} sao
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{task.title}</h4>
                    <p className="text-xs text-slate-500">{task.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      awardStar(selectedStudent.id, task.stars);
                      speechService.playSuccessSound();
                      alert(`Đã ghi nhận hoàn thành nhiệm vụ và cộng ${task.stars} sao cho em ${selectedStudent.fullName}!`);
                    }}
                    className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Đánh dấu hoàn thành
                  </button>
                </div>
              ))}
            </div>

            {/* Custom add task */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex gap-2">
              <input
                type="text"
                value={personalTaskInput}
                onChange={(e) => setPersonalTaskInput(e.target.value)}
                placeholder="Cô giao thêm nhiệm vụ cá nhân riêng cho em..."
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs"
              />
              <button
                onClick={handleAddPersonalTask}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs hover:bg-sky-700"
              >
                Giao nhiệm vụ
              </button>
            </div>

            {newPersonalTasks.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600">Nhiệm vụ cô vừa giao thêm:</span>
                {newPersonalTasks.map((t, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-semibold flex items-center justify-between">
                    <span>📌 {t}</span>
                    <span className="text-emerald-600 text-xs font-bold">Đang thực hiện</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: KẾT NỐI PHỤ HUYNH */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                Bước 4: Cầu Nối Phối Hợp Gia Đình & Cô Giáo
              </h3>
              <span className="text-xs text-slate-500">
                Phụ huynh: <strong>{selectedStudent?.parentName}</strong> ({selectedStudent?.parentPhone})
              </span>
            </div>

            <div className="space-y-4">
              {studentMessages.length > 0 ? (
                studentMessages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-sky-800">Cô giáo Lê Thị Giang gửi gia đình:</span>
                      <span className="text-slate-400">{msg.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{msg.content}</p>
                    {msg.parentFeedback && (
                      <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                        <strong className="text-sky-700">Phụ huynh phản hồi:</strong> {msg.parentFeedback}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Chưa có tin nhắn nào được lưu riêng cho em. Cô có thể vào Phân hệ 5 để soạn tin nhắn AI.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: TIẾN BỘ VÀ CẢM XÚC */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Bước 5: Theo Dõi Diễn Biến Cảm Xúc & Lịch Sử Tiến Bộ
              </h3>
              <span className="text-xs bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-full border border-rose-200">
                Lớp học hạnh phúc
              </span>
            </div>

            <div className="space-y-3">
              {studentEmotions.length > 0 ? (
                studentEmotions.map((emo) => (
                  <div key={emo.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <span className="text-2xl">
                      {emo.emotion === 'happy' && '😊'}
                      {emo.emotion === 'peaceful' && '😌'}
                      {emo.emotion === 'worried' && '😟'}
                      {emo.emotion === 'sad' && '😢'}
                      {emo.emotion === 'tired' && '😴'}
                      {emo.emotion === 'grateful' && '❤️'}
                    </span>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {emo.emotion === 'happy' && 'Vui vẻ hào hứng'}
                          {emo.emotion === 'peaceful' && 'Bình yên nhẹ nhàng'}
                          {emo.emotion === 'worried' && 'Hơi lo lắng'}
                          {emo.emotion === 'sad' && 'Buồn bã'}
                          {emo.emotion === 'tired' && 'Mệt mỏi'}
                          {emo.emotion === 'grateful' && 'Biết ơn'}
                        </span>
                        <span className="text-slate-400 text-[10px]">{emo.timestamp}</span>
                      </div>
                      <p className="text-slate-700 mt-1 italic">"{emo.note}"</p>
                      {emo.aiResponse && (
                        <div className="mt-2 text-sky-800 bg-sky-50 p-2 rounded-lg text-[11px] border border-sky-100">
                          🤖 <strong>Bạn AI:</strong> {emo.aiResponse}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Chưa có nhật ký cảm xúc gần đây của học sinh này.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
