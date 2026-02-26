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
import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import type { Review } from "@/services/api"

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
  const { isAuthenticated } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)
  const [deleting, setDeleting] = useState(false)

  const submitLabel = editingReview ? "Save Changes" : "Post Review"

  function openCreateDialog() {
    setEditingReview(null)
    setFormRating(5)
    setFormText("")
    setFormError("")
    setDialogOpen(true)
  }

  function openEditDialog(review: Review) {
    setEditingReview(review)
    setFormRating(review.rating)
    setFormText(review.review_text)
    setFormError("")
    setDialogOpen(true)
  }

  function handleSubmit() {
    if (!formText.trim()) {
      setFormError("Review text cannot be empty.")
      return
    }
    setSubmitting(true)

    if (editingReview) {
      setReviews(prev =>
        prev.map(r =>
          r.id === editingReview.id
            ? { ...r, rating: formRating, review_text: formText, updated_at: new Date().toISOString() }
            : r
        )
      )
    } else {
      const newItem: Review = {
        id: Date.now(),
        movie_id: 0,
        booking_id: 0,
        user_id: "local-user",
        username: "You",
        review_text: formText,
        rating: formRating,
        like_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setReviews(prev => [newItem, ...prev])
      setTotal(prev => prev + 1)
    }

    setSubmitting(false)
    setDialogOpen(false)
    setFormText("")
    setFormRating(5)
    setFormError("")
  }

  function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setReviews(prev => prev.filter(r => r.id !== deleteTarget.id))
    setTotal(prev => prev - 1)
    setDeleteTarget(null)
    setDeleting(false)
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

        {/* Empty State */}
        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reviews yet. Be the first to write one!
            </CardContent>
          </Card>
        )}

        {/* Review List */}
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">
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
              <Badge variant="secondary">
                <RatingStars rating={review.rating} />
              </Badge>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm">{review.review_text}</p>
              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  {review.like_count}
                </Button>
                {review.user_id === "local-user" && (
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
