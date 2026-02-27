// src/components/community/NowShowingMovies.tsx
import { ChevronRight } from "lucide-react"
import type { Movie } from "@/types/api"

interface NowShowingMoviesProps {
  movies: Movie[]
}

export function NowShowingMovies({ movies }: NowShowingMoviesProps) {
  return (
    <section>
      <h2 className="text-xl font-black tracking-widest uppercase mb-4">Now Showing</h2>
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {/* Displaying a subset of movies for the sidebar view */}
          {movies.slice(0, 3).map((movie) => (
            <div
              key={movie.id}
              className="w-20 cursor-pointer group rounded shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={movie.poster_url || "https://placehold.co/90x130?text=No+Poster"}
                alt={movie.title}
                className="aspect-[2/3] object-cover rounded group-hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>

        <button className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </section>
  )
}