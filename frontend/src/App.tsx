import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/hero/HeroSection';
import { ArchitectureWorkflowSection } from './components/features/ArchitectureWorkflowSection';
import { InteractiveKnowledgeGraphSection } from './components/features/InteractiveKnowledgeGraphSection';
import { HybridSearchSection } from './components/features/HybridSearchSection';
import { ObservabilitySection } from './components/features/ObservabilitySection';
import { ReliabilityCodeSection } from './components/features/ReliabilityCodeSection';
import { StudyPlanOutlineSection } from './components/features/StudyPlanOutlineSection';
import { GroupWorkspaceSection } from './components/features/GroupWorkspaceSection';
import { TechStackStrip } from './components/features/TechStackStrip';
import { RealtimeStreamsSection } from './components/features/RealtimeStreamsSection';
import { RuntimeGridSection } from './components/features/RuntimeGridSection';
import { FeatureShowcaseSection } from './components/features/FeatureShowcaseSection';
import { TestimonialsSection } from './components/social/TestimonialsSection';
import { StatsSection } from './components/social/StatsSection';
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
    <div className="min-h-screen bg-[#1c1e21] text-[#e5e7eb] flex flex-col font-['Geist'] selection:bg-[#a8ff53] selection:text-[#121317]">
      {/* Sticky Header Bar */}
      <Navbar
        onOpenStudio={handleOpenStudio}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenApiKeySettings={() => setApiKeyModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with Glow, Interactive Filter Pills & Code Editor */}
        <HeroSection
          onOpenStudio={handleOpenStudio}
          onOpenApiKeySettings={() => setApiKeyModalOpen(true)}
        />

        {/* 2. Architecture & Workflows (4 Flow Cards: Agent, Chaining, Routing, Parallelization) */}
        <ArchitectureWorkflowSection onOpenStudio={() => handleOpenStudio('documents')} />

        {/* 3. Interactive Concept Knowledge Graph (Vector Graph Reasoning) */}
        <InteractiveKnowledgeGraphSection onOpenStudio={handleOpenStudio} />

        {/* 4. Hybrid Vector Search & Cross-Encoder Re-Ranking */}
        <HybridSearchSection onOpenStudio={handleOpenStudio} />

        {/* 5. Task Queue & Live Observability Monitor */}
        <ObservabilitySection />

        {/* 6. Reliability & Step Checkpointing Code Viewer */}
        <ReliabilityCodeSection />

        {/* 7. Adaptive Study Roadmaps & Cornell Lecture Outlines */}
        <StudyPlanOutlineSection onOpenStudio={handleOpenStudio} />

        {/* 8. Collaborative Multiplayer Study Rooms & Anki Deck Sync */}
        <GroupWorkspaceSection onOpenStudio={handleOpenStudio} />

        {/* 9. Technology Stack Logo Strip */}
        <TechStackStrip />

        {/* 10. Realtime Streaming & Chat UI Demo */}
        <RealtimeStreamsSection onOpenStudio={handleOpenStudio} />

        {/* 11. Developer Runtime Grid (6 Cards) */}
        <RuntimeGridSection />

        {/* 12. Core TeachMe AI Engines (Quiz, SM-2, Map-Reduce, Podcast) */}
        <FeatureShowcaseSection onOpenStudio={handleOpenStudio} />

        {/* 13. Developer Testimonials */}
        <TestimonialsSection />

        {/* 14. Metrics & Social Proof */}
        <StatsSection />
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
