import React, { useState, useRef } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Play, Sparkles, Check, Info } from "lucide-react";
import { AppAPI } from "../lib/api";

interface ImportExcelViewProps {
  onImportSuccess: () => Promise<void>;
  onCancel: () => void;
}

export default function ImportExcelView({ onImportSuccess, onCancel }: ImportExcelViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Results
  const [previewResult, setPreviewResult] = useState<any | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Tabs for preview
  const [activePreviewTab, setActivePreviewTab] = useState<"stages" | "lessons" | "checklists">("stages");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".xls")) {
        processFile(droppedFile);
      } else {
        setErrors(["Chỉ chấp nhận tệp định dạng Excel (.xlsx hoặc .xls)"]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrors([]);
    setPreviewResult(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await AppAPI.importPreview(selectedFile);
      setPreviewResult(res);
      if (res.errors && res.errors.length > 0) {
        setErrors(res.errors);
      }
    } catch (err: any) {
      console.error(err);
      setErrors([err.message || "Lỗi xử lý tệp tin hoặc phân tích cấu trúc cột."]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmImport = async () => {
    if (!previewResult || !previewResult.previewData) return;
    setLoading(true);
    setErrors([]);

    try {
      const confirmPayload = {
        stages: previewResult.previewData.stages,
        lessons: previewResult.previewData.lessons,
        checklists: previewResult.previewData.checklists
      };

      const result = await AppAPI.importConfirm(confirmPayload);
      if (result.success) {
        setSuccessMsg(result.message || "Import thành công dữ liệu học tập!");
        setPreviewResult(null);
        setFile(null);
        await onImportSuccess();
      } else {
        setErrors([result.error || "Lỗi khi lưu dữ liệu học tập."]);
      }
    } catch (err: any) {
      setErrors([err.message || "Xảy ra lỗi khi thực thi giao dịch cơ sở dữ liệu."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans text-slate-100" id="import-excel-view-wrapper">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">Nhập dữ liệu hàng loạt từ Excel</h2>
        <p className="text-sm text-slate-400 mt-1">
          Đồng bộ nhanh hàng chục bài học, danh sách checkpoint và mô tả giai đoạn chỉ từ 1 tập tin duy nhất.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-555/20 text-emerald-400 p-5 rounded-xl flex items-start gap-3.5" id="success-banner">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold">Thao tác hoàn tất thành công!</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{successMsg}</p>
            <button
              onClick={onCancel}
              className="mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition block cursor-pointer"
            >
              Xem lộ trình học tập
            </button>
          </div>
        </div>
      )}

      {/* Upload Drag/Drop zone */}
      {!previewResult && !successMsg && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-4 min-h-[300px] ${
            dragActive
              ? "border-emerald-500 bg-emerald-500/5"
              : "border-slate-800 bg-slate-900/60 hover:border-slate-705"
          }`}
          id="dropzone-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-400">
            <UploadCloud className="w-10 h-10 stroke-1" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-slate-200">Kéo & thả tệp Excel của bạn vào đây</h3>
            <p className="text-xs text-slate-400">
              Hoặc bấm để duyệt tệp tin từ máy tính. Hỗ trợ định dạng <strong className="text-emerald-400 font-bold">.xlsx</strong> hoặc .xls
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950 p-2 rounded-lg border border-slate-850">
            <Info className="w-3.5 h-3.5 text-emerald-550 shrink-0" />
            <span>Mẫu tải xuống gồm 3 sheets: <strong>Stages</strong>, <strong>Lessons</strong>, <strong>Lesson_Checklists</strong></span>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-slate-900 border border-slate-800 rounded-xl" id="import-loading-state">
          <Sparkles className="w-10 h-10 animate-spin text-emerald-400" />
          <p className="text-sm font-semibold text-slate-200">Đang bóc tách và phân tích các trường dữ liệu Excel...</p>
        </div>
      )}

      {/* Error lists block */}
      {errors.length > 0 && (
        <div className="bg-rose-955 p-5 rounded-xl border border-rose-900 space-y-3" id="error-alert-list">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-4.5 h-4.5" />
            <span>Phát hiện lỗi định dạng / ràng buộc dữ liệu:</span>
          </div>
          <ul className="list-disc pl-5 text-xs text-rose-300 space-y-1 font-mono leading-relaxed max-h-48 overflow-y-auto">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
          <p className="text-[11px] text-slate-400 font-medium">
            * Hãy tinh chỉnh lại tệp excel của bạn theo các lỗi trên và upload lại tệp tin để đảm bảo an toàn cơ sở dữ liệu.
          </p>
          {previewResult && (
            <button
              onClick={() => {
                setFile(null);
                setPreviewResult(null);
                setErrors([]);
              }}
              className="mt-2 text-xs font-bold text-rose-400 hover:underline cursor-pointer border border-rose-900/40 bg-slate-950 px-3 py-1.5 rounded-lg transition"
            >
              Chọn file Excel khác
            </button>
          )}
        </div>
      )}

      {/* Preview Section & Statistics */}
      {previewResult && !loading && (
        <div className="space-y-6" id="bulk-preview-portal">
          {/* Counters Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5" id="preview-counters">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Giai đoạn thêm mới</span>
              <span className="text-2xl font-black text-emerald-400 mt-2">+{previewResult.counts.stagesToCreate}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Giai đoạn cập nhật</span>
              <span className="text-2xl font-black text-blue-400 mt-2">~{previewResult.counts.stagesToUpdate}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Bài học thêm mới</span>
              <span className="text-2xl font-black text-emerald-400 mt-2">+{previewResult.counts.lessonsToCreate}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Bài học cập nhật</span>
              <span className="text-2xl font-black text-blue-400 mt-2">~{previewResult.counts.lessonsToUpdate}</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase">Checklist items</span>
              <span className="text-2xl font-black text-purple-400 mt-2">{previewResult.counts.checklistsCount}</span>
            </div>
          </div>

          {/* Table Preview Portal */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {/* Tabs selector */}
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("stages")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                    activePreviewTab === "stages" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Stages ({previewResult.previewData.stages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("lessons")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                    activePreviewTab === "lessons" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Lessons ({previewResult.previewData.lessons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab("checklists")}
                  className={`px-3 py-1.5 text-xs font-black rounded-lg transition ${
                    activePreviewTab === "checklists" ? "bg-slate-800 text-emerald-400" : "text-slate-500 hover:text-slate-350"
                  }`}
                >
                  Checklists ({previewResult.previewData.checklists.length})
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-500 font-mono hidden sm:inline-block">File: {file?.name}</span>
            </div>

            <div className="p-4 max-h-[350px] overflow-y-auto" id="preview-active-tab-box">
              {activePreviewTab === "stages" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold text-slate-400">
                        <th className="pb-2 pr-3 w-12">Thứ tự</th>
                        <th className="pb-2 pr-3 w-28">Mã Code</th>
                        <th className="pb-2 pr-3">Tiêu đề Giai đoạn</th>
                        <th className="pb-2 pr-3 w-44">Mục tiêu phát triển</th>
                        <th className="pb-2 pr-3 w-20">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[11px] font-medium text-slate-300">
                      {previewResult.previewData.stages.map((st: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-bold">#{st.order}</td>
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">{st.code}</td>
                          <td className="py-2.5 font-semibold text-slate-200">{st.title}</td>
                          <td className="py-2.5 truncate max-w-xs text-slate-400">{st.goal}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${st.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activePreviewTab === "lessons" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold text-slate-400">
                        <th className="pb-2 pr-3 w-28">Mã Code</th>
                        <th className="pb-2 pr-3 w-28">Giai đoạn cha</th>
                        <th className="pb-2 pr-3">Tiêu đề Bài học</th>
                        <th className="pb-2 pr-3 w-12">Order</th>
                        <th className="pb-2 pr-3 w-20">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[11px] font-medium text-slate-300">
                      {previewResult.previewData.lessons.map((ls: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">{ls.code}</td>
                          <td className="py-2.5 font-mono text-slate-450">{ls.stage_code}</td>
                          <td className="py-2.5 font-semibold text-slate-200">{ls.title}</td>
                          <td className="py-2.5">#{ls.order}</td>
                          <td className="py-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${ls.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                              {ls.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activePreviewTab === "checklists" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 font-bold text-slate-400">
                        <th className="pb-2 pr-3 w-32">Mã Lesson</th>
                        <th className="pb-2 pr-3 w-16">Thứ tự</th>
                        <th className="pb-2 pr-3">Nội dung Tự kiểm tra cuối bài học</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[11px] font-medium text-slate-300">
                      {previewResult.previewData.checklists.map((ch: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/20">
                          <td className="py-2.5 font-mono text-emerald-400 font-bold">{ch.lesson_code}</td>
                          <td className="py-2.5">#{ch.order}</td>
                          <td className="py-2.5 text-slate-300 font-medium">{ch.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setFile(null);
                setPreviewResult(null);
                setErrors([]);
              }}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Chọn lại tệp tin khác
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={loading || errors.length > 0}
              className="flex items-center space-x-1.5 py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold transition shadow-md shadow-emerald-600/10 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? "Đang ghi nhận..." : "Xác nhận Import"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
