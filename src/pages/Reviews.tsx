import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { reviewApi } from "@/services/api"
import type { ReviewWithMovie } from "@/types/api"
import { Spinner } from "@/components/ui/spinner"
import { MovieModal } from "@/components/movies/MovieModal"

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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

// ── Main Reviews page ─────────────────────────────────────────────────────────
export default function Reviews() {
  const [searchParams] = useSearchParams()
  const movieId = Number(searchParams.get("movie_id") ?? 0)
  const isMyReviews = movieId === 0

  const isAuthenticated = !!localStorage.getItem("token")
  const currentUserId = localStorage.getItem("user_id")

  const [reviews, setReviews] = useState<ReviewWithMovie[]>([])
  const [total, setTotal] = useState(0)
  const [loadError, setLoadError] = useState("")
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  // Movie modal state
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)

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

  // In movie-specific mode, find if the current user already has a review
  const userExistingReview = !isMyReviews && currentUserId
    ? reviews.find((r) => r.user_id === currentUserId) ?? null
    : null

  // Load reviews
  useEffect(() => {
    if (isMyReviews) {
      if (!isAuthenticated) return
      reviewApi
        .getMyReviews()
        .then((data) => {
          setReviews(data.items ?? [])
          setTotal(data.total ?? 0)
        })
        .catch(() => setLoadError("Failed to load your reviews."))
    } else {
      reviewApi
        .getMovieReviews(movieId)
        .then((data) => {
          setReviews(data.items ?? [])
          setTotal(data.total ?? 0)
        })
        .catch(() => setLoadError("Failed to load reviews."))
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
        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? { ...r, ...updated } : r))
        )
      } else {
        const created = await reviewApi.createReview(movieId, {
          rating: formRating,
          review_text: formText,
        })
        setReviews((prev) => [created as ReviewWithMovie, ...prev])
        setTotal((prev) => prev + 1)
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
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setTotal((prev) => prev - 1)
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
        setLikedIds((prev) => { const s = new Set(prev); s.delete(review.id); return s })
        setReviews((prev) =>
          prev.map((r) => r.id === review.id ? { ...r, like_count: (r.like_count ?? 0) - 1 } : r)
        )
      } else {
        await reviewApi.likeReview(review.id)
        setLikedIds((prev) => new Set([...prev, review.id]))
        setReviews((prev) =>
          prev.map((r) => r.id === review.id ? { ...r, like_count: (r.like_count ?? 0) + 1 } : r)
        )
      }
    } catch {
      // ignore like failures silently
    }
  }

  return (
    <div className="min-h-screen bg-[url('/assets/background/bg.png')] bg-cover bg-center ">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex justify-center bg-white/70 backdrop-blur-md">
        <div className="w-full max-w-2xl space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
                {isMyReviews ? "My Reviews" : `Movie Reviews`}
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                {isMyReviews ? `${total} review${total !== 1 ? "s" : ""}` : `${total} review${total !== 1 ? "s" : ""}`}
              </p>
            </div>
            {isAuthenticated && !isMyReviews && (
              <Button
                onClick={openCreateDialog}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Review
              </Button>
            )}
            {isMyReviews && (
              <Link to="/community">
                <Button variant="outline">Browse Community</Button>
              </Link>
            )}
          </div>

          {loadError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {loadError}
            </div>
          )}

          {/* Empty state */}
          {!loadError && reviews.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <p className="text-neutral-600">
                {isMyReviews
                  ? isAuthenticated
                    ? "You haven't written any reviews yet."
                    : "Please log in to see your reviews."
                  : "No reviews yet. Be the first to write one!"}
              </p>
            </div>
          )}

          {/* Review list */}
          {reviews.map((review) => {
            const displayName = review.username ?? "Anonymous"
            const isOwner = !!currentUserId && review.user_id === currentUserId
            const isLiked = likedIds.has(review.id)
            return (
              <div key={review.id} className="rounded-lg border border-neutral-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 sm:p-6">
                  {/* Header with user info and rating */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-orange-100 text-orange-700 font-semibold">
                          {displayName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-neutral-900">{displayName}</p>
                        <p className="text-xs text-neutral-500">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-2 bg-yellow-50 rounded-full">
                      <RatingStars rating={review.rating} />
                      <span className="text-xs font-semibold text-yellow-700 ml-1">{review.rating}</span>
                    </div>
                  </div>

                  {/* Movie link for My Reviews */}
                  {isMyReviews && review.movie && (
                    <button
                      className="flex items-center gap-2 mb-3 group"
                      onClick={() => setSelectedMovieId(review.movie!.id)}
                    >
                      {review.movie.poster_url && (
                        <img
                          src={review.movie.poster_url}
                          alt={review.movie.title}
                          className="w-7 h-10 rounded shadow-sm group-hover:ring-1 group-hover:ring-orange-400 transition object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-orange-600 group-hover:underline">
                        {review.movie.title}
                      </span>
                    </button>
                  )}

                  {/* Review text */}
                  <p className="text-neutral-700 text-sm leading-relaxed mb-4">
                    {review.review_text}
                  </p>

                  {/* Footer with actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 text-neutral-600 hover:text-neutral-900 ${isLiked ? "text-red-500" : ""}`}
                      onClick={() => handleLike(review)}
                      disabled={!isAuthenticated}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                      <span className="text-xs">{review.like_count ?? 0}</span>
                    </Button>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs hover:bg-neutral-100"
                          onClick={() => openEditDialog(review)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(review)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Create / Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {editingReview ? "Edit Your Review" : "Write a Review"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 block mb-3">
                  Rating
                </label>
                <StarSelector value={formRating} onChange={setFormRating} />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 block mb-2">
                  Your Review
                </label>
                <Textarea
                  placeholder="Share your thoughts about this movie..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
              {formError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{formError}</p>}
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {submitting ? "Saving..." : submitLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm dialog */}
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
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Letterboxd-style Movie Modal */}
      {selectedMovieId !== null && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </div>
  )
}
