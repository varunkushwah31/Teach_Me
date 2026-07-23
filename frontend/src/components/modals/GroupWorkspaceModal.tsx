import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Users, Sparkles, RefreshCw, UserPlus, Share2, CheckCircle2 } from 'lucide-react';
import { workspaceApi } from '../../lib/apiClient';

interface Props {
  onClose: () => void;
}

export const GroupWorkspaceModal: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState('Physics 101 Study Group');
  const [description, setDescription] = useState('Shared vector collection for quantum mechanics & wave physics lectures.');
  const [memberEmail, setMemberEmail] = useState('');
  const [members, setMembers] = useState<string[]>(['student@teachme.ai', 'classmate@mit.edu']);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  const handleAddMember = () => {
    if (!memberEmail.trim() || members.includes(memberEmail.trim())) return;
    setMembers((prev) => [...prev, memberEmail.trim()]);
    setMemberEmail('');
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workspaceApi.createWorkspace(name, description);
      setCreated(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-lg w-full p-6 space-y-5 relative border-[#F97316]/40 shadow-2xl bg-[#0D0D17]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Group Workspace Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F97316]/20 to-[#D946EF]/20 text-[#F97316] orange-glow">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Group Study Workspace</span>
              <Badge variant="orange">Vector Library Sharing</Badge>
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono">Collaborate with classmates and share indexed course document collections.</p>
          </div>
        </div>

        {created ? (
          <div className="py-8 text-center text-[#10B981] font-mono space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-[#10B981]" />
            <p className="text-sm font-bold text-white">Group Study Workspace Created!</p>
            <p className="text-xs text-[#94A3B8]">Classmates have been invited to your shared vector collection.</p>
          </div>
        ) : (
          <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label htmlFor="ws-name" className="block text-white font-semibold">Workspace Name</label>
              <input
                id="ws-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Physics 101 Study Group"
                className="w-full bg-[#06060A]/80 border border-[#27272A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ws-desc" className="block text-white font-semibold">Description</label>
              <input
                id="ws-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Course topic notes & study plan..."
                className="w-full bg-[#06060A]/80 border border-[#27272A] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>

            {/* Invite Classmates */}
            <div className="space-y-2">
              <label htmlFor="ws-member-email" className="block text-white font-semibold">Invite Classmate Email</label>
              <div className="flex gap-2">
                <input
                  id="ws-member-email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="classmate@university.edu"
                  className="w-full bg-[#06060A]/80 border border-[#27272A] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-[#F97316]"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-3.5 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <UserPlus className="w-4 h-4 text-[#F97316]" /> Add
                </button>
              </div>

              {/* Members List */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {members.map((m) => (
                  <Badge key={m} variant="cyan" className="text-[10px]">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white text-xs font-bold rounded-xl orange-glow flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                <span>{loading ? 'Creating Workspace...' : 'Create Shared Workspace'}</span>
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
