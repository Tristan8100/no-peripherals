// hooks/comment.hooks.ts
import { supabase } from '@/utils/supabase/client'
import { useState } from 'react'

import { CommentModel } from '@/types/comments.types'

export default function useComment() {
  const [comments, setComments] = useState<CommentModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchComments(postId: string) {
    setLoading(true)
    setError(null)

    const { data: rawComments, error: commentsError } = await supabase
      .from('comments')
      .select('*, comment_likes(*)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      setError(commentsError.message)
      setLoading(false)
      return
    }

    const flat = rawComments || []

    // fetch authors from public.users separately
    const userIds = [...new Set(flat.map((c) => c.user_id))]
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, profile_path, instrument')
      .in('id', userIds)

    const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))

    // attach author + empty replies array
    const withAuthors: CommentModel[] = flat.map((c) => ({
      ...c,
      author: userMap[c.user_id] ?? null,
      replies: [],
    }))

    // nest replies under parents
    const map: Record<string, CommentModel> = {}
    withAuthors.forEach((c) => { map[c.id] = c })

    const roots: CommentModel[] = []
    withAuthors.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies!.push(map[c.id])
      } else {
        roots.push(map[c.id])
      }
    })

    setComments(roots)
    setLoading(false)
  }

  async function createComment(postId: string, content: string, parentId?: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase.from('comments').insert([{
      post_id: postId,
      user_id: userId,
      content,
      parent_id: parentId ?? null,
    }])

    if (error) throw error
    await fetchComments(postId)
  }

  async function updateComment(postId: string, commentId: string, content: string) {
    const { error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', commentId)

    if (error) throw error
    await fetchComments(postId)
  }

  async function deleteComment(postId: string, commentId: string) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) throw error
    await fetchComments(postId)
  }

  async function likeComment(postId: string, commentId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('comment_likes')
      .insert([{ user_id: userId, comment_id: commentId }])

    if (error) throw error
    setComments((prev) => toggleLikeInTree(prev, commentId, userId, true))
  }

  async function unlikeComment(postId: string, commentId: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId)

    if (error) throw error
    setComments((prev) => toggleLikeInTree(prev, commentId, userId, false))
  }

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
  }
}

function toggleLikeInTree(
  comments: CommentModel[],
  commentId: string,
  userId: string,
  add: boolean
): CommentModel[] {
  return comments.map((c) => {
    if (c.id === commentId) {
      const likes = c.comment_likes || []
      return {
        ...c,
        comment_likes: add
          ? [...likes, { user_id: userId, comment_id: commentId, created_at: new Date().toISOString() }]
          : likes.filter((l) => l.user_id !== userId),
      }
    }
    if (c.replies?.length) {
      return { ...c, replies: toggleLikeInTree(c.replies, commentId, userId, add) }
    }
    return c
  })
}