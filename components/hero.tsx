'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

/* ---------------- PARTICLES ---------------- */
function ParticlesBackground() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.3,
        duration: Math.random() * 25 + 10,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full opacity-60">
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          cx={p.x * 10}
          cy={p.y * 10}
          r={p.size}
          className="text-accent"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            cy: [p.y * 10 + 80, p.y * 10 - 80],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </svg>
  );
}


function FrameOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none text-accent/30"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >

      {/* Massive outer ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.2"
        opacity="0.2"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner arena circle */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.15"
        opacity="0.2"
      />

      {/* Four arena anchors */}
      {[0, 90, 180, 270].map((rot, i) => (
        <motion.g key={i} transform={`rotate(${rot} 50 50)`}>
          <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="0.4" />
        </motion.g>
      ))}

      {/* Center pulse core */}
      <motion.circle
        cx="50"
        cy="50"
        r="3"
        fill="currentColor"
        animate={{
          opacity: [0.2, 0.6, 0.2],
          r: [2.5, 4, 2.5],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}


export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(6px)' },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.08,
        duration: 0.7,
      },
    }),
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <Image
          src="/1st_Poster.png"
          alt="No Peripherals"
          fill
          className="object-cover opacity-50 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black" />
      </div>

      <ParticlesBackground />

      <FrameOverlay />

      <div className="relative z-20 h-full flex flex-col items-center justify-center">

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative mb-10"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255,255,255,0.15)',
                '0 0 40px 10px rgba(255,255,255,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="rounded-full"
          >
            <img
              src="/NP_TRANSPARENT.png"
              className="w-28 md:w-36 rounded-full border border-white/10"
              alt="NO PERIPHERALS"
            />
          </motion.div>
        </motion.div>

        <div className="mb-10 text-center select-none">
          <div className="flex gap-6 justify-center">
            {['NO', 'PERIPHERALS'].map((word, wordIdx) => (
              <div key={wordIdx} className="flex">
                {word.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    custom={i + wordIdx * 3}
                    variants={titleVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter text-white hover:text-accent transition"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>

          <div className="text-xs md:text-sm text-white/40 tracking-[0.4em] mt-4">
            BEYOND SIGHT · WITHIN SOUND
          </div>
        </div>

        {/* SUBTITLE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="w-24 h-px bg-white/20 mx-auto mb-3" />
          <p className="text-white/50 font-mono tracking-[0.35em] text-xs md:text-sm">
            EXPERIENCE THE NOISE
          </p>
          <div className="w-24 h-px bg-white/20 mx-auto mt-3" />
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="flex flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] text-white/40 tracking-widest">
            Scroll
          </span>
          <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="w-1 h-1 bg-white/60 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}