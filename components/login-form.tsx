'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const inputVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.3 } }),
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // get role from public.users
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (userData?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (userData?.role === 'user') {
      router.push('/user/dashboard');
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      onSubmit={handleLogin}
    >
      {/* Email */}
      <motion.div custom={0} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">EMAIL</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type="email"
            placeholder="enter@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
        </div>
      </motion.div>

      {/* Password */}
      <motion.div custom={1} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">PASSWORD</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      {/* Forgot password */}
      <motion.div custom={2} variants={inputVariants} className="text-right">
        <button type="button" className="text-sm text-gray-400 hover:text-red-900 transition-colors font-mono">
          FORGOT PASSWORD?
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.p custom={3} variants={inputVariants} className="text-red-500 text-xs font-mono">
          {error}
        </motion.p>
      )}

      {/* Submit */}
      <motion.div custom={4} variants={inputVariants} className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
        >
          {loading ? "ENTERING..." : "ENTER"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.form>
  );
}