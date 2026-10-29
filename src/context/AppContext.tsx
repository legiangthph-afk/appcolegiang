import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TeacherProfile,
  Student,
  AttendanceRecord,
  EmotionLog,
  HappinessMission,
  GoodDeedPost,
  SurveyResponse,
  LearningMaterial,
  ParentMessage,
  UserRole,
  UserSession,
} from '../types';

interface AppContextType {
  // Session & Auth
  currentSession: UserSession;
  setSessionRole: (role: UserRole, studentId?: string) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;

  // Teacher Profile
  teacherProfile: TeacherProfile;
  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;

  // Students Management
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => boolean;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  awardStar: (studentId: string, count?: number) => void;
  importStudentsCSV: (csvText: string) => { added: number; duplicates: number };

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (studentId: string, date: string, status: 'present' | 'excused' | 'unexcused', note?: string) => void;
  getAttendanceForDate: (date: string) => { present: number; excused: number; unexcused: number; total: number };

  // Happiness Missions
  missions: HappinessMission[];
  addMission: (mission: Omit<HappinessMission, 'id' | 'createdAt'>) => void;
  toggleMissionComplete: (missionId: string, studentId: string) => void;

  // Emotions
  emotionLogs: EmotionLog[];
  addEmotionLog: (log: Omit<EmotionLog, 'id' | 'timestamp'>) => void;
  markEmotionRead: (id: string) => void;

  // Good Deeds
  goodDeeds: GoodDeedPost[];
  addGoodDeed: (deed: Omit<GoodDeedPost, 'id' | 'timestamp' | 'approved' | 'likes'>) => void;
  toggleApproveDeed: (id: string) => void;
  likeDeed: (id: string) => void;

  // Survey
  surveys: SurveyResponse[];
  submitSurvey: (survey: Omit<SurveyResponse, 'id' | 'date'>) => void;
  updateSurveyAnalysis: (surveyId: string, analysis: any) => void;
  confirmSurveyAnalysis: (surveyId: string) => void;

  // Learning Materials
  materials: LearningMaterial[];
  addMaterial: (material: Omit<LearningMaterial, 'id' | 'createdAt'>) => void;
  deleteMaterial: (id: string) => void;

  // Parent Messages
  parentMessages: ParentMessage[];
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'date' | 'readStatus'>) => void;
  markParentMessageRead: (id: string) => void;

  // Reset demo data
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_TEACHER: TeacherProfile = {
  name: 'Lê Thị Giang',
  school: 'Trường Tiểu học Khoái Châu 1',
  className: '4A4',
  academicYear: '2025 - 2026',
  roleTitle: 'Giáo viên Chủ nhiệm',
  province: 'Huyện Khoái Châu, Tỉnh Hưng Yên',
  phone: '0988.123.456',
  email: 'legiangthph@gmail.com',
  avatarUrl: '/assets/aistudio/image_562566a4.png',
  classCoverUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
  schoolLogoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&auto=format&fit=crop&q=80',
  slogan: 'Công nghệ kết nối – Thấu hiểu yêu thương – Kiến tạo lớp 4 hạnh phúc',
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'hs-01',
    code: 'HS4A4-01',
    fullName: 'Nguyễn Hải Đăng',
    gender: 'Nam',
    dob: '2016-03-15',
    groupNumber: 1,
    parentName: 'Nguyễn Văn Minh',
    parentPhone: '0912.345.001',
    address: 'Thị trấn Khoái Châu',
    strengths: ['Tư duy Toán học nhanh', 'Yêu thích đọc sách', 'Rất lễ phép'],
    supportNeeds: ['Đôi lúc còn nói nhỏ khi phát biểu trước lớp'],
    personalGoals: ['Tự tin xung phong phát biểu 2 lần mỗi ngày'],
    teacherNotes: 'Em có năng lực tiếp thu rất tốt, cần khuyến khích hoạt động nhóm để tăng sự tự tin.',
    starsCount: 38,
    badges: ['Nhà toán học nhí', 'Ngôi sao chăm chỉ', 'Chiến sĩ đọc sách'],
  },
  {
    id: 'hs-02',
    code: 'HS4A4-02',
    fullName: 'Trần Mai Phương',
    gender: 'Nữ',
    dob: '2016-05-20',
    groupNumber: 1,
    parentName: 'Trần Thị Thu',
    parentPhone: '0912.345.002',
    address: 'Xã Dạ Trạch, Khoái Châu',
    strengths: ['Chữ viết đẹp', 'Giọng đọc truyền cảm', 'Khéo tay vẽ tranh'],
    supportNeeds: ['Cần rèn thêm kỹ năng tính nhẩm nhanh'],
    personalGoals: ['Hoàn thành bài tập Toán trong 20 phút'],
    teacherNotes: 'Lớp phó văn nghệ gương mẫu, biết giúp đỡ bạn bè cùng bàn.',
    starsCount: 42,
    badges: ['Văn hay chữ tốt', 'Họa sĩ tí hon', 'Đại sứ nụ cười'],
  },
  {
    id: 'hs-03',
    code: 'HS4A4-03',
    fullName: 'Lê Hoàng Nam',
    gender: 'Nam',
    dob: '2016-01-10',
    groupNumber: 1,
    parentName: 'Lê Văn Cường',
    parentPhone: '0912.345.003',
    address: 'Xã Đông Tảo, Khoái Châu',
    strengths: ['Nhanh nhẹn', 'Thích môn Khoa học và Khám phá', 'Nhiệt tình dọn dẹp vệ sinh lớp'],
    supportNeeds: ['Thỉnh thoảng quên chuẩn bị compa, thước kẻ'],
    personalGoals: ['Chuẩn bị đầy đủ sách vở trước khi đi ngủ'],
    teacherNotes: 'Em rất giàu tình cảm, đã tiến bộ nhiều về tính cẩn thận.',
    starsCount: 30,
    badges: ['Hiệp sĩ việc tốt', 'Nhà thám hiểm nhí'],
  },
  {
    id: 'hs-04',
    code: 'HS4A4-04',
    fullName: 'Vũ Bảo Châu',
    gender: 'Nữ',
    dob: '2016-08-12',
    groupNumber: 2,
    parentName: 'Vũ Hoàng Quân',
    parentPhone: '0912.345.004',
    address: 'Xã Bình Minh, Khoái Châu',
    strengths: ['Hòa đồng', 'Tích cực tham gia trò chơi tương tác', 'Biết chia sẻ đồ dùng'],
    supportNeeds: ['Còn rụt rè khi làm việc với bạn mới'],
    personalGoals: ['Kết bạn và trò chuyện với 3 bạn trong tổ khác'],
    teacherNotes: 'Tâm hồn trong sáng, luôn nở nụ cười chào cô mỗi sáng.',
    starsCount: 35,
    badges: ['Bạn thân thiện', 'Hoa việc tốt'],
  },
  {
    id: 'hs-05',
    code: 'HS4A4-05',
    fullName: 'Phạm Đức Anh',
    gender: 'Nam',
    dob: '2016-11-25',
    groupNumber: 2,
    parentName: 'Phạm Thị Lan',
    parentPhone: '0912.345.005',
    address: 'Xã Tân Dân, Khoái Châu',
    strengths: ['Yêu thích Tin học và Lập trình nhí', 'Ham học hỏi'],
    supportNeeds: ['Cần tập trung hơn trong giờ Đạo đức'],
    personalGoals: ['Ngồi ngay ngắn lắng nghe cô giảng bài suốt tiết'],
    teacherNotes: 'Thông minh, ham hiểu biết công nghệ.',
    starsCount: 33,
    badges: ['Chuyên gia công nghệ', 'Ngôi sao tiến bộ'],
  },
  {
    id: 'hs-06',
    code: 'HS4A4-06',
    fullName: 'Đỗ Thùy Linh',
    gender: 'Nữ',
    dob: '2016-04-05',
    groupNumber: 2,
    parentName: 'Đỗ Quốc Việt',
    parentPhone: '0912.345.006',
    address: 'Thị trấn Khoái Châu',
    strengths: ['Khả năng ghi nhớ tốt', 'Hát hay', 'Biết lắng nghe bạn bè'],
    supportNeeds: ['Cần luyện tập thêm bài toán có lời văn dạng phân số'],
    personalGoals: ['Giải đúng các bài toán tìm hai số khi biết tổng và hiệu'],
    teacherNotes: 'Em rất chăm ngoan, phụ huynh rất quan tâm phối hợp cùng cô.',
    starsCount: 39,
    badges: ['Chim sơn ca 4A4', 'Chiến sĩ đọc sách'],
  },
  {
    id: 'hs-07',
    code: 'HS4A4-07',
    fullName: 'Hoàng Minh Khôi',
    gender: 'Nam',
    dob: '2016-07-19',
    groupNumber: 3,
    parentName: 'Hoàng Văn Thắng',
    parentPhone: '0912.345.007',
    address: 'Xã Liên Khê, Khoái Châu',
    strengths: ['Khỏe khoắn', 'Thể thao giỏi', 'Thích hoạt động trải nghiệm ngoài trời'],
    supportNeeds: ['Chữ viết cần nắn nót hơn'],
    personalGoals: ['Luyện viết 1 trang chữ đẹp mỗi tối'],
    teacherNotes: 'Em luôn tiên phong khiêng bàn ghế và giúp đỡ bạn gái trong lớp.',
    starsCount: 31,
    badges: ['Vận động viên nhí', 'Hiệp sĩ giúp bạn'],
  },
  {
    id: 'hs-08',
    code: 'HS4A4-08',
    fullName: 'Bùi Gia Hân',
    gender: 'Nữ',
    dob: '2016-09-02',
    groupNumber: 3,
    parentName: 'Bùi Thị Hà',
    parentPhone: '0912.345.008',
    address: 'Xã An Vĩ, Khoái Châu',
    strengths: ['Kể chuyện hấp dẫn', 'Rất ngăn nắp', 'Giữ gìn sách vở cẩn thận'],
    supportNeeds: ['Đôi lúc lo lắng khi có bài kiểm tra'],
    personalGoals: ['Hít thở sâu và tự tin khi làm bài thi'],
    teacherNotes: 'Đã hoàn thành xuất sắc các phiếu khảo sát đầu năm.',
    starsCount: 40,
    badges: ['Búp măng xinh', 'Văn hay chữ tốt'],
  },
  {
    id: 'hs-09',
    code: 'HS4A4-09',
    fullName: 'Đặng Quốc Bảo',
    gender: 'Nam',
    dob: '2016-02-14',
    groupNumber: 4,
    parentName: 'Đặng Tuấn Anh',
    parentPhone: '0912.345.009',
    address: 'Xã Dạ Trạch, Khoái Châu',
    strengths: ['Tò mò khoa học', 'Lắp ghép mô hình khéo', 'Thích giúp bạn giảng bài'],
    supportNeeds: ['Cần tập trung viết chính tả nhanh hơn'],
    personalGoals: ['Viết kịp tốc độ đọc của cô giáo'],
    teacherNotes: 'Có tinh thần hỗ trợ các bạn trong tổ rất nhiệt tình.',
    starsCount: 36,
    badges: ['Đôi bạn cùng tiến', 'Kỹ sư nhí'],
  },
  {
    id: 'hs-10',
    code: 'HS4A4-10',
    fullName: 'Lương Ngọc Ánh',
    gender: 'Nữ',
    dob: '2016-10-18',
    groupNumber: 4,
    parentName: 'Lương Văn Long',
    parentPhone: '0912.345.010',
    address: 'Xã Đông Tảo, Khoái Châu',
    strengths: ['Trách nhiệm cao', 'Tổ trưởng gương mẫu', 'Đi học đúng giờ'],
    supportNeeds: ['Cần dám mạnh dạn nêu ý kiến phản biện'],
    personalGoals: ['Chủ động đóng góp ý kiến trong giờ sinh hoạt lớp'],
    teacherNotes: 'Cô rất an tâm khi giao nhiệm vụ tổ trưởng cho em.',
    starsCount: 44,
    badges: ['Cán bộ lớp tài năng', 'Gương mẫu 4A4', 'Hoa việc tốt'],
  },
];

const INITIAL_MISSIONS: HappinessMission[] = [
  {
    id: 'mis-01',
    title: 'Gửi một lời cảm ơn chân thành',
    description: 'Nói lời cảm ơn bố mẹ sau bữa tối hoặc cảm ơn một bạn trong lớp đã giúp đỡ em hôm nay.',
    category: 'loi_cam_on',
    stars: 3,
    difficulty: 'Dễ',
    weekNumber: 8,
    completedStudentIds: ['hs-01', 'hs-02', 'hs-04', 'hs-08', 'hs-10'],
    createdAt: '2026-10-25',
  },
  {
    id: 'mis-02',
    title: '15 phút đọc sách mở rộng',
    description: 'Đọc một câu chuyện hoặc một trang sách khoa học và kể lại cho bạn cùng bàn nghe điều em tâm đắc.',
    category: 'sach_hay',
    stars: 5,
    difficulty: 'Vừa',
    weekNumber: 8,
    completedStudentIds: ['hs-01', 'hs-02', 'hs-06', 'hs-08'],
    createdAt: '2026-10-25',
  },
  {
    id: 'mis-03',
    title: 'Đôi bạn cùng tiến - Cùng bạn vượt khó',
    description: 'Chủ động hướng dẫn hoặc hỏi bài một bạn trong tổ về bài tập Toán hoặc Tiếng Việt.',
    category: 'giup_ban',
    stars: 5,
    difficulty: 'Vừa',
    weekNumber: 8,
    completedStudentIds: ['hs-01', 'hs-03', 'hs-09', 'hs-10'],
    createdAt: '2026-10-26',
  },
  {
    id: 'mis-04',
    title: 'Bàn học nở hoa - Bảo vệ môi trường',
    description: 'Tự giác nhặt rác xung quanh chỗ ngồi của mình và xếp gọn gàng ngăn bàn trước khi ra về.',
    category: 'moi_truong',
    stars: 3,
    difficulty: 'Dễ',
    weekNumber: 8,
    completedStudentIds: ['hs-01', 'hs-03', 'hs-05', 'hs-07', 'hs-10'],
    createdAt: '2026-10-26',
  },
  {
    id: 'mis-05',
    title: 'Dũng cảm giơ tay phát biểu',
    description: 'Mạnh dạn xung phong phát biểu xây dựng bài ít nhất 1 lần trong tiết học hôm nay.',
    category: 'tu_lap',
    stars: 4,
    difficulty: 'Thử thách',
    weekNumber: 8,
    completedStudentIds: ['hs-01', 'hs-04'],
    createdAt: '2026-10-27',
  },
];

const INITIAL_EMOTIONS: EmotionLog[] = [
  {
    id: 'emo-01',
    studentId: 'hs-01',
    studentName: 'Nguyễn Hải Đăng',
    emotion: 'happy',
    note: 'Hôm nay em được cô Giang khen bài giải Toán nhanh nhất tổ 1!',
    timestamp: '2026-10-28 09:30',
    aiResponse: 'Tuyệt vời lắm Hải Đăng ơi! Cố gắng tiếp tục phát huy niềm đam mê với những con số kỳ diệu nhé!',
    flaggedForTeacher: false,
    teacherRead: true,
  },
  {
    id: 'emo-02',
    studentId: 'hs-04',
    studentName: 'Vũ Bảo Châu',
    emotion: 'worried',
    note: 'Sáng nay em để quên hộp bút sáp vẽ tranh ở nhà, em sợ không kịp giờ Mỹ thuật.',
    timestamp: '2026-10-28 10:15',
    aiResponse: 'Bảo Châu đừng quá lo lắng nhé! Bạn Phương tổ 1 có thể chia sẻ màu vẽ cùng em đó. Cô giáo luôn thấu hiểu và hỗ trợ em.',
    flaggedForTeacher: true,
    teacherRead: true,
  },
  {
    id: 'emo-03',
    studentId: 'hs-02',
    studentName: 'Trần Mai Phương',
    emotion: 'grateful',
    note: 'Em biết ơn bạn Nam đã giúp em lau bảng phụ sau tiết Lịch sử.',
    timestamp: '2026-10-29 08:45',
    aiResponse: 'Lời cảm ơn chân thành của Phương làm cho lớp 4A4 chúng mình ngập tràn tình bạn ấm áp!',
    flaggedForTeacher: false,
    teacherRead: false,
  },
];

const INITIAL_GOOD_DEEDS: GoodDeedPost[] = [
  {
    id: 'gd-01',
    fromName: 'Trần Mai Phương',
    toName: 'Lê Hoàng Nam',
    content: 'Cảm ơn bạn Nam đã nhặt giúp mình chiếc bút mực bị rơi dưới gầm bàn.',
    category: 'Cảm ơn',
    timestamp: '2026-10-28 11:10',
    approved: true,
    likes: 12,
  },
  {
    id: 'gd-02',
    fromName: 'Cô Lê Thị Giang',
    toName: 'Tập thể Tổ 3',
    content: 'Khen ngợi các bạn Tổ 3 đã chủ động xếp hàng ngay ngắn và giữ vệ sinh lớp học rất sạch đẹp.',
    category: 'Khen ngợi',
    timestamp: '2026-10-28 16:30',
    approved: true,
    likes: 24,
  },
  {
    id: 'gd-03',
    fromName: 'Đặng Quốc Bảo',
    toName: 'Nguyễn Hải Đăng',
    content: 'Bạn Đăng đã tận tình giải thích lại cách quy đồng mẫu số phân số cho mình hiểu bài.',
    category: 'Việc tốt',
    timestamp: '2026-10-29 07:50',
    approved: true,
    likes: 8,
  },
];

const INITIAL_SURVEYS: SurveyResponse[] = [
  {
    id: 'sur-01',
    studentId: 'hs-01',
    studentName: 'Nguyễn Hải Đăng',
    date: '2026-09-08',
    answers: {
      interests: ['Giải đố Toán học', 'Đọc truyện thiếu nhi', 'Lắp ráp Lego'],
      strengths: ['Tính toán nhanh', 'Tập trung cao'],
      improvementGoals: ['Tự tin nói to, dõng dạc trước đám đông'],
      learningStyle: ['Học qua hình ảnh minh họa', 'Học qua trò chơi đố vui'],
      classWishes: ['Lớp học có nhiều trò chơi trí tuệ và bạn bè đoàn kết'],
      confidenceLevel: 3,
      teamworkSkill: 4,
      schoolFeelings: 'Em rất thích đến trường vì được gặp cô và các bạn.',
      teacherSupportNeed: 'Mong cô gọi em phát biểu nhiều hơn để em bớt rụt rè ạ.',
    },
    aiAnalysis: {
      strengths: ['Tư duy logic nhạy bén', 'Thái độ học tập nghiêm túc', 'Kỹ năng làm việc nhóm tốt'],
      supportNeeds: ['Kỹ năng thuyết trình trước đám đông', 'Giải tỏa tâm lý e ngại'],
      recommendedGoals: ['Mỗi tuần tham gia trả lời câu hỏi ít nhất 5 lần với khẩu âm rõ ràng'],
      suggestedActivities: ['Phân công làm nhóm trưởng điều phối thảo luận', 'Khuyến khích tham gia trò chơi đố vui'],
      parentCollaboration: 'Gia đình cùng luyện tập với con bằng cách cho con kể lại câu chuyện của ngày ở trường.',
    },
    teacherConfirmed: true,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo Mode
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lop4_is_demo');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Current Session Role
  const [currentSession, setCurrentSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('lop4_session');
    return saved ? JSON.parse(saved) : { role: 'teacher', name: 'Cô Lê Thị Giang', isDemo: true };
  });

  // Teacher Profile
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('lop4_teacher_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.avatarUrl || parsed.avatarUrl.includes('unsplash.com')) {
          parsed.avatarUrl = '/assets/aistudio/image_562566a4.png';
        }
        return { ...DEFAULT_TEACHER, ...parsed };
      } catch {
        return DEFAULT_TEACHER;
      }
    }
    return DEFAULT_TEACHER;
  });

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lop4_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('lop4_attendance');
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    return INITIAL_STUDENTS.map((st, idx) => ({
      id: `att-${today}-${st.id}`,
      date: today,
      studentId: st.id,
      status: idx === 2 ? 'excused' : 'present', // one excused for realistic demo
      note: idx === 2 ? 'Gia đình có việc xin nghỉ 1 buổi' : undefined,
    }));
  });

  // Happiness Missions
  const [missions, setMissions] = useState<HappinessMission[]>(() => {
    const saved = localStorage.getItem('lop4_missions');
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  // Emotions
  const [emotionLogs, setEmotionLogs] = useState<EmotionLog[]>(() => {
    const saved = localStorage.getItem('lop4_emotions');
    return saved ? JSON.parse(saved) : INITIAL_EMOTIONS;
  });

  // Good Deeds
  const [goodDeeds, setGoodDeeds] = useState<GoodDeedPost[]>(() => {
    const saved = localStorage.getItem('lop4_good_deeds');
    return saved ? JSON.parse(saved) : INITIAL_GOOD_DEEDS;
  });

  // Surveys
  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => {
    const saved = localStorage.getItem('lop4_surveys');
    return saved ? JSON.parse(saved) : INITIAL_SURVEYS;
  });

  // Learning Materials
  const [materials, setMaterials] = useState<LearningMaterial[]>(() => {
    const saved = localStorage.getItem('lop4_materials');
    return saved ? JSON.parse(saved) : [
      {
        id: 'mat-01',
        title: 'Kế hoạch Sinh hoạt lớp Tuần 8: Tình bạn diệu kỳ & Đoàn kết là sức mạnh',
        subject: 'Hoạt động trải nghiệm',
        textbook: 'Kết nối tri thức',
        type: 'plan',
        week: 8,
        content: `I. MỤC TIÊU:
1. Năng lực đặc thù: Giúp học sinh nhận biết giá trị của tình bạn thân thiện, biết chia sẻ, lắng nghe và hợp tác cùng bạn trong tổ.
2. Phẩm chất: Nhân ái, trách nhiệm, trung thực trong tự đánh giá.
II. TIẾN TRÌNH HOẠT ĐỘNG:
- Khởi động: Trò chơi "Vỗ tay kết đoàn" tạo không khí vui tươi (5 phút).
- Nhìn lại điều tích cực: Tuyên dương các bạn có việc tốt trong tuần, trao sao hạnh phúc (10 phút).
- Hoạt động trải nghiệm: Thử thách "Cây bút thần kỳ kết nối" - mỗi tổ cùng hoàn thành bức tranh tình bạn (15 phút).
- Thảo luận & Lắng nghe: Chia sẻ cảm xúc sau tuần học, giải đáp khó khăn (10 phút).
- Thông điệp tuần mới: Cô dặn dò và trao nhiệm vụ hạnh phúc tuần 9 (5 phút).`,
        createdAt: '2026-10-27',
      },
      {
        id: 'mat-02',
        title: 'Phiếu học tập môn Toán: Luyện tập phép nhân và tính chất kết hợp',
        subject: 'Toán',
        textbook: 'Kết nối tri thức',
        type: 'worksheet',
        week: 8,
        content: `BÀI TẬP VỀ NHÀ VUI VẺ - MÔN TOÁN LỚP 4
Bài 1: Tính bằng cách thuận tiện nhất:
a) 25 x 37 x 4 = (25 x 4) x 37 = 100 x 37 = 3700
b) 125 x 9 x 8 = (125 x 8) x 9 = 1000 x 9 = 9000
Bài 2: Một trường tiểu học mua 8 thùng vở, mỗi thùng có 125 quyển vở. Hỏi trường đã mua tất cả bao nhiêu quyển vở?
Lời giải: Số quyển vở trường đã mua là: 125 x 8 = 1000 (quyển vở).`,
        answerKey: 'Bài 1: a) 3700, b) 9000. Bài 2: 1000 quyển.',
        createdAt: '2026-10-28',
      }
    ];
  });

  // Parent Messages
  const [parentMessages, setParentMessages] = useState<ParentMessage[]>(() => {
    const saved = localStorage.getItem('lop4_parent_messages');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pm-01',
        studentId: 'hs-01',
        studentName: 'Nguyễn Hải Đăng',
        parentName: 'Nguyễn Văn Minh',
        date: '2026-10-28',
        content: 'Chào gia đình anh Minh. Tuần này em Hải Đăng học tập rất tiến bộ, đặc biệt em đã chủ động giơ tay phát biểu môn Toán 2 lần. Cô rất vui và mong gia đình tiếp tục khen ngợi động viên em tại nhà nhé!',
        type: 'khen_ngoi',
        readStatus: true,
        parentFeedback: 'Cảm ơn cô Giang rất nhiều! Gia đình mừng lắm vì cháu trước đây khá nhút nhát.',
      },
      {
        id: 'pm-02',
        studentId: 'hs-03',
        studentName: 'Lê Hoàng Nam',
        parentName: 'Lê Văn Cường',
        date: '2026-10-27',
        content: 'Thưa phụ huynh em Nam, hôm nay em đã rất hăng hái giúp cô sắp xếp bàn ghế gọn gàng. Nhờ bố mẹ nhắc em chuẩn bị thêm compa và thước kẻ kẻ góc cho tiết Toán ngày mai nhé.',
        type: 'nhac_nho',
        readStatus: true,
      }
    ];
  });

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('lop4_is_demo', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem('lop4_session', JSON.stringify(currentSession));
  }, [currentSession]);

  useEffect(() => {
    localStorage.setItem('lop4_teacher_profile', JSON.stringify(teacherProfile));
  }, [teacherProfile]);

  useEffect(() => {
    localStorage.setItem('lop4_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('lop4_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('lop4_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('lop4_emotions', JSON.stringify(emotionLogs));
  }, [emotionLogs]);

  useEffect(() => {
    localStorage.setItem('lop4_good_deeds', JSON.stringify(goodDeeds));
  }, [goodDeeds]);

  useEffect(() => {
    localStorage.setItem('lop4_surveys', JSON.stringify(surveys));
  }, [surveys]);

  useEffect(() => {
    localStorage.setItem('lop4_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('lop4_parent_messages', JSON.stringify(parentMessages));
  }, [parentMessages]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  const setSessionRole = (role: UserRole, studentId?: string) => {
    let name = 'Cô Lê Thị Giang';
    if (role === 'student') {
      const st = students.find((s) => s.id === studentId) || students[0];
      name = `Em ${st.fullName}`;
      studentId = st.id;
    } else if (role === 'parent') {
      const st = students.find((s) => s.id === studentId) || students[0];
      name = `Phụ huynh em ${st.fullName}`;
      studentId = st.id;
    } else if (role === 'admin') {
      name = 'Ban Giám Hiệu (BGH)';
    }

    const newSession = { role, name, studentId, isDemo: isDemoMode };
    setCurrentSession(newSession);
  };

  const updateTeacherProfile = (profile: Partial<TeacherProfile>) => {
    setTeacherProfile((prev) => ({ ...prev, ...profile }));
  };

  const addStudent = (studentData: Omit<Student, 'id'>): boolean => {
    // Check duplicates by full name and DOB
    const isDup = students.some(
      (s) => s.fullName.toLowerCase().trim() === studentData.fullName.toLowerCase().trim() && s.dob === studentData.dob
    );
    if (isDup) return false;

    const newStudent: Student = {
      ...studentData,
      id: `hs-${Date.now()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    return true;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const awardStar = (studentId: string, count = 1) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, starsCount: s.starsCount + count } : s))
    );
  };

  const importStudentsCSV = (csvText: string): { added: number; duplicates: number } => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    let added = 0;
    let duplicates = 0;

    const newStudents: Student[] = [];

    lines.forEach((line, index) => {
      // Skip header if line contains 'Họ và tên' or 'Tên'
      if (index === 0 && (line.includes('Họ') || line.includes('Name'))) return;

      const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        const fullName = cols[0];
        const gender = (cols[1]?.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam') as 'Nam' | 'Nữ';
        const dob = cols[2] || '2016-01-01';
        const groupNumber = parseInt(cols[3] || '1', 10) || 1;
        const parentName = cols[4] || 'Phụ huynh';
        const parentPhone = cols[5] || '0988.xxx.xxx';
        const address = cols[6] || 'Khoái Châu, Hưng Yên';

        const isDup = students.some(
          (s) => s.fullName.toLowerCase() === fullName.toLowerCase() && s.dob === dob
        );

        if (isDup) {
          duplicates++;
        } else {
          newStudents.push({
            id: `hs-${Date.now()}-${index}`,
            code: `HS4A4-${String(students.length + added + 1).padStart(2, '0')}`,
            fullName,
            gender,
            dob,
            groupNumber,
            parentName,
            parentPhone,
            address,
            strengths: ['Hòa đồng', 'Chăm chỉ'],
            supportNeeds: ['Cần cô khích lệ'],
            personalGoals: ['Đạt hoa điểm 10'],
            teacherNotes: 'Học sinh nhập từ danh sách.',
            starsCount: 10,
            badges: ['Tân binh 4A4'],
          });
          added++;
        }
      }
    });

    if (newStudents.length > 0) {
      setStudents((prev) => [...prev, ...newStudents]);
    }
    return { added, duplicates };
  };

  const markAttendance = (studentId: string, date: string, status: 'present' | 'excused' | 'unexcused', note?: string) => {
    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status, note };
        return updated;
      } else {
        return [...prev, { id: `att-${date}-${studentId}`, studentId, date, status, note }];
      }
    });
  };

  const getAttendanceForDate = (date: string) => {
    const recs = attendance.filter((a) => a.date === date);
    const present = recs.filter((a) => a.status === 'present').length;
    const excused = recs.filter((a) => a.status === 'excused').length;
    const unexcused = recs.filter((a) => a.status === 'unexcused').length;
    return { present, excused, unexcused, total: students.length };
  };

  const addMission = (missionData: Omit<HappinessMission, 'id' | 'createdAt'>) => {
    const newMission: HappinessMission = {
      ...missionData,
      id: `mis-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMissions((prev) => [newMission, ...prev]);
  };

  const toggleMissionComplete = (missionId: string, studentId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          const isDone = m.completedStudentIds.includes(studentId);
          const newCompleted = isDone
            ? m.completedStudentIds.filter((id) => id !== studentId)
            : [...m.completedStudentIds, studentId];
          // If newly completed, award stars
          if (!isDone) {
            awardStar(studentId, m.stars);
          }
          return { ...m, completedStudentIds: newCompleted };
        }
        return m;
      })
    );
  };

  const addEmotionLog = (logData: Omit<EmotionLog, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}`;

    const newLog: EmotionLog = {
      ...logData,
      id: `emo-${Date.now()}`,
      timestamp: timeStr,
    };
    setEmotionLogs((prev) => [newLog, ...prev]);
  };

  const markEmotionRead = (id: string) => {
    setEmotionLogs((prev) =>
      prev.map((e) => (e.id === id ? { ...e, teacherRead: true } : e))
    );
  };

  const addGoodDeed = (deedData: Omit<GoodDeedPost, 'id' | 'timestamp' | 'approved' | 'likes'>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2,
      '0'
    )}`;

    const newDeed: GoodDeedPost = {
      ...deedData,
      id: `gd-${Date.now()}`,
      timestamp: timeStr,
      approved: currentSession.role === 'teacher' || currentSession.role === 'admin', // auto-approved if teacher posts
      likes: 1,
    };
    setGoodDeeds((prev) => [newDeed, ...prev]);
  };

  const toggleApproveDeed = (id: string) => {
    setGoodDeeds((prev) =>
      prev.map((d) => (d.id === id ? { ...d, approved: !d.approved } : d))
    );
  };

  const likeDeed = (id: string) => {
    setGoodDeeds((prev) =>
      prev.map((d) => (d.id === id ? { ...d, likes: d.likes + 1 } : d))
    );
  };

  const submitSurvey = (surveyData: Omit<SurveyResponse, 'id' | 'date'>) => {
    const newSurvey: SurveyResponse = {
      ...surveyData,
      id: `sur-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setSurveys((prev) => {
      const filtered = prev.filter((s) => s.studentId !== surveyData.studentId);
      return [newSurvey, ...filtered];
    });
  };

  const updateSurveyAnalysis = (surveyId: string, analysis: any) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, aiAnalysis: analysis } : s))
    );
  };

  const confirmSurveyAnalysis = (surveyId: string) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, teacherConfirmed: true } : s))
    );
  };

  const addMaterial = (materialData: Omit<LearningMaterial, 'id' | 'createdAt'>) => {
    const newMat: LearningMaterial = {
      ...materialData,
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setMaterials((prev) => [newMat, ...prev]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const sendParentMessage = (msgData: Omit<ParentMessage, 'id' | 'date' | 'readStatus'>) => {
    const newMsg: ParentMessage = {
      ...msgData,
      id: `pm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      readStatus: false,
    };
    setParentMessages((prev) => [newMsg, ...prev]);
  };

  const markParentMessageRead = (id: string) => {
    setParentMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, readStatus: true } : m))
    );
  };

  const resetToDefaultData = () => {
    setTeacherProfile(DEFAULT_TEACHER);
    setStudents(INITIAL_STUDENTS);
    setMissions(INITIAL_MISSIONS);
    setEmotionLogs(INITIAL_EMOTIONS);
    setGoodDeeds(INITIAL_GOOD_DEEDS);
    setSurveys(INITIAL_SURVEYS);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        currentSession,
        setSessionRole,
        isDemoMode,
        toggleDemoMode,
        teacherProfile,
        updateTeacherProfile,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        awardStar,
        importStudentsCSV,
        attendance,
        markAttendance,
        getAttendanceForDate,
        missions,
        addMission,
        toggleMissionComplete,
        emotionLogs,
        addEmotionLog,
        markEmotionRead,
        goodDeeds,
        addGoodDeed,
        toggleApproveDeed,
        likeDeed,
        surveys,
        submitSurvey,
        updateSurveyAnalysis,
        confirmSurveyAnalysis,
        materials,
        addMaterial,
        deleteMaterial,
        parentMessages,
        sendParentMessage,
        markParentMessageRead,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
