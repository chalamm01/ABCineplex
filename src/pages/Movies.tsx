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

        // Use refactored movieApi.getMovies() with proper parameters
        const response = await movieApi.getMovies(page, limit, status);
        setMovies(response.movies || []);
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
