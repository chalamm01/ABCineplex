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
            star <= (hovered || value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
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
      await reviewApi.createReview(Number(selectedMovieId), { rating: formRating, review_text: formText })
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
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen p-6 bg-white/70 backdrop-blur-sm py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold uppercase">Popular Reviews</h1>
          {isAuthenticated && (
            <Button onClick={openWriteDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Write a Review
            </Button>
          )}
        </div>

        {/* Main layout */}
        <div className="flex gap-10">
          {/* Left: Review Feed */}
          <div className="flex-1 flex flex-col gap-0 divide-y divide-gray-200">
            {feedLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : feedError ? (
              <p className="text-sm text-red-500 py-6">{feedError}</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-gray-400 py-6">No reviews yet. Be the first!</p>
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
          <aside className="w-72 shrink-0 flex flex-col gap-10">
            {moviesLoading ? (
              <Spinner />
            ) : (
              <NowShowingMovies movies={nowShowing} />
            )}
          </aside>
        </div>
      </div>

      {/* Write Review Dialog */}
      <Dialog open={writeOpen} onOpenChange={setWriteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Movie</p>
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(Number(e.target.value))}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              >
                {nowShowing.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <StarSelector value={formRating} onChange={setFormRating} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Your Review</p>
              <Textarea
                placeholder="Share your thoughts..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={4}
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitReview} disabled={submitting}>
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
