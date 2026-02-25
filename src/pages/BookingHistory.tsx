import { useEffect, useState } from "react";
import { BookingCard } from "@/components/booking/booking-card";
import { bookingsApi } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
interface BookingCardData {
  id: string;
  title: string;
  cinema: string;
  date: string;
  showTime: string;
  transactionNo: string;
  posterUrl: string;
  seats: string;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const response = await bookingsApi.getUserBookings();
        // response.bookings is an array of BookingDetail
        const mapped: BookingCardData[] = response.bookings.map((booking: any) => ({
          id: booking.booking_id.toString(),
          title: booking.movie_title || "Unknown",
          cinema: booking.screen_name || "ABCineplex",
          date: booking.showtime_start
            ? new Date(booking.showtime_start).toLocaleDateString()
            : new Date(booking.created_at).toLocaleDateString(),
          showTime: booking.showtime_start
            ? new Date(booking.showtime_start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "-",
          transactionNo: booking.booking_id.toString(),
          posterUrl: booking.poster_url || "/posters/default.jpg",
          seats: Array.isArray(booking.seats) ? booking.seats.join(", ") : String(booking.seats || "-"),
        }));
        setBookings(mapped);
      } catch (err: any) {
        setError(err.message || "Failed to fetch booking history.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-32 py-6">
      <h1 className="mb-8 border-b-2 border-black pb-2 text-3xl font-extrabold uppercase tracking-tight text-black">
        Booking History
      </h1>

      {loading ? (
        <div className="text-center text-gray-500"><Spinner/></div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {bookings.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500">No bookings found.</div>
          ) : (
            bookings.map((booking) => (
              <BookingCard key={booking.id} {...booking} />
            ))
          )}
        </div>
      )}
    </main>
  );
}

// ...existing code...
