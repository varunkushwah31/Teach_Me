import React, { useState } from 'react';
import {
  DatabaseIcon,
  CpuIcon,
  BroadcastIcon,
  CheckIcon,
  CopyIcon,
  GitBranchIcon,
  TerminalIcon,
  HardDrivesIcon
} from '@phosphor-icons/react';

const ARCH_SNIPPETS = {
  stream: {
    title: 'teachMeService.ts',
    lang: 'typescript',
    code: `// High-velocity SSE stream reader with token telemetry
export async function* streamPromptTokens(
  prompt: string, 
  config: PlaygroundParameters,
  signal?: AbortSignal
): AsyncGenerator<{ token: string; ttftMs: number }, void, unknown> {
  const startTime = performance.now();
  let firstTokenLogged = false;

  const response = await fetch('/api/chat/ask/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, ...config }),
    signal
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const ttftMs = !firstTokenLogged ? Math.round(performance.now() - startTime) : 0;
    firstTokenLogged = true;

    yield { token: chunk, ttftMs };
  }
}`
  },
  pgvector: {
    title: 'pgvector_retrieval.sql',
    lang: 'sql',
    code: `-- PgVector HNSW Cosine Similarity Query in Neon Postgres
SELECT 
  doc_id,
  title,
  chunk_content,
  1 - (embedding <=> :query_embedding) AS similarity_score
FROM knowledge_chunks
WHERE 
  user_id = :current_user_id
  AND 1 - (embedding <=> :query_embedding) > 0.78
ORDER BY 
  embedding <=> :query_embedding ASC
LIMIT 6;

-- Create high-density HNSW vector index for sub-5ms lookup
CREATE INDEX IF NOT EXISTS idx_chunks_hnsw 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);`
  },
  neon: {
    title: 'application.yml (Neon Serverless)',
    lang: 'yaml',
    code: `# Neon Serverless Postgres with Connection Pooling
spring:
  datasource:
    url: \${NEON_DATABASE_URL:jdbc:postgresql://ep-fragrant-band-34155063-pooler.c-2.postgres.neon.tech/neondb?sslmode=require}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 2
      idle-timeout: 300000
      max-lifetime: 1200000
      connection-timeout: 20000
  ai:
    vectorstore:
      pgvector:
        index-type: HNSW
        distance-type: COSINE
        dimensions: 1536`
  }
};

type SnippetTab = 'stream' | 'pgvector' | 'neon';

export const ArchitectureSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SnippetTab>('stream');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(ARCH_SNIPPETS[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="architecture" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#1c1f2e] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-87.5 bg-indigo-950/20 blur-[140px] pointer-events-none rounded-full" />
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Engineered for sub-50ms token velocity.
        </h2>
        <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
          A high-precision stack orchestrating Neon serverless database pooling, PgVector semantic index search, and Spring AI reactive gateways.
        </p>
      </div>

      {/* Architecture Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-14">
        {/* Node 1: Edge Client */}
        <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 transition-all duration-300 relative group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
              <BroadcastIcon className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">Tier 1 • Client</div>
              <h3 className="text-sm font-bold text-white mt-0.5">Vite + React 19 Edge</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Reactive SSE reader parsing tokens as byte chunks with real-time TTFT and token velocity tracking.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1c1f2e] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Latency</span>
            <span className="text-emerald-400 font-semibold tabular-nums">&lt; 12ms</span>
          </div>
        </div>

        {/* Node 2: Spring Boot & MCP */}
        <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-indigo-500/40 transition-all duration-300 relative group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <CpuIcon className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-semibold">Tier 2 • Gateway</div>
              <h3 className="text-sm font-bold text-white mt-0.5">Spring AI &amp; MCP Router</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Model Context Protocol orchestrator with typed tool definitions and dynamic prompt templating.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1c1f2e] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Protocol</span>
            <span className="text-indigo-300 font-semibold">SSE + REST</span>
          </div>
        </div>

        {/* Node 3: Neon PgVector */}
        <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-cyan-500/40 transition-all duration-300 relative group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <DatabaseIcon className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-mono text-cyan-400/80 uppercase tracking-wider">Tier 3 • Storage</div>
              <h3 className="text-sm font-bold text-white mt-0.5">Neon Serverless PgVector</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Instant scale-to-zero compute with 1536-dimensional HNSW cosine index for instant RAG retrieval.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1c1f2e] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Cold Start</span>
            <span className="text-cyan-400 font-semibold tabular-nums">0.0ms</span>
          </div>
        </div>

        {/* Node 4: Multi-Model Mesh */}
        <div className="p-5 rounded-2xl bg-[#0e1017] border border-[#1c1f2e] hover:border-emerald-500/40 transition-all duration-300 relative group flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <HardDrivesIcon className="w-5 h-5" weight="duotone" />
            </div>
            <div>
              <div className="text-xs font-mono text-emerald-400/80 uppercase tracking-wider">Tier 4 • Intelligence</div>
              <h3 className="text-sm font-bold text-white mt-0.5">Multi-LLM Mesh</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Seamless switching between OpenAI GPT-4o, Anthropic Claude 3.5, Gemini 2.0 Flash, and DeepSeek-R1.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1c1f2e] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Failover</span>
            <span className="text-emerald-400 font-semibold">Automatic</span>
          </div>
        </div>
      </div>

      {/* Interactive Code Console */}
      <div className="rounded-2xl bg-[#090a10] border border-[#1c1f2e] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Terminal Header & Tabs */}
        <div className="px-4 py-3 bg-[#0d0f17] border-b border-[#1c1f2e] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex items-center gap-1 bg-[#121420] p-1 rounded-lg border border-[#1e2236]">
              <button
                onClick={() => setActiveTab('stream')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'stream'
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <TerminalIcon className="w-3 h-3" />
                SSE Stream Parser
              </button>
              <button
                onClick={() => setActiveTab('pgvector')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'pgvector'
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <DatabaseIcon className="w-3 h-3" />
                PgVector HNSW
              </button>
              <button
                onClick={() => setActiveTab('neon')}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'neon'
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <GitBranchIcon className="w-3 h-3" />
                Neon Pool Config
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">
              {ARCH_SNIPPETS[activeTab].title}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-[#141624] hover:bg-[#1a1c2e] border border-[#23263a] rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code View */}
        <div className="p-5 font-mono text-xs overflow-x-auto bg-[#07080c] leading-relaxed text-zinc-300 select-text">
          <pre className="tab-size-2">
            <code>{ARCH_SNIPPETS[activeTab].code}</code>
          </pre>
        </div>

        {/* Terminal Footer Bar */}
        <div className="px-4 py-2.5 bg-[#090a10] border-t border-[#1c1f2e] flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Live Serverless Gateway</span>
            </span>
            <span>TLS 1.3</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">UTF-8 SSE Protocol</span>
          </div>
        </div>
      </div>
    </section>
  );
};
