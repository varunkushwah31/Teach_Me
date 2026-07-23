import React, { useState } from 'react';
import { Search, Bell, Share2, Download, Check, Cpu, Settings2, Users } from 'lucide-react';
import { NotificationsDrawer } from '../drawers/NotificationsDrawer';
import { GlobalSearchCommand } from '../search/GlobalSearchCommand';
import { UserProfileModal } from '../modals/UserProfileModal';
import { OllamaConnectionModal } from '../modals/OllamaConnectionModal';
import { GroupWorkspaceModal } from '../modals/GroupWorkspaceModal';

interface TopNavProps {
  user?: { email: string; name: string };
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1:8b');
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');

  // Drawer / Modal states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOllamaModal, setShowOllamaModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportAnki = () => {
    window.open('http://localhost:8081/api/export/anki', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0D0D17]/40 backdrop-blur-xl px-6 flex items-center justify-between z-10 relative">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          value={searchQuery}
          onClick={() => setShowSearchModal(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSearchModal(true);
          }}
          placeholder="Search documents, topics, or AI chats..."
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none transition-all font-sans cursor-pointer"
        />
      </div>

      {/* Contextual Action Tools, Model Switcher, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Dynamic Ollama Connection & Model Switcher Button */}
        <button
          type="button"
          onClick={() => setShowOllamaModal(true)}
          className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#27272A] border border-[#06B6D4]/40 px-3 py-1.5 rounded-xl cursor-pointer transition-all cyan-glow"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <Cpu className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span className="text-xs font-semibold text-white font-mono">{selectedModel}</span>
          <Settings2 className="w-3.5 h-3.5 text-[#A1A1AA] hover:text-white" />
        </button>

        <button
          type="button"
          onClick={() => setShowWorkspaceModal(true)}
          aria-label="Create Group Study Workspace"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#1A1A1A] text-xs font-medium text-[#A1A1AA] hover:text-white hover:border-[#F97316]/50 transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Group Study</span>
        </button>

        <button
          type="button"
          onClick={handleExportAnki}
          aria-label="Export Flashcard Deck for Anki"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#1A1A1A] text-xs font-medium text-[#A1A1AA] hover:text-white hover:border-[#F97316]/50 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Anki Export</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share workspace link"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#27272A] bg-[#1A1A1A] text-xs font-medium text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#06B6D4]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Link' : 'Share'}</span>
        </button>

        <div className="h-4 w-px bg-[#27272A] mx-1" />

        {/* Notifications Trigger */}
        <button
          type="button"
          onClick={() => setShowNotifications(!showNotifications)}
          aria-label="View notifications"
          className="relative p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#F97316] orange-glow"></span>
        </button>

        {/* User Avatar Header Trigger */}
        <button
          type="button"
          onClick={() => setShowProfileModal(true)}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center font-bold text-xs text-white cyan-glow hover:scale-105 transition-transform cursor-pointer ml-1"
        >
          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
        </button>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <NotificationsDrawer onClose={() => setShowNotifications(false)} />
      )}

      {/* Global Search Overlay */}
      {showSearchModal && (
        <GlobalSearchCommand initialQuery={searchQuery} onClose={() => setShowSearchModal(false)} />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal user={user} onClose={() => setShowProfileModal(false)} onLogout={onLogout} />
      )}

      {/* Group Workspace Modal */}
      {showWorkspaceModal && (
        <GroupWorkspaceModal onClose={() => setShowWorkspaceModal(false)} />
      )}

      {/* Ollama Connection & Model Manager Modal */}
      {showOllamaModal && (
        <OllamaConnectionModal
          activeModel={selectedModel}
          activeBaseUrl={baseUrl}
          onClose={() => setShowOllamaModal(false)}
          onSelectModel={(model, url) => {
            setSelectedModel(model);
            setBaseUrl(url);
          }}
        />
      )}
    </header>
  );
};
