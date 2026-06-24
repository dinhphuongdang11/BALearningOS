import React, { useState } from "react";
import { Search, Compass, Edit3, Trash2, PlusCircle, AlertCircle, Bookmark } from "lucide-react";
import { Stage, Course } from "../lib/types";

interface StageManagerViewProps {
  stages: Stage[];
  courses: Course[];
  onSelectStage: (id: string) => void;
  onEditStage: (id: string) => void;
  onDeleteStage: (id: string) => void;
  onAddStage: () => void;
  selectedCourseId: string | null;
  onCourseChange: (courseId: string | null) => void;
}

export default function StageManagerView({
  stages,
  courses,
  onSelectStage,
  onEditStage,
  onDeleteStage,
  onAddStage,
  selectedCourseId,
  onCourseChange
}: StageManagerViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStages = stages.filter((stage) => {
    const matchesSearch = 
      stage.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stage.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = !selectedCourseId || stage.courseId === selectedCourseId;
    
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans text-slate-100" id="stage-manager-view-wrapper">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Quản lý giai đoạn học tập</h2>
          <p className="text-sm text-slate-400 mt-1">
            Thiết lập luồng lộ trình học tập, quy định các giai đoạn, bài tập lớn và điều kiện đầu ra cần đạt.
          </p>
        </div>

        <button
          onClick={onAddStage}
          id="btn-add-stage-manager-panel"
          className="flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm giai đoạn mới</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between" id="stage-filter-bar">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giai đoạn..."
              className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 pl-9 pr-3 py-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Course filter select */}
          <div className="relative w-full sm:w-64">
            <select
              value={selectedCourseId || ""}
              onChange={(e) => onCourseChange(e.target.value || null)}
              className="w-full text-xs text-slate-205 bg-slate-955 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold cursor-pointer"
            >
              <option value="">-- Tất cả Khóa học --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-bold">Tìm thấy: {filteredStages.length} giai đoạn</span>
      </div>

      {/* Stages Grid/Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden" id="stage-database-grid">
        {filteredStages.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
            <h4 className="text-sm font-semibold text-slate-400">Không tìm thấy giai đoạn nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Chưa có giai đoạn nào khớp với điều kiện tìm kiếm. Hãy thêm mới hoặc sửa lại nội dung.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-805 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 w-24">Thứ tự</th>
                  <th className="py-4 px-3 w-32">Mã Code</th>
                  <th className="py-4 px-3">Tên Giai đoạn</th>
                  <th className="py-4 px-3">Khóa học sở hữu</th>
                  <th className="py-4 px-3 w-32">Trạng thái</th>
                  <th className="py-4 px-6 text-right w-36">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredStages
                  .sort((a, b) => a.order - b.order)
                  .map((stage) => {
                    const matchedCourse = courses.find(c => c.id === stage.courseId);

                    return (
                      <tr key={stage.id} className="hover:bg-slate-800/20 transition">
                        <td className="py-4 px-6 font-extrabold text-slate-400">
                          #{stage.order}
                        </td>
                        <td className="py-4 px-3 font-mono text-emerald-400 font-bold">
                          {stage.code}
                        </td>
                        <td className="py-4 px-3 font-semibold text-slate-200">
                          {stage.title}
                        </td>
                        <td className="py-4 px-3 font-bold text-slate-400">
                          {matchedCourse ? matchedCourse.title : "—"}
                        </td>
                        <td className="py-4 px-3">
                          {stage.status === "PUBLISHED" ? (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                              Phát hành
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-850 text-slate-400 border border-slate-700/50">
                              Bản nháp
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => onEditStage(stage.id)}
                            id={`btn-manage-edit-stage-${stage.id}`}
                            className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg transition inline-flex items-center cursor-pointer"
                            title="Sửa giai đoạn"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteStage(stage.id)}
                            id={`btn-manage-delete-stage-${stage.id}`}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition inline-flex items-center cursor-pointer"
                            title="Xóa giai đoạn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
