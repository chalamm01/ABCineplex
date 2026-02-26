/**
 * Movie Constants and Types
 */

import type { ShowtimeCard } from '@/types/api';

export interface DateGroupShowtime extends ShowtimeCard {
  dayName?: string;
  day?: number;
  month?: number;
}

export type BookingDate = {
  date: string;
  dayName: string;
  day: number;
  month: number;
  showtimes: DateGroupShowtime[];
};
