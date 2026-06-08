import React from "react";
import { LayoutDashboard, Compass, BookOpen, PlusCircle, Bookmark, CheckSquare } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  completedCount: number;
  totalCount: number;
}

export default function Sidebar({ currentView, onNavigate, completedCount, totalCount }: SidebarProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "stages", label: "6 Giai đoạn học BA", icon: Compass },
    { id: "lessons-manager", label: "Quản lý bài học", icon: BookOpen },
    { id: "add-lesson", label: "Thêm bài học mới", icon: PlusCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0" id="app-sidebar">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-emerald-500 rounded-lg text-slate-900 font-bold shadow-md shadow-emerald-500/10">
          <Bookmark className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            BA Learning OS
          </h1>
          <p className="text-xs text-slate-400 font-medium">Personal MVP Workspace</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <span className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Main board</span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === "stages" && (currentView === "stage-detail" || currentView === "lesson-detail"));
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/15"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 hover:text-slate-200"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Progress Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Tiến độ tổng thể</span>
            <span className="text-emerald-400 font-bold">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              Đã xong:
            </span>
            <span className="text-slate-300 font-semibold">{completedCount} / {totalCount} bài học</span>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-slate-500">
          V1.0.0 • Personal OS
        </div>
      </div>
    </aside>
  );
}
