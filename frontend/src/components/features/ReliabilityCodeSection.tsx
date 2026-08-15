import React, { useState } from 'react';
import { Sliders, Key, Check, Copy } from 'lucide-react';

export const ReliabilityCodeSection: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'ollama' | 'custom-api'>('ollama');
  const [copied, setCopied] = useState(false);

  const OLLAMA_SNIPPET = `# 100% Private Local Study Mode with Ollama
# Run completely offline with zero data leaving your machine

# Step 1: Start Ollama on your machine
ollama run llama3.3:latest

# Step 2: In TeachMe Studio Settings:
Ollama Endpoint: http://localhost:11434
Selected Model:  llama3.3:latest (or deepseek-r1:8b)
Embedding Model: nomic-embed-text:latest

# Zero Cloud Token Costs • 100% Student Privacy`;

  const API_KEY_SNIPPET = `# Custom Cloud LLM Mode with Student API Keys
# Connect your favorite frontier reasoning models

# Enter your preferred provider in TeachMe Settings:
Provider:        OpenAI / Anthropic / Google Gemini / Groq
API Key:         sk-live-••••••••••••••••••••••••••••
Selected Model:  gpt-4o-mini / claude-3-5-sonnet / gemini-1.5-pro

# Direct Client-to-Provider Streaming • No Middleman Markups`;

  const codeToShow = activeMode === 'ollama' ? OLLAMA_SNIPPET : API_KEY_SNIPPET;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeToShow);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 border-t border-[#272a2e] bg-[#1c1e21] font-['Geist']">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#a8ff53] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <Sliders className="w-3.5 h-3.5" />
              <span>Student-Controlled AI Infrastructure</span>
            </div>
            <h2 className="font-['Satoshi'] font-bold text-[32px] sm:text-[38px] text-[#e5e7eb] mb-3">
              Run 100% Free Locally with Ollama or Bring Your Own API Keys
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#878c99] max-w-[640px] leading-[1.58]">
              You have complete ownership of your study data. Run quantized Llama 3.3 and DeepSeek R1 offline on your laptop, or plug in your own API keys for cloud frontier models.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button
              onClick={() => setActiveMode('ollama')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                activeMode === 'ollama'
                  ? 'bg-[#272a2e] text-[#a8ff53] font-medium border border-[#3b3e45]'
                  : 'text-[#878c99] hover:text-[#e5e7eb]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Local Ollama (Free)</span>
            </button>
            <button
              onClick={() => setActiveMode('custom-api')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[13px] transition-colors cursor-pointer ${
                activeMode === 'custom-api'
                  ? 'bg-[#272a2e] text-[#a8ff53] font-medium border border-[#3b3e45]'
                  : 'text-[#878c99] hover:text-[#e5e7eb]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-[#9c9af2]" />
              <span>Custom API Keys</span>
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="bg-[#121317] border border-[#272a2e] rounded-[4px] shadow-2xl overflow-hidden">
          
          <div className="px-4 py-3 bg-[#15171c] border-b border-[#272a2e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a8ff53]" />
              <span className="text-[12px] font-['Geist_Mono'] text-[#878c99]">
                {activeMode === 'ollama' ? 'ollama-local-config.sh' : 'custom-api-key-config.env'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[12px] text-[#878c99] hover:text-[#e5e7eb] px-2 py-1 rounded hover:bg-[#272a2e] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#a8ff53]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-6 bg-[#121317] overflow-x-auto font-['Geist_Mono'] text-[13.5px] leading-[1.7]">
            <pre className="text-[#d7d9dd]">
              <code>{codeToShow}</code>
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
};
