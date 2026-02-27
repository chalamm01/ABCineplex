// src/pages/CommunityPage.tsx
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ReviewCard } from "@/components/community/ReviewCard"
import { NowShowingMovies } from "@/components/community/NowShowingMovies"
import { PopularReviewers } from "@/components/community/PopularReviewers"
import { ReviewModal } from "@/components/community/ReviewModal"
import type { Movie } from "@/types/api"
import { moviesApi } from "@/services/api"
import { Spinner } from "@/components/ui/spinner"

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
const [error, setError] = useState<string | null>(null)
  const [nowShowing, setNowShowing] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const handleOpenModal = (review: (typeof MOCK_REVIEWS)[0]) => {
    setSelectedReview(review)
    setModalOpen(true)
  }

  useEffect(() => {
    const fetchNowShowing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await moviesApi.getMovies(1, 10, 'now_showing');
        console.log("Response", response)
        const movies = response?.movies || [];
        setNowShowing(movies);
      } catch (err) {
        console.error('Failed to fetch sidebar movies:', err);
        setError('Could not load movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchNowShowing();
  }, []);
  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">

      <div className="min-h-screen p-6 bg-white/70 backdrop-blur-sm py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold uppercase">Popular Review</h1>
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
            {loading ? (
              <Spinner/>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <NowShowingMovies movies={nowShowing} />
            )}
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
