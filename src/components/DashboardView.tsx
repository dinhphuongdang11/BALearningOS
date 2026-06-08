import React from "react";
import { Compass, BookOpen, CheckCircle, TrendingUp, ArrowRight, PlayCircle } from "lucide-react";
import { LessonStatus } from "../types.js";

interface DashboardStats {
  totalStages: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  recentLessons: any[];
  stageProgress: any[];
}

interface DashboardViewProps {
  stats: DashboardStats;
  onNavigateToStage: (stageId: string) => void;
  onNavigateToLesson: (lessonId: string) => void;
  stagesMap: Record<string, string>;
}

export default function DashboardView({ stats, onNavigateToStage, onNavigateToLesson, stagesMap }: DashboardViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case LessonStatus.COMPLETED:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case LessonStatus.IN_PROGRESS:
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-500 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case LessonStatus.COMPLETED:
        return "Đã hoàn thành";
      case LessonStatus.IN_PROGRESS:
        return "Đang học";
      default:
        return "Chưa bắt đầu";
    }
  };

  // Safe helper to get stage title representation
  const getStageNameClean = (stageId: string) => {
    const rawName = stagesMap[stageId] || "Giai đoạn";
    return rawName.replace(/^\d+\.\s*/, ""); // remove number prefixes like "1. "
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto" id="dashboard-view-wrapper">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chào mừng đến với BA Learning OS</h2>
          <p className="text-sm text-slate-500 mt-1">Lộ trình 6 giai đoạn học tập Business Analyst chuyên nghiệp được hệ thống hoá tối ưu cho bạn.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-fit">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span>Thời gian học hôm nay: {new Date().toLocaleDateString("vi-VN")}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng giai đoạn</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalStages}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng bài học</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats.totalLessons}</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.completedLessons}</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đang học tập</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">{stats.inProgressLessons}</p>
          </div>
        </div>
      </div>

      {/* Main Content Split: Stages & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="dashboard-sections">
        {/* Stages Progress list (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Tiến trình theo giai đoạn</h3>
            <span className="text-xs font-medium text-slate-400">Roadmap 6 Giai đoạn</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {stats.stageProgress.map((stage) => (
              <div key={stage.stageId} className="p-5 hover:bg-slate-50/50 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Giai đoạn {stage.stageId.replace("stage-", "")}</span>
                  <h4 className="text-base font-semibold text-slate-800 truncate mt-0.5">
                    {stage.stageTitle}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-2">
                    <span>Tổng: <strong className="text-slate-700">{stage.totalLessons}</strong> bài</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-emerald-600">Đã học: <strong>{stage.completedLessons}</strong></span>
                    {stage.inProgressLessons > 0 && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-amber-600 font-medium">Đang học: {stage.inProgressLessons}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-48 shrink-0 flex items-center space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{stage.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToStage(stage.stageId)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    title="Xem chi tiết"
                    id={`btn-explore-stage-${stage.stageId}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent lessons activity list (1/3 width on large screens) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Bài học vừa cập nhật</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
            {stats.recentLessons.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-sm font-medium">Chưa có bài học nào được tạo.</p>
              </div>
            ) : (
              stats.recentLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition group flex flex-col justify-between"
                  id={`recent-lesson-item-${lesson.id}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {getStageNameClean(lesson.stageId)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(lesson.status)}`}>
                        {getStatusLabel(lesson.status)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-1 group-hover:text-emerald-600 transition truncate">
                      {lesson.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {lesson.objective}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigateToLesson(lesson.id)}
                    className="mt-3.5 w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 bg-slate-50 group-hover:bg-emerald-50 rounded-lg text-xs font-semibold text-slate-600 group-hover:text-emerald-700 transition"
                    id={`btn-quick-learn-${lesson.id}`}
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Học tiếp</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Quick Motivational Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-xl border border-slate-800 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 text-slate-800 stroke-[5] scale-[1.6] opacity-30 select-none">
              <Compass className="w-24 h-24 stroke-1 text-slate-700" />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10">
                BA PRO TIP
              </span>
              <p className="text-sm font-semibold leading-relaxed pt-1">
                "Requirements are not what customers tell you; they are the solutions you find after understanding their root problems."
              </p>
              <p className="text-[10px] text-slate-400 font-bold">— BABOK Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
