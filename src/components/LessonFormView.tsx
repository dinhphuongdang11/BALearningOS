import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Sparkles, BookOpen, Clock, AlertTriangle, FileText, CheckSquare, PlusCircle } from "lucide-react";
import { Lesson, Stage, ChecklistItem } from "../types.js";

interface LessonFormViewProps {
  stages: Stage[];
  editLessonId: string | null;
  getLessonDetails?: (id: string) => Promise<Lesson & { checklistItems: ChecklistItem[] }>;
  onSaveLesson: (id: string | null, lessonInput: any) => Promise<void>;
  onCancel: () => void;
  preSelectedStageId?: string | null;
}

export default function LessonFormView({
  stages,
  editLessonId,
  getLessonDetails,
  onSaveLesson,
  onCancel,
  preSelectedStageId
}: LessonFormViewProps) {
  const isEdit = !!editLessonId;

  // Form fields state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [stageId, setStageId] = useState("");
  const [order, setOrder] = useState(1);
  const [objective, setObjective] = useState("");
  const [theory, setTheory] = useState("");
  const [example, setExample] = useState("");
  const [exercise, setExercise] = useState("");
  const [realProjectApplication, setRealProjectApplication] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [checklistText, setChecklistText] = useState("");

  const [saving, setSaving] = useState(false);

  // Load editing content if in Edit Mode
  useEffect(() => {
    if (isEdit && getLessonDetails && editLessonId) {
      const loadEditData = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getLessonDetails(editLessonId);
          setTitle(data.title || "");
          setStageId(data.stageId || "");
          setOrder(data.order || 1);
          setObjective(data.objective || "");
          setTheory(data.theory || "");
          setExample(data.example || "");
          setExercise(data.exercise || "");
          setRealProjectApplication(data.realProjectApplication || "");
          setExpectedOutput(data.expectedOutput || "");
          
          // Join checklists by newline to editable form
          if (data.checklistItems && data.checklistItems.length > 0) {
            const listStr = data.checklistItems
              .sort((a, b) => a.order - b.order)
              .map((c) => c.content)
              .join("\n");
            setChecklistText(listStr);
          } else {
            setChecklistText("");
          }
        } catch (err: any) {
          setError(err?.message || "Không thể tải thông tin bài học để sửa.");
        } finally {
          setLoading(false);
        }
      };
      
      loadEditData();
    } else {
      // Create Mode init
      setTitle("");
      // select pre-selected, or first stage, or fallback emptystring
      setStageId(preSelectedStageId || (stages.length > 0 ? stages[0].id : ""));
      setOrder(1);
      setObjective("");
      setTheory("");
      setExample("");
      setExercise("");
      setRealProjectApplication("");
      setExpectedOutput("");
      setChecklistText("");
    }
  }, [editLessonId, preSelectedStageId, isEdit, stages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Hãy nhập tiêu đề khóa học.");
      return;
    }
    if (!stageId) {
      setError("Hãy chọn một Giai đoạn phù hợp.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        title: title.trim(),
        stageId,
        order: Number(order) || 1,
        objective: objective.trim(),
        theory: theory.trim(),
        example: example.trim(),
        exercise: exercise.trim(),
        realProjectApplication: realProjectApplication.trim(),
        expectedOutput: expectedOutput.trim(),
        checklistText: checklistText.trim()
      };
      
      await onSaveLesson(editLessonId, payload);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi lưu bài học.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400" id="form-loading-state">
        <Sparkles className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold text-slate-600">Đang đồng bộ cơ sở dữ liệu bài học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12" id="lesson-form-wrapper">
      {/* Back breadcrumb link */}
      <button
        onClick={onCancel}
        id="btn-cancel-lessons-form"
        className="flex items-center space-x-1 text-slate-500 hover:text-emerald-600 text-sm font-bold transition"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Main Form content column */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden" id="curriculum-input-form">
        {/* Banner header title */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? "Chỉnh sửa bài học cố định" : "Thêm bài học mới vào lộ trình"}
            </h2>
            <p className="text-xs text-slate-400">Nhập thủ công hoặc dán nội dung dồi dào từ ChatGPT để tự học</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            id="btn-submit-lesson-form"
            className="flex items-center space-x-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu vào OS"}</span>
          </button>
        </div>

        {/* Global error alert box */}
        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 text-xs text-rose-700 font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Outer Fields grid */}
        <div className="p-6 space-y-6">
          
          {/* Main info row: Title, stageId, order */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Tên bài học:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Problem - Need - Requirement - Solution"
                className="w-full text-xs text-slate-800 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full"
                required
              />
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Giai đoạn:</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full text-xs text-slate-800 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white font-medium"
                required
              >
                <option value="" disabled>--- Chọn giai đoạn ---</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Order order in stage list */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block font-semibold text-slate-700">Thứ tự ưu tiên bài học:</label>
              <input
                type="number"
                value={order}
                min={1}
                onChange={(e) => setOrder(Number(e.target.value) || 1)}
                className="w-full text-xs text-slate-800 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
                required
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Form objectives and target definitions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Mục tiêu bài học (Objective):</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ví dụ: Phân biệt rõ ràng 4 khái niệm kinh điển giúp BA tư duy sâu sắc, tránh nhầm lẫn..."
              className="w-full text-xs text-slate-800 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
            />
          </div>

          {/* Theory inputs area */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nội dung lý thuyết (Bite-sized Theory):</label>
            </div>
            <textarea
              value={theory}
              onChange={(e) => setTheory(e.target.value)}
              rows={8}
              placeholder="Khái niệm, các bước thực hiện, kiến thức chuyên sâu từ BABOK..."
              className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Examples area */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ví dụ doanh nghiệp thực tế:</label>
            </div>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={5}
              placeholder="Ví dụ cụ thể ở một ngân hàng, ứng dụng hoặc tình huống thực tế..."
              className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Exercise area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Bài tập thực hành nhỏ:</label>
            <textarea
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              rows={4}
              placeholder="Yêu cầu nhỏ để kiểm tra xem đã hiểu bài chưa..."
              className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
            />
          </div>

          {/* Real project guide & Expected outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Real Project application */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Áp dụng vào dự án thật:</label>
              </div>
              <textarea
                value={realProjectApplication}
                onChange={(e) => setRealProjectApplication(e.target.value)}
                rows={4}
                placeholder="Hướng dẫn cách mang kiến thức này áp dụng vào công việc dự án thật đang làm..."
                className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
              />
            </div>

            {/* Expected target output */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sản phẩm cần bàn giao (Expected Output):</label>
              </div>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={4}
                placeholder="Mô tả sản phẩm đầu ra cụ thể (Ví dụ: mindmap, sơ đồ swimlane, bảng business rules...)"
                className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
              />
            </div>
          </div>

          {/* Review checklist newline separated text string */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4.5 h-4.5 text-emerald-600" />
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Checklist tự đánh giá (Từng dòng một):</label>
            </div>
            
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Mỗi dòng văn bản tương ứng với một hộp kiểm checkbox tự review trong bài làm. 
              Bạn có thể dễ dàng dán danh sách bullet points từ AI vào đây.
            </p>

            <textarea
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              rows={6}
              placeholder={`Ví dụ:
- Tôi đã bóc tách rõ rệt Problem và Solution chưa?
- Tôi có nhầm lẫn luật nghiệp vụ và quy tắc trường nhập dữ liệu không?
- Tôi đã thảo luận kỹ edge case này với Technical Lead hay QA chưa?`}
              className="w-full text-xs text-slate-800 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Footer Area with cancel and submit button */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/20 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            id="btn-cancel-bottom-form"
            className="py-2 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition"
          >
            Hủy bỏ
          </button>
          
          <button
            type="submit"
            disabled={saving}
            id="btn-submit-bottom-form"
            className="flex items-center space-x-1.5 py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu vào máy"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
