import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Star} from "lucide-react"
import { useEffect, useState } from "react"
import { reviewsApi, type Review } from "@/services/api"


// const reviewData = {
//   total: 2,
//   items: [
//     {
//       id: 1,
//       movie_id: 10,
//       booking_id: 20,
//       user_id: "123",
//       username: "JohnDoe",
//       review_text: "Amazing movie! The storyline was incredible.",
//       rating: 4,
//       like_count: 12,
//       created_at: "2026-02-25T08:43:56.458Z",
//       updated_at: "2026-02-25T08:43:56.458Z"
//     },
//     {
//       id: 2,
//       movie_id: 10,
//       booking_id: 21,
//       user_id: "124",
//       username: "JaneSmith",
//       review_text: "It was okay, but a bit long.",
//       rating: 3,
//       like_count: 4,
//       created_at: "2026-02-25T08:43:56.458Z",
//       updated_at: "2026-02-25T08:43:56.458Z"
//     }
//   ]
// }



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

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const items = reviews

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await reviewsApi.getReviewsByMovie(10)
        setReviews(data.items)
        setTotal(data.total)

      } catch (err) {
        console.error(err)
        setError("Failed to load reviews.")
      } finally {
        setLoading(false)
      }
    }

  fetchReviews()
  }, [])


  if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded">
          {error}
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-muted/40 p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">

        <h1 className="text-3xl font-bold">
          Reviews ({total})
        </h1>

        <Separator />

        {items.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No reviews yet.
            </CardContent>
          </Card>
        )}

        {items.map((review) => (
          <Card key={review.id} className="hover:shadow-md transition">
            <CardHeader className="flex flex-row items-center justify-between">

              {/* User Info */}
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

              {/* Rating Badge */}
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