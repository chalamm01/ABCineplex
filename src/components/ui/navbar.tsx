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
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  readonly activeNav?: string;
}

export function Header({ activeNav = 'home' }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const navItems = [
    { id: 'homepage', label: 'Home', icon: Home },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'snacks', label: 'Snacks', icon: Popcorn },
    { id: 'community', label: 'Community', icon: Users },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const handleProfile = () => {
    setIsDropdownOpen(false);
    navigate('/profile');
  }

  const handleMyBookings = () => {
    setIsDropdownOpen(false);
    navigate('/bookings');
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.user_name) {
      return user.user_name.slice(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
      <div className="max-w-350 mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
          </div>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className={`flex items-center gap-2 transition-colors no-underline ${
                    isActive
                      ? 'text-black'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm tracking-wide font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isAuthenticated
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              {isAuthenticated ? (
                <span className="text-xs font-bold">{getInitials()}</span>
              ) : (
                <User className="w-5 h-5 text-neutral-600" />
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                {isAuthenticated ? (
                  <>
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-black truncate">
                        {user?.full_name || user?.user_name || 'User'}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                    </div>
                    {/* Profile */}
                    <button 
                      onClick={handleProfile}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-black border-b border-neutral-100"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">My Profile</span>
                    </button>



                    {/* My Bookings */}
                    <button
                      onClick={handleMyBookings}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-black border-b border-neutral-100"
                    >
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm font-medium">My Bookings</span>
                    </button>
                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  // Logged Out State - Sign In and Register
                  <>
                    <button
                      onClick={handleSignIn}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-black border-b border-neutral-100"
                    >
                      <LogIn className="w-4 h-4" />
                      <span className="text-sm font-medium">Sign In</span>
                    </button>
                    <button
                      onClick={handleRegister}
                      className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-neutral-50 transition-colors text-neutral-700 hover:text-black"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-sm font-medium">Register</span>
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
