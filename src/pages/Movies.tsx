"use client"
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { moviesApi } from '@/services/api';
import type { Movie } from '@/types/api';

function Movies() {
  const [activeTab, setActiveTab] = useState<'now_showing' | 'coming_soon'>('now_showing');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    moviesApi.getMovies(0, 100, activeTab)
      .then(setMovies)
      .catch(() => setError('Failed to load movies.'))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-[url('/public/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('now_showing')}
            className={cn(
              'text-4xl font-medium transition-colors',
              activeTab === 'now_showing'
                ? 'text-primary underline'
                : 'text-primary/30 hover:text-primary/50',
            )}
          >
            Now Showing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coming_soon')}
            className={cn(
              'text-4xl font-medium transition-colors',
              activeTab === 'coming_soon'
                ? 'text-primary underline'
                : 'text-primary/30 hover:text-primary/50',
            )}
          >
            Coming Soon
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <p className="text-xl text-primary/60">Loading movies…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex justify-center py-20">
            <p className="text-xl text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="flex justify-center py-20">
            <p className="text-xl text-primary/60">No movies found.</p>
          </div>
        )}

        {/* Movie Grid */}
        {!loading && !error && movies.length > 0 && (
          <div className="grid grid-cols-5 gap-6">
            {movies.map((movie) => (
              <div key={movie.id} className="flex flex-col cursor-pointer group">
                {/* Poster */}
                <div className="relative overflow-hidden rounded-lg shadow-lg mb-3 aspect-[27/40] bg-gray-200">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {movie.tag_event && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                      {movie.tag_event}
                    </span>
                  )}
                </div>

                {/* Title and Date */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-xl text-foreground flex-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {movie.title}
                  </h3>
                  <p className="text-md text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDate(movie.release_date)}
                  </p>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {movie.genres.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
