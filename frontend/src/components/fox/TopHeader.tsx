import React, { useState, useRef, useEffect } from 'react';
import {
  CaretDownIcon,
  InfoIcon,
  SlidersHorizontalIcon,
  ListIcon,
  TrashIcon,
  CheckIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  HouseIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';
import { AVAILABLE_MODELS } from '../../constants/playground';

interface TopHeaderProps {
  onOpenModelInfo: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenModelInfo }) => {
  const {
    activeModel,
    selectedModelOption,
    setActiveModel,
    isSidebarOpen,
    setIsSidebarOpen,
    isParametersOpen,
    setIsParametersOpen,
    clearCurrentChat,
    activeTab,
    activeDocId,
    setActiveTab,
    setViewMode
  } = usePlayground();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const filteredModels = AVAILABLE_MODELS.filter(m =>
    m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-[#171822] bg-[#0a0b10] select-none z-30 relative">
      {/* Left: Mobile Menu & Model Selector */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <ListIcon className="w-5 h-5" />
        </button>

        {/* Model Selector Pill */}
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Model
          </span>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#13141f] hover:bg-[#1a1b2a] border border-[#23263a] hover:border-indigo-500/50 text-xs text-zinc-200 transition-all duration-150 shadow-xs group cursor-pointer active:scale-95"
          >
            {/* Calm Solid Status Beacon */}
            <span className="w-2 h-2 rounded-full bg-emerald-400" />

            <span className="font-bold text-white group-hover:text-indigo-200 transition-colors">
              {selectedModelOption.name}
            </span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
              {selectedModelOption.provider}
            </span>
            <CaretDownIcon
              className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-indigo-400' : ''
              }`}
            />
          </button>

          {/* Info Button (i) */}
          <button
            onClick={onOpenModelInfo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-300 hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Model specifications and context limits"
          >
            <InfoIcon className="w-4 h-4" />
          </button>

          {/* Model Switcher Popover */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 sm:left-14 mt-2 w-80 bg-[#10111a] border border-[#222538] rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
              {/* Search Bar */}
              <div className="relative mb-2">
                <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={e => setModelSearch(e.target.value)}
                  placeholder="Filter models..."
                  className="w-full bg-[#161726] border border-[#23263a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500/60 font-mono"
                  autoFocus
                />
              </div>

              <div className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-[#23263a] mb-1 flex items-center justify-between">
                <span>Select AI Architecture</span>
                <span>{filteredModels.length} available</span>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredModels.map(model => {
                  const isCurrent = model.id === activeModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setActiveModel(model.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-950/70 text-indigo-100 border border-indigo-500/50 shadow-xs'
                          : 'hover:bg-[#161726] text-zinc-300 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{model.name}</span>
                          <span className="text-xs text-zinc-400 font-mono">({model.provider})</span>
                          {model.isLocal && (
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-mono">
                              Local
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 truncate font-mono">
                          {model.contextWindow}
                        </div>
                      </div>

                      {isCurrent ? (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                          <CheckIcon className="w-3 h-3" weight="bold" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-700/60 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Landing Page Return Button */}
        <button
          onClick={() => setViewMode('landing')}
          className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-indigo-300 hover:bg-[#151624] border border-[#222538] hover:border-indigo-500/30 transition-all text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
          title="Return to Landing Page"
        >
          <HouseIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-medium">Landing</span>
        </button>

        {/* RAG Context Status Indicator */}
        {activeDocId && (
          <button
            onClick={() => setActiveTab('knowledge')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs hover:bg-indigo-900/40 transition-colors shadow-xs cursor-pointer"
            title="Attached Knowledge Document"
          >
            <BookOpenIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">Doc Attached</span>
          </button>
        )}

        {/* Clear Conversation Action */}
        {activeTab === 'playground' && (
          <button
            onClick={clearCurrentChat}
            className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Clear current messages"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-medium">Clear</span>
          </button>
        )}

        {/* Parameters Panel Toggle Button */}
        <button
          onClick={() => setIsParametersOpen(!isParametersOpen)}
          className={`px-3 py-1.5 rounded-xl transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
            isParametersOpen
              ? 'text-indigo-200 bg-indigo-950/60 border border-indigo-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
              : 'text-zinc-400 hover:text-white hover:bg-[#161726] border border-[#222538]'
          }`}
          title="Toggle Parameters Panel"
        >
          <SlidersHorizontalIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Parameters</span>
        </button>
      </div>
    </header>
  );
};
