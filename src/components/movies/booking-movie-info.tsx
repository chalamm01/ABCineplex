import { Play, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Movie } from '@/types/api';
import { formatDuration, formatYear } from '@/types/api';

interface BookingMovieInfoProps {
  readonly movie: Movie;
}

export function BookingMovieInfo({ movie }: BookingMovieInfoProps) {
  const firstGenre = movie.genres?.[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 tracking-tight">
          {movie.title} <span className='text-xl font-normal'>({formatYear(movie.release_date)})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {firstGenre && (
            <span className="px-3 py-1.5 bg-neutral-100 text-black text-xs sm:text-sm font-medium rounded-full border border-neutral-300">
              {firstGenre}
            </span>
          )}
          {movie.imdb_score != null && movie.imdb_score > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-full border border-yellow-300">
              <span className="text-xs font-bold text-yellow-700">IMDb</span>
              <span className="text-black font-semibold text-sm">{movie.imdb_score}/10</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg sm:rounded-xl border border-neutral-300">
          <div className="text-xs text-neutral-600 mb-1 uppercase tracking-wider font-semibold">Duration</div>
          <div className="text-black font-semibold text-sm sm:text-base">{formatDuration(movie.duration_minutes)}</div>
        </div>
        <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg sm:rounded-xl border border-neutral-300">
          <div className="text-xs text-neutral-600 mb-1 uppercase tracking-wider font-semibold">Rating</div>
          <div className="text-black font-semibold text-sm sm:text-base">{movie.content_rating ?? 'N/A'}</div>
        </div>
      </div>

      {movie.director && (
        <div>
          <h3 className="text-xs text-neutral-600 mb-2 uppercase tracking-wider font-semibold">Director</h3>
          <p className="text-black font-medium text-sm">{movie.director}</p>
        </div>
      )}

      {movie.starring && movie.starring.length > 0 && (
        <div>
          <h3 className="text-xs text-neutral-600 mb-2 uppercase tracking-wider font-semibold">Starring</h3>
          <p className="text-black font-medium text-sm">{movie.starring.join(', ')}</p>
        </div>
      )}

      {movie.synopsis && (
        <div>
          <h3 className="text-xs text-neutral-600 mb-2 uppercase tracking-wider font-semibold">Synopsis</h3>
          <p className="text-neutral-700 leading-relaxed text-sm">{movie.synopsis}</p>
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 pt-4">
        <Button className="flex-1 bg-black hover:bg-neutral-800 text-white font-semibold py-5 sm:py-6 rounded-lg sm:rounded-xl transition-all hover:scale-105">
          <Play className="mr-2 h-5 w-5 fill-current" />
          <span className="hidden sm:inline">WATCH TRAILER</span>
          <span className="sm:hidden">TRAILER</span>
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-neutral-300 text-black hover:bg-neutral-100 py-5 sm:py-6 rounded-lg sm:rounded-xl transition-all hover:scale-105"
        >
          <Plus className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">WATCHLIST</span>
          <span className="sm:hidden">LIST</span>
        </Button>
      </div>
    </div>
  );
}
