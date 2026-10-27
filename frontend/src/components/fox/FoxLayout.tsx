import React, { useState, useEffect } from 'react';
import { usePlayground } from '../../context/usePlayground';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { PlaygroundView } from './PlaygroundView';
import { TemplatesView } from './TemplatesView';
import { KnowledgeView } from './KnowledgeView';
import { ParametersPanel } from './ParametersPanel';
import { SettingsModal } from './SettingsModal';
import { ModelInfoModal } from './ModelInfoModal';
import { NewTemplateModal } from './NewTemplateModal';
import { UserProfileModal } from './UserProfileModal';

export const FoxLayout: React.FC = () => {
  const {
    activeTab,
    isSidebarOpen,
    setIsSidebarOpen,
    isParametersOpen,
    setIsParametersOpen,
    promptInput,
    createNewChat
  } = usePlayground();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modelInfoOpen, setModelInfoOpen] = useState(false);
  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N: New Chat
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewChat();
      }
      // Escape: Close any open modal or drawer
      if (e.key === 'Escape') {
        setSettingsOpen(false);
        setModelInfoOpen(false);
        setNewTemplateOpen(false);
        setProfileOpen(false);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [createNewChat, setIsSidebarOpen]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#08090d] text-zinc-100 font-sans selection:bg-purple-500/30 selection:text-white">
      {/* 1. Desktop Left Sidebar */}
      <div className="hidden md:block h-full flex-shrink-0">
        <Sidebar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Slide-over Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-72 bg-[#0c0d12] shadow-2xl animate-slide-up">
            <Sidebar
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenProfile={() => setProfileOpen(true)}
            />
          </div>
        </div>
      )}

      {/* 2. Main Content Center Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Sticky Top Header */}
        <TopHeader onOpenModelInfo={() => setModelInfoOpen(true)} />

        {/* View Switcher matching activeTab */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'playground' && (
            <PlaygroundView onOpenSaveTemplate={() => setNewTemplateOpen(true)} />
          )}

          {activeTab === 'templates' && (
            <TemplatesView onOpenNewTemplate={() => setNewTemplateOpen(true)} />
          )}

          {activeTab === 'knowledge' && <KnowledgeView />}
        </main>
      </div>

      {/* 3. Right Parameters Panel */}
      {isParametersOpen && (
        <>
          {/* Desktop Right Sidebar */}
          <div className="hidden lg:block h-full flex-shrink-0 animate-fade-in">
            <ParametersPanel />
          </div>

          {/* Mobile Parameters Drawer */}
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-fade-in">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsParametersOpen(false)}
            />
            <div className="relative z-10 h-full w-80 bg-[#0c0d12] shadow-2xl animate-slide-up">
              <ParametersPanel />
            </div>
          </div>
        </>
      )}

      {/* Global Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ModelInfoModal isOpen={modelInfoOpen} onClose={() => setModelInfoOpen(false)} />
      <NewTemplateModal
        isOpen={newTemplateOpen}
        onClose={() => setNewTemplateOpen(false)}
        initialPrompt={promptInput}
      />
      <UserProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};
