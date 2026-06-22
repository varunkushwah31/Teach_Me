# TeachMe - Advanced Features Implementation Guide

## Overview

This document describes the implementation of 6 advanced features for the TeachMe platform, a local AI document analyzer with Spring Boot backend and React frontend.

---

## 1. Auto-Quiz Generation

### Feature Description
Automatically generates 5-question multiple-choice quizzes from document content using AI.

### Backend Implementation

**Endpoint:**
```
POST /api/quiz/generate/{documentId}
```

**Response:**
```json
{
  "id": 1,
  "title": "Document Quiz",
  "description": "Quiz generated from document",
  "totalQuestions": 5,
  "passScore": 80,
  "questions": [
    {
      "id": 1,
      "questionText": "What is...?",
      "questionOrder": 0,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "This is why option A is correct..."
    }
  ],
  "documentId": 1,
  "documentName": "document.pdf"
}
```

**Service:** `QuizGenerationService`
- Retrieves document chunks from vector store
- Sends vectorized chunks to AI with prompt
- Parses JSON response
- Stores quiz and questions in database

**Frontend Implementation:**
```typescript
// Add "Quiz Me" button on Document Library page
<button onClick={() => generateQuiz(documentId)}>Quiz Me</button>

// Quiz Component
function QuizComponent({ quiz }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  
  const submitQuiz = () => {
    // POST /api/quiz/submit/{quizId}
    // Display results and feedback
  };
}
```

---

## 2. Flashcard Extraction with Spaced Repetition

### Feature Description
Users can highlight AI responses and save them as flashcards with SM-2 spaced repetition algorithm.

### Backend Implementation

**Endpoints:**
```
POST /api/flashcards/create              # Create new flashcard
GET  /api/flashcards/my-cards            # Get user's flashcards (paginated)
GET  /api/flashcards/deck/{deckName}     # Get flashcards in a deck
GET  /api/flashcards/due                 # Get flashcards due for review
POST /api/flashcards/{id}/review         # Submit review (quality 0-5)
DELETE /api/flashcards/{id}              # Delete flashcard
```

**Create Flashcard Request:**
```json
{
  "front": "What is Machine Learning?",
  "back": "Machine Learning is a subset of AI...",
  "sourceContent": "Full AI response text",
  "deckName": "AI Fundamentals",
  "documentId": 1
}
```

**Service:** `FlashcardService`
- Implements SM-2 Algorithm for spaced repetition
- Calculates next review date based on ease factor
- Manages decks and review scheduling

**SM-2 Algorithm Implementation:**
```
New EF := EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
if EF < 1.3, EF := 1.3

If q < 3:
  I(1) := 1
  I(2) := 3
  ...rest

If q >= 3:
  I(n) := I(n-1) * EF
```

**Frontend Implementation:**
```typescript
// Highlight text from AI response
function saveAsFlashcard(selectedText) {
  const payload = {
    front: selectedText,
    back: fullAIResponse,
    deckName: userSelectedDeck
  };
  await fetch('/api/flashcards/create', { method: 'POST', body: JSON.stringify(payload) });
}

// Review component
function FlashcardReviewer() {
  const [card, setCard] = useState(null);
  const handleReview = (quality) => {
    // POST /api/flashcards/{id}/review with quality (0-5)
    // Update next review date calculation
  };
}
```

---

## 3. One-Click Summarization with Map-Reduce

### Feature Description
Automatically generates 1-page executive summaries for large documents using Map-Reduce prompting.

### Backend Implementation

**Endpoints:**
```
POST /api/summary/generate/{documentId}   # Trigger async summarization
GET  /api/summary/{documentId}            # Get summary status and content
```

**Service:** `DocumentSummarizationService`

**Map-Reduce Strategy:**
1. **MAP PHASE:** Summarize each document chunk (50+ chunks) in parallel
   - 2-3 sentence summaries per chunk
   - Extract key points and facts

2. **REDUCE PHASE:** Combine chunk summaries
   - Generate cohesive 250-400 word summary
   - Maintain logical flow
   - Eliminate redundancy

**Auto-Trigger:** Summarization automatically starts for documents with 50+ chunks (≈100+ pages)

**Response:**
```json
{
  "id": 1,
  "documentId": 1,
  "documentName": "large_document.pdf",
  "executiveSummary": "This document covers...",
  "summaryLength": 1452,
  "wordCount": 285,
  "status": "COMPLETED",
  "createdAt": "2024-06-22T10:30:00"
}
```

**Frontend Implementation:**
```typescript
// Display on Document Detail Page
function DocumentDetailPage({ documentId }) {
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    // Polling for summary completion
    const pollSummary = setInterval(() => {
      fetch(`/api/summary/${documentId}`)
        .then(r => r.json())
        .then(data => {
          if (data.status === 'COMPLETED') {
            setSummary(data);
            clearInterval(pollSummary);
          }
        });
    }, 2000);
  }, [documentId]);
  
  return <div>{summary?.executiveSummary}</div>;
}
```

---

## 4. Hybrid Search with RRF (Reciprocal Rank Fusion)

### Feature Description
Combines pgvector similarity search with PostgreSQL Full-Text Search using Reciprocal Rank Fusion.

### Problem Solved
- **Vector Search:** Excellent at semantic meaning but struggles with exact matches (NASA, ID numbers)
- **Full-Text Search:** Perfect for acronyms and specific terms but misses semantic context
- **RRF:** Intelligently combines both methods

### Backend Implementation

**Service:** `HybridSearchService`

**Algorithm:**
1. Vector similarity search (top 8 results)
2. PostgreSQL tsvector full-text search (top 8 results)
3. Reciprocal Rank Fusion scoring:
   ```
   RRF_Score = Σ(1 / (k + rank))
   where k = 60 (constant), rank = position in result set
   ```

**Database Requirements:**
```sql
-- Ensure tsvector column exists on vector_store table
ALTER TABLE vector_store ADD COLUMN IF NOT EXISTS document_text_search tsvector;

-- Create index for performance
CREATE INDEX idx_document_text_search ON vector_store USING gin(document_text_search);

-- Update trigger to populate tsvector
CREATE TRIGGER update_document_text_search BEFORE INSERT OR UPDATE
  ON vector_store FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(document_text_search, 'pg_catalog.english', content);
```

**Example Query:**
```
Query: "NASA Apollo program"
- Vector search: ["apollo", "moon", "space", ...]
- FTS: ["NASA", "mission", "apollo", ...]
- RRF combines: Prioritizes "Apollo" and "NASA" based on combined ranking
```

### Frontend Usage
Users experience no change - hybrid search happens transparently in the backend during chat queries.

---

## 5. Verifiable Citations

### Feature Description
AI responses include citations in format "[1]", "[2]" referencing source documents with clickable footnote badges.

### Backend Implementation

**Service:** `CitationService`

**Citation Extraction:**
1. Parse AI response for citation patterns `[1]`, `[2]`, etc.
2. Match with source chunks
3. Extract page numbers and quotes

**Database Schema:**
```sql
CREATE TABLE citations (
  id BIGINT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  citation_index INT NOT NULL,
  document_name VARCHAR(255),
  page_number INT,
  quote TEXT,
  source_chunk_id VARCHAR(255)
);
```

**Entity:** `Citation`
```java
@Entity
public class Citation {
    private Integer citationIndex;      // [1], [2], etc.
    private String documentName;
    private Integer pageNumber;
    private String quote;              // Exact text from source
    private String sourceChunkId;      // Reference to vector chunk
}
```

**Updated Prompt in RagChatService:**
```
"When citing information from the context, include citations in the format [1], [2], etc.
Example: 'According to the documentation [1], the process works as follows...'"
```

**Endpoint:**
```
GET /api/citations/chat/{chatId}
```

**Response:**
```json
[
  {
    "id": 1,
    "citationIndex": 1,
    "documentName": "document.pdf",
    "pageNumber": 4,
    "quote": "The process involves several steps...",
    "sourceChunkId": "chunk_0"
  }
]
```

**Frontend Implementation:**
```typescript
// Chat response with citations
function ChatResponse({ answer, citations }) {
  const parseWithCitations = (text) => {
    return text.split(/(\[\d+\])/g).map((part, idx) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const citationIndex = parseInt(match[1]);
        const citation = citations.find(c => c.citationIndex === citationIndex);
        return (
          <span key={idx} className="citation-badge">
            <Tooltip title={citation?.quote}>
              <sup>[{citationIndex}]</sup>
            </Tooltip>
          </span>
        );
      }
      return part;
    });
  };
  
  return <div>{parseWithCitations(answer)}</div>;
}

// Footnotes display
function CitationFootnotes({ citations }) {
  return (
    <div className="citations">
      {citations.map(c => (
        <div key={c.id} className="footnote">
          [{c.citationIndex}] <strong>{c.documentName}</strong>
          {c.pageNumber && ` (Page ${c.pageNumber})`}: "{c.quote}"
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Re-ranking (Cross-Encoder Style)

### Feature Description
Re-ranks retrieved chunks before sending to LLM to ensure the most relevant chunks are used.

### Problem Solved
Vector database retrieves 5 chunks, but chunk #4 is actually the best answer. Re-ranking ensures top-4 are optimal.

### Backend Implementation

**Service:** `ReRankingService`

**Algorithm:**
1. Retrieve initial chunks from hybrid search (8 results)
2. Score each chunk for relevance:
   - Keyword matching (30% weight)
   - LLM-based semantic scoring (70% weight)
3. Sort by combined score
4. Return top 4

**Relevance Scoring:**
```java
double keywordScore = countMatches(queryTerms, chunkText);
double semanticScore = callLLM("Rate relevance of chunk to query: " + query);
double totalScore = (keywordScore * 0.3) + (semanticScore * 0.7);
```

**LLM Scoring Prompt:**
```
"Rate how relevant this text chunk is to the query 'X' on a scale of 0-10"
Response: Simple number (0-10)
```

**Integration in RagChatService:**
```java
List<Document> reRankedDocuments = reRankingService.reRankChunks(
    optimizedQuery, 
    similarDocuments, 
    4  // Keep top 4 after re-ranking
);
```

---

## Database Schema Updates

Run these migrations to support new features:

```sql
-- Quiz tables
CREATE TABLE quizzes (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_questions INT NOT NULL,
  pass_score INT,
  document_id BIGINT REFERENCES documents(id),
  user_id BIGINT REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE quiz_questions (
  id BIGINT PRIMARY KEY,
  quiz_id BIGINT REFERENCES quizzes(id),
  question_text TEXT NOT NULL,
  question_order INT NOT NULL,
  correct_answer_index INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP
);

CREATE TABLE quiz_question_options (
  question_id BIGINT REFERENCES quiz_questions(id),
  option_order INT,
  option_text TEXT
);

-- Flashcard table
CREATE TABLE flashcards (
  id BIGINT PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  document_id BIGINT REFERENCES documents(id),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  source_content TEXT,
  repetition_count INT DEFAULT 0,
  ease_factor DOUBLE DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  next_review_date TIMESTAMP,
  deck_name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Document summary table
CREATE TABLE document_summaries (
  id BIGINT PRIMARY KEY,
  document_id BIGINT UNIQUE REFERENCES documents(id),
  executive_summary TEXT NOT NULL,
  summary_length INT,
  word_count INT,
  status VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Citation table
CREATE TABLE citations (
  id BIGINT PRIMARY KEY,
  chat_id BIGINT REFERENCES chats(id),
  citation_index INT,
  document_name VARCHAR(255),
  page_number INT,
  quote TEXT,
  source_chunk_id VARCHAR(255)
);

-- Add citations relationship to chats
ALTER TABLE chats ADD COLUMN citations_json TEXT;
```

---

## API Summary

### Quiz API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/quiz/generate/{documentId}` | Generate quiz for document |
| GET | `/api/quiz/{quizId}` | Get quiz details |
| POST | `/api/quiz/submit/{quizId}` | Submit answers and get score |

### Flashcard API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/flashcards/create` | Create new flashcard |
| GET | `/api/flashcards/my-cards` | List user's flashcards |
| GET | `/api/flashcards/deck/{deckName}` | Flashcards in specific deck |
| GET | `/api/flashcards/due` | Flashcards due for review |
| POST | `/api/flashcards/{id}/review` | Review flashcard (SM-2) |
| DELETE | `/api/flashcards/{id}` | Delete flashcard |

### Summary API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/summary/generate/{documentId}` | Start async summarization |
| GET | `/api/summary/{documentId}` | Get summary status |

### Citation API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/citations/chat/{chatId}` | Get citations for chat |

### Document API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/documents/{documentId}/generate-quiz` | Generate quiz from library |

---

## Configuration

Add to `application.yaml`:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

# Enable async processing
async:
  executor:
    core-pool-size: 5
    max-pool-size: 10
    queue-capacity: 100
```

---

## Testing

### Quiz Generation
```bash
curl -X POST http://localhost:8080/api/quiz/generate/1
```

### Create Flashcard
```bash
curl -X POST http://localhost:8080/api/flashcards/create \
  -H "Content-Type: application/json" \
  -d '{
    "front": "What is AI?",
    "back": "Artificial Intelligence...",
    "deckName": "AI101",
    "documentId": 1
  }'
```

### Get Due Flashcards
```bash
curl http://localhost:8080/api/flashcards/due
```

### Generate Summary
```bash
curl -X POST http://localhost:8080/api/summary/generate/1
```

---

## Performance Considerations

1. **Quiz Generation:** Runs on a small subset of chunks - ~2-5 seconds
2. **Summarization:** Uses parallel chunk processing - 30-60 seconds for 100-page docs
3. **Hybrid Search:** Vector + FTS combined - ~500-800ms per query
4. **Re-ranking:** LLM-based scoring adds ~2-3 seconds
5. **All async operations:** Don't block user interactions

## Future Enhancements

- [ ] More quiz formats (essay, fill-in-blank)
- [ ] Leaderboards for quiz scores
- [ ] Collaborative study decks
- [ ] Advanced re-ranking with actual cross-encoder models
- [ ] Multi-language support
- [ ] Batch citation export

