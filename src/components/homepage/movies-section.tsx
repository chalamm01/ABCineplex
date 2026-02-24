import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomepageMovieCard } from './homepage-movie-card';
import type { Movie } from '@/types/api';

interface MoviesSectionProps {
  readonly nowScreening: readonly Movie[];
  readonly comingSoon: readonly Movie[];
}

type TabType = 'now' | 'soon';

export function MoviesSection({
  nowScreening,
  comingSoon,
}: MoviesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('now');
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const displayMovies =
    activeTab === 'now' ? nowScreening : comingSoon;

  // Triple the movies for smooth infinite scroll
  const infiniteMovies = [
    ...displayMovies,
    ...displayMovies,
    ...displayMovies,
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Start at the middle set of movies
    const initialScroll = container.scrollWidth / 3;
    container.scrollLeft = initialScroll;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const sectionWidth = scrollWidth / 3;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (scrollLeft < sectionWidth * 0.5) {
          isScrollingRef.current = true;
          container.scrollLeft = scrollLeft + sectionWidth;
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 50);
        } else if (scrollLeft > sectionWidth * 2.5) {
          isScrollingRef.current = true;
          container.scrollLeft = scrollLeft - sectionWidth;
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 50);
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [displayMovies]);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 380;
      const newPosition =
        direction === 'left'
          ? containerRef.current.scrollLeft - scrollAmount
          : containerRef.current.scrollLeft + scrollAmount;

      containerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="mt-6 px-6 bg-white/40 py-6 rounded-2xl">
      <div className="max-w-400 mx-auto px-6">
                <p className="text-xs tracking-widest text-neutral-500 uppercase mb-4">
          Featured
        </p>
        {/* Tab Navigation */}
        <div className="flex justify-start items-center gap-12 mb-8">
          {(['now', 'soon'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-2xl font-semibold tracking-tight transition-all ${
                activeTab === tab
                  ? 'text-black border-b-4 border-black pb-2'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
              aria-pressed={activeTab === tab}
              aria-label={`Show ${tab === 'now' ? 'now screening' : 'coming soon'}`}
            >
              {tab === 'now' ? 'NOW SCREENING' : 'COMING SOON'}
            </button>
          ))}
        </div>

        {/* Movies Container */}
        <div className="relative min-h-96">
          <div
            ref={containerRef}
            className="flex gap-6 py-6 overflow-x-auto snap-x snap-mandatory scrollbar-hidden"
          >
            {infiniteMovies.map((movie, index) => (
              <div key={`${movie.id}-${index}`} className="shrink-0 w-80">
                <HomepageMovieCard movie={movie} />
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
