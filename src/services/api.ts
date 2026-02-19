import type { Movie } from '@/types/api';
import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Showtime type
interface Showtime {
  id: number;
  movie_id: number;
  screen_id: number;
  start_time: string;
  base_price: number;
  created_at: string;
}

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
      }
    } catch {
      // Silently continue without auth if session retrieval fails
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
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
};

// Public API (Hero carousel, promo events)
export const publicApi = {
  // Get hero carousel slides
  getHeroCarousel: () =>
    apiCall(`/api/hero-carousel`),

  // Get promo events
  getPromoEvents: () =>
    apiCall(`/api/promo-events`),
};

// Bookings API - Two-step booking flow
interface ReserveSeatRequest {
  user_id: string;
  screen_id: number;
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
  screen_name: string;
  seats: string[];
  movie_id?: number;
  movie_title?: string;
  poster_url?: string;
  showtime_start?: string;
  showtime_end?: string;
  showtime_id?: number;
}

export const bookingsApi = {
  // Step 1: Reserve seats (starts 5-minute countdown)
  reserveSeats: (data: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    apiCall<ReserveSeatResponse>(`/api/bookings/reserve`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Step 2: Confirm payment (finalizes booking)
  confirmPayment: (data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> =>
    apiCall<ConfirmPaymentResponse>(`/api/bookings/confirm-payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cancel a pending booking
  cancelBooking: (bookingId: number) =>
    apiCall(`/api/bookings/cancel`, {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    }),

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
