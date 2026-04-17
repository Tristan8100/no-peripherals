'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import { Loader2, AlertCircle, Users, Search, ChevronLeft, ChevronRight, UserCog, Upload, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/utils/supabase/client'
import { BUCKET } from '@/utils/bucket'
import { UserModel, BandMemberForm, INSTRUMENTS, SOCIAL_PLATFORMS } from '@/types/users.types'

const PAGE_SIZE = 10

const EMPTY_FORM: BandMemberForm = {
  role: 'band_member',
  instrument: '',
  joined_at: '',
  bio: '',
  departed_at: '',
  display_order: '',
  is_active: true,
  socials: {},
}

export default function UsersComponent() {
  const [users, setUsers] = useState<UserModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<BandMemberForm>(EMPTY_FORM)

  // photo preview state
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { setPage(1) }, [search])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDialog = (user: UserModel) => {
    setSelectedUser(user)
    setForm({
      role: user.role ?? 'band_member',
      instrument: user.instrument ?? '',
      joined_at: user.joined_at ?? '',
      bio: user.bio ?? '',
      departed_at: user.departed_at ?? '',
      display_order: user.display_order?.toString() ?? '',
      is_active: user.is_active ?? true,
      socials: user.socials ?? {},
    })
    // reset photo state on open
    setPhotoFile(null)
    setPhotoPreview(null)
    setDialogOpen(true)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadPhoto = async (file: File): Promise<string> => {
    const path = `profiles/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file)
    if (error) throw error
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const deletePhotoFromStorage = async (url: string) => {
    const path = url.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  const setSocial = (key: keyof BandMemberForm['socials'], value: string) => {
    setForm(f => ({ ...f, socials: { ...f.socials, [key]: value || undefined } }))
  }

  const handleSubmit = async () => {
    if (!selectedUser || !form.instrument || !form.joined_at) return
    setSubmitting(true)
    try {
      let profileUrl = selectedUser.profile_path

      if (photoFile) {
        // delete old photo if exists
        if (profileUrl) await deletePhotoFromStorage(profileUrl)
        profileUrl = await uploadPhoto(photoFile)
      }

      const { error } = await supabase
        .from('users')
        .update({
          role: 'band_member',
          instrument: form.instrument,
          joined_at: form.joined_at,
          bio: form.bio || null,
          departed_at: form.departed_at || null,
          display_order: form.display_order ? parseInt(form.display_order) : null,
          is_active: form.is_active,
          socials: Object.keys(form.socials).length ? form.socials : null,
          profile_path: profileUrl,
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              role: 'band_member',
              instrument: form.instrument,
              joined_at: form.joined_at,
              bio: form.bio || null,
              departed_at: form.departed_at || null,
              display_order: form.display_order ? parseInt(form.display_order) : null,
              is_active: form.is_active,
              socials: Object.keys(form.socials).length ? form.socials : null,
              profile_path: profileUrl ?? null,
            }
          : u
      ))
      setDialogOpen(false)
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveFromBand = async () => {
    if (!selectedUser) return
    setSubmitting(true)
    try {
      // delete photo from storage if exists
      if (selectedUser.profile_path) {
        await deletePhotoFromStorage(selectedUser.profile_path)
      }

      const { error } = await supabase
        .from('users')
        .update({
          role: 'user',
          instrument: null,
          joined_at: null,
          bio: null,
          departed_at: null,
          display_order: null,
          is_active: true,
          socials: null,
          profile_path: null,
        })
        .eq('id', selectedUser.id)

      if (error) throw error

      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id
          ? { ...u, role: 'user', instrument: null, joined_at: null, bio: null, departed_at: null, display_order: null, is_active: true, socials: null, profile_path: null }
          : u
      ))
      setDialogOpen(false)
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email[0].toUpperCase()
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'band_member': return 'default'
      case 'moderator': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button onClick={fetchUsers} className="text-sm underline">Try Again</button>
      </div>
    )
  }

  const currentPhoto = photoPreview ?? selectedUser?.profile_path ?? null

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Users</h1>
        </div>
        <span className="text-sm text-muted-foreground">{filtered.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  {search ? `No users matching "${search}".` : 'No users found.'}
                </td>
              </tr>
            ) : (
              paginated.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_path ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.full_name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role ?? 'user'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(user)}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center">Page {page} of {totalPages}</span>
          <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedUser?.role === 'band_member' ? 'Edit Band Member' : 'Promote to Band Member'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="flex items-center gap-3 py-2 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.profile_path ?? undefined} />
                <AvatarFallback>
                  {getInitials(selectedUser.full_name, selectedUser.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedUser.full_name ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-4 py-2">

            {/* Photo upload */}
            <div className="space-y-2">
              <Label>Band Profile Photo <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <div className="flex items-center gap-4">
                {currentPhoto ? (
                  <div className="relative h-20 w-20 shrink-0">
                    <img
                      src={currentPhoto}
                      className="h-20 w-20 rounded-lg object-cover border"
                      alt="Profile preview"
                    />
                    {photoPreview && (
                      <button
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="band-photo"
                    onChange={handlePhotoChange}
                  />
                  <Label
                    htmlFor="band-photo"
                    className="cursor-pointer inline-flex items-center gap-2 text-sm bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/80"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {currentPhoto ? 'Change photo' : 'Upload photo'}
                  </Label>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instrument <span className="text-destructive">*</span></Label>
              <Select
                value={form.instrument}
                onValueChange={v => setForm(f => ({ ...f, instrument: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument..." />
                </SelectTrigger>
                <SelectContent>
                  {INSTRUMENTS.map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Joined Band <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={form.joined_at}
                onChange={e => setForm(f => ({ ...f, joined_at: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Short bio..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departed <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="date"
                  value={form.departed_at}
                  onChange={e => setForm(f => ({ ...f, departed_at: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Order <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 1"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active" className="cursor-pointer">Currently active member</Label>
            </div>

            <div className="space-y-3">
              <Label>Socials <span className="text-muted-foreground text-xs">(optional)</span></Label>
              {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-24 text-sm text-muted-foreground shrink-0">{label}</span>
                  <Input
                    placeholder={placeholder}
                    value={form.socials[key] ?? ''}
                    onChange={e => setSocial(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {selectedUser?.role === 'band_member' && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveFromBand}
                disabled={submitting}
              >
                Remove from band
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.instrument || !form.joined_at}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}