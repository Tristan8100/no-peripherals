'use client'

import { useEffect, useState, useRef } from 'react'
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
  is_active: true,
  socials: {},
}

export default function UsersComponent() {
  const [users, setUsers] = useState<UserModel[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<BandMemberForm>(EMPTY_FORM)

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchUsers(1, search)
  }, [])

  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      setPage(1)
      fetchUsers(1, search)
    }, 300)
    return () => { if (searchRef.current) clearTimeout(searchRef.current) }
  }, [search])

  useEffect(() => {
    fetchUsers(page, search)
  }, [page])

  const fetchUsers = async (currentPage: number, query: string) => {
    setLoading(true)
    setError(null)
    try {
      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let q = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (query.trim()) {
        q = q.or(
          `email.ilike.%${query.trim()}%,full_name.ilike.%${query.trim()}%,role.ilike.%${query.trim()}%`
        )
      }

      const { data, error, count } = await q
      if (error) throw error
      setUsers(data ?? [])
      setTotalCount(count ?? 0)
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
      is_active: user.is_active ?? true,
      socials: user.socials ?? {},
    })
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
          is_active: form.is_active,
          socials: Object.keys(form.socials).length ? form.socials : null,
          profile_path: profileUrl,
        })
        .eq('id', selectedUser.id)

      if (error) throw error
      await fetchUsers(page, search)
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
      await fetchUsers(page, search)
      setDialogOpen(false)
    } catch (err: any) {
      alert('Failed to update: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const paginated = users

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
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Fetching users…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button onClick={() => fetchUsers(page, search)} className="text-sm underline text-muted-foreground hover:text-foreground transition-colors">
          Try again
        </button>
      </div>
    )
  }

  const currentPhoto = photoPreview ?? selectedUser?.profile_path ?? null

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
            <Users className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">Users</h1>
            <p className="text-xs text-muted-foreground">{totalCount} total</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, email or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground text-sm">
                    {search ? `No results for "${search}"` : 'No users found.'}
                  </td>
                </tr>
              ) : (
                paginated.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? 'bg-muted/5' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={user.profile_path ?? undefined} />
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(user.full_name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate max-w-[160px]">{user.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground truncate max-w-[200px]">{user.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs">
                        {user.role ?? 'user'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-sm">{formatDate(user.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openDialog(user)}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {paginated.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              {search ? `No results for "${search}"` : 'No users found.'}
            </div>
          ) : (
            paginated.map(user => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user.profile_path ?? undefined} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.full_name ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize text-xs">
                      {user.role ?? 'user'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => openDialog(user)}
                >
                  <UserCog className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="text-xs">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs font-medium">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPage(p => p + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selectedUser?.role === 'band_member' ? 'Edit Band Member' : 'Promote to Band Member'}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="flex items-center gap-3 pb-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.profile_path ?? undefined} />
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(selectedUser.full_name, selectedUser.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedUser.full_name ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
          )}

          <div className="space-y-5 pt-1">

            <div className="space-y-2">
              <Label className="text-sm">
                Band Profile Photo{' '}
                <span className="text-muted-foreground font-normal text-xs">optional</span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border bg-muted/30">
                  {currentPhoto ? (
                    <>
                      <img
                        src={currentPhoto}
                        className="h-full w-full object-cover"
                        alt="Profile preview"
                      />
                      {photoPreview && (
                        <button
                          onClick={clearPhoto}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Upload className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
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
                    className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium bg-secondary px-3 py-1.5 rounded-md hover:bg-secondary/70 transition-colors select-none"
                  >
                    <Upload className="h-3 w-3" />
                    {currentPhoto ? 'Change photo' : 'Upload photo'}
                  </Label>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  Instrument <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.instrument}
                  onValueChange={v => setForm(f => ({ ...f, instrument: v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTRUMENTS.map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Joined Band <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  className="h-9 text-sm"
                  value={form.joined_at}
                  onChange={e => setForm(f => ({ ...f, joined_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">
                Bio{' '}
                <span className="text-muted-foreground font-normal text-xs">optional</span>
              </Label>
              <Textarea
                placeholder="Short bio…"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  Departed{' '}
                  <span className="text-muted-foreground font-normal text-xs">optional</span>
                </Label>
                <Input
                  type="date"
                  className="h-9 text-sm"
                  value={form.departed_at}
                  onChange={e => setForm(f => ({ ...f, departed_at: e.target.value }))}
                />
              </div>

              <div className="flex flex-col justify-end pb-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">Currently active</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">
                Socials{' '}
                <span className="text-muted-foreground font-normal text-xs">optional</span>
              </Label>
              <div className="space-y-2.5">
                {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className="w-20 text-xs text-muted-foreground shrink-0 font-medium">{label}</span>
                    <Input
                      placeholder={placeholder}
                      value={form.socials[key] ?? ''}
                      onChange={e => setSocial(key, e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {selectedUser?.role === 'band_member' && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleRemoveFromBand}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                Remove from band
              </Button>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !form.instrument || !form.joined_at}
            >
              {submitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}