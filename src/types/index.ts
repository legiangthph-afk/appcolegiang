export type UserRole = 'teacher' | 'student' | 'parent' | 'admin';

export interface UserSession {
  role: UserRole;
  name: string;
  studentId?: string; // for student or parent linking
  isDemo: boolean;
}

export interface TeacherProfile {
  name: string;
  school: string;
  className: string;
  academicYear: string;
  roleTitle: string;
  province: string;
  phone: string;
  email: string;
  avatarUrl: string;
  classCoverUrl: string;
  schoolLogoUrl: string;
  slogan: string;
}

export interface Student {
  id: string;
  code: string;
  fullName: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  groupNumber: number; // Tổ 1, 2, 3, 4
  parentName: string;
  parentPhone: string;
  address: string;
  strengths: string[];
  supportNeeds: string[];
  personalGoals: string[];
  teacherNotes: string;
  starsCount: number;
  badges: string[];
  attendanceRate?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  status: 'present' | 'excused' | 'unexcused'; // Đi học, Có phép, Không phép
  note?: string;
}

export type EmotionType = 'happy' | 'peaceful' | 'worried' | 'sad' | 'tired' | 'grateful';

export interface EmotionLog {
  id: string;
  studentId: string;
  studentName: string;
  emotion: EmotionType;
  note: string;
  timestamp: string;
  aiResponse: string;
  flaggedForTeacher: boolean;
  teacherRead?: boolean;
}

export interface HappinessMission {
  id: string;
  title: string;
  description: string;
  category: 'loi_cam_on' | 'viec_tot' | 'giup_ban' | 'sach_hay' | 'loi_khen' | 'moi_truong' | 'tu_lap';
  stars: number;
  difficulty: 'Dễ' | 'Vừa' | 'Thử thách';
  weekNumber: number;
  completedStudentIds: string[];
  createdAt: string;
}

export interface GoodDeedPost {
  id: string;
  fromName: string;
  toName: string;
  content: string;
  category: 'Khen ngợi' | 'Cảm ơn' | 'Việc tốt';
  timestamp: string;
  approved: boolean;
  likes: number;
}

export interface SurveyResponse {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  answers: {
    interests: string[];
    strengths: string[];
    improvementGoals: string[];
    learningStyle: string[];
    classWishes: string[];
    confidenceLevel: number; // 1-5
    teamworkSkill: number; // 1-5
    schoolFeelings: string;
    teacherSupportNeed: string;
  };
  aiAnalysis?: {
    strengths: string[];
    supportNeeds: string[];
    recommendedGoals: string[];
    suggestedActivities: string[];
    parentCollaboration: string;
  };
  teacherConfirmed: boolean;
}

export interface LearningMaterial {
  id: string;
  title: string;
  subject: 'Toán' | 'Tiếng Việt' | 'Khoa học' | 'Lịch sử và Địa lí' | 'Đạo đức' | 'Công nghệ' | 'Tin học' | 'Hoạt động trải nghiệm';
  textbook: 'Kết nối tri thức' | 'Cánh diều' | 'Chân trời sáng tạo' | 'Tất cả';
  type: 'plan' | 'worksheet' | 'quiz' | 'rubric' | 'game';
  week: number;
  content: string;
  answerKey?: string;
  evaluationGuide?: string;
  createdAt: string;
}

export interface ParentMessage {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  date: string;
  content: string;
  type: 'khen_ngoi' | 'nhac_nho' | 'hop_tac' | 'thong_bao';
  readStatus: boolean;
  parentFeedback?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subject: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Vận dụng';
}
