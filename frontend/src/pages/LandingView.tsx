import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Layers, MessageSquare, ShieldCheck, Cpu, FileText, CheckCircle2 } from 'lucide-react';

export const LandingView: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Data stream line configurations
    const colors = ['#fde047', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#f97316', '#06b6d4'];
    const numLines = 50;

    const createLine = (randomX = false) => ({
      x: randomX ? Math.random() * -width : -200,
      length: Math.random() * 120 + 40,
      speed: Math.random() * 3.5 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      thickness: Math.random() > 0.7 ? 5 : 2.5,
      offsetY: (Math.random() - 0.5) * 160,
    });

    const lines = Array.from({ length: numLines }, () => createLine(true));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2.2;
      const centerX = width / 2;
      const docLeft = centerX - 128;
      const docRight = centerX + 128;

      // 1. Output Grid (Right Side)
      const gridSpacing = 16;
      const gridStartX = docRight + 40;

      for (let x = gridStartX; x < width; x += gridSpacing) {
        for (let y = centerY - 120; y < centerY + 120; y += gridSpacing) {
          const opacity = Math.max(0, 1 - (x - gridStartX) / (width - gridStartX));
          if (opacity > 0) {
            ctx.fillStyle = `rgba(249, 115, 22, ${opacity * 0.08})`;
            ctx.fillRect(x, y, 4, 4);
          }
        }
      }

      // 2. Connecting Lines from Central Document to Extracted Format Blocks
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;

      // Line to PDF Block
      ctx.beginPath();
      ctx.moveTo(docRight, centerY - 60);
      ctx.lineTo(centerX + 180, centerY - 60);
      ctx.stroke();

      // Line to CSV/Quiz Block
      ctx.beginPath();
      ctx.moveTo(docRight, centerY + 15);
      ctx.lineTo(centerX + 240, centerY + 15);
      ctx.stroke();

      // Line to JSON/Flashcard Block
      ctx.beginPath();
      ctx.moveTo(docRight, centerY + 85);
      ctx.lineTo(centerX + 160, centerY + 85);
      ctx.stroke();

      // 3. Incoming Data Streams (Left Side to Central Document)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const yPos = centerY + line.offsetY;

        ctx.beginPath();
        ctx.moveTo(line.x, yPos);

        const endX = Math.min(line.x + line.length, docLeft);
        if (line.x < docLeft) {
          ctx.lineTo(endX, yPos);
          ctx.strokeStyle = line.color;
          ctx.lineWidth = line.thickness;
          ctx.stroke();
        }

        line.x += line.speed;

        if (line.x > docLeft) {
          lines[i] = createLine();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#0F0F0F] text-white min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#F97316]/30 relative">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 z-30 relative max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F97316] flex items-center justify-center orange-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white uppercase">
            TeachMe <span className="text-[#F97316]">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#A1A1AA] tracking-wider uppercase font-mono">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#rag" className="hover:text-white transition-colors">RAG Engine</a>
          <a href="#sm2" className="hover:text-white transition-colors">Spaced Repetition</a>
          <a href="#quizzes" className="hover:text-white transition-colors">Map-Reduce</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative p-[1px] rounded-lg bg-gradient-to-r from-[#F97316] via-[#06B6D4] to-[#F97316] hidden sm:block">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-[#0F0F0F] text-xs font-medium uppercase tracking-wider hover:bg-[#1A1A1A] transition-colors rounded-[7px] text-white"
            >
              Launch Dashboard
            </button>
          </div>

          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2.5 bg-[#F97316] text-white text-xs font-medium uppercase tracking-wider rounded-lg hover:bg-[#EA580C] transition-colors orange-glow"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Main Hero Area */}
      <main className="flex-grow relative flex flex-col justify-between pt-12 pb-16 z-10 max-w-7xl mx-auto w-full px-6">
        {/* Canvas Animation Container */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-full" />

          {/* Central Document Graphic */}
          <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-[#1A1A1A] rounded-2xl shadow-2xl z-10 border border-[#27272A] flex flex-col p-6 glass-panel orange-glow">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs font-mono font-bold text-white truncate">Quantum_Physics.pdf</span>
            </div>
            <div className="w-20 h-2 bg-[#F97316]/50 rounded-sm mb-3" />
            <div className="w-32 h-2 bg-[#06B6D4]/50 rounded-sm mb-3" />
            <div className="w-24 h-2 bg-[#A1A1AA]/30 rounded-sm mb-3" />
            <div className="w-40 h-2 bg-[#A1A1AA]/20 rounded-sm mb-3" />
            <div className="mt-auto w-full h-1 bg-gradient-to-r from-[#F97316] to-[#06B6D4] rounded-full" />
          </div>

          {/* Floating Extracted Data Blocks */}
          <div
            className="absolute z-20 w-16 h-16 bg-[#F97316] rounded-xl shadow-lg flex items-end p-2 transform -translate-y-1/2 orange-glow"
            style={{ left: 'calc(50% + 180px)', top: 'calc(42% - 60px)' }}
          >
            <span className="bg-white text-black text-[10px] font-mono px-1 rounded font-bold uppercase">
              RAG
            </span>
          </div>

          <div
            className="absolute z-20 w-14 h-14 bg-[#06B6D4] rounded-xl shadow-lg flex items-end p-2 transform -translate-y-1/2 cyan-glow"
            style={{ left: 'calc(50% + 240px)', top: 'calc(42% + 15px)' }}
          >
            <span className="bg-white text-black text-[10px] font-mono px-1 rounded font-bold uppercase">
              QUIZ
            </span>
          </div>

          <div
            className="absolute z-20 w-16 h-16 bg-[#A855F7] rounded-xl shadow-lg flex items-end p-2 transform -translate-y-1/2"
            style={{ left: 'calc(50% + 160px)', top: 'calc(42% + 85px)' }}
          >
            <span className="bg-white text-black text-[10px] font-mono px-1 rounded font-bold uppercase">
              SM-2
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="z-20 relative max-w-3xl mt-auto pt-72">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316] text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Local RAG Vector Ingestion + Map-Reduce Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
            Unlock structured academic intelligence <span className="text-[#F97316]">from any source.</span>
          </h1>

          <p className="mt-4 text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Upload PDFs, lecture slides, and notes. Stream AI responses with verified page citations, auto-generate 5-question quizzes, and master concepts using SM-2 spaced repetition.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all orange-glow flex items-center gap-2"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/documents')}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#27272A] border border-[#27272A] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all"
            >
              Upload PDF Notes
            </button>
          </div>
        </div>
      </main>

      {/* Feature Showcase Grid Section */}
      <section id="features" className="bg-[#1A1A1A]/80 border-t border-[#27272A] py-16 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Academic AI Stack</h2>
            <p className="text-xs text-[#A1A1AA] mt-1 font-mono">
              Powered by Spring AI, pgvector RRF Hybrid Search, Map-Reduce Summaries, and SM-2 Spaced Repetition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F0F0F] border border-[#27272A] rounded-2xl p-6 hover:border-[#F97316]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">RRF Hybrid Search Chat</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Combines pgvector similarity with PostgreSQL full-text search for exact keyword precision and semantic comprehension.
              </p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#27272A] rounded-2xl p-6 hover:border-[#06B6D4]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Map-Reduce Summaries</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Automatically triggers 1-page executive summaries across 50+ vector chunks in parallel for 100+ page textbooks.
              </p>
            </div>

            <div className="bg-[#0F0F0F] border border-[#27272A] rounded-2xl p-6 hover:border-[#F97316]/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">SM-2 Spaced Repetition</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Highlight AI streaming responses to save flashcards. Evaluate recall quality (`Again`, `Hard`, `Good`, `Easy`) with custom ease factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-6 px-8 text-center text-xs font-mono text-[#A1A1AA] z-20">
        <p>TeachMe AI Academic Assistant • Powered by Spring Boot, pgvector, React & Tailwind CSS</p>
      </footer>
    </div>
  );
};
