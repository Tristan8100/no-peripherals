'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Email field */}
      <motion.div custom={0} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">
          EMAIL
        </label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type="email"
            placeholder="enter@example.com"
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
        </div>
      </motion.div>

      {/* Password field */}
      <motion.div custom={1} variants={inputVariants}>
        <label className="block text-sm font-mono text-gray-300 mb-2">
          PASSWORD
        </label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-red-900/50 group-hover:text-red-900 transition-colors" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full bg-gray-900/50 border border-gray-800 hover:border-red-900/30 focus:border-red-900 rounded px-4 py-2 pl-10 pr-10 text-white placeholder-gray-600 transition-colors duration-300 focus:outline-none focus:ring-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-600 hover:text-red-900 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Forgot password */}
      <motion.div custom={2} variants={inputVariants} className="text-right">
        <button
          type="button"
          className="text-sm text-gray-400 hover:text-red-900 transition-colors font-mono"
        >
          FORGOT PASSWORD?
        </button>
      </motion.div>

      {/* Submit button */}
      <motion.div custom={3} variants={inputVariants} className="pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-2 px-4 rounded font-mono font-semibold transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/20 hover:shadow-red-900/40"
        >
          ENTER
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      {/* Divider */}
      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-900/50 text-gray-500 font-mono">OR</span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="bg-gray-900/50 border border-gray-800 hover:border-indigo-900/50 hover:bg-indigo-900/10 text-gray-300 hover:text-white py-2 px-4 rounded font-mono text-sm transition-all duration-300"
        >
          GITHUB
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="bg-gray-900/50 border border-gray-800 hover:border-indigo-900/50 hover:bg-indigo-900/10 text-gray-300 hover:text-white py-2 px-4 rounded font-mono text-sm transition-all duration-300"
        >
          DISCORD
        </motion.button>
      </div>
    </motion.form>
  );
}
