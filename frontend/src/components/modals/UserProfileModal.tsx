import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Shield, LogOut, Laptop, Clock, Award } from 'lucide-react';

interface Props {
  user?: { email: string; name: string };
  onClose: () => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<Props> = ({ user, onClose, onLogout }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stats'>('profile');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('teachme_jwt_token') || '';
        const res = await fetch('http://localhost:8081/api/auth/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setSessions(data);
        }
      } catch (err) {
        console.error('Failed to load active sessions', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleRevokeSession = async (sessionId: number) => {
    try {
      const token = localStorage.getItem('teachme_jwt_token') || '';
      await fetch(`http://localhost:8081/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error('Failed to revoke session', err);
    }
  };

  const renderSecurityTab = () => {
    if (loading) {
      return (
        <div className="text-center py-6 text-xs text-[#A1A1AA] font-mono">
          Loading active JWT sessions...
        </div>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl text-xs text-[#A1A1AA] font-mono">
          Current active session: Browser JWT Token
        </div>
      );
    }

    return sessions.map((s) => (
      <div key={s.id} className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <Laptop className="w-4 h-4 text-[#06B6D4]" />
          <div>
            <p className="text-white font-semibold">Active Refresh Token #{s.id}</p>
            <p className="text-[10px] text-[#A1A1AA]">Expires: {new Date(s.expiryDate).toLocaleDateString()}</p>
          </div>
        </div>
        <button
          onClick={() => handleRevokeSession(s.id)}
          className="text-[#EF4444] hover:bg-[#EF4444]/10 px-2.5 py-1 rounded-lg border border-[#EF4444]/30 text-[10px] font-bold"
        >
          Revoke
        </button>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card variant="default" className="max-w-2xl w-full p-6 space-y-6 relative border-[#06B6D4]/40 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close User Profile Modal"
          className="absolute top-4 right-4 p-1.5 text-[#A1A1AA] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-[#27272A]">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#3B82F6] flex items-center justify-center text-lg font-bold text-white cyan-glow">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user?.name || 'Academic Student'}</h2>
              <Badge variant="cyan">Pro Tier</Badge>
            </div>
            <p className="text-xs text-[#A1A1AA] font-mono">{user?.email || 'student@teachme.ai'}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#27272A] pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#F97316] text-white orange-glow'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            User Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-[#F97316] text-white orange-glow'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Active JWT Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'stats'
                ? 'bg-[#F97316] text-white orange-glow'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            Academic Stats
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'profile' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl">
                <p className="text-[#A1A1AA] text-[10px] font-mono uppercase">Academic Institution</p>
                <p className="font-semibold text-white mt-0.5">Massachusetts Institute of Technology</p>
              </div>
              <div className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl">
                <p className="text-[#A1A1AA] text-[10px] font-mono uppercase">Primary Focus Area</p>
                <p className="font-semibold text-white mt-0.5">Quantum Physics & Deep Learning</p>
              </div>
            </div>

            <div className="p-3 bg-[#0F0F0F] border border-[#27272A] rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Spring AI Vector Store Advisor</p>
                <p className="text-[#A1A1AA] text-[10px]">Chat memory persistence active across sessions</p>
              </div>
              <Badge variant="cyan">Enabled</Badge>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {renderSecurityTab()}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-[#0F0F0F] border border-[#27272A] rounded-xl text-center">
              <Award className="w-6 h-6 text-[#F97316] mx-auto mb-1.5" />
              <p className="text-lg font-bold text-white">42</p>
              <p className="text-[10px] text-[#A1A1AA] uppercase font-mono">Mastered Flashcards</p>
            </div>
            <div className="p-4 bg-[#0F0F0F] border border-[#27272A] rounded-xl text-center">
              <Clock className="w-6 h-6 text-[#06B6D4] mx-auto mb-1.5" />
              <p className="text-lg font-bold text-white">18.5 hrs</p>
              <p className="text-[10px] text-[#A1A1AA] uppercase font-mono">Study Time</p>
            </div>
            <div className="p-4 bg-[#0F0F0F] border border-[#27272A] rounded-xl text-center">
              <Shield className="w-6 h-6 text-[#D946EF] mx-auto mb-1.5" />
              <p className="text-lg font-bold text-white">92%</p>
              <p className="text-[10px] text-[#A1A1AA] uppercase font-mono">Quiz Pass Rate</p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-[#27272A]">
          {onLogout ? (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-4 py-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </Card>
    </div>
  );
};
