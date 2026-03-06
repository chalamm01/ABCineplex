import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { moviesApi } from '@/services/api';
import type { TopPicksItem } from '@/types/api';

const _BADGE_COLORS: Record<string, string> = {
  selling_fast: 'bg-red-100 text-red-700',
  filling_up: 'bg-orange-100 text-orange-700',
  plenty_of_space: 'bg-green-100 text-green-700',
};

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return null;
  return (
    <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
      {score.toFixed(1)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="shrink-0 w-40 animate-pulse">
      <div className="aspect-[2/3] bg-gray-200 rounded-xl mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export function TopPicksSection() {
  const [picks, setPicks] = useState<TopPicksItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    moviesApi.getTopPicks(12)
      .then((res) => setPicks(res.top_picks))
      .catch(() => setPicks([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render section if no data once loaded
  if (!loading && picks.length === 0) return null;

  return (
    <section className="w-full px-6 md:px-16 py-8">
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
          Consensus Top Picks
        </h2>
        <span className="text-sm text-gray-400">Ranked by ratings &amp; bookings</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : picks.map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="shrink-0 w-40 group"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={movie.poster_url ?? '/assets/images/placeholder.png'}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <ScoreBadge score={movie.consensus_score} />
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {movie.title}
                </p>
                {movie.genre && movie.genre.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{movie.genre[0]}</p>
                )}
              </Link>
            ))}
      </div>
    </section>
  );
}
