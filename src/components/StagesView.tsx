import React from "react";
import { Compass, Calendar, ArrowRight, ShieldAlert } from "lucide-react";
import { Stage } from "../types.js";

interface StageProgress {
  stageId: string;
  stageTitle: string;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  percentage: number;
}

interface StagesViewProps {
  stages: Stage[];
  progressList: StageProgress[];
  onSelectStage: (stageId: string) => void;
}

export default function StagesView({ stages, progressList, onSelectStage }: StagesViewProps) {
  // Hash map for quick progress lookup
  const progMap = progressList.reduce((acc, curr) => {
    acc[curr.stageId] = curr;
    return acc;
  }, {} as Record<string, StageProgress>);

  return (
    <div className="space-y-8 max-w-6xl mx-auto" id="stages-view-wrapper">
      {/* Header section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lộ trình học BA chuyên nghiệp</h2>
        <p className="text-sm text-slate-500 mt-1">
          Hành trình 6 giai đoạn đưa bạn từ người mới bắt đầu (Fresher) tới chuyên gia phân tích nghiệp vụ cao cấp.
        </p>
      </div>

      {/* Grid of 6 stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="stages-grid-layout">
        {stages.map((stage, sIdx) => {
          const prog = progMap[stage.id] || {
            stageId: stage.id,
            stageTitle: stage.title,
            totalLessons: 0,
            completedLessons: 0,
            inProgressLessons: 0,
            percentage: 0
          };

          return (
            <div
              key={stage.id}
              id={`stage-card-${stage.id}`}
              className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
            >
              {/* Card Header Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Badge Number indicator */}
                  <span className="text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full tracking-wider border border-emerald-100">
                    Phase 0{sIdx + 1}
                  </span>
                  
                  {/* Calendar/Timestamp indicator */}
                  <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Updated
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                  {stage.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {stage.description}
                </p>

                {/* Goals Sub-box */}
                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100/60 mt-4">
                  <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">Mục tiêu cốt lõi</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                    {stage.goal}
                  </p>
                </div>
              </div>

              {/* Progress and Footer block */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                {/* Stats row */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">
                    Sản lượng: <strong className="text-slate-800">{prog.totalLessons}</strong> bài học
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {prog.percentage}% Complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${prog.percentage}%` }}
                  />
                </div>

                {/* Active items helper indicators */}
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-slate-400 font-medium">
                    Đã hoàn thành: <strong className="text-slate-700">{prog.completedLessons}</strong>
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-slate-400 font-medium">
                    Đang làm: <strong className="text-slate-700">{prog.inProgressLessons}</strong>
                  </span>
                </div>

                {/* Action button */}
                <button
                  onClick={() => onSelectStage(stage.id)}
                  id={`btn-view-stage-detail-${stage.id}`}
                  className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-4 bg-emerald-50 hover:bg-emerald-600 rounded-lg text-xs font-bold text-emerald-700 hover:text-white transition-all duration-150"
                >
                  <span>Khám phá bài học</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
