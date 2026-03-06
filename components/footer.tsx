'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Youtube, label: 'YouTube', href: '#' },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-black border-t border-red-900/20 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-black text-white glow-text mb-2">
                NO PERIPHERALS
              </h3>
              <p className="text-gray-500 font-mono text-xs">
                TECH-NOIR COLLECTIVE
              </p>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Redefining depth through technological innovation and artistic vision.
              A collective exploring the boundaries of sound and visual experience.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold text-white mb-6 font-mono">NAVIGATION</h4>
            <ul className="space-y-3">
              {['HOME', 'ROSTER', 'TOUR', 'GALLERY', 'ARCHIVE'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-red-900 transition-colors font-mono text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold text-white mb-6 font-mono">CONNECT</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="p-3 border border-red-900/30 rounded-sm hover:border-red-900 hover:bg-red-900/10 transition-all"
                  title={label}
                >
                  <Icon className="w-5 h-5 text-gray-400 hover:text-red-900 transition-colors" />
                </a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent mb-8" />

        {/* Bottom footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-between"
        >
          {/* Copyright */}
          <div className="text-gray-600 font-mono text-xs mb-6 md:mb-0 text-center md:text-left">
            © 2024 NO PERIPHERALS. ALL RIGHTS RESERVED.
          </div>

          {/* Back to top button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative p-3 border border-red-900/50 rounded-full hover:border-red-900 group transition-colors"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-4 h-4 text-red-900 flex items-center justify-center"
            >
              ↑
            </motion.div>
          </motion.button>

          {/* Watermark */}
          <div className="absolute bottom-4 right-4 text-gray-800 font-mono text-xs writing-mode-vertical opacity-50">
            NAVI CHEEZE
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
