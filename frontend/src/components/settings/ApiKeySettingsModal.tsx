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

  const currentProviderDefaults = DEFAULT_PROVIDER_MODELS[config.provider];

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
    }, 1200);
  };

  const handleClearKey = () => {
    setConfig((prev) => ({ ...prev, apiKey: '' }));
    setValidationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#13151b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans text-[#e5e7eb]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#15171c]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-lime-400/10 text-lime-400 rounded-lg border border-lime-400/20">
              <KeyIcon className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-[17px] font-sans font-bold text-white tracking-tight">AI Providers & Custom API Keys</h2>
              <p className="text-[12px] text-zinc-400">Bring your own API key or use 100% Free Local Ollama</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#878c99] hover:text-[#e5e7eb] hover:bg-[#1c1e21] rounded transition-colors cursor-pointer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Provider Selector Grid */}
          <div>
            <span className="block text-[13px] font-medium text-[#878c99] mb-2">Select AI Provider</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'ollama', label: 'Local Ollama', badge: 'Free / Offline' },
                { id: 'openai', label: 'OpenAI', badge: 'GPT-4o / o3' },
                { id: 'anthropic', label: 'Anthropic', badge: 'Claude 3.5' },
                { id: 'gemini', label: 'Google Gemini', badge: 'Flash / Pro' },
                { id: 'groq', label: 'Groq Cloud', badge: 'Ultra-Fast' },
                { id: 'deepseek', label: 'DeepSeek', badge: 'V3 / R1' },
                { id: 'openrouter', label: 'OpenRouter', badge: 'Multi-LLM' }
              ].map((p) => {
                const isSelected = config.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderSelect(p.id as AIProvider)}
                    className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1c1e21] border-[#a8ff53] text-[#a8ff53] shadow-sm shadow-[#a8ff53]/10'
                        : 'bg-[#15171c] border-[#272a2e] text-[#878c99] hover:border-[#3b3e45] hover:text-[#e5e7eb]'
                    }`}
                  >
                    <div className="text-[13px] font-semibold text-[#e5e7eb]">{p.label}</div>
                    <div className="text-[11px] text-[#878c99] font-['Geist_Mono']">{p.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input (if not Ollama) */}
          {config.provider !== 'ollama' ? (
            <div className="p-4 bg-[#15171c] border border-[#272a2e] rounded space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-api-key" className="text-[13px] font-medium text-[#e5e7eb] flex items-center gap-1.5 cursor-pointer">
                  <KeyIcon className="w-4 h-4 text-[#a8ff53]" weight="bold" />
                  <span>{config.provider.toUpperCase()} API Key</span>
                </label>
                <div className="flex items-center gap-2">
                  {config.apiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="text-[11px] text-[#ff6b6b] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Clear
                    </button>
                  )}
                  <span className="text-[11px] text-[#878c99] font-['Geist_Mono']">Stored in Browser localStorage</span>
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
                  className="w-full px-3 py-2 pr-20 bg-[#1c1e21] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb] font-['Geist_Mono'] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 px-2.5 py-1 text-[11px] bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] text-[#878c99] hover:text-[#e5e7eb] rounded cursor-pointer"
                >
                  {showKey ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-[#878c99] leading-relaxed">
                Your key remains strictly private in your browser client and is never logged or exposed to third parties.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-[#15171c] border border-[#272a2e] rounded space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="settings-ollama-url" className="text-[13px] font-semibold text-[#e5e7eb] cursor-pointer">
                  Local Ollama Daemon URL
                </label>
                <span className="text-[11px] text-[#a8ff53] font-['Geist_Mono'] bg-[#a8ff53]/10 px-2 py-0.5 rounded border border-[#a8ff53]/30">
                  Zero Cloud Cost
                </span>
              </div>
              <input
                id="settings-ollama-url"
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="w-full px-3 py-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb] font-['Geist_Mono'] focus:outline-none"
              />
            </div>
          )}

          {/* Model Selection & Custom Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="settings-preset-models" className="block text-[13px] font-medium text-[#878c99] mb-1.5 cursor-pointer">
                Preset Models
              </label>
              <select
                id="settings-preset-models"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb] font-['Geist_Mono'] focus:outline-none cursor-pointer"
              >
                {currentProviderDefaults.modelList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="settings-custom-model" className="block text-[13px] font-medium text-[#878c99] mb-1.5 cursor-pointer">
                Custom Model ID
              </label>
              <input
                id="settings-custom-model"
                type="text"
                value={config.model}
                onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. gpt-4o, deepseek-r1:8b"
                className="w-full px-3 py-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb] font-['Geist_Mono'] focus:outline-none"
              />
            </div>
          </div>

          {/* Hyperparameters (Temperature & Top-K) */}
          <div className="p-4 bg-[#15171c] border border-[#272a2e] rounded space-y-4">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#e5e7eb]">
              <SlidersIcon className="w-4 h-4 text-[#a8ff53]" />
              <span>Generation Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px]">
              <div>
                <div className="flex justify-between text-[#878c99] mb-1">
                  <label htmlFor="settings-temperature" className="cursor-pointer">
                    Temperature: <strong className="text-[#e5e7eb]">{config.temperature}</strong>
                  </label>
                  <span className="font-['Geist_Mono']">0 = Precise, 1 = Creative</span>
                </div>
                <input
                  id="settings-temperature"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={(e) => setConfig((prev) => ({ ...prev, temperature: Number.parseFloat(e.target.value) }))}
                  className="w-full accent-[#a8ff53]"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#878c99] mb-1">
                  <label htmlFor="settings-top-k" className="cursor-pointer">
                    Vector Top-K Chunks: <strong className="text-[#e5e7eb]">{config.topK}</strong>
                  </label>
                  <span className="font-['Geist_Mono']">Context Depth</span>
                </div>
                <input
                  id="settings-top-k"
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={config.topK}
                  onChange={(e) => setConfig((prev) => ({ ...prev, topK: Number.parseInt(e.target.value, 10) }))}
                  className="w-full accent-[#a8ff53]"
                />
              </div>
            </div>
          </div>

          {/* Connection Test Status Feedback */}
          {validationResult && (
            <div
              className={`p-3 rounded border text-[13px] flex items-center justify-between ${
                validationResult.success
                  ? 'bg-[#a8ff53]/10 border-[#a8ff53]/30 text-[#a8ff53]'
                  : 'bg-[#ff6b6b]/10 border-[#ff6b6b]/30 text-[#ff6b6b]'
              }`}
            >
              <div className="flex items-center gap-2">
                {validationResult.success ? <CheckIcon className="w-4 h-4" /> : <WarningCircleIcon className="w-4 h-4" />}
                <span>{validationResult.message}</span>
              </div>
              {validationResult.latencyMs !== undefined && (
                <span className="text-[11px] font-['Geist_Mono'] opacity-80">{validationResult.latencyMs}ms</span>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#272a2e] bg-[#15171c] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isValidating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1e21] hover:bg-[#272a2e] border border-[#272a2e] text-[#e5e7eb] text-[13px] font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowsClockwiseIcon className={`w-4 h-4 ${isValidating ? 'animate-spin text-[#a8ff53]' : ''}`} />
            <span>{isValidating ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-[13px] text-[#878c99] hover:text-[#e5e7eb] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#a8ff53] hover:bg-[#b8ff70] text-[#121317] font-semibold text-[13px] rounded transition-colors shadow-sm cursor-pointer"
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
