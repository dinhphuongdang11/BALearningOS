import React, { useState, useEffect } from "react";
import { Course } from "../lib/types";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon } from "lucide-react";

interface CourseFormViewProps {
  editCourseId: string | null;
  getCourses: () => Course[];
  onSaveCourse: (id: string | null, payload: any) => void;
  onCancel: () => void;
}

export default function CourseFormView({
  editCourseId,
  getCourses,
  onSaveCourse,
  onCancel
}: CourseFormViewProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [category, setCategory] = useState("Business Analysis");
  const [status, setStatus] = useState("PUBLISHED");
  const [sortOrder, setSortOrder] = useState<number>(1);

  useEffect(() => {
    if (editCourseId) {
      const courses = getCourses();
      const course = courses.find(c => c.id === editCourseId);
      if (course) {
        setTitle(course.title);
        setDescription(course.description);
        setThumbnail(course.thumbnail || "");
        setLevel(course.level);
        setCategory(course.category);
        setStatus(course.status);
        setSortOrder(course.sortOrder);
      }
    } else {
      // Auto compute next sort order
      const courses = getCourses();
      const maxOrder = courses.reduce((max, c) => (c.sortOrder > max ? c.sortOrder : max), 0);
      setSortOrder(maxOrder + 1);
    }
  }, [editCourseId, getCourses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng điền tiêu đề khóa học.");
      return;
    }

    onSaveCourse(editCourseId, {
      title: title.trim(),
      description: description.trim(),
      thumbnail: thumbnail.trim() || null,
      level,
      category,
      status,
      sortOrder: Number(sortOrder) || 1
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn font-sans" id="course-form-root">
      {/* Back Header */}
      <button
        onClick={onCancel}
        className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Quay lại Quản lý Khóa học
      </button>

      {/* Form Content */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-850">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Sparkles className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100">
              {editCourseId ? "Sửa đổi thông tin Khóa học" : "Khởi tạo Khóa học mới"}
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Cơ sở dữ liệu học tập cá nhân</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-300">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tiêu đề khóa học *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên khóa học (Ví dụ: Lộ trình Business Analyst cơ bản...)"
              className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold block"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mô tả ngắn</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả tóm tắt nội dung học tập..."
              rows={4}
              className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-medium leading-relaxed block resize-none"
            />
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Danh mục / Phân loại</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Nhập danh mục (Ví dụ: Business Analysis...)"
                className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold block"
              />
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cấp độ học viên</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold block"
              >
                <option value="Beginner">Beginner (Sơ cấp)</option>
                <option value="Intermediate">Intermediate (Trung cấp)</option>
                <option value="Advanced">Advanced (Cao cấp)</option>
                <option value="All Levels">All Levels (Mọi cấp độ)</option>
              </select>
            </div>
          </div>

          {/* Thumbnail Image URL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Đường dẫn ảnh bìa (Thumbnail URL)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600">
                <ImageIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 pl-10 rounded-xl outline-none focus:border-emerald-500 font-medium block"
              />
            </div>
          </div>

          {/* Status and Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Trạng thái xuất bản</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold block"
              >
                <option value="PUBLISHED">PUBLISHED (Công khai)</option>
                <option value="DRAFT">DRAFT (Bản nháp)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Thứ tự hiển thị</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
                className="w-full text-slate-100 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-emerald-500 font-bold block"
                min={1}
                required
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={onCancel}
              className="py-2.5 px-5 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-slate-200 rounded-xl font-bold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black flex items-center gap-1.5 transition shadow-md shadow-emerald-600/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Lưu khóa học
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
