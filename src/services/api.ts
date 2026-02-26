import type { Movie, HeroCarouselItem, PromoEvent } from '@/types/api';
import { createClient } from '@/lib/supabase/client';

// Admin CRUD types
export interface MovieCreate {
  title: string;
  release_date: string;
  imdb_score?: number;
  duration_minutes: number;
  content_rating: string;
  director?: string;
  starring?: string[];
  synopsis?: string;
  poster_url: string;
  banner_url: string;
  trailer_url?: string;
  audio_languages?: string[];
  subtitle_languages?: string[];
  tag_event?: string;
  release_status: string;
  genres?: string[];
}

export interface ShowtimeCreate {
  movie_id: number;
  screen_id: number;
  start_time: string;
  base_price: number;
}

export interface Showtime {
  id: number;
  movie_id: number;
  screen_id: number;
  start_time: string;
  base_price: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface CategoryCreate {
  name: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: string;
  description?: string;
  image_url?: string;
  in_stock: boolean;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  category_id: string;
  price: number;
  description?: string;
  image_url?: string;
  in_stock: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Seat type from API
interface APISeat {
  seat_id: number;
  row_label: string;
  seat_number: number;
  status: string;
  price?: number;
}

// Helper function to make API calls with optional Supabase auth
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit & { authenticated?: boolean }
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Attach Supabase access token for authenticated requests
  if (options?.authenticated !== false) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) {
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
      } else {
        console.warn('No auth session found');
      }
    } catch (error) {
      console.error('Failed to get auth session:', error);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Movies API
export const moviesApi = {
  // Get all movies with pagination
  getMovies: (skip = 0, limit = 20, status?: string) => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    return apiCall<Movie[]>(`/api/movies?${params.toString()}`);
  },

  // Get single movie by ID
  getMovieById: (movieId: number) =>
    apiCall<Movie>(`/api/movies/${movieId}`),

  // Admin: Create movie
  createMovie: (movie: MovieCreate) =>
    apiCall<Movie>(`/api/movies`, {
      method: 'POST',
      body: JSON.stringify(movie),
    }),

  // Admin: Update movie
  updateMovie: (movieId: number, movie: Partial<MovieCreate>) =>
    apiCall<Movie>(`/api/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movie),
    }),

  // Admin: Delete movie
  deleteMovie: (movieId: number) =>
    apiCall(`/api/movies/${movieId}`, { method: 'DELETE' }),
};

// Showtimes API
export const showtimesApi = {
  // Get showtimes for a specific movie
  getShowtimesByMovie: (movieId: number) =>
    apiCall<Showtime[]>(`/api/showtimes/movie/${movieId}`),

  // Get seats for a showtime
  getSeats: (showtimeId: number) =>
    apiCall<APISeat[]>(`/api/showtimes/${showtimeId}/seats`),

  // Get showtime details
  getShowtime: (showtimeId: number) =>
    apiCall<Showtime>(`/api/showtimes/${showtimeId}`),

  // Admin: Create showtime
  createShowtime: (showtime: ShowtimeCreate) =>
    apiCall<Showtime>(`/api/showtimes`, {
      method: 'POST',
      body: JSON.stringify(showtime),
    }),

  // Admin: Update showtime
  updateShowtime: (showtimeId: number, showtime: Partial<ShowtimeCreate>) =>
    apiCall<Showtime>(`/api/showtimes/${showtimeId}`, {
      method: 'PUT',
      body: JSON.stringify(showtime),
    }),

  // Admin: Delete showtime
  deleteShowtime: (showtimeId: number) =>
    apiCall(`/api/showtimes/${showtimeId}`, { method: 'DELETE' }),
};

// Public API (Hero carousel, promo events)
export const publicApi = {
  // Get hero carousel slides
  getHeroCarousel: () =>
    apiCall<HeroCarouselItem[]>(`/api/hero-carousel`),

  // Get promo events
  getPromoEvents: () =>
    apiCall<PromoEvent[]>(`/api/promo-events`),

  // Admin: Hero carousel CRUD
  createHeroSlide: (data: object) =>
    apiCall<HeroCarouselItem>(`/api/hero-carousel`, { method: 'POST', body: JSON.stringify(data) }),
  updateHeroSlide: (id: string, data: object) =>
    apiCall<HeroCarouselItem>(`/api/hero-carousel/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHeroSlide: (id: string) =>
    apiCall(`/api/hero-carousel/${id}`, { method: 'DELETE' }),

  // Admin: Promo events CRUD
  createPromoEvent: (data: object) =>
    apiCall<PromoEvent>(`/api/promo-events`, { method: 'POST', body: JSON.stringify(data) }),
  updatePromoEvent: (id: string, data: object) =>
    apiCall<PromoEvent>(`/api/promo-events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePromoEvent: (id: string) =>
    apiCall(`/api/promo-events/${id}`, { method: 'DELETE' }),
};

// Products & Categories Admin API
export const productsApi = {
  getProducts: (skip = 0, limit = 50) =>
    apiCall<Product[]>(`/api/products/?skip=${skip}&limit=${limit}&in_stock=true`),

  createProduct: (product: ProductCreate) =>
    apiCall<Product>(`/api/products/`, {
      method: 'POST',
      body: JSON.stringify(product),
      authenticated: true,
    }),

  updateProduct: (productId: string, product: Partial<ProductCreate>) =>
    apiCall<Product>(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      authenticated: true,
    }),

  deleteProduct: (productId: string) =>
    apiCall(`/api/products/${productId}`, { method: 'DELETE', authenticated: true }),

  getCategories: () =>
    apiCall<Category[]>(`/api/products/categories`),

  createCategory: (category: CategoryCreate) =>
    apiCall<Category>(`/api/products/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
      authenticated: true,
    }),

  updateCategory: (categoryId: string, category: Partial<CategoryCreate>) =>
    apiCall<Category>(`/api/products/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(category),
      authenticated: true,
    }),

  deleteCategory: (categoryId: string) =>
    apiCall(`/api/products/categories/${categoryId}`, { method: 'DELETE', authenticated: true }),
};

// Bookings API - Two-step booking flow
interface ReserveSeatRequest {
  user_id: string;
  showtime_id: number;
  seat_ids: number[];
  price_per_seat: number;
}

interface ReserveSeatResponse {
  success: boolean;
  booking_id?: number;
  payment_deadline?: string;
  total_amount?: number;
  error?: string;
  unavailable_seats?: number[];
}

interface ConfirmPaymentRequest {
  booking_id: number;
  payment_intent_id?: string;
}

interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  booking_id?: number;
  tickets?: { ticket_id: number; seat_id: number; row_label: string; seat_number: number }[];
}

// Booking detail response from API
export interface BookingDetailResponse {
  booking_id: number;
  user_id: string;
  booking_status: string;
  total_amount: number;
  payment_deadline: string;
  created_at: string;
  showtime_id: number;
  screen_name: string;
  seats: string[];
  movie_id?: number;
  movie_title?: string;
  poster_url?: string;
  showtime_start?: string;
  showtime_end?: string;
}

export const bookingsApi = {
  // Step 1: Reserve seats (starts 5-minute countdown)
  reserveSeats: (data: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    apiCall<ReserveSeatResponse>(`/api/bookings/reserve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Step 2: Confirm payment (finalizes booking) — kept for direct/legacy use
  confirmPayment: (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> =>
    apiCall<ConfirmPaymentResponse>(`/api/bookings/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cancel a pending booking (POST variant)
  cancelBooking: (bookingId: number) =>
    apiCall(`/api/bookings/cancel`, {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    }),

  // Cancel / delete a booking (DELETE variant per spec §5.6)
  deleteBooking: (bookingId: number) =>
    apiCall(`/api/bookings/${bookingId}`, { method: 'DELETE' }),

  // Get booking details by ID
  getBooking: (bookingId: number): Promise<BookingDetailResponse> =>
    apiCall<BookingDetailResponse>(`/api/bookings/${bookingId}`),

  // Get user's bookings (uses auth token)
  getUserBookings: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    // Use /me endpoint which extracts user from auth token
    return apiCall(`/api/bookings/me${params}`, { authenticated: true });
  },

  // Get user's bookings by user ID (fallback)
  getUserBookingsById: (userId: string, status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/api/bookings/user/${userId}/bookings${params}`);
  },
};

// Mock Payment API (§5.7)
interface PaymentInitiateRequest {
  booking_id: number;
  payment_method: 'mock_card' | 'mock_qr' | 'mock_cash';
  mock_should_succeed?: boolean;
}

export interface PaymentInitiateResponse {
  payment_id: string;
  status: string;
  amount: number;
  payment_method: string;
}

export interface PaymentConfirmResponse {
  payment_id: string;
  status: string;
  booking_id: number;
  booking_status?: string;
  points_earned?: number;
  message?: string;
}

export interface PaymentStatusResponse {
  payment_id: string;
  booking_id: number;
  status: string;
  amount: number;
  payment_method: string;
  paid_at?: string;
}

export const paymentsApi = {
  // Initiate a mock payment for a booking
  initiate: (data: PaymentInitiateRequest): Promise<PaymentInitiateResponse> =>
    apiCall<PaymentInitiateResponse>(`/api/payments/initiate`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Confirm (or decline) a mock payment
  confirm: (paymentId: string, mockResult = true): Promise<PaymentConfirmResponse> =>
    apiCall<PaymentConfirmResponse>(`/api/payments/${paymentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ mock_result: mockResult }),
    }),

  // Get current status of a mock payment
  getPayment: (paymentId: string): Promise<PaymentStatusResponse> =>
    apiCall<PaymentStatusResponse>(`/api/payments/${paymentId}`),
};

// user API
export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  user_name?: string | null;
  phone?: string | null;
  loyalty_points: number;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  user_name?: string;
  phone?: string;
}

export const usersApi = {
  // Get current user profile
  getCurrentUser: (): Promise<UserProfile> =>
    apiCall<UserProfile>(`/api/users/me`),

  // Get user by ID (alias for consistency)
  getProfile: (userId: string): Promise<UserProfile> =>
    apiCall<UserProfile>(`/api/users/${userId}`),

  // Update user (alias for consistency)
  updateProfile: (userId: string, data: ProfileUpdateData): Promise<UserProfile> =>
    apiCall<UserProfile>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Get all users (admin only)
  getAllUsers: (skip = 0, limit = 20): Promise<UserProfile[]> =>
    apiCall<UserProfile[]>(`/api/users?skip=${skip}&limit=${limit}`),

  // Delete/deactivate user
  deleteUser: (userId: string): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/api/users/${userId}`, {
      method: 'DELETE',
    }),
};

// Keep profilesApi as an alias for backward compatibility
export const profilesApi = usersApi;

export interface Review {
  id: number
  movie_id: number
  booking_id: number
  user_id: string
  username: string
  review_text: string
  rating: number
  like_count: number
  created_at: string
  updated_at: string
}

export interface PaginatedReviews {
  total: number
  items: Review[]
}

export interface ReviewCreate {
  movie_id: number
  booking_id?: number
  review_text: string
  rating: number
}

export const reviewsApi = {
  getReviewsByMovie: (movieId: number, skip = 0, limit = 20): Promise<PaginatedReviews> =>
    apiCall<PaginatedReviews>(`/api/reviews/movie/${movieId}?skip=${skip}&limit=${limit}`, {
      authenticated: false,
    }),

  createReview: (data: ReviewCreate): Promise<Review> =>
    apiCall<Review>(`/api/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  updateReview: (reviewId: number, data: { review_text?: string; rating?: number }): Promise<Review> =>
    apiCall<Review>(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  deleteReview: (reviewId: number): Promise<void> =>
    apiCall<void>(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      authenticated: true,
    }),

  likeReview: (reviewId: number): Promise<Review> =>
    apiCall<Review>(`/api/reviews/${reviewId}/like`, {
      method: 'POST',
      authenticated: true,
    }),
}
