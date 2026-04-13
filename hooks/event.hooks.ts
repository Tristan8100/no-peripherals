import { EventModel } from "@/types/events.types"
import { supabase } from "@/utils/supabase/client"
import { useState } from "react"

export default function useEvent() {
    const [events, setEvents] = useState<EventModel[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const [event, setEvent] = useState<EventModel | null>(null) //for singular
    
    async function fetchEvents() {
      setLoading(true)
  
      const { data, error } = await supabase
        .from('events')
        .select('*, event_pictures(*)')
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Fetch error:', error)
      } else {
        setEvents(data || [])
      }
  
      setLoading(false)
    }

    async function fetchEventsNoPictures() {
      setLoading(true)
  
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
  
      if (error) {
        console.error('Fetch error:', error)
      } else {
        setEvents(data || [])
      }
  
      setLoading(false)
    }

    const fetchEventData = async (id: string) => {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*, event_pictures(*)')
          .eq('id', id)
          .single()

        if (error || !data) throw new Error(error?.message || "Not found")

        setEvent(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    return { events, setEvents, loading, setLoading, error, setError, fetchEvents, fetchEventsNoPictures, fetchEventData, event, setEvent }
}