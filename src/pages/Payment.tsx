import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PaymentMethodSelector,
  CardPaymentForm,
  PromptPayForm,
  BookingSummary,
  type PaymentMethod,
  type BookingDetails,
} from '@/components/payment';
import { useCountdown } from '@/hooks/useCountdown';
import { bookingsApi, moviesApi, showtimesApi } from '@/services/api';
import { Zap, CheckCircle } from 'lucide-react';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('booking_id');
  const movieId = searchParams.get('movie_id');
  const showtimeId = searchParams.get('showtime_id');
  const seatsParam = searchParams.get('seats');
  const totalParam = searchParams.get('total');
  const deadlineParam = searchParams.get('deadline');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiration, setExpiration] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Booking data state
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDeadline, setPaymentDeadline] = useState<Date>(
    deadlineParam ? new Date(deadlineParam) : new Date(Date.now() + 5 * 60 * 1000)
  );

  // Countdown hook
  const { formatted: countdown, isExpired } = useCountdown({
    deadline: paymentDeadline,
    onExpire: useCallback(() => {
      if (!paymentSuccess) {
        alert('Payment time expired. Your reservation has been cancelled.');
        navigate('/');
      }
    }, [navigate, paymentSuccess]),
  });

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        let movieTitle = 'Movie';
        let posterUrl = '';
        let showTime = '';
        let endTime = '';
        let seats: string[] = [];
        let total = 0;

        if (movieId) {
          try {
            const movie = await moviesApi.getMovieById(Number(movieId));
            movieTitle = movie.title;
            posterUrl = movie.poster_url;
          } catch {
            console.error('Failed to fetch movie');
          }
        }

        if (showtimeId) {
          try {
            const showtime = await showtimesApi.getShowtime(Number(showtimeId));
            const startDate = new Date(showtime.start_time);
            showTime = startDate.toLocaleString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
            const endDate = new Date(startDate.getTime() + 150 * 60 * 1000);
            endTime = endDate.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {
            console.error('Failed to fetch showtime');
          }
        }

        if (bookingId) {
          try {
            const booking = await bookingsApi.getBooking(Number(bookingId));
            if (booking.payment_deadline) {
              setPaymentDeadline(new Date(booking.payment_deadline));
            }
            if (booking.movie_title) movieTitle = booking.movie_title;
            if (booking.poster_url) posterUrl = booking.poster_url;
            if (booking.showtime_start) {
              showTime = new Date(booking.showtime_start).toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              });
            }
            if (booking.seats && booking.seats.length > 0) seats = booking.seats;
            if (booking.total_amount) total = booking.total_amount;
          } catch {
            console.error('Failed to fetch booking from API, using URL params');
          }
        }

        // Use URL params as fallback
        if (seats.length === 0) {
          seats = seatsParam ? seatsParam.split(',') : [];
        }
        if (total === 0) {
          total = totalParam ? Number(totalParam) : 0;
        }

        setBookingDetails({
          movieTitle,
          posterUrl,
          cinemaName: 'ABCineplex',
          showTime: showTime || 'N/A',
          endTime: endTime || 'N/A',
          seats,
          subtotal: total,
          discount: 0,
          discountLabel: undefined,
          total,
        });
      } catch (err) {
        console.error('Failed to fetch booking details:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, movieId, showtimeId, seatsParam, totalParam]);

  const handlePayment = async () => {
    if (!bookingId) {
      alert('No booking ID provided');
      return;
    }

    try {
      setIsProcessing(true);

      // Simulate a short processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Confirm payment via API
      const result = await bookingsApi.confirmPayment({
        booking_id: Number(bookingId),
        payment_intent_id: paymentMethod === 'card'
          ? `card_${Date.now()}_${cardNumber.replaceAll(/\s/g, '').slice(-4)}`
          : `promptpay_${Date.now()}`,
      });

      if (result.success) {
        setPaymentSuccess(true);
      } else {
        alert(`Payment failed: ${result.message}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId) {
      navigate('/');
      return;
    }

    const shouldCancel = confirm('Are you sure you want to cancel this booking?');
    if (!shouldCancel) return;

    try {
      await bookingsApi.cancelBooking(Number(bookingId));
      navigate('/');
    } catch (err) {
      console.error('Cancel error:', err);
      navigate('/');
    }
  };

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error || 'Booking not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Payment success screen
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="border-none shadow-2xl bg-white max-w-md w-full">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-2">Booking ID: #{bookingId}</p>
            <p className="text-slate-600 mb-8">
              Your tickets for <span className="font-semibold">{bookingDetails.movieTitle}</span> have been confirmed.
              Seats: <span className="font-semibold">{bookingDetails.seats.join(', ')}</span>
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/homepage')}
                className="w-full h-12 bg-black text-white hover:bg-slate-800 font-bold rounded-lg"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Payment time has expired. Your reserved seats have been released.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/bg-cinema.jpg')] bg-cover bg-center flex items-center justify-center p-6 font-sans">
      {/* Blurred Overlay Background */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Section: Payment Method */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight uppercase">Select Payment Method</h2>
              <button
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-red-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Mock Payment Button - Quick checkout for testing */}
            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl">
              <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-3">Quick Checkout (Demo)</p>
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Simulate Payment - {bookingDetails.total.toLocaleString()} Baht
                  </span>
                )}
              </Button>
              <p className="text-xs text-emerald-600 mt-2 text-center">Click to instantly confirm your booking</p>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">or pay with</span>
              </div>
            </div>

            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />

            {paymentMethod === 'card' ? (
              <CardPaymentForm
                email={email}
                cardNumber={cardNumber}
                expiration={expiration}
                cvc={cvc}
                saveInfo={saveInfo}
                isProcessing={isProcessing}
                onEmailChange={setEmail}
                onCardNumberChange={setCardNumber}
                onExpirationChange={setExpiration}
                onCvcChange={setCvc}
                onSaveInfoChange={setSaveInfo}
                onSubmit={handlePayment}
              />
            ) : (
              <PromptPayForm
                amount={bookingDetails.total}
                isProcessing={isProcessing}
                onConfirm={handlePayment}
              />
            )}
          </CardContent>
        </Card>

        {/* Right Section: Booking Summary */}
        <Card className="border-none shadow-xl bg-white/90">
          <CardContent className="p-8 h-full">
            <BookingSummary booking={bookingDetails} countdown={countdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
