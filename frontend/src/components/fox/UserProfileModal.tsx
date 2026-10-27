import React, { useState } from 'react';
import { XIcon, SignOutIcon, CheckCircleIcon, ShieldCheckIcon } from '@phosphor-icons/react';
import { usePlayground } from '../../context/usePlayground';
import { TeachMeAPI } from '../../services/teachMeService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, setUserProfile } = usePlayground();
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const initial = (name.trim()[0] || 'U').toUpperCase();
    setUserProfile({
      name: name.trim() || 'Baliram Kumar',
      email: email.trim() || 'baliramk505@gmail.com',
      avatarInitial: initial
    });
    setMessage('Profile updated successfully.');
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 800);
  };

  const handleLogout = () => {
    TeachMeAPI.auth.logout();
    setMessage('Logged out successfully.');
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-[#0e1017] border border-[#1f2133] rounded-3xl p-6 shadow-2xl relative animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-[#1b1d2e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 flex items-center justify-center font-bold text-sm shadow-xs">
              {userProfile.avatarInitial || 'B'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Account Profile</span>
                <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              </h2>
              <p className="text-xs text-zinc-400">Credentials and workspace session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4 pt-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#121420] border border-[#1f2234] focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#121420] border border-[#1f2234] focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Update Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep unchanged"
              className="w-full bg-[#121420] border border-[#1f2234] focus:border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 outline-none transition-colors font-mono"
            />
          </div>

          {message && (
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1 animate-fade-in font-medium">
              <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#1b1d2e] flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <SignOutIcon className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
