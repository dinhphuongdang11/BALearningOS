import React, { useState, useEffect } from "react";
import { ChevronLeft, CheckSquare, Save, CheckCircle2, Flame, ListChecks, FileText, Sparkles, BookOpen, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Lesson, ChecklistItem, Practice, LessonStatus } from "../lib/types";

interface LessonDetailViewProps {
  lessonId: string;
  stageTitle: string;
  onBack: () => void;
  getLessonDetails: (id: string) => Promise<Lesson & { checklistItems: ChecklistItem[]; practice: Practice }>;
  onSavePractice: (id: string, projectName: string, content: string, reflection: string) => Promise<Practice>;
  onUpdateStatus: (id: string, status: LessonStatus) => Promise<any>;
  onUpdatePersonalNote: (id: string, note: string) => Promise<any>;
  onToggleChecklistItem: (itemId: string) => Promise<any>;
  onAddChecklistItem: (lessonId: string, content: string) => Promise<ChecklistItem>;
}

export default function LessonDetailView({
  lessonId,
  stageTitle,
  onBack,
  getLessonDetails,
  onSavePractice,
  onUpdateStatus,
  onUpdatePersonalNote,
  onToggleChecklistItem,
  onAddChecklistItem
}: LessonDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"theory" | "workspace">("theory");
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [lesson, setLesson] = useState<any | null>(null);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [practice, setPractice] = useState<Practice | null>(null);

  const [projectName, setProjectName] = useState("");
  const [practiceContent, setPracticeContent] = useState("");
  const [reflection, setReflection] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [newChecklistText, setNewChecklistText] = useState("");

  const [savingPractice, setSavingPractice] = useState(false);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLessonDetails(lessonId);
      setLesson(data);
      setChecklists(data.checklistItems || []);
      setPractice(data.practice || null);
      
      if (data.practice) {
        setProjectName(data.practice.projectName || "");
        setPracticeContent(data.practice.content || "");
        setReflection(data.practice.reflection || "");
      } else {
        setProjectName("");
        setPracticeContent("");
        setReflection("");
      }
      // Attempt to load note from localStorage, backup to database field
      let savedNote = "";
      if (typeof window !== "undefined") {
        savedNote = localStorage.getItem(`lesson-note-${data.id}`) || "";
      }
      setPersonalNote(savedNote || (data as any).personalNote || "");
    } catch (err: any) {
      setError(err?.message || "Không thể tải cấu trúc bài học này.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [lessonId]);

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleStatusChange = async (status: LessonStatus) => {
    if (!lesson) return;
    try {
      await onUpdateStatus(lesson.id, status);
      setLesson({ ...lesson, status });
      triggerToast(`Đã chuyển trạng thái bài học sang "${status === LessonStatus.COMPLETED ? "Hoàn thành" : status === LessonStatus.IN_PROGRESS ? "Đang học" : "Chưa học"}"`);
    } catch (e) {
      triggerToast("Không thể cập nhật trạng thái", "error");
    }
  };

  const handleSaveWorkspace = async () => {
    if (!lesson) return;
    try {
      setSavingPractice(true);
      const savedPractice = await onSavePractice(lesson.id, projectName, practiceContent, reflection);
      setPractice(savedPractice);

      await onUpdatePersonalNote(lesson.id, personalNote);
      if (typeof window !== "undefined") {
        localStorage.setItem(`lesson-note-${lesson.id}`, personalNote);
      }
      setLesson({ ...lesson, personalNote });

      triggerToast("Đã lưu giữ kết quả bài làm và ghi chú thành công!");
    } catch (e) {
      triggerToast("Lỗi khi ghi nhận bài làm thực hành", "error");
    } finally {
      setSavingPractice(false);
    }
  };

  const handleChecklistToggle = async (itemId: string) => {
    try {
      await onToggleChecklistItem(itemId);
      setChecklists(
        checklists.map((c) => (c.id === itemId ? { ...c, isChecked: !c.isChecked } : c))
      );
      triggerToast("Đã cập nhật trạng thái checklist tự review!");
    } catch (e) {
      triggerToast("Lỗi khi cập nhật checklist", "error");
    }
  };

  const handleAddCheckItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !newChecklistText.trim()) return;
    try {
      const newItem = await onAddChecklistItem(lesson.id, newChecklistText.trim());
      setChecklists([...checklists, newItem]);
      setNewChecklistText("");
      triggerToast("Đã bổ sung câu hỏi tự review mới!");
    } catch (e) {
      triggerToast("Lỗi khi thêm checklist mới", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-slate-400" id="lesson-loading-state">
        <Sparkles className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold text-slate-400">Đang chuẩn bị học liệu cá nhân...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="bg-slate-900 border border-red-500/30 p-6 rounded-xl text-center space-y-3 max-w-md mx-auto my-12" id="lesson-error-state">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-sm font-bold text-red-300">Lỗi Hệ thống</h3>
        <p className="text-xs text-red-450 font-medium">{error || "Khởi tạo bài học thất bại."}</p>
        <button onClick={onBack} className="text-xs font-bold text-emerald-450 underline cursor-pointer">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const checkedChecklistCount = checklists.filter((c) => c.isChecked).length;
  const totalChecklistCount = checklists.length;
  const progressRatio = totalChecklistCount > 0 ? Math.round((checkedChecklistCount / totalChecklistCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 relative font-sans text-slate-100" id="lesson-detail-active-view">
      {/* Back & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          id="btn-back-to-stage-lessons"
          className="flex items-center space-x-1 text-slate-450 hover:text-emerald-400 text-sm font-bold transition w-fit cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại Giai đoạn</span>
        </button>

        <div className="flex items-center space-x-1 text-xs text-slate-400 font-semibold truncate max-w-md">
          <span className="text-slate-400">{stageTitle.replace(/^\d+\.\s*/, "")}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300 font-bold max-w-xs truncate">{lesson.title}</span>
        </div>
      </div>

      {/* Floating Alert Toast Messages */}
      {toastMsg && (
        <div
          id="toast-box"
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl border text-sm font-bold shadow-lg animate-bounce ${
            toastMsg.type === "success"
              ? "bg-slate-900 border-emerald-500/20 text-emerald-400"
              : "bg-rose-950 border-rose-800 text-rose-300"
          }`}
        >
          {toastMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Hero Header bar of active Lesson */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">BÀI HỌC CỐ ĐỊNH {lesson.order}</span>
            <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-550/10">
              Personal Edition
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight mt-1">{lesson.title}</h2>
          <p className="text-xs text-slate-355 mt-1 max-w-2xl leading-relaxed">
            <strong>Mục tiêu:</strong> {lesson.objective}
          </p>
        </div>

        {/* Quick status selector */}
        <div className="space-y-2 shrink-0">
          <div className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">Trạng thái bài học</div>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-955 border border-slate-800" id="lesson-status-selectors">
            <button
              onClick={() => handleStatusChange(LessonStatus.NOT_STARTED)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                lesson.status === LessonStatus.NOT_STARTED
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-505 hover:text-slate-300"
              }`}
            >
              Chưa học
            </button>
            <button
              onClick={() => handleStatusChange(LessonStatus.IN_PROGRESS)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                lesson.status === LessonStatus.IN_PROGRESS
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-505 hover:text-slate-300"
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => handleStatusChange(LessonStatus.COMPLETED)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                lesson.status === LessonStatus.COMPLETED
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-505 hover:text-slate-300"
              }`}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </div>

      {/* Tabs list switches */}
      <div className="border-b border-slate-800 flex items-center justify-between pb-px">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("theory")}
            id="tab-btn-theory"
            className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "theory"
                ? "border-emerald-500 text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Tài liệu bài học</span>
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            id="tab-btn-workspace"
            className={`pb-4 text-sm font-bold tracking-tight border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === "workspace"
                ? "border-emerald-500 text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>2. Không gian làm bài & Checklist</span>
            {totalChecklistCount > 0 && (
              <span className="ml-1 text-[10px] bg-slate-805 text-white py-0.5 px-2 rounded-full font-black">
                {checkedChecklistCount}/{totalChecklistCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Contents: 1. Theory */}
      {activeTab === "theory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="theory-tab-content">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-emerald-400" />
                <span>Nội dung lý thuyết (Bite-sized Theory)</span>
              </h3>
              <div className="text-sm text-slate-300 leading-relaxed">
                {lesson.htmlContent ? (
                  <div 
                    className="prose prose-invert max-w-none text-slate-300 parsed-html-content"
                    dangerouslySetInnerHTML={{ 
                      __html: lesson.htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") 
                    }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {lesson.theory || "Không có tài liệu lý thuyết."}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                <span>Ví dụ doanh nghiệp thực tế</span>
              </h3>
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-amber-500/5 p-4 rounded-lg border border-amber-500/10">
                {lesson.example || "Không có ví dụ được ghi nhận."}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-blue-400 border-b border-slate-800 pb-3 flex items-center gap-2">
                <Flame className="w-4.5 h-4.5 text-blue-500" />
                <span>Bài tập thực hành nhỏ</span>
              </h3>
              <p className="text-xs text-slate-500 font-semibold italic">Hãy hoàn thành câu trả lời bài tập này trong Vở làm bài (tab 2).</p>
              <div className="text-sm text-slate-350 leading-relaxed whitespace-pre-wrap bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 font-medium">
                {lesson.exercise || "Không có bài tập đề xuất."}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <TrendingUp className="w-4.5 h-4.5" />
                <span>Áp dụng vào dự án thật</span>
              </div>
              <p className="text-xs text-slate-350 leading-relaxed">
                {lesson.realProjectApplication || "Nghiên cứu ứng dụng bài học này vào dự án phân tích của doanh nghiệp của bạn."}
              </p>
            </div>

            <div className="bg-slate-900 text-slate-100 rounded-xl p-5 space-y-3 border border-slate-800">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                <span>Output cần tạo lập</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {lesson.expectedOutput || "Sản phẩm thực tế/tài liệu BA cần xuất bản."}
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase text-amber-500 block tracking-wider">Ghi chú cá nhân nhanh</span>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Nhập ghi chú nhanh ở đây, sau đó lưu lại ở phím lưu bên Tab 2..."
                className="w-full text-xs text-slate-300 bg-transparent border-none focus:outline-none focus:ring-0 min-h-24 resize-none leading-relaxed placeholder:text-slate-600 outline-none"
              />
              <p className="text-[10px] text-slate-500 font-bold italic">
                * Ghi chú này sẽ được đồng bộ cùng với biểu mẫu thực hành bài làm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: 2. Practice Workspace */}
      {activeTab === "workspace" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="workspace-tab-content">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">Vở thực hành & Hồ sơ bài làm</h3>
                <p className="text-xs text-slate-400">Ghi lại toàn bộ quá trình áp dụng bài học vào thực tế để lưu trữ làm portfolio riêng</p>
              </div>

              <button
                onClick={handleSaveWorkspace}
                disabled={savingPractice}
                id="btn-save-practice"
                className="flex items-center space-x-1.5 py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingPractice ? "Đang lưu..." : "Lưu bài làm"}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Tên dự án đang áp dụng:
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ví dụ: Dự án nâng cấp eKYC TPBank / Redesign App Grab..."
                  className="w-full text-sm text-slate-200 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Nội dung bài làm thực phẩm / Giải bài tập:
                </label>
                <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                  Đặc tả luồng, trả lời câu hỏi bài tập, hoặc ghi lại kết quả phân tích yêu cầu tại đây.
                </p>
                <textarea
                  value={practiceContent}
                  onChange={(e) => setPracticeContent(e.target.value)}
                  rows={14}
                  placeholder="Nhập nội dung bài làm của bạn tại đây... Hãy viết thật chi tiết!"
                  className="w-full text-sm text-slate-200 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-mono resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Đúc kết & Ghi chú tự nhận xét sau buổi học (Self-Reflection):
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  placeholder="Tôi đã phạm phải sai lầm gì? Cần chú ý điều gì tiếp theo khi làm việc với stakeholders?"
                  className="w-full text-sm text-slate-200 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-100 font-bold text-sm">
                  <ListChecks className="w-5 h-5 text-emerald-400" />
                  <span>Checklist tự đánh giá</span>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {progressRatio}%
                </span>
              </div>

              <div className="w-full bg-slate-955 rounded-full h-1">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressRatio}%` }} />
              </div>

              <div className="space-y-3 pt-2" id="lesson-checklist-items">
                {checklists.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">Chưa có tiêu chí review nào.</p>
                ) : (
                  checklists.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleChecklistToggle(item.id)}
                      id={`checklist-item-raw-${item.id}`}
                      className="flex items-start space-x-2.5 p-2 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-800 cursor-pointer transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        readOnly
                        className="mt-0.5 w-4 h-4 text-emerald-550 border-slate-700 bg-slate-950 rounded focus:ring-emerald-500/30 accent-emerald-500 pointer-events-none cursor-pointer"
                      />
                      <span className={`text-xs leading-relaxed font-semibold transition ${item.isChecked ? "text-slate-550 line-through" : "text-slate-300"}`}>
                        {item.content}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddCheckItem} className="pt-2 border-t border-slate-800 flex items-center space-x-1.5">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Thêm câu hỏi review..."
                  className="flex-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 py-2 px-2.5 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />
                <button
                  type="submit"
                  id="btn-add-checklist-direct"
                  className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 px-2.5 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                >
                  Thêm
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Sổ tay cá nhân (Personal Notes):
              </label>
              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Ghi lại các tài liệu phát sinh, link Figma, link draw.io hoặc các thuật ngữ mới của bài hôm nay..."
                className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none min-h-48 resize-y font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
