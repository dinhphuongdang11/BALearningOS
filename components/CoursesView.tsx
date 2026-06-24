import React from "react";
import { Course, Stage, Lesson } from "../lib/types";
import { Award, Layers, BookOpen, Compass, ChevronRight, Play } from "lucide-react";
import Image from "next/image";

interface CoursesViewProps {
  courses: Course[];
  stages: Stage[];
  lessons: Lesson[];
  progressList: any[]; // User's progress entries
  onSelectCourse: (courseId: string) => void;
}

export default function CoursesView({
  courses,
  stages,
  lessons,
  progressList,
  onSelectCourse
}: CoursesViewProps) {
  // Helper to calculate course-level progress stats
  const getCourseStats = (courseId: string) => {
    const courseStages = stages.filter(s => s.courseId === courseId);
    const stageIds = new Set(courseStages.map(s => s.id));
    const courseLessons = lessons.filter(l => stageIds.has(l.stageId));
    
    const totalLessons = courseLessons.length;
    const lessonIds = new Set(courseLessons.map(l => l.id));
    
    const completedLessons = progressList.filter(
      p => p.entityType === "LESSON" && p.status === "COMPLETED" && lessonIds.has(p.entityId)
    ).length;

    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      totalStages: courseStages.length,
      totalLessons,
      completedLessons,
      percentage
    };
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans" id="courses-view-root">
      {/* Hero Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl" id="courses-hero">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full inline-block">
            Không gian học cá nhân
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Khóa Học Học Tập Cá Nhân
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Học tập theo lộ trình cá nhân hóa, theo dõi tiến trình thực tế, thực hành các dự án thực tế và tích lũy kiến thức chuẩn BA chuyên nghiệp.
          </p>
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-200">
            Danh sách khóa học hiện có ({courses.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="courses-grid">
          {courses.map((course) => {
            const { totalStages, totalLessons, percentage } = getCourseStats(course.id);
            const isStarted = percentage > 0;
            const isCompleted = percentage === 100 && totalLessons > 0;

            return (
              <div
                key={course.id}
                id={`course-card-${course.id}`}
                className="bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 shadow-lg group"
              >
                {/* Thumbnail */}
                <div className="h-44 w-full bg-slate-950 relative overflow-hidden border-b border-slate-800/60">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-slate-700">
                      <BookOpen className="w-12 h-12" />
                    </div>
                  )}

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black uppercase bg-slate-950/80 backdrop-blur-md text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10">
                      {course.category}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-slate-950/80 backdrop-blur-md text-slate-300 px-2.5 py-1 rounded border border-slate-800">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {course.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold border-t border-slate-850 pt-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      {totalStages} Chương học
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      {totalLessons} Bài học
                    </span>
                  </div>

                  {/* Progress Indicator */}
                  <div className="space-y-1.5 border-t border-slate-850 pt-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-bold">Tiến độ hoàn thành</span>
                      <span className="text-emerald-400 font-extrabold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-850 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-teal-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onSelectCourse(course.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : isStarted
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Award className="w-4 h-4" />
                        Ôn tập kiến thức
                      </>
                    ) : isStarted ? (
                      <>
                        <Compass className="w-4 h-4" />
                        Tiếp tục học tập
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Bắt đầu học ngay
                      </>
                    )}
                    <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Chưa có khóa học nào được xuất bản. Vui lòng chuyển vai trò thành Admin để khởi tạo hoặc nhập khẩu Excel mẫu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
