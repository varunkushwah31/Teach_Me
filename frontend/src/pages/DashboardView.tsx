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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#27272A]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Academic Overview</h1>
          <p className="text-xs text-[#A1A1AA]">Real-time RAG ingestion analytics & study performance overview.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="cyan">+12 Document Chunks Vectorized Today</Badge>
        </div>
      </div>

      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card variant="default" className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-[#F97316]/10 text-[#F97316]">
              <FileText className="w-5 h-5" />
            </div>
            <Badge variant="cyan">+4 this week</Badge>
          </div>
          <p className="text-xs text-[#A1A1AA] font-medium">Total Documents Analyzed</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">1,248</p>
          <p className="text-[11px] text-[#A1A1AA] font-mono mt-2">Map-Reduce summaries active</p>
        </Card>

        <Card variant="default" className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4]">
              <Award className="w-5 h-5" />
            </div>
            <Badge variant="orange">+85% accuracy</Badge>
          </div>
          <p className="text-xs text-[#A1A1AA] font-medium">Flashcards Mastered (SM-2)</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">342</p>
          <p className="text-[11px] text-[#A1A1AA] font-mono mt-2">12 due for review today</p>
        </Card>

        <Card variant="default" className="relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-[#F97316]/10 text-[#F97316]">
              <Clock className="w-5 h-5" />
            </div>
            <Badge variant="cyan">+3.5 hrs vs last week</Badge>
          </div>
          <p className="text-xs text-[#A1A1AA] font-medium">Hours Studied</p>
          <p className="text-3xl font-bold font-mono text-white mt-1">38.4 hrs</p>
          <p className="text-[11px] text-[#A1A1AA] font-mono mt-2">RRF Hybrid Search active</p>
        </Card>
      </div>

      {/* Middle Row: AreaChart (2/3) + RadarChart (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="default" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Study Progress & Analysis Volume</h2>
              <p className="text-[11px] text-[#A1A1AA] font-mono">Weekly progression of ingested documents vs review hours</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#F97316]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Documents
              </span>
              <span className="flex items-center gap-1.5 text-[#06B6D4]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" /> Hours
              </span>
            </div>
          </div>
          <AreaChartComponent />
        </Card>

        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Quiz Performance</h2>
              <p className="text-[11px] text-[#A1A1AA] font-mono">Subject proficiency scores</p>
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
          <h2 className="text-sm font-semibold text-white mb-3">Recent Activity Feed</h2>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#06B6D4]/10 text-[#06B6D4] mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-medium text-xs">Generated Map-Reduce Summary</p>
                <p className="text-[#A1A1AA] text-[11px]">Quantum_Physics_Notes.pdf • 285 words extracted</p>
              </div>
              <span className="text-[10px] text-[#A1A1AA]">10m ago</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#F97316]/10 text-[#F97316] mt-0.5">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-medium text-xs">AI Tutor Streaming Session</p>
                <p className="text-[#A1A1AA] text-[11px]">Discussed Heisenberg uncertainty principle & citations [1]</p>
              </div>
              <span className="text-[10px] text-[#A1A1AA]">1h ago</span>
            </div>

            <div className="p-3 rounded-lg bg-[#0F0F0F] border border-[#27272A] flex items-start gap-3">
              <div className="p-1.5 rounded bg-[#06B6D4]/10 text-[#06B6D4] mt-0.5">
                <Award className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className="text-white font-sans font-medium text-xs">Completed 5-Question Quiz</p>
                <p className="text-[#A1A1AA] text-[11px]">Scored 100% on Organic Reaction Mechanisms</p>
              </div>
              <span className="text-[10px] text-[#A1A1AA]">3h ago</span>
            </div>
          </div>
        </Card>

        {/* Top Documents Table */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Top Analyzed Documents</h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-xs text-[#F97316] hover:underline flex items-center gap-1 font-mono"
            >
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#27272A] text-[#A1A1AA]">
                  <th className="pb-2 font-normal">Document Name</th>
                  <th className="pb-2 font-normal">Category</th>
                  <th className="pb-2 font-normal">Status</th>
                  <th className="pb-2 text-right font-normal">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                <tr>
                  <td className="py-2.5 font-sans font-medium text-white">Quantum_Physics.pdf</td>
                  <td className="py-2.5 text-[#A1A1AA]">Physics</td>
                  <td className="py-2.5"><Badge variant="cyan">Analyzed</Badge></td>
                  <td className="py-2.5 text-right">
                    <button onClick={() => navigate('/chat')} className="text-[#F97316] hover:underline">Chat</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-white">Organic_Chem_v2.pdf</td>
                  <td className="py-2.5 text-[#A1A1AA]">Chemistry</td>
                  <td className="py-2.5"><Badge variant="cyan">Analyzed</Badge></td>
                  <td className="py-2.5 text-right">
                    <button onClick={() => navigate('/study')} className="text-[#F97316] hover:underline">Quiz</button>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-white">Machine_Learning.pdf</td>
                  <td className="py-2.5 text-[#A1A1AA]">CS</td>
                  <td className="py-2.5"><Badge variant="orange">Processing</Badge></td>
                  <td className="py-2.5 text-right">
                    <span className="text-[#A1A1AA]">Syncing...</span>
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
