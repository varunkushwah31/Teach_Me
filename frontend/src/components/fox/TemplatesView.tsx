import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
  ClockIcon,
  TrashIcon,
  ArrowRightIcon,
  XIcon
} from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

interface TemplatesViewProps {
  onOpenNewTemplate: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onOpenNewTemplate }) => {
  const { templates, applyTemplate, deleteTemplate } = usePlayground();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090d] bg-grid-subtle overflow-y-auto px-6 md:px-12 py-8 select-none relative">
      <div className="max-w-6xl w-full mx-auto space-y-6 relative z-10 animate-fade-in">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Templates
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
                {templates.length} total
              </span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Reusable prompt blueprints to jump-start your coding and reasoning workflows
            </p>
          </div>

          <button
            onClick={onOpenNewTemplate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex-shrink-0 cursor-pointer active:scale-95"
          >
            <PlusIcon className="w-4 h-4" weight="bold" />
            <span>New Template</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3">
          <div className="relative w-full">
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates by title, description or category..."
              className="w-full bg-[#11121b] border border-[#1e202f] focus:border-purple-500/70 rounded-xl pl-10 pr-10 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-xs'
                    : 'bg-[#11121b] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Count indicator */}
        <div className="text-xs text-zinc-500 font-mono">
          Showing {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
          {filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="bg-gradient-to-b from-[#11121a] to-[#0c0d14] border border-[#1c1e2d] hover:border-purple-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-md hover:shadow-[0_8px_24px_rgba(139,92,246,0.15)] min-h-[175px] relative card-shine hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-purple-200 transition-colors">
                    {tpl.title}
                  </h3>
                  {tpl.isCustom && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteTemplate(tpl.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Delete custom template"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-3">
                  {tpl.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-[#1a1b28] flex items-center justify-between text-xs">
                {/* Category Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161724] border border-zinc-800 text-zinc-300 text-[10px] font-mono">
                  <TagIcon className="w-3 h-3 text-purple-400" />
                  <span>{tpl.category}</span>
                </div>

                {/* Updated Timestamp / Use Hover Action */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 group-hover:text-purple-300 transition-colors">
                  <span className="hidden group-hover:inline font-semibold">Use Template</span>
                  <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  <span className="group-hover:hidden flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{tpl.updatedAt}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
