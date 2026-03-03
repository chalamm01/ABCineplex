import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Heart, Star, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

function StarSelector({
  value,
  onChange,
}: Readonly<{
  value: number
  onChange: (v: number) => void
}>) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-7 h-7 cursor-pointer transition-colors ${
            star <= (hovered || value)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const [searchParams] = useSearchParams()
  const movieId = Number(searchParams.get("movie_id") ?? 0)
  const isMyReviews = movieId === 0

  const isAuthenticated = !!localStorage.getItem('token')
  const currentUserId = localStorage.getItem('user_id')

  const [reviews, setReviews] = useState<ReviewWithMovie[]>([])
  const [total, setTotal] = useState(0)
  const [loadError, setLoadError] = useState("")
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewWithMovie | null>(null)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ReviewWithMovie | null>(null)
  const [deleting, setDeleting] = useState(false)

  const submitLabel = editingReview ? "Save Changes" : "Post Review"

  // Load reviews from API
  useEffect(() => {
    if (isMyReviews) {
      if (!isAuthenticated) return
      reviewApi.getMyReviews().then(data => {
        setReviews(data.items ?? [])
        setTotal(data.total ?? 0)
      }).catch(() => setLoadError("Failed to load your reviews."))
    } else {
      reviewApi.getMovieReviews(movieId).then(data => {
        setReviews(data.items ?? [])
        setTotal(data.total ?? 0)
      }).catch(() => setLoadError("Failed to load reviews."))
    }
  }, [movieId])

  function openCreateDialog() {
    setEditingReview(null)
    setFormRating(5)
    setFormText("")
    setFormError("")
    setDialogOpen(true)
  }

  function openEditDialog(review: ReviewWithMovie) {
    setEditingReview(review)
    setFormRating(review.rating)
    setFormText(review.review_text ?? "")
    setFormError("")
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formText.trim()) {
      setFormError("Review text cannot be empty.")
      return
    }
    setSubmitting(true)
    try {
      if (editingReview) {
        const updated = await reviewApi.updateReview(editingReview.id, {
          rating: formRating,
          review_text: formText,
        })
        setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, ...updated } : r))
      } else {
        const created = await reviewApi.createReview(movieId, {
          rating: formRating,
          review_text: formText,
        })
        setReviews(prev => [created, ...prev])
        setTotal(prev => prev + 1)
      }
      setDialogOpen(false)
      setFormText("")
      setFormRating(5)
      setFormError("")
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await reviewApi.deleteReview(deleteTarget.id)
      setReviews(prev => prev.filter(r => r.id !== deleteTarget.id))
      setTotal(prev => prev - 1)
      setDeleteTarget(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete review.")
    } finally {
      setDeleting(false)
    }
  }

  async function handleLike(review: ReviewWithMovie) {
    if (!isAuthenticated) return
    const isLiked = likedIds.has(review.id)
    try {
      if (isLiked) {
        await reviewApi.unlikeReview(review.id)
        setLikedIds(prev => { const s = new Set(prev); s.delete(review.id); return s })
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, like_count: (r.like_count ?? 0) - 1 } : r))
      } else {
        await reviewApi.likeReview(review.id)
        setLikedIds(prev => new Set([...prev, review.id]))
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, like_count: (r.like_count ?? 0) + 1 } : r))
      }
    } catch {
      // ignore like failures silently
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isMyReviews ? "My Reviews" : `Reviews (${total})`}
            </h1>
            {isMyReviews && <p className="text-sm text-muted-foreground">{total} review{total !== 1 ? 's' : ''}</p>}
          </div>
          {isAuthenticated && !isMyReviews && (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}
          {isMyReviews && (
            <Link to="/community">
              <Button variant="outline">Browse Community</Button>
            </Link>
          )}
        </div>

        <Separator />

        {loadError && (
          <Card>
            <CardContent className="p-6 text-center text-red-500">{loadError}</CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loadError && reviews.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              {isMyReviews
                ? isAuthenticated
                  ? "You haven't written any reviews yet."
                  : "Please log in to see your reviews."
                : "No reviews yet. Be the first to write one!"}
            </CardContent>
          </Card>
        )}

        {/* Review List */}
        {reviews.map((review) => {
          const displayName = review.username ?? "Anonymous"
          const isOwner = !!currentUserId && review.user_id === currentUserId
          const isLiked = likedIds.has(review.id)
          return (
            <Card key={review.id} className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{displayName}</p>
                    {isMyReviews && review.movie && (
                      <p className="text-sm font-medium text-primary">{review.movie.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  <RatingStars rating={review.rating} />
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm">{review.review_text}</p>
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${isLiked ? "text-red-500" : ""}`}
                    onClick={() => handleLike(review)}
                    disabled={!isAuthenticated}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                    {review.like_count ?? 0}
                  </Button>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(review)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(review)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReview ? "Edit Review" : "Write a Review"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <StarSelector value={formRating} onChange={setFormRating} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Your Review</p>
              <Textarea
                placeholder="Share your thoughts about this movie..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={5}
              />
            </div>
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
