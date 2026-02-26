import { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/homepage/hero-carousel';
import { MoviesSection } from '@/components/homepage/movies-section';
import { PromotionalSection } from '@/components/homepage/promotional-section';
import { moviesApi, publicApi } from '@/services/api';
import { transformCarouselItem } from '@/types/api';
import type { HeroSlide, Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

interface PromotionalEvent {
  id: number;
  image: string;
  title: string;
  category: 'news' | 'promo';
}

export default function Home() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [nowScreeningData, setNowScreeningData] = useState<Movie[]>([]);
  const [comingSoonData, setComingSoonData] = useState<Movie[]>([]);
  const [promotions, setPromotions] = useState<PromotionalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [heroData, nowScreeningRes, comingSoonRes, promoData] = await Promise.all([
          publicApi.getHeroCarousel(),
          moviesApi.getMovies({ status: 'now_showing', page: 1, limit: 10 }),
          moviesApi.getMovies({ status: 'upcoming', page: 1, limit: 10 }),
          publicApi.getPromoEvents(),
        ]);

        const transformedSlides = heroData
          .filter((item) => item.is_active)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(transformCarouselItem);

        setSlides(transformedSlides);
        setNowScreeningData(nowScreeningRes.movies);
        setComingSoonData(comingSoonRes.movies);

        const activePromotions = promoData
          .filter((item) => item.is_active)
          .map((item) => ({
            id: item.id,
            image: item.image_url ?? '',
            title: item.title ?? '',
            category: item.promo_type === 'news' ? ('news' as const) : ('promo' as const),
          }));
        setPromotions(activePromotions);
      } catch (err) {
        console.error("Failed to load homepage data", err);
        setError('Failed to load data. Please ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 bg-white/70 backdrop-blur-md py-12">
      <div className="flex justify-center items-center">
      {loading && (
          <Spinner/>
      )}
      {error && (
          <p className="text-lg text-red-500">{error}</p>
      )}
      </div>
      {!loading && !error && (
        <main>
          <HeroCarousel slides={slides} />

          <MoviesSection
            nowScreening={nowScreeningData}
            comingSoon={comingSoonData}
          />

          <PromotionalSection events={promotions} />
        </main>
      )}
      </div>
    </div>
  );
}
