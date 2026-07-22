import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User as UserIcon } from 'lucide-react';
import { authApi } from '../lib/apiClient';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; name: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await authApi.register({ email, password, firstName, lastName });
      } else {
        await authApi.login({ email, password });
      }
      onLoginSuccess({
        email,
        name: firstName ? `${firstName} ${lastName}` : email.split('@')[0],
      });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    onLoginSuccess({
      email: 'student@teachme.ai',
      name: 'Academic Student',
    });
  };

  return (
    <div className="min-h-screen w-screen bg-[#0F0F0F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#27272A] rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#F97316] flex items-center justify-center orange-glow mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TeachMe <span className="text-[#F97316]">AI</span>
          </h1>
          <p className="text-xs text-[#A1A1AA] font-mono mt-1">
            {isRegister ? 'Create your Academic Student Account' : 'Sign in to access document analysis'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">First Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#F97316]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A1A1AA] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0F0F0F] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all orange-glow text-sm mt-6"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separators */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272A]" />
          </div>
          <span className="relative bg-[#1A1A1A] px-3 text-[10px] text-[#A1A1AA] font-mono tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* OAuth / Guest Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleGuestLogin}
            className="w-full bg-[#0F0F0F] border border-[#27272A] hover:bg-[#27272A] text-xs text-[#A1A1AA] hover:text-white font-medium py-2 rounded-lg transition-colors"
          >
            Google Workspace
          </button>
          <button
            onClick={handleGuestLogin}
            className="w-full bg-[#0F0F0F] border border-[#27272A] hover:bg-[#27272A] text-xs text-[#A1A1AA] hover:text-white font-medium py-2 rounded-lg transition-colors"
          >
            Institution SSO
          </button>
        </div>

        {/* Switch mode link */}
        <div className="text-center text-xs text-[#A1A1AA]">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-[#F97316] hover:underline font-medium"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-[#F97316] hover:underline font-medium"
              >
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
