# TeachMe: College Notes PDF Chatbot with RAG

TeachMe is an academic AI learning platform and College Notes PDF Chatbot powered by Retrieval-Augmented Generation (RAG). Built with Spring Boot, Spring AI, PostgreSQL pgvector, and a React TypeScript frontend, TeachMe allows college students to upload lecture slides, syllabi, past exams, and textbook PDFs, and chat with their course material with verifiable page and chapter citations.

---

## Key Capabilities

### 1. College Notes PDF Ingestion & Semantic Chunking
- Ingests textbook PDFs and lecture slides using Apache Tika document reading.
- Partitions text into semantic chunks (512 tokens with overlap) to preserve lecture context.
- Generates high-dimensional dense vector embeddings using nomic-embed-text, OpenAI text-embedding-3-small, or Ollama embeddings.
- Stores vector embeddings in PostgreSQL using the pgvector extension with an HNSW cosine similarity index.

### 2. College Notes RAG Chatbot with Verifiable Citations
- Academic AI Tutor answering student queries using strictly retrieved context from uploaded notes.
- Citations in the format [1], [2], referencing exact document names, chapter headings, and page numbers.
- Prevents hallucinations through strict grounding instructions and context verification.
- Query rewriting to resolve conversational pronouns and multi-turn ambiguities.

### 3. Hybrid Search & Re-Ranking
- Combines dense pgvector cosine similarity search with PostgreSQL full-text search (tsvector).
- Applies Reciprocal Rank Fusion (RRF) to merge semantic understanding with exact acronym/keyword matching.
- Cross-encoder style re-ranking scoring chunks by keyword density and semantic relevance prior to LLM generation.

### 4. Active Recall & Exam Preparation
- **Diagnostic Quizzes**: Auto-generates Bloom-aligned 5-question multiple-choice quizzes with detailed rationales directly from uploaded lecture notes.
- **SM-2 Spaced Repetition Flashcards**: Highlight lecture concepts to create flashcards governed by the SuperMemo SM-2 algorithm with Anki deck export.
- **One-Click Map-Reduce Summaries**: Parallel chunk summarization synthesizing hundred-page chapters into structured executive briefs.
- **Cornell Note Outlines**: Generates structured 3-column Cornell study notes (cues, notes, summaries) and 5-day exam preparation roadmaps.
- **2-Speaker Audio Podcasts**: Synthesizes textbook chapters into conversational audio study episodes between two virtual study partners using browser speech synthesis.

---

## Technology Stack

- **Backend Framework**: Spring Boot 4.0.6, Java 25
- **AI Abstraction**: Spring AI 2.0.0-RC1
- **Database & Vector Store**: PostgreSQL 16+ with pgvector extension
- **Document Parser**: Apache Tika (spring-ai-tika-document-reader)
- **Security & Auth**: Spring Security 6, JWT (io.jsonwebtoken 0.13.0), BCrypt, Rate Limiting (Bucket4j)
- **Frontend Framework**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Icons**: Phosphor Icons (@phosphor-icons/react)
- **LLM Providers**: Local Ollama (deepseek-r1:8b, llama3:8b) or Bring-Your-Own API Keys (OpenAI, Anthropic Claude, Google Gemini, Groq)

---

## Getting Started

### Prerequisites
- Java 25 JDK
- Maven 3.9+
- Node.js 20+ and npm
- PostgreSQL with pgvector (or Docker Compose)
- Ollama (optional, for local offline inference)

### 1. Database Setup with Docker Compose
```bash
docker compose up -d postgres
```

### 2. Run the Spring Boot Backend
```bash
mvn spring-boot:run
```
The backend server runs on `http://localhost:8081` with OpenAPI documentation at `http://localhost:8081/swagger-ui.html`.

### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend development server starts on `http://localhost:5173`.

---

## API Endpoints Reference

### Document Management
- `POST /api/documents/upload`: Upload PDF notes with category and session identifier.
- `GET /api/history/documents`: Retrieve paginated document history and chunk status.
- `GET /api/documents/{id}/analytics`: Word count, chunk count, and readability scores.

### RAG Chatbot & External AI
- `POST /api/chat/ask/stream`: Stream RAG response tokens with citation links (supports `X-AI-Provider`, `X-AI-Key`, `X-AI-Model` headers).
- `GET /api/citations/chat/{chatId}`: Retrieve exact citations and quotes for a chat session.
- `POST /api/ai/test-connection`: Test connection to any AI provider (Groq, OpenAI, Gemini, DeepSeek, Anthropic, OpenRouter, Ollama).
- `GET /api/ai/models`: Enumerate available models for a specified provider.
- `GET /api/ai/config`: Retrieve server-configured active AI provider and model.

### Study Tools
- `POST /api/quiz/generate/{documentId}`: Generate a 5-question quiz from document chunks.
- `POST /api/flashcards/create`: Save a flashcard with SM-2 spaced repetition parameters.
- `POST /api/summary/generate/{documentId}`: Trigger asynchronous Map-Reduce document summarization.
- `GET /api/podcast/script/{documentId}`: Generate 2-speaker podcast dialogue script.

---

## External AI Configuration (Cloud Deployments)

TeachMe is fully external AI compatible, allowing deployment without local GPU hardware. Configure external AI via environment variables:

```env
AI_PROVIDER=groq
AI_API_KEY=gsk_your_groq_api_key_here
AI_MODEL=llama-3.3-70b-versatile
AI_TEMPERATURE=0.7
```

Supported providers: `groq`, `openai`, `openrouter`, `deepseek`, `gemini`, `anthropic`, and `ollama`. In addition, users can provide custom API keys directly through the frontend UI settings modal.
