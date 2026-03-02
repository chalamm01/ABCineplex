import { useEffect, useState } from "react";
import { BookingCard } from "@/components/booking/booking-card";
import { bookingsApi, showtimesApi, moviesApi } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
import type { BookingSummary, ShowtimeCard } from "@/types/api";

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Change-showtime dialog state
  const [changingBooking, setChangingBooking] = useState<BookingSummary | null>(null);
  const [availableShowtimes, setAvailableShowtimes] = useState<ShowtimeCard[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [selectedNewShowtimeId, setSelectedNewShowtimeId] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bookingsApi
      .getUserBookings(undefined, 1, 50)
      .then((res) => setBookings(res.bookings))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to fetch booking history.")
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Cancel this booking? No refund will be issued per theatre policy.")) return;
    try {
      await bookingsApi.cancelBooking(bookingId);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel booking.");
    }
  };

  const openChangeShowtime = async (b: BookingSummary) => {
    setChangingBooking(b);
    setSelectedNewShowtimeId(null);
    if (!b.showtime_id) return;
    setShowtimesLoading(true);
    try {
      const detail = await showtimesApi.getShowtimeById(b.showtime_id);
      const movieId = (detail as unknown as Record<string, number>).movie_id ?? (detail.movie as unknown as Record<string, number>)?.id;
      if (!movieId) return;
      const data = await moviesApi.getMovieShowtimes(Number(movieId));
      const all: ShowtimeCard[] = Object.values(data.showtimes_by_date ?? {}).flat();
      setAvailableShowtimes(all.filter(s => s.showtime_id !== b.showtime_id));
    } catch {
      setAvailableShowtimes([]);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const handleChangeShowtime = async () => {
    if (!changingBooking || !selectedNewShowtimeId) return;
    if (!confirm("Change your showtime? No refund will be issued if downgrading.")) return;
    setChanging(true);
    try {
      await bookingsApi.changeShowtime(changingBooking.booking_id.toString(), selectedNewShowtimeId, []);
      setChangingBooking(null);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to change showtime.");
    } finally {
      setChanging(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  return(
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
              bookings.map((b) => (
                <BookingCard
                  key={b.booking_id.toString()}
                  id={b.booking_id.toString()}
                  title={b.movie_title || "Unknown Movie"}
                  cinema={b.screen_name || "Unknown Hall"}
                  date={formatDate(b.showtime_start)}
                  showTime={formatTime(b.showtime_start)}
                  transactionNo={b.booking_id.toString()}
                  posterUrl={b.poster_url || ""}
                  seats={b.seats?.join(", ") || "N/A"}
                  status={b.booking_status}
                  onCancel={b.booking_status === "confirmed" ? () => handleCancel(b.booking_id.toString()) : undefined}
                  onChangeShowtime={b.booking_status === "confirmed" ? () => openChangeShowtime(b) : undefined}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Change Showtime Dialog */}
      {changingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-4">
            <h2 className="text-xl font-bold">Change Showtime</h2>
            <p className="text-sm text-gray-500">
              Current booking: <span className="font-semibold">{changingBooking.movie_title}</span>
            </p>
            {showtimesLoading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : availableShowtimes.length === 0 ? (
              <p className="text-sm text-gray-500">No other showtimes available.</p>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                value={selectedNewShowtimeId ?? ''}
                onChange={e => setSelectedNewShowtimeId(Number(e.target.value))}
              >
                <option value="">— Select new showtime —</option>
                {availableShowtimes.map(s => (
                  <option key={s.showtime_id} value={s.showtime_id}>
                    {s.start_time ?? `Showtime #${s.showtime_id}`}
                    {s.ticket_price_normal ? ` · ฿${s.ticket_price_normal}` : ''}
                  </option>
                ))}
              </select>
            )}
            <div className="flex gap-3 justify-end pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                onClick={() => setChangingBooking(null)}
              >
                Cancel
              </button>
              <button
                disabled={!selectedNewShowtimeId || changing}
                className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                onClick={handleChangeShowtime}
              >
                {changing ? "Changing…" : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
