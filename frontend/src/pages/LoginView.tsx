import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/apiClient';
import { Card } from '@/components/ui/card';
import { SvgLogoIcon, SvgUserIcon, SvgCheckIcon } from '../components/ui/SvgIcon';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';

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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authApi.login({ email, password });
      const userObj = { email, name: email.split('@')[0] || 'Academic Student' };
      if (onLoginSuccess) onLoginSuccess(userObj);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#06060A] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="glow-ambient-orange top-[10%] left-[15%]" />
      <div className="glow-ambient-cyan bottom-[10%] right-[15%]" />

      <Card variant="default" className="max-w-md w-full p-8 space-y-6 relative border-white/10 shadow-2xl bg-[#0D0D17]/90 backdrop-blur-xl z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#06B6D4] to-[#D946EF] flex items-center justify-center mx-auto orange-glow mb-3">
            <SvgLogoIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">
            Welcome Back to <span className="gradient-text-orange font-extrabold">TeachMe AI</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono">Sign in to access your RAG documents & study decks.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="login-email" className="block text-[#94A3B8] font-semibold">Email Address</label>
            <div className="relative">
              <SvgUserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@teachme.ai"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="login-password" className="block text-[#94A3B8] font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white focus:outline-none focus:border-[#F97316]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <label className="flex items-center gap-2 text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#F97316] cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <span className="text-[#F97316] hover:underline cursor-pointer">Forgot password?</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl orange-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/5 text-center text-xs text-[#94A3B8]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#F97316] font-bold hover:underline">
            Create Free Student Account
          </Link>
        </div>
      </Card>
    </div>
  );
};
