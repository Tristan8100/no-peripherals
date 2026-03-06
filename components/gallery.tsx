'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { VignetteMask } from './svg-decorations';

const galleryItems = [
  {
    id: 1,
    type: 'image',
    colSpan: 'col-span-4',
    rowSpan: 'row-span-2',
    title: 'LIVE_PERFORMANCE',
    src: '/band-poster.jpg',
  },
  {
    id: 2,
    type: 'image',
    colSpan: 'col-span-2',
    rowSpan: 'row-span-1',
    title: 'GEAR_DETAIL',
    bg: 'bg-gradient-to-br from-red-900/20 to-indigo-900/20',
  },
  {
    id: 3,
    type: 'icon',
    colSpan: 'col-span-2',
    rowSpan: 'row-span-1',
    title: 'SYNTH_CORE',
    icon: '◆',
  },
  {
    id: 4,
    type: 'image',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-1',
    title: 'VIDEO_LOOP',
    bg: 'bg-gradient-to-r from-indigo-900/30 via-red-900/20 to-black',
  },
  {
    id: 5,
    type: 'texture',
    colSpan: 'col-span-3',
    rowSpan: 'row-span-1',
    title: 'ABSTRACT_SIGNAL',
    bg: 'bg-gradient-to-b from-red-900/10 to-transparent',
  },
];

export function Gallery() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 },
    },
  };

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
            BENTO_MATRIX
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            // ASYMMETRICAL DEPTH ARRANGEMENT //
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-6 gap-3 auto-rows-[250px]"
        >
          {galleryItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className={`${item.colSpan} ${item.rowSpan} relative group rounded-sm overflow-hidden border border-red-900/20 cursor-pointer`}
              whileHover={{ borderColor: 'rgba(139, 0, 0, 0.6)' }}
            >
              {/* Background */}
              {item.type === 'image' && item.src ? (
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className={`w-full h-full ${item.bg || 'bg-gray-900/50'}`} />
              )}

              {/* Vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40 group-hover:to-black/60 transition-colors duration-300" />

              {/* Content overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                {item.type === 'icon' && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl text-red-900 mb-4"
                  >
                    {item.icon}
                  </motion.div>
                )}

                <h3 className="text-xl font-mono font-bold text-white text-center mb-2">
                  {item.title}
                </h3>

                {item.type === 'icon' && (
                  <div className="text-xs font-mono text-gray-400 text-center">
                    SIGNAL_ACTIVE
                  </div>
                )}

                {item.type === 'texture' && (
                  <div className="text-xs font-mono text-gray-400 text-center">
                    FREQUENCY_MODULATED
                  </div>
                )}

                {item.type === 'image' && item.src && (
                  <div className="text-xs font-mono text-gray-400 text-center mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-900 rounded-full animate-pulse" />
                    LIVE_CAPTURE
                  </div>
                )}
              </motion.div>

              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
            </motion.div>
          ))}
        </motion.div>

        {/* Gallery footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 font-mono text-xs">
            VIEW_FULL_ARCHIVE // 1024_ITEMS_STORED
          </p>
        </motion.div>
      </div>
    </section>
  );
}
