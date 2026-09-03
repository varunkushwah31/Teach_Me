/**
 * TeachMe TypeScript DTOs matching All Spring Boot Backend Endpoints
 */

export interface UserDTO {
  id: number;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  message?: string;
}

export interface CitationDTO {
  id: number;
  chatId: number;
  documentId: number;
  documentName: string;
  pageNumber: number;
  chunkId: string;
  excerpt: string;
  similarityScore: number;
}

export interface ChatHistoryDTO {
  id: number;
  chatId: string;
  question: string;
  answer: string;
  createdAt: string;
  citations?: CitationDTO[];
}

export interface DocumentHistoryDTO {
  id: number;
  filename?: string;
  fileName?: string;
  fileSize: number;
  fileType?: string;
  category?: string;
  chatId?: string;
  description?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | string;
  createdAt: string;
  updatedAt?: string;
  errorMessage?: string | null;
  chunkCount?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
}

export interface DocumentAnalyticsDTO {
  documentId: number;
  filename?: string;
  documentName?: string;
  totalWords: number;
  estimatedReadingMinutes?: number;
  estimatedReadingTimeMinutes?: number;
  readabilityGrade?: string;
  readabilityGradeLevel?: string;
  topKeywords?: string[];
  topExtractedKeywords?: string[];
  chunksCount?: number;
  chunkCount?: number;
}

export interface QuizQuestionDTO {
  id: number;
  questionText: string;
  questionOrder: number;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface QuizDTO {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  passScore: number;
  documentId: number;
  documentName?: string;
  questions: QuizQuestionDTO[];
  createdAt?: string;
}

export interface QuizFeedbackDTO {
  questionId: number;
  questionText: string;
  userAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResponseDTO {
  quizId: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  feedback: QuizFeedbackDTO[];
}

export interface FlashcardDTO {
  id: number;
  front: string;
  back: string;
  sourceContent?: string;
  deckName: string;
  documentId?: number;
  easeFactor: number;
  interval: number;
  repetitionNumber: number;
  nextReviewDate?: string;
  createdAt?: string;
}

export interface DocumentSummaryDTO {
  id: number;
  documentId: number;
  documentName: string;
  executiveSummary: string;
  summaryLength: number;
  wordCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface KnowledgeGraphDTO {
  documentId: number;
  nodes: Array<{ id: string; label: string; group?: string; weight?: number; description?: string }>;
  edges: Array<{ source: string; target: string; relationship: string }>;
}

export interface PodcastScriptDTO {
  documentId: number;
  title: string;
  durationMinutes: number;
  dialogue: Array<{
    speaker: 'Alex' | 'Maya';
    text: string;
  }>;
}

export interface ExamReadinessDTO {
  documentId: number;
  readinessScore: number; // 0-100
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_REVIEW' | 'CRITICAL';
  masteredTopics: string[];
  gapTopics: string[];
  recommendedActions: string[];
}

export interface NoteOutlineDTO {
  documentId: number;
  title: string;
  sections: Array<{
    heading: string;
    level: number;
    keyPoints: string[];
    formulas?: string[];
  }>;
}

export interface StudyPlanDayDTO {
  day: number;
  focusTopic: string;
  estimatedHours: number;
  tasks: string[];
  milestoneQuizId?: number;
}

export interface StudyPlanDTO {
  documentId: number;
  totalDays: number;
  planTitle: string;
  schedule: StudyPlanDayDTO[];
}

export interface SearchResultChunkDTO {
  chunkId: string;
  text: string;
  documentId: number;
  documentName: string;
  cosineScore: number;
  reRankScore: number;
}

export interface GroupWorkspaceDTO {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  sharedDocumentIds: number[];
  activeMembers: Array<{
    id: number;
    name: string;
    avatarColor: string;
    status: 'ACTIVE' | 'IDLE';
  }>;
}

export interface OllamaModelInfo {
  name: string;
  size: number;
  digest?: string;
  modified_at?: string;
}
