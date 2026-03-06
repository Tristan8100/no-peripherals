'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Roster } from '@/components/roster';
import { Tour } from '@/components/tour';
import { Gallery } from '@/components/gallery';
import { Footer } from '@/components/footer';

export default function Home() {
  // Add scanlines and noise effects to body
  useEffect(() => {
    const body = document.body;
    if (!body.classList.contains('scanlines')) {
      body.classList.add('scanlines', 'noise');
    }
  }, []);

  return (
    <main className="w-full overflow-hidden bg-black">
      <Navbar />
      <Hero />
      <Roster />
      <Tour />
      <Gallery />
      <Footer />
    </main>
  );
}
