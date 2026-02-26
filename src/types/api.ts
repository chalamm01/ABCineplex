/**
 * API Type Definitions
 * Aligned with refactored backend (app/schemas/)
 */

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface ErrorResponse {
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  token: string;
}

// ============================================================================
// USER & PROFILE TYPES
// ============================================================================

export interface UserProfile {
  id: string;
  email: string;
  user_name: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
  phone?: string;
  date_of_birth?: string;
  is_student: boolean;
  student_id_verified: boolean;
  membership_tier: string;
  reward_points: number;
  attendance_streak: number;
}

export interface UserUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface BookingSummary {
  booking_id: string | number;
  showtime_id?: number;
  booking_status?: string;
  total_amount?: number;
  created_at?: string;
  movie_title?: string;
  screen_name?: string;
  showtime_start?: string;
  seats?: string[];
}

export interface UserBookingsResponse {
  bookings: BookingSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface PointTransaction {
  id: string | number;
  points_delta: number;
  reason: string;
  created_at?: string;
}

export interface UserPointsResponse {
  current_points: number;
  transactions: PointTransaction[];
}

export interface AdminUserResponse {
  user_id: string;
  email: string;
  user_name?: string;
  full_name?: string;
  phone?: string;
  loyalty_points: number;
  is_admin: boolean;
  is_active: boolean;
  is_student: boolean;
  student_id_verified: boolean;
  membership_tier: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// MOVIE TYPES
// ============================================================================

export interface Movie {
  id: number;
  title: string;
  synopsis?: string;
  genre?: string | string[];
  runtime_minutes?: number;
  rating_tmdb?: number;
  poster_url?: string;
  status: string;
  release_date?: string;
  director?: string;
  starring?: string[];
  trailer_url?: string;
  credits_duration_minutes?: number;
}

export interface MovieDetail extends Movie {
  cast?: string[];
  content_rating?: string;
  banner_url?: string;
  audio_languages?: string[];
  subtitle_languages?: string[];
  tag_event?: string;
  genres?: string[];
  rating_count?: number;
  duration_minutes?: number;
}

export interface MovieListResponse {
  movies: Movie[];
  total: number;
  page: number;
}

export interface ShowtimeCard {
  showtime_id: number;
  theatre_name?: string;
  start_time?: string;
  end_time?: string;
  format?: string;
  language?: string;
  available_seats?: number;
  total_seats?: number;
  ticket_price_normal?: number;
  ticket_price_student?: number;
  ticket_price_member?: number;
  total_time_commitment_minutes: number;
  risk_adjusted_quality_score: number;
}

export interface MovieShowtimesResponse {
  movie_id: number;
  showtimes_by_date: Record<string, ShowtimeCard[]>;
  furthest_available_date?: string;
}

export interface RAQSBreakdown {
  base_rating: number;
  confidence_weight: number;
  recency_factor: number;
  formula: string;
}

export interface QualityScoreResponse {
  movie_id: number;
  title: string;
  rating_tmdb: number;
  rating_count: number;
  risk_adjusted_quality_score: number;
  score_breakdown: RAQSBreakdown;
}

// ============================================================================
// SHOWTIME TYPES
// ============================================================================

export interface Showtime {
  id: number;
  movie_id: number;
  screen_id: number;
  start_time?: string;
  base_price: number;
  language?: string;
  format?: string;
  created_at?: string;
}

export interface ShowtimeDetail {
  id: number;
  movie?: { id: number; title: string; runtime_minutes: number };
  theatre?: { id: number; name: string };
  start_time?: string;
  end_time?: string;
  estimated_end_with_credits?: string;
  format?: string;
  language?: string;
  available_seats?: number;
  total_seats?: number;
  ticket_prices?: {
    normal?: number;
    student?: number;
    member?: number;
  };
  total_time_commitment_minutes: number;
  risk_adjusted_quality_score: number;
}

export interface TTCComponents {
  travel_to_theatre_minutes: number;
  pre_show_ads_minutes: number;
  runtime_minutes: number;
  credits_minutes: number;
  travel_from_theatre_minutes: number;
}

export interface TimeCommitmentResponse {
  showtime_id: number;
  movie_title: string;
  components: TTCComponents;
  total_time_commitment_minutes: number;
  show_start: string;
  movie_end_time: string;
  credits_end_time: string;
  estimated_home_arrival: string;
}

export interface SeatInMap {
  seat_id: number;
  row_label: string;
  seat_number: number;
  seat_type: string;
  status: string; // available | held | booked | disabled
}

export interface SeatLayout {
  rows: string[];
  seats_per_row: number;
}

export interface SeatMapResponse {
  showtime_id: number;
  theatre_id?: number;
  layout: SeatLayout;
  seats: SeatInMap[];
}

// ============================================================================
// BOOKING TYPES
// ============================================================================

export interface ReserveSeatRequest {
  showtime_id: number;
  seat_ids: number[];
  price_per_seat: number;
}

export interface ReserveSeatResponse {
  success: boolean;
  booking_id?: number;
  payment_deadline?: string;
  total_amount?: number;
  error?: string;
  unavailable_seats?: number[];
}

export interface ConfirmPaymentRequest {
  booking_id: number;
  payment_intent_id?: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  booking_id?: number;
  tickets?: Array<{
    ticket_id: number;
    booking_id: number;
    seat_id: number;
    row_label: string;
    seat_number: number;
    qr_code?: string;
  }>;
}

export interface BookingDetail {
  booking_id: number;
  user_id: string;
  booking_status: string;
  total_amount: number;
  payment_deadline: string;
  created_at: string;
  showtime_id: number;
  screen_name: string;
  seats: string[];
  movie_title?: string;
  poster_url?: string;
  showtime_start?: string;
  qr_code_data?: string;
  tickets?: Array<{
    ticket_id: number;
    booking_id: number;
    seat_id: number;
    row_label: string;
    seat_number: number;
  }>;
}

export interface CancelBookingRequest {
  booking_id: number;
}

export interface CancelBookingResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface InitiatePaymentRequest {
  booking_id: string;
  payment_method: 'mock_card' | 'mock_qr' | 'mock_cash';
  mock_should_succeed: boolean;
}

export interface InitiatePaymentResponse {
  payment_id: string;
  status: string;
  amount: number;
  payment_method: string;
}

export interface ConfirmPaymentMockRequest {
  mock_result: boolean;
}

export interface PaymentResponse {
  payment_id: string;
  status: string;
  booking_id?: string;
  booking_status?: string;
  points_earned?: number;
  message?: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewBase {
  rating: number; // 1.0-5.0
  review_text?: string;
}

export interface ReviewCreate extends ReviewBase {
  movie_id: number;
}

export interface ReviewResponse extends ReviewBase {
  id: number;
  user_id: string;
  movie_id: number;
  created_at: string;
  points_awarded: boolean;
}

// ============================================================================
// PUBLIC/CMS TYPES
// ============================================================================

export interface HeroSlide {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
  cta_link?: string;
  cta_text?: string;
  display_order?: number;
  is_active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  promo_type: 'news' | 'promo';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface MovieCreate {
  title: string;
  release_date: string;
  imdb_score?: number;
  duration_minutes: number;
  content_rating?: string;
  director?: string;
  starring?: string[];
  synopsis?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url?: string;
  audio_languages?: string[];
  subtitle_languages?: string[];
  tag_event?: string;
  release_status: string;
  genres?: string[];
}

export interface MovieUpdate {
  title?: string;
  release_date?: string;
  imdb_score?: number;
  duration_minutes?: number;
  content_rating?: string;
  director?: string;
  starring?: string[];
  synopsis?: string;
  poster_url?: string;
  banner_url?: string;
  trailer_url?: string;
  audio_languages?: string[];
  subtitle_languages?: string[];
  tag_event?: string;
  release_status?: string;
  genres?: string[];
}

export interface ShowtimeCreate {
  movie_id: number;
  screen_id: number;
  start_time: string;
  base_price: number;
  language?: string;
  format?: string;
  ticket_price_normal?: number;
  ticket_price_student?: number;
  ticket_price_member?: number;
}

export interface ShowtimeUpdate {
  movie_id?: number;
  screen_id?: number;
  start_time?: string;
  base_price?: number;
  language?: string;
  format?: string;
  ticket_price_normal?: number;
  ticket_price_student?: number;
  ticket_price_member?: number;
}

export interface AdminUserUpdate {
  full_name?: string;
  phone?: string;
  loyalty_points?: number;
  is_admin?: boolean;
  is_active?: boolean;
  is_student?: boolean;
  student_id_verified?: boolean;
  membership_tier?: string;
}

export interface DashboardStats {
  total_bookings_today: number;
  revenue_today: number;
  movies_now_showing: number;
  upcoming_movies: number;
  total_users: number;
  seats_filled_percent: number;
}

// ============================================================================
// UTILITY TYPES & FUNCTIONS
// ============================================================================

export function transformCarouselItem(item: HeroSlide) {
  return {
    id: item.id,
    image: item.image_url,
    title: item.title,
    description: item.description,
    ctaLink: item.cta_link,
    ctaText: item.cta_text,
  };
}
