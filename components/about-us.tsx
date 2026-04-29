'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { HeaderTitle } from './header-title';

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section ref={sectionRef} className="relative w-full bg-black py-24 overflow-hidden">

      {/* Scan line */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear', repeatDelay: 6 }}
        className="absolute inset-y-0 w-px bg-red-900/20 pointer-events-none z-10"
      />

      <div className="w-full px-8 md:px-16 space-y-0">

        <div className="mb-12 hidden">
          <HeaderTitle title="About" description="The band." />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full overflow-hidden rounded-sm border border-red-900/30"
          style={{ height: '70vh' }}
        >
          <motion.img
            src="/IMG_2065.jpg"
            alt="The band"
            style={{ y: imageY }}
            className="absolute inset-0 w-full h-[110%] object-cover object-center -top-[5%]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-red-900/70" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-900/70" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-red-900/70" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-red-900/70" />

          <div className="absolute bottom-0 left-0 right-0 p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="font-mono text-xs text-red-900/70 mb-4">// WHO_WE_ARE</div>
              <p className="font-mono text-xl md:text-2xl text-white leading-relaxed max-w-3xl">
                Started in just a dream, Recruit OP members, Guide by our passion, and here we are.
              </p>
              <p className="font-mono text-sm text-gray-400 mt-3 max-w-xl">
                That's still basically the situation.
              </p>
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-6 right-6 font-mono text-xs text-red-900 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-900 animate-pulse" />
            BAND_PHOTO_01.RAW
          </motion.div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-px mt-px border border-red-900/30 rounded-sm overflow-hidden">

          {/* Sound */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative p-8 bg-black group overflow-hidden"
          >
            <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/5 transition-colors duration-500 pointer-events-none" />
            <div className="font-mono text-xs text-red-900/60 mb-5">// SOUND</div>
            <p className="font-mono text-sm text-gray-300 leading-relaxed">
              We're a group of musicians brought together by a dream and passion for music, started in <span className="text-blue-900">STATIC VOID</span>, Ghosted and betrayed by the leader,
              and now here we are. <span className="text-red-900">NO-PERIPHERALS</span>
            </p>
            <p className="font-mono text-sm text-gray-600 leading-relaxed mt-4">
              No records yet. Just shows, passion, and a debut on the way.
            </p>
            <div className="mt-8 border-t border-red-900/20 pt-5">
              <div className="font-mono text-xs text-red-900/50">GENRE</div>
              <div className="font-mono text-sm text-white mt-1">ROCK // NOISE // UNCLASSIFIED</div>
            </div>
          </motion.div>

          {/* Second photo */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden bg-black hidden md:block"
            style={{ minHeight: '360px' }}
          >
            <img
              src="/np1.jpg"
              alt="Band live"
              className="absolute inset-0 w-full h-full object-cover opacity-70 hover:opacity-90 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 font-mono text-xs text-red-900/60">
              LIVE // UNDISCLOSED_VENUE
            </div>
          </motion.div>
        </div>

        {/* Status row — full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-px border border-red-900/30 rounded-sm overflow-hidden"
        >
          <div className="grid grid-cols-4 divide-x divide-red-900/20">
            {[
              { key: 'LABEL', val: 'NONE // INDEPENDENT' },
              { key: 'MANAGEMENT', val: 'NONE // DIY' },
              { key: 'DEBUT', val: 'INCOMING' },
              { key: 'BOOKING', val: 'OPEN' },
            ].map(({ key, val }) => (
              <div key={key} className="px-8 py-6 group hover:bg-red-900/5 transition-colors">
                <div className="font-mono text-xs text-red-900/50 mb-2">{key}</div>
                <div className="font-mono text-sm text-white">{val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 font-mono text-xs">
            NO_MANAGEMENT // NO_LABEL // INDEPENDENT
          </p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-4 inline-block text-red-900 font-mono text-xs"
          >
            ▌ JUST GETTING STARTED
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}