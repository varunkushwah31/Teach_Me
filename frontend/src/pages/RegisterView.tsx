import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../lib/apiClient';
import { Card } from '@/components/ui/card';
import { SvgLogoIcon, SvgUserIcon, SvgCheckIcon } from '../components/ui/SvgIcon';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, Building } from 'lucide-react';

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
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#06060A] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows */}
      <div className="glow-ambient-orange top-[5%] right-[10%]" />
      <div className="glow-ambient-cyan bottom-[10%] left-[10%]" />

      <Card variant="default" className="max-w-lg w-full p-8 space-y-6 relative border-white/10 shadow-2xl bg-[#0D0D17]/90 backdrop-blur-xl z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] via-[#06B6D4] to-[#D946EF] flex items-center justify-center mx-auto orange-glow mb-3">
            <SvgLogoIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight font-heading">
            Create Your <span className="gradient-text-orange font-extrabold">Student Account</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono">Join thousands of students learning faster with TeachMe AI.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="space-y-1.5">
              <label htmlFor="reg-fname" className="block text-[#94A3B8] font-semibold">First Name</label>
              <input
                id="reg-fname"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-lname" className="block text-[#94A3B8] font-semibold">Last Name</label>
              <input
                id="reg-lname"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="reg-email" className="block text-[#94A3B8] font-semibold">Academic Email Address</label>
            <div className="relative">
              <SvgUserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="reg-institution" className="block text-[#94A3B8] font-semibold">Academic Institution</label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <select
                id="reg-institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#F97316] appearance-none"
              >
                <option value="MIT">Massachusetts Institute of Technology (MIT)</option>
                <option value="Stanford">Stanford University</option>
                <option value="Harvard">Harvard University</option>
                <option value="Oxford">University of Oxford</option>
                <option value="Other">Other Institution</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <label htmlFor="reg-pass" className="block text-[#94A3B8] font-semibold">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                id="reg-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-[#06060A]/80 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-[#F97316]"
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

          <div className="flex items-start gap-2.5 text-xs font-mono">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-[#F97316] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[#94A3B8] cursor-pointer leading-snug">
              I agree to the <span className="text-[#F97316] hover:underline">Terms of Service</span> and <span className="text-[#F97316] hover:underline">Academic Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#F97316] to-[#D946EF] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl orange-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/5 text-center text-xs text-[#94A3B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F97316] font-bold hover:underline">
            Sign In Here
          </Link>
        </div>
      </Card>
    </div>
  );
};
