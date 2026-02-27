// src/components/community/NowShowingMovies.tsx
import { ChevronRight } from "lucide-react"
import type { Movie } from "@/types/api"

interface NowShowingMoviesProps {
  movies: Movie[]
}

export function NowShowingMovies({ movies }: NowShowingMoviesProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold uppercase mb-4">Now Showing</h2>
      <div className="flex items-center gap-3 group justify-between">
        <div className="flex gap-2">
          {/* Displaying a subset of movies for the sidebar view */}
          {movies.slice(0, 3).map((movie) => (
            <div
              key={movie.id}
              className="w-20 cursor-pointer rounded shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={movie.poster_url || "https://placehold.co/90x130?text=No+Poster"}
                alt={movie.title}
                className="aspect-2/3 object-cover rounded hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>

        <button className="w-12 h-12 bg-white/90 shadow-lg hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  )
}