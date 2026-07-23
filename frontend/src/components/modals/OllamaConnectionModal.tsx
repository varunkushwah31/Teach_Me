import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Cpu, RefreshCw, CheckCircle2, AlertTriangle, Wifi, Server, Sparkles } from 'lucide-react';

interface Props {
  activeModel: string;
  activeBaseUrl?: string;
  onClose: () => void;
  onSelectModel: (modelName: string, baseUrl: string) => void;
}

export const OllamaConnectionModal: React.FC<Props> = ({
  activeModel,
  activeBaseUrl = 'http://localhost:11434',
  onClose,
  onSelectModel,
}) => {
  const [baseUrl, setBaseUrl] = useState(activeBaseUrl);
  const [selectedModel, setSelectedModel] = useState(activeModel);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('http://localhost:8081/api/ollama/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('teachme_jwt_token') || ''}`,
        },
        body: JSON.stringify({ baseUrl }),
      });
      const data = await res.json();
      setConnectionStatus(data);
      if (data.status === 'ONLINE') {
        fetchModels(baseUrl);
      }
    } catch (err: any) {
      setConnectionStatus({
        status: 'OFFLINE',
        message: 'Network request failed. Is the Spring Boot backend running?',
      });
    } finally {
      setTesting(false);
    }
  };

  const fetchModels = async (targetUrl: string) => {
    setLoadingModels(true);
    try {
      const res = await fetch(`http://localhost:8081/api/ollama/models?baseUrl=${encodeURIComponent(targetUrl)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('teachme_jwt_token') || ''}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setModels(data);
      }
    } catch (err) {
      console.error('Failed to fetch Ollama models', err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  const handleSave = () => {
    onSelectModel(selectedModel, baseUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#06B6D4]/40 shadow-2xl bg-[#0D0D17]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Ollama Connection Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 text-[#06B6D4] cyan-glow">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Connect Local / Remote Ollama Server</span>
              <Badge variant="cyan">Custom LLM Engine</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA]">Configure custom Ollama host endpoints for private AI studying & RAG retrieval.</p>
          </div>
        </div>

        {/* Server Endpoint Setup */}
        <div className="space-y-2">
          <label htmlFor="ollama-host-input" className="block text-xs font-mono uppercase font-semibold text-[#A1A1AA]">
            Ollama Endpoint URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Server className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                id="ollama-host-input"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#06B6D4] font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {testing ? <RefreshCw className="w-4 h-4 animate-spin text-[#06B6D4]" /> : <Wifi className="w-4 h-4 text-[#06B6D4]" />}
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>

        {/* Connection Status Indicator */}
        {connectionStatus && (
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
              connectionStatus.status === 'ONLINE'
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
            }`}
          >
            <div className="flex items-center gap-2">
              {connectionStatus.status === 'ONLINE' ? (
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              )}
              <span className="font-bold">
                {connectionStatus.status === 'ONLINE'
                  ? `Connected (Latency: ${connectionStatus.latencyMs}ms | Daemon: ${connectionStatus.version})`
                  : connectionStatus.message}
              </span>
            </div>
            <Badge variant={connectionStatus.status === 'ONLINE' ? 'cyan' : 'outline'}>
              {connectionStatus.status}
            </Badge>
          </div>
        )}

        {/* Available Installed Models Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-semibold text-[#A1A1AA]">
              Installed Models on Ollama Server ({models.length})
            </span>
            {loadingModels && <span className="text-[10px] text-[#06B6D4] animate-pulse">Scanning GGUF tags...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
            {models.map((m) => {
              const isSelected = selectedModel === m.name;
              return (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => setSelectedModel(m.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#06B6D4]/15 to-[#3B82F6]/10 border-[#06B6D4] text-white cyan-glow'
                      : 'bg-[#0F0F0F] border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-white'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-[#06B6D4]' : 'text-[#A1A1AA]'}`} />
                      {m.name}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-0.5">Size: {m.sizeGb || '4.8'} GB</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#06B6D4] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#27272A]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] hover:opacity-95 text-white text-xs font-bold rounded-xl cyan-glow"
          >
            Apply & Connect Model
          </button>
        </div>
      </Card>
    </div>
  );
};
