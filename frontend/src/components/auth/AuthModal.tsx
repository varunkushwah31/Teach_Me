import React, { useState } from 'react';
import {
  LockIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  CheckIcon,
  WarningCircleIcon,
  SparkleIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  GraduationCapIcon,
  FlaskIcon
} from '@phosphor-icons/react';
import { TeachMeAPI } from '@/services/teachMeService.ts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Input } from '../ui/input';

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
        setSuccessMessage('Account created! Authenticated via Spring Security.');
      } else {
        await TeachMeAPI.auth.login(email, password);
        setSuccessMessage('Welcome back! Session authenticated.');
      }

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
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
    setSuccessMessage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-[#1f2133] bg-[#0e1017] shadow-2xl rounded-2xl">
        {/* Top Accent Line */}
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-indigo-500/70 to-transparent" />

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#1c1f2e] bg-[#0a0b12]">
          <div className="flex items-center justify-between mb-3 pr-8">
            {/* TeachMe Brand Mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xs">
                <GraduationCapIcon className="w-4 h-4" weight="fill" />
              </div>
              <span className="text-xs font-bold tracking-wider uppercase text-zinc-300">
                TeachMe <span className="text-indigo-400 font-semibold">Auth</span>
              </span>
            </div>

            {/* Spring Security Pill */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Spring Security 6.4</span>
            </span>
          </div>

          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'login' ? 'Sign in to TeachMe' : 'Create your account'}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
              {activeTab === 'login'
                ? 'Access your course vector indices, SM-2 study history, and smart classrooms.'
                : 'Join students and researchers building with precision AI tools.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Modal Body */}
        <div className="px-6 pt-4 pb-2 space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val as 'login' | 'register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
          >
            {/* Segmented Pill Control */}
            <TabsList className="w-full grid grid-cols-2 bg-[#121420] border border-[#1f2234] p-1 rounded-xl h-10.5">
              <TabsTrigger
                value="login"
                className="text-xs font-medium rounded-lg transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="text-xs font-medium rounded-lg transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-3.5 p-3 rounded-xl bg-[#121420] border border-[#1f2234]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <SparkleIcon className="w-3.5 h-3.5 text-indigo-400" weight="fill" />
                  Quick Demo Access
                </span>
                <span className="text-xs text-zinc-400 font-mono">Instant autofill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('student')}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#161828] hover:bg-[#1e2034] border border-[#24273c] hover:border-indigo-500/40 text-zinc-200 hover:text-white text-xs font-medium transition-all cursor-pointer group"
                >
                  <GraduationCapIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" weight="bold" />
                  <span>Student Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('researcher')}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#161828] hover:bg-[#1e2034] border border-[#24273c] hover:border-indigo-500/40 text-zinc-200 hover:text-white text-xs font-medium transition-all cursor-pointer group"
                >
                  <FlaskIcon className="w-4 h-4 text-indigo-300 group-hover:scale-110 transition-transform" weight="bold" />
                  <span>Researcher Demo</span>
                </button>
              </div>
            </div>

            {/* Alert Notifications */}
            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
                <WarningCircleIcon className="w-4 h-4 shrink-0 text-rose-400" weight="bold" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5">
                <CheckIcon className="w-4 h-4 shrink-0 text-emerald-400" weight="bold" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 mt-3.5">
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold text-zinc-300 mb-1.5 cursor-pointer"
                >
                  Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@teachme.ai"
                    required
                    className="pl-10 h-10.5 bg-[#121420] border-[#1f2234] text-white rounded-xl focus-visible:ring-indigo-500/30 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="text-xs font-semibold text-zinc-300 cursor-pointer"
                  >
                    Password
                  </label>
                  {activeTab === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleFillDemo('student')}
                      className="text-xs text-zinc-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <LockIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <Input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password token"
                    required
                    className="pl-10 pr-10 h-10.5 bg-[#121420] border-[#1f2234] text-white rounded-xl focus-visible:ring-indigo-500/30 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.6)] border border-indigo-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isLoading
                    ? 'Authenticating...'
                    : activeTab === 'register'
                    ? 'Create Account'
                    : 'Sign In to TeachMe'}
                </span>
                <ArrowRightIcon className="w-4 h-4" weight="bold" />
              </button>
            </form>

            <TabsContent value="login" />
            <TabsContent value="register" />
          </Tabs>
        </div>

        {/* Security & Trust Footer */}
        <div className="px-6 py-3 bg-[#0a0b12] border-t border-[#1c1f2e] mt-4 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-400" weight="bold" />
            <span>256-bit Encrypted · BCrypt Hashed</span>
          </div>
          <span className="text-zinc-500 font-mono text-xs">JWT Auth State</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
