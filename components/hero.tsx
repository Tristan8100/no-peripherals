'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useRef } from 'react';

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
    <section 
      ref={containerRef} 
      className="relative w-full h-screen overflow-hidden" 
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/1st_Poster.png"
          alt="No Peripherals Band"
          fill
          className="object-cover opacity-40 blur-[2px]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/20 to-background/90" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="mb-6 md:mb-10"
        >
          <img 
            src="/NP_TRANSPARENT.png" 
            className='rounded-full w-24 md:w-32' 
            alt="NO PERIPHERALS" 
          />
        </motion.div>

        {/* Title */}
        <div className="mb-8 md:mb-12 select-none">
          <div className="flex flex-wrap justify-center gap-x-3 md:gap-x-8">
            {["NO", "-", "PERIPHERALS"].map((word, wordIdx) => (
              <div key={wordIdx} className="flex whitespace-nowrap">
                {word.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    custom={i + wordIdx * 2}
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="glow-text text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-foreground transition-all duration-300 hover:text-accent"
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center"
        >
          <p className="text-base md:text-xl font-mono text-muted-foreground mb-3 tracking-[0.3em]">
            DEPTH REDEFINED
          </p>
          <div className="flex items-center gap-4 justify-center">
            <div className="w-12 md:w-20 h-px bg-gradient-to-r from-transparent to-secondary/50" />
            <span className="text-[10px] md:text-xs font-mono text-secondary uppercase tracking-[0.2em]">
              Tech-Noir Collective
            </span>
            <div className="w-12 md:w-20 h-px bg-gradient-to-l from-transparent to-secondary/50" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator - kept at absolute bottom */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Scroll</span>
          <div className="w-5 h-8 border border-muted rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1 bg-secondary rounded-full shadow-[0_0_5px_var(--color-secondary)]"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}