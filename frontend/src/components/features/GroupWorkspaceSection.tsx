import React, { useState } from 'react';
import { ArrowRightIcon, ArrowsClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import { TeachMeAPI } from '@/services/teachMeService.ts';
import type { GroupWorkspaceDTO } from '@/types/backend.ts';

interface GroupWorkspaceSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

export const GroupWorkspaceSection: React.FC<GroupWorkspaceSectionProps> = ({ onOpenStudio }) => {
  const [syncedDeck, setSyncedDeck] = useState<string | null>(null);

  const [workspaces] = useState<GroupWorkspaceDTO[]>([
    {
      id: 1,
      name: 'Distributed Systems & PgVector Room',
      description: 'Collaborative vector index for Spring AI, Kafka, and PgVector',
      ownerId: 1,
      sharedDocumentIds: [101, 103],
      activeMembers: [
        { id: 1, name: 'Alex (You)', avatarColor: '#6366f1', status: 'ACTIVE' },
        { id: 2, name: 'Maya S.', avatarColor: '#818cf8', status: 'ACTIVE' },
        { id: 3, name: 'Dr. Lin', avatarColor: '#10b981', status: 'IDLE' }
      ]
    },
    {
      id: 2,
      name: 'Cognitive Neuroscience & SM-2 Lab',
      description: 'Spaced repetition models and memory consolidation notes',
      ownerId: 1,
      sharedDocumentIds: [102],
      activeMembers: [
        { id: 1, name: 'Alex (You)', avatarColor: '#6366f1', status: 'ACTIVE' },
        { id: 4, name: 'Sarah K.', avatarColor: '#34d399', status: 'ACTIVE' }
      ]
    }
  ]);

  const handleSyncAnki = (name: string) => {
    TeachMeAPI.export.downloadAnki(name);
    setSyncedDeck(name);
    setTimeout(() => setSyncedDeck(null), 2500);
  };

  return (
    <section id="workspaces" className="py-24 border-t border-[#1c1f2e] bg-[#08090d] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white mb-3 tracking-tight">
              Collaborative Group Workspaces &amp; Shared Vectors
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-[65ch] leading-relaxed">
              Share document vector indices with your study cohort. Real-time multiplayer annotations, shared quiz battles, and instant Anki deck synchronization.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>Create Workspace in Studio</span>
            <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>
        </div>

        {/* 2-Column Workspace Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-[#0e1017] border border-[#1c1f2e] hover:border-[#282c40] rounded-3xl p-6 flex flex-col justify-between transition-all space-y-5 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c1f2e]">
                  <span className="text-xs font-mono text-indigo-300">POST /api/workspaces/{ws.id}</span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Live Sync Active</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-white mb-2">
                  {ws.name}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 mb-4">
                  {ws.description}
                </p>

                {/* Active Members Avatars */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-zinc-400">Active Study Room Cohort:</div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ws.activeMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-xs bg-[#141622] border border-[#1c1f2e] px-3 py-1.5 rounded-xl">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.avatarColor }}
                        />
                        <span className="text-zinc-200 font-medium">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Actions */}
              <div className="pt-4 border-t border-[#1c1f2e] flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">Shared Docs: {ws.sharedDocumentIds.length} Vector Indices</span>
                <button
                  onClick={() => handleSyncAnki(ws.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141622] hover:bg-[#1a1d2e] border border-[#282c40] text-indigo-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {syncedDeck === ws.name ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-emerald-400" weight="bold" />
                      <span className="text-emerald-300">Anki Deck Synced!</span>
                    </>
                  ) : (
                    <>
                      <ArrowsClockwiseIcon className="w-3.5 h-3.5 text-indigo-400" weight="bold" />
                      <span>Sync Anki Deck</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
