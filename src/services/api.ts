import type { Movie, MoviesListResponse, MovieDetail, MovieShowtimesResponse, HeroCarouselItem, PromoEvent } from '@/types/api';
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
export interface APISeat {
  seat_id: number;
  row_label: string;
  seat_number: number;
  status: string;
  price?: number;
}

export interface HoldResult {
  hold_id: string;
  seat_ids: number[];
  expires_at: string;
  expires_in_seconds: number;
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
  // Get all movies with pagination and filters (API spec 5.3)
  getMovies: ({ status = 'now_showing', page = 1, limit = 20 }: { status?: string; page?: number; limit?: number } = {}): Promise<MoviesListResponse> => {
    const params = new URLSearchParams();
    params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return apiCall<MoviesListResponse>(`/api/v1/movies?${params.toString()}`);
  },

  // Get single movie by ID
  getMovieById: (movieId: number): Promise<MovieDetail> =>
    apiCall<MovieDetail>(`/api/v1/movies/${movieId}`),

  getShowtimesByMovie: (movieId: number, date?: string, days = 7): Promise<MovieShowtimesResponse> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    params.append('days', days.toString());
    return apiCall<MovieShowtimesResponse>(`/api/v1/movies/${movieId}/showtimes?${params.toString()}`);
  },

  // Admin: Create movie
  createMovie: (movie: MovieCreate): Promise<Movie> =>
    apiCall<Movie>(`/api/v1/movies`, {
      method: 'POST',
      body: JSON.stringify(movie),
    }),

  // Admin: Update movie
  updateMovie: (movieId: number, movie: Partial<MovieCreate>): Promise<Movie> =>
    apiCall<Movie>(`/api/v1/movies/${movieId}`, {
      method: 'PATCH',
      body: JSON.stringify(movie),
    }),

  // Admin: Delete movie
  deleteMovie: (movieId: number): Promise<{ message: string }> =>
    apiCall<{ message: string }>(`/api/v1/movies/${movieId}`, { method: 'DELETE' }),
};

// Showtimes API
export const showtimesApi = {
  // Get showtime details (API spec 5.4)
  getShowtime: (showtimeId: number) =>
    apiCall(`/api/v1/showtimes/${showtimeId}`),

  // Get seat map for a showtime (API spec 5.4)
  getSeats: (showtimeId: number): Promise<APISeat[]> =>
    apiCall<APISeat[]>(`/api/v1/showtimes/${showtimeId}/seats`),

  // Hold seats for a showtime (API spec 5.5)
  holdSeats: (showtimeId: number, seat_ids: number[]): Promise<HoldResult> =>
    apiCall<HoldResult>(`/api/v1/showtimes/${showtimeId}/seats/hold`, {
      method: 'POST',
      body: JSON.stringify({ seat_ids }),
      authenticated: true,
    }),

  // Release seat hold (API spec 5.5)
  releaseHold: (showtimeId: number, hold_id: string) =>
    apiCall(`/api/v1/showtimes/${showtimeId}/seats/hold`, {
      method: 'DELETE',
      body: JSON.stringify({ hold_id }),
      authenticated: true,
    }),

  // Check hold status (API spec 5.5)
  getHoldStatus: (showtimeId: number, hold_id: string) =>
    apiCall(`/api/v1/showtimes/${showtimeId}/seats/hold/status?hold_id=${hold_id}`, {
      authenticated: true,
    }),

  // Admin: Create showtime
  createShowtime: (showtime: ShowtimeCreate) =>
    apiCall(`/api/v1/admin/showtimes`, {
      method: 'POST',
      body: JSON.stringify(showtime),
    }),

  // Admin: Update showtime
  updateShowtime: (showtimeId: number, showtime: Partial<ShowtimeCreate>) =>
    apiCall(`/api/v1/admin/showtimes/${showtimeId}`, {
      method: 'PATCH',
      body: JSON.stringify(showtime),
    }),

  // Admin: Delete showtime
  deleteShowtime: (showtimeId: number) =>
    apiCall(`/api/v1/admin/showtimes/${showtimeId}`, { method: 'DELETE' }),
};

// Public API (Hero carousel, promo events)
export const publicApi = {
  // Get hero carousel slides
  getHeroCarousel: () =>
    apiCall<HeroCarouselItem[]>(`/api/v1/hero-carousel`),

  // Get promo events
  getPromoEvents: () =>
    apiCall<PromoEvent[]>(`/api/v1/promo-events`),

  // Admin: Hero carousel CRUD
  createHeroSlide: (data: object) =>
    apiCall<HeroCarouselItem>(`/api/v1/hero-carousel`, { method: 'POST', body: JSON.stringify(data) }),
  updateHeroSlide: (id: string, data: object) =>
    apiCall<HeroCarouselItem>(`/api/v1/hero-carousel/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHeroSlide: (id: string) =>
    apiCall(`/api/v1/hero-carousel/${id}`, { method: 'DELETE' }),

  // Admin: Promo events CRUD
  createPromoEvent: (data: object) =>
    apiCall<PromoEvent>(`/api/v1/promo-events`, { method: 'POST', body: JSON.stringify(data) }),
  updatePromoEvent: (id: string, data: object) =>
    apiCall<PromoEvent>(`/api/v1/promo-events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePromoEvent: (id: string) =>
    apiCall(`/api/v1/promo-events/${id}`, { method: 'DELETE' }),
};

// Products & Categories Admin API
export const productsApi = {
  getProducts: (skip = 0, limit = 50) =>
    apiCall<Product[]>(`/api/v1/products/?skip=${skip}&limit=${limit}&in_stock=true`),

  createProduct: (product: ProductCreate) =>
    apiCall<Product>(`/api/v1/products/`, {
      method: 'POST',
      body: JSON.stringify(product),
      authenticated: true,
    }),

  updateProduct: (productId: string, product: Partial<ProductCreate>) =>
    apiCall<Product>(`/api/v1/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(product),
      authenticated: true,
    }),

  deleteProduct: (productId: string) =>
    apiCall(`/api/v1/products/${productId}`, { method: 'DELETE', authenticated: true }),

  getCategories: () =>
    apiCall<Category[]>(`/api/v1/products/categories`),

  createCategory: (category: CategoryCreate) =>
    apiCall<Category>(`/api/v1/products/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
      authenticated: true,
    }),

  updateCategory: (categoryId: string, category: Partial<CategoryCreate>) =>
    apiCall<Category>(`/api/v1/products/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(category),
      authenticated: true,
    }),

  deleteCategory: (categoryId: string) =>
    apiCall(`/api/v1/products/categories/${categoryId}`, { method: 'DELETE', authenticated: true }),
};

// Bookings API (API spec 5.6)
export const bookingsApi = {
  // Create a booking after payment succeeds
  createBooking: (data: {
    showtime_id: number;
    seat_ids: number[];
    ticket_type: 'normal' | 'student' | 'member';
    hold_id: string;
    snack_order?: { item_id: number; quantity: number }[];
  }) =>
    apiCall(`/api/v1/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  // Get booking detail
  getBooking: (bookingId: string) =>
    apiCall(`/api/v1/bookings/${bookingId}`, { authenticated: true }),

  // Cancel a booking
  cancelBooking: (bookingId: string) =>
    apiCall(`/api/v1/bookings/${bookingId}`, { method: 'DELETE', authenticated: true }),

  // Get current user's bookings
  getUserBookings: (status?: string, page = 1, limit = 10) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return apiCall(`/api/v1/users/me/bookings?${params.toString()}`, { authenticated: true });
  },
};

// Payments API (API spec 5.7)
export const paymentsApi = {
  // Initiate a mock payment for a booking
  initiate: (data: {
    booking_id: string;
    payment_method: 'mock_card' | 'mock_qr' | 'mock_cash';
    mock_should_succeed?: boolean;
  }) =>
    apiCall(`/api/v1/payments/initiate`, {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  // Confirm mock payment result
  confirm: (paymentId: string, mock_result: boolean) =>
    apiCall(`/api/v1/payments/${paymentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ mock_result }),
      authenticated: true,
    }),

  // Get payment status
  getPayment: (paymentId: string) =>
    apiCall(`/api/v1/payments/${paymentId}`, { authenticated: true }),
};

// user API
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  is_student: boolean;
  student_id_verified: boolean;
  membership_tier: 'none' | 'free' | 'paid';
  reward_points: number;
  attendance_streak: number;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

export const usersApi = {
  // Get current user profile
  getCurrentUser: (): Promise<UserProfile> =>
    apiCall(`/api/v1/users/me`, { authenticated: true }),

  // Update current user profile
  updateProfile: (data: ProfileUpdateData): Promise<UserProfile> =>
    apiCall(`/api/v1/users/me`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  // Student verification upload (multipart/form-data)
  submitStudentVerification: (formData: FormData) =>
    fetch(`${API_BASE_URL}/api/v1/users/me/student-verification`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type
      credentials: 'include',
    }).then(res => res.json()),

  // Get user's bookings (use bookingsApi.getUserBookings)
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
    apiCall<PaginatedReviews>(`/api/v1/reviews/movie/${movieId}?skip=${skip}&limit=${limit}`, {
      authenticated: false,
    }),

  createReview: (data: ReviewCreate): Promise<Review> =>
    apiCall<Review>(`/api/v1/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  updateReview: (reviewId: number, data: { review_text?: string; rating?: number }): Promise<Review> =>
    apiCall<Review>(`/api/v1/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      authenticated: true,
    }),

  deleteReview: (reviewId: number): Promise<void> =>
    apiCall<void>(`/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
      authenticated: true,
    }),

  likeReview: (reviewId: number): Promise<Review> =>
    apiCall<Review>(`/api/v1/reviews/${reviewId}/like`, {
      method: 'POST',
      authenticated: true,
    }),
}
