'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
const supabase = createClient();
export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const inputVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // stored in auth.users raw_user_meta_data
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    alert("Verification email sent! Please check your inbox.");
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
      onSubmit={handleRegister}
    >
      {/* Full Name field */}
      <motion.div custom={0} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">FULL NAME</label>
        <div className="relative group">
          <User className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type="text"
            placeholder="Your Name"
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
        </div>
      </motion.div>

      {/* Email field */}
      <motion.div custom={1} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">EMAIL</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type="email"
            placeholder="enter@example.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
        </div>
      </motion.div>

      {/* Password field */}
      <motion.div custom={2} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">PASSWORD</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 pr-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-600 hover:text-red-900 transition-colors">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Confirm Password field */}
      <motion.div custom={3} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">CONFIRM PASSWORD</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 pr-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-600 hover:text-red-900 transition-colors">
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p custom={4} variants={inputVariants} className="text-red-500 text-xs font-mono">
          {error}
        </motion.p>
      )}

      {/* Terms checkbox */}
      <motion.div custom={5} variants={inputVariants} className="flex items-start gap-2">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 rounded border border-gray-800 bg-gray-900/50 text-red-900 focus:ring-0 cursor-pointer"
        />
        <label htmlFor="terms" className="text-xs text-gray-400 cursor-pointer">
          I agree to the{' '}
          <button type="button" className="text-red-900 hover:text-red-700 transition-colors">
            Terms & Conditions
          </button>
        </label>
      </motion.div>

      {/* Submit button */}
      <motion.div custom={6} variants={inputVariants} className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 px-4 rounded font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
        >
          {loading ? "CREATING..." : "CREATE ACCOUNT"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </motion.form>
  );
}