'use client';

import { useState, useEffect } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { UserModel, Socials } from '@/types/users.types';
import { HeaderTitle } from '@/components/header-title';

function initials(name?: string | null) {
  return (
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '?'
  );
}

function yearRange(member: UserModel) {
  if (!member.is_active && member.joined_at && member.departed_at) {
    return `${new Date(member.joined_at).getFullYear()} – ${new Date(member.departed_at).getFullYear()}`;
  }
  if (member.joined_at) return `est. ${new Date(member.joined_at).getFullYear()}`;
  return null;
}

const SOCIAL_ICONS: Record<keyof Socials, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  ),
  spotify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 13.5a7.5 7.5 0 018 0M7 10.5a10 10 0 0110 0M9.5 16.5a5 5 0 015 0" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  ),
};

function DesktopCard({ member }: { member: UserModel }) {
  const socials = member.socials
    ? Object.entries(member.socials).filter(([, v]) => Boolean(v))
    : [];

  return (
    <div className={`group bg-card border border-border rounded-xl overflow-hidden ${!member.is_active ? 'opacity-60' : ''}`}>
      <div className="relative aspect-[3/4] bg-muted flex items-center justify-center overflow-hidden">
        {member.profile_path ? (
          <img src={member.profile_path} alt={member.full_name ?? ''} className="w-full h-full object-cover object-top" />
        ) : (
          <span className="text-2xl font-semibold text-muted-foreground">{initials(member.full_name)}</span>
        )}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-full px-2.5 py-1">
          <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
          <span className="text-[11px] font-medium text-foreground">{member.is_active ? 'Active' : 'Former'}</span>
        </div>
        <Link
          href={`/member/profile/${member.id}`}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200"
        >
          <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <Eye size={13} />
            View profile
          </span>
        </Link>
      </div>
      <div className="p-3.5">
        <p className="text-sm font-semibold text-foreground truncate">{member.full_name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 capitalize truncate">{member.instrument}</p>
        <div className="h-px bg-border my-2.5" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-mono">{yearRange(member)}</span>
          {socials.length > 0 && (
            <div className="flex gap-1.5">
              {socials.slice(0, 3).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-md bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {SOCIAL_ICONS[platform as keyof Socials]}
                </a>
              ))}
            </div>
          )}
        </div>
        {member.bio && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-2">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

function TikTokCard({ member }: { member: UserModel }) {
  const router = useRouter();

  return (
    <div className={`relative w-full h-[100dvh] flex-none overflow-hidden bg-muted snap-start snap-always ${!member.is_active ? 'saturate-[0.3]' : ''}`}>
      {member.profile_path ? (
        <img src={member.profile_path} alt={member.full_name ?? ''} className="absolute inset-0 w-full h-full object-cover object-top" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-semibold text-muted-foreground">{initials(member.full_name)}</span>
        </div>
      )}

      {/* Status pill */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 rounded-full px-2.5 py-1">
        <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
        <span className="text-[11px] font-medium text-white">{member.is_active ? 'Active' : 'Former'}</span>
      </div>

      {/* Right sidebar — z-10 so it's above everything */}
      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
        {/* Profile */}
        <div className="flex flex-col items-center gap-1">
          <button
            style={{ touchAction: 'manipulation' }}
            onClick={() => router.push(`/members/${member.id}`)}
            className="w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <Eye size={20} />
          </button>
          <span className="text-[10px] text-white/70 font-medium">Profile</span>
        </div>

        {/* Socials — button + window.open bypasses scroll container touch capture */}
        {member.socials && (Object.entries(member.socials) as [keyof Socials, string][])
          .filter(([, v]) => Boolean(v))
          .map(([platform, url]) => (
            <div key={platform} className="flex flex-col items-center gap-1">
              <button
                style={{ touchAction: 'manipulation' }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="w-11 h-11 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <span className="[&_svg]:w-5 [&_svg]:h-5">{SOCIAL_ICONS[platform]}</span>
              </button>
              <span className="text-[10px] text-white/70 font-medium capitalize">{platform}</span>
            </div>
          ))
        }
      </div>

      {/* Bottom overlay */}
      <div
        className="absolute bottom-0 inset-x-0 px-4 pb-6 pt-16"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, transparent 100%)' }}
      >
        <p className="text-lg font-semibold text-white leading-tight">{member.full_name}</p>
        <p className="text-sm text-white/70 mt-0.5 capitalize">
          {member.instrument}
          {yearRange(member) ? ` · ${yearRange(member)}` : ''}
        </p>
        {member.bio && (
          <p className="text-xs text-white/60 mt-1.5 leading-relaxed line-clamp-2 max-w-[75%]">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

type Filter = 'all' | 'active' | 'former';

function FilterTabs({ value, onChange, counts }: {
  value: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
      {(['all', 'active', 'former'] as Filter[]).map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors duration-150
            ${value === f
              ? 'bg-background text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          {f} <span className="opacity-50">{counts[f]}</span>
        </button>
      ))}
    </div>
  );
}

export default function Roster() {
  const [members, setMembers] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'band_member')
        .order('display_order', { ascending: true, nullsFirst: false });
      if (error) throw error;
      setMembers(data ?? []);
    } catch (err) {
      console.error('Failed to fetch band members:', err);
    } finally {
      setLoading(false);
    }
  };

  const counts: Record<Filter, number> = {
    all: members.length,
    active: members.filter((m) => m.is_active).length,
    former: members.filter((m) => !m.is_active).length,
  };

  const filtered = members.filter((m) => {
    if (filter === 'active') return m.is_active;
    if (filter === 'former') return !m.is_active;
    return true;
  });

  if (loading) {
    return (
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (members.length === 0) {
    return (
      <main className="bg-background text-foreground min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No members found.</p>
      </main>
    );
  }

  return (
    <main className="bg-background text-foreground">
      <HeaderTitle title="Band members" description="The core of NO PERIPHERALS." className="pt-16" />
      <div className="container mx-auto px-6 pb-20 space-y-8">
        <div className="flex items-end justify-between">
          <p className="text-sm text-muted-foreground">{counts.active} active · {counts.former} former</p>
          <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => <DesktopCard key={member.id} member={member} />)}
        </div>

        {/* Mobile TikTok scroll */}
        <div className="sm:hidden -mx-6 -mb-20">
          <div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {filtered.map((member) => <TikTokCard key={member.id} member={member} />)}
          </div>
        </div>
      </div>
    </main>
  );
}