export interface CommentAuthor {
  id: string
  full_name: string | null
  profile_path: string | null
  instrument: string | null
}

export interface CommentModel {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  comment_likes?: { user_id: string; comment_id: string; created_at: string }[]
  author?: CommentAuthor | null
  replies?: CommentModel[]
}