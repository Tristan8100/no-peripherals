'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Plus, Trash2, Edit, Loader2, Image as ImageIcon } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BUCKET } from '@/utils/bucket'
import Link from 'next/link'
import useEvent from '@/hooks/event.hooks'

export default function EventsComponent() {
  // const [events, setEvents] = useState<any[]>([])
  // const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  const { events, setEvents, loading, setLoading, error, setError, fetchEvents } = useEvent()


  useEffect(() => {
    fetchEvents()
  }, [])

  async function uploadFile(file: File) {
    const filePath = `events/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file)
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  async function deleteFileFromStorage(url: string) {
    const path = url.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      let thumbnailUrl = selectedEvent?.thumbnail_url
      const thumbFile = formData.get('thumbnail') as File
      const galleryFiles = (form.querySelector('#gallery') as HTMLInputElement)?.files

      // Handle thumbnail storage
      if (thumbFile && thumbFile.size > 0) {
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
        user_id: (await supabase.auth.getUser()).data.user?.id // Ensure user is logged in
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

      // Handle Gallery Uploads
      if (galleryFiles && galleryFiles.length > 0) {
        const urls = await Promise.all(Array.from(galleryFiles).map(file => uploadFile(file)))
        const photoRows = urls.map(url => ({ event_id: eventId, image_url: url }))
        await supabase.from('event_pictures').insert(photoRows)
      }

      setIsDialogOpen(false)
      setSelectedEvent(null)
      fetchEvents()
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(event: any) {
    if (!window.confirm("Delete event and all hosted images?")) return

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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Events CRUD</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) setSelectedEvent(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedEvent(null)}><Plus className="w-4 h-4 mr-2" /> New Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={selectedEvent?.title} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input name="event_date" type="date" defaultValue={selectedEvent?.event_date} required />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input name="event_time" type="time" defaultValue={selectedEvent?.event_time} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input name="location" defaultValue={selectedEvent?.location} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" defaultValue={selectedEvent?.description} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thumbnail</Label>
                  <Input name="thumbnail" type="file" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <Label>Gallery</Label>
                  <Input id="gallery" type="file" multiple accept="image/*" />
                </div>
              </div>
              <div>
                {selectedEvent ? (
                  <Link href={`/admin/events/${selectedEvent?.id}`}>
                    <Button type="button" variant="secondary">
                    View Event
                  </Button>
                  </Link>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {selectedEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading events...</TableCell></TableRow>
            ) : events.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No events found.</TableCell></TableRow>
            ) : events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {event.thumbnail_url ? (
                      <img src={event.thumbnail_url} className="h-10 w-10 rounded object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><ImageIcon className="w-4 h-4 opacity-20" /></div>
                    )}
                    <span className="font-medium">{event.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{event.location}</TableCell>
                <TableCell className="text-sm">
                  {event.event_date} <span className="text-muted-foreground">at</span> {event.event_time}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setSelectedEvent(event); setIsDialogOpen(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(event)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}