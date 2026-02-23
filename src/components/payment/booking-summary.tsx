import { ChevronDown } from 'lucide-react';

export interface BookingDetails {
  movieTitle: string;
  posterUrl: string;
  cinemaName: string;
  showTime: string;
  endTime: string;
  seats: string[];
  subtotal: number;
  discount: number;
  discountLabel?: string;
  total: number;
}

interface BookingSummaryProps {
  booking: BookingDetails;
  countdown: string;
}

export function BookingSummary({ booking, countdown }: BookingSummaryProps) {
  const formatTitle = (title: string) => {
    const words = title.toUpperCase().split(' ');
    if (words.length <= 2) return title.toUpperCase();

    const midpoint = Math.ceil(words.length / 2);
    return (
      <>
        {words.slice(0, midpoint).join(' ')}
        <br />
        {words.slice(midpoint).join(' ')}
      </>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight uppercase">Booking Summary</h2>
        <span className="text-xl font-mono font-bold text-red-600">{countdown}</span>
      </div>

      {/* Movie Info */}
      <div className="flex gap-6 mb-8">
        <div className="w-32 h-44 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0 relative">
          {booking.posterUrl ? (
            <img
              src={booking.posterUrl}
              alt={booking.movieTitle}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-slate-700 flex items-center justify-center">
              <span className="text-slate-400 text-xs">No Poster</span>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-start">
          <h3 className="text-3xl font-black leading-tight mb-2">
            {formatTitle(booking.movieTitle)}
          </h3>
          <p className="text-slate-500 font-medium italic">{booking.cinemaName}</p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="space-y-4 border-b border-slate-200 pb-6 mb-6">
        <div>
          <p className="text-sm text-slate-400 font-bold uppercase">Show Time</p>
          <p className="text-lg font-bold">{booking.showTime}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-bold uppercase">End Time</p>
          <p className="text-lg font-bold">{booking.endTime}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-bold uppercase">Seat(s)</p>
          <p className="text-lg font-bold">{booking.seats.join(', ')}</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500 font-medium">Subtotal</span>
          <span className="font-bold">{booking.subtotal.toLocaleString()} Baht</span>
        </div>
        {booking.discount > 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                Discount <ChevronDown className="w-4 h-4" />
              </span>
              <span className="font-bold text-green-600">-{booking.discount.toLocaleString()} Baht</span>
            </div>
            {booking.discountLabel && (
              <div className="flex justify-end text-xs text-slate-400">
                <span>{booking.discountLabel}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Total */}
      <div className="mt-auto pt-4 border-t-2 border-slate-900 flex justify-between items-baseline">
        <span className="text-2xl font-bold uppercase">Total</span>
        <div className="text-right">
          <span className="text-3xl font-black">{booking.total.toLocaleString()} Baht</span>
        </div>
      </div>
    </div>
  );
}
