import { useState, useEffect } from 'react';
import { HeroCarousel } from '@/components/homepage/hero-carousel';
import { MoviesSection } from '@/components/homepage/movies-section';
import { PromotionalSection } from '@/components/homepage/promotional-section';
import { moviesApi, publicApi } from '@/services/api';
import type { HeroSlide, Movie } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

interface PromotionalEvent {
  id: string;
  image: string;
  title: string;
  category: 'news' | 'promo';
}

// Home.tsx (Main Page)
export default function Home() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [nowScreeningData, setNowScreeningData] = useState<Movie[]>([]);
  const [upcomingData, setUpcomingData] = useState<Movie[]>([]);
  const [promotions, setPromotions] = useState<PromotionalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const page = 1;
        const limit = 10;
        const [heroData, nowScreeningRes, upcomingRes, promoData] = await Promise.all([
          publicApi.getHeroCarousel(),
          moviesApi.getMoviesPublic(page, limit, 'now_showing'),
          moviesApi.getMoviesPublic(page, limit, 'upcoming'),
          publicApi.getPromoEvents(),
        ]);

        const activeSlides = heroData
          .filter((item: HeroSlide) => item.is_active)
          .sort((a: HeroSlide, b: HeroSlide) => (a.display_order ?? 0) - (b.display_order ?? 0));

        setSlides(activeSlides);
        // Correctly accessing the .movies array from your API response
        setNowScreeningData(nowScreeningRes.movies || []);
        setUpcomingData(upcomingRes.movies || []);

        const activePromotions = promoData
          .filter((item: any) => item.is_active)
          .map((item: any) => ({
            id: item.id,
            image: item.image_url ?? '',
            title: item.title ?? '',
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
      <div className="min-h-screen px-4 md:px-32 bg-white/70 backdrop-blur-md py-12">
        <div className="flex justify-center items-center">
          {loading && <Spinner />}
          {error && <p className="text-lg text-red-500">{error}</p>}
        </div>

        {!loading && !error && (
          <main className="space-y-12">
            <HeroCarousel slides={slides} />

            {/* FIXED PROPS: Changed comingSoon to upcoming to match MoviesSectionProps */}
            <MoviesSection
              nowScreening={nowScreeningData}
              upcoming={upcomingData}
            />

            <PromotionalSection events={promotions} />
          </main>
        )}
      </div>
    </div>
  );
}