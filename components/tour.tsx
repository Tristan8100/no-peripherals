'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { RecordingDot } from './svg-decorations';

const tourDates = [
  { date: '2024-03-15', location: 'TOKYO', status: 'CONFIRMED', venue: 'Roppongi Club' },
  { date: '2024-04-02', location: 'BANGKOK', status: 'CONFIRMED', venue: 'Thonglor Space' },
  { date: '2024-04-28', location: 'SEOUL', status: 'ON_SALE', venue: 'Gangnam Theater' },
  { date: '2024-05-12', location: 'HONG_KONG', status: 'ON_SALE', venue: 'Central Venue' },
  { date: '2024-06-08', location: 'SINGAPORE', status: 'COMING_SOON', venue: 'Marina Stage' },
  { date: '2024-07-20', location: 'JAKARTA', status: 'COMING_SOON', venue: 'South Jakarta Hall' },
];

export function Tour() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-500';
      case 'ON_SALE':
        return 'text-yellow-500';
      case 'COMING_SOON':
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-black py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 glow-text">
            TERMINAL FEED
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            // LIVE RECORDING STREAM //
          </p>
        </motion.div>

        {/* Tour list with terminal styling */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="space-y-1 border border-red-900/30 rounded-sm overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-red-900/10 border-b border-red-900/20 font-mono text-xs text-red-900/60">
            <div className="col-span-2">DATE</div>
            <div className="col-span-2">LOCATION</div>
            <div className="col-span-4">VENUE</div>
            <div className="col-span-3 text-right">STATUS</div>
            <div className="col-span-1 text-right">●</div>
          </div>

          {/* Tour dates */}
          {tourDates.map((tour, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer relative group"
            >
              <motion.div
                animate={{
                  backgroundColor: hoveredIndex === index ? 'rgba(139, 0, 0, 0.1)' : 'transparent',
                }}
                className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-red-900/10 transition-colors"
              >
                {/* Recording indicator */}
                <div className="col-span-1 flex items-center">
                  {hoveredIndex === index && (
                    <div className="w-2 h-2 bg-red-900 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Date */}
                <div className="col-span-2 font-mono text-sm text-white">
                  {tour.date}
                </div>

                {/* Location */}
                <motion.div
                  animate={{
                    color: hoveredIndex === index ? '#8B0000' : '#FFFFFF',
                  }}
                  className="col-span-2 font-mono text-sm font-bold"
                >
                  {tour.location}
                </motion.div>

                {/* Venue */}
                <div className="col-span-4 font-mono text-sm text-gray-400 truncate">
                  {tour.venue}
                </div>

                {/* Status */}
                <motion.div
                  className={`col-span-3 text-right font-mono text-xs font-bold ${getStatusColor(tour.status)}`}
                >
                  {tour.status}
                </motion.div>

                {/* Live indicator */}
                <div className="col-span-1 flex justify-end">
                  <motion.div
                    animate={
                      hoveredIndex === index
                        ? { scale: [1, 1.2, 1] }
                        : { scale: 0.8 }
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-red-900 rounded-full"
                  />
                </div>
              </motion.div>

              {/* Hover highlight overlay */}
              {hoveredIndex === index && (
                <motion.div
                  layoutId="tour-hover"
                  className="absolute inset-0 border-l-4 border-r-4 border-red-900 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 font-mono text-xs">
            MORE_DATES_INCOMING // FOLLOW_FOR_UPDATES
          </p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-4 inline-block text-red-900 font-mono text-xs"
          >
            ▌ RECORDING LIVE
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
