import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Sliders, Cpu, Save, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'algorithm'>('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [name, setName] = useState('Academic Student');
  const [email, setEmail] = useState('student@teachme.ai');
  const [institution, setInstitution] = useState('Massachusetts Institute of Technology');
  const [verboseMode, setVerboseMode] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [vectorK, setVectorK] = useState(60);
  const [easeFactor, setEaseFactor] = useState(2.5);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans relative">
      {/* Title Header */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
          System <span className="gradient-text-orange font-extrabold">Settings</span>
        </h1>
        <p className="text-xs text-[#94A3B8] font-mono mt-1">Manage profile, UI preferences, and RAG vector store parameters.</p>
      </div>

      {/* Split-Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Inner Sidebar */}
        <div className="md:col-span-1 space-y-1.5 z-10">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#F97316]" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#06B6D4]" />
            <span>App Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === 'algorithm'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)]'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#D946EF]" />
            <span>RAG & SM-2 Tuning</span>
          </button>
        </div>

        {/* Settings Content Box */}
        <Card variant="default" className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Student Profile Information</h2>

              <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center font-bold text-lg text-white shadow-md">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <button className="bg-white/5 border border-white/5 hover:bg-white/10 text-white text-xs px-4 py-2 rounded-xl font-bold cursor-pointer transition-all">
                    Upload New Avatar
                  </button>
                  <p className="text-[10px] text-[#94A3B8] mt-1.5 font-mono">JPG or PNG under 2MB.</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label htmlFor="full-name-input" className="block text-[#94A3B8] font-semibold mb-1">Full Name</label>
                  <input
                    id="full-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="email-settings-input" className="block text-[#94A3B8] font-semibold mb-1">Email Address</label>
                  <input
                    id="email-settings-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label htmlFor="institution-settings-input" className="block text-[#94A3B8] font-semibold mb-1">Academic Institution</label>
                  <input
                    id="institution-settings-input"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Interface & UI Preferences</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div>
                    <p className="font-semibold text-white">Strict Dark Mode</p>
                    <p className="text-[#94A3B8] text-[11px] mt-0.5">Enforce deep obsidian space base aesthetic globally</p>
                  </div>
                  <Badge variant="cyan">Always Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <label htmlFor="verbose-mode-checkbox" className="cursor-pointer">
                    <span className="block font-semibold text-white">Verbose Technical Mode</span>
                    <span className="block text-[#94A3B8] text-[11px] mt-0.5 font-normal">Show vector chunk IDs & distance scores in chat</span>
                  </label>
                  <input
                    id="verbose-mode-checkbox"
                    type="checkbox"
                    checked={verboseMode}
                    onChange={(e) => setVerboseMode(e.target.checked)}
                    className="w-4 h-4 accent-[#F97316] cursor-pointer"
                  />
                </div>

                <div>
                  <p className="block text-[#94A3B8] mb-2.5 font-semibold">Information Density</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDensity('comfortable')}
                      className={`p-3.5 rounded-xl text-left border cursor-pointer transition-all ${
                        density === 'comfortable'
                          ? 'border-[#F97316] bg-[#F97316]/10 text-white font-semibold'
                          : 'border-white/5 bg-white/5 text-[#94A3B8] hover:border-white/10'
                      }`}
                    >
                      <p className="text-xs">Comfortable (8px)</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1 font-normal font-sans">Recommended spacing for continuous reading</p>
                    </button>

                    <button
                      onClick={() => setDensity('compact')}
                      className={`p-3.5 rounded-xl text-left border cursor-pointer transition-all ${
                        density === 'compact'
                          ? 'border-[#F97316] bg-[#F97316]/10 text-white font-semibold'
                          : 'border-white/5 bg-white/5 text-[#94A3B8] hover:border-white/10'
                      }`}
                    >
                      <p className="text-xs">Compact (4px)</p>
                      <p className="text-[10px] text-[#94A3B8] mt-1 font-normal font-sans">High document density mode</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Algorithm & Hyperparameter Config</h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">RRF Constant (k):</span>
                    <span className="text-[#06B6D4]">{vectorK}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={vectorK}
                    onChange={(e) => setVectorK(Number(e.target.value))}
                    className="w-full accent-[#06B6D4] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#94A3B8] font-sans">
                    Reciprocal Rank Fusion constant balancing vector similarity vs pgvector tsvector full-text search.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Base Ease Factor (EF):</span>
                    <span className="text-[#F97316]">{easeFactor}</span>
                  </div>
                  <input
                    type="range"
                    min={1.3}
                    max={3.5}
                    step={0.1}
                    value={easeFactor}
                    onChange={(e) => setEaseFactor(Number(e.target.value))}
                    className="w-full accent-[#F97316] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#94A3B8] font-sans">
                    Initial multiplier for SM-2 spaced repetition review scheduling algorithm.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs px-5 py-2.5 rounded-xl font-bold orange-glow flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saved ? 'Changes Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
