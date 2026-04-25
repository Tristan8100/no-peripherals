'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Loader2,
  AlertCircle,
  GripVertical,
  Save,
  Users,
  CheckCircle2,
  Music2,
  CalendarDays,
  ShieldOff,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client'
import { UserModel } from '@/types/users.types'


type SortableRowProps = {
  member: UserModel
  index: number
  isDragging?: boolean
}

function SortableRow({ member, index, isDragging = false }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSelfDragging,
  } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSelfDragging ? 0.3 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b last:border-0 transition-colors ${
        index % 2 === 0 ? '' : 'bg-muted/10'
      } ${isDragging ? '' : 'hover:bg-muted/30'}`}
    >
      <td className="px-3 py-3 w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1 rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-3 py-3 w-10 text-center">
        <span className="text-xs font-mono text-muted-foreground">{index + 1}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={member.profile_path ?? undefined} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
              {getInitials(member.full_name, member.email ?? '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm leading-tight">{member.full_name ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Music2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{member.instrument ?? '—'}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        {member.joined_at ? (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(member.joined_at)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {member.is_active ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1 text-muted-foreground">
              <ShieldOff className="h-3 w-3" />
              Inactive
            </Badge>
          )}
          {member.departed_at && (
            <span className="text-xs text-muted-foreground">
              left {formatDate(member.departed_at)}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

// Overlay card shown while dragging
function DragCard({ member }: { member: UserModel }) {
  return (
    <div className="flex items-center gap-3 bg-background border rounded-lg px-4 py-3 shadow-xl w-[400px] opacity-95">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={member.profile_path ?? undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
          {getInitials(member.full_name, member.email ?? '')}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{member.full_name ?? '—'}</p>
        <p className="text-xs text-muted-foreground">{member.instrument ?? '—'}</p>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (email[0] ?? '?').toUpperCase()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BandMembersOrder() {
  const [members, setMembers] = useState<UserModel[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'band_member')
        .order('display_order', { ascending: true, nullsFirst: false })

      if (error) throw error

      // Members with null display_order go to end, sorted by name
      const sorted = (data ?? []).slice().sort((a, b) => {
        if (a.display_order == null && b.display_order == null)
          return (a.full_name ?? '').localeCompare(b.full_name ?? '')
        if (a.display_order == null) return 1
        if (b.display_order == null) return -1
        return a.display_order - b.display_order
      })

      setMembers(sorted)
      setDirty(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    setSaved(false)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    setMembers(prev => {
      const oldIndex = prev.findIndex(m => m.id === active.id)
      const newIndex = prev.findIndex(m => m.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setDirty(true)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      const updates = members.map((m, i) =>
        supabase
          .from('users')
          .update({ display_order: i + 1 })
          .eq('id', m.id)
      )
      const results = await Promise.all(updates)
      const failed = results.find(r => r.error)
      if (failed?.error) throw failed.error

      // Update local state to reflect saved order
      setMembers(prev => prev.map((m, i) => ({ ...m, display_order: i + 1 })))
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      alert('Failed to save order: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const activeMember = activeId ? members.find(m => m.id === activeId) ?? null : null

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading band members...</p>
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
        <button onClick={fetchMembers} className="text-sm underline">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Band Member Order</h1>
          <Badge variant="secondary" className="ml-1">{members.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved</span>
            </div>
          )}
          <Button
            onClick={handleSaveOrder}
            disabled={!dirty || saving}
            size="sm"
            className="gap-2"
          >
            {saving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }
            {saving ? 'Saving…' : 'Save Order'}
          </Button>
        </div>
      </div>

      {dirty && (
        <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 !text-amber-500" />
          <AlertDescription>
            You have unsaved changes. Click <strong>Save Order</strong> to persist the new display order.
          </AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-muted-foreground -mt-2">
        Drag rows to reorder band members. The order here controls how they appear on the public band page.
      </p>

      {members.length === 0 ? (
        <div className="border rounded-lg py-16 text-center text-muted-foreground text-sm">
          No band members found. Promote users to band members from the Users page.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-3 py-3 w-10" />
                  <th className="px-3 py-3 w-10 text-center text-xs font-medium text-muted-foreground">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Instrument</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={members.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {members.map((member, i) => (
                    <SortableRow key={member.id} member={member} index={i} />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
            {activeMember ? <DragCard member={activeMember} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}