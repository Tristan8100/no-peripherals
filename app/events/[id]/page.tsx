'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ChevronLeft, AlertCircle, MapPin, Calendar, Clock, XIcon } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link'
import useEvent from '@/hooks/event.hooks'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
  MorphingDialogContainer,
} from '@/components/motion-primitives/morphing-dialog'

export default function EventDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()

  const { fetchEventData, event, loading, error } = useEvent()

  useEffect(() => {
    fetchEventData(id)
  }, [id])

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
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => fetchEventData(id)}>Try Again</Button>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Event not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Link href="/">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="space-y-4 text-center">
        <div className="relative w-full h-64 overflow-hidden rounded-xl border">
          <img
            src={event.thumbnail_url || ''}
            className="w-full h-full object-cover"
            alt="Thumbnail"
          />
        </div>

        <h1 className="text-4xl font-bold">{event.title}</h1>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {event.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> {event.event_date}
          </span>
          {event.event_time && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {event.event_time}
            </span>
          )}
        </div>

        <p className="max-w-2xl mx-auto whitespace-pre-wrap text-muted-foreground">
          {event.description}
        </p>
      </div>

      {event.event_pictures && event.event_pictures.length > 0 && (
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h2 className="text-xl font-semibold">
              Gallery ({event.event_pictures.length})
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {event.event_pictures.map((photo: any) => (
              <MorphingDialog
                key={photo.id}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <MorphingDialogTrigger className="aspect-square rounded-lg overflow-hidden border cursor-zoom-in">
                  <MorphingDialogImage
                    src={photo.image_url}
                    alt=""
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                </MorphingDialogTrigger>
                <MorphingDialogContainer>
                  <MorphingDialogContent className="relative">
                    <MorphingDialogImage
                      src={photo.image_url}
                      alt=""
                      className="h-auto w-full max-w-[90vw] rounded-[4px] object-cover lg:h-[90vh]"
                    />
                  </MorphingDialogContent>
                  <MorphingDialogClose
                    className="fixed right-6 top-6 h-fit w-fit rounded-full bg-white p-1"
                    variants={{
                      initial: { opacity: 0 },
                      animate: {
                        opacity: 1,
                        transition: { delay: 0.3, duration: 0.1 },
                      },
                      exit: { opacity: 0, transition: { duration: 0 } },
                    }}
                  >
                    <XIcon className="h-5 w-5 text-zinc-500" />
                  </MorphingDialogClose>
                </MorphingDialogContainer>
              </MorphingDialog>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}