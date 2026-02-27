// src/components/community/PopularReviewers.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Reviewer {
  id: string
  username: string
  films: number
  reviews: number
  avatar: string
}

interface PopularReviewersProps {
  reviewers: Reviewer[]
}

export function PopularReviewers({ reviewers }: PopularReviewersProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold uppercase mb-5">Popular Reviewer</h2>
      <div className="flex flex-col gap-5">
        {reviewers.map((reviewer) => (
          <div
            key={reviewer.id}
            className="flex items-center gap-4 cursor-pointer group"
          >
            <Avatar className="w-12 h-12 shrink-0">
              <AvatarImage src={reviewer.avatar} />
              <AvatarFallback className="bg-[#5b7fa6] text-white text-base font-semibold">
                {reviewer.username.slice(1, 3).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm group-hover:underline">{reviewer.username}</p>
              <p className="text-xs text-gray-500">
                {reviewer.films.toLocaleString()} films, {reviewer.reviews.toLocaleString()} reviews
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
