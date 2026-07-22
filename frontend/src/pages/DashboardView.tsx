import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChartComponent } from '../components/ui/AreaChartComponent';
import { RadarChartComponent } from '../components/ui/RadarChartComponent';
import { FileText, Award, Clock, ArrowUpRight, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans relative">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Academic <span className="gradient-text-orange font-extrabold">Overview</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">Real-time RAG ingestion analytics & study performance overview.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="cyan">+12 Document Chunks Vectorized Today</Badge>
        </div>
      </div>

      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="default" className="relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#F97316]/10 to-[#EA580C]/5 border border-orange-500/10">
              <FileText className="w-5 h-5 transition-transform group-hover:scale-110 duration-300 text-[#F97316]" />
            </div>
            <Badge variant="cyan">+4 this week</Badge>
          </div>
          <p className="text-xs text-[#94A3B8] font-semibold tracking-wider uppercase font-mono">Total Documents</p>
          <p className="text-3xl font-extrabold font-mono text-white mt-1.5">1,248</p>
          <p className="text-[11px] text-[#94A3B8] font-mono mt-3">Map-Reduce summaries active</p>
        </Card>

        <Card variant="default" className="relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#06B6D4]/10 to-blue-500/5 border border-[#06B6D4]/10">
              <Award className="w-5 h-5 transition-transform group-hover:scale-110 duration-300 text-[#06B6D4]" />
            </div>
            <Badge variant="orange">+85% accuracy</Badge>
          </div>
          <p className="text-xs text-[#94A3B8] font-semibold tracking-wider uppercase font-mono">Flashcards Mastered</p>
          <p className="text-3xl font-extrabold font-mono text-white mt-1.5">342</p>
          <p className="text-[11px] text-[#94A3B8] font-mono mt-3">12 due for review today</p>
        </Card>

        <Card variant="default" className="relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#D946EF]/10 to-violet-500/5 border border-[#D946EF]/10">
              <Clock className="w-5 h-5 transition-transform group-hover:scale-110 duration-300 text-[#D946EF]" />
            </div>
            <Badge variant="cyan">+3.5h vs last week</Badge>
          </div>
          <p className="text-xs text-[#94A3B8] font-semibold tracking-wider uppercase font-mono">Hours Studied</p>
          <p className="text-3xl font-extrabold font-mono text-white mt-1.5">38.4 hrs</p>
          <p className="text-[11px] text-[#94A3B8] font-mono mt-3">RRF Hybrid Search active</p>
        </Card>
      </div>

      {/* Middle Row: AreaChart (2/3) + RadarChart (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="default" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading">Study Progress & Analysis Volume</h2>
              <p className="text-[11px] text-[#94A3B8] font-mono">Weekly progression of ingested documents vs review hours</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono font-semibold">
              <span className="flex items-center gap-1.5 text-[#F97316]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] orange-glow" /> Documents
              </span>
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] cyan-glow" /> Hours
              </span>
            </div>
          </div>
          <AreaChartComponent />
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading">Quiz Performance</h2>
              <p className="text-[11px] text-[#94A3B8] font-mono">Subject proficiency scores</p>
            </div>
            <Badge variant="orange">82% Avg</Badge>
          </div>
          <RadarChartComponent />
        </Card>
      </div>

      {/* Bottom Row: Recent Activity (1/2) + Top Documents Table (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card variant="default">
          <h2 className="text-sm font-bold text-white mb-4 tracking-wide uppercase font-heading">Recent Activity Feed</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 hover:bg-white/10 transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-semibold text-xs">Generated Map-Reduce Summary</p>
                <p className="text-[#94A3B8] text-[11px] mt-0.5">Quantum_Physics_Notes.pdf • 285 words extracted</p>
              </div>
              <span className="text-[10px] text-[#94A3B8]">10m ago</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 hover:bg-white/10 transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-[#F97316]/15 text-[#F97316] mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-semibold text-xs">AI Tutor Streaming Session</p>
                <p className="text-[#94A3B8] text-[11px] mt-0.5">Discussed Heisenberg uncertainty principle & citations [1]</p>
              </div>
              <span className="text-[10px] text-[#94A3B8]">1h ago</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3 hover:bg-white/10 transition-all duration-200">
              <div className="p-1.5 rounded-lg bg-[#D946EF]/15 text-[#D946EF] mt-0.5">
                <Award className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-semibold text-xs">Completed 5-Question Quiz</p>
                <p className="text-[#94A3B8] text-[11px] mt-0.5">Scored 100% on Organic Reaction Mechanisms</p>
              </div>
              <span className="text-[10px] text-[#94A3B8]">3h ago</span>
            </div>
          </div>
        </Card>

        {/* Top Documents Table */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-heading">Top Analyzed Documents</h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-[#F97316] hover:underline flex items-center gap-1 font-mono uppercase tracking-wider font-semibold cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#94A3B8]">
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Document Name</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Category</th>
                  <th className="pb-3 font-semibold uppercase tracking-wider text-[11px]">Status</th>
                  <th className="pb-3 text-right font-semibold uppercase tracking-wider text-[11px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-sans font-semibold text-white">Quantum_Physics.pdf</td>
                  <td className="py-3 text-[#94A3B8]">Physics</td>
                  <td className="py-3"><Badge variant="cyan">Analyzed</Badge></td>
                  <td className="py-3 text-right">
                    <button onClick={() => navigate('/chat')} className="text-[#F97316] hover:underline font-semibold cursor-pointer">Chat</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-sans font-semibold text-white">Organic_Chem_v2.pdf</td>
                  <td className="py-3 text-[#94A3B8]">Chemistry</td>
                  <td className="py-3"><Badge variant="cyan">Analyzed</Badge></td>
                  <td className="py-3 text-right">
                    <button onClick={() => navigate('/study')} className="text-[#F97316] hover:underline font-semibold cursor-pointer">Quiz</button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="py-3 font-sans font-semibold text-white">Machine_Learning.pdf</td>
                  <td className="py-3 text-[#94A3B8]">CS</td>
                  <td className="py-3"><Badge variant="orange">Processing</Badge></td>
                  <td className="py-3 text-right">
                    <span className="text-[#94A3B8] font-semibold">Syncing...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
