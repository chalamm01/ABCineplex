import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingMovieInfo } from '@/components/movies/booking-movie-info';
import { DateTimeSelection } from '@/components/movies/date-time-selection';
import { SeatMap } from '@/components/movies/seat-map';
import { TicketSummary } from '@/components/movies/ticket-summary';
import { moviesApi, showtimesApi, userApi } from '@/services/api';
import type { MovieDetail, ShowtimeCard } from '@/types/api';
import { CalendarX } from 'lucide-react';
import type { BookingDate } from '@/lib/constants/movies';
import { Spinner } from '@/components/ui/spinner';
type Seat = {
  id: number;
  row: string;
  col: number;
  status: 'available' | 'reserved' | 'selected' | 'locked';
  price?: number;
};

type DateGroupShowtime = {
  date: string;
  fullDate: string;
  dayName: string;
  day: number;
  month: number;
  showtimes: { time: string; endTime: string; showtimeId: number; status: 'available' | 'selected' | 'sold_out' | 'past'; raqs?: number; ttc?: number }[]
};

const extractTime = (datetime?: string): string => {
  if (!datetime) return 'N/A';
  try {
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      return datetime.split('T')[1]?.substring(0, 5) || datetime;
    }
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return datetime;
  }
};

export default function MovieBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');
  const movieId = Number(id);

  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState<string | null>(null);

  // showtimes_by_date: { "YYYY-MM-DD": ShowtimeCard[] }
  const [showtimesByDate, setShowtimesByDate] = useState<Record<string, ShowtimeCard[]>>({});

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState<number | null>(null);

  const [bookingDates, setBookingDates] = useState<BookingDate[]>([]);
  const [bookingTimes, setBookingTimes] = useState<string[]>([]);
  const [summarizedShowtimes, setSummarizedShowtimes] = useState<DateGroupShowtime[]>([]);
  const [showtimesLoading, setShowtimesLoading] = useState(true);
  const [ticketType, setTicketType] = useState<'normal' | 'student'>('normal');
  const [isStudentEligible, setIsStudentEligible] = useState(false);
  const [showGuestDialog, setShowGuestDialog] = useState(false);

  // Fetch user profile for student eligibility check
  useEffect(() => {
    if (!isAuthenticated) return;
    userApi.getProfile()
      .then(p => setIsStudentEligible(!!(p.is_student && p.student_id_verified)))
      .catch(() => {});
  }, [isAuthenticated]);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setMovieLoading(true);
        setMovieError(null);
        const data = await moviesApi.getMovieById(movieId);

        setMovie(data);
      } catch (error) {
        console.error('Failed to fetch movie:', error);
        setMovieError('Failed to load movie details');
      } finally {
        setMovieLoading(false);
      }
    };

    if (movieId) fetchMovie();
  }, [movieId]);

  // Fetch showtimes grouped by date
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const data = await moviesApi.getShowtimesByMovie(movieId);
        console.log(data);
        const byDate = data.showtimes_by_date ?? {};
        setShowtimesByDate(byDate);

        const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dates: any[] = Object.keys(byDate)
          .sort((a, b) => a.localeCompare(b))
          .map((dateStr) => {
            const d = new Date(dateStr);
            const cards: ShowtimeCard[] = byDate[dateStr] ?? [];
            const showtimes = cards.map((card: ShowtimeCard) => {
              const startTime = extractTime(card.start_time);
              const endTime = extractTime(card.end_time);
              return {
                time: startTime,
                endTime: endTime,
                showtimeId: card.showtime_id,
                status: 'available' as const,
                raqs: card.risk_adjusted_quality_score,
                ttc: card.total_time_commitment_minutes,
              };
            });
            return {
              date: dateStr,
              fullDate: dateStr,
              day: d.getUTCDate(),
              month: d.getUTCMonth(),
              dayName: dayNames[d.getUTCDay()],
              showtimes,
            };
          });

        const grouped: DateGroupShowtime[] = dates;
        setBookingDates(dates);
        setSummarizedShowtimes(grouped);
        setSelectedDate(0);
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
        setShowtimesByDate({});
        setSummarizedShowtimes([]);
      } finally {
        setShowtimesLoading(false);
      }
    };

    if (movieId) fetchShowtimes();
  }, [movieId]);

  // Update available times when selected date changes
  useEffect(() => {
    if (bookingDates.length === 0) return;

    const dateKey = bookingDates[selectedDate]?.date;
    if (!dateKey) return;

    const cards = showtimesByDate[dateKey] ?? [];
    const times = [...new Set(cards.map((c) => extractTime(c.start_time)))].sort((a, b) => a.localeCompare(b));
    setBookingTimes(times);
    setSelectedTime(times[0] ?? '');
  }, [selectedDate, bookingDates, showtimesByDate]);

  // Fetch sea map when showtime selection changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedTime || bookingDates.length === 0) return;

      const dateKey = bookingDates[selectedDate]?.date;
      if (!dateKey) return;

      const card = (showtimesByDate[dateKey] ?? []).find(
        (c) => extractTime(c.start_time) === selectedTime
      );
      if (!card) return;

      setCurrentShowtimeId(card.showtime_id);
      try {
        console.log('Fetching seats for showtime:', card.showtime_id);
        const response = await showtimesApi.getSeats(card.showtime_id);
        console.log('Seats response:', response);
        const seatsData = response.seats ?? [];
        console.log('Extracted seats data:', seatsData);
        if (seatsData.length > 0) {
          const mapped: Seat[] = seatsData.map((s) => ({
            id: s.seat_id,
            row: s.row_label,
            col: s.seat_number,
            status: s.status?.toLowerCase() === 'available' ? 'available' : 'reserved',
            price: card.base_price ?? undefined,
          }));
          console.log('Mapped seats:', mapped);
          setSeats(mapped);
        } else {
          console.warn('No seats returned from API');
          setSeats([]);
        }
      } catch (error) {
        console.error('Failed to fetch seats:', error);
        setSeats([]);
      }
    };

    fetchSeats();
  }, [selectedTime, selectedDate, bookingDates, showtimesByDate]);

  const toggleSeat = (row: string, col: number) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.row !== row || seat.col !== col) return seat;
        if (seat.status === 'reserved') return seat;
        return { ...seat, status: seat.status === 'available' ? 'selected' : 'available' };
      })
    );
  };

  const handleBooking = async () => {
    if (!currentShowtimeId || selectedSeats.length === 0) return;

    if (!isAuthenticated) {
      setShowGuestDialog(true);
      return;
    }

    try {
      setIsBooking(true);

      const selectedSeatIds = seats.filter((s) => s.status === 'selected').map((s) => s.id);
      const holdResult = await showtimesApi.holdSeats(currentShowtimeId, selectedSeatIds, ticketType);

      const seatLabels = seats
        .filter((s) => s.status === 'selected')
        .map((s) => `${s.row}${s.col}`)
        .join(',');

      const params = new URLSearchParams({
        booking_id: String(holdResult.hold_id ?? ''),
        movie_id: String(movieId),
        showtime_id: String(currentShowtimeId),
        seats: seatLabels,
        total: String(seatsTotalPrice),
        deadline: holdResult.expires_at ?? '',
        ticket_type: ticketType,
      });

      navigate(`/payment?${params.toString()}`);
    } catch (error) {
      console.error('Booking failed', error);
      alert('Could not hold seats. They may have been taken. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleContinueAsGuest = () => {
    if (!currentShowtimeId || selectedSeats.length === 0) return;
    setShowGuestDialog(false);
    const selectedSeatIds = seats.filter((s) => s.status === 'selected').map((s) => s.id);
    const seatLabels = seats.filter((s) => s.status === 'selected').map((s) => `${s.row}${s.col}`).join(',');
    const params = new URLSearchParams({
      showtime_id: String(currentShowtimeId),
      seat_ids: selectedSeatIds.join(','),
      seats: seatLabels,
      total: String(seatsTotalPrice),
      ticket_type: ticketType,
      guest: 'true',
    });
    navigate(`/payment?${params.toString()}`);
  };

  const selectedSeats = seats
    .filter((s) => s.status === 'selected')
    .map((s) => `${s.row}${s.col}`);

  const currentCard = (() => {
    const dateKey = bookingDates[selectedDate]?.date;
    if (!dateKey) return null;
    return (showtimesByDate[dateKey] ?? []).find(c => extractTime(c.start_time) === selectedTime) ?? null;
  })();

  const currentCardEndTime = currentCard ? extractTime(currentCard.end_time) : undefined;

  const pricePerSeat = ticketType === 'student'
    ? ((currentCard?.base_price ?? 0) - (currentCard?.student_discount_baht ?? 0))
    : (currentCard?.base_price ?? 0);

  const seatsTotalPrice = seats.filter(s => s.status === 'selected').length * pricePerSeat;

  if (movieLoading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (movieError || !movie) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
        <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
          <div className="flex justify-center items-center py-20">
            <p className="text-lg text-red-600">{movieError || 'Movie not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Get the correct duration (runtime_minutes or duration_minutes)

  return (
    <>
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <section className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
              <div className="relative group hidden lg:block">
                <div className="relative aspect-2/3 w-full h-full bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={movie.poster_url ?? '/assets/images/placeholder.png'}
                    alt={movie.title}
                    className="w-full h-full"
                  />
                </div>
              </div>
              {/* Pass duration as a prop or use in BookingMovieInfo if needed */}
              <BookingMovieInfo movie={movie}/>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {showtimesLoading ? (
              <div className="bg-white rounded-xl p-12 border border-neutral-300 flex items-center justify-center">
                <Spinner />
              </div>
            ) : bookingDates.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-neutral-300">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                    <CalendarX className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-neutral-800 mb-1">
                      No Showtimes Available
                    </h3>
                    <p className="text-sm text-neutral-500">
                      There are currently no scheduled screenings for this movie.<br />
                      Check back soon or explore other films.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/movies')}
                    className="mt-2 px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Browse Other Movies
                  </button>
                </div>
              </div>
            ) : (
              <>


                <div className="flex justify-between gap-8">
                  <div className="w-full">
                <DateTimeSelection
                  dates={bookingDates}
                  times={bookingTimes}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  summarizedShowtimes={summarizedShowtimes}
                />

<TicketSummary
  selectedSeats={selectedSeats}
  selectedDate={bookingDates[selectedDate]}
  selectedTime={selectedTime}
  totalPrice={seatsTotalPrice}
  onBook={handleBooking}
  isBooking={isBooking}
  isStudentEligible={isStudentEligible}
  onTicketTypeChange={setTicketType} // You already had this
  ticketType={ticketType}            // ADD THIS LINE
  endTime={currentCardEndTime}
/>
</div>
                  {seats.length > 0 ? (
                    <SeatMap seats={seats} onSeatToggle={toggleSeat} />
                  ) : (
                    <div className="flex items-center justify-center bg-white rounded-xl p-6 sm:p-8 border border-neutral-300 w-1/2">
                      <Spinner />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>

    {/* Guest / Auth choice dialog */}
    {showGuestDialog && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55"
        onClick={() => setShowGuestDialog(false)}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-gray-900">How would you like to continue?</h2>
          <p className="text-sm text-gray-500">Sign in to earn loyalty points, or continue as a guest.</p>
          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={() => { setShowGuestDialog(false); navigate('/login'); }}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700"
            >
              Log in / Sign up
            </button>
            <button
              onClick={handleContinueAsGuest}
              className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
