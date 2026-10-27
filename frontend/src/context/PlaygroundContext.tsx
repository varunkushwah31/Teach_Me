import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ChatMessage,
  ChatSession,
  PromptTemplate,
  PlaygroundParameters,
  UserProfile
} from '../types/playground';
import {
  AVAILABLE_MODELS,
  DEFAULT_PARAMETERS,
  INITIAL_TEMPLATES
} from '../constants/playground';
import { PlaygroundContext } from './playgroundContextDef';
import { TeachMeAPI } from '../services/teachMeService';
import { getStoredAIConfig, saveStoredAIConfig } from '../services/aiConfigService';

const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat-demo-1',
    title: 'History item',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-u1',
        role: 'user',
        content: 'Hi',
        timestamp: '1:34:23 pm'
      },
      {
        id: 'msg-a1',
        role: 'assistant',
        model: 'gpt-4',
        timestamp: '1:34:23 pm',
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu. Curabitur pellentesque nibh nibh, at maximus ante fermentum sit amet.

Pellentesque commodo lacus at sodales sodales. Quisque sagittis orci ut diam condimentum, vel euismod erat placerat.

In iaculis arcu eros, eget tempus orci facilisis id. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Nullam quis imperdiet augue. Vestibulum auctor ornare leo, non suscipit magna interdum eu.`
      }
    ]
  },
  {
    id: 'chat-demo-2',
    title: 'History item',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: []
  },
  {
    id: 'chat-demo-3',
    title: 'History item',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    messages: []
  }
];

export const PlaygroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('fox_chats');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_CHATS;
  });

  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return chats[0]?.id || 'chat-demo-1';
  });

  const [activeTab, setActiveTab] = useState<'playground' | 'templates' | 'knowledge' | 'settings'>('playground');
  
  const [activeModel, setActiveModel] = useState<string>(() => {
    const aiConfig = getStoredAIConfig();
    if (aiConfig.provider === 'openai' && aiConfig.model) return aiConfig.model;
    return 'gpt-4';
  });

  const [parameters, setParameters] = useState<PlaygroundParameters>(() => {
    try {
      const saved = localStorage.getItem('fox_parameters');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_PARAMETERS;
  });

  const [templates, setTemplates] = useState<PromptTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('fox_templates');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_TEMPLATES;
  });

  const [promptInput, setPromptInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isParametersOpen, setIsParametersOpen] = useState(true);
  const [activeDocId, setActiveDocId] = useState<number | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fox_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return {
      name: 'Baliram Kumar',
      email: 'baliramk505@gmail.com',
      avatarInitial: 'B'
    };
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('fox_chats', JSON.stringify(chats));
    } catch (e) {
      console.warn('Failed to save chats to storage', e);
    }
  }, [chats]);

  useEffect(() => {
    try {
      localStorage.setItem('fox_parameters', JSON.stringify(parameters));
    } catch (e) {
      console.warn('Failed to save parameters', e);
    }
  }, [parameters]);

  useEffect(() => {
    try {
      localStorage.setItem('fox_templates', JSON.stringify(templates));
    } catch (e) {
      console.warn('Failed to save templates', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem('fox_user_profile', JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }, [userProfile]);

  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const selectedModelOption = AVAILABLE_MODELS.find(m => m.id === activeModel) || AVAILABLE_MODELS[0];

  const updateParameters = useCallback((newParams: Partial<PlaygroundParameters>) => {
    setParameters(prev => {
      const updated = { ...prev, ...newParams };
      if (newParams.temperature !== undefined) {
        const conf = getStoredAIConfig();
        saveStoredAIConfig({ ...conf, temperature: newParams.temperature });
      }
      return updated;
    });
  }, []);

  const resetParameters = useCallback(() => {
    setParameters(DEFAULT_PARAMETERS);
    const conf = getStoredAIConfig();
    saveStoredAIConfig({ ...conf, temperature: DEFAULT_PARAMETERS.temperature });
  }, []);

  const createNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setChats(prev => [newSession, ...prev]);
    setCurrentChatId(newId);
    setPromptInput('');
    setActiveTab('playground');
    return newId;
  }, []);

  const selectChat = useCallback((id: string) => {
    setCurrentChatId(id);
    setActiveTab('playground');
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const freshId = `chat-${Date.now()}`;
        return [{
          id: freshId,
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
      }
      return filtered;
    });
    if (currentChatId === id) {
      setChats(latest => {
        setCurrentChatId(latest[0]?.id || 'chat-demo-1');
        return latest;
      });
    }
  }, [currentChatId]);

  const renameChat = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle.trim(), updatedAt: new Date().toISOString() } : c));
  }, []);

  const clearCurrentChat = useCallback(() => {
    if (!currentChatId) return;
    setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [], updatedAt: new Date().toISOString() } : c));
  }, [currentChatId]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const runPrompt = useCallback(async (overridePrompt?: string) => {
    const textToRun = (overridePrompt !== undefined ? overridePrompt : promptInput).trim();
    if (!textToRun || isStreaming) return;

    let targetChatId = currentChatId;
    if (!targetChatId) {
      targetChatId = createNewChat();
    }

    const userTimestamp = formatTimestamp();
    const userMsgId = `msg-u-${Date.now()}`;
    const assistantMsgId = `msg-a-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToRun,
      timestamp: userTimestamp
    };

    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      model: selectedModelOption.name.toLowerCase(),
      content: '',
      timestamp: userTimestamp
    };

    setChats(prev => prev.map(c => {
      if (c.id === targetChatId) {
        const isFirstMessage = c.messages.length === 0;
        const newTitle = isFirstMessage ? (textToRun.slice(0, 24) || 'New Conversation') : c.title;
        return {
          ...c,
          title: newTitle,
          messages: [...c.messages, userMessage, assistantMessage],
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));

    setPromptInput('');
    setIsStreaming(true);

    try {
      const docIds = activeDocId ? [activeDocId] : [101];
      await TeachMeAPI.chat.streamQuestion(
        textToRun,
        targetChatId,
        docIds,
        (token: string) => {
          setChats(prev => prev.map(c => {
            if (c.id === targetChatId) {
              const updatedMsgs = c.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return { ...m, content: m.content + token };
                }
                return m;
              });
              return { ...c, messages: updatedMsgs };
            }
            return c;
          }));
        }
      );
    } catch {
      const fallbackResponse = `Here is a structured explanation based on your parameters (Temperature: ${parameters.temperature}, Model: ${selectedModelOption.name}):\n\n` +
        `### Analysis of "${textToRun.slice(0, 40)}"\n\n` +
        `In computer science and modern systems architecture, this question connects to foundational principles of algorithmic efficiency and clean state design.\n\n` +
        `\`\`\`typescript\n` +
        `// Example implementation pattern\n` +
        `export function evaluateContext(input: string, temp = ${parameters.temperature}): Result {\n` +
        `  const normalized = input.trim();\n` +
        `  return { status: "SUCCESS", value: normalized };\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `1. **Determinism vs Creativity**: With temperature at ${parameters.temperature}, completions remain balanced between creative insight and factual stability.\n` +
        `2. **Execution Context**: This response was generated in demonstration mode with ${selectedModelOption.name}.\n\n` +
        `Let me know if you would like to adjust parameters or explore subtopics in more detail.`;

      setChats(prev => prev.map(c => {
        if (c.id === targetChatId) {
          const updatedMsgs = c.messages.map(m => {
            if (m.id === assistantMsgId) {
              return { ...m, content: fallbackResponse };
            }
            return m;
          });
          return { ...c, messages: updatedMsgs };
        }
        return c;
      }));
    } finally {
      setIsStreaming(false);
    }
  }, [promptInput, isStreaming, currentChatId, createNewChat, selectedModelOption, activeDocId, parameters]);

  const saveAsTemplate = useCallback((tpl: Omit<PromptTemplate, 'id' | 'updatedAt'>) => {
    const newTemplate: PromptTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      updatedAt: 'Updated just now',
      isCustom: true
    };
    setTemplates(prev => [newTemplate, ...prev]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const applyTemplate = useCallback((template: PromptTemplate) => {
    setPromptInput(template.prompt);
    setActiveTab('playground');
  }, []);

  return (
    <PlaygroundContext.Provider
      value={{
        chats,
        currentChatId,
        currentChat,
        activeTab,
        activeModel,
        selectedModelOption,
        parameters,
        templates,
        promptInput,
        isStreaming,
        isSidebarOpen,
        isParametersOpen,
        userProfile,
        activeDocId,
        setActiveTab,
        setActiveModel,
        setPromptInput,
        setIsSidebarOpen,
        setIsParametersOpen,
        setUserProfile,
        setActiveDocId,
        updateParameters,
        resetParameters,
        createNewChat,
        selectChat,
        deleteChat,
        renameChat,
        clearCurrentChat,
        runPrompt,
        stopStreaming,
        saveAsTemplate,
        deleteTemplate,
        applyTemplate
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};
