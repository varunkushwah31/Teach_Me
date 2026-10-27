# AI Deployment Options for TeachMe

## Current Architecture
- **Backend**: Spring Boot 4 + Spring AI 2.0 (Render Docker / Cloud)
- **Frontend**: React 19 + Vite + Tailwind CSS 4 (Vercel / Nginx)
- **Database**: PostgreSQL 16 with pgvector extension (Render / RDS / Supabase)
- **AI Engine**: Hybrid support for External Cloud AI (Groq, OpenAI, Gemini, DeepSeek, Anthropic, OpenRouter) and Local Ollama

---

## Option 1: Managed Cloud AI Providers (Recommended for Cost & Simplicity)

Using managed APIs eliminates GPU server costs, maintenance, and heavy cold-start latencies.

### Provider Comparison:
| Provider | Default Model | Speed | Cost (10k queries) | Best For |
|---|---|---|---|---|
| **Groq Cloud** | llama-3.3-70b-versatile | Ultra-Fast (~300 tps) | Free tier / ~$0.50 | Instant responses & zero cloud cost |
| **OpenAI** | gpt-4o-mini | Fast (~80 tps) | ~$1.50 - $3.00 | High reasoning quality & stability |
| **DeepSeek Cloud** | deepseek-chat | Fast (~60 tps) | ~$0.80 - $1.50 | Academic math & complex code synthesis |
| **Google Gemini** | gemini-2.0-flash | Fast (~90 tps) | Free tier / ~$1.00 | Multimodal context & long textbooks |
| **Anthropic** | claude-3-5-haiku | Fast (~75 tps) | ~$2.00 - $4.00 | Strict instruction adherence |
| **OpenRouter** | deepseek/deepseek-r1 | Variable | Pay-per-token | Multi-model routing flexibility |

### Server Configuration in `application-docker.yaml` or Render Environment:
```env
AI_PROVIDER=groq
AI_API_KEY=gsk_your_groq_api_key_here
AI_MODEL=llama-3.3-70b-versatile
```

---

## Option 2: Dedicated GPU Cloud (For Dedicated Self-Hosted Models)

If you require dedicated self-hosted open-weights models running on private hardware:

| Provider | GPU | Price per Hour | Best For |
|---|---|---|---|
| **RunPod** | RTX 3090 / 4090 | $0.34 - $0.74 | Low-cost dedicated inference |
| **Lambda Labs** | A100 (40GB/80GB) | $1.10 - $2.49 | High reliability & enterprise scale |
| **Vast.ai** | RTX 3090 / A5000 | $0.18 - $0.50 | Lowest spot pricing |

### RunPod Setup Instructions:
1. Deploy a Pod with Docker image `ollama/ollama:latest`.
2. Expose port 11434 with HTTP proxy enabled.
3. Obtain public endpoint URL: `https://<pod-id>-11434.proxy.runpod.net`.
4. Configure backend environment variable:
   ```env
   SPRING_AI_OLLAMA_BASE_URL=https://<pod-id>-11434.proxy.runpod.net
   ```
5. Pull required models:
   ```bash
   ollama pull deepseek-r1:8b
   ollama pull nomic-embed-text
   ```

---

## Option 3: Bring-Your-Own-Key (BYOK) Client Architecture

TeachMe includes native BYOK support:
- Users select their provider and enter their personal API key in the UI settings modal.
- Keys are kept exclusively in browser `localStorage`.
- During query processing, the frontend sends `X-AI-Provider` and `X-AI-Key` headers.
- The Spring Boot backend proxies requests directly to the corresponding provider, preventing browser CORS limitations and keeping server hosting costs at zero.

---

## Decision Matrix

| Scenario | Recommended Strategy |
|---|---|
| Free / Low Budget Cloud Deployment | Groq Cloud API (`AI_PROVIDER=groq`) |
| Production High Reliability | OpenAI `gpt-4o-mini` or DeepSeek Cloud |
| Zero Cloud API Dependencies | Dedicated GPU VPS with Ollama |
| Student Self-Service | BYOK Client Mode with personal keys |
