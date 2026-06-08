import React from "react";
import { ChevronLeft, PlusCircle, PlayCircle, Edit3, Trash2, BookOpen, Compass } from "lucide-react";
import { Stage, Lesson, LessonStatus } from "../types.js";

interface StageDetailViewProps {
  stage: Stage & { lessons: Lesson[] };
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
  onAddLessonToStage: (stageId: string) => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export default function StageDetailView({
  stage,
  onBack,
  onSelectLesson,
  onAddLessonToStage,
  onEditLesson,
  onDeleteLesson
}: StageDetailViewProps) {
  const compCount = stage.lessons.filter((l) => l.status === LessonStatus.COMPLETED).length;
  const totalCount = stage.lessons.length;
  const percentage = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;

  const getStatusBadge = (status: LessonStatus) => {
    switch (status) {
      case LessonStatus.COMPLETED:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✓ Hoàn thành
          </span>
        );
      case LessonStatus.IN_PROGRESS:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            ● Đang học
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
            Chưa học
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="stage-detail-wrapper">
      {/* Back button */}
      <button
        onClick={onBack}
        id="btn-back-to-stages"
        className="flex items-center space-x-1 text-slate-500 hover:text-emerald-600 text-sm font-bold transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại danh sách</span>
      </button>

      {/* Hero Header Area */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-xl border border-slate-800 p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <span className="text-xs uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-500/10 font-extrabold tracking-wider">
              Chi tiết Lộ trình
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{stage.title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">{stage.description}</p>
            
            {/* Goal callout */}
            <div className="text-xs text-slate-400 mt-4 border-l-2 border-emerald-500 pl-4 py-1">
              <span className="block font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1">Mục tiêu phát triển</span>
              {stage.goal}
            </div>
          </div>

          {/* Progress Circle or Meter */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 shrink-0 text-center space-y-2 md:w-40">
            <div className="text-2xl font-black text-emerald-400">{percentage}%</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tiến trình</div>
            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
            </div>
            <div className="text-xs text-slate-400 font-medium">{compCount} / {totalCount} học xong</div>
          </div>
        </div>
      </div>

      {/* Lesson List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
            <span>Danh sách bài học ({totalCount})</span>
          </h3>
          <p className="text-xs text-slate-500">Tự quản lý bài học, đọc tài liệu và lưu trữ ghi chép thực hành</p>
        </div>
        <button
          onClick={() => onAddLessonToStage(stage.id)}
          id="btn-add-lesson-stage-direct"
          className="flex items-center justify-center space-x-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-emerald-600/10 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Lessons Cards container */}
      <div className="space-y-4" id="lessons-cards-list">
        {totalCount === 0 ? (
          <div className="border border-dashed border-slate-300 bg-white p-12 text-center rounded-xl space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
            <h4 className="text-sm font-semibold text-slate-700">Chưa có bài học nào được định nghĩa</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Nhấp vào nút "Thêm bài học mới" ở góc trên bên phải để tạo bài học đầu tiên cho giai đoạn này!
            </p>
          </div>
        ) : (
          stage.lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="bg-white border border-slate-200/90 rounded-xl p-5 hover:border-slate-300 transition shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Text Content */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-slate-400 shrink-0">BÀI {lesson.order}:</span>
                    <h4 className="text-base font-bold text-slate-800 truncate">{lesson.title}</h4>
                    <span className="shrink-0">{getStatusBadge(lesson.status)}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    {lesson.objective}
                  </p>
                </div>

                {/* Operations column */}
                <div className="shrink-0 flex items-center space-x-2 w-fit">
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    id={`btn-study-lesson-${lesson.id}`}
                    className="flex items-center space-x-1.5 py-2 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Học & Làm bài</span>
                  </button>

                  <button
                    onClick={() => onEditLesson(lesson.id)}
                    id={`btn-quick-edit-lesson-${lesson.id}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Chỉnh sửa nội dung"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteLesson(lesson.id)}
                    id={`btn-quick-delete-lesson-${lesson.id}`}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa bài học"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
