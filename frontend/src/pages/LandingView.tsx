import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Sparkles, ArrowRight, BookOpen, Layers, Cpu, FileText, CheckCircle2, Zap } from 'lucide-react';

interface Props {
  onExploreDemo?: () => void;
}

export const LandingView: React.FC<Props> = ({ onExploreDemo }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live Interactive Sandbox States
  const [sandboxTab, setSandboxTab] = useState<'chat' | 'citations' | 'quiz'>('chat');
  const [sandboxMessages, setSandboxMessages] = useState([
    { sender: 'user', text: "Explain Heisenberg's uncertainty principle." },
    { sender: 'ai', text: "The uncertainty principle states that you cannot simultaneously measure the exact position and momentum of a particle with absolute precision. **[1]** This is a fundamental limit of quantum systems." }
  ]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedQuizOpt, setSelectedQuizOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const handleLaunchDashboard = (targetPath: string = '/dashboard') => {
    if (onExploreDemo) onExploreDemo();
    navigate(targetPath);
  };

  const handleSandboxSend = () => {
    if (!sandboxInput.trim()) return;
    const userMsg = sandboxInput;
    setSandboxMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setSandboxInput('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = "";
      if (userMsg.toLowerCase().includes('quantum') || userMsg.toLowerCase().includes('physics')) {
        aiText = "Quantum systems exhibit wave-particle duality, meaning particles behave like waves of probabilities. **[2]**";
      } else if (userMsg.toLowerCase().includes('limit') || userMsg.toLowerCase().includes('uncertainty')) {
        aiText = "The uncertainty limit is dictated by Planck's constant (h/4π), preventing precise subatomic calculations. **[1]**";
      } else {
        aiText = "Based on your ingested notes, this topic forms the cornerstone of modern physical study and RRF vector retrieval. **[3]**";
      }
      setIsTyping(false);
      setSandboxMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 1200);
  };

  const sandboxCitations = [
    { index: 1, docName: 'Quantum_Physics.pdf', page: 42, text: "Planck's constant establishes the minimum quantum of action." },
    { index: 2, docName: 'Quantum_Physics.pdf', page: 55, text: "Wavefunctions map probability density configurations." },
    { index: 3, docName: 'Modern_Physics_101.pdf', page: 12, text: "Reciprocal Rank Fusion coordinates lexical and semantic indexes." }
  ];

  const sandboxQuiz = {
    question: "What is the mathematical relation describing the uncertainty principle?",
    options: [
      "Δx * Δp ≥ h / 4π",
      "E = mc²",
      "F = G * (m1*m2)/r²",
      "PV = nRT"
    ],
    correctIdx: 0,
    explanation: "Δx * Δp ≥ h / 4π is Heisenberg's relation, where Δx is uncertainty in position and Δp is uncertainty in momentum."
  };

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

    const secureRandom = () => {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return arr[0] / 4294967296;
    };

    const colors = ['#fde047', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#f97316', '#06b6d4'];
    const numLines = 50;

    const createLine = (randomX = false) => ({
      x: randomX ? secureRandom() * -width : -200,
      length: secureRandom() * 120 + 40,
      speed: secureRandom() * 3.5 + 2,
      color: colors[Math.floor(secureRandom() * colors.length)],
      thickness: secureRandom() > 0.7 ? 5 : 2.5,
      offsetY: (secureRandom() - 0.5) * 160,
    });

    const lines = Array.from({ length: numLines }, () => createLine(true));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerY = height / 2.2;
      const centerX = width / 2;
      const docLeft = centerX - 128;
      const docRight = centerX + 128;

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

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(docRight, centerY - 60);
      ctx.lineTo(centerX + 180, centerY - 60);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(docRight, centerY + 15);
      ctx.lineTo(centerX + 240, centerY + 15);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(docRight, centerY + 85);
      ctx.lineTo(centerX + 160, centerY + 85);
      ctx.stroke();

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
    <div className="bg-[#06060A] text-[#F8FAFC] min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-[#F97316]/30 relative">
      {/* Glow Effects in Background */}
      <div className="glow-ambient-orange top-[15%] left-[20%]" />
      <div className="glow-ambient-cyan top-[60%] right-[10%]" />

      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 z-30 relative max-w-7xl mx-auto w-full">
        {/* Shadcn Styled Brand Logo Button */}
        <button
          type="button"
          onClick={() => handleLaunchDashboard('/dashboard')}
          className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#F97316] rounded-xl p-1"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#06B6D4] to-[#D946EF] p-[1.5px] shadow-lg orange-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#06060A] rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#F97316] group-hover:text-[#06B6D4] transition-colors" />
            </div>
          </div>
          <div>
            <span className="font-heading text-base font-extrabold tracking-tight text-white uppercase block leading-none">
              TeachMe <span className="gradient-text-orange font-extrabold">AI</span>
            </span>
            <span className="text-[9px] text-[#06B6D4] font-mono tracking-widest uppercase">Academic Agent</span>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-semibold text-[#94A3B8] tracking-widest uppercase font-mono">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#sandbox" className="hover:text-white transition-colors">Live Sandbox</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative p-[1px] rounded-xl bg-gradient-to-r from-[#F97316] via-[#06B6D4] to-[#D946EF] hidden sm:block">
            <button
              onClick={() => handleLaunchDashboard('/dashboard')}
              className="px-5 py-2.5 bg-[#06060A] text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors rounded-[11px] text-white cursor-pointer"
            >
              Launch Dashboard
            </button>
          </div>

          <button
            onClick={() => handleLaunchDashboard('/login')}
            className="px-5 py-2.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all orange-glow cursor-pointer"
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
          <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-64 h-80 bg-[#0D0D17]/80 rounded-2xl shadow-2xl z-10 border border-white/5 flex flex-col p-6 glass-panel orange-glow">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#F97316]" />
              <span className="text-xs font-mono font-bold text-white truncate">Quantum_Physics.pdf</span>
            </div>
            <div className="w-20 h-2 bg-[#F97316]/50 rounded-sm mb-3" />
            <div className="w-32 h-2 bg-[#06B6D4]/50 rounded-sm mb-3" />
            <div className="w-24 h-2 bg-[#94A3B8]/30 rounded-sm mb-3" />
            <div className="w-40 h-2 bg-[#94A3B8]/20 rounded-sm mb-3" />
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
            className="absolute z-20 w-16 h-16 bg-[#D946EF] rounded-xl shadow-lg flex items-end p-2 transform -translate-y-1/2"
            style={{ left: 'calc(50% + 160px)', top: 'calc(42% + 85px)' }}
          >
            <span className="bg-white text-black text-[10px] font-mono px-1 rounded font-bold uppercase">
              SM-2
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className="z-20 relative max-w-3xl mt-auto pt-72">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>Local RAG Ingestion + Map-Reduce Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white font-heading">
            Unlock academic structure <br/> and insights <span className="gradient-text-orange font-extrabold">from any source.</span>
          </h1>

          <p className="mt-4 text-sm text-[#94A3B8] max-w-xl leading-relaxed">
            Upload PDFs, lecture slides, and notes. Stream AI responses with verified page citations, auto-generate 5-question quizzes, and master concepts using SM-2 spaced repetition.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={() => handleLaunchDashboard('/dashboard')}
              className="px-6 py-3.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all orange-glow flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunchDashboard('/documents')}
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Upload PDF Notes
            </button>
          </div>
        </div>
      </main>

      {/* Sandbox Preview Section */}
      <section id="sandbox" className="bg-[#0D0D17]/40 backdrop-blur-xl border-t border-white/5 py-20 px-6 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Copy */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-heading">
              Experience the Live <span className="gradient-text-orange font-extrabold">RAG Workspace</span>
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono uppercase tracking-wider">Interactive Interface Preview</p>
            <p className="text-sm text-[#94A3B8] leading-relaxed font-sans">
              Interact with our live simulation interface. Type a custom query, browse underlying document quotes in the Citation Canvas, or complete study quizzes to test your grasp of the topic.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs text-white font-medium font-sans">Verify accuracy with page-specific footnote highlights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
                <span className="text-xs text-white font-medium font-sans">Test active recall through custom multi-choice modules</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#D946EF]" />
                <span className="text-xs text-white font-medium font-sans">Coordinate semantic vectors in a sleek tabbed dashboard</span>
              </div>
            </div>
          </div>

          {/* Right Side: Interactive Sandbox Component */}
          <div className="lg:col-span-6 w-full min-h-[420px] bg-[#0D0D17]/85 border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col glass-panel">
            {/* Window bar */}
            <div className="bg-[#06060A]/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/60" />
              </div>
              <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider uppercase font-semibold">Live Sandbox Preview</span>
              <div className="w-12" />
            </div>

            {/* Sandbox Tabs */}
            <div className="bg-white/5 p-1 flex border-b border-white/5">
              <button 
                onClick={() => setSandboxTab('chat')}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${sandboxTab === 'chat' ? 'text-white bg-white/5 border border-white/5' : 'text-[#94A3B8] hover:text-white'}`}
              >
                AI Chat Response
              </button>
              <button 
                onClick={() => setSandboxTab('citations')}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${sandboxTab === 'citations' ? 'text-white bg-white/5 border border-white/5' : 'text-[#94A3B8] hover:text-white'}`}
              >
                Citation Canvas
              </button>
              <button 
                onClick={() => setSandboxTab('quiz')}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer ${sandboxTab === 'quiz' ? 'text-white bg-white/5 border border-white/5' : 'text-[#94A3B8] hover:text-white'}`}
              >
                Workspace Quiz
              </button>
            </div>

            {/* Sandbox Body Content */}
            <div className="flex-grow p-4 flex flex-col justify-between font-mono text-[11px] min-h-[300px]">
              
              {/* CHAT TAB */}
              {sandboxTab === 'chat' && (
                <div className="flex-grow flex flex-col justify-between h-full">
                  <div className="space-y-3.5 overflow-y-auto max-h-[200px] pr-1">
                    {sandboxMessages.map((msg, idx) => (
                      <div key={`sandbox-msg-${idx}-${msg.text.slice(0, 10)}`} className={`space-y-1.5 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className="flex items-center gap-1.5 text-[9px] text-[#94A3B8]">
                          <span className="font-semibold uppercase">{msg.sender === 'user' ? 'Student' : 'Tutor AI'}</span>
                        </div>
                        <div className={`p-3 rounded-xl border text-[11px] font-sans inline-block text-left ${msg.sender === 'user' ? 'bg-[#F97316]/10 border-[#F97316]/20 text-white' : 'bg-white/5 border-white/5 text-[#94A3B8]'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="text-left space-y-1.5">
                        <span className="text-[9px] text-[#94A3B8] font-semibold uppercase">Tutor AI</span>
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-[#94A3B8] font-sans italic animate-pulse">
                          Searching semantic vectors and streaming response...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input Footer */}
                  <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
                    <input
                      type="text"
                      value={sandboxInput}
                      onChange={(e) => setSandboxInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSandboxSend()}
                      placeholder="Ask: 'Explain quantum waves'..."
                      className="flex-grow bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[#F8FAFC] text-[11px] focus:outline-none focus:border-[#F97316]"
                    />
                    <button
                      onClick={handleSandboxSend}
                      className="bg-gradient-to-r from-[#F97316] to-[#D946EF] px-3.5 py-2 rounded-xl text-white font-bold text-[10px] cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* CITATIONS TAB */}
              {sandboxTab === 'citations' && (
                <div className="flex-grow space-y-3">
                  <div className="text-[10px] text-[#94A3B8] mb-1">CITED RECONSTRUCTED TEXT SEGMENTS:</div>
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {sandboxCitations.map((c) => (
                      <div key={c.index} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#06B6D4]/30 transition-all font-sans text-xs">
                        <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                          <span className="text-[#06B6D4] font-bold">[{c.index}]</span>
                          <span className="text-[#94A3B8]">{c.docName} • p. {c.page}</span>
                        </div>
                        <p className="text-[#94A3B8] italic">"{c.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QUIZ TAB */}
              {sandboxTab === 'quiz' && (
                <div className="flex-grow flex flex-col justify-between">
                  <div className="space-y-3 font-sans">
                    <p className="text-xs font-bold text-white leading-relaxed">
                      {sandboxQuiz.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {sandboxQuiz.options.map((opt, idx) => {
                        const isSelected = selectedQuizOpt === idx;
                        return (
                          <button
                            key={`sandbox-opt-${opt.slice(0, 15)}`}
                            onClick={() => {
                              if (quizScore === null) setSelectedQuizOpt(idx);
                            }}
                            className={`text-left p-2.5 rounded-xl text-[11px] transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#F97316]/10 to-[#D946EF]/5 border-[#F97316] text-white font-semibold'
                                : 'bg-white/5 border-white/5 text-[#94A3B8] hover:bg-white/10'
                            }`}
                          >
                            <span className="font-mono text-[#F97316] mr-1.5">{String.fromCodePoint(65 + idx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quiz Grade Result */}
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between font-sans">
                    {quizScore !== null ? (
                      <div className="text-left text-[11px] w-full">
                        <div className="flex justify-between items-center">
                          <p className={`font-bold ${quizScore === 100 ? 'text-[#06B6D4]' : 'text-[#EF4444]'}`}>
                            {quizScore === 100 ? '✓ Correct (100%)' : '✗ Incorrect (0%)'}
                          </p>
                          <button
                            onClick={() => {
                              setQuizScore(null);
                              setSelectedQuizOpt(null);
                            }}
                            className="text-[10px] text-[#F97316] hover:underline"
                          >
                            Reset Quiz
                          </button>
                        </div>
                        <p className="text-[#94A3B8] mt-1 leading-relaxed">{sandboxQuiz.explanation}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (selectedQuizOpt === sandboxQuiz.correctIdx) {
                            setQuizScore(100);
                          } else if (selectedQuizOpt !== null) {
                            setQuizScore(0);
                          }
                        }}
                        disabled={selectedQuizOpt === null}
                        className="bg-gradient-to-r from-[#F97316] to-[#D946EF] px-5 py-2.5 rounded-xl text-white font-bold text-xs orange-glow disabled:opacity-40 ml-auto cursor-pointer"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid Section with Shadcn Styled Badges */}
      <section id="features" className="bg-[#0D0D17]/40 backdrop-blur-xl border-t border-white/5 py-20 px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white tracking-tight font-heading">Enterprise Academic AI Stack</h2>
            <p className="text-xs text-[#94A3B8] mt-2 font-mono">
              Powered by Spring AI, pgvector RRF Hybrid Search, Map-Reduce Summaries, and SM-2 Spaced Repetition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="premium-card p-6 border border-white/5 rounded-2xl bg-[#0D0D17]/70 hover:border-[#06B6D4]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center mb-6 cyan-glow">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-3 font-heading flex items-center gap-2">
                <span>RRF Hybrid Search Chat</span>
                <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Combines pgvector similarity with PostgreSQL full-text search for exact keyword precision and semantic comprehension.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="premium-card p-6 border border-white/5 rounded-2xl bg-[#0D0D17]/70 hover:border-[#F97316]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#EA580C]/20 border border-[#F97316]/30 text-[#F97316] flex items-center justify-center mb-6 orange-glow">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-3 font-heading flex items-center gap-2">
                <span>Map-Reduce Summaries</span>
                <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Automatically triggers 1-page executive summaries across 50+ vector chunks in parallel for 100+ page textbooks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="premium-card p-6 border border-white/5 rounded-2xl bg-[#0D0D17]/70 hover:border-[#D946EF]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D946EF]/20 to-purple-600/20 border border-[#D946EF]/30 text-[#D946EF] flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-3 font-heading flex items-center gap-2">
                <span>SM-2 Spaced Repetition</span>
                <Zap className="w-3.5 h-3.5 text-[#D946EF]" />
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Highlight AI streaming responses to save flashcards. Evaluate recall quality (`Again`, `Hard`, `Good`, `Easy`) with custom ease factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-8 text-center text-xs font-mono text-[#94A3B8] z-20 bg-[#06060A]/80">
        <p>TeachMe AI Academic Assistant • Powered by Spring Boot, pgvector, React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default LandingView;
