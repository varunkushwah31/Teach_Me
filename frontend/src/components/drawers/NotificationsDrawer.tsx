import React from 'react';
import { Bell, CheckCircle2, Cpu, Sparkles, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

interface Props {
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<Props> = ({ onClose }) => {
  const notifications: NotificationItem[] = [
    {
      id: 'n1',
      title: 'PgVector Ingestion Complete',
      desc: 'Quantum_Physics.pdf parsed into 54 child chunks and saved to vector store.',
      time: '10m ago',
      type: 'success',
    },
    {
      id: 'n2',
      title: 'Map-Reduce Executive Summary Ready',
      desc: '1-page executive summary generated for Quantum_Physics.pdf.',
      time: '15m ago',
      type: 'info',
    },
    {
      id: 'n3',
      title: 'SM-2 Flashcard Schedule',
      desc: '5 flashcards in Physics deck are due for review today.',
      time: '1h ago',
      type: 'warning',
    },
    {
      id: 'n4',
      title: 'Ollama Engine Status',
      desc: 'Connected to local Ollama instance running deepseek-r1:8b model.',
      time: '2h ago',
      type: 'info',
    },
  ];

  return (
    <div className="absolute right-6 top-16 w-96 z-50">
      <Card variant="default" className="p-4 space-y-4 shadow-2xl border-[#F97316]/40 relative bg-[#0D0D17]">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F97316]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">System Notifications</h3>
          </div>
          <button onClick={onClose} aria-label="Close Notifications Drawer" className="p-1 text-[#A1A1AA] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div key={n.id} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl space-y-1 hover:border-[#3F3F46] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />}
                  {n.type === 'info' && <Cpu className="w-3.5 h-3.5 text-[#F97316]" />}
                  {n.type === 'warning' && <Sparkles className="w-3.5 h-3.5 text-[#D946EF]" />}
                  {n.title}
                </span>
                <span className="text-[10px] text-[#A1A1AA] font-mono">{n.time}</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-snug">{n.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#27272A] text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-[#06B6D4] hover:underline font-mono"
          >
            Mark All as Read
          </button>
        </div>
      </Card>
    </div>
  );
};
