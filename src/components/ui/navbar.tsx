import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home,
  Film,
  Popcorn,
  Users,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Ticket,
} from 'lucide-react';
import { authApi } from '@/services/api';
import type { UserProfile } from '@/types/api';

interface HeaderProps {
  readonly activeNav?: string;
}

export function Header({ activeNav = 'home' }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const navItems = [
    { id: 'homepage', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'snacks', label: 'Snacks', icon: Popcorn },
    { id: 'community', label: 'Community', icon: Users },
  ];

  // Logic to sync auth state across the app without refresh
  const syncAuth = () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user:', err);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    syncAuth();
    // Listen for local changes and custom events from AuthCallback
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

  const getDisplayName = () => {
    if (user?.user_name) return user.user_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    try { await authApi.logout(); } catch (err) { console.error(err); }
    finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      syncAuth();
      setIsDropdownOpen(false);
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tighter no-underline text-black">
            CINEPLEX
          </Link>

          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className={`flex items-center gap-2 no-underline transition-colors ${
                    activeNav === item.id ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="relative justify-end" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-neutral-50 transition-all group"
            >
              {isAuthenticated && user && (
                <div className="hidden md:flex flex-col items-end mr-1">
                  <span className="text-sm font-bold text-black leading-none">{getDisplayName()}</span>
                  <span className="text-[11px] text-neutral-400 leading-tight mt-1">{user.email}</span>
                </div>
              )}

              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isAuthenticated ? 'bg-black text-white shadow-md' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {isAuthenticated ? <span className="text-xs font-bold">{getInitials()}</span> : <User className="w-5 h-5" />}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {isAuthenticated ? (
                  <>
                    <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 border-b border-neutral-100 text-neutral-700">
                      <User className="w-4 h-4" /> <span className="text-sm font-medium">My Profile</span>
                    </button>
                    <button onClick={() => { navigate('/bookings'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 border-b border-neutral-100 text-neutral-700">
                      <Ticket className="w-4 h-4" /> <span className="text-sm font-medium">My Bookings</span>
                    </button>
                    <button onClick={handleSignOut} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors">
                      <LogOut className="w-4 h-4" /> <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { navigate('/login'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 border-b border-neutral-100 text-neutral-700">
                      <LogIn className="w-4 h-4" /> <span className="text-sm font-medium">Sign In</span>
                    </button>
                    <button onClick={() => { navigate('/register'); setIsDropdownOpen(false); }} className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 text-neutral-700">
                      <UserPlus className="w-4 h-4" /> <span className="text-sm font-medium">Register</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}