import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Target,
  Users,
  Compass,
  Smile,
  BookOpen,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Edit3,
  Save,
  Check,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService, AIAnalysisResult } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { SurveyResponse } from '../../types';

export const AIStudentUnderstanding: React.FC = () => {
  const { students, surveys, submitSurvey, updateSurveyAnalysis, confirmSurveyAnalysis } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'survey_form' | 'results_view'>('survey_form');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const existingSurvey = surveys.find((s) => s.studentId === selectedStudentId);

  // Form state
  const [formData, setFormData] = useState({
    interests: ['Giải đố Toán học', 'Đọc sách khoa học'],
    strengths: ['Tư duy nhanh', 'Nhiệt tình'],
    improvementGoals: ['Tự tin nói to trước lớp'],
    learningStyle: ['Học qua trò chơi đố vui', 'Học theo nhóm bạn'],
    classWishes: ['Lớp học tràn ngập tiếng cười và không ai bị bắt nạt'],
    confidenceLevel: 3,
    teamworkSkill: 4,
    schoolFeelings: 'Em cảm thấy trường học là ngôi nhà thứ hai của em.',
    teacherSupportNeed: 'Em mong cô Giang gọi em phát biểu nhiều hơn ạ.',
  });

  // Switch student
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const surv = surveys.find((s) => s.studentId === id);
    if (surv) {
      setFormData(surv.answers);
      setEditedAnalysis(surv.aiAnalysis || null);
    } else {
      setFormData({
        interests: ['Khám phá khoa học'],
        strengths: ['Chăm chỉ'],
        improvementGoals: ['Rèn chữ viết đẹp hơn'],
        learningStyle: ['Học qua hình ảnh minh họa'],
        classWishes: ['Có nhiều bạn tốt'],
        confidenceLevel: 3,
        teamworkSkill: 3,
        schoolFeelings: 'Em rất vui khi đến lớp 4A4.',
        teacherSupportNeed: 'Cô giúp em môn Toán dạng phân số nhé.',
      });
      setEditedAnalysis(null);
    }
  };

  const handleSaveSurvey = () => {
    if (!selectedStudent) return;
    submitSurvey({
      studentId: selectedStudent.id,
      studentName: selectedStudent.fullName,
      answers: formData,
      aiAnalysis: editedAnalysis || undefined,
      teacherConfirmed: false,
    });
    speechService.playGentleDing();
    alert(`Đã lưu phiếu khảo sát của học sinh ${selectedStudent.fullName}!`);
  };

  // AI Analysis Trigger
  const handleRunAIAnalysis = async () => {
    if (!selectedStudent) return;
    setIsAnalyzing(true);
    speechService.speak('Bạn AI đang phân tích dữ liệu khảo sát để đưa ra giải pháp sư phạm phù hợp.');

    try {
      const result = await aiService.analyzeStudent(
        selectedStudent.fullName,
        formData,
        selectedStudent.teacherNotes
      );
      setEditedAnalysis(result);

      if (existingSurvey) {
        updateSurveyAnalysis(existingSurvey.id, result);
      } else {
        submitSurvey({
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          answers: formData,
          aiAnalysis: result,
          teacherConfirmed: false,
        });
      }

      setActiveTab('results_view');
      speechService.playSuccessSound();
    } catch {
      alert('Đã xảy ra lỗi khi phân tích nhu cầu học sinh.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmConclusion = () => {
    if (!existingSurvey) return;
    confirmSurveyAnalysis(existingSurvey.id);
    speechService.playGentleDing();
    alert('Cô giáo đã phê duyệt và lưu kết luận sư phạm vào Hồ sơ chủ nhiệm số!');
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">💡</span>
            <h2 className="text-2xl font-bold font-heading">AI Thấu Hiểu Học Sinh 4A4</h2>
          </div>
          <p className="text-sky-100 text-sm max-w-2xl leading-relaxed">
            Hệ thống khảo sát 9 chiều cạnh tâm lý lứa tuổi tiểu học, lắng nghe từng tâm tư của các em và ứng dụng AI phân tích giải pháp sư phạm nâng đỡ, khích lệ tự nhiên.
          </p>
        </div>

        {/* Student Selector */}
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl border border-white/30 w-full md:w-auto">
          <label className="block text-[11px] font-bold text-sky-100 uppercase mb-1">Chọn học sinh khảo sát:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => handleSelectStudent(e.target.value)}
            className="w-full md:w-60 px-3 py-2 bg-white text-slate-800 rounded-xl font-bold text-xs focus:outline-none shadow-sm"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.fullName} (Tổ {s.groupNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('survey_form')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'survey_form'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Phiếu Khảo Sát 9 Mục Tiêu
          </button>

          <button
            onClick={() => setActiveTab('results_view')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'results_view'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            2. Kết Quả & Phân Tích AI
            {existingSurvey?.aiAnalysis && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={isAnalyzing}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isAnalyzing ? 'AI Đang Phân Tích...' : 'PHÂN TÍCH NHU CẦU HỌC SINH BẰNG AI'}
        </button>
      </div>

      {/* TAB 1: SURVEY FORM */}
      {activeTab === 'survey_form' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Phiếu Khảo Sát Đầu Năm: {selectedStudent?.fullName} ({selectedStudent?.code})
              </h3>
              <p className="text-xs text-slate-500">Giúp cô giáo thấu hiểu năng lực, ước mơ và cách học của em</p>
            </div>
            <button
              onClick={handleSaveSurvey}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Lưu phiếu khảo sát
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Sở thích học tập */}
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
              <label className="font-bold text-xs text-sky-900 block mb-2 flex items-center gap-2">
                <span>🎨 1. Sở thích học tập của em:</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {['Giải đố Toán học', 'Đọc sách truyện', 'Vẽ tranh', 'Khám phá thiên nhiên', 'Tin học/Lắp ghép'].map(
                  (item) => {
                    const isChecked = formData.interests.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? formData.interests.filter((x) => x !== item)
                            : [...formData.interests, item];
                          setFormData({ ...formData, interests: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 2. Điểm mạnh của em */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <label className="font-bold text-xs text-emerald-900 block mb-2">
                🌟 2. Điểm mạnh nổi bật của em:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Tư duy nhanh nhẹn', 'Chăm chỉ nắn nót', 'Hòa đồng, hay cười', 'Thể thao khỏe khoắn', 'Lễ phép'].map(
                  (item) => {
                    const isChecked = formData.strengths.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? formData.strengths.filter((x) => x !== item)
                            : [...formData.strengths, item];
                          setFormData({ ...formData, strengths: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 3. Điều em muốn cải thiện */}
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100">
              <label className="font-bold text-xs text-amber-900 block mb-2">
                🌱 3. Điều em muốn hoàn thiện hơn trong năm học này:
              </label>
              <input
                type="text"
                value={formData.improvementGoals.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    improvementGoals: e.target.value.split(',').map((x) => x.trim()),
                  })
                }
                placeholder="Ví dụ: Tự tin nói to trước lớp, tập trung viết bài nhanh hơn..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* 4. Cách học em yêu thích */}
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
              <label className="font-bold text-xs text-purple-900 block mb-2">
                🎯 4. Cách học mà em thấy hào hứng nhất:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Học qua trò chơi đố vui', 'Thảo luận cùng bạn trong tổ', 'Xem video hình ảnh sinh động', 'Tự làm thí nghiệm'].map(
                  (item) => {
                    const isChecked = formData.learningStyle.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          const next = isChecked
                            ? formData.learningStyle.filter((x) => x !== item)
                            : [...formData.learningStyle, item];
                          setFormData({ ...formData, learningStyle: next });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 5. Mức độ tự tin (Rating 1 - 5) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-xs text-slate-800">
                  ⚡ 5. Mức độ tự tin khi xung phong phát biểu:
                </label>
                <span className="text-amber-500 font-black text-sm">{formData.confidenceLevel} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, confidenceLevel: lvl })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.confidenceLevel >= lvl
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    ⭐ {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Kỹ năng giao tiếp và hợp tác (Rating 1 - 5) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-xs text-slate-800">
                  🤝 6. Khả năng làm việc nhóm và chia sẻ cùng bạn:
                </label>
                <span className="text-sky-600 font-black text-sm">{formData.teamworkSkill} / 5</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setFormData({ ...formData, teamworkSkill: lvl })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.teamworkSkill >= lvl
                        ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    ✨ {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Mong muốn ở lớp học */}
            <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-100 col-span-1 md:col-span-2">
              <label className="font-bold text-xs text-pink-900 block mb-2">
                💖 7. Mong muốn của em về lớp học 4A4 hạnh phúc:
              </label>
              <textarea
                value={formData.classWishes.join('; ')}
                onChange={(e) => setFormData({ ...formData, classWishes: [e.target.value] })}
                rows={2}
                placeholder="Em mong lớp mình luôn đoàn kết, cô trò luôn vui vẻ..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 text-xs focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* 8. Nhu cầu hỗ trợ từ cô giáo */}
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 col-span-1 md:col-span-2">
              <label className="font-bold text-xs text-indigo-900 block mb-2">
                💌 8 & 9. Cảm nhận về trường lớp và nhu cầu cần cô giáo đồng hành:
              </label>
              <textarea
                value={formData.teacherSupportNeed}
                onChange={(e) => setFormData({ ...formData, teacherSupportNeed: e.target.value })}
                rows={2}
                placeholder="Điều em muốn cô hỗ trợ riêng..."
                className="w-full px-3 py-2 bg-white rounded-xl border border-indigo-200 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI ANALYSIS RESULTS */}
      {activeTab === 'results_view' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full uppercase">
                Báo cáo Thấu hiểu Sư phạm AI
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-1">
                Bản đồ Năng lực & Đề xuất Đồng hành: {selectedStudent?.fullName}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {existingSurvey?.teacherConfirmed ? (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" /> Cô giáo đã xác nhận
                </span>
              ) : (
                <button
                  onClick={handleConfirmConclusion}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Xác nhận kết luận sư phạm
                </button>
              )}
            </div>
          </div>

          {editedAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-900 text-sm mb-3 flex items-center gap-2">
                  <span className="p-1 bg-emerald-200 rounded-lg text-emerald-800">🌟</span>
                  Điểm mạnh nhận diện được
                </h4>
                <ul className="space-y-2">
                  {editedAnalysis.strengths?.map((str, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Needs */}
              <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
                <h4 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                  <span className="p-1 bg-amber-200 rounded-lg text-amber-800">🌱</span>
                  Nhu cầu hỗ trợ & Vùng phát triển gần
                </h4>
                <ul className="space-y-2">
                  {editedAnalysis.supportNeeds?.map((need, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Goals */}
              <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-200">
                <h4 className="font-bold text-sky-900 text-sm mb-3 flex items-center gap-2">
                  <span className="p-1 bg-sky-200 rounded-lg text-sky-800">🎯</span>
                  Mục tiêu rèn luyện phù hợp
                </h4>
                <ul className="space-y-2">
                  {editedAnalysis.recommendedGoals?.map((goal, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-sky-500 font-bold">•</span>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggested Activities */}
              <div className="p-5 bg-purple-50/70 rounded-2xl border border-purple-200">
                <h4 className="font-bold text-purple-900 text-sm mb-3 flex items-center gap-2">
                  <span className="p-1 bg-purple-200 rounded-lg text-purple-800">🚀</span>
                  Hoạt động trải nghiệm khuyến nghị
                </h4>
                <ul className="space-y-2">
                  {editedAnalysis.suggestedActivities?.map((act, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Parent Collaboration */}
              <div className="p-5 bg-pink-50/70 rounded-2xl border border-pink-200 col-span-1 md:col-span-2">
                <h4 className="font-bold text-pink-900 text-sm mb-2 flex items-center gap-2">
                  <span className="p-1 bg-pink-200 rounded-lg text-pink-800">💖</span>
                  Gợi ý phối hợp nhịp nhàng cùng Phụ huynh
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {editedAnalysis.parentCollaboration}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-sm mb-1">Chưa có phân tích AI cho học sinh này</h4>
              <p className="text-xs text-slate-500 mb-4">
                Bấm nút "PHÂN TÍCH NHU CẦU HỌC SINH BẰNG AI" ở trên để tạo báo cáo cá nhân hóa.
              </p>
              <button
                onClick={handleRunAIAnalysis}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Tiến hành phân tích ngay
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
