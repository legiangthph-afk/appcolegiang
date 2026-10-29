import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileCheck,
  Gamepad2,
  Award,
  Download,
  Printer,
  Trash2,
  Search,
  CheckCircle,
  Plus,
  Volume2,
  Star,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService, QuizItem } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { InteractiveGames } from '../games/InteractiveGames';
import { LearningMaterial } from '../../types';

export const AILearningStudio: React.FC = () => {
  const { materials, addMaterial, deleteMaterial, students, awardStar } = useApp();

  const [activeTab, setActiveTab] = useState<'worksheet' | 'plan' | 'quiz' | 'games' | 'leaderboard' | 'library'>('games');

  // Worksheet Generator State
  const [wsSubject, setWsSubject] = useState<'Toán' | 'Tiếng Việt' | 'Khoa học' | 'Lịch sử và Địa lí' | 'Đạo đức' | 'Công nghệ' | 'Tin học' | 'Hoạt động trải nghiệm'>('Toán');
  const [wsTextbook, setWsTextbook] = useState<'Kết nối tri thức' | 'Cánh diều' | 'Chân trời sáng tạo'>('Kết nối tri thức');
  const [wsLesson, setWsLesson] = useState('Phép cộng và phép trừ các số có nhiều chữ số');
  const [wsOutcomes, setWsOutcomes] = useState('Học sinh thực hiện thành thạo phép tính cộng trừ có nhớ, giải bài toán thực tế gắn với nông sản Khoái Châu Hưng Yên.');
  const [isGeneratingWs, setIsGeneratingWs] = useState(false);
  const [generatedWs, setGeneratedWs] = useState<{ content: string; answerKey: string } | null>(null);

  // Plan Generator State
  const [planWeek, setPlanWeek] = useState(8);
  const [planMonth, setPlanMonth] = useState(10);
  const [planTheme, setPlanTheme] = useState('Xây dựng tình bạn diệu kỳ và nếp sống văn minh');
  const [planGoals, setPlanGoals] = useState('100% học sinh biết nói lời cảm ơn, xin lỗi và hỗ trợ bạn trong tổ.');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);

  // Quiz Generator State
  const [quizSubject, setQuizSubject] = useState('Toán');
  const [quizTopic, setQuizTopic] = useState('Tính chất giao hoán và kết hợp của phép cộng');
  const [quizCount, setQuizCount] = useState(5);
  const [quizDiff, setQuizDiff] = useState('Trung bình');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [generatedQuizList, setGeneratedQuizList] = useState<QuizItem[]>([]);

  // Library Filter
  const [librarySearch, setLibrarySearch] = useState('');

  // 1. Generate Worksheet
  const handleGenerateWorksheet = async () => {
    setIsGeneratingWs(true);
    speechService.speak('Bạn AI đang biên soạn phiếu học tập phù hợp chương trình lớp 4.');

    try {
      const res = await aiService.generateWorksheet({
        subject: wsSubject,
        textbook: wsTextbook,
        lessonTitle: wsLesson,
        gradeLevel: 4,
        targetObjectives: wsOutcomes,
      });
      setGeneratedWs(res);
      speechService.playSuccessSound();
    } catch {
      alert('Đã xảy ra lỗi khi tạo phiếu học tập.');
    } finally {
      setIsGeneratingWs(false);
    }
  };

  const handleSaveWorksheet = () => {
    if (!generatedWs) return;
    addMaterial({
      title: `Phiếu học tập: ${wsLesson} (Môn ${wsSubject} - Bộ sách ${wsTextbook})`,
      subject: wsSubject,
      textbook: wsTextbook,
      type: 'worksheet',
      week: 8,
      content: generatedWs.content,
      answerKey: generatedWs.answerKey,
    });
    speechService.playGentleDing();
    alert('Đã lưu phiếu học tập vào Góc học tập số!');
  };

  // 2. Generate Plan
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    speechService.playGentleDing();

    try {
      const plan = await aiService.generateHomeroomPlan({
        week: planWeek,
        month: planMonth,
        theme: planTheme,
        goals: planGoals,
      });
      setGeneratedPlan(plan);
      speechService.playSuccessSound();
    } catch {
      alert('Đã xảy ra lỗi khi tạo kế hoạch chủ nhiệm.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSavePlan = () => {
    if (!generatedPlan) return;
    addMaterial({
      title: `Kế hoạch chủ nhiệm Tuần ${planWeek}: ${planTheme}`,
      subject: 'Hoạt động trải nghiệm',
      textbook: 'Kết nối tri thức',
      type: 'plan',
      week: planWeek,
      content: generatedPlan,
    });
    speechService.playGentleDing();
    alert('Đã lưu kế hoạch vào Góc học tập số!');
  };

  // 3. Generate Quiz
  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    speechService.playGentleDing();

    try {
      const qz = await aiService.generateQuiz({
        subject: quizSubject,
        topic: quizTopic,
        count: quizCount,
        difficulty: quizDiff,
      });
      setGeneratedQuizList(qz);
      speechService.playSuccessSound();
    } catch {
      alert('Lỗi tạo câu hỏi.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">🚀</span>
            <h2 className="text-2xl font-bold font-heading">AI Tạo Học Liệu & Trò Chơi Tương Tác</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl">
            Công cụ sáng tạo nội dung động chuẩn GDPT 2018 (3 bộ sách giáo khoa) và đấu trường trò chơi học tập đa dạng có âm thanh phản hồi tiếng Việt.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: 'games', name: '4. Trò Chơi Học Tập (6 Dạng)', icon: '🎮' },
          { id: 'worksheet', name: '2. AI Tạo Phiếu Học Tập Lớp 4', icon: '📝' },
          { id: 'plan', name: '1. AI Tạo Kế Hoạch Chủ Nhiệm', icon: '📋' },
          { id: 'quiz', name: '3. AI Tạo Trắc Nghiệm', icon: '❓' },
          { id: 'leaderboard', name: '5. Bảng Thi Đua Tích Cực', icon: '🏆' },
          { id: 'library', name: '6. Góc Học Tập Số (Kho)', icon: '📚' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* 4. TRÒ CHƠI HỌC TẬP TƯƠNG TÁC (EMBEDDED) */}
      {activeTab === 'games' && <InteractiveGames />}

      {/* 2. AI TẠO PHIẾU HỌC TẬP LỚP 4 */}
      {activeTab === 'worksheet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-600" /> Thiết Lập Phiếu Học Tập
            </h3>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Môn học lớp 4:</label>
                <select
                  value={wsSubject}
                  onChange={(e) => setWsSubject(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                  <option value="Đạo đức">Đạo đức</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Tin học">Tin học</option>
                  <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Bộ sách giáo khoa:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Kết nối tri thức', 'Cánh diều', 'Chân trời sáng tạo'].map((bk) => (
                    <button
                      key={bk}
                      type="button"
                      onClick={() => setWsTextbook(bk as any)}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        wsTextbook === bk
                          ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {bk}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tên bài học:</label>
                <input
                  type="text"
                  value={wsLesson}
                  onChange={(e) => setWsLesson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Yêu cầu cần đạt:</label>
                <textarea
                  value={wsOutcomes}
                  onChange={(e) => setWsOutcomes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <button
                onClick={handleGenerateWorksheet}
                disabled={isGeneratingWs}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingWs ? 'AI Đang Biên Soạn Phiếu...' : 'TẠO PHIẾU HỌC TẬP THÔNG MINH'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Xem Trước & Lưu Phiếu Học Tập</h3>
              {generatedWs && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> In phiếu
                  </button>
                  <button
                    onClick={handleSaveWorksheet}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Lưu học liệu
                  </button>
                </div>
              )}
            </div>

            {generatedWs ? (
              <div className="space-y-4">
                <div className="p-4 bg-sky-50/40 rounded-2xl border border-sky-100 text-xs">
                  <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                    {generatedWs.content}
                  </pre>
                </div>

                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-xs">
                  <span className="font-bold text-emerald-900 block mb-1">
                    Đáp án & Hướng dẫn đánh giá theo Thông tư 27:
                  </span>
                  <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                    {generatedWs.answerKey}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Thiết lập thông tin bên trái và bấm nút Tạo Phiếu Học Tập để AI biên soạn nội dung.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 1. AI TẠO KẾ HOẠCH CHỦ NHIỆM */}
      {activeTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Thiết Lập Kế Hoạch Chủ Nhiệm
            </h3>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tuần:</label>
                  <input
                    type="number"
                    value={planWeek}
                    onChange={(e) => setPlanWeek(parseInt(e.target.value, 10) || 8)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tháng:</label>
                  <input
                    type="number"
                    value={planMonth}
                    onChange={(e) => setPlanMonth(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Chủ đề giáo dục:</label>
                <input
                  type="text"
                  value={planTheme}
                  onChange={(e) => setPlanTheme(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Mục tiêu trọng tâm:</label>
                <textarea
                  value={planGoals}
                  onChange={(e) => setPlanGoals(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <button
                onClick={handleGeneratePlan}
                disabled={isGeneratingPlan}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {isGeneratingPlan ? 'AI Đang Soạn Kế Hoạch...' : 'TẠO KẾ HOẠCH CHỦ NHIỆM AI'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Kế Hoạch Hoạt Động Chi Tiết</h3>
              {generatedPlan && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> In kế hoạch
                  </button>
                  <button
                    onClick={handleSavePlan}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Lưu kế hoạch
                  </button>
                </div>
              )}
            </div>

            {generatedPlan ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <pre className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
                  {generatedPlan}
                </pre>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Nhập thông tin bên trái để AI lập tiến trình hoạt động chủ nhiệm đầy đủ.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. AI TẠO CÂU HỎI TRẮC NGHIỆM */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Môn học:</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold w-full"
                >
                  <option value="Toán">Toán</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Khoa học">Khoa học</option>
                  <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                  <option value="Đạo đức">Đạo đức</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Số lượng:</label>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(parseInt(e.target.value, 10))}
                  className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold w-full"
                >
                  <option value={5}>5 câu</option>
                  <option value={10}>10 câu</option>
                  <option value={15}>15 câu</option>
                  <option value={20}>20 câu</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Mức độ:</label>
                <select
                  value={quizDiff}
                  onChange={(e) => setQuizDiff(e.target.value)}
                  className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold w-full"
                >
                  <option value="Dễ">Dễ (Nhận biết)</option>
                  <option value="Trung bình">Trung bình (Thông hiểu)</option>
                  <option value="Vận dụng">Vận dụng</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Chủ đề:</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold w-full"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingQuiz ? 'Đang soạn câu hỏi...' : 'TẠO BỘ TRẮC NGHIỆM AI'}
            </button>
          </div>

          <div className="space-y-4">
            {generatedQuizList.map((q, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full">
                    CÂU {idx + 1}
                  </span>
                  <button
                    onClick={() => speechService.speak(q.question)}
                    className="p-1 text-sky-600 hover:bg-sky-50 rounded-lg text-xs flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Đọc câu hỏi
                  </button>
                </div>

                <h4 className="font-bold text-slate-800 text-sm leading-relaxed">{q.question}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isRight = optIdx === q.correctAnswerIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                          isRight
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-bold">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                        {isRight && <span className="ml-auto text-[10px] text-emerald-600">✓ Đáp án</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                  <strong>Giải thích:</strong> {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BẢNG THI ĐUA TÍCH CỰC */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Bảng Thi Đua Tích Cực – Vườn Sao Hạnh Phúc</h3>
              <p className="text-xs text-slate-500">
                Ghi nhận sự nỗ lực và tiến bộ cá nhân. Không so sánh bêu tên, tôn vinh mọi bước phát triển.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((gNum) => {
              const groupStudents = students.filter((s) => s.groupNumber === gNum);
              const totalGroupStars = groupStudents.reduce((sum, s) => sum + s.starsCount, 0);

              return (
                <div key={gNum} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-sky-800 text-sm">TỔ {gNum}</span>
                    <span className="text-amber-500 font-extrabold text-xs flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400" /> {totalGroupStars} Sao
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {groupStudents.map((st) => (
                      <div key={st.id} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{st.fullName}</div>
                          <div className="text-[10px] text-slate-400">{st.code}</div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-600">{st.starsCount} ⭐</span>
                          <button
                            onClick={() => {
                              awardStar(st.id, 1);
                              speechService.playGentleDing();
                            }}
                            className="w-5 h-5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs"
                            title="Tặng sao nỗ lực"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. GÓC HỌC TẬP SỐ (KHO TÀI LIỆU) */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Kho Tài Liệu & Học Liệu Số 4A4</h3>
              <p className="text-xs text-slate-500">Lưu trữ các kế hoạch chủ nhiệm, phiếu học tập và ngân hàng câu hỏi.</p>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Tìm học liệu..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {materials
              .filter((m) => m.title.toLowerCase().includes(librarySearch.toLowerCase()))
              .map((mat) => (
                <div key={mat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">
                        {mat.subject} ({mat.textbook})
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{mat.title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-white"
                        title="In học liệu"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMaterial(mat.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                    {mat.content}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
