import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Star} from "lucide-react"
import { useEffect, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import type { Review } from "@/services/api"



function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((star) => (
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


export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)

  const [newReview, setNewReview] = useState("")
  const [newRating, setNewRating] = useState(5)

  const handleSubmit = () => {
    if (!newReview.trim()) return

    const newItem: Review = {
      id: Date.now(),
      movie_id: 10,
      booking_id: 0,
      user_id: "local-user",
      username: "You",
      review_text: newReview,
      rating: newRating,
      like_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setReviews(prev => [newItem, ...prev])
    setTotal(prev => prev + 1)

    setNewReview("")
    setNewRating(5)
  }

  return (
    <div className="min-h-screen bg-muted/40 p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">

        <h1 className="text-3xl font-bold">
          Reviews ({total})
        </h1>

        <Separator />

        {/* Create Review Card */}
        <Card>
          <CardContent className="space-y-4 p-6">

            <Textarea
              className="min-h-[150px]"
              placeholder="Write your review..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
            />

            <div className="flex justify-between items-center">

              {/* Star Selector */}
              <div className="flex gap-2">
                {[1,2,3,4,5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => setNewRating(star)}
                    className={`w-5 h-5 cursor-pointer ${
                      star <= newRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <Button onClick={handleSubmit}>
                Post
              </Button>

            </div>

          </CardContent>
        </Card>

        {/* Empty State */}
        {reviews.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reviews yet.
            </CardContent>
          </Card>
        )}

        {/* Review List */}
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">

              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {review.username[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-semibold">
                    {review.username}
                  </p>
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
              <p className="text-sm">
                {review.review_text}
              </p>

              <div className="flex justify-between items-center">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Heart className="w-4 h-4" />
                  {review.like_count}
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}

      </div>
    </div>
  )
}