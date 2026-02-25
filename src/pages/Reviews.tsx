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
import { Heart, Star, Pencil, Trash2, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { reviewsApi, type Review } from "@/services/api"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/hooks/useAuth"

const MOVIE_ID = 10

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

export default function ReviewPage() {
  const { user, isAuthenticated } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reviewsApi.getReviewsByMovie(MOVIE_ID)
      setReviews(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
      setError("Failed to load reviews.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  function openCreateDialog() {
    setEditingReview(null)
    setFormRating(5)
    setFormText("")
    setFormError(null)
    setDialogOpen(true)
  }

  function openEditDialog(review: Review) {
    setEditingReview(review)
    setFormRating(review.rating)
    setFormText(review.review_text)
    setFormError(null)
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formText.trim()) {
      setFormError("Review text cannot be empty.")
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingReview) {
        await reviewsApi.updateReview(editingReview.id, {
          review_text: formText,
          rating: formRating,
        })
      } else {
        await reviewsApi.createReview({
          movie_id: MOVIE_ID,
          review_text: formText,
          rating: formRating,
        })
      }
      setDialogOpen(false)
      fetchReviews()
    } catch (e) {
      setFormError(String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await reviewsApi.deleteReview(deleteTarget.id)
      setDeleteTarget(null)
      fetchReviews()
    } catch (e) {
      alert(String(e))
    } finally {
      setDeleting(false)
    }
  }

  async function handleLike(review: Review) {
    try {
      const updated = await reviewsApi.likeReview(review.id)
      setReviews((prev) => prev.map((r) => (r.id === review.id ? updated : r)))
    } catch {
      // silently fail
    }
  }

  const submitLabel = editingReview ? "Save Changes" : "Submit Review"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reviews ({total})</h1>
          {isAuthenticated && (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}
        </div>

        <Separator />

        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reviews yet. Be the first to write one!
            </CardContent>
          </Card>
        )}

        {/* Review Cards */}
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">

              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>{review.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating Badge */}
              <Badge variant="secondary">
                <RatingStars rating={review.rating} />
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm">{review.review_text}</p>

              <div className="flex justify-between items-center">
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleLike(review)}
                  disabled={!isAuthenticated}
                >
                  <Heart className="w-4 h-4" />
                  {review.like_count}
                </Button>

                {/* Edit / Delete — own reviews only */}
                {user?.id === review.user_id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(review)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(review)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
              Are you sure you want to delete this review? This action cannot be
              undone.
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
