import React from "react";
import { LayoutDashboard, Compass, BookOpen, PlusCircle, Bookmark, CheckSquare, Shield, Users, UploadCloud, Map } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  completedCount: number;
  totalCount: number;
  role: "user" | "admin";
  onChangeRole: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  completedCount,
  totalCount,
  role,
  onChangeRole
}: SidebarProps) {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Conditional menu items
  const menuItems = role === "admin" 
    ? [
        { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { id: "stages", label: "Lộ trình học tập", icon: Compass },
        { id: "stages-manager", label: "Quản lý Giai đoạn", icon: Map },
        { id: "lessons-manager", label: "Quản lý Bài học", icon: BookOpen },
        { id: "import-excel", label: "Nhập tệp Excel", icon: UploadCloud },
      ]
    : [
        { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { id: "stages", label: "Lộ trình học BA", icon: Compass },
      ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0 font-sans" id="app-sidebar">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex flex-col space-y-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500 rounded-lg text-slate-900 font-bold shadow-md shadow-emerald-500/10">
            <Bookmark className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              BA Learning OS
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Enterprise Edition</p>
          </div>
        </div>

        {/* Role Switcher Button */}
        <button
          onClick={onChangeRole}
          id="btn-sidebar-role-toggle"
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
            role === "admin"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
              : "bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-850 hover:text-slate-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {role === "admin" ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <Users className="w-3.5 h-3.5 text-slate-400" />}
            <span>Vai trò: <strong className="uppercase">{role === "admin" ? "Admin" : "Học viên"}</strong></span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded hover:bg-slate-700">Đổi</span>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
          {role === "admin" ? "Bảng Quản trị" : "Không gian học tập"}
        </span>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === "stages" && (currentView === "stage-detail" || currentView === "lesson-detail"));
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-350"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Progress Widget */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 font-medium">Tiến độ tổng thể</span>
            <span className="text-emerald-400 font-bold">{percentage}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${role === "admin" ? "bg-amber-400" : "bg-emerald-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
              Đã hoàn thành:
            </span>
            <span className="text-slate-300 font-semibold">{completedCount} / {totalCount} bài</span>
          </div>
        </div>
        <div className="mt-4 text-center text-[10px] text-slate-500">
          BA Learning OS V2.0
        </div>
      </div>
    </aside>
  );
}
