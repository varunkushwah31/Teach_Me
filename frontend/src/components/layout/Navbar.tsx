import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User, Sliders } from 'lucide-react';
import { TeachMeAPI } from '../../services/teachMeService';

interface NavbarProps {
  onOpenStudio?: (initialTab?: string) => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenStudio, onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(TeachMeAPI.auth.isAuthenticated());
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#1c1e21]/95 backdrop-blur-md border-b border-[#272a2e]'
          : 'bg-[#1c1e21]/70 backdrop-blur-sm border-b border-[#272a2e]/50'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-[#a8ff53] transition-transform group-hover:scale-110"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[19px] tracking-tight text-[#e5e7eb]">
                TeachMe
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#272a2e] text-[#a8ff53] text-[10px] font-mono font-semibold">
                STUDY AI
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links — Fixed Single Line */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13.5px]">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Upload PDF
          </button>
          <button
            onClick={() => onOpenStudio?.('chat')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            AI Tutor Q&A
          </button>
          <button
            onClick={() => onOpenStudio?.('quiz')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Practice Quizzes
          </button>
          <button
            onClick={() => onOpenStudio?.('flashcards')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            SM-2 Flashcards
          </button>
          <button
            onClick={() => onOpenStudio?.('podcast')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Audio Podcasts
          </button>
          <button
            onClick={() => onOpenStudio?.('outline')}
            className="text-[#d7d9dd] hover:text-[#a8ff53] transition-colors whitespace-nowrap cursor-pointer font-medium"
          >
            Cornell Notes
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onOpenStudio?.('settings')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] font-mono text-[#d7d9dd] hover:text-[#e5e7eb] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] bg-[#121317]/80 transition-colors whitespace-nowrap cursor-pointer"
            title="Configure Local Ollama or Custom API Keys"
          >
            <Sliders className="w-3.5 h-3.5 text-[#a8ff53]" />
            <span>Ollama / API Config</span>
          </button>

          {isAuth ? (
            <button
              onClick={() => onOpenStudio?.('documents')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-mono text-[#a8ff53] bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1.5 text-[13px] text-[#d7d9dd] hover:text-[#e5e7eb] transition-colors whitespace-nowrap cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a8ff53] hover:bg-[#b8ff70] active:scale-[0.98] text-[#121317] font-semibold text-[13px] rounded-[4px] shadow-[inset_0_0_0_1px_rgba(168,255,83,0.3)] transition-all whitespace-nowrap cursor-pointer"
          >
            <span>Start Studying</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => onOpenStudio?.('documents')}
            className="px-2.5 py-1 bg-[#a8ff53] text-[#121317] font-semibold text-[12px] rounded-[4px]"
          >
            Study Now
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#d7d9dd] hover:text-[#e5e7eb] border border-[#272a2e] rounded-[4px]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#121317] border-b border-[#272a2e] px-4 py-4 space-y-2.5 text-[14px]">
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('documents'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1"
          >
            📄 Upload Course PDF
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('chat'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1"
          >
            💬 AI Tutor Q&A
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('quiz'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1"
          >
            📝 Practice Quizzes
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('flashcards'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1"
          >
            🧠 SM-2 Spaced Flashcards
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('podcast'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1"
          >
            🎙️ Audio Podcasts
          </button>
          <button
            onClick={() => { setMobileMenuOpen(false); onOpenStudio?.('settings'); }}
            className="block w-full text-left text-[#d7d9dd] hover:text-[#a8ff53] py-1 font-mono text-[13px]"
          >
            ⚙️ Ollama / Custom API Settings
          </button>
        </div>
      )}
    </header>
  );
};
