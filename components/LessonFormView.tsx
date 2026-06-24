import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Sparkles, AlertTriangle, FileText, CheckSquare, PlusCircle, Clock, Upload, Eye, EyeOff, Trash2 } from "lucide-react";
import { Lesson, Stage, ChecklistItem } from "../lib/types";

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
  
  // HTML Upload support
  const [htmlContent, setHtmlContent] = useState("");
  const [htmlFileName, setHtmlFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTheoryTab, setActiveTheoryTab] = useState<"html" | "text">("text");

  const [saving, setSaving] = useState(false);

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
          setHtmlContent(data.htmlContent || "");
          if (data.htmlContent) {
            setHtmlFileName("Nội dung HTML đã lưu trữ");
            setActiveTheoryTab("html");
          } else {
            setActiveTheoryTab("text");
          }
          
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
      setTitle("");
      setStageId(preSelectedStageId || (stages.length > 0 ? stages[0].id : ""));
      setOrder(1);
      setObjective("");
      setTheory("");
      setExample("");
      setExercise("");
      setRealProjectApplication("");
      setExpectedOutput("");
      setChecklistText("");
      setHtmlContent("");
      setHtmlFileName("");
      setActiveTheoryTab("text");
    }
  }, [editLessonId, preSelectedStageId, isEdit, stages]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readHtmlFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readHtmlFile(file);
    }
  };

  const readHtmlFile = (file: File) => {
    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      alert("Chỉ cho phép tải lên tệp tin định dạng HTML (.html)");
      return;
    }
    setHtmlFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Strip script tags to keep preview secure
      const sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      setHtmlContent(sanitized);
    };
    reader.readAsText(file);
  };

  const handleRemoveHtml = () => {
    setHtmlContent("");
    setHtmlFileName("");
    setIsPreviewMode(false);
  };

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
        htmlContent: htmlContent.trim(), // Send the htmlContent to be saved
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
        <p className="text-sm font-semibold text-slate-405">Đang đồng bộ cơ sở dữ liệu bài học...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans text-slate-100" id="lesson-form-wrapper">
      {/* Back breadcrumb link */}
      <button
        onClick={onCancel}
        id="btn-cancel-lessons-form"
        className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-sm font-bold transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      {/* Main Form content column */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden" id="curriculum-input-form">
        {/* Banner header title */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {isEdit ? "Chỉnh sửa bài học cố định" : "Thêm bài học mới vào lộ trình"}
            </h2>
            <p className="text-xs text-slate-400">Nhập thủ công hoặc dán nội dung dồi dào từ ChatGPT để tự học</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            id="btn-submit-lesson-form"
            className="flex items-center space-x-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu vào OS"}</span>
          </button>
        </div>

        {/* Global error alert box */}
        {error && (
          <div className="p-4 bg-rose-950 text-xs text-rose-300 font-semibold flex items-center space-x-2 border-b border-rose-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Outer Fields grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Tên bài học:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Problem - Need - Requirement - Solution"
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full"
                required
              />
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Giai đoạn:</label>
              <select
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
                className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium cursor-pointer"
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
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Thứ tự ưu tiên bài học:</label>
              <input
                type="number"
                value={order}
                min={1}
                onChange={(e) => setOrder(Number(e.target.value) || 1)}
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
                required
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Form objectives and target definitions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Mục tiêu bài học (Objective):</label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ví dụ: Phân biệt rõ ràng 4 khái niệm kinh điển giúp BA tư duy sâu sắc, tránh nhầm lẫn..."
              className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
            />
          </div>

          {/* Theory inputs area & HTML File upload */}
          <div className="space-y-3.5 bg-slate-955/40 p-4 border border-slate-850 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Nội dung học tập cốt lõi (Theory Content) *</span>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-850 self-start">
                <button
                  type="button"
                  onClick={() => setActiveTheoryTab("text")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${
                    activeTheoryTab === "text"
                      ? "bg-slate-800 text-slate-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Nhập văn bản thường
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTheoryTab("html")}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition ${
                    activeTheoryTab === "html"
                      ? "bg-slate-800 text-slate-200"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Tải lên tệp HTML
                </button>
              </div>
            </div>

            {activeTheoryTab === "text" ? (
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 font-medium">Nhập học thuật bằng định dạng văn bản thô chuẩn.</p>
                <textarea
                  value={theory}
                  onChange={(e) => setTheory(e.target.value)}
                  rows={8}
                  placeholder="Khái niệm, các bước thực hiện, kiến thức chuyên sâu từ BABOK..."
                  className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {htmlContent ? (
                  <div className="space-y-3">
                    {/* File indicator card */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{htmlFileName}</p>
                          <p className="text-[10px] text-slate-500 font-bold">Kích thước: {Math.round(htmlContent.length / 1024 * 10) / 10} KB • Sẵn sàng lưu trữ</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Preview Toggle */}
                        <button
                          type="button"
                          onClick={() => setIsPreviewMode(!isPreviewMode)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-black flex items-center gap-1.5 transition cursor-pointer"
                        >
                          {isPreviewMode ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                              Ẩn xem trước
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-450" />
                              Xem trước HTML
                            </>
                          )}
                        </button>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={handleRemoveHtml}
                          className="p-1.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="Xóa tệp HTML này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Area */}
                    {isPreviewMode && (
                      <div className="space-y-2 border border-slate-800 bg-slate-950 p-4 rounded-xl">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">KHUNG PREVIEW TRỰC TIẾP (AN TOÀN):</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">HTML Sandboxed</span>
                        </div>
                        <div className="bg-white rounded-lg overflow-hidden border border-slate-800 h-96 relative">
                          <iframe
                            srcDoc={`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <meta charset="utf-8">
                                  <style>
                                    body {
                                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                      color: #1e293b;
                                      line-height: 1.6;
                                      padding: 16px;
                                      margin: 0;
                                    }
                                    h1, h2, h3 { color: #0f172a; margin-top: 24px; margin-bottom: 12px; }
                                    p { margin-bottom: 16px; }
                                    ul, ol { padding-left: 20px; margin-bottom: 16px; }
                                    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
                                    pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
                                    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
                                    th { background: #f1f5f9; }
                                  </style>
                                </head>
                                <body>
                                  ${htmlContent}
                                </body>
                              </html>
                            `}
                            className="w-full h-full border-none"
                            title="HTML Content Sandbox Preview"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Drag and drop zone */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("html-file-picker")?.click()}
                    className={`border-2 border-dashed p-8 rounded-xl transition text-center cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400"
                        : "border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    <input
                      id="html-file-picker"
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-300">Nhấp chọn hoặc thả tập tin HTML vào đây</p>
                      <p className="text-[10px] text-slate-500 font-medium">Hỗ trợ các tệp tin bài giảng xuất bản từ Word, Notion hoặc Web (.html, .htm)</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Examples area */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Ví dụ doanh nghiệp thực tế:</label>
            </div>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={5}
              placeholder="Ví dụ cụ thể ở một ngân hàng, ứng dụng hoặc tình huống thực tế..."
              className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-805 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Exercise area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Bài tập thực hành nhỏ:</label>
            <textarea
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              rows={4}
              placeholder="Yêu cầu nhỏ để kiểm tra xem đã hiểu bài chưa..."
              className="w-full text-xs text-slate-100 bg-slate-955 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
            />
          </div>

          {/* Real project guide & Expected outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real Project application */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Áp dụng vào dự án thật:</label>
              </div>
              <textarea
                value={realProjectApplication}
                onChange={(e) => setRealProjectApplication(e.target.value)}
                rows={4}
                placeholder="Hướng dẫn cách mang kiến thức này áp dụng vào công việc dự án thật đang làm..."
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
              />
            </div>

            {/* Expected target output */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-450" />
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sản phẩm cần bàn giao (Expected Output):</label>
              </div>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={4}
                placeholder="Mô tả sản phẩm đầu ra cụ thể (Ví dụ: mindmap, sơ đồ swimlane, bảng business rules...)"
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y"
              />
            </div>
          </div>

          {/* Review checklist textarea */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
              <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Checklist tự đánh giá (Từng dòng một):</label>
            </div>
            
            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
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
              className="w-full text-xs text-slate-105 bg-slate-955 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Footer Area with cancel and submit button */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            id="btn-cancel-bottom-form"
            className="py-2 px-4 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          
          <button
            type="submit"
            disabled={saving}
            id="btn-submit-bottom-form"
            className="flex items-center space-x-1.5 py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu vào máy"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
