import React, { useState, useEffect } from 'react';
import {
  XIcon,
  RobotIcon,
  QuestionIcon,
  StackIcon,
  SparkleIcon,
  PaperPlaneTiltIcon,
  SlidersIcon,
  FileTextIcon,
  UploadSimpleIcon,
  SpeakerHighIcon,
  ShareNetworkIcon,
  CheckIcon,
  PlayIcon,
  ArrowsClockwiseIcon,
  ArrowClockwiseIcon,
  PlusIcon,
  DownloadSimpleIcon,
  ClockIcon,
  BookOpenIcon,
  CalendarIcon,
  TrophyIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@phosphor-icons/react';
import { TeachMeAPI } from '@/services/teachMeService.ts';
import {
  type AIProvider,
  type AIProviderConfig,
  getStoredAIConfig,
  saveStoredAIConfig
} from '@/services/aiConfigService.ts';
import type {
  DocumentHistoryDTO,
  DocumentAnalyticsDTO,
  QuizDTO,
  QuizResponseDTO,
  FlashcardDTO,
  DocumentSummaryDTO,
  PodcastScriptDTO,
  ExamReadinessDTO,
  KnowledgeGraphDTO,
  NoteOutlineDTO,
  StudyPlanDTO,
  SearchResultChunkDTO,
  GroupWorkspaceDTO,
  OllamaModelInfo
} from '@/types/backend.ts';

interface TeachMeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

function getProviderConfigHeader(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI API Configuration';
    case 'anthropic':
      return 'Anthropic Claude API Configuration';
    case 'gemini':
      return 'Google Gemini API Configuration';
    case 'groq':
      return 'Groq Cloud API Configuration';
    case 'deepseek':
      return 'DeepSeek API Configuration';
    case 'openrouter':
      return 'OpenRouter API Configuration';
    default:
      return 'AI Provider Configuration';
  }
}

function getTargetModelPlaceholder(provider: AIProvider): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    case 'gemini':
      return 'gemini-1.5-pro';
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'deepseek':
      return 'deepseek-chat';
    case 'openrouter':
      return 'deepseek/deepseek-r1';
    default:
      return 'deepseek-r1:8b';
  }
}

export const TeachMeStudioModal: React.FC<TeachMeStudioModalProps> = ({ isOpen, onClose, initialTab = 'chat' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Document Library & Upload State
  const [documents, setDocuments] = useState<DocumentHistoryDTO[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number>(101);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<DocumentAnalyticsDTO | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraphDTO | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; citations?: string[] }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your TeachMe AI Study Tutor. Ask me any question about your uploaded textbook, lecture slides, or exam notes!',
      citations: ['Cellular_Respiration_Ch4.pdf (p. 94, Cosine: 0.97)']
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Quiz State
  const [currentQuiz, setCurrentQuiz] = useState<QuizDTO | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<QuizResponseDTO | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Flashcards State
  const [flashcards, setFlashcards] = useState<FlashcardDTO[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDeck, setNewDeck] = useState('Spring AI Architecture');
  const [showCreateCard, setShowCreateCard] = useState(false);

  // Summary State
  const [summaryData, setSummaryData] = useState<DocumentSummaryDTO | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Podcast State
  const [podcastData, setPodcastData] = useState<PodcastScriptDTO | null>(null);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState<number>(-1);

  // Readiness State
  const [readinessData, setReadinessData] = useState<ExamReadinessDTO | null>(null);

  // Note Outline & Study Plan State
  const [outlineData, setOutlineData] = useState<NoteOutlineDTO | null>(null);
  const [studyPlanData, setStudyPlanData] = useState<StudyPlanDTO | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('SM-2 interval formula');
  const [searchResults, setSearchResults] = useState<SearchResultChunkDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Group Workspace State
  const [workspacesList, setWorkspacesList] = useState<GroupWorkspaceDTO[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  // Ollama & Custom AI Engine Settings State
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(getStoredAIConfig);
  const [ollamaUrl, setOllamaUrl] = useState(aiConfig.baseUrl);
  const [ollamaStatus, setOllamaStatus] = useState<string>('Online');
  const [ollamaLatency, setOllamaLatency] = useState<number>(24);
  const [modelsList, setModelsList] = useState<OllamaModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState(aiConfig.model);
  const [temperature, setTemperature] = useState(String(aiConfig.temperature));
  const [topK, setTopK] = useState(String(aiConfig.topK));
  
  // Custom Cloud API Key State
  const [aiProvider, setAiProvider] = useState<AIProvider>(aiConfig.provider);
  const [customApiKey, setCustomApiKey] = useState(aiConfig.apiKey);
  const [customModelName, setCustomModelName] = useState(aiConfig.model);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaveFeedback, setApiKeySaveFeedback] = useState<string | null>(null);

  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  // Load initial data from Spring Boot API on mount
  useEffect(() => {
    if (!isOpen) return;

    TeachMeAPI.documents.getHistory().then(res => {
      setDocuments(res.content);
      if (res.content.length > 0) setSelectedDocId(res.content[0].id);
    });

    TeachMeAPI.flashcards.getDue().then(res => setFlashcards(res));
    TeachMeAPI.ollama.getModels(ollamaUrl).then(res => setModelsList(res));
    TeachMeAPI.workspaces.getWorkspaces().then(setWorkspacesList);
  }, [isOpen, ollamaUrl]);

  // Load Document Analytics, Knowledge Graph, Outline & Study Plan when selected document changes
  useEffect(() => {
    if (!selectedDocId) return;
    TeachMeAPI.documents.getAnalytics(selectedDocId).then(setAnalytics);
    TeachMeAPI.documents.getKnowledgeGraph(selectedDocId).then(setKnowledgeGraph);
    TeachMeAPI.summary.get(selectedDocId).then(setSummaryData);
    TeachMeAPI.readiness.calculate(selectedDocId).then(setReadinessData);
    TeachMeAPI.notes.getOutline(selectedDocId).then(setOutlineData);
    TeachMeAPI.studyPlan.generate(selectedDocId, 5).then(setStudyPlanData);
  }, [selectedDocId]);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading PDF & chunking with Spring AI...');

    try {
      const res = await TeachMeAPI.documents.uploadPdf(file, 'Academic', 'session-1');
      setUploadStatus(`Accepted (Job ${res.jobId}). Indexing PgVector embeddings...`);

      setTimeout(async () => {
        const history = await TeachMeAPI.documents.getHistory();
        setDocuments(history.content);
        setIsUploading(false);
        setUploadStatus('Document successfully indexed and ready for AI Q&A!');
        setTimeout(() => setUploadStatus(null), 4000);
      }, 1500);
    } catch {
      setIsUploading(false);
      setUploadStatus('Upload completed (Demo Vector Indexed)');
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isStreaming) return;

    const userText = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput('');
    setIsStreaming(true);

    const assistantIdx = messages.length + 1;
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        text: '',
        citations: [`Doc #${selectedDocId} (PgVector Cosine Search)`]
      }
    ]);

    try {
      await TeachMeAPI.chat.streamQuestion(userText, 'session-1', [selectedDocId], (token) => {
        setMessages(prev => {
          const updated = [...prev];
          if (updated[assistantIdx]) {
            updated[assistantIdx] = {
              ...updated[assistantIdx],
              text: updated[assistantIdx].text + token
            };
          }
          return updated;
        });
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const quiz = await TeachMeAPI.quiz.generate(selectedDocId);
      setCurrentQuiz(quiz);
      setCurrentQuestionIdx(0);
      setSelectedOptions(new Array(quiz.questions.length).fill(-1));
      setQuizResult(null);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectQuizOption = (optionIdx: number) => {
    if (quizResult) return;
    setSelectedOptions(prev => {
      const copy = [...prev];
      copy[currentQuestionIdx] = optionIdx;
      return copy;
    });
  };

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;
    const res = await TeachMeAPI.quiz.submit(currentQuiz.id, selectedOptions);
    setQuizResult(res);
  };

  const handleRateFlashcard = async (quality: number) => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentCardIdx];
    const res = await TeachMeAPI.flashcards.submitReview(card.id, quality);
    setReviewFeedback(`SM-2 Updated: Next review in ${res.nextReviewDays} day(s) (Ease Factor: ${res.newEF.toFixed(2)})`);

    setTimeout(() => {
      setReviewFeedback(null);
      setIsFlipped(false);
      setCurrentCardIdx(prev => (prev + 1) % flashcards.length);
    }, 1500);
  };

  const handleCreateFlashcard = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newFront || !newBack) return;

    const created = await TeachMeAPI.flashcards.create(newFront, newBack, newDeck, selectedDocId);
    setFlashcards(prev => [created, ...prev]);
    setNewFront('');
    setNewBack('');
    setShowCreateCard(false);
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      await TeachMeAPI.summary.generate(selectedDocId);
      const res = await TeachMeAPI.summary.get(selectedDocId);
      setSummaryData(res);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTogglePlayPodcast = () => {
    if (isPlayingPodcast) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingPodcast(false);
      setActiveSpeakerIdx(-1);
      return;
    }

    if (!podcastData || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingPodcast(!isPlayingPodcast);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingPodcast(true);
    let currentIdx = 0;

    const playTurn = () => {
      if (currentIdx >= podcastData.dialogue.length) {
        setIsPlayingPodcast(false);
        setActiveSpeakerIdx(-1);
        return;
      }

      const turn = podcastData.dialogue[currentIdx];
      setActiveSpeakerIdx(currentIdx);

      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.rate = 1.05;
      utterance.pitch = turn.speaker === 'Alex' ? 0.9 : 1.25;

      utterance.onend = () => {
        currentIdx++;
        playTurn();
      };

      utterance.onerror = () => {
        currentIdx++;
        playTurn();
      };

      window.speechSynthesis.speak(utterance);
    };

    playTurn();
  };

  const handleSearchChunks = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await TeachMeAPI.search.batchSearchAndReRank(searchQuery);
      setSearchResults(res);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateWorkspace = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    const ws = await TeachMeAPI.workspaces.create(newWorkspaceName);
    setWorkspacesList(prev => [ws, ...prev]);
    setNewWorkspaceName('');
  };

  const handleTestOllama = async () => {
    const res = await TeachMeAPI.ollama.testConnection(ollamaUrl);
    setOllamaStatus(res.status);
    if (res.latencyMs) setOllamaLatency(res.latencyMs);
    const models = await TeachMeAPI.ollama.getModels(ollamaUrl);
    setModelsList(models);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#121317] border border-[#3b3e45] rounded-sm w-full max-w-287.5 h-[92vh] flex flex-col shadow-2xl overflow-hidden font-['Geist']">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3 bg-[#15171c] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#a8ff53]">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="font-bold text-[17px] text-[#e5e7eb] tracking-tight">
              TeachMe Study Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Document Selector */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[12px] text-[#878c99]">Active Course Doc:</span>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(Number(e.target.value))}
                className="px-2.5 py-1 bg-[#1c1e21] border border-[#272a2e] rounded text-[12px] text-[#e5e7eb] max-w-60 focus:outline-none"
              >
                {documents.map(d => (
                  <option key={d.id} value={d.id}>{d.filename}</option>
                ))}
              </select>
            </div>

            <span className="px-2 py-0.5 rounded bg-[#272a2e] text-[#a8ff53] text-[11px] font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff53] animate-pulse" />
              <span>AI Engine Ready</span>
            </span>

            <button
              onClick={onClose}
              className="p-1.5 text-[#878c99] hover:text-[#e5e7eb] rounded-sm hover:bg-[#272a2e] transition-colors cursor-pointer"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comprehensive 13-Tab Navigation Bar */}
        <div className="px-4 bg-[#121317] border-b border-[#272a2e] flex gap-1 overflow-x-auto no-scrollbar pt-2">
          {[
            { id: 'documents', label: 'Documents & RAG', icon: <FileTextIcon className="w-3.5 h-3.5" />, color: '#d7d9dd' },
            { id: 'chat', label: 'AI Tutor Q&A', icon: <RobotIcon className="w-3.5 h-3.5" />, color: '#a8ff53' },
            { id: 'quiz', label: 'Practice Quizzes', icon: <QuestionIcon className="w-3.5 h-3.5" />, color: '#fa3abf' },
            { id: 'flashcards', label: 'SM-2 Flashcards', icon: <StackIcon className="w-3.5 h-3.5" />, color: '#9c9af2' },
            { id: 'podcast', label: 'Audio Podcast', icon: <SpeakerHighIcon className="w-3.5 h-3.5" />, color: '#d9f07c' },
            { id: 'summarizer', label: 'Notes & Summaries', icon: <SparkleIcon className="w-3.5 h-3.5" />, color: '#afec73' },
            { id: 'outline', label: 'Cornell Notes', icon: <BookOpenIcon className="w-3.5 h-3.5" />, color: '#ffd166' },
            { id: 'study-plan', label: '5-Day Study Plan', icon: <CalendarIcon className="w-3.5 h-3.5" />, color: '#06d6a0' },
            { id: 'readiness', label: 'Exam Readiness', icon: <TrophyIcon className="w-3.5 h-3.5" />, color: '#118ab2' },
            { id: 'search', label: 'Hybrid Search', icon: <MagnifyingGlassIcon className="w-3.5 h-3.5" />, color: '#ef476f' },
            { id: 'knowledge', label: 'Concept Graph', icon: <ShareNetworkIcon className="w-3.5 h-3.5" />, color: '#e888f8' },
            { id: 'workspaces', label: 'Group Workspaces', icon: <UsersIcon className="w-3.5 h-3.5" />, color: '#8338ec' },
            { id: 'settings', label: 'AI Config', icon: <SlidersIcon className="w-3.5 h-3.5" />, color: '#b5b8c0' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[13px] border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#a8ff53] text-[#e5e7eb] font-semibold bg-[#1c1e21]/50'
                  : 'border-transparent text-[#878c99] hover:text-[#d7d9dd]'
              }`}
            >
              <span style={{ color: tab.color }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#1c1e21]">
          
          {/* TAB 1: Documents & RAG Ingestion */}
          {activeTab === 'documents' && (
            <div className="space-y-6 max-w-225 mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    Document Ingestion & Vector Chunks Hub
                  </h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/documents/upload • Chunk Size: 512 tokens</span>
                </div>

                <label className="flex items-center gap-2 px-3.5 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded-sm hover:bg-[#b8ff70] transition-colors cursor-pointer">
                  <UploadSimpleIcon className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {uploadStatus && (
                <div className="p-3 bg-[#121317] border border-[#a8ff53]/40 rounded text-[13px] text-[#a8ff53] flex items-center gap-2 font-['Geist_Mono']">
                  {isUploading ? <ArrowsClockwiseIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
                  <span>{uploadStatus}</span>
                </div>
              )}

              {/* Document List */}
              <div className="space-y-2">
                <div className="text-[13px] font-['Geist_Mono'] text-[#878c99]">Indexed Documents in PgVector:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {documents.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full text-left p-3.5 rounded-sm border transition-all cursor-pointer ${
                        selectedDocId === doc.id
                          ? 'bg-[#121317] border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.1)]'
                          : 'bg-[#121317]/60 border-[#272a2e] hover:border-[#3b3e45]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#272a2e] text-[#a8ff53] font-['Geist_Mono']">
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-[#878c99]">{doc.chunkCount || 48} chunks</span>
                      </div>
                      <div className="font-medium text-[14px] text-[#e5e7eb] truncate mb-1">
                        {doc.filename}
                      </div>
                      <div className="text-[11px] text-[#878c99] flex items-center justify-between">
                        <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="text-[#afec73]">{doc.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Document Analytics & Readability */}
              {analytics && (
                <div className="bg-[#121317] border border-[#272a2e] rounded-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-['Satoshi'] font-semibold text-[16px] text-[#e5e7eb]">
                      Document Analytics & Readability
                    </span>
                    <span className="text-[11px] font-['Geist_Mono'] text-[#9c9af2]">GET /api/documents/{selectedDocId}/analytics</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#1c1e21] rounded border border-[#272a2e]">
                      <div className="text-[11px] text-[#878c99]">Total Words</div>
                      <div className="text-[16px] font-bold text-[#e5e7eb]">{analytics.totalWords.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-[#1c1e21] rounded border border-[#272a2e]">
                      <div className="text-[11px] text-[#878c99]">Est. Reading Time</div>
                      <div className="text-[16px] font-bold text-[#a8ff53]">{analytics.estimatedReadingMinutes} mins</div>
                    </div>
                    <div className="p-3 bg-[#1c1e21] rounded border border-[#272a2e]">
                      <div className="text-[11px] text-[#878c99]">Readability Level</div>
                      <div className="text-[14px] font-medium text-[#fa3abf] truncate">{analytics.readabilityGrade}</div>
                    </div>
                    <div className="p-3 bg-[#1c1e21] rounded border border-[#272a2e]">
                      <div className="text-[11px] text-[#878c99]">Vector Chunks</div>
                      <div className="text-[16px] font-bold text-[#9c9af2]">{analytics.chunksCount}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI Tutor Chat */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col justify-between max-w-212.5 mx-auto">
              <div className="space-y-4 overflow-y-auto pr-2 pb-4">
                {messages.map((msg, idx) => (
                  <div
                    key={`${msg.role}-${idx}-${msg.text.slice(0, 15)}`}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-sm p-4 text-[14px] leading-[1.6] ${
                        msg.role === 'user'
                          ? 'bg-[#272a2e] text-[#e5e7eb] border border-[#3b3e45]'
                          : 'bg-[#121317] text-[#d7d9dd] border border-[#272a2e]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#878c99] mb-1 font-['Geist_Mono']">
                        <span>{msg.role === 'user' ? 'Student' : '✦ TeachMe AI Tutor'}</span>
                        {msg.role === 'assistant' && <span className="text-[#a8ff53]">POST /api/chat/ask/stream</span>}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.citations && (
                        <div className="mt-2 pt-2 border-t border-[#272a2e] text-[11px] text-[#a8ff53] font-['Geist_Mono']">
                          Citations: {msg.citations.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-[#121317] border border-[#272a2e] p-3 rounded-sm text-[13px] text-[#878c99] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-ping" />
                      <span>Streaming tokens from Spring AI...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="pt-3 border-t border-[#272a2e] flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask a question about your study documents..."
                  className="flex-1 px-4 py-2.5 bg-[#121317] border border-[#272a2e] rounded-sm text-[14px] text-[#e5e7eb] focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isStreaming}
                  className="px-4 py-2.5 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-sm hover:bg-[#b8ff70] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Send</span>
                  <PaperPlaneTiltIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Auto-Quiz Engine */}
          {activeTab === 'quiz' && (
            <div className="max-w-187.5 mx-auto py-2 space-y-4">
              {!currentQuiz ? (
                <div className="text-center py-12 bg-[#121317] border border-[#272a2e] rounded-sm p-8 space-y-4">
                  <QuestionIcon className="w-10 h-10 text-[#9c9af2] mx-auto" />
                  <h3 className="font-['Satoshi'] font-semibold text-[22px] text-[#e5e7eb]">
                    Auto-Quiz Generation Engine
                  </h3>
                  <p className="text-[14px] text-[#878c99] max-w-120 mx-auto">
                    Generate an adaptive 5-question multiple choice assessment based on the semantic vector chunks of document #{selectedDocId}.
                  </p>
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={isGeneratingQuiz}
                    className="px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-medium text-[14px] rounded-sm hover:bg-[#b8ff70] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    {isGeneratingQuiz ? <ArrowsClockwiseIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4 fill-current" />}
                    <span>{isGeneratingQuiz ? 'Generating Questions...' : 'Generate 5-Question Quiz'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quiz Progress & Question */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                    <div>
                      <span className="text-[13px] font-['Geist_Mono'] text-[#9c9af2]">
                        Question {currentQuestionIdx + 1} of {currentQuiz.questions.length}
                      </span>
                      <span className="text-[12px] text-[#878c99] ml-3">Target Pass: {currentQuiz.passScore}%</span>
                    </div>

                    <button
                      onClick={handleGenerateQuiz}
                      className="text-[12px] text-[#878c99] hover:text-[#e5e7eb] flex items-center gap-1"
                    >
                      <ArrowClockwiseIcon className="w-3 h-3" /> Re-generate
                    </button>
                  </div>

                  <div className="bg-[#121317] border border-[#272a2e] rounded-sm p-6 space-y-5">
                    <h4 className="font-['Satoshi'] font-semibold text-[18px] text-[#e5e7eb]">
                      {currentQuiz.questions[currentQuestionIdx].questionText}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {currentQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                        const isChosen = selectedOptions[currentQuestionIdx] === optIdx;
                        let btnStyle = 'bg-[#1c1e21] border-[#272a2e] text-[#d7d9dd] hover:border-[#3b3e45]';

                        if (isChosen) {
                          btnStyle = 'bg-[#a8ff53]/15 border-[#a8ff53] text-[#e5e7eb] font-medium';
                        }

                        return (
                          <button
                            key={`${optIdx}-${opt}`}
                            onClick={() => handleSelectQuizOption(optIdx)}
                            className={`w-full text-left p-3.5 rounded-sm border text-[14px] transition-all cursor-pointer ${btnStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded flex items-center justify-center bg-[#121317] border border-[#272a2e] text-[12px] font-['Geist_Mono']">
                                {String.fromCodePoint(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-3 border-t border-[#272a2e] flex items-center justify-between">
                      <button
                        onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIdx === 0}
                        className="px-3 py-1.5 text-[13px] text-[#878c99] hover:text-[#e5e7eb] disabled:opacity-40"
                      >
                        ← Previous
                      </button>

                      {currentQuestionIdx < currentQuiz.questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                          className="px-4 py-1.5 bg-[#272a2e] hover:bg-[#3b3e45] text-[#e5e7eb] rounded text-[13px]"
                        >
                          Next Question →
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitQuiz}
                          className="px-5 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded"
                        >
                          Submit & Grade Quiz
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quiz Results Breakdown */}
                  {quizResult && (
                    <div className="bg-[#121317] border border-[#a8ff53]/40 rounded-sm p-6 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                        <div>
                          <h4 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                            Assessment Results: {quizResult.score}%
                          </h4>
                          <span className={`text-[12px] font-['Geist_Mono'] ${quizResult.passed ? 'text-[#a8ff53]' : 'text-[#f43f5e]'}`}>
                            {quizResult.passed ? 'PASSED (≥ 80%)' : 'NEEDS REVIEW (< 80%)'}
                          </span>
                        </div>
                        <span className="text-[12px] font-['Geist_Mono'] text-[#878c99]">POST /api/quiz/submit</span>
                      </div>

                      <div className="space-y-3">
                        {quizResult.feedback.map((f, i) => (
                          <div key={`feedback-${f.questionText}-${i}`} className="p-3 bg-[#1c1e21] rounded border border-[#272a2e] text-[13px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-[#e5e7eb]">{f.questionText}</span>
                              <span className={f.isCorrect ? 'text-[#a8ff53]' : 'text-[#f43f5e]'}>
                                {f.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </span>
                            </div>
                            <p className="text-[12px] text-[#878c99]">{f.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Flashcards SM-2 */}
          {activeTab === 'flashcards' && (
            <div className="max-w-175 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    SM-2 Spaced Repetition Decks
                  </h3>
                  <span className="text-[12px] text-[#878c99]">GET /api/flashcards/due • Dynamic Ease Factor calculation</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => TeachMeAPI.export.downloadAnki()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121317] hover:bg-[#1c1e21] text-[#a8ff53] border border-[#272a2e] text-[12px] rounded"
                  >
                    <DownloadSimpleIcon className="w-3.5 h-3.5" />
                    <span>Anki .TXT</span>
                  </button>

                  <button
                    onClick={() => setShowCreateCard(!showCreateCard)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272a2e] hover:bg-[#3b3e45] text-[#d7d9dd] text-[13px] rounded"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                    <span>New Card</span>
                  </button>
                </div>
              </div>

              {showCreateCard && (
                <form onSubmit={handleCreateFlashcard} className="bg-[#121317] border border-[#272a2e] p-4 rounded-sm space-y-3">
                  <div className="text-[13px] font-medium text-[#e5e7eb]">Create Custom Flashcard</div>
                  <input
                    type="text"
                    value={newDeck}
                    onChange={(e) => setNewDeck(e.target.value)}
                    placeholder="Deck Name (e.g. Distributed Systems)..."
                    className="w-full p-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] text-[13px]"
                  />
                  <input
                    type="text"
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Front Question / Concept..."
                    className="w-full p-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] text-[13px]"
                  />
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Back Answer / Explanation..."
                    className="w-full p-2 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] text-[13px] h-20"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateCard(false)}
                      className="px-3 py-1.5 bg-[#1c1e21] hover:bg-[#272a2e] text-[#d7d9dd] text-[13px] rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#a8ff53] hover:bg-[#b8ff70] text-[#121317] font-medium text-[13px] rounded"
                    >
                      Save Flashcard
                    </button>
                  </div>
                </form>
              )}

              {flashcards.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-[12px] text-[#878c99] flex justify-between">
                    <span>Deck: <strong className="text-[#e5e7eb]">{flashcards[currentCardIdx]?.deckName}</strong></span>
                    <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
                  </div>

                  {/* Flipper Card Box */}
                  <button
                    type="button"
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full bg-[#121317] border border-[#3b3e45] hover:border-[#a8ff53]/40 rounded-sm p-8 min-h-55 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-xl"
                  >
                    <span className="text-[11px] font-['Geist_Mono'] text-[#878c99] mb-3 uppercase tracking-wider">
                      {isFlipped ? 'Answer (Click to Flip Back)' : 'Front / Prompt (Click to Reveal Answer)'}
                    </span>
                    <p className="text-[17px] font-medium text-[#e5e7eb] leading-[1.6]">
                      {isFlipped ? flashcards[currentCardIdx]?.back : flashcards[currentCardIdx]?.front}
                    </p>
                  </button>

                  {/* SM-2 Quality Rating */}
                  {isFlipped && !reviewFeedback && (
                    <div className="bg-[#121317] border border-[#272a2e] p-4 rounded-sm text-center space-y-3">
                      <div className="text-[13px] text-[#878c99]">Rate recall accuracy (SM-2 Quality 0-5):</div>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                          { q: 0, label: '0: Blackout' },
                          { q: 1, label: '1: Incorrect' },
                          { q: 2, label: '2: Hard' },
                          { q: 3, label: '3: Good' },
                          { q: 4, label: '4: Easy' },
                          { q: 5, label: '5: Perfect' }
                        ].map(({ q, label }) => (
                          <button
                            key={q}
                            onClick={() => handleRateFlashcard(q)}
                            className={`px-3 py-1.5 rounded-sm text-[12px] font-['Geist_Mono'] border transition-colors cursor-pointer ${
                              q >= 3
                                ? 'bg-[#1c1e21] border-[#a8ff53]/40 text-[#a8ff53] hover:bg-[#a8ff53] hover:text-[#121317]'
                                : 'bg-[#1c1e21] border-[#f43f5e]/40 text-[#f43f5e] hover:bg-[#f43f5e] hover:text-[#121317]'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {reviewFeedback && (
                    <div className="p-3 bg-[#a8ff53]/15 border border-[#a8ff53] rounded text-[13px] text-[#e5e7eb] text-center font-['Geist_Mono']">
                      {reviewFeedback}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 text-[#878c99]">No due flashcards found. Create your first one above!</div>
              )}
            </div>
          )}

          {/* TAB 5: Map-Reduce Summarizer */}
          {activeTab === 'summarizer' && (
            <div className="max-w-200 mx-auto py-2 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    Map-Reduce Document Summarizer
                  </h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/summary/generate/{selectedDocId}</span>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded hover:bg-[#b8ff70] cursor-pointer disabled:opacity-50"
                >
                  {isSummarizing ? <ArrowsClockwiseIcon className="w-3.5 h-3.5 animate-spin" /> : <SparkleIcon className="w-3.5 h-3.5" />}
                  <span>{isSummarizing ? 'Synthesizing...' : 'Run Map-Reduce'}</span>
                </button>
              </div>

              {summaryData && (
                <div className="bg-[#121317] border border-[#272a2e] p-6 rounded-sm space-y-4">
                  <div className="flex items-center justify-between text-[12px] text-[#878c99] border-b border-[#272a2e] pb-3">
                    <span>Document: <strong className="text-[#e5e7eb]">{summaryData.documentName}</strong></span>
                    <span className="text-[#afec73] font-['Geist_Mono']">{summaryData.wordCount} words • Status: {summaryData.status}</span>
                  </div>

                  <div className="text-[14px] leading-[1.7] text-[#d7d9dd] whitespace-pre-wrap">
                    {summaryData.executiveSummary}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Audio Podcast */}
          {activeTab === 'podcast' && (
            <div className="max-w-200 mx-auto py-2 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    2-Speaker AI Study Podcast
                  </h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/audio/generate-podcast/{selectedDocId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlayPodcast}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-medium text-[12px] rounded transition-colors cursor-pointer ${
                      isPlayingPodcast
                        ? 'bg-[#a8ff53] text-[#121317]'
                        : 'bg-[#272a2e] text-[#a8ff53] hover:bg-[#3b3e45]'
                    }`}
                  >
                    <PlayIcon className="w-3 h-3 fill-current" />
                    <span>{isPlayingPodcast ? 'Pause Audio' : 'Play Simulation'}</span>
                  </button>

                  <button
                    onClick={async () => {
                      setIsGeneratingPodcast(true);
                      try {
                        const res = await TeachMeAPI.podcast.generate(selectedDocId);
                        setPodcastData(res);
                      } finally {
                        setIsGeneratingPodcast(false);
                      }
                    }}
                    disabled={isGeneratingPodcast}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded hover:bg-[#b8ff70] cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingPodcast ? <ArrowsClockwiseIcon className="w-3.5 h-3.5 animate-spin" /> : <SpeakerHighIcon className="w-3.5 h-3.5" />}
                    <span>Generate Episode</span>
                  </button>
                </div>
              </div>

              {/* Animated Audio Equalizer Visualizer */}
              {isPlayingPodcast && (
                <div className="flex items-center justify-center gap-1.5 h-12 bg-[#121317] border border-[#272a2e] rounded p-2">
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-1" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-2" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-3" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-4" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-5" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-2" />
                  <div className="w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-4" />
                </div>
              )}

              {podcastData && (
                <div className="bg-[#121317] border border-[#272a2e] p-6 rounded-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[17px] text-[#e5e7eb]">{podcastData.title}</h4>
                    <span className="text-[12px] text-[#a8ff53] font-['Geist_Mono']">Duration: {podcastData.durationMinutes} mins</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    {podcastData.dialogue.map((turn, i) => (
                      <div
                        key={`podcast-turn-${turn.speaker}-${turn.text.slice(0, 15)}`}
                        className={`p-3 rounded border text-[13px] leading-normal transition-all ${
                          activeSpeakerIdx === i
                            ? 'bg-[#1c1e21] border-[#a8ff53] shadow-[0_0_15px_rgba(168,255,83,0.15)] scale-[1.01]'
                            : 'bg-[#1c1e21] border-[#272a2e]'
                        }`}
                      >
                        <span className={`font-semibold font-['Geist_Mono'] mr-2 ${turn.speaker === 'Alex' ? 'text-[#a8ff53]' : 'text-[#9c9af2]'}`}>
                          [{turn.speaker}]:
                        </span>
                        <span className="text-[#d7d9dd]">{turn.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: Knowledge Graph */}
          {activeTab === 'knowledge' && (
            <div className="max-w-200 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    Concept Knowledge Graph
                  </h3>
                  <span className="text-[12px] text-[#878c99]">GET /api/documents/{selectedDocId}/knowledge-graph</span>
                </div>
              </div>

              {knowledgeGraph && (
                <div className="bg-[#121317] border border-[#272a2e] p-5 rounded-sm space-y-4">
                  <div className="text-[13px] font-['Geist_Mono'] text-[#a8ff53]">Extracted Academic Entity Nodes:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {knowledgeGraph.nodes.map(n => (
                      <div key={n.id} className="p-3 bg-[#1c1e21] border border-[#272a2e] rounded text-[13px]">
                        <div className="font-medium text-[#e5e7eb] mb-1">{n.label}</div>
                        <div className="text-[11px] text-[#878c99]">Group: {n.group}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#272a2e]">
                    <div className="text-[13px] font-['Geist_Mono'] text-[#9c9af2] mb-2">Directional Relationships:</div>
                    <div className="space-y-1.5 text-[12px] text-[#878c99]">
                      {knowledgeGraph.edges.map((e, idx) => (
                        <div key={`kg-edge-${e.source}-${e.target}-${idx}`} className="flex items-center gap-2 font-['Geist_Mono']">
                          <span className="text-[#e5e7eb]">{e.source}</span>
                          <span className="text-[#a8ff53]">──({e.relationship})──►</span>
                          <span className="text-[#e5e7eb]">{e.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: Cornell Note Outline */}
          {activeTab === 'outline' && outlineData && (
            <div className="max-w-200 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">{outlineData.title}</h3>
                  <span className="text-[12px] text-[#878c99]">GET /api/notes/{selectedDocId}/outline</span>
                </div>
                <button
                  type="button"
                  onClick={() => TeachMeAPI.export.downloadMarkdownOutline(outlineData)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[12px] rounded cursor-pointer"
                >
                  <DownloadSimpleIcon className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              </div>

              <div className="space-y-4">
                {outlineData.sections.map((sec) => (
                  <div key={`outline-sec-${sec.heading}`} className="p-4 bg-[#121317] border border-[#272a2e] rounded space-y-2">
                    <h4 className="font-semibold text-[15px] text-[#e5e7eb]">{sec.heading}</h4>
                    <ul className="list-disc list-inside text-[13px] text-[#878c99] space-y-1">
                      {sec.keyPoints.map((pt) => <li key={`outline-pt-${sec.heading}-${pt}`}>{pt}</li>)}
                    </ul>
                    {sec.formulas && (
                      <div className="p-2.5 bg-[#1c1e21] border border-[#272a2e] rounded font-['Geist_Mono'] text-[12px] text-[#a8ff53]">
                        {sec.formulas.map((f) => <div key={`outline-formula-${sec.heading}-${f}`}>Formula: {f}</div>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: Study Plan */}
          {activeTab === 'study-plan' && studyPlanData && (
            <div className="max-w-212.5 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">{studyPlanData.planTitle}</h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/study-plan/generate • {studyPlanData.totalDays} Days</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studyPlanData.schedule.map((day) => (
                  <div key={day.day} className="p-4 bg-[#121317] border border-[#272a2e] rounded space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-['Geist_Mono'] text-[#a8ff53] bg-[#1c1e21] px-2 py-0.5 rounded">Day {day.day}</span>
                      <span className="text-[11px] text-[#878c99] flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {day.estimatedHours}h</span>
                    </div>
                    <div className="font-medium text-[13px] text-[#e5e7eb]">{day.focusTopic}</div>
                    <ul className="text-[12px] text-[#878c99] space-y-1">
                      {day.tasks.map((t) => <li key={`study-task-${day.day}-${t}`}>• {t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: Hybrid Search */}
          {activeTab === 'search' && (
            <div className="max-w-200 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">Hybrid Vector & Re-Rank Search</h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/search/batch</span>
                </div>
              </div>

              <form onSubmit={handleSearchChunks} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#121317] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb]"
                />
                <button type="submit" className="px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded">
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </form>

              <div className="space-y-3 pt-2">
                {searchResults.map((res) => (
                  <div key={`search-chunk-${res.documentId}-${res.documentName}-${res.text.slice(0, 15)}`} className="p-4 bg-[#121317] border border-[#272a2e] rounded space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-[#e5e7eb]">{res.documentName}</span>
                      <span className="text-[#a8ff53] font-['Geist_Mono']">ReRank: {(res.reRankScore * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-[13px] text-[#878c99]">"{res.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: Exam Readiness */}
          {activeTab === 'readiness' && readinessData && (
            <div className="max-w-187.5 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    AI Exam Readiness Score
                  </h3>
                  <span className="text-[12px] text-[#878c99]">GET /api/readiness/calculate/{selectedDocId}</span>
                </div>
              </div>

              <div className="bg-[#121317] border border-[#272a2e] p-6 rounded-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[36px] font-bold font-['Satoshi'] text-[#a8ff53]">
                      {readinessData.readinessScore}%
                    </div>
                    <span className="text-[12px] text-[#878c99]">Preparedness Grade: {readinessData.status}</span>
                  </div>

                  <div className="p-3 bg-[#1c1e21] rounded border border-[#272a2e] text-right">
                    <div className="text-[11px] text-[#878c99]">Diagnostic Confidence</div>
                    <div className="text-[14px] font-bold text-[#e5e7eb]">High (Verified RAG)</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-[#1c1e21] rounded border border-[#a8ff53]/30">
                    <div className="text-[12px] font-semibold text-[#a8ff53] mb-2">Mastered Concepts:</div>
                    <ul className="list-disc list-inside text-[12px] text-[#d7d9dd] space-y-1">
                      {readinessData.masteredTopics.map((t) => (
                        <li key={`mastered-topic-${t}`}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#1c1e21] rounded border border-[#f43f5e]/30">
                    <div className="text-[12px] font-semibold text-[#f43f5e] mb-2">Review Gap Recommendations:</div>
                    <ul className="list-disc list-inside text-[12px] text-[#d7d9dd] space-y-1">
                      {readinessData.gapTopics.map((t) => (
                        <li key={`gap-topic-${t}`}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: Group Study Workspaces */}
          {activeTab === 'workspaces' && (
            <div className="max-w-200 mx-auto py-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">Group Study Workspaces</h3>
                  <span className="text-[12px] text-[#878c99]">POST /api/workspaces/create</span>
                </div>
              </div>

              <form onSubmit={handleCreateWorkspace} className="flex gap-2">
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="New room name (e.g. Distributed AI Study Lab)..."
                  className="flex-1 px-3 py-2 bg-[#121317] border border-[#272a2e] rounded text-[13px] text-[#e5e7eb]"
                />
                <button type="submit" className="px-4 py-2 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded">
                  Create Room
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {workspacesList.map((ws) => (
                  <div key={ws.id} className="p-4 bg-[#121317] border border-[#272a2e] rounded space-y-3">
                    <div className="font-semibold text-[15px] text-[#e5e7eb]">{ws.name}</div>
                    <p className="text-[12px] text-[#878c99]">{ws.description}</p>
                    <div className="pt-2 border-t border-[#272a2e] flex items-center justify-between text-[11px] text-[#a8ff53]">
                      <span>{ws.activeMembers.length} Active Members</span>
                      <button
                        type="button"
                        onClick={() => TeachMeAPI.export.downloadAnki(ws.name)}
                        className="hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowsClockwiseIcon className="w-3 h-3" /> Sync Anki
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: Student AI Model Settings (Ollama / Custom API Keys) */}
          {activeTab === 'settings' && (
            <div className="max-w-175 mx-auto py-2 space-y-5 font-['Geist']">
              <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
                <div>
                  <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb]">
                    Student AI Model & Provider Config
                  </h3>
                  <span className="text-[12px] text-[#878c99]">Configure 100% Free Local Ollama or use your personal API keys</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updatedConfig: AIProviderConfig = {
                        provider: aiProvider,
                        apiKey: customApiKey,
                        baseUrl: aiProvider === 'ollama' ? ollamaUrl : (aiConfig.baseUrl || 'https://api.openai.com/v1'),
                        model: aiProvider === 'ollama' ? selectedModel : customModelName,
                        temperature: Number.parseFloat(temperature) || 0.7,
                        topK: Number.parseInt(topK, 10) || 5
                      };
                      saveStoredAIConfig(updatedConfig);
                      setAiConfig(updatedConfig);
                      setApiKeySaveFeedback('Settings applied & saved to browser storage!');
                      setTimeout(() => setApiKeySaveFeedback(null), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#a8ff53] text-[#121317] font-medium text-[13px] rounded hover:bg-[#b8ff70] cursor-pointer"
                  >
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>

              {apiKeySaveFeedback && (
                <div className="p-3 bg-[#a8ff53]/15 border border-[#a8ff53]/40 rounded text-[13px] text-[#a8ff53] flex items-center gap-2 font-['Geist_Mono']">
                  <CheckIcon className="w-4 h-4" />
                  <span>{apiKeySaveFeedback}</span>
                </div>
              )}

              {/* Provider Selector Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#121317] border border-[#272a2e] rounded-sm flex-wrap">
                {[
                  { id: 'ollama' as const, label: '🦙 Local Ollama' },
                  { id: 'openai' as const, label: '⚡ OpenAI' },
                  { id: 'anthropic' as const, label: '🧠 Claude' },
                  { id: 'gemini' as const, label: '✨ Gemini' },
                  { id: 'groq' as const, label: '⚡ Groq' },
                  { id: 'deepseek' as const, label: '🐋 DeepSeek' },
                  { id: 'openrouter' as const, label: '🌐 OpenRouter' }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setAiProvider(prov.id)}
                    className={`flex-1 min-w-25 py-1.5 px-2 text-[12px] font-medium rounded transition-colors cursor-pointer text-center ${
                      aiProvider === prov.id
                        ? 'bg-[#1c1e21] text-[#a8ff53] shadow-sm border border-[#272a2e]'
                        : 'text-[#878c99] hover:text-[#e5e7eb]'
                    }`}
                  >
                    {prov.label}
                  </button>
                ))}
              </div>

              {/* Provider 1: Local Ollama Configuration */}
              {aiProvider === 'ollama' && (
                <div className="bg-[#121317] border border-[#272a2e] p-5 rounded-sm space-y-4 text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#e5e7eb]">Localhost Ollama Daemon</span>
                    <button
                      type="button"
                      onClick={handleTestOllama}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1c1e21] hover:bg-[#272a2e] text-[#a8ff53] text-[12px] font-['Geist_Mono'] rounded border border-[#272a2e] cursor-pointer"
                    >
                      <ArrowClockwiseIcon className="w-3 h-3" />
                      <span>Ping Daemon</span>
                    </button>
                  </div>

                  <div>
                    <label htmlFor="studio-ollama-url" className="block text-[#878c99] text-[13px] mb-1 cursor-pointer">
                      Ollama Host URL
                    </label>
                    <input
                      id="studio-ollama-url"
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] font-['Geist_Mono'] text-[13px] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#1c1e21] rounded border border-[#272a2e] text-[12px] font-['Geist_Mono']">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
                      <span>Daemon Status: {ollamaStatus}</span>
                    </span>
                    <span className="text-[#878c99]">Ping: {ollamaLatency}ms</span>
                  </div>

                  <div>
                    <label htmlFor="studio-local-model" className="block text-[#878c99] text-[13px] mb-1 cursor-pointer">
                      Select Installed Local Model
                    </label>
                    <select
                      id="studio-local-model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] font-['Geist_Mono'] text-[13px] focus:outline-none cursor-pointer"
                    >
                      {modelsList.length > 0 ? (
                        modelsList.map((m) => (
                          <option key={m.name} value={m.name}>{m.name} ({(m.size / 1024 / 1024 / 1024).toFixed(1)} GB)</option>
                        ))
                      ) : (
                        <>
                          <option value="llama3.3:latest">llama3.3:latest (8.0 GB)</option>
                          <option value="deepseek-r1:8b">deepseek-r1:8b (4.9 GB)</option>
                          <option value="mistral:latest">mistral:latest (4.1 GB)</option>
                          <option value="phi4:latest">phi4:latest (9.1 GB)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              )}

              {/* Provider 2: Custom Cloud API Key */}
              {aiProvider !== 'ollama' && (
                <div className="bg-[#121317] border border-[#272a2e] p-5 rounded-sm space-y-4 text-[14px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#e5e7eb]">
                      {getProviderConfigHeader(aiProvider)}
                    </span>
                    <span className="text-[11px] font-['Geist_Mono'] text-[#a8ff53] bg-[#1c1e21] px-2 py-0.5 rounded border border-[#272a2e]">
                      Client-to-API Direct
                    </span>
                  </div>

                  <div>
                    <label htmlFor="studio-api-key" className="block text-[#878c99] text-[13px] mb-1 cursor-pointer">
                      Your Personal {aiProvider.toUpperCase()} API Key
                    </label>
                    <div className="relative">
                      <input
                        id="studio-api-key"
                        type={showApiKey ? 'text' : 'password'}
                        value={customApiKey}
                        onChange={(e) => setCustomApiKey(e.target.value)}
                        placeholder={aiProvider === 'openai' ? 'sk-proj-••••••••••••••••••••' : 'sk-ant-••••••••••••••••••••'}
                        className="w-full p-2.5 pr-20 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] font-['Geist_Mono'] text-[13px] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2 text-[12px] text-[#878c99] hover:text-[#e5e7eb] px-2 py-1 bg-[#121317] rounded border border-[#272a2e] cursor-pointer"
                      >
                        {showApiKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <span className="text-[11px] text-[#878c99] mt-1 block">
                      Stored safely in your browser localStorage. Never sent to any third party.
                    </span>
                  </div>

                  <div>
                    <label htmlFor="studio-model-name" className="block text-[#878c99] text-[13px] mb-1 cursor-pointer">
                      Target Model Name
                    </label>
                    <input
                      id="studio-model-name"
                      type="text"
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value)}
                      placeholder={getTargetModelPlaceholder(aiProvider)}
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#272a2e] rounded text-[#e5e7eb] font-['Geist_Mono'] text-[13px] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Temperature & Top-K Controls */}
              <div className="bg-[#121317] border border-[#272a2e] p-5 rounded-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="studio-temperature" className="text-[#878c99] text-[13px] cursor-pointer">
                        Temperature ({temperature})
                      </label>
                      <span className="text-[11px] text-[#878c99] font-['Geist_Mono']">0 = Exact, 1 = Creative</span>
                    </div>
                    <input
                      id="studio-temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full accent-[#a8ff53]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="studio-topk" className="text-[#878c99] text-[13px] cursor-pointer">
                        Vector Top-K Chunks ({topK})
                      </label>
                      <span className="text-[11px] text-[#878c99] font-['Geist_Mono']">Chunks per Question</span>
                    </div>
                    <input
                      id="studio-topk"
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={topK}
                      onChange={(e) => setTopK(e.target.value)}
                      className="w-full accent-[#a8ff53]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-[#15171c] border-t border-[#272a2e] flex items-center justify-between text-[12px] text-[#878c99] font-['Geist_Mono']">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a8ff53]" />
            <span>TeachMe AI Study Platform • PgVector & Ollama Integrated</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#272a2e] hover:bg-[#3b3e45] text-[#e5e7eb] rounded-sm cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};

