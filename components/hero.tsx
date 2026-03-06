'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useRef } from 'react';
import { Crosshair } from 'lucide-react';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: 'easeOut',
        },
    }),
    };

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden bg-black pt-32">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/1st_Poster.png"
          alt="No Peripherals Band"
          fill
          className="object-cover opacity-40 blur-[3px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center  border border-red-500">
        {/* Logo section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
            <div className="w-12 h-12 border border-white rounded-full flex items-center justify-center font-mono text-xs text-white">
              ◯
            </div>
          </div>
        </motion.div>

        {/* Title - animated letter by letter effect */}
        <div className="mb-12">
          <div className="flex gap-2 justify-center flex-wrap border border-red-500">
            {['N', 'O', '-', 'P', 'E', 'R', 'I', 'P', 'H', 'E', 'R', 'A', 'L', 'S'].map(
              (letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={titleVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-7xl md:text-8xl font-black tracking-wider text-white glow-text"
                  style={{
                    textShadow: '0 0 30px rgba(139, 0, 0, 0.6), 0 0 60px rgba(139, 0, 0, 0.3)',
                  }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.span>
              )
            )}
          </div>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center"
        >
          <p className="text-lg md:text-xl font-mono text-gray-300 mb-2">
            DEPTH REDEFINED
          </p>
          <div className="flex items-center gap-4 justify-center">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-red-900/50" />
            <span className="text-sm font-mono text-red-900">TECH-NOIR COLLECTIVE</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-red-900/50" />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-gray-500">SCROLL</span>
            <div className="w-6 h-10 border border-gray-500 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [2, 6, 2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-2 bg-red-900 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
