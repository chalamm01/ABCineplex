import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingMovieInfo } from '@/components/movies/booking-movie-info';
import { DateTimeSelection } from '@/components/movies/date-time-selection';
import { SeatMap } from '@/components/movies/seat-map';
import { TicketSummary } from '@/components/movies/ticket-summary';
import { moviesApi, showtimesApi } from '@/services/api';
import type { APISeat } from '@/services/api';
import type { MovieDetail, ShowtimeCard } from '@/types/api';
import { Spinner } from '@/components/ui/spinner';

// Use types from api.ts
import type { SeatInMap, DateGroupShowtime as ApiDateGroupShowtime } from '@/types/api';
import type { Seat as ApiSeat } from '@/types/api';
import type { BookingDate } from '@/lib/constants/movies';

type Seat = {
  id: number;
  row: string;
  col: number;
  status: 'available' | 'reserved' | 'selected' | 'locked';
  price?: number;
};

type DateGroupShowtime = ApiDateGroupShowtime & { showtimes: { time: string; showtimeId: number; status: 'available' | 'selected' | 'sold_out' | 'past' }[] };

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
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        const dates: BookingDate[] = Object.keys(byDate)
          .sort((a, b) => a.localeCompare(b))
          .map((dateStr) => {
            const d = new Date(dateStr);
            return {
              day: d.getUTCDate(),
              month: monthNames[d.getUTCMonth()],
              dayName: dayNames[d.getUTCDay()],
              fullDate: dateStr,
            };
          });

        // Build summarized showtimes with date-specific time slots
        const grouped: DateGroupShowtime[] = dates.map((date) => {
          const cards: ShowtimeCard[] = byDate[date.fullDate || ''] ?? [];
          const showtimes = cards.map((card: ShowtimeCard) => ({
            time: card.start_time ?? 'N/A',
            showtimeId: card.showtime_id,
            status: 'available' as const,
          }));
          return { ...date, showtimes };
        });

        setBookingDates(dates);
        setSummarizedShowtimes(grouped);
        setSelectedDate(0);
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
        setShowtimesByDate({});
        setSummarizedShowtimes([]);
      }
    };

    if (movieId) fetchShowtimes();
  }, [movieId]);

  // Update available times when selected date changes
  useEffect(() => {
    if (bookingDates.length === 0) return;

    const dateKey = bookingDates[selectedDate]?.fullDate;
    if (!dateKey) return;

    const cards = showtimesByDate[dateKey] ?? [];
    const times = [...new Set(cards.map((c) => c.start_time ?? 'N/A'))].sort((a, b) => a.localeCompare(b));
    setBookingTimes(times);
    setSelectedTime(times[0] ?? '');
  }, [selectedDate, bookingDates, showtimesByDate]);

  // Fetch sea map when showtime selection changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedTime || bookingDates.length === 0) return;

      const dateKey = bookingDates[selectedDate]?.fullDate;
      if (!dateKey) return;

      const card = (showtimesByDate[dateKey] ?? []).find(
        (c) => (c.start_time ?? 'N/A') === selectedTime
      );
      if (!card) return;

      setCurrentShowtimeId(card.showtime_id);
      try {
        const seatsData: APISeat[] = await showtimesApi.getSeats(card.showtime_id);
        if (seatsData && seatsData.length > 0) {
          const mapped: Seat[] = seatsData.map((s) => ({
            id: s.seat_id,
            row: s.row_label,
            col: s.seat_number,
            status: s.status?.toLowerCase() === 'available' ? 'available' : 'reserved',
            price: s.price ?? card.ticket_price_normal ?? undefined,
          }));
          setSeats(mapped);
        } else {
          setSeats([]);
        }
      } catch (error) {
        console.error('Failed to fetch seats', error);
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
      alert('Please sign in to book tickets.');
      navigate('/login');
      return;
    }

    try {
      setIsBooking(true);

      const selectedSeatIds = seats.filter((s) => s.status === 'selected').map((s) => s.id);
      const holdResult = await showtimesApi.holdSeats(currentShowtimeId, selectedSeatIds);

      const seatLabels = seats
        .filter((s) => s.status === 'selected')
        .map((s) => `${s.row}${s.col}`)
        .join(',');

      const params = new URLSearchParams({
        hold_id: String(holdResult.hold_id ?? ''),
        showtime_id: String(currentShowtimeId),
        seats: seatLabels,
        total: String(seatsTotalPrice),
        expires_at: holdResult.expires_at ?? '',
      });

      navigate(`/payment?${params.toString()}`);
    } catch (error) {
      console.error('Booking failed', error);
      alert('Could not hold seats. They may have been taken. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const selectedSeats = seats
    .filter((s) => s.status === 'selected')
    .map((s) => `${s.row}${s.col}`);

  const seatsTotalPrice = seats
    .filter((s) => s.status === 'selected')
    .reduce((sum, s) => sum + (s.price ?? 0), 0);

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
  const movieDuration = movie.duration_minutes;

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <section className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
              <div className="relative group hidden lg:block">
                <div className="relative aspect-2/3 w-full h-full bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={movie.poster_url ?? ''}
                    alt={movie.title}
                    className="w-full h-full object-cover"
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
            <DateTimeSelection
              dates={bookingDates}
              times={bookingTimes}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              summarizedShowtimes={summarizedShowtimes}
            />

            <div className="flex justify-center gap-8 items-start">
              <TicketSummary
                selectedSeats={selectedSeats}
                selectedDate={bookingDates[selectedDate]}
                selectedTime={selectedTime}
                totalPrice={seatsTotalPrice}
                onBook={handleBooking}
                isBooking={isBooking}
              />

              {seats.length > 0 ? (
                <SeatMap seats={seats} onSeatToggle={toggleSeat} />
              ) : (
                <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300">
                  <Spinner />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
