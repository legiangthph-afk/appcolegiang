import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Award,
  Flame,
  Star,
  Shuffle,
  Compass,
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { useApp } from '../../context/AppContext';

export type GameType =
  | 'millionaire'
  | 'wheel'
  | 'matching'
  | 'crossword'
  | 'true_false'
  | 'obstacle';

const DEFAULT_QUESTIONS = [
  {
    q: 'Số 48 520 đọc là gì?',
    options: [
      'Bốn mươi tám nghìn năm trăm hai mươi',
      'Bốn tám nghìn năm trăm hai mươi',
      'Bốn mươi tám nghìn năm hai mươi',
      'Bốn mươi tám nghìn không trăm hai mươi',
    ],
    correct: 0,
    hint: 'Lớp nghìn gồm 48, lớp đơn vị gồm 520.',
  },
  {
    q: 'Trong câu "Cô giáo em rất dịu dàng và yêu thương học sinh", từ nào là từ chỉ đặc điểm?',
    options: ['Cô giáo', 'Dịu dàng', 'Học sinh', 'Yêu thương'],
    correct: 1,
    hint: 'Từ chỉ đặc điểm là tính từ miêu tả tính nết, hình dáng...',
  },
  {
    q: '1 tấn bằng bao nhiêu ki-lô-gam?',
    options: ['10 kg', '100 kg', '1000 kg', '10 000 kg'],
    correct: 2,
    hint: 'Tấn -> Tạ -> Yến -> Ki-lô-gam (gấp 10 lần mỗi bậc).',
  },
  {
    q: 'Cây lúa nước cần những điều kiện nào sau đây để sinh trưởng tốt nhất?',
    options: ['Nước, ánh sáng, chất khoáng, không khí', 'Chỉ cần bóng râm', 'Chỉ cần phân bón', 'Càng khô cằn càng tốt'],
    correct: 0,
    hint: 'Thực vật có hoa luôn cần đầy đủ nước, ánh sáng và dinh dưỡng.',
  },
  {
    q: 'Tỉnh Hưng Yên giáp với thủ đô nào của nước ta?',
    options: ['Hải Phòng', 'Hà Nội', 'Đà Nẵng', 'Huế'],
    correct: 1,
    hint: 'Phía Tây Bắc của Hưng Yên tiếp giáp với thủ đô nghìn năm văn hiến.',
  },
];

export const InteractiveGames: React.FC = () => {
  const { currentSession, awardStar } = useApp();
  const [activeGame, setActiveGame] = useState<GameType>('millionaire');
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameVolume, setGameVolume] = useState(() => speechService.getSettings().volume ?? 1.0);

  // 1. Millionaire State
  const [milIndex, setMilIndex] = useState(0);
  const [milSelected, setMilSelected] = useState<number | null>(null);
  const [milAnswered, setMilAnswered] = useState(false);
  const [milGameOver, setMilGameOver] = useState(false);

  // 2. Lucky Wheel State
  const [wheelAngle, setWheelAngle] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const wheelRewards = [
    '⭐ +5 Ngôi sao Hạnh phúc',
    '🎁 1 Tràng pháo tay giòn giã',
    '⭐ +10 Ngôi sao Tiến bộ',
    '🎉 Làm nhóm trưởng 1 ngày',
    '⭐ +3 Sao Việc tốt',
    '✨ Chọn bài hát sinh hoạt',
    '⭐ +8 Sao Chăm chỉ',
    '🌟 Vinh danh Bảng vàng tuần',
  ];

  // 3. Matching Game State
  const [matchingPairs] = useState([
    { id: '1', left: '1 thế kỷ', right: '100 năm' },
    { id: '2', left: '1 tạ', right: '100 kg' },
    { id: '3', left: '1 năm nhuận', right: '366 ngày' },
    { id: '4', left: 'Góc vuông', right: '90 độ' },
  ]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  // 4. Crossword State
  const [crosswordAnswer, setCrosswordAnswer] = useState('');
  const [crosswordSuccess, setCrosswordSuccess] = useState(false);

  // 5. True/False State
  const [tfIndex, setTfIndex] = useState(0);
  const tfQuestions = [
    { text: 'Số chẵn là số có chữ số tận cùng là 0, 2, 4, 6, 8.', answer: true, note: 'Chính xác! Các số này chia hết cho 2.' },
    { text: 'Một năm thông thường có 366 ngày.', answer: false, note: 'Sai rồi, năm thường chỉ có 365 ngày, năm nhuận mới có 366 ngày.' },
    { text: 'Chữ cái "H" trong từ Hạnh phúc có trục đối xứng.', answer: true, note: 'Đúng rồi, chữ H có cả trục đối xứng đứng và ngang.' },
    { text: 'Phố Hiến là thương cảng cổ thuộc tỉnh Hưng Yên.', answer: true, note: 'Chính xác! "Thứ nhất Kinh Kỳ, thứ nhì Phố Hiến".' },
  ];
  const [tfFeedback, setTfFeedback] = useState<string | null>(null);

  // 6. Obstacle Course State
  const [obsStep, setObsStep] = useState(1);
  const [obsAnswer, setObsAnswer] = useState<number | null>(null);

  const GAME_SOUND_PROMPTS = {
    start: 'Chào mừng bạn đến với trò chơi. Bạn đã sẵn sàng chưa nào?',
    correct: 'Chính xác! Chúc mừng bạn!',
    wrong: 'Chưa đúng rồi! Bạn hãy suy nghĩ và thử lại nhé!',
    finish: 'Tuyệt vời! Bạn đã hoàn thành trò chơi. Hãy tiếp tục cố gắng nhé!',
  };

  // Play game welcome greeting when starting or switching games
  useEffect(() => {
    if (soundEnabled) {
      speechService.speak(GAME_SOUND_PROMPTS.start);
    }
  }, [activeGame]);

  const handleReadText = (text: string) => {
    if (!soundEnabled) return;
    speechService.speak(text);
  };

  const triggerReward = (stars = 2, cheerText = GAME_SOUND_PROMPTS.correct) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    speechService.playSuccessSound();
    if (soundEnabled) {
      speechService.speak(cheerText);
    }
    setScore((prev) => prev + stars * 10);
    if (currentSession.studentId) {
      awardStar(currentSession.studentId, stars);
    }
  };

  // Millionaire actions
  const handleMilAnswer = (idx: number) => {
    if (milAnswered) return;
    setMilSelected(idx);
    setMilAnswered(true);

    const isCorrect = idx === DEFAULT_QUESTIONS[milIndex].correct;
    if (isCorrect) {
      triggerReward(3, GAME_SOUND_PROMPTS.correct);
      setTimeout(() => {
        if (milIndex + 1 < DEFAULT_QUESTIONS.length) {
          setMilIndex((prev) => prev + 1);
          setMilSelected(null);
          setMilAnswered(false);
        } else {
          setMilGameOver(true);
          triggerReward(10, GAME_SOUND_PROMPTS.finish);
        }
      }, 1500);
    } else {
      if (soundEnabled) {
        speechService.speak(GAME_SOUND_PROMPTS.wrong);
      }
    }
  };

  // Question and options speech reading
  const handleReadMilQuestion = () => {
    if (!soundEnabled) return;
    const q = DEFAULT_QUESTIONS[milIndex];
    speechService.speak(`Câu hỏi số ${milIndex + 1}: ${q.q}`);
  };

  const handleReadMilOptions = () => {
    if (!soundEnabled) return;
    const q = DEFAULT_QUESTIONS[milIndex];
    const letters = ['A', 'B', 'C', 'D'];
    const text = q.options.map((opt, i) => `Đáp án ${letters[i]}: ${opt}`).join('. ');
    speechService.speak(text);
  };

  // Spin Lucky Wheel
  const handleSpinWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult(null);

    const randomAngle = 1440 + Math.floor(Math.random() * 360);
    setWheelAngle((prev) => prev + randomAngle);

    setTimeout(() => {
      setWheelSpinning(false);
      const normalizedAngle = (wheelAngle + randomAngle) % 360;
      const index = Math.floor((360 - normalizedAngle) / (360 / wheelRewards.length)) % wheelRewards.length;
      const reward = wheelRewards[index];
      setWheelResult(reward);
      triggerReward(5, `Chúc mừng bạn! Bạn nhận được phần thưởng: ${reward}`);
    }, 3200);
  };

  // Matching actions
  const handleMatchRight = (pairId: string) => {
    if (!selectedLeft) return;
    if (selectedLeft === pairId) {
      setMatchedIds((prev) => [...prev, pairId]);
      setSelectedLeft(null);
      triggerReward(2, 'Chính xác! Bạn thật tuyệt vời!');
      if (matchedIds.length + 1 === matchingPairs.length) {
        setTimeout(() => {
          triggerReward(5, 'Chúc mừng bạn đã hoàn thành trò chơi! Hãy tiếp tục cố gắng nhé!');
        }, 1200);
      }
    } else {
      if (soundEnabled) {
        speechService.speak('Chưa chính xác rồi! Bạn hãy thử lại nhé!');
      }
      setSelectedLeft(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-white/20 rounded-lg text-xl">🎮</span>
              <h2 className="text-2xl font-bold font-heading">Trò Chơi Học Tập Tương Tác 4A4</h2>
            </div>
            <p className="text-sky-100 text-sm mt-1">
              Vừa học vừa chơi – Kích thích sáng tạo – Âm thanh & Điểm thưởng tiếng Việt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/20">
              <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
              <span className="text-sm font-semibold">Điểm số:</span>
              <span className="text-xl font-bold text-amber-300">{score}</span>
            </div>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 text-xs">
              <span className="text-[11px] font-semibold">Âm lượng:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={gameVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setGameVolume(val);
                  speechService.saveSettings({ volume: val });
                }}
                className="w-16 accent-amber-300 cursor-pointer"
                title={`Âm lượng: ${Math.round(gameVolume * 100)}%`}
              />
              <span className="font-bold text-amber-200">{Math.round(gameVolume * 100)}%</span>
            </div>

            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                speechService.saveSettings({ enabled: nextState });
                if (!nextState) speechService.stop();
              }}
              className={`p-2.5 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-sm'
                  : 'bg-white/10 text-white/70 border-white/20'
              }`}
              title={soundEnabled ? 'Tắt âm thanh trò chơi' : 'Bật âm thanh trò chơi'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Game Mode Tabs */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'millionaire', name: 'Ai là triệu phú', icon: '🏆' },
            { id: 'wheel', name: 'Vòng quay may mắn', icon: '🎡' },
            { id: 'matching', name: 'Ghép đôi kiến thức', icon: '🧩' },
            { id: 'crossword', name: 'Ô chữ bí mật', icon: '🔤' },
            { id: 'true_false', name: 'Đúng hay Sai', icon: '⚡' },
            { id: 'obstacle', name: 'Vượt chướng ngại vật', icon: '🚩' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveGame(tab.id as GameType);
                speechService.playGentleDing();
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeGame === tab.id
                  ? 'bg-white text-sky-700 shadow-md font-bold'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="p-6 min-h-[480px] bg-slate-50/50">
        {/* 1. AI LÀ TRIỆU PHÚ NHÍ */}
        {activeGame === 'millionaire' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!milGameOver ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-sky-100 text-sky-700 font-bold text-xs rounded-full">
                      CÂU HỎI {milIndex + 1} / {DEFAULT_QUESTIONS.length}
                    </span>
                    <button
                      onClick={handleReadMilQuestion}
                      className="px-2.5 py-1 text-xs bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 rounded-lg border border-sky-200 flex items-center gap-1.5 transition-all"
                      title="Đọc câu hỏi bằng tiếng Việt"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Đọc câu hỏi
                    </button>
                    <button
                      onClick={handleReadMilOptions}
                      className="px-2.5 py-1 text-xs bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 rounded-lg border border-amber-200 flex items-center gap-1.5 transition-all"
                      title="Đọc các lựa chọn trả lời A, B, C, D"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Đọc các đáp án
                    </button>
                    <button
                      onClick={handleReadMilQuestion}
                      className="px-2.5 py-1 text-xs bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-all"
                      title="Nghe lại"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Nghe lại
                    </button>
                  </div>
                  <span className="text-amber-500 font-bold text-sm flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400" /> +30 điểm
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">
                  {DEFAULT_QUESTIONS[milIndex].q}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEFAULT_QUESTIONS[milIndex].options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isSelected = milSelected === idx;
                    const isCorrect = idx === DEFAULT_QUESTIONS[milIndex].correct;

                    let btnStyle = 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700';
                    if (milAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 text-white border-rose-600';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-sky-100 border-sky-400 text-sky-900';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleMilAnswer(idx)}
                        disabled={milAnswered}
                        className={`p-4 rounded-xl border text-left font-medium transition-all flex items-start gap-3 ${btnStyle}`}
                      >
                        <span className="w-7 h-7 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs shrink-0">
                          {letters[idx]}
                        </span>
                        <span className="text-sm pt-0.5 leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {milAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sm text-sky-800 flex items-start gap-2.5"
                  >
                    <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Gợi ý kiến thức:</span> {DEFAULT_QUESTIONS[milIndex].hint}
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-slate-800 mb-2">CHIẾN THẮNG XUẤT SẮC!</h3>
                <p className="text-slate-600 mb-6">
                  Em đã vượt qua toàn bộ câu hỏi và ghi danh vào Bảng vàng trí tuệ lớp 4A4!
                </p>
                <button
                  onClick={() => {
                    setMilIndex(0);
                    setMilSelected(null);
                    setMilAnswered(false);
                    setMilGameOver(false);
                  }}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Chơi lại ván mới
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. VÒNG QUAY MAY MẮN */}
        {activeGame === 'wheel' && (
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-1">Vòng Quay Hạnh Phúc 4A4</h3>
              <p className="text-slate-500 text-sm mb-6">Quay vòng quay để nhận điểm thưởng và nhiệm vụ danh dự!</p>

              {/* Wheel Graphic */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Needle */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-rose-600 drop-shadow-md" />

                {/* Spinning Circle */}
                <div
                  style={{
                    transform: `rotate(${wheelAngle}deg)`,
                    transition: wheelSpinning ? 'transform 3.2s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                  }}
                  className="w-full h-full rounded-full border-8 border-amber-400 shadow-xl overflow-hidden relative bg-gradient-to-tr from-sky-400 via-indigo-400 to-amber-300"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-md z-10 flex items-center justify-center font-black text-sky-700 text-sm">
                      4A4
                    </div>
                  </div>
                  {/* Visual segments */}
                  <div className="absolute inset-0 border-4 border-dashed border-white/40 rounded-full" />
                </div>
              </div>

              {wheelResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-amber-900 font-bold text-lg"
                >
                  {wheelResult}
                </motion.div>
              )}

              <button
                onClick={handleSpinWheel}
                disabled={wheelSpinning}
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-lg rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                {wheelSpinning ? 'Đang quay...' : 'QUAY NGAY!'}
              </button>
            </div>
          </div>
        )}

        {/* 3. GHÉP ĐÔI KIẾN THỨC */}
        {activeGame === 'matching' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Thử Thách Nối Cặp Kiến Thức</h3>
              <p className="text-slate-500 text-sm mb-6">
                Chọn một ô bên trái rồi nhấp chọn ô tương ứng bên phải để tạo thành cặp đúng.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">Cột A: Khái niệm</span>
                  {matchingPairs.map((pair) => {
                    const isMatched = matchedIds.includes(pair.id);
                    const isSelected = selectedLeft === pair.id;

                    return (
                      <button
                        key={pair.id}
                        disabled={isMatched}
                        onClick={() => setSelectedLeft(pair.id)}
                        className={`w-full p-4 rounded-xl border text-left font-bold text-sm transition-all ${
                          isMatched
                            ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                            : isSelected
                            ? 'bg-sky-500 text-white border-sky-600 shadow-md scale-102'
                            : 'bg-white hover:bg-sky-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {pair.left}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Cột B: Giá trị</span>
                  {/* Render in slightly scrambled order */}
                  {[matchingPairs[2], matchingPairs[0], matchingPairs[3], matchingPairs[1]].map((pair) => {
                    const isMatched = matchedIds.includes(pair.id);

                    return (
                      <button
                        key={pair.id}
                        disabled={isMatched}
                        onClick={() => handleMatchRight(pair.id)}
                        className={`w-full p-4 rounded-xl border text-left font-bold text-sm transition-all ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-white hover:bg-amber-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {pair.right}
                      </button>
                    );
                  })}
                </div>
              </div>

              {matchedIds.length === matchingPairs.length && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 font-bold">
                  🎉 Xuất sắc! Em đã hoàn thành việc ghép đôi tất cả các cặp kiến thức!
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Ô CHỮ BÍ MẬT */}
        {activeGame === 'crossword' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Giải Mã Ô Chữ Bí Mật</h3>
              <p className="text-slate-500 text-sm mb-6">
                Từ khóa gồm 8 chữ cái: "Từ biểu thị niềm vui sướng, bình an và hạnh phúc trọn vẹn trong lớp học 4A4".
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {'HANHPHUC'.split('').map((char, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 border-2 border-sky-400 rounded-lg flex items-center justify-center font-black text-sky-800 bg-sky-50 text-lg shadow-sm"
                  >
                    {crosswordSuccess ? char : '?'}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={crosswordAnswer}
                  onChange={(e) => setCrosswordAnswer(e.target.value)}
                  placeholder="Nhập câu trả lời (Viết hoa hoặc thường)..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-center font-bold text-lg"
                />

                <button
                  onClick={() => {
                    const clean = crosswordAnswer.trim().toLowerCase().replace(/\s+/g, '');
                    if (clean === 'hanhphuc' || clean === 'hạnhphúc') {
                      setCrosswordSuccess(true);
                      triggerReward(5, GAME_SOUND_PROMPTS.correct);
                    } else {
                      if (soundEnabled) {
                        speechService.speak(GAME_SOUND_PROMPTS.wrong);
                      }
                    }
                  }}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Kiểm tra đáp án
                </button>
              </div>

              {crosswordSuccess && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-center text-sm font-semibold">
                  Chúc mừng em đã mở khóa Ô Chữ Bí Mật: <strong>HẠNH PHÚC</strong>!
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. ĐÚNG HAY SAI */}
        {activeGame === 'true_false' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
                  CÂU HỎI {tfIndex + 1} / {tfQuestions.length}
                </span>
                <button
                  onClick={() => handleReadText(tfQuestions[tfIndex].text)}
                  className="p-1 text-sky-600 hover:bg-sky-50 rounded-lg"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">
                "{tfQuestions[tfIndex].text}"
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const correct = tfQuestions[tfIndex].answer === true;
                    if (correct) {
                      triggerReward(2, GAME_SOUND_PROMPTS.correct);
                      setTfFeedback(tfQuestions[tfIndex].note);
                    } else {
                      if (soundEnabled) {
                        speechService.speak(GAME_SOUND_PROMPTS.wrong);
                      }
                      setTfFeedback(tfQuestions[tfIndex].note);
                    }
                  }}
                  className="py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <CheckCircle className="w-6 h-6" /> ĐÚNG
                </button>

                <button
                  onClick={() => {
                    const correct = tfQuestions[tfIndex].answer === false;
                    if (correct) {
                      triggerReward(2, GAME_SOUND_PROMPTS.correct);
                      setTfFeedback(tfQuestions[tfIndex].note);
                    } else {
                      if (soundEnabled) {
                        speechService.speak(GAME_SOUND_PROMPTS.wrong);
                      }
                      setTfFeedback(tfQuestions[tfIndex].note);
                    }
                  }}
                  className="py-4 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-lg flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <XCircle className="w-6 h-6" /> SAI
                </button>
              </div>

              {tfFeedback && (
                <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-200 text-sky-800 text-sm">
                  <strong>Giải thích:</strong> {tfFeedback}
                  <div className="mt-3 text-right">
                    <button
                      onClick={() => {
                        setTfFeedback(null);
                        setTfIndex((prev) => (prev + 1) % tfQuestions.length);
                      }}
                      className="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold"
                    >
                      Câu tiếp theo →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. VƯỢT CHƯỚNG NGẠI VẬT */}
        {activeGame === 'obstacle' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Đường Lên Đỉnh Núi Tri Thức</h3>
              <p className="text-slate-500 text-sm mb-6">Vượt qua 3 chướng ngại vật để cắm cờ chiến thắng!</p>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-0" />
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      obsStep >= step
                        ? 'bg-sky-500 text-white shadow-md'
                        : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                <span className="text-xs font-bold text-sky-600 uppercase">Chướng ngại vật {obsStep}:</span>
                <p className="font-bold text-slate-800 mt-1">
                  {obsStep === 1 && 'Tìm giá trị của biểu thức: 45 + 15 x 2 = ?'}
                  {obsStep === 2 && 'Từ nào viết đúng chính tả: "xắp xếp" hay "sắp xếp"?'}
                  {obsStep === 3 && 'Lớp 4A4 có khẩu hiệu là gì?'}
                </p>
              </div>

              <div className="space-y-2">
                {obsStep === 1 &&
                  [
                    { text: '120', val: 1 },
                    { text: '75', val: 2 }, // correct: 15*2 = 30 + 45 = 75
                    { text: '90', val: 3 },
                  ].map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (o.val === 2) {
                          triggerReward(3, 'Chính xác! Bạn thật tuyệt vời!');
                          setObsStep(2);
                        } else {
                          if (soundEnabled) {
                            speechService.speak('Chưa chính xác rồi! Bạn hãy thử lại nhé!');
                          }
                        }
                      }}
                      className="w-full p-3 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl font-medium text-left text-sm"
                    >
                      {o.text}
                    </button>
                  ))}

                {obsStep === 2 &&
                  [
                    { text: 'xắp xếp', val: 1 },
                    { text: 'sắp xếp', val: 2 }, // correct
                  ].map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (o.val === 2) {
                          triggerReward(3, 'Chính xác! Bạn thật tuyệt vời!');
                          setObsStep(3);
                        } else {
                          if (soundEnabled) {
                            speechService.speak('Chưa chính xác rồi! Bạn hãy thử lại nhé!');
                          }
                        }
                      }}
                      className="w-full p-3 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl font-medium text-left text-sm"
                    >
                      {o.text}
                    </button>
                  ))}

                {obsStep === 3 &&
                  [
                    { text: 'Công nghệ kết nối – Thấu hiểu yêu thương – Kiến tạo lớp 4 hạnh phúc', val: 1 },
                    { text: 'Học tập thật chăm chỉ', val: 2 },
                  ].map((o, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (o.val === 1) {
                          triggerReward(10, 'Chúc mừng bạn đã hoàn thành trò chơi! Hãy tiếp tục cố gắng nhé!');
                          setObsStep(1);
                        } else {
                          if (soundEnabled) {
                            speechService.speak('Chưa chính xác rồi! Bạn hãy thử lại nhé!');
                          }
                        }
                      }}
                      className="w-full p-3 bg-white hover:bg-sky-50 border border-slate-200 rounded-xl font-medium text-left text-sm"
                    >
                      {o.text}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
