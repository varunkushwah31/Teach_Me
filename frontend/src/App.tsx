import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { TechStackStrip } from './components/features/TechStackStrip';
import { FeatureShowcaseSection } from './components/features/FeatureShowcaseSection';
import { InteractiveKnowledgeGraphSection } from './components/features/InteractiveKnowledgeGraphSection';
import { HybridSearchSection } from './components/features/HybridSearchSection';
import { StudyPlanOutlineSection } from './components/features/StudyPlanOutlineSection';
import { GroupWorkspaceSection } from './components/features/GroupWorkspaceSection';

import { Footer } from './components/layout/Footer';
import { TeachMeStudioModal } from './components/interactive/TeachMeStudioModal';
import { AuthModal } from './components/auth/AuthModal';
import { ApiKeySettingsModal } from './components/settings/ApiKeySettingsModal';

export function App() {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState('chat');
  const [authOpen, setAuthOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const handleOpenStudio = (tab = 'chat') => {
    setStudioTab(tab);
    setStudioOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1c1e21] text-[#f3f4f6] flex flex-col font-sans selection:bg-[#a8ff53] selection:text-[#121317]">
      {/* Sticky Header Bar */}
      <Navbar
        onOpenStudio={handleOpenStudio}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenApiKeySettings={() => setApiKeyModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Glow, Interactive Filter Pills & Code/Preview Terminal */}
        <HeroSection
          onOpenStudio={handleOpenStudio}
          onOpenApiKeySettings={() => setApiKeyModalOpen(true)}
        />

        {/* 2. Supported Disciplines & AI Model Bar */}
        <TechStackStrip />

        {/* 3. Core Interactive AI Study Laboratory (Live Stream, Auto-Quiz, 3D Flashcard, 2-Speaker Podcast) */}
        <FeatureShowcaseSection onOpenStudio={handleOpenStudio} />

        {/* 4. Interactive Concept Knowledge Graph (Vector Graph Reasoning) */}
        <InteractiveKnowledgeGraphSection onOpenStudio={handleOpenStudio} />

        {/* 5. Hybrid Vector Search & PgVector Retrieval */}
        <HybridSearchSection onOpenStudio={handleOpenStudio} />

        {/* 6. Adaptive 5-Day Study Roadmaps & Cornell Lecture Outlines */}
        <StudyPlanOutlineSection onOpenStudio={handleOpenStudio} />

        {/* 7. Collaborative Multiplayer Study Rooms & Anki Deck Sync */}
        <GroupWorkspaceSection onOpenStudio={handleOpenStudio} />

      </main>

      {/* Footer & Pre-Footer Banner */}
      <Footer onOpenStudio={() => handleOpenStudio('documents')} />

      {/* Interactive TeachMe Studio Modal (Reflecting Spring Boot Backend) */}
      <TeachMeStudioModal
        isOpen={studioOpen}
        onClose={() => setStudioOpen(false)}
        initialTab={studioTab}
      />

      {/* Authentication Modal (JWT Login & Registration) */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => handleOpenStudio('documents')}
      />

      {/* AI Provider & Custom API Key Modal */}
      <ApiKeySettingsModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
}

export default App;

