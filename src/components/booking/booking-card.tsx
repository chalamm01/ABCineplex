import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ticket, Star, CalendarClock } from "lucide-react";
import { MovieTicketModal } from "./ticket-modal";
import { WriteReviewModal } from "@/components/community/WriteReviewModal";
import { formatDate, formatTime } from "@/lib/format";
import type { BookingDetail } from "@/types/api";

interface BookingCardProps {
  booking: BookingDetail;
  onChangeShowtime?: () => void;
  canReview?: boolean;
  movieId?: number;
  movieTitle?: string;
  bookingId?: string;
  onReviewSubmitted?: () => void;
}

export function BookingCard({
  booking,
  onChangeShowtime,
  canReview,
  movieId,
  movieTitle,
  bookingId,
  onReviewSubmitted,
}: BookingCardProps) {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow-lg transition-shadow flex">
        {/* Poster */}
        <div className="relative w-28 sm:w-36 shrink-0 overflow-hidden">
          <img
            src={booking.poster_url || '/assets/images/placeholder.png'}
            alt={booking.movie_title}
            className="h-full w-full object-cover"
          />
          {/* gradient overlay at bottom of poster */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between flex-1 min-w-0 p-4 sm:p-5">
          {/* Title + venue */}
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-extrabold leading-tight text-gray-900 line-clamp-2 tracking-tight">
              {booking.movie_title}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-400 font-medium truncate">{booking.screen_name}</p>
          </div>

          {/* Date / Time / Seat row */}
          <div className="mt-3 grid grid-cols-3 gap-1 text-center bg-gray-50 rounded-xl px-2 py-2.5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Date</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{formatDate(booking.showtime_start)}</p>
            </div>
            <div className="border-x border-gray-200">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Time</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5">{formatTime(booking.showtime_start)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Seat</p>
              <p className="text-xs sm:text-sm font-bold text-gray-800 mt-0.5 truncate px-1">
                {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              className="rounded-full bg-gray-900 text-white hover:bg-gray-700 text-xs h-8 px-4"
              size="sm"
              onClick={() => setTicketOpen(true)}
            >
              <Ticket className="mr-1.5 h-3 w-3" />
              View Ticket
            </Button>

            {onChangeShowtime && (
              <Button
                variant="outline"
                className="rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 text-xs h-8 px-4"
                size="sm"
                onClick={onChangeShowtime}
              >
                <CalendarClock className="mr-1.5 h-3 w-3" />
                Change
              </Button>
            )}

            {canReview && movieId && bookingId && (
              <Button
                variant="outline"
                className="rounded-full border-amber-200 text-amber-600 hover:bg-amber-50 text-xs h-8 px-4"
                size="sm"
                onClick={() => setReviewOpen(true)}
              >
                <Star className="mr-1.5 h-3 w-3" />
                Review
              </Button>
            )}
          </div>
        </div>
      </div>

      <MovieTicketModal
        open={ticketOpen}
        onOpenChange={setTicketOpen}
        booking={booking}
      />

      {canReview && movieId && bookingId && (
        <WriteReviewModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          movieId={movieId}
          bookingId={bookingId}
          movieTitle={movieTitle}
          onSuccess={() => {
            setReviewOpen(false);
            onReviewSubmitted?.();
          }}
        />
      )}
    </>
  );
}
