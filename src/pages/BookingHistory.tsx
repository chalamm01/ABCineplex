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
        interface ApiBooking {
          booking_id: string | number;
          movie_title?: string;
          screen_name?: string;
          showtime_start?: string;
          created_at: string;
          poster_url?: string;
          seats?: string[] | string;
        }

        const typedResponse = response as { bookings: ApiBooking[] };
        const mapped: BookingCardData[] = typedResponse.bookings.map((booking: ApiBooking) => ({
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
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch booking history.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  let content;
  if (loading) {
    content = <div className="text-center text-gray-500"><Spinner/></div>;
  } else if (error) {
    content = <div className="text-center text-red-500">{error}</div>;
  } else {
    content = (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {bookings.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500">No bookings found.</div>
        ) : (
          bookings.map((booking) => (
            <BookingCard key={booking.id} {...booking} />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <main className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <h1 className="mb-8 border-b-2 border-black pb-2 text-3xl font-extrabold uppercase tracking-tight text-black">
          Booking History
        </h1>
        {content}
      </main>
    </div>
  );
}

// ...existing code...
