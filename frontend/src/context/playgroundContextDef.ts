import { createContext } from 'react';
import type {
  ChatSession,
  PromptTemplate,
  ModelOption,
  PlaygroundParameters,
  UserProfile
} from '../types/playground';

export interface PlaygroundContextType {
  chats: ChatSession[];
  currentChatId: string;
  currentChat: ChatSession | undefined;
  activeTab: 'playground' | 'templates' | 'knowledge' | 'settings';
  activeModel: string;
  selectedModelOption: ModelOption;
  parameters: PlaygroundParameters;
  templates: PromptTemplate[];
  promptInput: string;
  isStreaming: boolean;
  isSidebarOpen: boolean;
  isParametersOpen: boolean;
  userProfile: UserProfile;
  activeDocId: number | null;
  viewMode: 'landing' | 'app';
  
  setViewMode: (mode: 'landing' | 'app') => void;
  setActiveTab: (tab: 'playground' | 'templates' | 'knowledge' | 'settings') => void;
  setActiveModel: (modelId: string) => void;
  setPromptInput: (val: string) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsParametersOpen: (open: boolean) => void;
  setUserProfile: (profile: UserProfile) => void;
  setActiveDocId: (id: number | null) => void;
  
  updateParameters: (newParams: Partial<PlaygroundParameters>) => void;
  resetParameters: () => void;
  
  createNewChat: () => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  clearCurrentChat: () => void;
  
  runPrompt: (overridePrompt?: string) => Promise<void>;
  stopStreaming: () => void;
  
  saveAsTemplate: (template: Omit<PromptTemplate, 'id' | 'updatedAt'>) => void;
  deleteTemplate: (id: string) => void;
  applyTemplate: (template: PromptTemplate) => void;
}

export const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);
