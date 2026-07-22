import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Sliders, Cpu, Save, Check, ShieldCheck, LogOut, Laptop } from 'lucide-react';
import { authApi } from '../lib/apiClient';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'algorithm' | 'security'>('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [name, setName] = useState('Academic Student');
  const [email, setEmail] = useState('student@teachme.ai');
  const [institution, setInstitution] = useState('Massachusetts Institute of Technology');
  const [verboseMode, setVerboseMode] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [vectorK, setVectorK] = useState(60);
  const [easeFactor, setEaseFactor] = useState(2.5);

  // Active Sessions state
  const [sessions, setSessions] = useState<{ id: number; expiryDate: string; revoked: boolean; currentDevice?: boolean }[]>([]);

  useEffect(() => {
    authApi.getSessions().then((res) => {
      if (Array.isArray(res)) setSessions(res);
    });
  }, []);

  const handleRevokeSession = async (id: number) => {
    await authApi.revokeSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRevokeAll = async () => {
    await authApi.revokeAllSessions();
    setSessions([]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as any)}
      className="space-y-6 max-w-5xl mx-auto font-sans relative"
    >
      {/* Title Header */}
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
          System <span className="gradient-text-orange font-extrabold">Settings</span>
        </h1>
        <p className="text-xs text-[#94A3B8] font-mono mt-1">Manage profile, active security sessions, and RAG vector store parameters.</p>
      </div>

      {/* Split-Pane Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Inner Sidebar (Tabs.List) */}
        <Tabs.List className="md:col-span-1 space-y-1.5 z-10 flex flex-col">
          <Tabs.Trigger
            value="profile"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-[#F97316]" />
            <span>Profile Settings</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="preferences"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'preferences'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-[#06B6D4]" />
            <span>App Preferences</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="algorithm"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'algorithm'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#D946EF]" />
            <span>RAG & SM-2 Tuning</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="security"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#06B6D4] shadow-[inset_0_0_15px_rgba(6,182,212,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
            <span>Active Sessions</span>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Settings Content Box */}
        <Card variant="default" className="md:col-span-3">
          <Tabs.Content value="profile" className="focus:outline-none space-y-4">
            <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Student Profile Information</h2>

            <div className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label htmlFor="settings-full-name" className="text-white font-semibold flex items-center gap-1.5">Full Name</label>
                <input
                  id="settings-full-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#06060A]/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-email-addr" className="text-white font-semibold flex items-center gap-1.5">Email Address</label>
                <input
                  id="settings-email-addr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#06060A]/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="settings-institution-name" className="text-white font-semibold flex items-center gap-1.5">Academic Institution</label>
                <input
                  id="settings-institution-name"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-[#06060A]/80 border border-white/5 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="preferences" className="focus:outline-none space-y-4">
            <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Interface & Workspace Preferences</h2>

            <div className="space-y-5 text-xs font-mono">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-white font-semibold">Verbose Citation Snippets</p>
                  <p className="text-[10px] text-[#94A3B8] font-sans mt-0.5">Always display full reference block in AI answers</p>
                </div>
                <input
                  id="settings-verbose-checkbox"
                  type="checkbox"
                  checked={verboseMode}
                  onChange={(e) => setVerboseMode(e.target.checked)}
                  className="w-4 h-4 accent-[#F97316] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold">Card Density</p>
                <div className="grid grid-cols-2 gap-3 font-sans">
                  <button
                    onClick={() => setDensity('comfortable')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      density === 'comfortable'
                        ? 'border-[#F97316] bg-[#F97316]/10 text-white font-semibold'
                        : 'border-white/5 bg-white/5 text-[#94A3B8] hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs">Comfortable (8px)</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1 font-normal font-sans">Standard padding and margins</p>
                  </button>
                  <button
                    onClick={() => setDensity('compact')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      density === 'compact'
                        ? 'border-[#F97316] bg-[#F97316]/10 text-white font-semibold'
                        : 'border-white/5 bg-white/5 text-[#94A3B8] hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs">Compact (4px)</p>
                    <p className="text-[10px] text-[#94A3B8] mt-1 font-normal font-sans">High document density mode</p>
                  </button>
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="algorithm" className="focus:outline-none space-y-4">
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
          </Tabs.Content>

          <Tabs.Content value="security" className="focus:outline-none space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading flex items-center gap-2">
                  <span>Active Device Sessions</span>
                  <Badge variant="cyan">Reuse Detection Active</Badge>
                </h2>
                <p className="text-[11px] text-[#94A3B8] font-sans mt-0.5">
                  Stateful token monitoring across signed-in browsers and mobile devices.
                </p>
              </div>
              {sessions.length > 0 && (
                <button
                  onClick={handleRevokeAll}
                  className="bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-[#EF4444]/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out All Devices</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.length === 0 ? (
                <div className="p-8 text-center bg-white/5 rounded-xl border border-white/5 text-xs text-[#94A3B8]">
                  No active secondary sessions registered.
                </div>
              ) : (
                sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-4 rounded-xl bg-[#06060A]/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white flex items-center gap-2">
                          <span>Device Session #{sess.id}</span>
                          {sess.currentDevice && <Badge variant="success">Current Browser</Badge>}
                        </p>
                        <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                          Expires: {new Date(sess.expiryDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-[#EF4444] border border-white/5 text-xs font-medium text-[#94A3B8] transition-all cursor-pointer"
                    >
                      Revoke Device
                    </button>
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>

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
    </Tabs.Root>
  );
};
