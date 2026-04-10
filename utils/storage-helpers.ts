// lib/supabase-helpers.ts
import { supabase } from './supabase/client'

const BUCKET = 'no-peripherals-storage'

export const uploadImage = async (file: File) => {
  const filePath = `events/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from(BUCKET).upload(filePath, file)
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

export const deleteImageFromStorage = async (url: string) => {
  // Extracts path after /public/bucket-name/
  const path = url.split(`${BUCKET}/`)[1]
  if (path) {
    await supabase.storage.from(BUCKET).remove([path])
  }
}