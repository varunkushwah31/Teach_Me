import React, { useState } from 'react';
import { Search, Bell, Share2, Download, Check } from 'lucide-react';

export const TopNav: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportAll = () => {
    window.open('http://localhost:8080/api/export/documents/all', '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="h-16 border-b border-white/5 bg-[#0D0D17]/40 backdrop-blur-xl px-6 flex items-center justify-between z-10">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents, topics, or AI chats..."
          className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none transition-all font-sans"
        />
      </div>

      {/* Contextual Action Tools & Notifications */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#06B6D4]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Link' : 'Share'}</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Notifications Button */}
        <button className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#F97316] orange-glow"></span>
        </button>
      </div>
    </header>
  );
};
