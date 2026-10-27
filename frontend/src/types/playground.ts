export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  citations?: string[];
  tokens?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  updatedAt: string;
  isCustom?: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: string;
  isLocal?: boolean;
}

export interface PlaygroundParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarInitial: string;
}
