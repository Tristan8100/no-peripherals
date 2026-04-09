import { createClient } from '@/utils/supabase/client'

export async function uploadImage(file: File): Promise<{ url: string; path: string }> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('application-images')
    .upload(path, file, { upsert: false })

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from('application-images')
    .getPublicUrl(path)

  return { url: data.publicUrl, path }
}