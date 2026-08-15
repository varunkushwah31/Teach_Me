import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Check, AlertCircle, Sparkles, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { TeachMeAPI } from '../../services/teachMeService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (activeTab === 'register') {
        await TeachMeAPI.auth.register(email, password);
        setSuccessMessage('Account created! Spring Security JWT authenticated.');
      } else {
        await TeachMeAPI.auth.login(email, password);
        setSuccessMessage('Welcome back! JWT session active.');
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (role: 'student' | 'researcher') => {
    if (role === 'student') {
      setEmail('student@teachme.ai');
      setPassword('SpringAI2026!');
    } else {
      setEmail('researcher@teachme.ai');
      setPassword('PgVectorDeepDive!');
    }
    setErrorMessage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden bg-[#121317] border-[#3b3e45] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        
        {/* Top Terminal Header Glow */}
        <div className="p-6 pb-4 border-b border-[#272a2e] bg-gradient-to-b from-[#1c1e21] to-[#121317]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-[#1c1e21] border border-[#3b3e45]">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#a8ff53]">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <span className="font-['Geist_Mono'] text-[12px] text-[#878c99]">
                auth.teachme.ai/jwt
              </span>
            </div>

            <Badge variant="lime" className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a8ff53] animate-pulse" />
              <span>Spring Security 6.4</span>
            </Badge>
          </div>

          <DialogHeader>
            <DialogTitle className="text-[22px] text-[#e5e7eb] font-['Satoshi']">
              {activeTab === 'login' ? 'Sign in to TeachMe' : 'Create your Developer Account'}
            </DialogTitle>
            <DialogDescription className="text-[#878c99] text-[13.5px] font-['Geist']">
              Access your vector indices, SM-2 study history, and collaborative classrooms.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Tab Switcher (Sign In vs Register) */}
        <div className="px-6 pt-4">
          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val as 'login' | 'register');
            setErrorMessage(null);
            setSuccessMessage(null);
          }}>
            <TabsList className="w-full grid grid-cols-2 bg-[#1c1e21] border border-[#272a2e] p-1">
              <TabsTrigger value="login" className="text-[13px] font-['Geist']">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-[13px] font-['Geist']">
                Register New
              </TabsTrigger>
            </TabsList>

            {/* Quick Demo Credentials Bar */}
            <div className="flex items-center justify-between mt-3 px-3 py-2 bg-[#1c1e21]/70 border border-[#272a2e] rounded-[4px] text-[12px]">
              <span className="text-[#878c99] font-['Geist_Mono'] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#a8ff53]" /> One-click Demo:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className="px-2 py-0.5 bg-[#121317] hover:bg-[#272a2e] text-[#a8ff53] border border-[#272a2e] rounded text-[11px] font-['Geist_Mono'] transition-colors cursor-pointer"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('researcher')}
                  className="px-2 py-0.5 bg-[#121317] hover:bg-[#272a2e] text-[#9c9af2] border border-[#272a2e] rounded text-[11px] font-['Geist_Mono'] transition-colors cursor-pointer"
                >
                  Researcher
                </button>
              </div>
            </div>

            {/* Alert Messages */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-[#f43f5e]/15 border border-[#f43f5e]/40 rounded-[4px] text-[12.5px] text-[#f43f5e] flex items-center gap-2 font-['Geist']">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-3 p-3 bg-[#a8ff53]/15 border border-[#a8ff53]/40 rounded-[4px] text-[12.5px] text-[#a8ff53] flex items-center gap-2 font-['Geist_Mono']">
                <Check className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-[12.5px] font-medium text-[#d7d9dd] mb-1.5 font-['Geist']">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#878c99] absolute left-3 top-2.5" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@teachme.ai"
                    required
                    className="pl-9 bg-[#1c1e21] border-[#272a2e] text-[#e5e7eb] focus-visible:border-[#a8ff53]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12.5px] font-medium text-[#d7d9dd] font-['Geist']">
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <span className="text-[11.5px] text-[#878c99] hover:text-[#a8ff53] transition-colors cursor-pointer">
                      Forgot password?
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#878c99] absolute left-3 top-2.5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="pl-9 pr-9 bg-[#1c1e21] border-[#272a2e] text-[#e5e7eb] focus-visible:border-[#a8ff53]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#878c99] hover:text-[#e5e7eb] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-[#a8ff53] hover:bg-[#b8ff70] active:scale-[0.99] text-[#121317] font-['Geist'] font-medium text-[14px] rounded-[4px] shadow-[inset_0_0_0_1px_rgba(168,255,83,0.4),0_0_20px_rgba(168,255,83,0.15)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{activeTab === 'register' ? 'Create Account & Sign In' : 'Sign In with JWT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <TabsContent value="login" />
            <TabsContent value="register" />
          </Tabs>
        </div>

        {/* OAuth & Security Footer */}
        <div className="p-4 bg-[#15171c] border-t border-[#272a2e] mt-4 flex items-center justify-between text-[11.5px] text-[#878c99] font-['Geist_Mono']">
          <div className="flex items-center gap-1.5 text-[#878c99]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a8ff53]" />
            <span>BCrypt Encrypted (12 Rounds)</span>
          </div>
          <span>PostgreSQL State</span>
        </div>

      </DialogContent>
    </Dialog>
  );
};
