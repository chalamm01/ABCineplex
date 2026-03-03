// src/components/community/ReviewCard.tsx
import { Heart } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { ReviewWithMovie } from "@/types/api"

interface ReviewCardProps {
  readonly review: ReviewWithMovie
  readonly isLiked?: boolean
  readonly isAuthenticated?: boolean
  onLike?: (review: ReviewWithMovie) => void
}

function StarRating({ rating, max = 5 }: { readonly rating: number; readonly max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-lg leading-none ${i < Math.round(rating) ? "text-amber-400" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

const POSTER_PLACEHOLDER = "https://placehold.co/80x110/1a1a2e/white?text=?"

export function ReviewCard({ review, isLiked, isAuthenticated, onLike }: Readonly<ReviewCardProps>) {
  const posterUrl = review.movie?.poster_url || POSTER_PLACEHOLDER
  const movieTitle = review.movie?.title ?? "Unknown Movie"
  const releaseYear = review.movie?.release_date?.slice(0, 4) ?? ""
  const displayName = review.username ?? "Anonymous"
  const likeCount = review.like_count ?? 0

  return (
    <div className="flex gap-5 py-6 group">
      {/* Movie poster */}
      <div className="shrink-0">
        <img
          src={posterUrl}
          alt={movieTitle}
          className="w-20 h-28 object-cover rounded shadow-md group-hover:scale-[1.02] transition-transform"
          onError={(e) => { (e.target as HTMLImageElement).src = POSTER_PLACEHOLDER }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Title + year */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">{movieTitle}</h2>
          {releaseYear && <span className="text-gray-400 font-medium">{releaseYear}</span>}
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-gray-800 text-white text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{displayName}</span>
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} />

        {/* Body */}
        {review.review_text && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.review_text}</p>
        )}

        {/* Likes */}
        <div className="flex items-center gap-1.5 mt-1">
          <button
            onClick={() => onLike?.(review)}
            disabled={!isAuthenticated}
            className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-default ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-400"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}