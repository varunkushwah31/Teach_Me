import { useState, useEffect, useCallback } from 'react';
import { streamChatResponse, citationApi } from '../lib/apiClient';

export interface CitationItem {
  id: number;
  citationIndex: number;
  documentName: string;
  pageNumber: number;
  quote: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const appendChunkToMessage = (msgList: Message[], msgId: string, chunk: string): Message[] => {
  return msgList.map((msg) => (msg.id === msgId ? { ...msg, text: msg.text + chunk } : msg));
};

export function useChatStream(chatId: string = 'default-session') {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Hello! I am your **TeachMe AI Academic Assistant**. Ask me questions about your uploaded documents, wave equations, or study topics. All answers cite verified source pages! **[1]**',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [citations, setCitations] = useState<CitationItem[]>([]);

  useEffect(() => {
    citationApi.getByChat(chatId).then((res) => {
      if (Array.isArray(res)) setCitations(res);
    });
  }, [chatId]);

  const sendMessage = useCallback((query: string) => {
    if (!query.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setIsStreaming(true);

    streamChatResponse(
      userMsg.text,
      chatId,
      (chunk) => {
        setMessages((prev) => appendChunkToMessage(prev, aiMsgId, chunk));
      },
      () => {
        setIsStreaming(false);
      },
      (err) => {
        console.error('Chat stream error', err);
        setIsStreaming(false);
      }
    );
  }, [chatId, isStreaming]);

  return {
    messages,
    isStreaming,
    citations,
    sendMessage,
  };
}
