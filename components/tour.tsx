'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { RecordingDot } from './svg-decorations';
import { HeaderTitle } from './header-title';
import useEvent from '@/hooks/event.hooks';

function formatDate(dateStr: string) {
  return new Date(dateStr).toISOString().split('T')[0];
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

export function Tour() {
  const { events, loading, fetchEventsNoPictures } = useEvent();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => { fetchEventsNoPictures(); }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  const getStatusColor = (dateStr: string) => {
    if (isPast(dateStr)) return 'text-gray-500';
    const daysUntil = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (daysUntil <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusLabel = (dateStr: string) => {
    if (isPast(dateStr)) return 'PAST';
    const daysUntil = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (daysUntil <= 30) return 'SOON';
    return 'CONFIRMED';
  };

  return (
    <section className="relative w-full min-h-screen bg-black py-24 overflow-hidden">
      <div className="max-w-4xl mx-auto px-4">
        <HeaderTitle title="Tours and Concerts" description="Upcoming Shows" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="space-y-1 border border-red-900/30 rounded-sm overflow-hidden"
        >
          {/* Header row */}
          <div className="grid grid-cols-12 gap-2 px-6 py-4 bg-red-900/10 border-b border-red-900/20 font-mono text-xs text-red-900/60">
            <div className="col-span-2">DATE</div>
            <div className="col-span-2">TIME</div>
            <div className="col-span-4">VENUE</div>
            <div className="col-span-3 text-right">STATUS</div>
            <div className="col-span-1 text-right">●</div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="px-6 py-8 font-mono text-xs text-red-900/40 animate-pulse">
              LOADING_EVENTS...
            </div>
          )}

          {/* Empty state */}
          {!loading && events.length === 0 && (
            <div className="px-6 py-8 font-mono text-xs text-gray-500">
              NO_EVENTS_FOUND
            </div>
          )}

          {/* Event rows */}
          {!loading && events.map((event, index) => (
            <motion.div
              key={event.id}
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
                  {formatDate(event.event_date)}
                </div>

                {/* Time */}
                <motion.div
                  animate={{ color: hoveredIndex === index ? '#8B0000' : '#FFFFFF' }}
                  className="col-span-2 font-mono text-sm font-bold"
                >
                  {formatTime(event.event_time)}
                </motion.div>

                {/* Location + Venue */}
                <div className="col-span-4 font-mono text-sm text-gray-400 truncate">
                  {event.location}
                </div>

                {/* Status */}
                <motion.div
                  className={`col-span-3 text-right font-mono text-xs font-bold ${getStatusColor(event.event_date)}`}
                >
                  {getStatusLabel(event.event_date)}
                </motion.div>

                {/* Live indicator */}
                <div className="col-span-1 flex justify-end">
                  <motion.div
                    animate={hoveredIndex === index ? { scale: [1, 1.2, 1] } : { scale: 0.8 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-red-900 rounded-full"
                  />
                </div>
              </motion.div>

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