// src/components/community/NowShowingMovies.tsx
import type { Movie } from "@/types/api"

interface NowShowingMoviesProps {
  readonly movies: Movie[]
  onMovieClick?: (id: number) => void
}

export function NowShowingMovies({ movies, onMovieClick }: NowShowingMoviesProps) {
  return (
    <section className="sticky top-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">
          Now Showing
        </h2>
        <div className="space-y-3">
          {/* Displaying all movies in a vertical list */}
          {movies.slice(0, 6).map((movie) => (
            <button
              key={movie.id}
              className="flex gap-3 group text-left hover:bg-neutral-50 active:bg-neutral-100 rounded p-2 -m-2 transition-colors w-full"
              onClick={() => onMovieClick?.(movie.id)}
              aria-label={`Select ${movie.title} (${movie.release_date?.slice(0, 4)})`}
            >
              <img
                src={movie.poster_url || "https://placehold.co/50x70?text=?"}
                alt=""
                className="aspect-2/3 max-w-12 max-h-16 rounded shadow-sm group-hover:ring-2 group-hover:ring-orange-400 transition-all object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {movie.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {movie.release_date?.slice(0, 4)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}