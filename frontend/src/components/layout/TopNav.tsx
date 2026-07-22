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
    <header className="h-16 border-b border-[#27272A] bg-[#1A1A1A]/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
      {/* Global Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents, topics, or AI chats..."
          className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#F97316] transition-colors font-sans"
        />
      </div>

      {/* Contextual Action Tools & Notifications */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272A] text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export All</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272A] text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#06B6D4]" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Link' : 'Share'}</span>
        </button>

        <div className="h-4 w-px bg-[#27272A] mx-1" />

        {/* Notifications Button */}
        <button className="relative p-2 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316]"></span>
        </button>
      </div>
    </header>
  );
};
