import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Film,
  Popcorn,
  Users,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Ticket,
  Star,
  ShoppingBag,
  Menu,
  X,
} from 'lucide-react';
import { authApi } from '@/services/api';
import type { UserProfile } from '@/types/api';

export function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { path: '/',          label: 'Home',      icon: null },
    { path: '/movies',    label: 'Movies',    icon: Film },
    { path: '/snacks',    label: 'Snacks',    icon: Popcorn },
    { path: '/community', label: 'Community', icon: Users },
  ];

  const syncAuth = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { setUser(null); }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth-change', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth-change', syncAuth);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  const getDisplayName = () => {
    if (user?.user_name) return user.user_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => getDisplayName().slice(0, 2).toUpperCase();

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' || pathname === '/homepage' : pathname.startsWith(path);

  const handleSignOut = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      syncAuth();
      setIsDropdownOpen(false);
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-0.5 no-underline select-none">
            <span className="text-lg font-black tracking-tighter text-red-600">ABC</span>
            <span className="text-lg font-black tracking-tighter text-neutral-900">INEPLEX</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors ${
                    active ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isAuthenticated ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {isAuthenticated ? getInitials() : <User className="w-4 h-4" />}
                </div>
                {isAuthenticated && user && (
                  <div className="hidden md:block text-left leading-none">
                    <p className="text-xs font-semibold text-neutral-900">{getDisplayName()}</p>
                    {(user.reward_points ?? 0) > 0 && (
                      <p className="text-[10px] text-amber-600 font-medium mt-0.5">{user.reward_points} pts</p>
                    )}
                  </div>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden">
                  {isAuthenticated ? (
                    <>
                      {user && (
                        <div className="px-4 py-3 border-b border-neutral-100">
                          <p className="text-xs font-semibold text-neutral-900 truncate">{getDisplayName()}</p>
                          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                          {(user.reward_points ?? 0) > 0 && (
                            <p className="text-[11px] text-amber-600 font-medium mt-1">{user.reward_points} loyalty pts</p>
                          )}
                        </div>
                      )}
                      {[
                        { icon: User,        label: 'My Profile',  path: '/profile' },
                        { icon: Ticket,      label: 'My Bookings', path: '/bookings' },
                        { icon: Star,        label: 'My Reviews',  path: '/reviews' },
                        { icon: ShoppingBag, label: 'My Orders',   path: '/orders' },
                      ].map(({ icon: Icon, label, path }) => (
                        <button
                          key={path}
                          onClick={() => { navigate(path); setIsDropdownOpen(false); }}
                          className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 text-sm"
                        >
                          <Icon className="w-4 h-4 text-neutral-400" />
                          {label}
                        </button>
                      ))}
                      <div className="border-t border-neutral-100">
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { navigate('/login'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 text-sm border-b border-neutral-100">
                        <LogIn className="w-4 h-4 text-neutral-400" /> Sign In
                      </button>
                      <button onClick={() => { navigate('/register'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 text-neutral-700 text-sm">
                        <UserPlus className="w-4 h-4 text-neutral-400" /> Register
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium no-underline transition-colors ${
                  active ? 'text-neutral-900 bg-neutral-50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            );
          })}
          {isAuthenticated ? (
            <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{getDisplayName()}</p>
                {(user?.reward_points ?? 0) > 0 && (
                  <p className="text-xs text-amber-600">{user?.reward_points} pts</p>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-500 font-medium flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          ) : (
            <div className="border-t border-neutral-100 px-5 py-3 flex gap-3">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-neutral-700">Sign In</button>
              <button onClick={() => navigate('/register')} className="text-sm font-semibold text-white bg-neutral-900 px-4 py-1.5 rounded-full">Register</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
