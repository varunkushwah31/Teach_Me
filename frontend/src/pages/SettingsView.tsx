import React, { useState, useEffect } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Sliders, Cpu, Save, Check, ShieldCheck, LogOut, Laptop, Server, Wifi, RefreshCw, CheckCircle2, AlertTriangle, Sparkles, Activity } from 'lucide-react';
import { authApi } from '../lib/apiClient';
import { RagObservabilityCard } from '../components/ui/RagObservabilityCard';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'ollama' | 'persona' | 'observability' | 'security'>('profile');
  const [saved, setSaved] = useState(false);

  // Form states
  const [name, setName] = useState('Academic Student');
  const [email, setEmail] = useState('student@teachme.ai');
  const [institution, setInstitution] = useState('Massachusetts Institute of Technology');
  const [verboseMode, setVerboseMode] = useState(true);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [vectorK, setVectorK] = useState(60);
  const [easeFactor, setEaseFactor] = useState(2.5);

  // Persona state
  const [persona, setPersona] = useState<'socratic' | 'eli5' | 'phd'>('socratic');

  // Ollama states
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);
  const [testingOllama, setTestingOllama] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);
  const [selectedOllamaModel, setSelectedOllamaModel] = useState('deepseek-r1:8b');

  // Active Sessions state
  const [sessions, setSessions] = useState<{ id: number; expiryDate: string; revoked: boolean; currentDevice?: boolean }[]>([]);

  useEffect(() => {
    authApi.getSessions().then((res) => {
      if (Array.isArray(res)) setSessions(res);
    });
    handleTestOllama();
  }, []);

  const handleTestOllama = async () => {
    setTestingOllama(true);
    try {
      const res = await fetch('http://localhost:8081/api/ollama/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('teachme_jwt_token') || ''}`,
        },
        body: JSON.stringify({ baseUrl: ollamaUrl }),
      });
      const data = await res.json();
      setOllamaStatus(data);

      if (data.status === 'ONLINE') {
        const modelsRes = await fetch(`http://localhost:8081/api/ollama/models?baseUrl=${encodeURIComponent(ollamaUrl)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('teachme_jwt_token') || ''}`,
          },
        });
        const modelsData = await modelsRes.json();
        if (Array.isArray(modelsData)) setOllamaModels(modelsData);
      }
    } catch (err) {
      setOllamaStatus({ status: 'OFFLINE', message: 'Could not connect to backend endpoint.' });
    } finally {
      setTestingOllama(false);
    }
  };

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
        <p className="text-xs text-[#94A3B8] font-mono mt-1">Manage profile, AI personas, Ollama endpoints, Actuator metrics, and RAG tuning.</p>
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
            value="persona"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'persona'
                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 text-white border-l-4 border-[#F97316] shadow-[inset_0_0_15px_rgba(249,115,22,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F97316]" />
            <span>AI Persona Mode</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="ollama"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'ollama'
                ? 'bg-gradient-to-r from-[#06B6D4]/10 to-[#3B82F6]/5 text-white border-l-4 border-[#06B6D4] shadow-[inset_0_0_15px_rgba(6,182,212,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-[#06B6D4]" />
            <span>Ollama AI Models</span>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="observability"
            className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-left focus:outline-none ${
              activeTab === 'observability'
                ? 'bg-gradient-to-r from-[#06B6D4]/10 to-[#3B82F6]/5 text-white border-l-4 border-[#06B6D4] shadow-[inset_0_0_15px_rgba(6,182,212,0.05)] font-bold'
                : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 text-[#06B6D4]" />
            <span>RAG Telemetry</span>
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

          {/* AI PERSONA TAB */}
          <Tabs.Content value="persona" className="focus:outline-none space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading flex items-center gap-2">
                <span>AI Tutor Persona & Teaching Mode</span>
                <Badge variant="orange">Dynamic Prompt Tuning</Badge>
              </h2>
              <p className="text-[11px] text-[#94A3B8] font-mono mt-1">Select how TeachMe AI structures explanation responses and academic guidance.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPersona('socratic')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  persona === 'socratic'
                    ? 'border-[#F97316] bg-[#F97316]/10 text-white orange-glow font-bold'
                    : 'border-white/5 bg-[#06060A]/80 text-[#94A3B8] hover:border-white/20 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold text-white flex items-center justify-between">
                  <span>🏛 Socratic Interviewer Mode</span>
                  {persona === 'socratic' && <CheckCircle2 className="w-4 h-4 text-[#F97316]" />}
                </p>
                <p className="text-[11px] text-[#94A3B8] font-sans mt-1">
                  Guides you to answers by asking probing academic questions and challenging assumptions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPersona('eli5')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  persona === 'eli5'
                    ? 'border-[#06B6D4] bg-[#06B6D4]/10 text-white cyan-glow font-bold'
                    : 'border-white/5 bg-[#06060A]/80 text-[#94A3B8] hover:border-white/20 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold text-white flex items-center justify-between">
                  <span>💡 ELI5 (Explain Like I'm 5) Mode</span>
                  {persona === 'eli5' && <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
                </p>
                <p className="text-[11px] text-[#94A3B8] font-sans mt-1">
                  Simplifies complex equations and physics proofs into intuitive real-world analogies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPersona('phd')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  persona === 'phd'
                    ? 'border-[#D946EF] bg-[#D946EF]/10 text-white font-bold'
                    : 'border-white/5 bg-[#06060A]/80 text-[#94A3B8] hover:border-white/20 hover:text-white'
                }`}
              >
                <p className="text-xs font-bold text-white flex items-center justify-between">
                  <span>🎓 Ph.D. Exam & Rigor Mode</span>
                  {persona === 'phd' && <CheckCircle2 className="w-4 h-4 text-[#D946EF]" />}
                </p>
                <p className="text-[11px] text-[#94A3B8] font-sans mt-1">
                  Rigorous mathematical derivations, formal proof steps, and graduate-level academic citations.
                </p>
              </button>
            </div>
          </Tabs.Content>

          {/* OLLAMA LLM TAB */}
          <Tabs.Content value="ollama" className="focus:outline-none space-y-5">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading flex items-center gap-2">
                <span>Ollama AI Model & Endpoint Connection</span>
                <Badge variant="cyan">Local & Private LLM</Badge>
              </h2>
              <p className="text-[11px] text-[#94A3B8] font-mono mt-1">Connect the TeachMe assistant directly to your local or GPU server Ollama instance.</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <label htmlFor="settings-ollama-url" className="block text-white font-semibold">Ollama Server Base Endpoint</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Server className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    id="settings-ollama-url"
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    className="w-full bg-[#06060A]/80 border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#06B6D4]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleTestOllama}
                  disabled={testingOllama}
                  className="px-4 py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {testingOllama ? <RefreshCw className="w-4 h-4 animate-spin text-[#06B6D4]" /> : <Wifi className="w-4 h-4 text-[#06B6D4]" />}
                  <span>Test Endpoint</span>
                </button>
              </div>
            </div>

            {ollamaStatus && (
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono ${ollamaStatus.status === 'ONLINE' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'}`}>
                <div className="flex items-center gap-2">
                  {ollamaStatus.status === 'ONLINE' ? <CheckCircle2 className="w-4 h-4 text-[#10B981]" /> : <AlertTriangle className="w-4 h-4 text-[#EF4444]" />}
                  <span>{ollamaStatus.status === 'ONLINE' ? `Ollama Server Online (${ollamaStatus.latencyMs}ms latency | Version: ${ollamaStatus.version})` : ollamaStatus.message}</span>
                </div>
                <Badge variant={ollamaStatus.status === 'ONLINE' ? 'cyan' : 'outline'}>{ollamaStatus.status}</Badge>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-mono font-semibold text-white uppercase">Select Study AI Model</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ollamaModels.map((m) => {
                  const isSel = selectedOllamaModel === m.name;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setSelectedOllamaModel(m.name)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSel ? 'bg-gradient-to-r from-[#06B6D4]/15 to-[#3B82F6]/10 border-[#06B6D4] text-white cyan-glow font-bold' : 'bg-[#06060A]/80 border-white/5 text-[#94A3B8] hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className={`w-3.5 h-3.5 ${isSel ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`} />
                          {m.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#94A3B8] mt-0.5">Size: {m.sizeGb || 4.8} GB</p>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </Tabs.Content>

          {/* RAG TELEMETRY OBSERVABILITY TAB */}
          <Tabs.Content value="observability" className="focus:outline-none space-y-4">
            <RagObservabilityCard />
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
                    type="button"
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
                    type="button"
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
                  type="button"
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
                      type="button"
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
              type="button"
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
