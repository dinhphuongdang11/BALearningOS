import React from "react";
import { Course, Stage, Lesson } from "../lib/types";
import { ArrowLeft, BookOpen, Clock, Play, CheckCircle2, ChevronRight, Layers, HelpCircle, FileText } from "lucide-react";
import Image from "next/image";

interface CourseDetailViewProps {
  course: Course;
  stages: Stage[];
  lessons: Lesson[];
  progressList: any[];
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export default function CourseDetailView({
  course,
  stages,
  lessons,
  progressList,
  onBack,
  onSelectLesson
}: CourseDetailViewProps) {
  // Filter stages that belong to this course
  const courseStages = stages
    .filter(s => s.courseId === course.id)
    .sort((a, b) => a.order - b.order);

  const stageIds = new Set(courseStages.map(s => s.id));
  const courseLessons = lessons.filter(l => stageIds.has(l.stageId));

  // Helper to map lesson statuses
  const getLessonStatus = (lessonId: string) => {
    const progress = progressList.find(p => p.entityType === "LESSON" && p.entityId === lessonId);
    return progress ? progress.status : "NOT_STARTED";
  };

  // Find first uncompleted lesson to recommend as "next up"
  const getNextLessonId = () => {
    for (const stage of courseStages) {
      const stageLessons = courseLessons
        .filter(l => l.stageId === stage.id)
        .sort((a, b) => a.order - b.order);
      
      for (const lesson of stageLessons) {
        if (getLessonStatus(lesson.id) !== "COMPLETED") {
          return lesson.id;
        }
      }
    }
    return courseLessons[0]?.id || null;
  };

  const nextLessonId = getNextLessonId();

  return (
    <div className="space-y-8 animate-fadeIn font-sans" id="course-detail-root">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Quay lại danh sách khóa học
      </button>

      {/* Course Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="course-detail-banner">
        <div className="flex flex-col lg:flex-row">
          {/* Cover image */}
          <div className="h-48 lg:h-auto lg:w-80 bg-slate-950 relative border-b lg:border-b-0 lg:border-r border-slate-800">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-slate-800">
                <BookOpen className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10">
                  {course.category}
                </span>
                <span className="text-[10px] font-black uppercase bg-slate-800 text-slate-300 px-2.5 py-1 rounded">
                  {course.level}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
                {course.title}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                {course.description}
              </p>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-850">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-600" />
                  {courseStages.length} Chương/Giai đoạn
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  {courseLessons.length} Bài học học thuật
                </span>
              </div>

              {courseLessons.length > 0 && nextLessonId && (
                <button
                  onClick={() => onSelectLesson(nextLessonId)}
                  className="ml-auto py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-600/15 cursor-pointer transition"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {progressList.some(p => p.entityType === "LESSON" && p.status !== "NOT_STARTED") ? "Học tiếp bài đang dang dở" : "Bắt đầu bài học đầu tiên"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Syllabus */}
      <div className="space-y-6" id="course-syllabus">
        <h3 className="text-base font-extrabold text-slate-200">
          Chương Trình Đào Tạo ({courseStages.length} Giai đoạn)
        </h3>

        <div className="space-y-6">
          {courseStages.map((stage, sIdx) => {
            const stageLessons = courseLessons
              .filter(l => l.stageId === stage.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={stage.id}
                id={`stage-accordion-${stage.id}`}
                className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden p-6 space-y-4"
              >
                {/* Stage Header */}
                <div className="flex items-start justify-between border-b border-slate-850 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-500 tracking-wider block uppercase">
                      Giai đoạn {stage.order || sIdx + 1}
                    </span>
                    <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                      {stage.title}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-4xl leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-2.5">
                  {stageLessons.map((lesson, lIdx) => {
                    const status = getLessonStatus(lesson.id);
                    const isCompleted = status === "COMPLETED";
                    const isInProgress = status === "IN_PROGRESS";

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className="group flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-850/30 border border-slate-900/60 hover:border-slate-805 rounded-xl cursor-pointer transition duration-150"
                      >
                        <div className="flex items-center space-x-4">
                          {/* Left Status Indicator Icon */}
                          <div>
                            {isCompleted ? (
                              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            ) : isInProgress ? (
                              <div className="w-7 h-7 flex items-center justify-center bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-lg text-slate-500 text-[10px] font-black">
                                {lesson.order || lIdx + 1}
                              </div>
                            )}
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-[10px] font-semibold text-slate-500">Bài {lesson.order || lIdx + 1}</span>
                            <h5 className="text-xs font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">
                              {lesson.title}
                            </h5>
                          </div>
                        </div>

                        {/* Right Details */}
                        <div className="flex items-center space-x-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            isCompleted
                              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                              : isInProgress
                              ? "bg-blue-500/5 text-blue-400 border-blue-500/10 animate-pulse"
                              : "bg-slate-900 text-slate-500 border-slate-800"
                          }`}>
                            {isCompleted ? "Hoàn thành" : isInProgress ? "Đang học" : "Chưa học"}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}

                  {stageLessons.length === 0 && (
                    <div className="py-4 text-center text-xs text-slate-600 bg-slate-950/20 rounded-xl border border-dashed border-slate-850">
                      Chưa có bài học nào được cấu hình trong giai đoạn này.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {courseStages.length === 0 && (
            <div className="py-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
              Khóa học này chưa được cấu hình lộ trình giai đoạn nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
