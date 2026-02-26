/**
 * API Service Layer
 * Organized by domain, with centralized error handling
 */

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UserUpdate,
  UserBookingsResponse,
  UserPointsResponse,
  Movie,
  MovieDetail,
  MovieListResponse,
  MovieShowtimesResponse,
  QualityScoreResponse,
  Showtime,
  ShowtimeDetail,
  SeatMapResponse,
  TimeCommitmentResponse,
  ReserveSeatRequest,
  ReserveSeatResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  BookingDetail,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentResponse,
  ReviewCreate,
  ReviewResponse,
  HeroSlide,
  Promotion,
  MovieCreate,
  MovieUpdate,
  ShowtimeCreate,
  ShowtimeUpdate,
  AdminUserResponse,
  AdminUserUpdate,
  DashboardStats,
  ErrorResponse,
} from '@/types/api';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// ============================================================================
// UTILITIES
// ============================================================================

class APIError extends Error {
  constructor(
    public status: number,
    public data?: ErrorResponse,
  ) {
    super(data?.message || `HTTP ${status}`);
    this.name = 'APIError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // Try to extract error message from standardized format
    const errorData: ErrorResponse = data || {
      message: `HTTP ${response.status}`,
    };
    throw new APIError(response.status, errorData);
  }

  return data as T;
}

function getAuthToken(): string | null {
  // Try multiple possible storage locations
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    null
  );
}

function buildHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  includeAuth: boolean = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: buildHeaders(includeAuth),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return handleResponse<T>(response);
}

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    request<LoginResponse>('POST', '/auth/login', credentials, false),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    request<RegisterResponse>('POST', '/auth/register', data, false),

  logout: (): Promise<{ message: string }> =>
    request<{ message: string }>('POST', '/auth/logout'),

  refresh: (refreshToken: string): Promise<LoginResponse> =>
    request<LoginResponse>('POST', '/auth/refresh', { refresh_token: refreshToken }, false),
};

// ============================================================================
// USER API
// ============================================================================

export const userApi = {
  getProfile: (): Promise<UserProfile> =>
    request<UserProfile>('GET', '/users/me'),

  updateProfile: (data: UserUpdate): Promise<UserProfile> =>
    request<UserProfile>('PATCH', '/users/me', data),

  submitStudentVerification: (file: File): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('student_id_image', file);
    return fetch(`${API_BASE_URL}/users/me/student-verification`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then((res) => handleResponse(res));
  },

  getBookings: (status?: string, page: number = 1, limit: number = 10): Promise<UserBookingsResponse> =>
    request<UserBookingsResponse>(
      'GET',
      `/users/me/bookings?status=${status || ''}&page=${page}&limit=${limit}`,
    ),

  getPoints: (): Promise<UserPointsResponse> =>
    request<UserPointsResponse>('GET', '/users/me/points'),

  getUserById: (userId: string): Promise<AdminUserResponse> =>
    request<AdminUserResponse>('GET', `/users/${userId}`),

  deactivateAccount: (userId: string): Promise<{ message: string }> =>
    request<{ message: string }>('DELETE', `/users/${userId}`),
};

// ============================================================================
// MOVIE API
// ============================================================================

export const movieApi = {
  getMovies: (
    page: number = 1,
    limit: number = 20,
    status?: string,
    genre?: string,
    search?: string,
  ): Promise<MovieListResponse> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (genre) params.append('genre', genre);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return request<MovieListResponse>('GET', `/movies?${params.toString()}`, undefined, false);
  },

  getMovieById: (movieId: number): Promise<MovieDetail> =>
    request<MovieDetail>('GET', `/movies/${movieId}`, undefined, false),

  getMovieShowtimes: (
    movieId: number,
    dateFrom?: string,
    days: number = 7,
  ): Promise<MovieShowtimesResponse> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    params.append('days', days.toString());
    return request<MovieShowtimesResponse>(
      'GET',
      `/movies/${movieId}/showtimes?${params.toString()}`,
      undefined,
      false,
    );
  },

  getQualityScore: (movieId: number): Promise<QualityScoreResponse> =>
    request<QualityScoreResponse>('GET', `/movies/${movieId}/quality-score`, undefined, false),
};

export const moviesApi = movieApi; // Alias for backward compatibility

// ============================================================================
// SHOWTIME API
// ============================================================================

export const showtimeApi = {
  getShowtimeById: (showtimeId: number): Promise<ShowtimeDetail> =>
    request<ShowtimeDetail>('GET', `/showtimes/${showtimeId}`, undefined, false),

  getSeats: (showtimeId: number): Promise<SeatMapResponse> =>
    request<SeatMapResponse>('GET', `/showtimes/${showtimeId}/seats`, undefined, false),

  getAllSeats: (showtimeId: number): Promise<SeatMapResponse> =>
    request<SeatMapResponse>('GET', `/showtimes/${showtimeId}/seats/all`, undefined, false),

  getTimeCommitment: (showtimeId: number, travelMinutes?: number): Promise<TimeCommitmentResponse> => {
    const params = new URLSearchParams();
    if (travelMinutes !== undefined) params.append('travel_minutes', travelMinutes.toString());
    return request<TimeCommitmentResponse>(
      'GET',
      `/showtimes/${showtimeId}/time-commitment?${params.toString()}`,
      undefined,
      false,
    );
  },

  getShowtimesByMovie: (movieId: number): Promise<Showtime[]> =>
    request<Showtime[]>('GET', `/showtimes/movie/${movieId}`, undefined, false),
};

export const showtimesApi = showtimeApi; // Alias

// ============================================================================
// SEAT HOLD API
// ============================================================================

export const seatApi = {
  holdSeats: (showtimeId: number, seatIds: number[]): Promise<{ hold_id: string; expires_in_seconds: number }> =>
    request<{ hold_id: string; expires_in_seconds: number }>('POST', `/showtimes/${showtimeId}/seats/hold`, {
      seat_ids: seatIds,
    }),

  releaseHold: (showtimeId: number, holdId: string): Promise<{ message: string }> =>
    request<{ message: string }>('DELETE', `/showtimes/${showtimeId}/seats/hold`, { hold_id: holdId }),

  getHoldStatus: (showtimeId: number, holdId: string): Promise<{ is_active: boolean; expires_in_seconds: number }> =>
    request<{ is_active: boolean; expires_in_seconds: number }>(
      'GET',
      `/showtimes/${showtimeId}/seats/hold/status?hold_id=${holdId}`,
      undefined,
      false,
    ),
};

// ============================================================================
// BOOKING API
// ============================================================================

export const bookingApi = {
  createBooking: (request: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    bookingApi.reserveSeats(request),

  reserveSeats: (request: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    requestWithAuth<ReserveSeatResponse>('POST', '/bookings', request),

  confirmPayment: (request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> =>
    requestWithAuth<ConfirmPaymentResponse>('POST', '/bookings/confirm-payment', request),

  getBookingById: (bookingId: number): Promise<BookingDetail> =>
    requestWithAuth<BookingDetail>('GET', `/bookings/${bookingId}`),

  getBookingTickets: (bookingId: number): Promise<{ tickets: any[] }> =>
    requestWithAuth<{ tickets: any[] }>('GET', `/bookings/${bookingId}/tickets`),

  cancelBooking: (bookingId: number): Promise<CancelBookingResponse> =>
    requestWithAuth<CancelBookingResponse>('DELETE', `/bookings/${bookingId}`),

  changeShowtime: (
    bookingId: number,
    newShowtimeId: number,
    newSeatIds: number[],
  ): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('POST', `/bookings/${bookingId}/change-showtime`, {
      new_showtime_id: newShowtimeId,
      new_seat_ids: newSeatIds,
    }),

  changeSeat: (bookingId: number, newSeatIds: number[]): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('POST', `/bookings/${bookingId}/change-seat`, {
      new_seat_ids: newSeatIds,
    }),
};

export const bookingsApi = bookingApi; // Alias

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentApi = {
  initiatePayment: (request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    requestWithAuth<InitiatePaymentResponse>('POST', '/payments/initiate', request),

  confirmPayment: (paymentId: string, mockResult: boolean): Promise<PaymentResponse> =>
    requestWithAuth<PaymentResponse>('POST', `/payments/${paymentId}/confirm`, { mock_result: mockResult }),

  getPaymentStatus: (paymentId: string): Promise<PaymentResponse> =>
    requestWithAuth<PaymentResponse>('GET', `/payments/${paymentId}`),
};

// ============================================================================
// REVIEW API
// ============================================================================

export const reviewApi = {
  createReview: (movieId: number, review: Omit<ReviewCreate, 'movie_id'>): Promise<ReviewResponse> =>
    requestWithAuth<ReviewResponse>('POST', `/reviews`, { ...review, movie_id: movieId }),

  updateReview: (reviewId: number, review: Partial<ReviewCreate>): Promise<ReviewResponse> =>
    requestWithAuth<ReviewResponse>('PATCH', `/reviews/${reviewId}`, review),

  getMovieReviews: (movieId: number): Promise<ReviewResponse[]> =>
    request<ReviewResponse[]>('GET', `/reviews/movie/${movieId}`, undefined, false),

  deleteReview: (reviewId: number): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('DELETE', `/reviews/${reviewId}`),
};

// ============================================================================
// PUBLIC API (Hero Carousel, Promotions)
// ============================================================================

export const publicApi = {
  getHeroCarousel: (): Promise<HeroSlide[]> =>
    request<HeroSlide[]>('GET', '/hero-carousel', undefined, false),

  getPromoEvents: (): Promise<Promotion[]> =>
    request<Promotion[]>('GET', '/promo-events', undefined, false),
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  // Dashboard
  getDashboard: (): Promise<DashboardStats> =>
    requestWithAuth<DashboardStats>('GET', '/admin/dashboard'),

  // Movies
  listMovies: (): Promise<Movie[]> =>
    requestWithAuth<Movie[]>('GET', '/admin/movies'),

  createMovie: (movie: MovieCreate): Promise<Movie> =>
    requestWithAuth<Movie>('POST', '/admin/movies', movie),

  updateMovie: (movieId: number, movie: MovieUpdate): Promise<Movie> =>
    requestWithAuth<Movie>('PATCH', `/admin/movies/${movieId}`, movie),

  deleteMovie: (movieId: number): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('DELETE', `/admin/movies/${movieId}`),

  // Showtimes
  createShowtime: (showtime: ShowtimeCreate): Promise<Showtime> =>
    requestWithAuth<Showtime>('POST', '/admin/showtimes', showtime),

  updateShowtime: (showtimeId: number, showtime: ShowtimeUpdate): Promise<Showtime> =>
    requestWithAuth<Showtime>('PATCH', `/admin/showtimes/${showtimeId}`, showtime),

  deleteShowtime: (showtimeId: number): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('DELETE', `/admin/showtimes/${showtimeId}`),

  // Bookings
  listBookings: (userId?: string, showtimeId?: number, status?: string, limit: number = 100, offset: number = 0) =>
    requestWithAuth<{ bookings: BookingDetail[] }>('GET', `/admin/bookings?limit=${limit}&offset=${offset}`, undefined),

  updateBooking: (bookingId: number, newShowtimeId?: number, newSeatIds?: number[], adminNote?: string) =>
    requestWithAuth<BookingDetail>('PATCH', `/admin/bookings/${bookingId}`, {
      new_showtime_id: newShowtimeId,
      new_seat_ids: newSeatIds,
      admin_note: adminNote,
    }),

  // Users
  listUsers: (search?: string, skip: number = 0, limit: number = 100): Promise<AdminUserResponse[]> =>
    requestWithAuth<AdminUserResponse[]>('GET', `/admin/users?search=${search || ''}&skip=${skip}&limit=${limit}`),

  updateUser: (userId: string, user: AdminUserUpdate): Promise<AdminUserResponse> =>
    requestWithAuth<AdminUserResponse>('PATCH', `/admin/users/${userId}`, user),

  deleteUser: (userId: string): Promise<{ message: string }> =>
    requestWithAuth<{ message: string }>('DELETE', `/admin/users/${userId}`),

  // Hero Carousel (CMS)
  createHeroSlide: (slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> =>
    requestWithAuth<HeroSlide>('POST', '/admin/hero-carousel', slide),

  updateHeroSlide: (slideId: string, slide: Partial<HeroSlide>): Promise<HeroSlide> =>
    requestWithAuth<HeroSlide>('PUT', `/admin/hero-carousel/${slideId}`, slide),

  deleteHeroSlide: (slideId: string): Promise<{ status: string }> =>
    requestWithAuth<{ status: string }>('DELETE', `/admin/hero-carousel/${slideId}`),

  // Promo Events (CMS)
  createPromotion: (promo: Omit<Promotion, 'id'>): Promise<Promotion> =>
    requestWithAuth<Promotion>('POST', '/admin/promo-events', promo),

  updatePromotion: (promoId: string, promo: Partial<Promotion>): Promise<Promotion> =>
    requestWithAuth<Promotion>('PUT', `/admin/promo-events/${promoId}`, promo),

  deletePromotion: (promoId: string): Promise<{ status: string }> =>
    requestWithAuth<{ status: string }>('DELETE', `/admin/promo-events/${promoId}`),
};

// ============================================================================
// HELPER: Auth-required requests
// ============================================================================

function requestWithAuth<T>(method: string, path: string, body?: unknown): Promise<T> {
  return request<T>(method, path, body, true);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export { APIError };
