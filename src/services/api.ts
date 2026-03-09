/**
 * API Service Layer
 * Organized by domain, with centralized error handling
 */

import type {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  SetPasswordRequest,
  SetupInfoRequest,
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
  CancelBookingResponse,
  BookingDetail,
  InitiatePaymentRequest,
  InitiatePaymentResponse,
  PaymentResponse,
  ReviewCreate,
  ReviewResponse,
  ReviewStatus,
  ReviewWithMovieListResponse,
  HeroSlide,
  Promotion,
  MovieCreate,
  MovieUpdate,
  ShowtimeCreate,
  ShowtimeUpdate,
  Theatre,
  TheatreCreate,
  TheatreUpdate,
  Seat,
  SeatCreate,
  SeatUpdate,
  AdminUserResponse,
  AdminUserUpdate,
  DashboardStats,
  ErrorResponse,
  ProductCategory,
  Product,
  SnackMenuItem,
  SnackOrderItem,
  SnackOrder,
  OrderResponse,
  TopPicksResponse,
  GuestBookingRequest,
  GuestBookingResponse,
  AdminReview,
  AdminPointTransactionsResponse,
  AdminOrderResponse,
} from '@/types/api';

// --- Configuration ---

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// --- Utilities ---

class APIError extends Error {
  status: number;
  data?: ErrorResponse;

  constructor(status: number, data?: ErrorResponse) {
    super(data?.message || `HTTP ${status}`);
    this.status = status;
    this.data = data;
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorData: ErrorResponse = {
      message: data?.message || data?.detail || `HTTP ${response.status}`,
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



// For public endpoints — no token sent
async function fetchPublic<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

// For authenticated endpoints — Bearer token always sent if present
async function fetchAuth<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    sessionStorage.getItem('token') ||
    null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

// --- Auth API ---

export const authApi = {
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    fetchPublic<LoginResponse>('POST', '/auth/login', credentials),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    fetchPublic<RegisterResponse>('POST', '/auth/register', data),

  logout: (): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('POST', '/auth/logout'),

  refresh: (refreshToken: string): Promise<RefreshResponse> =>
    fetchPublic<RefreshResponse>('POST', '/auth/refresh', { refresh_token: refreshToken }),

  getGoogleOAuthUrl: (): Promise<{ url: string }> =>
    fetchPublic<{ url: string }>('GET', '/auth/google'),

  setPassword: (data: SetPasswordRequest): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('POST', '/auth/set-password', data),

  setupInfo: (data: SetupInfoRequest): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('POST', '/auth/setup-info', data),
};

// --- User API ---

export const userApi = {
  getProfile: (): Promise<UserProfile> =>
    fetchAuth<UserProfile>('GET', '/users/me'),

  updateProfile: (data: UserUpdate): Promise<UserProfile> =>
    fetchAuth<UserProfile>('PATCH', '/users/me', data),

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
    fetchAuth<UserBookingsResponse>(
      'GET',
      `/users/me/bookings?status=${status || ''}&page=${page}&limit=${limit}`,
    ),

  getPoints: (): Promise<UserPointsResponse> =>
    fetchAuth<UserPointsResponse>('GET', '/users/me/points'),

  getUserById: (userId: string): Promise<AdminUserResponse> =>
    fetchAuth<AdminUserResponse>('GET', `/users/${userId}`),

  deactivateAccount: (userId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/users/${userId}`),
};

// --- Movie API ---

export const moviesApi = {
  getMovies: (
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ): Promise<MovieListResponse> => {
    const params = new URLSearchParams();
    if (status) params.append('release_status', status);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    return fetchPublic<MovieListResponse>('GET', `/movies?${params.toString()}`);
  },

  getMovieById: (movieId: number): Promise<MovieDetail> =>
    fetchPublic<MovieDetail>('GET', `/movies/${movieId}`),

  getMovieShowtimes: (
    movieId: number,
    dateFrom?: string,
    days: number = 7,
    active?: boolean,
  ): Promise<MovieShowtimesResponse> => {
    const params = new URLSearchParams();
    if (dateFrom) params.append('date_from', dateFrom);
    params.append('days', days.toString());
    if (active !== undefined) params.append('active', active.toString());
    return fetchPublic<MovieShowtimesResponse>(
      'GET',
      `/movies/${movieId}/showtimes?${params.toString()}`
    );
  },

  getQualityScore: (movieId: number): Promise<QualityScoreResponse> =>
    fetchPublic<QualityScoreResponse>('GET', `/movies/${movieId}/quality-score`),

  getTopPicks: (limit: number = 10): Promise<TopPicksResponse> =>
    fetchPublic<TopPicksResponse>('GET', `/movies/top-picks?limit=${limit}`),

  getShowtimesByMovie: (movieId: number, active?: boolean): Promise<MovieShowtimesResponse> =>
    moviesApi.getMovieShowtimes(movieId, undefined, 7, active),

  createMovie: (movie: MovieCreate): Promise<Movie> =>
    fetchAuth<Movie>('POST', '/admin/movies', movie),

  updateMovie: (movieId: number, movie: MovieUpdate): Promise<Movie> =>
    fetchAuth<Movie>('PATCH', `/admin/movies/${movieId}`, movie),

  deleteMovie: (movieId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/movies/${movieId}`),
};

// --- moviesApi is now the canonical name ---

// --- Showtime API ---

export const showtimesApi = {
  getShowtimeById: (showtimeId: number): Promise<ShowtimeDetail> =>
    fetchPublic<ShowtimeDetail>('GET', `/showtimes/${showtimeId}`),

  getShowtime: (showtimeId: number): Promise<ShowtimeDetail> =>
    showtimesApi.getShowtimeById(showtimeId),

  getSeats: (showtimeId: number): Promise<SeatMapResponse> =>
    fetchPublic<SeatMapResponse>('GET', `/showtimes/${showtimeId}/seats`),

  getAllSeats: (showtimeId: number): Promise<SeatMapResponse> =>
    fetchPublic<SeatMapResponse>('GET', `/showtimes/${showtimeId}/seats/all`),

  getTimeCommitment: (showtimeId: number, travelMinutes?: number): Promise<TimeCommitmentResponse> => {
    const params = new URLSearchParams();
    if (travelMinutes !== undefined) params.append('travel_minutes', travelMinutes.toString());
    return fetchPublic<TimeCommitmentResponse>(
      'GET',
      `/showtimes/${showtimeId}/time-commitment?${params.toString()}`
    );
  },

  getShowtimesByMovie: (movieId: number): Promise<Showtime[]> =>
    fetchPublic<Showtime[]>('GET', `/showtimes/movie/${movieId}`),

  holdSeats: (showtimeId: number, seatIds: number[], ticketType: 'normal' | 'student' = 'normal'): Promise<{ hold_id: string; expires_at: string; expires_in_seconds: number }> =>
    fetchAuth<{ hold_id: string; expires_at: string; expires_in_seconds: number }>('POST', `/showtimes/${showtimeId}/seats/hold`, {
      seat_ids: seatIds,
      ticket_type: ticketType,
    }),

  createShowtime: (showtime: ShowtimeCreate): Promise<Showtime> =>
    fetchAuth<Showtime>('POST', '/admin/showtimes', showtime),

  updateShowtime: (showtimeId: number, showtime: ShowtimeUpdate): Promise<Showtime> =>
    fetchAuth<Showtime>('PATCH', `/admin/showtimes/${showtimeId}`, showtime),

  deleteShowtime: (showtimeId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/showtimes/${showtimeId}`),
};

// --- showtimesApi is now the canonical name ---

// --- Seat Hold API ---

export const seatApi = {
  holdSeats: (showtimeId: number, seatIds: number[], ticketType: 'normal' | 'student' = 'normal'): Promise<{ hold_id: string; expires_at: string; expires_in_seconds: number }> =>
    fetchAuth<{ hold_id: string; expires_at: string; expires_in_seconds: number }>('POST', `/showtimes/${showtimeId}/seats/hold`, {
      seat_ids: seatIds,
      ticket_type: ticketType,
    }),

  releaseHold: (showtimeId: number, holdId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/showtimes/${showtimeId}/seats/hold`, { hold_id: holdId }),

  getHoldStatus: (showtimeId: number, holdId: string): Promise<{ is_active: boolean; expires_in_seconds: number }> =>
    fetchAuth<{ is_active: boolean; expires_in_seconds: number }>(
      'GET',
      `/showtimes/${showtimeId}/seats/hold/status?hold_id=${holdId}`
    ),
};

// --- Booking API ---

export const bookingsApi = {
  createBooking: (request: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    bookingsApi.reserveSeats(request),

  reserveSeats: (request: ReserveSeatRequest): Promise<ReserveSeatResponse> =>
    fetchAuth<ReserveSeatResponse>('POST', '/bookings', request),

  createGuestBooking: (request: GuestBookingRequest): Promise<GuestBookingResponse> =>
    fetchPublic<GuestBookingResponse>('POST', '/bookings/guest', request),

  getGuestBooking: (token: string): Promise<BookingDetail> =>
    fetchPublic<BookingDetail>('GET', `/bookings/guest?token=${encodeURIComponent(token)}`),

  confirmPayment: (request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> =>
    fetchAuth<ConfirmPaymentResponse>('POST', '/bookings/confirm-payment', request),

  getBookingById: (bookingId: string): Promise<BookingDetail> =>
    fetchAuth<BookingDetail>('GET', `/bookings/${bookingId}`),

  getBooking: (bookingId: string): Promise<BookingDetail> =>
    bookingsApi.getBookingById(bookingId),

  getBookingTickets: (bookingId: string): Promise<{ tickets: any[] }> =>
    fetchAuth<{ tickets: any[] }>('GET', `/bookings/${bookingId}/tickets`),

  getUserBookings: (status?: string, page: number = 1, limit: number = 10): Promise<UserBookingsResponse> =>
    fetchAuth<UserBookingsResponse>(
      'GET',
      `/users/me/bookings?status=${status || ''}&page=${page}&limit=${limit}`,
    ),

  cancelBooking: (bookingId: string): Promise<CancelBookingResponse> =>
    fetchAuth<CancelBookingResponse>('DELETE', `/bookings/${bookingId}`),

  changeShowtime: (
    bookingId: string,
    newShowtimeId: number,
    newSeatIds: number[],
  ): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('POST', `/bookings/${bookingId}/change-showtime`, {
      new_showtime_id: newShowtimeId,
      new_seat_ids: newSeatIds,
    }),

  changeSeat: (bookingId: string, newSeatIds: number[]): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('POST', `/bookings/${bookingId}/change-seat`, {
      new_seat_ids: newSeatIds,
    }),
};

// --- bookingsApi is now the canonical name ---

// ============================================================================
// PAYMENT API
// ============================================================================

export const paymentsApi = {
  initiatePayment: (request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    fetchAuth<InitiatePaymentResponse>('POST', '/payments/initiate', request),

  initiate: (request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    paymentsApi.initiatePayment(request),

  confirmPayment: (paymentId: string, mockResult: boolean, pointsRedeemed: number = 0): Promise<PaymentResponse> =>
    fetchAuth<PaymentResponse>('POST', `/payments/${paymentId}/confirm`, { mock_result: mockResult, points_redeemed: pointsRedeemed }),

  confirm: (paymentId: string, mockResult: boolean, pointsRedeemed: number = 0): Promise<PaymentResponse> =>
    paymentsApi.confirmPayment(paymentId, mockResult, pointsRedeemed),

  getPaymentStatus: (paymentId: string): Promise<PaymentResponse> =>
    fetchAuth<PaymentResponse>('GET', `/payments/${paymentId}`),

  // Guest-mode variants — no auth token sent, guest_token in body instead
  initiateGuest: (request: InitiatePaymentRequest): Promise<InitiatePaymentResponse> =>
    fetchPublic<InitiatePaymentResponse>('POST', '/payments/initiate', request),

  confirmGuest: (paymentId: string, mockResult: boolean): Promise<PaymentResponse> =>
    fetchPublic<PaymentResponse>('POST', `/payments/${paymentId}/confirm`, { mock_result: mockResult, points_redeemed: 0 }),
};

// --- paymentsApi is now the canonical name ---

// ============================================================================
// REVIEW API
// ============================================================================

export const reviewApi = {
  createReview: (data: ReviewCreate): Promise<ReviewResponse> =>
    fetchAuth<ReviewResponse>('POST', `/reviews`, data),

  updateReview: (reviewId: number, review: Partial<ReviewCreate>): Promise<ReviewResponse> =>
    fetchAuth<ReviewResponse>('PATCH', `/reviews/${reviewId}`, review),

  getMovieReviews: (movieId: number): Promise<ReviewWithMovieListResponse> =>
    fetchPublic<ReviewWithMovieListResponse>('GET', `/reviews/movie/${movieId}`),

  deleteReview: (reviewId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/reviews/${reviewId}`),

  getLatestReviews: (limit = 20): Promise<ReviewWithMovieListResponse> =>
    fetchPublic<ReviewWithMovieListResponse>('GET', `/reviews/latest?limit=${limit}`),

  getMyReviews: (): Promise<ReviewWithMovieListResponse> =>
    fetchAuth<ReviewWithMovieListResponse>('GET', `/reviews/me`),

  likeReview: (reviewId: number): Promise<{ status: string }> =>
    fetchAuth<{ status: string }>('POST', `/reviews/${reviewId}/likes`),

  unlikeReview: (reviewId: number): Promise<{ status: string }> =>
    fetchAuth<{ status: string }>('DELETE', `/reviews/${reviewId}/likes`),

  getReviewStatus: (bookingId: string): Promise<ReviewStatus> =>
    fetchAuth<ReviewStatus>('GET', `/reviews/booking/${bookingId}/status`),
};

// ============================================================================
// PRODUCTS & SNACKS API
// ============================================================================

export const productsApi = {
  // Products (Categories)
  getCategories: (): Promise<ProductCategory[]> =>
    fetchPublic<ProductCategory[]>('GET', '/products/categories'),

  getCategory: (categoryId: string): Promise<ProductCategory> =>
    fetchPublic<ProductCategory>('GET', `/products/categories/${categoryId}`),

  createCategory: (category: Omit<ProductCategory, 'id'>): Promise<ProductCategory> =>
    fetchAuth<ProductCategory>('POST', '/products/categories', category),

  updateCategory: (categoryId: string, category: Partial<ProductCategory>): Promise<ProductCategory> =>
    fetchAuth<ProductCategory>('PATCH', `/products/categories/${categoryId}`, category),

  deleteCategory: (categoryId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/products/categories/${categoryId}`),

  // Products
  listProducts: (categoryId?: string, limit: number = 50, offset: number = 0): Promise<Product[]> =>
    fetchPublic<Product[]>('GET', `/products?${categoryId ? `category_id=${categoryId}&` : ''}limit=${limit}&offset=${offset}`),

  getAllProducts: (limit: number = 50, offset: number = 0): Promise<Product[]> =>
    productsApi.listProducts(undefined, limit, offset),

  getProduct: (productId: string): Promise<Product> =>
    fetchPublic<Product>('GET', `/products/${productId}`),

  createProduct: (product: Omit<Product, 'id'>): Promise<Product> =>
    fetchAuth<Product>('POST', '/products', product),

  updateProduct: (productId: string, product: Partial<Product>): Promise<Product> =>
    fetchAuth<Product>('PATCH', `/products/${productId}`, product),

  deleteProduct: (productId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/products/${productId}`),
};

export const ordersApi = {
  createOrder: (items: { product_id: string; quantity: number }[]): Promise<OrderResponse> =>
    fetchAuth<OrderResponse>('POST', '/orders', { items }),

  getOrders: (): Promise<OrderResponse[]> =>
    fetchAuth<OrderResponse[]>('GET', '/orders'),

  getOrder: (orderId: string): Promise<OrderResponse> =>
    fetchAuth<OrderResponse>('GET', `/orders/${orderId}`),

  updateOrderStatus: (orderId: string, status: string): Promise<OrderResponse> =>
    fetchAuth<OrderResponse>('PATCH', `/orders/${orderId}/status/${status}`, {}),
};

export const snacksApi = {
  // Menu items
  getMenu: (): Promise<SnackMenuItem[]> =>
    fetchPublic<SnackMenuItem[]>('GET', '/snacks'),

  getMenuItem: (itemId: string): Promise<SnackMenuItem> =>
    fetchPublic<SnackMenuItem>('GET', `/snacks/${itemId}`),

  // Pre-order for booking
  getSnackOrder: (bookingId: string): Promise<SnackOrder> =>
    fetchAuth<SnackOrder>('GET', `/snacks/orders/${bookingId}`),

  updateSnackOrder: (bookingId: string, items: SnackOrderItem[]): Promise<SnackOrder> =>
    fetchAuth<SnackOrder>('PATCH', `/snacks/orders/${bookingId}`, { items }),

  deleteSnackOrder: (bookingId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/snacks/orders/${bookingId}`),
};

// ============================================================================
// PUBLIC API (Hero Carousel, Promotions)
// ============================================================================

export const publicApi = {
  getHeroCarousel: (): Promise<HeroSlide[]> =>
    fetchPublic<HeroSlide[]>('GET', '/hero-carousel'),

  createHeroSlide: (slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> =>
    fetchAuth<HeroSlide>('POST', '/hero-carousel', slide),

  updateHeroSlide: (slideId: string, slide: Partial<HeroSlide>): Promise<HeroSlide> =>
    fetchAuth<HeroSlide>('PATCH', `/hero-carousel/${slideId}`, slide),

  deleteHeroSlide: (slideId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/hero-carousel/${slideId}`),

  getPromoEvents: (): Promise<Promotion[]> =>
    fetchPublic<Promotion[]>('GET', '/promo-events'),

  createPromoEvent: (promo: Omit<Promotion, 'id'>): Promise<Promotion> =>
    fetchAuth<Promotion>('POST', '/promo-events', promo),

  updatePromoEvent: (promoId: string, promo: Partial<Promotion>): Promise<Promotion> =>
    fetchAuth<Promotion>('PATCH', `/promo-events/${promoId}`, promo),

  deletePromoEvent: (promoId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/promo-events/${promoId}`),
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminApi = {
  // Dashboard
  getDashboard: (): Promise<DashboardStats> =>
    fetchAuth<DashboardStats>('GET', '/admin/dashboard'),

  // Movies
  listMovies: (): Promise<Movie[]> =>
    fetchAuth<Movie[]>('GET', '/admin/movies'),

  createMovie: (movie: MovieCreate): Promise<Movie> =>
    fetchAuth<Movie>('POST', '/admin/movies', movie),

  updateMovie: (movieId: number, movie: MovieUpdate): Promise<Movie> =>
    fetchAuth<Movie>('PATCH', `/admin/movies/${movieId}`, movie),

  deleteMovie: (movieId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/movies/${movieId}`),

  fetchFromTmdb: (tmdbId: number): Promise<Partial<MovieCreate> & { rating_count?: number }> =>
    fetchAuth<Partial<MovieCreate> & { rating_count?: number }>('GET', `/admin/movies/tmdb/${tmdbId}`),

  recalculateConsensus: (): Promise<{ message: string; count: number }> =>
    fetchAuth<{ message: string; count: number }>('POST', '/admin/movies/recalculate-consensus'),

  toggleMovieActive: (movieId: number, isActive: boolean): Promise<Movie> =>
    fetchAuth<Movie>('PATCH', `/admin/movies/${movieId}`, { is_active: isActive }),

  // Showtimes
  createShowtime: (showtime: ShowtimeCreate): Promise<Showtime> =>
    fetchAuth<Showtime>('POST', '/admin/showtimes', showtime),

  updateShowtime: (showtimeId: number, showtime: ShowtimeUpdate): Promise<Showtime> =>
    fetchAuth<Showtime>('PATCH', `/admin/showtimes/${showtimeId}`, showtime),

  deleteShowtime: (showtimeId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/showtimes/${showtimeId}`),

  listAllShowtimes: (active?: boolean): Promise<Showtime[]> => {
    const params = new URLSearchParams();
    if (active !== undefined) params.append('active', active.toString());
    return fetchAuth<{ showtimes: Showtime[] }>(
      'GET',
      `/movies/bulk/all-active-showtimes?${params.toString()}`,
      undefined,
    ).then(res => res.showtimes || []);
  },

  // Theatres
  listTheatres: (): Promise<Theatre[]> =>
    fetchAuth<Theatre[]>('GET', '/admin/theatres'),

  getTheatre: (theatreId: number): Promise<Theatre> =>
    fetchAuth<Theatre>('GET', `/admin/theatres/${theatreId}`),

  createTheatre: (theatre: TheatreCreate): Promise<Theatre> =>
    fetchAuth<Theatre>('POST', '/admin/theatres', theatre),

  updateTheatre: (theatreId: number, theatre: TheatreUpdate): Promise<Theatre> =>
    fetchAuth<Theatre>('PATCH', `/admin/theatres/${theatreId}`, theatre),

  deleteTheatre: (theatreId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/theatres/${theatreId}`),

  // Seats
  listSeats: (theatreId: number): Promise<Seat[]> =>
    fetchAuth<Seat[]>('GET', `/admin/theatres/${theatreId}/seats`),

  createSeat: (theatreId: number, seat: SeatCreate): Promise<Seat> =>
    fetchAuth<Seat>('POST', `/admin/theatres/${theatreId}/seats`, seat),

  updateSeat: (theatreId: number, seatId: number, seat: SeatUpdate): Promise<Seat> =>
    fetchAuth<Seat>('PATCH', `/admin/theatres/${theatreId}/seats/${seatId}`, seat),

  deleteSeat: (theatreId: number, seatId: number): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/theatres/${theatreId}/seats/${seatId}`),

  // Showtime Seats (Showtime-specific seat configurations)
  listShowtimeSeats: (showtimeId: number): Promise<any[]> =>
    fetchAuth<any[]>('GET', `/admin/showtimes/${showtimeId}/seats`),

  updateShowtimeSeats: (showtimeId: number, seatConfigs: Record<number, boolean>): Promise<any[]> =>
    fetchAuth<any[]>('PATCH', `/admin/showtimes/${showtimeId}/seats/batch`, seatConfigs),

  updateSingleShowtimeSeat: (showtimeSeatId: number, isAvailable: boolean): Promise<any> =>
    fetchAuth<any>('PATCH', `/admin/showtime-seats/${showtimeSeatId}`, { is_available: isAvailable }),

  // Bookings
  listBookings: (_userId?: string, _showtimeId?: number, _status?: string, limit: number = 100, offset: number = 0) =>
    fetchAuth<{ bookings: BookingDetail[] }>('GET', `/admin/bookings?limit=${limit}&offset=${offset}`, undefined),

  updateBooking: (bookingId: number, newShowtimeId?: number, newSeatIds?: number[], adminNote?: string) =>
    fetchAuth<BookingDetail>('PATCH', `/admin/bookings/${bookingId}`, {
      new_showtime_id: newShowtimeId,
      new_seat_ids: newSeatIds,
      admin_note: adminNote,
    }),

  // Users
  listUsers: (search?: string, skip: number = 0, limit: number = 100): Promise<AdminUserResponse[]> =>
    fetchAuth<AdminUserResponse[]>('GET', `/admin/users?search=${search || ''}&skip=${skip}&limit=${limit}`),

  getUsers: (search?: string, skip: number = 0, limit: number = 100): Promise<AdminUserResponse[]> =>
    adminApi.listUsers(search, skip, limit),

  updateUser: (userId: string, user: AdminUserUpdate): Promise<AdminUserResponse> =>
    fetchAuth<AdminUserResponse>('PATCH', `/admin/users/${userId}`, user),

  deleteUser: (userId: string): Promise<{ message: string }> =>
    fetchAuth<{ message: string }>('DELETE', `/admin/users/${userId}`),

  // Hero Carousel (CMS)
  createHeroSlide: (slide: Omit<HeroSlide, 'id'>): Promise<HeroSlide> =>
    fetchAuth<HeroSlide>('POST', '/admin/hero-carousel', slide),

  updateHeroSlide: (slideId: string, slide: Partial<HeroSlide>): Promise<HeroSlide> =>
    fetchAuth<HeroSlide>('PUT', `/admin/hero-carousel/${slideId}`, slide),

  deleteHeroSlide: (slideId: string): Promise<{ status: string }> =>
    fetchAuth<{ status: string }>('DELETE', `/admin/hero-carousel/${slideId}`),

  // Promo Events (CMS)
  createPromotion: (promo: Omit<Promotion, 'id'>): Promise<Promotion> =>
    fetchAuth<Promotion>('POST', '/admin/promo-events', promo),

  updatePromotion: (promoId: string, promo: Partial<Promotion>): Promise<Promotion> =>
    fetchAuth<Promotion>('PUT', `/admin/promo-events/${promoId}`, promo),

  deletePromotion: (promoId: string): Promise<{ status: string }> =>
    fetchAuth<{ status: string }>('DELETE', `/admin/promo-events/${promoId}`),

  // Reviews moderation
  listReviews: (params?: { movie_id?: number; limit?: number; offset?: number }): Promise<{ reviews: AdminReview[]; total: number }> => {
    const qs = new URLSearchParams();
    if (params?.movie_id) qs.append('movie_id', String(params.movie_id));
    if (params?.limit) qs.append('limit', String(params.limit));
    if (params?.offset) qs.append('offset', String(params.offset));
    return fetchAuth<{ reviews: AdminReview[]; total: number }>('GET', `/admin/reviews?${qs.toString()}`);
  },

  deleteReview: (reviewId: number): Promise<{ status: string; message: string }> =>
    fetchAuth<{ status: string; message: string }>('DELETE', `/admin/reviews/${reviewId}`),

  listOrders: (limit: number = 100, offset: number = 0, status?: string): Promise<{ orders: AdminOrderResponse[]; count: number }> => {
    const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) qs.append('order_status', status);
    return fetchAuth<{ orders: AdminOrderResponse[]; count: number }>('GET', `/admin/orders?${qs.toString()}`);
  },

  listPointTransactions: (params?: { limit?: number; offset?: number; user_id?: string; reason?: string }): Promise<AdminPointTransactionsResponse> => {
    const qs = new URLSearchParams();
    if (params?.user_id) qs.append('user_id', params.user_id);
    if (params?.reason) qs.append('reason', params.reason);
    if (params?.limit != null) qs.append('limit', String(params.limit));
    if (params?.offset != null) qs.append('offset', String(params.offset));
    return fetchAuth<AdminPointTransactionsResponse>('GET', `/admin/point-transactions?${qs.toString()}`);
  },
};

// ============================================================================
// HELPER: Auth-required requests
// ============================================================================


// ============================================================================
// ERROR HANDLING
// ============================================================================

export { APIError };

// Re-export commonly used types from api module
export type {
  MovieCreate,
  ShowtimeCreate,
  Showtime,
  UserProfile,
  ProductCategory,
  Product,
  SeatInMap,
  Promotion,
  HeroSlide,
  DateGroupShowtime,
  Theatre,
  TheatreCreate,
  TheatreUpdate,
  Seat,
} from '@/types/api';
