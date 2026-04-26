'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Instagram, Twitter, Youtube, Facebook, Music, ExternalLink, Loader2, ChevronDown } from 'lucide-react';
import { HeaderTitle } from './header-title';
import { supabase } from '@/utils/supabase/client';
import { UserModel } from '@/types/users.types';

function GlitchText({ text, className }: { text: string; className?: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
      const interval = setInterval(() => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 180);
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  return (
    <span className={`relative inline-block select-none ${className}`}>
      {glitching && (
        <>
          <span
            className="absolute inset-0 text-red-500 opacity-80"
            style={{ clipPath: 'inset(30% 0 50% 0)', transform: 'translate(-4px, 2px)' }}
            aria-hidden
          >
            {text}
          </span>
          <span
            className="absolute inset-0 text-cyan-400 opacity-60"
            style={{ clipPath: 'inset(60% 0 10% 0)', transform: 'translate(4px, -2px)' }}
            aria-hidden
          >
            {text}
          </span>
        </>
      )}
      {text}
    </span>
  );
}

// ─── Social Link ────────────────────────────────────────────────────────────
function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative p-2 border border-white/10 hover:border-red-600 transition-all duration-300 overflow-hidden"
    >
      <span className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      <span className="relative z-10 text-white/70 group-hover:text-white transition-colors duration-150">
        {icon}
      </span>
    </a>
  );
}

// ─── Scan-line Overlay ──────────────────────────────────────────────────────
function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-[0.04]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)',
        }}
      />
    </div>
  );
}

// ─── Member Section ─────────────────────────────────────────────────────────
function MemberCard({ member, index, total }: { member: UserModel; index: number; total: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const nameOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.7, 0.9], [0, 1, 1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden py-20 lg:py-0"
    >
      {/* Parallax ambient bg name */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{ opacity: nameOpacity }}
      >
        <motion.h2
          style={{ y: bgY }}
          className="text-[20vw] font-black italic opacity-[0.04] leading-none tracking-tighter text-center whitespace-nowrap"
        >
          {member.full_name?.split(' ')[0]?.toUpperCase()}
        </motion.h2>
      </motion.div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 relative z-10">

        {/* ── Image ── */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative aspect-[4/5] w-full max-w-xs sm:max-w-sm mx-auto lg:ml-0"
        >
          {/* Corner brackets */}
          <div className="absolute -inset-4 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600" />
          </div>

          {/* Unit badge */}
          <div className="absolute -top-3 left-2 z-20 flex items-center gap-2">
            <span className="bg-red-600 text-[9px] font-bold tracking-[0.2em] px-2.5 py-1 font-mono">
              UNIT_0{index + 1} // {member.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
            {member.departed_at && (
              <span className="bg-zinc-800 text-[9px] font-bold tracking-[0.15em] px-2.5 py-1 font-mono text-gray-400">
                DEPARTED_{new Date(member.departed_at).getFullYear()}
              </span>
            )}
          </div>

          {/* Photo */}
          <div className="relative w-full h-full overflow-hidden bg-zinc-900 group">
            {member.profile_path ? (
              <>
                <img
                  src={member.profile_path}
                  alt={member.full_name ?? ''}
                  className="w-full h-full object-cover object-top transition-transform duration-700 scale-105 group-hover:scale-110"
                />
                {/* Red color grade on hover */}
                <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/10 mix-blend-color transition-colors duration-700" />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <span className="text-6xl font-black text-zinc-700 italic">
                  {member.full_name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
            )}

            {/* Instrument label overlaid at bottom of photo */}
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="text-red-400 font-mono text-[11px] tracking-[0.35em] uppercase font-bold">
                // {member.instrument}
              </p>
            </div>

            <ScanLine />
          </div>

          {/* Joined year */}
          {member.joined_at && (
            <p className="text-[9px] font-mono tracking-[0.25em] text-zinc-600 mt-3 pl-1">
              EST. {new Date(member.joined_at).getFullYear()} ──────
            </p>
          )}
        </motion.div>

        {/* ── Details ── */}
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 lg:space-y-8"
        >
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              <GlitchText text={member.full_name ?? ''} />
            </h3>

            <p className="text-red-500 font-mono text-sm tracking-[0.3em] mt-2 italic uppercase">
              {member.instrument}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-[1px] w-8 bg-red-600" />
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          {member.bio && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="max-w-md"
            >
              <p className="text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                {member.bio}
              </p>
            </motion.div>
          )}

          {member.joined_at && (
            <p className="text-[10px] font-mono tracking-widest text-gray-600">
              JOINED_{new Date(member.joined_at).getFullYear()}
            </p>
          )}

          {member.socials && Object.keys(member.socials).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-wrap gap-4 pt-2 items-center"
            >
              {member.socials.twitter && <SocialLink icon={<Twitter size={18} />} href={member.socials.twitter} />}
              {member.socials.instagram && <SocialLink icon={<Instagram size={18} />} href={member.socials.instagram} />}
              {member.socials.youtube && <SocialLink icon={<Youtube size={18} />} href={member.socials.youtube} />}
              {member.socials.facebook && <SocialLink icon={<Facebook size={18} />} href={member.socials.facebook} />}
              {member.socials.spotify && <SocialLink icon={<Music size={18} />} href={member.socials.spotify} />}

              {(member.socials.twitter || member.socials.instagram || member.socials.youtube || member.socials.facebook || member.socials.spotify) && (
                <>
                  <div className="h-10 w-[1px] bg-white/20 mx-1" />
                  <button className="group flex items-center gap-2 text-[10px] font-bold hover:text-red-600 transition-colors font-mono tracking-widest">
                    DATA_SHEET
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </button>
                </>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-3 pt-2">
            {Array.from({ length: total }).map((_, i) => (
              <div
                key={i}
                className={`transition-all duration-300 ${
                  i === index ? 'w-8 h-[2px] bg-red-600' : 'w-2 h-[2px] bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {index < total - 1 && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 items-center">
          <span className="text-[10px] [writing-mode:vertical-lr] text-gray-600 tracking-widest font-mono">
            SCROLL_FOR_MORE
          </span>
          <div className="w-[1px] h-32 bg-gradient-to-b from-red-600 to-transparent" />
        </div>
      )}


      {index < total - 1 && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 xl:hidden"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <span className="text-[9px] font-mono tracking-[0.3em] text-zinc-600">SCROLL</span>
          <ChevronDown size={14} className="text-zinc-600" />
        </motion.div>
      )}
    </section>
  );
}

// actual component
export function Roster() {
  const [members, setMembers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'band_member')
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setMembers(data ?? []);
    } catch (err) {
      console.error('Failed to fetch band members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <div className="absolute inset-0 blur-md bg-red-600/30 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.35em] text-zinc-600">LOADING_ROSTER...</p>
        </div>
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-[2px] bg-red-600 mx-auto" />
          <p className="text-[10px] font-mono tracking-[0.35em] text-zinc-500">NO_MEMBERS_FOUND</p>
          <div className="w-8 h-[2px] bg-red-600 mx-auto" />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">
      <HeaderTitle
        title="BAND_MEMBERS"
        description="Our members are the core of NO PERIPHERALS."
        className="pt-16"
      />

      {members.map((member, index) => (
        <MemberCard key={member.id} member={member} index={index} total={members.length} />
      ))}

      <div className="flex items-center gap-4 px-8 py-12 opacity-30">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-[9px] font-mono tracking-widest text-zinc-600">END_OF_ROSTER</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>
    </main>
  );
}