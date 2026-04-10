'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Trash2, ChevronLeft, Upload, Save, AlertCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from '@/utils/supabase/client'
import { BUCKET } from '@/utils/bucket'

export default function EventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Added error state
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchEventData = useCallback(async () => {
    // 1. Check if ID exists in URL
    if (!id) {
      setError("No event ID provided.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: supabaseError } = await supabase
        .from('events')
        .select('*, event_pictures(*)')
        .eq('id', id)
        .single()

      if (supabaseError || !data) {
        throw new Error(supabaseError?.message || "Event not found.")
      }

      setEvent(data)
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { 
    fetchEventData() 
  }, [fetchEventData])

  // --- STORAGE HELPERS ---
  const uploadFile = async (file: File) => {
    const path = `events/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file)
    if (error) throw error
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }

  const deleteFromStorage = async (url: string) => {
    const path = url.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  // --- ACTIONS ---
  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      let thumbUrl = event.thumbnail_url
      const newThumb = formData.get('new_thumbnail') as File

      if (newThumb && newThumb.size > 0) {
        if (thumbUrl) await deleteFromStorage(thumbUrl)
        thumbUrl = await uploadFile(newThumb)
      }

      const { error: updateError } = await supabase.from('events').update({
        title: formData.get('title'),
        description: formData.get('description'),
        location: formData.get('location'),
        event_date: formData.get('event_date'),
        event_time: formData.get('event_time'),
        thumbnail_url: thumbUrl
      }).eq('id', id)

      if (updateError) throw updateError

      setIsEditing(false)
      fetchEventData()
    } catch (err: any) {
      alert("Update failed: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setSubmitting(true)
    try {
      const urls = await Promise.all(Array.from(e.target.files).map(uploadFile))
      const rows = urls.map(url => ({ event_id: id, image_url: url }))
      const { error: insertError } = await supabase.from('event_pictures').insert(rows)
      if (insertError) throw insertError
      fetchEventData()
    } catch (err: any) {
      alert("Photo upload failed: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePhoto = async (photoId: string, url: string) => {
    if (!window.confirm("Remove this image?")) return
    try {
      await deleteFromStorage(url)
      const { error: deleteError } = await supabase.from('event_pictures').delete().eq('id', photoId)
      if (deleteError) throw deleteError
      
      setEvent((prev: any) => ({
        ...prev,
        event_pictures: prev.event_pictures.filter((p: any) => p.id !== photoId)
      }))
    } catch (err: any) {
      alert("Delete failed: " + err.message)
    }
  }

  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Fetching event details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.push('/events')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchEventData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.push('/events')}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          {isEditing ? "Cancel Edit" : "Edit Event"}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateDetails} className="space-y-6 bg-card p-6 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input name="title" defaultValue={event.title} required />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input name="location" defaultValue={event.location} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input name="event_date" type="date" defaultValue={event.event_date} />
            <Input name="event_time" type="time" defaultValue={event.event_time} />
          </div>
          <Textarea name="description" defaultValue={event.description} placeholder="Description..." />
          
          <div className="space-y-2">
            <Label>Change Thumbnail</Label>
            <Input name="new_thumbnail" type="file" accept="image/*" />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </form>
      ) : (
        <div className="space-y-4 text-center">
          <div className="relative w-full h-64 overflow-hidden rounded-xl border">
             <img src={event.thumbnail_url} className="w-full h-full object-cover" alt="Thumbnail" />
          </div>
          <h1 className="text-4xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">{event.location} • {event.event_date}</p>
          <p className="max-w-2xl mx-auto whitespace-pre-wrap">{event.description}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-xl font-semibold">Gallery ({event.event_pictures?.length || 0})</h2>
          <div className="relative">
            <Input type="file" multiple className="hidden" id="add-more" onChange={handleAddPhotos} disabled={submitting} />
            <Label htmlFor="add-more" className={`flex items-center gap-2 cursor-pointer bg-secondary px-4 py-2 rounded-md hover:bg-secondary/80 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
              Add Photos
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {event.event_pictures?.map((photo: any) => (
            <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden border">
              <img src={photo.image_url} className="object-cover w-full h-full transition-transform group-hover:scale-105" />
              <button 
                onClick={() => handleDeletePhoto(photo.id, photo.image_url)}
                className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}