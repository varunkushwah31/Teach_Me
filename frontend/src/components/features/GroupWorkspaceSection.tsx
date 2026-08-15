import React, { useState } from 'react';
import { Users, ArrowRight, FolderSync } from 'lucide-react';
import { TeachMeAPI } from '../../services/teachMeService';
import type { GroupWorkspaceDTO } from '../../types/backend';

interface GroupWorkspaceSectionProps {
  onOpenStudio?: (tab?: string) => void;
}

export const GroupWorkspaceSection: React.FC<GroupWorkspaceSectionProps> = ({ onOpenStudio }) => {
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

  return (
    <section id="workspaces" className="py-24 border-t border-[#272a2e] bg-[#1c1e21]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#e888f8] font-['Geist_Mono'] text-[13px] font-medium mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>Multiplayer Study Rooms</span>
            </div>
            <h2 className="font-['Satoshi'] font-semibold text-[32px] sm:text-[40px] text-[#e5e7eb] mb-3">
              Collaborative Group Workspaces & Shared Vectors
            </h2>
            <p className="font-['Geist'] text-[15px] sm:text-[16px] text-[#878c99] max-w-[620px] leading-[1.56]">
              Share document vector indices with your study cohort. Real-time multiplayer annotations, shared quiz battles, and instant Anki deck distribution.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio?.('documents')}
            className="group mt-4 md:mt-0 inline-flex items-center gap-1.5 text-[14px] font-['Geist'] text-[#a8ff53] hover:underline cursor-pointer"
          >
            <span>Create Workspace</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* 2-Column Workspace Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="bg-[#121317] border border-[#272a2e] hover:border-[#3b3e45] rounded-[4px] p-6 flex flex-col justify-between transition-all space-y-5"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#272a2e]">
                  <span className="text-[12px] font-['Geist_Mono'] text-[#a8ff53]">POST /api/workspaces/{ws.id}</span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#afec73]">
                    <span className="w-2 h-2 rounded-full bg-[#afec73] animate-pulse" />
                    <span>Live Sync</span>
                  </div>
                </div>

                <h3 className="font-['Satoshi'] font-semibold text-[20px] text-[#e5e7eb] mb-2">
                  {ws.name}
                </h3>
                <p className="font-['Geist'] text-[14px] text-[#878c99] mb-4">
                  {ws.description}
                </p>

                {/* Active Members Avatars */}
                <div className="space-y-2">
                  <div className="text-[12px] font-['Geist_Mono'] text-[#878c99]">Active Study Room Cohort:</div>
                  <div className="flex items-center gap-3">
                    {ws.activeMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-1.5 text-[12px] bg-[#1c1e21] border border-[#272a2e] px-2.5 py-1 rounded">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: m.avatarColor }}
                        />
                        <span className="text-[#d7d9dd]">{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workspace Actions */}
              <div className="pt-4 border-t border-[#272a2e] flex items-center justify-between">
                <span className="text-[12px] text-[#878c99]">Shared Docs: {ws.sharedDocumentIds.length} Indices</span>
                <button
                  onClick={() => TeachMeAPI.export.downloadAnki(ws.name)}
                  className="flex items-center gap-1.5 text-[12px] text-[#d7d9dd] hover:text-[#a8ff53] transition-colors cursor-pointer"
                >
                  <FolderSync className="w-3.5 h-3.5" />
                  <span>Sync Anki Deck</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
