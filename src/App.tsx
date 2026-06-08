import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.tsx";
import DashboardView from "./components/DashboardView.tsx";
import StagesView from "./components/StagesView.tsx";
import StageDetailView from "./components/StageDetailView.tsx";
import LessonDetailView from "./components/LessonDetailView.tsx";
import LessonFormView from "./components/LessonFormView.tsx";
import LessonManagerView from "./components/LessonManagerView.tsx";

import { AppAPI } from "./lib/api.ts";
import { Stage, Lesson, LessonStatus } from "./types.ts";
import { Compass, BookOpen, AlertCircle, Sparkles } from "lucide-react";

export default function App() {
  // Navigation Routing States
  const [currentView, setCurrentView] = useState<string>("dashboard"); // 'dashboard' | 'stages' | 'stage-detail' | 'lesson-detail' | 'lessons-manager' | 'add-lesson' | 'edit-lesson'
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editLessonId, setEditLessonId] = useState<string | null>(null);
  const [preSelectedStageId, setPreSelectedStageId] = useState<string | null>(null);

  // Core Data States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Dictionary for quick stage title mapping
  const [stagesMap, setStagesMap] = useState<Record<string, string>>({});

  // Sync background data
  const loadAppData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stagesData, lessonsData, statsData] = await Promise.all([
        AppAPI.getStages(),
        AppAPI.getLessons(),
        AppAPI.getDashboardStats()
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
      setError(err?.message || "Không thể đồng bộ dữ liệu học tập. Hãy kiểm tra kết nối Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Quick refresh statistic without trigger screen spinner loader
  const refreshStatsOnly = async () => {
    try {
      const statsData = await AppAPI.getDashboardStats();
      setStats(statsData);
      // reload lessons to stay synced
      const lessonsData = await AppAPI.getLessons();
      setLessons(lessonsData);
    } catch (e) {
      console.warn("Failed to background refresh stats", e);
    }
  };

  // Delete Action handling with custom Browser Confirmation
  const handleDeleteLesson = async (lessonId: string) => {
    const confirmation = window.confirm("Bạn có chắc chắn muốn xóa bài học này khỏi lộ trình tự học?");
    if (!confirmation) return;

    try {
      await AppAPI.deleteLesson(lessonId);
      // Reload UI
      await loadAppData();

      // If we are currently studying the deleted lesson, go back
      if (activeLessonId === lessonId) {
        setCurrentView("stages");
        setActiveLessonId(null);
      }
    } catch (e: any) {
      alert("Xóa bài học thất bại: " + (e?.message || "Unknown error"));
    }
  };

  // Creation & Modification submission
  const handleSaveLesson = async (id: string | null, payload: any) => {
    try {
      if (id) {
        // Edit Mode
        await AppAPI.updateLesson(id, payload);
      } else {
        // Create Mode
        await AppAPI.createLesson(payload);
      }

      // Reload global status
      await loadAppData();

      // Navigate back
      if (activeStageId) {
        // If we created/edited from a Stage, return there
        const detailedStage = await AppAPI.getStageDetails(activeStageId);
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

  // Deep routing actions
  const navigateToStageDetail = async (stageId: string) => {
    setActiveStageId(stageId);
    setCurrentView("stage-detail");
  };

  const navigateToLessonDetail = async (lessonId: string) => {
    setActiveLessonId(lessonId);
    // Find parent stage Id to display breadcrumb
    const target = lessons.find(l => l.id === lessonId);
    if (target) {
      setActiveStageId(target.stageId);
    }
    setCurrentView("lesson-detail");
  };

  const navigateToEditForm = (lessonId: string) => {
    setEditLessonId(lessonId);
    setCurrentView("edit-lesson");
  };

  const navigateToAddFormFromStage = (stageId: string) => {
    setPreSelectedStageId(stageId);
    setEditLessonId(null);
    setCurrentView("add-lesson");
  };

  // Safe status indicators
  const totalCount = stats?.totalLessons || 0;
  const completedCount = stats?.completedLessons || 0;

  // Active Stage object fetcher
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
          <h3 className="text-base font-bold text-slate-700">Đang khởi tạo hệ thống BA Learning OS...</h3>
          <p className="text-xs text-slate-400">Loading your Business Analysis roadmap</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="max-w-md mx-auto my-12 bg-rose-50 border border-rose-200 p-6 rounded-xl text-center space-y-4" id="global-error-card">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-rose-800">Không thể kết nối Cơ sở dữ liệu</h3>
          <p className="text-xs text-rose-600 font-medium leading-relaxed">{error}</p>
          <button
            onClick={loadAppData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Thử tải lại dữ liệu
          </button>
        </div>
      );
    }

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
            onBack={() => setCurrentView("stages")}
            onSelectLesson={navigateToLessonDetail}
            onAddLessonToStage={navigateToAddFormFromStage}
            onEditLesson={navigateToEditForm}
            onDeleteLesson={handleDeleteLesson}
          />
        );

      case "lesson-detail":
        if (!activeLessonId) return <div className="text-center text-xs text-slate-400">Chưa chọn bài học.</div>;
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
              // Background update metrics when exiting lesson workspace
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

      case "lessons-manager":
        return (
          <LessonManagerView
            lessons={lessons}
            stages={stages}
            stagesMap={stagesMap}
            onSelectLesson={navigateToLessonDetail}
            onEditLesson={navigateToEditForm}
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
        return (
          <LessonFormView
            stages={stages}
            editLessonId={editLessonId}
            preSelectedStageId={preSelectedStageId}
            getLessonDetails={AppAPI.getLessonDetails}
            onSaveLesson={handleSaveLesson}
            onCancel={() => {
              if (editLessonId) {
                // If editing, try to return to previous relevant portal
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

      default:
        return <div className="text-slate-400 text-xs">Màn hình đang phát triển.</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-700 antialiased" id="main-layout-root">
      {/* Sidebar navigation panel */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          // Clean active ids when returning to root menus
          if (view !== "stage-detail" && view !== "lesson-detail") {
            setActiveStageId(null);
            setActiveLessonId(null);
          }
        }}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Main viewport area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 md:p-8" id="viewport-main">
        {renderMainViewContent()}
      </main>
    </div>
  );
}
