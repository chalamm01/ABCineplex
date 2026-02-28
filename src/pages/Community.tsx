import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";


// MockData
const movies = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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


function MovieCard({ movie }: { movie: typeof movies[0] }){
    return (
    <div className="flex-shrink-0 cursor-pointer group bg-black">
      <div className="flex overflow-hidden rounded-sm shadow-sm">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-[100px] h-[150px] object-cover transition-transform duration-200 group-hover:scale-105 rounded-sm"
        />
        <h1 className="text-xl font-bold text-white mt-1 ml-2">
          {movie.title}
          <div className="inline ml-1 text-white/70">
            {movie.release_date.substring(0, 4)}
          </div>
        </h1>
      </div>
    </div>
  );
}




export default function CommunityPage() {
  return(
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 bg-white/70 backdrop-blur-md py-12">
        <Card>
          <div className="overflow-y-auto max-h-[70vh] max-w-3xl">
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