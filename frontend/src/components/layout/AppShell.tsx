import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Layers,
  Settings as SettingsIcon,
  Plus,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { TopNav } from './TopNav';

interface AppShellProps {
  children: React.ReactNode;
  user?: { email: string; name: string };
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Document Library', path: '/documents', icon: FileText },
    { name: 'AI Tutor Chat', path: '/chat', icon: MessageSquare },
    { name: 'Study Mode', path: '/study', icon: Layers },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#06060A] text-[#F8FAFC]">
      {/* Left Sidebar - Fixed ~260px */}
      <aside className="w-[260px] flex-shrink-0 bg-[#0D0D17]/85 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between p-4 z-20">
        <div>
          {/* Header Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F97316] to-[#D946EF] flex items-center justify-center orange-glow transition-transform hover:scale-105 duration-300">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg tracking-tight text-white leading-none">
                TeachMe <span className="gradient-text-orange font-extrabold">AI</span>
              </h1>
              <p className="text-[10px] text-[#94A3B8] font-mono mt-1 uppercase tracking-widest">Academic Agent</p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => navigate('/documents')}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 orange-glow mb-6 text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>New Analysis</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-200 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F97316]' : 'text-[#94A3B8]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          {/* System Status Badge */}
          <div className="bg-[#06060A]/60 rounded-xl p-3 border border-white/5 flex items-center gap-2 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06B6D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06B6D4] cyan-glow"></span>
            </span>
            <span className="text-[#94A3B8]">RAG Engine - <span className="text-[#06B6D4] font-bold">Online</span></span>
          </div>

          {/* User Profile Snippet */}
          <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Student User'}</p>
                <p className="text-[9px] text-[#94A3B8] font-mono truncate">{user?.email || 'student@teachme.ai'}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out"
                className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Fluid Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#06060A]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
