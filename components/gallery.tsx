'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { AnimatePresence, motion as m } from 'motion/react';
import { PlusIcon } from 'lucide-react';
import { Cursor } from './motion-primitives/cursor';
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
} from './motion-primitives/morphing-dialog';

type EventPicture = {
  id: string;
  image_url: string;
  created_at: string;
};

// Repeating layout pattern for the bento grid (6-column)
const colSpanPattern = ['col-span-4', 'col-span-2', 'col-span-2', 'col-span-3', 'col-span-3'];
const rowSpanPattern = ['row-span-2', 'row-span-1', 'row-span-1', 'row-span-1', 'row-span-1'];

function BentoCell({
  picture,
  index,
  colSpan,
  rowSpan,
}: {
  picture: EventPicture;
  index: number;
  colSpan: string;
  rowSpan: string;
}) {
  const [isHovering, setIsHovering] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  const handlePositionChange = (x: number, y: number) => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setIsHovering(
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
      }}
      className={`${colSpan} ${rowSpan} relative`}
    >
      <MorphingDialog
        transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
      >
        <Cursor
          attachToParent
          variants={{
            initial: { scale: 0.3, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.3, opacity: 0 },
          }}
          springConfig={{ bounce: 0.001 }}
          transition={{ ease: 'easeInOut', duration: 0.15 }}
          onPositionChange={handlePositionChange}
        >
          <m.div
            animate={{ width: isHovering ? 80 : 16, height: isHovering ? 32 : 16 }}
            className="flex items-center justify-center rounded-[24px] bg-gray-500/40 backdrop-blur-md"
          >
            <AnimatePresence>
              {isHovering && (
                <m.div
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  className="inline-flex w-full items-center justify-center"
                >
                  <div className="inline-flex items-center text-sm text-white">
                    View <PlusIcon className="ml-1 h-4 w-4" />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </Cursor>

        <MorphingDialogTrigger
          className="w-full h-full rounded-sm overflow-hidden border border-red-900/20 hover:border-red-900/60 transition-colors duration-300"
          style={{ display: 'block' }}
        >
          <div ref={targetRef} className="relative w-full h-full group">
            <Image
              src={picture.image_url}
              alt={`Event photo ${index + 1}`}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[2px] group-hover:brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40 group-hover:to-black/50 transition-colors duration-300" />
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-900/40 group-hover:border-red-900 transition-colors" />
          </div>
        </MorphingDialogTrigger>

        <MorphingDialogContainer>
          <MorphingDialogContent className="relative bg-black border border-red-900/40 rounded-sm overflow-hidden max-w-2xl w-full mx-4">
            <MorphingDialogImage
              src={picture.image_url}
              alt={`Event photo ${index + 1}`}
              className="w-full max-h-[70vh] object-contain"
            />
            <MorphingDialogClose
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-1 hover:bg-red-900/60 transition-colors"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }}
            />
          </MorphingDialogContent>
        </MorphingDialogContainer>
      </MorphingDialog>
    </motion.div>
  );
}

export function Gallery() {
  const [pictures, setPictures] = useState<EventPicture[]>([]);

  useEffect(() => {
    async function fetchPictures() {
      const { data, error } = await supabase
        .from('event_pictures')
        .select('id, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) setPictures(data);
    }

    fetchPictures();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <section className="relative w-full min-h-screen bg-black py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4 glow-text">
            GALLERY
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            OUR PAST EVENTS
          </p>
        </motion.div>

        {/* Desktop grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="hidden sm:grid grid-cols-6 gap-3 auto-rows-[250px]"
        >
          {pictures.map((picture, index) => (
            <BentoCell
              key={picture.id}
              picture={picture}
              index={index}
              colSpan={colSpanPattern[index % colSpanPattern.length]}
              rowSpan={rowSpanPattern[index % rowSpanPattern.length]}
            />
          ))}
        </motion.div>

        {/* Mobile grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid sm:hidden grid-cols-2 gap-3"
        >
          {pictures.map((picture, index) => (
            <motion.div
              key={picture.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              className={`${index === 0 ? 'col-span-2' : 'col-span-1'} relative aspect-[4/3]`}
            >
              <MorphingDialog
                transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
              >
                <MorphingDialogTrigger
                  className="w-full h-full rounded-sm overflow-hidden border border-red-900/20 active:border-red-900/60 transition-colors duration-300"
                  style={{ display: 'block' }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={picture.image_url}
                      alt={`Event photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40" />
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-900/40" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-900/40" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-900/40" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-900/40" />
                  </div>
                </MorphingDialogTrigger>

                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative bg-black border border-red-900/40 rounded-sm overflow-hidden w-[90vw] max-w-lg">
                    <MorphingDialogImage
                      src={picture.image_url}
                      alt={`Event photo ${index + 1}`}
                      className="w-full max-h-[70vh] object-contain"
                    />
                    <MorphingDialogClose
                      className="absolute top-3 right-3 text-white bg-black/60 rounded-full p-1 hover:bg-red-900/60 transition-colors"
                      variants={{
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                      }}
                    />
                  </MorphingDialogContent>
                </MorphingDialogContainer>
              </MorphingDialog>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 font-mono text-xs">
            VIEW FULL GALLERY BY JOINING
          </p>
        </motion.div>
      </div>
    </section>
  );
}