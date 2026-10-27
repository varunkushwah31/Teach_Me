# TeachMe - Deployment Summary

## Overview of Components

### Backend (Docker -> Render / Cloud)
| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build for Spring Boot application |
| `render.yaml` | Render.com Infrastructure as Code specification |
| `src/main/resources/application.yaml` | Local development Spring configuration |
| `src/main/resources/application-docker.yaml` | Docker and Cloud production configuration |

### Frontend (Docker Compose -> Vercel / Cloudflare)
| File | Purpose |
|---|---|
| `frontend/Dockerfile` | Production container build with Nginx |
| `frontend/nginx.conf` | Reverse proxy routing /api requests to backend |
| `frontend/vercel.json` | Vercel SPA routing and deployment configuration |

### Local Development
| File | Purpose |
|---|---|
| `docker-compose.yml` | Full local stack (Postgres pgvector + Ollama + Backend + Frontend) |
| `.dockerignore` | Build context optimization |

### Production Self-Hosted
| File | Purpose |
|---|---|
| `docker-compose.prod.yml` | Production configuration with isolated networks and volumes |
| `OLLAMA_DEPLOYMENT_OPTIONS.md` | Cloud AI vs self-hosted GPU comparison |

---

## Quick Start Commands

### Local Development with Docker Compose
```bash
# Start all 4 containers (Database, Ollama, Backend, Frontend)
docker compose up -d

# View backend logs
docker compose logs -f backend

# Stop all containers
docker compose down
```

### Deploy Backend to Render
1. Push repository to GitHub.
2. Link repository in Render dashboard.
3. Render automatically reads `render.yaml`.
4. Configure environment variables in the Render dashboard.
5. Deploy service.

### Deploy Frontend to Vercel
1. Import repository in Vercel.
2. Set Root Directory to `frontend`.
3. Vercel automatically detects Vite.
4. Set environment variable `VITE_API_URL` to your Render backend URL (e.g., `https://teachme-backend.onrender.com`).
5. Deploy.

---

## Environment Variables Configuration

### Backend Server Configuration (Render / Cloud / VPS)

#### Core Database & Security
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/<dbname>
SPRING_DATASOURCE_USERNAME=<db_user>
SPRING_DATASOURCE_PASSWORD=<db_password>
JWT_SECRET_KEY=<64_character_hex_key>
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
SPRING_PROFILES_ACTIVE=docker
```

#### External AI Provider Configuration (No Local GPU Required)
When deploying to Render, Railway, or AWS where a local GPU Ollama instance is not available or too expensive, configure the server-side External AI variables:

```env
# Provider options: groq, openai, openrouter, deepseek, gemini, anthropic, ollama
AI_PROVIDER=groq

# API key for the chosen provider
AI_API_KEY=gsk_your_groq_api_key_here

# Base URL (optional, defaults to official provider endpoint)
# AI_BASE_URL=https://api.groq.com/openai/v1

# Model ID
AI_MODEL=llama-3.3-70b-versatile

# Temperature (0.0 to 1.0, default 0.7)
AI_TEMPERATURE=0.7
```

#### Local Ollama (When Running Self-Hosted or Local GPU)
```env
SPRING_AI_OLLAMA_BASE_URL=http://ollama:11434
```

### Frontend Configuration (Vercel / Netlify / Cloudflare Pages)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Client-Side Bring-Your-Own-Key (BYOK) Architecture

TeachMe supports zero-cost server hosting through user-supplied API keys:

1. **Student API Key Modal**: Users can click the Key icon in the navigation bar to choose from 7 AI providers:
   - Groq Cloud (Free tier, ultra-fast generation)
   - OpenAI (GPT-4o, GPT-4o-mini)
   - Anthropic Claude (Claude 3.5 Sonnet, Claude 3.5 Haiku)
   - Google Gemini (Gemini 2.0 Flash, Gemini 1.5 Pro)
   - DeepSeek Cloud (DeepSeek V3, DeepSeek R1)
   - OpenRouter (Multi-LLM router)
   - Local Ollama (Self-hosted daemon)

2. **Security & Privacy**:
   - Keys are stored solely in the client browser `localStorage`.
   - Keys are transmitted via `X-AI-Key` and `X-AI-Provider` headers during RAG chat queries.
   - Keys are never persisted to the server database.

3. **Backend Dynamic Routing**:
   - If a request includes `X-AI-Key` or `X-AI-Provider`, `RagChatServiceImpl` delegates token streaming to `ExternalAiServiceImpl`.
   - If no custom key is provided, the backend falls back to the server-configured `AI_PROVIDER` or the local Ollama instance.

---

## API Endpoints for Diagnostics & Management

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/test-connection` | Diagnostic ping testing API key validity, latency, and model access |
| `GET` | `/api/ai/models?provider={provider}` | Enumerate supported models for a given provider |
| `GET` | `/api/ai/config` | Retrieve server active provider and default model metadata |
| `POST` | `/api/chat/ask/stream` | Stream RAG responses with citation metadata |

---

## Verification Checklist

- [x] Docker Compose starts all 4 containers cleanly (`teachme-db`, `teachme-ollama`, `teachme-backend`, `teachme-frontend`).
- [x] Backend passes all 21 unit and integration tests (`mvn test`).
- [x] Frontend builds with zero TypeScript errors (`npm run build`).
- [x] `/api/ai/test-connection` returns live latency and connection diagnostics.
- [x] External AI streaming executes via OpenAI-compatible and Anthropic protocols.
- [x] Zero emojis present across code, comments, logs, and UI components.
