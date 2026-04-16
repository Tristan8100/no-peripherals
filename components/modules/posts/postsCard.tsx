import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PostCardProps } from "@/types/posts.types"
import { Edit, Trash2, Heart, MessageCircle } from "lucide-react" // Imported MessageCircle
import { ImageCarousel } from "./posts.functions"
import Comments from "./comments"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export function PostCard({ post, currentUserId, role, onEdit, onDelete, onLike, onUnlike, user }: PostCardProps) {
  // Add state to track comment visibility
  const [showComments, setShowComments] = useState(false)

  const isOwner = post.user_id === currentUserId
  const liked = (post.post_likes || []).some((l) => l.user_id === currentUserId)
  const likeCount = post.post_likes?.length ?? 0

  const canEdit = isOwner
  const canDelete = role === 'admin' || isOwner

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar>
            {user?.profile_path &&
              <AvatarImage
                src={user.profile_path}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              /> 
            }
            {!user?.profile_path &&
              <Avatar className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold uppercase text-muted-foreground shrink-0 select-none">
                {user?.full_name?.slice(0, 2) ?? '??'}
              </Avatar>
            }
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(post.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(post)}>
              <Edit className="w-3.5 h-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(post)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && <p className="text-sm leading-relaxed">{post.content}</p>}

      {/* Images */}
      {post.post_images && post.post_images.length > 0 && (
        <ImageCarousel images={post.post_images.sort((a, b) => a.position - b.position)} />
      )}

      {/* Action Buttons (Like & Comment) */}
      <div className="flex items-center gap-6 pt-2 border-t">
        {/* Like */}
        <button
          onClick={() => (liked ? onUnlike(post.id) : onLike(post.id))}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          <span>{likeCount}</span>
        </button>

        {/* Toggle Comments Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>
      </div>

      {/* fetch if true */}
      {showComments && (
        <div className="pt-3 mt-3 border-t">
          <Comments postId={post.id} role={role} />
        </div>
      )}
    </div>
  )
}