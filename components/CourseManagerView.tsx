import React, { useState } from "react";
import { Course } from "../lib/types";
import { PlusCircle, Search, Edit2, Trash2, BookOpen, Layers, Award, ShieldAlert, Sliders, ExternalLink, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface CourseManagerViewProps {
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (id: string) => void;
  onDeleteCourse: (id: string) => void;
  onManageStages: (courseId: string) => void;
}

export default function CourseManagerView({
  courses,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onManageStages
}: CourseManagerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans" id="course-manager-view-root">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
            Bảng điều hành: Quản lý Khóa học ({courses.length})
          </h2>
          <p className="text-xs text-slate-400">
            Khởi tạo, điều chỉnh học liệu, phân cấp khóa học, sắp xếp mức độ hiển thị trong cổng học tập cá nhân.
          </p>
        </div>
        <button
          onClick={onAddCourse}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          Thêm khóa học mới
        </button>
      </div>

      {/* Toolbar Search */}
      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-850 p-3.5 rounded-xl">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm khóa học theo tên hoặc danh mục..."
          className="flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-550 font-medium"
        />
      </div>

      {/* Course List Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-5">Tên khóa học</th>
                <th className="py-3 px-5">Phân loại / Cấp độ</th>
                <th className="py-3 px-5 text-center">Thứ tự</th>
                <th className="py-3 px-5 text-center">Trạng thái</th>
                <th className="py-3 px-5 text-right">Hành động điều hướng / Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredCourses.map((course) => {
                const isDraft = course.status === "DRAFT";

                return (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-855/20 transition-colors group"
                    id={`manager-course-row-${course.id}`}
                  >
                    {/* Course Title and Description */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                          {course.thumbnail ? (
                            <Image
                              src={course.thumbnail}
                              alt={course.title}
                              fill
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <span className="font-extrabold text-slate-200 group-hover:text-emerald-400 transition-colors block">
                            {course.title}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 block leading-relaxed">
                            {course.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category and Level */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">
                          📁 {course.category}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold">
                          📈 {course.level}
                        </span>
                      </div>
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-5 text-center font-black text-slate-400 whitespace-nowrap">
                      #{course.sortOrder}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        isDraft
                          ? "bg-amber-500/5 text-amber-400 border-amber-500/10"
                          : "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                      }`}>
                        {isDraft ? "Bản nháp" : "Đã đăng"}
                      </span>
                    </td>

                    {/* Operations */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Manage Syllabus button */}
                        <button
                          onClick={() => onManageStages(course.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 hover:border-slate-600 text-slate-300 rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                          title="Quản lý Giai đoạn/Chương của khóa học này"
                        >
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          Xem lộ trình học
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditCourse(course.id)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-750 hover:text-white transition cursor-pointer"
                          title="Sửa thông tin khóa học"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDeleteCourse(course.id)}
                          className="p-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    Không tìm thấy khóa học nào khớp với điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
