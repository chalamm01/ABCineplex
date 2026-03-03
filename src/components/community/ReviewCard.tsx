// src/components/community/ReviewCard.tsx
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ReviewWithMovie } from "@/types/api"

interface ReviewCardProps {
  readonly review: ReviewWithMovie
  readonly isLiked?: boolean
  readonly isAuthenticated?: boolean
  onLike?: (review: ReviewWithMovie) => void
  onMovieClick?: (movieId: number) => void
}

function StarRating({ rating, max = 5 }: { readonly rating: number; readonly max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-lg leading-none ${i < Math.round(rating) ? "text-yellow-600" : "text-neutral-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const POSTER_PLACEHOLDER = "https://placehold.co/80x110/1a1a2e/white?text=?"

export function ReviewCard({ review, isLiked, isAuthenticated, onLike, onMovieClick }: Readonly<ReviewCardProps>) {
  const posterUrl = review.movie?.poster_url || POSTER_PLACEHOLDER
  const movieTitle = review.movie?.title ?? "Unknown Movie"
  const releaseYear = review.movie?.release_date?.slice(0, 4) ?? ""
  const displayName = review.username ?? "Anonymous"
  const likeCount = review.like_count ?? 0
  const canClickMovie = !!onMovieClick && !!review.movie?.id

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex gap-5 p-5 sm:p-6">
        {/* Movie poster */}
        <div className="shrink-0">
          <img
            src={posterUrl}
            alt={movieTitle}
            onClick={() => canClickMovie && onMovieClick!(review.movie!.id)}
            className={`w-20 h-28 object-cover rounded shadow-sm ${canClickMovie ? "cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all hover:shadow-md" : ""}`}
            onError={(e) => { (e.target as HTMLImageElement).src = POSTER_PLACEHOLDER }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Title + year */}
          <div className="flex items-baseline gap-2">
            <h2
              onClick={() => canClickMovie && onMovieClick!(review.movie!.id)}
              className={`text-lg font-bold text-neutral-900 ${canClickMovie ? "cursor-pointer hover:text-orange-600 hover:underline transition-colors" : ""}`}
            >
              {movieTitle}
            </h2>
            {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-semibold">
                {displayName.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-neutral-700">{displayName}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <StarRating rating={review.rating} />
            <span className="text-xs font-semibold text-yellow-700 ml-1">{review.rating.toFixed(1)}</span>
          </div>

          {/* Body */}
          {review.review_text && (
            <p className="text-sm text-neutral-700 leading-relaxed line-clamp-3 mt-1">{review.review_text}</p>
          )}

          {/* Likes */}
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-100">
            <button
              onClick={() => onLike?.(review)}
              disabled={!isAuthenticated}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors disabled:cursor-default ${
                isLiked ? "text-red-500" : "text-neutral-600 hover:text-red-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
              {likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}