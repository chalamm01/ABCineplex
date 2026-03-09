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
import OrdersSection from '@/components/admin/OrdersSection';
import { ReviewsSection } from '@/components/admin/ReviewsSection';
import { PointTransactionsSection } from '@/components/admin/PointTransactionsSection';
import DashboardSection from '@/components/admin/DashboardSection';

type Tab = 'dashboard' | 'movies' | 'showtimes' | 'theatres' | 'categories' | 'products' | 'hero' | 'promos' | 'users' | 'bookings' | 'orders' | 'reviews' | 'point-transactions';

const NAV_GROUPS: { label: string; tabs: { id: Tab; label: string }[] }[] = [
  {
    label: 'Overview',
    tabs: [
      { id: 'dashboard', label: 'Dashboard' },
    ],
  },
  {
    label: 'Content',
    tabs: [
      { id: 'movies',     label: 'Movies' },
      { id: 'showtimes',  label: 'Showtimes' },
      { id: 'theatres',   label: 'Theatres' },
      { id: 'hero',       label: 'Hero Carousel' },
      { id: 'promos',     label: 'Promo Events' },
    ],
  },
  {
    label: 'Concessions',
    tabs: [
      { id: 'categories', label: 'Categories' },
      { id: 'products',   label: 'Products' },
      { id: 'orders',     label: 'Snack Orders' },
    ],
  },
  {
    label: 'Customers',
    tabs: [
      { id: 'users',              label: 'Users' },
      { id: 'bookings',           label: 'Bookings' },
      { id: 'reviews',            label: 'Reviews' },
      { id: 'point-transactions', label: 'Points' },
    ],
  },
];

export default function Admin() {
  const [tab, setTab] = useState<Tab>('dashboard');
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

  const activeLabel = NAV_GROUPS.flatMap(g => g.tabs).find(t => t.id === tab)?.label ?? '';

  return (
    <div className="min-h-screen flex bg-neutral-100">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-neutral-200 flex flex-col min-h-screen">
        {/* Logo / Brand */}
        <div className="px-5 py-5 border-b border-neutral-100">
          <span className="text-base font-bold tracking-tight text-neutral-900">ABCineplex</span>
          <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Admin</span>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tab === t.id
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100">
          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-white border-b border-neutral-200 flex items-center px-6">
          <h1 className="text-sm font-semibold text-neutral-900">{activeLabel}</h1>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
            {tab === 'dashboard'          && <DashboardSection />}
            {tab === 'movies'             && <MoviesSection />}
            {tab === 'showtimes'          && <ShowtimesSection />}
            {tab === 'theatres'           && <TheatresSection />}
            {tab === 'categories'         && <CategoriesSection />}
            {tab === 'products'           && <ProductsSection />}
            {tab === 'hero'               && <HeroCarouselSection />}
            {tab === 'promos'             && <PromoEventsSection />}
            {tab === 'users'              && <UsersSection />}
            {tab === 'bookings'           && <BookingsSection />}
            {tab === 'orders'             && <OrdersSection />}
            {tab === 'reviews'            && <ReviewsSection />}
            {tab === 'point-transactions' && <PointTransactionsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
