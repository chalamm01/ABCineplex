import { useEffect, useState } from "react";
import { BookingCard } from "@/components/booking/booking-card";
import { bookingsApi } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
import type { BookingSummary } from "@/types/api";

  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bookingsApi
      .getUserBookings("confirmed")
      .then((res) => setBookings(res.bookings))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to fetch booking history.")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <main className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <h1 className="mb-8 border-b-2 border-black pb-2 text-3xl font-extrabold uppercase tracking-tight text-black">
          Booking History
        </h1>
        {loading ? (
          <div className="text-center text-gray-500"><Spinner /></div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {bookings.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500">No bookings found.</div>
            ) : (
              bookings.map((b) => <BookingCard key={b.id} {...b} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
}
