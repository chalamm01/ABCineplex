import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types/api";

interface HeroCarouselProps {
  readonly slides: readonly HeroSlide[];
  onSlideClick?: (id: string) => void;
}

export function HeroCarousel({ slides, onSlideClick }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const movies = slides || [];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  const ACTIVE_PCT = 60;
  const inactivePct = movies.length > 1 ? (100 - ACTIVE_PCT) / (movies.length - 1) : 100;

  return (
    <div className="relative h-100 overflow-hidden bg-neutral-900 group rounded-2xl">
      <div className="flex h-full">
        {movies.map((movie, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={movie.id}
              className="relative shrink-0 cursor-pointer transition-all duration-500 ease-in-out overflow-hidden"
              style={{ width: isActive ? `${ACTIVE_PCT}%` : `${inactivePct}%` }}
              onClick={() => { setCurrentIndex(index); onSlideClick?.(movie.id); }}
            >
              <img
                src={movie.image_url}
                alt={movie.title ?? ''}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 transition-colors duration-500 bg-gradient-to-t ${
                isActive ? 'from-black/70 via-black/10 to-transparent' : 'from-black/60 via-black/30 to-black/20'
              }`} />
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-light tracking-wide drop-shadow">
                    {movie.title}
                  </h2>
                  {movie.description && (
                    <p className="text-sm text-white/80 mt-1 line-clamp-2">{movie.description}</p>
                  )}
                  {movie.cta_text && movie.cta_link && (
                    <a
                      href={movie.cta_link}
                      onClick={e => e.stopPropagation()}
                      className="inline-block mt-3 px-4 py-1.5 bg-white text-neutral-900 text-sm font-medium rounded-full hover:bg-white/90 transition-colors"
                    >
                      {movie.cta_text}
                    </a>
                  )}
                </div>
              )}
              {!isActive && (
                <div className="absolute inset-0 flex items-end justify-center pb-4 px-1">
                  <p className="text-white/70 text-xs font-medium text-center leading-tight line-clamp-2 [writing-mode:vertical-lr] rotate-180">
                    {movie.title}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-neutral-900" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-neutral-900" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-pressed={index === currentIndex}
          />
        ))}
      </div>
    </div>
  );
}
