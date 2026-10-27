import React, { useState } from 'react';
import {
  XIcon,
  KeyIcon,
  CheckIcon,
  WarningCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsClockwiseIcon,
  SlidersIcon,
  TrashIcon
} from '@phosphor-icons/react';
import {
  type AIProvider,
  type AIProviderConfig,
  DEFAULT_PROVIDER_MODELS,
  getStoredAIConfig,
  saveStoredAIConfig,
  validateProviderKey
} from '@/services/aiConfigService.ts';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeySettingsModalContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [config, setConfig] = useState<AIProviderConfig>(getStoredAIConfig);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentProviderDefaults = DEFAULT_PROVIDER_MODELS[config.provider] || DEFAULT_PROVIDER_MODELS.openai;

  const handleProviderSelect = (provider: AIProvider) => {
    const defaults = DEFAULT_PROVIDER_MODELS[provider];
    setConfig((prev) => ({
      ...prev,
      provider,
      baseUrl: defaults.defaultBaseUrl,
      model: defaults.defaultModel
    }));
    setValidationResult(null);
  };

  const handleTestConnection = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      const result = await validateProviderKey(config.provider, config.apiKey, config.baseUrl);
      setValidationResult(result);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    saveStoredAIConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleClearKey = () => {
    setConfig((prev) => ({ ...prev, apiKey: '' }));
    setValidationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#0e1017] border border-[#1f2133] rounded-3xl shadow-2xl overflow-hidden font-sans text-zinc-100 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1c1f2e] bg-[#0c0d13]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <KeyIcon className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">AI Providers &amp; Gateway Keys</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Bring your custom API credentials or run local Ollama inference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#161826] rounded-lg transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Provider Selector Grid */}
          <div>
            <span className="block text-xs font-semibold text-zinc-300 mb-2.5">Select AI Provider</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ollama', label: 'Local Ollama', badge: 'Free / Local' },
                { id: 'openai', label: 'OpenAI', badge: 'GPT-4o / o3' },
                { id: 'anthropic', label: 'Anthropic', badge: 'Claude 3.5' },
                { id: 'gemini', label: 'Google Gemini', badge: 'Flash / Pro' },
                { id: 'groq', label: 'Groq Cloud', badge: 'LPU Speed' },
                { id: 'deepseek', label: 'DeepSeek', badge: 'V3 / R1' },
                { id: 'openrouter', label: 'OpenRouter', badge: 'Multi-LLM' }
              ].map((p) => {
                const isSelected = config.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderSelect(p.id as AIProvider)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/80 text-white shadow-xs'
                        : 'bg-[#141622] border-[#1c1f2e] text-zinc-400 hover:border-[#282c40] hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-zinc-100">{p.label}</div>
                    <div className="text-xs text-indigo-400 font-mono mt-0.5">{p.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input (if not Ollama) */}
          {config.provider !== 'ollama' ? (
            <div className="p-4 bg-[#141622] border border-[#1c1f2e] rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-api-key" className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                  <KeyIcon className="w-4 h-4 text-indigo-400" weight="bold" />
                  <span>{config.provider.toUpperCase()} API Key</span>
                </label>
                <div className="flex items-center gap-2">
                  {config.apiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                  <span className="text-xs text-zinc-400 font-mono">Local storage encrypted</span>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  id="settings-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => {
                    setConfig((prev) => ({ ...prev, apiKey: e.target.value }));
                    setValidationResult(null);
                  }}
                  placeholder={currentProviderDefaults.placeholderKey}
                  className="w-full px-3.5 py-2.5 pr-20 bg-[#0e1017] border border-[#222436] rounded-xl text-xs text-zinc-100 font-mono focus:border-indigo-500/70 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 px-2.5 py-1 text-xs bg-[#141622] border border-[#282c40] hover:border-indigo-500/50 text-zinc-400 hover:text-white rounded-lg cursor-pointer"
                >
                  {showKey ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Your key remains strictly private in your browser client and is never logged or exposed to third parties.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#141622] border border-[#1c1f2e] rounded-2xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-ollama-url" className="text-xs font-semibold text-zinc-200 cursor-pointer">
                  Local Ollama Daemon URL
                </label>
                <span className="text-xs text-emerald-300 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Zero Cloud Cost
                </span>
              </div>
              <input
                id="settings-ollama-url"
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#222436] rounded-xl text-xs text-zinc-100 font-mono focus:border-indigo-500/70 focus:outline-none"
              />
            </div>
          )}

          {/* Model Selection & Custom Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-preset-models" className="block text-xs font-semibold text-zinc-300 mb-1.5 cursor-pointer">
                Preset Models
              </label>
              <select
                id="settings-preset-models"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#141622] border border-[#1c1f2e] rounded-xl text-xs text-zinc-100 font-mono focus:border-indigo-500/70 focus:outline-none cursor-pointer"
              >
                {currentProviderDefaults.modelList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-custom-model" className="block text-xs font-semibold text-zinc-300 mb-1.5 cursor-pointer">
                Custom Model ID
              </label>
              <input
                id="settings-custom-model"
                type="text"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. gpt-4o, deepseek-r1:8b"
                className="w-full px-3.5 py-2.5 bg-[#141622] border border-[#1c1f2e] rounded-xl text-xs text-zinc-100 font-mono focus:border-indigo-500/70 focus:outline-none"
              />
            </div>
          </div>

          {/* Hyperparameters (Temperature & Top-K) */}
          <div className="p-4 bg-[#141622] border border-[#1c1f2e] rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
              <SlidersIcon className="w-4 h-4 text-indigo-400" />
              <span>Generation Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-zinc-400 mb-1.5">
                  <label htmlFor="settings-temperature" className="cursor-pointer">
                    Temperature: <strong className="text-white font-mono">{config.temperature}</strong>
                  </label>
                  <span className="font-mono text-zinc-400">0.0 to 1.0</span>
                </div>
                <input
                  id="settings-temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-400 mb-1.5">
                  <label htmlFor="settings-top-k" className="cursor-pointer">
                    Vector Top-K Chunks: <strong className="text-white font-mono">{config.topK}</strong>
                  </label>
                  <span className="font-mono text-zinc-400">Context Depth</span>
                </div>
                <input
                  id="settings-top-k"
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={config.topK}
                  onChange={(e) => setConfig((prev) => ({ ...prev, topK: Number.parseInt(e.target.value, 10) }))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Connection Test Status Feedback */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                validationResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {validationResult.success ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <WarningCircleIcon className="w-4 h-4 text-rose-400" />}
                <span>{validationResult.message}</span>
              </div>
              {validationResult.latencyMs !== undefined && (
                <span className="text-xs font-mono opacity-80">{validationResult.latencyMs}ms</span>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1c1f2e] bg-[#0c0d13] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isValidating}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141622] hover:bg-[#1a1d2e] border border-[#222436] hover:border-indigo-500/40 text-zinc-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <ArrowsClockwiseIcon className={`w-4 h-4 ${isValidating ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isValidating ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs border border-indigo-400/30 cursor-pointer active:scale-95"
            >
              {saveSuccess ? <CheckIcon className="w-4 h-4" weight="bold" /> : null}
              <span>{saveSuccess ? 'Saved!' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return <ApiKeySettingsModalContent onClose={onClose} />;
};
