'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="relative">
            <CheckCircle className="w-14 h-14 text-red-700" />
            <div className="absolute inset-0 blur-xl bg-red-700/30 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white font-mono font-bold tracking-widest text-sm">EMAIL_SENT</p>
          <p className="text-gray-400 font-mono text-xs leading-relaxed">
            Check <span className="text-red-500">{email}</span> for a password reset link.
          </p>
          <p className="text-gray-600 font-mono text-[10px]">
            Didn't receive it? Check your spam folder.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={() => { setSent(false); setEmail(''); }}
            className="w-full border border-white/10 hover:border-red-900/50 text-gray-400 hover:text-white py-2 px-4 font-mono text-xs tracking-widest transition-all duration-300"
          >
            TRY_ANOTHER_EMAIL
          </button>
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 hover:text-red-500 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            BACK_TO_LOGIN
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      <motion.div custom={0} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">EMAIL</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type="email"
            placeholder="enter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
        </div>
      </motion.div>

      {error && (
        <motion.p custom={1} variants={inputVariants} className="text-red-500 text-xs font-mono">
          {error}
        </motion.p>
      )}

      <motion.div custom={2} variants={inputVariants} className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
        >
          {loading ? 'SENDING...' : 'SEND_RESET_LINK'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      <motion.div custom={3} variants={inputVariants} className="text-center pt-2">
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-xs font-mono text-gray-500 hover:text-red-500 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          BACK_TO_LOGIN
        </Link>
      </motion.div>
    </motion.form>
  );
}