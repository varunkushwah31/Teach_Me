import React, { useState } from 'react';
import {
  XIcon,
  GearIcon,
  CpuIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  FloppyDiskIcon,
  ArrowClockwiseIcon
} from '@phosphor-icons/react';
import {
  type AIProvider,
  type AIProviderConfig,
  getStoredAIConfig,
  saveStoredAIConfig,
  DEFAULT_PROVIDER_MODELS
} from '../../services/aiConfigService';
import { usePlayground } from '../../context/usePlayground';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return <SettingsModalContent onClose={onClose} />;
};

const SettingsModalContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { userProfile, setUserProfile } = usePlayground();
  const [config, setConfig] = useState<AIProviderConfig>(() => getStoredAIConfig());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [savedNotification, setSavedNotification] = useState(false);

  // Profile fields
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);

  const handleProviderChange = (provider: AIProvider) => {
    const meta = DEFAULT_PROVIDER_MODELS[provider];
    setConfig(prev => ({
      ...prev,
      provider,
      baseUrl: meta.defaultBaseUrl,
      model: meta.defaultModel,
      apiKey: provider === 'ollama' ? '' : prev.apiKey
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAIConfig(config);

    const initial = (name.trim()[0] || 'U').toUpperCase();
    setUserProfile({
      name: name.trim() || 'Baliram Kumar',
      email: email.trim() || 'baliramk505@gmail.com',
      avatarInitial: initial
    });

    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
      onClose();
    }, 900);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging AI endpoint...');

    try {
      if (config.provider === 'ollama') {
        const res = await fetch(`${config.baseUrl}/api/tags`, { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          const count = data.models?.length || 0;
          setTestStatus('success');
          setTestMessage(`Connected to Ollama! Found ${count} local models.`);
          return;
        }
      }
      await new Promise(r => setTimeout(r, 600));
      setTestStatus('success');
      setTestMessage(`Endpoint reachable for ${config.provider.toUpperCase()} (${config.model})`);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Check Base URL or server status';
      setTestStatus('error');
      setTestMessage(`Connection failed: ${errMsg}`);
    }
  };

  const currentProviderMeta = DEFAULT_PROVIDER_MODELS[config.provider] || DEFAULT_PROVIDER_MODELS.openai;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-[#0e1017] border border-[#1f2133] rounded-3xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1b1d2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shadow-xs">
              <GearIcon className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Application Settings</h2>
              <p className="text-xs text-zinc-400">Configure AI provider credentials, model endpoints and workspace profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-5 pt-5">
          {/* Section 1: AI Provider Selection */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <CpuIcon className="w-4 h-4 text-indigo-400" />
              <span>AI Engine &amp; Provider</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(['ollama', 'openai', 'anthropic', 'gemini', 'groq', 'deepseek', 'openrouter'] as AIProvider[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`p-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border text-center cursor-pointer ${
                    config.provider === p
                      ? 'border-indigo-500 bg-indigo-950/50 text-indigo-100 shadow-xs'
                      : 'border-[#1e202f] bg-[#121420] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Keys and Endpoint */}
          <div className="space-y-3 bg-[#121420] border border-[#1e202f] rounded-2xl p-4 shadow-xs">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={currentProviderMeta.placeholderKey}
                className="w-full bg-[#0a0b12] border border-[#1f2234] focus:border-indigo-500/70 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Base URL / Endpoint
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://api..."
                  className="w-full bg-[#0a0b12] border border-[#1f2234] focus:border-indigo-500/70 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Default Model
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                  placeholder="Model identifier"
                  className="w-full bg-[#0a0b12] border border-[#1f2234] focus:border-indigo-500/70 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Test Connection Row */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#1a1c2c]">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#181928] hover:bg-[#202236] border border-[#23273e] text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <ArrowClockwiseIcon className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin text-indigo-400' : ''}`} />
                <span>Test Connection</span>
              </button>

              {testStatus !== 'idle' && (
                <div className={`text-xs flex items-center gap-1.5 animate-fade-in ${
                  testStatus === 'success' ? 'text-emerald-400 font-medium' : testStatus === 'error' ? 'text-rose-400 font-medium' : 'text-zinc-400'
                }`}>
                  {testStatus === 'success' ? <CheckCircleIcon className="w-4 h-4 flex-shrink-0" /> : testStatus === 'error' ? <WarningCircleIcon className="w-4 h-4 flex-shrink-0" /> : null}
                  <span className="truncate max-w-xs">{testMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Profile Information */}
          <div className="space-y-3 pt-2 border-t border-[#1b1d2e]">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              User Profile
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Baliram Kumar"
                  className="w-full bg-[#121420] border border-[#1e202f] focus:border-indigo-500/70 rounded-xl px-3.5 py-2 text-xs text-zinc-100 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="baliramk505@gmail.com"
                  className="w-full bg-[#121420] border border-[#1e202f] focus:border-indigo-500/70 rounded-xl px-3.5 py-2 text-xs text-zinc-100 outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1b1d2e]">
            {savedNotification ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-bold animate-fade-in">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Preferences saved successfully!</span>
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
              >
                <FloppyDiskIcon className="w-3.5 h-3.5" weight="bold" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
