# TeachMe Deployment Guide: Render (Backend) & Vercel (Frontend)

This guide provides step-by-step instructions to deploy the full **TeachMe AI Platform**:
- **Backend (Spring Boot + Java 25)** on **Render** (Docker runtime with PostgreSQL + pgvector)
- **Frontend (React + TypeScript + Vite)** on **Vercel**

---

## Architecture Overview

```
                               ┌────────────────────────────────────────┐
                               │           Vercel (Frontend)            │
                               │   React 19 + Vite + Tailwind CSS v4    │
                               │   https://teachme-frontend.vercel.app  │
                               └──────────────────┬─────────────────────┘
                                                  │
                                                  │ HTTPS / JWT Auth / SSE
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │           Render (Backend)             │
                               │     Spring Boot 4 + Java 25 Docker     │
                               │   https://teachme-backend.onrender.com │
                               └───────┬────────────────────────┬───────┘
                                       │                        │
                                       ▼                        ▼
               ┌───────────────────────────────┐  ┌───────────────────────────────┐
               │     Render PostgreSQL DB      │  │     External AI or Ollama     │
               │         (pgvector)            │  │  (Groq / OpenAI / Gemini / etc)│
               │   Cosine Distance Similarity  │  │  DeepSeek R1 / Llama 3.3 / UI │
               └───────────────────────────────┘  └───────────────────────────────┘
```

---

## Part 1: Deploy Backend to Render

### Option A: 1-Click Blueprint (Recommended)
1. Push your repository to **GitHub**.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically detect [`render.yaml`](file:///d:/TeachMe/render.yaml) and configure:
   - `teachme-backend` (Docker Web Service)
   - `teachme-db` (PostgreSQL with pgvector)
6. Click **Apply**.

---

### Option B: Manual Setup on Render

#### Step 1: Create PostgreSQL Database with pgvector
1. On Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `teachme-db`
3. Database: `vectordb`
4. User: `springai`
5. Region: Choose closest (e.g., `Oregon (US West)` or `Frankfurt (EU)`)
6. Plan: **Free** (or Starter)
7. Click **Create Database**.
8. Once created, copy the **Internal Database URL** (e.g. `postgres://springai:...@dpg-...:5432/vectordb`).

#### Step 2: Create Web Service for Backend
1. On Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name**: `teachme-backend`
   - **Language / Runtime**: **Docker**
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
   - **Instance Type / Plan**: **Free** (or Starter)
   - **Health Check Path**: `/actuator/health`
4. Add the following **Environment Variables**:

| Variable Key | Value / Source | Description |
|---|---|---|
| `DATABASE_URL` | From `teachme-db` (Connection String) | Auto-converted to JDBC format by `DatabaseConfig` |
| `SPRING_PROFILES_ACTIVE` | `docker` | Activates docker profile |
| `JWT_SECRET_KEY` | *(Generate a 256-bit random base64 string)* | Token signing key |
| `AI_PROVIDER` | `groq` *(or openai, gemini, deepseek)* | Default cloud AI provider |
| `AI_API_KEY` | *(Your provider API key)* | Server-side API key |
| `AI_MODEL` | `llama-3.3-70b-versatile` | Model identifier |
| `SPRING_AI_OLLAMA_BASE_URL` | `http://localhost:11434` *(or your GPU host)* | Fallback Ollama host endpoint |
| `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` | Allowed frontend origins |
| `PORT` | `8081` | Web server port |

5. Click **Create Web Service**.
6. When deployment finishes, copy your public backend URL (e.g. `https://teachme-backend.onrender.com`).

---

## Part 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Click Edit and select `frontend`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add:

| Variable Key | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://teachme-backend.onrender.com` | Your Render Backend URL |

6. Click **Deploy**.
7. Vercel will build and deploy your frontend in seconds (e.g. `https://teachme.vercel.app`).

---

## Part 3: Ollama & AI Provider Options

TeachMe works out-of-the-box in flexible modes:

### Mode 1: Cloud AI / Server-Side Key (Recommended for Cloud Deployments)
Configure `AI_PROVIDER` and `AI_API_KEY` on your backend server. TeachMe routes generation directly to the cloud provider (e.g., Groq, OpenAI, DeepSeek, Gemini, Anthropic), completely removing the requirement for expensive GPU hardware.

### Mode 2: Client Bring-Your-Own-Key (BYOK)
Students and developers can click the Key icon in the navigation bar or open the **AI Config** tab to enter their personal:
- **Groq API Key** (Free & Ultra-fast)
- **OpenAI API Key** (`gpt-4o-mini`, `gpt-4o`)
- **Anthropic Claude API Key** (`claude-3-5-sonnet`)
- **Google Gemini API Key** (`gemini-1.5-pro`, `gemini-2.0-flash`)
- **DeepSeek API Key** (`deepseek-chat`, `deepseek-reasoner`)
- **OpenRouter API Key** (`deepseek/deepseek-r1`)

*Keys are stored securely in browser `localStorage` and never saved to the server database.*

### Mode 3: Self-Hosted Ollama (Free & Private)
If you run a dedicated Ollama instance:
1. Deploy Ollama on a GPU VPS or RunPod.
2. Pull models:
   ```bash
   ollama pull deepseek-r1:8b
   ollama pull nomic-embed-text
   ```
3. Set `SPRING_AI_OLLAMA_BASE_URL` in your Render Web Service environment variables to your host URL.

---

## Post-Deployment Verification Checklist

- [x] **Backend Health**: Visit `https://your-backend.onrender.com/actuator/health` -> returns `{"status":"UP"}`.
- [x] **Swagger UI**: Visit `https://your-backend.onrender.com/swagger-ui/index.html` -> interactive API docs.
- [x] **Frontend Landing Page**: Visit `https://your-app.vercel.app` -> loads fast with design tokens and Geist fonts.
- [x] **Authentication**: Register a new user or click "One-click Demo" (Student / Researcher).
- [x] **Document RAG**: Upload a PDF document -> background thread chunks and vectorizes into PgVector.
- [x] **AI Tutor Chat**: Ask a question -> live token streaming via Server-Sent Events (SSE) with citations.
- [x] **Practice Quizzes**: Generate and submit an adaptive 5-question multiple choice quiz with instant grading.
- [x] **SM-2 Flashcards**: Review spaced repetition flashcards with quality rating [0-5] and export to Anki.
- [x] **Audio Podcast**: Listen to 2-speaker Alex & Maya lecture podcasts with live browser audio synthesis.
- [x] **Cornell Notes & Study Plan**: Generate hierarchical lecture outlines and download Markdown `.md` roadmaps.
