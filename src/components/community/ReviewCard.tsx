// src/components/community/ReviewCard.tsx
import { ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Review {
  readonly id: string
  readonly movie: { title: string; year: number; poster: string }
  readonly author: { username: string; avatar: string }
  readonly rating: number
  readonly body: string
  readonly likes: number
}

interface ReviewCardProps {
  readonly review: Review
  onClick?: () => void
}

function StarRating({ rating, max = 5 }: { readonly rating: number; readonly max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={`star-${rating}-${i}`}
          className={`text-lg ${i < rating ? "text-amber-400" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function ReviewCard({ review, onClick }: Readonly<ReviewCardProps>) {
  return (
    <div
      className="flex gap-5 py-6 cursor-pointer group"
      onClick={onClick}
    >
      {/* Movie poster */}
      <div className="shrink-0">
        <img
          src={review.movie.poster}
          alt={review.movie.title}
          className="w-20 h-28 object-cover rounded shadow-md group-hover:scale-[1.02] transition-transform"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Title + year */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-bold">{review.movie.title}</h2>
          <span className="text-gray-400 font-medium">{review.movie.year}</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="w-7 h-7">
            <AvatarImage src={review.author.avatar} />
            <AvatarFallback className="bg-gray-800 text-white text-xs">
              {review.author.username.slice(1, 3).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{review.author.username}</span>
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} />

        {/* Body */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.body}</p>

        {/* Likes */}
        <div className="flex items-center gap-1.5 mt-1 text-gray-500">
          <ThumbsUp className="w-4 h-4" />
          <span className="text-sm">{review.likes}</span>
        </div>
      </div>
    </div>
  )
}
