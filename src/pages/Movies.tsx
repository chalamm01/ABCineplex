import { useState, useEffect } from 'react';
import { TabNavigation } from '@/components/movies/tab-navigation';
import { MoviesGrid } from '@/components/movies/movies-grid';
import { movieApi } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

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

        // Backend expects 'now_showing' or 'upcoming'
        const statusParam = activeTab === 'now' ? 'now_showing' : 'upcoming';

        const response = await movieApi.getMovies(1, 40, statusParam);

        const allFetched = response?.movies || [];
        const filtered = allFetched.filter((m: Movie) => m.release_status === statusParam);

        setMovies(filtered);
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
      <div className="min-h-screen px-6 py-12 bg-white/70 backdrop-blur-md">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20 text-red-600 font-medium">
            {error}
          </div>
        ) : movies.length > 0 ? (
          <MoviesGrid movies={movies} />
        ) : (
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-neutral-500 italic">No movies {activeTab === 'now' ? 'currently showing' : 'coming soon'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;