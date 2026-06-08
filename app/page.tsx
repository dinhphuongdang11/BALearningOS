"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardView from "../components/DashboardView";
import StagesView from "../components/StagesView";
import StageDetailView from "../components/StageDetailView";
import LessonDetailView from "../components/LessonDetailView";
import LessonFormView from "../components/LessonFormView";
import LessonManagerView from "../components/LessonManagerView";
import StageManagerView from "../components/StageManagerView";
import StageFormView from "../components/StageFormView";
import ImportExcelView from "../components/ImportExcelView";

import { AppAPI } from "../lib/api";
import { Stage, Lesson } from "../lib/types";
import { Sparkles, AlertCircle, ShieldAlert, Key, Lock, CheckCircle2, UserCheck, ShieldClose } from "lucide-react";

export default function App() {
  // 1. Core Profile & Security States
  const [role, setRole] = useState<"user" | "admin">("user");
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);

  // 2. Navigation Routing States
  // 'dashboard' | 'stages' | 'stage-detail' | 'lesson-detail' | 'stages-manager' | 'add-stage' | 'edit-stage' | 'lessons-manager' | 'add-lesson' | 'edit-lesson' | 'import-excel'
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [editStageId, setEditStageId] = useState<string | null>(null);
  const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);

  // 3. Core Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Dictionary lookup for quick stage title maps
  const [stagesMap, setStagesMap] = useState<Record<string, string>>({});

  // Sync background data
  const loadAppData = async () => {
    try {
      setLoading(true);
      setError(null);
      const includeDrafts = role === "admin";
      
      const [stagesData, lessonsData, statsData] = await Promise.all([
        AppAPI.getStages(includeDrafts),
        AppAPI.getLessons(undefined, includeDrafts),
        AppAPI.getDashboardStats(includeDrafts)
      ]);

      setStages(stagesData);
      setLessons(lessonsData);
      setStats(statsData);

      // Create mapping lookup for child components
      const mapping = stagesData.reduce((acc, curr) => {
        acc[curr.id] = curr.title;
        return acc;
      }, {} as Record<string, string>);
      setStagesMap(mapping);
    } catch (err: any) {
      console.error("Failed to load BA OS state data", err);
      setError(err?.message || "Không thể đồng bộ dữ liệu học tập. Hãy kiểm tra kết nối cơ sở dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  // Reload data whenever active role changes to enable/disable drafts view
  useEffect(() => {
    loadAppData();
  }, [role]);

  // Quick refresh stats without triggering spinner loaders
  const refreshStatsOnly = async () => {
    try {
      const includeDrafts = role === "admin";
      const statsData = await AppAPI.getDashboardStats(includeDrafts);
      setStats(statsData);
      const lessonsData = await AppAPI.getLessons(undefined, includeDrafts);
      setLessons(lessonsData);
    } catch (e) {
      console.warn("Failed to background refresh stats", e);
    }
  };

  // 4. Role credentials verification handler
  const handleRoleToggleRequest = () => {
    if (role === "admin") {
      // Direct switch on downgrade to secure user view
      setRole("user");
      setCurrentView("dashboard");
      setActiveStageId(null);
      setActiveLessonId(null);
    } else {
      // Trigger prompt credentials modal on upgrade to admin
      setAdminPasswordInput("");
      setPasswordError(null);
      setPasswordSuccess(false);
      setShowPasswordModal(true);
    }
  };

  const verifyAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPasswordInput })
      });
      const data = await response.json();
      if (data.success) {
        setPasswordSuccess(true);
        setTimeout(() => {
          setRole("admin");
          setShowPasswordModal(false);
          setPasswordSuccess(false);
          setCurrentView("stages-manager"); // Push to admin manager after success!
        }, 800);
      } else {
        setPasswordError("Mật khẩu Quản trị viên không chính xác. Hãy thử lại!");
      }
    } catch (err) {
      setPasswordError("Không thể kết nối đến máy chủ xác thực.");
    }
  };

  // 5. Stage CRUD actions
  const handleSaveStage = async (id: string | null, payload: any) => {
    try {
      if (id) {
        await AppAPI.updateStage(id, payload);
      } else {
        await AppAPI.createStage(payload);
      }
      await loadAppData();
      setCurrentView("stages-manager");
      setEditStageId(null);
    } catch (e: any) {
      alert("Lưu thông tin Giai đoạn thất bại: " + (e?.message || "Unknown db issue"));
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const confirmation = window.confirm("CẢNH BÁO: Xóa giai đoạn này sẽ xóa toàn bộ các bài học, bài tập liên đới thuộc giai đoạn. Bạn có chắc chắn?");
    if (!confirmation) return;

    try {
      await AppAPI.deleteStage(stageId);
      await loadAppData();
      if (activeStageId === stageId) {
        setActiveStageId(null);
        setCurrentView("stages-manager");
      }
    } catch (e: any) {
      alert("Xóa giai đoạn thất bại: " + (e?.message || "Unknown error"));
    }
  };

  // 6. Lesson CRUD actions
  const handleDeleteLesson = async (lessonId: string) => {
    const confirmation = window.confirm("Bạn có chắc chắn muốn xóa bài học này khỏi lộ trình?");
    if (!confirmation) return;

    try {
      await AppAPI.deleteLesson(lessonId);
      await loadAppData();

      if (activeLessonId === lessonId) {
        setCurrentView("stages");
        setActiveLessonId(null);
      }
    } catch (e: any) {
      alert("Xóa bài học thất bại: " + (e?.message || "Unknown error"));
    }
  };

  const handleSaveLesson = async (id: string | null, payload: any) => {
    try {
      if (id) {
        await AppAPI.updateLesson(id, payload);
      } else {
        await AppAPI.createLesson(payload);
      }
      await loadAppData();

      if (activeStageId) {
        setCurrentView("stage-detail");
      } else {
        setCurrentView("lessons-manager");
      }
      
      setEditLessonId(null);
      setPreSelectedStageId(null);
    } catch (e: any) {
      alert("Lưu bài học thất bại: " + (e?.message || "Unknown error"));
    }
  };

  // 7. Navigation deep handlers
  const navigateToStageDetail = async (stageId: string) => {
    setActiveStageId(stageId);
    setCurrentView("stage-detail");
  };

  const navigateToLessonDetail = async (lessonId: string) => {
    setActiveLessonId(lessonId);
    const target = lessons.find(l => l.id === lessonId);
    if (target) {
      setActiveStageId(target.stageId);
    }
    setCurrentView("lesson-detail");
  };

  const navigateToEditLessonForm = (lessonId: string) => {
    setEditLessonId(lessonId);
    setCurrentView("edit-lesson");
  };

  const navigateToAddLessonFormFromStage = (stageId: string) => {
    setPreSelectedStageId(stageId);
    setEditLessonId(null);
    setCurrentView("add-lesson");
  };

  const totalCount = stats?.totalLessons || 0;
  const completedCount = stats?.completedLessons || 0;

  const getActiveStageDetails = () => {
    if (!activeStageId) return null;
    const sObj = stages.find(s => s.id === activeStageId);
    if (!sObj) return null;
    const stageLessons = lessons.filter(l => l.stageId === activeStageId);
    return {
      ...sObj,
      lessons: stageLessons
    };
  };

  // Router dispatcher render logic
  const renderMainViewContent = () => {
    if (loading && !stats) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 text-slate-400" id="global-spinner">
          <Sparkles className="w-12 h-12 animate-spin text-emerald-500" />
          <h3 className="text-sm font-bold text-slate-100">Đang khởi tạo BA Learning OS...</h3>
          <p className="text-xs text-slate-550">Sắp xếp hệ thống dữ liệu học liệu</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 p-6 rounded-xl text-center space-y-4" id="global-error-card">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-200">Không thể đồng bộ cơ sở dữ liệu</h3>
          <p className="text-xs text-rose-300 font-medium leading-relaxed">{error}</p>
          <button
            onClick={loadAppData}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Tải lại dữ liệu hệ thống
          </button>
        </div>
      );
    }

    // Protection gates for admin views
    const requireAdmin = (view: string, content: React.ReactNode) => {
      if (role !== "admin") {
        return (
          <div className="max-w-md mx-auto my-12 bg-slate-900 border border-amber-500/30 p-8 rounded-xl text-center space-y-4" id="admin-required-gate">
            <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-slate-200">Khu vực hạn chế truy cập</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn đang cố truy cập chế độ quản lý <strong>{view}</strong>. Hãy chuyển đổi vai trò sang Admin ở thanh Sidebar để tiếp tục.
            </p>
            <button
              onClick={handleRoleToggleRequest}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold transition shadow-sm cursor-pointer"
            >
              Nhập mã Quản trị viên
            </button>
          </div>
        );
      }
      return content;
    };

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            stats={stats}
            onNavigateToStage={navigateToStageDetail}
            onNavigateToLesson={navigateToLessonDetail}
            stagesMap={stagesMap}
          />
        );

      case "stages":
        return (
          <StagesView
            stages={stages}
            progressList={stats?.stageProgress || []}
            onSelectStage={navigateToStageDetail}
          />
        );

      case "stage-detail":
        const stDetail = getActiveStageDetails();
        if (!stDetail) return <div className="text-center text-xs text-slate-400">Không tìm thấy giai đoạn này.</div>;
        return (
          <StageDetailView
            stage={stDetail}
            onBack={() => {
              if (role === "admin") {
                setCurrentView("stages-manager");
              } else {
                setCurrentView("stages");
              }
            }}
            onSelectLesson={navigateToLessonDetail}
            onAddLessonToStage={navigateToAddLessonFormFromStage}
            onEditLesson={navigateToEditLessonForm}
            onDeleteLesson={handleDeleteLesson}
            role={role}
            onSaveStagePractice={AppAPI.saveStagePractice}
          />
        );

      case "lesson-detail":
        if (!activeLessonId) return <div className="text-center text-xs text-slate-400">Chưa chọn bài học để nghiên cứu.</div>;
        return (
          <LessonDetailView
            lessonId={activeLessonId}
            stageTitle={stagesMap[activeStageId || ""] || "Lộ trình học BA"}
            onBack={async () => {
              if (activeStageId) {
                setCurrentView("stage-detail");
              } else {
                setCurrentView("stages");
              }
              await refreshStatsOnly();
            }}
            getLessonDetails={AppAPI.getLessonDetails}
            onSavePractice={AppAPI.savePractice}
            onUpdateStatus={AppAPI.patchLessonStatus}
            onUpdatePersonalNote={AppAPI.patchLessonPersonalNote}
            onToggleChecklistItem={AppAPI.toggleChecklistItem}
            onAddChecklistItem={AppAPI.addChecklistItem}
          />
        );

      // --- Admin Exclusive Views ---

      case "stages-manager":
        return requireAdmin(
          "Quản lý Giai đoạn",
          <StageManagerView
            stages={stages}
            onSelectStage={navigateToStageDetail}
            onEditStage={(id) => {
              setEditStageId(id);
              setCurrentView("edit-stage");
            }}
            onDeleteStage={handleDeleteStage}
            onAddStage={() => {
              setEditStageId(null);
              setCurrentView("add-stage");
            }}
          />
        );

      case "add-stage":
      case "edit-stage":
        return requireAdmin(
          "Soạn thảo Giai đoạn",
          <StageFormView
            editStageId={editStageId}
            getStageDetails={async (id) => {
              return stages.find(s => s.id === id)!;
            }}
            onSaveStage={handleSaveStage}
            onCancel={() => {
              setCurrentView("stages-manager");
              setEditStageId(null);
            }}
          />
        );

      case "lessons-manager":
        return requireAdmin(
          "Quản lý Bài học",
          <LessonManagerView
            lessons={lessons}
            stages={stages}
            stagesMap={stagesMap}
            onSelectLesson={navigateToLessonDetail}
            onEditLesson={navigateToEditLessonForm}
            onDeleteLesson={handleDeleteLesson}
            onAddLesson={() => {
              setEditLessonId(null);
              setPreSelectedStageId(null);
              setCurrentView("add-lesson");
            }}
          />
        );

      case "add-lesson":
      case "edit-lesson":
        return requireAdmin(
          "Soạn thảo Bài học",
          <LessonFormView
            stages={stages}
            editLessonId={editLessonId}
            preSelectedStageId={preSelectedStageId}
            getLessonDetails={AppAPI.getLessonDetails}
            onSaveLesson={handleSaveLesson}
            onCancel={() => {
              if (editLessonId) {
                if (activeStageId) {
                  setCurrentView("stage-detail");
                } else {
                  setCurrentView("lessons-manager");
                }
              } else if (preSelectedStageId) {
                setCurrentView("stage-detail");
              } else {
                setCurrentView("lessons-manager");
              }
              setEditLessonId(null);
              setPreSelectedStageId(null);
            }}
          />
        );

      case "import-excel":
        return requireAdmin(
          "Nhập file Excel",
          <ImportExcelView
            onImportSuccess={async () => {
              await loadAppData();
            }}
            onCancel={() => {
              setCurrentView("stages");
            }}
          />
        );

      default:
        return <div className="text-slate-400 text-xs">Màn hình đang thiết kế thêm.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-350 antialiased" id="main-layout-root">
      {/* Sidebar navigation panel */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== "stage-detail" && view !== "lesson-detail") {
            setActiveStageId(null);
            setActiveLessonId(null);
          }
        }}
        completedCount={completedCount}
        totalCount={totalCount}
        role={role}
        onChangeRole={handleRoleToggleRequest}
      />

      {/* Main viewport area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8" id="viewport-main">
        {renderMainViewContent()}
      </main>

      {/* Floating security credentials check modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-sans" id="security-credential-modal">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative animate-fadeIn">
            <div className="flex items-center space-x-3.5 mb-5">
              <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                <Lock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-100">Xác thực quyền Quản trị viên</h3>
                <p className="text-[11px] text-slate-500 font-medium">Bảo mật hệ thống BA Learning OS</p>
              </div>
            </div>

            {passwordSuccess ? (
              <div className="py-6 text-center space-y-2 flex flex-col items-center">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <UserCheck className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-black text-emerald-400">Đăng nhập Admin thành công</h4>
                <p className="text-[10px] text-slate-500 font-medium">Đang chuyển tiếp về bảng điều hành...</p>
              </div>
            ) : (
              <form onSubmit={verifyAdminCredentials} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-rose-955 border border-rose-900/60 rounded-xl text-[11px] font-semibold text-rose-300 flex items-start space-x-1.5 leading-normal">
                    <ShieldClose className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Mật khẩu admin:</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Nhập mã bảo vệ..."
                      className="w-full text-xs text-slate-100 bg-slate-950 border border-slate-800 p-2.5 pl-9 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-bold block"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-1.5 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold transition cursor-pointer"
                  >
                    Xác minh
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
