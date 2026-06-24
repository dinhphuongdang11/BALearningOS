import React, { useState, useEffect } from "react";
import { ChevronLeft, Save, Sparkles, AlertTriangle, FileText, CheckSquare, PlusCircle, LayoutDashboard } from "lucide-react";
import { Stage, Course } from "../lib/types";

interface StageFormViewProps {
  editStageId: string | null;
  getCourses: () => Course[];
  getStageDetails?: (id: string) => Promise<Stage>;
  onSaveStage: (id: string | null, stageInput: any) => Promise<void>;
  onCancel: () => void;
}

export default function StageFormView({
  editStageId,
  getCourses,
  getStageDetails,
  onSaveStage,
  onCancel
}: StageFormViewProps) {
  const isEdit = !!editStageId;
  const courses = getCourses();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [order, setOrder] = useState(1);
  const [bigExercise, setBigExercise] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [finalChecklist, setFinalChecklist] = useState("");
  const [status, setStatus] = useState("PUBLISHED");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && getStageDetails && editStageId) {
      const loadEditData = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await getStageDetails(editStageId);
          setCourseId(data.courseId || "");
          setCode(data.code || "");
          setTitle(data.title || "");
          setDescription(data.description || "");
          setGoal(data.goal || "");
          setOrder(data.order || 1);
          setBigExercise(data.bigExercise || "");
          setExpectedOutput(data.expectedOutput || "");
          setFinalChecklist(data.finalChecklist || "");
          setStatus(data.status || "PUBLISHED");
        } catch (err: any) {
          setError(err?.message || "Không thể tải thông tin giai đoạn để sửa.");
        } finally {
          setLoading(false);
        }
      };

      loadEditData();
    } else {
      setCourseId(courses[0]?.id || "");
      setCode("");
      setTitle("");
      setDescription("");
      setGoal("");
      setOrder(1);
      setBigExercise("");
      setExpectedOutput("");
      setFinalChecklist("");
      setStatus("PUBLISHED");
    }
  }, [editStageId, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Hãy nhập tiêu đề giai đoạn.");
      return;
    }
    if (!courseId) {
      setError("Vui lòng chọn khóa học mà giai đoạn này thuộc về.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        code: code.trim() || undefined,
        courseId: courseId,
        title: title.trim(),
        description: description.trim(),
        goal: goal.trim(),
        order: Number(order) || 1,
        bigExercise: bigExercise.trim(),
        expectedOutput: expectedOutput.trim(),
        finalChecklist: finalChecklist.trim(),
        status
      };

      await onSaveStage(editStageId, payload);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi lưu giai đoạn.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 text-slate-400" id="stage-form-loader">
        <Sparkles className="w-10 h-10 animate-spin text-emerald-500" />
        <p className="text-sm font-semibold text-slate-400">Đang tải cấu trúc Giai đoạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-sans text-slate-100" id="stage-form-wrapper">
      <button
        onClick={onCancel}
        id="btn-cancel-stage-form"
        className="flex items-center space-x-1 text-slate-400 hover:text-emerald-400 text-sm font-bold transition cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Quay lại</span>
      </button>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden" id="stage-input-form">
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {isEdit ? "Chỉnh sửa giai đoạn" : "Thêm giai đoạn lộ trình học BA mới"}
            </h2>
            <p className="text-xs text-slate-400">Thiết lập các mốc giai đoạn quan trọng và yêu cầu đầu ra tương ứng</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            id="btn-submit-stage-form"
            className="flex items-center space-x-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu giai đoạn"}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-955 text-xs text-rose-300 font-semibold flex items-center space-x-2 border-b border-rose-900">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Course selector */}
          <div className="space-y-1.5 bg-slate-955/60 p-3.5 border border-slate-850 rounded-xl">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Khóa học sở hữu *:</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full text-xs text-slate-200 bg-slate-900 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-black cursor-pointer block"
              required
            >
              <option value="">-- Chọn Khóa học sở hữu --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-305 uppercase block">Mã code (Ví dụ: STAGE-1):</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã (hoặc bỏ trống tự sinh)"
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
                disabled={isEdit} // Disable edit for code index stability
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase block">Tên giai đoạn:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Mô hình hoá Nghiệp vụ (Business Modeling)"
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
                required
              />
            </div>

            {/* Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase block">Thứ tự hiển thị (Order):</label>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Option Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase block">Trạng thái phát hành:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs text-slate-205 bg-slate-955 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium cursor-pointer"
              >
                <option value="PUBLISHED">Published (Phát hành)</option>
                <option value="DRAFT">Draft (Bản nháp - Chỉ Admin thấy)</option>
              </select>
            </div>

            {/* Stage Description */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase block">Mô tả ngắn:</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Khái quát những kiến thức cốt lõi học sinh sẽ làm quen..."
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none block"
              />
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* Goal development */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase block">Mục tiêu phát triển giai đoạn (Goal):</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Thành thạo các kỹ năng bóc tách luồng quy trình thực tế của doanh nghiệp, vẽ sơ đồ UML, BPMN chuẩn xác..."
              className="w-full text-xs text-slate-105 bg-slate-955 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Big Exercise & Output Requirement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Big Exercise details */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-450" />
                <label className="text-xs font-bold text-slate-300 uppercase">Yêu cầu Bài tập lớn cuối giai đoạn:</label>
              </div>
              <textarea
                value={bigExercise}
                onChange={(e) => setBigExercise(e.target.value)}
                rows={5}
                placeholder="Yêu cầu đồ án thực tế lớn. Ví dụ: Hãy tự thực hiện bóc tách quy trình bán hàng của GrabFood, viết tài liệu URD, SRS chi tiết cho phân hệ thanh toán..."
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Expected target output */}
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-450" />
                <label className="text-xs font-bold text-slate-300 uppercase">Sản phẩm đầu ra cần bàn giao:</label>
              </div>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={5}
                placeholder="Ví dụ: Link tài liệu SRS (doc), Sơ đồ Swimlane (draw.io / PDF), Wireframe Prototype..."
                className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Final Self checklist */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold text-slate-300 uppercase">Checklist tự đánh giá cuối giai đoạn (Từng dòng một):</label>
            </div>
            <textarea
              value={finalChecklist}
              onChange={(e) => setFinalChecklist(e.target.value)}
              rows={4}
              placeholder={`Ví dụ:
- Luồng quy trình đã đủ tất cả luồng phụ (Alternative list) chưa?
- Các nút quyết định (Gateways) có ghi tên điều kiện rẽ nhánh rõ rệt không?
- Đã nhận xét được giải pháp đó có giải quyết triệt để business pain point không?`}
              className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-y leading-relaxed font-mono"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            id="btn-cancel-bottom-stage-form"
            className="py-2 px-4 border border-slate-800 text-slate-305 hover:bg-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={saving}
            id="btn-submit-bottom-stage-form"
            className="flex items-center space-x-1.5 py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Đang lưu..." : "Lưu giai đoạn"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
