'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react'; // Install lucide-react if you haven't
import { HeaderTitle } from './header-title';

const members = [
  { 
    id: 1, 
    name: 'LUIGIIIIIII', 
    role: 'bASSSSS', 
    details: 'the bASSSSS.',
    image: '/15 (1).png', // Placeholder
    color: '#FF3B3B',
    socials: { twitter: '#', insta: '#', yt: '#' }
  },
  { 
    id: 2, 
    name: 'MAYA', 
    role: 'BASS_ENGINE', 
    details: 'Sub-harmonic specialist. Her frequencies are designed to bypass the ears and vibrate the skeletal structure.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop', // Placeholder
    color: '#3B82F6',
    socials: { twitter: '#', insta: '#', yt: '#' }
  },
  // Add more as needed...
];

export function Roster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <main className=" bg-black text-white">
        <HeaderTitle title="BAND_MEMBERS" description="Our members are the core of NO PERIPHERALS." className="pt-16" />
      {members.map((member, index) => (
        <section 
          key={member.id} 
          className="relative h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden border-b border-white/5"
        >
          {/* Background Big Name - Sticker Style */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <h2 className="text-[25vw] font-black italic opacity-5 leading-none tracking-tighter">
              {member.name}
            </h2>
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 relative z-10">
            
            {/* Left Side: Character Image (The "Sticker") */}
            <motion.div 
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative aspect-[4/5] w-full max-w-md mx-auto lg:ml-0"
            >
              {/* Border Decor */}
              <div className="absolute -inset-4 border border-white/10" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600" />
              
              {/* The Image Sticker */}
              <div className="relative w-full h-full overflow-hidden bg-zinc-900 group">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110" 
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
            </motion.div>

            {/* Right Side: Data & Details */}
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-red-600 text-[10px] font-bold tracking-widest mb-4">
                  UNIT_0{member.id} // ACTIVE
                </span>
                <h3 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">
                  {member.name}
                </h3>
                <p className="text-red-500 font-mono text-sm tracking-[0.3em] mt-2 italic uppercase">
                  {member.role}
                </p>
              </div>

              <div className="max-w-md">
                <p className="text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                  {member.details}
                </p>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-6 pt-4">
                <SocialLink icon={<Twitter size={20} />} href={member.socials.twitter} />
                <SocialLink icon={<Instagram size={20} />} href={member.socials.insta} />
                <SocialLink icon={<Youtube size={20} />} href={member.socials.yt} />
                <div className="h-10 w-[1px] bg-white/20 mx-2" />
                <button className="flex items-center gap-2 text-[10px] font-bold hover:text-red-600 transition-colors">
                  DATA_SHEET <ExternalLink size={12} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Side Indicator */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 items-center">
            <span className="text-[10px] [writing-mode:vertical-lr] text-gray-600 tracking-widest font-mono">SCROLL_FOR_MORE</span>
            <div className="w-[1px] h-32 bg-gradient-to-b from-red-600 to-transparent" />
          </div>
        </section>
      ))}
    </main>
  );
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a 
      href={href} 
      className="p-2 border border-white/10 hover:border-red-600 hover:text-red-600 transition-all duration-300 transform hover:-translate-y-1"
    >
      {icon}
    </a>
  );
}