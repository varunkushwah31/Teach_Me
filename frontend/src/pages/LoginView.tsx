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

  const handleSubmit = async (e: React.SubmitEvent ) => {
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

  const getSubmitButtonText = () => {
    if (loading) return 'Authenticating...';
    if (isRegister) return 'Create Account';
    return 'Sign In';
  };

  return (
    <div className="min-h-screen w-screen bg-[#06060A] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="glow-ambient-orange top-[20%] left-[20%]" />
      <div className="glow-ambient-cyan bottom-[20%] right-[20%]" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316] to-[#D946EF] flex items-center justify-center orange-glow mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-heading">
            TeachMe <span className="gradient-text-orange font-extrabold">AI</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1 text-center">
            {isRegister ? 'Create your Academic Student Account' : 'Sign in to access document analysis'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first-name-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">First Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    id="first-name-input"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last-name-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">Last Name</label>
                <input
                  id="last-name-input"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold text-[#94A3B8] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all orange-glow text-xs uppercase tracking-wider mt-6 cursor-pointer"
          >
            <span>{getSubmitButtonText()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separators */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#0D0D17] px-3 text-[10px] text-[#94A3B8] font-mono tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* OAuth / Guest Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleGuestLogin}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-[#94A3B8] hover:text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Google Workspace
          </button>
          <button
            onClick={handleGuestLogin}
            className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-[#94A3B8] hover:text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Institution SSO
          </button>
        </div>

        {/* Switch mode link */}
        <div className="text-center text-xs text-[#94A3B8]">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegister(false)}
                className="text-[#F97316] hover:underline font-bold"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegister(true)}
                className="text-[#F97316] hover:underline font-bold"
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
