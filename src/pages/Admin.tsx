import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/services/api';
import type { UserProfile } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';
import MoviesSection from '@/components/admin/MoviesSection';
import ShowtimesSection from '@/components/admin/ShowtimesSection';
import CategoriesSection from '@/components/admin/CategoriesSection';
import ProductsSection from '@/components/admin/ProductsSection';
import HeroCarouselSection from '@/components/admin/HeroCarouselSection';
import PromoEventsSection from '@/components/admin/PromoEventsSection';
import UsersSection from '@/components/admin/UsersSection';

type Tab = 'movies' | 'showtimes' | 'categories' | 'products' | 'hero' | 'promos' | 'users';

const TABS: { id: Tab; label: string }[] = [
  { id: 'movies',     label: 'Movies' },
  { id: 'showtimes',  label: 'Showtimes' },
  { id: 'categories', label: 'Categories' },
  { id: 'products',   label: 'Products' },
  { id: 'hero',       label: 'Hero Carousel' },
  { id: 'promos',     label: 'Promo Events' },
  { id: 'users',      label: 'Users' },
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
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <Spinner className="text-zinc-400 w-10 h-10" />
      </div>
    );
  }

  if (!user?.is_admin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
        <p className="text-zinc-400 text-sm mb-6">Logged in as {user.email}</p>

        {/* Tab bar */}
        <div className="flex gap-1 bg-zinc-900 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-red-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          {tab === 'movies'     && <MoviesSection />}
          {tab === 'showtimes'  && <ShowtimesSection />}
          {tab === 'categories' && <CategoriesSection />}
          {tab === 'products'   && <ProductsSection />}
          {tab === 'hero'       && <HeroCarouselSection />}
          {tab === 'promos'     && <PromoEventsSection />}
          {tab === 'users'      && <UsersSection />}
        </div>
      </div>
    </div>
  );
}
