import { UserModel } from "./users.types"

export interface PostImage {
  id: string
  post_id: string
  image_url: string
  position: number
  created_at: string
}

export interface PostLike {
  user_id: string
  post_id: string
  created_at: string
}

export interface PostModel {
  id: string
  user_id: string
  content: string | null
  created_at: string
  updated_at: string
  post_images?: PostImage[]
  post_likes?: PostLike[]
  // joined from auth.users via profiles or RPC — attach as needed
  author_email?: string
}

export interface PostsProps {
  role: 'admin' | 'member' | 'user'
}

export interface PostCardProps {
  post: PostModel
  currentUserId: string
  role: 'admin' | 'member' | 'user'
  user: UserModel | null
  onEdit: (post: PostModel) => void
  onDelete: (post: PostModel) => void
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
}