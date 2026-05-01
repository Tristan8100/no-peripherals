// hooks/comment.hooks.ts
import { supabase } from '@/utils/supabase/client'
import { useState } from 'react'

import { CommentModel } from '@/types/comments.types'

const COMMENTS_PER_PAGE = 5

async function attachAuthors(flat: any[]): Promise<CommentModel[]> {
  const userIds = [...new Set(flat.map((c) => c.user_id))]
  const { data: users } = await supabase
    .from('users')
    .select('id, full_name, profile_path, instrument')
    .in('id', userIds)

  const userMap = Object.fromEntries((users || []).map((u) => [u.id, u]))
  return flat.map((c) => ({ ...c, author: userMap[c.user_id] ?? null }))
}

export default function useComment() {
  const [comments, setComments] = useState<CommentModel[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function fetchComments(postId: string) {
    setLoading(true)
    setError(null)
    setPage(0)
    setHasMore(true)

    const { data, error } = await supabase
      .from('comments')
      .select('*, comment_likes(*), replies:comments(count)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .range(0, COMMENTS_PER_PAGE - 1)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const withAuthors = await attachAuthors(data || [])
    setComments(withAuthors)
    setHasMore((data?.length ?? 0) === COMMENTS_PER_PAGE)
    setLoading(false)
  }

  async function fetchNextPage(postId: string) {
    setLoadingMore(true)

    const nextPage = page + 1
    const from = nextPage * COMMENTS_PER_PAGE
    const to = from + COMMENTS_PER_PAGE - 1

    const { data, error } = await supabase
      .from('comments')
      .select('*, comment_likes(*), replies:comments(count)')
      .eq('post_id', postId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      setError(error.message)
      setLoadingMore(false)
      return
    }

    const withAuthors = await attachAuthors(data || [])
    setComments((prev) => [...prev, ...withAuthors])
    setPage(nextPage)
    setHasMore((data?.length ?? 0) === COMMENTS_PER_PAGE)
    setLoadingMore(false)
  }

  async function fetchReplies(commentId: string): Promise<CommentModel[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*, comment_likes(*)')
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return attachAuthors(data || [])
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

    if (!parentId) {
      // top-level comment: reset feed
      await fetchComments(postId)
    }
    // replies are managed locally in CommentItem — caller refreshes via fetchReplies
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
    loadingMore,
    hasMore,
    error,
    fetchComments,
    fetchNextPage,
    fetchReplies,
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
    return c
  })
}