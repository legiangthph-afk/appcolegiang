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
    speechService.speak(
      'Xin chào! Đây là giọng đọc tiếng Việt của ứng dụng AI Đồng Hành – Kiến Tạo Lớp Bốn Hạnh Phúc.'
    );
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa phương / Xã, Tỉnh</label>
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

          {/* Sound & Vietnamese Speech Settings */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500" /> 🔊 Cài Đặt Giọng Đọc Tiếng Việt
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speechSettings.enabled}
                  onChange={(e) => setSpeechSettings({ ...speechSettings, enabled: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-700">Bật âm thanh ứng dụng</span>
              </label>
            </div>

            {/* TTS Status & Voice Source */}
            <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base">{speechService.hasVietnameseVoice() ? '🟢' : '🟡'}</span>
                <div>
                  <div className="font-bold text-slate-800">
                    {speechService.hasVietnameseVoice()
                      ? `Đã nhận diện ${speechService.getVietnameseVoices().length} giọng tiếng Việt trên thiết bị`
                      : 'Chưa phát hiện giọng tiếng Việt cài trên máy'}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {speechService.hasVietnameseVoice()
                      ? 'Thiết bị hỗ trợ phát âm trực tiếp chuẩn tiếng Việt qua Web Speech API.'
                      : 'Hệ thống tự động sử dụng dịch vụ TTS AI máy chủ để phát âm tiếng Việt 100% chuẩn xác, tuyệt đối không dùng giọng tiếng Anh đọc tiếng Việt.'}
                  </div>
                </div>
              </div>
            </div>

            {/* TTS Source Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Nguồn phát âm thanh tiếng Việt</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    id: 'auto',
                    title: 'Tự động lựa chọn',
                    desc: 'Ưu tiên máy, tự chuyển AI khi thiếu giọng',
                  },
                  {
                    id: 'device',
                    title: 'Giọng trên thiết bị',
                    desc: 'Dùng Web Speech API của trình duyệt',
                  },
                  {
                    id: 'server',
                    title: 'Dịch vụ TTS AI',
                    desc: 'Giọng đọc chuẩn tiếng Việt từ máy chủ',
                  },
                ].map((src) => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() =>
                      setSpeechSettings({
                        ...speechSettings,
                        ttsSource: src.id as 'auto' | 'device' | 'server',
                      })
                    }
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      speechSettings.ttsSource === src.id
                        ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="text-xs">{src.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{src.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Voice Selection if Available */}
            {speechService.hasVietnameseVoice() && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chọn giọng đọc tiếng Việt trên thiết bị
                </label>
                <select
                  value={speechSettings.selectedVoiceURI}
                  onChange={(e) =>
                    setSpeechSettings({ ...speechSettings, selectedVoiceURI: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Mặc định (Tự chọn giọng nữ / giọng tối ưu) --</option>
                  {speechService.getVietnameseVoices().map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Rate & Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Tốc độ đọc</span>
                  <span className="text-sky-600 font-bold">{speechSettings.rate}x (Chuẩn: 0.9x)</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={speechSettings.rate}
                  onChange={(e) =>
                    setSpeechSettings({ ...speechSettings, rate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Chậm (0.7x)</span>
                  <span>Vừa phải (0.9x)</span>
                  <span>Nhanh (1.3x)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Âm lượng</span>
                  <span className="text-sky-600 font-bold">{Math.round(speechSettings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={speechSettings.volume}
                  onChange={(e) =>
                    setSpeechSettings({ ...speechSettings, volume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Nhỏ</span>
                  <span>Vừa</span>
                  <span>Tối đa (100%)</span>
                </div>
              </div>
            </div>

            {/* Auto Read Chatbot Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="autoReadBot"
                checked={speechSettings.autoReadChatbot}
                onChange={(e) =>
                  setSpeechSettings({ ...speechSettings, autoReadChatbot: e.target.checked })
                }
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="autoReadBot" className="text-xs text-slate-700 cursor-pointer">
                Tự động đọc to phản hồi của Robot "Bạn AI Hạnh Phúc" khi có tin nhắn mới
              </label>
            </div>

            {/* Test Voice & Stop Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestSpeech}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Volume2 className="w-4 h-4" /> THỬ GIỌNG TIẾNG VIỆT
              </button>

              <button
                type="button"
                onClick={() => speechService.stop()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                DỪNG ĐỌC
              </button>
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
