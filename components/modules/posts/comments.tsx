'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart, Trash2, Edit, CornerDownRight, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import useComment from '@/hooks/comments.hooks'
import { CommentModel } from '@/types/comments.types'
import { supabase } from '@/utils/supabase/client'

interface CommentsProps {
  postId: string
  role: 'admin' | 'member' | 'user'
}

function Avatar({ src, name }: { src: string | null; name: string | null }) {
  return src ? (
    <img src={src} className="w-7 h-7 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase text-muted-foreground shrink-0 select-none">
      {name?.slice(0, 2) ?? '??'}
    </div>
  )
}

// ─── COMMENT INPUT ────────────────────────────────────────────────────────────

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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
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
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSubmit} disabled={submitting || !value.trim()}>
          {submitting && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
          Post
        </Button>
      </div>
    </div>
  )
}

// ─── SINGLE COMMENT ───────────────────────────────────────────────────────────

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
}: {
  comment: CommentModel
  currentUserId: string
  role: 'admin' | 'member' | 'user'
  postId: string
  depth: number
  onReply: (parentId: string) => void
  onEdit: (comment: CommentModel) => void
  onDelete: (commentId: string) => void
  onLike: (commentId: string) => void
  onUnlike: (commentId: string) => void
}) {
  const isOwner = comment.user_id === currentUserId
  const liked = (comment.comment_likes || []).some((l) => l.user_id === currentUserId)
  const likeCount = comment.comment_likes?.length ?? 0
  const canEdit = isOwner
  const canDelete = role === 'admin' || isOwner

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

        {/* Actions row */}
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
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              Reply
            </button>
          )}

          {canEdit && (
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

        {/* Nested replies */}
        {comment.replies?.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            currentUserId={currentUserId}
            role={role}
            postId={postId}
            depth={depth + 1}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onLike={onLike}
            onUnlike={onUnlike}
          />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Comments({ postId, role }: CommentsProps) {
  const { comments, loading, fetchComments, createComment, updateComment, deleteComment, likeComment, unlikeComment } = useComment()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)   // parentId
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
      {/* Comment list */}
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
                  onReply={(id) => setReplyingTo(replyingTo === id ? null : id)}
                  onEdit={setEditingComment}
                  onDelete={handleDelete}
                  onLike={(id) => likeComment(postId, id)}
                  onUnlike={(id) => unlikeComment(postId, id)}
                />
              )}

              {/* Reply input */}
              {replyingTo === comment.id && (
                <div className="ml-9 mt-2">
                  <CommentInput
                    placeholder={`Replying to ${comment.author?.full_name ?? 'comment'}...`}
                    onSubmit={async (content) => {
                      await createComment(postId, content, comment.id)
                      setReplyingTo(null)
                    }}
                    onCancel={() => setReplyingTo(null)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New comment input */}
      <CommentInput
        onSubmit={(content) => createComment(postId, content)}
      />
    </div>
  )
}