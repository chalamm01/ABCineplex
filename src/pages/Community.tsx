import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp } from "lucide-react";


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


function ReviewCard({ reviews }: { reviews: typeof reviews.items }) {
  return (
    <div className="flex flex-col gap-4 max-w-[100vw]">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.username}`} />
              <AvatarFallback>{review.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{review.username}</span>
              <span className="text-sm text-gray-500">{<RatingStars rating={review.rating} />} {review.rating} stars</span>
            </div>
          </div>
          <p className="font-medium text-gray-700">{review.review_text}</p>
          <div className="flex items-center gap-2 mt-2">
            <ThumbsUp className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">{review.like_count} likes</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MovieCard({ movie }: { movie: typeof movies[0] }) {
  return (
    <div className="flex cursor-pointer group items-center ml-4 my-5">
      <div className="flex gap-4 rounded-sm max-w-[100vw]">
        {/* Poster */}
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-50 h-80 object-cover transition-transform duration-200 group-hover:scale-105 rounded-sm flex-shrink-0"
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
export default function CommunityPage() {
  return(
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 bg-white/70 backdrop-blur-md py-12">
        <Card>
          <div className="overflow-y-auto max-h-[80vh] max-w-[100vh] p-6">
            {movies.map((movie) => (
              <>
              <MovieCard key={movie.id} movie={movie} />
              <Separator className="my-2" />
              </>
            ))}
          </div>
        </Card>
      </div>
    </div>

)};