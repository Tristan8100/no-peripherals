'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { TargetBracket, Crosshair, FloatingDataString } from './svg-decorations';

const members = [
  {
    id: 1,
    name: 'ALEX',
    role: 'LEAD_SYNTH',
    signal: '98%',
    position: 'center',
    x: '50%',
    y: '50%',
    z: 50,
    scale: 1.2,
  },
  {
    id: 2,
    name: 'MAYA',
    role: 'BASS_ENGINE',
    signal: '92%',
    position: 'mid-left',
    x: '20%',
    y: '45%',
    z: 40,
    scale: 1,
  },
  {
    id: 3,
    name: 'RENZO',
    role: 'DRUMS_AI',
    signal: '95%',
    position: 'mid-right',
    x: '80%',
    y: '50%',
    z: 40,
    scale: 1,
  },
  {
    id: 4,
    name: 'IRIS',
    role: 'VISUAL_TECH',
    signal: '88%',
    position: 'back-left',
    x: '10%',
    y: '35%',
    z: 30,
    scale: 0.8,
  },
  {
    id: 5,
    name: 'NAVI',
    role: 'SOUNDSCAPE',
    signal: '91%',
    position: 'back-right',
    x: '90%',
    y: '40%',
    z: 30,
    scale: 0.8,
  },
  {
    id: 6,
    name: 'KAI',
    role: 'CREATIVE_DIR',
    signal: '96%',
    position: 'back-center',
    x: '50%',
    y: '25%',
    z: 25,
    scale: 0.75,
  },
];

export function Roster() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="relative w-full min-h-screen bg-black py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 glow-text">
            THE DEPTH COMPOSITION
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            // LAYERED 3D V-SHAPE FORMATION //
          </p>
        </motion.div>

        {/* Depth composition container */}
        <div className="relative h-96 md:h-[600px] mx-auto max-w-4xl">
          {/* Background crosshair */}
          <Crosshair className="top-1/3 left-1/3 w-80 h-80" opacity={0.1} />

          {/* Members positioned with depth */}
          {members.map((member) => (
            <motion.div
              key={member.id}
              onMouseEnter={() => setHoveredId(member.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="absolute cursor-pointer"
              style={{
                left: member.x,
                top: member.y,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                zIndex: hoveredId === member.id ? 100 : member.z,
                scale: hoveredId === member.id ? 1.15 : member.scale,
                filter:
                  hoveredId === member.id
                    ? 'brightness(1) blur(0px) drop-shadow(0 0 30px #8B0000)'
                    : member.z < 40
                      ? 'brightness(0.5) blur(2px)'
                      : 'brightness(0.75) blur(0px)',
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Member avatar */}
              <div className="relative w-24 md:w-32 h-24 md:h-32 flex items-center justify-center">
                <motion.div
                  className="w-full h-full rounded-lg border-2 border-red-900/50 overflow-hidden bg-gray-900/50 backdrop-blur flex items-center justify-center"
                  animate={{
                    borderColor: hoveredId === member.id ? '#8B0000' : 'rgba(139, 0, 0, 0.3)',
                    boxShadow:
                      hoveredId === member.id
                        ? '0 0 40px rgba(139, 0, 0, 0.6), inset 0 0 20px rgba(139, 0, 0, 0.2)'
                        : 'none',
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-black text-red-900">
                      {member.name.charAt(0)}
                    </div>
                    <div className="text-xs font-mono text-gray-400 mt-1">
                      {member.name.slice(1, 3)}
                    </div>
                  </div>
                </motion.div>

                {/* Target bracket on hover */}
                {hoveredId === member.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute inset-0 -m-4"
                  >
                    <TargetBracket />
                  </motion.div>
                )}
              </div>

              {/* Data display on hover */}
              {hoveredId === member.id && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute -right-32 md:-right-40 top-0 font-mono text-xs text-red-900 bg-black/80 border border-red-900/50 p-3 rounded w-32 md:w-40"
                >
                  <div className="mb-2">{member.name}</div>
                  <div className="text-gray-400 text-xs mb-2">ROLE: {member.role}</div>
                  <div className="font-bold">SIGNAL: {member.signal}</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-black text-red-900">6</div>
            <div className="text-xs font-mono text-gray-400 mt-2">CORE_MEMBERS</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">∞</div>
            <div className="text-xs font-mono text-gray-400 mt-2">DEPTH_LAYERS</div>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <div className="text-3xl font-black text-red-900">3D</div>
            <div className="text-xs font-mono text-gray-400 mt-2">FORMATION</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
