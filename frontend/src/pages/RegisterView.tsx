import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrainCircuit, ArrowRight, Lock, Mail, User as UserIcon, Building, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authApi } from '../lib/apiClient';

interface RegisterViewProps {
  onLoginSuccess?: (user: { email: string; name: string }) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [institution, setInstitution] = useState('MIT');
  const [agreed, setAgreed] = useState(true);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Please accept the terms and privacy policy to continue.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await authApi.register({ email, password, firstName, lastName });
      const userObj = {
        email,
        name: firstName ? `${firstName} ${lastName}` : email.split('@')[0],
      };
      if (onLoginSuccess) onLoginSuccess(userObj);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check input fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoRegister = () => {
    const demoUser = { email: 'student@teachme.ai', name: 'Academic Student' };
    if (onLoginSuccess) onLoginSuccess(demoUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-screen bg-[#06060A] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="glow-ambient-orange top-[20%] left-[20%]" />
      <div className="glow-ambient-cyan bottom-[20%] right-[20%]" />

      {/* Centered Auth Card */}
      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 shadow-2xl relative z-10 border border-white/5">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
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
            Create Your <span className="gradient-text-orange font-extrabold">TeachMe AI</span> Account
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1 text-center">
            Join thousands of academic students and researchers vectorizing documents.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs text-center font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-first-name" className="block text-xs font-semibold text-[#94A3B8] mb-1">First Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-first-name"
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
              <label htmlFor="reg-last-name" className="block text-xs font-semibold text-[#94A3B8] mb-1">Last Name</label>
              <input
                id="reg-last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-semibold text-[#94A3B8] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="reg-institution" className="block text-xs font-semibold text-[#94A3B8] mb-1">Academic Institution</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <select
                  id="reg-institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none bg-[#0D0D17]"
                >
                  <option value="MIT">MIT</option>
                  <option value="Stanford">Stanford University</option>
                  <option value="Harvard">Harvard University</option>
                  <option value="Oxford">Oxford University</option>
                  <option value="Other">Other Institution</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-[#94A3B8] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-[#94A3B8] focus:outline-none"
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
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms-check"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="accent-[#F97316] w-4 h-4"
            />
            <label htmlFor="terms-check" className="text-[11px] text-[#94A3B8]">
              I agree to the <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all orange-glow text-xs uppercase tracking-wider mt-4 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Create Academic Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#0D0D17] px-3 text-[10px] text-[#94A3B8] font-mono tracking-wider">
            QUICK ACCESS
          </span>
        </div>

        <button
          onClick={handleDemoRegister}
          className="w-full bg-white/5 border border-white/5 hover:bg-white/10 text-xs text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />
          <span>Continue with Guest Student Demo Account</span>
        </button>

        {/* Link to Sign In */}
        <div className="text-center text-xs text-[#94A3B8] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F97316] hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
