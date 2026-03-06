import type { HeroSlide } from '@/types/api';

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

export function formatYear(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  } catch {
    return 'N/A';
  }
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatLanguages(languages?: string[]): string {
  if (!languages || languages.length === 0) return 'N/A';
  if (languages.length === 1) return languages[0];
  return languages.slice(0, 2).join(', ');
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
