'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Heart, Trash2, Edit, Loader2, ImageIcon, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import usePost from '@/hooks/posts.hooks'
import { PostModel } from '@/types/posts.types'
import { UserModel } from '@/types/users.types'
import {ImageCarousel, PostFormDialog} from './posts.functions'

import { PostsProps, PostCardProps } from '@/types/posts.types'

import { PostCard } from './postsCard'

export default function Posts({ role }: PostsProps) {
  const {
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
  } = usePost()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<UserModel | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<PostModel | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
    supabase.auth.getUser().then(async ({ data }) => {
        const userId = data.user?.id
        if (!userId) return

        setCurrentUserId(userId)

        const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

        setCurrentUser(profile)
    })
    }, [])

  async function handleSubmit(content: string, newFiles: File[], deletedIds: string[]) {
    setSubmitting(true)
    try {
      if (selectedPost) {
        await updatePost(selectedPost.id, content, newFiles, deletedIds)
      } else {
        await createPost(content, newFiles)
      }
      setIsDialogOpen(false)
      setSelectedPost(null)
    } catch (err) {
      console.error('Submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(post: PostModel) {
    if (!window.confirm('Delete this post?')) return
    try {
      await deletePost(post.id)
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  function openEdit(post: PostModel) {
    setSelectedPost(post)
    setIsDialogOpen(true)
  }

  // admin sees all, member sees all too (feed) — filter can be adjusted
  const visiblePosts = posts

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
        <Button
          onClick={() => {
            setSelectedPost(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Form Dialog */}
      <PostFormDialog
        open={isDialogOpen}
        onOpenChange={(v) => {
          setIsDialogOpen(v)
          if (!v) setSelectedPost(null)
        }}
        selectedPost={selectedPost}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : visiblePosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">No posts yet.</div>
      ) : (
        <div className="space-y-4">
          {visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId ?? ''}
              role={role}
              user={currentUser}
              onEdit={openEdit}
              onDelete={handleDelete}
              onLike={likePost}
              onUnlike={unlikePost}
            />
          ))}
        </div>
      )}
    </div>
  )
}