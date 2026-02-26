import { Link } from 'react-router-dom';
import type { Movie } from '@/types/api';
import { formatDuration } from '@/types/api';

interface MovieCardProps {
  readonly movie: Movie;
  readonly onClick?: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {


  return (
    <Link to={`/movie/${movie.id}`}>
      <div
        className="group cursor-pointer"
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick?.();
          }
        }}
      >
        {/* Movie Poster */}
        <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-4 aspect-2/3 bg-neutral-900">
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Movie Info */}
        <div className="space-y-2 sm:space-y-3">
          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold tracking-wide leading-tight line-clamp-2">
            {movie.title}
          </h3>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <p className="text-neutral-500 uppercase font-semibold mb-0.5">Status</p>
              <p className="font-medium text-neutral-900">{movie.release_status?.replace('_', ' ') ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase font-semibold mb-0.5">Duration</p>
              <p className="font-medium text-neutral-900">{formatDuration(movie.runtime_minutes)}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase font-semibold mb-0.5">Genre</p>
              <p className="font-medium text-neutral-900">{movie.genres?.join(', ') || 'N/A'}</p>
            </div>
            <div>
              <p className="text-neutral-500 uppercase font-semibold mb-0.5">Rating</p>
              <p className="font-medium text-neutral-900">{movie.imdb_score != null ? `${movie.imdb_score}/10` : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
