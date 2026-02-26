// API Response Types matching backend schemas exactly

// ── Movie types ───────────────────────────────────────────────────────────────

/** Matches backend MovieSummary — returned by GET /api/v1/movies */
export interface Movie {
  id: number;
  title: string;
  genre: string | null;
  runtime_minutes: number;
  rating_tmdb: number | null;
  poster_url: string | null;
  banner_url: string | null;
  release_date: string | null;
  content_rating: string | null;
  audio_languages: string[] | null;
  subtitle_languages: string[] | null;
  status: string | null;
}

export interface MoviesListResponse {
  movies: Movie[];
  total: number;
  page: number;
}

/** Matches backend MovieDetail — returned by GET /api/v1/movies/:id */
export interface MovieDetail {
  id: number;
  title: string;
  synopsis: string | null;
  genre: string | null;
  runtime_minutes: number;
  trailer_url: string | null;
  poster_url: string | null;
  banner_url: string | null;
  cast_json: string[] | null;
  director: string | null;
  release_date: string | null;
  rating_tmdb: number | null;
  rating_count: number | null;
  content_rating: string | null;
  audio_languages: string[] | null;
  subtitle_languages: string[] | null;
  credits_duration_minutes: number;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// ── Showtime types ────────────────────────────────────────────────────────────

/** Matches backend ShowtimeCard — one showtime entry with TTC & RAQS */
export interface ShowtimeCard {
  showtime_id: number;
  theatre_name: string | null;
  start_time: string | null;  // "HH:MM" format
  end_time: string | null;    // "HH:MM" format
  format: string | null;
  language: string | null;
  available_seats: number | null;
  total_seats: number | null;
  ticket_price_normal: number | null;
  ticket_price_student: number | null;
  ticket_price_member: number | null;
  total_time_commitment_minutes: number;
  risk_adjusted_quality_score: number;
}

/** Matches backend MovieShowtimesResponse */
export interface MovieShowtimesResponse {
  movie_id: number;
  showtimes_by_date: Record<string, ShowtimeCard[]>;
  furthest_available_date: string | null;
}

// ── Public content types ──────────────────────────────────────────────────────

/** Matches backend HeroSlide — returned by GET /api/v1/hero-carousel */
export interface HeroCarouselItem {
  id: number;
  title: string | null;
  is_active: boolean | null;
  banner_url: string | null;
  content_type: string | null;
  target_url: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string | null;
}

/** Frontend display format for hero carousel */
export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  display_order: number;
}

/** Matches backend Promotion — returned by GET /api/v1/promo-events */
export interface PromoEvent {
  id: number;
  title: string | null;
  is_active: boolean | null;
  image_url: string | null;
  promo_type: string | null;
  created_at: string;
  updated_at: string | null;
}

// ── User types ────────────────────────────────────────────────────────────────

export interface UserProfile {
  user_id: string;
  user_name: string | null;
  email: string;
  phone: string | null;
  loyalty_points: number | null;
  full_name: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const year = new Date(dateString).getFullYear();
  return Number.isNaN(year) ? 'N/A' : year.toString();
}

export function formatLanguages(languages: string[] | null | undefined): string {
  if (!languages || languages.length === 0) return 'N/A';
  return languages.join(', ').toUpperCase();
}

/** Transform API carousel item to frontend display format */
export function transformCarouselItem(item: HeroCarouselItem): HeroSlide {
  return {
    id: item.id,
    image: item.banner_url ?? '',
    title: item.title ?? '',
    display_order: item.display_order ?? 0,
  };
}
