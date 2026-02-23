import { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/homepage/hero-carousel';
import { MoviesSection } from '@/components/homepage/movies-section';
import { PromotionalSection } from '@/components/homepage/promotional-section';
import { moviesApi, publicApi } from '@/services/api';
import { transformCarouselItem } from '@/types/api';
import type { HeroCarouselItem, Movie } from '@/types/api';

export default function Home() {
  const [slides, setSlides] = useState<any[]>([]);
  const [nowScreeningData, setNowScreeningData] = useState<Movie[]>([]);
  const [comingSoonData, setComingSoonData] = useState<Movie[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [heroData, nowScreening, comingSoon, promoData] = await Promise.all([
          publicApi.getHeroCarousel(),
          moviesApi.getMovies(0, 10, 'now_showing'),
          moviesApi.getMovies(0, 10, 'coming_soon'),
          publicApi.getPromoEvents(),
        ]);

        const transformedSlides = (heroData as HeroCarouselItem[])
          .filter((item) => item.is_active)
          .sort((a, b) => a.display_order - b.display_order)
          .map(transformCarouselItem);

        setSlides(transformedSlides);
        setNowScreeningData(nowScreening);
        setComingSoonData(comingSoon);

        const activePromotions = promoData
          .filter((item: any) => item.is_active)
          .map((item: any) => ({
            id: item.id,
            image: item.image_url,
            title: item.title,
            category: item.promo_type === 'news' ? 'news' : 'promo',
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
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
      {loading && (
        <div className="flex justify-center items-center py-20">
          <p className="text-lg text-white">Loading...</p>
        </div>
      )}

      {error && (
        <div className="flex justify-center items-center py-20">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      )}

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
