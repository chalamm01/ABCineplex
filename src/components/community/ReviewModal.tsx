// src/components/community/ReviewModal.tsx
import { useState } from "react"
import { X, Heart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface Review {
  id: string
  movie: { title: string; year: number; poster: string }
  author: { username: string; avatar: string }
  rating: number
  body: string
  likes: number
}

interface ReviewModalProps {
  review: Review
  onClose: () => void
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="text-2xl leading-none transition-colors"
        >
          <span className={(hovered || value) >= star ? "text-amber-400" : "text-gray-300"}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export function ReviewModal({ review, onClose }: ReviewModalProps) {
  const [reviewText, setReviewText] = useState("")
  const [tags, setTags] = useState("")
  const [rating, setRating] = useState(4)
  const [liked, setLiked] = useState(false)
  const [watchedBefore, setWatchedBefore] = useState(true)
  const [watchedDate] = useState("25 Jan 2026")

  const handleSave = () => {
    // TODO: call your API here
    console.log({ reviewText, tags, rating, liked, watchedBefore })
    onClose()
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close button outside modal */}
      <button
        onClick={onClose}
        className="absolute top-6 right-8 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" strokeWidth={2.5} />
      </button>

      {/* Modal card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 relative">
        <div className="flex gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={review.movie.poster}
              alt={review.movie.title}
              className="w-36 h-52 object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Form */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Title */}
            <h2 className="text-2xl font-bold">
              {review.movie.title} ({review.movie.year})
            </h2>

            {/* Watched on */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-6 h-6 rounded border-2 border-gray-400 flex items-center justify-center bg-gray-100"
              >
                <Check className="w-4 h-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600">watched on</span>
              <span className="text-sm bg-gray-200 px-3 py-1 rounded-lg font-medium">
                {watchedDate}
              </span>
            </div>

            {/* Watched before */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setWatchedBefore(!watchedBefore)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  watchedBefore
                    ? "bg-gray-200 border-gray-400"
                    : "bg-white border-gray-300"
                }`}
              >
                {watchedBefore && <Check className="w-4 h-4 text-gray-600" />}
              </button>
              <span className="text-sm text-gray-600">I've watched this before</span>
            </div>

            {/* Review text */}
            <Textarea
              placeholder="Add a review ..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="resize-none bg-gray-100 border-none text-sm min-h-[100px] rounded-lg"
            />

            {/* Tags + Rating + Like row */}
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Tags</p>
                <Input
                  placeholder="eg. netflix"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-gray-100 border-none text-sm rounded-lg"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Rating</p>
                <StarRatingInput value={rating} onChange={setRating} />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Like</p>
                <button
                  type="button"
                  onClick={() => setLiked(!liked)}
                  className="text-2xl"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      liked ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-1">
              <Button
                onClick={handleSave}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold px-8 py-2 rounded-full text-base"
              >
                SAVE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
