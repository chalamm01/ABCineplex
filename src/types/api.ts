// API Response Types matching backend structure

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  imdb_score: number;
  duration_minutes: number;
  content_rating: string;
  director: string;
  starring: string[];
  synopsis: string;
  poster_url: string;
  banner_url: string;
  trailer_url: string;
  audio_languages: string[];
  subtitle_languages: string[];
  tag_event: string;
  release_status: string;
  genres: string[];
  created_at: string;
  updated_at: string;
}

export interface HeroCarouselItem {
  id: number;
  title: string | null;
  is_active: boolean;
  banner_url: string;
  content_type: string;
  target_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Frontend display type for carousel
export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  display_order: number;
}

export interface PromoEvent {
  id: number;
  title: string;
  is_active: boolean;
  image_url: string;
  promo_type: string;
  created_at: string;
  updated_at: string;
}

// Helper functions for formatting API data
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function formatYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

export function formatLanguages(languages: string[]): string {
  return languages.join(', ').toUpperCase();
}

// Transform API carousel item to display format
export function transformCarouselItem(item: HeroCarouselItem): HeroSlide {
  return {
    id: item.id,
    image: item.banner_url,
    title: item.title || '',
    display_order: item.display_order,
  };
}
