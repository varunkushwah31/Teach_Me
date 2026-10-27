import React, { useState } from 'react';
import {
  SquaresFourIcon,
  PlusIcon,
  GearIcon,
  BookOpenIcon,
  TrashIcon,
  PencilSimpleIcon,
  CheckIcon,
  XIcon,
  CaretRightIcon,
  ChatCircleTextIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings, onOpenProfile }) => {
  const {
    chats,
    currentChatId,
    activeTab,
    templates,
    userProfile,
    setActiveTab,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    setIsSidebarOpen
  } = usePlayground();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(id);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      renameChat(id, editingTitle.trim());
    }
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(id);
  };

  return (
    <aside className="w-64 bg-[#0c0d12] border-r border-[#171822] flex flex-col h-full select-none relative z-20">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-[#171822]">
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => setActiveTab('playground')}>
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 via-violet-500 to-fuchsia-500 shadow-[0_0_14px_rgba(139,92,246,0.6)] ring-2 ring-purple-500/30 group-hover:ring-purple-500/60 transition-all duration-300" />
            <div className="absolute inset-0 rounded-full bg-purple-400 blur-xs opacity-40 group-hover:opacity-75 transition-opacity" />
          </div>
          <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
            Fox.ai
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
              v2.4
            </span>
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-3 space-y-1 border-b border-[#171822]">
        {/* + New Chat Button with micro-interaction */}
        <button
          onClick={() => {
            createNewChat();
            setIsSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-100 bg-gradient-to-b from-[#191a26] to-[#14151f] hover:from-[#212332] hover:to-[#1a1b28] border border-zinc-800/90 hover:border-purple-500/40 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.3)] group active:scale-[0.98] cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <PlusIcon className="w-3.5 h-3.5" weight="bold" />
            </div>
            <span>New Chat</span>
          </div>
          <span className="keycap text-[9px] opacity-70 group-hover:opacity-100 transition-opacity">
            Ctrl+N
          </span>
        </button>

        {/* Playground Tab Button */}
        <button
          onClick={() => {
            setActiveTab('playground');
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
            activeTab === 'playground'
              ? 'border border-purple-500/70 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-transparent text-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.12)]'
              : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#141520]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SquaresFourIcon
              className={`w-4 h-4 transition-colors ${activeTab === 'playground' ? 'text-purple-400' : 'text-zinc-400'}`}
              weight={activeTab === 'playground' ? 'fill' : 'regular'}
            />
            <span>Playground</span>
          </div>
          {activeTab === 'playground' && (
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          )}
        </button>

        {/* Templates Tab Button */}
        <button
          onClick={() => {
            setActiveTab('templates');
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
            activeTab === 'templates'
              ? 'border border-purple-500/70 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-transparent text-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.12)]'
              : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#141520]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SquaresFourIcon
              className={`w-4 h-4 transition-colors ${activeTab === 'templates' ? 'text-purple-400' : 'text-zinc-400'}`}
              weight={activeTab === 'templates' ? 'fill' : 'regular'}
            />
            <span>Templates</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {templates.length}
          </span>
        </button>

        {/* Knowledge & RAG Tab Button */}
        <button
          onClick={() => {
            setActiveTab('knowledge');
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
            activeTab === 'knowledge'
              ? 'border border-purple-500/70 bg-gradient-to-r from-purple-500/15 via-purple-500/10 to-transparent text-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.12)]'
              : 'border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#141520]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <BookOpenIcon
              className={`w-4 h-4 transition-colors ${activeTab === 'knowledge' ? 'text-purple-400' : 'text-zinc-400'}`}
              weight={activeTab === 'knowledge' ? 'fill' : 'regular'}
            />
            <span>Knowledge & Docs</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-400 border border-purple-500/30">
            RAG
          </span>
        </button>

        {/* Settings Tab Button */}
        <button
          onClick={() => {
            onOpenSettings();
            setIsSidebarOpen(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-[#141520] border border-transparent transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <GearIcon className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </div>
          <CaretRightIcon className="w-3 h-3 text-zinc-600" />
        </button>
      </div>

      {/* Recent Chats Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="px-2 pt-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
          <span>Recent Chats</span>
          <span className="text-[10px] font-mono font-normal text-zinc-600">{chats.length}</span>
        </div>

        <div className="space-y-1">
          {chats.map(chat => {
            const isSelected = activeTab === 'playground' && currentChatId === chat.id;
            const isEditing = editingChatId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => {
                  selectChat(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#181926] text-white font-medium border border-purple-500/30 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#13141f] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <ChatCircleTextIcon
                    className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />

                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveRename(chat.id, e);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                      onClick={e => e.stopPropagation()}
                      autoFocus
                      className="bg-[#1f2030] text-zinc-100 px-1.5 py-0.5 rounded text-xs w-full outline-none border border-purple-500"
                    />
                  ) : (
                    <span className="truncate text-xs">{chat.title || 'History item'}</span>
                  )}
                </div>

                {/* Inline Action Icons */}
                {isEditing ? (
                  <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                    <button
                      onClick={e => handleSaveRename(chat.id, e)}
                      className="p-1 hover:text-emerald-400 text-zinc-400 cursor-pointer"
                      title="Save title"
                    >
                      <CheckIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 hover:text-rose-400 text-zinc-400 cursor-pointer"
                      title="Cancel"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1 flex-shrink-0 animate-fade-in">
                    <button
                      onClick={e => handleStartRename(chat.id, chat.title, e)}
                      className="p-1 hover:text-purple-300 text-zinc-500 transition-colors cursor-pointer"
                      title="Rename conversation"
                    >
                      <PencilSimpleIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => handleDeleteChat(chat.id, e)}
                      className="p-1 hover:text-rose-400 text-zinc-500 transition-colors cursor-pointer"
                      title="Delete conversation"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-3 border-t border-[#171822]">
        <button
          onClick={onOpenProfile}
          className="w-full bg-[#12131c] hover:bg-[#181926] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-2.5 flex items-center gap-2.5 transition-all duration-200 text-left group cursor-pointer shadow-sm"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-900 to-indigo-800 border border-purple-500/50 text-purple-200 font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              {userProfile.avatarInitial || 'B'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c0d12]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
              {userProfile.name}
            </div>
            <div className="text-[10px] text-zinc-500 truncate font-mono">
              {userProfile.email}
            </div>
          </div>
          <CaretRightIcon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </aside>
  );
};
