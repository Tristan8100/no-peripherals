'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Instagram, Twitter, Youtube, Facebook, Music, ExternalLink, Loader2 } from 'lucide-react';
import { HeaderTitle } from './header-title';
import { supabase } from '@/utils/supabase/client';
import { UserModel } from '@/types/users.types';

function SocialLink({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 border border-white/10 hover:border-red-600 hover:text-red-600 transition-all duration-300 transform hover:-translate-y-1"
    >
      {icon}
    </a>
  );
}

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
        .order('display_order', { ascending: true, nullsFirst: false })
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          <p className="text-xs font-mono tracking-widest text-gray-500">LOADING_ROSTER...</p>
        </div>
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-xs font-mono tracking-widest text-gray-500">NO_MEMBERS_FOUND</p>
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
        <section
          key={member.id}
          className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden border-b border-white/5 py-20 lg:py-0"
        >
          {/* Background big name */}
          <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
            <h2 className="text-[20vw] font-black italic opacity-5 leading-none tracking-tighter text-center">
              {member.full_name?.split(' ')[0]?.toUpperCase()}
            </h2>
          </div>

          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 relative z-10">

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative aspect-[4/5] w-full max-w-xs sm:max-w-sm mx-auto lg:ml-0"
            >
              <div className="absolute -inset-4 border border-white/10" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-600" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-600" />

              <div className="relative w-full h-full overflow-hidden bg-zinc-900 group">
                {member.profile_path ? (
                  <img
                    src={member.profile_path}
                    alt={member.full_name ?? ''}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <span className="text-6xl font-black text-zinc-700">
                      {member.full_name?.[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 lg:space-y-8"
            >
              <div className='flex flex-col items-center md:items-start'>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-block px-3 py-1 bg-red-600 text-[10px] font-bold tracking-widest">
                    UNIT_0{index + 1} // {member.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                  {member.departed_at && (
                    <span className="inline-block px-3 py-1 bg-zinc-800 text-[10px] font-bold tracking-widest text-gray-400">
                      DEPARTED_{new Date(member.departed_at).getFullYear()}
                    </span>
                  )}
                </div>

                <h3 className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                  {member.full_name}
                </h3>

                <p className="text-red-500 font-mono text-sm tracking-[0.3em] mt-2 italic uppercase">
                  {member.instrument}
                </p>
              </div>

              {member.bio && (
                <div className="max-w-md">
                  <p className="text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                    {member.bio}
                  </p>
                </div>
              )}

              {member.joined_at && (
                <p className="text-[10px] font-mono tracking-widest text-gray-600">
                  JOINED_{new Date(member.joined_at).getFullYear()}
                </p>
              )}

              {/* Socials */}
              {member.socials && Object.keys(member.socials).length > 0 && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {member.socials.twitter && (
                    <SocialLink icon={<Twitter size={18} />} href={member.socials.twitter} />
                  )}
                  {member.socials.instagram && (
                    <SocialLink icon={<Instagram size={18} />} href={member.socials.instagram} />
                  )}
                  {member.socials.youtube && (
                    <SocialLink icon={<Youtube size={18} />} href={member.socials.youtube} />
                  )}
                  {member.socials.facebook && (
                    <SocialLink icon={<Facebook size={18} />} href={member.socials.facebook} />
                  )}
                  {member.socials.spotify && (
                    <SocialLink icon={<Music size={18} />} href={member.socials.spotify} />
                  )}
                  {(member.socials.twitter || member.socials.instagram || member.socials.youtube || member.socials.facebook || member.socials.spotify) && (
                    <>
                      <div className="h-10 w-[1px] bg-white/20 mx-1" />
                      <button className="flex items-center gap-2 text-[10px] font-bold hover:text-red-600 transition-colors">
                        DATA_SHEET <ExternalLink size={12} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Side scroll indicator — only on non-last */}
          {index < members.length - 1 && (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 items-center">
              <span className="text-[10px] [writing-mode:vertical-lr] text-gray-600 tracking-widest font-mono">
                SCROLL_FOR_MORE
              </span>
              <div className="w-[1px] h-32 bg-gradient-to-b from-red-600 to-transparent" />
            </div>
          )}
        </section>
      ))}
    </main>
  );
}