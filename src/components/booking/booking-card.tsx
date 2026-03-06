// Helper functions for date/time formatting
function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}
function formatTime(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Star } from "lucide-react";
import { MovieTicketModal } from "./ticket-modal";
import { WriteReviewModal } from "@/components/community/WriteReviewModal";
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
      <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="flex gap-4 content-between">

          {/* Poster */}
          <div className="relative aspect-2/3 max-h-75 max-w-50 shrink-0 overflow-hidden rounded-xl">
            <img
              src={booking.poster_url || '/assets/images/placeholder.png'}
              alt={booking.movie_title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col content-between w-full">
            <div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 truncate">
                {booking.movie_title}
              </h1>
              <p className="mt-0.5 text-lg font-medium text-gray-400">{booking.screen_name}</p>
            </div>

            <div className="mt-4 flex justify-between">
              <div>
                <p className="text-lg font-medium uppercase text-gray-400">Date</p>
                <p className="text-xl font-bold text-gray-900">{formatDate(booking.showtime_start)}</p>
              </div>
              <div>
                <p className="text-lg font-medium uppercase text-gray-400">Show Time</p>
                <p className="text-xl font-bold text-gray-900">{formatTime(booking.showtime_start)}</p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex justify-between">
              <div className="flex-col content-between">
                <div className="mb-4">
                  <p className="text-lg font-medium uppercase text-gray-400">Seat</p>
                  <p className="text-xl font-bold text-gray-900">{Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>
                </div>

                <div className="flex w-full justify-start gap-2">
                  <Button
                    className="rounded-2xl bg-gray-900 text-white hover:bg-gray-700"
                    size="sm"
                    onClick={() => setTicketOpen(true)}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    View Ticket
                  </Button>

                  {onChangeShowtime && booking.booking_status === 'confirmed' && (
                    <Button
                      variant="outline"
                      className="rounded-2xl border-blue-300 text-blue-600 hover:bg-blue-50"
                      size="sm"
                      onClick={onChangeShowtime}
                    >
                      Change Showtime
                    </Button>
                  )}

                  {canReview && movieId && bookingId && (
                    <Button
                      variant="outline"
                      className="rounded-2xl border-amber-300 text-amber-600 hover:bg-amber-50"
                      size="sm"
                      onClick={() => setReviewOpen(true)}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Write a Review
                    </Button>
                  )}
                </div>
              </div>

              <div className="w-32 h-32">
                <QRCodeSVG value={String(booking.booking_id)} size={128} level="H" includeMargin={true} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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