import React, { useState, useEffect } from 'react';
import { ListIcon, XIcon, ArrowRightIcon, UserIcon, KeyIcon } from '@phosphor-icons/react';
import { TeachMeAPI } from '@/services/teachMeService.ts';
import { getStoredAIConfig, type AIProviderConfig } from '@/services/aiConfigService.ts';

interface NavbarProps {
  onOpenStudio?: (initialTab?: string) => void;
  onOpenAuth?: () => void;
  onOpenApiKeySettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStudio, onOpenAuth, onOpenApiKeySettings }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuth] = useState(() => TeachMeAPI.auth.isAuthenticated());
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(getStoredAIConfig);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    const handleConfigUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AIProviderConfig>;
      if (customEvent.detail) {
        setAiConfig(customEvent.detail);
      } else {
        setAiConfig(getStoredAIConfig());
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('teachme_ai_config_updated', handleConfigUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('teachme_ai_config_updated', handleConfigUpdate);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 select-none ${
        scrolled
          ? 'bg-[#08090d]/95 backdrop-blur-md border-b border-[#1c1f2e]'
          : 'bg-[#08090d]/70 backdrop-blur-sm border-b border-[#1c1f2e]/60'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 font-sans">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30 group-hover:ring-indigo-400/60 transition-all duration-300" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">
                TeachMe
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium">
                COLLEGE RAG
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-semibold text-zinc-400">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Upload Notes PDF
          </button>
          <button
            onClick={() => onOpenStudio?.('chat')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Notes Chatbot (RAG)
          </button>
          <button
            onClick={() => onOpenStudio?.('quiz')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Exam Quizzes
          </button>
          <button
            onClick={() => onOpenStudio?.('flashcards')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            SM-2 Flashcards
          </button>
          <button
            onClick={() => onOpenStudio?.('podcast')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Audio Podcasts
          </button>
          <button
            onClick={() => onOpenStudio?.('outline')}
            className="hover:text-indigo-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Cornell Notes
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenApiKeySettings ? onOpenApiKeySettings() : onOpenStudio?.('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white border border-[#1c1f2e] hover:border-indigo-500/40 rounded-xl bg-[#0e1017] transition-colors whitespace-nowrap cursor-pointer"
            title="Configure AI API Keys or Local Ollama"
          >
            <KeyIcon className="w-3.5 h-3.5 text-indigo-400" weight="bold" />
            <span className="capitalize">{aiConfig.provider}</span>
            <span className="text-xs text-indigo-300 bg-indigo-950/70 px-1.5 py-0.2 rounded border border-indigo-500/30">
              {aiConfig.provider === 'ollama' ? 'Local' : 'Custom'}
            </span>
          </button>

          {isAuth ? (
            <button
              onClick={() => onOpenStudio?.('documents')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-indigo-300 bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 rounded-xl whitespace-nowrap cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer font-semibold"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => onOpenStudio?.('chat')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs border border-indigo-400/30 transition-all whitespace-nowrap cursor-pointer active:scale-95 group"
          >
            <span>Start Notes Chat</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => onOpenStudio?.('chat')}
            className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-xs rounded-xl"
          >
            Notes Chat
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-zinc-300 hover:text-white border border-[#1c1f2e] rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <XIcon className="w-4 h-4" /> : <ListIcon className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e1017] border-b border-[#1c1f2e] px-4 py-4 space-y-2 text-xs font-semibold">
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('documents'); }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 cursor-pointer"
          >
            Upload College Notes PDF
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('chat'); }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 cursor-pointer"
          >
            College Notes RAG Chat
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('quiz'); }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 cursor-pointer"
          >
            Exam Practice Quizzes
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('flashcards'); }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 cursor-pointer"
          >
            SM-2 Course Flashcards
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('podcast'); }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 cursor-pointer"
          >
            Audio Study Podcasts
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenApiKeySettings) onOpenApiKeySettings();
              else onOpenStudio?.('settings');
            }}
            className="block w-full text-left text-zinc-300 hover:text-indigo-300 py-1 font-mono text-xs cursor-pointer"
          >
            AI Provider and API Keys ({aiConfig.provider})
          </button>
        </div>
      )}
    </header>
  );
};
