import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit2,
  Filter,
  Calendar,
  Award,
  Star,
  Clock,
  Check,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { speechService } from '../../services/speechService';

export const TeacherAndClassManagement: React.FC = () => {
  const {
    students,
    teacherProfile,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudentsCSV,
    attendance,
    markAttendance,
    getAttendanceForDate,
    missions,
    awardStar,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [importResult, setImportResult] = useState<{ added: number; duplicates: number } | null>(null);

  // Today's attendance date
  const todayStr = new Date().toISOString().split('T')[0];
  const [attendanceDate, setAttendanceDate] = useState(todayStr);

  // New Student Form State
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    code: `HS4A4-${String(students.length + 1).padStart(2, '0')}`,
    fullName: '',
    gender: 'Nam',
    dob: '2016-01-01',
    groupNumber: 1,
    parentName: '',
    parentPhone: '',
    address: 'Khoái Châu, Hưng Yên',
    strengths: ['Ngoan ngoãn', 'Tự giác'],
    supportNeeds: ['Cần rèn thêm sự tự tin'],
    personalGoals: ['Đi học đúng giờ, đạt hoa điểm tốt'],
    teacherNotes: '',
    starsCount: 10,
    badges: ['Tân binh 4A4'],
  });

  // Calculate dynamic dashboard stats
  const attStats = getAttendanceForDate(attendanceDate);
  const studentsNeedingSupport = students.filter(
    (s) => s.supportNeeds && s.supportNeeds.length > 0 && s.supportNeeds[0].length > 0
  ).length;
  const totalCompletedMissions = missions.reduce((acc, m) => acc + m.completedStudentIds.length, 0);

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || s.groupNumber === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName.trim()) return;

    const ok = addStudent(newStudent);
    if (!ok) {
      alert('Đã tồn tại học sinh trùng họ tên và ngày sinh trong danh sách!');
      return;
    }

    speechService.playGentleDing();
    setIsAddModalOpen(false);
    setNewStudent({
      code: `HS4A4-${String(students.length + 2).padStart(2, '0')}`,
      fullName: '',
      gender: 'Nam',
      dob: '2016-01-01',
      groupNumber: 1,
      parentName: '',
      parentPhone: '',
      address: 'Khoái Châu, Hưng Yên',
      strengths: ['Ngoan ngoãn', 'Tự giác'],
      supportNeeds: ['Cần rèn thêm sự tự tin'],
      personalGoals: ['Đi học đúng giờ, đạt hoa điểm tốt'],
      teacherNotes: '',
      starsCount: 10,
      badges: ['Tân binh 4A4'],
    });
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent.id, editingStudent);
    speechService.playGentleDing();
    setEditingStudent(null);
  };

  const handleDeleteWithConfirm = (id: string, name: string) => {
    if (window.confirm(`Cô có chắc chắn muốn xóa hồ sơ của học sinh: ${name}? Thao tác này không thể hoàn tác.`)) {
      deleteStudent(id);
    }
  };

  const handleImportSubmit = () => {
    if (!csvInput.trim()) return;
    const res = importStudentsCSV(csvInput);
    setImportResult(res);
    speechService.playSuccessSound();
  };

  const handleExportCSV = () => {
    const header = 'Mã HS,Họ và tên,Giới tính,Ngày sinh,Tổ,Phụ huynh,SĐT,Địa chỉ,Số sao\n';
    const rows = students
      .map(
        (s) =>
          `"${s.code}","${s.fullName}","${s.gender}","${s.dob}",Tổ ${s.groupNumber},"${s.parentName}","${s.parentPhone}","${s.address}",${s.starsCount}`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Danh_sach_lop_4A4_Khoai_Chau_${todayStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Profile Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={teacherProfile.avatarUrl}
              alt={teacherProfile.name}
              className="w-20 h-24 rounded-2xl object-cover object-top border-2 border-sky-400 shadow-md bg-sky-100"
            />
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] rounded-md shadow-xs">
              GVCN
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-800 font-heading">
                Cô {teacherProfile.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                {teacherProfile.roleTitle}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-semibold">
              {teacherProfile.school} • Lớp {teacherProfile.className} ({teacherProfile.province})
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mt-1 font-bold">
              "{teacherProfile.slogan}"
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs text-slate-500 gap-1 self-stretch sm:self-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div><strong>Điện thoại:</strong> {teacherProfile.phone}</div>
          <div><strong>Email:</strong> {teacherProfile.email}</div>
          <div><strong>Năm học:</strong> {teacherProfile.academicYear}</div>
        </div>
      </div>

      {/* 5 Real-Time KPI Cards */}
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
            <span className="text-2xl font-black text-amber-600 font-heading">{studentsNeedingSupport}</span>
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
            <span className="text-xs text-slate-500 font-semibold block">Sao hạnh phúc</span>
            <span className="text-2xl font-black text-pink-600 font-heading">
              {students.reduce((sum, s) => sum + s.starsCount, 0)}
            </span>
            <span className="text-[10px] text-slate-400 block">toàn lớp</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & Group Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc mã HS..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-semibold">Tổ:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 1, label: 'Tổ 1' },
              { id: 2, label: 'Tổ 2' },
              { id: 3, label: 'Tổ 3' },
              { id: 4, label: 'Tổ 4' },
            ].map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGroup === g.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel/CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-sky-600" />
            <span>Xuất file Excel</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Học Sinh</span>
          </button>
        </div>
      </div>

      {/* Attendance & Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Attendance Date Selector */}
        <div className="p-4 bg-sky-50/70 border-b border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-sky-900 uppercase">Điểm danh ngày:</span>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-2.5 py-1 bg-white rounded-lg border border-sky-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Đi học: {attStats.present}
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Có phép: {attStats.excused}
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Không phép: {attStats.unexcused}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã HS</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Tổ</th>
                <th className="py-3 px-4">Điểm danh</th>
                <th className="py-3 px-4">Điểm mạnh & Cần hỗ trợ</th>
                <th className="py-3 px-4 text-center">Sao hạnh phúc</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student) => {
                const attRecord = attendance.find(
                  (a) => a.studentId === student.id && a.date === attendanceDate
                );
                const currentStatus = attRecord ? attRecord.status : 'present';

                return (
                  <tr key={student.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">{student.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{student.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {student.gender} • Sinh ngày {student.dob}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[11px]">
                        Tổ {student.groupNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => markAttendance(student.id, attendanceDate, 'present')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Đánh dấu Đi học"
                        >
                          Đi học
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, attendanceDate, 'excused')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Đánh dấu Nghỉ có phép"
                        >
                          Có phép
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, attendanceDate, 'unexcused')}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                            currentStatus === 'unexcused'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Đánh dấu Nghỉ không phép"
                        >
                          Không phép
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-[11px] text-emerald-700 truncate font-semibold">
                        ✨ {student.strengths?.join(', ') || 'Chưa ghi nhận'}
                      </div>
                      <div className="text-[11px] text-amber-700 truncate">
                        🌱 {student.supportNeeds?.join(', ') || 'Cần theo dõi'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{student.starsCount}</span>
                        <button
                          onClick={() => {
                            awardStar(student.id, 1);
                            speechService.playGentleDing();
                          }}
                          className="w-4 h-4 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 flex items-center justify-center font-black text-[10px]"
                          title="Tặng thêm 1 sao"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWithConfirm(student.id, student.fullName)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          title="Xóa hồ sơ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" /> Thêm Hồ Sơ Học Sinh Mới
            </h3>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Học sinh</label>
                <input
                  type="text"
                  value={newStudent.code}
                  onChange={(e) => setNewStudent({ ...newStudent, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên học sinh</label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Giới tính</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={newStudent.dob}
                    onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tổ học tập</label>
                  <select
                    value={newStudent.groupNumber}
                    onChange={(e) => setNewStudent({ ...newStudent, groupNumber: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ tên Phụ huynh</label>
                  <input
                    type="text"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SĐT Phụ huynh</label>
                  <input
                    type="text"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={newStudent.address}
                  onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md hover:bg-sky-700"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-sky-600" /> Chỉnh Sửa Hồ Sơ: {editingStudent.fullName}
            </h3>

            <form onSubmit={handleUpdateStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tổ học tập</label>
                  <select
                    value={editingStudent.groupNumber}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, groupNumber: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số sao tích lũy</label>
                  <input
                    type="number"
                    value={editingStudent.starsCount}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, starsCount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Điểm mạnh (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editingStudent.strengths?.join(', ')}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      strengths: e.target.value.split(',').map((x) => x.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nhu cầu cần hỗ trợ (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editingStudent.supportNeeds?.join(', ')}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      supportNeeds: e.target.value.split(',').map((x) => x.trim()),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú của cô giáo chủ nhiệm</label>
                <textarea
                  value={editingStudent.teacherNotes}
                  onChange={(e) => setEditingStudent({ ...editingStudent, teacherNotes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md hover:bg-sky-700"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel / CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" /> Nhập Danh Sách Học Sinh từ Excel/CSV
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dán dữ liệu dạng bảng phân cách bằng dấu phẩy hoặc tab (Họ và tên, Giới tính, Ngày sinh, Tổ, Phụ huynh, SĐT, Địa chỉ). Hệ thống tự động kiểm tra và loại bỏ học sinh trùng lặp.
            </p>

            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="Nguyễn Văn A, Nam, 2016-04-12, 1, Nguyễn Văn B, 0988123456, Khoái Châu
Trần Thị C, Nữ, 2016-08-20, 2, Trần Thị D, 0988654321, Hưng Yên"
              rows={8}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
            />

            {importResult && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                ✅ Đã thêm mới thành công: <strong>{importResult.added}</strong> học sinh.
                {importResult.duplicates > 0 && (
                  <span className="text-amber-700 ml-2">
                    (Bỏ qua <strong>{importResult.duplicates}</strong> học sinh trùng lặp).
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportResult(null);
                  setCsvInput('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700"
              >
                Tiến hành Nhập dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
