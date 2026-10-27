import type { ModelOption, PlaygroundParameters, PromptTemplate } from '../types/playground';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'High-intelligence flagship reasoning model for complex questions and analytical tasks.',
    contextWindow: '128k tokens'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Fast, lightweight and cost-effective model for everyday assistance.',
    contextWindow: '128k tokens'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Exceptional reasoning, nuanced writing, and advanced coding performance.',
    contextWindow: '200k tokens'
  },
  {
    id: 'gemini-2-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Ultra-fast multimodal reasoning engine optimized for rapid responses.',
    contextWindow: '1M tokens'
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek-R1',
    provider: 'Ollama',
    description: 'High-performance open-weights reasoning model running on local or remote cluster.',
    contextWindow: '64k tokens',
    isLocal: true
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Groq',
    description: 'Lightning-fast open architecture model served via Groq LPU inference engine.',
    contextWindow: '128k tokens'
  }
];

export const DEFAULT_PARAMETERS: PlaygroundParameters = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  systemPrompt: 'You are an intelligent, precise, and helpful AI assistant specialized in computer science, software engineering, and technical problem-solving.'
};

export const INITIAL_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tpl-1',
    title: "Explain Like I'm Five",
    description: 'Explain complex topics in simple terms that anyone can understand.',
    prompt: 'Please explain the following concept as if I am five years old, using a clear relatable analogy and avoiding unnecessary technical jargon:\n\n[Concept]',
    category: 'Education',
    updatedAt: 'Updated 1 week ago'
  },
  {
    id: 'tpl-2',
    title: 'Code Review & Optimizer',
    description: 'Analyze code snippets for bugs, algorithmic complexity, and idiomatic improvements.',
    prompt: 'Review the following code block for potential security vulnerabilities, time/space complexity bottlenecks, and style improvements:\n\n```\n[Insert code here]\n```',
    category: 'Engineering',
    updatedAt: 'Updated 3 days ago'
  },
  {
    id: 'tpl-3',
    title: 'Socratic Tutor',
    description: 'Guide the user to discover solutions step-by-step through probing questions.',
    prompt: 'Act as a Socratic mentor. Do not give the direct answer immediately. Instead, guide me through structured reasoning and questions for the following question:\n\n[Topic/Question]',
    category: 'Education',
    updatedAt: 'Updated 5 days ago'
  },
  {
    id: 'tpl-4',
    title: 'System Design Architect',
    description: 'Draft high-level architecture designs, database schemas, and microservice topologies.',
    prompt: 'Design a distributed, highly available system architecture for the following requirements:\n- Problem: [System Requirement]\n- Scale: [Expected Traffic]\n- Key constraints: [Latency/Storage]',
    category: 'Architecture',
    updatedAt: 'Updated 1 week ago'
  }
];
