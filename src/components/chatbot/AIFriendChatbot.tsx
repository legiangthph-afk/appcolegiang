import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  Smile,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { speechService } from '../../services/speechService';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AIFriendChatbot: React.FC = () => {
  const { currentSession } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'teacher' | 'student' | 'parent'>(
    currentSession.role === 'student' ? 'student' : currentSession.role === 'parent' ? 'parent' : 'teacher'
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync role with session when changed
  useEffect(() => {
    if (currentSession.role === 'student') setActiveRole('student');
    else if (currentSession.role === 'parent') setActiveRole('parent');
    else setActiveRole('teacher');
  }, [currentSession.role]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Xin chào! Mình là Bạn AI Hạnh Phúc 🤖🌸 – người bạn đồng hành thông minh của lớp 4A4 Trường Tiểu học Khoái Châu 1. Hôm nay mình có thể hỗ trợ gì cho bạn?',
      timestamp: 'Bây giờ',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Voice recognition
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận dạng giọng nói. Bạn hãy gõ câu hỏi bằng bàn phím nhé!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const query = (customText || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text,
      }));

      const reply = await aiService.sendChatMessage(query, activeRole, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak AI reply if sound enabled
      if (soundEnabled) {
        speechService.speak(reply);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Xin lỗi, Bạn AI đang gặp chút gián đoạn kết nối. Bạn thử gửi lại nhé!',
          timestamp: 'Bây giờ',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = {
    teacher: [
      'Gợi ý cách động viên học sinh còn rụt rè khi phát biểu',
      'Xây dựng kịch bản 5 phút khởi động giờ sinh hoạt lớp',
      'Phương pháp phối hợp tích cực với phụ huynh khi con giảm tập trung',
    ],
    student: [
      'Đố mình một câu đố vui Toán học lớp 4!',
      'Làm sao để mình tự tin hơn khi lên bảng?',
      'Kể cho mình nghe một câu chuyện ngắn về lòng nhân ái',
    ],
    parent: [
      'Cách rèn con tự giác ngồi vào bàn học đúng 7 giờ tối',
      'Nên làm gì khi con chia sẻ bị điểm kém?',
      'Cách lắng nghe cảm xúc của trẻ 9-10 tuổi',
    ],
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              speechService.playGentleDing();
            }
          }}
          className="relative group p-3.5 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white/60 hover:shadow-sky-400/50"
        >
          <div className="relative">
            <Bot className="w-8 h-8 animate-float-slow" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border-2 border-white rounded-full" />
          </div>

          <div className="hidden md:flex flex-col text-left ml-3 mr-1">
            <span className="text-xs font-bold leading-none">Bạn AI</span>
            <span className="text-[10px] text-sky-200">Hạnh Phúc</span>
          </div>
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-h-[80vh] h-[640px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-xl shadow-inner">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base leading-tight font-heading flex items-center gap-1.5">
                      Bạn AI Hạnh Phúc
                      <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.5 rounded-full">
                        LỚP 4A4
                      </span>
                    </h3>
                    <p className="text-[11px] text-sky-100">Trợ lý đồng hành & kết nối yêu thương</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (!next) speechService.stop();
                    }}
                    className={`p-2 rounded-xl transition-all ${
                      soundEnabled ? 'text-amber-300 hover:bg-white/10' : 'text-white/50 hover:bg-white/10'
                    }`}
                    title={soundEnabled ? 'Tắt đọc tự động' : 'Bật đọc tự động'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Persona Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 mt-3 bg-black/15 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveRole('teacher');
                    speechService.playGentleDing();
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === 'teacher' ? 'bg-white text-sky-800 shadow-sm' : 'text-sky-100 hover:bg-white/10'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Giáo viên
                </button>

                <button
                  onClick={() => {
                    setActiveRole('student');
                    speechService.playGentleDing();
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === 'student' ? 'bg-white text-sky-800 shadow-sm' : 'text-sky-100 hover:bg-white/10'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  Học sinh
                </button>

                <button
                  onClick={() => {
                    setActiveRole('parent');
                    speechService.playGentleDing();
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeRole === 'parent' ? 'bg-white text-sky-800 shadow-sm' : 'text-sky-100 hover:bg-white/10'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Phụ huynh
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm relative group ${
                      msg.sender === 'user'
                        ? 'bg-sky-600 text-white rounded-br-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => speechService.speak(msg.text)}
                        className="mt-2 text-sky-600 hover:text-sky-700 flex items-center gap-1 text-[11px] font-bold"
                        title="Đọc lại câu trả lời"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Nghe đọc
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-slate-200 w-fit">
                  <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 italic ml-1">Bạn AI đang suy nghĩ câu trả lời...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex gap-2 overflow-x-auto scrollbar-none">
              {quickPrompts[activeRole].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] whitespace-nowrap hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-all font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
                title="Nói để nhập bằng giọng nói tiếng Việt"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                placeholder={
                  activeRole === 'teacher'
                    ? 'Hỏi phương pháp, ý tưởng sinh hoạt lớp...'
                    : activeRole === 'student'
                    ? 'Hỏi bài, đố vui cùng Bạn AI...'
                    : 'Hỏi cách đồng hành cùng con...'
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />

              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
