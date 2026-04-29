'use client';

import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { Roster } from '@/components/roster';
import { Tour } from '@/components/modules/events/tour';
import { Gallery } from '@/components/gallery';
import { Footer } from '@/components/footer';
import { About } from '@/components/about-us';

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
      <div className="fixed top-0 w-full z-50"><Navbar /></div>
      <Hero />
      <div id='members'><Roster /></div>
      <div id='shows'><Tour /></div>
      <div id='about'><About /></div>
      <div id='gallery'><Gallery /></div>
      
      
      <Footer />
    </main>
  );
}
