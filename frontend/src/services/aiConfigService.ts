export type AIProvider = 'ollama' | 'openai' | 'anthropic' | 'gemini' | 'groq' | 'deepseek' | 'openrouter';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  topK: number;
  maxTokens?: number;
}

export const DEFAULT_PROVIDER_MODELS: Record<AIProvider, { defaultModel: string; defaultBaseUrl: string; placeholderKey: string; modelList: string[] }> = {
  ollama: {
    defaultModel: 'deepseek-r1:8b',
    defaultBaseUrl: 'http://localhost:11434',
    placeholderKey: 'Not required for local Ollama',
    modelList: ['deepseek-r1:8b', 'llama3.3:latest', 'mistral:latest', 'phi4:latest', 'qwen2.5:latest', 'nomic-embed-text:latest']
  },
  openai: {
    defaultModel: 'gpt-4o-mini',
    defaultBaseUrl: 'https://api.openai.com/v1',
    placeholderKey: 'sk-proj-••••••••••••••••••••••••',
    modelList: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-4-turbo']
  },
  anthropic: {
    defaultModel: 'claude-3-5-sonnet-20241022',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    placeholderKey: 'sk-ant-••••••••••••••••••••••••',
    modelList: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229']
  },
  gemini: {
    defaultModel: 'gemini-2.0-flash',
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    placeholderKey: 'AIzaSy••••••••••••••••••••••••',
    modelList: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']
  },
  groq: {
    defaultModel: 'llama-3.3-70b-versatile',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    placeholderKey: 'gsk_••••••••••••••••••••••••',
    modelList: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b', 'mixtral-8x7b-32768', 'gemma2-9b-it']
  },
  deepseek: {
    defaultModel: 'deepseek-chat',
    defaultBaseUrl: 'https://api.deepseek.com/v1',
    placeholderKey: 'sk-••••••••••••••••••••••••',
    modelList: ['deepseek-chat', 'deepseek-reasoner']
  },
  openrouter: {
    defaultModel: 'deepseek/deepseek-r1',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    placeholderKey: 'sk-or-••••••••••••••••••••••••',
    modelList: ['deepseek/deepseek-r1', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini', 'meta-llama/llama-3.3-70b-instruct']
  }
};

const STORAGE_KEY = 'teachme_user_ai_config';

export const DEFAULT_AI_CONFIG: AIProviderConfig = {
  provider: 'ollama',
  apiKey: '',
  baseUrl: 'http://localhost:11434',
  model: 'deepseek-r1:8b',
  temperature: 0.7,
  topK: 5
};

export function getStoredAIConfig(): AIProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_AI_CONFIG };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_AI_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_AI_CONFIG };
  }
}

export function saveStoredAIConfig(config: AIProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('teachme_ai_config_updated', { detail: config }));
  } catch (err) {
    console.warn('Failed to save AI configuration to localStorage:', err);
  }
}

function getProviderModelsEndpoint(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1/models';
    case 'groq':
      return 'https://api.groq.com/openai/v1/models';
    case 'deepseek':
      return 'https://api.deepseek.com/v1/models';
    default:
      return 'https://openrouter.ai/api/v1/models';
  }
}

async function validateOllama(baseUrl?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const rawUrl = baseUrl || 'http://localhost:11434';
    const cleanUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const res = await fetch(`${cleanUrl}/api/version`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      return { success: true, message: `Ollama daemon online (v${json.version || 'latest'})`, latencyMs: Date.now() - start };
    }
    return { success: false, message: `Ollama returned HTTP ${res.status}` };
  } catch {
    return { success: false, message: 'Could not connect to Ollama daemon at URL.' };
  }
}

async function validateBearerProvider(provider: AIProvider, apiKey: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  const endpoint = getProviderModelsEndpoint(provider);
  const res = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${apiKey.trim()}` },
    signal: AbortSignal.timeout(5000)
  });
  if (res.ok) {
    return { success: true, message: `${provider.toUpperCase()} API key validated successfully!`, latencyMs: Date.now() - start };
  }
  return { success: false, message: `Validation failed: HTTP ${res.status} (${res.statusText})` };
}

async function validateGeminiKey(apiKey: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const start = Date.now();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`, {
    signal: AbortSignal.timeout(5000)
  });
  if (res.ok) {
    return { success: true, message: 'Google Gemini API key validated successfully!', latencyMs: Date.now() - start };
  }
  return { success: false, message: `Validation failed: HTTP ${res.status}` };
}

function validateAnthropicKey(apiKey: string): { success: boolean; message: string; latencyMs?: number } {
  if (apiKey.startsWith('sk-ant-')) {
    return { success: true, message: 'Anthropic API key format verified.', latencyMs: 1 };
  }
  return { success: false, message: 'Anthropic API keys typically start with sk-ant-' };
}

export async function validateProviderKey(provider: AIProvider, apiKey: string, baseUrl?: string): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  if (provider === 'ollama') {
    return validateOllama(baseUrl);
  }

  if (!apiKey || apiKey.trim().length < 8) {
    return { success: false, message: 'API key is too short or empty.' };
  }

  try {
    if (provider === 'openai' || provider === 'groq' || provider === 'deepseek' || provider === 'openrouter') {
      return await validateBearerProvider(provider, apiKey);
    }
    if (provider === 'gemini') {
      return await validateGeminiKey(apiKey);
    }
    if (provider === 'anthropic') {
      return validateAnthropicKey(apiKey);
    }
    return { success: true, message: 'API key saved.' };
  } catch (err: unknown) {
    const e = err as Error;
    return { success: false, message: `Connection test error: ${e.message}` };
  }
}
