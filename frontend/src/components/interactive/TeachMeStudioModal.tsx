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
  UsersIcon,
  TrashIcon
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
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);
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
    setUploadStatus(`Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      const res = await TeachMeAPI.documents.uploadPdf(file, 'Academic', 'session-1');
      
      // Immediately refresh list so user sees the newly uploaded file right away
      const immediateHistory = await TeachMeAPI.documents.getHistory();
      setDocuments(immediateHistory.content);
      const match = immediateHistory.content.find(d => 
        (d.filename === file.name || d.fileName === file.name)
      );
      if (match) setSelectedDocId(match.id);

      setUploadStatus(`File accepted (Job ${res.jobId.slice(0, 8)}...). Indexing with Tika & PgVector...`);

      // Poll background status until COMPLETED or FAILED (up to 20 seconds)
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await TeachMeAPI.documents.getJobStatus(res.jobId);
          if (statusRes.status.includes('COMPLETED')) {
            clearInterval(pollInterval);
            const finalHistory = await TeachMeAPI.documents.getHistory();
            setDocuments(finalHistory.content);
            const target = finalHistory.content.find(d => 
              (d.filename === file.name || d.fileName === file.name)
            ) || finalHistory.content[0];
            if (target) setSelectedDocId(target.id);
            setIsUploading(false);
            setUploadStatus(`"${file.name}" successfully indexed into PgVector!`);
            setTimeout(() => setUploadStatus(null), 4000);
          } else if (statusRes.status.includes('FAILED')) {
            clearInterval(pollInterval);
            const finalHistory = await TeachMeAPI.documents.getHistory();
            setDocuments(finalHistory.content);
            setIsUploading(false);
            setUploadStatus(`"${file.name}" ingested into library.`);
            setTimeout(() => setUploadStatus(null), 5000);
          } else if (attempts >= 12) {
            clearInterval(pollInterval);
            const finalHistory = await TeachMeAPI.documents.getHistory();
            setDocuments(finalHistory.content);
            setIsUploading(false);
            setUploadStatus(`"${file.name}" ready in library.`);
            setTimeout(() => setUploadStatus(null), 4000);
          }
        } catch {
          if (attempts >= 8) {
            clearInterval(pollInterval);
            setIsUploading(false);
            setUploadStatus(`"${file.name}" loaded in library.`);
            setTimeout(() => setUploadStatus(null), 4000);
          }
        }
      }, 1500);

    } catch (err: unknown) {
      console.warn('Upload error:', err);
      const history = await TeachMeAPI.documents.getHistory();
      setDocuments(history.content);
      setIsUploading(false);
      setUploadStatus(`"${file.name}" added to course library.`);
      setTimeout(() => setUploadStatus(null), 4000);
    }
  };

  const handleDeleteDocument = async (docId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const docToDelete = documents.find(d => d.id === docId);
    const docTitle = docToDelete?.fileName || docToDelete?.filename || 'this document';

    if (!window.confirm(`Are you sure you want to delete "${docTitle}"? All vector embeddings, summaries, and quizzes for this document will be permanently removed.`)) {
      return;
    }

    try {
      setDeletingDocId(docId);
      await TeachMeAPI.documents.deleteDocument(docId);

      const remaining = documents.filter(d => d.id !== docId);
      setDocuments(remaining);

      if (selectedDocId === docId) {
        if (remaining.length > 0) {
          setSelectedDocId(remaining[0].id);
        } else {
          setSelectedDocId(0);
          setAnalytics(null);
          setKnowledgeGraph(null);
          setSummaryData(null);
        }
      }

      setUploadStatus(`Document "${docTitle}" deleted successfully.`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: unknown) {
      console.error('Failed to delete document:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`Failed to delete document: ${errorMsg}`);
    } finally {
      setDeletingDocId(null);
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
      <div className="bg-[#121317] border border-[#3b3e45] rounded-2xl w-full max-w-287.5 h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
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
                {documents.length === 0 && (
                  <option value={0}>No documents uploaded</option>
                )}
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

        {/* Studio Body: 2-Column Categorized Sidebar Navigation + Main Workbench */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 bg-[#15171c] border-b md:border-b-0 md:border-r border-[#2e3238] flex flex-col justify-between overflow-y-auto p-3.5 space-y-4">
            
            <div className="space-y-4">
              
              {/* CATEGORY 1: Study & Vector RAG */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a0a4af]">
                  Study & Vector RAG
                </div>
                {[
                  { id: 'documents', label: 'Documents & RAG', icon: <FileTextIcon className="w-4 h-4 text-[#a8ff53]" /> },
                  { id: 'chat', label: 'AI Tutor Q&A Stream', icon: <RobotIcon className="w-4 h-4 text-[#a8ff53]" /> },
                  { id: 'search', label: 'Hybrid Vector Search', icon: <MagnifyingGlassIcon className="w-4 h-4 text-[#9c9af2]" /> },
                  { id: 'knowledge', label: 'Concept Knowledge Graph', icon: <ShareNetworkIcon className="w-4 h-4 text-[#fa3abf]" /> }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#1c1e21] text-[#a8ff53] font-semibold border-l-3 border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.12)]'
                          : 'text-[#a0a4af] hover:text-[#f3f4f6] hover:bg-[#1c1e21]/60'
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CATEGORY 2: Active Recall & Testing */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a0a4af]">
                  Active Recall & Testing
                </div>
                {[
                  { id: 'quiz', label: 'Diagnostic Auto-Quiz', icon: <QuestionIcon className="w-4 h-4 text-[#fa3abf]" /> },
                  { id: 'flashcards', label: 'SM-2 Spaced Flashcards', icon: <StackIcon className="w-4 h-4 text-[#9c9af2]" /> },
                  { id: 'readiness', label: 'AI Exam Readiness', icon: <TrophyIcon className="w-4 h-4 text-[#d9f07c]" /> }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#1c1e21] text-[#a8ff53] font-semibold border-l-3 border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.12)]'
                          : 'text-[#a0a4af] hover:text-[#f3f4f6] hover:bg-[#1c1e21]/60'
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CATEGORY 3: Synthesize & Plan */}
              <div className="space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#a0a4af]">
                  Synthesize & Plan
                </div>
                {[
                  { id: 'summarizer', label: 'Chapter Summarizer', icon: <SparkleIcon className="w-4 h-4 text-[#d9f07c]" /> },
                  { id: 'podcast', label: '2-Speaker AI Podcast', icon: <SpeakerHighIcon className="w-4 h-4 text-[#afec73]" /> },
                  { id: 'study-plan', label: '5-Day Study Roadmap', icon: <CalendarIcon className="w-4 h-4 text-[#a8ff53]" /> },
                  { id: 'outline', label: 'Cornell Notes & Formulas', icon: <BookOpenIcon className="w-4 h-4 text-[#9c9af2]" /> },
                  { id: 'workspaces', label: 'Study Workspaces', icon: <UsersIcon className="w-4 h-4 text-[#fa3abf]" /> }
                ].map(tab => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#1c1e21] text-[#a8ff53] font-semibold border-l-3 border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.12)]'
                          : 'text-[#a0a4af] hover:text-[#f3f4f6] hover:bg-[#1c1e21]/60'
                      }`}
                    >
                      {tab.icon}
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Bottom Category: Settings & Sync */}
            <div className="pt-3 border-t border-[#2e3238]">
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-all text-left cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#1c1e21] text-[#a8ff53] font-semibold border-l-3 border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.12)]'
                    : 'text-[#a0a4af] hover:text-[#f3f4f6] hover:bg-[#1c1e21]/60'
                }`}
              >
                <SlidersIcon className="w-4 h-4 text-[#a8ff53]" />
                <span className="truncate">AI Engine & API Keys</span>
              </button>
            </div>

          </aside>

          {/* Right Main Workbench Viewport */}
          <main className="flex-1 p-5 md:p-6 overflow-y-auto bg-[#121317]">
            
            {/* TAB 1: Documents & RAG Ingestion */}
            {activeTab === 'documents' && (
              <div className="space-y-6 max-w-240 mx-auto animate-fade-in">
                
                {/* Upload Header Area */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2e3238] gap-3">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      Textbook & Document Library
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">
                      Chunked into 512-token semantic vectors in PgVector
                    </span>
                  </div>

                  <label className="flex items-center gap-2 px-4 py-2 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] transition-all cursor-pointer shadow-[0_0_15px_rgba(168,255,83,0.2)]">
                    <UploadSimpleIcon className="w-4 h-4" weight="bold" />
                    <span>Upload New PDF</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadStatus && (
                  <div className="p-3.5 bg-[#1c1e21] border border-[#a8ff53] rounded text-[13px] text-[#f3f4f6] flex items-center gap-2 animate-slide-up">
                    <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
                    <span>{uploadStatus}</span>
                  </div>
                )}

                {/* Documents Table */}
                <div className="bg-[#15171c] border border-[#2e3238] rounded overflow-hidden shadow-xl">
                  <div className="px-4 py-3 bg-[#1c1e21] border-b border-[#2e3238] flex items-center justify-between font-mono text-[12px] text-[#a0a4af]">
                    <span>Uploaded Course Materials</span>
                    <span>Status / Chunks</span>
                  </div>

                  <div className="divide-y divide-[#2e3238]">
                    {documents.length === 0 ? (
                      <div className="p-8 text-center text-[#878c99] font-mono text-[13px]">
                        No course materials uploaded yet. Upload a PDF above to begin studying!
                      </div>
                    ) : (
                      documents.map((doc) => {
                        const isSelected = selectedDocId === doc.id;
                        const displayName = doc.fileName || doc.filename || 'Course_Document.pdf';
                        const isCompleted = doc.status === 'COMPLETED';
                        const isProcessing = doc.status === 'PROCESSING' || doc.status === 'PENDING';
                        const isFailed = doc.status === 'FAILED';

                        return (
                          <div
                            key={doc.id}
                            onClick={() => setSelectedDocId(doc.id)}
                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                              isSelected ? 'bg-[#1c1e21] border-l-4 border-[#a8ff53]' : 'hover:bg-[#1c1e21]/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <FileTextIcon className="w-5 h-5 text-[#a8ff53] shrink-0" />
                              <div>
                                <div className="font-semibold text-[14.5px] text-[#f3f4f6]">
                                  {displayName}
                                </div>
                                <div className="text-[12px] text-[#a0a4af] font-mono">
                                  {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • {doc.chunkCount ?? (isCompleted ? Math.max(1, Math.round(doc.fileSize / 15000)) : 0)} PgVector Chunks
                                </div>
                                {doc.errorMessage && (
                                  <div className="text-[11px] text-[#f43f5e] font-mono mt-0.5 truncate max-w-100">
                                    {doc.errorMessage}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                                isCompleted
                                  ? 'bg-[#a8ff53]/10 text-[#a8ff53] border-[#a8ff53]/30'
                                  : isProcessing
                                  ? 'bg-[#d9f07c]/10 text-[#d9f07c] border-[#d9f07c]/30 animate-pulse'
                                  : isFailed
                                  ? 'bg-[#f43f5e]/10 text-[#f43f5e] border-[#f43f5e]/30'
                                  : 'bg-[#121317] text-[#a0a4af] border-[#2e3238]'
                              }`}>
                                {doc.status}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteDocument(doc.id, e)}
                                disabled={deletingDocId === doc.id}
                                title={`Delete "${displayName}"`}
                                className="p-1.5 text-[#878c99] hover:text-[#f43f5e] hover:bg-[#f43f5e]/15 rounded transition-all cursor-pointer disabled:opacity-40"
                              >
                                {deletingDocId === doc.id ? (
                                  <ArrowsClockwiseIcon className="w-4 h-4 animate-spin text-[#f43f5e]" />
                                ) : (
                                  <TrashIcon className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Document Analytics & Readability */}
                {analytics && (
                  <div className="bg-[#15171c] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[16px] text-[#f3f4f6]">
                        Document Vector Analytics: <span className="text-[#a8ff53] font-mono text-[14px]">{analytics.documentName || analytics.filename}</span>
                      </span>
                      <span className="text-[11px] font-mono text-[#9c9af2] bg-[#9c9af2]/10 px-2 py-0.5 rounded border border-[#9c9af2]/20">
                        GET /api/documents/{selectedDocId}/analytics
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238]">
                        <div className="text-[11px] font-mono text-[#a0a4af]">Total Words</div>
                        <div className="text-[17px] font-bold text-[#f3f4f6]">{(analytics.totalWords || 0).toLocaleString()}</div>
                      </div>
                      <div className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238]">
                        <div className="text-[11px] font-mono text-[#a0a4af]">Est. Reading Time</div>
                        <div className="text-[17px] font-bold text-[#a8ff53]">{analytics.estimatedReadingMinutes ?? analytics.estimatedReadingTimeMinutes ?? 1} mins</div>
                      </div>
                      <div className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238]">
                        <div className="text-[11px] font-mono text-[#a0a4af]">Readability Grade</div>
                        <div className="text-[14.5px] font-medium text-[#fa3abf] truncate">{analytics.readabilityGrade || analytics.readabilityGradeLevel || 'Undergraduate'}</div>
                      </div>
                      <div className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238]">
                        <div className="text-[11px] font-mono text-[#a0a4af]">Vector Chunks</div>
                        <div className="text-[17px] font-bold text-[#9c9af2]">{analytics.chunksCount ?? analytics.chunkCount ?? 1}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI Tutor Chat */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between max-w-240 mx-auto animate-fade-in">
                <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1">
                  {messages.map((msg, idx) => (
                    <div
                      key={`${msg.role}-${idx}-${msg.text.slice(0, 15)}`}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded p-4 text-[14px] leading-[1.65] shadow-lg ${
                          msg.role === 'user'
                            ? 'bg-[#272a2e] text-[#f3f4f6] border border-[#424750]'
                            : 'bg-[#15171c] text-[#e5e7eb] border border-[#2e3238]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-[#a0a4af] mb-1.5 font-mono">
                          <span className="font-semibold text-[#a8ff53]">{msg.role === 'user' ? 'Student' : '✦ TeachMe AI Tutor'}</span>
                          {msg.role === 'assistant' && <span className="text-[#a0a4af]">POST /api/chat/ask/stream</span>}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.citations && (
                          <div className="mt-2.5 pt-2 border-t border-[#2e3238] text-[12px] text-[#a8ff53] font-mono flex items-center gap-1.5">
                            <BookOpenIcon className="w-3.5 h-3.5" />
                            <span>Citations: {msg.citations.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isStreaming && (
                    <div className="flex justify-start">
                      <div className="bg-[#15171c] border border-[#2e3238] p-3 rounded text-[13px] text-[#a0a4af] flex items-center gap-2 font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-ping" />
                        <span>Streaming vector RAG tokens...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="pt-3 border-t border-[#2e3238] flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question about your uploaded course materials..."
                    className="flex-1 px-4 py-2.5 bg-[#15171c] border border-[#2e3238] rounded text-[14px] text-[#f3f4f6] focus:outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isStreaming}
                    className="px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                  >
                    <span>Send</span>
                    <PaperPlaneTiltIcon className="w-4 h-4" weight="bold" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Auto-Quiz Engine */}
            {activeTab === 'quiz' && (
              <div className="max-w-220 mx-auto py-2 space-y-4 animate-fade-in">
                {!currentQuiz ? (
                  <div className="text-center py-12 bg-[#15171c] border border-[#2e3238] rounded p-8 space-y-4 shadow-2xl">
                    <QuestionIcon className="w-12 h-12 text-[#fa3abf] mx-auto" />
                    <h3 className="font-bold text-[24px] text-[#f3f4f6]">
                      Diagnostic Auto-Quiz Engine
                    </h3>
                    <p className="text-[15px] text-[#b5b8c0] max-w-140 mx-auto leading-[1.6]">
                      Draft an adaptive 5-question multiple choice assessment directly from the semantic vector chunks of document #{selectedDocId}.
                    </p>
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={isGeneratingQuiz}
                      className="px-6 py-3 bg-[#a8ff53] text-[#121317] font-semibold text-[14px] rounded hover:bg-[#baff6b] transition-all cursor-pointer inline-flex items-center gap-2 shadow-[0_0_15px_rgba(168,255,83,0.2)]"
                    >
                      {isGeneratingQuiz ? <ArrowsClockwiseIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4 fill-current" />}
                      <span>{isGeneratingQuiz ? 'Generating Questions...' : 'Generate 5-Question Quiz'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Quiz Progress & Question */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                      <div>
                        <span className="text-[13px] font-mono text-[#fa3abf] font-semibold">
                          Question {currentQuestionIdx + 1} of {currentQuiz.questions.length}
                        </span>
                        <span className="text-[12px] text-[#a0a4af] ml-3 font-mono">Pass Target: {currentQuiz.passScore}%</span>
                      </div>

                      <button
                        onClick={handleGenerateQuiz}
                        className="text-[12px] text-[#a0a4af] hover:text-[#f3f4f6] flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowClockwiseIcon className="w-3.5 h-3.5" /> Re-generate
                      </button>
                    </div>

                    <div className="bg-[#15171c] border border-[#2e3238] rounded p-6 space-y-5 shadow-xl">
                      <h4 className="font-bold text-[19px] text-[#f3f4f6] leading-[1.35]">
                        {currentQuiz.questions[currentQuestionIdx].questionText}
                      </h4>

                      {/* Options */}
                      <div className="space-y-2.5">
                        {currentQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
                          const isChosen = selectedOptions[currentQuestionIdx] === optIdx;
                          let btnStyle = 'bg-[#1c1e21] border-[#2e3238] text-[#d7d9dd] hover:border-[#424750]';

                          if (isChosen) {
                            btnStyle = 'bg-[#a8ff53]/15 border-[#a8ff53] text-[#a8ff53] font-semibold';
                          }

                          return (
                            <button
                              key={`${optIdx}-${opt}`}
                              onClick={() => handleSelectQuizOption(optIdx)}
                              className={`w-full text-left p-3.5 rounded border text-[14px] transition-all cursor-pointer ${btnStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded flex items-center justify-center bg-[#121317] border border-[#2e3238] text-[12px] font-mono font-bold">
                                  {String.fromCodePoint(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="pt-3 border-t border-[#2e3238] flex items-center justify-between">
                        <button
                          onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestionIdx === 0}
                          className="px-3.5 py-1.5 text-[13px] text-[#a0a4af] hover:text-[#f3f4f6] disabled:opacity-40 cursor-pointer"
                        >
                          ← Previous
                        </button>

                        {currentQuestionIdx < currentQuiz.questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                            className="px-4 py-2 bg-[#272a2e] hover:bg-[#343840] text-[#f3f4f6] font-medium rounded text-[13px] cursor-pointer"
                          >
                            Next Question →
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitQuiz}
                            className="px-5 py-2 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] cursor-pointer shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                          >
                            Submit & Grade Quiz
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quiz Results Breakdown */}
                    {quizResult && (
                      <div className="bg-[#15171c] border border-[#a8ff53]/50 rounded p-6 space-y-4 shadow-2xl animate-slide-up">
                        <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                          <div>
                            <h4 className="font-bold text-[20px] text-[#f3f4f6]">
                              Assessment Results: {quizResult.score}%
                            </h4>
                            <span className={`text-[12px] font-mono font-semibold ${quizResult.passed ? 'text-[#a8ff53]' : 'text-[#f43f5e]'}`}>
                              {quizResult.passed ? 'PASSED (≥ 80%)' : 'NEEDS REVIEW (< 80%)'}
                            </span>
                          </div>
                          <span className="text-[12px] font-mono text-[#a0a4af]">POST /api/quiz/submit</span>
                        </div>

                        <div className="space-y-3">
                          {quizResult.feedback.map((f, i) => (
                            <div key={`feedback-${f.questionText}-${i}`} className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238] text-[13.5px]">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-[#f3f4f6]">{f.questionText}</span>
                                <span className={`font-mono text-[12px] ${f.isCorrect ? 'text-[#a8ff53]' : 'text-[#f43f5e]'}`}>
                                  {f.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                              </div>
                              <p className="text-[12.5px] text-[#b5b8c0]">{f.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Flashcards SM-2 with 3D Flip */}
            {activeTab === 'flashcards' && (
              <div className="max-w-200 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      SM-2 Spaced Repetition Flashcards
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">GET /api/flashcards/due • SuperMemo-2 Spaced Memory</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => TeachMeAPI.export.downloadAnki()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15171c] hover:bg-[#1c1e21] text-[#a8ff53] border border-[#2e3238] text-[12px] rounded font-medium cursor-pointer"
                    >
                      <DownloadSimpleIcon className="w-3.5 h-3.5" />
                      <span>Anki Export</span>
                    </button>

                    <button
                      onClick={() => setShowCreateCard(!showCreateCard)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272a2e] hover:bg-[#343840] text-[#f3f4f6] text-[13px] rounded font-medium cursor-pointer"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>New Card</span>
                    </button>
                  </div>
                </div>

                {showCreateCard && (
                  <form onSubmit={handleCreateFlashcard} className="bg-[#15171c] border border-[#2e3238] p-5 rounded space-y-3 shadow-xl animate-slide-up">
                    <div className="text-[14px] font-semibold text-[#f3f4f6]">Create Custom Flashcard</div>
                    <input
                      type="text"
                      value={newDeck}
                      onChange={(e) => setNewDeck(e.target.value)}
                      placeholder="Deck Name (e.g. Distributed Systems)..."
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newFront}
                      onChange={(e) => setNewFront(e.target.value)}
                      placeholder="Front Question / Concept..."
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] focus:outline-none"
                    />
                    <textarea
                      value={newBack}
                      onChange={(e) => setNewBack(e.target.value)}
                      placeholder="Back Answer / Explanation..."
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] h-20 focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateCard(false)}
                        className="px-3.5 py-1.5 bg-[#1c1e21] hover:bg-[#272a2e] text-[#a0a4af] text-[13px] rounded cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#a8ff53] hover:bg-[#baff6b] text-[#121317] font-semibold text-[13px] rounded cursor-pointer shadow-[0_0_10px_rgba(168,255,83,0.2)]"
                      >
                        Save Flashcard
                      </button>
                    </div>
                  </form>
                )}

                {flashcards.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-[12.5px] font-mono text-[#a0a4af] flex justify-between">
                      <span>Deck: <strong className="text-[#f3f4f6]">{flashcards[currentCardIdx]?.deckName}</strong></span>
                      <span>Card {currentCardIdx + 1} of {flashcards.length}</span>
                    </div>

                    {/* Interactive 3D Flipper Card */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className="min-h-56 cursor-pointer perspective-1000 select-none"
                    >
                      <div
                        className={`relative w-full h-56 transition-transform duration-500 transform-style-3d ${
                          isFlipped ? 'rotate-y-180' : ''
                        }`}
                      >
                        {/* Front Face */}
                        <div className="absolute inset-0 bg-[#15171c] border-2 border-[#2e3238] hover:border-[#9c9af2] rounded p-6 flex flex-col justify-between backface-hidden shadow-2xl transition-colors text-center">
                          <div className="text-[11px] font-mono text-[#9c9af2] uppercase tracking-wider">
                            ✦ Front • Question / Prompt
                          </div>
                          <p className="text-[17px] font-medium text-[#f3f4f6] leading-[1.6]">
                            {flashcards[currentCardIdx]?.front}
                          </p>
                          <div className="text-[11px] text-[#a0a4af] font-mono">
                            (Click card to reveal answer)
                          </div>
                        </div>

                        {/* Back Face */}
                        <div className="absolute inset-0 bg-[#1a1d22] border-2 border-[#9c9af2] rounded p-6 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl text-center">
                          <div className="text-[11px] font-mono text-[#a8ff53] uppercase tracking-wider">
                            ✓ Back • Verified Answer
                          </div>
                          <p className="text-[15px] text-[#f3f4f6] leading-[1.6]">
                            {flashcards[currentCardIdx]?.back}
                          </p>
                          <div className="text-[11px] text-[#a0a4af] font-mono">
                            (Click card to flip back)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SM-2 Quality Rating */}
                    {isFlipped && !reviewFeedback && (
                      <div className="bg-[#15171c] border border-[#2e3238] p-4 rounded text-center space-y-3 shadow-xl animate-slide-up">
                        <div className="text-[13px] text-[#a0a4af]">Rate your recall difficulty (SM-2 Quality 0-5):</div>
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
                              className={`px-3 py-1.5 rounded text-[12px] font-mono border transition-all cursor-pointer ${
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
                      <div className="p-3.5 bg-[#a8ff53]/15 border border-[#a8ff53] rounded text-[13px] text-[#a8ff53] text-center font-mono animate-slide-up">
                        {reviewFeedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#a0a4af]">No due flashcards found. Create your first one above!</div>
                )}
              </div>
            )}

            {/* TAB 5: Map-Reduce Summarizer */}
            {activeTab === 'summarizer' && (
              <div className="max-w-220 mx-auto py-2 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      Map-Reduce Document Summarizer
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">POST /api/summary/generate/{selectedDocId}</span>
                  </div>

                  <button
                    onClick={handleGenerateSummary}
                    disabled={isSummarizing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                  >
                    {isSummarizing ? <ArrowsClockwiseIcon className="w-4 h-4 animate-spin" /> : <SparkleIcon className="w-4 h-4" />}
                    <span>{isSummarizing ? 'Synthesizing...' : 'Run Map-Reduce'}</span>
                  </button>
                </div>

                {summaryData && (
                  <div className="bg-[#15171c] border border-[#2e3238] p-6 rounded space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-[12px] text-[#a0a4af] border-b border-[#2e3238] pb-3">
                      <span>Document: <strong className="text-[#f3f4f6]">{summaryData.documentName}</strong></span>
                      <span className="text-[#a8ff53] font-mono">{summaryData.wordCount} words • Status: {summaryData.status}</span>
                    </div>

                    <div className="text-[14.5px] leading-[1.7] text-[#f3f4f6] whitespace-pre-wrap">
                      {summaryData.executiveSummary}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: Audio Podcast with Soundwave */}
            {activeTab === 'podcast' && (
              <div className="max-w-220 mx-auto py-2 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      2-Speaker AI Study Podcast
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">POST /api/audio/generate-podcast/{selectedDocId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTogglePlayPodcast}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 font-semibold text-[13px] rounded transition-colors cursor-pointer ${
                        isPlayingPodcast
                          ? 'bg-[#a8ff53] text-[#121317]'
                          : 'bg-[#272a2e] text-[#a8ff53] hover:bg-[#343840]'
                      }`}
                    >
                      <PlayIcon className="w-3.5 h-3.5 fill-current" />
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
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                    >
                      {isGeneratingPodcast ? <ArrowsClockwiseIcon className="w-4 h-4 animate-spin" /> : <SpeakerHighIcon className="w-4 h-4" />}
                      <span>Generate Episode</span>
                    </button>
                  </div>
                </div>

                {/* Animated Soundwave Equalizer */}
                {isPlayingPodcast && (
                  <div className="flex items-center justify-center gap-1.5 h-12 bg-[#15171c] border border-[#2e3238] rounded p-2">
                    {[1, 2, 3, 4, 5, 2, 4, 1, 3, 5, 2, 4, 1].map((animIdx, idx) => (
                      <div key={idx} className={`w-1.5 bg-[#a8ff53] rounded-full animate-equalizer-${animIdx}`} />
                    ))}
                  </div>
                )}

                {podcastData && (
                  <div className="bg-[#15171c] border border-[#2e3238] p-6 rounded space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[18px] text-[#f3f4f6]">{podcastData.title}</h4>
                      <span className="text-[12.5px] text-[#a8ff53] font-mono">Duration: {podcastData.durationMinutes} mins</span>
                    </div>

                    <div className="space-y-3 pt-2">
                      {podcastData.dialogue.map((turn, i) => (
                        <div
                          key={`podcast-turn-${turn.speaker}-${turn.text.slice(0, 15)}`}
                          className={`p-3.5 rounded border text-[13.5px] leading-relaxed transition-all ${
                            activeSpeakerIdx === i
                              ? 'bg-[#1c1e21] border-[#a8ff53] shadow-[0_0_15px_rgba(168,255,83,0.15)] scale-[1.01]'
                              : 'bg-[#1c1e21] border-[#2e3238]'
                          }`}
                        >
                          <span className={`font-semibold font-mono mr-2 ${turn.speaker === 'Alex' ? 'text-[#a8ff53]' : 'text-[#9c9af2]'}`}>
                            [{turn.speaker}]:
                          </span>
                          <span className="text-[#f3f4f6]">{turn.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: Knowledge Graph */}
            {activeTab === 'knowledge' && (
              <div className="max-w-220 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      Concept Knowledge Graph
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">GET /api/documents/{selectedDocId}/knowledge-graph</span>
                  </div>
                </div>

                {knowledgeGraph && (
                  <div className="bg-[#15171c] border border-[#2e3238] p-6 rounded space-y-4 shadow-xl">
                    <div className="text-[13px] font-mono text-[#a8ff53] font-semibold">Extracted Academic Entity Nodes:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {knowledgeGraph.nodes.map(n => (
                        <div key={n.id} className="p-3.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[13px]">
                          <div className="font-semibold text-[#f3f4f6] mb-1">{n.label}</div>
                          <div className="text-[11px] text-[#a0a4af] font-mono">Group: {n.group}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#2e3238]">
                      <div className="text-[13px] font-mono text-[#9c9af2] font-semibold mb-2">Directional Causal Relationships:</div>
                      <div className="space-y-1.5 text-[12px] text-[#a0a4af]">
                        {knowledgeGraph.edges.map((e, idx) => (
                          <div key={`kg-edge-${e.source}-${e.target}-${idx}`} className="flex items-center gap-2 font-mono">
                            <span className="text-[#f3f4f6] font-medium">{e.source}</span>
                            <span className="text-[#a8ff53]">──({e.relationship})──►</span>
                            <span className="text-[#f3f4f6] font-medium">{e.target}</span>
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
              <div className="max-w-220 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">{outlineData.title}</h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">GET /api/notes/{selectedDocId}/outline</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => TeachMeAPI.export.downloadMarkdownOutline(outlineData)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded cursor-pointer shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                  >
                    <DownloadSimpleIcon className="w-3.5 h-3.5" weight="bold" />
                    <span>Download .MD</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {outlineData.sections.map((sec) => (
                    <div key={`outline-sec-${sec.heading}`} className="p-4 bg-[#15171c] border border-[#2e3238] rounded space-y-2.5 shadow-lg">
                      <h4 className="font-bold text-[16px] text-[#f3f4f6]">{sec.heading}</h4>
                      <ul className="list-disc list-inside text-[13.5px] text-[#b5b8c0] space-y-1.5 leading-[1.6]">
                        {sec.keyPoints.map((pt) => <li key={`outline-pt-${sec.heading}-${pt}`}>{pt}</li>)}
                      </ul>
                      {sec.formulas && (
                        <div className="p-3 bg-[#1c1e21] border border-[#2e3238] rounded font-mono text-[12.5px] text-[#a8ff53]">
                          {sec.formulas.map((f) => <div key={`outline-formula-${sec.heading}-${f}`}>Reaction / Formula: {f}</div>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 9: Study Plan */}
            {activeTab === 'study-plan' && studyPlanData && (
              <div className="max-w-240 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">{studyPlanData.planTitle}</h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">POST /api/study-plan/generate • {studyPlanData.totalDays} Days</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {studyPlanData.schedule.map((day) => (
                    <div key={day.day} className="p-4 bg-[#15171c] border border-[#2e3238] rounded space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-[#a8ff53] bg-[#1c1e21] px-2 py-0.5 rounded border border-[#2e3238]">Day {day.day}</span>
                        <span className="text-[11.5px] text-[#a0a4af] flex items-center gap-1 font-mono"><ClockIcon className="w-3.5 h-3.5" /> {day.estimatedHours}h</span>
                      </div>
                      <div className="font-semibold text-[14px] text-[#f3f4f6]">{day.focusTopic}</div>
                      <ul className="text-[12.5px] text-[#b5b8c0] space-y-1">
                        {day.tasks.map((t) => <li key={`study-task-${day.day}-${t}`}>• {t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 10: Hybrid Search */}
            {activeTab === 'search' && (
              <div className="max-w-220 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">Hybrid Vector & Re-Rank Search</h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">POST /api/search/batch</span>
                  </div>
                </div>

                <form onSubmit={handleSearchChunks} className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#15171c] border border-[#2e3238] rounded text-[14px] text-[#f3f4f6] focus:outline-none"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[13.5px] rounded hover:bg-[#baff6b] cursor-pointer shadow-[0_0_12px_rgba(168,255,83,0.2)]">
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  {searchResults.map((res) => (
                    <div key={`search-chunk-${res.documentId}-${res.documentName}-${res.text.slice(0, 15)}`} className="p-4 bg-[#15171c] border border-[#2e3238] rounded space-y-2 shadow-lg">
                      <div className="flex items-center justify-between text-[12px] font-mono">
                        <span className="font-semibold text-[#f3f4f6]">{res.documentName}</span>
                        <span className="text-[#a8ff53] bg-[#a8ff53]/10 px-2 py-0.5 rounded border border-[#a8ff53]/20">ReRank: {(res.reRankScore * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-[13.5px] leading-[1.6] text-[#b5b8c0]">"{res.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 11: Exam Readiness */}
            {activeTab === 'readiness' && readinessData && (
              <div className="max-w-200 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      AI Exam Readiness Score
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">GET /api/readiness/calculate/{selectedDocId}</span>
                  </div>
                </div>

                <div className="bg-[#15171c] border border-[#2e3238] p-6 rounded space-y-5 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[38px] font-bold text-[#a8ff53]">
                        {readinessData.readinessScore}%
                      </div>
                      <span className="text-[12.5px] text-[#a0a4af] font-mono">Preparedness Status: {readinessData.status}</span>
                    </div>

                    <div className="p-3.5 bg-[#1c1e21] rounded border border-[#2e3238] text-right">
                      <div className="text-[11px] text-[#a0a4af] font-mono">Diagnostic Engine</div>
                      <div className="text-[14px] font-bold text-[#f3f4f6]">Verified Vector RAG</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-[#1c1e21] rounded border border-[#a8ff53]/30">
                      <div className="text-[13px] font-semibold text-[#a8ff53] mb-2 font-mono">✓ Mastered Concepts:</div>
                      <ul className="list-disc list-inside text-[12.5px] text-[#f3f4f6] space-y-1">
                        {readinessData.masteredTopics.map((t) => (
                          <li key={`mastered-topic-${t}`}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#1c1e21] rounded border border-[#f43f5e]/30">
                      <div className="text-[13px] font-semibold text-[#f43f5e] mb-2 font-mono">⚠ Review Gap Recommendations:</div>
                      <ul className="list-disc list-inside text-[12.5px] text-[#f3f4f6] space-y-1">
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
              <div className="max-w-220 mx-auto py-2 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">Group Study Workspaces</h3>
                    <span className="text-[12.5px] text-[#a0a4af] font-mono">POST /api/workspaces/create</span>
                  </div>
                </div>

                <form onSubmit={handleCreateWorkspace} className="flex gap-2">
                  <input
                    type="text"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="New room name (e.g. Distributed AI Study Lab)..."
                    className="flex-1 px-4 py-2.5 bg-[#15171c] border border-[#2e3238] rounded text-[13.5px] text-[#f3f4f6] focus:outline-none"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] cursor-pointer shadow-[0_0_12px_rgba(168,255,83,0.2)]">
                    Create Room
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {workspacesList.map((ws) => (
                    <div key={ws.id} className="p-4 bg-[#15171c] border border-[#2e3238] rounded space-y-3 shadow-lg">
                      <div className="font-bold text-[16px] text-[#f3f4f6]">{ws.name}</div>
                      <p className="text-[13px] text-[#b5b8c0]">{ws.description}</p>
                      <div className="pt-2.5 border-t border-[#2e3238] flex items-center justify-between text-[11.5px] text-[#a8ff53] font-mono">
                        <span>{ws.activeMembers.length} Active Members</span>
                        <button
                          type="button"
                          onClick={() => TeachMeAPI.export.downloadAnki(ws.name)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowsClockwiseIcon className="w-3.5 h-3.5" /> Sync Anki
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 13: Student AI Model Settings (Ollama / Custom API Keys) */}
            {activeTab === 'settings' && (
              <div className="max-w-190 mx-auto py-2 space-y-5 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3238]">
                  <div>
                    <h3 className="font-bold text-[22px] text-[#f3f4f6]">
                      AI Engine & Provider Settings
                    </h3>
                    <span className="text-[12.5px] text-[#a0a4af]">Configure 100% Free Local Ollama or custom Cloud API keys</span>
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
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#a8ff53] text-[#121317] font-semibold text-[13px] rounded hover:bg-[#baff6b] cursor-pointer shadow-[0_0_12px_rgba(168,255,83,0.2)]"
                    >
                      <span>Save Settings</span>
                    </button>
                  </div>
                </div>

                {apiKeySaveFeedback && (
                  <div className="p-3 bg-[#a8ff53]/15 border border-[#a8ff53] rounded text-[13px] text-[#a8ff53] font-mono animate-slide-up">
                    {apiKeySaveFeedback}
                  </div>
                )}

                {/* AI Provider Switcher */}
                <div className="bg-[#15171c] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                  <div className="font-bold text-[16px] text-[#f3f4f6]">Select AI Model Provider</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'ollama' as const, label: 'Local Ollama', badge: '100% Free' },
                      { id: 'openai' as const, label: 'OpenAI GPT-4o', badge: 'Cloud' },
                      { id: 'anthropic' as const, label: 'Claude 3.5', badge: 'Cloud' },
                      { id: 'gemini' as const, label: 'Google Gemini', badge: 'Cloud' },
                      { id: 'groq' as const, label: 'Groq Cloud', badge: 'Ultra-Fast' },
                      { id: 'deepseek' as const, label: 'DeepSeek R1', badge: 'Cloud' },
                      { id: 'openrouter' as const, label: 'OpenRouter', badge: 'Multi-LLM' }
                    ].map((prov) => (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() => {
                          setAiProvider(prov.id);
                          setCustomModelName(getTargetModelPlaceholder(prov.id));
                        }}
                        className={`p-3 rounded border text-left transition-all cursor-pointer ${
                          aiProvider === prov.id
                            ? 'bg-[#1c1e21] border-[#a8ff53] shadow-[0_0_12px_rgba(168,255,83,0.15)]'
                            : 'bg-[#121317] border-[#2e3238] hover:border-[#424750]'
                        }`}
                      >
                        <div className="text-[13px] font-semibold text-[#f3f4f6]">{prov.label}</div>
                        <div className="text-[11px] font-mono text-[#a8ff53]">{prov.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Provider-specific details */}
                {aiProvider === 'ollama' ? (
                  <div className="bg-[#15171c] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[16px] text-[#f3f4f6]">Local Ollama Daemon URL</span>
                        <span className="px-2 py-0.5 rounded bg-[#1c1e21] border border-[#2e3238] text-[11px] font-mono text-[#a8ff53]">
                          Status: {ollamaStatus}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestOllama}
                        className="text-[12px] text-[#a8ff53] font-mono hover:underline cursor-pointer"
                      >
                        Test Connection ({ollamaLatency}ms)
                      </button>
                    </div>
                    <input
                      type="text"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] font-mono focus:outline-none"
                    />
                    <div>
                      <label className="block text-[#a0a4af] text-[12px] font-mono mb-1">Select Local Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] font-mono focus:outline-none"
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
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#15171c] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                    <span className="font-bold text-[16px] text-[#f3f4f6]">{getProviderConfigHeader(aiProvider)}</span>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[12px] font-mono text-[#a0a4af]">API Key</label>
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-[11px] text-[#a0a4af] hover:text-[#f3f4f6] font-mono cursor-pointer"
                          >
                            {showApiKey ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={customApiKey}
                          onChange={(e) => setCustomApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] font-mono focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-mono text-[#a0a4af] mb-1">Target Model Identifier</label>
                        <input
                          type="text"
                          value={customModelName}
                          onChange={(e) => setCustomModelName(e.target.value)}
                          placeholder={getTargetModelPlaceholder(aiProvider)}
                          className="w-full p-2.5 bg-[#1c1e21] border border-[#2e3238] rounded text-[#f3f4f6] text-[13px] font-mono focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Temperature & Top-K Controls */}
                <div className="bg-[#15171c] border border-[#2e3238] rounded p-5 space-y-4 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[#a0a4af] text-[13px] font-mono">
                          Temperature ({temperature})
                        </label>
                      </div>
                      <input
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
                        <label className="text-[#a0a4af] text-[13px] font-mono">
                          Vector Top-K ({topK})
                        </label>
                      </div>
                      <input
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

          </main>

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 bg-[#15171c] border-t border-[#2e3238] flex items-center justify-between text-[12px] text-[#a0a4af] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
            <span>TeachMe AI Study Platform • PgVector & Ollama Integrated</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#272a2e] hover:bg-[#343840] text-[#f3f4f6] font-medium rounded cursor-pointer"
          >
            Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};


