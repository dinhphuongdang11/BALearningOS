import React, { useState } from "react";
import { Search, Filter, PlayCircle, Edit3, Trash2, PlusCircle, BookOpen, Compass, AlertCircle } from "lucide-react";
import { Lesson, Stage, LessonStatus } from "../types.js";

interface LessonManagerViewProps {
  lessons: Lesson[];
  stages: Stage[];
  stagesMap: Record<string, string>;
  onSelectLesson: (id: string) => void;
  onEditLesson: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: () => void;
}

export default function LessonManagerView({
  lessons,
  stages,
  stagesMap,
  onSelectLesson,
  onEditLesson,
  onDeleteLesson,
  onAddLesson
}: LessonManagerViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStageFilter, setSelectedStageFilter] = useState("all");

  // Get status class
  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case LessonStatus.COMPLETED:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            Hoàn thành
          </span>
        );
      case LessonStatus.IN_PROGRESS:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            Đang học
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Chưa học
          </span>
        );
    }
  };

  // Stage clean title resolver safely
  const getStageCleanName = (stageId: string) => {
    const raw = stagesMap[stageId] || "Không xác định";
    return raw.replace(/^\d+\.\s*/, ""); // strip "1. " etc.
  };

  // Filter lessons
  const filteredLessons = lessons.filter((lesson) => {
    const matchSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        lesson.objective.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStage = selectedStageFilter === "all" || lesson.stageId === selectedStageFilter;
    return matchSearch && matchStage;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="lesson-manager-view-wrapper">
      {/* Header index panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thiết lập học liệu và Tiến độ</h2>
          <p className="text-sm text-slate-500 mt-1">
            Xem toàn bộ danh mục bài học, tinh chỉnh nội dung lý thuyết, hoặc xóa các mô-đun không cần thiết.
          </p>
        </div>

        <button
          onClick={onAddLesson}
          id="btn-add-lesson-manager-panel"
          className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Query Filter row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between" id="filter-bar">
        {/* Search input text */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm bài học, mục tiêu..."
            className="w-full text-xs text-slate-800 border border-slate-200 pl-9 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Stage selection filters */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-slate-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="text-xs text-slate-700 border border-slate-200 py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white w-full md:w-64 font-medium"
          >
            <option value="all">Tất cả giai đoạn học BA</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="lesson-database-grid">
        {filteredLessons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
            <h4 className="text-sm font-semibold text-slate-700">Không tìm thấy bài học nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Không tìm thấy bài học phù hợp với từ khóa hoặc giai đoạn lọc hiện tại. Thử đổi tiêu chí tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Thứ tự</th>
                  <th className="py-4 px-3">Tên bài học</th>
                  <th className="py-4 px-3">Giai đoạn</th>
                  <th className="py-4 px-3">Trạng thái</th>
                  <th className="py-4 px-3 hidden md:table-cell">Cập nhật</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-4 px-6 font-bold text-slate-400 w-16">
                      #{lesson.order}
                    </td>
                    <td className="py-4 px-3 font-semibold text-slate-800 max-w-xs truncate">
                      {lesson.title}
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">
                      {getStageCleanName(lesson.stageId)}
                    </td>
                    <td className="py-4 px-3">
                      {getStatusBadge(lesson.status)}
                    </td>
                    <td className="py-4 px-3 text-slate-400 font-medium hidden md:table-cell">
                      {new Date(lesson.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1 w-44">
                      <button
                        onClick={() => onSelectLesson(lesson.id)}
                        id={`btn-manage-study-lesson-${lesson.id}`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg transition inline-flex items-center"
                        title="Vào học / Xem"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditLesson(lesson.id)}
                        id={`btn-manage-edit-lesson-${lesson.id}`}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition inline-flex items-center"
                        title="Sửa bài"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        id={`btn-manage-delete-lesson-${lesson.id}`}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition inline-flex items-center"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
