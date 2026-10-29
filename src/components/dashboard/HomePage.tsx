import React from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Award,
  Star,
  Sparkles,
  Heart,
  Volume2,
  Calendar,
  Gamepad2,
  BookOpen,
  MessageSquare,
  FileCheck2,
  Layers,
  ArrowRight,
  TrendingUp,
  Smile,
  Bell,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';

interface HomePageProps {
  onNavigate: (moduleKey: string) => void;
  onOpenSettings: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSettings }) => {
  const {
    students,
    teacherProfile,
    missions,
    emotionLogs,
    goodDeeds,
    materials,
    getAttendanceForDate,
    currentSession,
  } = useApp();

  const today = new Date().toISOString().split('T')[0];
  const attStats = getAttendanceForDate(today);
  const totalCompletedMissions = missions.reduce((acc, m) => acc + m.completedStudentIds.length, 0);
  const totalStars = students.reduce((sum, s) => sum + s.starsCount, 0);

  const getGreetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng cô Lê Thị Giang và các bạn học sinh 4A4!';
    if (hour < 18) return 'Chào buổi chiều! Chúc cô trò một buổi học hứng khởi!';
    return 'Chào buổi tối! Chúc gia đình các em có thời gian đầm ấm bên nhau!';
  };

  const handleSpeakGreeting = () => {
    speechService.speak(
      `${getGreetingText()} Chào mừng đến với ứng dụng AI Đồng Hành – Kiến Tạo Lớp 4 Hạnh Phúc, Trường Tiểu học Khoái Châu 1.`
    );
  };

  const featureCards = [
    {
      key: 'module1',
      title: 'Phân hệ 1: Thông Tin & Quản Lý Lớp',
      desc: 'Sĩ số 32 HS, điểm danh thông minh, phân tổ, nhập xuất Excel',
      icon: '👥',
      color: 'from-sky-500 to-sky-600',
      badge: `${students.length} Học sinh`,
    },
    {
      key: 'module2',
      title: 'Phân hệ 2: AI Thấu Hiểu Học Sinh',
      desc: 'Phiếu khảo sát 9 tiêu chí, bản đồ năng lực & đề xuất sư phạm AI',
      icon: '💡',
      color: 'from-indigo-500 to-indigo-600',
      badge: '9 Mẫu khảo sát',
    },
    {
      key: 'module3',
      title: 'Phân hệ 3: Hồ Sơ Chủ Nhiệm Số AI',
      desc: 'Mô hình 5 bước đồng hành, nhiệm vụ cá nhân hóa, xuất hồ sơ PDF',
      icon: '📁',
      color: 'from-blue-600 to-sky-600',
      badge: 'Trung tâm',
    },
    {
      key: 'module4',
      title: 'Phân hệ 4: AI Chăm Sóc & Nề Nếp',
      desc: 'Trợ lý sư phạm AI, khen ngợi quá trình, giáo dục hành vi tích cực',
      icon: '🛡️',
      color: 'from-emerald-500 to-emerald-600',
      badge: 'Sư phạm nhân văn',
    },
    {
      key: 'module5',
      title: 'Phân hệ 5: Tiến Bộ & Phụ Huynh',
      desc: 'Biểu đồ chỉ số rèn luyện, AI viết tin nhắn gửi phụ huynh lịch sự',
      icon: '📊',
      color: 'from-teal-500 to-emerald-600',
      badge: 'Bảo mật gia đình',
    },
    {
      key: 'module6',
      title: 'Phân hệ 6: Lớp Học Hạnh Phúc',
      desc: 'Nhật ký 6 cảm xúc, nhiệm vụ tuần, góc việc tốt, kịch bản sinh hoạt',
      icon: '🌸',
      color: 'from-pink-500 to-rose-600',
      badge: 'Hạnh phúc',
    },
    {
      key: 'module7',
      title: 'Phân hệ 7: Học Liệu & Trò Chơi',
      desc: '6 Trò chơi tương tác thực sự, soạn phiếu học tập 3 bộ SGK, trắc nghiệm',
      icon: '🎮',
      color: 'from-purple-500 to-indigo-600',
      badge: '6 Trò chơi',
    },
    {
      key: 'module8',
      title: 'Phân hệ 8: Minh Chứng Dự Thi',
      desc: 'Báo cáo hiệu quả 8 phần, minh chứng thực tiễn cấp trường/huyện',
      icon: '🏆',
      color: 'from-amber-500 to-orange-600',
      badge: 'Hồ sơ dự thi',
    },
    {
      key: 'creative_center',
      title: 'Trung Tâm Sáng Tạo Nội Dung AI',
      desc: 'Tạo hàng loạt 10 kế hoạch, 20 nhiệm vụ, 30 trắc nghiệm 1-click',
      icon: '✨',
      color: 'from-fuchsia-500 to-pink-600',
      badge: 'Tạo hàng loạt',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Poster Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-sky-200">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-600/90 via-sky-500/80 to-indigo-700/90 z-10" />
        <img
          src={teacherProfile.classCoverUrl}
          alt="Lớp 4A4"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />

        <div className="relative z-20 p-6 sm:p-10 text-white flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl text-center lg:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30 text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ứng dụng Chuyển Đổi Số Giáo Viên Chủ Nhiệm Lớp 4 Xuất Sắc</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-heading leading-tight">
              🌸 AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC
            </h1>

            <p className="text-base sm:text-lg text-amber-200 font-bold italic">
              "{teacherProfile.slogan}"
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-sky-100 pt-1">
              <span className="flex items-center gap-1.5">
                <strong>GVCN:</strong> {teacherProfile.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <strong>Đơn vị:</strong> {teacherProfile.school}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <strong>Lớp:</strong> {teacherProfile.className} ({teacherProfile.province})
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={handleSpeakGreeting}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Chào mừng bằng Tiếng Việt
              </button>

              <button
                onClick={() => onNavigate('module7')}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl backdrop-blur-md border border-white/30 transition-all flex items-center gap-2"
              >
                <Gamepad2 className="w-4 h-4 text-amber-300" />
                Chơi Trò Chơi Học Tập Ngay
              </button>
            </div>
          </div>

          {/* Teacher & Mascot Visual Cards */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {/* Teacher Card */}
            <div
              onClick={onOpenSettings}
              className="bg-white/20 backdrop-blur-md p-4 rounded-3xl border border-white/40 text-center shadow-2xl cursor-pointer hover:bg-white/25 transition-all group max-w-[210px]"
              title="Nhấp để xem/sửa hồ sơ cô giáo"
            >
              <div className="relative w-28 h-36 mx-auto rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg">
                <img
                  src={teacherProfile.avatarUrl}
                  alt={teacherProfile.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[9px] rounded-md shadow-xs">
                  GVCN
                </span>
              </div>
              <h3 className="font-extrabold text-sm text-white mt-2 font-heading leading-tight">
                Cô {teacherProfile.name}
              </h3>
              <p className="text-[10px] text-sky-100 mt-0.5">Tiểu học Khoái Châu 1</p>
            </div>

            {/* Friendly Mascot Visual Card */}
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-3xl border border-white/30 text-center max-w-[200px] shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-300 to-sky-300 flex items-center justify-center text-4xl shadow-lg border-3 border-white/80 animate-float-slow">
                🤖
              </div>
              <h3 className="font-extrabold text-sm text-white mt-2 font-heading">Bạn AI Hạnh Phúc</h3>
              <p className="text-[10px] text-sky-100 mt-0.5 line-clamp-2">
                "Đồng hành cùng cô trò 4A4 mỗi ngày!"
              </p>
              <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-center gap-1 text-[10px] font-bold text-amber-300">
                <Heart className="w-3 h-3 fill-amber-300" /> Yêu thương & Tích cực
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real Calculated Dashboard Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Sĩ số lớp 4A4</span>
            <span className="text-2xl font-black text-slate-800 font-heading">{students.length}</span>
            <span className="text-[10px] text-slate-400 block">học sinh</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Có mặt hôm nay</span>
            <span className="text-2xl font-black text-emerald-600 font-heading">
              {attStats.present}
              <span className="text-xs text-slate-400 font-normal"> / {students.length}</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">
              {students.length > 0 ? Math.round((attStats.present / students.length) * 100) : 0}% chuyên cần
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Cần hỗ trợ</span>
            <span className="text-2xl font-black text-amber-600 font-heading">
              {students.filter((s) => s.supportNeeds?.length > 0).length}
            </span>
            <span className="text-[10px] text-slate-400 block">học sinh</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Nhiệm vụ tuần</span>
            <span className="text-2xl font-black text-purple-600 font-heading">{totalCompletedMissions}</span>
            <span className="text-[10px] text-purple-600 font-bold block">lượt hoàn thành</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Vườn sao hạnh phúc</span>
            <span className="text-2xl font-black text-pink-600 font-heading">{totalStars}</span>
            <span className="text-[10px] text-slate-400 block">ngôi sao trao tặng</span>
          </div>
        </div>
      </div>

      {/* Main 8 Modules + Creative Center Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 font-heading">Hệ Thống 8 Phân Hệ Trợ Lý Chủ Nhiệm</h2>
            <p className="text-xs text-slate-500">Khám phá và sử dụng các tính năng chuyên biệt cho lớp 4A4</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureCards.map((card) => (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-all`}
                  >
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-bold text-sky-800 bg-sky-50 border border-sky-100 px-2.5 py-1 rounded-full">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-base group-hover:text-sky-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                <span>Mở phân hệ</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlight News, Weekly Missions & Good Deeds Wall */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Missions Highlights (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-base">Nhiệm Vụ Hạnh Phúc Nổi Bật Tuần Này</h3>
            </div>
            <button
              onClick={() => onNavigate('module6')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {missions.slice(0, 3).map((m) => (
              <div key={m.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{m.title}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{m.description}</div>
                </div>
                <span className="text-amber-500 font-extrabold text-xs whitespace-nowrap flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> +{m.stars} sao
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Good Deeds Highlights (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-800 text-base">Góc Lời Hay – Việc Tốt 4A4 Mới Nhất</h3>
            </div>
            <button
              onClick={() => onNavigate('module6')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              Gửi lời khen <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goodDeeds.filter((d) => d.approved).slice(0, 3).map((d) => (
              <div key={d.id} className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="text-rose-800">{d.fromName} ➔ {d.toName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{d.timestamp}</span>
                </div>
                <p className="text-slate-600 italic">"{d.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
