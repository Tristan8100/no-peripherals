import { supabase } from '@/utils/supabase/client'
import { useState } from 'react'

import { PostModel } from '@/types/posts.types'
import { BUCKET } from '@/utils/bucket'

export default function usePost() {
  const [posts, setPosts] = useState<PostModel[]>([])
  const [post, setPost] = useState<PostModel | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)


  async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('*, post_images(*), post_likes(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetchPosts error:', error)
      setError(error.message)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }


  async function fetchPost(id: string) {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, post_images(*), post_likes(*)')
        .eq('id', id)
        .single()

      if (error || !data) throw new Error(error?.message || 'Not found')
      setPost(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function createPost(content: string, imageFiles: File[]) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('posts')
      .insert([{ content, user_id: userId }])
      .select()
      .single()

    if (error) throw error

    if (imageFiles.length > 0) {
      await uploadPostImages(data.id, imageFiles)
    }

    await fetchPosts()
    return data
  }


  async function updatePost(id: string, content: string, newImageFiles: File[], deletedImageIds: string[]) {
    const { error } = await supabase
      .from('posts')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error

    if (deletedImageIds.length > 0) {
      // fetch urls first for storage cleanup
      const { data: imgs } = await supabase
        .from('post_images')
        .select('id, image_url')
        .in('id', deletedImageIds)

      if (imgs) {
        await Promise.all(imgs.map((img) => deleteFileFromStorage(img.image_url)))
      }

      await supabase.from('post_images').delete().in('id', deletedImageIds)
    }

    if (newImageFiles.length > 0) {
      await uploadPostImages(id, newImageFiles)
    }

    await fetchPosts()
  }

  async function deletePost(postId: string) {
    // fetch images for storage cleanup
    const { data: imgs } = await supabase
      .from('post_images')
      .select('image_url')
      .eq('post_id', postId)

    if (imgs) {
      await Promise.all(imgs.map((img) => deleteFileFromStorage(img.image_url)))
    }

    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) throw error

    await fetchPosts()
  }


  async function likePost(postId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('post_likes')
      .insert([{ user_id: userId, post_id: postId }])

    if (error) throw error

    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, post_likes: [...(p.post_likes || []), { user_id: userId, post_id: postId, created_at: new Date().toISOString() }] }
          : p
      )
    )
  }

  async function unlikePost(postId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)

    if (error) throw error

    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, post_likes: (p.post_likes || []).filter((l) => l.user_id !== userId) }
          : p
      )
    )
  }

  async function uploadFile(file: File): Promise<string> {
    const filePath = `post-images/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file)
    if (error) throw error
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
    return data.publicUrl
  }

  async function uploadPostImages(postId: string, files: File[]) {
    const urls = await Promise.all(files.map((f) => uploadFile(f)))
    const rows = urls.map((url, i) => ({ post_id: postId, image_url: url, position: i }))
    const { error } = await supabase.from('post_images').insert(rows)
    if (error) throw error
  }

  async function deleteFileFromStorage(url: string) {
    const path = url.split(`${BUCKET}/`)[1]
    if (path) await supabase.storage.from(BUCKET).remove([path])
  }

  return {
    posts,
    setPosts,
    post,
    setPost,
    loading,
    setLoading,
    error,
    setError,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
  }
}