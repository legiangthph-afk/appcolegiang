import React, { useState } from 'react';
import {
  Home,
  Users,
  Lightbulb,
  FileText,
  Shield,
  TrendingUp,
  Heart,
  Gamepad2,
  Award,
  Sparkles,
  Menu,
  X,
  School,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { SettingsModal } from './components/common/SettingsModal';
import { AIFriendChatbot } from './components/chatbot/AIFriendChatbot';
import { HomePage } from './components/dashboard/HomePage';
import { TeacherAndClassManagement } from './components/modules/TeacherAndClassManagement';
import { AIStudentUnderstanding } from './components/modules/AIStudentUnderstanding';
import { DigitalHomeroomProfile } from './components/modules/DigitalHomeroomProfile';
import { AIAssistantCare } from './components/modules/AIAssistantCare';
import { ProgressAndParents } from './components/modules/ProgressAndParents';
import { HappinessExperience } from './components/modules/HappinessExperience';
import { AILearningStudio } from './components/modules/AILearningStudio';
import { ImpactAndEvidenceReports } from './components/modules/ImpactAndEvidenceReports';
import { AICreativeCenter } from './components/modules/AICreativeCenter';

function MainLayout() {
  const { currentSession, isDemoMode } = useApp();
  const [currentModule, setCurrentModule] = useState<string>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', label: 'Trang Chủ Lớp 4A4', icon: Home },
    { key: 'module1', label: '1. Quản Lý Lớp & Sĩ Số', icon: Users },
    { key: 'module2', label: '2. AI Thấu Hiểu Học Sinh', icon: Lightbulb },
    { key: 'module3', label: '3. Hồ Sơ Chủ Nhiệm Số', icon: FileText },
    { key: 'module4', label: '4. AI Chăm Sóc & Nề Nếp', icon: Shield },
    { key: 'module5', label: '5. Tiến Bộ & Phụ Huynh', icon: TrendingUp },
    { key: 'module6', label: '6. Trải Nghiệm Hạnh Phúc', icon: Heart },
    { key: 'module7', label: '7. Học Liệu & 6 Trò Chơi', icon: Gamepad2 },
    { key: 'module8', label: '8. Minh Chứng Dự Thi', icon: Award },
    { key: 'creative_center', label: 'Sáng Tạo Nội Dung AI', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Secondary Sub-navigation Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation Scrollable */}
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentModule === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setCurrentModule(item.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="lg:hidden flex items-center justify-between w-full py-2.5">
              <span className="text-xs font-black text-sky-900 font-heading truncate">
                {navigationItems.find((i) => i.key === currentModule)?.label}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 shadow-md space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentModule === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setCurrentModule(item.key);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left flex items-center gap-2 ${
                  isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentModule === 'home' && (
          <HomePage onNavigate={(key) => setCurrentModule(key)} onOpenSettings={() => setIsSettingsOpen(true)} />
        )}
        {currentModule === 'module1' && <TeacherAndClassManagement />}
        {currentModule === 'module2' && <AIStudentUnderstanding />}
        {currentModule === 'module3' && <DigitalHomeroomProfile />}
        {currentModule === 'module4' && <AIAssistantCare />}
        {currentModule === 'module5' && <ProgressAndParents />}
        {currentModule === 'module6' && <HappinessExperience />}
        {currentModule === 'module7' && <AILearningStudio />}
        {currentModule === 'module8' && <ImpactAndEvidenceReports />}
        {currentModule === 'creative_center' && <AICreativeCenter />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-700">
            🌸 AI ĐỒNG HÀNH – KIẾN TẠO LỚP 4 HẠNH PHÚC
          </p>
          <p>
            Giáo viên chủ nhiệm: <strong>Lê Thị Giang</strong> • Trường Tiểu học Khoái Châu 1 • Huyện Khoái Châu, Hưng Yên
          </p>
          <p className="text-[11px] text-slate-400">
            "Công nghệ kết nối – Thấu hiểu yêu thương – Kiến tạo lớp 4 hạnh phúc"
          </p>
        </div>
      </footer>

      {/* Chatbot Companion */}
      <AIFriendChatbot />

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
