import React, { useState, useEffect } from "react";
import { ChevronLeft, PlusCircle, PlayCircle, Edit3, Trash2, BookOpen, Compass, Award, Save, CheckSquare, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Stage, Lesson, LessonStatus } from "../lib/types";

interface StageDetailViewProps {
  stage: Stage & { lessons: Lesson[] };
  onBack: () => void;
  onSelectLesson: (lessonId: string) => void;
  onAddLessonToStage: (stageId: string) => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  role: "user" | "admin";
  onSaveStagePractice?: (stageId: string, payload: { projectName: string; content: string; reflection: string }) => Promise<any>;
}

export default function StageDetailView({
  stage,
  onBack,
  onSelectLesson,
  onAddLessonToStage,
  onEditLesson,
  onDeleteLesson,
  role,
  onSaveStagePractice
}: StageDetailViewProps) {
  const isUser = role === "user";
  
  // Progress Calculations
  const compCount = stage.lessons.filter((l) => (l.status as any) === LessonStatus.COMPLETED).length;
  const totalCount = stage.lessons.length;
  const percentage = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;

  // Accordion Expand State for Big Exercise Workspace
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  
  // Practice states
  const [projectName, setProjectName] = useState("");
  const [practiceContent, setPracticeContent] = useState("");
  const [reflection, setReflection] = useState("");
  const [savingPractice, setSavingPractice] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Self Checklist checkboxes states from stage.finalChecklist (parsed per line)
  const [checklistItems, setChecklistItems] = useState<{ text: string; checked: boolean }[]>([]);

  // Parse lines for checklist
  useEffect(() => {
    if (stage.finalChecklist) {
      const lines = stage.finalChecklist
        .split("\n")
        .map((l) => l.trim().replace(/^-\s*/, ""))
        .filter((l) => l.length > 0);

      const items = lines.map((line, idx) => {
        // Load persist check state from localStorage
        const saved = typeof window !== "undefined" ? localStorage.getItem(`stage-chk-${stage.id}-${idx}`) : null;
        return {
          text: line,
          checked: saved === "true",
        };
      });
      setChecklistItems(items);
    } else {
      setChecklistItems([]);
    }

    // Attempt to load previously saved stage practice of this stage from local storage or server
    const savedProj = typeof window !== "undefined" ? localStorage.getItem(`stage-prac-proj-${stage.id}`) : null;
    const savedCont = typeof window !== "undefined" ? localStorage.getItem(`stage-prac-cont-${stage.id}`) : null;
    const savedRefl = typeof window !== "undefined" ? localStorage.getItem(`stage-prac-refl-${stage.id}`) : null;

    if (savedProj || savedCont || savedRefl) {
      setProjectName(savedProj || "");
      setPracticeContent(savedCont || "");
      setReflection(savedRefl || "");
    }
  }, [stage]);

  const handleChecklistToggle = (index: number) => {
    const updated = [...checklistItems];
    updated[index].checked = !updated[index].checked;
    setChecklistItems(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`stage-chk-${stage.id}-${index}`, updated[index].checked.toString());
    }
  };

  const handleSaveWorkspace = async () => {
    try {
      setSavingPractice(true);
      setSaveSuccess(false);

      // Save locally first for robust backups
      if (typeof window !== "undefined") {
        localStorage.setItem(`stage-prac-proj-${stage.id}`, projectName);
        localStorage.setItem(`stage-prac-cont-${stage.id}`, practiceContent);
        localStorage.setItem(`stage-prac-refl-${stage.id}`, reflection);
      }

      // Persist to server if callback supplied
      if (onSaveStagePractice) {
        await onSaveStagePractice(stage.id, {
          projectName,
          content: practiceContent,
          reflection
        });
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đồng bộ kết quả bài tập lớn lên máy chủ.");
    } finally {
      setSavingPractice(false);
    }
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case LessonStatus.COMPLETED:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            ✓ Hoàn thành
          </span>
        );
      case LessonStatus.IN_PROGRESS:
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse">
            ● Đang học
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-400 border border-slate-700/50">
            Chưa học
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-100" id="stage-detail-wrapper">
      {/* Back button */}
      <button
        onClick={onBack}
        id="btn-back-to-stages"
        className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-sm font-bold transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại danh sách</span>
      </button>

      {/* Hero Header Area */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl border border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <span className="text-xs uppercase bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded border border-emerald-550/10 font-extrabold tracking-wider">
              LỘ TRÌNH {stage.code || "BA"}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">{stage.title}</h2>
            <p className="text-sm text-slate-350 leading-relaxed max-w-3xl">{stage.description}</p>
            
            {/* Goal callout */}
            {stage.goal && (
              <div className="text-xs text-slate-400 mt-4 border-l-2 border-emerald-500 pl-4 py-1">
                <span className="block font-bold text-slate-200 uppercase tracking-wider text-[10px] mb-1">Mục tiêu phát triển</span>
                {stage.goal}
              </div>
            )}
          </div>

          {/* Progress Box */}
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

      {/* Stage Big Exercise Panel (Sản phẩm đầu ra / Bài tập lớn khóa) */}
      {stage.bigExercise && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-750 transition" id="big-exercise-accordion">
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="w-full p-5 hover:bg-slate-850/20 transition flex items-center justify-between text-left"
            id="btn-accordion-trigger"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Award className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-200">Đồ án tốt nghiệp & Bài tập lớn của Giai đoạn</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Bóc tách nghiệp vụ thực tế, tạo lập Portfolio năng lực cá nhân</p>
              </div>
            </div>
            {isWorkspaceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isWorkspaceOpen && (
            <div className="border-t border-slate-805 bg-slate-950/40 p-6 space-y-6">
              {/* Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-widest">Đề bài & Yêu cầu thực thi:</span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{stage.bigExercise}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest">Sản phẩm đầu ra (Expected Deliverable):</span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{stage.expectedOutput || "Tài lệu đặc tả yêu cầu, Sơ đồ quy trình, Sơ đồ ca sử dụng..."}</p>
                </div>
              </div>

              {/* Workspace Forms */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-widest">Nộp báo cáo bài tập lớn giai đoạn</h4>
                    <p className="text-[11px] text-slate-500">Nội dung học viên tự do soạn thảo để lưu trữ tiến trình rèn luyện</p>
                  </div>

                  <button
                    onClick={handleSaveWorkspace}
                    disabled={savingPractice}
                    className="flex items-center space-x-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingPractice ? "Đang lưu..." : "Lưu báo cáo"}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/10 text-[11px] text-emerald-400 font-bold rounded-lg flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Đã lưu trữ nội dung bài làm thực hành lớn thành công!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-355 block">Tên đề tài / Dự án lựa chọn nghiên cứu:</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Ví dụ: Phân tích luồng nghiệp vụ quản lý kho của Sapo POS..."
                      className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 p-2.5 rounded-lg outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-355 block">Nội dung chi tiết (Markdown / Text):</label>
                      <textarea
                        value={practiceContent}
                        onChange={(e) => setPracticeContent(e.target.value)}
                        rows={10}
                        placeholder="Hãy ghi rõ ràng luồng nghiệp vụ, luật xử lý hệ thống, mô tả sơ đồ vẽ quy trình tại đây..."
                        className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 p-3 rounded-lg font-mono resize-y outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-355 block">Tự rút ra nhận xét & Ghi chú (Reflection):</label>
                        <textarea
                          value={reflection}
                          onChange={(e) => setReflection(e.target.value)}
                          rows={4}
                          placeholder="Bài học này giúp ích gì cho khả năng giao tiếp của bạn..."
                          className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 p-3 rounded-lg resize-y outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Final Checklist within big exercise */}
                      {checklistItems.length > 0 && (
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-805 space-y-2.5">
                          <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Checklist tự đánh giá:</span>
                          </span>
                          <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                            {checklistItems.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleChecklistToggle(idx)}
                                className="flex items-start space-x-2 cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  readOnly
                                  className="mt-0.5 w-3.5 h-3.5 text-emerald-550 border-slate-700 bg-slate-900 rounded focus:ring-emerald-500/10 pointer-events-none accent-emerald-500"
                                />
                                <span className={`text-[11px] leading-relaxed transition ${item.checked ? "text-slate-500 line-through" : "text-slate-300 font-semibold"}`}>
                                  {item.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lesson List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-emerald-450" />
            <span>Danh sách bài học ({totalCount})</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">Bám sát lộ trình đào tạo Business Analyst, tự đánh giá khi kết thúc mỗi mục học tập</p>
        </div>
        
        {/* HIDE Thêm bài học mới button for User role */}
        {!isUser && (
          <button
            onClick={() => onAddLessonToStage(stage.id)}
            id="btn-add-lesson-stage-direct"
            className="flex items-center justify-center space-x-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm bài học mới</span>
          </button>
        )}
      </div>

      {/* Lessons Cards container */}
      <div className="space-y-4 animate-fadeIn" id="lessons-cards-list">
        {totalCount === 0 ? (
          <div className="border border-dashed border-slate-800 bg-slate-900 p-12 text-center rounded-xl space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
            <h4 className="text-sm font-semibold text-slate-400">Chưa có bài học nào được tạo lập</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isUser ? "Admin hiện chưa đưa ra bài học nào cho giai đoạn này." : "Bấm nút Thêm bài học mới để kiến xuất bài học đầu tiên ngay."}
            </p>
          </div>
        ) : (
          stage.lessons
            .sort((a, b) => a.order - b.order)
            .map((lesson) => (
              <div
                key={lesson.id}
                id={`lesson-card-${lesson.id}`}
                className="bg-slate-900 border border-slate-808 rounded-xl p-5 hover:border-slate-700 transition shadow-sm hover:shadow-md flex flex-col md:flex-row md:items-start justify-between gap-4"
              >
                {/* Text Content */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-slate-500 shrink-0">BÀI {lesson.order}:</span>
                    <h4 className="text-base font-bold text-slate-100 truncate">{lesson.title}</h4>
                    <span className="shrink-0">{getStatusBadge(lesson.status)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {lesson.objective}
                  </p>
                </div>

                {/* Operations column */}
                <div className="shrink-0 flex items-center space-x-2 w-fit">
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    id={`btn-study-lesson-${lesson.id}`}
                    className="flex items-center space-x-1.5 py-2 px-4 bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Học & Làm bài</span>
                  </button>

                  {/* HIDE Edit and Delete buttons for User role */}
                  {!isUser && (
                    <>
                      <button
                        onClick={() => onEditLesson(lesson.id)}
                        id={`btn-quick-edit-lesson-${lesson.id}`}
                        className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-slate-850 rounded-lg transition"
                        title="Chỉnh sửa nội dung"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteLesson(lesson.id)}
                        id={`btn-quick-delete-lesson-${lesson.id}`}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-850 rounded-lg transition"
                        title="Xóa bài học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
