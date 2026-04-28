'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Music2,
  CalendarDays,
  CheckCircle2,
  ShieldOff,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  ExternalLink,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { UserModel } from '@/types/users.types'

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.54V6.79a4.84 4.84 0 0 1-1.02-.1z" />
    </svg>
  )
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

function getInitials(name: string | null, email: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (email[0] ?? '?').toUpperCase()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const socialConfig = [
  { key: 'facebook' as const, label: 'Facebook', Icon: Facebook },
  { key: 'instagram' as const, label: 'Instagram', Icon: Instagram },
  { key: 'twitter' as const, label: 'Twitter / X', Icon: Twitter },
  { key: 'youtube' as const, label: 'YouTube', Icon: Youtube },
  { key: 'tiktok' as const, label: 'TikTok', Icon: TiktokIcon },
  { key: 'spotify' as const, label: 'Spotify', Icon: SpotifyIcon },
]

export default function BandMemberPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [member, setMember] = useState<UserModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function fetchMember() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .eq('role', 'band_member')
          .single()
        if (error) throw error
        setMember(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading member...</p>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="max-w-xl mx-auto p-8 space-y-4 mt-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Member not found</AlertTitle>
          <AlertDescription>
            {error ?? 'This member does not exist or is not a band member.'}
          </AlertDescription>
        </Alert>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>
    )
  }

  const activeSocials = socialConfig.filter(s => member.socials?.[s.key])

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-br from-primary/20 via-primary/5 to-muted overflow-hidden">
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full border border-primary/10" />
        <div className="absolute -top-8 -right-8 h-48 w-48 rounded-full border border-primary/10" />
        <div className="absolute top-8 -left-20 h-72 w-72 rounded-full border border-primary/5" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar overlaps hero */}
        <div className="-mt-16 sm:-mt-20 mb-6 flex items-end justify-between">
          <div className="relative">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl text-3xl">
              <AvatarImage src={member.profile_path ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/15 text-primary font-bold text-2xl sm:text-3xl">
                {getInitials(member.full_name, member.email)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-background ${
                member.is_active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
              }`}
            />
          </div>

          <div className="hidden sm:block pb-2">
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Back button mobile */}
        <div className="sm:hidden mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Name + status */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              {member.full_name ?? '—'}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm sm:text-base">{member.email}</p>
          </div>
          {member.is_active ? (
            <Badge className="gap-1.5 px-3 py-1 text-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm text-muted-foreground">
              <ShieldOff className="h-3.5 w-3.5" />
              Inactive
            </Badge>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Music2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Instrument</span>
            </div>
            <p className="font-semibold text-sm sm:text-base truncate">
              {member.instrument ?? '—'}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Joined</span>
            </div>
            <p className="font-semibold text-sm sm:text-base">
              {member.joined_at
                ? new Date(member.joined_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                : '—'}
            </p>
          </div>

          {member.departed_at ? (
            <div className="rounded-xl border bg-card p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Departed</span>
              </div>
              <p className="font-semibold text-sm sm:text-base">
                {new Date(member.departed_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card p-4 hidden sm:block">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Status</span>
              </div>
              <p className="font-semibold text-sm sm:text-base">
                {member.is_active ? 'Current member' : 'Former member'}
              </p>
            </div>
          )}
        </div>

        {/* Bio */}
        {member.bio && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              About
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {member.bio}
            </p>
          </div>
        )}

        {/* Socials */}
        {activeSocials.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Find them on
            </h2>
            <div className="flex flex-wrap gap-3">
              {activeSocials.map(({ key, label, Icon }) => (
                <a
                  key={key}
                  href={member.socials![key]!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:border-primary/30 hover:shadow-sm group"
                >
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span>{label}</span>
                  <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {member.created_at && (
          <p className="text-xs text-muted-foreground/60 pb-10">
            Profile created {formatDate(member.created_at)}
          </p>
        )}
      </div>
    </div>
  )
}