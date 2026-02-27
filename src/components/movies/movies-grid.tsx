import type { Movie } from '@/types/api';
import { MovieCard } from './movie-card';

interface MoviesGridProps {
  movies: Movie[];
}

export function MoviesGrid({ movies }: MoviesGridProps) {
  return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>
  );
}
