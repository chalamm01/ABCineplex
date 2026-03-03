import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Movie } from '@/types/api';
import { formatDuration, formatYear } from '@/types/api';
import { Badge } from "@/components/ui/badge";
interface BookingMovieInfoProps {
  readonly movie: Movie;
}

export function BookingMovieInfo({ movie }: BookingMovieInfoProps) {
  const firstGenre = movie.genre;
  const isUpcoming = movie.release_status?.toLowerCase() === 'coming_soon' || movie.release_status?.toLowerCase() === 'upcoming';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 tracking-tight">
          {movie.title} <span className='text-xl font-normal'>({formatYear(movie.release_date)})</span>
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {isUpcoming && (
            <Badge className="bg-orange-600 text-white hover:bg-orange-700">
              🎬 Coming Soon
            </Badge>
          )}
          {firstGenre && (
            <Badge variant="default">
              {firstGenre}
            </Badge>
          )}
          {movie.imdb_score != null && movie.imdb_score > 0 && (
            <Badge className="bg-yellow-600 text-yellow-50 hover:bg-yellow-700">
              ⭐ {movie.imdb_score}/10
            </Badge>
          )}
          {movie.audio_languages && movie.audio_languages.length > 0 && (
            <Badge variant="secondary">
              🔊 {movie.audio_languages.join(', ')}
            </Badge>
          )}
          {movie.subtitle_languages && movie.subtitle_languages.length > 0 && (
            <Badge variant="secondary">
              📝 {movie.subtitle_languages.join(', ')}
            </Badge>
          )}
          {movie.credits_duration_minutes != null && movie.credits_duration_minutes > 0 && (
            <Badge variant="outline">
              Credits: {movie.credits_duration_minutes}m
            </Badge>
          )}
          {movie.runtime_minutes && (
            <Badge variant="secondary">
              ⏱️ {formatDuration(movie.runtime_minutes)}
            </Badge>
          )}
          {movie.content_rating && (
            <Badge variant="secondary">
              🎬 {movie.content_rating}
            </Badge>
          )}
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
        {movie.trailer_url && (
          <Button
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5 sm:py-6 rounded-lg sm:rounded-xl transition-all hover:scale-105"
            onClick={() => window.open(movie.trailer_url, '_blank')}
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            <span className="hidden sm:inline">WATCH TRAILER</span>
            <span className="sm:hidden">TRAILER</span>
          </Button>
        )}
      </div>
    </div>
  );
}
