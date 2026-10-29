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
  academicYear: '2026 - 2027',
  roleTitle: 'Giáo viên Chủ nhiệm',
  province: 'Xã Khoái Châu, Tỉnh Hưng Yên',
  phone: '0397239544',
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
    fullName: 'Nguyễn Bình An',
    gender: 'Nam',
    dob: '2016-03-15',
    groupNumber: 1,
    parentName: 'Bố: Nguyễn Văn Trình - Mẹ: Nguyễn Thị Hà Lan',
    parentPhone: '0966431613',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Tư duy Toán nhanh nhẹn', 'Lễ phép', 'Thích đọc sách'],
    supportNeeds: ['Cần mạnh dạn phát biểu to, rõ ràng hơn'],
    personalGoals: ['Tự tin xung phong phát biểu 2 lần mỗi ngày'],
    teacherNotes: 'Em có năng lực tiếp thu rất tốt, cần khuyến khích hoạt động nhóm để tăng sự tự tin.',
    starsCount: 38,
    badges: ['Nhà toán học nhí', 'Ngôi sao chăm chỉ', 'Chiến sĩ đọc sách'],
  },
  {
    id: 'hs-02',
    code: 'HS4A4-02',
    fullName: 'Bùi Thị Quỳnh Anh',
    gender: 'Nữ',
    dob: '2016-05-20',
    groupNumber: 1,
    parentName: 'Bố: Bùi Duy Đảng - Mẹ: Ma Thị Dực',
    parentPhone: '0375156581',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Chữ viết nắn nót', 'Khéo tay', 'Hòa đồng cùng bạn bè'],
    supportNeeds: ['Cần rèn thêm kỹ năng tính nhẩm nhanh'],
    personalGoals: ['Hoàn thành bài tập Toán trong 20 phút'],
    teacherNotes: 'Em chăm ngoan, biết quan tâm và chia sẻ đồ dùng với bạn cùng bàn.',
    starsCount: 42,
    badges: ['Văn hay chữ tốt', 'Họa sĩ tí hon', 'Đại sứ nụ cười'],
  },
  {
    id: 'hs-03',
    code: 'HS4A4-03',
    fullName: 'Hứa Huyền Anh',
    gender: 'Nữ',
    dob: '2016-01-10',
    groupNumber: 1,
    parentName: 'Bố: Hứa Văn Cường - Mẹ: Vương Thị Phượng',
    parentPhone: '0366601661',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Nhanh nhẹn', 'Thích môn Khoa học', 'Nhiệt tình với việc lớp'],
    supportNeeds: ['Cần rèn luyện thêm tính cẩn thận khi làm bài thi'],
    personalGoals: ['Kiểm tra lại bài 2 lần trước khi nộp'],
    teacherNotes: 'Rất giàu năng lượng, luôn là nhân tố tích cực trong các hoạt động trải nghiệm.',
    starsCount: 35,
    badges: ['Hiệp sĩ việc tốt', 'Nhà thám hiểm nhí'],
  },
  {
    id: 'hs-04',
    code: 'HS4A4-04',
    fullName: 'Trần Phương Chi',
    gender: 'Nữ',
    dob: '2016-08-12',
    groupNumber: 1,
    parentName: 'Bố: Trần Quang Thọ - Mẹ: Trần Thị Thảo',
    parentPhone: '0971817196',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Đọc diễn cảm', 'Kể chuyện hay', 'Biết lắng nghe'],
    supportNeeds: ['Đôi khi còn rụt rè trước đám đông'],
    personalGoals: ['Tự tin tham gia đóng tiểu phẩm của tổ'],
    teacherNotes: 'Tâm hồn trong sáng, nụ cười hiền lành, tiếp thu môn Tiếng Việt xuất sắc.',
    starsCount: 39,
    badges: ['Bạn thân thiện', 'Hoa việc tốt'],
  },
  {
    id: 'hs-05',
    code: 'HS4A4-05',
    fullName: 'Lâm Huyền Diệu',
    gender: 'Nữ',
    dob: '2016-11-25',
    groupNumber: 1,
    parentName: 'Bố: Lâm Văn Ánh - Mẹ: Bùi Thị Nga',
    parentPhone: '0384316405',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Chăm chỉ', 'Ghi chép bài đầy đủ', 'Ý thức nề nếp tốt'],
    supportNeeds: ['Cần rèn tính nhẩm nhanh với các số có nhiều chữ số'],
    personalGoals: ['Đạt điểm 10 môn Toán giữa kỳ'],
    teacherNotes: 'Học sinh ngoan ngoãn, chuẩn bị bài đầy đủ trước khi đến lớp.',
    starsCount: 33,
    badges: ['Ngôi sao chăm chỉ', 'Tiến bộ vượt bậc'],
  },
  {
    id: 'hs-06',
    code: 'HS4A4-06',
    fullName: 'Lâm Huyền Diệu',
    gender: 'Nữ',
    dob: '2016-04-05',
    groupNumber: 1,
    parentName: 'Bố: Lâm Văn Bắc - Mẹ: Phạm Thị Oanh',
    parentPhone: '0979348936',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Hòa đồng', 'Tích cực tham gia trò chơi học tập', 'Khéo tay vẽ tranh'],
    supportNeeds: ['Cần tập trung hơn trong giờ Đạo đức'],
    personalGoals: ['Ngồi ngay ngắn lắng nghe cô giảng bài suốt tiết'],
    teacherNotes: 'Luôn nở nụ cười chào cô, giàu tình cảm và rất thích hoạt động nhóm.',
    starsCount: 36,
    badges: ['Họa sĩ nhí', 'Nụ cười 4A4'],
  },
  {
    id: 'hs-07',
    code: 'HS4A4-07',
    fullName: 'Nguyễn Đức Hiếu',
    gender: 'Nam',
    dob: '2016-07-19',
    groupNumber: 1,
    parentName: 'Bố: Nguyễn Văn Tuấn - Mẹ: Lê Thị Huyền',
    parentPhone: '0985530800',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Khỏe khoắn', 'Thể thao giỏi', 'Thích lắp ghép mô hình'],
    supportNeeds: ['Chữ viết cần nắn nót, giữ vở sạch chữ đẹp hơn'],
    personalGoals: ['Luyện viết 1 trang chữ đẹp mỗi tối'],
    teacherNotes: 'Luôn xung phong khiêng bàn ghế và giúp đỡ các bạn nữ trong lớp.',
    starsCount: 34,
    badges: ['Vận động viên nhí', 'Hiệp sĩ giúp bạn'],
  },
  {
    id: 'hs-08',
    code: 'HS4A4-08',
    fullName: 'Lâm Phạm Trí Dũng',
    gender: 'Nam',
    dob: '2016-09-02',
    groupNumber: 1,
    parentName: 'Bố: Lâm Thế Vũ - Mẹ: Phạm Thị Liên Hương',
    parentPhone: '0962884095',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Thông minh', 'Tư duy logic nhạy bén', 'Thích Tin học'],
    supportNeeds: ['Cần kiên nhẫn hơn khi giải các bài toán dài'],
    personalGoals: ['Viết lời giải bài toán đầy đủ từng bước'],
    teacherNotes: 'Em có năng khiếu công nghệ và tư duy khoa học rất tốt.',
    starsCount: 37,
    badges: ['Chuyên gia công nghệ', 'Nhà toán học nhí'],
  },
  {
    id: 'hs-09',
    code: 'HS4A4-09',
    fullName: 'Lê Ánh Dương',
    gender: 'Nữ',
    dob: '2016-02-14',
    groupNumber: 2,
    parentName: 'Bố: Lê Văn Hưởng - Mẹ: Đàm Thị Tuất',
    parentPhone: '0975711802',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Sáng tạo', 'Tự tin', 'Giọng hát trong trẻo'],
    supportNeeds: ['Cần chú ý chuẩn bị đầy đủ compa, ê-ke khi học hình học'],
    personalGoals: ['Soạn sách vở đúng thời khóa biểu trước khi đi ngủ'],
    teacherNotes: 'Cây văn nghệ tài năng của lớp 4A4, luôn mang lại niềm vui cho cả lớp.',
    starsCount: 40,
    badges: ['Chim sơn ca 4A4', 'Búp măng xinh'],
  },
  {
    id: 'hs-10',
    code: 'HS4A4-10',
    fullName: 'Đinh Thanh Hà',
    gender: 'Nữ',
    dob: '2016-10-18',
    groupNumber: 2,
    parentName: 'Bố: Đinh Thanh Hoàng - Mẹ: Nguyễn Thị Hồng',
    parentPhone: '0977368163',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Ngăn nắp', 'Giữ gìn sách vở cẩn thận', 'Trách nhiệm cao'],
    supportNeeds: ['Mạnh dạn xung phong phát biểu nhiều hơn'],
    personalGoals: ['Mỗi tuần giơ tay phát biểu ít nhất 4 lần'],
    teacherNotes: 'Tổ trưởng gương mẫu, luôn quan tâm đôn đốc các bạn trong tổ học tốt.',
    starsCount: 43,
    badges: ['Cán bộ lớp tài năng', 'Gương mẫu 4A4'],
  },
  {
    id: 'hs-11',
    code: 'HS4A4-11',
    fullName: 'Bùi Khánh Hân',
    gender: 'Nữ',
    dob: '2016-06-22',
    groupNumber: 2,
    parentName: 'Bố: Bùi Duy Hưởng - Mẹ: Nguyễn Thị Vui',
    parentPhone: '0377883286',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Lễ phép', 'Nụ cười tươi tắn', 'Chăm chỉ hoàn thành bài tập'],
    supportNeeds: ['Cần tự tin hơn khi lên bảng làm bài'],
    personalGoals: ['Tự tin lên bảng giải bài tập môn Toán'],
    teacherNotes: 'Tính cách hiền hậu, lễ phép, luôn được thầy cô và bạn bè yêu quý.',
    starsCount: 36,
    badges: ['Đại sứ nụ cười', 'Chiến sĩ đọc sách'],
  },
  {
    id: 'hs-12',
    code: 'HS4A4-12',
    fullName: 'Nguyễn Thị Hạnh Hiếu',
    gender: 'Nữ',
    dob: '2016-12-08',
    groupNumber: 2,
    parentName: 'Nhà chùa nuôi dưỡng - Mẹ: Nguyễn Thị Tự',
    parentPhone: '0966151159',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Ngoan ngoãn', 'Giàu tình cảm', 'Tự lập rất tốt', 'Yêu thương bạn bè'],
    supportNeeds: ['Cần cô giáo và bạn bè thường xuyên động viên, khích lệ tinh thần'],
    personalGoals: ['Mỗi ngày học thêm một điều bổ ích, đạt hoa điểm 10'],
    teacherNotes: 'Học sinh có hoàn cảnh đặc biệt (nhà chùa nuôi dưỡng), em rất ngoan, tự giác và giàu tình cảm. Cô và lớp luôn dành sự quan tâm yêu thương ấm áp nhất cho em.',
    starsCount: 45,
    badges: ['Nghị lực phi thường', 'Bông hoa hiếu thảo', 'Ngôi sao hạnh phúc'],
  },
  {
    id: 'hs-13',
    code: 'HS4A4-13',
    fullName: 'Trần Huy Hoàng',
    gender: 'Nam',
    dob: '2016-03-30',
    groupNumber: 2,
    parentName: 'Bố: Trần Huy Hà - Mẹ: Hoàng Thị Kim Yến',
    parentPhone: '0983247187',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Nhanh nhẹn', 'Thích khám phá khoa học tự nhiên', 'Thật thà'],
    supportNeeds: ['Cần tập trung nghe giảng trọn vẹn tiết học'],
    personalGoals: ['Không nói chuyện riêng trong giờ học'],
    teacherNotes: 'Thông minh, có tố chất lãnh đạo, cần rèn thêm tính kiên định.',
    starsCount: 35,
    badges: ['Nhà thám hiểm nhí', 'Đôi bạn cùng tiến'],
  },
  {
    id: 'hs-14',
    code: 'HS4A4-14',
    fullName: 'Bùi Bá Khải',
    gender: 'Nam',
    dob: '2016-07-04',
    groupNumber: 2,
    parentName: 'Bố: Bùi Bá Khánh - Mẹ: Phạm T. Phương Châm',
    parentPhone: '0385632690',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Tự tin', 'Thích các trò chơi đối kháng trí tuệ', 'Nhiệt tình'],
    supportNeeds: ['Cần rèn luyện tính kiên nhẫn khi đọc văn bản dài'],
    personalGoals: ['Đọc hết 1 cuốn sách khoa học thiếu nhi mỗi tuần'],
    teacherNotes: 'Học sinh năng động, hào hứng với các trò chơi tương tác trên lớp.',
    starsCount: 38,
    badges: ['Chiến binh tri thức', 'Hiệp sĩ việc tốt'],
  },
  {
    id: 'hs-15',
    code: 'HS4A4-15',
    fullName: 'Doãn Hà Phương',
    gender: 'Nữ',
    dob: '2016-05-18',
    groupNumber: 2,
    parentName: 'Bố: Doãn Văn Tá - Mẹ: Đỗ Thị Thùy Linh',
    parentPhone: '0346311299',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Chữ viết rất đẹp', 'Học giỏi môn Tiếng Việt', 'Lễ phép'],
    supportNeeds: ['Rèn thêm kỹ năng tính nhẩm các phép tính nhân chia'],
    personalGoals: ['Thành thạo bảng cửu chương và phép chia có dư'],
    teacherNotes: 'Lớp phó học tập gương mẫu, bài làm luôn sạch đẹp, chỉn chu.',
    starsCount: 46,
    badges: ['Văn hay chữ tốt', 'Gương mẫu 4A4', 'Bông sen hồng'],
  },
  {
    id: 'hs-16',
    code: 'HS4A4-16',
    fullName: 'Lê Khánh Linh',
    gender: 'Nữ',
    dob: '2016-09-15',
    groupNumber: 2,
    parentName: 'Bố: Lê Văn Việt - Mẹ: Nguyễn Thị Thưởng',
    parentPhone: '0979459365',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Khéo tay', 'Thích vẽ tranh', 'Tâm hồn trong sáng'],
    supportNeeds: ['Cần tự tin hơn khi trình bày sản phẩm trước lớp'],
    personalGoals: ['Mạnh dạn thuyết trình bài vẽ của mình'],
    teacherNotes: 'Em có khiếu thẩm mỹ tốt, các tranh vẽ minh họa bài học rất sinh động.',
    starsCount: 37,
    badges: ['Họa sĩ tí hon', 'Ngôi sao tiến bộ'],
  },
  {
    id: 'hs-17',
    code: 'HS4A4-17',
    fullName: 'Bùi Bá Bảo Long',
    gender: 'Nam',
    dob: '2016-01-25',
    groupNumber: 3,
    parentName: 'Bố: Bùi Bá Đông - Mẹ: Khoa Thị Hà',
    parentPhone: '0979459365',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Nhanh trí', 'Yêu thích thể dục thể thao', 'Thẳng thắn'],
    supportNeeds: ['Cần nắn nót chữ viết và giữ gìn sách vở cẩn thận hơn'],
    personalGoals: ['Giữ vở sạch chữ đẹp cả học kỳ'],
    teacherNotes: 'Năng nổ, nhiệt tình tham gia bảo vệ môi trường và vệ sinh lớp học.',
    starsCount: 35,
    badges: ['Hiệp sĩ xanh', 'Vận động viên nhí'],
  },
  {
    id: 'hs-18',
    code: 'HS4A4-18',
    fullName: 'Lại Ngọc Bảo Long',
    gender: 'Nam',
    dob: '2016-08-08',
    groupNumber: 3,
    parentName: 'Bố: Lại Ngọc Nam - Mẹ: Đào Thanh Ngân',
    parentPhone: '0902020160',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Tư duy toán học tốt', 'Ngoan ngoãn', 'Tôn trọng bạn bè'],
    supportNeeds: ['Cần phát biểu to, rõ ràng hơn khi được gọi'],
    personalGoals: ['Xung phong phát biểu môn Lịch sử và Địa lí'],
    teacherNotes: 'Tiếp thu bài nhanh, tính toán cẩn thận và rất đúng giờ.',
    starsCount: 39,
    badges: ['Nhà toán học nhí', 'Ngôi sao chăm chỉ'],
  },
  {
    id: 'hs-19',
    code: 'HS4A4-19',
    fullName: 'Bùi Ngọc Thảo Ly',
    gender: 'Nữ',
    dob: '2016-11-12',
    groupNumber: 3,
    parentName: 'Bố: Bùi Bá Kiên - Mẹ: Đào Thị Phượng',
    parentPhone: '0962232930',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Hòa nhã', 'Biết giúp đỡ bạn bè', 'Thích đọc truyện tranh lịch sử'],
    supportNeeds: ['Cần tự tin hơn trong các bài kiểm tra định kỳ'],
    personalGoals: ['Làm bài bình tĩnh, tự tin, không lo lắng'],
    teacherNotes: 'Giàu lòng trắc ẩn, luôn chủ động động viên khi thấy bạn trong lớp buồn.',
    starsCount: 38,
    badges: ['Đại sứ nụ cười', 'Hoa việc tốt'],
  },
  {
    id: 'hs-20',
    code: 'HS4A4-20',
    fullName: 'Doãn Ngọc Mai',
    gender: 'Nữ',
    dob: '2016-04-16',
    groupNumber: 3,
    parentName: 'Bố: Doãn Văn Vinh - Mẹ: Hoàng Thị Loan',
    parentPhone: '0987835236',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Giao tiếp tốt', 'Thích hoạt động trải nghiệm', 'Lễ phép'],
    supportNeeds: ['Cần rèn luyện tính kiên nhẫn khi làm bài tập hình học'],
    personalGoals: ['Vẽ hình vuông, hình chữ nhật chính xác bằng thước'],
    teacherNotes: 'Năng động, có tinh thần tương thân tương ái, bạn bè rất mến.',
    starsCount: 36,
    badges: ['Búp măng xinh', 'Chiến sĩ đọc sách'],
  },
  {
    id: 'hs-21',
    code: 'HS4A4-21',
    fullName: 'Bùi Duy Nhật Minh',
    gender: 'Nam',
    dob: '2016-02-28',
    groupNumber: 3,
    parentName: 'Bố: Bùi Duy Chiến - Mẹ: Đinh Thị Thủy',
    parentPhone: '0384896364',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Tò mò khoa học', 'Lắp ghép đồ chơi khéo', 'Thích giúp bạn giảng bài'],
    supportNeeds: ['Cần viết chính tả nhanh hơn để theo kịp tốc độ của lớp'],
    personalGoals: ['Viết kịp tốc độ đọc của cô giáo'],
    teacherNotes: 'Có tinh thần hỗ trợ các bạn trong tổ rất nhiệt tình, tư duy logic tốt.',
    starsCount: 37,
    badges: ['Kỹ sư nhí', 'Đôi bạn cùng tiến'],
  },
  {
    id: 'hs-22',
    code: 'HS4A4-22',
    fullName: 'Nguyễn Bảo Nam',
    gender: 'Nam',
    dob: '2016-10-05',
    groupNumber: 3,
    parentName: 'Bố: Nguyễn Đức Hưng - Mẹ: Chu Lan Oanh',
    parentPhone: '0967670010',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Ngoan ngoãn', 'Đi học chuyên cần', 'Thực hiện nội quy tốt'],
    supportNeeds: ['Cần khuyến khích phát biểu để thêm dạn dĩ'],
    personalGoals: ['Mạnh dạn giơ tay phát biểu môn Tiếng Việt'],
    teacherNotes: 'Học sinh rất nền nếp, phụ huynh rất quan tâm phối hợp cùng cô.',
    starsCount: 38,
    badges: ['Ngôi sao nề nếp', 'Bạn thân thiện'],
  },
  {
    id: 'hs-23',
    code: 'HS4A4-23',
    fullName: 'Nguyễn Như Bảo Ngọc',
    gender: 'Nữ',
    dob: '2016-03-08',
    groupNumber: 3,
    parentName: 'Bố: Nguyễn Văn Cường - Mẹ: Đào Thị Hường',
    parentPhone: '0865058357',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Học đều các môn', 'Chữ đẹp', 'Rất chăm chỉ'],
    supportNeeds: ['Cần tự tin hơn trong các hoạt động nói trước lớp'],
    personalGoals: ['Tham gia kể chuyện trong giờ sinh hoạt lớp'],
    teacherNotes: 'Em rất đáng yêu, có tinh thần cầu tiến và ý thức tự giác rất cao.',
    starsCount: 42,
    badges: ['Văn hay chữ tốt', 'Bông hoa việc tốt'],
  },
  {
    id: 'hs-24',
    code: 'HS4A4-24',
    fullName: 'Nguyễn Nguyên Phương',
    gender: 'Nữ',
    dob: '2016-07-27',
    groupNumber: 3,
    parentName: 'Bố: Nguyễn Văn Hùng - Mẹ: Lê Thị Hương',
    parentPhone: '0985214889',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Nhanh trí', 'Khéo tay', 'Tích cực tham gia trò chơi'],
    supportNeeds: ['Cần rèn luyện thêm kỹ năng làm việc nhóm hòa hợp'],
    personalGoals: ['Lắng nghe ý kiến của các bạn trong tổ'],
    teacherNotes: 'Có tố chất thông minh, sáng tạo, cần bồi dưỡng thêm kỹ năng lắng nghe.',
    starsCount: 39,
    badges: ['Ngôi sao sáng tạo', 'Họa sĩ tí hon'],
  },
  {
    id: 'hs-25',
    code: 'HS4A4-25',
    fullName: 'Đỗ Minh Quân',
    gender: 'Nam',
    dob: '2016-12-19',
    groupNumber: 4,
    parentName: 'Bố: Đỗ Đình Chính - Mẹ: Phan Thị Tính',
    parentPhone: '0375714524',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Thông minh', 'Hài hước', 'Thích môn Toán'],
    supportNeeds: ['Cần rèn tính kiên nhẫn khi trình bày bài giải'],
    personalGoals: ['Trình bày bài giải Toán sạch đẹp từng bước'],
    teacherNotes: 'Năng nổ, tư duy sắc sảo, luôn tạo không khí vui tươi cho lớp.',
    starsCount: 40,
    badges: ['Nhà toán học nhí', 'Đại sứ nụ cười'],
  },
  {
    id: 'hs-26',
    code: 'HS4A4-26',
    fullName: 'Nguyễn Chí Thiện',
    gender: 'Nam',
    dob: '2016-09-09',
    groupNumber: 4,
    parentName: 'Bố: Nguyễn Văn Thắng - Mẹ: Hoàng Thị Thảo',
    parentPhone: '0965817749',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Thật thà', 'Nhiệt tình giúp đỡ bạn bè', 'Yêu lao động'],
    supportNeeds: ['Cần tập trung hơn trong giờ đọc mở rộng'],
    personalGoals: ['Đọc trọn vẹn 1 cuốn sách mỗi tuần'],
    teacherNotes: 'Tấm lòng nhân ái, hay giúp bạn khi bạn gặp khó khăn.',
    starsCount: 36,
    badges: ['Hiệp sĩ việc tốt', 'Tấm lòng vàng'],
  },
  {
    id: 'hs-27',
    code: 'HS4A4-27',
    fullName: 'Nguyễn Anh Thư',
    gender: 'Nữ',
    dob: '2016-05-14',
    groupNumber: 4,
    parentName: 'Bố: Nguyễn Huy Hoàng - Mẹ: Bế Thị Diện',
    parentPhone: '0983698824',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Chăm ngoan', 'Nói năng lễ phép', 'Học tốt môn Tiếng Việt'],
    supportNeeds: ['Cần dạn dĩ hơn trong giờ thể dục'],
    personalGoals: ['Tích cực tham gia các bài tập vận động ngoài trời'],
    teacherNotes: 'Rất ngoan ngoãn, giữ sách vở phẳng phiu, sạch sẽ.',
    starsCount: 41,
    badges: ['Búp măng xinh', 'Văn hay chữ tốt'],
  },
  {
    id: 'hs-28',
    code: 'HS4A4-28',
    fullName: 'Nguyễn Lê Anh Thư',
    gender: 'Nữ',
    dob: '2016-08-30',
    groupNumber: 4,
    parentName: 'Bố: Nguyễn Đức Công - Mẹ: Lê Thị Huyền Trang',
    parentPhone: '0969666264',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Khả năng ghi nhớ tốt', 'Hát hay', 'Thích môn Đạo đức'],
    supportNeeds: ['Cần rèn luyện tính độc lập khi làm bài kiểm tra'],
    personalGoals: ['Tự mình giải các bài toán khó'],
    teacherNotes: 'Tâm hồn nhạy cảm, giàu lòng trắc ẩn, luôn chấp hành tốt nội quy.',
    starsCount: 43,
    badges: ['Chim sơn ca 4A4', 'Gương mẫu 4A4'],
  },
  {
    id: 'hs-29',
    code: 'HS4A4-29',
    fullName: 'Lâm Tuấn Tú',
    gender: 'Nam',
    dob: '2016-01-18',
    groupNumber: 4,
    parentName: 'Bố: Lâm Văn Quân - Mẹ: Vì Thị Tiếp',
    parentPhone: '0365318754',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Nhanh nhẹn', 'Thích môn Lịch sử và Địa lí', 'Khỏe khoắn'],
    supportNeeds: ['Cần chú ý cẩn thận khi tính toán phân số'],
    personalGoals: ['Làm đúng 100% các phép tính cộng trừ phân số'],
    teacherNotes: 'Em luôn hăng hái tham gia các hoạt động tập thể của trường lớp.',
    starsCount: 35,
    badges: ['Vận động viên nhí', 'Nhà sử học tí hon'],
  },
  {
    id: 'hs-30',
    code: 'HS4A4-30',
    fullName: 'Nguyễn Tiến Phong',
    gender: 'Nam',
    dob: '2016-11-03',
    groupNumber: 4,
    parentName: 'Bố: Nguyễn Văn Đạt - Mẹ: Phùng Thị Hồng Anh',
    parentPhone: '0975048588',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Chăm chỉ', 'Ý thức tự giác cao', 'Thích khám phá thiên nhiên'],
    supportNeeds: ['Cần tự tin giơ tay phát biểu nhiều hơn'],
    personalGoals: ['Xung phong phát biểu xây dựng bài mỗi tiết học'],
    teacherNotes: 'Rất gương mẫu, đi học đúng giờ và chuẩn bị bài chu đáo.',
    starsCount: 38,
    badges: ['Chiến sĩ chăm ngoan', 'Đôi bạn cùng tiến'],
  },
  {
    id: 'hs-31',
    code: 'HS4A4-31',
    fullName: 'Đinh Nguyễn Hưng Phúc',
    gender: 'Nam',
    dob: '2016-06-06',
    groupNumber: 4,
    parentName: 'Bố: Đinh Văn Hưng - Mẹ: Nguyễn Thị Huệ',
    parentPhone: '0386368624',
    address: 'Xã Khoái Châu, Tỉnh Hưng Yên',
    strengths: ['Thông minh', 'Tư duy nhanh', 'Rất nhiệt tình với bạn bè'],
    supportNeeds: ['Cần rèn luyện chữ viết nắn nót hơn'],
    personalGoals: ['Viết chữ thẳng hàng, sạch đẹp từng trang vở'],
    teacherNotes: 'Học sinh rất thông minh, hào sảng và luôn được bạn bè yêu quý.',
    starsCount: 42,
    badges: ['Nhà toán học nhí', 'Gương sáng 4A4'],
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
    studentName: 'Nguyễn Bình An',
    emotion: 'happy',
    note: 'Hôm nay em được cô Giang khen bài giải Toán nhanh nhất tổ 1!',
    timestamp: '2026-10-28 09:30',
    aiResponse: 'Tuyệt vời lắm Bình An ơi! Cố gắng tiếp tục phát huy niềm đam mê với những con số kỳ diệu nhé!',
    flaggedForTeacher: false,
    teacherRead: true,
  },
  {
    id: 'emo-02',
    studentId: 'hs-04',
    studentName: 'Trần Phương Chi',
    emotion: 'worried',
    note: 'Sáng nay em để quên hộp bút sáp vẽ tranh ở nhà, em sợ không kịp giờ Mỹ thuật.',
    timestamp: '2026-10-28 10:15',
    aiResponse: 'Phương Chi đừng quá lo lắng nhé! Bạn Quỳnh Anh tổ 1 có thể chia sẻ màu vẽ cùng em đó. Cô giáo luôn thấu hiểu và hỗ trợ em.',
    flaggedForTeacher: true,
    teacherRead: true,
  },
  {
    id: 'emo-03',
    studentId: 'hs-12',
    studentName: 'Nguyễn Thị Hạnh Hiếu',
    emotion: 'grateful',
    note: 'Em biết ơn cô giáo Giang và các bạn đã chia sẻ và động viên em trong giờ học.',
    timestamp: '2026-10-29 08:45',
    aiResponse: 'Tấm lòng biết ơn và nụ cười hiền hậu của Hạnh Hiếu làm cho lớp 4A4 chúng mình ngập tràn tình yêu thương!',
    flaggedForTeacher: false,
    teacherRead: true,
  },
];

const INITIAL_GOOD_DEEDS: GoodDeedPost[] = [
  {
    id: 'gd-01',
    fromName: 'Bùi Thị Quỳnh Anh',
    toName: 'Nguyễn Đức Hiếu',
    content: 'Cảm ơn bạn Hiếu đã nhặt giúp mình chiếc bút mực bị rơi dưới gầm bàn.',
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
    fromName: 'Lâm Phạm Trí Dũng',
    toName: 'Nguyễn Bình An',
    content: 'Bạn An đã tận tình giải thích lại cách quy đồng mẫu số phân số cho mình hiểu bài.',
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
    studentName: 'Nguyễn Bình An',
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
        parsed.phone = '0397239544';
        parsed.academicYear = '2026 - 2027';
        parsed.province = 'Xã Khoái Châu, Tỉnh Hưng Yên';
        parsed.avatarUrl = '/assets/aistudio/image_562566a4.png';
        parsed.school = 'Trường Tiểu học Khoái Châu 1';
        parsed.name = 'Lê Thị Giang';
        parsed.className = '4A4';
        const merged = { ...DEFAULT_TEACHER, ...parsed };
        localStorage.setItem('lop4_teacher_profile', JSON.stringify(merged));
        return merged;
      } catch {
        return DEFAULT_TEACHER;
      }
    }
    return DEFAULT_TEACHER;
  });

  // Students (Official 31 students of Class 4A4)
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lop4_students_v31');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 31 && parsed[0]?.fullName === 'Nguyễn Bình An') {
          return parsed;
        }
      } catch {}
    }
    localStorage.setItem('lop4_students_v31', JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem('lop4_students', JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  });

  // Attendance (Initialized for 31 students)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('lop4_attendance_v31');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 31) return parsed;
      } catch {}
    }
    const today = new Date().toISOString().split('T')[0];
    const initialAtt = INITIAL_STUDENTS.map((st, idx) => ({
      id: `att-${today}-${st.id}`,
      date: today,
      studentId: st.id,
      status: (idx === 2 ? 'excused' : 'present') as 'present' | 'excused' | 'unexcused',
      note: idx === 2 ? 'Gia đình có việc xin phép nghỉ 1 buổi' : undefined,
    }));
    localStorage.setItem('lop4_attendance_v31', JSON.stringify(initialAtt));
    return initialAtt;
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
    const saved = localStorage.getItem('lop4_parent_messages_v31');
    return saved ? JSON.parse(saved) : [
      {
        id: 'pm-01',
        studentId: 'hs-01',
        studentName: 'Nguyễn Bình An',
        parentName: 'Bố: Nguyễn Văn Trình - Mẹ: Nguyễn Thị Hà Lan',
        date: '2026-10-28',
        content: 'Chào gia đình anh Trình, chị Lan. Tuần này em Bình An học tập rất tiến bộ, đặc biệt em đã chủ động giơ tay phát biểu môn Toán 2 lần. Cô rất vui và mong gia đình tiếp tục khen ngợi động viên em tại nhà nhé!',
        type: 'khen_ngoi',
        readStatus: true,
        parentFeedback: 'Cảm ơn cô Giang rất nhiều! Gia đình mừng lắm vì cháu ở nhà cũng chăm chỉ hơn.',
      },
      {
        id: 'pm-02',
        studentId: 'hs-12',
        studentName: 'Nguyễn Thị Hạnh Hiếu',
        parentName: 'Nhà chùa nuôi dưỡng - Mẹ: Nguyễn Thị Tự',
        date: '2026-10-27',
        content: 'Kính gửi gia đình và nhà chùa, hôm nay em Hạnh Hiếu đã rất hăng hái giúp cô sắp xếp bàn ghế và đọc bài rất truyền cảm. Cả lớp luôn yêu quý và đồng hành cùng em.',
        type: 'khen_ngoi',
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
        const address = cols[6] || 'Xã Khoái Châu, Tỉnh Hưng Yên';

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
