import React from 'react';
import { PlaygroundProvider } from './context/PlaygroundContext';
import { usePlayground } from './context/usePlayground';
import { FoxLayout } from './components/fox/FoxLayout';
import { LandingPage } from './components/landing/LandingPage';

const AppContent: React.FC = () => {
  const { viewMode } = usePlayground();
  return viewMode === 'landing' ? <LandingPage /> : <FoxLayout />;
};

export function App() {
  return (
    <PlaygroundProvider>
      <AppContent />
    </PlaygroundProvider>
  );
}

export default App;
