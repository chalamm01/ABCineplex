import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/services/api';
import type { UserProfile } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import MoviesSection from '@/components/admin/MoviesSection';
import ShowtimesSection from '@/components/admin/ShowtimesSection';
import TheatresSection from '@/components/admin/TheatresSection';
import CategoriesSection from '@/components/admin/CategoriesSection';
import ProductsSection from '@/components/admin/ProductsSection';
import HeroCarouselSection from '@/components/admin/HeroCarouselSection';
import PromoEventsSection from '@/components/admin/PromoEventsSection';
import UsersSection from '@/components/admin/UsersSection';
import BookingsSection from '@/components/admin/BookingsSection';

type Tab = 'movies' | 'showtimes' | 'theatres' | 'categories' | 'products' | 'hero' | 'promos' | 'users' | 'bookings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'movies',     label: 'Movies' },
  { id: 'showtimes',  label: 'Showtimes' },
  { id: 'theatres',   label: 'Theatres' },
  { id: 'categories', label: 'Categories' },
  { id: 'products',   label: 'Products' },
  { id: 'hero',       label: 'Hero Carousel' },
  { id: 'promos',     label: 'Promo Events' },
  { id: 'users',      label: 'Users' },
  { id: 'bookings',   label: 'Bookings' },
];

export default function Admin() {
  const [tab, setTab] = useState<Tab>('movies');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const isAuthenticated = !!localStorage.getItem('token');
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const profile = await userApi.getProfile();
        setUser(profile);
        if (!profile.is_admin) {
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[url('/assets/background/bg.png')] bg-cover bg-center">
        <div className="flex items-center justify-center h-full w-full bg-white/70 backdrop-blur-md">
          <Spinner className="text-neutral-400 w-10 h-10" />
        </div>
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen bg-white/70 backdrop-blur-md px-4 py-8">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Admin Panel</h1>
          <p className="text-neutral-500 text-sm mb-6">Logged in as {user.email}</p>

          {/* Tab bar */}
          <div className="flex gap-1 bg-white/60 border border-neutral-200 p-1 rounded-xl mb-6 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div className="bg-white/80 rounded-xl p-6 border border-neutral-200 shadow-sm">
            {tab === 'movies'     && <MoviesSection />}
            {tab === 'showtimes'  && <ShowtimesSection />}
            {tab === 'theatres'   && <TheatresSection />}
            {tab === 'categories' && <CategoriesSection />}
            {tab === 'products'   && <ProductsSection />}
            {tab === 'hero'       && <HeroCarouselSection />}
            {tab === 'promos'     && <PromoEventsSection />}
            {tab === 'users'      && <UsersSection />}
            {tab === 'bookings'   && <BookingsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
