import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { TechStackMarquee } from './TechStackMarquee';
import { BentoFeatures } from './BentoFeatures';
import { ArchitectureSection } from './ArchitectureSection';
import { BenchmarkSection } from './BenchmarkSection';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 selection:bg-purple-500/30 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Top Fixed Blur Navigation */}
      <LandingNavbar />

      {/* Hero Section with Interactive Synthesizer Playground */}
      <main>
        <LandingHero />

        {/* Technology Stack Marquee */}
        <TechStackMarquee />

        {/* Bento Grid Features Showcase */}
        <BentoFeatures />

        {/* Technical Architecture & Code Showcase */}
        <ArchitectureSection />

        {/* Benchmark & Telemetry Comparison */}
        <BenchmarkSection />

        {/* High Conversion CTA Section */}
        <LandingCTA />
      </main>

      {/* Artisanal Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
