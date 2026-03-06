import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { moviesApi } from '@/services/api';
import type { TopPicksItem } from '@/types/api';
import { Separator } from '../ui/separator';

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
    <div className="shrink-0 w-80 snap-start animate-pulse">
      <div className="aspect-video bg-gray-200 rounded-xl mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  );
}

export function TopPicksSection() {
  const [picks, setPicks] = useState<TopPicksItem[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    moviesApi.getTopPicks(5)
      .then((res) => setPicks(res.top_picks))
      .catch(() => setPicks([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;

      containerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && picks.length === 0) return null;

  return (
    <section className="p-6 bg-white/40 rounded-2xl">
      <div className="max-w-400 mx-auto p-6">
        <p className="text-xs tracking-widest text-neutral-500 uppercase mb-4 font-bold">
          Consensus Top Picks
        </p>

        <div className="flex gap-8">
          <span className="pb-4 text-3xl font-bold tracking-tight border-b-2 border-black -mb-0.5 text-black">
            Ranked by ratings &amp; bookings
          </span>
        </div>

        <Separator className="my-6 bg-neutral-500" />

        <div className="relative group">
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : picks.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="shrink-0 w-80 snap-start group/card"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl shadow-sm group-hover/card:shadow-md transition-shadow">
                    <img
                      src={movie.banner_url ?? '/assets/images/placeholder.png'}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
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

          {/* Navigation Arrows */}
          {!loading && picks.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 shadow-lg hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 shadow-lg hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}