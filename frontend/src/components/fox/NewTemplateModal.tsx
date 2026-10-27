import React, { useState } from 'react';
import { XIcon, BookmarkSimpleIcon } from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const NewTemplateModal: React.FC<NewTemplateModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = ''
}) => {
  if (!isOpen) return null;

  return (
    <NewTemplateModalContent
      onClose={onClose}
      initialPrompt={initialPrompt}
    />
  );
};

const NewTemplateModalContent: React.FC<{ onClose: () => void; initialPrompt: string }> = ({
  onClose,
  initialPrompt
}) => {
  const { saveAsTemplate } = usePlayground();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [category, setCategory] = useState('Education');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim()) return;

    saveAsTemplate({
      title: title.trim(),
      description: description.trim() || 'Custom user prompt blueprint',
      prompt: prompt.trim(),
      category: category.trim() || 'General'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#12131e] to-[#0d0e16] border border-[#1f2133] rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b1d2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-sm">
              <BookmarkSimpleIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Create Prompt Template</span>
              </h2>
              <p className="text-xs text-zinc-400">Save prompt to your reusable templates library</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Template Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Socratic Algorithm Mentor"
              required
              className="w-full bg-[#151624] border border-[#222438] focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#151624] border border-[#222438] focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
              >
                <option value="Education">Education</option>
                <option value="Engineering">Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Writing">Writing</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of capability"
                className="w-full bg-[#151624] border border-[#222438] focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Prompt Instructions
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={5}
              placeholder="Write the full template prompt text..."
              required
              className="w-full bg-[#151624] border border-[#222438] focus:border-purple-500/80 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-colors resize-none font-mono leading-relaxed"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#1b1d2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all disabled:opacity-40 cursor-pointer active:scale-95"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
