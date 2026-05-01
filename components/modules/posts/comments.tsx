'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Loader2, CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import InfiniteScroll from '@/components/infinite-scroll'
import useComment from '@/hooks/comments.hooks'
import { CommentModel, CommentsProps } from '@/types/comments.types'
import { supabase } from '@/utils/supabase/client'


function Avatar({ src, name }: { src: string | null; name: string | null }) {
  return src ? (
    <img src={src} className="w-7 h-7 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase text-muted-foreground shrink-0 select-none">
      {name?.slice(0, 2) ?? '??'}
    </div>
  )
}


function CommentInput({
  placeholder = 'Write a comment...',
  onSubmit,
  onCancel,
  initialValue = '',
  autoFocus = false,
}: {
  placeholder?: string
  onSubmit: (content: string) => Promise<void>
  onCancel?: () => void
  initialValue?: string
  autoFocus?: boolean
}) {
  const [value, setValue] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (autoFocus) ref.current?.focus() }, [autoFocus])

  async function handleSubmit() {
    if (!value.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(value.trim())
      setValue('')
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
    if (e.key === 'Escape') onCancel?.()
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        className="text-sm resize-none"
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !value.trim()}>
          {submitting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
          Post
        </Button>
      </div>
    </div>
  )
}

// ─── COMMENT ITEM ─────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  currentUserId,
  role,
  postId,
  depth,
  onReply,
  onEdit,
  onDelete,
  onLike,
  onUnlike,
  fetchReplies,
  createComment,
}: {
  comment: CommentModel
  currentUserId: string
  role: 'admin' | 'band_member' | 'user'
  postId: string
  depth: number
  onReply: (parentId: string) => void
  onEdit: (comment: CommentModel) => void
  onDelete: (commentId: string) => void
  onLike: (commentId: string) => void
  onUnlike: (commentId: string) => void
  fetchReplies: (commentId: string) => Promise<CommentModel[]>
  createComment: (postId: string, content: string, parentId?: string) => Promise<void>
}) {
  const isOwner = comment.user_id === currentUserId
  const liked = (comment.comment_likes || []).some((l) => l.user_id === currentUserId)
  const likeCount = comment.comment_likes?.length ?? 0
  const canDelete = role === 'admin' || isOwner

  // replies_count comes from `replies:comments(count)` in the select
  const replyCount = (comment as any).replies?.[0]?.count ?? 0

  const [replies, setReplies] = useState<CommentModel[]>([])
  const [showReplies, setShowReplies] = useState(false)
  const [repliesLoading, setRepliesLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState(false)
  const [editingReply, setEditingReply] = useState<CommentModel | null>(null)

  async function handleToggleReplies() {
    if (showReplies) {
      setShowReplies(false)
      return
    }
    setRepliesLoading(true)
    try {
      const data = await fetchReplies(comment.id)
      setReplies(data)
      setShowReplies(true)
    } finally {
      setRepliesLoading(false)
    }
  }

  async function handleReplySubmit(content: string) {
    await createComment(postId, content, comment.id)
    // refresh replies locally
    const data = await fetchReplies(comment.id)
    setReplies(data)
    setShowReplies(true)
    setReplyingTo(false)
  }

  return (
    <div className={`flex gap-2 ${depth > 0 ? 'ml-8 mt-2' : ''}`}>
      <Avatar src={comment.author?.profile_path ?? null} name={comment.author?.full_name ?? null} />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="bg-muted/50 rounded-xl px-3 py-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs font-semibold">{comment.author?.full_name ?? 'Unknown'}</span>
            {comment.author?.instrument && (
              <span className="text-[10px] text-muted-foreground">· {comment.author.instrument}</span>
            )}
          </div>
          <p className="text-sm mt-0.5 break-words">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-1">
          <button
            onClick={() => liked ? onUnlike(comment.id) : onLike(comment.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'}`}
          >
            <Heart className={`w-3 h-3 ${liked ? 'fill-rose-500' : ''}`} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {depth === 0 && (
            <button
              onClick={() => setReplyingTo((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              Reply
            </button>
          )}

          {isOwner && (
            <button
              onClick={() => onEdit(comment)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Edit
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-xs text-destructive/70 hover:text-destructive transition-colors"
            >
              Delete
            </button>
          )}

          <span className="text-[10px] text-muted-foreground ml-auto">
            {new Date(comment.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* View replies toggle */}
        {depth === 0 && replyCount > 0 && (
          <button
            onClick={handleToggleReplies}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            {repliesLoading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <CornerDownRight className="w-3 h-3" />
            }
            {showReplies ? 'Hide replies' : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
          </button>
        )}

        {/* Replies */}
        {showReplies && replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            currentUserId={currentUserId}
            role={role}
            postId={postId}
            depth={depth + 1}
            onReply={() => {}}
            onEdit={editingReply?.id === reply.id ? () => {} : setEditingReply}
            onDelete={async (id) => {
              onDelete(id)
              const data = await fetchReplies(comment.id)
              setReplies(data)
            }}
            onLike={onLike}
            onUnlike={onUnlike}
            fetchReplies={fetchReplies}
            createComment={createComment}
          />
        ))}

        {/* Reply input */}
        {replyingTo && (
          <div className="mt-2">
            <CommentInput
              placeholder={`Replying to ${comment.author?.full_name ?? 'comment'}...`}
              onSubmit={handleReplySubmit}
              onCancel={() => setReplyingTo(false)}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Comments({ postId, role }: CommentsProps) {
  const {
    comments, loading, loadingMore, hasMore,
    fetchComments, fetchNextPage, fetchReplies,
    createComment, updateComment, deleteComment,
    likeComment, unlikeComment,
  } = useComment()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<CommentModel | null>(null)

  useEffect(() => {
    fetchComments(postId)
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null))
  }, [postId])

  async function handleDelete(commentId: string) {
    if (!window.confirm('Delete this comment?')) return
    await deleteComment(postId, commentId)
  }

  async function handleEdit(content: string) {
    if (!editingComment) return
    await updateComment(postId, editingComment.id, content)
    setEditingComment(null)
  }

  return (
    <div className="space-y-3 pt-3 border-t mt-3">
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              {editingComment?.id === comment.id ? (
                <div className="ml-9">
                  <CommentInput
                    initialValue={editingComment.content}
                    onSubmit={handleEdit}
                    onCancel={() => setEditingComment(null)}
                    autoFocus
                  />
                </div>
              ) : (
                <CommentItem
                  comment={comment}
                  currentUserId={currentUserId ?? ''}
                  role={role}
                  postId={postId}
                  depth={0}
                  onReply={() => {}}
                  onEdit={setEditingComment}
                  onDelete={handleDelete}
                  onLike={(id) => likeComment(postId, id)}
                  onUnlike={(id) => unlikeComment(postId, id)}
                  fetchReplies={fetchReplies}
                  createComment={createComment}
                />
              )}
            </div>
          ))}

          <InfiniteScroll hasMore={hasMore} isLoading={loadingMore} next={() => fetchNextPage(postId)} threshold={1}>
            {hasMore && <Loader2 className="my-4 h-5 w-5 animate-spin text-muted-foreground mx-auto" />}
          </InfiniteScroll>
        </div>
      )}

      {/* New comment input */}
      <CommentInput
        onSubmit={(content) => createComment(postId, content)}
      />
    </div>
  )
}