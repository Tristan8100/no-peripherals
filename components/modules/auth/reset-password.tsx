'use client';

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [linkError, setLinkError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

    if (errorCode) {
        setLinkError(decodeURIComponent((errorDesc ?? 'Invalid or expired link.').replace(/\+/g, ' ')));
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
        setSessionReady(true);
        } else {
        setLinkError('Session expired or invalid. Please request a new link.');
        }
    });
    }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const inputVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.3 } }),
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/auth/login'), 3000);
  };

  if (done) {
    return (
      <main className="bg-black text-white flex items-center justify-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative text-center space-y-6 max-w-sm w-full"
        >
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="w-14 h-14 text-red-700" />
              <div className="absolute inset-0 blur-xl bg-red-700/30 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-mono font-bold tracking-widest text-sm">PASSWORD_UPDATED</p>
            <p className="text-gray-400 font-mono text-xs">Redirecting to login...</p>
          </div>
        </motion.div>
      </main>
    );
  }

  if (linkError) {
    return (
      <main className="bg-black text-white flex items-center justify-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative text-center space-y-6 max-w-sm w-full"
        >
          <div className="space-y-2">
            <p className="text-red-500 font-mono font-bold tracking-widest text-sm">LINK_EXPIRED</p>
            <p className="text-gray-400 font-mono text-xs leading-relaxed">{linkError}</p>
          </div>
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-2 px-4 rounded font-mono font-semibold text-sm transition-all duration-300 shadow-lg shadow-red-900/20"
          >
            REQUEST_NEW_LINK
          </Link>
          <Link href="/auth/login" className="block text-xs font-mono text-gray-500 hover:text-red-500 transition-colors">
            BACK_TO_LOGIN
          </Link>
        </motion.div>
      </main>
    );
  }

  if (!sessionReady) {
    return (
      <main className="bg-black text-white flex items-center justify-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative text-center space-y-4">
          <div className="relative w-8 h-8 mx-auto">
            <div className="w-8 h-8 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
            <div className="absolute inset-0 blur-md bg-red-700/20 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.35em] text-zinc-600">VERIFYING_LINK...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white flex items-center justify-center px-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <p className="text-[10px] font-mono tracking-[0.35em] text-red-700">ACCESS_RECOVERY</p>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            NEW<br />PASSWORD
          </h1>
          <p className="text-gray-500 font-mono text-xs pt-1">
            Choose a strong password for your account.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-[1px] w-8 bg-red-700" />
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          {/* New password */}
          <motion.div custom={0} variants={inputVariants}>
            <label className="block text-sm font-mono text-gray-300 mb-2">NEW_PASSWORD</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 pr-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-600 hover:text-red-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* Confirm password */}
          <motion.div custom={1} variants={inputVariants}>
            <label className="block text-sm font-mono text-gray-300 mb-2">CONFIRM_PASSWORD</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 pr-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-gray-600 hover:text-red-900 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {error && (
            <motion.p custom={2} variants={inputVariants} className="text-red-500 text-xs font-mono">
              {error}
            </motion.p>
          )}

          <motion.div custom={3} variants={inputVariants} className="pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
            >
              {loading ? 'UPDATING...' : 'UPDATE_PASSWORD'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          <motion.div custom={4} variants={inputVariants} className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-xs font-mono text-gray-500 hover:text-red-500 transition-colors"
            >
              BACK_TO_LOGIN
            </Link>
          </motion.div>
        </motion.form>
      </div>
    </main>
  );
}