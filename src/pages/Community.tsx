// src/pages/CommunityPage.tsx
import { useEffect, useState } from "react"
import { Plus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ReviewCard } from "@/components/community/ReviewCard"
import { NowShowingMovies } from "@/components/community/NowShowingMovies"
import { MovieModal } from "@/components/movies/MovieModal"
import { Spinner } from "@/components/ui/spinner"
import type { Movie, ReviewWithMovie } from "@/types/api"
import { moviesApi, reviewApi } from "@/services/api"
import { useAuth } from "@/context/AuthContext"

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-7 h-7 cursor-pointer transition-colors ${
            star <= (hovered || value)
              ? "fill-yellow-600 text-yellow-600"
              : "text-neutral-300"
          }`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  )
}

export default function CommunityPage() {
  const { isAuthenticated } = useAuth()

  // Reviews feed
  const [reviews, setReviews] = useState<ReviewWithMovie[]>([])
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())
  const [feedLoading, setFeedLoading] = useState(true)
  const [feedError, setFeedError] = useState<string | null>(null)

  // Sidebar movies
  const [nowShowing, setNowShowing] = useState<Movie[]>([])
  const [moviesLoading, setMoviesLoading] = useState(true)

  // Write review dialog
  const [writeOpen, setWriteOpen] = useState(false)
  const [selectedMovieId, setSelectedMovieId] = useState<number | "">("")
  const [modalMovieId, setModalMovieId] = useState<number | null>(null)
  const [formRating, setFormRating] = useState(5)
  const [formText, setFormText] = useState("")
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Fetch feed
  const fetchFeed = async () => {
    try {
      setFeedLoading(true)
      setFeedError(null)
      const data = await reviewApi.getLatestReviews(20)
      setReviews(data.items ?? [])
    } catch {
      setFeedError("Could not load reviews.")
    } finally {
      setFeedLoading(false)
    }
  }

  // Fetch sidebar movies
  useEffect(() => {
    moviesApi.getMovies(1, 20, "now_showing")
      .then((res) => setNowShowing(res?.movies ?? []))
      .catch(() => {})
      .finally(() => setMoviesLoading(false))
  }, [])

  useEffect(() => { fetchFeed() }, [])

  async function handleLike(review: ReviewWithMovie) {
    if (!isAuthenticated) return
    const isLiked = likedIds.has(review.id)
    try {
      if (isLiked) {
        await reviewApi.unlikeReview(review.id)
        setLikedIds((prev) => { const s = new Set(prev); s.delete(review.id); return s })
        setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, like_count: Math.max(0, (r.like_count ?? 0) - 1) } : r))
      } else {
        await reviewApi.likeReview(review.id)
        setLikedIds((prev) => new Set([...prev, review.id]))
        setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, like_count: (r.like_count ?? 0) + 1 } : r))
      }
    } catch { /* silent */ }
  }

  function openWriteDialog() {
    setSelectedMovieId(nowShowing[0]?.id ?? "")
    setFormRating(5)
    setFormText("")
    setFormError("")
    setWriteOpen(true)
  }

  async function handleSubmitReview() {
    if (!selectedMovieId) { setFormError("Please select a movie."); return }
    if (!formText.trim()) { setFormError("Review text cannot be empty."); return }
    setSubmitting(true)
    try {
      await reviewApi.createReview({ movie_id: Number(selectedMovieId), rating: formRating, review_text: formText })
      setWriteOpen(false)
      fetchFeed()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review."
      setFormError(
        msg.toLowerCase().includes("already reviewed") || msg === "HTTP 409"
          ? "You have already reviewed this movie. Find it in My Reviews to edit it."
          : msg
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[url('/assets/background/bg.png')] bg-cover bg-center ">
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 py-12 bg-white/70 backdrop-blur-md">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Popular Reviews
            </h1>
            <p className="text-neutral-600 text-sm mt-1">
              Discover what people are watching and their thoughts
            </p>
          </div>
          {isAuthenticated && (
            <Button
              onClick={openWriteDialog}
              className="bg-violet-700 hover:bg-violet-800 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Write Review
            </Button>
          )}
        </div>

        {/* Main layout */}
        <div className="max-w-6xl mx-auto flex gap-6 lg:gap-10">
          {/* Left: Review Feed */}
          <div className="flex-1 space-y-4">
            {feedLoading ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : feedError ? (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                {feedError}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
                <p className="text-neutral-600">
                  No reviews yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isLiked={likedIds.has(review.id)}
                  isAuthenticated={isAuthenticated}
                  onLike={handleLike}
                  onMovieClick={(id) => setModalMovieId(id)}
                />
              ))
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="w-64 lg:w-72 shrink-0">
            {moviesLoading ? (
              <div className="flex justify-center py-8"><Spinner className="w-5 h-5" /></div>
            ) : (
              <NowShowingMovies movies={nowShowing} onMovieClick={(id) => setModalMovieId(id)} />
            )}
          </aside>
        </div>
      </div>

      {/* Write Review Dialog */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium text-neutral-900 block mb-2">
                Movie
              </label>
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(Number(e.target.value))}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">Select a movie...</option>
                {nowShowing.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
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
                rows={4}
                className="resize-none"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {formError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setWriteOpen(false)}
              className="text-neutral-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-violet-700 hover:bg-violet-800 text-white"
            >
              {submitting ? "Posting..." : "Post Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Letterboxd-style Movie Modal */}
      {modalMovieId !== null && (
        <MovieModal movieId={modalMovieId} onClose={() => setModalMovieId(null)} />
      )}
    </div>
  )
}
