// src/components/movies/MovieModal.tsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X, Star, Clock, Film, Heart } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { moviesApi, reviewApi } from "@/services/api"
import type { MovieDetail, ReviewWithMovie } from "@/types/api"
import { ImageWithLoader } from "@/components/ui/image-with-loader"
interface MovieModalProps {
  movieId: number
  onClose: () => void
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? "fill-yellow-600 text-yellow-600" : "text-neutral-300"}`}
        />
      ))}
    </div>
  )
}

export function MovieModal({ movieId, onClose }: MovieModalProps) {
  const navigate = useNavigate()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [modalReviews, setModalReviews] = useState<ReviewWithMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError("")
    Promise.all([
      moviesApi.getMovieById(movieId),
      reviewApi.getMovieReviews(movieId),
    ])
      .then(([m, r]) => {
        setMovie(m)
        setModalReviews(r.items ?? [])
      })
      .catch(() => setError("Failed to load movie details."))
      .finally(() => setLoading(false))
  }, [movieId])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAnimating(false)
        setTimeout(onClose, 150)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const avgRating =
    modalReviews.length > 0
      ? (modalReviews.reduce((s, r) => s + r.rating, 0) / modalReviews.length).toFixed(1)
      : null

  const handleBackdropClick = () => {
    setIsAnimating(false)
    setTimeout(onClose, 150)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isAnimating ? "animate-in fade-in-0" : "animate-out fade-out-0"
      } bg-black/40 backdrop-blur-sm`}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-200 ${
          isAnimating ? "animate-in zoom-in-95 fade-in-0" : "animate-out zoom-out-95 fade-out-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 150)
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-900"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : movie ? (
          <>
            {/* Banner */}
            {movie.banner_url && (
              <div className="relative h-40 overflow-hidden rounded-t-2xl">
                <ImageWithLoader
                  src={movie.banner_url}
                  alt=""
                  fill={true}
                  objectFit="cover"
                />
              </div>
            )}

            {/* Movie header */}
            <div className={`flex gap-5 px-6 ${movie.banner_url ? "-mt-16 relative z-10" : "pt-6"}`}>
              <ImageWithLoader
                src={movie.poster_url || "/assets/images/placeholder.png"}
                alt={movie.title}
                width={112}
                height={160}
                objectFit="cover"
                containerClassName="shrink-0"
                className="rounded-xl shadow-lg border border-neutral-200"
              />
              <div className="flex-1 pt-2">
                <h2 className="text-xl font-bold leading-tight text-white">{movie.title}
                  {movie.release_date && (
                    <span> ({new Date(movie.release_date).getFullYear()})</span>
                  )}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-white text-xs">
                  {(movie.runtime_minutes ?? movie.duration_minutes) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor((movie.runtime_minutes ?? movie.duration_minutes ?? 0) / 60)}h{" "}
                      {(movie.runtime_minutes ?? movie.duration_minutes ?? 0) % 60}m
                    </span>
                  )}
                  {movie.genre && (
                    <span className="flex items-center gap-1">
                      <Film className="w-3 h-3" />
                      {movie.genre}
                    </span>
                  )}
                  {movie.content_rating && (
                    <span className="border border-neutral-300 px-1.5 py-0.5 rounded text-[10px] text-white">
                      {movie.content_rating}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2">
                  {movie.rating_tmdb != null && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-600 text-yellow-600" />
                      <span className="text-yellow-600 font-bold text-sm">{movie.rating_tmdb}</span>
                      <span className="text-neutral-500 text-xs">/10 TMDB</span>
                    </div>
                  )}
                  {avgRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-violet-700 text-violet-700" />
                      <span className="text-violet-700 font-bold text-sm">{avgRating}</span>
                      <span className="text-neutral-500 text-xs">community avg</span>
                    </div>
                  )}
                </div>

                {movie.director && (
                  <p className="mt-2 text-xs text-neutral-600">
                    Dir. <span className="text-neutral-900 font-medium">{movie.director}</span>
                  </p>
                )}
                {(movie.starring?.length ?? 0) > 0 && (
                  <p className="mt-0.5 text-xs text-neutral-600">
                    Starring{" "}
                    <span className="text-neutral-900 font-medium">{movie.starring!.slice(0, 3).join(", ")}</span>
                  </p>
                )}

                <button
                  onClick={() => navigate(`/movie/${movieId}`)}
                  className="mt-3 bg-violet-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs hover:bg-violet-800 transition-colors"
                >
                  Book Tickets →
                </button>
              </div>
            </div>

            {/* Synopsis */}
            {movie.synopsis && (
              <p className="px-6 mt-4 text-sm text-neutral-700 leading-relaxed">{movie.synopsis}</p>
            )}

            {/* Reviews section */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-neutral-900">Reviews</h3>
                <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600">
                  {modalReviews.length}
                </span>
              </div>

              {modalReviews.length === 0 ? (
                <p className="text-neutral-500 text-sm py-4 text-center">No reviews yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {modalReviews.map((r) => (
                    <div key={r.id} className="bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
                            {(r.username ?? "A")[0].toUpperCase()}
                          </div>
                          <span className="text-neutral-900 font-medium text-sm">
                            {r.username ?? "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RatingStars rating={r.rating} />
                          <span className="text-neutral-500 text-xs">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {r.review_text && (
                        <p className="text-neutral-700 text-sm leading-relaxed">{r.review_text}</p>
                      )}
                      {(r.like_count ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-neutral-500 text-xs">
                          <Heart className="w-3 h-3" />
                          {r.like_count}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
