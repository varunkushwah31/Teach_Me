import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, ArrowRight, Lock, Mail, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '../lib/apiClient';

interface LoginViewProps {
  onLoginSuccess?: (user: { email: string; name: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.login({ email, password });
      const userObj = {
        email,
        name: email.split('@')[0],
      };
      if (onLoginSuccess) onLoginSuccess(userObj);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      email: 'student@teachme.ai',
      name: 'Academic Student',
    };
    if (onLoginSuccess) onLoginSuccess(guestUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-screen bg-[#06060A] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="glow-ambient-orange top-[20%] left-[20%]" />
      <div className="glow-ambient-cyan bottom-[20%] right-[20%]" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative z-10 border border-white/5">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/landing')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#06B6D4] to-[#D946EF] p-[1.5px] shadow-lg orange-glow cursor-pointer mb-3 focus:outline-none focus:ring-1 focus:ring-[#F97316]"
          >
            <div className="w-full h-full bg-[#06060A] rounded-[14px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#F97316]" />
            </div>
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight font-heading">
            Sign In to <span className="gradient-text-orange font-extrabold">TeachMe AI</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1 text-center">
            Access your RAG documents, AI tutor chat, and SM-2 flashcard decks.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#94A3B8] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="login-password" className="block text-xs font-semibold text-[#94A3B8]">Password</label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to registered email.')}
                className="text-[11px] text-[#06B6D4] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full glass-input rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-[#F97316] w-4 h-4"
            />
            <label htmlFor="remember-me" className="text-xs text-[#94A3B8]">
              Remember me on this device
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all orange-glow text-xs uppercase tracking-wider mt-4 cursor-pointer"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#0D0D17] px-3 text-[10px] text-[#94A3B8] font-mono tracking-wider">
            OR CONTINUE WITH
          </span>
        </div>

        {/* Guest Demo Login */}
        <button
          onClick={handleGuestLogin}
          className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-white font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
          <span>Instant Guest Student Demo Sign In</span>
        </button>

        {/* Switch to Sign Up */}
        <div className="text-center text-xs text-[#94A3B8] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#F97316] hover:underline font-bold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
