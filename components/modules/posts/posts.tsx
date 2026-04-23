'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import usePost from '@/hooks/posts.hooks'
import { PostModel, PostsProps } from '@/types/posts.types'
import { UserModel } from '@/types/users.types'
import { PostFormDialog } from './posts.functions'
import { PostCard } from './postsCard'

export default function Posts({ role }: PostsProps) {
  const {
    posts, loading, fetchPosts,
    createPost, updatePost, deletePost,
    likePost, unlikePost,
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
        .from('users').select('*').eq('id', userId).single()
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Feed</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => { setSelectedPost(null); setIsDialogOpen(true) }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Post
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Dialog */}
        <PostFormDialog
          open={isDialogOpen}
          onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setSelectedPost(null) }}
          selectedPost={selectedPost}
          onSubmit={handleSubmit}
          submitting={submitting}
        />

        {/* Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 border border-dashed rounded-xl text-muted-foreground">
            <p className="text-sm font-medium">No posts yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedPost(null); setIsDialogOpen(true) }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Create the first one
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
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
    </div>
  )
}