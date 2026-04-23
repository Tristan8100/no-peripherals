'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon, X, MapPin, Clock, Calendar } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BUCKET } from '@/utils/bucket'
import Link from 'next/link'
import useEvent from '@/hooks/event.hooks'

interface EventsComponentProps {
  isAdmin?: boolean
}

export default function EventsComponent({ isAdmin = false }: EventsComponentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const { events, loading, fetchEvents } = useEvent()

  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    setThumbPreview(selectedEvent?.thumbnail_url ?? null)
    setGalleryPreviews([])
  }, [selectedEvent])

  function handleClose(open: boolean) {
    setIsDialogOpen(open)
    if (!open) {
      setSelectedEvent(null)
      setThumbPreview(null)
      setGalleryPreviews([])
    }
  }

  function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setThumbPreview(URL.createObjectURL(file))
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setGalleryPreviews(files.map(f => URL.createObjectURL(f)))
  }

  function removeGalleryPreview(index: number) {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  async function uploadFile(file: File) {
    const filePath = `events/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file)
    if (error) throw error
    return supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl
  }

  async function deleteFileFromStorage(url: string) {
    const path = url.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isAdmin) return
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      let thumbnailUrl = selectedEvent?.thumbnail_url
      const thumbFile = formData.get('thumbnail') as File
      const galleryFiles = galleryInputRef.current?.files

      if (thumbFile?.size > 0) {
        if (thumbnailUrl) await deleteFileFromStorage(thumbnailUrl)
        thumbnailUrl = await uploadFile(thumbFile)
      }

      const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        event_date: formData.get('event_date'),
        event_time: formData.get('event_time'),
        location: formData.get('location'),
        thumbnail_url: thumbnailUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }

      let eventId = selectedEvent?.id

      if (selectedEvent) {
        const { error } = await supabase.from('events').update(eventData).eq('id', eventId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('events').insert([eventData]).select().single()
        if (error) throw error
        eventId = data.id
      }

      if (galleryFiles && galleryFiles.length > 0) {
        const urls = await Promise.all(Array.from(galleryFiles).map(f => uploadFile(f)))
        await supabase.from('event_pictures').insert(urls.map(url => ({ event_id: eventId, image_url: url })))
      }

      handleClose(false)
      fetchEvents()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(event: any) {
    if (!isAdmin || !window.confirm("Delete event and all hosted images?")) return
    try {
      if (event.thumbnail_url) await deleteFileFromStorage(event.thumbnail_url)
      if (event.event_pictures) {
        await Promise.all(event.event_pictures.map((p: any) => deleteFileFromStorage(p.image_url)))
      }
      await supabase.from('events').delete().eq('id', event.id)
      fetchEvents()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  function formatTime(timeStr: string) {
    const [h, m] = timeStr.split(':')
    const d = new Date()
    d.setHours(+h, +m)
    return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  function isUpcoming(dateStr: string) {
    return new Date(dateStr) >= new Date(new Date().toDateString())
  }

  const EventDialog = (
    <Dialog open={isDialogOpen} onOpenChange={handleClose}>
      {isAdmin && (
        <DialogTrigger asChild>
          <Button size="sm" onClick={() => setSelectedEvent(null)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Event
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input name="title" defaultValue={selectedEvent?.title} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input name="event_date" type="date" defaultValue={selectedEvent?.event_date} required />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input name="event_time" type="time" defaultValue={selectedEvent?.event_time} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input name="location" defaultValue={selectedEvent?.location} required />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={selectedEvent?.description} rows={3} />
          </div>

          {/* Thumbnail */}
          <div className="space-y-1.5">
            <Label>Thumbnail</Label>
            <Input name="thumbnail" type="file" accept="image/*" onChange={handleThumbChange} />
            {thumbPreview && (
              <div className="relative mt-2 w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setThumbPreview(null)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Gallery */}
          <div className="space-y-1.5">
            <Label>Gallery</Label>
            <Input ref={galleryInputRef} type="file" multiple accept="image/*" onChange={handleGalleryChange} />
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {galleryPreviews.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryPreview(i)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedEvent && (
            <Link href={`/admin/events/${selectedEvent.id}`}>
              <Button type="button" variant="secondary" className="w-full">View Event Details</Button>
            </Link>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {selectedEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {events.length} {events.length === 1 ? 'event' : 'events'}
          </p>
        </div>
        {isAdmin && EventDialog}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed rounded-xl text-muted-foreground">
          <p className="text-sm font-medium">No events yet</p>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => { setSelectedEvent(null); setIsDialogOpen(true) }}>
              <Plus className="w-4 h-4 mr-1.5" /> Create the first one
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="group rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {event.thumbnail_url ? (
                  <img
                    src={event.thumbnail_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Upcoming badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant={isUpcoming(event.event_date) ? 'default' : 'secondary'} className="text-xs">
                    {isUpcoming(event.event_date) ? 'Upcoming' : 'Past'}
                  </Badge>
                </div>
                {/* Admin actions overlay */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={() => { setSelectedEvent(event); setIsDialogOpen(true) }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm text-destructive hover:text-destructive"
                      onClick={() => handleDelete(event)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-4 gap-3">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{event.title}</h3>

                <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatTime(event.event_time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Footer */}
                {!isAdmin && (
                  <div className="mt-auto pt-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog (not admin trigger — used for programmatic open from empty state) */}
      {!isAdmin && (
        <Dialog open={isDialogOpen} onOpenChange={handleClose}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            {/* same form content reused — non-admin won't reach this */}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}