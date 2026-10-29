import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Shield,
  School,
  Sun,
  Moon,
  Sunset,
  Volume2,
  VolumeX,
  Settings,
  Database,
  Check,
  ChevronDown,
  GraduationCap,
  Heart,
  Smile,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';
import { UserRole } from '../../types';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    currentSession,
    setSessionRole,
    isDemoMode,
    toggleDemoMode,
    teacherProfile,
    students,
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => speechService.getSettings().enabled);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: 'Chúc cô và trò 4A4 một buổi sáng ngập tràn năng lượng!', icon: <Sun className="w-4 h-4 text-amber-500" /> };
    } else if (hour < 18) {
      return { text: 'Chúc cô và các em một buổi chiều say mê, hiệu quả!', icon: <Sunset className="w-4 h-4 text-orange-500" /> };
    } else {
      return { text: 'Buổi tối ấm áp bên gia đình và niềm vui trọn vẹn!', icon: <Moon className="w-4 h-4 text-indigo-400" /> };
    }
  };

  const greeting = getGreeting();

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    speechService.saveSettings({ enabled: next });
    if (!next) speechService.stop();
  };

  return (
    <header className="bg-white border-b border-sky-100 shadow-sm sticky top-0 z-40">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold tracking-wide">
              🌸 {teacherProfile.school} – Lớp {teacherProfile.className} ({teacherProfile.province})
            </span>
            <span className="hidden md:inline-block text-sky-200">|</span>
            <span className="hidden md:flex items-center gap-1 text-sky-100 italic">
              {greeting.icon} {greeting.text}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo Mode Toggle Badge */}
            <button
              onClick={toggleDemoMode}
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm ${
                isDemoMode
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                  : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
              }`}
              title="Chuyển đổi giữa Chế độ Trải nghiệm Demo và Dữ liệu Thực tế"
            >
              <Database className="w-3 h-3" />
              <span>{isDemoMode ? 'DỮ LIỆU DEMO (MẪU)' : 'DỮ LIỆU THỰC TẾ'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1 rounded-md hover:bg-white/10 text-white"
              title={soundEnabled ? 'Đang bật âm thanh tiếng Việt' : 'Đang tắt âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer" onClick={onOpenSettings} title="Nhấp để xem/sửa thông tin cô giáo">
              <img
                src={teacherProfile.avatarUrl}
                alt={teacherProfile.name}
                className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-sky-400 shadow-md group-hover:scale-105 transition-all bg-sky-100"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-400 rounded-lg text-[10px] text-amber-950 font-black shadow-sm">
                GVCN
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-sky-900 tracking-tight font-heading">
                  AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-sky-700 font-semibold flex items-center gap-2 mt-0.5">
                <span>GVCN: {teacherProfile.name}</span>
                <span className="text-sky-300">•</span>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold text-xs border border-amber-200">
                  Khẩu hiệu: "{teacherProfile.slogan}"
                </span>
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & Settings */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all border border-slate-200"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Vai trò: {currentSession.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase">
                    Chọn vai trò truy cập:
                  </div>

                  <button
                    onClick={() => {
                      setSessionRole('teacher');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-sky-50 ${
                      currentSession.role === 'teacher' ? 'text-sky-600 bg-sky-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-sky-600" />
                    <div className="flex-1">
                      <div>Cô Lê Thị Giang (GVCN)</div>
                      <div className="text-[10px] text-slate-400">Toàn quyền quản trị lớp 4A4</div>
                    </div>
                    {currentSession.role === 'teacher' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setSessionRole('student', students[0]?.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-sky-50 ${
                      currentSession.role === 'student' ? 'text-sky-600 bg-sky-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Smile className="w-4 h-4 text-amber-500" />
                    <div className="flex-1">
                      <div>Học sinh (Em Nguyễn Hải Đăng)</div>
                      <div className="text-[10px] text-slate-400">Tham gia hoạt động, làm bài, trò chơi</div>
                    </div>
                    {currentSession.role === 'student' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setSessionRole('parent', students[0]?.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-sky-50 ${
                      currentSession.role === 'parent' ? 'text-sky-600 bg-sky-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <div className="flex-1">
                      <div>Phụ huynh (Bố em Hải Đăng)</div>
                      <div className="text-[10px] text-slate-400">Theo dõi tiến bộ riêng của con</div>
                    </div>
                    {currentSession.role === 'parent' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setSessionRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-sky-50 ${
                      currentSession.role === 'admin' ? 'text-sky-600 bg-sky-50 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <div className="flex-1">
                      <div>Cán bộ Quản lý (BGH Nhà trường)</div>
                      <div className="text-[10px] text-slate-400">Xem báo cáo minh chứng tổng thể</div>
                    </div>
                    {currentSession.role === 'admin' && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-sky-600 transition-all border border-slate-200"
              title="Cài đặt thông tin lớp và ảnh đại diện"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
