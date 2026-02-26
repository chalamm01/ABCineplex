import { useState, useEffect } from 'react';
import { TabNavigation } from '@/components/movies/tab-navigation';
import { MoviesGrid } from '@/components/movies/movies-grid';
import { movieApi } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner'

function Movies() {
  const [activeTab, setActiveTab] = useState<'now' | 'soon'>('now');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Map tab to correct status param
        const status = activeTab === 'now' ? 'now_showing' : 'upcoming';
        const page = 1;
        const limit = 20;

        // Fetch movies from API
        const response = await movieApi.getMovies(page, limit, status);
        // Transform API data to match frontend Movie type
        const movies = (response.movies || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          poster_url: m.poster_url,
          release_status: m.status || m.release_status,
          duration_minutes: m.runtime_minutes ?? m.duration_minutes,
          genres: Array.isArray(m.genre) ? m.genre : (typeof m.genre === 'string' ? m.genre.split(',').map((g: string) => g.trim()) : []),
          imdb_score: m.rating_tmdb ?? m.imdb_score,
          // ...add other fields as needed
        }));
        setMovies(movies);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeTab]);

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {loading && (
          <div className="flex justify-center items-center py-20">
            <Spinner/>
          </div>
        )}

        {error && (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <MoviesGrid movies={movies} />
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-neutral-600">No movies available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
