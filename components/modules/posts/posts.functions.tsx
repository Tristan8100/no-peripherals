import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PostModel } from "@/types/posts.types"
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ImageCarousel({ images }: { images: { image_url: string }[] }) {
  const [idx, setIdx] = useState(0)
  if (!images.length) return null

  return (
    <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
      <img
        src={images[idx].image_url}
        alt=""
        className="w-full h-full object-cover transition-opacity duration-200"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((p) => (p - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIdx((p) => (p + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface PostFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedPost: PostModel | null
  onSubmit: (content: string, newFiles: File[], deletedIds: string[]) => Promise<void>
  submitting: boolean
}

export function PostFormDialog({ open, onOpenChange, selectedPost, onSubmit, submitting }: PostFormProps) {
  const [content, setContent] = useState('')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // sync state when selectedPost changes
  useEffect(() => {
    setContent(selectedPost?.content ?? '')
    setNewFiles([])
    setDeletedIds([])
    setPreviews([])
  }, [selectedPost, open])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setNewFiles((prev) => [...prev, ...files])
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews((prev) => [...prev, ...urls])
  }

  function removeExistingImage(id: string) {
    setDeletedIds((prev) => [...prev, id])
  }

  function removeNewPreview(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    await onSubmit(content, newFiles, deletedIds)
  }

  const existingImages = (selectedPost?.post_images || []).filter((img) => !deletedIds.includes(img.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{selectedPost ? 'Edit Post' : 'New Post'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          {/* Existing images (edit mode) */}
          {existingImages.length > 0 && (
            <div className="space-y-1">
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative w-20 h-20 rounded overflow-hidden border group">
                    <img src={img.image_url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image previews */}
          {previews.length > 0 && (
            <div className="space-y-1">
              <Label>New Images</Label>
              <div className="flex flex-wrap gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded overflow-hidden border group">
                    <img src={url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewPreview(i)}
                      className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || (!content.trim() && newFiles.length === 0)}
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {selectedPost ? 'Save Changes' : 'Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}