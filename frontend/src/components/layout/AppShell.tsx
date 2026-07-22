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
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F0F0F] text-[#FFFFFF]">
      {/* Left Sidebar - Fixed ~260px */}
      <aside className="w-[260px] flex-shrink-0 bg-[#1A1A1A] border-r border-[#27272A] flex flex-col justify-between p-4 z-20">
        <div>
          {/* Header Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center orange-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">
                TeachMe <span className="text-[#F97316]">AI</span>
              </h1>
              <p className="text-[11px] text-[#A1A1AA] font-mono mt-0.5">Academic Assistant</p>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => navigate('/documents')}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 orange-glow mb-6 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Analysis</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                      isActive
                        ? 'bg-[#27272A] text-white border-l-4 border-[#F97316]'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#27272A]/50'
                    }`
                  }
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F97316]' : 'text-[#A1A1AA]'}`} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-[#27272A]">
          {/* System Status Badge */}
          <div className="bg-[#0F0F0F] rounded-lg p-2.5 border border-[#27272A] flex items-center gap-2 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06B6D4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#06B6D4]"></span>
            </span>
            <span className="text-[#A1A1AA] font-mono text-[11px]">Analysis Engine - <span className="text-[#06B6D4]">Online</span></span>
          </div>

          {/* User Profile Snippet */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-bold text-xs text-[#F97316]">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'Student User'}</p>
                <p className="text-[10px] text-[#A1A1AA] font-mono truncate">{user?.email || 'student@teachme.ai'}</p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log Out"
                className="text-[#A1A1AA] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#27272A] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Fluid Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0F0F0F]">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
