import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingMovieInfo } from '@/components/movies/booking-movie-info';
import { DateTimeSelection } from '@/components/movies/date-time-selection';
import { SeatMap } from '@/components/movies/seat-map';
import { TicketSummary } from '@/components/movies/ticket-summary';
import { moviesApi, showtimesApi, bookingsApi } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Movie } from '@/types/api';
import type { BookingDate } from '@/lib/constants/movies';
import { Spinner } from '@/components/ui/spinner'


type SeatStatus = 'available' | 'reserved' | 'selected' | 'locked';

interface Seat {
  id: number;
  row: string;
  col: number;
  status: SeatStatus;
  price?: number;
}

interface Showtime {
  id: number;
  movie_id: number;
  screen_id: number;
  start_time: string;
  base_price: number;
  created_at: string;
}

export default function MovieBooking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const movieId = Number(id);

  // Movie state
  const [movie, setMovie] = useState<Movie | null>(null);
  const [movieLoading, setMovieLoading] = useState(true);
  const [movieError, setMovieError] = useState<string | null>(null);

  // Showtimes state
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [currentShowtimeId, setCurrentShowtimeId] = useState<number | null>(null);

  // Derived state for booking dates/times from showtimes
  const [bookingDates, setBookingDates] = useState<BookingDate[]>([]);
  const [bookingTimes, setBookingTimes] = useState<string[]>([]);

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

    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);

  // Fetch showtimes and process dates
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const data = await showtimesApi.getShowtimesByMovie(movieId);
        setShowtimes(data || []);

        if (data && data.length > 0) {
          const uniqueDates = new Set<string>();
          const dates: BookingDate[] = [];
          const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

          data.forEach((stime) => {
            const date = new Date(stime.start_time);
            const dateStr = date.toDateString();
            if (!uniqueDates.has(dateStr)) {
              uniqueDates.add(dateStr);
              dates.push({
                day: date.getDate(),
                month: monthNames[date.getMonth()],
                dayName: dayNames[date.getDay()],
                fullDate: dateStr,
              });
            }
          });

          dates.sort((a, b) => new Date(a.fullDate || '').getTime() - new Date(b.fullDate || '').getTime());
          setBookingDates(dates);

          if (dates.length > 0) {
            setSelectedDate(0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch showtimes:', error);
        setShowtimes([]);
      }
    };

    if (movieId) {
      fetchShowtimes();
    }
  }, [movieId]);

  // Update times when date changes
  useEffect(() => {
    if (bookingDates.length > 0 && showtimes.length > 0) {
      const selectedDateObj = bookingDates[selectedDate];
      const timesForDate = showtimes
        .filter((s) => new Date(s.start_time).toDateString() === selectedDateObj.fullDate)
        .map((s) => {
          const date = new Date(s.start_time);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        })
        .sort();

      const uniqueTimes = Array.from(new Set(timesForDate));

      setBookingTimes(uniqueTimes);
      if (uniqueTimes.length > 0) {
        setSelectedTime(uniqueTimes[0]);
      } else {
        setSelectedTime('');
      }
    }
  }, [selectedDate, bookingDates, showtimes]);

  // Find showtime ID and fetch seats when time changes
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedTime || bookingDates.length === 0) return;

      const selectedDateObj = bookingDates[selectedDate];

      const showtime = showtimes.find((s) => {
        const d = new Date(s.start_time);
        const t = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return d.toDateString() === selectedDateObj.fullDate && t === selectedTime;
      });

      if (showtime) {
        setCurrentShowtimeId(showtime.id);
        try {
          const seatsData = await showtimesApi.getSeats(showtime.id);
          if (seatsData && seatsData.length > 0) {
            const mappedSeats = seatsData.map((s) => ({
              id: s.seat_id,
              row: s.row_label,
              col: s.seat_number,
              status: s.status?.toLowerCase() === 'available' ? 'available' as const : 'reserved' as const,
              price: s.price,
            }));
            setSeats(mappedSeats);
          } else {
            setSeats([]);
          }
        } catch (error) {
          console.error("Failed to fetch seats", error);
        }
      }
    };

    fetchSeats();
  }, [selectedTime, selectedDate, bookingDates, showtimes]);

  const toggleSeat = (row: string, col: number) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (seat.row === row && seat.col === col) {
          if (seat.status === 'reserved') return seat;
          return {
            ...seat,
            status: seat.status === 'available' ? 'selected' : 'available',
          };
        }
        return seat;
      })
    );
  };

  const handleBooking = async () => {
    if (!currentShowtimeId || selectedSeats.length === 0) return;

    if (!isAuthenticated || !user) {
      alert('Please sign in to book tickets.');
      navigate('/login');
      return;
    }

    try {
      setIsBooking(true);
      const showtime = showtimes.find((s) => s.id === currentShowtimeId);
      const screenId = showtime?.screen_id;

      if (!screenId) {
        alert('Error: Could not determine screen for booking.');
        return;
      }

      const selectedSeatIds = seats
        .filter(s => s.status === 'selected')
        .map(s => s.id);

      const pricePerSeat = seats.find(s => s.status === 'selected')?.price || 15;

      const reserveResult = await bookingsApi.reserveSeats({
        user_id: user.id,
        showtime_id: currentShowtimeId,
        seat_ids: selectedSeatIds,
        price_per_seat: pricePerSeat,
      });

      if (!reserveResult.success || !reserveResult.booking_id) {
        alert(`Reservation failed: ${reserveResult.error || 'Some seats are no longer available'}`);
        const seatsData = await showtimesApi.getSeats(currentShowtimeId);
        if (seatsData && seatsData.length > 0) {
          setSeats(seatsData.map((s) => ({
            id: s.seat_id,
            row: s.row_label,
            col: s.seat_number,
            status: s.status?.toLowerCase() === 'available' ? 'available' as const : 'reserved' as const,
            price: s.price,
          })));
        }
        return;
      }

      const seatLabels = seats
        .filter(s => s.status === 'selected')
        .map(s => `${s.row}${s.col}`)
        .join(',');

      const params = new URLSearchParams({
        booking_id: String(reserveResult.booking_id),
        movie_id: String(movieId),
        showtime_id: String(currentShowtimeId),
        seats: seatLabels,
        total: String(reserveResult.total_amount || seatsTotalPrice),
        deadline: reserveResult.payment_deadline ? new Date(reserveResult.payment_deadline).toISOString() : '',
      });

      navigate(`/payment?${params.toString()}`);
    } catch (error) {
      console.error('Booking failed', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const selectedSeats = seats
    .filter((s) => s.status === 'selected')
    .map((s) => `${s.row}${s.col}`);

  const seatsTotalPrice = seats
    .filter((s) => s.status === 'selected')
    .reduce((sum, s) => sum + (s.price || 15), 0);

  if (movieLoading) {
    return (
      <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
        <div className="flex justify-center items-center py-20">
          <Spinner/>
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

  return (
    <div className="bg-[url('/assets/background/bg.png')] bg-cover bg-center min-h-screen">
      <div className="min-h-screen px-32 py-6 bg-white/70 backdrop-blur-md">
      {/* Hero Section - Movie Info */}
      <section className=" px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
            {/* Movie Poster */}
            <div className="relative group hidden lg:block">
              <div className="relative aspect-2/3 w-full h-full bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Movie Details */}
            <BookingMovieInfo movie={movie} />
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Date & Time Selection */}
          <DateTimeSelection
            dates={bookingDates}
            times={bookingTimes}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={setSelectedDate}
            onTimeChange={setSelectedTime}
          />

          {/* Seat Selection & Summary */}
          <div className="flex justify-center gap-8 items-start">
            {/* Ticket Summary - Left */}
            <TicketSummary
              selectedSeats={selectedSeats}
              selectedDate={bookingDates[selectedDate]}
              selectedTime={selectedTime}
              totalPrice={seatsTotalPrice}
              onBook={handleBooking}
              isBooking={isBooking}
            />

            {/* Seat Map - Right */}
            {seats.length > 0 ? (
              <SeatMap seats={seats} onSeatToggle={toggleSeat} />
            ) : (
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-neutral-300">
                <Spinner/>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
