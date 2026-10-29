import React, { useState } from 'react';
import {
  Smile,
  Heart,
  Sparkles,
  Send,
  Star,
  CheckCircle,
  ThumbsUp,
  Volume2,
  Calendar,
  Users,
  Compass,
  Award,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { EmotionType } from '../../types';

export const HappinessExperience: React.FC = () => {
  const {
    students,
    missions,
    addMission,
    toggleMissionComplete,
    emotionLogs,
    addEmotionLog,
    goodDeeds,
    addGoodDeed,
    toggleApproveDeed,
    likeDeed,
    currentSession,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'emotion' | 'missions' | 'good_deeds' | 'homeroom_script' | 'self_eval'>('emotion');

  // Emotion Log State
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('happy');
  const [emotionNote, setEmotionNote] = useState('');
  const [selectedStudentForEmotion, setSelectedStudentForEmotion] = useState(
    currentSession.studentId || students[0]?.id || ''
  );
  const [isSubmittingEmotion, setIsSubmittingEmotion] = useState(false);

  // Good Deed Post State
  const [deedFrom, setDeedFrom] = useState(currentSession.name);
  const [deedTo, setDeedTo] = useState(students[1]?.fullName || 'Bạn cùng bàn');
  const [deedCategory, setDeedCategory] = useState<'Khen ngợi' | 'Cảm ơn' | 'Việc tốt'>('Cảm ơn');
  const [deedContent, setDeedContent] = useState('');

  // AI Generate Missions State
  const [isGeneratingMissions, setIsGeneratingMissions] = useState(false);
  const [missionTheme, setMissionTheme] = useState('Yêu thương, lòng biết ơn cha mẹ và bảo vệ môi trường trường học');

  // AI Homeroom Script State
  const [scriptWeek, setScriptWeek] = useState(8);
  const [scriptTheme, setScriptTheme] = useState('Đoàn kết là sức mạnh – Tình bạn diệu kỳ 4A4');
  const [homeroomScript, setHomeroomScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const emotionsList: { type: EmotionType; label: string; icon: string; color: string }[] = [
    { type: 'happy', label: 'Vui vẻ', icon: '😊', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    { type: 'peaceful', label: 'Bình yên', icon: '😌', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { type: 'worried', label: 'Lo lắng', icon: '😟', color: 'bg-blue-100 text-blue-900 border-blue-300' },
    { type: 'sad', label: 'Buồn', icon: '😢', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { type: 'tired', label: 'Mệt mỏi', icon: '😴', color: 'bg-slate-100 text-slate-800 border-slate-300' },
    { type: 'grateful', label: 'Biết ơn', icon: '❤️', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  ];

  // Submit Emotion
  const handleSubmitEmotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentForEmotion) || students[0];
    if (!st) return;

    setIsSubmittingEmotion(true);
    speechService.playGentleDing();

    // Generate gentle AI warmth response
    let aiResponse = '';
    const isWorryOrSad = selectedEmotion === 'worried' || selectedEmotion === 'sad' || selectedEmotion === 'tired';

    if (selectedEmotion === 'happy') {
      aiResponse = `Bạn AI rất vui khi thấy ${st.fullName} tràn ngập niềm vui hôm nay! Hãy lan tỏa nụ cười này đến các bạn nhé!`;
    } else if (selectedEmotion === 'grateful') {
      aiResponse = `Trái tim biết ơn của ${st.fullName} thật ấm áp. Lòng biết ơn là hạt mầm của mọi điều tốt đẹp!`;
    } else if (isWorryOrSad) {
      aiResponse = `Bạn AI và cô giáo Lê Thị Giang luôn ở bên cạnh lắng nghe ${st.fullName}. Đừng lo lắng nhé, mọi chuyện đều sẽ ổn thôi em yêu!`;
    } else {
      aiResponse = `Cảm giác bình yên thật tuyệt vời. Chúc ${st.fullName} có một ngày học tập thật nhẹ nhàng và ý nghĩa!`;
    }

    addEmotionLog({
      studentId: st.id,
      studentName: st.fullName,
      emotion: selectedEmotion,
      note: emotionNote || 'Hôm nay em cảm thấy như vậy',
      aiResponse,
      flaggedForTeacher: isWorryOrSad,
      teacherRead: false,
    });

    setIsSubmittingEmotion(false);
    setEmotionNote('');
    speechService.playSuccessSound();
    speechService.speak(aiResponse);
    alert('Đã gửi cảm xúc thành công! Bạn AI đã gửi lời động viên tới em.');
  };

  // Submit Good Deed
  const handleSubmitGoodDeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deedContent.trim()) return;

    addGoodDeed({
      fromName: deedFrom || 'Học sinh 4A4',
      toName: deedTo,
      category: deedCategory,
      content: deedContent,
    });

    setDeedContent('');
    speechService.playSuccessSound();
    alert('Đã gửi câu chuyện lên Góc Lời Hay – Việc Tốt! (Cô giáo sẽ duyệt để hiển thị công khai).');
  };

  // AI Create 10 New Missions
  const handleGenerateMissions = async () => {
    setIsGeneratingMissions(true);
    speechService.speak('Bạn AI đang tạo ngân hàng nhiệm vụ hạnh phúc mới cho lớp 4A4.');

    try {
      const generated = await aiService.generateMissions(10, missionTheme);
      generated.forEach((m: any) => {
        addMission({
          title: m.title,
          description: m.description,
          category: m.category || 'viec_tot',
          stars: m.stars || 4,
          difficulty: m.difficulty || 'Vừa',
          weekNumber: 8,
          completedStudentIds: [],
        });
      });
      speechService.playSuccessSound();
      alert(`Đã tạo thành công ${generated.length} nhiệm vụ hạnh phúc mới cho lớp 4A4!`);
    } catch {
      alert('Đã xảy ra lỗi khi tạo nhiệm vụ.');
    } finally {
      setIsGeneratingMissions(false);
    }
  };

  // AI Homeroom Script
  const handleGenerateHomeroomScript = async () => {
    setIsGeneratingScript(true);
    speechService.playGentleDing();

    try {
      const script = await aiService.generateHomeroomPlan({
        week: scriptWeek,
        month: 10,
        theme: scriptTheme,
        goals: 'Gắn kết học sinh trong tổ, khơi dậy tinh thần tự giác và nuôi dưỡng lòng nhân ái.',
      });
      setHomeroomScript(script);
      speechService.playSuccessSound();
    } catch {
      setHomeroomScript(`KỊCH BẢN SINH HOẠT LỚP TUẦN ${scriptWeek}: ${scriptTheme}
1. Khởi động (5 phút): Hát múa tập thể "Lớp chúng mình rất rất vui".
2. Nhìn lại điều tích cực (10 phút): Trao hoa việc tốt và tuyên dương các bạn tích cực.
3. Chia sẻ khó khăn (8 phút): Lắng nghe nhật ký cảm xúc trong tuần.
4. Hoạt động trải nghiệm (12 phút): Thảo luận theo tổ về tình bạn thân thiện.
5. Mục tiêu tuần mới (5 phút): Phát động thử thách hạnh phúc mới.`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-indigo-600 p-6 rounded-3xl text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white/20 rounded-xl text-xl">🌸</span>
            <h2 className="text-2xl font-bold font-heading">Hoạt Động Lớp & Trải Nghiệm Hạnh Phúc</h2>
          </div>
          <p className="text-pink-100 text-sm max-w-2xl">
            Không gian nuôi dưỡng cảm xúc tích cực, lan tỏa việc tốt, gắn kết tình bạn và xây dựng lớp học 4A4 trở thành nơi mỗi ngày đến trường là một ngày vui.
          </p>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {[
          { id: 'emotion', name: 'A. Nhật Ký Cảm Xúc', icon: '😊' },
          { id: 'missions', name: 'B. Nhiệm Vụ Hạnh Phúc', icon: '🎯' },
          { id: 'good_deeds', name: 'C. Góc Lời Hay – Việc Tốt', icon: '🌸' },
          { id: 'homeroom_script', name: 'E. Sinh Hoạt Lớp Thông Minh', icon: '📜' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* SUB-TAB A: NHẬT KÝ CẢM XÚC */}
      {activeSubTab === 'emotion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 6 Emotions */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Hôm Nay Cảm Xúc Của Em Thế Nào?</h3>
              <p className="text-xs text-slate-500">
                Hãy chọn biểu tượng cảm xúc và chia sẻ vài dòng cùng Bạn AI và cô giáo nhé!
              </p>
            </div>

            <form onSubmit={handleSubmitEmotion} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Chọn học sinh:</label>
                <select
                  value={selectedStudentForEmotion}
                  onChange={(e) => setSelectedStudentForEmotion(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6 Emotion Buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {emotionsList.map((emo) => {
                  const isSelected = selectedEmotion === emo.type;
                  return (
                    <button
                      key={emo.type}
                      type="button"
                      onClick={() => setSelectedEmotion(emo.type)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? `${emo.color} border-2 shadow-sm scale-103 font-bold`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{emo.icon}</span>
                      <span className="text-xs">{emo.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Kể cho Bạn AI và cô giáo nghe điều gì đã khiến em có cảm xúc này:
                </label>
                <textarea
                  value={emotionNote}
                  onChange={(e) => setEmotionNote(e.target.value)}
                  rows={3}
                  placeholder="Ví dụ: Hôm nay em vui vì được cùng bạn Phương giải xong câu đố Toán..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingEmotion}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Gửi Nhật Ký Cảm Xúc & Nhận Phản Hồi Từ AI
              </button>
            </form>
          </div>

          {/* Right Log Feed */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Dòng Chảy Cảm Xúc Lớp 4A4</h3>
              <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2.5 py-1 rounded-full">
                {emotionLogs.length} ghi nhận
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto">
              {emotionLogs.map((log) => (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                    log.flaggedForTeacher
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {log.emotion === 'happy' && '😊'}
                        {log.emotion === 'peaceful' && '😌'}
                        {log.emotion === 'worried' && '😟'}
                        {log.emotion === 'sad' && '😢'}
                        {log.emotion === 'tired' && '😴'}
                        {log.emotion === 'grateful' && '❤️'}
                      </span>
                      <span className="font-bold text-slate-800">{log.studentName}</span>
                      {log.flaggedForTeacher && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Cô quan tâm
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                  </div>

                  <p className="text-slate-700 italic">"{log.note}"</p>

                  {log.aiResponse && (
                    <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200 text-sky-800 text-[11px] flex items-start gap-2">
                      <span className="text-sm">🤖</span>
                      <div className="flex-1">
                        <strong>Bạn AI:</strong> {log.aiResponse}
                      </div>
                      <button
                        onClick={() => speechService.speak(log.aiResponse)}
                        className="text-sky-600 hover:text-sky-800 p-1"
                        title="Nghe giọng đọc tiếng Việt"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB B: NHIỆM VỤ HẠNH PHÚC MỖI TUẦN */}
      {activeSubTab === 'missions' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Ngân Hàng Nhiệm Vụ Hạnh Phúc Tuần 8</h3>
              <p className="text-xs text-slate-500">
                Thử thách nhỏ gieo mầm nhân cách, rèn luyện tính tự lập và tình yêu thương gia đình, bạn bè.
              </p>
            </div>

            <button
              onClick={handleGenerateMissions}
              disabled={isGeneratingMissions}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingMissions ? 'Đang tạo nhiệm vụ...' : 'AI TẠO 10 NHIỆM VỤ MỚI'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missions.map((mission) => {
              const isDoneByFirstStudent = mission.completedStudentIds.includes(students[0]?.id);

              return (
                <div
                  key={mission.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200 uppercase">
                        {mission.difficulty}
                      </span>
                      <span className="text-amber-500 font-bold text-xs flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400" /> +{mission.stars} sao
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm">{mission.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{mission.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {mission.completedStudentIds.length} bạn hoàn thành
                    </span>

                    <button
                      onClick={() => toggleMissionComplete(mission.id, students[0]?.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDoneByFirstStudent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {isDoneByFirstStudent ? 'Đã hoàn thành' : 'Đánh dấu xong'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB C: GÓC LỜI HAY - VIỆC TỐT */}
      {activeSubTab === 'good_deeds' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Post Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Gửi Lời Khen – Lời Cảm Ơn</h3>
              <p className="text-xs text-slate-500">Lan tỏa những câu chuyện ấm áp giữa các bạn học sinh lớp 4A4.</p>
            </div>

            <form onSubmit={handleSubmitGoodDeed} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Người gửi:</label>
                  <input
                    type="text"
                    value={deedFrom}
                    onChange={(e) => setDeedFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Người nhận:</label>
                  <input
                    type="text"
                    value={deedTo}
                    onChange={(e) => setDeedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Chủ đề:</label>
                <div className="flex gap-2">
                  {['Khen ngợi', 'Cảm ơn', 'Việc tốt'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setDeedCategory(cat as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        deedCategory === cat
                          ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nội dung câu chuyện:</label>
                <textarea
                  value={deedContent}
                  onChange={(e) => setDeedContent(e.target.value)}
                  rows={4}
                  placeholder="Ví dụ: Cảm ơn bạn Phương đã nhắc mình đeo khăn quàng đỏ trước khi vào lớp..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" /> Gửi Lên Bảng Tin Lớp
              </button>
            </form>
          </div>

          {/* Feed */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Bảng Vàng Việc Tốt 4A4</h3>
              <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full">
                {goodDeeds.filter((d) => d.approved).length} bài viết đã duyệt
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {goodDeeds.map((deed) => (
                <div key={deed.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                        {deed.category}
                      </span>
                      <span className="font-bold text-slate-800">
                        {deed.fromName} ➔ {deed.toName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{deed.timestamp}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed italic">"{deed.content}"</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => likeDeed(deed.id)}
                      className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold text-xs"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Thả tim ({deed.likes})
                    </button>

                    {currentSession.role === 'teacher' && (
                      <button
                        onClick={() => toggleApproveDeed(deed.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          deed.approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {deed.approved ? '✓ Đã duyệt hiển thị' : 'Chờ cô duyệt'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB E: SINH HOẠT LỚP THÔNG MINH */}
      {activeSubTab === 'homeroom_script' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Trợ Lý Kịch Bản Sinh Hoạt Lớp Hạnh Phúc</h3>
              <p className="text-xs text-slate-500">
                AI hỗ trợ cấu trúc 6 bước sinh hoạt cuối tuần: Khởi động - Nhìn lại điều tích cực - Chia sẻ khó khăn - Hoạt động trải nghiệm - Thống nhất mục tiêu - Lời động viên.
              </p>
            </div>

            <button
              onClick={handleGenerateHomeroomScript}
              disabled={isGeneratingScript}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isGeneratingScript ? 'AI Đang Soạn...' : 'Tạo Kịch Bản Sinh Hoạt Mới'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tuần học:</label>
              <input
                type="number"
                value={scriptWeek}
                onChange={(e) => setScriptWeek(parseInt(e.target.value, 10) || 8)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Chủ đề tuần:</label>
              <input
                type="text"
                value={scriptTheme}
                onChange={(e) => setScriptTheme(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          {homeroomScript && (
            <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 uppercase">Kịch bản chi tiết:</span>
                <button
                  onClick={() => speechService.speak(homeroomScript)}
                  className="text-sky-600 font-bold text-xs flex items-center gap-1"
                >
                  <Volume2 className="w-4 h-4" /> Nghe đọc kịch bản
                </button>
              </div>
              <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-xl border border-sky-100">
                {homeroomScript}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
