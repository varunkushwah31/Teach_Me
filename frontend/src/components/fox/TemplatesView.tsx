import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  ArrowRightIcon,
  XIcon,
  CopyIcon,
  CheckIcon,
  PlayIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';
import type { PromptTemplate } from '../../types/playground';

interface TemplatesViewProps {
  onOpenNewTemplate: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onOpenNewTemplate }) => {
  const { templates, applyTemplate, deleteTemplate, runPrompt, setActiveTab } = usePlayground();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Education', 'Engineering', 'Architecture', 'Writing'];

  const filteredTemplates = templates.filter(tpl => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      tpl.title.toLowerCase().includes(query) ||
      tpl.description.toLowerCase().includes(query) ||
      tpl.category.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'All' || tpl.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleCopyPrompt = (e: React.MouseEvent, tpl: PromptTemplate) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tpl.prompt);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExecuteDirectly = (e: React.MouseEvent, tpl: PromptTemplate) => {
    e.stopPropagation();
    applyTemplate(tpl);
    setActiveTab('playground');
    void runPrompt(tpl.prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 select-none relative font-sans">
      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Prompt Blueprint Library
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                {templates.length} Blueprints
              </span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-[70ch]">
              Reusable prompt blueprints to jump-start coding, system design, pedagogical analysis, and algorithmic synthesis
            </p>
          </div>

          <button
            onClick={onOpenNewTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <PlusIcon className="w-4 h-4" weight="bold" />
            <span>New Blueprint</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search blueprints by title, description or category..."
              className="w-full bg-[#0e1017] border border-[#1c1f2e] focus:border-indigo-500/70 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 outline-none transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const count = cat === 'All' ? templates.length : templates.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length;
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/50 shadow-xs'
                      : 'bg-[#0e1017] text-zinc-400 hover:text-zinc-200 hover:bg-[#141624] border border-[#1c1f2e]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-xs font-mono px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-indigo-900/60 text-indigo-200' : 'bg-[#141622] text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Count indicator */}
        <div className="text-xs text-zinc-400 font-mono">
          Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'blueprint' : 'blueprints'}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] min-h-[200px] relative hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {tpl.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => handleCopyPrompt(e, tpl)}
                      className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#141622] transition-colors cursor-pointer"
                      title="Copy prompt text"
                    >
                      {copiedId === tpl.id ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <CopyIcon className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {tpl.isCustom && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteTemplate(tpl.id);
                        }}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-[#141622] transition-colors cursor-pointer"
                        title="Delete custom blueprint"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                  {tpl.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#171926] flex items-center justify-between text-xs">
                {/* Category Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141622] border border-[#1c1f2e] text-zinc-300 text-xs font-mono">
                  <TagIcon className="w-3 h-3 text-indigo-400" />
                  <span>{tpl.category}</span>
                </div>

                {/* Actions: Run Direct or Apply */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleExecuteDirectly(e, tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold cursor-pointer transition-colors"
                    title="Directly execute in Playground"
                  >
                    <PlayIcon className="w-3 h-3" weight="fill" />
                    <span>Run</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 group-hover:text-indigo-300 transition-colors">
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
