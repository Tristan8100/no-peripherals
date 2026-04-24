import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PostCardProps } from "@/types/posts.types"
import { Edit, Trash2, Heart, MessageCircle, MoreHorizontal } from "lucide-react"
import { ImageCarousel } from "./posts.functions"
import Comments from "./comments"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function PostCard({ post, currentUserId, role, onEdit, onDelete, onLike, onUnlike, user }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)

  const isOwner = post.user_id === currentUserId
  const liked = (post.post_likes || []).some((l) => l.user_id === currentUserId)
  const likeCount = post.post_likes?.length ?? 0

  const canEdit = isOwner
  const canDelete = role === 'admin' || isOwner
  const hasActions = canEdit || canDelete

  return (
    <div className={[

      "backdrop-blur-md bg-white/10 dark:bg-white/5",
      "border border-white/20 dark:border-white/10",
      "shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
      "rounded-none sm:rounded-2xl",
      "overflow-hidden",
    ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-white/30">
            {post?.users?.profile_path && <AvatarImage src={post.users.profile_path} className="object-cover" />}
            <AvatarFallback className="text-xs font-semibold bg-white/20 text-foreground">
              {post.users?.full_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none">{post.users?.full_name ?? 'Unknown'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(post.created_at).toLocaleDateString('en-PH', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-white/10">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/70 dark:bg-black/50 border-white/20">
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(post)}>
                  <Edit className="w-3.5 h-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(post)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm leading-relaxed px-4 pb-3">{post.content}</p>
      )}

      {/* Images — full bleed */}
      {post.post_images && post.post_images.length > 0 && (
        <div className="border-t border-b border-white/10">
          <ImageCarousel images={post.post_images.sort((a, b) => a.position - b.position)} />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-white/10">
        <button
          onClick={() => liked ? onUnlike(post.id) : onLike(post.id)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
            liked
              ? 'text-rose-500'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
            showComments
              ? 'text-foreground bg-white/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-white/10 bg-white/5 px-4 py-3">
          <Comments postId={post.id} role={role} />
        </div>
      )}
    </div>
  )
}