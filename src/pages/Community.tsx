import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

// MockData
const movies = [
  {
    id: 101,
    title: "Human Resource",
    genre: "Drama",
    runtime_minutes: 122,
    rating_tmdb: 7,
    starring: [
      "Prapamonton Eiamchan",
      "Paopetch Charoensook",
      "Chanakan Rattanaudom",
    ],
    poster_url: "/assets/background/bg.png",
    banner_url: "/assets/background/bg.png",
    release_date: "2026-02-27",
    content_rating: "16+",
    audio_languages: ["TH"],
    subtitle_languages: ["TH", "EN"],
    status: "now_showing",
  },
  {
    id: 202,
    title: "Bangkok Noir",
    genre: "Thriller",
    runtime_minutes: 110,
    rating_tmdb: 7.5,
    starring: ["Mario Maurer", "Urassaya Sperbund", "Aokbab Chutimon"],
    poster_url: "/assets/background/bg.png",
    banner_url: "",
    release_date: "2026-01-15",
    content_rating: "18+",
    audio_languages: ["TH"],
    subtitle_languages: ["TH", "EN"],
    status: "now_showing",
  },
  {
    id: 303,
    title: "Muay Legacy",
    genre: "Action",
    runtime_minutes: 118,
    rating_tmdb: 7.9,
    starring: ["Tony Jaa", "Petchtai Wongkamlao", "Jija Yanin"],
    poster_url: "/assets/background/bg.png",
    banner_url: "/assets/background/bg.png",
    release_date: "2026-02-14",
    content_rating: "13+",
    audio_languages: ["TH"],
    subtitle_languages: ["TH", "EN", "ZH", "KO"],
    status: "now_showing",
  },
  {
    id: 404,
    title: "Ghost of the North",
    genre: "Horror",
    runtime_minutes: 98,
    rating_tmdb: 6.8,
    starring: ["Apinya Sakuljaroensuk", "Ananda Everingham"],
    poster_url: "/assets/background/bg.png",
    banner_url: "/assets/background/bg.png",
    release_date: "2025-10-31",
    content_rating: "18+",
    audio_languages: ["TH"],
    subtitle_languages: ["TH"],
    status: "ended",
  },
  {
    id: 505,
    title: "The Last Horizon",
    genre: "Sci-Fi",
    runtime_minutes: 138,
    rating_tmdb: 8,
    starring: ["Nattawut Poonpiriya", "Davika Hoorne", "Sunny Suwanmethanon"],
    poster_url: "/assets/background/bg.png",
    banner_url: "/assets/background/bg.png",
    release_date: "2026-03-05",
    content_rating: "13+",
    audio_languages: ["TH", "EN"],
    subtitle_languages: ["TH", "EN", "ZH"],
    status: "coming_soon",
  },
  {
    id: 606,
    title: "Summer in Chiang Mai",
    genre: "Romance",
    runtime_minutes: 105,
    rating_tmdb: 7.2,
    starring: ["Baifern Pimchanok", "Mario Maurer", "Violette Wautier"],
    poster_url: "/assets/background/bg.png",
    banner_url: "/assets/background/bg.png",
    release_date: "2026-04-10",
    content_rating: "G",
    audio_languages: ["TH", "EN"],
    subtitle_languages: ["TH", "EN", "JA"],
    status: "coming_soon",
  },
];

const reviews = {
  total: 5,
  items: [
    {
      id: 1,
      movie_id: 101,
      booking_id: 5001,
      user_id: "usr_a1b2c3",
      username: "john_doe",
      review_text:
        "Absolutely loved this film! The visuals were stunning and the storyline kept me hooked from start to finish. Highly recommend it.",
      rating: 5,
      like_count: 42,
      created_at: "2026-02-01T14:23:00.000Z",
      updated_at: "2026-02-01T14:23:00.000Z",
    },
    {
      id: 2,
      movie_id: 101,
      booking_id: 5028,
      user_id: "usr_d4e5f6",
      username: "movie_buff_88",
      review_text:
        "Good movie overall, but the pacing in the second act felt a bit slow. The acting was top notch though.",
      rating: 3,
      like_count: 15,
      created_at: "2026-02-05T09:10:45.000Z",
      updated_at: "2026-02-06T11:00:00.000Z",
    },
    {
      id: 3,
      movie_id: 202,
      booking_id: 5103,
      user_id: "usr_g7h8i9",
      username: "sarah_watches",
      review_text:
        "A masterpiece. The director really outdid themselves this time. Cried three times and I'm not ashamed to admit it.",
      rating: 5,
      like_count: 88,
      created_at: "2026-02-10T18:45:30.000Z",
      updated_at: "2026-02-10T18:45:30.000Z",
    },
    {
      id: 4,
      movie_id: 303,
      booking_id: 5217,
      user_id: "usr_j1k2l3",
      username: "criticalviewer",
      review_text:
        "Honestly disappointed. The trailer was misleading and the plot had too many holes. Wouldn't watch again.",
      rating: 2,
      like_count: 7,
      created_at: "2026-02-15T21:00:10.000Z",
      updated_at: "2026-02-16T08:30:00.000Z",
    },
    {
      id: 5,
      movie_id: 202,
      booking_id: 5289,
      user_id: "usr_m4n5o6",
      username: "popcorn_king",
      review_text:
        "Super fun watch with the family! Great special effects and a feel-good ending. Kids loved it too.",
      rating: 4,
      like_count: 31,
      created_at: "2026-02-20T16:15:00.000Z",
      updated_at: "2026-02-20T16:15:00.000Z",
    },
  ],
};

//star rating component
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
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


//review card
function ReviewCard({ reviews }: { reviews: typeof reviews.items }) {
  return (
    <div className="flex flex-col gap-6 w-[600px]">
      {reviews.map((review) => (
        <Card
          key={review.id}
          className="p-6 rounded-2xl border-0 shadow-[0_10px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_14px_45px_rgba(0,0,0,0.1)] transition duration-300"
        >
          {/* Top Section */}
          <div className="flex items-start gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`}
              />
              <AvatarFallback>
                {review.username.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="font-semibold text-sm">
                {review.username}
              </span>

              <div className="flex items-center gap-2 text-yellow-500">
                <RatingStars rating={review.rating} />
                <span className="text-xs text-gray-500">
                  {review.rating} stars
                </span>
              </div>
            </div>
          </div>

          {/* Review Text */}
          <p className="mt-4 text-gray-700 leading-relaxed">
            {review.review_text}
          </p>

          {/* Like Section */}
          <div className="flex items-center gap-2 mt-4 text-gray-500">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">
              {review.like_count} likes
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

//movie card
function MovieCard({ movie }: { movie: typeof movies[0] }) {
  return (
    <div className="flex cursor-pointer group items-start my-10">
      <div className="flex gap-8 max-w-4xl">
        {/* Poster */}
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-[85px] h-[130px] object-cover rounded-xl shadow-md transition hover:scale-105 hover:shadow-lg"
        />

        {/* Title + Review stacked vertically */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold mt-1">
            {movie.title}
            <span className="ml-1 text-black/40 font-normal">
              {movie.release_date.substring(0, 4)}
            </span>
          </h1>

          <ReviewCard
            reviews={reviews.items
              .filter((r) => r.movie_id === movie.id)
              .sort((a, b) => b.like_count - a.like_count)
              .slice(0, 1)}
          />
        </div>
      </div>
    </div>
  );
}


//main
export default function CommunityPage() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === movies.length - 1 ? 0 : prev + 1
  )
  }
  const filmScrollRef = useRef<HTMLDivElement>(null)

  const scrollRight = () => {
    filmScrollRef.current?.scrollBy({
      left: 200,
      behavior: "smooth",
    })
  }

  return (
    <div className="min-h-screen flex justify-center py-12 bg-gray-100">
      <div className="w-[1200px] bg-white rounded-3xl shadow-xl p-16">
        <div className="grid grid-cols-3 gap-16">

          {/* LEFT SIDE */}
          <div className="col-span-2 space-y-10 max-h-[750px] overflow-y-auto overflow-x-hidden pr-4">
            <h1 className="text-5xl font-black tracking-tight">
              POPULAR REVIEW
            </h1>

            {movies.map((movie) => (
              <div key={movie.id}>
                <MovieCard movie={movie} />
                <Separator className="my-6" />
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-8">

            {/* Popular Films */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  POPULAR FILMS
                </h3>

                <button onClick={nextSlide}>
                  <ChevronRight className="w-5 h-5 hover:scale-110 transition" />
                </button>
              </div>

              <div className="overflow-hidden w-[260px]">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * 90}px)`
                  }}
                >
                {movies.map((movie) => (
                  <img
                    key={movie.id}
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-[80px] h-[120px] object-cover rounded-lg shadow-md mr-2"
                  />
                ))}
              </div>
            </div>
          </div>

            {/* Popular Reviewers */}
            <div>
              <h2 className="text-sm font-semibold tracking-widest">
                POPULAR REVIEWERS
              </h2>
            </div>

            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
              {reviews.items.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start gap-3 border-b pb-4"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`}
                    />
                    <AvatarFallback>
                      {review.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-sm">
                    <p className="font-medium">
                      {review.username}
                    </p>
                    <p className="text-gray-500 line-clamp-2">
                      {review.review_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}