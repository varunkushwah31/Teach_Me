import React, { useState } from 'react';
import { UsersIcon, ArrowRightIcon, ArrowsClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
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
        { id: 1, name: 'Alex (You)', avatarColor: '#a8ff53', status: 'ACTIVE' },
        { id: 2, name: 'Maya S.', avatarColor: '#9c9af2', status: 'ACTIVE' },
        { id: 3, name: 'Dr. Lin', avatarColor: '#fa3abf', status: 'IDLE' }
      ]
    },
    {
      id: 2,
      name: 'Cognitive Neuroscience & SM-2 Lab',
      description: 'Spaced repetition models and memory consolidation notes',
      ownerId: 1,
      sharedDocumentIds: [102],
      activeMembers: [
        { id: 1, name: 'Alex (You)', avatarColor: '#a8ff53', status: 'ACTIVE' },
        { id: 4, name: 'Sarah K.', avatarColor: '#afec73', status: 'ACTIVE' }
      ]
    }
  ]);

  const handleSyncAnki = (name: string) => {
    TeachMeAPI.export.downloadAnki(name);
    setSyncedDeck(name);
    setTimeout(() => setSyncedDeck(null), 2500);
  };

  return (
    <section id="workspaces" className="py-24 border-t border-[#2e3238] bg-[#1c1e21] font-['Inter']">
      <div className="max-w-310 mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#e888f8] font-mono text-[13px] font-semibold mb-3">
              <UsersIcon className="w-4 h-4" />
              <span>Multiplayer Study Rooms</span>
            </div>
            <h2 className="font-bold text-[32px] sm:text-[40px] text-[#f3f4f6] mb-3 tracking-tight">
              Collaborative Group Workspaces & Shared Vectors
            </h2>
            <p className="text-[16px] text-[#b5b8c0] max-w-160 leading-[1.6]">
              Share document vector indices with your study cohort. Real-time multiplayer annotations, shared quiz battles, and instant Anki deck synchronization.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 text-[14px] text-[#a8ff53] font-semibold hover:underline cursor-pointer"
          >
            <span>Create Workspace in Studio</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" weight="bold" />
          </button>
        </div>

        {/* 2-Column Workspace Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-[#121317] border border-[#2e3238] hover:border-[#424750] rounded p-6 flex flex-col justify-between transition-all space-y-5 shadow-2xl card-hover-lift"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2e3238]">
                  <span className="text-[12px] font-mono text-[#a8ff53]">POST /api/workspaces/{ws.id}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#a8ff53] font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#a8ff53] animate-pulse" />
                    <span>Live Sync Active</span>
                  </div>
                </div>

                <h3 className="font-bold text-[20px] text-[#f3f4f6] mb-2">
                  {ws.name}
                </h3>
                <p className="text-[14px] leading-[1.6] text-[#b5b8c0] mb-4">
                  {ws.description}
                </p>

                {/* Active Members Avatars */}
                <div className="space-y-2">
                  <div className="text-[12px] font-mono text-[#a0a4af]">Active Study Room Cohort:</div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {ws.activeMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-2 text-[12px] bg-[#1c1e21] border border-[#2e3238] px-3 py-1.5 rounded">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.avatarColor }}
                        />
                        <span className="text-[#f3f4f6] font-medium">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Actions */}
              <div className="pt-4 border-t border-[#2e3238] flex items-center justify-between">
                <span className="text-[12px] font-mono text-[#a0a4af]">Shared Docs: {ws.sharedDocumentIds.length} Vector Indices</span>
                <button
                  onClick={() => handleSyncAnki(ws.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#272a2e] hover:bg-[#343840] text-[#a8ff53] text-[12.5px] font-semibold rounded transition-colors cursor-pointer"
                >
                  {syncedDeck === ws.name ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5 text-[#a8ff53]" weight="bold" />
                      <span>Anki Deck Synced!</span>
                    </>
                  ) : (
                    <>
                      <ArrowsClockwiseIcon className="w-3.5 h-3.5" weight="bold" />
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

