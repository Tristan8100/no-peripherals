// types/users.types.ts

export type Socials = {
  facebook?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  spotify?: string
  twitter?: string
}

export type UserModel = {
  id: string
  email: string
  full_name: string | null
  profile_path: string | null
  role: string | null
  created_at: string | null
  bio: string | null
  instrument: string | null
  joined_at: string | null
  departed_at: string | null
  is_active: boolean
  display_order: number | null
  socials: Socials | null
}

export type BandMemberForm = {
  role: string
  instrument: string
  joined_at: string
  bio: string
  departed_at: string
  display_order: string
  is_active: boolean
  socials: Socials
}

export const INSTRUMENTS = [
  'Vocalist',
  'Guitarist',
  'Lead Guitarist',
  'Rhythm Guitarist',
  'Bassist',
  'Drummer',
  'Keyboardist',
  'Violinist',
  'Pianist',
  'Other',
]

export const SOCIAL_PLATFORMS: { key: keyof Socials; label: string; placeholder: string }[] = [
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/username' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@username' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@username' },
  { key: 'spotify',   label: 'Spotify',   placeholder: 'https://open.spotify.com/artist/...' },
  { key: 'twitter',   label: 'Twitter/X', placeholder: 'https://twitter.com/username' },
]