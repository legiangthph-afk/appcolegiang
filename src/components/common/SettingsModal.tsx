import React, { useState } from 'react';
import { X, Save, RefreshCcw, Image, Volume2, User, School, Phone, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { speechService } from '../../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { teacherProfile, updateTeacherProfile, resetToDefaultData } = useApp();

  const [formData, setFormData] = useState({ ...teacherProfile });
  const [speechSettings, setSpeechSettings] = useState(() => speechService.getSettings());
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile(formData);
    speechService.saveSettings(speechSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleTestSpeech = () => {
    speechService.saveSettings(speechSettings);
    speechService.speak('Xin chào cô giáo Lê Thị Giang và các bạn học sinh lớp 4A4!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-bold font-heading">Cài Đặt Hồ Sơ & Lớp Học 4A4</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Thông tin Giáo viên Chủ nhiệm & Nhà trường
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên Giáo viên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Trường Tiểu học</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lớp phụ trách</label>
                <input
                  type="text"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa phương / Huyện, Tỉnh</label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Khẩu hiệu / Tôn chỉ lớp học</label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Images */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" /> Hình ảnh đại diện & Logo
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ảnh đại diện Giáo viên (URL hoặc đường dẫn ảnh)</label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.avatarUrl}
                    alt="Preview"
                    className="w-12 h-15 rounded-xl object-cover object-top border border-slate-200 bg-sky-50 shadow-xs"
                  />
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    placeholder="/assets/aistudio/... hoặc https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">URL Ảnh bìa tập thể Lớp 4A4</label>
                <input
                  type="url"
                  value={formData.classCoverUrl}
                  onChange={(e) => setFormData({ ...formData, classCoverUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Sound & Speech Settings */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Cài đặt Giọng đọc tiếng Việt (TTS)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tốc độ đọc ({speechSettings.rate}x)
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.3"
                  step="0.05"
                  value={speechSettings.rate}
                  onChange={(e) =>
                    setSpeechSettings({ ...speechSettings, rate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={handleTestSpeech}
                  className="px-4 py-2 bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 hover:bg-sky-100 transition-all flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" /> Thử giọng đọc tiếng Việt
                </button>
              </div>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-700">Khôi phục dữ liệu ban đầu</div>
              <div className="text-[11px] text-slate-500">Xóa các sửa đổi và nạp lại danh sách mẫu lớp 4A4</div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn nạp lại dữ liệu mẫu ban đầu của lớp 4A4?')) {
                  resetToDefaultData();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Nạp lại dữ liệu mẫu
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saveSuccess ? 'Đã lưu thành công!' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
