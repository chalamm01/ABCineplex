import { useState, useEffect, useRef } from 'react';
import { TabNavigation } from '@/components/movies/tab-navigation';
import { MoviesGrid } from '@/components/movies/movies-grid';
import { moviesApi } from '@/services/api';
import type { Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

function Movies() {
  const [activeTab, setActiveTab] = useState<'now' | 'soon'>('now');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchMovies = async (search?: string) => {
      try {
        setLoading(true);
        setError(null);

        // When searching across all statuses; otherwise filter by tab
        const statusParam = search ? undefined : (activeTab === 'now' ? 'now_showing' : 'upcoming');
        const response = await moviesApi.getMovies(1, 40, statusParam, search || undefined);
        const allFetched = response?.movies || [];

        // Client-side guard when not searching
        const filtered = search
          ? allFetched
          : allFetched.filter((m: Movie) => m.release_status === statusParam);

        setMovies(filtered);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMovies(searchQuery), searchQuery ? 300 : 0);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [activeTab, searchQuery]);

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-6 py-12 bg-white/70 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <TabNavigation activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSearchQuery(''); }} />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-auto w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

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