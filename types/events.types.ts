export interface EventPicture {
  id: string
  event_id: string
  image_url: string
  created_at?: string
}

export interface EventModel {
  id: string
  title: string
  description: string | null
  event_date: string
  event_time: string
  location: string
  thumbnail_url: string | null
  user_id: string | null
  created_at?: string

  event_pictures?: EventPicture[]
}

export type EventInsert = Omit<EventModel, 'id' | 'created_at' | 'event_pictures'>