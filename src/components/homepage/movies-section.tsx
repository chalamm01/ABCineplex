import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomepageMovieCard } from './homepage-movie-card';
import type { Movie } from '@/types/api';
import { Separator } from '../ui/separator';
interface MoviesSectionProps {
  readonly nowScreening: readonly Movie[];
  readonly upcoming: readonly Movie[];
}

type TabType = 'now' | 'soon';

export function MoviesSection({
  nowScreening,
  upcoming,
}: MoviesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('now');
  const [hasOverflow, setHasOverflow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Important: Reset scroll position when switching tabs
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [activeTab]);

  const displayMovies = activeTab === 'now' ? nowScreening : upcoming;

  // Infinite scroll content helper
  const infiniteMovies = hasOverflow
    ? [...displayMovies, ...displayMovies, ...displayMovies]
    : displayMovies;

  return (
    <section className="mt-6 px-6 bg-white/40 py-6 rounded-2xl border border-white/20 shadow-xl">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-widest text-neutral-500 uppercase mb-4 font-bold">
          Featured Films
        </p>
        <div className="flex gap-8">
          {(['now', 'soon'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-3xl font-bold tracking-tight border-b-2 -mb-0.5 transition-all ${
                activeTab === tab
                  ? 'text-black border-black'
                  : 'text-neutral-400 border-transparent hover:text-neutral-600'
              }`}
            >
              {tab === 'now' ? 'Now Showing' : 'Coming Soon'}
            </button>
          ))}
        </div>
        <Separator className="my-6 bg-neutral-300" />

        <div className="relative group">
          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {infiniteMovies.length > 0 ? (
              infiniteMovies.map((movie, index) => (
                <div key={`${movie.id}-${index}`} className="shrink-0 w-80 snap-start">
                  <HomepageMovieCard movie={movie} />
                </div>
              ))
            ) : (
              <div className="w-full py-20 text-center text-neutral-500 italic">
                No movies found in this category.
              </div>
            )}
          </div>

          {infiniteMovies.length > 0 && (
            <>
              <button
                onClick={() => scroll('left')}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 shadow-lg hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 shadow-lg hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
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
