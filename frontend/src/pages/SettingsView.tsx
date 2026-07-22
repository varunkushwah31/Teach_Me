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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Header */}
      <div className="pb-3 border-b border-[#27272A]">
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-xs text-[#A1A1AA]">Manage profile, UI preferences, and RAG vector store parameters.</p>
      </div>

      {/* Split-Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Inner Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[#27272A] text-white border-l-4 border-[#F97316]'
                : 'text-[#A1A1AA] hover:bg-[#27272A]/50 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#F97316]" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'preferences'
                ? 'bg-[#27272A] text-white border-l-4 border-[#F97316]'
                : 'text-[#A1A1AA] hover:bg-[#27272A]/50 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#06B6D4]" />
            <span>App Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithm')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'algorithm'
                ? 'bg-[#27272A] text-white border-l-4 border-[#F97316]'
                : 'text-[#A1A1AA] hover:bg-[#27272A]/50 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#F97316]" />
            <span>RAG & SM-2 Tuning</span>
          </button>
        </div>

        {/* Settings Content Box */}
        <Card variant="default" className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">Student Profile Information</h2>

              <div className="flex items-center gap-4 pb-4 border-b border-[#27272A]">
                <div className="w-14 h-14 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-bold text-lg text-[#F97316] orange-glow">
                  {name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <button className="bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                    Upload New Avatar
                  </button>
                  <p className="text-[11px] text-[#A1A1AA] mt-1 font-mono">JPG or PNG under 2MB.</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#A1A1AA] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-1">Academic Institution</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">Interface & UI Preferences</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F0F0F] border border-[#27272A]">
                  <div>
                    <p className="font-semibold text-white">Strict Dark Mode</p>
                    <p className="text-[#A1A1AA] text-[11px]">Enforce #0F0F0F base aesthetic globally</p>
                  </div>
                  <Badge variant="cyan">Always Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0F0F0F] border border-[#27272A]">
                  <div>
                    <p className="font-semibold text-white">Verbose Technical Mode</p>
                    <p className="text-[#A1A1AA] text-[11px]">Show vector chunk IDs & distance scores in chat</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={verboseMode}
                    onChange={(e) => setVerboseMode(e.target.checked)}
                    className="w-4 h-4 accent-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block text-[#A1A1AA] mb-2 font-medium">Information Density</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setDensity('comfortable')}
                      className={`p-3 rounded-xl text-left border ${
                        density === 'comfortable'
                          ? 'border-[#F97316] bg-[#F97316]/10 text-white'
                          : 'border-[#27272A] text-[#A1A1AA]'
                      }`}
                    >
                      <p className="font-semibold text-xs">Comfortable (8px)</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">Recommended spacing for continuous reading</p>
                    </button>

                    <button
                      onClick={() => setDensity('compact')}
                      className={`p-3 rounded-xl text-left border ${
                        density === 'compact'
                          ? 'border-[#F97316] bg-[#F97316]/10 text-white'
                          : 'border-[#27272A] text-[#A1A1AA]'
                      }`}
                    >
                      <p className="font-semibold text-xs">Compact (4px)</p>
                      <p className="text-[10px] text-[#A1A1AA] mt-0.5">High document density mode</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'algorithm' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">Algorithm & Hyperparameter Config</h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0F0F0F] border border-[#27272A] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">RRF Constant (k):</span>
                    <span className="text-[#06B6D4]">{vectorK}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={vectorK}
                    onChange={(e) => setVectorK(Number(e.target.value))}
                    className="w-full accent-[#06B6D4]"
                  />
                  <p className="text-[10px] text-[#A1A1AA] font-sans">
                    Reciprocal Rank Fusion constant balancing vector similarity vs pgvector tsvector full-text search.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#0F0F0F] border border-[#27272A] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Base Ease Factor (EF):</span>
                    <span className="text-[#F97316]">{easeFactor}</span>
                  </div>
                  <input
                    type="range"
                    min={1.3}
                    max={3.5}
                    step={0.1}
                    value={easeFactor}
                    onChange={(e) => setEaseFactor(Number(e.target.value))}
                    className="w-full accent-[#F97316]"
                  />
                  <p className="text-[10px] text-[#A1A1AA] font-sans">
                    Initial multiplier for SM-2 spaced repetition review scheduling algorithm.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[#27272A] flex justify-end">
            <button
              onClick={handleSave}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs px-5 py-2 rounded-lg font-medium orange-glow flex items-center gap-1.5"
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
