import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/services/api';
import type { HeroCarouselItem, PromoEvent } from '@/types/api';

function Home() {
  const [slides, setSlides] = useState<HeroCarouselItem[]>([]);
  const [promos, setPromos] = useState<PromoEvent[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    publicApi.getHeroCarousel()
      .then((data) => setSlides(data.filter((s) => s.is_active).sort((a, b) => a.display_order - b.display_order)))
      .catch(() => {});
    publicApi.getPromoEvents()
      .then((data) => setPromos(data.filter((p) => p.is_active)))
      .catch(() => {});
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Carousel */}
      {slides.length > 0 && (
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '21/7' }}>
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <img
                src={slide.banner_url}
                alt={slide.title ?? ''}
                className="w-full h-full object-cover"
              />
              {slide.title && (
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
                  <h2 className="text-white text-3xl font-bold">{slide.title}</h2>
                  {slide.target_url && (
                    <a
                      href={slide.target_url}
                      className="inline-block mt-2 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}

          {slides.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl"
              >
                ›
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick nav */}
      <div className="flex justify-center gap-6 py-8 bg-white shadow-sm">
        <Link
          to="/movies"
          className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <img src="/public/assets/icons/movies_icon.svg" alt="" className="h-8 opacity-70 group-hover:opacity-100" />
          <span className="font-semibold text-sm text-gray-600 group-hover:text-black">Movies</span>
        </Link>
        <Link
          to="/snacks"
          className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <img src="/public/assets/icons/snacks_icon.svg" alt="" className="h-8 opacity-70 group-hover:opacity-100" />
          <span className="font-semibold text-sm text-gray-600 group-hover:text-black">Snacks</span>
        </Link>
      </div>

      {/* Promo Events */}
      {promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Promotions &amp; Events</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {promos.map((promo) => (
              <div key={promo.id} className="rounded-xl overflow-hidden shadow-md bg-white group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={promo.image_url}
                    alt={promo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <span className="text-xs text-red-600 font-semibold uppercase tracking-wide">{promo.promo_type}</span>
                  <p className="font-semibold text-gray-800 mt-1 line-clamp-2">{promo.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
