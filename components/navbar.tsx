'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

const navItems = ['HOME', 'ROSTER', 'TOUR', 'GALLERY', 'ARCHIVE'];

export function Navbar() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass px-1 py-1 rounded-full flex gap-1">
        {navItems.map((item, index) => (
          <motion.button
            key={item}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative px-4 py-2 text-sm font-mono text-white"
            whileHover={{ scale: 1.05 }}
          >
            {hoveredIndex === index && (
              <motion.div
                layoutId="navbar-pill"
                className="absolute inset-0 bg-red-900/30 rounded-full border border-red-900/50"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{item}</span>
          </motion.button>
        ))}
      </div>
    </motion.nav>
  );
}
