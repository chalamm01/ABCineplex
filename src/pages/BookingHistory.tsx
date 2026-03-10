import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookingCard } from "@/components/booking/booking-card";
import { bookingsApi, showtimesApi, moviesApi, reviewApi } from "@/services/api";
import { Spinner } from "@/components/ui/spinner";
import { SeatMap } from "@/components/movies/seat-map";
import type { BookingSummary, ShowtimeCard, ReviewStatus, SeatInMap } from "@/types/api";

// Format seats for display - handles both string and object formats

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});

  const refreshReviewStatuses = async (confirmed: BookingSummary[]) => {
    const results = await Promise.allSettled(
      confirmed.map(b => reviewApi.getReviewStatus(b.booking_id.toString()))
    );
    const map: Record<string, ReviewStatus> = {};
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') map[confirmed[i].booking_id.toString()] = r.value;
    });
    setReviewStatuses(map);
  };

  // Change-showtime dialog state
  const [changingBooking, setChangingBooking] = useState<BookingSummary | null>(null);
  const [availableShowtimes, setAvailableShowtimes] = useState<ShowtimeCard[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [selectedNewShowtimeId, setSelectedNewShowtimeId] = useState<number | null>(null);
  const [changing, setChanging] = useState(false);
  // Step 2: seat selection for the new showtime
  const [changeStep, setChangeStep] = useState<1 | 2>(1);
  const [availableSeats, setAvailableSeats] = useState<SeatInMap[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    bookingsApi
      .getUserBookings(undefined, 1, 50)
      .then((res) => {
        const unique = Array.from(
          new Map(res.bookings.map(b => [b.booking_id.toString(), b])).values()
        );
        const confirmed = unique.filter((b) => b.booking_status === "confirmed");
        setBookings(confirmed);
        refreshReviewStatuses(confirmed);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to fetch booking history.")
      )
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // Unused function - kept for reference
  // const handleCancel = async (bookingId: string) => {
  //   if (!confirm("Cancel this booking? No refund will be issued per theatre policy.")) return;
  //   try {
  //     await bookingsApi.cancelBooking(bookingId);
  //     setRefreshKey(k => k + 1);
  //   } catch (err: unknown) {
  //     alert(err instanceof Error ? err.message : "Failed to cancel booking.");
  //   }
  // };

  // Scroll lock when change-showtime dialog is open
  useEffect(() => {
    if (changingBooking) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [changingBooking]);

  const openChangeShowtime = async (b: BookingSummary) => {
    setChangingBooking(b);
    setSelectedNewShowtimeId(null);
    setSelectedSeatIds([]);
    setChangeStep(1);
    if (!b.showtime_id) return;
    setShowtimesLoading(true);
    try {
      const detail = await showtimesApi.getShowtimeById(b.showtime_id);
      const movieId = (detail as unknown as Record<string, number>).movie_id ?? (detail.movie as unknown as Record<string, number>)?.id;
      if (!movieId) return;
      const data = await moviesApi.getMovieShowtimes(Number(movieId));
      console.log(data);
      const all: ShowtimeCard[] = Object.entries(data.showtimes_by_date ?? {}).flatMap(
        ([date, showtimes]) => showtimes.map(s => ({
          ...s,
          start_time: s.start_time ? `${date}T${s.start_time}` : s.start_time,
        }))
      );
      setAvailableShowtimes(all.filter(s => s.showtime_id !== b.showtime_id));
    } catch {
      setAvailableShowtimes([]);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const handleProceedToSeats = async () => {
    if (!selectedNewShowtimeId) return;
    setSeatsLoading(true);
    setChangeStep(2);
    setSelectedSeatIds([]);
    try {
      const res = await showtimesApi.getSeats(selectedNewShowtimeId);
      setAvailableSeats(res.seats ?? []);
    } catch {
      setAvailableSeats([]);
    } finally {
      setSeatsLoading(false);
    }
  };

  const toggleSeat = (row: string, col: number) => {
    const seat = availableSeats.find(s => s.row_label === row && s.seat_number === col);
    if (!seat) return;
    const seatId = seat.seat_id;
    const needed = changingBooking?.seats?.length ?? 1;
    setSelectedSeatIds(prev => {
      if (prev.includes(seatId)) return prev.filter(id => id !== seatId);
      if (prev.length >= needed) return prev;
      return [...prev, seatId];
    });
  };

  const handleChangeShowtime = async () => {
    if (!changingBooking || !selectedNewShowtimeId) return;
    const needed = changingBooking.seats?.length ?? 1;
    if (selectedSeatIds.length !== needed) {
      alert(`Please select exactly ${needed} seat(s).`);
      return;
    }
    if (!confirm("Change your showtime? No refund will be issued if downgrading.")) return;
    setChanging(true);
    try {
      await bookingsApi.changeShowtime(changingBooking.booking_id.toString(), selectedNewShowtimeId, selectedSeatIds);
      setChangingBooking(null);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to change showtime.");
    } finally {
      setChanging(false);
    }
  };

  /** Booking can have its showtime changed only once, and more than 30 min before showtime. */
  const canChange = (b: BookingSummary) =>
    b.booking_status === "confirmed" &&
    (b.change_count ?? 0) < 1 &&
    !!b.showtime_start && new Date(b.showtime_start).getTime() - Date.now() > 30 * 60 * 1000;

  return(
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <main className="min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 py-6 bg-white/70 backdrop-blur-md">
        <h1 className="mb-8 border-b-2 border-black pb-2 text-3xl font-extrabold uppercase tracking-tight text-black">
          Booking History
        </h1>
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh] text-gray-500"><Spinner /></div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {bookings.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500">No bookings found.</div>
            ) : (
              bookings.map((b) => {
                const rs = reviewStatuses[b.booking_id.toString()];
                return (
                  <BookingCard
                    key={b.booking_id.toString()}
                    booking={{
                      booking_id: b.booking_id,
                      movie_title: b.movie_title,
                      screen_name: b.screen_name,
                      showtime_start: b.showtime_start,
                      poster_url: b.poster_url,
                      seats: Array.isArray(b.seats)
                        ? b.seats.map(seat => typeof seat === 'string' ? seat : (seat.row_label && seat.seat_number ? `${seat.row_label}${seat.seat_number}` : 'N/A'))
                        : [],
                      booking_status: b.booking_status,
                    } as any}
                    onChangeShowtime={canChange(b) ? () => openChangeShowtime(b) : undefined}
                    canReview={rs?.can_review}
                    movieId={rs?.movie_id}
                    movieTitle={b.movie_title}
                    bookingId={b.booking_id.toString()}
                    onReviewSubmitted={() => refreshReviewStatuses(bookings)}
                  />
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Change Showtime Dialog — rendered via portal so backdrop-blur parent doesn't break fixed positioning */}
      {changingBooking && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60">
          <div className="bg-white w-full sm:max-w-2xl sm:mx-4 sm:rounded-2xl rounded-t-2xl p-5 sm:p-8 shadow-2xl space-y-4 overflow-y-auto max-h-[90dvh]">
            <h2 className="text-xl font-bold">
              Change Showtime {changeStep === 2 && '— Pick Seats'}
            </h2>
            <p className="text-sm text-gray-500">
              {changingBooking.movie_title}
              {changeStep === 2 && (
                <span className="ml-2 text-gray-400">· Select {changingBooking.seats?.length ?? 1} seat(s)</span>
              )}
            </p>

            {changeStep === 1 && (
              showtimesLoading ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : availableShowtimes.length === 0 ? (
                <p className="text-sm text-gray-500">No other showtimes available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                  {availableShowtimes.map(s => {
                    const isSelected = selectedNewShowtimeId === s.showtime_id;
                    const startDate = s.start_time ? new Date(s.start_time.replace(' ', 'T')) : null;
                    const dateStr = startDate
                      ? startDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                      : `Showtime #${s.showtime_id}`;
                    const timeStr = startDate
                      ? startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
                      : null;
                    return (
                      <button
                        key={s.showtime_id}
                        onClick={() => setSelectedNewShowtimeId(s.showtime_id)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-sm">{dateStr}</div>
                        {timeStr && (
                          <div className={`text-2xl font-bold mt-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                            {timeStr}
                          </div>
                        )}
                        <div className={`text-xs mt-2 space-y-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {s.theatre_name && <div>{s.theatre_name}</div>}
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isSelected ? 'text-white' : 'text-black'}`}>
                              ฿{s.base_price}
                            </span>
                            {s.available_seats !== undefined && (
                              <span>{s.available_seats} seats left</span>
                            )}
                          </div>
                          {s.badge_label && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {s.badge_label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            )}

            {changeStep === 2 && (
              seatsLoading ? (
                <div className="flex justify-center py-4"><Spinner /></div>
              ) : availableSeats.length === 0 ? (
                <p className="text-sm text-gray-500">No seats available for this showtime.</p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    {selectedSeatIds.length} / {changingBooking.seats?.length ?? 1} selected
                  </p>
                  <SeatMap
                    seats={availableSeats.map(s => {
                      let status: 'available' | 'reserved' | 'selected' | 'locked' = 'reserved';
                      if (selectedSeatIds.includes(s.seat_id)) status = 'selected';
                      else if (s.status === 'available') status = 'available';
                      else if (s.status === 'held') status = 'locked';
                      return { id: s.seat_id, row: s.row_label, col: s.seat_number, status };
                    })}
                    onSeatToggle={toggleSeat}
                  />
                </div>
              )
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
                onClick={() => {
                  if (changeStep === 2) { setChangeStep(1); setSelectedSeatIds([]); }
                  else setChangingBooking(null);
                }}
              >
                {changeStep === 2 ? 'Back' : 'Cancel'}
              </button>
              {changeStep === 1 ? (
                <button
                  disabled={!selectedNewShowtimeId}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                  onClick={handleProceedToSeats}
                >
                  Next: Pick Seats
                </button>
              ) : (
                <button
                  disabled={selectedSeatIds.length !== (changingBooking.seats?.length ?? 1) || changing}
                  className="px-4 py-2 rounded-lg bg-black text-white text-sm disabled:opacity-50"
                  onClick={handleChangeShowtime}
                >
                  {changing ? "Changing…" : "Confirm Change"}
                </button>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
