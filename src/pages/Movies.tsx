import { useState, useEffect } from 'react';
import { TabNavigation } from '@/components/movies/tab-navigation';
import { MoviesGrid } from '@/components/movies/movies-grid';
import { moviesApi } from '@/services/api';
import type { Movie } from '@/types/api';

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

        const status = activeTab === 'now' ? 'now_showing' : 'coming_soon';
        const data = await moviesApi.getMovies(0, 50, status);

        setMovies(data || []);
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
    <div className="min-h-screen bg-[#e8e8e8]">
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {loading && (
        <div className="flex justify-center items-center py-20">
          <p className="text-lg text-neutral-600">Loading movies...</p>
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
  );
}

export default Movies;
