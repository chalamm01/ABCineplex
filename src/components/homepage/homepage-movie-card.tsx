import { Link } from 'react-router-dom';
import type { Movie } from '@/types/api';
import { formatDuration, formatYear, formatLanguages } from '@/types/api';

interface HomepageMovieCardProps {
  readonly movie: Movie;
}

export function HomepageMovieCard({ movie }: HomepageMovieCardProps) {
  const imageSrc = movie.banner_url ?? movie.poster_url ?? '';

  if (!imageSrc) return null;

  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-sm mb-4 aspect-video">
          <img
            src={imageSrc}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-medium tracking-wide line-clamp-2 flex-1 text-black">
              {movie.title}
            </h3>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-xs tracking-widest text-neutral-400 uppercase">
                Rating
              </span>
              <span className="text-sm font-semibold text-black">{movie.content_rating ?? 'N/A'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs text-neutral-600">
            <div>
              <p className="text-neutral-500 text-xs uppercase">Year</p>
              <p className="font-medium text-neutral-900">{formatYear(movie.release_date)}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500 text-xs uppercase">Duration</p>
              <p className="font-medium text-neutral-900">{formatDuration(movie.runtime_minutes)}</p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase">Audio</p>
              <p className="font-medium text-neutral-900">{formatLanguages(movie.audio_languages)}</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500 text-xs uppercase">Subtitle</p>
              <p className="font-medium text-neutral-900">{formatLanguages(movie.subtitle_languages)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
