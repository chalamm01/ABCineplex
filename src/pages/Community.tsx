// src/pages/CommunityPage.tsx
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ReviewCard } from "@/components/community/ReviewCard"
import { PopularFilms } from "@/components/community/PopularFilms"
import { PopularReviewers } from "@/components/community/PopularReviewers"
import { ReviewModal } from "@/components/community/ReviewModal"
// import type { Movie } from "@/types/api"
// import { moviesApi } from "@/services/api"

// --- Mock data (replace with real API calls) ---
const MOCK_REVIEWS = [
  {
    id: "1",
    movie: { title: "Kokuho", year: 2025, poster: "https://placehold.co/80x110/1a1a2e/white?text=KOKUHO" },
    author: { username: "@Amjard Rotee", avatar: "" },
    rating: 5,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget elementum neque, at tincidunt lacus. Praesent eleifend ligula a sem pulvinar facilisis.",
    likes: 162,
  },
  {
    id: "2",
    movie: { title: "Kokuho", year: 2025, poster: "https://placehold.co/80x110/1a1a2e/white?text=KOKUHO" },
    author: { username: "@Amjard Rotee", avatar: "" },
    rating: 5,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget elementum neque, at tincidunt lacus. Praesent eleifend ligula a sem pulvinar facilisis.",
    likes: 162,
  },
  {
    id: "3",
    movie: { title: "Kokuho", year: 2025, poster: "https://placehold.co/80x110/1a1a2e/white?text=KOKUHO" },
    author: { username: "@Amjard Rotee", avatar: "" },
    rating: 5,
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget elementum neque, at tincidunt lacus. Praesent eleifend ligula a sem pulvinar facilisis.",
    likes: 162,
  },
]

const MOCK_POPULAR_FILMS = [
  { id: "1", title: "Kokuho", poster: "https://placehold.co/90x130/1a1a2e/white?text=KOKUHO" },
  { id: "2", title: "Film 2",  poster: "https://placehold.co/90x130/2d1b69/white?text=FILM+2" },
  { id: "3", title: "Accident", poster: "https://placehold.co/90x130/0f3460/white?text=ACCIDENT" },
]

const MOCK_REVIEWERS = [
  { id: "1", username: "@Amjard Rotee", films: 1314, reviews: 1234, avatar: "" },
  { id: "2", username: "@Amjard Rotee", films: 1314, reviews: 1234, avatar: "" },
  { id: "3", username: "@Amjard Rotee", films: 1314, reviews: 1234, avatar: "" },
  { id: "4", username: "@Amjard Rotee", films: 1314, reviews: 1234, avatar: "" },
]

export default function CommunityPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<(typeof MOCK_REVIEWS)[0] | null>(null)

  const handleOpenModal = (review: (typeof MOCK_REVIEWS)[0]) => {
    setSelectedReview(review)
    setModalOpen(true)
  }

  return (
    <div
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: "url('/assets/background/bg.png')" }}
    >
      <div className="min-h-screen px-8 lg:px-20 bg-white/75 backdrop-blur-sm py-10">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-widest uppercase">Popular Review</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="find a film"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-white border-gray-300 text-sm"
            />
          </div>
        </div>

        {/* Main layout */}
        <div className="flex gap-10">
          {/* Left: Review Feed */}
          <div className="flex-1 flex flex-col gap-0 divide-y divide-gray-200">
            {MOCK_REVIEWS.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onClick={() => handleOpenModal(review)}
              />
            ))}
          </div>

          {/* Right: Sidebar */}
          <aside className="w-72 flex-shrink-0 flex flex-col gap-10">
            <PopularFilms films={MOCK_POPULAR_FILMS} />
            <PopularReviewers reviewers={MOCK_REVIEWERS} />
          </aside>
        </div>
      </div>

      {/* Review Modal */}
      {modalOpen && selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
